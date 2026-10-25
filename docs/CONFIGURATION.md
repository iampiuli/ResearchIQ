# Configuration

## Backend: `backend/.env`

Loaded by `python-dotenv` at startup (`app/utils/config.py`). Start from `.env.example`. **Restart the server after changes.** Real environment variables take precedence over `.env`.

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `ResearchIQ` | Shown in `/health` and docs |
| `APP_ENV` | `development` | `reset_dev.py` refuses to run unless this is `development` |
| `DEBUG` | `true` | FastAPI debug mode |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Informational; the port actually used comes from the `uvicorn --port` flag |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins. **Must include your frontend origin** (`http://localhost:5173` for Vite). The code default does not. |
| `UPLOAD_DIR` | `app/uploads` | PDF + sidecar storage; also the root of `/files` |
| `MAX_UPLOAD_SIZE_MB` | `50` | Per-file limit |
| `GOOGLE_API_KEY` | *(empty)* | **Required for `/chat`**. Never commit |
| `GEMINI_MODEL` | `gemini-flash-latest` | Model name passed to LangChain |
| `CHROMA_PERSIST_DIR` | `app/database/chroma_store` | Vector store location |
| `CHROMA_COLLECTION_NAME` | `researchiq` | Single collection for all papers |
| `EMBEDDING_MODEL_NAME` | `all-MiniLM-L6-v2` | Sentence Transformers model. Changing it after indexing makes old vectors incompatible; re-index everything |
| `MIN_SIMILARITY_THRESHOLD` | `0.45` | Minimum cosine similarity for factual retrieval. Raise for stricter, lower for more recall |
| `SYNTHESIS_CHUNKS_PER_PAPER` | `3` | Target chunks pulled from each paper for synthesis queries |
| `SYNTHESIS_MAX_TOTAL_CHUNKS` | `20` | Cap on total chunks in a synthesis prompt; per-paper count shrinks (min 1) to fit |
| `LOG_LEVEL` | `INFO` | Python logging level |

Relative paths (`app/uploads`, `app/database/chroma_store`) resolve against the **current working directory**, so start the server from `backend/`.

Optional: `ANONYMIZED_TELEMETRY` is set to `False` by the code before Chroma loads.

## Frontend: `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend base URL. Vite inlines this at build time, so rebuild after changing it for a production build |

## Tuning retrieval

| Symptom | Try |
|---|---|
| Factual questions say "couldn't find relevant information" | Lower `MIN_SIMILARITY_THRESHOLD` (e.g. `0.35`) |
| Irrelevant passages appear in answers | Raise `MIN_SIMILARITY_THRESHOLD` |
| Cross-paper answers feel thin | Raise `SYNTHESIS_CHUNKS_PER_PAPER` (and `SYNTHESIS_MAX_TOTAL_CHUNKS` for large workspaces) |
| Prompts too large / slow for big workspaces | Lower `SYNTHESIS_MAX_TOTAL_CHUNKS` |

Chunk size (1000) and overlap (200) are defaults in `chunk_service.split_text`; changing them requires re-uploading papers.
