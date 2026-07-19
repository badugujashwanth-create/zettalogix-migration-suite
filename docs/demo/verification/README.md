# Walkthrough verification

The accepted `demo.webm` is a 340.008-second, 1280x720 VP9/Opus recording of the network-free synthetic workflow. The 13 frames below were extracted by `scripts/record-demo-v0.3.ps1` and manually inspected after an earlier overflow defect was fixed and the full recording was rerun.

| Frame | Timestamp | Evidence |
|---|---:|---|
| `01-frame.png` | 00:00:08 | persistent synthetic boundary and command center |
| `02-frame.png` | 00:00:28 | cross-workspace search results |
| `03-frame.png` | 00:00:53 | migration ledger without horizontal overflow |
| `04-frame.png` | 00:01:18 | four-step job blueprint modal |
| `05-frame.png` | 00:01:48 | locally created draft and report export |
| `06-frame.png` | 00:02:18 | deterministic start transition and progress |
| `07-frame.png` | 00:02:48 | pause transition |
| `08-frame.png` | 00:03:18 | evidence-derived readiness checks |
| `09-frame.png` | 00:03:43 | fictional connection inventory |
| `10-frame.png` | 00:04:08 | local connection check |
| `11-frame.png` | 00:04:33 | browser-only execution defaults |
| `12-frame.png` | 00:04:58 | operator guidance and ownership boundary |
| `13-frame.png` | 00:05:25 | clean final state and simulation completion |

Media SHA-256: `a72e0dc52f1e63b84f7f474a95d89f4d070a26953b82165024a5332418d77936`.

Machine-readable codec, duration, size, hash, and timestamp evidence is in `verification.json`.
