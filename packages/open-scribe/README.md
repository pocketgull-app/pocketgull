# 🎙️ Open Scribe (`@pocketgull/open-scribe`)

> **Zero-dependency, open-source on-device clinical ambient voice scribe and Socratic plain-language demystifier.**  
> *Translating clinical dialogue into structured SOAP notes and reassuring 5th-grade "Teaspoon" patient summaries with zero cloud API keys, zero monthly subscriptions, and 100% HIPAA privacy.*

---

## 🏛️ Philosophy & Mission

Clinical voice scribes have become dominated by proprietary multi-billion dollar platforms charging $300–$500/month per clinician while transmitting raw patient audio to cloud data centers.

**Open Scribe** is a free, zero-dependency, open-source alternative:
- **100% On-Device / Zero Egress**: Built on native Web Speech API and client-side TypeScript logic with **zero external telemetry or cloud dependencies**.
- **Dual-Persona Velocity**:
  - 🩺 **For Clinicians**: High-density multi-paradigm SOAP notes with automatic ICD-10 suggestions.
  - 🌿 **For Patients ("The Teaspoon Scribe")**: 5th-grade plain-language translations using warm, empowering analogies (coffee filters, bicycle brake pads) and a comforting 3-Act vitality roadmap.
- **ISMP / FDA Medication Safety**: Enforces Institute for Safe Medication Practices zero-tolerance dosage rules (eliminating trailing zeroes `5.0 mg` and naked decimals `.5 mg`).
- **Open Source**: Licensed under **Apache-2.0**.

---

## ⚡ Quickstart

### 1. Zero-Install Browser Demo
Simply open [`demo/index.html`](file:///c:/Users/philg/Pocketgull/pocketgull/packages/open-scribe/demo/index.html) in any browser (Chrome, Edge, Safari, Chromebook, Mobile) and click **"🎙️ Start Ambient Scribe"**.

### 2. Install as an NPM Package
```bash
npm install @pocketgull/open-scribe
```

```typescript
import { SoapSynthesizer, IsmpSafetyGuard, SocraticDemystifier } from '@pocketgull/open-scribe';

const dialogue = "Patient reports right knee joint stiffness and pain with an HbA1c of 7.4%.";

// 1. Generate Clinician SOAP Note
const soapNote = SoapSynthesizer.synthesizeClinicalSoap(dialogue);
console.log(soapNote.subjective, soapNote.icd10Codes);

// 2. Generate Patient-Facing Teaspoon Summary
const patientNote = SoapSynthesizer.synthesizePatientTeaspoonNote(dialogue);
console.log(patientNote.reassuringSummary, patientNote.trajectory);

// 3. Audit Medication Safety
const ismpResult = IsmpSafetyGuard.audit("Administer Lisinopril 5.0 mg daily with .5 mL water.");
console.log(ismpResult.sanitizedText); // "Administer Lisinopril 5mg daily with 0.5mL water."
```

---

## 🔬 Core Capabilities

### 1. Multi-Paradigm SOAP Synthesizer
- **Subjective (S)**: Patient complaints, functional restrictions, sleep disruptions.
- **Objective (O)**: Physical exam findings, range of motion, and vital signs.
- **Assessment (A)**: Diagnostic impressions, ICD-10 mapping, kinetic chain evaluation.
- **Plan (P)**: Therapeutic exercises, Rachel Nabors 0.1 Hz breathing, and ISMP-verified medication regimens.

### 2. Socratic Plain-Language Demystifier ("Teaspoon Explanations")
- **eGFR (Kidney Filter Efficiency)**: Explained as a kitchen coffee filter cleaning water; lower numbers mean hydrating carefully to protect the mesh.
- **Troponin (Heart Distress Marker)**: Explained as packing foam inside a safe that only spills out if the heart is jostled.
- **HbA1c (Blood Sugar Memory)**: Explained as sugar glaze on a coat hanger that gentle post-meal walks naturally thin out.
- **Osteoarthritis (Cartilage Cushion)**: Explained as bicycle brake pads that gentle movement lubricates like oil on a chain.
- **IRMAA (Medicare Surcharge)**: Explained with actionable Form SSA-44 appeal guidance.

### 3. 3-Act Trajectory Arc
- **Act I: Where You've Been**: Past physiological hurdles framed as temporary signals from the body with **zero fatalism**.
- **Act II: Where You Stand Today**: Grounded active biometrics (HR, BP, SpO2) and living priorities.
- **Act III: Where You're Going**: Achievable 30-day, 60-day, and 90-day vitality milestones.

---

## 🛡️ License

Licensed under the **Apache License, Version 2.0** ([`LICENSE`](./LICENSE)).
