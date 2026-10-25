# Architecture

ResearchIQ is a retrieval-augmented generation (RAG) app: a React single-page app talks to a FastAPI backend that indexes PDFs in a local vector store and asks Google Gemini to answer from the retrieved passages.

```
┌────────────────────────┐        HTTP/JSON        ┌───────────────────────────────┐
│  React SPA (Vite)      │ ──────────────────────▶ │  FastAPI backend              │
│  • landing page        │   /upload /papers       │  api/      thin routers       │
│  • workspace UI        │   /chat /search         │  services/ business logic     │
│  • PDF reader          │ ◀────────────────────── │  utils/    config, errors     │
│  localStorage:         │   /files/{uuid}.pdf     └──────┬───────────┬────────────┘
│   workspaces + chats   │                                │           │
└────────────────────────┘                  ┌─────────────▼──┐   ┌────▼─────────────┐
                                            │ ChromaDB       │   │ Google Gemini    │
                                            │ (local, on     │   │ (LLM, via        │
                                            │  disk, cosine) │   │  LangChain)      │
                                            └────────────────┘   └──────────────────┘
                                            ┌────────────────┐
                                            │ app/uploads/   │  PDFs + JSON sidecars
                                            └────────────────┘
```

## Data flow

### Upload (`POST /upload`)
For each file, independently (one failure doesn't abort the batch):

1. **Validate**: content type `application/pdf`, `.pdf` extension, non-empty, under `MAX_UPLOAD_SIZE_MB`.
2. **Deduplicate**: SHA-256 of the bytes is compared against hashes in existing JSON sidecars. A match returns the existing `paper_id` and skips all processing.
3. **Save** the PDF as `app/uploads/<uuid>.pdf`.
4. **Extract text** with PyMuPDF (`pdf_service`).
5. **Chunk** with LangChain `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap).
6. **Embed** each chunk with Sentence Transformers (`all-MiniLM-L6-v2`, 384 dimensions).
7. **Store** chunks, vectors and metadata in the ChromaDB collection (cosine space).
8. **Write a JSON sidecar** `<uuid>.json` with the paper's metadata and file hash.

### Chat (`POST /chat`)
1. **Classify intent** (`intent_service`): a keyword/regex check labels the query *factual* or *synthesis*. No LLM call.
2. **Retrieve** (`retrieval_service`):
   - *Factual*: one global top-k (5) similarity search, filtered to the request's `paper_ids`, keeping chunks scoring ≥ `MIN_SIMILARITY_THRESHOLD` (default 0.45).
   - *Synthesis* (summarize, compare, gaps, datasets…) **and** `paper_ids` given: query **each paper separately** for its best `SYNTHESIS_CHUNKS_PER_PAPER` chunks, with no similarity floor. This guarantees every paper in the workspace is represented, since "summarize these" never closely matches any single passage. Chunks per paper shrink to respect `SYNTHESIS_MAX_TOTAL_CHUNKS`.
3. **Generate** (`llm_service`): build a prompt (factual: flat context; synthesis: context grouped by paper) with instructions to use *only* the supplied context, then call Gemini.
4. **Respond** with the answer and a de-duplicated list of source papers.

If retrieval returns nothing, the API answers *"I couldn't find relevant information in the uploaded papers."* without calling Gemini.

## Backend layout

```
backend/app/
  main.py            App assembly: CORS, error handlers, routers, /files static mount, /health
  api/               HTTP layer (thin): upload.py, chat.py, papers.py, search.py
  services/          pdf, chunk, embedding, chroma, retrieval, intent, llm
  models/schemas.py  Pydantic request/response models
  utils/             config.py (env → Settings), exceptions.py, logger.py
  uploads/           PDFs + JSON sidecars (gitignored)
  database/          ChromaDB persisted store (gitignored)
backend/scripts/     reset_dev.py, backfill_original_filenames.py
```

Services are singletons created at import time, but heavy resources (embedding model, Chroma client, Gemini client) are **loaded lazily on first use**, keeping startup fast.

### Error handling
Services raise `ResearchIQException` subclasses; `main.py` converts them to `{"error": "<ClassName>", "message": "<text>"}` with the right status code. Anything else becomes a generic 500. See [API → Errors](API.md#errors).

## Persistence model

| Data | Where | Notes |
|---|---|---|
| PDFs | `backend/app/uploads/<uuid>.pdf` | Served read-only at `/files/<uuid>.pdf` |
| Paper metadata | `backend/app/uploads/<uuid>.json` | Includes `file_hash` for dedup. `GET /papers` reads these. |
| Vectors + chunk text | ChromaDB at `app/database/chroma_store` | Single collection (`researchiq`), metadata carries `paper_id` |
| Workspaces, attached papers, chat history | **Browser `localStorage`** | Not on the server; see [Frontend](FRONTEND.md#state-and-persistence) |

There is **no relational database and no user accounts**. All papers live in one shared pool; a workspace is a client-side list of `paper_id`s, and isolation is enforced by sending `paper_ids` with each chat request.

## Frontend overview

React 19 + Vite + Tailwind v4. Two routes: `/` (landing) and `/workspace` (the app). The workspace is a three-pane layout (sidebar · chat · PDF reader). Details in [FRONTEND.md](FRONTEND.md); visual language in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Key design decisions

- **Keyword intent classifier instead of an LLM router.** The set of "synthesis" requests is small and well known, so regex is instant, free and explainable.
- **Per-paper retrieval for synthesis.** A single global top-k can be dominated by one paper and silently omit others. Querying each paper guarantees coverage.
- **Server-side `where` filter for workspace scoping.** Filtering inside Chroma, rather than post-filtering results, avoids losing true matches to out-of-scope chunks.
- **JSON sidecars instead of a database.** Simple for an MVP; limits are listed in the [Roadmap](ROADMAP.md).
- **Workspaces client-side.** No auth needed yet, at the cost of no sync across devices.
