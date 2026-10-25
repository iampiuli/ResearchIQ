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
