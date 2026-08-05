# ResearchIQ

A RAG-powered research paper assistant. Upload PDFs, and ask questions across them — ResearchIQ retrieves the relevant passages and generates grounded answers with citations back to source papers.

## Features

- **Multi-file PDF upload** with SHA-256 based duplicate detection
- **Retrieval-augmented Q&A** over one or many papers, with per-paper source citations
- **Intent-aware retrieval** — synthesis-style queries ("summarize", "compare") pull representative context from every attached paper; targeted queries use standard top-k similarity search
- **Workspaces** — group papers and conversations together, persisted client-side
- **In-app PDF viewer** alongside the chat panel
- **Semantic search** endpoint for direct chunk-level retrieval

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Framer Motion, react-pdf, react-router-dom

**Backend** — FastAPI, LangChain, ChromaDB (vector store), PyMuPDF (PDF text extraction), Sentence Transformers (embeddings), Google Gemini (LLM)

## Project Structure

```
ResearchIQ/
  backend/
    app/
      api/         # upload, chat, papers, search routers
      services/     # pdf, chunking, embeddings, retrieval, intent classification, LLM
      database/      # ChromaDB client wrapper + persisted store
      models/          # Pydantic schemas
      utils/            # config, logging, exceptions
    requirements.txt
  frontend/
    src/
      pages/        # LandingPage, WorkspacePage
      components/    # workspace UI (chat, PDF viewer, sidebar), landing sections
      lib/            # API client, utils
    package.json
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://ai.google.dev/)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `GOOGLE_API_KEY` to your Gemini key.

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app expects the backend at `http://localhost:8000` by default — set `VITE_API_BASE_URL` in a `.env` file under `frontend/` to override.

## API Overview

| Method | Path      | Description                                             |
|--------|-----------|----------------------------------------------------------|
| GET    | `/health` | Liveness check                                           |
| POST   | `/upload` | Upload one or more PDFs (dedup, extract, chunk, embed)   |
| GET    | `/papers` | List uploaded papers                                     |
| POST   | `/chat`   | Ask a question; returns a grounded answer with sources    |
| POST   | `/search` | Direct semantic search over chunks (no LLM generation)     |
| GET    | `/files/{filename}` | Serve an uploaded PDF                             |

## License

MIT — see [LICENSE](LICENSE).
