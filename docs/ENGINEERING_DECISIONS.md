# Engineering decisions in the Zettalogix client

The client is most credible where it exposes the line between inspectable frontend behavior and unavailable execution authority. These two incidents shaped that line.

## Demo mode still depended on live authentication and API construction

**Problem.** The original frontend always created a Supabase client and routed job/connection calls through the live API shape, even when a reviewer only needed a deterministic local walkthrough.

**User impact.** An unconfigured reviewer could stop at authentication or localhost API failures. Replacing those failures with polished sample screens would have hidden whether the workflow actually changed state.

**Reproduction.** Run the earlier build without Supabase or migration-API environment values and open a protected route. `AuthProvider` constructed the client, `RequireAuth` waited for a session, and `api.ts` had no early demo branch.

**Investigation.** Authentication, API transport, and UI state were coupled. The existing interface could not demonstrate job transitions without either external credentials or an implied backend success.

**Root cause.** Demo data was treated as presentation content rather than a separate adapter selected before authentication and network boundaries.

**Fix.** `isDemoMode` is checked before protected-route/session work and before every job, connection, report, and settings request. `demoApi` owns cloned session state and explicit create/start/pause/test/export transitions. Live mode retains the original external contract.

**Regression test.** `ZMS.WebUI/src/services/demoApi.test.ts` replaces global `fetch` with a function that throws, then creates, starts, pauses, and reloads a job and creates/tests a connection. The test also asserts that `fetch` was never called.

**Trade-off.** The synthetic adapter cannot establish worker correctness. Maintaining two adapters increases contract-drift risk, so live claims remain blocked until an authorized service fixture can test both sides.

**Relevant files.** `ZMS.WebUI/src/services/demoMode.ts`, `ZMS.WebUI/src/services/demoApi.ts`, `ZMS.WebUI/src/services/api.ts`, `ZMS.WebUI/src/hooks/useAuth.tsx`, `ZMS.WebUI/src/components/auth/RequireAuth.tsx`, `ZMS.WebUI/src/services/demoApi.test.ts`.

**Reference.** Commit [`9c2b081`](https://github.com/badugujashwanth-create/zettalogix-migration-suite/commit/9c2b081deaa2d08d38e917b2ea294c900a7f5a26), merged in [PR #1](https://github.com/badugujashwanth-create/zettalogix-migration-suite/pull/1).

## The desktop recording exposed horizontal overflow

**Problem.** The first full Electron capture showed content extending beyond the renderer viewport in migration and wizard states.

**User impact.** Operators could lose controls or evidence off-screen, and the published walkthrough would have preserved a layout failure instead of the intended workflow.

**Reproduction.** Open the desktop shell at its 1440×920 window, navigate through the migration ledger and multi-column wizard, and compare `document.documentElement.scrollWidth` with `clientWidth`. The earlier grid and navbar breakpoints allowed fixed/minimum content widths to exceed the space remaining beside the sidebar.

**Investigation.** Viewport-only breakpoints did not account for the desktop sidebar. Grid children also needed `min-width: 0`, and long labels/URLs lacked enough wrapping pressure.

**Root cause.** Responsive rules were based on the outer viewport while the actual constraint was the narrower content column inside the Electron layout.

**Fix.** The main layout and navbar now allow tracks to shrink, wrap long content, and collapse earlier. Electron's release capture executes a renderer overflow inspection that reports off-screen elements and their ancestor sizing when the document is wider than the viewport.

**Regression test.** `ZMS.DesktopApp/electron/main.cjs` fails the release capture when `documentWidth > viewportWidth + 1`. The entire 13-scene walkthrough was rerun after the CSS change; the accepted verification frames include the migration ledger and wizard without overflow.

**Trade-off.** Navigation collapses at a wider breakpoint than a browser-only design might require. The earlier collapse preserves access to actions inside the constrained desktop shell.

**Relevant files.** `ZMS.DesktopApp/electron/main.cjs`, `ZMS.WebUI/src/layouts/AppLayout.module.css`, `ZMS.WebUI/src/components/TopNavbar/TopNavbar.module.css`, `ZMS.WebUI/src/styles/globals.css`, `docs/demo/verification/README.md`.

**Reference.** Commit [`7b36560`](https://github.com/badugujashwanth-create/zettalogix-migration-suite/commit/7b36560), merged in [PR #2](https://github.com/badugujashwanth-create/zettalogix-migration-suite/pull/2).
