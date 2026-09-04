# Packages the Chrome theme folders into zip files for 1-click installation
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$WashiDir = Join-Path $ScriptDir "washi"
$WashiZip = Join-Path $ScriptDir "pocketgull-washi-chrome-theme.zip"

$ObsidianDir = Join-Path $ScriptDir "obsidian"
$ObsidianZip = Join-Path $ScriptDir "pocketgull-obsidian-chrome-theme.zip"

if (Test-Path $WashiZip) { Remove-Item $WashiZip -Force }
if (Test-Path $ObsidianZip) { Remove-Item $ObsidianZip -Force }

Compress-Archive -Path "$WashiDir\*" -DestinationPath $WashiZip -Force
Compress-Archive -Path "$ObsidianDir\*" -DestinationPath $ObsidianZip -Force

Write-Host "Created:" -ForegroundColor Green
Write-Host "  $WashiZip" -ForegroundColor Yellow
Write-Host "  $ObsidianZip" -ForegroundColor Cyan
