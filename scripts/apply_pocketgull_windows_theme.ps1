# PocketGull Native Windows Theme Switcher: Circadian Auto, Washi Rice Paper & Obsidian Ophthalmic
param(
    [ValidateSet('auto', 'washi', 'ophthalmic')]
    [string]$Theme = 'auto',
    [switch]$LaunchThemeFile
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ThemesDir = "$env:LOCALAPPDATA\Microsoft\Windows\Themes"

$CurrentHour = (Get-Date).Hour
$IsDaytime = ($CurrentHour -ge 7 -and $CurrentHour -lt 18)

$ActiveTheme = if ($Theme -eq 'auto') {
    if ($IsDaytime) { 'washi' } else { 'ophthalmic' }
} else {
    $Theme
}

$ThemeFile = if ($ActiveTheme -eq 'washi') {
    Join-Path $ThemesDir "PocketGull-Washi.theme"
} else {
    Join-Path $ThemesDir "PocketGull-Obsidian.theme"
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "       POCKETGULL WINDOWS SYSTEM THEME - CIRCADIAN ENGINE          " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

if ($Theme -eq 'auto') {
    Write-Host "  Circadian Schedule: " -NoNewline
    Write-Host "ACTIVE" -ForegroundColor Green -NoNewline
    Write-Host " (System Time: $(Get-Date -Format 'HH:mm'))" -ForegroundColor DarkGray
    if ($IsDaytime) {
        Write-Host "  Daylight Phase:     Washi Rice Paper (Photopic High-Acuity Vision)" -ForegroundColor Yellow
    } else {
        Write-Host "  Nightfall Phase:    Obsidian Ophthalmic (Scotopic Melatonin Protection)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  Selected Theme:     " -NoNewline
    if ($ActiveTheme -eq 'washi') {
        Write-Host "Washi Rice Paper (Tactile Mulberry Fiber)" -ForegroundColor Yellow
    } else {
        Write-Host "Obsidian Ophthalmic (Dark Obsidian - WCAG AAA)" -ForegroundColor Cyan
    }
}

# 1. Update Windows Personalization Registry for immediate live app & system mode transition
$PersonalizePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
$DwmPath = "HKCU:\Software\Microsoft\Windows\DWM"

if ($ActiveTheme -eq 'washi') {
    Set-ItemProperty -Path $PersonalizePath -Name "SystemUsesLightTheme" -Value 1 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $PersonalizePath -Name "AppsUseLightTheme" -Value 1 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $DwmPath -Name "ColorizationColor" -Value 0xC40D9488 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $DwmPath -Name "AccentColor" -Value 0xFF88940D -ErrorAction SilentlyContinue
    Write-Host "  [APPLIED] Windows System & App Mode -> LIGHT (Washi Celadon Accent #0D9488)" -ForegroundColor Green
} else {
    Set-ItemProperty -Path $PersonalizePath -Name "SystemUsesLightTheme" -Value 0 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $PersonalizePath -Name "AppsUseLightTheme" -Value 0 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $DwmPath -Name "ColorizationColor" -Value 0xC40284C7 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $DwmPath -Name "AccentColor" -Value 0xFFC78402 -ErrorAction SilentlyContinue
    Write-Host "  [APPLIED] Windows System & App Mode -> DARK (Obsidian Clinical Accent #0284C7)" -ForegroundColor Green
}

# 2. Optionally invoke the native .theme file to apply wallpaper & window styles
if ($LaunchThemeFile) {
    if (Test-Path $ThemeFile) {
        Write-Host "  [APPLYING] Launching Windows Theme File: $ThemeFile" -ForegroundColor Cyan
        Start-Process -FilePath $ThemeFile
    }
} else {
    Write-Host ""
    Write-Host "  Tip: To also set the tactile desktop wallpaper and full sound scheme:" -ForegroundColor White
    Write-Host "    .\scripts\apply_pocketgull_windows_theme.ps1 -Theme $ActiveTheme -LaunchThemeFile" -ForegroundColor DarkGray
}

Write-Host ""
