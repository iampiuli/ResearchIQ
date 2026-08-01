"""
Chat Router

Handles question-answering requests over uploaded papers. Currently a
placeholder — does not perform retrieval or call any LLM yet.
"""

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Answer a question about uploaded paper(s).

    TODO (future):
      1. Call retrieval_service.retrieve_relevant_chunks() with request.question.
      2. Pass retrieved chunks + question to llm_service.generate_answer().
      3. Return the generated answer along with source citations.
    """
    logger.info(f"[stub] chat called with question: {request.question}")
    return ChatResponse(
        answer="Chat endpoint is a placeholder. RAG pipeline is not implemented yet.",
        sources=[],
    )
