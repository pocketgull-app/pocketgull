# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    PocketGull Sit-Stand Ergonomic Cadence Pacer for Ataxia & Deep Work.
    Manages a clinical 45-minute seated / 15-minute standing rhythm with
    gentle organic earcons and desktop toast notifications.
#>

param(
    [int]$SitMinutes = 45,
    [int]$StandMinutes = 15,
    [switch]$Daemon
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$createdNew = $false
$pacerMutex = New-Object System.Threading.Mutex($true, "Local\PocketGull_SitStandPacer_Mutex", [ref]$createdNew)
if (-not $createdNew) {
    exit 0
}

$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$iconCandidate = Join-Path $repoDir "public\icons\pocketgull.ico"
$soundDir   = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds"
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
    $notify.Icon = if (Test-Path $iconCandidate) { New-Object System.Drawing.Icon($iconCandidate) } else { [System.Drawing.SystemIcons]::Information }
    $notify.Visible = $true
    $notify.ShowBalloonTip(5000, $title, $message, [System.Windows.Forms.ToolTipIcon]::Info)
    Start-Sleep -Seconds 5
    $notify.Dispose()
}

try {
    Write-Host "`n=== POCKETGULL SIT-STAND CADENCE PACER ACTIVE ===" -ForegroundColor Cyan
    Write-Host "  * Seated interval:   $SitMinutes minutes" -ForegroundColor White
    Write-Host "  * Standing interval: $StandMinutes minutes" -ForegroundColor White

    while ($true) {
        # Phase 1: Seated Focus
        Start-Sleep -Seconds ($SitMinutes * 60)

        # Alert: Elevate Desk to Stand
        Show-ErgoAlert -title "PocketGull: Elevate Desk (15m)" `
                       -message "Raise desk to standing height. Keep light fingertip contact on desk edge for proprioceptive stability." `
                       -wavFile $chimeStand

        $pacerPath = Join-Path $scriptDir "entrainment_engine.ps1"
        if (Test-Path $pacerPath) {
            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = $pwsh
            $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$pacerPath`" -Preset canoe -DurationSec $($StandMinutes * 60)"
            $psi.WorkingDirectory = $repoDir
            $psi.UseShellExecute = $false
            $psi.CreateNoWindow = $true
            [System.Diagnostics.Process]::Start($psi) | Out-Null
        }

        # Phase 2: Standing Proprioceptive Loading
        Start-Sleep -Seconds ($StandMinutes * 60)

        Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
            Where-Object { $_.CommandLine -like "*entrainment_engine.ps1*canoe*" } |
            ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

        # Alert: Lower Desk to Sit
        Show-ErgoAlert -title "PocketGull: Lower Desk (45m)" `
                       -message "Lower desk to seated height. Relax shoulders, ground feet, and return to seated craft flow." `
                       -wavFile $chimeSit
    }
} finally {
    $pacerMutex.ReleaseMutex()
    $pacerMutex.Dispose()
}
