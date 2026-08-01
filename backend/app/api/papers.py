"""
Papers Router

Lists previously uploaded papers by scanning app/uploads/ directly.
There is no database yet, so per-file metadata (original filename,
upload time, etc.) is read from the JSON sidecar written by the upload
router, falling back to filesystem stats if a sidecar is missing.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter

from app.models.schemas import PaperSummary
from app.utils.config import settings
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
