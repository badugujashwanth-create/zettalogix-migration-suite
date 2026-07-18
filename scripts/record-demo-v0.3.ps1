[CmdletBinding()]
param(
    [ValidateRange(180, 360)]
    [int]$DurationSeconds = 340,
    [string]$FfmpegPath = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$webRoot = Join-Path $repoRoot "ZMS.WebUI"
$desktopRoot = Join-Path $repoRoot "ZMS.DesktopApp"
$demoDir = Join-Path $repoRoot "docs/demo"
$verificationDir = Join-Path $demoDir "verification"
[System.IO.Directory]::CreateDirectory($verificationDir) | Out-Null

function Resolve-Ffmpeg {
    if ($FfmpegPath) { return (Resolve-Path $FfmpegPath).Path }
    $installed = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($null -ne $installed) { return $installed.Source }
    $cached = Get-ChildItem (Join-Path $env:TEMP "nira-ffmpeg-8.1.2") -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $cached) { return $cached.FullName }
    throw "FFmpeg is unavailable. Run the verified NIRA recorder once or pass -FfmpegPath."
}

function New-Narration {
    param([string]$OutputPath)
    Add-Type -AssemblyName System.Speech
    $paragraphs = (Get-Content -Raw -Encoding utf8 (Join-Path $demoDir "NARRATION.md")) -split "(?:\r?\n){2,}" |
        Where-Object { $_ -and $_ -notmatch '^#' } |
        ForEach-Object { ($_ -replace '[`*_#]', '').Trim() }
    $builder = New-Object System.Speech.Synthesis.PromptBuilder
    foreach ($paragraph in $paragraphs) {
        $builder.AppendText($paragraph)
        $builder.AppendBreak([TimeSpan]::FromSeconds(3))
    }
    $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
    try {
        $voice.Rate = -1
        $voice.Volume = 90
        $voice.SetOutputToWaveFile($OutputPath)
        $voice.Speak($builder)
    }
    finally { $voice.Dispose() }
}

Push-Location $webRoot
try {
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Web tests failed before recording." }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Web build failed before recording." }
    npm audit
    if ($LASTEXITCODE -ne 0) { throw "Web dependency audit failed before recording." }
}
finally { Pop-Location }

Push-Location $desktopRoot
try {
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Desktop boundary tests failed before recording." }
    npm audit
    if ($LASTEXITCODE -ne 0) { throw "Desktop dependency audit failed before recording." }
}
finally { Pop-Location }

$ffmpeg = Resolve-Ffmpeg
$ffprobe = Join-Path (Split-Path -Parent $ffmpeg) "ffprobe.exe"
if (-not (Test-Path -LiteralPath $ffprobe)) { throw "ffprobe.exe is not beside FFmpeg." }

$runId = [guid]::NewGuid().ToString("N")
$workDir = Join-Path $env:TEMP "zms-video-$runId"
$framesDir = Join-Path $workDir "frames"
$narrationPath = Join-Path $workDir "narration.wav"
[System.IO.Directory]::CreateDirectory($framesDir) | Out-Null
New-Narration $narrationPath

$viteScript = "node_modules/vite/bin/vite.js"
$electron = (Resolve-Path (Join-Path $desktopRoot "node_modules/electron/dist/electron.exe")).Path
$previousElectronRunAsNode = $env:ELECTRON_RUN_AS_NODE
$server = Start-Process -FilePath "node" -ArgumentList @($viteScript, "--host", "127.0.0.1", "--port", "5173") `
    -WorkingDirectory $webRoot -WindowStyle Hidden -PassThru
$launcher = $null
$windowProcess = $null
try {
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 300
        try { $healthy = (Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:5173" -TimeoutSec 2).StatusCode -eq 200 }
        catch { $healthy = $false }
    } while (-not $healthy -and (Get-Date) -lt $deadline)
    if (-not $healthy) { throw "Vite did not become healthy." }

    $existingWindowIds = @(Get-Process | Where-Object { $_.MainWindowTitle -like "*Zettalogix Migration Suite*" } | ForEach-Object { $_.Id })
    Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
    $env:ZMS_DESKTOP_START_URL = "http://127.0.0.1:5173/dashboard?demo=1&tour=1"
    $env:ZMS_CAPTURE_FRAMES_DIR = $framesDir
    $env:ZMS_CAPTURE_FRAME_RATE = "2"
    $env:ZMS_CAPTURE_DURATION_SECONDS = [string]$DurationSeconds
    $launcher = Start-Process -FilePath $electron -ArgumentList "." -WorkingDirectory $desktopRoot -PassThru

    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 300
        $windowProcess = Get-Process |
            Where-Object { $_.MainWindowTitle -like "*Zettalogix Migration Suite*" -and $_.Id -notin $existingWindowIds } |
            Sort-Object StartTime -Descending |
            Select-Object -First 1
    } while ($null -eq $windowProcess -and (Get-Date) -lt $deadline)
    if ($null -eq $windowProcess) { throw "Electron did not open the guided simulation." }

    $captureRecord = Join-Path $framesDir "capture-complete.json"
    $deadline = (Get-Date).AddSeconds($DurationSeconds + 45)
    $lastHeartbeat = Get-Date
    do {
        Start-Sleep -Seconds 1
        if ((Get-Date) - $lastHeartbeat -gt [TimeSpan]::FromSeconds(30)) {
            $captured = @(Get-ChildItem $framesDir -Filter "frame-*.png" -ErrorAction SilentlyContinue).Count
            Write-Output "Capture progress: $captured / $($DurationSeconds * 2) frames"
            $lastHeartbeat = Get-Date
        }
        if ($null -ne $windowProcess -and $windowProcess.HasExited) { throw "Electron exited before capture completed." }
    } while (-not (Test-Path -LiteralPath $captureRecord) -and (Get-Date) -lt $deadline)
    if (-not (Test-Path -LiteralPath $captureRecord)) { throw "Timed renderer capture did not complete." }
}
finally {
    Remove-Item Env:ZMS_DESKTOP_START_URL -ErrorAction SilentlyContinue
    Remove-Item Env:ZMS_CAPTURE_FRAMES_DIR -ErrorAction SilentlyContinue
    Remove-Item Env:ZMS_CAPTURE_FRAME_RATE -ErrorAction SilentlyContinue
    Remove-Item Env:ZMS_CAPTURE_DURATION_SECONDS -ErrorAction SilentlyContinue
    if ($null -ne $previousElectronRunAsNode) { $env:ELECTRON_RUN_AS_NODE = $previousElectronRunAsNode }
    if ($null -ne $windowProcess -and -not $windowProcess.HasExited) {
        $windowProcess.CloseMainWindow() | Out-Null
        $windowProcess.WaitForExit(3000) | Out-Null
        if (-not $windowProcess.HasExited) { $windowProcess.Kill() }
    }
    if ($null -ne $launcher -and -not $launcher.HasExited) { $launcher.Kill() }
    if (-not $server.HasExited) { $server.Kill() }
}

$outputVideo = Join-Path $demoDir "demo.webm"
$audioFilter = "[1:a]apad=pad_dur=$DurationSeconds[a]"
$videoFilter = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0xf8f9ff,fps=10"
& $ffmpeg -hide_banner -loglevel warning -y -framerate 2 -i (Join-Path $framesDir "frame-%06d.png") -i $narrationPath `
    -filter_complex "[0:v]$videoFilter[v];$audioFilter" -map "[v]" -map "[a]" `
    -c:v libvpx-vp9 -crf 38 -b:v 0 -deadline good -cpu-used 5 -c:a libopus -b:a 64k -t $DurationSeconds $outputVideo
if ($LASTEXITCODE -ne 0) { throw "FFmpeg encoding failed." }

& $ffmpeg -hide_banner -loglevel error -y -ss 00:00:08 -i $outputVideo -frames:v 1 (Join-Path $demoDir "demo-thumbnail.png")
$frameTimes = @(
    "00:00:08", "00:00:28", "00:00:53", "00:01:18", "00:01:48", "00:02:18", "00:02:48",
    "00:03:18", "00:03:43", "00:04:08", "00:04:33", "00:04:58", "00:05:25"
)
for ($index = 0; $index -lt $frameTimes.Count; $index++) {
    $frameName = "{0:D2}-frame.png" -f ($index + 1)
    & $ffmpeg -hide_banner -loglevel error -y -ss $frameTimes[$index] -i $outputVideo -frames:v 1 (Join-Path $verificationDir $frameName)
}

$probe = ((& $ffprobe -v error -show_entries "format=duration,size:stream=index,codec_type,codec_name,width,height" -of json $outputVideo) | Out-String) | ConvertFrom-Json
$duration = [double]$probe.format.duration
$videoStream = $probe.streams | Where-Object { $_.codec_type -eq "video" } | Select-Object -First 1
$audioStream = $probe.streams | Where-Object { $_.codec_type -eq "audio" } | Select-Object -First 1
if ($duration -lt 180 -or $videoStream.width -ne 1280 -or $videoStream.height -ne 720 -or $null -eq $audioStream) {
    throw "Demo acceptance failed: duration=$duration resolution=$($videoStream.width)x$($videoStream.height)."
}

$evidence = [ordered]@{
    generated_at_utc = [DateTime]::UtcNow.ToString("o")
    duration_seconds = [Math]::Round($duration, 3)
    width = $videoStream.width
    height = $videoStream.height
    video_codec = $videoStream.codec_name
    audio_codec = $audioStream.codec_name
    captions = "demo-captions.vtt"
    sha256 = (Get-FileHash -Algorithm SHA256 $outputVideo).Hash.ToLower()
    bytes = (Get-Item $outputVideo).Length
    verification_frames = $frameTimes.Count
    frame_timestamps = $frameTimes
}
[System.IO.File]::WriteAllText(
    (Join-Path $verificationDir "verification.json"),
    ($evidence | ConvertTo-Json -Depth 4) + [Environment]::NewLine,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Output ($evidence | ConvertTo-Json -Depth 4)
