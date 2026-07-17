# Development guide

## Purpose

Web and Electron frontend for configuring, monitoring, and reviewing content-migration jobs across connected source and destination systems.

## Prerequisites

React, TypeScript, Vite, Zustand, Supabase client, Electron.

## Install

```powershell
npm ci --prefix ZMS.WebUI; npm ci --prefix ZMS.DesktopApp
```

## Run

```powershell
npm run dev --prefix ZMS.WebUI
```

## Verify

- Tests: `No automated test command is configured`
- Build: `npm run build --prefix ZMS.WebUI`

See [TEST_REPORT.md](TEST_REPORT.md) for the latest audited results. Copy example environment files instead of committing real values. Generated dependencies, caches, logs, databases, and build output must remain untracked.

