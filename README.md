# Zettalogix Migration Suite

> **Status: v0.3.0** — a verified React/Electron migration-control prototype with a network-free synthetic workflow. The migration API and worker are external and are not contained or claimed here.

[![Watch the 5:40 Zettalogix walkthrough](docs/demo/demo-thumbnail.png)](https://jashwanth-portfolio-ten.vercel.app/work/zettalogix-migration-suite/)

[Open MP4](https://jashwanth-portfolio-ten.vercel.app/media/zettalogix/demo.mp4) · [Download WebM](https://jashwanth-portfolio-ten.vercel.app/media/zettalogix/demo.webm) · [Captions](https://jashwanth-portfolio-ten.vercel.app/media/zettalogix/demo-captions.vtt)

[Live v0.3 frontend](https://sharepoint-one.vercel.app) · [Synthetic demo](https://sharepoint-one.vercel.app/dashboard?demo=1) · [Architecture](docs/ARCHITECTURE.md) · [Test evidence](docs/TEST_REPORT.md) · [Maturity gaps](docs/MATURITY_GAP_MATRIX.md)

Zettalogix gives migration operators one client surface for job setup, monitoring, connection inventory, evidence review, settings, and guidance. In v0.3, the local demo visibly separates inspectable UI behavior from external execution authority.

## Verified synthetic workflow

- cross-workspace search across jobs, connections, and help topics;
- deterministic migration ledger and four-step job blueprint;
- local create, start, and pause transitions with event evidence;
- readiness derived from connection health, mappings, failures, and history;
- fictional connection registration and testing without provider SDK calls;
- browser-only execution defaults, reset, and CSV export;
- hardened Electron shell with sandboxing, HTTPS-only external windows, and CSP; and
- a built-in 13-scene, 5:40 guided simulation with captions and verification frames.

The demo URL uses fictional records stored for the browser session. It does not call Supabase, the migration API, SharePoint, or Google Drive; it does not load Google Picker; and it does not claim that a worker moved content.

## Repository contents

- `ZMS.WebUI`: React, TypeScript, Vite, Zustand, Supabase client boundary, synthetic API, and tests.
- `ZMS.DesktopApp`: Electron host with context isolation, sandboxing, and external-link enforcement.
- `docs/demo`: authentic walkthrough, narration, captions, storyboard, and verification evidence.
- `scripts`: local demo, renderer capture, and audit utilities.

The referenced backend is `https://github.com/machander-byte/sharepoint_backend.git`. It was not copied, modified, or verified as part of this release.

## Local setup

```powershell
npm ci --prefix ZMS.WebUI
npm ci --prefix ZMS.DesktopApp
npm run dev --prefix ZMS.WebUI -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/dashboard?demo=1`. For the timed walkthrough, add `&tour=1`.

For authenticated/live client behavior, copy `ZMS.WebUI/.env.example` to `.env`, provide browser-safe Supabase and API values, and operate an authorized compatible backend. Never place provider secrets, refresh tokens, database URLs, or data-protection keys in frontend environment files.

## Verification

```powershell
npm test --prefix ZMS.WebUI
npm run build --prefix ZMS.WebUI
npm audit --prefix ZMS.WebUI
npm test --prefix ZMS.DesktopApp
npm audit --prefix ZMS.DesktopApp
```

See [TEST_REPORT.md](docs/TEST_REPORT.md) for current results and explicit non-claims.

## Deployment

The merged v0.3 frontend is hosted on Vercel and was verified against the canonical URL and immutable deployment asset bundle. `render.yaml` also describes a static frontend. This deployment proves the client build only; the separately owned backend is not provisioned or claimed by this repository.

## License status

No license file is present. All rights remain with the copyright holder unless a license is added after ownership and compatibility review.
