# Frontend Guide

React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · react-router · react-pdf · react-markdown · Base UI primitives. Plain JavaScript (JSX), no TypeScript. Linting with Oxlint.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the build
npm run lint      # oxlint
```

## Structure

```
frontend/src/
  main.jsx, App.jsx           Entry; routes "/" and "/workspace"
  index.css                   Design tokens, fonts, base styles, utilities
  pages/
    LandingPage.jsx           Marketing page (composes sections)
    WorkspacePage.jsx         The app: state, effects, handlers, three-pane layout
  layouts/                    MainLayout (landing), WorkspaceLayout (full-height app shell)
  components/
    layout/                   Navbar, Footer (landing)
    sections/                 Hero, HeroPreview, Features, HowItWorks, WorkspacePreview, cards
    workspace/                Sidebar, Topbar, ChatMessage, ChatInput, CitationChip,
                              PaperCard, PaperDetailsDialog, PDFViewer
    shared/                   Logo, Toast, Reveal, SectionBadge, icons
    ui/                       button, dropdown-menu (Base UI + class-variance-authority)
  lib/
    api.js                    fetch wrappers for the backend
    utils.js                  cn(), file-size/date formatters
    motion.js                 shared Framer Motion variants
  hooks/use-scroll-position.js
public/                       favicons, brand assets
```

Import alias: `@/` → `src/`.

## The workspace page

`WorkspacePage.jsx` owns almost all app state and passes it down as props:

- **Workspaces**: list, active id, per-workspace messages, attached paper ids, last-open paper.
- **Papers**: fetched from `GET /papers` and mapped to UI shape by `toUiPaper`. Only papers attached to the active workspace are shown.
- **Chat**: `handleSend` appends the user message, calls `POST /chat` with the workspace's `paper_ids`, and appends the reply or an error message. A ref (`activeWorkspaceIdRef`) ensures a reply that arrives after the user switched workspaces is stored on the right workspace without appearing in the wrong one.
- **Upload**: `handleFilesSelected` calls `POST /upload`, then attaches both new *and* duplicate `paper_id`s to the workspace.
- **Reader**: `activePaperId`, `activePage`, `zoom`, `highlightedPage`. Clicking a citation selects its paper and (when a page is known) jumps to and highlights it.
- **Auto-scroll** follows new messages only if the user is already near the bottom.
- **⌘/Ctrl+K** focuses the paper search.

### Responsive behavior
| Width | Layout |
|---|---|
| `≥ xl` (1280px) | Sidebar · chat · reader side by side; reader collapsible |
| `lg` (1024px) | Sidebar + chat; reader opens as a right drawer |
| `< lg` | Sidebar becomes a left drawer; reader is a right drawer |

## State and persistence

Workspaces and conversations are stored **only in the browser** (`localStorage`). Clearing site data deletes them; the PDFs and vectors remain on the server.

| Key | Contents |
|---|---|
| `researchiq.workspaces` | Array of `{ id, name, attachedPaperIds, messages, activePaperId, createdAt, updatedAt }` |
| `researchiq.activeWorkspaceId` | Last open workspace |
| `researchiq.pdfViewer.collapsed` | `"1"`/`"0"`: reader panel collapsed |
| `researchiq.sidebar.collapsed` | `"1"`/`"0"`: sidebar rail mode |
| `researchiq.sidebar.sections` | Which sidebar sections are expanded |
| `researchiq.conversations` | **Legacy.** Migrated once into workspaces, then deleted |

A message looks like `{ id, role: "user"|"assistant", content, citations?: [{ paperId, paperTitle, page? }], isError? }`.

## API client (`lib/api.js`)

Thin wrappers: `uploadPapers(files)`, `fetchPapers(signal)`, `sendChatMessage(query, paperIds)`, `fileUrlFor(storedFilename)`. Errors are normalized into `ApiError` using the backend's `message` (or FastAPI's `detail`). `paperIds` is always sent as an array; omitting it would make the backend search every paper and break workspace isolation.

## Conventions

- Style with Tailwind utilities and the **semantic tokens** in `index.css` (`bg-paper`, `text-muted-foreground`, `border-border-strong`, `text-primary`…). Don't hard-code hex colors or Tailwind palette colors (`indigo-600`, `gray-200`); see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- Use the `.focus-ring` utility for keyboard focus, `.eyebrow` for small-caps labels, `.scroll-thin` for scroll areas.
- Wrap `localStorage` access in `try/catch` (private mode, quota).
- Keep presentational components prop-driven; keep side effects in `WorkspacePage`.
