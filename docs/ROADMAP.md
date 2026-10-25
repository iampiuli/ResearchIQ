# Roadmap, Known Issues and Limitations

Honest status of the project as of **October 2026** (version 0.1.0, MVP complete, UI redesigned).

## Known issues

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| 1 | **Papers uploaded before page tracking have no page numbers.** New uploads are indexed per page and cite the page; older papers cite the paper only. | Older papers don't jump to a page | Re-upload them (or run `scripts/reset_dev.py` and upload again). |
| 2 | **Dead in-memory stores.** `chunk_service.store_chunks` and `embedding_service.embed_and_store` keep every paper's chunks/embeddings in process memory, but nothing reads them (`get_chunks`/`get_embeddings` are unused). | Memory grows with each upload until restart | Remove the in-memory dictionaries. |
| 3 | **Chroma telemetry error spam** (`capture() takes 1 positional argument`) in logs. | Noise only | Upgrade chromadb or pin a compatible `posthog`. |
| 4 | `backend/server.log` is committed to git. | Repo clutter, may leak local info | `git rm --cached` and add to `.gitignore`. |
| 5 | `python-dotenv` default `ALLOWED_ORIGINS` is `http://localhost:3000`, not Vite's 5173. | Fresh setups hit CORS errors unless `.env` is created | Change the code default to include 5173. |
| 6 | Deprecated FastAPI `@app.on_event` handlers. | Deprecation warnings | Migrate to lifespan handlers. |
| 7 | Intent classification is keyword-based. | Unusual phrasings of synthesis questions get factual retrieval | Extend patterns, or add an LLM fallback. |
| 8 | Sidebar **Settings** button is a placeholder. | None | Implement or remove. |
| 9 | Landing PNG favicons and `public/brand/*` still show the old violet identity. | Brand inconsistency | Regenerate from the new mark. |
| 10 | `/papers` returns **every** paper on the server; workspace filtering is client-side. | Fine single-user; a leak in multi-user | Server-side ownership (needs auth). |

## Limitations (by design, for now)

- **No authentication or user accounts.** Single-user local tool.
- **Workspaces and chats live in browser `localStorage`**: no sync across devices; clearing site data loses them.
- **No relational database.** Metadata is JSON sidecar files; no search/sort beyond upload time.
- **Text-only PDFs.** Text is extracted with PyMuPDF; scanned PDFs (no text layer) produce no usable content, and there's no OCR. Figures and tables aren't understood.
- **Single shared Chroma collection**, single instance. No horizontal scaling.
- **No deleting a paper from the server.** "Remove from workspace" only detaches it client-side; the PDF and vectors remain.
- **Gemini free-tier limits** apply (quota errors surface as HTTP 429).

## Next steps (suggested priority)

1. ~~Page-level citations~~: done for new uploads (see [CHANGELOG](../CHANGELOG.md)).
2. **Automated tests**: backend API tests and CI are in place; frontend component tests are still missing.
3. **Cleanup** (issues 2–6): small, low-risk wins.
4. **Real deletion**: `DELETE /papers/{id}` removing the PDF, sidecar and vectors.
5. **Auth + database**: users, server-side workspaces, per-user paper ownership. Unblocks safe deployment.
6. **Deployment**: containerize and ship (see [DEPLOYMENT.md](DEPLOYMENT.md)).
7. **Features hinted at on the landing page**: export a literature review / citation list; richer paper metadata (title, authors, year) via `pdf_service.extract_metadata` (currently a stub); full-text search across papers.
8. **Dark "night reading" theme.**
9. **Streaming answers** for a more responsive chat.
