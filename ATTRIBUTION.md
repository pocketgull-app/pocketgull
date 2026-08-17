# 📋 IP Attribution & License Manifest

## Build with Gemini XPRIZE — Intellectual Property Compliance Record

> **Last Audited**: August 17, 2026
> **Audited By**: Phil Gear (Project Lead)
> **Competition**: Build with Gemini XPRIZE (Devpost)
> **Official Rules Reference**: [xprize.devpost.com/rules](https://xprize.devpost.com/rules) — §4 (Submission Requirements, Intellectual Property), §7 (Intellectual Property Rights)

---

## 1. Compliance Statement

All materials in this submission are either:

1. **Original work product** created solely by the Entrant during the hackathon period (May 19 – August 17, 2026);
2. **AI-generated content** produced by the Entrant's own prompts using authorized Google Cloud and Adobe Firefly services; or
3. **Open source / open license materials** used in full compliance with their respective licenses.

No copyrighted music, unauthorized third-party footage, unauthorized trademarks, or proprietary stock media are included in this submission or its demo video.

---

## 2. Third-Party Assets

### 2.1 Images

| Asset | Source | License | Attribution |
|---|---|---|---|
| `640px-Chest_xray_mac.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chest_xray_mac.jpg) | **CC BY-SA 4.0** | See §2.1.1 below |

All other images in `public/assets/` (art, agent avatars, organelle console renders, Veo video frames) are **AI-generated original work product** created by the Entrant using Google Imagen, Google Veo (Vertex AI), or Adobe Firefly.

#### 2.1.1 CC BY-SA 4.0 Attribution — Chest X-Ray

- **File**: `public/assets/images/640px-Chest_xray_mac.jpg`
- **Used In**: Mock patient DICOM imaging panel ([`src/mock-patients/p001.ts`](src/mock-patients/p001.ts), line 183)
- **Original Source**: [Wikimedia Commons — File:Chest_xray_mac.jpg](https://commons.wikimedia.org/wiki/File:Chest_xray_mac.jpg)
- **Author**: James Heilman, MD
- **License**: [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
- **Modifications**: Resized for responsive display via `ImageOptimizationService`. No content alterations.
- **Context**: Used as a simulated medical imaging artifact in demo mode with de-identified mock patient data. Not included in the demo video submission.

---

### 2.2 Fonts

| Font | Source | License |
|---|---|---|
| `PocketGull-Bold.ttf` | AI-generated (Entrant's prompts) | **Original work product** |
| `PocketGull-Chiseltip.ttf` | AI-generated (Entrant's prompts) | **Original work product** |
| `PocketGull-Fineliner.ttf` | AI-generated (Entrant's prompts) | **Original work product** |
| `PocketGullMono-Regular.ttf` | AI-generated (Entrant's prompts) | **Original work product** |
| Inter | [Google Fonts](https://fonts.google.com/specimen/Inter) | **OFL 1.1** (SIL Open Font License) |
| Libre Caslon Display | [Google Fonts](https://fonts.google.com/specimen/Libre+Caslon+Display) | **OFL 1.1** |
| JetBrains Mono | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | **OFL 1.1** |

---

### 2.3 Audio

| Asset | Source | License |
|---|---|---|
| 24 scene narration MP3s (`public/assets/audio/`) | **Google Cloud Text-to-Speech** (Journey & Studio Neural voices) | Google Cloud ToS — generated output permitted for commercial use |

No third-party music, stock audio, or copyrighted sound recordings are used anywhere in this project.

---

### 2.4 Textures

| Asset | Source | License |
|---|---|---|
| `firefly_skin.png` | **Adobe Firefly** (Entrant's prompts) | Adobe Firefly ToS — commercial use permitted |
| `firefly_muscle.png` | **Adobe Firefly** (Entrant's prompts) | Adobe Firefly ToS — commercial use permitted |
| `firefly_skeleton.png` | **Adobe Firefly** (Entrant's prompts) | Adobe Firefly ToS — commercial use permitted |
| `firefly_organs.png` | **Adobe Firefly** (Entrant's prompts) | Adobe Firefly ToS — commercial use permitted |

---

### 2.5 Video Frames (Veo)

| Asset | Source | License |
|---|---|---|
| `scene1_clerical_trap.jpg` through `scene6_xprize_healthspan.jpg` | **Google Veo** (Vertex AI, Entrant's prompts) | Google Cloud ToS — generated output permitted |
| `candle_in_the_dark.jpg` | **Google Veo** (Vertex AI, Entrant's prompts) | Google Cloud ToS — generated output permitted |
| `paper/` variants | **Google Imagen** (Vertex AI, Entrant's prompts) | Google Cloud ToS — generated output permitted |

---

## 3. Open Source Software Dependencies

All npm dependencies use **permissive open source licenses** (MIT, Apache 2.0, ISC, BSD). No GPL-only or proprietary-licensed dependencies are included in the production build.

### Core Frameworks & Libraries

| Package | License | Usage |
|---|---|---|
| `@angular/*` (v22) | MIT | Frontend framework |
| `three` | MIT | 3D WebGL anatomy viewer |
| `express` | MIT | Server-side rendering |
| `tailwindcss` | MIT | Utility-first CSS |
| `jspdf` | MIT | PDF export |
| `dompurify` | Apache 2.0 / MPL 2.0 | XSS sanitization (HIPAA) |
| `marked` | MIT | Markdown rendering |

### Google Cloud & AI SDKs

| Package | License | Usage |
|---|---|---|
| `@google/genai` | Apache 2.0 | Gemini API client |
| `@google/adk` | Apache 2.0 | Multimodal Live Audio streaming |
| `@genkit-ai/core` | Apache 2.0 | AI workflow orchestration |
| `firebase-admin` | Apache 2.0 | Cloud infrastructure |

### Testing & Development

| Package | License | Usage |
|---|---|---|
| `vitest` | MIT | Unit testing |
| `playwright` | Apache 2.0 | E2E testing |
| `typescript` | Apache 2.0 | Type system |

---

## 4. Trademarks

The following third-party trademarks are referenced in this submission solely in the context of describing compatibility, integration, or competition participation:

- **XPRIZE®** — Referenced as the competition organizer per submission requirements
- **Google Gemini™** — Referenced as the required AI platform per competition requirements
- **Google Cloud™** — Referenced as the required cloud platform per competition requirements
- **Stripe®** — Referenced as the payment processing integration

These marks are used nominatively and do not imply endorsement. Pocket-Gull's own marks (`Pocket-Gull`, `🕊️`) are original.

---

## 5. Clinical & Scientific Data

| Content | Source | Status |
|---|---|---|
| Mock patient profiles | Original fiction, HIPAA §164.514 Safe Harbor de-identified | Original work product |
| Pre-baked clinical analysis reports | Original authored clinical content | Original work product |
| Medical literature citations | Standard academic references (DOIs) | Fair use / standard citation |

---

## 6. Demo Video Compliance

Per X Prize Official Rules §4 (Submission Requirements), the demonstration video:

- ✅ Contains **no third-party trademarks** (only own marks + required competition references)
- ✅ Contains **no copyrighted music** (no background music used)
- ✅ Contains **no copyrighted footage** (all frames are AI-generated via Google Veo)
- ✅ Contains **no copyrighted images** (all visuals are original or AI-generated)
- ✅ All narration is **AI-generated** via Google Cloud Text-to-Speech
- ✅ All screen recordings show **the Entrant's own application** (`pocketgull.app`)

---

*This manifest is provided as a good-faith compliance record for the Build with Gemini XPRIZE hackathon. For questions, contact the Entrant via the Devpost submission page.*
