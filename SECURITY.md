# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Contact the maintainer privately (via the email on their GitHub profile, <https://github.com/iampiuli>) with a description and reproduction steps. Expect an acknowledgement; there's no formal SLA for this hobby/MVP project.

## Current security posture

ResearchIQ is a **single-user local tool** and is *not yet hardened for public deployment*:

| Area | Status |
|---|---|
| Authentication / authorization | **None.** All endpoints are open |
| File access | `/files/<uuid>.pdf` is served unauthenticated (UUID names are unguessable but not secret) |
| Data isolation | All papers share one pool; `/search` and unscoped `/chat` query everything |
| Uploads | Type (`application/pdf` + `.pdf`) and size (`MAX_UPLOAD_SIZE_MB`) are checked; contents are parsed by PyMuPDF. Treat uploads from untrusted users as hostile |
| Rate limiting | None, so a public instance could exhaust your Gemini quota |
| CORS | Allow-list from `ALLOWED_ORIGINS` |
| Secrets | `GOOGLE_API_KEY` in `backend/.env` (gitignored) |
| Third-party data flow | Retrieved passages from your papers are sent to Google Gemini |

Don't expose the backend to the internet before working through the checklist in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#before-going-public-security-checklist).

## Handling secrets

- Never commit `.env` or API keys. If a key leaks, revoke it at <https://ai.google.dev/> and create a new one.
- Use environment variables or your host's secret store in production.

## Dependencies

Backend dependencies are version-pinned in `backend/requirements.txt`; frontend in `package-lock.json`. Run `npm audit` and review Python advisories periodically; pinned versions will not update themselves.
