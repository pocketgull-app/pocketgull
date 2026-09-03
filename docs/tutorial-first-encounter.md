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
6. Challenged diagnostic assumptions with the Bedside Anti-Confirmation Bias Drawer
7. Selected the Rice Paper Washi Theme for glare-free astigmatism ergonomics
8. Exported a compliant HL7 FHIR R4 record with FDA 21 CFR Part 11 Provenance

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

## Step 6: Challenge Diagnostic Assumptions (Anti-Confirmation Bias Drawer)

Before sealing any care plan or committing to an encounter diagnosis, PocketGull mandates a Popperian disconfirmation check to prevent premature cognitive anchoring.

### Open the Socratic Falsification Drawer
1. Scroll down to the **Skeptical Epistemology & Grounded Assertion** drawer (or tap the **"Challenge Hypothesis"** accordion).
2. Review the empirical $H_0$ rejection score ($p$-value). When $p \ge 0.05$, the system cautions that presentation features do not statistically deviate from population baseline variance.
3. Review the **3 Orthogonal Counter-Hypotheses** formulated to challenge the primary working diagnosis.
4. Verify the **Bedside Disconfirming Physical Exams**. Check off each test performed to affirmatively rule out differential conditions before locking the clinical assertion.

---

## Step 7: Select Visual Ergonomics (Rice Paper Washi Theme)

Exam rooms and hospital wards frequently feature bright ambient lighting where high-contrast OLED dark modes can produce optical halation and ocular fatigue for clinicians with astigmatism.

### Switch to the Washi Theme
1. Tap the **Theme Toggle** in the top navigation bar.
2. Select **"Rice Paper Washi"**.
3. Notice the warm ivory paper substrate (`#FAF8F0`), deep zinc typography (`#18181B`), and calming gear-teal accents (`#0D9488`). This custom palette delivers a $>12:1$ contrast ratio, easily surpassing the WCAG AAA $7:1$ threshold without glare.

---

## Step 8: Export the Care Plan with Part 11 Provenance

Once you've reviewed the care plan and completed the epistemic challenge, you can export it in multiple interoperable formats.

### Export Options

Open the **Export** panel (printer icon or "Finalize & Archive" button) and choose from:

| Format | Use Case |
|---|---|
| **FHIR R4 Bundle** | Full machine-readable interoperability bundle including `Condition` with `StructureDefinition/grounded-clinical-assertion` extensions and FDA 21 CFR Part 11 `Provenance` digital signature seals |
| **PDF** | Printable clinical summary with QR code for digital verification |
| **Print Preview** | Formatted A4/Letter layout with letterhead, 3-Act narrative trajectory, and clinical styling |

The exported document includes:
- Patient demographics (HIPAA Safe Harbor de-identified)
- All 5 lens analyses and evidence citations
- The grounded epistemic assertion, counter-hypotheses, and physical exam checklist
- Clinician signature block and SHA-256 digital attestation seal
- QR code linking back to the digital record

All exported content is sanitized through DOMPurify before rendering, ensuring HIPAA-compatible privacy compliance.

---

## What's Next?

You've completed your first patient encounter. Here are some directions to explore:

### Hands-Free Bedside Voice Challenge
While wearing sterile gloves or examining a patient, tap the mic and say:
- *"challenge hypothesis"*
- *"what disconfirms [diagnosis]"*
- *"differential check"*
- *"socratic challenge"*

The AI assistant will orally present the counter-hypotheses and display the disconfirming exam checklist on-screen without requiring touch input.

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
| Text glare or blurring | Switch to the Rice Paper Washi theme in the top header for astigmatism-friendly optical contrast |

---

## Glossary

| Term | Definition |
|---|---|
| **CDS** | Clinical Decision Support — AI-assisted guidance for clinical decision-making |
| **FDA 21 CFR Part 11** | Federal regulation establishing criteria for trustworthy, reliable electronic records and electronic signatures, requiring immutable cryptographic provenance seals |
| **FHIR R4** | Fast Healthcare Interoperability Resources Release 4 — the HL7 standard for exchanging healthcare data |
| **KSS** | Karolinska Sleepiness Scale — a 1–9 self-report instrument measuring subjective sleepiness |
| **PHI** | Protected Health Information — individually identifiable health data governed by HIPAA |
| **Popperian Falsification** | Scientific standard requiring that a diagnostic hypothesis be actively subjected to counter-hypotheses and disconfirming physical tests rather than merely seeking confirmatory evidence |
| **Prakriti/Vikriti** | Ayurvedic constitutional assessment (prakriti = baseline, vikriti = current imbalance) |
| **SSE** | Server-Sent Events — a one-way streaming protocol used for real-time AI response delivery |
| **TCM** | Traditional Chinese Medicine — a system of medicine using tongue/pulse diagnosis and pattern differentiation |
| **Washi Theme** | High-contrast ivory-and-zinc clinical light palette engineered to eliminate optical halation for astigmatic eyes while maintaining WCAG AAA contrast |

---

*This tutorial is part of the PocketGull Diátaxis documentation framework. For operational procedures, see the [Runbook](docs/runbook.md). For architectural rationale, see [DESIGN.md](DESIGN.md) and [EPISTEMIC_FALSIFICATION_SUITE.md](docs/EPISTEMIC_FALSIFICATION_SUITE.md).*
