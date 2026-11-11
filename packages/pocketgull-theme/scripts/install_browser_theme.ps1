# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    Installs and synchronizes PocketGull Browser Themes across Google Chrome, Chrome Canary, Microsoft Edge, and Mozilla Firefox.

.DESCRIPTION
    Integrates all 26 PocketGull optical, tactile, and circadian themes into desktop browsers.
    For standard release Firefox (which enforces mandatory Mozilla AMO add-on signing), deploys
    native profile stylesheets (chrome/userChrome.css + chrome/userContent.css + user.js) and
    purges unsigned .xpi archives so background circadian syncs never trigger unsigned add-on
    warnings or pop-up browser windows.

.PARAMETER Theme
    The theme slug or shorthand name (e.g. 'Scotopic', 'Washi', 'Hemp', 'Curie', 'Rams', 'Obsidian').
    Defaults to the active circadian solar phase.

.PARAMETER Browser
    Target browser: 'All', 'Chrome', 'Canary', 'Edge', 'Firefox', or 'Portal'.
    Defaults to 'All'.

.PARAMETER OpenPortal
    Opens the interactive visual installer portal (install.html) in the default browser.

.PARAMETER Silent
    Suppresses interactive browser launches during headless background circadian synchronization.

.PARAMETER SignedXpi
    Opt-in flag for AMO-signed Firefox .xpi distribution packages only. Never used by default.
#>

[CmdletBinding()]
param(
    [string]$Theme = "",
    [ValidateSet('All', 'Chrome', 'Canary', 'Edge', 'Firefox', 'Portal')]
    [string]$Browser = "All",
    [switch]$OpenPortal,
    [switch]$Silent,
    [switch]$SignedXpi
)

$PSScriptRootPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ThemeRoot = Split-Path -Parent $PSScriptRootPath
$BrowserDir = Join-Path $ThemeRoot "browser"
$PortalPath = Join-Path $BrowserDir "install.html"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

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

function Set-ManagedCssBlock {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string]$BlockContent
    )

    $startMarker = "/* BEGIN POCKETGULL CIRCADIAN THEME */"
    $endMarker   = "/* END POCKETGULL CIRCADIAN THEME */"
    $wrapped     = "$startMarker`r`n$($BlockContent.Trim())`r`n$endMarker`r`n"

    $parentDir = Split-Path -Parent $FilePath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    if (Test-Path $FilePath) {
        $existing = [System.IO.File]::ReadAllText($FilePath, $Utf8NoBom)
        $pattern  = "(?s)" + [regex]::Escape($startMarker) + ".*?" + [regex]::Escape($endMarker) + "\r?\n?"
        if ($existing -match $pattern) {
            $updated = [regex]::Replace($existing, $pattern, $wrapped)
        } else {
            $trimmed = $existing.TrimEnd()
            $updated = if ([string]::IsNullOrWhiteSpace($trimmed)) { $wrapped } else { "$trimmed`r`n`r`n$wrapped" }
        }
        [System.IO.File]::WriteAllText($FilePath, $updated, $Utf8NoBom)
    } else {
        [System.IO.File]::WriteAllText($FilePath, $wrapped, $Utf8NoBom)
    }
}

function Ensure-FirefoxLegacyStylesheetsPref {
    param(
        [Parameter(Mandatory = $true)][string]$ProfileDir
    )

    $userJsPath = Join-Path $ProfileDir "user.js"
    $prefName   = 'toolkit.legacyUserProfileCustomizations.stylesheets'
    $prefLine   = 'user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);'

    if (Test-Path $userJsPath) {
        $existing = [System.IO.File]::ReadAllText($userJsPath, $Utf8NoBom)
        $pattern  = '(?m)^\s*user_pref\(\s*["'']' + [regex]::Escape($prefName) + '["'']\s*,.*?\);\s*$'
        if ($existing -match $pattern) {
            $updated = [regex]::Replace($existing, $pattern, $prefLine)
        } else {
            $trimmed = $existing.TrimEnd()
            $updated = if ([string]::IsNullOrWhiteSpace($trimmed)) { "$prefLine`r`n" } else { "$trimmed`r`n$prefLine`r`n" }
        }
        [System.IO.File]::WriteAllText($userJsPath, $updated, $Utf8NoBom)
    } else {
        $header = "// PocketGull Circadian Browser Chrome Sync (Standard Release Safe)`r`n$prefLine`r`n"
        [System.IO.File]::WriteAllText($userJsPath, $header, $Utf8NoBom)
    }
}

# Resolve Theme Slug
$ThemeSlug = ""
if ([string]::IsNullOrWhiteSpace($Theme)) {
    $ThemeSlug = Get-CircadianSlug
} else {
    $t = $Theme.ToLower().Trim()
    switch -Regex ($t) {
        'scotopic|670|650' { $ThemeSlug = 'pocketgull-scotopic-650nm-red' }
        'washi'            { $ThemeSlug = 'pocketgull-washi-rice-paper' }
        'hemp'             { $ThemeSlug = 'pocketgull-hemp-fiber' }
        'curie'            { $ThemeSlug = 'pocketgull-curie-luminescence' }
        'rams'             { $ThemeSlug = 'pocketgull-rams-functionalist' }
        'obsidian'         { $ThemeSlug = 'pocketgull-obsidian' }
        'marquina'         { $ThemeSlug = 'pocketgull-nero-marquina' }
        'marble'           { $ThemeSlug = 'pocketgull-carrara-marble' }
        'papyrus'          { $ThemeSlug = 'pocketgull-ancient-papyrus' }
        'mandala'          { $ThemeSlug = 'pocketgull-sacred-mandala' }
        'viridis'          { $ThemeSlug = 'pocketgull-viridis-perceptual' }
        'hypertext'        { $ThemeSlug = 'pocketgull-hypertext-1991' }
        default {
            if ($t -notlike "pocketgull-*") { $ThemeSlug = "pocketgull-$t" }
            else { $ThemeSlug = $t }
        }
    }
}

$CrxPath = Join-Path $BrowserDir "chrome\dist\$ThemeSlug.crx"
$XpiPath = Join-Path $BrowserDir "firefox\dist\$ThemeSlug.xpi"

if (-not $Silent) {
    Write-Host "`n🌊 POCKETGULL BROWSER THEME INSTALLER" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "Target Theme:  " -NoNewline -ForegroundColor DarkGray
    Write-Host "$ThemeSlug" -ForegroundColor Red
    Write-Host "Circadian Sol: " -NoNewline -ForegroundColor DarkGray
    Write-Host "$(if ($ThemeSlug -match 'scotopic') { '🌙 Night Shift (650nm Deep Red)' } elseif ($ThemeSlug -match 'washi') { '☀️ Morning Daylight (Rice Paper)' } else { '🌿 Afternoon Focus (Hemp Fiber)' })" -ForegroundColor Yellow
}

if ($OpenPortal -or $Browser -eq 'Portal') {
    if (-not $Silent) {
        Write-Host "`nOpening Visual Installer Portal in default browser..." -ForegroundColor Cyan
    }
    Start-Process $PortalPath
    return
}

# Browser paths
$ChromeExe  = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$CanaryExe  = Join-Path $env:LOCALAPPDATA "Google\Chrome SxS\Application\chrome.exe"
$EdgeExe    = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$FirefoxExe = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps\firefox.exe"
if (-not (Test-Path $FirefoxExe)) {
    $FirefoxExe = "C:\Program Files\Mozilla Firefox\firefox.exe"
}

# 1. Google Chrome SxS (Canary)
if ((-not $Silent) -and ($Browser -in @('All', 'Canary')) -and (Test-Path $CanaryExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Chrome Canary (SxS) with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $CanaryExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Chrome Canary to activate." -ForegroundColor DarkGray
    }
}

# 2. Google Chrome (Stable)
if ((-not $Silent) -and ($Browser -in @('All', 'Chrome')) -and (Test-Path $ChromeExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Google Chrome with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $ChromeExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Google Chrome to activate." -ForegroundColor DarkGray
    }
}

# 3. Microsoft Edge
if ((-not $Silent) -and ($Browser -in @('All', 'Edge')) -and (Test-Path $EdgeExe)) {
    if (Test-Path $CrxPath) {
        Write-Host "🌐 Launching Microsoft Edge with $ThemeSlug.crx..." -ForegroundColor Green
        Start-Process $EdgeExe -ArgumentList "`"$CrxPath`""
        Write-Host "   → Click 'Add theme' in Edge to activate." -ForegroundColor DarkGray
    }
}

# 4. Mozilla Firefox (Native userChrome.css + userContent.css Sync; Zero Unsigned XPI Popups)
if ($Browser -in @('All', 'Firefox')) {
    $profileRoots = @(
        "$env:LOCALAPPDATA\Packages\Mozilla.Firefox_*\LocalCache\Roaming\Mozilla\Firefox\Profiles\*.default*",
        "$env:APPDATA\Mozilla\Firefox\Profiles\*.default*"
    )
    $ffProfileDirs = @()
    foreach ($pattern in $profileRoots) {
        $found = Get-ChildItem -Path $pattern -Directory -ErrorAction SilentlyContinue
        if ($found) {
            $ffProfileDirs += $found
        }
    }
    $ffProfileDirs = $ffProfileDirs | Sort-Object -Property FullName -Unique

    # Resolve optical tokens from Firefox manifest.json
    $manifestPath = Join-Path $BrowserDir "firefox\$ThemeSlug\manifest.json"
    if (-not (Test-Path $manifestPath)) {
        $manifestPath = Join-Path $BrowserDir "firefox\pocketgull-scotopic-650nm-red\manifest.json"
    }

    $c = [PSCustomObject]@{
        frame                    = "#050000"
        frame_inactive           = "#050000"
        tab_selected             = "#0e0202"
        tab_background_text      = "#7a1a1a"
        tab_text                 = "#ff9988"
        tab_line                 = "#ff2211"
        toolbar                  = "#0e0202"
        toolbar_text             = "#ff6655"
        toolbar_field            = "#050000"
        toolbar_field_text       = "#ff6655"
        toolbar_top_separator    = "#3d0a0a"
        toolbar_bottom_separator = "#3d0a0a"
        icons                    = "#ff2211"
        ntp_background           = "#050000"
        ntp_text                 = "#ff6655"
    }

    if (Test-Path $manifestPath) {
        try {
            $manifestObj = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
            if ($manifestObj.theme -and $manifestObj.theme.colors) {
                $c = $manifestObj.theme.colors
            }
        } catch {}
    }

    $userChromeBlock = @"
/* Theme: $ThemeSlug */
:root,
#main-window {
  --lwt-accent-color: $($c.frame) !important;
  --lwt-accent-color-inactive: $($c.frame_inactive) !important;
  --lwt-text-color: $($c.tab_background_text) !important;
  --toolbar-bgcolor: $($c.toolbar) !important;
  --toolbar-color: $($c.toolbar_text) !important;
  --toolbar-field-background-color: $($c.toolbar_field) !important;
  --toolbar-field-color: $($c.toolbar_field_text) !important;
  --toolbar-field-focus-background-color: $($c.toolbar_field) !important;
  --toolbar-field-focus-color: $($c.toolbar_field_text) !important;
  --toolbar-field-border-color: $($c.toolbar_bottom_separator) !important;
  --lwt-selected-tab-background-color: $($c.tab_selected) !important;
  --tab-selected-bgcolor: $($c.tab_selected) !important;
  --tab-selected-textcolor: $($c.tab_text) !important;
  --tab-line-color: $($c.tab_line) !important;
  --tabs-navbar-separator-color: $($c.toolbar_top_separator) !important;
  --chrome-content-separator-color: $($c.toolbar_bottom_separator) !important;
  --lwt-toolbarbutton-icon-fill: $($c.icons) !important;
  --toolbarbutton-icon-fill: $($c.icons) !important;
}
#navigator-toolbox {
  background-color: $($c.frame) !important;
  border-bottom-color: $($c.toolbar_bottom_separator) !important;
}
#nav-bar,
#PersonalToolbar {
  background-color: $($c.toolbar) !important;
  color: $($c.toolbar_text) !important;
}
.tab-background:is([selected], [multiselected]) {
  background-color: $($c.tab_selected) !important;
  outline-color: $($c.tab_line) !important;
}
.tabbrowser-tab[selected="true"] .tab-label {
  color: $($c.tab_text) !important;
}
#urlbar-background,
#searchbar {
  background-color: $($c.toolbar_field) !important;
  border-color: $($c.toolbar_bottom_separator) !important;
}
#urlbar-input,
.searchbar-textbox {
  color: $($c.toolbar_field_text) !important;
}
"@

    $userContentBlock = @"
/* Theme: $ThemeSlug */
@-moz-document url("about:home"), url("about:newtab"), url("about:blank") {
  :root,
  body {
    --newtab-background-color: $($c.ntp_background) !important;
    --newtab-background-color-secondary: $($c.toolbar) !important;
    --newtab-text-primary-color: $($c.ntp_text) !important;
    background-color: $($c.ntp_background) !important;
    color: $($c.ntp_text) !important;
  }
}
"@

    foreach ($prof in $ffProfileDirs) {
        # Remove any stale unsigned PocketGull .xpi archives so release Firefox never flags them
        if (-not $SignedXpi) {
            $extDir = Join-Path $prof.FullName "extensions"
            if (Test-Path $extDir) {
                Get-ChildItem -Path $extDir -File -ErrorAction SilentlyContinue |
                    Where-Object { $_.Name -like "*@theme.pocketgull.app.xpi" -or $_.Name -like "pocketgull-*.xpi" } |
                    ForEach-Object {
                        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
                        if (-not $Silent) {
                            Write-Host "   ✓ Removed unsigned Firefox archive: $($_.Name)" -ForegroundColor DarkYellow
                        }
                    }
            }
        }

        Set-ManagedCssBlock -FilePath (Join-Path $prof.FullName "chrome\userChrome.css") -BlockContent $userChromeBlock
        Set-ManagedCssBlock -FilePath (Join-Path $prof.FullName "chrome\userContent.css") -BlockContent $userContentBlock
        Ensure-FirefoxLegacyStylesheetsPref -ProfileDir $prof.FullName

        if (-not $Silent) {
            Write-Host "🦊 Synced native userChrome/userContent ($ThemeSlug) -> $($prof.Name)" -ForegroundColor Magenta
        }
    }

    if ($SignedXpi -and (-not $Silent) -and (Test-Path $FirefoxExe) -and (Test-Path $XpiPath)) {
        Write-Host "🦊 Launching Firefox with AMO-signed extension..." -ForegroundColor Magenta
        Start-Process $FirefoxExe -ArgumentList "`"$XpiPath`""
    }
}

if (-not $Silent) {
    Write-Host "`n✨ Browser theme synchronization complete!" -ForegroundColor Cyan
    Write-Host "Tip: To preview any of the 26 themes visually, run:" -ForegroundColor DarkGray
    Write-Host "     ./install_browser_theme.ps1 -OpenPortal`n" -ForegroundColor Yellow
}
