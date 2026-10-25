"""
PDF Service

Responsible for extracting text (and eventually structure/metadata) from
uploaded research papers using PyMuPDF (fitz).
"""

import fitz

from app.utils.exceptions import PDFProcessingError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PDFService:
    """Handles PDF parsing and text extraction."""

    def extract_pages(self, file_path: str) -> tuple[list[tuple[int, str]], int]:
        """
        Extract per-page text and the page count from a PDF file.

        Returns ([(page_number, text), ...], page_count) with 1-based page
        numbers, so downstream chunks can be tied back to the page they came
        from. The whole document is opened
        once so both values come from the same fitz.Document. The file is
        read into memory and handed to fitz as a stream rather than a path
        — opening by path leaves fitz holding its own OS-level file handle,
        which on Windows stays locked (blocking cleanup on failure) until
        garbage collection runs.
        """
        try:
            with open(file_path, "rb") as f:
                data = f.read()
            with fitz.open(stream=data, filetype="pdf") as doc:
                pages = [(index, page.get_text()) for index, page in enumerate(doc, start=1)]
                page_count = doc.page_count
        except Exception as exc:
            logger.error(f"Failed to extract text from '{file_path}': {exc}")
            raise PDFProcessingError(f"Could not read PDF content: {exc}") from exc

        return pages, page_count

    def extract_metadata(self, file_path: str) -> dict:
        """
        Extract PDF metadata (title, author, page count, etc.).

        TODO (future): Use fitz.open(file_path).metadata plus doc.page_count.
        """
        logger.info(f"[stub] extract_metadata called for: {file_path}")
        raise NotImplementedError("PDF metadata extraction is not implemented yet.")


pdf_service = PDFService()
