"""
Centralized application configuration.

Loads environment variables via python-dotenv and exposes them as a single
Settings object so the rest of the app never calls os.getenv() directly.
"""

import os
from dotenv import load_dotenv

# Load variables from .env into the process environment.
load_dotenv()


class Settings:
    """Typed accessor for environment-driven configuration."""

    # --- App metadata ---
    APP_NAME: str = os.getenv("APP_NAME", "ResearchIQ")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # --- Server ---
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # --- CORS ---
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

    # --- File storage ---
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "app/uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))

    # --- Google Gemini (not wired up yet) ---
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

    # --- ChromaDB ---
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "app/database/chroma_store")
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "researchiq")

    # --- Embeddings (not wired up yet) ---
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

    # --- Logging ---
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
