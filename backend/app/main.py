"""
ResearchIQ Backend Entry Point

Wires up the FastAPI app: middleware (CORS), logging, global exception
handlers, and API routers. Business logic lives in services/ and is not
implemented yet — this file only assembles the architecture.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    # TODO (future): Initialize ChromaDB client / warm up embedding model here.


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info(f"{settings.APP_NAME} shutting down")
