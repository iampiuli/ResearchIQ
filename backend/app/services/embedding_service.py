"""
Embedding Service

Generates vector embeddings for text chunks using Sentence Transformers
(all-MiniLM-L6-v2 by default). Persistence lives in chroma_service.
"""

from sentence_transformers import SentenceTransformer

from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Handles embedding generation for text chunks."""

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None

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


embedding_service = EmbeddingService()
