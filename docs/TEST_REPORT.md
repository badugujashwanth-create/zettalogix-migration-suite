# Test report

Audited on 2026-07-18 using the checked-out `portfolio-polish` branch on Windows.

| Command | Result | Evidence / notes |
|---|---|---|
| `ZMS.WebUI: npm ci` | Pass | 480 packages installed |
| `ZMS.WebUI: npm run build` | Pass | TypeScript and Vite production build completed after the recruiter-safe synthetic demo was added |
| `ZMS.WebUI: npm test` | Pass | 2 synthetic workflow tests verify job state transitions, connection health mutation, and zero live `fetch` calls |
| `ZMS.WebUI: npm audit --omit=dev` | Pass | 0 production dependency vulnerabilities after `npm audit fix` |
| `ZMS.DesktopApp: npm ci` | Pass | 70 packages installed |
| `https://sharepoint-one.vercel.app` | Pass | HTTP 200 and the Zettalogix Migration Suite title verified on 2026-07-17 |

## Overall status

Verified for the commands listed above. Unlisted platforms, deployments, external providers, and optional integrations were not inferred to work.

Warnings and missing checks remain limitations, even when another check passes.

The development toolchain still reports audit findings through Vite 5/esbuild. The affected development server is not part of the deployed static bundle; upgrading to Vite 8 is a breaking change and was not forced into this release.
