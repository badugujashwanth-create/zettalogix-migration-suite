# Recording guide

The v0.3 recorder uses Electron's own `capturePage` API. It does not capture the desktop, browser profile, bookmarks, notifications from other applications, or unrelated windows.

## Rehearse

```powershell
powershell -ExecutionPolicy Bypass -File scripts/capture-ui-audit.ps1 `
  -Url "http://127.0.0.1:5173/dashboard?demo=1&tour=1&tourScale=0.02" `
  -Output "docs/design/verification/05-tour-complete.png" `
  -CaptureDelaySeconds 9
```

Inspect the accelerated final state before spending time on the full capture.

## Record

```powershell
powershell -ExecutionPolicy Bypass -File scripts/record-demo-v0.3.ps1
```

The script gates on web tests/build/audit and desktop tests/audit, records 340 seconds at two source frames per second, generates local speech narration, encodes VP9/Opus at 1280×720, extracts 13 milestone frames, and writes a SHA-256 verification manifest. Review every extracted frame before accepting the video.
