<#
.SYNOPSIS
    PocketGull Automatic Circadian Theme Scheduler for Windows.
    Registers Windows Scheduled Tasks to automatically track the solar cycle:
      * 08:00 AM - Morning Washi Rice Paper (Bright daylight reading, default/ophthalmic cursor)
      * 01:00 PM - Afternoon Hemp Fiber (Soft warm sepia, low visual fatigue)
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

    [string]$Theme = 'washi'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$controller = Join-Path $scriptDir "pocketgull_controller.mjs"
$earconScript = Join-Path $scriptDir "install_pocketgull_earcons.ps1"
$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$entrainmentScript = Join-Path $scriptDir "entrainment_engine.ps1"
$hueScript = Join-Path $scriptDir "sync_hue_circadian.ps1"
$razerScript = Join-Path $scriptDir "test_razer_chroma_sync.ps1"

$tasks = @(
    @{
        Name           = "PocketGull-Circadian-Morning"
        Time           = "08:00"
        Theme          = "washi"
        Cursor         = "default"
        Chime          = "pocketgull_ceramic_chime.wav"
        Entrainment    = "gamma40"
        EntrainmentSec = 300
        Desc           = "08:00 AM Morning Washi Rice Paper + 40 Hz Gamma"
    },
    @{
        Name           = "PocketGull-Circadian-Afternoon"
        Time           = "13:00"
        Theme          = "hemp"
        Cursor         = "default"
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

function Apply-CircadianPoint {
    param($Theme, $Cursor, $Chime, $Entrainment, $EntrainmentSec)
    Write-Host "[+] Applying Circadian Shift -> $Theme ($Cursor cursor)..." -ForegroundColor Cyan
    node $controller theme $Theme
    node $controller cursor $Cursor

    # Force secondary and primary taskbars to repaint via Win32 broadcast
    $taskbarScript = Join-Path $scriptDir "refresh_taskbar_theme.ps1"
    if (Test-Path $taskbarScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $taskbarScript -Theme $Theme | Out-Null
    }
    
    $chimePath = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\$Chime"
    if (Test-Path $chimePath) {
        try {
            $player = New-Object System.Media.SoundPlayer($chimePath)
            $player.Play()
        } catch {}
    }

    if ($Entrainment -and (Test-Path $entrainmentScript)) {
        Write-Host "  * Triggering automated $Entrainment entrainment ($EntrainmentSec sec)..." -ForegroundColor Green
        Start-Process $pwsh -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$entrainmentScript`" -Preset $Entrainment -DurationSec $EntrainmentSec"
    }

    # Synchronize Philips Hue Room Lights
    if (Test-Path $hueScript) {
        Write-Host "  * Synchronizing Philips Hue room lights ($Theme)..." -ForegroundColor Magenta
        Start-Process $pwsh -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hueScript`" -Preset $Theme"
    }

    # Synchronize Razer Chroma Peripherals
    if (Test-Path $razerScript) {
        Write-Host "  * Synchronizing Razer Chroma peripherals ($Theme)..." -ForegroundColor DarkRed
        Start-Process $pwsh -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$razerScript`""
    }

    # Synchronize Browser Themes (Firefox Profile Ingestion & Chromium CRX)
    $browserScript = Join-Path $scriptDir "..\packages\pocketgull-theme\scripts\install_browser_theme.ps1"
    if (Test-Path $browserScript) {
        $browserThemeSlug = switch ($Theme) {
            'washi' { 'pocketgull-washi-rice-paper' }
            'hemp'  { 'pocketgull-hemp-fiber' }
            default { 'pocketgull-scotopic-650nm-red' }
        }
        Write-Host "  * Synchronizing browser theme ($browserThemeSlug)..." -ForegroundColor Cyan
        Start-Process $pwsh -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$browserScript`" -Theme $browserThemeSlug -Browser Firefox"
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
        Apply-CircadianPoint -Theme "washi" -Cursor "default" -Chime "pocketgull_ceramic_chime.wav" -Entrainment "gamma40" -EntrainmentSec 300
    }
    elseif ($now.Hour -ge 13 -and ($now.Hour -lt 19 -or ($now.Hour -eq 19 -and $now.Minute -lt 30))) {
        Apply-CircadianPoint -Theme "hemp" -Cursor "default" -Chime "pocketgull_432hz_asterisk.wav" -Entrainment "schumann" -EntrainmentSec 300
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
    Write-Host "  * Removed PocketGull-Circadian-Startup" -ForegroundColor DarkGray
    Write-Host "[OK] All circadian scheduled tasks removed.`n" -ForegroundColor Green
    exit 0
}

if ($Action -eq 'Register') {
    Write-Host "`n[+] Registering PocketGull Automatic Circadian Tasks in Windows..." -ForegroundColor Cyan
    $thisScript = $MyInvocation.MyCommand.Path
    
    foreach ($t in $tasks) {
        $themeName = $t.Theme
        $cmdLine = "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$thisScript`" -Action ApplyPoint -Theme $themeName"
        
        # Register via schtasks
        $res = & schtasks.exe /create /tn $t.Name /tr "`"$cmdLine`"" /sc daily /st $t.Time /f 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $($t.Name) scheduled daily at $($t.Time) -> $($t.Theme.ToUpper())" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Failed to schedule $($t.Name): $res" -ForegroundColor Red
        }
    }

    # Register User Startup Shortcut
    $startupDir = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupDir "PocketGull Circadian Sync.lnk"
    try {
        $wsh = New-Object -ComObject WScript.Shell
        $sc = $wsh.CreateShortcut($shortcutPath)
        $sc.TargetPath = $pwsh
        $sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$thisScript`" -Action SyncNow"
        $sc.WorkingDirectory = $scriptDir
        $icon = Join-Path $scriptDir "..\public\icons\pocketgull.ico"
        if (Test-Path $icon) { $sc.IconLocation = "$icon,0" }
        $sc.Description = "PocketGull Circadian Solar Theme Sync on Startup"
        $sc.Save()
        Write-Host "  [OK] PocketGull Circadian Sync installed in Windows Startup ($shortcutPath)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Failed to create Startup shortcut: $_" -ForegroundColor Red
    }
    
    Write-Host "`n[OK] Circadian schedule registered successfully!" -ForegroundColor Green
    Write-Host "    - Windows Startup: Immediate Solar Clock Sync (SyncNow)"
    Write-Host "    - Daily 08:00 AM: Washi Paper + Ceramic Bell + Hue Daylight + Razer Daylight"
    Write-Host "    - Daily 01:00 PM: Hemp Fiber + 432 Hz Philocardia + Hue Sepia + Razer Warm"
    Write-Host "    - Daily 07:30 PM: Scotopic 670nm Deep Red + 528 Hz + Hue Red + Razer Red`n"
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
    $startupDir = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupDir "PocketGull Circadian Sync.lnk"
    if (Test-Path $shortcutPath) {
        Write-Host "  * Windows Startup Sync: INSTALLED ($shortcutPath)" -ForegroundColor Green
    } else {
        Write-Host "  * Windows Startup Sync: NOT INSTALLED" -ForegroundColor DarkGray
    }
    Write-Host ""
}
