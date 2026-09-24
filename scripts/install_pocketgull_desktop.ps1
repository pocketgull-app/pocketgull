# PocketGull Desktop & Assistive Ergonomics Suite Installer
# One-click, zero-administrative-elevation setup for Windows.
# Configures 38 Superfamily Fonts, Cursor Schemes, Windows Themes, Terminal Fragments, and Startup Tray.

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host "       ⚕ POCKETGULL DESKTOP & ASSISTIVE ERGONOMICS SUITE          " -ForegroundColor Cyan
Write-Host "       Ophthalmic Typography • Vagal Resonance • System Themes    " -ForegroundColor DarkGray
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 38 SUPERFAMILY BRAND FONTS
Write-Host "  [1/5] Registering 38 Superfamily Fonts in Windows..." -ForegroundColor Yellow
$fontScript = Join-Path $scriptDir "install_brand_fonts.ps1"
if (Test-Path $fontScript) {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $fontScript | Out-Null
    Write-Host "        ✔ 38 TrueType superfamily cuts installed in HKCU Fonts & GDI cache." -ForegroundColor Green
} else {
    Write-Host "        ⚠️ Font install script not found at $fontScript" -ForegroundColor Red
}

# 2. ACCESSIBILITY CURSOR SCHEMES
Write-Host "  [2/5] Building & Registering 64px Clinical Cursor Schemes..." -ForegroundColor Yellow
$cursorScript = Join-Path $scriptDir "generate_pocketgull_cursors.ps1"
if (Test-Path $cursorScript) {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $cursorScript | Out-Null
    Write-Host "        ✔ Ophthalmic High-Contrast (Obsidian/Cyan) & Scotopic 650nm Red cursors created." -ForegroundColor Green
} else {
    Write-Host "        ⚠️ Cursor script not found at $cursorScript" -ForegroundColor Red
}

# 3. WINDOWS SYSTEM THEMES (.theme files)
Write-Host "  [3/5] Deploying Native Windows .theme Profiles..." -ForegroundColor Yellow
$themesSourceDir = Join-Path $repoDir "packages\pocketgull-theme\system\windows"
$themesTargetDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Themes"
$pocketgullDataDir = Join-Path $env:LOCALAPPDATA "PocketGull"
if (-not (Test-Path $pocketgullDataDir)) {
    New-Item -ItemType Directory -Path $pocketgullDataDir -Force | Out-Null
}
$wallpaperObsidian = Join-Path $repoDir "public\images\synaptic_quilling_backdrop.jpg"
if (Test-Path $wallpaperObsidian) {
    Copy-Item $wallpaperObsidian -Destination $pocketgullDataDir -Force
}
$wallpaperWashi = Join-Path $repoDir "public\images\rice_paper_texture.png"
if (Test-Path $wallpaperWashi) {
    Copy-Item $wallpaperWashi -Destination $pocketgullDataDir -Force
}

if (Test-Path $themesSourceDir) {
    Get-ChildItem $themesSourceDir -Filter "*.theme" | ForEach-Object {
        Copy-Item $_.FullName -Destination $themesTargetDir -Force
        Write-Host "        ✔ Deployed $($_.Name) -> %LOCALAPPDATA%\Themes" -ForegroundColor DarkCyan
    }
}

# 4. WINDOWS TERMINAL JSON FRAGMENT
Write-Host "  [4/5] Deploying Windows Terminal JSON Fragment..." -ForegroundColor Yellow
$wtFragDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows Terminal\Fragments\PocketGull"
if (-not (Test-Path $wtFragDir)) {
    New-Item -ItemType Directory -Path $wtFragDir -Force | Out-Null
}
$wtSource = Join-Path $repoDir "packages\pocketgull-theme\system\windows-terminal\PocketGull.json"
if (Test-Path $wtSource) {
    Copy-Item $wtSource -Destination (Join-Path $wtFragDir "PocketGull.json") -Force
    Write-Host "        ✔ Windows Terminal profiles synchronized with Pocket Gull Mono." -ForegroundColor Green
}

# 5. RESIDENT SYSTEM TRAY DAEMON (JAWS-Style Startup)
Write-Host "  [5/5] Configuring Persistent Windows Notification Area Tray..." -ForegroundColor Yellow
$startupDir = [Environment]::GetFolderPath('Startup')
$startupShortcut = Join-Path $startupDir "PocketGull Assistive Tray.lnk"
$trayScript = Join-Path $scriptDir "pocketgull_tray.ps1"
$brandIconCandidate = Join-Path $repoDir "public\icons\pocketgull.ico"
$flutterIconCandidate = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"
$iconPath = if (Test-Path $brandIconCandidate) { $brandIconCandidate } else { $flutterIconCandidate }

$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($startupShortcut)
$sc.TargetPath = "pwsh.exe"
$sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""
if (Test-Path $iconPath) {
    $sc.IconLocation = "$iconPath,0"
}
$sc.Description = "PocketGull Assistive Technology & Cognitive Ergonomics Tray"
$sc.WorkingDirectory = $repoDir
$sc.Save()

Write-Host "        ✔ Startup shortcut placed in: $startupShortcut" -ForegroundColor Green

# Launch the tray daemon now
Start-Process "pwsh.exe" -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "       ✔ POCKETGULL SUITE SUCCESSFULLY INSTALLED (100% USER-SPACE)" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  • Notification Area: PocketGull icon active in Windows System Tray." -ForegroundColor White
Write-Host "  • Quick Access:      Right-click tray icon to toggle themes, cursors, or Philocardia." -ForegroundColor White
Write-Host "  • Double-Click:      Instantly cycles circadian day/night presets." -ForegroundColor White
Write-Host "  • Terminal Control:  Run 'gull theme', 'gull cursor', or 'gull status'." -ForegroundColor White
Write-Host ""
