"""
ResearchIQ Backend Entry Point

Wires up the FastAPI app: middleware (CORS), logging, global exception
handlers, and API routers. Business logic lives in services/ and is not
implemented yet — this file only assembles the architecture.
"""

import gc
import os
from pathlib import Path

# Constrain BLAS/torch intra-op thread pools before any heavy library is
# imported below (torch/sentence-transformers, transitively via
# app.api.upload -> embedding_service). On Render's free tier (fractional
# CPU, 512MB RAM), the default one-thread-per-core pool allocates extra
# per-thread memory and adds scheduling overhead with no real speedup on a
# single vCPU slice.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

from app.api import upload, chat, papers, search  # noqa: E402
from app.services.chroma_service import chroma_service  # noqa: E402
from app.services.embedding_service import embedding_service  # noqa: E402
from app.utils.config import settings  # noqa: E402
from app.utils.logger import setup_logging, get_logger  # noqa: E402
from app.utils.memory import log_stage  # noqa: E402
from app.utils.exceptions import (  # noqa: E402
    ResearchIQException,
    researchiq_exception_handler,
    unhandled_exception_handler,
)

setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for ResearchIQ — a RAG-powered research paper assistant.",
    version="0.1.0",
    debug=settings.DEBUG,
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


@app.on_event("startup")
async def on_startup() -> None:
    logger.info(f"{settings.APP_NAME} starting up in '{settings.APP_ENV}' mode")
    log_stage(logger, "startup: before warm-up")

    # Force both heavy singletons (SentenceTransformer weights, ChromaDB's
    # PersistentClient/sqlite engine) to initialize here instead of lazily
    # on the first POST /upload. Cold-loading both of them inside a live
    # request — stacked on top of that request's own PDF/chunk/embedding
    # buffers — is what pushed peak memory past Render free tier's 512MB
    # cap and triggered a SIGKILL (exit 137, no traceback). Doing it once
    # at boot makes the cost a one-time, predictable startup spike instead.
    embedding_service.model
    log_stage(logger, "startup: embedding model loaded")
    chroma_service.collection
    log_stage(logger, "startup: chroma collection ready")
    gc.collect()
    log_stage(logger, "startup: warm-up complete")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info(f"{settings.APP_NAME} shutting down")
