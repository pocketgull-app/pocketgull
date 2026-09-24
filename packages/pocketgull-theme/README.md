# PocketGull Themes (Multi-Environment Clinical, Tactile & Sensory Studio Suite)

> **Insight beneath the surface.** A bespoke multi-environment design system providing high-contrast clinical, tactile paper, and sensory studio themes engineered for maximum optical legibility (WCAG AAA compliant), reduced visual fatigue, and cognitive ergonomic focus.

![PocketGull Theme Icon](https://raw.githubusercontent.com/pocketgull-app/pocketgull/main/packages/pocketgull-theme/icon.png)

---

## 📂 Architecture: Foldered by Where the Theme is Used

To support cohesive, circadian-aligned developer ergonomics across your entire operating environment, the theme suite is organized by target platform:

```
packages/pocketgull-theme/
├── ide/                        # IDE Code Editor Themes & Icons
│   └── vscode/
│       ├── themes/             # 26 Color Theme JSON Definitions
│       └── icons/              # PocketGull Clinical & Tactile Icon Theme
├── browser/                    # Web Browser Themes
│   ├── chrome/                 # Google Chrome / Brave / Edge Manifest V3 Themes
│   │   ├── pocketgull-obsidian/
│   │   ├── pocketgull-washi/
│   │   ├── pocketgull-scotopic-650nm/
│   │   ├── pocketgull-curie-luminescence/
│   │   ├── pocketgull-rams-functionalist/
│   │   └── pocketgull-hypertext-1991/
│   └── firefox/                # Mozilla Firefox WebExtension Themes
│       ├── pocketgull-obsidian/
│       ├── pocketgull-washi/
│       ├── pocketgull-scotopic-650nm/
│       ├── pocketgull-curie-luminescence/
│       ├── pocketgull-rams-functionalist/
│       └── pocketgull-hypertext-1991/
├── system/                     # Operating System & Terminal Themes
│   ├── windows-terminal/       # Windows Terminal JSON Fragments & Schemes
│   │   ├── fragments/PocketGull.json  # Auto-discovered WT extension fragment
│   │   └── pocketgull-schemes.json    # Standalone scheme definitions
│   ├── terminal/               # Cross-Platform Terminal Emulators
│   │   ├── ghostty/            # Ghostty theme configs
│   │   ├── alacritty/          # Alacritty TOML theme files
│   │   └── kitty/              # Kitty conf theme files
│   └── shell-prompts/          # Oh-My-Posh & Shell Prompts
│       ├── pocketgull-ophthalmic.omp.json
│       └── pocketgull-washi.omp.json
├── fonts/                      # Bundled Official Typefaces
│   ├── PocketGullMono-Regular.ttf
│   ├── PocketGullMono-Regular.woff2
│   └── PocketGull-VF.ttf
└── scripts/
    └── sideload.mjs            # Master multi-environment installer
```

---

## 🎨 IDE Theme Directory (26 Distinct Colorways)

### Clinical Obsidian & Dark Suites (11 Themes)

| Theme | UI Mode | Substrate & Clinical Aesthetic Description |
| :--- | :--- | :--- |
| **PocketGull Obsidian** | `vs-dark` | **Flagship Dark Theme.** Deep obsidian (`#09090b`) canvas with gear teal (`#14b8a6`) and amber gold highlights. Calibrated for 7:1+ WCAG AAA contrast ratio. |
| **PocketGull Radiograph Luminescence** | `vs-dark` | Inspired by negative medical fluoroscopy and high-resolution radiograph viewers. Deep radiographic cyan glow on near-black substrate. |
| **PocketGull Curie Luminescence** | `vs-dark` | Phosphorescent green and radium-alpha emission hues against a pitch-black laboratory slate, honoring pioneer Marie Curie's notebooks. |
| **PocketGull Scotopic 650nm Red** | `vs-dark` | Purified scotopic 650nm red-amber spectrum designed for dark-adapted vision and late shifts. Zero blue-light emission preserves melatonin rhythm. |
| **PocketGull Midnight Broadside** | `vs-dark` | Rich maritime indigo-blue background with crisp nautical ivory syntax, reflecting classic broadside navigation charts. |
| **PocketGull Nero Marquina** | `vs-dark` | Spanish black marble aesthetic featuring sharp white calcite veining and silver metallic accents for ultra-clean code hierarchy. |
| **PocketGull Ancient Papyrus** | `vs-dark` | Aged mineral pigments, lapis lazuli, and terracotta earth tones on deep antique carbon ground. |
| **PocketGull Aquatic Pool** | `vs-dark` | Subsurface oceanic gradients with deep bioluminescent cyan, seafoam green, and coral highlights. |
| **PocketGull Sacred Mandala** | `vs-dark` | Meditative jewel tones—sapphire, amethyst, and warm saffron—harmonized for cognitive grounding during deep problem-solving. |
| **PocketGull Acuity Emergency** | `vs-dark` | High-acuity emergency telemetry palette with intense signal amber, vivid crimson triage alerts, and carbon slate backing. |
| **PocketGull GearArts** | `vs-dark` | Craftsman engineering workshop aesthetic: warm gunmetal, brushed copper, brass, and industrial tooling accents. |

---

### Tactile Paper & Studio Light Suites (9 Themes)

| Theme | UI Mode | Aesthetic Description & Paper Substrate |
| :--- | :--- | :--- |
| **PocketGull Washi Rice Paper** | `vs` | **Flagship Light Theme.** Japanese handmade Kozo rice paper texture with sumi ink syntax and subtle cinnabar stamp accents. |
| **PocketGull Spot-Color Press** | `vs` | Spot-color print aesthetic utilizing vibrant soy-based ink layering (Federal Blue, Fluorescent Pink, Sunflower Yellow) on heavy stock. |
| **PocketGull Rams Functionalist** | `vs` | Pure functionalist industrial design inspired by Dieter Rams' "Weniger, aber besser" philosophy. Matte putty, warm black, and iconic yellow/green accents. |
| **PocketGull Hypertext 1991** | `vs` | Minimalist monochrome precision evoking the genesis of the World Wide Web hypertext workspace. |
| **PocketGull Cardstock Kraft** | `vs` | Raw, unbleached brown kraft paper substrate with rich walnut bistre ink and warm earth-tone syntax. |
| **PocketGull Hemp Fiber** | `vs` | Natural botanical fiber tones with calming sage greens, herbal tans, and muted forestry accents. |
| **PocketGull Construction High-Vis** | `vs` | High-visibility daylight palette engineered for maximum optical discernment in brightly lit environments or outdoor kiosks. |
| **PocketGull Triage Electrophoretic** | `vs` | Electrophoretic display emulation engineered for zero-glare ambient reading, mimicking clinical e-paper tablets and clipboards. |
| **PocketGull Carrara Marble** | `vs` | Tuscan white marble base with delicate cool slate-grey veining and subtle platinum syntax accents. |

---

### Scientific, Laboratory & Color-Universal Suites (6 Themes)

| Theme | UI Mode | Optical & Laboratory Calibration |
| :--- | :--- | :--- |
| **PocketGull Confocal Fluorophore** | `vs-dark` | Laser scanning confocal microscopy palette: DAPI blue, GFP green, and Alexa Fluor 594 red channels against deep focal plane black. |
| **PocketGull Darkfield Electron** | `vs-dark` | High-contrast transmission electron microscopy (TEM) substrate with focused platinum/gold heavy-atom backscatter illumination. |
| **PocketGull Spectrophotometer 280nm** | `vs-dark` | Absorbance spectrum palette mapping UV/visible aromatic protein wavelengths into clean visual gradients. |
| **PocketGull Okabe-Ito Divergent** | `vs-dark` | Colorblind-universal palette conforming to the empirical Okabe & Ito (2008) standard for deuteranopia, protanopia, and tritanopia barrier-free discernment. |
| **PocketGull Viridis Perceptual** | `vs-dark` | Mathematically uniform perceptual colormap (viridis) engineered to eliminate false luminance artifacts across numerical code tokens. |
| **PocketGull Achromatopsia High-Luminance** | `vs-dark` | Extreme luminance-delta syntax system engineered for complete monochromatic vision and zero-chroma accessibility. |

---

## 🌐 Browser Themes (Chrome & Firefox)

The 6 flagship colorways are provided as native browser themes:
1. **PocketGull Obsidian**: Deep obsidian frame, gear teal active tab accent.
2. **PocketGull Washi Rice Paper**: Handmade Kozo paper frame, cinnabar stamp indicator.
3. **PocketGull Scotopic 650nm Red**: Circadian night mode preserving melatonin rhythm.
4. **PocketGull Curie Luminescence**: Laboratory phosphorescent green glow.
5. **PocketGull Rams Functionalist**: Industrial matte putty and functionalist amber.
6. **PocketGull Hypertext 1991**: Genesis hypertext monochrome.

### Activating in Google Chrome / Brave / Microsoft Edge
1. Open `chrome://extensions/` (or `brave://extensions/` / `edge://extensions/`).
2. Toggle **Developer Mode** on in the top right.
3. Click **Load unpacked**.
4. Navigate to `packages/pocketgull-theme/browser/chrome/pocketgull-obsidian` (or your preferred theme) and click **Select Folder**.

### Activating in Mozilla Firefox
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `packages/pocketgull-theme/browser/firefox/pocketgull-obsidian/manifest.json`.

---

## 💻 System Themes (Windows Terminal, Prompts & Cross-Platform Terminals)

### 1. Windows Terminal Integration (Auto-Discovered JSON Fragment)
PocketGull installs a Windows Terminal JSON Fragment into:
`%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\PocketGull\PocketGull.json`

Windows Terminal automatically loads all 6 color schemes and registers pre-configured profile defaults paired with the **PocketGull Mono** font.

### 2. Cross-Platform Terminals
Theme configuration files are pre-generated in `system/terminal/`:
- **Ghostty**: `system/terminal/ghostty/pocketgull-obsidian`
- **Alacritty**: `system/terminal/alacritty/pocketgull-obsidian.toml`
- **Kitty**: `system/terminal/kitty/pocketgull-obsidian.conf`

### 3. Shell Prompts (Oh-My-Posh)
- `system/shell-prompts/pocketgull-ophthalmic.omp.json` (Obsidian dark prompt)
- `system/shell-prompts/pocketgull-washi.omp.json` (Tactile washi light prompt)

---

## 🔤 Official Font Pairing: PocketGull Mono

All themes are harmonized with the **PocketGull Mono** typeface (`fonts/PocketGullMono-Regular.ttf`), featuring:
- **Optical Disambiguation**: Curved lowercase `l` (`cv05`), slashed zero (`cv08`), and serifed capital `I` (`ss02`).
- **ISMP Compliance**: High-risk medical decimal precision preventing trailing zeros (`5 mg`, not `5.0 mg`) and naked decimals (`0.5 mg`, not `.5 mg`).
- **Tabular Figures**: Fixed numeric metrics across all diagnostics and telemetry.

The installer automatically installs `PocketGullMono-Regular.ttf` and `PocketGull-VF.ttf` to your Windows User Fonts directory and sets:
```json
{
  "editor.fontFamily": "'PocketGull Mono', Consolas, monospace",
  "editor.fontLigatures": true,
  "terminal.integrated.fontFamily": "'PocketGull Mono', monospace"
}
```

---

## ⚡ Master 1-Click Sideload

To deploy fonts, IDE extensions, Windows Terminal fragments, and editor configurations in a single pass:

```bash
npm run theme:install
```

Or execute directly:
```bash
node packages/pocketgull-theme/scripts/sideload.mjs
```

---

## 🔬 Cognitive Ergonomics & Usability Standards

- **Heuristic Usability Standards**: Follows established cognitive ergonomic principles, progressive disclosure, system status visibility, and user control.
- **WCAG 2.2 AAA Contrast**: Text tokens guarantee $\ge 7:1$ contrast against their respective substrates.
- **Circadian Rhythms**: Preserves dark-adapted scotopic vision in late-night clinical or engineering shifts.
- **Zero Third-Party Corporate Marks**: Upholds trademark governance by using descriptive, generic aesthetic terminology.

---

## 📄 License

Apache License 2.0. Developed by [PocketGull LLC](https://github.com/pocketgull-app/pocketgull).
