# Deployment

> **Status: not currently configured.** The repository contains no deploy configuration (no Dockerfile, `render.yaml`, `vercel.json` or CI). Earlier deploy attempts were reverted (`Revert deploy changes back to final done state`). This document records what's required and what was learned, so a future deploy starts informed.

## What needs to run

| Part | Needs |
|---|---|
| **Frontend** | Any static host (Vercel, Netlify, Cloudflare Pages, S3+CDN). `npm run build` → serve `frontend/dist/`. SPA fallback so `/workspace` serves `index.html`. |
| **Backend** | A long-running Python 3.11 process (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`) with **persistent disk**. Not suitable for serverless functions. |

## Backend requirements

1. **Persistent storage** for `UPLOAD_DIR` and `CHROMA_PERSIST_DIR`. Without a persistent volume, papers and vectors vanish on every restart.
2. **Memory.** PyTorch + the embedding model need roughly 1–2 GB RAM. The git history shows a `utils/memory.py` helper and embedding-service changes were added in the "production fix" commit and later reverted, which suggests memory pressure was a concern during the earlier deploy attempt (the reason isn't recorded). Plan for a host with at least 2 GB, or switch to a hosted embedding API.
3. **Disk.** The installed environment is ~1.4 GB; use CPU-only PyTorch wheels to reduce it.
4. **Python 3.11.** Earlier attempts added `runtime.txt` / `.python-version` set to `3.11.11`.
5. **Environment variables**: at minimum `GOOGLE_API_KEY`, `ALLOWED_ORIGINS` (your frontend's production URL), `APP_ENV=production`, `DEBUG=false`. See [CONFIGURATION.md](CONFIGURATION.md).
6. **Start command** from `backend/`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (no `--reload`).
7. **Single instance.** Local file storage and an embedded Chroma store don't support multiple replicas.

## Frontend requirements

- Set `VITE_API_BASE_URL` to the backend's public URL **at build time**.
- Serve over HTTPS; if the frontend is HTTPS, the backend must be too (mixed content is blocked).

## Before going public: security checklist

The app was built as a single-user local tool and has **no authentication**. Exposing it publicly as-is means:

- [ ] Anyone can upload files, query, and consume your Gemini quota → add auth and rate limiting.
- [ ] `/files/<uuid>.pdf` serves PDFs without authentication → restrict or sign URLs.
- [ ] All papers share one pool; `/search` and unscoped `/chat` search *every* paper → add per-user scoping.
- [ ] CORS is an allow-list from env: set it to production origins only.
- [ ] Retrieved text is sent to Google Gemini → disclose this to users; consider data-handling requirements for confidential papers.
- [ ] Set `DEBUG=false`.

See also [SECURITY.md](../SECURITY.md).

## Suggested approach

1. Containerize the backend (CPU-only torch), mount a volume for uploads + Chroma.
2. Host the backend on a service with persistent disks and ≥2 GB RAM; host the frontend on a static host.
3. Add a `/health`-based health check.
4. Add auth, then move paper metadata and workspaces into a real database (see [Roadmap](ROADMAP.md)).
