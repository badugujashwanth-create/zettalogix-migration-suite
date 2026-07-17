# Project Improvement Plan

## Current state

Zettalogix is a strong migration-control prototype whose external API/worker is not contained here. The baseline frontend built and deployed but lacked automated tests and required configured services to demonstrate its workflow.

## Findings

- **Works:** job/connection domain UI, search, dashboards, state-aware controls, settings, Electron shell, production build, and video.
- **Does not / missing:** owned migration worker, proven production migrations, automated tests, checkpoint/retry execution evidence, and local Ollama behavior.
- **UX / architecture:** frontend/backend boundary is clear, but the public evaluator path was gated by auth. External ownership must stay explicit.
- **Testing / security:** browser values are separated from server secrets; live Supabase/provider configurations are external and not comprehensively verified.
- **Performance / docs / demo:** bundle is reasonable. Credential/backend dependence was the primary demo blocker.

## Recommendations

### Critical

- Provide a clearly labeled, deterministic synthetic workflow that exercises job creation, start/pause state, history, connection tests, settings, and export without network calls.
- Preserve fail-closed live authentication and accurate external-backend attribution.

### High value

- Add unit tests for the demo state machine and browser smoke coverage for the main demo path.
- Add readiness/risk modeling only if it derives from inspectable inputs.

### Optional

- Add checkpoint/retry visualizations after an owned worker contract exists.

## Delivery constraints

- **Priority:** recruiter-safe demo; **complexity:** medium; **dependencies:** frontend only for demo, external services for live mode.
- **Acceptance:** production build passes; demo uses fictional data, makes no provider/API calls, supports real local state transitions, and downloads a report.
- **Excluded:** claiming production migrations, copying the external backend, and fake AI recommendations.
