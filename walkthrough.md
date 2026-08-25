# 🗺️ Pocket Gull Master Walkthrough & User Flow Pathways

This document provides a comprehensive operational guide to the primary user flows and interactive pathways in Pocket Gull.

---

```
                               ┌─────────────────────────────────────────┐
                               │       POCKET GULL PERSONA PATHWAYS      │
                               └────────────────────┬────────────────────┘
                                                    │
         ┌──────────────────────────┬───────────────┴───────────────┬──────────────────────────┐
         │                          │                               │                          │
         ▼                          ▼                               ▼                          ▼
 🩺 CLINICAL PROVIDER        🌟 FAMILY & HERO              🔬 GLOBAL RESEARCHER        🧘 PATIENT WELLNESS
 ────────────────────        ─────────────────             ────────────────────        ───────────────────
 1. Patient Chart & EHR      1. Select Companion Mode      1. Multi-Cloud Open Data    1. WebGPU Cam Bio-Vitals
 2. 3D Anatomy Raycasting    2. 9-Language Localization    2. Cohorts (MIMIC-IV/UKBB)  2. Zen 432Hz Sound Pacer
 3. Ambient Scribe (SOAP)    3. Micro-Habit Logging        3. Big Four AI Consensus    3. Postcards on the Pier
 4. Multi-Lens Synthesis     4. Printable Fridge Chart     4. Cochrane RoB 2 / CPIC    4. Geo-Exposomics (AQI)
 5. FHIR R4 & QR Handoff     5. Offline PWA & SMS Sync     5. Popperian H₀ Auditing    5. 1-Click Ephemeral Purge
```

---

## 🩺 Walkthrough: Inclusive Language Refactoring & Quality Verification

## Overview
Completed a thorough, system-wide codebase refactor eliminating non-inclusive terminology across UI templates, services, unit tests, styling manifests, and legal documents in compliance with modern clinical and engineering inclusive language standards.

---

## Changes Implemented

### 1. Inclusive Terminology Migration
- **Components & Navigation**:
  - Renamed `master-paradigm-synthesizer.component.ts` $\rightarrow$ [unified-paradigm-synthesizer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/unified-paradigm-synthesizer.component.ts) and updated [domain-suites-navigator.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/domain-suites-navigator.component.ts).
  - [encrypted-vault-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/encrypted-vault-modal.component.ts): Replaced "Master Passphrase" with "Vault Passphrase".
  - [main-header-nav.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/main-header-nav.component.ts): Replaced "Master Apps & Portals Hub" with "Clinical Apps & Portals Hub".
  - [handoff-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/modals/handoff-modal.component.ts): Replaced `tcm_master` with `tcm_herbalist` ("TCM Senior Herbalist").
  - [analysis-report.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.component.ts): Replaced `4608k_master` $\rightarrow$ `4608k_studio` ("4608 kbps • Studio Lossless").
  - [family-health-quest.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/family/family-health-quest.component.ts): Replaced `Master of Nutrition` $\rightarrow$ `Lead Nutritionist`.
  - [mood-consciousness-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/mood-consciousness-matrix.component.ts): Replaced "Master Audio Mute" with "Global Audio Mute".
  - [genomic-variant-screener.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/genomic-variant-screener.component.ts): Replaced "Variant Master-Detail List" with "Variant Split-View List".

- **Audio & Clinical Services**:
  - [avs-engine.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/avs-engine.service.ts) & [avs-engine.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/avs-engine.service.spec.ts): Replaced `4608k_master` $\rightarrow$ `4608k_studio`, `masterGain` $\rightarrow$ `mainGain`, `isMaster` $\rightarrow$ `isStudio`.
  - [ambient-flow-soundscape.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ambient-flow-soundscape.service.ts): Replaced `masterGain` $\rightarrow$ `mainGain`, `setupMasterBus` $\rightarrow$ `setupMainBus`.
  - [actuarial-glee-audio.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-glee-audio.service.ts): Replaced `masterGain` $\rightarrow$ `mainGain`.
  - [pet-auditory.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/pet-auditory.service.ts): Replaced `masterGain` $\rightarrow$ `mainGain`.
  - [bio-haptic-feedback.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/hardware/bio-haptic-feedback.service.ts): Replaced `masterGain` $\rightarrow$ `mainGain`.
  - [clinical-intelligence.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts): Replaced `MASTER_SNAPSHOT_V1` $\rightarrow$ `PRIMARY_SNAPSHOT_V1`.
  - [wacom-crypto-ink.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/wacom-crypto-ink.service.ts): Replaced `Master Calligrapher 🌟` $\rightarrow$ `Virtuoso Calligrapher 🌟`.
  - [tri-paradigm-swarm.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/tri-paradigm-swarm.service.ts): Replaced `Master Swoop` $\rightarrow$ `Elder Swoop`.
  - [hobby-domain-companion.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/hobby-domain-companion.service.ts): Replaced non-inclusive titles with `Lead Botanical Specialist`, `Artisan Cabinetmaker`, `Symphony Principal Violinist`, `Lead Navigator`.

- **Legal & Documentation**:
  - Renamed [POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md) and updated references across [ip-patent-registry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ip-patent-registry.service.ts) and [patent-claims-hud-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/modals/patent-claims-hud-modal.component.ts).

---

## Verification Results

### 1. TypeScript Typecheck
```powershell
node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit
# Exit Code: 0 (Zero diagnostic errors)
```

### 2. Angular Production & SSR Build
```powershell
node node_modules/@angular/cli/bin/ng.js build
# Exit Code: 0 (Application bundle generation complete, all browser and SSR chunks compiled successfully)
```

---

## 🩺 Pathway 1: Attending Clinician & EHR Scribe Flow

Designed for MDs, DOs, Nurse Practitioners, and clinical teams conducting in-person or telehealth consults.

1. **Step 1: Patient Chart & Sentinel Triage Selection (`tour-patient-dropdown`)**
   - Select patient demographic archetype.
   - Inspect epidemiological Sentinel tags and demographic twin baselines.
2. **Step 2: 3D Anatomical & Raycast Loci Symptom Isolation (`tour-body-chart`)**
   - Interact with procedural Three.js 3D anatomy (Skin, Muscle, Bone, Visceral Organs, Dermatomes).
   - Tapping an anatomical locus automatically interpolates camera focus, filters CMP labs, and focuses Gemini context.
3. **Step 3: Ambient Multimodal Clinical Scribe (`tour-ambient-scribe`)**
   - Launch real-time speech diarization stream (`🩺 Clinician` vs. `👤 Patient`).
   - Listen passively to dialogue and automatically synthesize structured **SOAP Notes** (Subjective, Objective, Assessment, Plan).
   - Review primary **ICD-10-CM** diagnoses, differential likelihood tiers, and **CPT E&M billing codes** (`99214`, `95806`).
4. **Step 4: Gemini 3.5 & 3.6 Multi-Lens Synthesis (`tour-generate-btn`)**
   - Stream multi-paradigm clinical reasoning with Thought Signature circulation across Western Medicine, TCM Zang-Fu, and Ayurvedic Medha Sakti.
5. **Step 5: 11 Specialized Clinical Lenses (`tour-lens-tabs`)**
   - Navigate Treatment Matrix, Functional Protocols, Precision Nutrients, Follow-up, Patient Education, Maternal Health, and CMS RPM Billing Audits.
6. **Step 6: Progressive Disclosure & Level 4 Context Actions (`tour-report-node`)**
   - Right-click / long-press cards to trigger FHIR R4 Bundle export, CMS 837P claim builder, or add EHR clinical notes.
7. **Step 7: Multimodal Avian Live Agent (`tour-voice-agent-window`)**
   - Conduct hands-free voice inquiries with `@google/adk` live audio assistants (Gulliver 🔭, Swoop ⚡).
8. **Step 8: Literature Research & Open Science (`tour-research-frame-window`)**
   - Query PubMed E-utilities, bioRxiv preprints, and PubGemma 27B MeSH grounded citations.
9. **Step 9: Dieter Rams Functional Theme Studio (`tour-theme-trigger`)**
   - Switch between high-contrast clinical themes (Obsidian, Rice Paper Washi, Madame Curie Lab).
10. **Step 10: Governance & Alarm Suppression (`tour-footer-lens-navigation`)**
    - Monitor Wachter/Brookings AI safety indicators and clinical alarm fatigue suppression metrics.
11. **Step 11: Patient QR Handoff & FHIR R4 Archival (`tour-finalize-btn`)**
    - Archive care plan, copy FHIR R4 JSON bundle, and scan the QR code to hand off the care plan to the patient's phone.

---

## 🌟 Pathway 2: Family & Universal Health Quests Flow

Designed for children, partners, friends, and solo individuals building joyful daily wellness habits.

1. **Step 1: Choose Companion Archetype (`tour-family-quest-hero`)**
   - **🌟 Family & Kids**: Kid-coached nudges for parents ("Captain Hydration", "Sunshine Scout").
   - **🤝 Friend & Peer Pact**: Mutual accountability pacts between workout partners.
   - **🐕 Furry Pet Co-Care**: Sync daily dog walks and outdoor play.
   - **🧘 Mindful Solo Mastery**: Independent self-care and micro-habit streaks.
2. **Step 2: 9-Language Localization (`tour-family-quest-language`)**
   - Switch dynamically between EN, ES, FR, DE, ZH, JA, HI, AR (with native Right-to-Left alignment), and PT.
3. **Step 3: Micro-Habit Health Quests (`tour-family-quest-cards`)**
   - Log daily water intake, morning sunlight, colorful vegetable intake, and wind-down bedtimes to earn superhero badge stamps.
4. **Step 4: 1-Click Printable Refrigerator Stamp Chart (`tour-family-quest-print`)**
   - Generate a high-contrast, black-and-white printable weekly stamp chart for physical refrigerator tracking with stickers or markers.
5. **Step 5: Offline-First PWA & SMS Sync (`tour-family-quest-privacy`)**
   - Fully cached in local storage with zero cloud ad tracking, screen-free physical printout support, and SMS fallback.

---

## 🔬 Pathway 3: Global Science & Data Alliance Flow

Designed for clinical researchers, bioinformaticians, and data scientists auditing evidence.

1. **Step 1: Select Open Health Data Cloud (`tour-research-ecosystem-tabs`)**
   - Federated query across AWS Open Data (RODA), Google Cloud BigQuery, Microsoft Azure Blob, Apple Health Studies, and Global Science Alliances.
2. **Step 2: Query Premier Open Reference Cohorts (`tour-research-biomarkers`)**
   - Explore PhysioNet MIMIC-IV continuous waveforms, UK Biobank 500k Pan-UKBB GWAS distributions, and Human Protein Atlas tissue proteomics.
3. **Step 3: Big Four Quad-Cloud AI Consensus (`tour-research-consensus`)**
   - Cross-check consensus scoring across Google Gemini 2.5, AWS Bedrock Claude 3.5, Azure BioGPT, and Apple CoreML.
4. **Step 4: Cochrane RoB 2 & CPIC Pharmacogenomics (`tour-research-cochrane`)**
   - Audit Cochrane Risk of Bias 2 evaluation flags and verify CYP450 (CYP2D6, CYP2C19) drug-gene dosing rules.
5. **Step 5: Popperian Null-Hypothesis ($H_0$) Auditing (`tour-research-null-hypothesis`)**
   - Calculate empirical $p$-values against population baseline means to guarantee that findings achieve statistical significance ($p < 0.05$).

---

## 🧘 Pathway 4: Patient Wellness & Ephemeral Data Sovereignty Flow

Designed for patients managing daily stress, monitoring biometrics at home, and seeking private self-care.

1. **Step 1: WebGPU Contactless Bio-Telemetry (`tour-camera-biometrics`)**
   - Client-side extraction of rPPG heart rate variability (HRV) and motor tremor FFT frequency spectra directly in the browser via WebGPU.
2. **Step 2: Zen Sanctuary & 432Hz Sound Healing (`tour-zen-sanctuary`)**
   - Procedural 432Hz Tibetan singing bowl sound synthesis and 4-7-8 vagal nerve breathing pacers.
3. **Step 3: Postcards on the Pier Healing Gallery (`tour-postcards-pier`)**
   - Read and write anonymous, compassionate words of encouragement with Kintsugi gold vein illumination.
4. **Step 4: Privacy-First On-Device Geo-Exposomics (`tour-exposomics-geofence`)**
   - Check local Air Quality Index (AQI) and UV pollen advisories computed locally without remote location harvesting.
5. **Step 5: 1-Click Ephemeral State Purging (`tour-purge-state`)**
   - Wipe all active clinical state, cached vitals, and conversation buffers with a single click satisfying HIPAA Safe Harbor §164.514.
