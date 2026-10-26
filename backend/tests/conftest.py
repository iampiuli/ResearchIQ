"""
Shared test fixtures.

Everything runs against throwaway directories: the environment is pointed at
a temp dir *before* the app is imported (settings are read at import time),
and a function-scoped fixture asserts it before every test, so a test can
never read or write the real app/uploads or the real chroma_store.

The embedding model and Gemini are replaced with deterministic fakes, so the
suite needs no model download, no network and no API key.
"""

import hashlib
import io
import math
import os
import re
import shutil
import tempfile
from pathlib import Path

_SESSION_DIR = Path(tempfile.mkdtemp(prefix="researchiq-tests-"))
_UPLOAD_DIR = _SESSION_DIR / "uploads"
_UPLOAD_DIR.mkdir()

os.environ["UPLOAD_DIR"] = str(_UPLOAD_DIR)
os.environ["CHROMA_PERSIST_DIR"] = str(_SESSION_DIR / "chroma-initial")
os.environ["GOOGLE_API_KEY"] = "test-key"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"
os.environ["ANONYMIZED_TELEMETRY"] = "False"

import fitz  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.chroma_service import chroma_service  # noqa: E402
from app.services.embedding_service import embedding_service  # noqa: E402
from app.services.llm_service import llm_service  # noqa: E402
from app.utils.auth import get_current_user  # noqa: E402
from app.utils.config import settings  # noqa: E402

EMBEDDING_DIM = 128


def _fake_embed(text: str) -> list[float]:
    """Bag-of-words hashing embedding: texts sharing words get similar vectors."""
    vector = [0.0] * EMBEDDING_DIM
    for word in re.findall(r"[a-z0-9]+", text.lower()):
        digest = hashlib.md5(word.encode()).digest()
        vector[int.from_bytes(digest[:4], "big") % EMBEDDING_DIM] += 1.0
    norm = math.sqrt(sum(v * v for v in vector)) or 1.0
    return [v / norm for v in vector]


def pytest_sessionfinish(session, exitstatus):
    shutil.rmtree(_SESSION_DIR, ignore_errors=True)


@pytest.fixture(autouse=True)
def isolated_storage(tmp_path, monkeypatch):
    """Fresh upload dir and Chroma store for every test, plus fake embeddings."""
    for item in _UPLOAD_DIR.iterdir():
        item.unlink()

    chroma_dir = tmp_path / "chroma"
    monkeypatch.setattr(settings, "CHROMA_PERSIST_DIR", str(chroma_dir))
    monkeypatch.setattr(chroma_service, "_client", None)
    monkeypatch.setattr(chroma_service, "_collection", None)

    monkeypatch.setattr(embedding_service, "embed_text", _fake_embed)
    monkeypatch.setattr(embedding_service, "embed_batch", lambda texts: [_fake_embed(t) for t in texts])
    monkeypatch.setattr(embedding_service, "get_embedding_dimension", lambda: EMBEDDING_DIM)

    # Last line of defence: never let a test touch the real app data.
    real_app_dir = Path(__file__).resolve().parent.parent / "app"
    for path in (settings.UPLOAD_DIR, settings.CHROMA_PERSIST_DIR):
        assert not Path(path).resolve().is_relative_to(real_app_dir), f"test would touch real data: {path}"

    yield


@pytest.fixture
def llm_calls(monkeypatch):
    """Replace Gemini with a stub that records what it was asked and answers 'stub answer'."""
    calls = []

    def fake_generate(question, context, intent="factual"):
        calls.append({"question": question, "context": context, "intent": intent})
        return "stub answer"

    monkeypatch.setattr(llm_service, "generate_answer", fake_generate)
    return calls


@pytest.fixture
def current_user():
    """The id the fake auth layer reports; tests change `current_user["id"]` to act as someone else."""
    return {"id": "user_a"}


@pytest.fixture
def client(current_user):
    app.dependency_overrides[get_current_user] = lambda: current_user["id"]
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


def make_pdf(*page_texts: str) -> bytes:
    """Build a PDF with one page per string, each text repeated so it forms a real paragraph."""
    doc = fitz.open()
    for text in page_texts:
        page = doc.new_page()
        page.insert_textbox(fitz.Rect(40, 40, 555, 800), (text + ". ") * 12, fontsize=11)
    data = doc.tobytes()
    doc.close()
    return data


@pytest.fixture
def upload(client):
    """Upload PDFs and return the response: upload(("a.pdf", pdf_bytes), ...)."""

    def _upload(*files, content_type="application/pdf"):
        return client.post(
            "/upload",
            files=[("files", (name, io.BytesIO(data), content_type)) for name, data in files],
        )

    return _upload
