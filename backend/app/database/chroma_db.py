"""
ChromaDB Client

Responsible for initializing and providing access to the persistent
ChromaDB vector store used for storing and querying paper embeddings.

NOT IMPLEMENTED YET — placeholder only.
"""

from app.utils.logger import get_logger

logger = get_logger(__name__)


class ChromaDBClient:
    """Wraps a ChromaDB persistent client and collection."""

    def __init__(self):
        # TODO (future): Initialize a persistent chromadb.PersistentClient
        # using settings.CHROMA_PERSIST_DIR, then get_or_create_collection
        # using settings.CHROMA_COLLECTION_NAME.
        self.client = None
        self.collection = None

    def add_documents(self, ids: list, embeddings: list, metadatas: list, documents: list) -> None:
        """
        Add embedded chunks to the collection.

        TODO (future): self.collection.add(ids=..., embeddings=..., ...)
        """
        logger.info("[stub] add_documents called")
        raise NotImplementedError("ChromaDB write is not implemented yet.")

    def query(self, query_embedding: list, top_k: int = 5) -> dict:
        """
        Query the collection for nearest neighbors.

        TODO (future): return self.collection.query(query_embeddings=[query_embedding], n_results=top_k)
        """
        logger.info("[stub] query called")
        raise NotImplementedError("ChromaDB query is not implemented yet.")


chroma_db_client = ChromaDBClient()
