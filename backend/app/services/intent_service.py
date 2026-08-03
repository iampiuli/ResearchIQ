"""
Intent Service

Classifies a chat query as "factual" or "synthesis" so the chat router can
pick the right retrieval strategy (see retrieval_service). This is a
deterministic keyword classifier rather than an LLM call: the target
categories are a bounded, well-known set (summarize, compare, research
gaps, datasets, benchmarks, strengths/weaknesses, literature review,
future work, ...), so a keyword match is instant, free, and fully
explainable — an extra Gemini round-trip would only add latency and cost
without a clear accuracy gain for this bounded a problem.
"""

import re

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Phrases that indicate a request to aggregate/synthesize across a paper's
# (or multiple papers') full content, rather than look up one specific fact.
_SYNTHESIS_PATTERNS = [
    r"\bsummar(y|ies|ize|ise|izing|ising)\b",
    r"\bcompar(e|ison|ing)\b",
    r"\bcontrast\b",
    r"\bmethodolog(y|ies)\b",
    r"\bresearch gaps?\b",
    r"\bfuture work\b",
    r"\bdatasets?\b",
    r"\bbenchmarks?\b",
    r"\bstrengths?\b",
    r"\bweakness(es)?\b",
    r"\bcommon findings?\b",
    r"\bliterature review\b",
    r"\boverview\b",
    r"\bsurvey\b",
    r"\bconclusions?\b",
    r"\b(these|all|both|the) papers\b",
]
_SYNTHESIS_RE = re.compile("|".join(_SYNTHESIS_PATTERNS), re.IGNORECASE)

FACTUAL = "factual"
SYNTHESIS = "synthesis"


def classify_intent(query: str) -> str:
    """Return SYNTHESIS if `query` asks for cross-document aggregation, else FACTUAL."""
    intent = SYNTHESIS if _SYNTHESIS_RE.search(query) else FACTUAL
    logger.info(f"Classified query as '{intent}': {query}")
    return intent
