[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host 'Starting Zettalogix Migration Suite in local demo mode.'
Write-Host 'Review environment placeholders and use synthetic data before continuing.'
npm run dev --prefix ZMS.WebUI -- --host 127.0.0.1

