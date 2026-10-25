# Contributing

Thanks for helping improve ResearchIQ.

## Setup

Follow [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md), then read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for conventions and testing.

## Workflow

1. Create a branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Make focused changes. Keep unrelated refactors out of the same PR.
3. Verify before opening a PR:
   - `cd frontend && npm run build && npm run lint`
   - Backend: smoke-test `/health`, `/upload`, `/chat` **using temporary storage** (see [Test in isolation](docs/DEVELOPMENT.md#test-in-isolation-never-use-your-real-data)).
4. Update the relevant docs when behavior changes (API shape, env vars, UI conventions) and add a line to [CHANGELOG.md](CHANGELOG.md).
5. Open a PR describing *what* changed and *why*, and how you tested it.

## Commit messages

Short, imperative, optionally prefixed: `feat: …`, `fix: …`, `docs: …`, `refactor: …`.

## Guidelines

- **Backend:** thin routers, logic in services, config through `settings`, errors as `ResearchIQException` subclasses.
- **Frontend:** use design tokens, never raw colors; see [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- **Never commit** `.env`, API keys, `venv/`, uploaded PDFs or the Chroma store.
- Don't test against your real `app/uploads` or `chroma_store`.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and relevant backend log lines or browser console errors. For security issues, see [SECURITY.md](SECURITY.md) instead.
