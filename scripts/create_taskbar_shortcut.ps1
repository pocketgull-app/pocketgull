# PocketGull Taskbar & Desktop Shortcut Creator
# Creates a rich, branded Windows shortcut with the official PocketGull icon.
# Places the shortcut on the TaskBar, Start Menu, and Desktop.

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$DesktopOnly,

    [Parameter(Mandatory = $false)]
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir
$iconPath = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"
$trayScript = Join-Path $scriptDir "pocketgull_tray.ps1"

# Target locations
$taskbarDir = Join-Path $env:APPDATA "Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar"
$taskbarShortcut = Join-Path $taskbarDir "PocketGull.lnk"
$programsDir = [Environment]::GetFolderPath('Programs')
$startMenuShortcut = Join-Path $programsDir "PocketGull.lnk"
$desktopDir = [Environment]::GetFolderPath('Desktop')
$desktopShortcut = Join-Path $desktopDir "PocketGull.lnk"

if ($Uninstall) {
    Write-Host "`n=== REMOVING POCKETGULL SHORTCUTS ===" -ForegroundColor Yellow
    @($taskbarShortcut, $startMenuShortcut, $desktopShortcut) | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item -Path $_ -Force
            Write-Host "  ✔ Removed: $_" -ForegroundColor DarkGray
        }
    }
    Write-Host "[OK] PocketGull shortcuts cleanly uninstalled.`n" -ForegroundColor Green
    return
}

# Resolve PowerShell path
$pwshPath = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell.exe).Source
}

Write-Host "`n=== CREATING POCKETGULL SHORTCUTS ===" -ForegroundColor Cyan
Write-Host "Icon:       $iconPath" -ForegroundColor DarkGray
Write-Host "Target:     $pwshPath" -ForegroundColor DarkGray
Write-Host "Action:     Launch Assistive Tray Daemon on-demand" -ForegroundColor DarkGray

$wsh = New-Object -ComObject WScript.Shell

function New-PocketGullLnk {
    param([string]$DestinationPath)

    $parent = Split-Path -Parent $DestinationPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $sc = $wsh.CreateShortcut($DestinationPath)
    $sc.TargetPath = $pwshPath
    $sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""
    if (Test-Path $iconPath) {
        $sc.IconLocation = "$iconPath,0"
    }
    $sc.WorkingDirectory = $repoDir
    $sc.Description = "PocketGull Assistive Technology, Ergonomics & Sovereign Local AI"
    $sc.Save()

    Write-Host "  ✔ Created: $DestinationPath" -ForegroundColor Green
}

# 1. Start Menu Programs shortcut
New-PocketGullLnk -DestinationPath $startMenuShortcut

# 2. Desktop shortcut
New-PocketGullLnk -DestinationPath $desktopShortcut

# 3. Pinned Taskbar shortcut
if (-not $DesktopOnly -and (Test-Path $taskbarDir)) {
    New-PocketGullLnk -DestinationPath $taskbarShortcut
}

Write-Host "`n[OK] PocketGull taskbar & desktop shortcuts successfully created!" -ForegroundColor Cyan
Write-Host "Click the PocketGull icon on your taskbar or desktop anytime to launch the tray.`n" -ForegroundColor White
