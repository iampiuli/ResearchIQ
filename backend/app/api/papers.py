"""
Papers Router

Lists previously uploaded papers by scanning app/uploads/ directly.
There is no database yet, so per-paper metadata (original filename,
upload time, owner, etc.) is read from the JSON sidecar written by the
upload router. Every route is scoped to the authenticated user: a paper
whose sidecar doesn't name the caller as owner (including papers uploaded
before accounts existed) is invisible and reported as not found.
"""

import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse

from app.models.schemas import PaperSummary
from app.services.chroma_service import chroma_service
from app.utils.auth import get_current_user
from app.utils.config import settings
from app.utils.exceptions import PaperNotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/papers", tags=["Papers"])


def _parse_paper_id(paper_id: str) -> str:
    """Paper ids are always UUIDs; anything else is rejected, which also keeps
    the id from ever being used to build a path outside the uploads directory."""
    try:
        return str(uuid.UUID(paper_id))
    except ValueError:
        raise PaperNotFoundError()


def _read_owned_metadata(paper_id: str, user_id: str) -> dict:
    """Return the paper's metadata if `user_id` owns it, else raise PaperNotFoundError.

    A paper owned by someone else is deliberately indistinguishable from a
    missing one, so ids can't be probed.
    """
    metadata_path = Path(settings.UPLOAD_DIR) / f"{paper_id}.json"
    try:
        data = json.loads(metadata_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        raise PaperNotFoundError()
    if data.get("user_id") != user_id:
        raise PaperNotFoundError()
    return data


@router.get("", response_model=list[PaperSummary])
async def list_papers(user_id: str = Depends(get_current_user)) -> list[PaperSummary]:
    """Return the caller's uploaded papers, newest first."""
    upload_dir = Path(settings.UPLOAD_DIR)
    if not upload_dir.exists():
        return []

    papers = []
    for metadata_path in upload_dir.glob("*.json"):
        try:
            data = json.loads(metadata_path.read_text(encoding="utf-8"))
            if data.get("user_id") == user_id:
                papers.append(PaperSummary(**data))
        except (json.JSONDecodeError, OSError, TypeError, ValueError) as exc:
            logger.warning(f"Failed to read metadata '{metadata_path.name}': {exc}")
    papers.sort(key=lambda paper: paper.uploaded_at, reverse=True)

    logger.info(f"Listed {len(papers)} paper(s) for the caller")
    return papers


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paper(paper_id: str, user_id: str = Depends(get_current_user)) -> None:
    """Permanently delete one of the caller's papers: vectors, PDF and metadata sidecar.

    Vectors go first: if that fails nothing else is touched, so the paper stays
    fully intact and the delete can simply be retried. Stray files are then
    removed with `missing_ok`, which also makes a retry after a partial failure
    safe.
    """
    paper_id = _parse_paper_id(paper_id)
    _read_owned_metadata(paper_id, user_id)

    upload_dir = Path(settings.UPLOAD_DIR)
    chroma_service.delete_paper(paper_id)
    (upload_dir / f"{paper_id}.pdf").unlink(missing_ok=True)
    (upload_dir / f"{paper_id}.json").unlink(missing_ok=True)

    logger.info(f"Deleted paper {paper_id}")


# PDFs are served through an authenticated route (not a public static mount) so
# only the owner can read them.
files_router = APIRouter(tags=["Files"])


@files_router.get("/files/{filename}")
async def get_file(filename: str, user_id: str = Depends(get_current_user)) -> FileResponse:
    """Serve the caller's own PDF by its stored `<paper-id>.pdf` filename."""
    stem, dot, ext = filename.rpartition(".")
    if not dot or ext != "pdf":
        raise PaperNotFoundError()
    paper_id = _parse_paper_id(stem)
    _read_owned_metadata(paper_id, user_id)

    pdf_path = Path(settings.UPLOAD_DIR) / f"{paper_id}.pdf"
    if not pdf_path.exists():
        raise PaperNotFoundError()
    return FileResponse(pdf_path, media_type="application/pdf")
