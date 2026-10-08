param(
    [ValidateSet('670', 'scotopic', 'washi', 'hemp')]
    [string]$Theme = '670'
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WinThemeBroadcaster {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, 
        uint Msg, 
        UIntPtr wParam, 
        string lParam, 
        uint fuFlags, 
        uint uTimeout, 
        out UIntPtr lpdwResult
    );

    public const int HWND_BROADCAST = 0xffff;
    public const uint WM_SETTINGCHANGE = 0x001A;
    public const uint WM_THEMECHANGED = 0x031A;
    public const uint SMTO_ABORTIFHUNG = 0x0002;

    public static void BroadcastThemeChange() {
        UIntPtr result;
        SendMessageTimeout((IntPtr)HWND_BROADCAST, WM_SETTINGCHANGE, UIntPtr.Zero, "ImmersiveColorSet", SMTO_ABORTIFHUNG, 1000, out result);
        SendMessageTimeout((IntPtr)HWND_BROADCAST, WM_SETTINGCHANGE, UIntPtr.Zero, "WindowsThemeElement", SMTO_ABORTIFHUNG, 1000, out result);
        SendMessageTimeout((IntPtr)HWND_BROADCAST, WM_THEMECHANGED, UIntPtr.Zero, null, SMTO_ABORTIFHUNG, 1000, out result);
    }
}
"@ -ErrorAction SilentlyContinue

Write-Host "[+] Synchronizing Taskbars (Primary & Secondary Display)..." -ForegroundColor Cyan

Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "ColorPrevalence" -Value 1 -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorPrevalence" -Value 1 -Type DWord

if ($Theme -in '670', 'scotopic') {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 0 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorizationColor" -Value 0xC4DC2626 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "AccentColor" -Value 0x2626DC -Type DWord
} elseif ($Theme -eq 'washi') {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 1 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 1 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorizationColor" -Value 0xC4C29B38 -Type DWord
} else {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 1 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 1 -Type DWord
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorizationColor" -Value 0xC48A6240 -Type DWord
}

[WinThemeBroadcaster]::BroadcastThemeChange()

# Ensure theme file is active for shell components
$themeFile = "C:\Users\philg\AppData\Local\Microsoft\Windows\Themes\PocketGull-Scotopic-650nm.theme"
if (Test-Path $themeFile) {
    Start-Process rundll32.exe -ArgumentList "themecpl.dll,OpenThemeAction `"$themeFile`""
    Start-Sleep -Seconds 1
    Get-Process systemsettings -ErrorAction SilentlyContinue | ForEach-Object { $_.CloseMainWindow() }
}

[WinThemeBroadcaster]::BroadcastThemeChange()
Write-Host "[OK] Both taskbars synchronized to $Theme." -ForegroundColor Green
