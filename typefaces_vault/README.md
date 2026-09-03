# 🖋️ PocketGull Master Typeface Vault & Archival Repository

## Overview
This repository vault contains the master archive of every typographic creation, vector glyph definition, OpenType table specification, webfont binary, and font-engineering tool developed for the **PocketGull** clinical intelligence platform.

All font files in this vault have undergone OpenType Sanitizer (OTS) compliance verification with zero `glyf` bit-7 reserved flag violations and full WCAG 2.1 AAA high-contrast legibility validation.

---

## 📂 Vault Hierarchy

```
typefaces_vault/
├── README.md                      # This archival catalog and specification guide
├── binaries/
│   ├── ttf/                       # Master TrueType (.ttf) font binaries
│   │   ├── PocketGull-Bold.ttf
│   │   ├── PocketGull-Chiseltip.ttf
│   │   ├── PocketGull-Fineliner.ttf
│   │   ├── PocketGull-Antigravity.ttf
│   │   ├── PocketGull-Numerics.ttf
│   │   ├── PocketGull-VF.ttf
│   │   ├── PocketGullMono-Regular.ttf
│   │   └── PocketGull-Dyslexia-VF.ttf
│   └── woff2/                     # Highly compressed webfont binaries (.woff2)
│       └── (Clean WOFF2 builds for high-performance HTTP delivery)
├── geometry/
│   ├── master_vector_glyphs.json  # Raw SVG path 'd' attributes for all 10 master brand glyphs
│   └── master_vector_glyphs.svg   # Pure SVG visual vector sheet of glyph geometry
├── ofl_google_fonts/              # Official Google Fonts OFL submission package
│   ├── METADATA.pb                # Protocol buffer font family metadata
│   ├── OFL.txt                    # SIL Open Font License 1.1
│   ├── DESCRIPTION.en_us.html     # Google Fonts directory description
│   └── llms.txt                   # LLM documentation index
├── specimens/
│   ├── DESIGN_SPECIFICATION.md    # Nib stroke kinetics, optical kerning & baseline wave
│   ├── pocketgull_inter_clinical_spec.json # Clinical design token metadata
│   ├── pocketgull_typeface_specimen.png   # Rendered high-resolution specimen banner
│   └── specimen_viewer.html       # Standalone interactive HTML specimen tester
└── tooling/
    ├── repair_font_ots_flags.py   # Python OTS bit-7 flag sanitizer & Brotli WOFF2 builder
    ├── import_svg_glyphs_to_font.py # Injects raw SVG paths into TrueType glyf tables
    ├── fix_pocketgull_font.py     # Synchronizes typo metrics & vertical headers
    ├── refine_google_fonts.py     # Canonical glyph name sanitizer for FontBakery
    └── verify_caslon_typography.mjs # Automated typographic audit script
```

---

## 🎨 Typeface Roster & Intended Roles

| Font Name | Role & Visual Weight | Optical Characteristics |
| :--- | :--- | :--- |
| **`PocketGull-Bold`** | Official Brand Lettering & Imprint | 12.5 UPM felt-tip marker stroke with 0.8mm ink-bleed simulation |
| **`PocketGull-Chiseltip`** | Display Titles & Badges | -4.0° calligraphic chisel-tip tilt with dynamic thick-to-thin transitions |
| **`PocketGull-Fineliner`** | Technical Wireframes & Sub-notes | 6.0 UPM uniform technical fineliner stroke with open counters |
| **`PocketGull-Antigravity`** | Expressive Clinical Display | Modernized organic marker geometry tuned for dark obsidian surfaces |
| **`PocketGull-Numerics`** | Tabular Vitals & Timers | Strictly proportional tabular figures (`tabular-nums`) with slashed zero |
| **`PocketGull-VF`** | Variable Font Container | Multi-axis continuous variation along Weight and Optical Size axes |
| **`PocketGullMono-Regular`**| Code, FHIR & Telemetry | Fixed-pitch monospace with ISMP medication safety disambiguation |
| **`PocketGull-Dyslexia-VF`**| Neurodivergent & Low-Vision HUD| Weighted lower-half baseline terminals preventing letter inversion |

---

## 🛡️ Governance & Brand Lettering Boundary

Per the official **Pocket-Gull Marker Font & Brand Lettering Governance Standard**:
1. **Brand Lettering Exclusivity**: Custom handwritten display marker fonts (`font-pocketgull-handwritten`, `.marker-bold-emphasis`) are strictly reserved for official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer imprints**.
2. **Universal Clinical Legibility**: All clinical EHR interfaces, drug dosages, telemetry tables, and reading frames MUST use the high-legibility clinical typography stacks (`font-pocketgull-sans-clinical`, `font-pocketgull-inter`, `font-pocketgull-mono`) to prevent dosage misinterpretation.

---

## 📜 Licensing
All font creations in this vault are released under the **SIL Open Font License (OFL) Version 1.1**.
Reserved Font Name: `PocketGull`.
Copyright (c) 2026 The PocketGull Project Authors.
