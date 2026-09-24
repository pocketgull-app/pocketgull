# Script to properly install and register ALL PocketGull brand fonts in Windows for user profile
# Covers brand lettering, display chisel-tip, technical fineliner, mathematical symbols, and monospace.

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class WinFontHelper {
    [DllImport("gdi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern int AddFontResource(string lpszFilename);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);
}
"@

$fontsDir = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
if (-not (Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null
}

$sourceDir = "C:\Users\philg\Pocketgull\pocketgull\public\brand\fonts"
$fontFiles = Get-ChildItem -Path $sourceDir -Filter "*.ttf"

Write-Host "Installing PocketGull Typeface Superfamily ($($fontFiles.Count) font cuts)..." -ForegroundColor Cyan

$installedCount = 0

foreach ($font in $fontFiles) {
    $src = $font.FullName
    $dst = Join-Path $fontsDir $font.Name
    
    try {
        Copy-Item -Path $src -Destination $dst -Force
    } catch {
        # File may already be loaded into memory by active IDE/subsystem
    }

    $baseName = $font.BaseName
    # Create normalized font registration variations (with space, without space, hyphenated)
    $cleanName1 = $baseName.Replace("-", " ")
    $cleanName2 = $baseName.Replace("PocketGull", "Pocket Gull").Replace("-", " ")
    $cleanName3 = $baseName

    $regNames = @(
        "$cleanName1 (TrueType)",
        "$cleanName2 (TrueType)",
        "$cleanName3 (TrueType)"
    ) | Select-Object -Unique

    foreach ($reg in $regNames) {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts' -Name $reg -Value $dst -Force
    }

    [void][WinFontHelper]::AddFontResource($dst)
    $installedCount++
}

# Broadcast WM_FONTCHANGE so running apps (Electron/VS Code, Windows Terminal, DirectWrite) refresh font caches
$HWND_BROADCAST = [IntPtr]0xffff
$WM_FONTCHANGE = 0x001D
$result = [IntPtr]::Zero
[WinFontHelper]::SendMessageTimeout($HWND_BROADCAST, $WM_FONTCHANGE, [IntPtr]::Zero, [IntPtr]::Zero, 2, 1000, [ref]$result) | Out-Null

Write-Host "Successfully installed and registered $installedCount PocketGull fonts." -ForegroundColor Green
Write-Host "Broadcasted WM_FONTCHANGE to Windows DirectWrite and GDI subsystems." -ForegroundColor Cyan
