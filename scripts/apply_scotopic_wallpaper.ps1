Add-Type -AssemblyName System.Drawing

$width = 3840
$height = 2160
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Pure obsidian background (melatonin preservation)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 9, 11))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

$centerX = $width / 2
$centerY = $height / 2

# Subtle Scotopic 650nm Red concentric Chladni cymatics / Zen rings
$scotopicPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 220, 38, 38), 3)

for ($r = 120; $r -le 900; $r += 140) {
    $g.DrawEllipse($scotopicPen, [float]($centerX - $r), [float]($centerY - $r), [float]($r * 2), [float]($r * 2))
}

# Core 7.83 Hz harmonic focal seed
$coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 220, 38, 38))
$g.FillEllipse($coreBrush, [float]($centerX - 16), [float]($centerY - 16), 32, 32)

$g.Dispose()

$outDir = "C:\Users\philg\AppData\Local\PocketGull\Wallpapers"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$outPath = Join-Path $outDir "scotopic_cymatics_3840.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "GENERATED: $outPath" -ForegroundColor Green

# Set as Windows wallpaper live via User32 SPI_SETDESKWALLPAPER
$code = @"
using System;
using System.Runtime.InteropServices;
public class WinBg {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
[WinBg]::SystemParametersInfo(20, 0, $outPath, 3) | Out-Null
Write-Host "WALLPAPER_APPLIED" -ForegroundColor Green
