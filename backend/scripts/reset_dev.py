"""
Development-only reset utility for ResearchIQ.

Deletes all locally-indexed papers (uploaded PDFs + metadata sidecars) and
the ChromaDB vector store, so you can start a session from a clean slate
during development or testing.

This script is NEVER imported or run by the application itself — it only
runs when you invoke it explicitly:

    python backend/scripts/reset_dev.py [--yes] [--force]

Safety:
- Refuses to run unless APP_ENV=development, unless --force is passed.
- Prompts for a typed confirmation unless --yes is passed.
- Only touches UPLOAD_DIR and CHROMA_PERSIST_DIR (both backend-local data);
  production behavior and every other part of the app are unaffected.

Out of scope on purpose: workspace names, attached-paper lists, and chat
history live in the *browser's* localStorage, not on the backend, so this
script cannot and does not touch them. Clear those separately via your
browser's devtools (Application/Storage tab) if you want a full reset.
"""

import argparse
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.utils.config import settings  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset ResearchIQ's local dev data (uploads + ChromaDB).")
    parser.add_argument("--yes", action="store_true", help="Skip the interactive confirmation prompt.")
    parser.add_argument("--force", action="store_true", help="Allow running even if APP_ENV is not 'development'.")
    args = parser.parse_args()

    if settings.APP_ENV != "development" and not args.force:
        print(f"Refusing to run: APP_ENV is '{settings.APP_ENV}', not 'development'. Pass --force to override.")
        sys.exit(1)

    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    chroma_dir = Path(settings.CHROMA_PERSIST_DIR).resolve()

    print("This will permanently delete:")
    print(f"  - {upload_dir}  (uploaded PDFs + metadata)")
    print(f"  - {chroma_dir}  (ChromaDB vectors)")
    print()
    print("Note: workspace names, attached papers, and chat history live in your")
    print("browser's localStorage, not here — clear those separately if needed.")
    print()

    if not args.yes:
        confirmation = input("Type 'reset' to continue: ")
        if confirmation.strip().lower() != "reset":
            print("Aborted — no changes made.")
            sys.exit(1)

    if upload_dir.exists():
        shutil.rmtree(upload_dir)
        print(f"Deleted {upload_dir}")
    else:
        print(f"{upload_dir} did not exist — nothing to delete.")

    if chroma_dir.exists():
        shutil.rmtree(chroma_dir)
        print(f"Deleted {chroma_dir}")
    else:
        print(f"{chroma_dir} did not exist — nothing to delete.")

    print("\nDone. Restart the backend — it recreates empty uploads/ and chroma_store/ directories on startup.")


if __name__ == "__main__":
    main()
