---
name: google-fonts-launch
description: End-to-end Google Fonts release, upstream onboarding, and foundry launch skill for the PocketGull Typeface Superfamily. Covers METADATA.pb schema (category SANS_SERIF), upstream.yaml tracking, Fontbakery zero-defect QA, designer catalog dossiers, PR blueprint generation, and release governance.
---

# 🚀 Google Fonts Superfamily Launch & Onboarding Skill

This skill governs the end-to-end process of packaging, validating, and submitting the **PocketGull Typeface Superfamily** (Humanist Sans-Serif, Clinical Display, and Monospace) to the upstream **[`google/fonts`](https://github.com/google/fonts)** repository.

---

## 📋 The 10-Point Google Fonts Release Checklist

Before opening a pull request to `google/fonts`:

| # | Checkpoint | Verification Command / Requirement | Expected Output |
| :---: | :--- | :--- | :--- |
| **1** | **W3C OTS Sanitization** | `dart run scripts/dart/pocketgull_foundry.dart audit` | 100% PASS (0 unaligned loca offsets, 0 bad flags) |
| **2** | **Pre-Flight GF Validator** | `python sources/validate_fonts.py` | 32/32 checks pass (UPM 1000, fsType 0, USE_TYPO_METRICS) |
| **3** | **Fontbakery QA** | `fontbakery check-googlefonts fonts/ttf/*.ttf` | 0 FAIL, 0 FATAL (warnings reviewed and justified) |
| **4** | **`METADATA.pb` Validation** | Verify schema against `google/fonts` Protobuf definition | `category: "SANS_SERIF"`, designer matches `info.pb` |
| **5** | **`upstream.yaml` Tracking** | Check repository URL, branch (`main`), and archive path | `gftools packager` can fetch and build upstream |
| **6** | **Minimalist Versioning** | Inspect `nameID 5` and `head.fontRevision` | `Version 2.000; The PocketGull Project Authors; OFL 1.1`, float 2.0 |
| **7** | **Designer Profile Dossier** | `documentation/designer/philgear/` | Complete `info.pb`, `bio.html` (with limerick), and `philgear.png` |
| **8** | **Editorial Article** | `article/ARTICLE.en_us.html` | Rich specimen showcase, Dieter Rams specimen, cardstock origins |
| **9** | **SIL OFL 1.1 Licensing** | Check `nameID 0` against `OFL.txt` line 1 | Exact character-for-character match; zero RFN |
| **10** | **Multi-Target Sync** | `dart run scripts/dart/pocketgull_foundry.dart sync` | Fonts mirrored to `public/fonts/` with fresh WOFF2s |

---

## 🏛️ Essential Upstream Metadata Structures

### 1. `METADATA.pb` Schema
```protobuf
name: "PocketGull"
designer: "Phil Gear"
license: "OFL"
category: "SANS_SERIF"
date_added: "2026-08-04"
fonts {
  name: "PocketGull"
  style: "normal"
  weight: 400
  filename: "PocketGull-Fineliner.ttf"
  post_script_name: "PocketGull-Fineliner"
  full_name: "PocketGull Fineliner"
  copyright: "Copyright 2026 The PocketGull Project Authors (https://github.com/pocketgull-app/pocketgull-typeface)"
}
fonts {
  name: "PocketGull"
  style: "normal"
  weight: 700
  filename: "PocketGull-Bold.ttf"
  post_script_name: "PocketGull-Bold"
  full_name: "PocketGull Bold"
  copyright: "Copyright 2026 The PocketGull Project Authors (https://github.com/pocketgull-app/pocketgull-typeface)"
}
fonts {
  name: "PocketGull"
  style: "normal"
  weight: 900
  filename: "PocketGull-Chiseltip.ttf"
  post_script_name: "PocketGull-Chiseltip"
  full_name: "PocketGull Chiseltip"
  copyright: "Copyright 2026 The PocketGull Project Authors (https://github.com/pocketgull-app/pocketgull-typeface)"
}
fonts {
  name: "PocketGull Mono"
  style: "normal"
  weight: 400
  filename: "PocketGullMono-Regular.ttf"
  post_script_name: "PocketGullMono-Regular"
  full_name: "PocketGull Mono Regular"
  copyright: "Copyright 2026 The PocketGull Project Authors (https://github.com/pocketgull-app/pocketgull-typeface)"
}
subsets: "latin"
subsets: "latin-ext"
subsets: "greek"
subsets: "cyrillic"
subsets: "menu"
primary_script: "Latn"
stroke: "SANS_SERIF"
classifications: "SANS_SERIF"
classifications: "DISPLAY"
minisite_url: "https://pocketgull.app"
source {
  repository_url: "https://github.com/pocketgull-app/pocketgull-typeface"
  branch: "main"
}
```

### 2. `upstream.yaml` (for `gftools packager`)
```yaml
branch: main
files:
  PocketGull-Bold.ttf: PocketGull-Bold.ttf
  PocketGull-Fineliner.ttf: PocketGull-Fineliner.ttf
  PocketGull-Chiseltip.ttf: PocketGull-Chiseltip.ttf
  PocketGullMono-Regular.ttf: PocketGullMono-Regular.ttf
  OFL.txt: OFL.txt
  DESCRIPTION.en_us.html: DESCRIPTION.en_us.html
  METADATA.pb: METADATA.pb
```

### 3. Designer Profile Dossier (`documentation/designer/philgear/`)
- **`info.pb`**:
  ```protobuf
  designer: "Phil Gear"
  link: "https://philgear.biz"
  avatar {
    file_name: "philgear.png"
  }
  ```
- **`bio.html`**:
  Contains the authentic story, Gentle Healer limerick, and links to `philgear.biz`, `geararts.dev`, and `pocketgull.app`.
- **`philgear.png`**:
  300x300 px square PNG portrait.

---

## 🛠️ Pull Request Generation Blueprint

When opening the pull request to `google/fonts`:

```markdown
Title: [New Font] PocketGull Superfamily (Bold, Fineliner, Chiseltip, Mono)

### Summary
This PR onboards the **PocketGull** typeface superfamily, an open-source clinical sans-serif, display, and telemetry monospace typeface designed by Phil Gear. Originating from hand-inked felt marker lettering on physical cardstock for GearArts, PocketGull synthesizes organic stroke dynamism with Louise Sloan 5:1 optotypic legibility and Institute for Safe Medication Practices (ISMP) disambiguation standards for life-critical healthcare environments.

- **Family Name**: `PocketGull` & `PocketGull Mono`
- **Category**: `SANS_SERIF` (with `DISPLAY` and `MONOSPACE` members)
- **Styles**: 
  - `PocketGull-Bold.ttf` (Weight: 700 / 800 Display Titling)
  - `PocketGull-Fineliner.ttf` (Weight: 400 Light Clinical Text)
  - `PocketGull-Chiseltip.ttf` (Weight: 900 Black Calligraphic Display)
  - `PocketGullMono-Regular.ttf` (Weight: 400 Monospace Telemetry, 600 UPM pitch)
- **License**: SIL Open Font License, Version 1.1 (zero Reserved Font Names)
- **Upstream Repository**: https://github.com/pocketgull-app/pocketgull-typeface
- **Interactive Specimen**: https://typeface.pocketgull.app

### Technical Specifications & Quality Assurance
- **Grid Resolution**: Standard 1000 UPM em-square across all styles.
- **Embedding (`fsType`)**: `0x0000` (Installable embedding).
- **Vertical Metrics**: `USE_TYPO_METRICS` flag enabled (`fsSelection` bit 7) across all styles.
- **Monospace Metrics**: `post.isFixedPitch = 1` and `OS/2.panose.bProportion = 9`.
- **Forensic OTS Audit**: 100% passed W3C OTS sanitization with 2-byte word alignment on all loca/glyf tables.
- **Glyph Coverage**: 3,350+ Unicode glyphs exceeding GF Latin Core, Latin Extended-A, and the complete 256-glyph Unicode Braille block (`U+2800`–`U+28FF`).
- **Copyright & License**: `name` ID 0 matches `OFL.txt` line 1 exactly.

### Associated Designer Profile
Contained in `catalog/designers/philgear/`:
- `info.pb` (designer: "Phil Gear", link: "https://philgear.biz", avatar: "philgear.png")
- `bio.html` (3rd-person biography with Gentle Healer limerick)
- `philgear.png` (300x300 square PNG)
```
