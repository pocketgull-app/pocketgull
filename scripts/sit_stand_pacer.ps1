<#
.SYNOPSIS
    PocketGull Sit-Stand Ergonomic Cadence Pacer for Ataxia & Deep Work.
    Manages a clinical 45-minute seated / 15-minute standing rhythm with 
    gentle organic earcons and desktop toast notifications.

.DESCRIPTION
    - 45 min SEATED:  Focused craft work, grounded posture, zero motor fatigue.
    - 15 min STANDING: Proprioceptive joint loading with light desk-edge contact.
#>

param(
    [int]$SitMinutes = 45,
    [int]$StandMinutes = 15,
    [switch]$Daemon
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$soundDir = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds"
$chimeStand = Join-Path $soundDir "pocketgull_ceramic_chime.wav"
$chimeSit   = Join-Path $soundDir "pocketgull_432hz_asterisk.wav"

function Show-ErgoAlert {
    param([string]$title, [string]$message, [string]$wavFile)
    
    if (Test-Path $wavFile) {
        try {
            $p = New-Object System.Media.SoundPlayer($wavFile)
            $p.Play()
        } catch {}
    }

    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Information
    $notify.Visible = $true
    $notify.ShowBalloonTip(5000, $title, $message, [System.Windows.Forms.ToolTipIcon]::Info)
    Start-Sleep -Seconds 5
    $notify.Dispose()
}

Write-Host "`n=== POCKETGULL SIT-STAND CADENCE PACER ACTIVE ===" -ForegroundColor Cyan
Write-Host "  • Seated interval:   $SitMinutes minutes" -ForegroundColor White
Write-Host "  • Standing interval: $StandMinutes minutes" -ForegroundColor White
Write-Host "  • Earcons: Ceramic Kiln Bell (Stand) / 432 Hz Philocardia (Sit)" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop pacing.`n"

while ($true) {
    # ── Phase 1: Seated Focus ──
    Write-Host "[$(Get-Date -Format 'HH:mm')] Starting SEATED craft period ($SitMinutes min)..." -ForegroundColor Green
    Start-Sleep -Seconds ($SitMinutes * 60)

    # ── Alert: Elevate Desk to Stand ──
    Write-Host "[$(Get-Date -Format 'HH:mm')] Alerting: ELEVATE DESK TO STAND ($StandMinutes min)" -ForegroundColor Yellow
    Show-ErgoAlert -title "🧍 PocketGull: Elevate Desk" `
                   -message "Time to Stand (15 min): Raise desk. Keep light fingertip contact on desk edge for sensory stability." `
                   -wavFile $chimeStand

    # Auto-play 60 BPM Canoe Cadence for standing pacing
    $pacerPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "entrainment_engine.ps1"
    if (Test-Path $pacerPath) {
        Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$pacerPath`" -Preset canoe -DurationSec ($StandMinutes * 60)"
    }

    # ── Phase 2: Standing Proprioceptive Loading ──
    Start-Sleep -Seconds ($StandMinutes * 60)

    # Stop standing cadence
    Get-WmiObject Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*entrainment_engine.ps1*canoe*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

    # ── Alert: Lower Desk to Sit ──
    Write-Host "[$(Get-Date -Format 'HH:mm')] Alerting: LOWER DESK TO SIT ($SitMinutes min)" -ForegroundColor Cyan
    Show-ErgoAlert -title "🧘 PocketGull: Lower Desk" `
                   -message "Time to Sit (45 min): Lower desk. Relax shoulders, ground feet, and enter seated craft flow." `
                   -wavFile $chimeSit
}
