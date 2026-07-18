# Client API boundary

## Synthetic mode

`demoApi` implements the client contract in memory:

- list, read, create, start, and pause migration jobs;
- list, create, and test fictional connections;
- load and save browser-local settings;
- export the synthetic aggregate CSV; and
- reset to a deterministic two-job/two-connection baseline.

Synthetic mode is selected with `demo=1` and then retained for the browser session. API methods branch before authorization or `fetch`, so the walkthrough does not call Supabase or the migration API.

## Live mode

The client expects a compatible external service under `VITE_API_BASE_URL` with job, connection, test, and report routes. Bearer tokens come from a configured Supabase public client. This repository validates client mapping and failure messages only; it does not contain or verify the server contract.

## Readiness

`assessMigrationReadiness(job, connections)` is a pure client function. It checks referenced source and target health, required mapping fields, current failure count, and event evidence. The result is explanatory UI state, not a worker command or predictive success estimate.
