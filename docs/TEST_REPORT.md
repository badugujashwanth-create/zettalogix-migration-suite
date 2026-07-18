# Test report

Last local verification: 19 July 2026, Windows, Node 24, branch `product-completion-v0.3`.

| Command | Result | Scope |
|---|---|---|
| `ZMS.WebUI: npm test` | **7 passed** | demo state transitions, reset, zero-fetch boundary, and evidence-derived readiness |
| `ZMS.WebUI: npm run build` | Pass | TypeScript and Vite 8 production build |
| `ZMS.WebUI: npm run build:desktop` | Pass | relative-asset renderer build for packaged Electron hosting |
| `ZMS.WebUI: npm audit` | Pass | 0 vulnerabilities across production and development dependencies |
| `ZMS.DesktopApp: npm test` | **2 passed** | HTTPS-only external-link allowlist and unsafe-target rejection |
| `ZMS.DesktopApp: npm audit` | Pass | 0 vulnerabilities |
| renderer visual audit | Pass | dashboard, readiness, connections, settings, and accelerated final-tour state captured from Electron |
| 5:40 walkthrough | Pending | full-duration capture, audio, 13 frames, checksum, and manual inspection required before release |

## Regression boundaries

Demo API calls must not reach `fetch`; demo auth must not initialize Supabase; Google Picker must remain unloaded; external-backend ownership must stay visible; readiness must use only inspectable fields; running jobs cannot be started twice; unsafe Electron popups must be denied.

## Not covered

No real migration worker, production content move, live Supabase tenant, provider credential, OAuth redirect, SharePoint or Google Drive tenant, staging API contract, packaged installer, macOS/Linux Electron behavior, or enterprise accessibility review is claimed. The existing public Vercel URL remains the v0.2 baseline until a separately authorized deployment is verified.
