<#
.SYNOPSIS
    PocketGull Pixel 9 Pro Material You + OLED/Paper Substrate Theme Switcher
.DESCRIPTION
    Applies any of the 26 WCAG AAA PocketGull themes directly to a connected Pixel device
    via native Android Material You (Monet) overlays, UI dark/light mode, contrast_level,
    Night Light (650nm), and the on-device PocketGull Theme Studio wallpaper generator.
#>
param(
    [Parameter(Position = 0)]
    [string]$Theme = "obsidian",

    [string]$DeviceSerial = "",

    [switch]$List
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptDir "pocketgull-android-themes.json"

if (-not (Test-Path $jsonPath)) {
    throw "Theme catalog not found at $jsonPath"
}

$themes = Get-Content $jsonPath -Raw | ConvertFrom-Json

if ($List) {
    $themes | Select-Object id, shortLabel, isDark, monetStyle, substrateHex, accentHex, @{Name="Aliases";Expression={$_.aliases -join ", "}} | Format-Table -AutoSize
    exit 0
}

$query = $Theme.Trim().ToLower()
$selected = $themes | Where-Object {
    $_.id -eq $query -or
    $_.shortLabel.ToLower() -eq $query -or
    ($_.aliases -contains $query) -or
    ($_.id -like "*$query*")
} | Select-Object -First 1

if (-not $selected) {
    throw "Unknown PocketGull theme '$Theme'. Run with -List to inspect all 26 colorways."
}

# Resolve target ADB device
$adbLines = & adb devices | Select-String -Pattern "\tdevice$"
if (-not $adbLines) {
    Write-Warning "No online Android device detected over ADB."
    exit 0
}

if ([string]::IsNullOrWhiteSpace($DeviceSerial)) {
    $usbDev = $adbLines | Where-Object { $_.Line -notmatch "_adb-tls-connect" } | Select-Object -First 1
    if ($usbDev) {
        $DeviceSerial = ($usbDev.Line -split "\s+")[0]
    } else {
        $DeviceSerial = ($adbLines[0].Line -split "\s+")[0]
    }
}

Write-Host "[PocketGull] Applying '$($selected.label)' ($($selected.monetStyle) / #$($selected.substrateHex) -> #$($selected.accentHex)) to $DeviceSerial..." -ForegroundColor Cyan

# 1. Trigger on-device PocketGull Theme Studio (holds WRITE_SECURE_SETTINGS + SET_WALLPAPER)
try {
    & adb -s $DeviceSerial shell "am start -n com.pocketgull.neuroreader/.ThemeStudioActivity --es theme '$($selected.id)' --ez auto_close true" | Out-Null
} catch {
    # Fallback if companion app is not installed
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $rawJson = "{`"android.theme.customization.theme_style`":`"$($selected.monetStyle)`",`"android.theme.customization.accent_color`":`"$($selected.accentHex)`",`"android.theme.customization.system_palette`":`"$($selected.accentHex)`",`"android.theme.customization.color_source`":`"preset`",`"_applied_timestamp`":$ts,`"android.theme.customization.seed_color_list`":[`"$($selected.accentHex)`"]}"
    $escapedForAdb = $rawJson.Replace('"', '\"')
    & adb -s $DeviceSerial shell "settings put secure theme_customization_overlay_packages '$escapedForAdb'"
}

# 2. Ensure UI Dark / Light Mode & WCAG AAA High Contrast level are enforced
$nightModeCmd = if ($selected.isDark) { "yes" } else { "no" }
& adb -s $DeviceSerial shell "cmd uimode night $nightModeCmd" | Out-Null
& adb -s $DeviceSerial shell "settings put secure contrast_level $($selected.contrastLevel)"

# 3. Toggle Night Display (650nm Red shift) when entering/exiting Scotopic mode
$nightLightBit = if ($selected.nightLight) { "1" } else { "0" }
& adb -s $DeviceSerial shell "settings put secure night_display_activated $nightLightBit"

Write-Host "[OK] Pixel 9 Pro synchronized to $($selected.label)" -ForegroundColor Green
