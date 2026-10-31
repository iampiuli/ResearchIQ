"""Authentication and per-user isolation."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import make_pdf

PROTECTED = [
    ("get", "/papers", None),
    ("get", "/files/00000000-0000-0000-0000-000000000000.pdf", None),
    ("delete", "/papers/00000000-0000-0000-0000-000000000000", None),
    ("post", "/search", {"query": "x"}),
    ("post", "/chat", {"query": "x"}),
    ("post", "/upload", None),
]


@pytest.mark.parametrize("method,path,body", PROTECTED)
def test_routes_require_a_token(method, path, body):
    with TestClient(app) as anonymous:
        response = getattr(anonymous, method)(path, **({"json": body} if body else {}))

    assert response.status_code == 401


def test_health_is_public():
    with TestClient(app) as anonymous:
        assert anonymous.get("/health").status_code == 200


def test_garbage_token_is_rejected():
    with TestClient(app) as anonymous:
        response = anonymous.get("/papers", headers={"Authorization": "Bearer not-a-jwt"})

    assert response.status_code == 401


def _upload_as(user, current_user, upload, name, text):
    current_user["id"] = user
    return upload((name, make_pdf(text))).json()["uploaded"][0]["paper_id"]


def test_papers_are_private_to_their_owner(client, upload, current_user):
    mine = _upload_as("user_a", current_user, upload, "mine.pdf", "protein folding dynamics")
    theirs = _upload_as("user_b", current_user, upload, "theirs.pdf", "medieval trade routes")

    current_user["id"] = "user_a"
    assert [p["id"] for p in client.get("/papers").json()] == [mine]
    current_user["id"] = "user_b"
    assert [p["id"] for p in client.get("/papers").json()] == [theirs]


def test_cannot_download_or_delete_someone_elses_paper(client, upload, current_user):
    mine = _upload_as("user_a", current_user, upload, "mine.pdf", "protein folding dynamics")

    current_user["id"] = "user_b"
    assert client.get(f"/files/{mine}.pdf").status_code == 404
    assert client.delete(f"/papers/{mine}").status_code == 404

    current_user["id"] = "user_a"
    assert client.get(f"/files/{mine}.pdf").status_code == 200
    assert [p["id"] for p in client.get("/papers").json()] == [mine]


def test_search_and_chat_never_return_other_users_chunks(client, upload, current_user, llm_calls):
    mine = _upload_as("user_a", current_user, upload, "mine.pdf", "protein folding dynamics")

    current_user["id"] = "user_b"
    assert client.post("/search", json={"query": "protein folding dynamics"}).json()["results"] == []
    # Even naming the paper explicitly must not leak it.
    for query in ("protein folding dynamics", "summarize this paper"):
        answer = client.post("/chat", json={"query": query, "paper_ids": [mine]}).json()
        assert answer["sources"] == []
    assert llm_calls == []


def test_same_pdf_can_be_uploaded_by_two_users(client, upload, current_user):
    pdf = make_pdf("protein folding dynamics")
    first = upload(("a.pdf", pdf)).json()
    current_user["id"] = "user_b"
    second = upload(("a.pdf", pdf)).json()

    assert first["summary"]["uploaded"] == 1
    assert second["summary"]["uploaded"] == 1
    assert second["summary"]["duplicates"] == 0


class _FakeSigningKey:
    def __init__(self, key):
        self.key = key


def _signed_token(private_key, **overrides):
    import time

    import jwt

    now = int(time.time())
    claims = {"sub": "user_real", "iss": "https://clerk.test", "iat": now, "exp": now + 300, **overrides}
    return jwt.encode(claims, private_key, algorithm="RS256")


@pytest.fixture
def real_auth(monkeypatch):
    """Exercise the real token check against a locally generated RSA key."""
    from cryptography.hazmat.primitives.asymmetric import rsa

    from app.utils import auth
    from app.utils.config import settings

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    monkeypatch.setattr(settings, "CLERK_JWKS_URL", "https://clerk.test/.well-known/jwks.json")
    monkeypatch.setattr(settings, "CLERK_ISSUER", "https://clerk.test")

    class FakeClient:
        def get_signing_key_from_jwt(self, token):
            return _FakeSigningKey(private_key.public_key())

    monkeypatch.setattr(auth, "_jwks_client", lambda: FakeClient())
    return private_key


def test_valid_token_is_accepted(real_auth):
    token = _signed_token(real_auth)
    with TestClient(app) as anonymous:
        response = anonymous.get("/papers", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200


@pytest.mark.parametrize("overrides", [{"exp": 1}, {"iss": "https://evil.test"}])
def test_expired_or_wrong_issuer_token_is_rejected(real_auth, overrides):
    token = _signed_token(real_auth, **overrides)
    with TestClient(app) as anonymous:
        response = anonymous.get("/papers", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_token_signed_by_another_key_is_rejected(real_auth):
    from cryptography.hazmat.primitives.asymmetric import rsa

    token = _signed_token(rsa.generate_private_key(public_exponent=65537, key_size=2048))
    with TestClient(app) as anonymous:
        response = anonymous.get("/papers", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
