# PocketGull Windows Startup Registration & Lifecycle Utility
# Adds, verifies, or cleanly removes the PocketGull Assistive Tray in Windows Startup folder

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$startupDir = [Environment]::GetFolderPath('Startup')
$startupShortcut = Join-Path $startupDir "PocketGull Assistive Tray.lnk"

if ($Uninstall) {
    if (Test-Path $startupShortcut) {
        Remove-Item -Path $startupShortcut -Force
        Write-Host "`n[OK] Successfully removed PocketGull Assistive Tray from Windows Startup." -ForegroundColor Green
        Write-Host "Path removed: $startupShortcut`n" -ForegroundColor DarkGray
    } else {
        Write-Host "`n[INFO] PocketGull Assistive Tray is not registered in Windows Startup. (Clean state)`n" -ForegroundColor Cyan
    }
    return
}
$repoDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Test-Path $repoDir)) {
    $repoDir = "C:\Users\philg\Pocketgull\pocketgull"
}
$trayScript = Join-Path $repoDir "scripts\pocketgull_tray.ps1"
$iconPath = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"

# Resolve full path to pwsh.exe
$pwshPath = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell.exe).Source
}

$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($startupShortcut)
$sc.TargetPath = $pwshPath
$sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`""
if (Test-Path $iconPath) {
    $sc.IconLocation = "$iconPath,0"
}
$sc.WorkingDirectory = $repoDir
$sc.Description = "PocketGull Assistive Technology & Cognitive Ergonomics Tray"
$sc.Save()

Write-Host "`n=== POCKETGULL WINDOWS STARTUP REGISTRATION ===" -ForegroundColor Cyan
Write-Host "Shortcut created: $startupShortcut" -ForegroundColor Green
Write-Host "Target:           $pwshPath" -ForegroundColor White
Write-Host "Arguments:        -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$trayScript`"" -ForegroundColor DarkGray
Write-Host "Icon:             $iconPath" -ForegroundColor White
Write-Host "Working Dir:      $repoDir" -ForegroundColor DarkGray
Write-Host "Status:           ACTIVE • Launches automatically on Windows logon.`n" -ForegroundColor Green

# Verify shortcut exists and is non-zero
$item = Get-Item $startupShortcut
[PSCustomObject]@{
    Name = $item.Name
    Size = "$($item.Length) bytes"
    Path = $item.FullName
    Created = $item.CreationTime
} | Format-Table -AutoSize
