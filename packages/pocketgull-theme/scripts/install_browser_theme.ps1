<#
.SYNOPSIS
    Installs and synchronizes PocketGull Browser Themes across Google Chrome, Chrome Canary, Microsoft Edge, and Mozilla Firefox.

.DESCRIPTION
    Integrates all 26 PocketGull optical, tactile, and circadian themes into desktop browsers.
    Supports 1-click CRX/XPI deployment and dynamic circadian auto-switching.

.PARAMETER Theme
    The theme slug or shorthand name (e.g. 'Scotopic', 'Washi', 'Hemp', 'Curie', 'Rams', 'Obsidian').
    Defaults to the active circadian solar phase.

.PARAMETER Browser
    Target browser: 'All', 'Chrome', 'Canary', 'Edge', 'Firefox', or 'Portal'.
    Defaults to 'All'.

.PARAMETER OpenPortal
    Opens the interactive visual installer portal (install.html) in the default browser.

.EXAMPLE
    ./install_browser_theme.ps1
    Installs the current circadian theme (Scotopic 650nm Red at night) across installed browsers.

.EXAMPLE
    ./install_browser_theme.ps1 -Theme Washi -Browser Chrome
    Installs Washi Rice Paper theme in Google Chrome.

.EXAMPLE
    ./install_browser_theme.ps1 -OpenPortal
    Opens the local installer dashboard for visual previews and 1-click downloads.
#>

[CmdletBinding()]
param(
    [string]$Theme = "",
    [ValidateSet('All', 'Chrome', 'Canary', 'Edge', 'Firefox', 'Portal')]
    [string]$Browser = "All",
    [switch]$OpenPortal
)

$PSScriptRootPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ThemeRoot = Split-Path -Parent $PSScriptRootPath
$BrowserDir = Join-Path $ThemeRoot "browser"
$PortalPath = Join-Path $BrowserDir "install.html"

# Circadian solar schedule calculation
function Get-CircadianSlug {
    $now = Get-Date
    $h = $now.Hour
    $m = $now.Minute

    if ($h -ge 8 -and $h -lt 13) {
        return "pocketgull-washi-rice-paper"
    } elseif ($h -ge 13 -and ($h -lt 19 -or ($h -eq 19 -and $m -lt 30))) {
        return "pocketgull-hemp-fiber"
    } else {
        return "pocketgull-scotopic-650nm-red"
    }
}

# Resolve Theme Slug
$ThemeSlug = ""
if ([string]::IsNullOrWhiteSpace($Theme)) {
    $ThemeSlug = Get-CircadianSlug
} else {
    $t = $Theme.ToLower().Trim()
    switch -Regex ($t) {
        'scotopic' { $ThemeSlug = 'pocketgull-scotopic-650nm-red' }
        'washi'    { $ThemeSlug = 'pocketgull-washi-rice-paper' }
        'hemp'     { $ThemeSlug = 'pocketgull-hemp-fiber' }
        'curie'    { $ThemeSlug = 'pocketgull-curie-luminescence' }
        'rams'     { $ThemeSlug = 'pocketgull-rams-functionalist' }
        'obsidian' { $ThemeSlug = 'pocketgull-obsidian' }
        'marquina' { $ThemeSlug = 'pocketgull-nero-marquina' }
        'marble'   { $ThemeSlug = 'pocketgull-carrara-marble' }
        'papyrus'  { $ThemeSlug = 'pocketgull-ancient-papyrus' }
        'mandala'  { $ThemeSlug = 'pocketgull-sacred-mandala' }
        'viridis'  { $ThemeSlug = 'pocketgull-viridis-perceptual' }
        'hypertext'{ $ThemeSlug = 'pocketgull-hypertext-1991' }
        default    {
            if ($t -notlike "pocketgull-*") { $ThemeSlug = "pocketgull-$t" }
            else { $ThemeSlug = $t }
        }
    }
}

$CrxPath = Join-Path $BrowserDir "chrome\dist\$ThemeSlug.crx"
$XpiPath = Join-Path $BrowserDir "firefox\dist\$ThemeSlug.xpi"
$CircadianXpi = Join-Path $BrowserDir "firefox\dist\pocketgull-circadian-auto.xpi"

Write-Host "`n🌊 POCKETGULL BROWSER THEME INSTALLER" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "Target Theme:  " -NoNewline -ForegroundColor DarkGray
Write-Host "$ThemeSlug" -ForegroundColor Red
Write-Host "Circadian Sol: " -NoNewline -ForegroundColor DarkGray
Write-Host "$(if ($ThemeSlug -match 'scotopic') { '🌙 Night Shift (650nm Deep Red)' } elseif ($ThemeSlug -match 'washi') { '☀️ Morning Daylight (Rice Paper)' } else { '🌿 Afternoon Focus (Hemp Fiber)' })" -ForegroundColor Yellow

if ($OpenPortal -or $Browser -eq 'Portal') {
    Write-Host "`nOpening Visual Installer Portal in default browser..." -ForegroundColor Cyan
    Start-Process $PortalPath
    return
}

# Browser paths
$ChromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$CanaryExe = "C:\Users\philg\AppData\Local\Google\Chrome SxS\Application\chrome.exe"
$EdgeExe   = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$FirefoxExe= "C:\Users\philg\AppData\Local\Microsoft\WindowsApps\firefox.exe"

# 1. Google Chrome SxS (Canary)
if ($Browser -in @('All', 'Canary') -and (Test-Path $CanaryExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Chrome Canary (SxS) with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $CanaryExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Chrome Canary to activate." -ForegroundColor DarkGray
    }
}

# 2. Google Chrome (Stable)
if ($Browser -in @('All', 'Chrome') -and (Test-Path $ChromeExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Google Chrome with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $ChromeExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Google Chrome to activate." -ForegroundColor DarkGray
    }
}

# 3. Microsoft Edge
if ($Browser -in @('All', 'Edge') -and (Test-Path $EdgeExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Microsoft Edge with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $EdgeExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Edge to activate." -ForegroundColor DarkGray
    }
}

# 4. Mozilla Firefox
if ($Browser -in @('All', 'Firefox')) {
    # Deploy to profile directory
    $ffProfiles = Get-ChildItem -Path "$env:LOCALAPPDATA\Packages\Mozilla.Firefox_*\LocalCache\Roaming\Mozilla\Firefox\Profiles\*.default-release\extensions" -ErrorAction SilentlyContinue
    if (-not $ffProfiles) {
        $ffProfiles = Get-ChildItem -Path "$env:APPDATA\Mozilla\Firefox\Profiles\*.default-release\extensions" -ErrorAction SilentlyContinue
    }

    if ($ffProfiles) {
        foreach ($p in $ffProfiles) {
            Write-Host "🦊 Deploying extensions to Firefox Profile: $($p.FullName)..." -ForegroundColor Magenta
            if (Test-Path $CircadianXpi) {
                Copy-Item -Path $CircadianXpi -Destination (Join-Path $p.FullName "circadian-auto@theme.pocketgull.app.xpi") -Force
                Write-Host "   ✓ Injected dynamic circadian-auto@theme.pocketgull.app.xpi" -ForegroundColor DarkGreen
            }
            if (Test-Path $XpiPath) {
                Copy-Item -Path $XpiPath -Destination (Join-Path $p.FullName "$ThemeSlug@theme.pocketgull.app.xpi") -Force
                Write-Host "   ✓ Injected static $ThemeSlug@theme.pocketgull.app.xpi" -ForegroundColor DarkGreen
            }
        }
    }

    if (Test-Path $FirefoxExe) {
        Write-Host "🦊 Launching Firefox with circadian auto extension..." -ForegroundColor Magenta
        Start-Process $FirefoxExe -ArgumentList "`"$CircadianXpi`""
        Write-Host "   → Click 'Add' in Firefox to activate dynamic circadian switching." -ForegroundColor DarkGray
    }
}

Write-Host "`n✨ Installation triggers dispatched! Check your open browser windows to confirm." -ForegroundColor Cyan
Write-Host "Tip: To preview and click-to-install any of the 26 themes visually, run:" -ForegroundColor DarkGray
Write-Host "     ./install_browser_theme.ps1 -OpenPortal`n" -ForegroundColor Yellow
