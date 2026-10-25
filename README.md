# ResearchIQ

**A quiet reading room for research papers.** Upload PDFs, ask questions across them, and get answers grounded in your documents, with the source papers listed under every answer.

Built with a retrieval-augmented generation (RAG) pipeline: papers are chunked and embedded locally, the most relevant passages are retrieved, and Google Gemini writes an answer using *only* that context.

## Features

- **Multi-file PDF upload** with SHA-256 duplicate detection
- **Grounded Q&A** over one or many papers, with per-paper source citations
- **Intent-aware retrieval**: synthesis-style questions ("summarize", "compare", "research gaps") draw on *every* paper in the workspace; targeted questions use similarity search
- **Workspaces**: group papers and conversations together (stored in your browser)
- **In-app PDF reader** beside the chat
- **Calm, minimal interface**: warm paper tones, serif answers, one accent color ([design system](docs/DESIGN_SYSTEM.md))
- Semantic `/search` endpoint for inspecting raw retrieval

## Quick start

```powershell
# Backend (Python 3.11)
cd backend
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env          # then set GOOGLE_API_KEY in .env
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

You need a free [Gemini API key](https://ai.google.dev/). Full instructions and troubleshooting: **[Getting Started](docs/GETTING_STARTED.md)**.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion, react-pdf, react-router |
| Backend | FastAPI, LangChain, PyMuPDF |
| Retrieval | Sentence Transformers (`all-MiniLM-L6-v2`), ChromaDB |
| LLM | Google Gemini |

## Documentation

| Doc | What's in it |
|---|---|
| [Getting Started](docs/GETTING_STARTED.md) | Setup, first run, troubleshooting |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, key decisions |
| [API Reference](docs/API.md) | Endpoints, payloads, errors |
| [Configuration](docs/CONFIGURATION.md) | Every environment variable, retrieval tuning |
| [Frontend Guide](docs/FRONTEND.md) | Structure, state, persistence, conventions |
| [Design System](docs/DESIGN_SYSTEM.md) | Colors, typography, components, principles |
| [Development](docs/DEVELOPMENT.md) | Workflow, safe testing, scripts |
| [Deployment](docs/DEPLOYMENT.md) | Requirements and security checklist for going live |
| [Roadmap](docs/ROADMAP.md) | Known issues, limitations, next steps |
| [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [Security](SECURITY.md) | Project policies |

Component-level READMEs: [backend](backend/README.md) · [frontend](frontend/README.md).

## Project structure

```
ResearchIQ/
  backend/            FastAPI app (api/, services/, models/, utils/), scripts/
  frontend/           React app (pages/, components/, lib/)
  docs/               Project documentation
```

## Status

MVP complete (v0.1.0). Not yet deployed; single-user, no authentication. Citations currently name the source paper but not the page. See the [Roadmap](docs/ROADMAP.md) for known issues.

## License

MIT, see [LICENSE](LICENSE).
