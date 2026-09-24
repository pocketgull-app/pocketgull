# PocketGull System Tray Daemon (Assistive Technology & Cognitive Ergonomics Controller)
# Functions like JAWS / f.lux as a persistent, high-accessibility Windows notification area icon.

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Win32 SPI_SETCURSORS definition for live cursor updates
$winCursorType = @"
using System;
using System.Runtime.InteropServices;
public class WinCursorUtil {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);
    public static void Refresh() {
        SystemParametersInfo(0x0057, 0, IntPtr.Zero, 0x01 | 0x02);
    }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'WinCursorUtil').Type) {
    Add-Type -TypeDefinition $winCursorType
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir
$brandIconCandidate = Join-Path $repoDir "public\icons\pocketgull.ico"
$flutterIconCandidate = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"
$iconPath = if (Test-Path $brandIconCandidate) { $brandIconCandidate } else { $flutterIconCandidate }
$controllerScript = Join-Path $scriptDir "pocketgull_controller.mjs"
$fontScript = Join-Path $scriptDir "install_brand_fonts.ps1"
$stateFile = Join-Path $repoDir ".pocketgull_a11y.json"
$startupDir = [Environment]::GetFolderPath('Startup')
$startupShortcut = Join-Path $startupDir "PocketGull Assistive Tray.lnk"
$cursorDir = Join-Path $env:LOCALAPPDATA "PocketGull\Cursors"

function Invoke-Earcon {
    try {
        [System.Media.SystemSounds]::Asterisk.Play()
    } catch {}
}

function Get-PocketGullState {
    if (Test-Path $stateFile) {
        try {
            return Get-Content $stateFile -Raw | ConvertFrom-Json
        } catch {}
    }
    return [PSCustomObject]@{
        theme = "hemp"
        philocardia = $true
        bionic = $true
        cursor = "default"
    }
}

function Set-StartupState {
    param([bool]$enable)
    if ($enable) {
        $wsh = New-Object -ComObject WScript.Shell
        $sc = $wsh.CreateShortcut($startupShortcut)
        $sc.TargetPath = "pwsh.exe"
        $sc.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
        if (Test-Path $iconPath) {
            $sc.IconLocation = "$iconPath,0"
        }
        $sc.Description = "PocketGull Assistive Technology & Cognitive Ergonomics Tray"
        $sc.WorkingDirectory = $repoDir
        $sc.Save()
        Invoke-Earcon
    } else {
        if (Test-Path $startupShortcut) {
            Remove-Item $startupShortcut -Force
            Invoke-Earcon
        }
    }
}

function Set-CursorScheme {
    param([string]$schemeName)
    $cursorsKey = "HKCU:\Control Panel\Cursors"
    
    if ($schemeName -eq "ophthalmic") {
        $arrow = Join-Path $cursorDir "pocketgull_ophthalmic_arrow.cur"
        $ibeam = Join-Path $cursorDir "pocketgull_ophthalmic_ibeam.cur"
        $cross = Join-Path $cursorDir "pocketgull_precision_cross.cur"
        $wait  = Join-Path $cursorDir "pocketgull_philocardia_wait.cur"

        Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "PocketGull Ophthalmic High-Contrast"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value $arrow
        Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value $ibeam
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value $cross
        Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value $wait
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value $wait
    }
    elseif ($schemeName -eq "scotopic") {
        $arrow = Join-Path $cursorDir "pocketgull_scotopic_arrow.cur"
        $ibeam = Join-Path $cursorDir "pocketgull_scotopic_ibeam.cur"
        $cross = Join-Path $cursorDir "pocketgull_precision_cross.cur"
        $wait  = Join-Path $cursorDir "pocketgull_philocardia_wait.cur"

        Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "PocketGull Scotopic 650nm Red"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value $arrow
        Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value $ibeam
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value $cross
        Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value $wait
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value $wait
    }
    else {
        # Restore Windows default or EoA large black
        $eoaArrow = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\arrow_eoa.cur"
        $eoaIbeam = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\ibeam_eoa.cur"
        $eoaWait  = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\wait_eoa.cur"
        $eoaCross = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\cross_eoa.cur"

        if (Test-Path $eoaArrow) {
            Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "Windows Black (EoA)"
            Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value $eoaArrow
            Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value $eoaIbeam
            Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value $eoaCross
            Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value $eoaWait
            Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\busy_eoa.cur")
        } else {
            Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "Windows Default"
            Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value ""
            Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value ""
            Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value ""
            Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value ""
            Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value ""
        }
    }

    [WinCursorUtil]::Refresh()
    Invoke-Earcon
}

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon

if (Test-Path $iconPath) {
    $notifyIcon.Icon = New-Object System.Drawing.Icon($iconPath)
} else {
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
}

$notifyIcon.Text = "PocketGull Assistive Ergonomics"
$notifyIcon.Visible = $true

$appContext = New-Object System.Windows.Forms.ApplicationContext
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

# ── 1. BRAND HEADER ──
$header = $contextMenu.Items.Add("⚕ PocketGull Assistive Controller (v1.3)")
$header.Enabled = $false
$header.Font = New-Object System.Drawing.Font($header.Font, [System.Drawing.FontStyle]::Bold)

$contextMenu.Items.Add("-") | Out-Null

# ── 2. THEMES MENU ──
$themesMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🎨 System & IDE Themes")

$washiItem = $themesMenu.DropDownItems.Add("☀️ Washi Rice Paper (Daylight Focus)")
$washiItem.Add_Click({
    node $controllerScript theme washi
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2000, "PocketGull Theme", "Switched to Washi Rice Paper (Daylight Focus)", [System.Windows.Forms.ToolTipIcon]::Info)
})

$hempItem = $themesMenu.DropDownItems.Add("🌿 Hemp Fiber (Warm Sepia Calm)")
$hempItem.Add_Click({
    node $controllerScript theme hemp
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2000, "PocketGull Theme", "Switched to Hemp Fiber (Warm Sepia)", [System.Windows.Forms.ToolTipIcon]::Info)
})

$obsidianItem = $themesMenu.DropDownItems.Add("🌑 Obsidian Ophthalmic (Dark WCAG AAA)")
$obsidianItem.Add_Click({
    node $controllerScript theme obsidian
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2000, "PocketGull Theme", "Switched to Obsidian Dark Mode", [System.Windows.Forms.ToolTipIcon]::Info)
})

$scotopicItem = $themesMenu.DropDownItems.Add("🔴 Scotopic 650nm Red (Melatonin Safe)")
$scotopicItem.Add_Click({
    node $controllerScript theme 670
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2000, "PocketGull Theme", "Switched to Scotopic 650nm Red (Rhodopsin Safe)", [System.Windows.Forms.ToolTipIcon]::Info)
})

$contextMenu.Items.Add($themesMenu) | Out-Null

# ── 3. CURSOR THEMES MENU ──
$cursorMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🖱️ Clinical Cursor Schemes")

$curOphItem = $cursorMenu.DropDownItems.Add("👁️ Ophthalmic High-Contrast (Obsidian & Cyan)")
$curOphItem.Add_Click({
    Set-CursorScheme "ophthalmic"
    $notifyIcon.ShowBalloonTip(2500, "Cursor Scheme", "Active: PocketGull Ophthalmic High-Contrast (Obsidian Core + 505nm Cyan Halo)", [System.Windows.Forms.ToolTipIcon]::Info)
})

$curScotItem = $cursorMenu.DropDownItems.Add("🔴 Scotopic 650nm Red (Rhodopsin Preserving)")
$curScotItem.Add_Click({
    Set-CursorScheme "scotopic"
    $notifyIcon.ShowBalloonTip(2500, "Cursor Scheme", "Active: PocketGull Scotopic 650nm Red (Melatonin Safe)", [System.Windows.Forms.ToolTipIcon]::Info)
})

$curDefItem = $cursorMenu.DropDownItems.Add("🖥️ Windows System Default Cursors")
$curDefItem.Add_Click({
    Set-CursorScheme "default"
    $notifyIcon.ShowBalloonTip(2000, "Cursor Scheme", "Restored Windows System Default Cursors", [System.Windows.Forms.ToolTipIcon]::Info)
})

$contextMenu.Items.Add($cursorMenu) | Out-Null

# ── 3B. GAMES & INTERACTIVE QUESTS ──
$gamesMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🎮 Games & Interactive Quests")

$gTrailItem = $gamesMenu.DropDownItems.Add("🏕️ The Oregon Recovery Trail (3-Act Expedition)")
$gTrailItem.Add_Click({
    Start-Process "pwsh.exe" -ArgumentList "-NoExit", "-Command", "node `"$repoDir\scripts\gull.js`" trail"
    Invoke-Earcon
})

$gLumItem = $gamesMenu.DropDownItems.Add("🏛️ Historical Luminaries Clinical Mystery Arena")
$gLumItem.Add_Click({
    node "$repoDir\scripts\gull.js" play luminaries
    Invoke-Earcon
})

$gQuestItem = $gamesMenu.DropDownItems.Add("🏃 Movement & Healing Quest")
$gQuestItem.Add_Click({
    node "$repoDir\scripts\gull.js" play quest
    Invoke-Earcon
})

$gShiftItem = $gamesMenu.DropDownItems.Add("🩺 Doctor Shift & Call Duty Simulator")
$gShiftItem.Add_Click({
    node "$repoDir\scripts\gull.js" play shift
    Invoke-Earcon
})

$gOsceItem = $gamesMenu.DropDownItems.Add("📋 OSCE Medical Case Challenge Simulator")
$gOsceItem.Add_Click({
    node "$repoDir\scripts\gull.js" play osce
    Invoke-Earcon
})

$contextMenu.Items.Add($gamesMenu) | Out-Null

# ── 4. COGNITIVE ERGONOMIC MODES ──
$philoItem = $contextMenu.Items.Add("🫀 Philocardia (0.1 Hz Vagal Pacing)")
$philoItem.CheckOnClick = $true
$philoItem.Add_Click({
    node $controllerScript philocardia
    Invoke-Earcon
    $st = Get-PocketGullState
    $philoItem.Checked = [bool]$st.philocardia
    $notifyIcon.ShowBalloonTip(2000, "Philocardia", "Toggled 0.1 Hz Vagal Respiratory Wave Resonance", [System.Windows.Forms.ToolTipIcon]::Info)
})

$bionicItem = $contextMenu.Items.Add("👁️ Bionic Reading Guidance")
$bionicItem.CheckOnClick = $true
$bionicItem.Add_Click({
    node $controllerScript bionic
    Invoke-Earcon
    $st = Get-PocketGullState
    $bionicItem.Checked = [bool]$st.bionic
    $notifyIcon.ShowBalloonTip(2000, "Bionic Reading", "Toggled Saccadic Fixation Anchors", [System.Windows.Forms.ToolTipIcon]::Info)
})

$contextMenu.Items.Add("-") | Out-Null

# ── 5. SYSTEM INTEGRATION & STARTUP ──
$startupItem = $contextMenu.Items.Add("🚀 Launch at Windows Startup")
$startupItem.CheckOnClick = $true
$startupItem.Checked = (Test-Path $startupShortcut)
$startupItem.Add_Click({
    $shouldEnable = -not (Test-Path $startupShortcut)
    Set-StartupState -enable $shouldEnable
    $startupItem.Checked = $shouldEnable
    $msg = if ($shouldEnable) { "PocketGull will now start automatically with Windows." } else { "Removed from Windows Startup." }
    $notifyIcon.ShowBalloonTip(2500, "Windows Startup", $msg, [System.Windows.Forms.ToolTipIcon]::Info)
})

$fontItem = $contextMenu.Items.Add("🔤 Refresh 38 Superfamily Fonts")
$fontItem.Add_Click({
    pwsh -NoProfile -ExecutionPolicy Bypass -File $fontScript
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2500, "PocketGull Typefoundry", "All 38 TrueType superfamily cuts re-registered in Windows.", [System.Windows.Forms.ToolTipIcon]::Info)
})

$statusItem = $contextMenu.Items.Add("📊 System Status Summary")
$statusItem.Add_Click({
    $st = Get-PocketGullState
    $curName = (Get-ItemProperty "HKCU:\Control Panel\Cursors" -Name "(default)")."(default)"
    $msg = "Theme: $($st.theme.ToUpper()) | Philocardia: $(if ($st.philocardia) {'0.1Hz ON'} else {'OFF'}) | Bionic: $(if ($st.bionic) {'ON'} else {'OFF'})`nCursor: $curName"
    $notifyIcon.ShowBalloonTip(4000, "PocketGull Ergonomics", $msg, [System.Windows.Forms.ToolTipIcon]::Info)
})

$contextMenu.Items.Add("-") | Out-Null

# ── 6. EXIT ──
$exitItem = $contextMenu.Items.Add("✖ Exit PocketGull Tray")
$exitItem.Add_Click({
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    $appContext.ExitThread()
})

# Dynamic Menu State Sync on Opening
$contextMenu.Add_Opening({
    $st = Get-PocketGullState
    $philoItem.Checked = [bool]$st.philocardia
    $bionicItem.Checked = [bool]$st.bionic
    $startupItem.Checked = (Test-Path $startupShortcut)

    $washiItem.Checked = ($st.theme -eq "washi")
    $hempItem.Checked = ($st.theme -eq "hemp")
    $obsidianItem.Checked = ($st.theme -eq "obsidian")
    $scotopicItem.Checked = ($st.theme -eq "670" -or $st.theme -eq "scotopic")

    $curName = (Get-ItemProperty "HKCU:\Control Panel\Cursors" -Name "(default)")."(default)"
    $curOphItem.Checked = ($curName -like "*Ophthalmic*")
    $curScotItem.Checked = ($curName -like "*Scotopic*")
    $curDefItem.Checked = (-not $curOphItem.Checked -and -not $curScotItem.Checked)
})

$notifyIcon.ContextMenuStrip = $contextMenu

# Double-click cycles circadian day/night presets
$notifyIcon.Add_DoubleClick({
    $st = Get-PocketGullState
    $nextTheme = switch ($st.theme) {
        "washi"    { "hemp" }
        "hemp"     { "obsidian" }
        "obsidian" { "670" }
        "670"      { "washi" }
        default    { "obsidian" }
    }
    node $controllerScript theme $nextTheme
    Invoke-Earcon
    $notifyIcon.ShowBalloonTip(2500, "PocketGull Quick Preset", "Cycled theme to: $nextTheme", [System.Windows.Forms.ToolTipIcon]::Info)
})

# Initial sync
$st = Get-PocketGullState
$philoItem.Checked = [bool]$st.philocardia
$bionicItem.Checked = [bool]$st.bionic

$notifyIcon.ShowBalloonTip(3000, "PocketGull Assistive System", "Resident in notification area. Right-click for JAWS-style quick controls, or double-click to cycle circadian presets.", [System.Windows.Forms.ToolTipIcon]::Info)

[System.Windows.Forms.Application]::Run($appContext)
