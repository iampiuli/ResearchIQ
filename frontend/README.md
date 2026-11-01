# ResearchIQ Frontend

The React single-page app for ResearchIQ: a landing page and the research workspace (paper library, grounded chat, PDF reader).

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · react-router · react-pdf · react-markdown · Base UI · Oxlint (plain JavaScript).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

The backend must be running for papers and chat to work (default `http://localhost:8000`). Override with a `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

The backend must allow this app's origin in `ALLOWED_ORIGINS` (`http://localhost:5173`).

## Where things are

```
src/
  pages/        LandingPage, WorkspacePage (all app state lives here)
  components/   layout/, sections/ (landing), workspace/ (app), shared/, ui/
  lib/          api.js (backend client), utils.js, motion.js
  index.css     Design tokens, fonts, base styles, utilities
```

Use the design tokens in `src/index.css`, never raw colors. See the [project README](../README.md) for full setup.
