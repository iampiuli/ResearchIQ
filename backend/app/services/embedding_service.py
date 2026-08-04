"""
Embedding Service

Generates vector embeddings for text chunks using Sentence Transformers
(all-MiniLM-L6-v2 by default) and holds them in memory alongside their
source chunk text, keyed by paper id. There is no persistent store,
ChromaDB, or Gemini wiring yet.
"""

from sentence_transformers import SentenceTransformer

from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Handles embedding generation for text chunks."""

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._embeddings_by_paper_id: dict[str, list[dict]] = {}

    @property
    def model(self) -> SentenceTransformer:
        """Lazily load the SentenceTransformer model on first use."""
        if self._model is None:
            logger.info(f"Loading embedding model '{settings.EMBEDDING_MODEL_NAME}'...")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info(f"Embedding model loaded (dimension={self.get_embedding_dimension()})")
        return self._model

    def get_embedding_dimension(self) -> int:
        """Return the model's output embedding vector dimension."""
        return self._model.get_sentence_embedding_dimension()

    def embed_text(self, text: str) -> list:
        """Generate an embedding vector for a single piece of text."""
        return self.model.encode(text).tolist()

    def embed_batch(self, texts: list) -> list:
        """Generate embedding vectors for a batch of texts."""
        if not texts:
            return []
        return self.model.encode(texts, show_progress_bar=False).tolist()

    def embed_and_store(self, paper_id: str, chunks: list) -> list:
        """Embed each chunk and store it in memory alongside its source text."""
        embeddings = self.embed_batch(chunks)
        self._embeddings_by_paper_id[paper_id] = [
            {"text": chunk, "embedding": embedding}
            for chunk, embedding in zip(chunks, embeddings)
        ]
        return embeddings

    def get_embeddings(self, paper_id: str) -> list:
        """Return the in-memory chunk+embedding records stored for a paper id."""
        return self._embeddings_by_paper_id.get(paper_id, [])


embedding_service = EmbeddingService()
