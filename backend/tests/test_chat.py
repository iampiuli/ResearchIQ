import pytest
from google.api_core.exceptions import ResourceExhausted

from app.api.chat import NO_CONTEXT_ANSWER
from app.services.llm_service import llm_service
from tests.conftest import make_pdf


@pytest.fixture
def papers(upload):
    """A three-page paper (one topic per page) and an unrelated second paper."""
    multi = upload(
        (
            "topics.pdf",
            make_pdf("quantum entanglement experiments", "protein folding dynamics", "medieval trade routes"),
        )
    ).json()["uploaded"][0]["paper_id"]
    other = upload(("other.pdf", make_pdf("galaxy rotation curves telescope")))
    return multi, other.json()["uploaded"][0]["paper_id"]


def chat(client, query, paper_ids):
    return client.post("/chat", json={"query": query, "paper_ids": paper_ids})


def test_citation_points_at_the_matching_page(client, llm_calls, papers):
    multi, _ = papers

    body = chat(client, "protein folding dynamics", [multi]).json()

    assert body["answer"] == "stub answer"
    assert len(body["sources"]) == 1
    source = body["sources"][0]
    assert source["paper_id"] == multi
    assert source["original_filename"] == "topics.pdf"
    assert source["page"] == 2
    assert source["pages"] == [2]


def test_retrieval_is_scoped_to_the_requested_papers(client, llm_calls, papers):
    multi, other = papers

    body = chat(client, "galaxy rotation curves telescope", [multi]).json()

    # The matching paper isn't in scope, so nothing relevant may leak through.
    assert body["answer"] == NO_CONTEXT_ANSWER
    assert body["sources"] == []
    assert llm_calls == []


def test_empty_workspace_returns_no_context(client, llm_calls, papers):
    body = chat(client, "protein folding dynamics", []).json()

    assert body["answer"] == NO_CONTEXT_ANSWER
    assert llm_calls == []


def test_synthesis_query_covers_every_paper_and_page(client, llm_calls, papers):
    multi, other = papers

    body = chat(client, "summarize these papers", [multi, other]).json()

    assert llm_calls[0]["intent"] == "synthesis"
    assert {s["paper_id"] for s in body["sources"]} == {multi, other}
    by_paper = {s["paper_id"]: s for s in body["sources"]}
    assert by_paper[multi]["pages"] == [1, 2, 3]


def test_chat_with_no_papers_uploaded(client, llm_calls):
    body = chat(client, "anything at all", None).json()

    assert body["answer"] == NO_CONTEXT_ANSWER


def test_gemini_quota_error_maps_to_quota_message(client, papers, monkeypatch):
    multi, _ = papers

    def raise_quota(*args, **kwargs):
        raise ResourceExhausted("quota")

    monkeypatch.setattr(llm_service, "generate_answer", raise_quota)

    response = chat(client, "protein folding dynamics", [multi])

    assert response.status_code == 429
    assert response.json()["error"] == "QuotaExceededError"


def test_gemini_failure_maps_to_llm_error(client, papers, monkeypatch):
    multi, _ = papers

    def explode(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(llm_service, "generate_answer", explode)

    response = chat(client, "protein folding dynamics", [multi])

    assert response.status_code == 503
    assert response.json()["error"] == "LLMError"


def test_search_returns_ranked_chunks(client, papers):
    results = client.post("/search", json={"query": "medieval trade routes"}).json()["results"]

    assert results
    assert "medieval" in results[0]["chunk_text"].lower()
