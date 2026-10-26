"""
Application-level exception types and shared FastAPI exception handlers.

Services/routers should raise these instead of generic Exception so the
main.py handlers can translate them into consistent JSON error responses.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.utils.logger import get_logger

logger = get_logger(__name__)


class ResearchIQException(Exception):
    """Base exception for all application-specific errors."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class PDFProcessingError(ResearchIQException):
    """Raised when a PDF fails to parse or extract text."""


class EmbeddingError(ResearchIQException):
    """Raised when embedding generation fails."""


class RetrievalError(ResearchIQException):
    """Raised when vector store retrieval fails."""


class LLMError(ResearchIQException):
    """Raised when the LLM provider call fails for a genuine server-side reason
    (outage, timeout, unexpected API error) — anything that isn't a known,
    more specific case like QuotaExceededError below."""

    def __init__(self, message: str):
        super().__init__(message, status.HTTP_503_SERVICE_UNAVAILABLE)


class QuotaExceededError(LLMError):
    """Raised specifically when the Gemini API rejects a call with 429
    ResourceExhausted (daily free-tier request quota used up) — distinct from
    LLMError so the frontend can show an accurate, actionable message instead
    of a generic "service unavailable"."""

    def __init__(self, message: str):
        # Bypass LLMError.__init__ (which hardcodes 503) — this is 429.
        ResearchIQException.__init__(self, message, status.HTTP_429_TOO_MANY_REQUESTS)


class PaperNotFoundError(ResearchIQException):
    """Raised when a paper id doesn't match any uploaded paper."""

    def __init__(self, message: str = "Paper not found."):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class AuthenticationError(ResearchIQException):
    """Raised when a request has no valid session token."""

    def __init__(self, message: str = "Authentication required."):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class InvalidFileError(ResearchIQException):
    """Raised when an uploaded file is missing, empty, or otherwise invalid."""

    def __init__(self, message: str):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class UnsupportedFileTypeError(ResearchIQException):
    """Raised when an uploaded file is not a PDF."""

    def __init__(self, message: str):
        super().__init__(message, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)


class FileTooLargeError(ResearchIQException):
    """Raised when an uploaded file exceeds the maximum allowed size."""

    def __init__(self, message: str):
        super().__init__(message, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)


async def researchiq_exception_handler(request: Request, exc: ResearchIQException) -> JSONResponse:
    """Handle known application exceptions with a consistent error shape."""
    logger.error(f"{exc.__class__.__name__}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "message": exc.message},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for anything not explicitly raised as a ResearchIQException."""
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "InternalServerError", "message": "An unexpected error occurred."},
    )
