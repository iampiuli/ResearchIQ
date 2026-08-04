"""
Embedding Service

Generates vector embeddings for text chunks using chromadb's bundled ONNX
export of all-MiniLM-L6-v2 (via onnxruntime) rather than the PyTorch /
sentence-transformers build. Both are the same model family and weights —
mean-pooled token embeddings, L2-normalized, 384-dim — so retrieval
behavior is unchanged; the difference is only which runtime executes them.

This swap exists because chromadb (an unconditional dependency of this app
— see chroma_service.py) already requires onnxruntime for its own default
embedding function. Loading torch *as well* meant every process carried
two full ML runtimes to do one job, and production logs showed baseline
import memory (before any model weights or Chroma engine even
initialized) at ~552MB — already at/over Render free tier's 512MB cap.
Dropping torch removes the single heaviest dependency in the import graph.
"""

import gc

from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2

from app.utils.config import settings
from app.utils.logger import get_logger
from app.utils.memory import log_stage

logger = get_logger(__name__)

# Fixed by all-MiniLM-L6-v2's architecture — not worth an inference call
# just to discover it (unlike sentence-transformers, chromadb's ONNX
# wrapper exposes no cheap "get dimension" metadata call).
EMBEDDING_DIMENSION = 384


class EmbeddingService:
    """Handles embedding generation for text chunks."""

    def __init__(self) -> None:
        self._model: ONNXMiniLM_L6_V2 | None = None

    @property
    def model(self) -> ONNXMiniLM_L6_V2:
        """Lazily construct the ONNX MiniLM embedding function on first use.

        Construction itself is cheap (just imports onnxruntime/tokenizers);
        the actual model download-if-needed + ONNX session creation happens
        lazily inside the wrapper's own __call__, on the first real
        embed_text/embed_batch call.
        """
        if self._model is None:
            logger.info(f"Initializing embedding model '{settings.EMBEDDING_MODEL_NAME}' (ONNX runtime)...")
            self._model = ONNXMiniLM_L6_V2()
        return self._model

    def get_embedding_dimension(self) -> int:
        """Return the model's output embedding vector dimension."""
        return EMBEDDING_DIMENSION

    def embed_text(self, text: str) -> list:
        """Generate an embedding vector for a single piece of text."""
        return self.model([text])[0]

    def embed_batch(self, texts: list) -> list:
        """Generate embedding vectors for a batch of texts.

        Encoded in fixed-size batches (settings.EMBEDDING_BATCH_SIZE) rather
        than as one call over the whole list — the ONNX wrapper batches
        internally too, but capping it here bounds peak memory for papers
        that produce very large chunk counts, and lets each batch's
        intermediate arrays be freed before the next is allocated.
        """
        if not texts:
            return []

        log_stage(logger, "embedding batch: start", chunks=len(texts))
        embeddings: list = []
        batch_size = settings.EMBEDDING_BATCH_SIZE
        for start in range(0, len(texts), batch_size):
            batch = texts[start : start + batch_size]
            embeddings.extend(self.model(batch))
        gc.collect()
        log_stage(logger, "embedding batch: done", chunks=len(texts))
        return embeddings

    def embed_chunks(self, chunks: list) -> list:
        """Generate embeddings for one paper's chunks and return them (not cached)."""
        embeddings = self.embed_batch(chunks)
        log_stage(logger, "embeddings generated", count=len(embeddings))
        return embeddings


embedding_service = EmbeddingService()
