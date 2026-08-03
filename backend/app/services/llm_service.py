"""
LLM Service

Responsible for building a RAG prompt and calling Google Gemini (via
LangChain) to generate answers grounded in retrieved context.
"""

from langchain_google_genai import ChatGoogleGenerativeAI

from app.services.intent_service import FACTUAL, SYNTHESIS
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

FACTUAL_INSTRUCTIONS = (
    "You are a research assistant that answers questions using ONLY the "
    "context provided below, which was retrieved from the user's uploaded "
    "papers. Do not use outside knowledge and do not make anything up. If "
    "the context does not contain enough information to answer the "
    "question, say so clearly instead of guessing."
)

SYNTHESIS_INSTRUCTIONS = (
    "You are a research assistant helping synthesize information across the "
    "papers below, grouped by source. Using ONLY this context, answer the "
    "question by drawing on every paper where it's relevant — compare, "
    "contrast, or summarize across them as the question asks. If a "
    "particular paper doesn't address part of the question, say so for that "
    "paper rather than guessing. Do not use outside knowledge, and structure "
    "the answer so it's clear which paper each point comes from."
)


class LLMService:
    """Handles prompt construction and interaction with the Gemini LLM."""

    def __init__(self):
        self._llm: ChatGoogleGenerativeAI | None = None

    @property
    def llm(self) -> ChatGoogleGenerativeAI:
        """Lazily initialize the Gemini chat model on first use."""
        if self._llm is None:
            logger.info(f"Initializing Gemini chat model '{settings.GEMINI_MODEL}'...")
            self._llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GOOGLE_API_KEY,
            )
        return self._llm

    def _build_context_text(self, context: list, intent: str) -> str:
        """Render retrieved chunks as prompt context.

        Synthesis answers need to reason across papers, so their chunks are
        grouped by source file (one block per paper, chunks in retrieval
        order) rather than the flat per-chunk list used for factual answers —
        this is what lets Gemini structure a "compare across these papers"
        answer without the source boundaries being ambiguous.
        """
        if intent == SYNTHESIS:
            # Grouped by paper_id (not filename) so two different uploads that
            # happen to share a filename are never conflated into one group.
            grouped: dict[str, dict] = {}
            for chunk in context:
                group = grouped.setdefault(
                    chunk.get("paper_id"), {"label": chunk.get("original_filename"), "texts": []}
                )
                group["texts"].append(chunk.get("chunk_text"))
            return "\n\n".join(
                f"[Paper: {group['label']}]\n" + "\n---\n".join(group["texts"]) for group in grouped.values()
            )

        return "\n\n".join(
            f"[Source: {chunk.get('original_filename')}]\n{chunk.get('chunk_text')}" for chunk in context
        )

    def _build_prompt(self, question: str, context: list, intent: str) -> str:
        """Combine system instructions, retrieved context, and the question into one prompt."""
        instructions = SYNTHESIS_INSTRUCTIONS if intent == SYNTHESIS else FACTUAL_INSTRUCTIONS
        context_text = self._build_context_text(context, intent)
        return (
            f"{instructions}\n\n"
            f"Context:\n{context_text}\n\n"
            f"Question: {question}\n"
            "Answer:"
        )

    def generate_answer(self, question: str, context: list, intent: str = FACTUAL) -> str:
        """Generate an answer to `question` grounded in `context` chunks.

        `intent` (see intent_service) selects the prompt shape: FACTUAL for a
        flat context list, SYNTHESIS for context grouped by source paper with
        instructions to reason across all of them.
        """
        prompt = self._build_prompt(question, context, intent)
        logger.info(f"Calling Gemini for question ({intent}): {question}")
        response = self.llm.invoke(prompt)
        return response.content.strip()


llm_service = LLMService()
