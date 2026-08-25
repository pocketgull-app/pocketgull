# Tutorial: Your First Patient Encounter

**Type**: Diátaxis Tutorial (Learning-Oriented)
**Audience**: First-time clinicians, nurses, researchers, or evaluators
**Time**: ~10 minutes
**Prerequisites**: A modern web browser (Chrome, Edge, or Firefox)

---

## What You'll Accomplish

By the end of this tutorial, you will have:

1. Entered the secure clinical console
2. Selected and loaded a patient case profile
3. Examined an anatomical region on the interactive 3D body map
4. Generated a real-time AI Care Plan Strategy across 5 specialized clinical lenses
5. Explored evidence-grounded recommendations with inline research citations
6. Exported a compliant care plan record

This tutorial uses the built-in **Sandbox Demo Mode**, which runs entirely on simulated patient data. No real protected health information (PHI) is transmitted or stored at any point.

---

## Step 1: Open the Secure Console

Navigate to [https://pocketgull.app](https://pocketgull.app) in your browser.

You'll be greeted by the **Secure Splash Screen** — a living, breathing coastal landscape with layered papercraft waves, ambient ocean audio, and a circadian-responsive colour gradient.

### Enter Demo Mode

At the bottom of the splash screen, tap **"Demo Mode"**.

This activates the isolated sandbox environment. You'll see a confirmation banner:

> *Demo Environment Active: All clinical data and consults run in an isolated sandbox. Patient details are fully simulated, ensuring zero transmission or disclosure of actual protected health information (PHI).*

### Complete the Karolinska Sleepiness Scale (KSS)

Before entering, the system asks you to self-report your current alertness level using the **Karolinska Sleepiness Scale** — a validated 1–9 psychomotor readiness instrument. This is part of the circadian alignment protocol.

Select a value that honestly reflects your current state. This feeds into the environmental telemetry system and adjusts the ambient lighting and notification intensity to match your fatigue level.

Tap **"Begin Clinical Session"** to enter the main console.

---

## Step 2: Select a Patient Profile

Once inside, you'll see the **Patient Roster** in the left sidebar. PocketGull ships with 15 de-identified patient archetypes following HIPAA §164.514 Safe Harbor standards.

### Choose Your First Patient

For this tutorial, select:

> **Homo Sapiens (Male, Metabolic Syndrome, 58y)** — `p001`

This profile represents a 58-year-old male with:
- Essential Hypertension
- Type 2 Diabetes Mellitus
- Obesity (BMI 42)
- Severe Obstructive Sleep Apnea
- Metabolic Syndrome

When you tap the patient card, PocketGull loads the full clinical state: pre-existing conditions, TCM intake (tongue, pulse, thermal preference), Ayurvedic prakriti/vikriti scores, and any previous visit history.

---

## Step 3: Examine the 3D Anatomy Viewer

The centrepiece of the workspace is the **Interactive 3D Body Map** — a procedurally generated skeletal and surface model rendered in Three.js.

### Navigate the Model

- **Rotate**: Click and drag to orbit the model
- **Zoom**: Scroll wheel to zoom in/out
- **Select**: Click directly on an anatomical region to highlight it

### Select a Region of Interest

For this patient with metabolic syndrome, click on the **abdominal region**. You'll see:

1. A **severity-mapped particle system** appears around the selected area
2. The region name populates in the **Active Loci** panel
3. The sidebar updates with relevant symptoms mapped to that anatomical zone

The 3D viewer supports 9 major anatomical zones: head, cervical, thoracic, upper extremities, abdominal, lumbar, pelvic, lower extremities, and systemic/whole-body.

---

## Step 4: Generate the AI Care Plan Strategy

With a patient loaded and an anatomical region selected, you're ready to generate the multi-lens clinical strategy.

### Press "Generate Care Plan"

Locate the **"Generate Care Plan"** button (it pulses gently when conditions are met). Tap it.

PocketGull sends the patient's full clinical context — demographics, conditions, symptoms, selected anatomy, TCM intake, and Ayurvedic scores — to Google Gemini. The response streams in real-time using Server-Sent Events (SSE).

### Watch the Multi-Lens Report Build

The analysis report populates across **5 specialized clinical lenses**:

| Lens | What It Covers |
|---|---|
| **Assessments** | Differential diagnoses, clinical scoring instruments, severity grading |
| **Interventions** | Evidence-based treatment recommendations, pharmacological and non-pharmacological |
| **Diagnostics** | Recommended lab panels, imaging studies, and screening instruments |
| **Lifestyle** | Nutrition, exercise, sleep hygiene, and behavioural modification plans |
| **Multi-Paradigm** | TCM pattern differentiation, Ayurvedic dosha rebalancing, integrative crosswalks |

Each lens tab is independently scrollable. The report typically completes in 3–8 seconds depending on network latency.

---

## Step 5: Explore Evidence-Grounded Recommendations

Every recommendation in the care plan is anchored in clinical evidence.

### Activate Evidence Focus

Hover over (or tap on mobile) any recommendation line in the report. An **Evidence Focus** panel expands inline, showing:

- **PubMed citations** — linked to the original NIH abstract
- **Evidence grade** — strength of recommendation (A/B/C/D)
- **Source context** — the clinical guideline or systematic review backing the recommendation

This is powered by real-time PubMed E-utilities and Google Programmable Search grounding, not static lookups. Each evidence reference is live-resolved at generation time.

---

## Step 6: Export the Care Plan

Once you've reviewed the care plan, you can export it in multiple formats.

### Export Options

Open the **Export** panel (printer icon or "Finalize & Archive" button) and choose from:

| Format | Use Case |
|---|---|
| **PDF** | Printable clinical summary with QR code for digital verification |
| **FHIR R4 Bundle** | Machine-readable interoperability standard (JSON) |
| **Print Preview** | Formatted A4/Letter layout with letterhead and clinical styling |

The exported document includes:
- Patient demographics (de-identified in demo mode)
- All 5 lens analyses
- Evidence citations
- Clinician signature block
- QR code linking back to the digital record

All exported content is sanitized through DOMPurify before rendering, ensuring HIPAA-compatible privacy compliance.

---

## What's Next?

You've completed your first patient encounter. Here are some directions to explore:

### Voice Consultation
Tap the **microphone icon** to start a bi-directional voice consult with Gemini. Speak naturally — the system supports real-time speech-to-text with barge-in interruption.

### Sentinel Triage
Select a **Sentinel patient** (e.g., "Global Sentinel") from the roster to investigate WHO/CDC outbreak triage scenarios with real-time registry connectivity simulation.

### Multi-Paradigm Comparison
Switch between **Western**, **TCM**, and **Ayurvedic** philosophy lenses using the paradigm selector. Each philosophy generates a fundamentally different clinical interpretation of the same patient data.

### 3D Anatomy Deep Dive
Click multiple anatomical regions to build a composite clinical picture. Each selected region adds its associated symptoms and conditions to the active analysis context.

### Create a New Patient
Use the **"New Patient"** button to create a custom patient profile from scratch. Enter demographics, conditions, and goals — then generate a care plan specific to your new case.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| 3D model doesn't load | Ensure hardware acceleration is enabled in your browser settings |
| Care plan generation hangs | Check your internet connection — Gemini requires active connectivity |
| Voice microphone not working | Grant microphone permissions when prompted by the browser |
| Report appears empty | In demo mode, a pre-generated report is served; ensure you've selected a patient first |

---

## Glossary

| Term | Definition |
|---|---|
| **KSS** | Karolinska Sleepiness Scale — a 1–9 self-report instrument measuring subjective sleepiness |
| **FHIR R4** | Fast Healthcare Interoperability Resources Release 4 — the HL7 standard for exchanging healthcare data |
| **TCM** | Traditional Chinese Medicine — a system of medicine using tongue/pulse diagnosis and pattern differentiation |
| **Prakriti/Vikriti** | Ayurvedic constitutional assessment (prakriti = baseline, vikriti = current imbalance) |
| **SSE** | Server-Sent Events — a one-way streaming protocol used for real-time AI response delivery |
| **PHI** | Protected Health Information — individually identifiable health data governed by HIPAA |
| **CDS** | Clinical Decision Support — AI-assisted guidance for clinical decision-making |

---

*This tutorial is part of the PocketGull Diátaxis documentation framework. For operational procedures, see the [Runbook](docs/runbook.md). For architectural rationale, see [DESIGN.md](DESIGN.md).*
