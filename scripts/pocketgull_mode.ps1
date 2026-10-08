<#
.SYNOPSIS
    PocketGull Tri-Modal Workflow Orchestrator: BUILD, CLOUD, SHIP.
    Aligns hardware lighting, sound entrainment, audio channel, and developer tooling.
#>

param(
    [ValidateSet('Build', 'Cloud', 'Ship', 'Status')]
    [string]$Mode = 'Build'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$controller = Join-Path $scriptDir "pocketgull_controller.mjs"
$entrainmentScript = Join-Path $scriptDir "entrainment_engine.ps1"
$hueScript = Join-Path $scriptDir "sync_hue_circadian.ps1"
$razerScript = Join-Path $scriptDir "test_razer_chroma_sync.ps1"
$taskbarScript = Join-Path $scriptDir "refresh_taskbar_theme.ps1"
$stateFile = Join-Path $env:LOCALAPPDATA "PocketGull\active_mode.json"

function Save-ModeState([string]$name, [string]$theme, [string]$audio) {
    $dir = Split-Path -Parent $stateFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    @{
        mode = $name
        theme = $theme
        audio = $audio
        timestamp = (Get-Date).ToString("o")
    } | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8
}

switch ($Mode) {
    'Build' {
        Write-Host "`n========================================================" -ForegroundColor Cyan
        Write-Host "  [BUILD] ACTIVATING BUILD MODE (The Quiet Craft Bench)" -ForegroundColor Cyan
        Write-Host "========================================================" -ForegroundColor Cyan
        Write-Host "  * Focus: Local TypeScript, Flutter, Vitest, Architecture" -ForegroundColor White
        Write-Host "  * Pacing: 45m Seated / 15m Standing Ergonomic Cadence" -ForegroundColor DarkGray
        
        # 1. Apply Circadian Solar Theme (Washi daytime / Scotopic evening)
        $now = Get-Date
        $theme = if ($now.Hour -ge 19 -or $now.Hour -lt 8) { '670' } elseif ($now.Hour -lt 13) { 'washi' } else { 'hemp' }
        $cursor = if ($theme -eq '670') { 'scotopic' } else { 'default' }
        
        node $controller theme $theme
        node $controller cursor $cursor
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme $theme | Out-Null
        
        # 2. Synchronize Hue and Razer
        if (Test-Path $hueScript) { Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hueScript`" -Preset $theme" }
        if (Test-Path $razerScript) { Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$razerScript`"" }
        
        # 3. Audio: Play Ceramic Chime
        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_ceramic_chime.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }
        
        Save-ModeState -name 'Build' -theme $theme -audio 'Gamma40/Schumann'
        Write-Host "[OK] Build Mode active. Quiet craft flow engaged.`n" -ForegroundColor Green
    }

    'Cloud' {
        Write-Host "`n========================================================" -ForegroundColor Magenta
        Write-Host "  [CLOUD] ACTIVATING CLOUD MODE (The Telemetry Observation Deck)" -ForegroundColor Magenta
        Write-Host "========================================================" -ForegroundColor Magenta
        Write-Host "  * Focus: Kubernetes Clusters, Cloud Run, GCP Infrastructure" -ForegroundColor White
        Write-Host "  * Displays: Pod Logs and Metrics on Vertical BenQ, Shell on Ultrawide" -ForegroundColor DarkGray
        
        # 1. Apply Obsidian Phosphorescent Green Theme
        node $controller theme obsidian
        node $controller cursor default
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme hemp | Out-Null
        
        # 2. Synchronize Hue to Deep Amber/Cool Contrast
        if (Test-Path $hueScript) { Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hueScript`" -Preset hemp" }
        
        # 3. Audio: Monroe Focus 10 Telemetry Stream (300 sec)
        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_432hz_asterisk.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }
        if (Test-Path $entrainmentScript) {
            Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$entrainmentScript`" -Preset focus10 -DurationSec 300"
        }
        
        Save-ModeState -name 'Cloud' -theme 'obsidian' -audio 'Focus10'
        Write-Host "[OK] Cloud Mode active. Telemetry observation deck online.`n" -ForegroundColor Green
    }

    'Ship' {
        Write-Host "`n========================================================" -ForegroundColor Yellow
        Write-Host "  [SHIP] ACTIVATING SHIP MODE (The Ceremonial Release Gate)" -ForegroundColor Yellow
        Write-Host "========================================================" -ForegroundColor Yellow
        Write-Host "  * Focus: Mozilla Observatory 125+, Security Preflight, Git Release" -ForegroundColor White
        Write-Host "  * Security: Pure-JS Engine Guard and Strict Content-Security-Policy" -ForegroundColor DarkGray
        
        # 1. Apply Rams Functionalist / Gold Illumination Theme
        node $controller theme rams
        node $controller cursor default
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme washi | Out-Null
        
        # 2. Synchronize Hue to Celebration Bright Daylight
        if (Test-Path $hueScript) { Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hueScript`" -Preset washi" }
        
        # 3. Audio: Ocean Triad Victory Chime
        $chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_ocean_triad.wav"
        if (Test-Path $chime) { (New-Object System.Media.SoundPlayer($chime)).Play() }
        
        Save-ModeState -name 'Ship' -theme 'rams' -audio 'OceanTriad'
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
