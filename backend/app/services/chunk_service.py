"""
Chunk Service

Splits extracted document text into overlapping chunks using LangChain's
RecursiveCharacterTextSplitter. Chunks are kept in an in-memory store keyed
by paper id — there is no persistent store, embedding, or ChromaDB wiring
yet.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.utils.logger import get_logger

logger = get_logger(__name__)


class ChunkService:
    """Handles splitting raw document text into retrieval-sized chunks."""

    def __init__(self) -> None:
        self._chunks_by_paper_id: dict[str, list[str]] = {}

    def split_text(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
        """Split text into overlapping chunks via RecursiveCharacterTextSplitter."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        return splitter.split_text(text)

    def split_pages(
        self, pages: list[tuple[int, str]], chunk_size: int = 1000, chunk_overlap: int = 200
    ) -> list[tuple[str, int]]:
        """Split each page separately and return (chunk_text, page_number) pairs.

        Chunking per page (rather than over the whole document) means a chunk
        never straddles a page boundary, so every chunk has exactly one page
        to cite. Pages with no text (e.g. scanned images) yield no chunks.
        """
        return [
            (chunk, page_number)
            for page_number, page_text in pages
            for chunk in self.split_text(page_text, chunk_size, chunk_overlap)
        ]

    def store_chunks(self, paper_id: str, chunks: list[str]) -> None:
        """Hold a paper's chunks in memory for the lifetime of the process."""
        self._chunks_by_paper_id[paper_id] = chunks

    def get_chunks(self, paper_id: str) -> list[str]:
        """Return the in-memory chunks previously stored for a paper id."""
        return self._chunks_by_paper_id.get(paper_id, [])


chunk_service = ChunkService()
