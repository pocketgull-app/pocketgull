# PocketGull Brand Theme Assets & Multi-Platform Design System Dossier

## 1. Design Epistemology & Invariants

PocketGull's design system bridges ancient tactile materiality with clinical biophysical precision. Built around **circadian rhythm pacing**, the interface naturally transitions between two optical states aligned with human neuro-ophthalmology:

* **Daylight Phase (07:00 – 17:59)**: **Washi Rice Paper**
  * Inspired by unbleached Japanese mulberry fiber (*kozo*), deep Sumi ink calligraphy, and natural persimmon/bamboo glazes.
  * Designed for **photopic high-acuity daylight reading** (LogMAR 0.0 / Snellen 20/20) with zero blinding white screen glare.
* **Nightfall Phase (18:00 – 06:59)**: **Obsidian Ophthalmic**
  * Inspired by volcanic glass, deep surgical contrast, and sterile telemetry HUDs.
  * Designed for **scotopic melatonin-preserving nocturnal care**, strictly enforcing **WCAG AAA ($\ge 7:1$, typical $>10:1$)** contrast against `#09090B`.

---

## 2. Color Token Master Matrix

| Semantic Role | 📜 Washi Rice Paper | 👁️ Obsidian Ophthalmic | Clinical / Biophysical Rationale |
| :--- | :--- | :--- | :--- |
| **Canvas / Background** | `#FAF8F2` (RGB: 250, 248, 242) | `#09090B` (RGB: 9, 9, 11) | Soft mulberry fiber vs. zero-emission obsidian void |
| **Surface / Card** | `#F5F2E9` (RGB: 245, 242, 233) | `#0E0E14` (RGB: 14, 14, 20) | Tactile layered paper vs. elevated matte polymer |
| **Surface Variant** | `#EFEAE1` (RGB: 239, 234, 225) | `#14141D` (RGB: 20, 20, 29) | Pressed paper borders vs. HUD telemetry wells |
| **Primary Text** | `#292524` (RGB: 41, 37, 36) | `#F8FAFC` (RGB: 248, 250, 252) | Charcoal Sumi ink vs. optotype luminous white |
| **Muted Text / Dim** | `#78716C` (RGB: 120, 113, 108) | `#94A3B8` (RGB: 148, 163, 184) | Stone wash calligraphy vs. passive telemetry gray |
| **Primary Accent** | `#0D9488` (RGB: 13, 148, 136) | `#38BDF8` (RGB: 56, 189, 248) | Celadon bamboo glaze vs. surgical cyan |
| **Secondary Accent** | `#D97706` (RGB: 217, 119, 6) | `#10B981` (RGB: 16, 185, 129) | Warm persimmon amber vs. bio-telemetry emerald |
| **Tertiary Accent** | `#0284C7` (RGB: 2, 132, 199) | `#FBBF24` (RGB: 251, 191, 36) | Medical caduceus indigo vs. alert amber gold |
| **Structural Outline** | `#E7E2D6` (RGB: 231, 226, 214) | `#1E1E28` (RGB: 30, 30, 40) | Deckled paper perimeter vs. chamfered obsidian bezel |

---

## 3. Typography & Optical Nomenclature Standard

* **Primary Monospace Engine**: `PocketGull Mono` (Word-aligned TrueType font engine).
* **Grade-2 Unicode Braille**: Integrated brand telemetry indicators (`⠠⠏⠕⠉⠅⠑⠞⠠⠛⠥⠇⠇ ⠠⠍⠕⠝⠕` for *"PocketGull Mono"*).
* **ISMP / FDA Optical Disambiguation Features**:
  * `cv08`: Slashed zero ($\emptyset$) preventing numeric dosage errors.
  * `cv05`: Curved lowercase `l` distinct from numeral `1`.
  * `ss02`: Serifed uppercase `I` distinct from lowercase `l`.
  * `zero`: Optical zero disambiguation.

---

## 4. Multi-Platform Artifact Matrix & Inventory

Every theme component is maintained as source-controlled artifacts within the monorepo:

### A. Terminal & Shell HUDs
* **Washi Oh My Posh Config**: `public/brand/terminal/pocketgull-washi.omp.json`
* **Obsidian Oh My Posh Config**: `public/brand/terminal/pocketgull-ophthalmic.omp.json`
* **Windows Terminal Color Schemes**: `public/brand/terminal/windows-terminal-schemes.json`
* **PowerShell Circadian Switcher**: `scripts/apply_pocketgull_terminal_theme.ps1`
* **Command Prompt (`cmd.exe`) Init**: `scripts/pocketgull_cmd_init.bat`

### B. IDE & Editor Environments
* **Antigravity / VS Code Extension**: `packages/pocketgull-theme/`
* **Washi Color Theme JSON**: `packages/pocketgull-theme/themes/pocketgull-washi-color-theme.json`
* **Obsidian Color Theme JSON**: `packages/pocketgull-theme/themes/pocketgull-obsidian-color-theme.json`
* **Installed Extension Path**: `~/.antigravity/extensions/pocketgull-theme`
* **Workspace Settings**: `.vscode/settings.json` (Defaults to `PocketGull Circadian (Auto)` terminal profile)

### C. Desktop OS Personalization
* **Windows Native Themes**:
  * `public/brand/windows-themes/PocketGull-Washi.theme`
  * `public/brand/windows-themes/PocketGull-Obsidian.theme`
* **System Registry Switcher**: `scripts/apply_pocketgull_windows_theme.ps1`
* **Wallpapers**:
  * Daylight: `public/images/rice_paper_texture.png`
  * Nightfall: `public/images/synaptic_quilling_backdrop.jpg`

### D. Web Browsers
* **Google Chrome / Chromium**:
  * Manifest V3 Source: `public/brand/chrome-themes/washi/` and `public/brand/chrome-themes/obsidian/`
  * Pre-packaged Archives: `public/brand/chrome-themes/pocketgull-washi-chrome-theme.zip` and `public/brand/chrome-themes/pocketgull-obsidian-chrome-theme.zip`
* **Mozilla Firefox**:
  * WebExtension Source: `public/brand/firefox-themes/washi/` and `public/brand/firefox-themes/obsidian/`
  * Pre-packaged Add-ons: `public/brand/firefox-themes/pocketgull-washi-firefox-theme.xpi` and `public/brand/firefox-themes/pocketgull-obsidian-firefox-theme.xpi`

### E. Mobile (Android & Flutter)
* **Native Android XML**: `public/brand/android-theme/values/` and `values-night/`
* **Jetpack Compose**: `public/brand/android-theme/compose/PocketGullTheme.kt`
* **Flutter Material 3**: `public/brand/android-theme/flutter/pocketgull_theme.dart`

---

## 5. Future Launch & Distribution Protocol

When preparing a public launch, theme marketplace submission, or major version milestone, execute the following protocol:

### Step 1: Automated Packaging & Integrity Verification
```powershell
# Rebuild Chrome packages
powershell.exe -ExecutionPolicy Bypass -File .\public\brand\chrome-themes\package_chrome_themes.ps1

# Rebuild Firefox .xpi packages
powershell.exe -ExecutionPolicy Bypass -File .\public\brand\firefox-themes\package_firefox_themes.ps1

# Run Sentinel Security Guard to ensure 0 unapproved egress links or credentials
node scripts/sentinel_security_guard.mjs
```

### Step 2: Marketplace Submissions
* **VS Code Marketplace / Open VSX**:
  * Package via `npx vsce package` in `packages/pocketgull-theme/`.
  * Publish via `npx vsce publish` and `npx ovsx publish`.
* **Chrome Web Store**:
  * Upload `pocketgull-washi-chrome-theme.zip` and `pocketgull-obsidian-chrome-theme.zip` under Developer Dashboard > Themes.
* **Mozilla Add-ons (AMO)**:
  * Upload `pocketgull-washi-firefox-theme.xpi` and `pocketgull-obsidian-firefox-theme.xpi` under Developer Hub > Submit New Add-on > Theme.
* **Windows Package Manager (`winget`) / Microsoft Store**:
  * Distribute terminal schemes and themes via custom winget manifest or GitHub Release asset bundle.

### Step 3: Checksum Generation (SLSA / Cryptographic Attestation)
Generate SHA-256 digest manifests for all distribution archives:
```powershell
Get-FileHash public\brand\chrome-themes\*.zip, public\brand\firefox-themes\*.xpi, public\brand\windows-themes\*.theme | Format-Table -AutoSize
```
Store digests in `records/release-attestation/` ensuring immutability under FDA 21 CFR Part 11 and NIST SP 800-90A guidelines.
