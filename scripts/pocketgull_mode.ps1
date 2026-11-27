# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    PocketGull Tri-Modal Workflow Orchestrator: BUILD, CLOUD, SHIP.
    Aligns hardware lighting, sound entrainment, audio channel, cursors, and developer tooling.
#>

param(
    [ValidateSet('Build', 'Cloud', 'Ship', 'Status')]
    [string]$Mode = 'Build'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$controller        = Join-Path $scriptDir "pocketgull_controller.mjs"
$entrainmentScript = Join-Path $scriptDir "entrainment_engine.ps1"
$hueScript         = Join-Path $scriptDir "sync_hue_circadian.ps1"
$peripheralsScript = Join-Path $scriptDir "sync_peripherals_lighting.ps1"
$taskbarScript     = Join-Path $scriptDir "refresh_taskbar_theme.ps1"
$stateFile         = Join-Path $env:LOCALAPPDATA "PocketGull\active_mode.json"

function Save-ModeState([string]$name, [string]$theme, [string]$audio) {
    $dir = Split-Path -Parent $stateFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    @{
        mode      = $name
        theme     = $theme
        audio     = $audio
        timestamp = (Get-Date).ToString("o")
    } | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8
}

function Start-SilentPwsh([string]$Arguments) {
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $pwsh
        $psi.Arguments = $Arguments
        $psi.WorkingDirectory = $repoDir
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        [System.Diagnostics.Process]::Start($psi) | Out-Null
    } catch {}
}

switch ($Mode) {
    'Build' {
        Write-Host "`n========================================================" -ForegroundColor Cyan
        Write-Host "  [BUILD] ACTIVATING BUILD MODE (The Quiet Craft Bench)" -ForegroundColor Cyan
        Write-Host "========================================================" -ForegroundColor Cyan

        $now = Get-Date
        $theme  = if ($now.Hour -ge 19 -or $now.Hour -lt 8) { '670' } elseif ($now.Hour -lt 13) { 'washi' } else { 'hemp' }
        $cursor = if ($theme -eq '670') { 'scotopic' } else { 'ophthalmic' }

        & node $controller theme $theme
        & node $controller cursor $cursor
        & $pwsh -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme $theme | Out-Null

        if (Test-Path $hueScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$hueScript`" -Preset $theme" }
        if (Test-Path $peripheralsScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$peripheralsScript`" -Theme $theme" }

        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_ceramic_chime.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }

        Save-ModeState -name 'Build' -theme $theme -audio 'Gamma40/Schumann'
        Write-Host "[OK] Build Mode active. Quiet craft flow engaged.`n" -ForegroundColor Green
    }

    'Cloud' {
        Write-Host "`n========================================================" -ForegroundColor Magenta
        Write-Host "  [CLOUD] ACTIVATING CLOUD MODE (The Telemetry Observation Deck)" -ForegroundColor Magenta
        Write-Host "========================================================" -ForegroundColor Magenta

        & node $controller theme obsidian
        & node $controller cursor ophthalmic
        & $pwsh -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme obsidian | Out-Null

        if (Test-Path $hueScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$hueScript`" -Preset hemp" }
        if (Test-Path $peripheralsScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$peripheralsScript`" -Theme obsidian" }

        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_432hz_asterisk.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }
        if (Test-Path $entrainmentScript) {
            Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$entrainmentScript`" -Preset focus10 -DurationSec 300"
        }

        Save-ModeState -name 'Cloud' -theme 'obsidian' -audio 'Focus10'
        Write-Host "[OK] Cloud Mode active. Telemetry observation deck online.`n" -ForegroundColor Green
    }

    'Ship' {
        Write-Host "`n========================================================" -ForegroundColor Yellow
        Write-Host "  [SHIP] ACTIVATING SHIP MODE (The Ceremonial Release Gate)" -ForegroundColor Yellow
        Write-Host "========================================================" -ForegroundColor Yellow

        & node $controller theme rams
        & node $controller cursor ophthalmic
        & $pwsh -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme washi | Out-Null

        if (Test-Path $hueScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$hueScript`" -Preset washi" }
        if (Test-Path $peripheralsScript) { Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$peripheralsScript`" -Theme washi" }

        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_ocean_chord.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }

        Save-ModeState -name 'Ship' -theme 'rams' -audio 'OceanChord'
        Write-Host "[OK] Ship Mode active. Ready for production release.`n" -ForegroundColor Green
    }

    'Status' {
        if (Test-Path $stateFile) {
            Get-Content -Path $stateFile | ConvertFrom-Json | Format-List
        } else {
            Write-Host "No active mode set. Defaulting to Build Mode." -ForegroundColor DarkGray
        }
    }
}
