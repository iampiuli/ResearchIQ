# Changelog

All notable changes to this project. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Full project documentation under `docs/` plus `CONTRIBUTING.md`, `SECURITY.md` and this changelog.

### Changed
- **Complete UI redesign, "quiet reading room":** warm paper palette, deep ink, single moss-green accent, marker-yellow reserved for citations; Newsreader serif for headings and answers with Geist for UI; hairline borders instead of cards; restyled sidebar, chat, composer, PDF reader, dialogs, menus and toasts.
- Landing page rebuilt as an editorial layout with a coded workspace preview (replacing the static screenshot); copy corrected to describe only features that exist.
- New logo mark and favicon (`favicon.svg`).
- `backend/.env.example`: CORS origins now include `http://localhost:5173`; Gemini model aligned with the code default; comments updated.

### Fixed
- "Retry" in the Library error state passed the click event to `fetch` as an `AbortSignal`, causing `Failed to convert value to 'AbortSignal'`.

### Removed
- Unused `GradientOrbs` component; non-functional account button in the top bar.

### Dependencies
- Added `@fontsource-variable/newsreader` (frontend).

## [0.1.0]: MVP

- PDF upload with SHA-256 deduplication, text extraction, chunking, embedding and ChromaDB storage.
- RAG chat with Gemini, intent-aware retrieval (factual vs. cross-paper synthesis) and per-paper sources.
- Workspaces (client-side), in-app PDF viewer, semantic search endpoint.
- Landing page and workspace UI.
- MIT license and initial project/backend documentation.
