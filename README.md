# ResearchIQ

**A quiet reading room for research papers.** Upload PDFs, ask questions across them, and get answers grounded in your documents, with page-level citations under every answer.

Papers are chunked and embedded locally, the most relevant passages are retrieved, and Google Gemini answers using only that context.

## Features

- Multi-file PDF upload with duplicate detection
- Grounded Q&A over one or many papers, with citations that open the cited page in the built-in reader
- Synthesis questions ("summarize", "compare", "research gaps") draw on every paper in the workspace; targeted questions use similarity search
- Workspaces to group papers and conversations
- Private accounts via Clerk: papers and chats belong to their owner

## Getting started

**Prerequisites:** Python 3.11, Node 20+, a [Gemini API key](https://ai.google.dev/) and a free [Clerk](https://clerk.com) application.

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # set GOOGLE_API_KEY, CLERK_JWKS_URL, CLERK_ISSUER
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local     # set VITE_CLERK_PUBLISHABLE_KEY
npm run dev                    # http://localhost:5173
```

Interactive API docs are at `http://localhost:8000/docs`.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | backend | Gemini key used for answers |
| `CLERK_JWKS_URL`, `CLERK_ISSUER` | backend | Verify Clerk session tokens |
| `ALLOWED_ORIGINS` | backend | Comma-separated frontend origins (CORS) |
| `MAX_UPLOAD_SIZE_MB` | backend | Per-file upload limit (default 50) |
| `VITE_CLERK_PUBLISHABLE_KEY` | frontend | Clerk publishable key |
| `VITE_API_BASE_URL` | frontend | Backend URL (default `http://localhost:8000`) |

See [backend/.env.example](backend/.env.example) for the full list.

## Tests

```bash
cd backend && pip install -r requirements-dev.txt && pytest
cd frontend && npm run lint && npm run build
```

Backend tests use temporary storage, fake embeddings and a stubbed Gemini, so they need no network or API key.

## Tech stack

React 19, Vite, Tailwind CSS v4 · FastAPI, LangChain, PyMuPDF · Sentence Transformers (`all-MiniLM-L6-v2`), ChromaDB · Google Gemini · Clerk

## Deployment

The backend ships as a Docker image ([render.yaml](render.yaml)) and the frontend deploys to Vercel ([frontend/vercel.json](frontend/vercel.json)). The backend keeps files and the vector store on local disk, so run a single instance with a persistent volume.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md). Release notes: [CHANGELOG.md](CHANGELOG.md).

## License

MIT, see [LICENSE](LICENSE).
