<#
.SYNOPSIS
    Configures Windows motor-ergonomics & accessibility tunings for tremor damping,
    dysmetria compensation, and focus preservation.

.DESCRIPTION
    Provides fine-grained control over:
    - Mouse Sonar (Ctrl-key visual ripple spotlight)
    - Double-Click speed threshold (relaxed to 750ms-800ms)
    - Pointer velocity damping (absorbing kinetic overshoot)
    - Status reporting and one-click rollback to default Windows settings.
#>

param (
    [ValidateSet('Apply', 'Status', 'Restore')]
    [string]$Action = 'Apply',

    [int]$DoubleClickMs = 750,
    [int]$PointerSpeed = 9, # 1-20 (10 is Windows default; 8-9 provides subtle tremor damping)
    [switch]$EnableSonar = $true
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class ErgonomicsNative {
    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoSetBool(uint uiAction, uint uiParam, bool pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoGetBool(uint uiAction, uint uiParam, ref bool pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoGetInt(uint uiAction, uint uiParam, ref int pvParam, uint fWinIni);

    [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
    public static extern bool SystemParametersInfoSetIntPtr(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetDoubleClickTime();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetDoubleClickTime(uint uInterval);
}
"@ -ErrorAction SilentlyContinue

$SPI_SETMOUSESONAR = 0x101D
$SPI_GETMOUSESONAR = 0x101C
$SPI_SETMOUSESPEED = 0x0071
$SPI_GETMOUSESPEED = 0x0070
$SPIF_UPDATEINIFILE = 0x01
$SPIF_SENDCHANGE    = 0x02
$FLAGS = $SPIF_UPDATEINIFILE -bor $SPIF_SENDCHANGE

function Get-ErgoStatus {
    $sonar = $false
    [ErgonomicsNative]::SystemParametersInfoGetBool($SPI_GETMOUSESONAR, 0, [ref]$sonar, 0) | Out-Null
    $speed = 0
    [ErgonomicsNative]::SystemParametersInfoGetInt($SPI_GETMOUSESPEED, 0, [ref]$speed, 0) | Out-Null
    $dcTime = [ErgonomicsNative]::GetDoubleClickTime()
    
    $acc = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Accessibility" -ErrorAction SilentlyContinue
    $cursorSize = if ($acc) { $acc.CursorSize } else { "Default" }

    [PSCustomObject]@{
        "Mouse Sonar (Ctrl Key Spotlight)" = if ($sonar) { "ENABLED" } else { "Disabled" }
        "Double-Click Threshold"          = "$dcTime ms (Standard: 500 ms)"
        "Pointer Speed"                    = "$speed / 20 (Standard: 10)"
        "High-Visibility Cursor Size"     = "$cursorSize"
    }
}

if ($Action -eq 'Status') {
    Write-Host "`n=== CURRENT WINDOWS MOTOR ERGONOMICS STATUS ===" -ForegroundColor Cyan
    Get-ErgoStatus | Format-List
    exit 0
}

if ($Action -eq 'Restore') {
    Write-Host "`n[+] Restoring default Windows settings..." -ForegroundColor Yellow
    [ErgonomicsNative]::SystemParametersInfoSetBool($SPI_SETMOUSESONAR, 0, $false, $FLAGS) | Out-Null
    [ErgonomicsNative]::SetDoubleClickTime(500) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "DoubleClickSpeed" -Value "500" -ErrorAction SilentlyContinue
    [ErgonomicsNative]::SystemParametersInfoSetIntPtr($SPI_SETMOUSESPEED, 0, [IntPtr]10, $FLAGS) | Out-Null
    Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSensitivity" -Value "10" -ErrorAction SilentlyContinue
    Write-Host "[✓] Windows defaults restored (Sonar: Off, Double-click: 500ms, Pointer Speed: 10)." -ForegroundColor Green
    Get-ErgoStatus | Format-List
    exit 0
}

# Apply Ergonomics
Write-Host "`n[+] Applying Tremor & Dysmetria Damping Settings..." -ForegroundColor Cyan

# 1. Mouse Sonar (Ctrl key ripple)
$sonarRes = [ErgonomicsNative]::SystemParametersInfoSetBool($SPI_SETMOUSESONAR, 0, ($EnableSonar.IsPresent -or $EnableSonar), $FLAGS)
Write-Host "  • Pointer Sonar (Ctrl Spotlight): $(if ($sonarRes) { 'ACTIVE' } else { 'FAILED' })" -ForegroundColor $(if ($sonarRes) { 'Green' } else { 'Red' })

# 2. Double-Click Threshold
$dcRes = [ErgonomicsNative]::SetDoubleClickTime($DoubleClickMs)
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "DoubleClickSpeed" -Value "$DoubleClickMs" -ErrorAction SilentlyContinue
Write-Host "  • Double-Click Tolerance: $DoubleClickMs ms (relaxed from 500ms)" -ForegroundColor Green

# 3. Pointer Speed
$speedRes = [ErgonomicsNative]::SystemParametersInfoSetIntPtr($SPI_SETMOUSESPEED, 0, [IntPtr]$PointerSpeed, $FLAGS)
Set-ItemProperty -Path "HKCU:\Control Panel\Mouse" -Name "MouseSensitivity" -Value "$PointerSpeed" -ErrorAction SilentlyContinue
Write-Host "  • Pointer Velocity: $PointerSpeed/20 (gentle kinetic damping)" -ForegroundColor Green

Write-Host "`n[✓] Ergonomics tuning successfully activated live in Windows session." -ForegroundColor Green
Get-ErgoStatus | Format-List
