# 🖋️ PocketGull Typeface Design Specification & Vector Geometry Standard

## 🎯 Design Vision & Core Principles

The **PocketGull Typeface** is an open-source felt-tip marker and clinical legibility typeface derived from the original hand-drawn vector trace of the **GearArts PocketGull** brand mark.

Every glyph, symbol, numeral, and clinical icon in the font family strictly adheres to the mathematical geometry, nib stroke dynamics, and organic letterform rhythm of the 10 master vector glyph paths (`P`, `o`, `c`, `k`, `e`, `t`, `g`, `u`, `l`, `l`).

---

## 📐 Vector Geometry & Design Tokens

```
Master Vector Trace Reference:
Cap Height (P):    78.22 UPM
Ascender (k, t, l): 79.16 UPM
x-Height (o, c, e): 35.00 - 45.00 UPM
Descender (g):     32.91 UPM below baseline
Nib Angle:         -4.0° Calligraphic Chisel-Tip Tilt
```

### 1. Stroke Anatomy & Ink-Bleed Kinetics
- **Vertical Stems**: Thick felt-tip marker weight (~10.5 - 12.5 UPM width).
- **Horizontal Bars & Crossings**: Tapered calligraphic nib stroke (~5.5 - 8.0 UPM width).
- **Terminal Caps**: Organic rounded corners simulating 0.8mm wet felt marker ink-bleed on papercraft cardstock.
- **Counters & Aprons**: Maximized internal counter aperture in `e`, `o`, `c`, `g` to eliminate ink fill-in and support WCAG 2.1 AAA high-contrast readability.

### 2. Proportional Spacing & Tracking
- **Baseline Alignment**: Organic micro-variations (-0.5° baseline wave) providing authentic handwritten feel while maintaining strict horizontal grid alignment.
- **Sidebearings**: Asymmetric optical sidebearings tuned to prevent glyph collision under rapid clinical scanning.

---

## 🏥 Clinical Legibility & Tri-Paradigm Icon Mapping

The typeface incorporates specialized clinical symbols sharing the exact felt-tip vector stroke width and nib angle:

1. **Western Allopathic**: `Stethoscope`, `ECGWave`, `DoubleHelix`
2. **TCM Zang-Fu**: `YinYang`, `FiveElements`
3. **Ayurvedic Tridosha**: `TridoshaVata`, `TridoshaPitta`, `TridoshaKapha`
4. **Telemetry Glyphs**: `🫀` Heart, `🫁` Lungs, `🧠` Brain, `🦴` Spine, `🦷` Tooth, `🩸` CGM, `🛡️` Shield

---

## 🛡️ Security & Intellectual Property Compliance Standard

1. **Reserved Font Name Protection (RFN)**:
   - Registered Reserved Font Name: `PocketGull` under SIL Open Font License 1.1.
   - Eliminates naming collision risks with third-party open-source or proprietary fonts.
2. **Clean OpenType Metadata**:
   - All OpenType `name` table records (ID 0, 7, 8, 11) strictly point to `Copyright 2026 The PocketGull Project Authors`.
3. **SVG Vector Sanitation**:
   - Vector asset files contained in `article/` and `scripts/` are strictly sanitized, containing only pure mathematical `<path d="..." />` geometric structures with zero embedded scripts or external references.
4. **Interactive Specimen Input Sanitation**:
   - Web specimen interfaces enforce `textContent` binding to prevent Cross-Site Scripting (XSS) injection.

---

## 📜 License & Open Source Standard

Released under the **SIL Open Font License 1.1 (OFL)**.  
Reserved Font Name: `PocketGull`
