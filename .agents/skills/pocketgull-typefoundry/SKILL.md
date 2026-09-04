---
name: pocketgull-typefoundry
description: Master Typefoundry Engineering & Font Development skill for the PocketGull Typeface Superfamily. Covers pure Dart SFNT compilation, Python outline expansion, UFO/Glyphs sources, W3C OTS compliance, 2-byte word alignment, ISMP clinical disambiguation, Louise Sloan 5:1 optotypes, and Brotli WOFF2 compression for Humanist Sans-Serif, Clinical Display, and Monospace families.
---

# 🖋️ PocketGull Master Typefoundry Engineering Skill

This skill codifies the complete typefoundry architecture and tooling workflows for designing, engineering, compiling, and validating the **PocketGull Typeface Superfamily**.

---

## 🏛️ Superfamily Architecture & Classification

PocketGull is an engineered **Humanist Sans-Serif, Clinical Display, and Telemetry Monospace Superfamily** constructed on a standardized **1000 UPM grid** across five coordinated styles:

| Style | PostScript Name | Weight | Advance Metric | Primary Use Case |
| :--- | :--- | :---: | :---: | :--- |
| **PocketGull Bold** | `PocketGull-Bold` | 700 / 800 | Proportional | Display titling, Bionic reading fixation anchors, trauma alarms |
| **PocketGull Fineliner** | `PocketGull-Fineliner` | 400 | Proportional | Long-form clinical notes, EHR charts, patient discharge summaries |
| **PocketGull Chiseltip** | `PocketGull-Chiseltip` | 900 | Proportional | High-contrast placards, emergency signage, expressive titling |
| **PocketGull Mono** | `PocketGullMono-Regular` | 400 / 500 | Fixed 600 UPM | ICU telemetry, tabular vitals, gapless box drawing, terminal chevrons |
| **PocketGull VF** | `PocketGull-VF` | 400–900 | Variable | Dynamic optical sizing and continuous weight interpolation |

---

## 🔬 Core Quality Invariants

1. **TrueType 2-Byte Word-Alignment**:
   - In TrueType SFNT, every glyph record in `glyf` must be padded with `0x00` so its length is even.
   - Every offset in `loca` must satisfy `loca[i] % 2 == 0`.
   - *Why*: Odd offsets cause Chromium's OpenType Sanitizer (OTS) and DirectWrite to encounter unaligned memory faults, evicting the font after ~1 second and reverting to system Arial.

2. **Reserved Bit 7 Flag Masking**:
   - TrueType simple glyph point flag bit 7 (`0x80` / 128) is strictly reserved by ISO/IEC 14496-22 and must be zero (`flag & 0x3F`).
   - Route all curves through quadratic conversion (`Cu2Qu`) before emitting points into `TTGlyphPen`.

3. **ISMP & Louise Sloan 5:1 Disambiguation**:
   - Slashed zero (`zero` / `cv08`): Mandatory on all dosages (`500 mg`, `0.08s`).
   - Curved lowercase `l` (`cv05`) & Serifed uppercase `I` (`ss02`): Eliminates the `1 / l / I` transcription trap.
   - Slashed `Z` (`cv11`): Eliminates `Z vs 2` confusion in handwritten prescriptions.
   - Louise Sloan 5:1 optotype ratio (5 arcminutes total height, 1 arcminute stroke width and counter aperture at 55 cm viewing distance).
   - Herman Bouma spacing (`letter-spacing: 0.12em`) preventing lateral crowding in peripheral vision.

4. **Monospace Metric Lock (Fixed 600 UPM)**:
   - Every glyph in `PocketGullMono-Regular` must have an advance width of exactly 600 UPM.
   - `post.isFixedPitch = 1` and `OS/2.panose.bProportion = 9`.

5. **Antialiasing & DirectWrite Rendering (`gasp`)**:
   - Version 1 `gasp` table mapping `0xFFFF` to `GASP_DOGRAY` (0x02) and `GASP_SYMMETRIC_SMOOTHING` (0x04).

---

## 🛠️ Toolchains & Execution Commands

### 1. Pure Dart Typefoundry CLI (`scripts/dart/pocketgull_foundry.dart`)

```powershell
# Forensic W3C OTS & word-alignment audit across all binaries (<100ms)
dart run scripts/dart/pocketgull_foundry.dart audit

# Compile precision Sloan optotypes, ISO Braille, & ISMP glyphs into SFNT
dart run scripts/dart/pocketgull_foundry.dart compile

# Inspect glyph bounds, advance metrics, contours, and flags in pure Dart
dart run scripts/dart/pocketgull_foundry.dart inspect ..\pocketgull-typeface\fonts\ttf\PocketGull-Bold.ttf "0123456789ILl"

# Surgically repair letterform geometry (C flip, G spur) in pure Dart
dart run scripts/dart/pocketgull_foundry.dart repair

# Synchronize verified binaries from typeface repo to web application
dart run scripts/dart/pocketgull_foundry.dart sync

# Serve interactive specimen proof with zero CORS restrictions
dart run scripts/dart/pocketgull_foundry.dart serve 8080
```

### 2. Python Outline & UFO Toolchain (`pocketgull-typeface/sources/`)

```powershell
cd c:\Users\philg\Pocketgull\pocketgull-typeface

# Pre-flight quality verification against Google Fonts specifications
python sources/validate_fonts.py

# Compile superfamily outlines from nib and skeleton engines
python sources/compile_superfamily.py
```

### 3. WOFF2 Brotli Compression (Quality 11)

```python
import brotli

with open("PocketGull-Bold.ttf", "rb") as f:
    ttf_data = f.read()

woff2_data = brotli.compress(ttf_data, quality=11)
with open("PocketGull-Bold.woff2", "wb") as f:
    f.write(woff2_data)
```
