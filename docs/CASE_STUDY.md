# Case study: an honest migration control plane without an owned worker

## Product summary

Zettalogix Migration Suite is a React/Electron migration-control prototype for job setup, monitoring, connection inventory, readiness evidence, settings, and operator guidance. Version 0.3 deliberately proves the client workflow without implying that a separately owned backend or worker moved production content.

## Problem

Migration tools are difficult to evaluate when the client, identity provider, source/destination tenants, orchestration API, and worker all depend on credentials or infrastructure the evaluator does not control. A superficial mock can look successful while hiding the most important boundary: who actually has authority to inspect and move content.

## Product approach

The repository provides two explicit runtime modes:

- A deterministic, browser-session synthetic mode that never initializes Supabase, calls the migration API, loads Google Picker, or performs a provider request.
- A configurable live-client boundary that requires browser-safe public configuration and an authorized compatible backend owned outside this repository.

The synthetic mode remains useful because it exposes inspectable state transitions rather than a fake completion animation.

## Verified operator workflow

1. Search across migration jobs, connections, and guidance.
2. Inspect a four-step job blueprint and deterministic event ledger.
3. Create a fictional migration and move it through local start/pause transitions.
4. Derive readiness from visible connection health, mappings, failures, and event history.
5. Register and test fictional connection records without provider SDK calls.
6. Change browser-only execution defaults, reset the sandbox, and export evidence to CSV.
7. Review explicit failure guidance and the external API/worker ownership boundary.

## Key engineering decisions

- Keep demo auth, API, provider picker, fonts, and icons network-free.
- Derive readiness as a pure function of inspectable state instead of a hard-coded score.
- Change copy and available actions by runtime mode so synthetic state cannot masquerade as a live worker result.
- Harden Electron with sandboxing, context isolation, no Node integration, CSP, HTTPS-only external windows, and unsafe-target rejection.
- Use hash routing and relative assets for the desktop renderer while retaining browser routing for hosted builds.
- Capture the real renderer and reject horizontal overflow before accepting release media.

## Evidence

| Gate | Result |
|---|---|
| Web tests | 7 passed |
| Desktop boundary tests | 2 passed |
| Web and desktop renderer builds | Passed |
| Dependency audits | 0 vulnerabilities in both dependency trees |
| Hosted client | Canonical and immutable Vercel assets matched v0.3 synthetic markers |
| Walkthrough | 340.008 seconds, 1280×720 VP9/Opus, narrated/captioned, 13 inspected frames |
| Release | v0.3.0 with matching local/release asset digests |

## Security and ownership boundary

This repository owns the client, synthetic state machine, and Electron host. It references, but does not own or verify, the migration backend at `machander-byte/sharepoint_backend`. It contains no production tenant credentials, provider refresh tokens, worker keys, content-encryption material, or proof of a real SharePoint/Drive migration.

## Result

The project is a defensible client/control-plane case study because it makes operational state, evidence, and authority visible. It is not a migration-engine claim.

## Remaining work

- Obtain an authorized versioned API contract before adding worker-dependent views.
- Add discovery inventory, dry-run manifest, checkpoints, retries, and paginated history against an owned/sanctioned contract server.
- Add keyboard/screen-reader evidence and signed multi-platform Electron packaging.
- Validate real OAuth, tenant permissions, staging failure recovery, and content integrity only with explicit authority.
