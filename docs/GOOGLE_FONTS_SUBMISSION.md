# 🔤 PocketGull — Google Fonts Submission Package & Guide

This directory contains the official submission assets for onboarding **PocketGull** (and **PocketGull Inter Clinical**) to the [Google Fonts Library](https://github.com/google/fonts).

---

## 📋 1. Google Fonts Repository Requirements Checklist

Google Fonts accepts open-source typefaces submitted via Pull Request to `github.com/google/fonts`. The following files must be included in the submission directory (`ofl/pocketgull/`):

- [x] **`OFL.txt`**: Standard SIL Open Font License 1.1 with Reserved Font Name `PocketGull`.
- [x] **`METADATA.pb`**: Protobuf metadata file detailing font family name, designer, category (`HANDWRITING`), license, and language support.
- [x] **`DESCRIPTION.en_us.html`**: HTML description showcasing the font history, clinical legibility design, and connection to the Pocket Gull medical engine.
- [x] **`article/`**: Specimen banner images and design documentation.

---

## 🛠️ 2. Step-by-Step Submission Process

### Step 1: Font Binary Build & Validation
Generate clean `.ttf` / `.woff2` font files from Glyphs / FontForge / GlyphsApp using Google's `gftools` and `fontbakery` QA suite:

```bash
# Install Google Fonts QA tooling
pip install fontbakery gftools

# Run Fontbakery QA checks on PocketGull binaries
fontbakery check-googlefonts ofl/pocketgull/PocketGull-Regular.ttf
```

### Step 2: Fork `google/fonts` Repository
```bash
git clone https://github.com/YOUR-USERNAME/fonts.git
cd fonts
git checkout -b add-pocketgull
```

### Step 3: Add `ofl/pocketgull/` Directory
Copy the submission files from `public/fonts/google_fonts_submission/ofl/pocketgull/` into the upstream `ofl/pocketgull/` folder.

### Step 4: Submit Pull Request
Push your branch to GitHub and open a Pull Request targeting [`google/fonts`](https://github.com/google/fonts).

---

## 📄 3. Included Protocol Metadata Files

### `METADATA.pb`
```protobuf
name: "PocketGull"
designer: "Phil Gear & Pocket Gull Team"
license: "OFL"
category: "HANDWRITING"
date_added: "2026-08-04"
fonts {
  name: "PocketGull"
  style: "normal"
  weight: 800
  filename: "PocketGull-Bold.ttf"
  post_script_name: "PocketGull-Bold"
  full_name: "PocketGull Bold"
  copyright: "Copyright 2026 The PocketGull Project Authors (https://github.com/philgear/pocketgull)"
}
subsets: "latin"
subsets: "latin-ext"
subsets: "menu"
```
