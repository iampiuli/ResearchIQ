"""
Authentication

Verifies Clerk session tokens (RS256 JWTs) against the instance's JWKS and
exposes the caller's user id as a FastAPI dependency. Every data route
depends on `get_current_user`, so nothing is reachable anonymously.
"""

from functools import lru_cache

import jwt
from fastapi import Header
from jwt import PyJWKClient

from app.utils.config import settings
from app.utils.exceptions import AuthenticationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)


def _verify(token: str) -> str:
    """Return the `sub` (user id) of a valid token, or raise AuthenticationError."""
    if not settings.CLERK_JWKS_URL or not settings.CLERK_ISSUER:
        logger.error("CLERK_JWKS_URL / CLERK_ISSUER are not configured; rejecting request")
        raise AuthenticationError("Authentication is not configured on the server.")
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"require": ["exp", "iat", "sub"], "verify_aud": False},
            leeway=10,
        )
    except jwt.PyJWTError as exc:
        logger.info(f"Rejected token: {exc}")
        raise AuthenticationError("Invalid or expired session. Please sign in again.") from exc
    return claims["sub"]


async def get_current_user(authorization: str | None = Header(default=None)) -> str:
    """FastAPI dependency: the authenticated user's id, from the Bearer token."""
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise AuthenticationError("Authentication required.")
    return _verify(token)
