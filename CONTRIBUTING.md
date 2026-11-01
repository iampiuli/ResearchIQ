# Contributing

Thanks for helping improve ResearchIQ.

## Setup

Follow the getting started steps in the [README](README.md).

## Workflow

1. Create a branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Make focused changes. Keep unrelated refactors out of the same PR.
3. Verify before opening a PR:
   - `cd frontend && npm run build && npm run lint`
   - Backend: `cd backend && pytest`. It uses temporary storage and fakes, so it never touches your real data. For manual checks, point `UPLOAD_DIR` and `CHROMA_PERSIST_DIR` at a temporary directory.
4. Update the README when behavior changes (env vars, setup) and add a line to [CHANGELOG.md](CHANGELOG.md).
5. Open a PR describing *what* changed and *why*, and how you tested it.

## Commit messages

Short, imperative, optionally prefixed: `feat: …`, `fix: …`, `docs: …`, `refactor: …`.

## Guidelines

- **Backend:** thin routers, logic in services, config through `settings`, errors as `ResearchIQException` subclasses.
- **Frontend:** use the design tokens in `src/index.css`, never raw colors.
- **Never commit** `.env`, API keys, `venv/`, uploaded PDFs or the Chroma store.
- Don't test against your real `app/uploads` or `chroma_store`.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and relevant backend log lines or browser console errors. For security issues, see [SECURITY.md](SECURITY.md) instead.
