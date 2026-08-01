"""
Centralized logging configuration.

Import `get_logger(__name__)` from this module anywhere in the app instead
of configuring logging ad-hoc per file.
"""

import logging
import sys

from app.utils.config import settings


def setup_logging() -> None:
    """Configure the root logger. Called once on app startup."""
    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger."""
    return logging.getLogger(name)
