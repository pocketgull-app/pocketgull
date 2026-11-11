# SPDX-License-Identifier: Apache-2.0
# PocketGull High-Visibility & Scotopic Cursor Foundry
# Generates 64x64 multi-contrast clinical and accessibility cursors for Windows
# (Arrow, Hand/Link, I-Beam, Crosshair, Wait, SizeNS, SizeWE in both Ophthalmic & 650nm Scotopic).

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

function New-HandCursor {
    param(
        [System.Drawing.Color]$FillColor,
        [System.Drawing.Color]$StrokeColor,
        [System.Drawing.Color]$PipColor,
        [string]$OutputPath
    )
    $bmp = [System.Drawing.Bitmap]::new(64, 64)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $brushFill = [System.Drawing.SolidBrush]::new($FillColor)
    $penStroke = [System.Drawing.Pen]::new($StrokeColor, 3.0)
    $penStroke.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $brushPip  = [System.Drawing.SolidBrush]::new($PipColor)

    # Clean dysmetria-legible geometric pointing hand silhouette (index fingertip at 22, 10)
    [System.Drawing.Point[]]$ptsHand = @(
        [System.Drawing.Point]::new(18, 12),
        [System.Drawing.Point]::new(22, 8),
        [System.Drawing.Point]::new(26, 12),
        [System.Drawing.Point]::new(26, 26),
        [System.Drawing.Point]::new(44, 28),
        [System.Drawing.Point]::new(48, 33),
        [System.Drawing.Point]::new(46, 52),
        [System.Drawing.Point]::new(38, 58),
        [System.Drawing.Point]::new(20, 58),
        [System.Drawing.Point]::new(14, 48),
        [System.Drawing.Point]::new(8,  36),
        [System.Drawing.Point]::new(12, 32),
        [System.Drawing.Point]::new(18, 37)
    )
    $g.FillPolygon($brushFill, $ptsHand)
    $g.DrawPolygon($penStroke, $ptsHand)
    # Acuity target pip at fingertip hotspot
    $g.FillEllipse($brushPip, 19, 9, 6, 6)

    $g.Dispose()
    Save-CurDib -bmp $bmp -hotspotX 22 -hotspotY 10 -outputPath $OutputPath
    $bmp.Dispose()
}

function New-ResizeCursor {
    param(
        [bool]$Vertical,
        [System.Drawing.Color]$FillColor,
        [System.Drawing.Color]$StrokeColor,
        [string]$OutputPath
    )
    $bmp = [System.Drawing.Bitmap]::new(64, 64)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $brushFill = [System.Drawing.SolidBrush]::new($FillColor)
    $penStroke = [System.Drawing.Pen]::new($StrokeColor, 2.5)
    $penStroke.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    if ($Vertical) {
        [System.Drawing.Point[]]$pts = @(
            [System.Drawing.Point]::new(32, 6),
            [System.Drawing.Point]::new(44, 20),
            [System.Drawing.Point]::new(36, 20),
            [System.Drawing.Point]::new(36, 44),
            [System.Drawing.Point]::new(44, 44),
            [System.Drawing.Point]::new(32, 58),
            [System.Drawing.Point]::new(20, 44),
            [System.Drawing.Point]::new(28, 44),
            [System.Drawing.Point]::new(28, 20),
            [System.Drawing.Point]::new(20, 20)
        )
    } else {
        [System.Drawing.Point[]]$pts = @(
            [System.Drawing.Point]::new(6, 32),
            [System.Drawing.Point]::new(20, 20),
            [System.Drawing.Point]::new(20, 28),
            [System.Drawing.Point]::new(44, 28),
            [System.Drawing.Point]::new(44, 20),
            [System.Drawing.Point]::new(58, 32),
            [System.Drawing.Point]::new(44, 44),
            [System.Drawing.Point]::new(44, 36),
            [System.Drawing.Point]::new(20, 36),
            [System.Drawing.Point]::new(20, 44)
        )
    }
    $g.FillPolygon($brushFill, $pts)
    $g.DrawPolygon($penStroke, $pts)
    $g.Dispose()
    Save-CurDib -bmp $bmp -hotspotX 32 -hotspotY 32 -outputPath $OutputPath
    $bmp.Dispose()
}

Write-Host "`n=== POCKETGULL ACCESSIBILITY CURSOR FOUNDRY (12-CUT SUITE) ===" -ForegroundColor Cyan
Write-Host "Destination: $cursorDir" -ForegroundColor DarkGray

$colObsidian = [System.Drawing.Color]::FromArgb(255, 9, 9, 11)
$colCyan     = [System.Drawing.Color]::FromArgb(255, 45, 212, 191)
$colAmber    = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)
$colCrimson  = [System.Drawing.Color]::FromArgb(255, 220, 38, 38)
$colDeepRed  = [System.Drawing.Color]::FromArgb(255, 127, 29, 29)
$colBrightRed= [System.Drawing.Color]::FromArgb(255, 248, 113, 113)

[System.Drawing.Point[]]$ptsArrow = @(
    [System.Drawing.Point]::new(6, 6),
    [System.Drawing.Point]::new(6, 48),
    [System.Drawing.Point]::new(18, 38),
    [System.Drawing.Point]::new(28, 58),
    [System.Drawing.Point]::new(36, 54),
    [System.Drawing.Point]::new(26, 34),
    [System.Drawing.Point]::new(40, 34)
)

# ── 1. OPHTHALMIC HIGH-CONTRAST ARROW ──
$bmpArrow = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpArrow)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillPolygon([System.Drawing.SolidBrush]::new($colObsidian), $ptsArrow)
$g.DrawPolygon([System.Drawing.Pen]::new($colCyan, 3.0), $ptsArrow)
$g.Dispose()
$pathArrowOph = Join-Path $cursorDir "pocketgull_ophthalmic_arrow.cur"
Save-CurDib -bmp $bmpArrow -hotspotX 6 -hotspotY 6 -outputPath $pathArrowOph
$bmpArrow.Dispose()

# ── 2. OPHTHALMIC BRACKETED I-BEAM ──
$bmpIBeam = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpIBeam)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$penBeamOutline = [System.Drawing.Pen]::new($colObsidian, 5.0)
$penBeamCore = [System.Drawing.Pen]::new($colCyan, 2.5)
$g.DrawLine($penBeamOutline, 20, 10, 44, 10); $g.DrawLine($penBeamCore, 20, 10, 44, 10)
$g.DrawLine($penBeamOutline, 20, 54, 44, 54); $g.DrawLine($penBeamCore, 20, 54, 44, 54)
$g.DrawLine($penBeamOutline, 32, 10, 32, 54); $g.DrawLine($penBeamCore, 32, 10, 32, 54)
$g.FillEllipse([System.Drawing.SolidBrush]::new($colAmber), 29, 29, 6, 6)
$g.Dispose()
$pathIbeamOph = Join-Path $cursorDir "pocketgull_ophthalmic_ibeam.cur"
Save-CurDib -bmp $bmpIBeam -hotspotX 32 -hotspotY 32 -outputPath $pathIbeamOph
$bmpIBeam.Dispose()

# ── 3. OPHTHALMIC LINK HAND & RESIZE ARROWS ──
$pathHandOph   = Join-Path $cursorDir "pocketgull_ophthalmic_hand.cur"
$pathSizeNsOph = Join-Path $cursorDir "pocketgull_ophthalmic_sizens.cur"
$pathSizeWeOph = Join-Path $cursorDir "pocketgull_ophthalmic_sizewe.cur"
New-HandCursor   -FillColor $colObsidian -StrokeColor $colCyan -PipColor $colAmber -OutputPath $pathHandOph
New-ResizeCursor -Vertical $true  -FillColor $colObsidian -StrokeColor $colCyan -OutputPath $pathSizeNsOph
New-ResizeCursor -Vertical $false -FillColor $colObsidian -StrokeColor $colCyan -OutputPath $pathSizeWeOph

# ── 4. PRECISION DIAGNOSTIC CALIPER (Ophthalmic) ──
$bmpCross = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpCross)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$penCrossBorder = [System.Drawing.Pen]::new($colObsidian, 4.0)
$penCrossCore   = [System.Drawing.Pen]::new($colCyan, 1.5)
$g.DrawEllipse($penCrossBorder, 20, 20, 24, 24)
$g.DrawEllipse([System.Drawing.Pen]::new($colAmber, 1.5), 20, 20, 24, 24)
$g.DrawLine($penCrossBorder, 32, 6, 32, 22);  $g.DrawLine($penCrossCore, 32, 6, 32, 22)
$g.DrawLine($penCrossBorder, 32, 42, 32, 58); $g.DrawLine($penCrossCore, 32, 42, 32, 58)
$g.DrawLine($penCrossBorder, 6, 32, 22, 32);  $g.DrawLine($penCrossCore, 6, 32, 22, 32)
$g.DrawLine($penCrossBorder, 42, 32, 58, 32); $g.DrawLine($penCrossCore, 42, 32, 58, 32)
$g.Dispose()
$pathCross = Join-Path $cursorDir "pocketgull_precision_cross.cur"
Save-CurDib -bmp $bmpCross -hotspotX 32 -hotspotY 32 -outputPath $pathCross
$bmpCross.Dispose()

# ── 5. PHILOCARDIA VAGAL BUSY / WAIT CURSOR ──
$bmpWait = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpWait)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 9, 9, 11)), 16, 16, 32, 32)
$g.DrawEllipse([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 194, 65, 12), 2.0), 16, 16, 32, 32)
$g.DrawEllipse([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 244, 63, 94), 3.0), 22, 22, 20, 20)
$g.Dispose()
$pathWait = Join-Path $cursorDir "pocketgull_philocardia_wait.cur"
Save-CurDib -bmp $bmpWait -hotspotX 32 -hotspotY 32 -outputPath $pathWait
$bmpWait.Dispose()

# ── 6. SCOTOPIC 650nm NARROW-BAND RED SUITE (Zero Blue/Cyan Leakage) ──
$bmpScotopic = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpScotopic)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillPolygon([System.Drawing.SolidBrush]::new($colCrimson), $ptsArrow)
$g.DrawPolygon([System.Drawing.Pen]::new($colDeepRed, 3.0), $ptsArrow)
$g.Dispose()
$pathArrowScot = Join-Path $cursorDir "pocketgull_scotopic_arrow.cur"
Save-CurDib -bmp $bmpScotopic -hotspotX 6 -hotspotY 6 -outputPath $pathArrowScot
$bmpScotopic.Dispose()

$bmpScotIBeam = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpScotIBeam)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$penScotOutline = [System.Drawing.Pen]::new($colDeepRed, 5.0)
$penScotCore    = [System.Drawing.Pen]::new($colCrimson, 2.5)
$g.DrawLine($penScotOutline, 20, 10, 44, 10); $g.DrawLine($penScotCore, 20, 10, 44, 10)
$g.DrawLine($penScotOutline, 20, 54, 44, 54); $g.DrawLine($penScotCore, 20, 54, 44, 54)
$g.DrawLine($penScotOutline, 32, 10, 32, 54); $g.DrawLine($penScotCore, 32, 10, 32, 54)
$g.FillEllipse([System.Drawing.SolidBrush]::new($colBrightRed), 29, 29, 6, 6)
$g.Dispose()
$pathIbeamScot = Join-Path $cursorDir "pocketgull_scotopic_ibeam.cur"
Save-CurDib -bmp $bmpScotIBeam -hotspotX 32 -hotspotY 32 -outputPath $pathIbeamScot
$bmpScotIBeam.Dispose()

$pathHandScot   = Join-Path $cursorDir "pocketgull_scotopic_hand.cur"
$pathSizeNsScot = Join-Path $cursorDir "pocketgull_scotopic_sizens.cur"
$pathSizeWeScot = Join-Path $cursorDir "pocketgull_scotopic_sizewe.cur"
$pathCrossScot  = Join-Path $cursorDir "pocketgull_scotopic_cross.cur"
New-HandCursor   -FillColor $colDeepRed -StrokeColor $colCrimson -PipColor $colBrightRed -OutputPath $pathHandScot
New-ResizeCursor -Vertical $true  -FillColor $colDeepRed -StrokeColor $colCrimson -OutputPath $pathSizeNsScot
New-ResizeCursor -Vertical $false -FillColor $colDeepRed -StrokeColor $colCrimson -OutputPath $pathSizeWeScot

$bmpCrossScot = [System.Drawing.Bitmap]::new(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmpCrossScot)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$penSCBorder = [System.Drawing.Pen]::new($colDeepRed, 4.0)
$penSCCore   = [System.Drawing.Pen]::new($colCrimson, 1.5)
$g.DrawEllipse($penSCBorder, 20, 20, 24, 24)
$g.DrawEllipse($penSCCore,   20, 20, 24, 24)
$g.DrawLine($penSCBorder, 32, 6, 32, 22);  $g.DrawLine($penSCCore, 32, 6, 32, 22)
$g.DrawLine($penSCBorder, 32, 42, 32, 58); $g.DrawLine($penSCCore, 32, 42, 32, 58)
$g.DrawLine($penSCBorder, 6, 32, 22, 32);  $g.DrawLine($penSCCore, 6, 32, 22, 32)
$g.DrawLine($penSCBorder, 42, 32, 58, 32); $g.DrawLine($penSCCore, 42, 32, 58, 32)
$g.Dispose()
Save-CurDib -bmp $bmpCrossScot -hotspotX 32 -hotspotY 32 -outputPath $pathCrossScot
$bmpCrossScot.Dispose()

Write-Host "✔ Synthesized 12 high-acuity 64px ARGB cursors (Arrow, Hand, IBeam, Cross, Wait, SizeNS, SizeWE)." -ForegroundColor Green

# ── 7. REGISTER SCHEMES IN WINDOWS REGISTRY ──
$schemesKey = "HKCU:\Control Panel\Cursors\Schemes"
if (-not (Test-Path $schemesKey)) {
    New-Item -Path $schemesKey -Force | Out-Null
}

# Format: Arrow,Help,AppStarting,Wait,Crosshair,IBeam,NWPen,No,SizeNS,SizeWE,SizeNWSE,SizeNESW,SizeAll,UpArrow,Hand,Pin,Person
$ophScheme  = "$pathArrowOph,,$pathWait,$pathWait,$pathCross,$pathIbeamOph,,,$pathSizeNsOph,$pathSizeWeOph,,,,,$pathHandOph,,"
$scotScheme = "$pathArrowScot,,$pathWait,$pathWait,$pathCrossScot,$pathIbeamScot,,,$pathSizeNsScot,$pathSizeWeScot,,,,,$pathHandScot,,"

Set-ItemProperty -Path $schemesKey -Name "PocketGull Ophthalmic High-Contrast" -Value $ophScheme
Set-ItemProperty -Path $schemesKey -Name "PocketGull Scotopic 650nm Red" -Value $scotScheme

Write-Host "✔ Registered full 17-slot schemes in HKCU:\Control Panel\Cursors\Schemes.`n" -ForegroundColor Cyan
