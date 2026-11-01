# Security Policy

## Reporting a vulnerability

Please don't open a public issue for security problems. Contact the maintainer privately through the email on their GitHub profile, <https://github.com/iampiuli>, with a description and reproduction steps.

## Security overview

| Area | Status |
|---|---|
| Authentication | Every API route requires a valid Clerk session token |
| Data isolation | Papers, search, chat and PDF downloads are scoped to the owning user |
| Uploads | Type (`application/pdf`) and size (`MAX_UPLOAD_SIZE_MB`) are checked; contents are parsed by PyMuPDF |
| Rate limiting | None, so a public instance could exhaust your Gemini quota |
| CORS | Allow-list from `ALLOWED_ORIGINS` |
| Third-party data flow | Retrieved passages from papers are sent to Google Gemini |

## Handling secrets

- Never commit `.env` files or API keys. If a key leaks, revoke it and create a new one.
- Use environment variables or your host's secret store in production.
