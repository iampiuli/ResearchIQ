"""
Retrieval Service

Performs semantic similarity search over the ChromaDB "researchiq"
collection: embeds a user query with the existing SentenceTransformer
model (embedding_service, not a newly loaded model) and retrieves
similar chunks by cosine similarity. Does not call any LLM or summarize —
pure vector search.

Two retrieval strategies are exposed:

- retrieve_relevant_chunks: a single global top-k search, gated by a
  similarity threshold. Well-suited to factual/lookup questions, where the
  query closely mirrors the wording of one specific passage.
- retrieve_representative_chunks: a bounded number of chunks pulled from
  EVERY attached paper independently. Needed for synthesis-style questions
  (summarize, compare, research gaps, ...), which ask about a paper's
  content as a whole rather than matching any single passage — such
  queries routinely score below the similarity threshold against every
  individual chunk even when the papers plainly contain the material, so
  a single global top-k search returns nothing useful for them.
"""

from app.services.chroma_service import chroma_service
from app.services.embedding_service import embedding_service
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _chunks_from_query_result(results: dict, min_similarity: float | None = None) -> list:
    """Shared shaping of a raw Chroma query result into the chunk-dict shape used everywhere.

    `min_similarity`, when given, drops chunks scoring below it; `None` keeps everything
    (used by representative retrieval, where every paper's best-available chunks are wanted
    regardless of their absolute score — see module docstring).
    """
    documents = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    return [
        {
            "chunk_text": text,
            "filename": meta.get("filename"),
            # Falls back to the stored filename for chunks embedded before this
            # field existed — keeps old data working, no migration required.
            "original_filename": meta.get("original_filename") or meta.get("filename"),
            "chunk_id": meta.get("chunk_id"),
            "similarity_score": 1 - distance,
            "paper_id": meta.get("paper_id"),
            # None for chunks indexed before page tracking existed.
            "page": meta.get("page"),
        }
        for text, meta, distance in zip(documents, metadatas, distances)
        if min_similarity is None or (1 - distance) >= min_similarity
    ]


class RetrievalService:
    """Handles similarity search against the vector store."""

    def retrieve_relevant_chunks(
        self,
        query: str,
        top_k: int = 5,
        min_similarity: float = settings.MIN_SIMILARITY_THRESHOLD,
        paper_ids: list[str] | None = None,
    ) -> list:
        """Embed `query` and return the top-k most similar chunks from ChromaDB
        whose similarity score meets `min_similarity`.

        `paper_ids`, when given, restricts the similarity search itself (via a
        Chroma `where` filter) to chunks from those papers only — e.g. workspace
        isolation — rather than filtering the results after the fact, which
        could silently miss true matches that lost to higher-scoring chunks
        outside the restricted set. `None` searches the whole collection
        (existing behavior); `[]` means "search nothing" and short-circuits
        without querying Chroma, since an empty `$in` filter is not meaningful.
        Restricting to a small paper set can naturally yield fewer than
        `top_k` results — the same way the `min_similarity` filter already can.
        """
        if paper_ids is not None and len(paper_ids) == 0:
            logger.info(f"Search for '{query}' skipped: no papers in scope")
            return []

        if chroma_service.count() == 0:
            logger.info(f"Search for '{query}' skipped: collection is empty")
            return []

        query_embedding = embedding_service.embed_text(query)

        query_kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
            "include": ["documents", "metadatas", "distances"],
        }
        if paper_ids is not None:
            query_kwargs["where"] = {"paper_id": {"$in": paper_ids}}

        results = chroma_service.collection.query(**query_kwargs)
        chunks = _chunks_from_query_result(results, min_similarity)

        logger.info(
            f"Search for '{query}' returned {len(chunks)} chunk(s) "
            f"(min_similarity={min_similarity})"
        )
        return chunks

    def retrieve_representative_chunks(
        self,
        query: str,
        paper_ids: list[str],
        chunks_per_paper: int = settings.SYNTHESIS_CHUNKS_PER_PAPER,
        max_total_chunks: int = settings.SYNTHESIS_MAX_TOTAL_CHUNKS,
    ) -> list:
        """Return up to `chunks_per_paper` best-matching chunks from EACH paper in
        `paper_ids`, so every attached paper is represented in synthesis-style
        answers regardless of how the query scores against any single chunk.

        A single combined query (`where` with `$in` across all paper_ids) would
        not give this guarantee — the global top-k could easily be dominated by
        one or two papers, silently excluding the rest. Querying each paper_id
        independently is the only way to guarantee coverage, and is cheap: these
        are local, in-process Chroma queries bounded by the workspace's paper
        count, which is small in practice.

        No similarity floor is applied here (see `_chunks_from_query_result`):
        for a "summarize"/"compare" question there is, by definition, no single
        passage that closely mirrors the query, so each paper's *best available*
        chunks are its representative content — not a sign of irrelevance.

        `chunks_per_paper` is reduced (down to a minimum of 1) so that
        `len(paper_ids) * chunks_per_paper` stays within `max_total_chunks`,
        keeping the Gemini prompt bounded even for large workspaces while still
        guaranteeing every paper gets at least one representative chunk.
        """
        if not paper_ids:
            return []

        if chroma_service.count() == 0:
            logger.info(f"Representative search for '{query}' skipped: collection is empty")
            return []

        effective_per_paper = max(1, min(chunks_per_paper, max_total_chunks // len(paper_ids) or 1))
        query_embedding = embedding_service.embed_text(query)

        chunks = []
        for paper_id in paper_ids:
            results = chroma_service.collection.query(
                query_embeddings=[query_embedding],
                n_results=effective_per_paper,
                where={"paper_id": paper_id},
                include=["documents", "metadatas", "distances"],
            )
            chunks.extend(_chunks_from_query_result(results, min_similarity=None))

        logger.info(
            f"Representative search for '{query}' returned {len(chunks)} chunk(s) "
            f"across {len(paper_ids)} paper(s) ({effective_per_paper} per paper)"
        )
        return chunks


retrieval_service = RetrievalService()
