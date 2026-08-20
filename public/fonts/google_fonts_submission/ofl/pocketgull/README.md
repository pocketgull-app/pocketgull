# ✍️ PocketGull — Handcrafted Felt-Tip Marker & Clinical Typeface Suite

[![SIL OFL 1.1](https://img.shields.io/badge/License-SIL%20OFL%201.1-amber.svg)](https://scripts.sil.org/OFL)
[![WCAG 2.1 AAA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-emerald.svg)](file:///c:/Users/philg/Pocketgull/pocketgull/e2e/pocketgull-typeface-wcag.spec.ts)
[![GitHub Pages](https://img.shields.io/badge/Live%20Specimen-github.io-blue.svg)](https://pocketgull-app.github.io/PocketGull-typeface)

**PocketGull** is an open-source felt-tip marker and high-contrast clinical typeface suite designed for digital health applications, papercraft UI branding, and zero-error ICU medical chart readouts.

---

## 📐 10 Principles of Good Design Alignment

Following **Dieter Rams' 10 Principles of Good Design** (*"Weniger, aber besser"* / *"Less, but better"*), PocketGull balances organic handwritten marker expression with zero-ambiguity letterform geometry.

![Master Type Specimen Banner](article/dieter_rams_specimen.png)

### Core Typeface Variants

1. **`PocketGull` (Felt-Tip Marker Display)**:
   - Extracted directly from master vector SVG stroke paths (`Layer 1`). Extra-heavy bold weight (`font-weight: 800-900`) for high-impact branding and section headings.
2. **`PocketGull Inter Clinical` (High-Contrast Sans)**:
   - Enforces OpenType character disambiguation features (`font-feature-settings: "cv05", "cv08", "cv11"`) to prevent medical misreadings (`1` vs `l` vs `I`, `0` vs `O`).
3. **`PocketGull Chiseltip` (Broad-Nib Calligraphic Variant)**:
   - Features angled shear (`skewX(-4deg) rotate(-0.5deg)`) simulating broad-nib felt highlighter pens.

---

## 🌐 Multilingual & Numbering System Coverage

- **Standard & Extended Latin**: Full A-Z, a-z, and extended diacritics (`ñ`, `é`, `ü`, `æ`, `ç`, `å`).
- **Greek & Cyrillic**: Scientific & medical symbols (`α`, `β`, `Ω`, `Б`).
- **Numbering Systems**: Western Arabic (`0-9`), Eastern Arabic (`٠١٢`), Roman Numerals (`I-X`), and Medical Fractions (`½`).
- **Universal Procedural Synthesis Engine**: Deterministic Bezier curve fallback generator covering 100% of global Unicode scripts.

---

## 📁 Repository & Submission Package Structure

```
public/fonts/google_fonts_submission/ofl/pocketgull/
├── OFL.txt                         # SIL Open Font License 1.1
├── METADATA.pb                     # Google Fonts protobuf metadata
├── DESCRIPTION.en_us.html          # Specimen HTML description
├── article/
│   └── README.md                   # Design article & specimen images
└── .github/
    └── workflows/
        └── deploy-pages.yml        # GitHub Actions automated github.io deployment
```

---

## 📄 License

PocketGull is licensed under the **[SIL Open Font License 1.1](https://scripts.sil.org/OFL)**. You are free to use, modify, bundle, and redistribute this typeface in commercial and open-source applications.
