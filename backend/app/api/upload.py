"""
Upload Router

Handles PDF paper uploads: for every file in a multi-file request, checks
for a duplicate via SHA-256 hash, then (if new) validates it, persists it
to app/uploads/ under a UUID-based filename, extracts its text with
pdf_service, splits it into chunks with chunk_service, embeds each chunk
with embedding_service, persists the chunks + embeddings into ChromaDB via
chroma_service, and writes a small JSON sidecar (including the file hash)
alongside the file so GET /papers and future duplicate checks can read it
back (there is no relational database yet).

Each file is processed independently — one failure does not abort the
rest of the batch.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.models.schemas import (
    DuplicateFileResult,
    FailedFileResult,
    MultiUploadResponse,
    UploadedFileResult,
    UploadSummary,
)
from app.services.chroma_service import chroma_service
from app.services.chunk_service import chunk_service
from app.services.embedding_service import embedding_service
from app.services.pdf_service import pdf_service
from app.utils.auth import get_current_user
from app.utils.config import settings
from app.utils.exceptions import (
    FileTooLargeError,
    InvalidFileError,
    PDFProcessingError,
    ResearchIQException,
    UnsupportedFileTypeError,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_CONTENT_TYPE = "application/pdf"
MAX_FILE_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
READ_CHUNK_SIZE = 1024 * 1024  # 1MB


async def _read_validated_pdf(file: UploadFile) -> bytes:
    """Validate type/size and return the full file content, raising on failure."""
    if not file or not file.filename:
        raise InvalidFileError("No file was provided.")

    if file.content_type != ALLOWED_CONTENT_TYPE or not file.filename.lower().endswith(".pdf"):
        raise UnsupportedFileTypeError(
            f"Unsupported file type '{file.content_type}'. Only PDF files are accepted."
        )

    data = bytearray()
    try:
        while chunk := await file.read(READ_CHUNK_SIZE):
            data.extend(chunk)
            if len(data) > MAX_FILE_SIZE_BYTES:
                raise FileTooLargeError(
                    f"File exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                )
    finally:
        await file.close()

    if not data:
        raise InvalidFileError("Uploaded file is empty.")

    return bytes(data)


def _load_existing_hashes(upload_dir: Path, user_id: str) -> dict:
    """Build a {file_hash: metadata} index of `user_id`'s own papers for duplicate detection."""
    hashes = {}
    for metadata_path in upload_dir.glob("*.json"):
        try:
            data = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        file_hash = data.get("file_hash")
        if file_hash and data.get("user_id") == user_id:
            hashes[file_hash] = data
    return hashes


async def _process_file(file: UploadFile, upload_dir: Path, known_hashes: dict, user_id: str) -> dict:
    """
    Run one file through duplicate detection and, if new, the full
    validate/save/extract/chunk/embed/store pipeline.

    Returns {"kind": "duplicate", "filename": ..., "paper_id": ...} or
    {"kind": "success", "metadata": {...}}.
    """
    filename = file.filename or "unknown.pdf"
    data = await _read_validated_pdf(file)

    file_hash = hashlib.sha256(data).hexdigest()
    existing = known_hashes.get(file_hash)
    if existing:
        logger.info(f"Duplicate upload skipped: '{filename}' matches existing paper {existing['id']}")
        return {"kind": "duplicate", "filename": filename, "paper_id": existing["id"]}

    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}.pdf"
    destination = upload_dir / stored_filename
    destination.write_bytes(data)
    size = len(data)

    try:
        pages, page_count = pdf_service.extract_pages(str(destination))
    except PDFProcessingError:
        destination.unlink(missing_ok=True)
        raise

    character_count = sum(len(page_text) for _, page_text in pages)
    uploaded_at = datetime.now(timezone.utc).isoformat()

    chunk_pages = chunk_service.split_pages(pages)
    chunks = [chunk for chunk, _ in chunk_pages]
    chunk_page_numbers = [page for _, page in chunk_pages]
    chunk_count = len(chunks)

    embeddings = embedding_service.embed_batch(chunks)
    embedding_count = len(embeddings)
    embedding_dimension = embedding_service.get_embedding_dimension() if embeddings else 0

    vector_count = chroma_service.add_chunks(
        paper_id=file_id,
        user_id=user_id,
        chunks=chunks,
        embeddings=embeddings,
        filename=stored_filename,
        original_filename=filename,
        page_count=page_count,
        uploaded_at=uploaded_at,
        pages=chunk_page_numbers,
    )

    metadata = {
        "id": file_id,
        "user_id": user_id,
        "filename": stored_filename,
        "original_filename": filename,
        "size": size,
        "uploaded_at": uploaded_at,
        "status": "uploaded",
        "page_count": page_count,
        "character_count": character_count,
        "chunk_count": chunk_count,
        "embedding_count": embedding_count,
        "embedding_dimension": embedding_dimension,
        "vector_count": vector_count,
        "file_hash": file_hash,
    }
    metadata_path = upload_dir / f"{file_id}.json"
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

    # Make this file visible to duplicate checks for the rest of the batch.
    known_hashes[file_hash] = metadata

    logger.info(
        f"Uploaded '{filename}' (paper id {file_id}): "
        f"pages={page_count}, characters={character_count}, chunks={chunk_count}, "
        f"embeddings={embedding_count}, vectors={vector_count}, upload_time={uploaded_at}"
    )

    return {"kind": "success", "metadata": metadata}


@router.post("", response_model=MultiUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_papers(
    files: list[UploadFile] = File(...), user_id: str = Depends(get_current_user)
) -> MultiUploadResponse:
    """Process every uploaded PDF independently, skipping duplicates and isolating failures."""
    if not files:
        raise InvalidFileError("No files were provided.")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    known_hashes = _load_existing_hashes(upload_dir, user_id)

    uploaded: list[UploadedFileResult] = []
    duplicates: list[DuplicateFileResult] = []
    failed: list[FailedFileResult] = []

    for file in files:
        filename = file.filename or "unknown.pdf"
        try:
            result = await _process_file(file, upload_dir, known_hashes, user_id)
        except ResearchIQException as exc:
            logger.warning(f"Failed to process '{filename}': {exc.message}")
            failed.append(FailedFileResult(filename=filename, reason=exc.message))
            continue
        except Exception as exc:
            logger.exception(f"Unexpected error processing '{filename}': {exc}")
            failed.append(
                FailedFileResult(filename=filename, reason="Unexpected error while processing the file.")
            )
            continue

        if result["kind"] == "duplicate":
            duplicates.append(
                DuplicateFileResult(
                    filename=result["filename"],
                    status="already_uploaded",
                    paper_id=result["paper_id"],
                )
            )
        else:
            m = result["metadata"]
            uploaded.append(
                UploadedFileResult(
                    paper_id=m["id"],
                    filename=m["original_filename"],
                    status="success",
                    page_count=m["page_count"],
                    character_count=m["character_count"],
                    chunk_count=m["chunk_count"],
                    embedding_count=m["embedding_count"],
                    embedding_dimension=m["embedding_dimension"],
                    vector_count=m["vector_count"],
                )
            )

    summary = UploadSummary(
        total_files=len(files),
        uploaded=len(uploaded),
        duplicates=len(duplicates),
        failed=len(failed),
    )
    logger.info(
        "Multi-upload completed:\n"
        f"- uploaded: {summary.uploaded}\n"
        f"- duplicates: {summary.duplicates}\n"
        f"- failed: {summary.failed}"
    )

    return MultiUploadResponse(uploaded=uploaded, duplicates=duplicates, failed=failed, summary=summary)
