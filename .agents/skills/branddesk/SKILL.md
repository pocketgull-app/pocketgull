---
name: branddesk
description: >-
  Manage, compile, audit, and synchronize the PocketGull Typefoundry superfamily,
  Adobe Express BrandDesk assets, 5 origami mascots, and WCAG AAA clinical design tokens.
  Use when the user asks to build, update, inspect, or deploy fonts, brand kits, mascots, or Adobe Express addons.
---

# PocketGull BrandDesk & Typefoundry Skill

This skill guides Antigravity agents in managing, compiling, and deploying the **PocketGull Brand & Typefoundry Ecosystem** across the standalone typefoundry, the Angular clinical web application, and the Adobe Express Add-on suite.

---

## 🏛️ Repository & Asset Architecture

1. **Standalone Typefoundry Repository**:
   - Path: `C:\Users\philg\Pocketgull\pocketgull-typeface\`
   - Source Builders: `scripts/compile_precision_superfamily.py`, `scripts/build_numerology_font.py`, `scripts/build_pocketgull_world.py`
   - Master 1-Click Pipeline: `scripts/build_all_fonts.ps1`
   - Interactive Specimen Sandbox: `index.html`

2. **Web Application & Brand Distribution**:
   - Brand Kit Fonts: `pocketgull/public/brand/fonts/` (`PocketGull-VF.ttf`, `PocketGull-Numerics.ttf`, etc.)
   - Web Fonts (WOFF2): `pocketgull/public/fonts/`
   - Adobe Express Add-on: `pocketgull/companion-apps/adobe-express-addon/`

---

## 🔨 Master Font Compilation Workflow

To recompile all 7 font variants with pure mathematical Bezier curves, OpenType class kerning, and the PocketGull World Pan-Script codex:

```powershell
powershell.exe -ExecutionPolicy Bypass -File "C:\Users\philg\Pocketgull\pocketgull-typeface\scripts\build_all_fonts.ps1"
```

### What this command executes:
1. **Precision Vector Superfamily ($1024\text{ UPM}$)**: Compiles `PocketGull-Bold`, `Fineliner`, `Chiseltip`, `VF`, and `Numerics`.
2. **OpenType Feature Tables**: Injects `GPOS` class-kerning (48 collision pairs) and `GSUB` clinical disambiguation (`zero`, `cv05`, `cv08`, `tnum`).
3. **PocketGull World Extension**: Injects Greek ($\alpha\dots\Omega$), Cyrillic ($А\dotsЯ$), and Biophysical calculus ($\partial, \nabla, \int, \infty, \text{♥}$).
4. **Compression & Quality Audit**: Compiles `.woff2` files and executes the Quaker 5-testimony inspection.
5. **Asset Synchronization**: Copies all 14 font binaries to `public/brand/fonts/` and `public/fonts/`.

---

## 🕊️ The 5 Origami Brand Mascots

When creating brand collateral or Adobe Express templates, match each mascot to its clinical domain:

| Mascot Archetype | Color Token | Signature Role | Clinical Domain |
| :--- | :--- | :--- | :--- |
| **1. The Navigator** | `#D4A373` (Kraft Tan) | Lighthouses & Binoculars | Triage scoring & emergency red-flag detection |
| **2. The Chronicler** | `#E9C46A` (Amber) | Sundials & Clocks | Time-series vitals & circadian sleep debt |
| **3. The Statistician**| `#7BDFF2` (Sky Azure)| Scales of Justice | Popperian null-hypothesis testing ($p < 0.05$) & RoB 2 |
| **4. The Scholar** | `#C77DFF` (Lavender) | Books & Quills | Clinical literature synthesis & Cochrane reviews |
| **5. The Explorer** | `#0284C7` (Ice Blue) | Telescopes & 3D Tools | Spatial 3D anatomy & multimodal DICOM vision |

---

## 🎨 Master Color Tokens & Delensing

* **Terracotta Ember**: `#EA580C` — Primary action buttons, brand logo, hero accents
* **Golden Amber**: `#E9C46A` — Time/vitals, The Chronicler mascot, circadian dials
* **Sky Azure**: `#7BDFF2` — Statistics, The Statistician mascot, confidence bands
* **Charcoal Slate Ink**: `#0F172A` — Dark mode background, high-contrast headline ink
* **Unbleached Washi**: `#FAF8F5` — Light mode background, papercraft card surfaces

### Dark-Mode Delensing Invariant
```css
html.dark {
  --pg-delensing-delta: -40;
}
```

---

## ♿ WCAG 2.2 AAA & Clinical Legibility Checklist

Before publishing any typography or UI changes, verify:
* **Contrast Ratio**: Normal text $\ge 7.0:1$ (PocketGull provides $17.4:1$).
* **Touch Target Hitbox**: All buttons declare minimum $\ge 48\text{px} \times 48\text{px}$.
* **Clinical Disambiguation**: Slashed zero (`0`), hooked `l` (`cv05`), and serifed `I` (`cv08`) are enabled for medical readouts.
* **Cumulative Layout Shift (CLS)**: $0.00$ layout shift on font hydration.
