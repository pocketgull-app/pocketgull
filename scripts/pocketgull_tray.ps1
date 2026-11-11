# SPDX-License-Identifier: Apache-2.0
# PocketGull System Tray Daemon & 4-Slot Dysmetria-Safe Control Deck (v2.0)
# Persistent Windows notification area controller with:
#   - Left-click 4-Slot Control Deck (208x104px tremor-safe cards, substrate-adaptive Scotopic/Obsidian/Washi UI)
#   - Single-instance Mutex + IPC Show-Deck signal (re-launching shortcut opens the Deck instead of duplicating icons)
#   - Non-blocking background dispatch (zero UI freezes)
#   - Full 13-cut 64px Ophthalmic & 650nm Scotopic cursor control (Arrow, Hand, IBeam, Cross, Wait, SizeNS, SizeWE)
#   - Integrated MouseAssist (XBUTTON1/2 + 65ms bounce filter) & Sit-Stand Pacer live process supervision

param(
    [switch]$SelfTest
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

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
    Add-Type -TypeDefinition $winCursorType -ErrorAction SilentlyContinue
}

$pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwsh) { $pwsh = "powershell.exe" }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$brandIconCandidate   = Join-Path $repoDir "public\icons\pocketgull.ico"
$flutterIconCandidate = Join-Path $repoDir "pocketgull_flutter\windows\runner\resources\app_icon.ico"
$iconPath = if (Test-Path $brandIconCandidate) { $brandIconCandidate } else { $flutterIconCandidate }

$controllerScript  = Join-Path $scriptDir "pocketgull_controller.mjs"
$fontScript        = Join-Path $scriptDir "install_brand_fonts.ps1"
$ergoScript        = Join-Path $scriptDir "configure_ataxia_ergonomics.ps1"
$pacerScript       = Join-Path $scriptDir "sit_stand_pacer.ps1"
$circadianScript   = Join-Path $scriptDir "schedule_circadian_themes.ps1"
$mouseAssistBin    = Join-Path $env:LOCALAPPDATA "PocketGull\bin\Start-MouseAssist.ps1"
$mouseAssistScript = if (Test-Path $mouseAssistBin) { $mouseAssistBin } else { Join-Path $scriptDir "Start-MouseAssist.ps1" }

$stateFile       = Join-Path $repoDir ".pocketgull_a11y.json"
$startupDir      = [Environment]::GetFolderPath('Startup')
$startupShortcut = Join-Path $startupDir "PocketGull Assistive Tray.lnk"
$cursorDir       = Join-Path $env:LOCALAPPDATA "PocketGull\Cursors"
$soundDir        = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds"

# Single-instance Mutex + IPC signal so re-clicking Desktop shortcut opens the 4-Slot Control Deck
$showDeckEvent = New-Object System.Threading.EventWaitHandle($false, [System.Threading.EventResetMode]::AutoReset, "Local\PocketGull_Show_Deck_Event")
if (-not $SelfTest) {
    $createdNew = $false
    $script:trayMutex = New-Object System.Threading.Mutex($true, "Local\PocketGull_Assistive_Tray_Mutex", [ref]$createdNew)
    if (-not $createdNew) {
        $showDeckEvent.Set() | Out-Null
        exit 0
    }
}

function Invoke-Earcon {
    param([ValidateSet('toggle', 'scene')][string]$Kind = 'toggle')
    $wavName = if ($Kind -eq 'scene') { "pocketgull_ceramic_chime.wav" } else { "pocketgull_432hz_asterisk.wav" }
    $wavPath = Join-Path $soundDir $wavName
    if (Test-Path $wavPath) {
        try {
            $player = New-Object System.Media.SoundPlayer($wavPath)
            $player.Play()
        } catch {}
    }
}

function Get-PocketGullState {
    $defaults = [ordered]@{
        theme           = "hemp"
        cursor          = "ophthalmic"
        philocardia     = $false
        bionic          = $false
        circadian       = $true
        ataxiaShield    = $true
        dragThresholdPx = 18
    }
    if (Test-Path $stateFile) {
        try {
            $raw = Get-Content $stateFile -Raw | ConvertFrom-Json
            foreach ($prop in $raw.PSObject.Properties) {
                $defaults[$prop.Name] = $prop.Value
            }
        } catch {}
    }
    return [PSCustomObject]$defaults
}

function Save-PocketGullStatePatch {
    param([hashtable]$Patch)
    $st = Get-PocketGullState
    $merged = [ordered]@{}
    foreach ($p in $st.PSObject.Properties) {
        $merged[$p.Name] = $p.Value
    }
    foreach ($k in $Patch.Keys) {
        $merged[$k] = $Patch[$k]
    }
    try {
        $merged | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8
    } catch {}
    return [PSCustomObject]$merged
}

function Start-PocketGullCommand {
    param([string]$Exe, [string]$Arguments)
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $Exe
        $psi.Arguments = $Arguments
        $psi.WorkingDirectory = $repoDir
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        [System.Diagnostics.Process]::Start($psi) | Out-Null
    } catch {}
}

function Test-ScriptDaemonRunning {
    param([string]$Pattern)
    try {
        $hit = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
            Where-Object { $_.CommandLine -match $Pattern } |
            Select-Object -First 1
        return [bool]($null -ne $hit)
    } catch {
        return $false
    }
}

function Stop-ScriptDaemon {
    param([string]$Pattern)
    try {
        Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
            Where-Object { $_.CommandLine -match $Pattern } |
            ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    } catch {}
}

function Set-StartupState {
    param([bool]$enable)
    if ($enable) {
        $wsh = New-Object -ComObject WScript.Shell
        $sc = $wsh.CreateShortcut($startupShortcut)
        $sc.TargetPath = "$env:SystemRoot\System32\conhost.exe"
        $sc.Arguments = "--headless `"$pwsh`" -NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
        if (Test-Path $iconPath) { $sc.IconLocation = "$iconPath,0" }
        $sc.Description = "PocketGull Assistive Technology & 4-Slot Control Deck"
        $sc.WorkingDirectory = $repoDir
        $sc.Save()
    } else {
        if (Test-Path $startupShortcut) {
            Remove-Item $startupShortcut -Force
        }
    }
    Invoke-Earcon -Kind toggle
}

function Set-CursorScheme {
    param([string]$schemeName)
    $cursorsKey = "HKCU:\Control Panel\Cursors"
    if ($schemeName -eq "ophthalmic") {
        Set-ItemProperty -Path $cursorsKey -Name "(default)"   -Value "PocketGull Ophthalmic High-Contrast"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow"       -Value (Join-Path $cursorDir "pocketgull_ophthalmic_arrow.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Hand"        -Value (Join-Path $cursorDir "pocketgull_ophthalmic_hand.cur")
        Set-ItemProperty -Path $cursorsKey -Name "IBeam"       -Value (Join-Path $cursorDir "pocketgull_ophthalmic_ibeam.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair"   -Value (Join-Path $cursorDir "pocketgull_precision_cross.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Wait"        -Value (Join-Path $cursorDir "pocketgull_philocardia_wait.cur")
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value (Join-Path $cursorDir "pocketgull_philocardia_wait.cur")
        Set-ItemProperty -Path $cursorsKey -Name "SizeNS"      -Value (Join-Path $cursorDir "pocketgull_ophthalmic_sizens.cur")
        Set-ItemProperty -Path $cursorsKey -Name "SizeWE"      -Value (Join-Path $cursorDir "pocketgull_ophthalmic_sizewe.cur")
    }
    elseif ($schemeName -eq "scotopic") {
        Set-ItemProperty -Path $cursorsKey -Name "(default)"   -Value "PocketGull Scotopic 650nm Red"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow"       -Value (Join-Path $cursorDir "pocketgull_scotopic_arrow.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Hand"        -Value (Join-Path $cursorDir "pocketgull_scotopic_hand.cur")
        Set-ItemProperty -Path $cursorsKey -Name "IBeam"       -Value (Join-Path $cursorDir "pocketgull_scotopic_ibeam.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair"   -Value (Join-Path $cursorDir "pocketgull_scotopic_cross.cur")
        Set-ItemProperty -Path $cursorsKey -Name "Wait"        -Value (Join-Path $cursorDir "pocketgull_philocardia_wait.cur")
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value (Join-Path $cursorDir "pocketgull_philocardia_wait.cur")
        Set-ItemProperty -Path $cursorsKey -Name "SizeNS"      -Value (Join-Path $cursorDir "pocketgull_scotopic_sizens.cur")
        Set-ItemProperty -Path $cursorsKey -Name "SizeWE"      -Value (Join-Path $cursorDir "pocketgull_scotopic_sizewe.cur")
    }
    else {
        $eoaArrow = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\arrow_eoa.cur"
        if (Test-Path $eoaArrow) {
            Set-ItemProperty -Path $cursorsKey -Name "(default)"   -Value "Windows Black (EoA)"
            Set-ItemProperty -Path $cursorsKey -Name "Arrow"       -Value $eoaArrow
            Set-ItemProperty -Path $cursorsKey -Name "Hand"        -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\hand_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "IBeam"       -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\ibeam_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "Crosshair"   -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\cross_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "Wait"        -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\wait_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\busy_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "SizeNS"      -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\ns_eoa.cur")
            Set-ItemProperty -Path $cursorsKey -Name "SizeWE"      -Value (Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Cursors\ew_eoa.cur")
        } else {
            Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "Windows Default"
            foreach ($role in @("Arrow","Hand","IBeam","Crosshair","Wait","AppStarting","SizeNS","SizeWE")) {
                Set-ItemProperty -Path $cursorsKey -Name $role -Value ""
            }
        }
    }
    [WinCursorUtil]::Refresh()
    Save-PocketGullStatePatch @{ cursor = $schemeName } | Out-Null
    Invoke-Earcon -Kind toggle
}

function Apply-UnifiedScene {
    param([string]$SceneKey)
    $norm = if ($SceneKey -eq "scotopic") { "670" } else { $SceneKey.ToLower() }
    $targetCursor = if ($norm -eq "670") { "scotopic" } else { "ophthalmic" }
    Save-PocketGullStatePatch @{ theme = $norm; cursor = $targetCursor } | Out-Null
    Set-CursorScheme $targetCursor
    Start-PocketGullCommand -Exe "node.exe" -Arguments "`"$controllerScript`" scene $norm"
    Invoke-Earcon -Kind scene
    Update-ControlDeckVisuals
}

function Set-AtaxiaShieldState {
    param([bool]$Enable)
    Save-PocketGullStatePatch @{ ataxiaShield = $Enable } | Out-Null
    if ($Enable) {
        Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$ergoScript`" -Action Apply"
        if ((Test-Path $mouseAssistScript) -and (-not (Test-ScriptDaemonRunning 'Start-MouseAssist\.ps1'))) {
            Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$mouseAssistScript`""
        }
    } else {
        Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$ergoScript`" -Action Restore"
        Stop-ScriptDaemon 'Start-MouseAssist\.ps1'
    }
    Invoke-Earcon -Kind toggle
    Update-ControlDeckVisuals
}

function Set-SitStandPacerState {
    param([bool]$Enable)
    if ($Enable) {
        if (-not (Test-ScriptDaemonRunning 'sit_stand_pacer\.ps1')) {
            Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$pacerScript`""
        }
    } else {
        Stop-ScriptDaemon 'sit_stand_pacer\.ps1'
    }
    Invoke-Earcon -Kind toggle
    Update-ControlDeckVisuals
}

# Resolve UI Font (Pocket Gull clinical sans if registered, else Segoe UI)
$installedFamilies = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
$uiFontName = if ($installedFamilies -contains "Pocket Gull") {
    "Pocket Gull"
} elseif ($installedFamilies -contains "Pocket Gull Sans") {
    "Pocket Gull Sans"
} else {
    "Segoe UI"
}

$fontDeckHeader = New-Object System.Drawing.Font($uiFontName, 11.5, [System.Drawing.FontStyle]::Bold)
$fontSlotTitle  = New-Object System.Drawing.Font($uiFontName, 11.0, [System.Drawing.FontStyle]::Bold)
$fontSlotSub    = New-Object System.Drawing.Font($uiFontName, 9.0,  [System.Drawing.FontStyle]::Regular)
$fontMenu       = New-Object System.Drawing.Font($uiFontName, 11.0, [System.Drawing.FontStyle]::Regular)
$fontMenuBold   = New-Object System.Drawing.Font($uiFontName, 11.0, [System.Drawing.FontStyle]::Bold)

# ── 4-SLOT DYSMETRIA-SAFE CONTROL DECK WINDOW ──
$deckForm = New-Object System.Windows.Forms.Form
$deckForm.Text = "PocketGull Assistive Control Deck"
$deckForm.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
$deckForm.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$deckForm.ClientSize = New-Object System.Drawing.Size(464, 304)
$deckForm.TopMost = $true
$deckForm.ShowInTaskbar = $false
$deckForm.KeyPreview = $true

$lblHeader = New-Object System.Windows.Forms.Label
$lblHeader.Text = "⚕ PocketGull Control Deck"
$lblHeader.Font = $fontDeckHeader
$lblHeader.Location = New-Object System.Drawing.Point(18, 14)
$lblHeader.Size = New-Object System.Drawing.Size(260, 28)
$deckForm.Controls.Add($lblHeader)

$btnSyncSun = New-Object System.Windows.Forms.Button
$btnSyncSun.Text = "🌅 Solar Sync"
$btnSyncSun.Font = $fontSlotSub
$btnSyncSun.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnSyncSun.Location = New-Object System.Drawing.Point(286, 10)
$btnSyncSun.Size = New-Object System.Drawing.Size(114, 36)
$btnSyncSun.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnSyncSun.Add_Click({
    Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$circadianScript`" -Action SyncNow -SkipEntrainment"
    Invoke-Earcon -Kind scene
    Start-Sleep -Milliseconds 180
    Update-ControlDeckVisuals
})
$deckForm.Controls.Add($btnSyncSun)

$btnCloseDeck = New-Object System.Windows.Forms.Button
$btnCloseDeck.Text = "✕"
$btnCloseDeck.Font = $fontSlotTitle
$btnCloseDeck.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCloseDeck.Location = New-Object System.Drawing.Point(408, 10)
$btnCloseDeck.Size = New-Object System.Drawing.Size(40, 36)
$btnCloseDeck.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnCloseDeck.Add_Click({ $deckForm.Hide() })
$deckForm.Controls.Add($btnCloseDeck)

# Subtle 0.1 Hz Philocardia Mayer Wave Resonance Bar (4.0s Inhale / 6.0s Exhale, active only when Deck is open)
$waveTrack = New-Object System.Windows.Forms.Panel
$waveTrack.Location = New-Object System.Drawing.Point(16, 54)
$waveTrack.Size = New-Object System.Drawing.Size(432, 6)
$waveFill = New-Object System.Windows.Forms.Panel
$waveFill.Location = New-Object System.Drawing.Point(0, 0)
$waveFill.Size = New-Object System.Drawing.Size(0, 6)
$waveTrack.Controls.Add($waveFill)
$deckForm.Controls.Add($waveTrack)

function New-SlotButton {
    param([int]$X, [int]$Y)
    $btn = New-Object System.Windows.Forms.Button
    $btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btn.FlatAppearance.BorderSize = 2
    $btn.Location = New-Object System.Drawing.Point($X, $Y)
    $btn.Size = New-Object System.Drawing.Size(208, 104)
    $btn.Font = $fontSlotTitle
    $btn.TextAlign = [System.Drawing.ContentAlignment]::MiddleLeft
    $btn.Padding = New-Object System.Windows.Forms.Padding(12, 6, 10, 6)
    $btn.Cursor = [System.Windows.Forms.Cursors]::Hand
    return $btn
}

# Strict 2x2 Grid (WM_SLOT_MAX = 4, 208x104px per slot, 16px tremor-safe gutter)
$btnSlotScene = New-SlotButton -X 16  -Y 70
$btnSlotErgo  = New-SlotButton -X 240 -Y 70
$btnSlotPhilo = New-SlotButton -X 16  -Y 186
$btnSlotPacer = New-SlotButton -X 240 -Y 186

$btnSlotScene.Add_Click({
    $st = Get-PocketGullState
    $next = switch ($st.theme) {
        "washi"    { "hemp" }
        "hemp"     { "obsidian" }
        "obsidian" { "670" }
        default    { "washi" }
    }
    Apply-UnifiedScene -SceneKey $next
})

$btnSlotErgo.Add_Click({
    $st = Get-PocketGullState
    $next = -not ([bool]$st.ataxiaShield)
    Set-AtaxiaShieldState -Enable $next
})

$btnSlotPhilo.Add_Click({
    $st = Get-PocketGullState
    $next = -not ([bool]$st.philocardia)
    Save-PocketGullStatePatch @{ philocardia = $next } | Out-Null
    Invoke-Earcon -Kind toggle
    Update-ControlDeckVisuals
})

$btnSlotPacer.Add_Click({
    $running = Test-ScriptDaemonRunning 'sit_stand_pacer\.ps1'
    Set-SitStandPacerState -Enable (-not $running)
})

$deckForm.Controls.AddRange(@($btnSlotScene, $btnSlotErgo, $btnSlotPhilo, $btnSlotPacer))

$script:deckBorderColor = [System.Drawing.Color]::FromArgb(45, 212, 191)
$deckForm.Add_Paint({
    param($sender, $e)
    $pen = New-Object System.Drawing.Pen($script:deckBorderColor, 2)
    $e.Graphics.DrawRectangle($pen, 1, 1, $deckForm.ClientSize.Width - 2, $deckForm.ClientSize.Height - 2)
    $pen.Dispose()
})

function Update-ControlDeckVisuals {
    $st = Get-PocketGullState
    $pacerLive = if ($SelfTest) { $false } else { Test-ScriptDaemonRunning 'sit_stand_pacer\.ps1' }
    $shieldOn  = ($st.ataxiaShield -ne $false)
    $philoOn   = [bool]$st.philocardia
    $themeKey  = ($st.theme | Out-String).Trim().ToLower()

    # Substrate-adaptive palette (strictly zero blue/green emission in 670nm Scotopic mode)
    if ($themeKey -in @('670', 'scotopic')) {
        $bgForm     = [System.Drawing.Color]::FromArgb(20, 6, 7)
        $bgCardOff  = [System.Drawing.Color]::FromArgb(32, 10, 12)
        $bgCardOn   = [System.Drawing.Color]::FromArgb(56, 14, 16)
        $fgPrimary  = [System.Drawing.Color]::FromArgb(252, 165, 165)
        $accent     = [System.Drawing.Color]::FromArgb(220, 38, 38)
        $borderMute = [System.Drawing.Color]::FromArgb(127, 29, 29)
    }
    elseif ($themeKey -in @('washi', 'hemp', 'rams', 'hypertext')) {
        $bgForm     = [System.Drawing.Color]::FromArgb(245, 239, 228)
        $bgCardOff  = [System.Drawing.Color]::FromArgb(236, 228, 213)
        $bgCardOn   = [System.Drawing.Color]::FromArgb(223, 242, 238)
        $fgPrimary  = [System.Drawing.Color]::FromArgb(28, 25, 23)
        $accent     = [System.Drawing.Color]::FromArgb(13, 148, 136)
        $borderMute = [System.Drawing.Color]::FromArgb(180, 168, 150)
    }
    else {
        # Peat Obsidian (#0d090b) + Warm Bone Cream (#ede3d2) per Helmholtz invariant
        $bgForm     = [System.Drawing.Color]::FromArgb(13, 9, 11)
        $bgCardOff  = [System.Drawing.Color]::FromArgb(24, 20, 23)
        $bgCardOn   = [System.Drawing.Color]::FromArgb(19, 42, 42)
        $fgPrimary  = [System.Drawing.Color]::FromArgb(237, 227, 210)
        $accent     = [System.Drawing.Color]::FromArgb(45, 212, 191)
        $borderMute = [System.Drawing.Color]::FromArgb(63, 63, 70)
    }

    $script:deckBorderColor = $accent
    $deckForm.BackColor = $bgForm
    $lblHeader.ForeColor = $fgPrimary

    foreach ($hdrBtn in @($btnSyncSun, $btnCloseDeck)) {
        $hdrBtn.BackColor = $bgCardOff
        $hdrBtn.ForeColor = $fgPrimary
        $hdrBtn.FlatAppearance.BorderColor = $borderMute
    }

    $waveTrack.BackColor = $bgCardOff
    $waveFill.BackColor  = $accent
    if (-not $philoOn) { $waveFill.Width = 0 }

    $sceneLabel = switch ($themeKey) {
        "washi"    { "☀️ Washi Daylight`n4000K • Ophthalmic 64px" }
        "hemp"     { "🌿 Hemp Sepia`n2700K • Ophthalmic 64px" }
        "obsidian" { "🌑 Peat Obsidian`nWCAG AAA • Cyan 64px" }
        "670"      { "🔴 Scotopic 670nm`nmEDI < 1 lx • Red 64px" }
        "scotopic" { "🔴 Scotopic 670nm`nmEDI < 1 lx • Red 64px" }
        default    { "🎨 $($themeKey.ToUpper())`nTap to cycle scene" }
    }
    $btnSlotScene.Text = "1 • SCENE`n$sceneLabel"
    $btnSlotScene.BackColor = $bgCardOn
    $btnSlotScene.ForeColor = $fgPrimary
    $btnSlotScene.FlatAppearance.BorderColor = $accent

    $btnSlotErgo.Text = if ($shieldOn) {
        "2 • MOTOR SHIELD`n⚖️ ACTIVE`n18px Drag • 65ms Filter"
    } else {
        "2 • MOTOR SHIELD`n⚖️ PAUSED`nStandard 4px Windows"
    }
    $btnSlotErgo.BackColor = if ($shieldOn) { $bgCardOn } else { $bgCardOff }
    $btnSlotErgo.ForeColor = $fgPrimary
    $btnSlotErgo.FlatAppearance.BorderColor = if ($shieldOn) { $accent } else { $borderMute }

    $btnSlotPhilo.Text = if ($philoOn) {
        "3 • PHILOCARDIA`n🫀 0.1 Hz ON`n4.0s In / 6.0s Out"
    } else {
        "3 • PHILOCARDIA`n🫀 STATIC`nTap for 0.1 Hz Pacer"
    }
    $btnSlotPhilo.BackColor = if ($philoOn) { $bgCardOn } else { $bgCardOff }
    $btnSlotPhilo.ForeColor = $fgPrimary
    $btnSlotPhilo.FlatAppearance.BorderColor = if ($philoOn) { $accent } else { $borderMute }

    $btnSlotPacer.Text = if ($pacerLive) {
        "4 • SIT-STAND`n🧍 LIVE CADENCE`n45m Sit / 15m Stand"
    } else {
        "4 • SIT-STAND`n🧍 PAUSED`nTap to start 45/15m"
    }
    $btnSlotPacer.BackColor = if ($pacerLive) { $bgCardOn } else { $bgCardOff }
    $btnSlotPacer.ForeColor = $fgPrimary
    $btnSlotPacer.FlatAppearance.BorderColor = if ($pacerLive) { $accent } else { $borderMute }

    $deckForm.Invalidate()
}

# 0.1 Hz Mayer Wave Timer (runs ONLY while Control Deck is visible and Philocardia is enabled)
$breathTimer = New-Object System.Windows.Forms.Timer
$breathTimer.Interval = 100
$script:breathPhaseSec = 0.0
$breathTimer.Add_Tick({
    $st = Get-PocketGullState
    if (-not $deckForm.Visible -or (-not $st.philocardia)) {
        $waveFill.Width = 0
        return
    }
    $script:breathPhaseSec = ($script:breathPhaseSec + 0.1) % 10.0
    $ratio = if ($script:breathPhaseSec -lt 4.0) {
        $script:breathPhaseSec / 4.0
    } else {
        1.0 - (($script:breathPhaseSec - 4.0) / 6.0)
    }
    $waveFill.Width = [int][Math]::Round(432.0 * [Math]::Max(0.0, [Math]::Min(1.0, $ratio)))
})

function Show-ControlDeck {
    Update-ControlDeckVisuals
    $wa = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    $deckForm.Location = New-Object System.Drawing.Point(($wa.Right - $deckForm.Width - 16), ($wa.Bottom - $deckForm.Height - 16))
    $deckForm.Show()
    $deckForm.Activate()
    $breathTimer.Start()
}

$deckForm.Add_Deactivate({
    $breathTimer.Stop()
    $deckForm.Hide()
})

$deckForm.Add_KeyDown({
    param($sender, $e)
    if ($e.KeyCode -eq [System.Windows.Forms.Keys]::Escape) {
        $breathTimer.Stop()
        $deckForm.Hide()
    }
})

# ── RIGHT-CLICK STREAMLINED 4-SECTION CONTEXT MENU ──
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip
$contextMenu.Font = $fontMenu

function Add-PaddedItem {
    param($Parent, [string]$Text, [bool]$Bold = $false)
    $item = $Parent.Add($Text)
    $item.Padding = New-Object System.Windows.Forms.Padding(6, 5, 6, 5)
    if ($Bold) { $item.Font = $fontMenuBold }
    return $item
}

# 1. Open 4-Slot Control Deck
$openDeckItem = Add-PaddedItem -Parent $contextMenu.Items -Text "🎛️ Open 4-Slot Control Deck" -Bold $true
$openDeckItem.Add_Click({ Show-ControlDeck })
$contextMenu.Items.Add("-") | Out-Null

# 2. Unified Circadian Scenes
$themesMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🎨 Circadian Scene (IDE + OS + Room)")
$themesMenu.Padding = New-Object System.Windows.Forms.Padding(6, 5, 6, 5)

$washiItem    = Add-PaddedItem -Parent $themesMenu.DropDownItems -Text "☀️ Washi Daylight (4000K + Ophthalmic)"
$hempItem     = Add-PaddedItem -Parent $themesMenu.DropDownItems -Text "🌿 Hemp Sepia (2700K + Ophthalmic)"
$obsidianItem = Add-PaddedItem -Parent $themesMenu.DropDownItems -Text "🌑 Peat Obsidian (WCAG AAA + Cyan)"
$scotopicItem = Add-PaddedItem -Parent $themesMenu.DropDownItems -Text "🔴 Scotopic 670nm Red (Melatonin Safe)"
$themesMenu.DropDownItems.Add("-") | Out-Null
$syncSunItem  = Add-PaddedItem -Parent $themesMenu.DropDownItems -Text "🌅 Sync to Current Solar Time Now"

$washiItem.Add_Click({ Apply-UnifiedScene "washi" })
$hempItem.Add_Click({ Apply-UnifiedScene "hemp" })
$obsidianItem.Add_Click({ Apply-UnifiedScene "obsidian" })
$scotopicItem.Add_Click({ Apply-UnifiedScene "670" })
$syncSunItem.Add_Click({
    Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$circadianScript`" -Action SyncNow -SkipEntrainment"
    Invoke-Earcon -Kind scene
})
$contextMenu.Items.Add($themesMenu) | Out-Null

# 3. Cursor & Motor Shield
$motorMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🖱️ Cursor & Ataxia Motor Shield")
$motorMenu.Padding = New-Object System.Windows.Forms.Padding(6, 5, 6, 5)

$ataxiaItem  = Add-PaddedItem -Parent $motorMenu.DropDownItems -Text "⚖️ Ataxia Shield (18px Drag + 750ms + 65ms Bounce)"
$curOphItem  = Add-PaddedItem -Parent $motorMenu.DropDownItems -Text "👁️ 64px Ophthalmic High-Contrast Cursors"
$curScotItem = Add-PaddedItem -Parent $motorMenu.DropDownItems -Text "🔴 64px Scotopic 650nm Red Cursors"
$curDefItem  = Add-PaddedItem -Parent $motorMenu.DropDownItems -Text "🖥️ Windows System Default Cursors"

$ataxiaItem.Add_Click({
    $st = Get-PocketGullState
    Set-AtaxiaShieldState -Enable (-not ([bool]$st.ataxiaShield))
})
$curOphItem.Add_Click({ Set-CursorScheme "ophthalmic" })
$curScotItem.Add_Click({ Set-CursorScheme "scotopic" })
$curDefItem.Add_Click({ Set-CursorScheme "default" })
$contextMenu.Items.Add($motorMenu) | Out-Null

# 4. Pacing & System
$pacingMenu = New-Object System.Windows.Forms.ToolStripMenuItem("🫀 Pacing, Fonts & Startup")
$pacingMenu.Padding = New-Object System.Windows.Forms.Padding(6, 5, 6, 5)

$philoItem   = Add-PaddedItem -Parent $pacingMenu.DropDownItems -Text "🫀 Philocardia (0.1 Hz Vagal Pacing)"
$bionicItem  = Add-PaddedItem -Parent $pacingMenu.DropDownItems -Text "👁️ Bionic Reading Saccadic Anchors"
$pacerItem   = Add-PaddedItem -Parent $pacingMenu.DropDownItems -Text "🧍 Sit-Stand Cadence Pacer (45m / 15m)"
$pacingMenu.DropDownItems.Add("-") | Out-Null
$fontItem    = Add-PaddedItem -Parent $pacingMenu.DropDownItems -Text "🔤 Refresh 38 Superfamily Fonts"
$startupItem = Add-PaddedItem -Parent $pacingMenu.DropDownItems -Text "🚀 Launch at Windows Startup"

$philoItem.Add_Click({
    $st = Get-PocketGullState
    Save-PocketGullStatePatch @{ philocardia = (-not [bool]$st.philocardia) } | Out-Null
    Invoke-Earcon -Kind toggle
})
$bionicItem.Add_Click({
    $st = Get-PocketGullState
    Save-PocketGullStatePatch @{ bionic = (-not [bool]$st.bionic) } | Out-Null
    Invoke-Earcon -Kind toggle
})
$pacerItem.Add_Click({
    $running = Test-ScriptDaemonRunning 'sit_stand_pacer\.ps1'
    Set-SitStandPacerState -Enable (-not $running)
})
$fontItem.Add_Click({
    Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$fontScript`""
    Invoke-Earcon -Kind toggle
})
$startupItem.Add_Click({
    Set-StartupState -enable (-not (Test-Path $startupShortcut))
})
$contextMenu.Items.Add($pacingMenu) | Out-Null

$contextMenu.Items.Add("-") | Out-Null
$exitItem = Add-PaddedItem -Parent $contextMenu.Items -Text "✖ Exit PocketGull Tray"
$exitItem.Add_Click({
    $breathTimer.Stop()
    $ipcTimer.Stop()
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    $deckForm.Dispose()
    $appContext.ExitThread()
})

$contextMenu.Add_Opening({
    $st = Get-PocketGullState
    $washiItem.Checked    = ($st.theme -eq "washi")
    $hempItem.Checked     = ($st.theme -eq "hemp")
    $obsidianItem.Checked = ($st.theme -eq "obsidian")
    $scotopicItem.Checked = ($st.theme -in @("670", "scotopic"))

    $ataxiaItem.Checked = ($st.ataxiaShield -ne $false)
    $philoItem.Checked  = [bool]$st.philocardia
    $bionicItem.Checked = [bool]$st.bionic
    $pacerItem.Checked  = Test-ScriptDaemonRunning 'sit_stand_pacer\.ps1'
    $startupItem.Checked = (Test-Path $startupShortcut)

    $curName = (Get-ItemProperty "HKCU:\Control Panel\Cursors" -Name "(default)" -ErrorAction SilentlyContinue)."(default)"
    $curOphItem.Checked  = ($curName -like "*Ophthalmic*")
    $curScotItem.Checked = ($curName -like "*Scotopic*")
    $curDefItem.Checked  = (-not $curOphItem.Checked -and -not $curScotItem.Checked)
})

# Self-Test Validation Gate (Empirical Verification without blocking UI loop)
if ($SelfTest) {
    Update-ControlDeckVisuals
    $slotsOk = ($btnSlotScene.Width -ge 200 -and $btnSlotScene.Height -ge 96 -and
                $btnSlotErgo.Width  -ge 200 -and $btnSlotErgo.Height  -ge 96 -and
                $btnSlotPhilo.Width -ge 200 -and $btnSlotPhilo.Height -ge 96 -and
                $btnSlotPacer.Width -ge 200 -and $btnSlotPacer.Height -ge 96)
    $deckForm.Dispose()
    $contextMenu.Dispose()
    $showDeckEvent.Dispose()
    Write-Output "TRAY_SELFTEST=$slotsOk FONT=$uiFontName"
    exit $(if ($slotsOk) { 0 } else { 1 })
}

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = if (Test-Path $iconPath) { New-Object System.Drawing.Icon($iconPath) } else { [System.Drawing.SystemIcons]::Application }
$notifyIcon.Text = "PocketGull Assistive Ergonomics (Click for 4-Slot Deck)"
$notifyIcon.ContextMenuStrip = $contextMenu
$notifyIcon.Visible = $true

# Left-Click opens the 4-Slot Dysmetria-Safe Control Deck
$notifyIcon.Add_MouseClick({
    param($sender, $e)
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        if ($deckForm.Visible) {
            $breathTimer.Stop()
            $deckForm.Hide()
        } else {
            Show-ControlDeck
        }
    }
})

# IPC Poll Timer: if user clicks Desktop shortcut while daemon is running, pop open the Control Deck
$ipcTimer = New-Object System.Windows.Forms.Timer
$ipcTimer.Interval = 300
$ipcTimer.Add_Tick({
    if ($showDeckEvent.WaitOne(0)) {
        Show-ControlDeck
    }
})
$ipcTimer.Start()

$appContext = New-Object System.Windows.Forms.ApplicationContext

# Non-blocking Startup Initialization
$initialState = Get-PocketGullState
if ($initialState.ataxiaShield -ne $false) {
    if (Test-Path $ergoScript) {
        Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$ergoScript`" -Action Apply"
    }
    if ((Test-Path $mouseAssistScript) -and (-not (Test-ScriptDaemonRunning 'Start-MouseAssist\.ps1'))) {
        Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$mouseAssistScript`""
    }
}
if (Test-Path $circadianScript) {
    Start-PocketGullCommand -Exe $pwsh -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$circadianScript`" -Action SyncNow -SkipEntrainment"
}

try {
    [System.Windows.Forms.Application]::Run($appContext)
} finally {
    if ($script:trayMutex) {
        try { $script:trayMutex.ReleaseMutex() } catch {}
        $script:trayMutex.Dispose()
    }
    $showDeckEvent.Dispose()
}
