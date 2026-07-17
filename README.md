# Zettalogix Migration Suite Frontend

> **Status: prototype** — the operator UI builds successfully. This repository does not contain or claim the external migration backend.

[![Watch the Zettalogix Migration Suite demo](docs/demo/demo-thumbnail.png)](docs/demo/demo.webm)

> Watch the verified public frontend overview. The external backend is outside this repository and was not modified.

[Live frontend](https://sharepoint-one.vercel.app) · [Synthetic demo](https://sharepoint-one.vercel.app/login?demo=1) · [Architecture](docs/ARCHITECTURE.md) · [Test evidence](docs/TEST_REPORT.md) · [Interview guide](docs/INTERVIEW_GUIDE.md)

This repository contains the React/Vite operator UI and Electron shell for Zettalogix Migration Suite. The frontend calls the backend through `VITE_API_BASE_URL`; it does not store or execute backend secrets.

## Recruiter-safe synthetic demo

Choose **Explore the synthetic demo** on the login screen (or use the link above) to inspect the dashboard, search, connections, job creation, start/pause transitions, job history, settings, and CSV export without an account. Demo mode:

- uses clearly fictional, deterministic records;
- stores the mode only in the browser session;
- makes no Supabase, migration API, SharePoint, or Google Drive requests; and
- does not imply that the external migration worker is part of this repository.

## Repository contents

- `ZMS.WebUI`: React/Vite operator UI.
- `ZMS.DesktopApp`: Electron shell for loading the web UI.
- `docs/demo`: verified walkthrough, captions, script, and recording guidance.

The backend API and migration worker are referenced at `https://github.com/machander-byte/sharepoint_backend.git`. That repository is not present locally and was not modified or verified in this audit.

## Local setup

For the synthetic demo, only the frontend is required:

```powershell
Set-Location "sharepoint\ZMS.WebUI"
npm install
npm run dev
```

Open `http://localhost:5173/login?demo=1` and choose **Explore the synthetic demo**.

For authenticated/live operation, copy `.env.example` to `.env`, configure the browser-safe Supabase and API values, and start the external backend (typically at `http://localhost:5206`).

## Frontend environment

`ZMS.WebUI/.env` must contain browser-safe values only. Do not add SharePoint client secrets, Google client secrets or refresh tokens, database connection strings, or Data Protection paths.

## Deployment

The existing frontend is deployed on Vercel. A static Render configuration is also present in `render.yaml`. Since Vite bakes environment variables at build time, redeploy after changing `VITE_API_BASE_URL`.

See [the test report](docs/TEST_REPORT.md), [architecture](docs/ARCHITECTURE.md), and [demo script](docs/demo/DEMO_SCRIPT.md) for evidence and limitations.

## License status

No license file is currently present. All rights remain with the copyright holder unless a license is added manually.
