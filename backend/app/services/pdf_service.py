"""
PDF Service

Responsible for extracting text (and eventually structure/metadata) from
uploaded research papers using PyMuPDF (fitz).
"""

import time

import fitz

from app.utils.exceptions import PDFProcessingError
from app.utils.logger import get_logger
from app.utils.memory import log_stage

logger = get_logger(__name__)


class PDFService:
    """Handles PDF parsing and text extraction."""

    def extract_text(self, file_path: str) -> tuple[str, int]:
        """
        Extract raw text and page count from a PDF file.

        Returns a (text, page_count) tuple. The whole document is opened
        once so both values come from the same fitz.Document. The file is
        read into memory and handed to fitz as a stream rather than a path
        — opening by path leaves fitz holding its own OS-level file handle,
        which on Windows stays locked (blocking cleanup on failure) until
        garbage collection runs.
        """
        start = time.monotonic()
        try:
            with open(file_path, "rb") as f:
                data = f.read()
            with fitz.open(stream=data, filetype="pdf") as doc:
                text = "".join(page.get_text() for page in doc)
                page_count = doc.page_count
            del data  # the fitz doc has already parsed its own copy; drop the raw bytes now
        except Exception as exc:
            logger.error(f"Failed to extract text from '{file_path}': {exc}")
            raise PDFProcessingError(f"Could not read PDF content: {exc}") from exc

        log_stage(
            logger,
            "PDF text extracted",
            pages=page_count,
            characters=len(text),
            seconds=f"{time.monotonic() - start:.2f}",
        )
        return text, page_count

    def extract_metadata(self, file_path: str) -> dict:
        """
        Extract PDF metadata (title, author, page count, etc.).

        TODO (future): Use fitz.open(file_path).metadata plus doc.page_count.
        """
        logger.info(f"[stub] extract_metadata called for: {file_path}")
        raise NotImplementedError("PDF metadata extraction is not implemented yet.")


pdf_service = PDFService()
