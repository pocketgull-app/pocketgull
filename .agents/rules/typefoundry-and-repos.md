# PocketGull Typefoundry & Cross-Repository Governance Rules

## 1. PocketGull 4-Master Superfamily Architecture (`../pocketgull-typeface`)
- **The 4-Master Taxonomy**:
  - `PocketGull-Chiseltip` (900 Black Display): Parametric physical chisel nib simulation ($w(\varphi) = \sqrt{(a \cos(\varphi - \theta))^2 + (b \sin(\varphi - \theta))^2}$ at $45^\circ$ angle, 1000 UPM) for brand marks (`PocketGull` wordmark & legal footer imprint ONLY).
  - `PocketGull-Bold` (700 Bold Clinical): High-contrast optical anchor for emergency alerts, telemetry headers, and Snellen 20/20 optotype verification.
  - `PocketGull-Fineliner` (400 Regular Text): Proportional clinical reading face with deep inktraps, wide apertures, and generous counters for sustained diagnostic intake.
  - `PocketGullMono-Regular` (400 Monospace Telemetry): Strict 600 UPM fixed pitch with slashed zero (`cv08`), tabular alignment, and zero jitter for biometrics and dosage readouts.
- **1000 UPM & Zero-Composite Invariant**: All procedural glyph contours MUST use integer coordinates on a strict 1000 UPM grid (`ascender: 800`, `descender: -200`), 0 duplicate nodes, verified winding order, and 0 composite glyph references.
- **Directory-Pinned `uv` Execution**: Always run font compilation and validation inside the typeface environment:
  ```powershell
  uv --directory ../pocketgull-typeface run python sources/validate_fonts.py
  ```
- **Universal Multi-Script ISMP Disambiguation**:
  - *Latin & Numerals*: Slashed zero (`cv08`), curved lowercase `l` (`cv05`), serifed capital `I` (`ss02`), Louise Sloan 5:1 aspect ratio (LogMAR 0.0), and Herman Bouma $0.12\text{em}$ spacing.
  - *UCAS (Inuktitut / Cree)*: $>30^\circ$ rotational separation, $1.2\times$ diacritic superdot clearance, upper-40% coda finals.
  - *Chinuk Pipa / Duployan*: $>15^\circ$ Euclidean vector angle separation, $\ge 2.2\times$ vowel loop counter-dilation, Kamloops Crossed Saltire (`U+1BC9F`).
  - *RTL (Arabic / Hebrew)*: Mandatory `<bdi dir="ltr">` numeric dosage isolation (`10 mg` never reverses to `01 mg`).
  - *Devanagari & Cyrillic*: Unified Shirorekha hanging baseline ($y = 720$) and anti-homoglyph differentiation.

---

## 2. Typographic SemVer 2.0.0 & 5-Phase Zero-Tofu Release Gate
- **SemVer 2.0.0**:
  - **Major (`X.0.0`)**: Baseline, UPM (1000), ascender/descender, or advance-width shifts causing document reflow.
  - **Minor (`x.Y.0`)**: Additive script/language coverage (e.g., Inuktitut, Chinuk Pipa) or OpenType features (`ss03`, `dlig`).
  - **Patch (`x.y.Z`)**: Optical smoothing, inktrap depth calibration, kerning adjustments, validator updates.
- **5-Phase Release Gate**:
  1. *Phonological Matrix*: Codify orthography and Unicode block in `fonts/<lang>_matrix.json`.
  2. *Procedural Vector Synthesis*: Generate 1000 UPM integer-coordinate TTF contours.
  3. *34/34 Pre-Flight Verification*: Pass `sources/validate_fonts.py` and `ots-sanitize`.
  4. *300 DPI Landmark Architectural Triad*: Generate Plate 1 (*Type Engineering*), Plate 2 (*Telemetry HUD*), and Plate 3 (*Pedagogical Washi*) using raw Dart string templates (`r'''...'''`) and geometric SVG shadows (zero `<feDropShadow>`).
  5. *CERN Zenodo Archival & CDN Sync*: Mint/update DOI (`10.5281/zenodo.18882512`), deploy `.woff2` cuts to `https://font.pocketgull.app`, and exclude heavy `.ttf` binaries from web containers.
- **Offline Kaggle & Matplotlib Font Embedding**: When rendering plots in Kaggle notebooks, register `PocketGullMono-Regular` via `matplotlib.font_manager.fontManager.addfont()` or inline WOFF2 data URIs so dark-mode HUD charts preserve ISMP slashed zeroes offline.

---

## 3. Sibling Repository & Companion Ecosystem Parity
- **4-Way Schema Parity (`TS` ↔ `Dart` ↔ `Python` ↔ `BigQuery`)**: Modifications to FHIR R4 clinical observation bundles or IEEE P2933™ TIPPSS telemetry structs MUST synchronize across TypeScript (`pocketgull`), Dart (`pocketgull_flutter`), Pydantic (`pocketgull_api`), and BigQuery table schemas (`npm run tippss:audit`).
- **Library of Congress ISSN Serials (`../pocketgull-com`)**: All articles in `PocketGull Journal of Salutogenic Medicine & Systems Biology` must pass `npm run issn:verify` (6 ISSN invariants: masthead, sequential `PG-YYYY-####` & DOI enumeration, 4-part IMRaD + Popperian $H_0/H_1/BF_{10}$ cards, `PocketGull LLC, Portland, OR` impressum, ORCID `0009-0008-1372-5381`, and strict separation of scholarly text from Scriptorium design widgets).
- **Ruby / Rails Engines (`pocketgull-fhir-rails`)**: Require Ruby 3.3+ with YJIT on `ruby:3.3-alpine`, namespace strictly under `module Pocketgull`, enforce zero `rubocop` offenses, and isolate live OAuth calls behind `ENV['POCKETGULL_LIVE_DEMO']`.

---

## 4. Air-Gapped Typography Invariant (`pocketgull-font` ↔ Kaggle)
- **Zero-External-CDN Invariant on Kaggle**: Kaggle competition submissions strictly enforce `enable_internet: false`. All external web-font requests (`@import url(...)` or `https://font.pocketgull.app/...`) fail silently and fall back to browser defaults, destroying optotypic calibration and layout bounds.
- **Mandatory Offline Font Ingestion**:
  Interactive workbenches (SIGGRAPH, PACS) and Matplotlib charts inside Kaggle notebooks MUST use either:
  1. *Base64-encoded WOFF2 data URIs* (`@font-face { font-family: 'PocketGullMono'; src: url('data:font/woff2;base64,...'); }`) embedded directly in HTML headers.
  2. *Direct filesystem registration*:
     ```python
     import matplotlib.font_manager as fm
     fm.fontManager.addfont('/kaggle/input/pocketgull-font/PocketGullMono-Regular.ttf')
     ```
  3. *Procedural SVG vector paths* for standalone 3D Canvas glyphs (1000 UPM grid).
- **ISMP / FDA Compliance**: Every diagnostic plot, $m/z$ ratio table, and AUC readout must enforce slashed zero (`cv08`), curved `l` (`cv05`), and tabular numbers (`tnum`) to eliminate numeric dosage misinterpretation.
- **Monorepo Clinical Logic Parity (TypeScript ↔ Python)**:
  Any clinical transformation or scoring method ported to Kaggle Python MUST maintain exact interface parity with TypeScript source in `pocketgull/src/`, verified with Pydantic v2 `BaseModel` classes or frozen dataclasses, compiled into a self-contained, air-gapped script (e.g. `pocketgull_core.py`) with zero external runtime dependencies.

