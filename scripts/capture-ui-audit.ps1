[CmdletBinding()]
param(
    [string]$Url = "http://127.0.0.1:5173/dashboard?demo=1",
    [string]$Output = "docs/design/verification/01-dashboard.png",
    [ValidateRange(1, 30)]
    [int]$CaptureDelaySeconds = 4
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$vite = (Resolve-Path (Join-Path $repoRoot "ZMS.WebUI/node_modules/vite/bin/vite.js")).Path
$electron = (Resolve-Path (Join-Path $repoRoot "ZMS.DesktopApp/node_modules/electron/dist/electron.exe")).Path
$outputPath = Join-Path $repoRoot $Output
[System.IO.Directory]::CreateDirectory((Split-Path -Parent $outputPath)) | Out-Null
if (Test-Path -LiteralPath $outputPath) { [System.IO.File]::Delete($outputPath) }

$server = Start-Process -FilePath "node" -ArgumentList @("node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5173") `
    -WorkingDirectory (Join-Path $repoRoot "ZMS.WebUI") -WindowStyle Hidden -PassThru
$launcher = $null
$windowProcess = $null
$previousElectronRunAsNode = $env:ELECTRON_RUN_AS_NODE
$electronOutput = Join-Path $env:TEMP "zms-electron-audit-output.log"
$electronError = Join-Path $env:TEMP "zms-electron-audit-error.log"
try {
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 300
        try { $healthy = (Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:5173" -TimeoutSec 2).StatusCode -eq 200 }
        catch { $healthy = $false }
    } while (-not $healthy -and (Get-Date) -lt $deadline)
    if (-not $healthy) { throw "Vite did not become healthy." }

    Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
    $env:ZMS_DESKTOP_START_URL = $Url
    $env:ZMS_CAPTURE_PATH = $outputPath
    $env:ZMS_CAPTURE_DELAY_MS = [string]($CaptureDelaySeconds * 1000)
    $existingWindowIds = @(Get-Process | Where-Object { $_.MainWindowTitle -like "*Zettalogix Migration Suite*" } | ForEach-Object { $_.Id })
    $launcher = Start-Process -FilePath $electron -ArgumentList @(".", "--enable-logging") `
        -WorkingDirectory (Join-Path $repoRoot "ZMS.DesktopApp") -RedirectStandardOutput $electronOutput `
        -RedirectStandardError $electronError -PassThru
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 300
        $windowProcess = Get-Process |
            Where-Object { $_.MainWindowTitle -like "*Zettalogix Migration Suite*" -and $_.Id -notin $existingWindowIds } |
            Sort-Object StartTime -Descending |
            Select-Object -First 1
    } while ($null -eq $windowProcess -and (Get-Date) -lt $deadline)
    if ($null -eq $windowProcess) { throw "Electron did not open a capturable window." }

    # The renderer writes after ZMS_CAPTURE_DELAY_MS. Keep the watchdog beyond
    # the requested delay so long-scene audit captures do not fail early.
    $deadline = (Get-Date).AddSeconds($CaptureDelaySeconds + 15)
    do { Start-Sleep -Milliseconds 300 } while (-not (Test-Path -LiteralPath $outputPath) -and (Get-Date) -lt $deadline)
    if (-not (Test-Path -LiteralPath $outputPath)) { throw "Electron did not produce the requested renderer capture." }
    Write-Output $outputPath
}
finally {
    Remove-Item Env:ZMS_DESKTOP_START_URL -ErrorAction SilentlyContinue
    Remove-Item Env:ZMS_CAPTURE_PATH -ErrorAction SilentlyContinue
    Remove-Item Env:ZMS_CAPTURE_DELAY_MS -ErrorAction SilentlyContinue
    if ($null -ne $previousElectronRunAsNode) { $env:ELECTRON_RUN_AS_NODE = $previousElectronRunAsNode }
    if ($null -ne $windowProcess -and -not $windowProcess.HasExited) {
        $windowProcess.CloseMainWindow() | Out-Null
        $windowProcess.WaitForExit(3000) | Out-Null
        if (-not $windowProcess.HasExited) { $windowProcess.Kill() }
    }
    if ($null -ne $launcher -and -not $launcher.HasExited) { $launcher.Kill() }
    if (-not $server.HasExited) { $server.Kill() }
    if (Test-Path -LiteralPath $electronOutput) { Get-Content $electronOutput }
    if (Test-Path -LiteralPath $electronError) { Get-Content $electronError }
}
