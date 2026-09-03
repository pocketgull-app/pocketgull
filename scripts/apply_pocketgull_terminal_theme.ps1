# PocketGull Terminal Theme Switcher: Washi Rice Paper & Ophthalmic Obsidian
param(
    [ValidateSet('washi', 'ophthalmic')]
    [string]$Theme = 'washi'
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$TerminalDir = Join-Path $RepoRoot "public\brand\terminal"

$ThemeFile = if ($Theme -eq 'washi') {
    Join-Path $TerminalDir "pocketgull-washi.omp.json"
} else {
    Join-Path $TerminalDir "pocketgull-ophthalmic.omp.json"
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "       POCKETGULL TERMINAL HUD - THEME ACTIVATION ENGINE           " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Selected Aesthetic: " -NoNewline
if ($Theme -eq 'washi') {
    Write-Host "Washi Rice Paper (Tactile Mulberry Fiber)" -ForegroundColor Yellow
} else {
    Write-Host "Obsidian Ophthalmic (Dark Obsidian - WCAG AAA)" -ForegroundColor Cyan
}

Write-Host "  Theme Config Path:  $ThemeFile" -ForegroundColor DarkGray
Write-Host ""

if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    Write-Host "  [OK] oh-my-posh detected on PATH." -ForegroundColor Green
    Write-Host ""
    Write-Host "  To activate this theme permanently in your PowerShell profile ($PROFILE):" -ForegroundColor White
    Write-Host "    oh-my-posh init pwsh --config `"$ThemeFile`" | Invoke-Expression" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  To test it immediately in your current terminal:" -ForegroundColor White
    Write-Host "    & oh-my-posh init pwsh --config `"$ThemeFile`" | Invoke-Expression" -ForegroundColor Green
} else {
    Write-Host "  [!] oh-my-posh is not currently on PATH." -ForegroundColor Yellow
    Write-Host "  Install via: winget install JanDeDobbeleer.OhMyPosh -s winget" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Windows Terminal Palette:" -ForegroundColor White
Write-Host "  Color schemes and font settings available in: " -NoNewline
Write-Host "$TerminalDir\windows-terminal-schemes.json" -ForegroundColor Cyan
Write-Host ""
