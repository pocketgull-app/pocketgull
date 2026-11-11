# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    PocketGull Automatic Circadian Theme Scheduler for Windows.
    Registers Windows Scheduled Tasks to automatically track the solar cycle:
      * 08:00 AM - Morning Washi Rice Paper (Bright daylight reading, 64px Ophthalmic cursor)
      * 01:00 PM - Afternoon Hemp Fiber (Soft warm sepia, 64px Ophthalmic cursor)
      * 07:30 PM - Night Scotopic 670nm Deep Red (Mitochondrial CcO support & melatonin preservation)

.EXAMPLE
    pwsh schedule_circadian_themes.ps1 -Action Register
    pwsh schedule_circadian_themes.ps1 -Action Status
    pwsh schedule_circadian_themes.ps1 -Action SyncNow
    pwsh schedule_circadian_themes.ps1 -Action Unregister
#>

param(
    [ValidateSet('Register', 'Unregister', 'Status', 'SyncNow', 'ApplyPoint')]
    [string]$Action = 'Register',

    [string]$Theme = 'washi',
    [switch]$SkipEntrainment
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$controller = Join-Path $scriptDir "pocketgull_controller.mjs"
$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$entrainmentScript = Join-Path $scriptDir "entrainment_engine.ps1"
$hueScript         = Join-Path $scriptDir "sync_hue_circadian.ps1"
$peripheralsScript = Join-Path $scriptDir "sync_peripherals_lighting.ps1"
$taskbarScript     = Join-Path $scriptDir "refresh_taskbar_theme.ps1"

$tasks = @(
    @{
        Name           = "PocketGull-Circadian-Morning"
        Time           = "08:00"
        Theme          = "washi"
        Cursor         = "ophthalmic"
        Chime          = "pocketgull_ceramic_chime.wav"
        Entrainment    = "gamma40"
        EntrainmentSec = 300
        Desc           = "08:00 AM Morning Washi Rice Paper + 40 Hz Gamma"
    },
    @{
        Name           = "PocketGull-Circadian-Afternoon"
        Time           = "13:00"
        Theme          = "hemp"
        Cursor         = "ophthalmic"
        Chime          = "pocketgull_432hz_asterisk.wav"
        Entrainment    = "schumann"
        EntrainmentSec = 300
        Desc           = "01:00 PM Afternoon Hemp Fiber + Schumann 7.83 Hz"
    },
    @{
        Name           = "PocketGull-Circadian-Night"
        Time           = "19:30"
        Theme          = "670"
        Cursor         = "scotopic"
        Chime          = "pocketgull_528hz_notification.wav"
        Entrainment    = "focus10"
        EntrainmentSec = 600
        Desc           = "07:30 PM Night Scotopic 670nm Deep Red + Monroe Focus 10"
    }
)

function Start-SilentPwsh {
    param([string]$Arguments)
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

function Apply-CircadianPoint {
    param($Theme, $Cursor, $Chime, $Entrainment, $EntrainmentSec)
    Write-Host "[+] Applying Circadian Shift -> $Theme ($Cursor cursor)..." -ForegroundColor Cyan
    & node $controller theme $Theme
    & node $controller cursor $Cursor

    if (Test-Path $taskbarScript) {
        & $pwsh -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme $Theme | Out-Null
    }

    $chimePath = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\$Chime"
    if (Test-Path $chimePath) {
        try {
            $player = New-Object System.Media.SoundPlayer($chimePath)
            $player.Play()
        } catch {}
    }

    if ((-not $SkipEntrainment) -and $Entrainment -and (Test-Path $entrainmentScript)) {
        Write-Host "  * Triggering automated $Entrainment entrainment ($EntrainmentSec sec)..." -ForegroundColor Green
        Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$entrainmentScript`" -Preset $Entrainment -DurationSec $EntrainmentSec"
    }

    # Synchronize Philips Hue Room Lights
    if (Test-Path $hueScript) {
        Write-Host "  * Synchronizing Philips Hue room lights ($Theme)..." -ForegroundColor Magenta
        Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$hueScript`" -Preset $Theme"
    }

    # Synchronize Razer Chroma & NZXT CAM Peripherals with active theme
    if (Test-Path $peripheralsScript) {
        Write-Host "  * Synchronizing Razer Chroma & NZXT peripherals ($Theme)..." -ForegroundColor DarkRed
        Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$peripheralsScript`" -Theme $Theme"
    }

    # Synchronize Browser Themes
    $browserScript = Join-Path $repoDir "packages\pocketgull-theme\scripts\install_browser_theme.ps1"
    if (Test-Path $browserScript) {
        $browserThemeSlug = switch ($Theme) {
            'washi' { 'pocketgull-washi-rice-paper' }
            'hemp'  { 'pocketgull-hemp-fiber' }
            default { 'pocketgull-scotopic-650nm-red' }
        }
        Write-Host "  * Synchronizing browser theme ($browserThemeSlug)..." -ForegroundColor Cyan
        Start-SilentPwsh "-NoProfile -ExecutionPolicy Bypass -File `"$browserScript`" -Theme $browserThemeSlug -Browser Firefox"
    }
}

if ($Action -eq 'ApplyPoint') {
    $match = $tasks | Where-Object { $_.Theme -eq $Theme } | Select-Object -First 1
    if ($match) {
        Apply-CircadianPoint -Theme $match.Theme -Cursor $match.Cursor -Chime $match.Chime -Entrainment $match.Entrainment -EntrainmentSec $match.EntrainmentSec
    }
    exit 0
}

if ($Action -eq 'SyncNow') {
    $now = Get-Date
    $timeStr = $now.ToString("HH:mm")
    Write-Host "`n[+] Syncing with current solar time ($timeStr)..." -ForegroundColor Cyan

    if ($now.Hour -ge 8 -and ($now.Hour -lt 13)) {
        Apply-CircadianPoint -Theme "washi" -Cursor "ophthalmic" -Chime "pocketgull_ceramic_chime.wav" -Entrainment "gamma40" -EntrainmentSec 300
    }
    elseif ($now.Hour -ge 13 -and ($now.Hour -lt 19 -or ($now.Hour -eq 19 -and $now.Minute -lt 30))) {
        Apply-CircadianPoint -Theme "hemp" -Cursor "ophthalmic" -Chime "pocketgull_432hz_asterisk.wav" -Entrainment "schumann" -EntrainmentSec 300
    }
    else {
        Apply-CircadianPoint -Theme "670" -Cursor "scotopic" -Chime "pocketgull_528hz_notification.wav" -Entrainment "focus10" -EntrainmentSec 600
    }
    exit 0
}

if ($Action -eq 'Unregister') {
    Write-Host "`n[+] Removing PocketGull Circadian Scheduled Tasks..." -ForegroundColor Yellow
    foreach ($t in $tasks) {
        schtasks.exe /delete /tn $t.Name /f 2>$null
        Write-Host "  * Removed $($t.Name)" -ForegroundColor DarkGray
    }
    schtasks.exe /delete /tn "PocketGull-Circadian-Startup" /f 2>$null
    Write-Host "[OK] All circadian scheduled tasks removed.`n" -ForegroundColor Green
    exit 0
}

if ($Action -eq 'Register') {
    Write-Host "`n[+] Registering Headless PocketGull Automatic Circadian Tasks in Windows..." -ForegroundColor Cyan
    $thisScript = $MyInvocation.MyCommand.Path
    $conhostExe = "$env:SystemRoot\System32\conhost.exe"

    foreach ($t in $tasks) {
        $themeName = $t.Theme
        try {
            $taskAction  = New-ScheduledTaskAction -Execute $conhostExe -Argument "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$thisScript`" -Action ApplyPoint -Theme $themeName" -WorkingDirectory $repoDir
            $taskTrigger = New-ScheduledTaskTrigger -Daily -At $t.Time
            $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
            Register-ScheduledTask -TaskName $t.Name -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Description $t.Desc -Force | Out-Null
            Write-Host "  [OK] $($t.Name) scheduled headless daily at $($t.Time) -> $($t.Theme.ToUpper())" -ForegroundColor Green
        } catch {
            Write-Host "  [FAIL] Failed to schedule $($t.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    $startupDir = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupDir "PocketGull Circadian Sync.lnk"
    try {
        $wsh = New-Object -ComObject WScript.Shell
        $sc = $wsh.CreateShortcut($shortcutPath)
        $sc.TargetPath = $conhostExe
        $sc.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$thisScript`" -Action SyncNow -SkipEntrainment"
        $sc.WorkingDirectory = $repoDir
        $icon = Join-Path $repoDir "public\icons\pocketgull.ico"
        if (Test-Path $icon) { $sc.IconLocation = "$icon,0" }
        $sc.Description = "PocketGull Circadian Solar Theme Sync on Startup (Headless)"
        $sc.Save()
        Write-Host "  [OK] PocketGull Circadian Sync installed headless in Windows Startup ($shortcutPath)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Failed to create Startup shortcut: $_" -ForegroundColor Red
    }

    Write-Host "`n[OK] Circadian schedule registered successfully (zero console flash)!`n" -ForegroundColor Green
}

if ($Action -eq 'Status' -or $Action -eq 'Register') {
    Write-Host "=== SCHEDULED CIRCADIAN TASKS STATUS ===" -ForegroundColor Cyan
    foreach ($t in $tasks) {
        $info = schtasks.exe /query /tn $t.Name /fo LIST 2>$null | Out-String
        if ($info -match "Next Run Time:\s+(.*)") {
            $nextRun = $matches[1].Trim()
            Write-Host "  * $($t.Name): Next run at $nextRun" -ForegroundColor White
        } else {
            Write-Host "  * $($t.Name): NOT REGISTERED" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}
