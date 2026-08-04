"""
Embedding Service

Generates vector embeddings for text chunks using Sentence Transformers
(all-MiniLM-L6-v2 by default). Chroma is the only persistent store for
chunk text + embeddings — this service does not cache them, since nothing
ever reads such a cache back (retrieval queries Chroma directly), and an
unbounded per-paper in-memory cache here was one of the two causes of
Render's OOM kill on upload (see chroma_service.py and app/api/upload.py
for the rest of the writeup).
"""

import gc

import torch
from sentence_transformers import SentenceTransformer

from app.utils.config import settings
from app.utils.logger import get_logger
from app.utils.memory import log_stage

logger = get_logger(__name__)


class EmbeddingService:
    """Handles embedding generation for text chunks."""

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        """Lazily load the SentenceTransformer model on first use.

        In production this is a no-op cache hit — app.main's startup event
        warms it up eagerly so the load happens once at boot, not mid-request.
        """
        if self._model is None:
            # Single-thread intra-op parallelism: on Render's fractional-CPU
            # free tier, torch's default one-thread-per-core pool buys no
            # real speedup but does add per-thread memory overhead.
            torch.set_num_threads(1)
            logger.info(f"Loading embedding model '{settings.EMBEDDING_MODEL_NAME}'...")
            log_stage(logger, "embedding model load: start")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            log_stage(
                logger,
                "embedding model load: done",
                dimension=self.get_embedding_dimension(),
            )
        return self._model

    def get_embedding_dimension(self) -> int:
        """Return the model's output embedding vector dimension."""
        return self._model.get_sentence_embedding_dimension()

    def embed_text(self, text: str) -> list:
        """Generate an embedding vector for a single piece of text."""
        return self.model.encode(text).tolist()

    def embed_batch(self, texts: list) -> list:
        """Generate embedding vectors for a batch of texts.

        Encoded in fixed-size batches (settings.EMBEDDING_BATCH_SIZE) rather
        than as one `model.encode(texts)` call — sentence-transformers
        batches internally too, but capping it here bounds the peak tensor
        size for papers that produce very large chunk counts, and lets each
        batch's intermediate tensors be freed before the next is allocated.
        """
        if not texts:
            return []

        embeddings: list = []
        batch_size = settings.EMBEDDING_BATCH_SIZE
        for start in range(0, len(texts), batch_size):
            batch = texts[start : start + batch_size]
            batch_embeddings = self.model.encode(batch, show_progress_bar=False)
            embeddings.extend(batch_embeddings.tolist())
            del batch_embeddings
        gc.collect()
        return embeddings

    def embed_chunks(self, chunks: list) -> list:
        """Generate embeddings for one paper's chunks and return them (not cached)."""
        embeddings = self.embed_batch(chunks)
        log_stage(logger, "embeddings generated", count=len(embeddings))
        return embeddings


embedding_service = EmbeddingService()
