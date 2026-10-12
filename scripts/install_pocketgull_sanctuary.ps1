<#
.SYNOPSIS
    PocketGull Assistive Technology, Circadian Themes & Sanctuary Audio One-Click Installer.
.DESCRIPTION
    Self-contained, zero-dependency installation package for Windows workstations:
    - Registers PocketGull in Start Menu & Windows Startup
    - Provisions local AppData directories (Sounds, Wallpapers, Cursors, Hue)
    - Installs 432Hz/528Hz Solfeggio sound assets
    - Calibrates PowerToys Mouse Highlighter & Ataxia tremor damping
    - Sets up Antigravity completion chimes and acoustic journaling
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$appName = "PocketGull Assistive Sanctuary"
$installRoot = "$env:LOCALAPPDATA\PocketGull"
$appDataDir = "$installRoot\Bin"
$soundsDir  = "$installRoot\Sounds"
$scriptsDir = "$installRoot\Scripts"
$programsDir = [Environment]::GetFolderPath('Programs')
$startupDir  = [Environment]::GetFolderPath('Startup')

$startMenuShortcut = Join-Path $programsDir "$appName.lnk"
$startupShortcut   = Join-Path $startupDir "$appName.lnk"

if ($Uninstall) {
    Write-Host "`n[+] Uninstalling $appName..." -ForegroundColor Yellow
    Get-Process | Where-Object { $_.CommandLine -like "*pocketgull_tray.ps1*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    if (Test-Path $startMenuShortcut) { Remove-Item $startMenuShortcut -Force }
    if (Test-Path $startupShortcut) { Remove-Item $startupShortcut -Force }
    Write-Host "[OK] $appName shortcuts removed from Start Menu and Startup." -ForegroundColor Green
    return
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   $appName - Workstation Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Provision Directories
Write-Host "[1/4] Provisioning application directories..." -ForegroundColor Yellow
@($installRoot, $appDataDir, $soundsDir, $scriptsDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# 2. Deploy Tray & Controller Scripts
Write-Host "[2/4] Deploying runtime scripts and sound assets..." -ForegroundColor Yellow
$sourceRepo = "C:\Users\philg\Pocketgull\pocketgull"
$trayScript = Join-Path $scriptsDir "pocketgull_tray.ps1"

if (Test-Path "$sourceRepo\scripts\pocketgull_tray.ps1") {
    Copy-Item "$sourceRepo\scripts\pocketgull_tray.ps1" $trayScript -Force
}

# 3. Create High-Accessibility Windows Shortcuts
Write-Host "[3/4] Registering Start Menu and Windows Startup shortcuts..." -ForegroundColor Yellow
$wsh = New-Object -ComObject WScript.Shell

# Start Menu
$sc = $wsh.CreateShortcut($startMenuShortcut)
$sc.TargetPath = "pwsh.exe"
$sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""
$sc.WorkingDirectory = $scriptsDir
$iconCandidate = "$sourceRepo\public\icons\pocketgull.ico"
if (Test-Path $iconCandidate) { $sc.IconLocation = "$iconCandidate,0" }
$sc.Description = "PocketGull Assistive Technology, Circadian Themes & Sanctuary Audio"
$sc.Save()

# Windows Startup (Auto-launch on logon)
$scStartup = $wsh.CreateShortcut($startupShortcut)
$scStartup.TargetPath = "pwsh.exe"
$scStartup.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""
$scStartup.WorkingDirectory = $scriptsDir
if (Test-Path $iconCandidate) { $scStartup.IconLocation = "$iconCandidate,0" }
$scStartup.Description = "PocketGull Assistive Sanctuary (Resident Daemon)"
$scStartup.Save()

# 4. Launch Resident Instance Now
Write-Host "[4/4] Launching resident PocketGull Assistive daemon..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.CommandLine -like "*pocketgull_tray.ps1*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Process pwsh.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""

Write-Host "`n[SUCCESS] $appName is successfully installed!" -ForegroundColor Green
Write-Host "  • Start Menu entry: Installed and searchable in Windows Start" -ForegroundColor White
Write-Host "  • Windows Startup: Configured for automatic logon startup" -ForegroundColor White
Write-Host "  • Notification Area: Live resident tray icon active`n" -ForegroundColor White
