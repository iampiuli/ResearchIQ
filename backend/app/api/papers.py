"""
Papers Router

Lists previously uploaded papers by scanning app/uploads/ directly.
There is no database yet, so per-file metadata (original filename,
upload time, etc.) is read from the JSON sidecar written by the upload
router, falling back to filesystem stats if a sidecar is missing.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, status

from app.models.schemas import PaperSummary
from app.services.chroma_service import chroma_service
from app.utils.config import settings
from app.utils.exceptions import PaperNotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/papers", tags=["Papers"])


def _load_paper_summary(pdf_path: Path) -> PaperSummary:
    """Build a PaperSummary for one uploaded PDF, preferring its JSON sidecar."""
    metadata_path = pdf_path.with_suffix(".json")
    if metadata_path.exists():
        try:
            data = json.loads(metadata_path.read_text(encoding="utf-8"))
            return PaperSummary(**data)
        except (json.JSONDecodeError, OSError, TypeError) as exc:
            logger.warning(f"Failed to read metadata for '{pdf_path.name}': {exc}")

    stat = pdf_path.stat()
    return PaperSummary(
        id=pdf_path.stem,
        filename=pdf_path.name,
        original_filename=pdf_path.name,
        size=stat.st_size,
        uploaded_at=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        status="uploaded",
    )


@router.get("", response_model=list[PaperSummary])
async def list_papers() -> list[PaperSummary]:
    """Return every uploaded PDF found in the uploads directory."""
    upload_dir = Path(settings.UPLOAD_DIR)
    if not upload_dir.exists():
        return []

    papers = [_load_paper_summary(pdf_path) for pdf_path in upload_dir.glob("*.pdf")]
    papers.sort(key=lambda paper: paper.uploaded_at, reverse=True)

    logger.info(f"Listed {len(papers)} uploaded paper(s)")
    return papers


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paper(paper_id: str) -> None:
    """Permanently delete a paper: its vectors, its PDF and its metadata sidecar.

    Vectors go first: if that fails nothing else is touched, so the paper stays
    fully intact and the delete can simply be retried. Stray files are then
    removed with `missing_ok`, which also makes a retry after a partial failure
    safe. Paper ids are always UUIDs (see upload), so anything else is rejected
    up front — this also keeps the id from ever being used to build a path
    outside the uploads directory.
    """
    try:
        paper_id = str(uuid.UUID(paper_id))
    except ValueError:
        raise PaperNotFoundError()

    upload_dir = Path(settings.UPLOAD_DIR)
    pdf_path = upload_dir / f"{paper_id}.pdf"
    metadata_path = upload_dir / f"{paper_id}.json"
    if not pdf_path.exists() and not metadata_path.exists():
        raise PaperNotFoundError()

    chroma_service.delete_paper(paper_id)
    pdf_path.unlink(missing_ok=True)
    metadata_path.unlink(missing_ok=True)

    logger.info(f"Deleted paper {paper_id}")
