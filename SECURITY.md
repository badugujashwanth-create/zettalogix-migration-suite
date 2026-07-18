# Security policy

## Supported status

Zettalogix Migration Suite is maintained as a portfolio project. Only frontend and desktop-shell code are present; the backend is external and was not modified or claimed as included.

The Electron renderer uses context isolation, sandboxing, no Node integration, a content security policy, and HTTPS-only external window handling. Demo mode bypasses Supabase, provider SDK loading, and migration API fetches.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature when it is enabled. Otherwise, contact the repository owner through an existing verified GitHub contact channel. Do not include secrets, access tokens, private URLs, or personal data in a public issue.

## Configuration rules

- Keep real credentials in local environment files or an external secret manager.
- Commit only placeholder values in `.env.example` files.
- Rotate any credential that was previously committed; deleting it from the current branch does not remove Git history.
- Use synthetic or public sample data for tests, screenshots, and recordings.

No response-time or production support commitment is implied.

