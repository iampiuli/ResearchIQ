"""
Chunk Service

Splits extracted document text into overlapping chunks using LangChain's
RecursiveCharacterTextSplitter. Chunks are not cached here — Chroma is the
only persistent store for chunk text (see chroma_service.py); nothing ever
reads a chunk back out of this service, so keeping one in memory for the
life of the process was an unbounded leak, not a feature.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.utils.logger import get_logger
from app.utils.memory import log_stage

logger = get_logger(__name__)


class ChunkService:
    """Handles splitting raw document text into retrieval-sized chunks."""

    def split_text(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
        """Split text into overlapping chunks via RecursiveCharacterTextSplitter."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = splitter.split_text(text)
        log_stage(logger, "text split into chunks", count=len(chunks))
        return chunks


chunk_service = ChunkService()
