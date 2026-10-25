from tests.conftest import make_pdf


def test_empty_library(client):
    assert client.get("/papers").json() == []


def test_lists_uploaded_papers_newest_first(client, upload):
    first = upload(("first.pdf", make_pdf("protein folding dynamics"))).json()["uploaded"][0]
    second = upload(("second.pdf", make_pdf("medieval trade routes"))).json()["uploaded"][0]

    papers = client.get("/papers").json()

    assert [p["id"] for p in papers] == [second["paper_id"], first["paper_id"]]
    assert papers[0]["original_filename"] == "second.pdf"
    assert papers[0]["page_count"] == 1


def test_uploaded_pdf_is_served(client, upload):
    stored = upload(("a.pdf", make_pdf("protein folding dynamics"))).json()["uploaded"][0]
    filename = client.get("/papers").json()[0]["filename"]

    response = client.get(f"/files/{filename}")

    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")
    assert stored["paper_id"] in filename


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


def test_cors_allows_configured_origin(client):
    response = client.get("/papers", headers={"Origin": "http://localhost:5173"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_delete_removes_pdf_metadata_and_vectors(client, upload, llm_calls):
    kept = upload(("kept.pdf", make_pdf("galaxy rotation curves telescope"))).json()["uploaded"][0]["paper_id"]
    gone = upload(("gone.pdf", make_pdf("protein folding dynamics"))).json()["uploaded"][0]["paper_id"]
    filename = next(p["filename"] for p in client.get("/papers").json() if p["id"] == gone)

    response = client.delete(f"/papers/{gone}")

    assert response.status_code == 204
    assert [p["id"] for p in client.get("/papers").json()] == [kept]
    assert client.get(f"/files/{filename}").status_code == 404
    # Its vectors are gone too, so it can no longer be retrieved...
    results = client.post("/search", json={"query": "protein folding dynamics"}).json()["results"]
    assert gone not in {r["paper_id"] for r in results}
    # ...while the other paper is untouched.
    results = client.post("/search", json={"query": "galaxy rotation curves telescope"}).json()["results"]
    assert {r["paper_id"] for r in results} == {kept}


def test_deleted_paper_can_be_uploaded_again(client, upload):
    pdf = make_pdf("protein folding dynamics")
    first = upload(("a.pdf", pdf)).json()["uploaded"][0]["paper_id"]
    client.delete(f"/papers/{first}")

    again = upload(("a.pdf", pdf)).json()

    # Not treated as a duplicate: the old copy really is gone.
    assert again["summary"]["uploaded"] == 1
    assert again["summary"]["duplicates"] == 0


def test_delete_unknown_paper_is_404(client):
    response = client.delete("/papers/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404
    assert response.json()["error"] == "PaperNotFoundError"


def test_delete_rejects_ids_that_are_not_uuids(client):
    for bad_id in ["not-a-uuid", "..", "%2e%2e"]:
        assert client.delete(f"/papers/{bad_id}").status_code in (404, 405)
