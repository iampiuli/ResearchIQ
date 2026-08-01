# ResearchIQ Backend

Backend API for ResearchIQ — a RAG-powered research paper assistant.

> **Status:** Architecture scaffold only. RAG, embeddings, ChromaDB, and
> Gemini are **not** implemented yet — all service methods currently raise
> `NotImplementedError` and API endpoints return stub responses.

## Tech Stack

- **FastAPI** — web framework
- **LangChain** — LLM/RAG orchestration
- **ChromaDB** — vector database
- **PyMuPDF** — PDF text extraction
- **Sentence Transformers** — embeddings
- **Google Gemini** — LLM
- **python-dotenv** — environment configuration

## Project Structure

```
backend/
  app/
    main.py              # FastAPI app assembly: CORS, logging, error handlers, routers
    api/                  # HTTP route definitions (thin controllers)
      upload.py
      chat.py
      papers.py
    services/              # Business logic, framework-agnostic
      pdf_service.py
      chunk_service.py
      embedding_service.py
      retrieval_service.py
      llm_service.py
    database/
      chroma_db.py         # ChromaDB client wrapper
    models/
      schemas.py            # Pydantic request/response models
    utils/
      config.py             # Environment-driven settings
      logger.py              # Logging setup
      exceptions.py           # Custom exceptions + global handlers
    uploads/                  # Uploaded PDF storage (gitignored)
  .env
  requirements.txt
```

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in secrets (e.g. `GOOGLE_API_KEY`) once
Gemini integration is implemented.

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs.

## Endpoints (current — placeholders)

| Method | Path      | Description                          |
|--------|-----------|---------------------------------------|
| GET    | `/health` | Liveness check                        |
| POST   | `/upload` | Upload a paper (not yet processed)    |
| GET    | `/papers` | List uploaded papers (returns empty)  |
| POST   | `/chat`   | Ask a question (returns stub answer)  |

## Roadmap (not yet implemented)

1. Wire `pdf_service` to extract text from uploads via PyMuPDF.
2. Wire `chunk_service` to split text via LangChain text splitters.
3. Wire `embedding_service` to embed chunks via Sentence Transformers.
4. Wire `database/chroma_db.py` to persist/query embeddings in ChromaDB.
5. Wire `retrieval_service` to perform similarity search.
6. Wire `llm_service` to call Google Gemini via LangChain for grounded answers.
7. Connect all of the above end-to-end in the `/upload` and `/chat` routers.
