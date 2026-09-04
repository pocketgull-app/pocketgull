# Packages the Firefox theme folders into .xpi extensions
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$WashiDir = Join-Path $ScriptDir "washi"
$WashiZip = Join-Path $ScriptDir "pocketgull-washi-firefox-theme.zip"
$WashiXpi = Join-Path $ScriptDir "pocketgull-washi-firefox-theme.xpi"

$ObsidianDir = Join-Path $ScriptDir "obsidian"
$ObsidianZip = Join-Path $ScriptDir "pocketgull-obsidian-firefox-theme.zip"
$ObsidianXpi = Join-Path $ScriptDir "pocketgull-obsidian-firefox-theme.xpi"

if (Test-Path $WashiZip) { Remove-Item $WashiZip -Force }
if (Test-Path $WashiXpi) { Remove-Item $WashiXpi -Force }
if (Test-Path $ObsidianZip) { Remove-Item $ObsidianZip -Force }
if (Test-Path $ObsidianXpi) { Remove-Item $ObsidianXpi -Force }

Compress-Archive -Path "$WashiDir\*" -DestinationPath $WashiZip -Force
Rename-Item -Path $WashiZip -NewName (Split-Path -Leaf $WashiXpi) -Force

Compress-Archive -Path "$ObsidianDir\*" -DestinationPath $ObsidianZip -Force
Rename-Item -Path $ObsidianZip -NewName (Split-Path -Leaf $ObsidianXpi) -Force

Write-Host "Created Firefox XPI Add-ons:" -ForegroundColor Green
Write-Host "  $WashiXpi" -ForegroundColor Yellow
Write-Host "  $ObsidianXpi" -ForegroundColor Cyan
