"""
Retrieval Service

Performs semantic similarity search over the ChromaDB "researchiq"
collection: embeds a user query with the existing SentenceTransformer
model (embedding_service, not a newly loaded model) and retrieves the
top-k most similar chunks by cosine similarity. Does not call any LLM or
summarize — pure vector search.
"""

from app.services.chroma_service import chroma_service
from app.services.embedding_service import embedding_service
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RetrievalService:
    """Handles similarity search against the vector store."""

    def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> list:
        """Embed `query` and return the top-k most similar chunks from ChromaDB."""
        if chroma_service.count() == 0:
            logger.info(f"Search for '{query}' skipped: collection is empty")
            return []

        query_embedding = embedding_service.embed_text(query)

        results = chroma_service.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        documents = results["documents"][0] if results["documents"] else []
        metadatas = results["metadatas"][0] if results["metadatas"] else []
        distances = results["distances"][0] if results["distances"] else []

        chunks = [
            {
                "chunk_text": text,
                "filename": meta.get("filename"),
                "chunk_id": meta.get("chunk_id"),
                "similarity_score": 1 - distance,
                "paper_id": meta.get("paper_id"),
            }
            for text, meta, distance in zip(documents, metadatas, distances)
        ]

        logger.info(f"Search for '{query}' returned {len(chunks)} chunk(s)")
        return chunks


retrieval_service = RetrievalService()
