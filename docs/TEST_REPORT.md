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
| 5:40 walkthrough | Pass | 340.008 seconds, 1280x720 VP9/Opus, non-silent narration, captions, 13 inspected frames, and SHA-256 manifest |
| post-merge CI | Pass | GitHub Actions run `29701149902` repeated web and desktop verification on merge commit `c6afea7` |
| hosted v0.3 frontend | Pass | canonical and immutable Vercel URLs returned the same v0.3 asset bundle and synthetic runtime markers |

The first full capture exposed horizontal overflow in the desktop shell. The main grid track and responsive breakpoints were corrected, the affected migration and wizard states were recaptured without overflow, and the entire walkthrough was then rerun. The accepted artifact is 8,043,809 bytes with SHA-256 `a72e0dc52f1e63b84f7f474a95d89f4d070a26953b82165024a5332418d77936`; narration measures -22.9 dB mean and -2.7 dB peak.

## Regression boundaries

Demo API calls must not reach `fetch`; demo auth must not initialize Supabase; Google Picker must remain unloaded; external-backend ownership must stay visible; readiness must use only inspectable fields; running jobs cannot be started twice; unsafe Electron popups must be denied.

## Not covered

No real migration worker, production content move, live Supabase tenant, provider credential, OAuth redirect, SharePoint or Google Drive tenant, staging API contract, packaged installer, macOS/Linux Electron behavior, or enterprise accessibility review is claimed. The public Vercel URL verifies the v0.3 client and synthetic workflow only.
