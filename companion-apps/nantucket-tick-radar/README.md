# 🌲 Nantucket Tick Defense & Co-Infection Radar

> **An Evidence-Grounded Citizen Science Lab, 3D 6th-Grade Learning Hub, and Real-Time Clinical Triage Engine for Nantucket Island (*ACK*).**

[![Access: Private](https://img.shields.io/badge/Access-Private%20Draft-purple.svg)]()
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-64%20Passed-brightgreen.svg)](https://vitest.dev/)
[![FHIR R4 Standard](https://img.shields.io/badge/HL7-FHIR%20R4%20Bundle-firebrick.svg)](https://hl7.org/fhir/R4/)
[![Reading Level](https://img.shields.io/badge/Readability-Flesch--Kincaid%20Grade%206.2-teal.svg)](docs/ZOONIVERSE_PROJECT_SPECIFICATION.md)

---

## 🧭 Project Overview

**Nantucket Island (*ACK*)** experiences some of the highest per-capita incidences of tick-borne infections in North America. This open-source platform bridges **peer-reviewed clinical medicine**, **island conservation ecology**, **K-12 public education**, and **community-driven citizen science** into a single, high-performance offline-first web application.

### Key Capabilities:
* 🛰️ **Interactive High-Resolution Satellite Map**: Leaflet GIS overlays of 20+ conservation trails (Sanford Farm, Coskata-Coatue, Squam Swamp, Linda Loring), trail mowing status, and real-time encounter hotspots.
* 🔄 **3D Double-Click Flip Card System**: Double-click any scientific paper or field guide (or tap `🎒 6th-Grade Plain English`) to flip the card in 3D between clinical data and 6th-grade metaphors.
* 🪐 **Zooniverse.org "Island Tick Detectives" Specification**: Full CSV manifest schema, 4 workflow definitions, and field guide for one-click upload into the Zooniverse Project Builder.
* 🎓 **5-Part Middle School Curriculum & 4 Civic Letters**: NGSS-aligned classroom modules (MS-LS1/LS2) and scaffolded letters to the Select Board, island landscapers, ferry visitors, and MIT.
* 🧍 **Interactive 360° Anatomical Body Inspection**: Front/back mannequins guiding step-by-step mechanical extraction across tricky anatomical zones (scalp, axillary folds, behind knees).
* ☀️ **Microclimate Desiccation Radar**: Computes Vapor Pressure Deficit (VPD) and Questing Activity Index based on island temperature, relative humidity, and wind speed.
* 🔬 **72-Hour Single-Dose Doxycycline Triage ($200\text{ mg}$)**: Evaluates IDSA/AAN/ACR clinical criteria based on species, attachment dwell time, and removal hours.
* 🌲 **Island Ranger & Community Portal**: 10-second Trailhead Weatherproof QR sign generator, (508) ACK-TICK NLP SMS simulator, trail mowing logger, and live pharmacy doxycycline ticker.
* 🧳 **Ferry & Trailhead Packing Planner**: Offline-persisted checklist ensuring travelers pack fine-tipped tweezers, picaridin, permethrin socks, and inspection mirrors.
* 📚 **Peer-Reviewed Scientific Sources Tab**: 9 peer-reviewed studies (Lantos 2021, Nadelman 2001, Schwan 2000, Williams 2010, Carroll 2010, Francischetti 2002) with direct DOI and PubMed citations.
* 🏥 **HL7 FHIR R4 EMR Intake Summary**: Generates clinical handover reports ready for Nantucket Cottage Hospital Walk-in Clinic (`508-825-1000`) and Mass General Brigham EHR (Epic).

---

## 🔄 3D Double-Click Flip Card Architecture

The application introduces a dual-perspective knowledge architecture allowing learners of all ages to explore complex science:

| Perspective | Front Face (🔬 Clinical & Ecological) | Back Face (🎒 6th-Grade Plain English) |
| :--- | :--- | :--- |
| **Scientific Sources** | Journal citation, DOIs, PMIDs, molecular switches ($OspA \to OspC$), and quantitative trial statistics. | Plain-English translation, everyday metaphors (e.g., *"Walking on hot coals"*), and kid-friendly takeaways. |
| **Field Guides** | Full illustrated articles, botanical taxonomy (*Berberis thunbergii*), and pharmacological mechanisms. | Island detective story clues and actionable family safety rules. |
| **Interaction** | Double-click any card or tap the `🔄 Flip` badge. | Tap `#toggleReadingModeBtn` in header to flip all cards simultaneously. |

---

## 🪐 Zooniverse & Educational Documentation

Full specifications are included in the repository for educators, researchers, and community organizers:

1. [`docs/ZOONIVERSE_PROJECT_SPECIFICATION.md`](docs/ZOONIVERSE_PROJECT_SPECIFICATION.md):
   * **Project Title**: *Island Tick Detectives: Help Scientists Spot, Measure, and Stop Ticks on Nantucket*
   * **Workflow 1**: Species & Life Stage Classifier (Poppy-seed nymph vs. Sesame-seed adult).
   * **Workflow 2**: Optical Scutal Index Digital Ruler (Feeding time estimation).
   * **Workflow 3**: Trail Cam Night Wildlife Tracker (Deer, mice, rabbits).
   * **Workflow 4**: Prickly Barberry & Weed Hunter (Drone aerial identification).
   * Includes complete `manifest.csv` schema and Talk Board category taxonomy.

2. [`docs/NANTUCKET_SCHOOL_LESSON_PLANS_AND_LETTERS.md`](docs/NANTUCKET_SCHOOL_LESSON_PLANS_AND_LETTERS.md):
   * **Lesson 1**: The Microscopic Hitchhiker (Tick mouthparts & Haller's organ).
   * **Lesson 2**: The 36-Hour Clock & The Bacterial Move (Spirochetes & temperature switches).
   * **Lesson 3**: The Island Ecosystem Web: Mice, Deer & Barberry (12x tick multipliers in invasive thickets).
   * **Lesson 4**: Citizen Science in Action: Zooniverse Lab (Classroom data validation).
   * **Lesson 5**: Seven Generations Island Stewardship (Indigenous wisdom & long-term ecological balance).
   * **4 Civic Action Letters**: Formatted templates for middle schoolers to write to local town leaders, landscapers, tourists, and MIT researchers.

---

## 📚 Grounding Bibliography

All algorithms and recommendations are grounded in peer-reviewed literature:

* **Lantos PM, et al.** (2021). *Clinical Practice Guidelines by the IDSA, AAN, and ACR: Prevention, Diagnosis, and Treatment of Lyme Disease.* Clin Infect Dis. DOI: [10.1093/cid/ciaa1102](https://doi.org/10.1093/cid/ciaa1102).
* **Nadelman RB, et al.** (2001). *Prophylaxis with Single-Dose Doxycycline for the Prevention of Lyme Disease after an Ixodes scapularis Tick Bite.* N Engl J Med. DOI: [10.1056/NEJM200107123450201](https://doi.org/10.1056/NEJM200107123450201).
* **Schwan TG, Piesman J.** (2000). *Temporal Changes in Outer Surface Proteins A and C of the Lyme Disease Spirochete during Tick Feeding.* J Clin Microbiol. DOI: [10.1128/JCM.38.1.382-388.2000](https://doi.org/10.1128/JCM.38.1.382-388.2000).
* **Williams SC, Ward JS.** (2010). *Effects of Japanese Barberry Control on Ixodes scapularis Abundance and Borrelia burgdorferi Prevalence in White-Footed Mice.* Environ Entomol. DOI: [10.1603/EN09230](https://doi.org/10.1603/EN09230).
* **Stafford KC 3rd.** (1994). *Survival of Immature Ixodes scapularis in Relation to Relative Humidity and Temperature.* J Med Entomol. DOI: [10.1093/jmedent/31.2.310](https://doi.org/10.1093/jmedent/31.2.310).
* **Carroll JF, et al.** (2010). *Repellency of Selected Active Ingredients Against Ixodes scapularis.* Med Vet Entomol. DOI: [10.1111/j.1365-2915.2010.00885.x](https://doi.org/10.1111/j.1365-2915.2010.00885.x).
* **Francischetti IM, et al.** (2002). *Ixolaris, a Novel Tick Anticoagulant from Ixodes scapularis.* Toxicon. DOI: [10.1016/S0041-0101(02)00155-7](https://doi.org/10.1016/S0041-0101(02)00155-7).

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js**: v20.x or v24.x
* **npm**: v10.x+

### Local Setup
```bash
# Clone the repository
git clone https://github.com/philgear/nantucket-tick-radar.git
cd nantucket-tick-radar

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run automated Vitest unit test suite
npm test

# Build production bundle
npm run build

# Start local production server (http://localhost:8080)
npm start
```

---

## 🧪 Testing

The suite is thoroughly tested with Vitest and Playwright:

```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Suites (34/34 Passing):
* `tests/sources-bibliography.spec.ts`: Validates all DOIs, PMIDs, and 6th-grade plain English metadata.
* `tests/articles-library.spec.ts`: Validates field guides, 6th-grade summaries, and external citations.
* `tests/eisenhower-actions.spec.ts`: Verifies urgent extraction and 72-hour prophylaxis decision logic.
* `tests/dwell-time-calculator.spec.ts`: Tests attachment hours calculation and scutal index thresholds.
* `tests/co-infection-radar.spec.ts`: Tests symptom clustering for Babesia, Anaplasma, and Lyme.
* `tests/body-and-weather.spec.ts`: Tests Vapor Pressure Deficit (VPD) math and anatomical extraction guides.
* `tests/repellent-guide.spec.ts`: Verifies EPA active ingredient concentration and dry heat protocols.
* `tests/community-portal.spec.ts`: Tests QR code generation, NLP SMS parser, and pharmacy counters.
* `tests/seven-generations.spec.ts`: Tests stewardship quest progression and score tracking.
* `tests/nantucket-geo-routes.spec.ts`: Validates GIS trail bounds, distances, and coordinate sanity.

---

## ☁️ Deployment (Google Cloud Run)

The platform is designed to run in scale-to-zero container environments:

```bash
# Build and deploy container to Cloud Run
gcloud run deploy nantucket-tick-radar \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 256Mi \
  --cpu 1
```

## 🔒 Repository Access & Status

> **Status:** **Private Research & Community Working Draft**  
> This repository is currently maintained in **private, restricted-access mode**. It is an active working draft not intended for public distribution, indexing, or open publication until editorial and stakeholder reviews are finalized.

---

## ⚠️ Community Working Draft & Public Disclaimer

> **Important Notice:**
> The *"Island Tick Detectives"* educational modules and related concepts originated from informal community discussion notes and public meeting transcripts; **they are not an official town plan, municipal resource, or enacted school curriculum just yet**.
> 
> This repository and application represent an independent, community-driven citizen science initiative. Content is a working draft, may contain errors, is actively evolving and needs editorial review, and does not constitute official municipal policy or medical directives. For acute clinical concerns, always consult a licensed medical provider or visit the [Nantucket Cottage Hospital Walk-in Clinic](https://nantuckethospital.org/).

---

## 📄 License & Access Notice

Private and Confidential Working Draft &bull; All Rights Reserved &bull; PocketGull Research Initiative.

---

<div align="center">
  <sub>Built with clinical precision and ecological stewardship by <b>Phillip Gear</b> & the <b>PocketGull Initiative</b>.</sub>
</div>
