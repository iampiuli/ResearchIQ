"""
LLM Service

Responsible for calling Google Gemini (via LangChain) to generate answers
grounded in retrieved context.

NOT IMPLEMENTED YET — placeholder only.
"""

from app.utils.logger import get_logger

logger = get_logger(__name__)


class LLMService:
    """Handles interaction with the Gemini LLM."""

    def __init__(self):
        # TODO (future): Initialize the LangChain Gemini chat model here, e.g.
        # self.llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL,
        #                                    google_api_key=settings.GOOGLE_API_KEY)
        self.llm = None

    def generate_answer(self, question: str, context: list) -> str:
        """
        Generate an answer to `question` grounded in `context` chunks.

        TODO (future): Build a prompt template combining the question and
        retrieved context, invoke self.llm, and return the response text.
        """
        logger.info(f"[stub] generate_answer called for question: {question}")
        raise NotImplementedError("LLM generation is not implemented yet.")


llm_service = LLMService()
