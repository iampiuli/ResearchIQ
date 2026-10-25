# Changelog

All notable changes to this project. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- **Page-level citations:** PDFs are now indexed per page, chat sources carry `page` (best-matching chunk) and `pages`, and citation chips link to the cited page in the reader. Papers uploaded before this change have no page data until re-uploaded.
- Backend test suite (pytest, 27 tests) that runs against temporary storage with fake embeddings and a stubbed Gemini, and a GitHub Actions workflow running backend tests plus frontend lint and build.
- Full project documentation under `docs/` plus `CONTRIBUTING.md`, `SECURITY.md` and this changelog.

### Changed
- **Complete UI redesign, "quiet reading room":** warm paper palette, deep ink, single moss-green accent, marker-yellow reserved for citations; Newsreader serif for headings and answers with Geist for UI; hairline borders instead of cards; restyled sidebar, chat, composer, PDF reader, dialogs, menus and toasts.
- Landing page rebuilt as an editorial layout with a coded workspace preview (replacing the static screenshot); copy corrected to describe only features that exist.
- New logo mark and favicon (`favicon.svg`).
- `backend/.env.example`: CORS origins now include `http://localhost:5173`; Gemini model aligned with the code default; comments updated.

### Fixed
- "Retry" in the Library error state passed the click event to `fetch` as an `AbortSignal`, causing `Failed to convert value to 'AbortSignal'`.
- Backend: default CORS origins now include Vite's `http://localhost:5173`; migrated deprecated `on_event` startup/shutdown handlers to a FastAPI lifespan.

### Removed
- Dead in-memory chunk/embedding stores in `chunk_service` and `embedding_service` (they grew with every upload and were never read); `backend/server.log` is no longer tracked and `*.log` is ignored.
- Unused `GradientOrbs` component; non-functional account button in the top bar.

### Dependencies
- Added `@fontsource-variable/newsreader` (frontend).

## [0.1.0]: MVP

- PDF upload with SHA-256 deduplication, text extraction, chunking, embedding and ChromaDB storage.
- RAG chat with Gemini, intent-aware retrieval (factual vs. cross-paper synthesis) and per-paper sources.
- Workspaces (client-side), in-app PDF viewer, semantic search endpoint.
- Landing page and workspace UI.
- MIT license and initial project/backend documentation.
