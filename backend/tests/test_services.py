import pytest

from app.services.chunk_service import chunk_service
from app.services.intent_service import FACTUAL, SYNTHESIS, classify_intent


@pytest.mark.parametrize(
    "query",
    ["Summarize these papers", "compare the methodology", "What are the research gaps?", "give me an overview"],
)
def test_synthesis_queries(query):
    assert classify_intent(query) == SYNTHESIS


@pytest.mark.parametrize("query", ["What learning rate was used?", "Who are the authors?"])
def test_factual_queries(query):
    assert classify_intent(query) == FACTUAL


def test_split_pages_tags_each_chunk_with_its_page():
    pages = [(1, "alpha. " * 400), (2, ""), (3, "gamma. " * 50)]

    chunks = chunk_service.split_pages(pages)

    assert {page for _, page in chunks} == {1, 3}  # the empty page produces no chunks
    assert all("alpha" in text for text, page in chunks if page == 1)
    assert all("gamma" in text for text, page in chunks if page == 3)
    assert [page for _, page in chunks] == sorted(page for _, page in chunks)
