# Zettalogix — Migration Readiness and Orchestration Frontend

Zettalogix is a React/Electron operator client for preparing and observing content-migration work. The repository owns the frontend, desktop shell, and a deterministic browser-only workflow. It does **not** contain the migration worker or prove that content moved between SharePoint, Google Drive, or a file share.

**Release:** v0.3.0. The synthetic control plane, seven web tests, two desktop boundary tests, production builds, and the hosted frontend are verified.

[Open the synthetic frontend](https://sharepoint-one.vercel.app/dashboard?demo=1) · [Watch the 5:40 walkthrough](https://jashwanth-portfolio-ten.vercel.app/work/zettalogix-migration-suite/) · [MP4](https://jashwanth-portfolio-ten.vercel.app/media/zettalogix/demo.mp4) · [Captions](https://jashwanth-portfolio-ten.vercel.app/media/zettalogix/demo-captions.vtt)

## What migration operators need before execution

A migration should not begin with a “Start” button. An operator first needs to know what exists, whether source and destination access is valid, which records are at risk, how work is divided into waves, and what evidence will allow a paused or failed job to resume safely.

The client organizes that decision space into connections, a migration ledger, a four-step job blueprint, readiness signals, history, settings, and reporting. The synthetic mode makes those UI transitions inspectable without pretending an external worker ran.

## Capability boundary

| Migration concern | What v0.3 demonstrates | What is not yet owned or verified |
| --- | --- | --- |
| Discovery | A blueprint step and fictional connection/source records | Provider inventory, content graph, permissions crawl, and dry-run manifest |
| Risk analysis | At-risk connection/job counts and supplied failure evidence | A validated risk model over real tenant content |
| Remediation | Operator guidance, connection retest, pause, and visible failure state | Worker-side repair, replay, quarantine, or guaranteed recovery |
| Wave planning | Create a synthetic job with source, destination, mapping intent, and staged review | Capacity planning or a scheduler backed by real inventory |
| Job orchestration | Local create, start, pause, history, reset, and CSV export transitions | Real queue/worker execution or migrated-content claims |
| Checkpoints and retries | Client settings and historical retry language are visible | Durable worker checkpoints, retry execution, and resume validation |
| Validation | Local form checks and synthetic connection testing | OAuth, tenant permission, checksum, metadata, and destination validation |
| Ollama recommendations | None in the verified client | No model integration or recommendation quality is claimed |

This distinction is deliberate: discovery graphs, checkpoint/retry behavior, and AI recommendations should be added only against an owned or explicitly authorized service contract.

## The synthetic operator loop

1. Enter `?demo=1`; the client branches into demo mode before Supabase or API work.
2. Review fictional source/target connections and the supplied migration ledger.
3. Open the four-stage **Discovery → Source → Destination → Review** blueprint.
4. Create a fictional migration wave and start it in browser state.
5. Pause the wave, inspect its history and failure evidence, and review readiness.
6. Export a synthetic CSV report or reset the session.

The no-network test replaces `fetch` with a throwing function and exercises job and connection transitions. If demo code touches the live API, the test fails.

## Frontend/backend ownership

```text
This repository owns
  ZMS.WebUI       React/TypeScript operator experience and synthetic API
  ZMS.DesktopApp  Electron host, sandbox, navigation and external-link controls

External boundary
  migration API   expected job/connection/report contract
  worker          discovery, transfer, retries, checkpoints and validation
  providers       Supabase, Microsoft Graph, Google Drive, file shares
```

The referenced backend is `machander-byte/sharepoint_backend`. It was not copied, modified, deployed, or verified for v0.3. Live-client behavior requires explicit authorization from the backend and tenant owners.

## Run without credentials

```powershell
npm ci --prefix ZMS.WebUI
npm run dev --prefix ZMS.WebUI -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/dashboard?demo=1`. Add `&tour=1` for the guided sequence. The session uses fictional records and does not initialize provider SDK calls for its workflow.

For a live client, copy `ZMS.WebUI/.env.example` to `.env` and use only browser-safe Supabase/API values for an authorized environment. Never put provider secrets, refresh tokens, database URLs, or data-protection keys in frontend configuration.

## Verification

```powershell
npm test --prefix ZMS.WebUI
npm run build --prefix ZMS.WebUI
npm audit --prefix ZMS.WebUI
npm test --prefix ZMS.DesktopApp
npm audit --prefix ZMS.DesktopApp
```

The first full desktop capture exposed a real overflow defect; the fix and its release-time detector are recorded in [engineering decisions](docs/ENGINEERING_DECISIONS.md).

## Limits before an authorized migration

- No production migration, tenant connection, user, customer, or moved-item metric is claimed.
- The separately owned backend and worker are outside this repository's verification boundary.
- Synthetic connection health is a local state transition, not a provider credential test.
- Retry values are client preferences until a compatible worker contract enforces them.
- Real discovery, checkpointing, content validation, and Ollama recommendations remain future work requiring ownership and test environments.

## Operator references

[Architecture](docs/ARCHITECTURE.md) · [Client contract](docs/API.md) · [Engineering decisions](docs/ENGINEERING_DECISIONS.md) · [Test evidence](docs/TEST_REPORT.md) · [Case study](docs/CASE_STUDY.md) · [Maturity gaps](docs/MATURITY_GAP_MATRIX.md) · [Contributing](CONTRIBUTING.md)

## License status

No license file is present. All rights remain with the copyright holders. Licensing the frontend does not grant rights to the separately owned backend or any tenant content.
