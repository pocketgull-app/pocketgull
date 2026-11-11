# SPDX-License-Identifier: Apache-2.0
# PocketGull Desktop & Assistive Ergonomics Suite Installer
# One-click, zero-administrative-elevation setup for Windows.
# Configures 38 Superfamily Fonts, 13-Cut 64px Cursors, MouseAssist Hook, Themes, Terminal, and 4-Slot Tray Deck.

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host "       ⚕ POCKETGULL DESKTOP & ASSISTIVE ERGONOMICS SUITE          " -ForegroundColor Cyan
Write-Host "       Ophthalmic Typography • Motor Shield • 4-Slot Control Deck " -ForegroundColor DarkGray
Write-Host "  ================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 38 SUPERFAMILY BRAND FONTS
Write-Host "  [1/6] Registering 38 Superfamily Fonts in Windows..." -ForegroundColor Yellow
$fontScript = Join-Path $scriptDir "install_brand_fonts.ps1"
if (Test-Path $fontScript) {
    & $pwsh -NoProfile -ExecutionPolicy Bypass -File $fontScript | Out-Null
    Write-Host "        ✔ 38 TrueType superfamily cuts installed in HKCU Fonts." -ForegroundColor Green
}

# 2. ACCESSIBILITY CURSOR SCHEMES (13-Cut Suite incl. Hand & Resize)
Write-Host "  [2/6] Building & Registering 64px Clinical Cursor Schemes..." -ForegroundColor Yellow
$cursorScript = Join-Path $scriptDir "generate_pocketgull_cursors.ps1"
if (Test-Path $cursorScript) {
    & $pwsh -NoProfile -ExecutionPolicy Bypass -File $cursorScript | Out-Null
    Write-Host "        ✔ Ophthalmic High-Contrast & Scotopic 650nm Red 13-cut cursors created." -ForegroundColor Green
}

# 3. WINDOWS SYSTEM THEMES & EARCONS
Write-Host "  [3/6] Deploying Native Windows .theme Profiles & Organic Earcons..." -ForegroundColor Yellow
$themesSourceDir   = Join-Path $repoDir "packages\pocketgull-theme\system\windows"
$themesTargetDir   = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Themes"
$pocketgullDataDir = Join-Path $env:LOCALAPPDATA "PocketGull"
$binDir            = Join-Path $pocketgullDataDir "bin"
@($pocketgullDataDir, $binDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

foreach ($wp in @(
    (Join-Path $repoDir "public\images\synaptic_quilling_backdrop.jpg"),
    (Join-Path $repoDir "public\images\rice_paper_texture.png")
)) {
    if (Test-Path $wp) { Copy-Item $wp -Destination $pocketgullDataDir -Force }
}
if (Test-Path $themesSourceDir) {
    Get-ChildItem $themesSourceDir -Filter "*.theme" | ForEach-Object {
        Copy-Item $_.FullName -Destination $themesTargetDir -Force
    }
}
$earconScript = Join-Path $scriptDir "install_pocketgull_earcons.ps1"
if (Test-Path $earconScript) {
    & $pwsh -NoProfile -ExecutionPolicy Bypass -File $earconScript -Action Apply | Out-Null
}

# 4. WINDOWS TERMINAL JSON FRAGMENT
Write-Host "  [4/6] Deploying Windows Terminal JSON Fragment..." -ForegroundColor Yellow
$wtFragDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows Terminal\Fragments\PocketGull"
if (-not (Test-Path $wtFragDir)) {
    New-Item -ItemType Directory -Path $wtFragDir -Force | Out-Null
}
$wtSource = Join-Path $repoDir "packages\pocketgull-theme\system\windows-terminal\PocketGull.json"
if (Test-Path $wtSource) {
    Copy-Item $wtSource -Destination (Join-Path $wtFragDir "PocketGull.json") -Force
}

# 5. MOUSEASSIST HOOK & TREMOR BOUNCE FILTER
Write-Host "  [5/6] Provisioning MouseAssist Side-Button & Bounce Filter Hook..." -ForegroundColor Yellow
Copy-Item (Join-Path $scriptDir "MouseAssist.cs"), (Join-Path $scriptDir "Start-MouseAssist.ps1") -Destination $binDir -Force
$startupDir = [Environment]::GetFolderPath('Startup')
$mouseShortcut = Join-Path $startupDir "PocketGull Mouse Assist.lnk"
$brandIconCandidate   = Join-Path $repoDir "public\icons\pocketgull.ico"
$flutterIconCandidate = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"
$iconPath = if (Test-Path $brandIconCandidate) { $brandIconCandidate } else { $flutterIconCandidate }

$conhostExe = "$env:SystemRoot\System32\conhost.exe"
$wsh = New-Object -ComObject WScript.Shell
$scMouse = $wsh.CreateShortcut($mouseShortcut)
$scMouse.TargetPath = $conhostExe
$scMouse.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$binDir\Start-MouseAssist.ps1`""
$scMouse.WorkingDirectory = $binDir
if (Test-Path $iconPath) { $scMouse.IconLocation = "$iconPath,0" }
$scMouse.Description = "PocketGull Mouse Side-Button Chords & Ataxia Bounce Filter"
$scMouse.Save()

$psiM = New-Object System.Diagnostics.ProcessStartInfo($pwsh, "-NoProfile -ExecutionPolicy Bypass -File `"$binDir\Start-MouseAssist.ps1`"")
$psiM.WorkingDirectory = $binDir; $psiM.UseShellExecute = $false; $psiM.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psiM) | Out-Null

# 6. RESIDENT SYSTEM TRAY & 4-SLOT CONTROL DECK
Write-Host "  [6/6] Configuring Persistent Windows Notification Area Tray..." -ForegroundColor Yellow
$startupShortcut = Join-Path $startupDir "PocketGull Assistive Tray.lnk"
$trayScript = Join-Path $scriptDir "pocketgull_tray.ps1"

$sc = $wsh.CreateShortcut($startupShortcut)
$sc.TargetPath = $conhostExe
$sc.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$trayScript`""
if (Test-Path $iconPath) { $sc.IconLocation = "$iconPath,0" }
$sc.Description = "PocketGull Assistive Technology & 4-Slot Control Deck"
$sc.WorkingDirectory = $repoDir
$sc.Save()

$psiT = New-Object System.Diagnostics.ProcessStartInfo($pwsh, "-NoProfile -ExecutionPolicy Bypass -File `"$trayScript`"")
$psiT.WorkingDirectory = $repoDir; $psiT.UseShellExecute = $false; $psiT.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psiT) | Out-Null

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "       ✔ POCKETGULL SUITE SUCCESSFULLY INSTALLED (100% USER-SPACE)" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  • Left-Click Tray:   Opens 4-Slot Dysmetria-Safe Control Deck." -ForegroundColor White
Write-Host "  • Right-Click Tray:  Quick theme, cursor, motor shield & pacing controls." -ForegroundColor White
Write-Host "  • Terminal Control:  Run 'gull scene', 'gull ergo', or 'gull status'." -ForegroundColor White
Write-Host ""
