"""
Chat Router

Handles RAG question-answering requests: classifies the query's intent to
pick a retrieval strategy (see intent_service/retrieval_service), passes
the retrieved chunks to llm_service for grounded answer generation, and
returns the answer with deduplicated paper sources.
"""

from fastapi import APIRouter
from google.api_core.exceptions import ResourceExhausted

from app.models.schemas import ChatRequest, ChatResponse, ChatSource
from app.services.intent_service import SYNTHESIS, classify_intent
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service
from app.utils.exceptions import LLMError, QuotaExceededError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

NO_CONTEXT_ANSWER = "I couldn't find relevant information in the uploaded papers."


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Answer a question about uploaded papers using retrieval-augmented generation."""
    logger.info(f"Chat query received: {request.query}")

    intent = classify_intent(request.query)

    # Representative-per-paper retrieval only makes sense against a bounded,
    # known set of papers (a workspace) — with no paper_ids (e.g. the
    # unscoped /search-style caller), fall back to standard retrieval.
    if intent == SYNTHESIS and request.paper_ids:
        chunks = retrieval_service.retrieve_representative_chunks(request.query, paper_ids=request.paper_ids)
    else:
        chunks = retrieval_service.retrieve_relevant_chunks(request.query, paper_ids=request.paper_ids)

    if not chunks:
        logger.info(f"No relevant chunks found for query: {request.query}")
        return ChatResponse(query=request.query, answer=NO_CONTEXT_ANSWER, sources=[])

    try:
        answer = llm_service.generate_answer(request.query, chunks, intent=intent)
    except ResourceExhausted as exc:
        # Gemini's free-tier daily request quota is used up — distinct from a
        # genuine outage/timeout, so the user gets an accurate, actionable
        # message instead of a generic "service unavailable".
        logger.error(f"Gemini quota exhausted for query '{request.query}': {exc}")
        raise QuotaExceededError(
            "Daily Gemini API quota exceeded. Please try again tomorrow or use another API key."
        ) from exc
    except Exception as exc:
        logger.error(f"LLM generation failed for query '{request.query}': {exc}")
        raise LLMError("The AI service is temporarily unavailable. Please try again in a moment.") from exc

    seen_paper_ids = set()
    sources = []
    for chunk in chunks:
        paper_id = chunk.get("paper_id")
        if paper_id not in seen_paper_ids:
            seen_paper_ids.add(paper_id)
            sources.append(ChatSource(filename=chunk.get("filename"), paper_id=paper_id))

    logger.info(f"Chat answer generated for query: {request.query} ({len(sources)} source(s))")
    return ChatResponse(query=request.query, answer=answer, sources=sources)
