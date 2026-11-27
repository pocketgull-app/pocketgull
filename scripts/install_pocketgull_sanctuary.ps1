# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    PocketGull Assistive Technology, Circadian Themes & Sanctuary Audio One-Click Installer.
.DESCRIPTION
    Registers Start Menu & Startup entries anchored to the canonical PocketGull scripts
    directory, deploys MouseAssist to %LOCALAPPDATA%\PocketGull\bin, and starts the daemon.
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRepo = Split-Path -Parent $scriptDir
$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$appName     = "PocketGull Assistive Sanctuary"
$installRoot = "$env:LOCALAPPDATA\PocketGull"
$binDir      = "$installRoot\bin"
$soundsDir   = "$installRoot\Sounds"
$programsDir = [Environment]::GetFolderPath('Programs')
$startupDir  = [Environment]::GetFolderPath('Startup')

$startMenuShortcut = Join-Path $programsDir "$appName.lnk"
$startupShortcut   = Join-Path $startupDir "PocketGull Assistive Tray.lnk"
$mouseShortcut     = Join-Path $startupDir "PocketGull Mouse Assist.lnk"

if ($Uninstall) {
    Write-Host "`n[+] Uninstalling $appName..." -ForegroundColor Yellow
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match 'pocketgull_tray\.ps1|Start-MouseAssist\.ps1|sit_stand_pacer\.ps1' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    foreach ($lnk in @($startMenuShortcut, $startupShortcut, $mouseShortcut, (Join-Path $startupDir "$appName.lnk"))) {
        if (Test-Path $lnk) { Remove-Item $lnk -Force }
    }
    Write-Host "[OK] $appName shortcuts and daemons stopped." -ForegroundColor Green
    return
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   $appName - Workstation Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

@($installRoot, $binDir, $soundsDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

Copy-Item (Join-Path $scriptDir "MouseAssist.cs"), (Join-Path $scriptDir "Start-MouseAssist.ps1") -Destination $binDir -Force

$conhostExe    = "$env:SystemRoot\System32\conhost.exe"
$trayScript    = Join-Path $scriptDir "pocketgull_tray.ps1"
$iconCandidate = Join-Path $sourceRepo "public\icons\pocketgull.ico"
$wsh = New-Object -ComObject WScript.Shell

foreach ($targetLnk in @($startMenuShortcut, $startupShortcut)) {
    $sc = $wsh.CreateShortcut($targetLnk)
    $sc.TargetPath = $conhostExe
    $sc.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$trayScript`""
    $sc.WorkingDirectory = $sourceRepo
    if (Test-Path $iconCandidate) { $sc.IconLocation = "$iconCandidate,0" }
    $sc.Description = "PocketGull Assistive Technology, Circadian Themes & 4-Slot Control Deck"
    $sc.Save()
}

$scMouse = $wsh.CreateShortcut($mouseShortcut)
$scMouse.TargetPath = $conhostExe
$scMouse.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$binDir\Start-MouseAssist.ps1`""
$scMouse.WorkingDirectory = $binDir
if (Test-Path $iconCandidate) { $scMouse.IconLocation = "$iconCandidate,0" }
$scMouse.Description = "PocketGull Mouse Side-Button Chords & Ataxia Bounce Filter"
$scMouse.Save()

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'pocketgull_tray\.ps1|Start-MouseAssist\.ps1' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

$psiM = New-Object System.Diagnostics.ProcessStartInfo($pwsh, "-NoProfile -ExecutionPolicy Bypass -File `"$binDir\Start-MouseAssist.ps1`"")
$psiM.WorkingDirectory = $binDir; $psiM.UseShellExecute = $false; $psiM.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psiM) | Out-Null

$psiT = New-Object System.Diagnostics.ProcessStartInfo($pwsh, "-NoProfile -ExecutionPolicy Bypass -File `"$trayScript`"")
$psiT.WorkingDirectory = $sourceRepo; $psiT.UseShellExecute = $false; $psiT.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psiT) | Out-Null

Write-Host "`n[SUCCESS] $appName is live (Tray + 4-Slot Deck + MouseAssist Hook)!`n" -ForegroundColor Green
