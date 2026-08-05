# ResearchIQ Backend

Backend API for ResearchIQ — a RAG-powered research paper assistant.

## Tech Stack

- **FastAPI** — web framework
- **LangChain** — LLM/RAG orchestration
- **ChromaDB** — vector database
- **PyMuPDF** — PDF text extraction
- **Sentence Transformers** — embeddings (`all-MiniLM-L6-v2` by default)
- **Google Gemini** — LLM (via `langchain-google-genai`)
- **python-dotenv** — environment configuration

## Project Structure

```
backend/
  app/
    main.py              # FastAPI app assembly: CORS, logging, error handlers, routers, static file serving
    api/                  # HTTP route definitions (thin controllers)
      upload.py            # POST /upload — validate, dedup, extract, chunk, embed, store
      chat.py               # POST /chat — intent classification -> retrieval -> Gemini answer
      papers.py              # GET /papers — list uploaded papers
      search.py                # POST /search — raw vector search, no LLM (debugging aid)
    services/              # Business logic, framework-agnostic
      pdf_service.py         # PyMuPDF text extraction
      chunk_service.py        # LangChain text splitting + chunk storage
      embedding_service.py      # Sentence Transformers embedding
      chroma_service.py          # ChromaDB collection add/query wrapper
      retrieval_service.py        # Similarity search (global top-k and per-paper representative)
      intent_service.py            # Keyword-based factual vs. synthesis query classification
      llm_service.py                 # Gemini prompt construction + generation
    database/
      chroma_store/                    # Persisted ChromaDB collection (gitignored)
    models/
      schemas.py                        # Pydantic request/response models
    utils/
      config.py                          # Environment-driven settings
      logger.py                           # Logging setup
      exceptions.py                         # Custom exceptions + global handlers
    uploads/                                # Uploaded PDF storage + JSON sidecars (gitignored)
  .env
  requirements.txt
```

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `GOOGLE_API_KEY` to a valid [Gemini API key](https://ai.google.dev/).

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs.

## Endpoints

| Method | Path                | Description                                                        |
|--------|---------------------|----------------------------------------------------------------------|
| GET    | `/health`           | Liveness check                                                       |
| POST   | `/upload`           | Upload one or more PDFs — deduped by SHA-256, extracted, chunked, embedded, and stored in ChromaDB |
| GET    | `/papers`           | List uploaded papers (read from JSON sidecars in `app/uploads/`)      |
| POST   | `/chat`             | Ask a question; classifies intent, retrieves relevant chunks, and generates a grounded answer with per-paper sources via Gemini |
| POST   | `/search`           | Raw semantic search (top 5 chunks) with no LLM step — retrieval debugging aid |
| GET    | `/files/{filename}` | Serves an uploaded PDF by its stored (UUID-based) filename            |

### Retrieval strategy

`chat` classifies each query as **factual** or **synthesis** (`intent_service.py`, keyword-based — no extra LLM round-trip):

- **Factual** queries use `retrieve_relevant_chunks`: a single global top-k similarity search gated by `MIN_SIMILARITY_THRESHOLD`.
- **Synthesis** queries (e.g. "summarize", "compare", "research gaps") use `retrieve_representative_chunks`: a bounded number of chunks pulled independently from *every* paper attached to the request, so no single paper is silently excluded from a cross-document answer. This path only applies when the request scopes `paper_ids` to a workspace; otherwise it falls back to standard retrieval.

There is no relational database yet — per-paper metadata (original filename, upload time, chunk/embedding counts, file hash for dedup) is persisted as a JSON sidecar next to each uploaded PDF in `app/uploads/`.

## Key environment variables

See `.env.example` for the full list. Notable ones:

| Variable | Purpose |
|---|---|
| `GOOGLE_API_KEY` | Required for `/chat` — Gemini generation |
| `GEMINI_MODEL` | Gemini model name (default `gemini-flash-latest`) |
| `EMBEDDING_MODEL_NAME` | Sentence Transformers model (default `all-MiniLM-L6-v2`) |
| `MIN_SIMILARITY_THRESHOLD` | Minimum cosine similarity for factual retrieval to keep a chunk |
| `SYNTHESIS_CHUNKS_PER_PAPER` / `SYNTHESIS_MAX_TOTAL_CHUNKS` | Bounds on per-paper representative retrieval |
| `MAX_UPLOAD_SIZE_MB` | Upload size limit per file |
