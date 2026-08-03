"""
One-time backfill: adds `original_filename` to ChromaDB chunk metadata for
papers embedded before that field existed.

Why this is needed: chat responses, citations, and summaries all read a
chunk's `original_filename` from Chroma metadata to display a human-readable
name instead of the opaque, stored UUID-based filename. Papers uploaded
before that field was added to the embedding pipeline have chunks with no
`original_filename` in their metadata — this script backfills it from the
JSON sidecar that upload.py already writes for every paper (old or new),
without touching embeddings, documents, or any other pipeline behavior.

Safe to run multiple times (idempotent — already-correct chunks are
skipped) and never runs automatically; invoke explicitly:

    python backend/scripts/backfill_original_filenames.py [--dry-run] [--yes]
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.chroma_service import chroma_service  # noqa: E402
from app.utils.config import settings  # noqa: E402


def load_original_filenames(upload_dir: Path) -> dict:
    """Build {paper_id: original_filename} from every upload sidecar JSON."""
    names = {}
    for metadata_path in upload_dir.glob("*.json"):
        try:
            data = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        paper_id = data.get("id")
        original_filename = data.get("original_filename")
        if paper_id and original_filename:
            names[paper_id] = original_filename
    return names


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill original_filename into existing ChromaDB chunk metadata.")
    parser.add_argument("--dry-run", action="store_true", help="Report what would change without writing anything.")
    parser.add_argument("--yes", action="store_true", help="Skip the interactive confirmation prompt.")
    args = parser.parse_args()

    upload_dir = Path(settings.UPLOAD_DIR)
    sidecar_names = load_original_filenames(upload_dir)
    print(f"Found {len(sidecar_names)} paper(s) with a sidecar in {upload_dir.resolve()}")

    all_chunks = chroma_service.collection.get(include=["metadatas"])
    ids, metadatas = all_chunks["ids"], all_chunks["metadatas"]
    print(f"Collection has {len(ids)} chunk(s) total")

    update_ids, update_metadatas, skipped_no_sidecar = [], [], set()
    for chunk_id, meta in zip(ids, metadatas):
        paper_id = meta.get("paper_id")
        stored_filename = meta.get("filename")
        current = meta.get("original_filename")

        # Already has a real (non-fallback) name — nothing to do.
        if current and current != stored_filename:
            continue

        real_name = sidecar_names.get(paper_id)
        if not real_name:
            skipped_no_sidecar.add(paper_id)
            continue

        update_ids.append(chunk_id)
        update_metadatas.append({"original_filename": real_name})

    affected_papers = {m["original_filename"] for m in update_metadatas}
    print(f"\n{len(update_ids)} chunk(s) across {len(affected_papers)} paper(s) need backfilling:")
    for name in sorted(affected_papers):
        print(f"  - {name}")
    if skipped_no_sidecar:
        print(f"\n{len(skipped_no_sidecar)} paper_id(s) have no sidecar JSON — left untouched (already at the")
        print("last-resort stored-filename fallback, same as before this script exists):")
        for pid in sorted(skipped_no_sidecar):
            print(f"  - {pid}")

    if not update_ids:
        print("\nNothing to do — every chunk already has a real original_filename.")
        return

    if args.dry_run:
        print("\n--dry-run: no changes written.")
        return

    if not args.yes:
        confirmation = input(f"\nUpdate metadata for {len(update_ids)} chunk(s)? Type 'backfill' to continue: ")
        if confirmation.strip().lower() != "backfill":
            print("Aborted — no changes made.")
            sys.exit(1)

    # Chroma's update() merges metadata per id (confirmed: keys not passed
    # are preserved), so this only ever adds the missing field — it cannot
    # clobber chunk_id/filename/page_count/uploaded_at/paper_id.
    chroma_service.collection.update(ids=update_ids, metadatas=update_metadatas)
    print(f"\nDone — backfilled original_filename for {len(update_ids)} chunk(s).")


if __name__ == "__main__":
    main()
