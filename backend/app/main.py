"""
ResearchIQ Backend Entry Point

Wires up the FastAPI app: middleware (CORS), logging, global exception
handlers, and API routers. Business logic lives in services/ and is not
implemented yet — this file only assembles the architecture.
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import upload, chat, papers, search
from app.utils.config import settings
from app.utils.logger import setup_logging, get_logger
from app.utils.exceptions import (
    ResearchIQException,
    researchiq_exception_handler,
    unhandled_exception_handler,
)

setup_logging()
logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"{settings.APP_NAME} starting up in '{settings.APP_ENV}' mode")
    # TODO (future): Initialize ChromaDB client / warm up embedding model here.
    yield
    logger.info(f"{settings.APP_NAME} shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for ResearchIQ — a RAG-powered research paper assistant.",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global error handlers ---
app.add_exception_handler(ResearchIQException, researchiq_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# --- Routers ---
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(papers.router)
app.include_router(search.router)

# --- Static files (read-only) ---
# Serves already-uploaded PDFs by stored filename so the frontend can render
# them; does not add or change any route's request/response behavior.
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.UPLOAD_DIR), name="files")


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Basic liveness check. No dependencies are verified here yet."""
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": "0.1.0",
    }
