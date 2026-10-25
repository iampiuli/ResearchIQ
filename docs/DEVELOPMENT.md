# Development Guide

## Day-to-day workflow

Two terminals:

```powershell
# 1. backend/
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# 2. frontend/
npm run dev
```

`--reload` restarts the backend when Python files change. Vite hot-reloads the frontend.

Useful URLs: app <http://localhost:5173> · API docs <http://localhost:8000/docs> · health <http://localhost:8000/health>.

## Code conventions

**Backend**
- Routers in `api/` stay thin: validate, call services, shape the response.
- Business logic lives in `services/`. Raise a `ResearchIQException` subclass (see `utils/exceptions.py`) for errors the client should see.
- Read configuration only through `settings`; never call `os.getenv` elsewhere.
- Log with `get_logger(__name__)`.
- Add request/response models to `models/schemas.py`.

**Frontend**
- See [FRONTEND.md](FRONTEND.md#conventions) and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Use design tokens, not raw colors.

## Testing

CI (`.github/workflows/ci.yml`) runs the backend tests and the frontend lint and build on every push to `main` and every pull request. Run the same checks locally before you push:

1. **Backend tests:** from `backend/`, with the venv active, `pip install -r requirements-dev.txt` once, then `pytest`.
   - The suite covers upload, papers, chat (including page citations and workspace scoping), search and the services.
   - It needs no model download, network or API key: the embedding model and Gemini are replaced with deterministic fakes in `tests/conftest.py`.
   - It always uses temporary storage, and a fixture fails any test that would touch the real `app/uploads` or `chroma_store`.
2. **Frontend:** `npm run build` and `npm run lint` in `frontend/` must pass (one known lint warning in `ui/button.jsx` about exporting `buttonVariants`).
3. There are no frontend component tests yet (see [Roadmap](ROADMAP.md)).

### Test in isolation: never use your real data

Tests and experiments must **not** write to `backend/app/uploads` or `backend/app/database/chroma_store`; those hold your real papers and vectors. Point the server at throwaway folders with environment variables (they override `.env`):

```powershell
$T = "$env:TEMP\researchiq-test"
New-Item -ItemType Directory -Force "$T\uploads","$T\chroma" | Out-Null
$env:UPLOAD_DIR = "$T\uploads"
$env:CHROMA_PERSIST_DIR = "$T\chroma"
uvicorn app.main:app --port 8131
```

Use a different port (e.g. 8131) so it can't collide with your dev server. Delete the temp folder afterwards. Note that `/chat` makes real Gemini calls and counts against your quota.

### Quick API smoke test

```bash
curl localhost:8131/health
curl -F "files=@sample.pdf" localhost:8131/upload
curl localhost:8131/papers
curl -X POST localhost:8131/chat -H "Content-Type: application/json" \
     -d '{"query":"What is this paper about?","paper_ids":["<paper_id>"]}'
```

## Scripts (`backend/scripts/`)

Run from the repo root with the venv active. They never run automatically.

| Script | Purpose |
|---|---|
| `reset_dev.py [--yes] [--force]` | Deletes all uploaded PDFs, sidecars and the Chroma store. Refuses unless `APP_ENV=development` (or `--force`); asks for typed confirmation unless `--yes`. |
| `backfill_original_filenames.py [--dry-run] [--yes]` | One-time migration: adds `original_filename` to Chroma metadata for papers indexed before that field existed. Idempotent. |

### Resetting local data

```powershell
python backend/scripts/reset_dev.py
```

Workspaces and chat history live in the **browser**, so clear them separately: DevTools → Application → Local Storage → delete the `researchiq.*` keys.

## Common tasks

**Add an API endpoint:** create `api/<name>.py` with an `APIRouter`, add schemas in `models/schemas.py`, register the router in `main.py`, document it in [API.md](API.md).

**Add a suggested prompt:** edit `PRIMARY_PROMPTS` / `SECONDARY_PROMPTS` in `WorkspacePage.jsx`. To trigger cross-paper (synthesis) retrieval, the phrase must match a pattern in `services/intent_service.py`.

**Teach the classifier a new synthesis phrase:** add a regex to `_SYNTHESIS_PATTERNS` in `intent_service.py`.

**Change a color:** edit the token in `:root` in `index.css`; never in a component.

## Repository hygiene

- `.env` and `venv/` are gitignored; `app/uploads/*` and `chroma_store/` too.
- `backend/server.log` is currently tracked by git; it should be removed from the repo and added to `.gitignore` (see [Roadmap](ROADMAP.md)).
- Commit style so far: short imperative messages (`feat: …`, `docs: …`, `fix: …`).
