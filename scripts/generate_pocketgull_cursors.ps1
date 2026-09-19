# PocketGull High-Visibility & Scotopic Cursor Foundry
# Generates 64x64 multi-contrast clinical and accessibility cursors for Windows.

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$cursorDir = Join-Path $env:LOCALAPPDATA "PocketGull\Cursors"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
}

function Save-CurDib {
    param(
        [System.Drawing.Bitmap]$bmp,
        [int]$hotspotX,
        [int]$hotspotY,
        [string]$outputPath
    )
    $w = $bmp.Width
    $h = $bmp.Height

    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)

    # 1. ICONDIR Header (6 bytes)
    $bw.Write([uint16]0)      # Reserved
    $bw.Write([uint16]2)      # Type = 2 (Cursor)
    $bw.Write([uint16]1)      # 1 image

    $xorSize = $w * $h * 4
    $andStride = [Math]::Ceiling($w / 32) * 4
    $andSize = $andStride * $h
    $imgSize = 40 + $xorSize + $andSize

    # 2. ICONDIRENTRY (16 bytes)
    $bw.Write([byte]($w -band 0xFF))
    $bw.Write([byte]($h -band 0xFF))
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    $bw.Write([uint16]$hotspotX)
    $bw.Write([uint16]$hotspotY)
    $bw.Write([uint32]$imgSize)
    $bw.Write([uint32]22)     # Offset to image data

    # 3. BITMAPINFOHEADER (40 bytes)
    $bw.Write([uint32]40)
    $bw.Write([int32]$w)
    $bw.Write([int32]($h * 2))# Doubled for XOR + AND
    $bw.Write([uint16]1)      # Planes
    $bw.Write([uint16]32)     # 32 bpp ARGB
    $bw.Write([uint32]0)      # BI_RGB
    $bw.Write([uint32]($xorSize + $andSize))
    $bw.Write([int32]0)
    $bw.Write([int32]0)
    $bw.Write([uint32]0)
    $bw.Write([uint32]0)

    # 4. Pixel data bottom-to-top
    for ($y = $h - 1; $y -ge 0; $y--) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $bw.Write([byte]$c.B)
            $bw.Write([byte]$c.G)
            $bw.Write([byte]$c.R)
            $bw.Write([byte]$c.A)
        }
    }

    # 5. AND mask (0 for 32-bit alpha transparency)
    for ($i = 0; $i -lt $andSize; $i++) {
        $bw.Write([byte]0)
    }

    $bw.Flush()
    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())
    $bw.Close()
    $ms.Close()
}

Write-Host "`n=== POCKETGULL ACCESSIBILITY CURSOR FOUNDRY ===" -ForegroundColor Cyan
Write-Host "Destination: $cursorDir" -ForegroundColor DarkGray

# ── 1. OPHTHALMIC HIGH-CONTRAST ARROW (Cyan & Obsidian) ──
$bmpArrow = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpArrow)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penCyan = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 45, 212, 191), 3.0)
$brushObsidian = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 9, 9, 11))

[System.Drawing.Point[]]$ptsArrow = @(
    [System.Drawing.Point]::new(6, 6),
    [System.Drawing.Point]::new(6, 48),
    [System.Drawing.Point]::new(18, 38),
    [System.Drawing.Point]::new(28, 58),
    [System.Drawing.Point]::new(36, 54),
    [System.Drawing.Point]::new(26, 34),
    [System.Drawing.Point]::new(40, 34)
)
$g.FillPolygon($brushObsidian, $ptsArrow)
$g.DrawPolygon($penCyan, $ptsArrow)
$g.Dispose()

$pathArrowOph = Join-Path $cursorDir "pocketgull_ophthalmic_arrow.cur"
Save-CurDib -bmp $bmpArrow -hotspotX 6 -hotspotY 6 -outputPath $pathArrowOph
$bmpArrow.Dispose()
Write-Host "✔ Created: pocketgull_ophthalmic_arrow.cur (Obsidian Core + 505nm Cyan Halo)" -ForegroundColor Green

# ── 2. OPHTHALMIC BRACKETED I-BEAM (With Amber Indicator) ──
$bmpIBeam = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpIBeam)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penBeamOutline = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 9, 9, 11), 5.0)
$penBeamCore = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 45, 212, 191), 2.5)
$brushAmberPip = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 245, 158, 11))

# Top crossbar
$g.DrawLine($penBeamOutline, 20, 10, 44, 10)
$g.DrawLine($penBeamCore, 20, 10, 44, 10)

# Bottom crossbar
$g.DrawLine($penBeamOutline, 20, 54, 44, 54)
$g.DrawLine($penBeamCore, 20, 54, 44, 54)

# Central vertical stem
$g.DrawLine($penBeamOutline, 32, 10, 32, 54)
$g.DrawLine($penBeamCore, 32, 10, 32, 54)

# Central amber acuity pip
$g.FillEllipse($brushAmberPip, 29, 29, 6, 6)
$g.Dispose()

$pathIbeamOph = Join-Path $cursorDir "pocketgull_ophthalmic_ibeam.cur"
Save-CurDib -bmp $bmpIBeam -hotspotX 32 -hotspotY 32 -outputPath $pathIbeamOph
$bmpIBeam.Dispose()
Write-Host "✔ Created: pocketgull_ophthalmic_ibeam.cur (Bracketed High-Acuity Serif Beam)" -ForegroundColor Green

# ── 3. PRECISION DIAGNOSTIC CALIPER (Open Center Reticle) ──
$bmpCross = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpCross)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penCrossBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 9, 9, 11), 4.0)
$penCrossCore = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 45, 212, 191), 1.5)
$penCrossRing = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 245, 158, 11), 1.5)

# Outer reticle ring
$g.DrawEllipse($penCrossBorder, 20, 20, 24, 24)
$g.DrawEllipse($penCrossRing, 20, 20, 24, 24)

# Crosshairs with open center gap (radius 6px)
$g.DrawLine($penCrossBorder, 32, 6, 32, 22)
$g.DrawLine($penCrossCore, 32, 6, 32, 22)

$g.DrawLine($penCrossBorder, 32, 42, 32, 58)
$g.DrawLine($penCrossCore, 32, 42, 32, 58)

$g.DrawLine($penCrossBorder, 6, 32, 22, 32)
$g.DrawLine($penCrossCore, 6, 32, 22, 32)

$g.DrawLine($penCrossBorder, 42, 32, 58, 32)
$g.DrawLine($penCrossCore, 42, 32, 58, 32)
$g.Dispose()

$pathCross = Join-Path $cursorDir "pocketgull_precision_cross.cur"
Save-CurDib -bmp $bmpCross -hotspotX 32 -hotspotY 32 -outputPath $pathCross
$bmpCross.Dispose()
Write-Host "✔ Created: pocketgull_precision_cross.cur (1-Arcminute Open-Aperture Reticle)" -ForegroundColor Green

# ── 4. PHILOCARDIA VAGAL BUSY / WAIT CURSOR ──
$bmpWait = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpWait)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penRose = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 244, 63, 94), 3.0)
$penCopper = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 194, 65, 12), 2.0)
$brushDarkCore = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 9, 9, 11))

$g.FillEllipse($brushDarkCore, 16, 16, 32, 32)
$g.DrawEllipse($penCopper, 16, 16, 32, 32)
$g.DrawEllipse($penRose, 22, 22, 20, 20)
$g.Dispose()

$pathWait = Join-Path $cursorDir "pocketgull_philocardia_wait.cur"
Save-CurDib -bmp $bmpWait -hotspotX 32 -hotspotY 32 -outputPath $pathWait
$bmpWait.Dispose()
Write-Host "✔ Created: pocketgull_philocardia_wait.cur (0.1 Hz Vagal Respiratory Orb)" -ForegroundColor Green

# ── 5. SCOTOPIC 650nm NARROW-BAND RED ARROW ──
$bmpScotopic = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpScotopic)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penDeepRed = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 127, 29, 29), 3.0)
$brushCrimson = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 220, 38, 38))

$g.FillPolygon($brushCrimson, $ptsArrow)
$g.DrawPolygon($penDeepRed, $ptsArrow)
$g.Dispose()

$pathArrowScot = Join-Path $cursorDir "pocketgull_scotopic_arrow.cur"
Save-CurDib -bmp $bmpScotopic -hotspotX 6 -hotspotY 6 -outputPath $pathArrowScot
$bmpScotopic.Dispose()
Write-Host "✔ Created: pocketgull_scotopic_arrow.cur (650nm Rhodopsin-Preserving Red)" -ForegroundColor Green

# ── 6. SCOTOPIC 650nm RED I-BEAM ──
$bmpScotIBeam = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpScotIBeam)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$penScotOutline = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 127, 29, 29), 5.0)
$penScotCore = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 220, 38, 38), 2.5)
$brushScotAmber = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 251, 191, 36))

$g.DrawLine($penScotOutline, 20, 10, 44, 10)
$g.DrawLine($penScotCore, 20, 10, 44, 10)
$g.DrawLine($penScotOutline, 20, 54, 44, 54)
$g.DrawLine($penScotCore, 20, 54, 44, 54)
$g.DrawLine($penScotOutline, 32, 10, 32, 54)
$g.DrawLine($penScotCore, 32, 10, 32, 54)
$g.FillEllipse($brushScotAmber, 29, 29, 6, 6)
$g.Dispose()

$pathIbeamScot = Join-Path $cursorDir "pocketgull_scotopic_ibeam.cur"
Save-CurDib -bmp $bmpScotIBeam -hotspotX 32 -hotspotY 32 -outputPath $pathIbeamScot
$bmpScotIBeam.Dispose()
Write-Host "✔ Created: pocketgull_scotopic_ibeam.cur (Monochromatic Red Acuity Beam)" -ForegroundColor Green

# ── 7. REGISTER SCHEMES IN WINDOWS REGISTRY ──
$schemesKey = "HKCU:\Control Panel\Cursors\Schemes"
if (-not (Test-Path $schemesKey)) {
    New-Item -Path $schemesKey -Force | Out-Null
}

# Scheme 1: PocketGull Ophthalmic High-Contrast
# Format: Arrow,Help,AppStarting,Wait,Crosshair,IBeam,NWPen,No,SizeNS,SizeWE,SizeNWSE,SizeNESW,SizeAll,UpArrow,Hand,Pin,Person
$ophScheme = "$pathArrowOph,,$pathWait,$pathWait,$pathCross,$pathIbeamOph,,,,,,,,,$pathArrowOph,,"
Set-ItemProperty -Path $schemesKey -Name "PocketGull Ophthalmic High-Contrast" -Value $ophScheme

# Scheme 2: PocketGull Scotopic 650nm Red
$scotScheme = "$pathArrowScot,,$pathWait,$pathWait,$pathCross,$pathIbeamScot,,,,,,,,,$pathArrowScot,,"
Set-ItemProperty -Path $schemesKey -Name "PocketGull Scotopic 650nm Red" -Value $scotScheme

Write-Host "`n✔ Registered schemes in HKCU:\Control Panel\Cursors\Schemes:" -ForegroundColor Cyan
Write-Host "  • PocketGull Ophthalmic High-Contrast"
Write-Host "  • PocketGull Scotopic 650nm Red"
Write-Host "Zero administrative elevation required (100% user-space).`n" -ForegroundColor DarkGray
