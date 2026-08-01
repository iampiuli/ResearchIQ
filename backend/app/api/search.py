"""
Search Router

Temporary endpoint for exercising semantic retrieval directly: embeds a
query and returns the top 5 most relevant chunks from ChromaDB. Does not
call any LLM or summarize — this is superseded by /chat once RAG
generation is wired up.
"""

from fastapi import APIRouter

from app.models.schemas import SearchRequest, SearchResponse
from app.services.retrieval_service import retrieval_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/search", tags=["Search"])

TOP_K = 5


@router.post("", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """Return the top 5 most relevant chunks for a query via vector search."""
    results = retrieval_service.retrieve_relevant_chunks(request.query, top_k=TOP_K)
    return SearchResponse(query=request.query, results=results)
