# Getting Started

How to run ResearchIQ locally, and what to do when it doesn't start.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | **3.11** recommended | The project's deploy history pinned 3.11.11. Newer versions may lack wheels for the pinned dependencies. |
| Node.js | 18+ | For the Vite frontend. |
| Gemini API key | — | Free key from <https://ai.google.dev/>. Required for chat only. |
| Disk space | ~4 GB | The Python venv is ~1.4 GB (PyTorch, transformers, chromadb); allow headroom. |

## 1. Backend

```powershell
cd backend
py -3.11 -m venv venv            # or: python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt  # several minutes: downloads PyTorch
copy .env.example .env           # macOS/Linux: cp .env.example .env
```

Edit `backend/.env` and set `GOOGLE_API_KEY=` to your key. `.env` is gitignored, so never commit it.

Start the server (prompt must show `(venv)`):

```powershell
uvicorn app.main:app --reload --port 8000
```

Wait for `Application startup complete`, then check <http://localhost:8000/health> and the interactive docs at <http://localhost:8000/docs>.

> **First upload or chat is slow.** The embedding model (`all-MiniLM-L6-v2`, ~90 MB) downloads and loads lazily on first use.

## 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The app calls the backend at `http://localhost:8000` by default. To change that, create `frontend/.env` with:

```
VITE_API_BASE_URL=http://localhost:8000
```

## 3. First use

1. Open the workspace (`/workspace`).
2. Click **+** beside *Workspaces* and name one.
3. Click **Add papers** and choose one or more PDFs.
4. Ask a question, or click a suggested prompt.

## Troubleshooting

### `npm error ENOENT … backend\package.json`
You ran `npm run dev` in `backend/`. The backend is Python, not Node. Use the `uvicorn` command above. `npm run dev` belongs in `frontend/`.

### Library shows "Failed to fetch" / red error box
The backend isn't reachable. Check <http://localhost:8000/health>. If it doesn't respond, start the backend (step 1).

### Backend process exists but port 8000 is dead
Almost always the **wrong Python** (global instead of the venv). With `--reload`, a crashed import leaves the reloader running but nothing listening. Check the prompt shows `(venv)`; stop the old process with `Ctrl+C` and restart. Verify with:

```powershell
venv\Scripts\python.exe -c "import chromadb, sentence_transformers, langchain; print('ok')"
```

### Browser console: CORS error / requests blocked
`ALLOWED_ORIGINS` in `backend/.env` must include the frontend's origin. Vite serves on `http://localhost:5173`:

```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Restart the backend after editing `.env`.

### Chat returns "AI service is temporarily unavailable"
Check `GOOGLE_API_KEY` is set and valid, and that `GEMINI_MODEL` exists for your key. See the backend log for the underlying error.

### Chat returns "Daily Gemini API quota exceeded" (HTTP 429)
The free-tier quota is used up. Wait for the reset or use another key.

### Log lines: `Failed to send telemetry event … capture() takes 1 positional argument`
A known chromadb 0.5.5 telemetry bug. Harmless: it does not affect results.

### `ModuleNotFoundError: chromadb` (or similar)
Dependencies aren't installed in the Python you're using. Activate the venv and run `pip install -r requirements.txt`.

### Starting over with clean data
See [Development → Resetting local data](DEVELOPMENT.md#resetting-local-data).
