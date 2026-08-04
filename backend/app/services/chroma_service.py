"""
Chroma Service

Provides a persistent ChromaDB client and the single "researchiq"
collection used to store paper chunk embeddings. Only insertion is
implemented here — retrieval/query support comes later.
"""

import os

# Chroma's telemetry client has a known version-mismatch bug against some
# posthog releases (posthog.capture() signature changed) that spams ERROR
# logs on every insert. Must be set before chromadb is imported.
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

import chromadb  # noqa: E402
from chromadb.config import Settings as ChromaSettings  # noqa: E402

from app.utils.config import settings  # noqa: E402
from app.utils.logger import get_logger  # noqa: E402

logger = get_logger(__name__)


class ChromaService:
    """Wraps a persistent ChromaDB client and the researchiq collection."""

    def __init__(self) -> None:
        self._client = None
        self._collection = None

    @property
    def collection(self):
        """Lazily initialize the persistent client and collection on first use."""
        if self._collection is None:
            self._client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIR,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            self._collection = self._client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info(
                f"ChromaDB collection '{settings.CHROMA_COLLECTION_NAME}' ready at "
                f"'{settings.CHROMA_PERSIST_DIR}' ({self._collection.count()} vector(s) currently stored)"
            )
        return self._collection

    def add_chunks(
        self,
        paper_id: str,
        chunks: list,
        embeddings: list,
        filename: str,
        page_count: int,
        uploaded_at: str,
        original_filename: str | None = None,
    ) -> int:
        """
        Insert every chunk and its already-generated embedding into the
        collection. Does not regenerate embeddings — `embeddings` must
        already correspond 1:1 with `chunks`.

        `original_filename` (the human-readable name the user uploaded, as
        opposed to `filename`, the stored UUID-based name) is stored so
        retrieval can hand Gemini a readable label instead of a UUID —
        without it, synthesis-style answers that name their sources verbatim
        (e.g. "Paper 2 (...)") end up echoing the opaque stored filename.
        """
        if not chunks:
            return 0

        ids = [f"{paper_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "paper_id": paper_id,
                "chunk_id": chunk_id,
                "filename": filename,
                "original_filename": original_filename or filename,
                "page_count": page_count,
                "uploaded_at": uploaded_at,
            }
            for chunk_id in ids
        ]

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
        )
        return len(chunks)

    def count(self) -> int:
        """Return the current size of the collection."""
        return self.collection.count()


chroma_service = ChromaService()
