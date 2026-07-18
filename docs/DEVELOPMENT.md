# Development guide

## Prerequisites

- Node.js 22.12 or newer; Node 24 is used for the release candidate.
- npm with the committed lockfiles.
- Windows for Electron release capture; the web client is platform-neutral.

## Install

```powershell
npm ci --prefix ZMS.WebUI
npm ci --prefix ZMS.DesktopApp
```

## Run the network-free demo

```powershell
npm run dev --prefix ZMS.WebUI -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/dashboard?demo=1`. Add `&tour=1` for the 13-scene timed walkthrough. `tourScale` is a rehearsal-only query parameter between `0.02` and `1`; release recordings always use `1`.

To host the web client in Electron, set `ZMS_DESKTOP_START_URL` to the healthy local URL and run `npm start --prefix ZMS.DesktopApp`. The `ELECTRON_RUN_AS_NODE` environment variable must not be set for desktop execution.

## Verify

```powershell
npm test --prefix ZMS.WebUI
npm run build --prefix ZMS.WebUI
npm run build:desktop --prefix ZMS.WebUI
npm audit --prefix ZMS.WebUI
npm test --prefix ZMS.DesktopApp
npm audit --prefix ZMS.DesktopApp
```

Copy example environment files instead of committing real values. Generated dependencies, build output, capture work directories, and logs remain untracked.
