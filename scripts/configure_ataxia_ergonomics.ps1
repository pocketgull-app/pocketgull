# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    Configures Windows motor-ergonomics & accessibility tunings for cerebellar ataxia
    tremor damping, drag-slip protection, dysmetria compensation, and focus preservation.

.DESCRIPTION
    Provides live user-space control over:
    - Mouse Sonar (Ctrl-key visual ripple spotlight)
    - Double-Click speed threshold (relaxed from 500ms to 750ms)
    - Pointer velocity damping (9/20 absorbing kinetic overshoot)
    - Tremor Drag-Slip Guard (DragWidth/DragHeight raised from 4px to 18px so micro-tremors during clicks never trigger accidental drags)
    - Hover Stability Box (MouseHoverWidth/Height raised from 4px to 16px)
    - Persistent state sync with .pocketgull_a11y.json and one-click rollback.
#>

param (
    [ValidateSet('Apply', 'Status', 'Restore')]
    [string]$Action = 'Apply',

    [int]$DoubleClickMs = 750,
    [int]$PointerSpeed = 9,       # 1-20 (10 is Windows default; 8-9 provides subtle tremor damping)
    [int]$DragThresholdPx = 18,   # Standard Windows is 4px; 18px prevents tremor click-slips
    [int]$HoverBoxPx = 16,        # Standard Windows is 4px; 16px stabilizes hover tooltips
    [switch]$EnableSonar = $true
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class ErgonomicsNativeV2 {
    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoSetBool(uint uiAction, uint uiParam, bool pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoGetBool(uint uiAction, uint uiParam, ref bool pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoGetInt(uint uiAction, uint uiParam, ref int pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoSetIntPtr(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoSetUIntParam(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetDoubleClickTime();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetDoubleClickTime(uint uInterval);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);
}
"@ -ErrorAction SilentlyContinue

$SPI_SETDRAGWIDTH        = 0x004C
$SPI_SETDRAGHEIGHT       = 0x004D
$SPI_SETMOUSEHOVERWIDTH  = 0x0063
$SPI_SETMOUSEHOVERHEIGHT = 0x0065
$SPI_GETMOUSESPEED       = 0x0070
$SPI_SETMOUSESPEED       = 0x0071
$SPI_GETMOUSESONAR       = 0x101C
$SPI_SETMOUSESONAR       = 0x101D

$SM_CXDRAG = 68
$SM_CYDRAG = 69

$SPIF_UPDATEINIFILE = 0x01
$SPIF_SENDCHANGE    = 0x02
$FLAGS = $SPIF_UPDATEINIFILE -bor $SPIF_SENDCHANGE

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = Split-Path -Parent $scriptDir
$statePath = Join-Path $repoDir ".pocketgull_a11y.json"

function Update-A11yShieldState([bool]$enabled, [int]$dragPx) {
    $obj = @{
        theme           = "hemp"
        philocardia     = $false
        bionic          = $false
        circadian       = $true
        ataxiaShield    = $enabled
        dragThresholdPx = $dragPx
    }
    if (Test-Path $statePath) {
        try {
            $existing = Get-Content $statePath -Raw | ConvertFrom-Json
            foreach ($prop in $existing.PSObject.Properties) {
                $obj[$prop.Name] = $prop.Value
            }
        } catch {}
    }
    $obj['ataxiaShield']    = $enabled
    $obj['dragThresholdPx'] = $dragPx
    $obj | ConvertTo-Json | Set-Content -Path $statePath -Encoding UTF8
}

function Get-ErgoStatus {
    $sonar = $false
    [ErgonomicsNativeV2]::SystemParametersInfoGetBool($SPI_GETMOUSESONAR, 0, [ref]$sonar, 0) | Out-Null
    $speed = 0
    [ErgonomicsNativeV2]::SystemParametersInfoGetInt($SPI_GETMOUSESPEED, 0, [ref]$speed, 0) | Out-Null
    $dcTime = [ErgonomicsNativeV2]::GetDoubleClickTime()
    $dragW  = [ErgonomicsNativeV2]::GetSystemMetrics($SM_CXDRAG)
    $dragH  = [ErgonomicsNativeV2]::GetSystemMetrics($SM_CYDRAG)

    $acc = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Accessibility" -ErrorAction SilentlyContinue
    $cursorSize = if ($acc -and $acc.CursorSize) { $acc.CursorSize } else { "Default" }

    [PSCustomObject]@{
        "Mouse Sonar (Ctrl Key Spotlight)" = if ($sonar) { "ENABLED" } else { "Disabled" }
        "Double-Click Threshold"          = "$dcTime ms (Standard: 500 ms)"
        "Pointer Speed"                   = "$speed / 20 (Standard: 10)"
        "Tremor Drag-Slip Guard"          = "${dragW}x${dragH} px (Standard: 4x4 px)"
        "High-Visibility Cursor Size"     = "$cursorSize"
    }
}

if ($Action -eq 'Status') {
    Write-Host "`n=== CURRENT WINDOWS MOTOR ERGONOMICS STATUS ===" -ForegroundColor Cyan
    Get-ErgoStatus | Format-List
    exit 0
}

if ($Action -eq 'Restore') {
    Write-Host "`n[+] Restoring default Windows motor settings..." -ForegroundColor Yellow
    [ErgonomicsNativeV2]::SystemParametersInfoSetBool($SPI_SETMOUSESONAR, 0, $false, $FLAGS) | Out-Null
    [ErgonomicsNativeV2]::SetDoubleClickTime(500) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "DoubleClickSpeed" -Value "500" -ErrorAction SilentlyContinue
    [ErgonomicsNativeV2]::SystemParametersInfoSetIntPtr($SPI_SETMOUSESPEED, 0, [IntPtr]10, $FLAGS) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSensitivity" -Value "10" -ErrorAction SilentlyContinue

    [ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETDRAGWIDTH, 4, [IntPtr]::Zero, $FLAGS) | Out-Null
    [ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETDRAGHEIGHT, 4, [IntPtr]::Zero, $FLAGS) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "DragWidth" -Value "4" -ErrorAction SilentlyContinue
    Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "DragHeight" -Value "4" -ErrorAction SilentlyContinue

    [ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETMOUSEHOVERWIDTH, 4, [IntPtr]::Zero, $FLAGS) | Out-Null
    [ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETMOUSEHOVERHEIGHT, 4, [IntPtr]::Zero, $FLAGS) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseHoverWidth" -Value "4" -ErrorAction SilentlyContinue
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseHoverHeight" -Value "4" -ErrorAction SilentlyContinue

    Update-A11yShieldState -enabled $false -dragPx 4
    Write-Host "[OK] Windows defaults restored (Sonar: Off, Double-Click: 500ms, Speed: 10, Drag: 4x4px)." -ForegroundColor Green
    Get-ErgoStatus | Format-List
    exit 0
}

# Apply Ergonomics
Write-Host "`n[+] Applying Ataxia Tremor, Dysmetria & Drag-Slip Shield..." -ForegroundColor Cyan

# 1. Mouse Sonar (Ctrl key ripple)
$sonarRes = [ErgonomicsNativeV2]::SystemParametersInfoSetBool($SPI_SETMOUSESONAR, 0, ($EnableSonar.IsPresent -or $EnableSonar), $FLAGS)
Write-Host "  * Pointer Sonar (Ctrl Spotlight): $(if ($sonarRes) { 'ACTIVE' } else { 'FAILED' })" -ForegroundColor $(if ($sonarRes) { 'Green' } else { 'Red' })

# 2. Double-Click Threshold
[ErgonomicsNativeV2]::SetDoubleClickTime([uint32]$DoubleClickMs) | Out-Null
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "DoubleClickSpeed" -Value "$DoubleClickMs" -ErrorAction SilentlyContinue
Write-Host "  * Double-Click Tolerance: $DoubleClickMs ms (relaxed from 500ms)" -ForegroundColor Green

# 3. Pointer Speed
[ErgonomicsNativeV2]::SystemParametersInfoSetIntPtr($SPI_SETMOUSESPEED, 0, [IntPtr]$PointerSpeed, $FLAGS) | Out-Null
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSensitivity" -Value "$PointerSpeed" -ErrorAction SilentlyContinue
Write-Host "  * Pointer Velocity: $PointerSpeed/20 (kinetic overshoot damping)" -ForegroundColor Green

# 4. Tremor Drag-Slip Guard & Hover Box
[ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETDRAGWIDTH, [uint32]$DragThresholdPx, [IntPtr]::Zero, $FLAGS) | Out-Null
[ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETDRAGHEIGHT, [uint32]$DragThresholdPx, [IntPtr]::Zero, $FLAGS) | Out-Null
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "DragWidth" -Value "$DragThresholdPx" -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "DragHeight" -Value "$DragThresholdPx" -ErrorAction SilentlyContinue

[ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETMOUSEHOVERWIDTH, [uint32]$HoverBoxPx, [IntPtr]::Zero, $FLAGS) | Out-Null
[ErgonomicsNativeV2]::SystemParametersInfoSetUIntParam($SPI_SETMOUSEHOVERHEIGHT, [uint32]$HoverBoxPx, [IntPtr]::Zero, $FLAGS) | Out-Null
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseHoverWidth" -Value "$HoverBoxPx" -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseHoverHeight" -Value "$HoverBoxPx" -ErrorAction SilentlyContinue
Write-Host "  * Tremor Drag-Slip Guard: ${DragThresholdPx}x${DragThresholdPx} px (Hover box: ${HoverBoxPx}x${HoverBoxPx} px)" -ForegroundColor Green

Update-A11yShieldState -enabled $true -dragPx $DragThresholdPx
Write-Host "`n[OK] Ergonomics tuning successfully activated live in Windows session." -ForegroundColor Green
Get-ErgoStatus | Format-List
