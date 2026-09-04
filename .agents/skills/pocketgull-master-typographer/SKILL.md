---
name: pocketgull-master-typographer
description: Master typographer and typefoundry engineer agent skill for PocketGull. Enforces W3C OTS compliance, 2-byte word alignment on loca/glyf tables, bit-7 flag masking, ISMP medication safety disambiguation, and Louise Sloan 5:1 optotype standards.
---

# 🖋️ PocketGull Master Typographer & Typefoundry Engineering Skill

This skill establishes the **Master Typographer Agent & Typefoundry Quality Standard** for PocketGull, codifying the disciplines of master punch-cutters, typefounders, and clinical ophthalmologists (**Adrian Frutiger**, **Louise Sloan**, **Herman Bouma**, and **Matthew Carter**).

---

## 🏛️ The 4 Zero-Tolerance Typographic Invariants

Every font binary (`.ttf`, `.woff2`) and specimen interface generated in PocketGull MUST strictly conform to these four invariants:

### 1. The 2-Byte Word-Alignment Invariant (`loca` & `glyf`)
* **The Law**: In TrueType SFNT fonts, every glyph entry in the `glyf` table MUST be padded with `0x00` to an even byte length. Every offset in the `loca` table MUST be even (`offset % 2 == 0`).
* **Failure Mode**: When any glyph has an odd offset, browser OpenType sanitizers (OTS) and DirectWrite encounter unaligned memory accesses, evict the font after ~1 second, and revert to system Arial.
* **Verification**: Run `dart run scripts/dart/pocketgull_foundry.dart audit` to verify 0 odd offsets across all glyphs.

### 2. The Clean Glyph Flag Invariant (Bit 7 Masking)
* **The Law**: In the TrueType `glyf` point flags byte, Bit 7 (`0x80` / flag 128) is **strictly reserved by the OpenType specification for future use and MUST be zero**.
* **Failure Mode**: Feeding cubic Béziers into `TTGlyphPen` causes `fontTools` to emit flag 128, triggering `glyf: Bad glyph flag (178), reserved bit 7 must be set to zero` OTS rejections.
* **Enforcement**: Always route curves through `Cu2QuPen(max_err=1.0)` and apply bitmasking (`flag & 0x3F`).

### 3. The Hermetic Specimen Delivery Invariant (Zero-Reversion)
* **The Law**: Standalone specimen HTML proofs (`index.html`) MUST embed 100% sanitized WOFF2 fonts as in-memory Data URIs without duplicate competing external `@font-face` rules.
* **Failure Mode**: If `index.html` defines in-memory `@font-face` while `pocketgull.css` simultaneously requests external `url('PocketGull-Bold.woff2')`, desktop Chrome blocks the external file under `file:///`, hits the font-swap timeout, and evicts the in-memory font.
* **Enforcement**: Separate external font hosting (`fonts.css`) from core layout tokens (`pocketgull.css`).

### 4. The ISMP & Louise Sloan 5:1 Clinical Safety Invariant
* **The Law**: All clinical dosage numbers, lab biomarkers, and Rx orders MUST enforce:
  * **Slashed Zero (`zero` / `cv08`)**: Differentiates `0 vs O` in `500 mg` and `0.08s`.
  * **Curved Lowercase `l` (`cv05`) & Serifed `I` (`ss02`)**: Eliminates the `l 1 I` ambiguity.
  * **Louise Sloan 5:1 Optotype Ratio**: 5 arcminutes total height, 1 arcminute stroke width and counter aperture at 55 cm reading distance (Snellen 20/20).
  * **Herman Bouma Lateral Spacing**: `letter-spacing: 0.12em` to prevent lateral crowding in peripheral vision ($r \approx 0.5 \times \text{eccentricity}$).

---

## 🛠️ Master Typefoundry CLI Commands (`scripts/dart/pocketgull_foundry.dart`)

The Dart 3.11 Typefoundry engine provides instantaneous, zero-virtualenv validation and maintenance:

```bash
# 1. Full W3C OTS & 2-Byte Word-Alignment Conformance Audit (<100ms)
dart run scripts/dart/pocketgull_foundry.dart audit

# 2. Multi-Repository Asset Synchronization (pocketgull-typeface <-> public/fonts)
dart run scripts/dart/pocketgull_foundry.dart sync

# 3. Zero-CORS Local Preview Server (Zero Base64 bloat)
dart run scripts/dart/pocketgull_foundry.dart serve 8080
```
