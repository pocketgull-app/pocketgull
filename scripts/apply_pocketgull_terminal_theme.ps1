# PocketGull Terminal Theme Switcher: Circadian Auto, Washi Rice Paper & Ophthalmic Obsidian
param(
    [ValidateSet('auto', 'washi', 'ophthalmic')]
    [string]$Theme = 'auto',
    [switch]$SetDefault
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$TerminalDir = Join-Path $RepoRoot "public\brand\terminal"

# Circadian bio-rhythm evaluation (07:00 - 17:59 = Daytime Washi, 18:00 - 06:59 = Evening Obsidian)
$CurrentHour = (Get-Date).Hour
$IsDaytime = ($CurrentHour -ge 7 -and $CurrentHour -lt 18)

$ActiveTheme = if ($Theme -eq 'auto') {
    if ($IsDaytime) { 'washi' } else { 'ophthalmic' }
} else {
    $Theme
}

$ThemeFile = if ($ActiveTheme -eq 'washi') {
    Join-Path $TerminalDir "pocketgull-washi.omp.json"
} else {
    Join-Path $TerminalDir "pocketgull-ophthalmic.omp.json"
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "       POCKETGULL CIRCADIAN TERMINAL HUD - THEME ENGINE            " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

if ($Theme -eq 'auto') {
    Write-Host "  Circadian Schedule: " -NoNewline
    Write-Host "ACTIVE" -ForegroundColor Green -NoNewline
    Write-Host " (System Time: $(Get-Date -Format 'HH:mm'))" -ForegroundColor DarkGray
    if ($IsDaytime) {
        Write-Host "  Daylight Phase:     Washi Rice Paper (Optotype High-Acuity Reading)" -ForegroundColor Yellow
    } else {
        Write-Host "  Nightfall Phase:    Obsidian Ophthalmic (Circadian Melatonin / Low-Strain)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  Manual Override:    " -NoNewline
    if ($Theme -eq 'washi') {
        Write-Host "Washi Rice Paper (Tactile Mulberry Fiber)" -ForegroundColor Yellow
    } else {
        Write-Host "Obsidian Ophthalmic (Dark Obsidian - WCAG AAA)" -ForegroundColor Cyan
    }
}

Write-Host "  Theme Config:       $ThemeFile" -ForegroundColor DarkGray
Write-Host ""

if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    Write-Host "  [OK] oh-my-posh detected on PATH." -ForegroundColor Green

    # Apply in current session
    & oh-my-posh init pwsh --config "$ThemeFile" | Invoke-Expression

    if ($SetDefault) {
        $ProfilePath = $PROFILE
        $ProfileDir = Split-Path -Parent $ProfilePath
        if (-not (Test-Path $ProfileDir)) {
            New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
        }

        $InitSnippet = @"

# PocketGull Circadian Terminal Engine
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    `$h = (Get-Date).Hour
    `$cfg = if (`$h -ge 7 -and `$h -lt 18) {
        "$TerminalDir\pocketgull-washi.omp.json"
    } else {
        "$TerminalDir\pocketgull-ophthalmic.omp.json"
    }
    oh-my-posh init pwsh --config `$cfg | Invoke-Expression
}
"@
        Add-Content -Path $ProfilePath -Value $InitSnippet
        Write-Host "  [SUCCESS] Circadian auto-switching appended to `$PROFILE ($ProfilePath)" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  To make Circadian switching permanent across all PowerShell terminals:" -ForegroundColor White
        Write-Host "    .\scripts\apply_pocketgull_terminal_theme.ps1 -Theme auto -SetDefault" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [!] oh-my-posh is not currently on PATH." -ForegroundColor Yellow
    Write-Host "  Install via: winget install JanDeDobbeleer.OhMyPosh -s winget" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Windows Terminal Palette:" -ForegroundColor White
Write-Host "  Color schemes available in: $TerminalDir\windows-terminal-schemes.json" -ForegroundColor DarkGray
Write-Host ""
