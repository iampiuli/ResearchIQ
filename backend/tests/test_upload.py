from app.api import upload as upload_module
from tests.conftest import make_pdf


def test_upload_indexes_pdf(upload):
    response = upload(("paper.pdf", make_pdf("protein folding dynamics", "medieval trade routes")))

    assert response.status_code == 201
    body = response.json()
    assert body["summary"] == {"total_files": 1, "uploaded": 1, "duplicates": 0, "failed": 0}
    result = body["uploaded"][0]
    assert result["filename"] == "paper.pdf"
    assert result["page_count"] == 2
    assert result["chunk_count"] >= 2  # chunking is per page, so at least one chunk per page
    assert result["vector_count"] == result["chunk_count"]


def test_duplicate_upload_is_skipped(upload):
    pdf = make_pdf("protein folding dynamics")
    first = upload(("a.pdf", pdf)).json()
    second = upload(("renamed.pdf", pdf)).json()

    assert second["summary"]["duplicates"] == 1
    assert second["summary"]["uploaded"] == 0
    assert second["duplicates"][0]["paper_id"] == first["uploaded"][0]["paper_id"]


def test_non_pdf_is_rejected(upload):
    response = upload(("notes.txt", b"hello"), content_type="text/plain")

    body = response.json()
    assert body["summary"]["failed"] == 1
    assert "Only PDF" in body["failed"][0]["reason"]


def test_empty_file_is_rejected(upload):
    body = upload(("empty.pdf", b"")).json()

    assert body["summary"]["failed"] == 1
    assert "empty" in body["failed"][0]["reason"].lower()


def test_corrupt_pdf_fails_and_leaves_no_file(upload, client):
    body = upload(("broken.pdf", b"%PDF-1.4 definitely not a pdf")).json()

    assert body["summary"]["failed"] == 1
    assert client.get("/papers").json() == []


def test_oversized_file_is_rejected(upload, monkeypatch):
    monkeypatch.setattr(upload_module, "MAX_FILE_SIZE_BYTES", 10)

    body = upload(("big.pdf", make_pdf("protein folding dynamics"))).json()

    assert body["summary"]["failed"] == 1
    assert "maximum allowed size" in body["failed"][0]["reason"]


def test_one_bad_file_does_not_abort_the_batch(upload):
    body = upload(
        ("good.pdf", make_pdf("protein folding dynamics")),
        ("broken.pdf", b"not a pdf"),
        ("good2.pdf", make_pdf("medieval trade routes")),
    ).json()

    assert body["summary"] == {"total_files": 3, "uploaded": 2, "duplicates": 0, "failed": 1}
    assert body["failed"][0]["filename"] == "broken.pdf"
