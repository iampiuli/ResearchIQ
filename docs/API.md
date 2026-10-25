# API Reference

Base URL (local): `http://localhost:8000`. Interactive Swagger UI: `/docs`; ReDoc: `/redoc`. There is **no authentication**.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/upload` | Upload one or more PDFs |
| GET | `/papers` | List uploaded papers |
| DELETE | `/papers/{id}` | Permanently delete a paper |
| POST | `/chat` | Ask a question; get a grounded answer |
| POST | `/search` | Raw semantic search (no LLM) |
| GET | `/files/{filename}` | Download/view a stored PDF |

---

### `GET /health`

```json
{ "status": "ok", "app_name": "ResearchIQ", "version": "0.1.0" }
```

Does not verify Chroma or Gemini connectivity.

---

### `POST /upload`

`multipart/form-data` with one or more parts named **`files`**. Returns **201**.

```bash
curl -F "files=@paper1.pdf" -F "files=@paper2.pdf" http://localhost:8000/upload
```

Response:

```json
{
  "uploaded": [{
    "paper_id": "95181f81-…",
    "filename": "paper1.pdf",
    "status": "success",
    "page_count": 12,
    "character_count": 48210,
    "chunk_count": 61,
    "embedding_count": 61,
    "embedding_dimension": 384,
    "vector_count": 61
  }],
  "duplicates": [{ "filename": "paper2.pdf", "status": "already_uploaded", "paper_id": "ab12…" }],
  "failed":     [{ "filename": "notes.txt", "reason": "Unsupported file type 'text/plain'. Only PDF files are accepted." }],
  "summary": { "total_files": 3, "uploaded": 1, "duplicates": 1, "failed": 1 }
}
```

- Files are processed independently; failures land in `failed` and don't abort the batch.
- A **duplicate** (identical bytes, by SHA-256) is not re-indexed; its existing `paper_id` is returned so the client can attach it.
- Limits: PDFs only, non-empty, ≤ `MAX_UPLOAD_SIZE_MB` (default 50).
- Request-level problems (no files) return an [error](#errors); per-file problems are reported in `failed`.

---

### `GET /papers`

Returns every PDF in the uploads folder, newest first.

```json
[{
  "id": "95181f81-…",
  "filename": "95181f81-….pdf",
  "original_filename": "paper1.pdf",
  "size": 1196,
  "uploaded_at": "2026-10-24T21:02:20.082514+00:00",
  "status": "uploaded",
  "page_count": 1
}]
```

`filename` is the stored UUID name (use it in `/files/…`); `original_filename` is what the user uploaded.

---

### `DELETE /papers/{id}`

Permanently deletes a paper: its vectors in ChromaDB, its PDF and its metadata sidecar. Returns `204 No Content`.

- `404` (`PaperNotFoundError`) if the id isn't a UUID or matches no paper.
- Vectors are removed first, so a failure there leaves the paper fully intact and the call can be retried.
- Uploading the same file afterwards indexes it fresh (it is no longer treated as a duplicate).
- Workspaces live in the browser, so the frontend removes the id from every workspace itself.

---

### `POST /chat`

```json
{
  "query": "How accurate were temperature anomalies at predicting bleaching?",
  "paper_ids": ["95181f81-…"]
}
```

| Field | Type | Notes |
|---|---|---|
| `query` | string | Required |
| `paper_ids` | string[] \| null | Restricts retrieval to these papers. `null`/omitted searches **all** papers. `[]` retrieves nothing. Synthesis-style retrieval only applies when this is non-empty. |

Response:

```json
{
  "query": "…",
  "answer": "Based on the provided context, … 87 percent accuracy.",
  "sources": [{
    "filename": "95181f81-….pdf",
    "original_filename": "sample.pdf",
    "paper_id": "95181f81-…"
  }]
}
```

- `sources` lists each contributing paper once, in retrieval order.
- **Sources do not include page numbers** (only a total `page_count` is stored per paper). See [Roadmap](ROADMAP.md).
- If nothing relevant is found: `answer` is *"I couldn't find relevant information in the uploaded papers."* and `sources` is `[]`.

---

### `POST /search`

```json
{ "query": "masked language modeling" }
```

Returns the top 5 chunks across the whole collection (no `paper_ids` scoping, no LLM). Intended as a retrieval debugging aid.

```json
{
  "query": "…",
  "results": [{
    "chunk_text": "…",
    "filename": "95181f81-….pdf",
    "chunk_id": "95181f81-…_3",
    "similarity_score": 0.71,
    "paper_id": "95181f81-…"
  }]
}
```

Chunks below `MIN_SIMILARITY_THRESHOLD` are dropped, so the list may be shorter than 5.

---

### `GET /files/{filename}`

Static, read-only file server over the uploads folder (e.g. `/files/95181f81-….pdf`). Used by the PDF reader. **Unauthenticated**: anyone who can reach the server and knows a filename can fetch it.

## Errors

Application errors return:

```json
{ "error": "UnsupportedFileTypeError", "message": "Only PDF files are accepted." }
```

| Status | `error` | When |
|---|---|---|
| 400 | `InvalidFileError`, `PDFProcessingError`, base `ResearchIQException` | Missing/empty file; unreadable PDF |
| 413 | `FileTooLargeError` | File exceeds `MAX_UPLOAD_SIZE_MB` |
| 415 | `UnsupportedFileTypeError` | Not a PDF |
| 422 | (FastAPI default) | Request body fails validation. Shape is `{"detail": …}` |
| 429 | `QuotaExceededError` | Gemini quota exhausted |
| 503 | `LLMError` | Gemini unavailable / other LLM failure |
| 500 | `InternalServerError` | Unhandled exception |

Note that 422 uses FastAPI's own `{"detail": …}` shape; the frontend's `lib/api.js` handles both shapes.
