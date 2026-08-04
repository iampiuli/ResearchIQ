"""
Memory Diagnostics

Best-effort process memory reporting for diagnosing OOM kills. Render's
free tier sends SIGKILL (exit 137) when a process exceeds its memory cap —
that bypasses Python entirely, so no traceback is ever produced. Logging
peak RSS at each upload-pipeline stage is what lets the climb be seen in
Render's logs before the kill happens, instead of after.

Uses stdlib `resource`, which is POSIX-only; on Windows (local dev) it's
simply unavailable, so this degrades to "n/a" instead of raising.
"""

try:
    import resource
except ImportError:  # Windows has no `resource` module
    resource = None


def current_rss_mb() -> str:
    """Return this process's peak resident set size in MB, or 'n/a' if unavailable."""
    if resource is None:
        return "n/a"
    # ru_maxrss is KB on Linux (Render), bytes on macOS.
    return f"{resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024:.1f}MB"


def log_stage(logger, stage: str, **extra) -> None:
    """Log a pipeline stage annotated with current peak RSS and any extra context."""
    details = " ".join(f"{k}={v}" for k, v in extra.items())
    suffix = f" ({details})" if details else ""
    logger.info(f"[mem={current_rss_mb()}] {stage}{suffix}")
