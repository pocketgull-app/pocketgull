# Pocket Gull — Full Feature Catalogue

> Detailed capability reference moved out of the top-level [README](../README.md) to keep the project front door concise. Nothing here has been removed; it is the complete catalogue of modules, standards, models, and distributables.

> [!IMPORTANT]
> **Research & education modules.** Physiological signal analysis (ECG/PPG waveform classification, biosignal shaders), the Emergency Good Samaritan mode (CPR metronome, BLS guidance), and the red-flag / emergency interceptor models are **research and educational demonstrations**. They are not cleared medical devices, are not intended for time-critical clinical decisions, and must not replace emergency services (call 911 / 999 / 112 / 000 / 111 as appropriate). See the [regulatory notice](../README.md#regulatory--clinical-use-notice).

---

## 🚀 Live Demos & Open Hugging Face Ecosystem

### 🌐 4 Interactive Hugging Face Spaces
* ⚡ [**PocketGull WebGPU Zero-Egress Sovereign AI**](https://huggingface.co/spaces/philgear/pocketgull-webgpu-edge): 100% in-browser WebGPU hardware-accelerated clinical inference (HIPAA air-gapped).
* 🫀 [**PocketGull 3D WebGL Anatomy & Tri-Paradigm Triage**](https://huggingface.co/spaces/philgear/pocketgull-3d-anatomy): Three.js interactive 3D anatomy viewer with clickable organ nodes (Heart, Brain, Lungs, Liver, Spine).
* 💊 [**PocketGull ISMP Decimal Safety & CYP450 RxGuard**](https://huggingface.co/spaces/philgear/pocketgull-ismp-rxguard): Instant prescription order safety auditor detecting 10-fold decimal errors and botanical interactions.
* 🕊️ [**PocketGull Clinical Intelligence Suite**](https://huggingface.co/spaces/philgear/pocketgull-clinical-consult): Stepped-care triage acuity classifier and 3-Act Trajectory narrative generator.

### 🕊️ The Avian Navigator Tier Models
* 🕊️ [**pocketgull-compass-2b**](https://huggingface.co/philgear/pocketgull-compass-2b): NIH/WHO Stepped-Care Triage, Socratic Health Literacy, and 3-Act Trajectories.
* 🕊️ [**pocketgull-sentinel-peft**](https://huggingface.co/philgear/pocketgull-sentinel-peft): Zero-Tolerance Emergency Red-Flag Interceptor & ISMP Decimal Safety Guard.
* 🕊️ [**pocketgull-scribe-soap**](https://huggingface.co/philgear/pocketgull-scribe-soap): Zero-Egress Ambient Doctor-Patient SOAP & SBAR Encounter Encoder.
* 🕊️ [**pocketgull-tern-edge**](https://huggingface.co/philgear/pocketgull-tern-edge): Sub-45ms Ultra-Lightweight On-Device WebGPU / Mobile Edge Engine.
* 🕊️ [**pocketgull-albatross-multimodal**](https://huggingface.co/philgear/pocketgull-albatross-multimodal): High-Capacity Tri-Paradigm Diagnostic & 3D WebGL Anatomy Integrator.
* 🕊️ [**pocketgull-rxguard-pgx**](https://huggingface.co/philgear/pocketgull-rxguard-pgx): Pharmacogenomics & Botanical Supplement Interaction Screener.

### 🦙 1-Click Local Execution with Ollama
```bash
# Register all models in 1 command
powershell -ExecutionPolicy Bypass -File ollama/install_models.ps1   # Windows
bash ollama/install_models.sh                                        # macOS / Linux

# Run anywhere
ollama run pocketgull-compass-2b
```

---

## 🔬 Clinical Case Studies & Research Commons: The 3B Innovation Architecture

Pocket Gull hosts an open, peer-reviewable repository of de-identified clinical trajectories at [`https://pocketgull.com/case-studies`](https://pocketgull.com/case-studies). Rather than treating patient records as static retrospective charts, each study leverages cognitive neuroscientist David Eagleman and composer Anthony Brandt's **3B Innovation Architecture** (*Breaking, Bending, Blending*) paired with interactive Canvas biophysical radars and 1-click **HL7® FHIR® R4 Master Research Bundle** downloads:

* **🔨 Breaking**: Deconstructs monolithic chronic syndromes into their underlying cellular, inflammatory, and microvascular root causes.
* **🌀 Bending**: Alters physiological timelines, autonomic stress dynamics, and therapeutic titration curves along non-linear recovery vectors.
* **🧬 Blending**: Consiliently synthesizes Western Allopathic pharmacology, Eastern Zang-Fu organ meridians, and Ayurvedic chronobiology.

### Featured Interactive Trajectories

| Case ID & Paradigm | Clinical Domain & Archetype | 3B Cognitive Operation | Interactive Telemetry & Standards |
| :--- | :--- | :--- | :--- |
| [**Case #01: Nantucket Long COVID**](https://pocketgull.com/case-studies/nantucket-long-covid) | Microvascular Endothelitis & Dysautonomia | **Breaking** chronic fatigue into amyloid microclots; **Bending** recovery from 14 days to a 90-day arc; **Blending** anticoagulation with *Nattokinase*. | Real-time biophysical radar, LOINC microclot grading, FHIR R4 care plan. |
| [**Case #02: MS Neuro-Sanctuary**](https://pocketgull.com/case-studies/neuro-sanctuary) | Multiple Sclerosis & Neuro-Axonal Remodeling | **Breaking** demyelination into mitochondrial bioenergetics; **Bending** Uhthoff thermal thresholds; **Blending** S1P modulators with 0.1 Hz vagal pacing. | Glial-axonal survival curve, thermal tolerance sliders, S1P receptor safety. |
| [**Case #03: Cardiometabolic Radar**](https://pocketgull.com/case-studies/cardiometabolic-radar) | Resistant Hypertension & Glycemic Dynamics | **Breaking** metabolic syndrome into glycemic phase space; **Bending** HbA1c to continuous postprandial AUC; **Blending** SGLT2i with *Berberine*. | Non-linear phase portrait attractor, nocturnal dip index, AB generic parity. |
| [**Case #05: Charles Darwin & Vagal Enigma**](https://pocketgull.com/case-studies/darwin-vagal-enigma) | Longitudinal Consilience & Historical Diagnostics | **Breaking** 40-year illness into Chagas vs. Dysautonomia; **Bending** 5-decade journal records; **Blending** Victorian water cures with modern HRV telemetry. | Baroreflex sensitivity simulation, blind diagnostic scoring, FHIR export. |

> **1-Click FHIR R4 Master Bundle**: Researchers can download the entire multi-case cohort as a standardized, HIPAA § 164.514 Safe Harbor de-identified HL7 FHIR R4 JSON bundle directly from the [Case Studies Commons Hub](https://pocketgull.com/case-studies).

---

## 🏥 Enterprise EHR Sidecar & Hyperscaler Symbiosis

### The Fast-Loop Edge to Slow-Loop Cloud Paradigm
Pocket Gull is engineered around an asymmetric **Fast-Loop (On-Device Edge) / Slow-Loop (Cloud Hyperscaler)** symbiotic architecture:
1. **The Fast Loop (Local Workstation / Mobile NPU)**: Sub-45ms real-time telemetry, 0.1 Hz vagal breathing visualizers, 3D WebGL biophysics, and voice interaction execute 100% on the clinician's workstation or patient's phone with zero cloud network egress.
2. **The Slow Loop (Enterprise Cloud / Hyperscaler)**: Longitudinal population epidemiology, complex genomic variant re-annotation, and federated model retraining scale cleanly into cloud infrastructures.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FAST-LOOP / SLOW-LOOP COLLABORATION                  │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ FAST-LOOP EDGE (0–45ms, $0 Egress, HIPAA Sovereign)                 │
│     • Chrome Built-in AI (Prompt API / Gemma 4)                        │
│     • Windows Copilot+ DirectML / ONNX Runtime Web                     │
│     • Three.js Procedural Anatomy & Canvas Biophysical Radars          │
├────────────────────────────────────────────────────────────────────────┤
│  ☁️ SLOW-LOOP ENTERPRISE CLOUD (Longitudinal, Deep Analytics)          │
│     • Google Cloud Healthcare API & BigQuery Data Exchange             │
│     • Microsoft Azure Health Data Services & Direct FHIR Store         │
│     • Amazon HealthLake & Amazon Pharmacy RxPass $5/mo Stepping        │
└────────────────────────────────────────────────────────────────────────┘
```

### The Enterprise EHR Sidecar (Epic, Oracle Cerner, MEDITECH)
Instead of attempting to replace established EHR platforms, Pocket Gull acts as an **ergonomic, zero-server-overhead sidecar**:
* **Cures Generative Note Bloat**: Replaces 1,500-word conversational text walls with clean, discrete **LOINC** and **SNOMED CT** coded observations that slip seamlessly into existing progress note templates.
* **Relieves In-Basket "Pajama Time"**: Automatically triages incoming patient messages into STAT emergency red flags vs. routine medication actions, slashing after-hours administrative burden.
* **Automates CPT 99453 / 99454 RPM Superbills**: Tallying 16+ transmission days cryptographically for Remote Patient Monitoring chronic care reimbursement.
* **Zero Hospital Server Burden**: 100% client-side WebGPU and NPU execution leaves hospital IT budgets with **$0.00** in GPU hosting overhead.

---

## Core Capabilities

### 🧠 AI & Multi-Agent Orchestration

| Capability | Implementation |
|:---|:---|
| **Multi-Agent Reasoning** | Google ADK `InMemoryRunner` with specialized `LlmAgent` experts maintaining patient context memory |
| **Dynamic Expert Routing** | Pathways-inspired MoE router activating specialized sub-networks (`gulliver-core`, `acoustic-sidecar`, `sibi-bridge`, `dicom-spatial-shader`) |
| **Voice Consult** | Full-duplex audio streaming via Web Speech API + Express WebSocket proxy with client-side barge-in cancellation |
| **Semantic Chunking & NLP** | Prosodic respiratory pacing, token boundary preservation for clinical units (`120/80 mmHg`, `CYP2D6*4`), and defensive SSE stream reassembly |
| **Evidence Grounding** | Real-time PubMed E-utilities and Google Programmable Search for literature-anchored recommendations |
| **Edge Inference** | WebGPU on-device MedGemma / PubGemma routing for offline and latency-sensitive workloads |

### 🗣️ Natural Language & Semantic Chunking Engine

Pocket-Gull enforces human-first, clinical natural language chunking across text, speech, and live streaming:

- **Prosodic & Respiratory Pacing**: Audio streaming (`AdkLiveService`) buffers high-fidelity 24kHz/16kHz PCM audio in 32KB zero-copy frames (`uint8ArrayToBase64`), with 250–400ms natural conversational pause gating and client-side barge-in cancellation for authentic physician-patient turn-taking.
- **Clinical Entity & Token Boundary Preservation**: Slicers strictly prevent mid-token fragmentation of complex pharmacogenomic alleles (`CYP2C19*17`), blood pressure vitals (`138/88 mmHg`), lab values (`eGFR 42 mL/min/1.73m²`), and multi-word Latin botanical binomials (*Withania somnifera*).
- **Defensive SSE Stream Reassembly**: The streaming parser (`GeminiProvider`) dynamically reconstructs Server-Sent Events across packet boundaries, guaranteeing zero dropped tokens during network jitter while streaming clinical reports.
- **Adaptive Cognitive Chunking**: Automatically fragments dense medical consults into digestible, scan-friendly visual blocks (bulleted pearls, glassmorphic metric cards, and collapsible accordions) mapped to 5 health literacy personas.

### 📐 3D Spatial Anatomy

- **Procedural skeletal & organ viewer** — Three.js geometry with severity-mapped particle systems
- **Anatomical search with camera tracking** — Fuzzy search bar that smoothly interpolates WebGL camera to targeted organs
- **Raycast tooltips & data cards** — Hover for paradigm badges and pain scores; click for slider input overlays
- **Method of Loci memory palace** — Anchors clinical consult nodes to 3D spatial coordinates for visual recall

### 🔬 Specialized Clinical Decision Support (CDS) & Research Super-Suite

Integrated interactive diagnostic tools accessible via the unified **Clinical Tool Workbench**:

| Tool / Module | Clinical Domain | Core Mechanism & Methodology | Standards & Output |
|:---|:---|:---|:---|
| **🛡️ RxGuard PGx & Botanicals** | Pharmacogenomics & Safety | CPIC allele phenotyping (`CYP2D6`, `CYP2C19`, `SLCO1B1`) + Tri-Paradigm botanical interaction matrix | CPIC Level A/B, FDA Table of PGx Biomarkers |
| **📈 BioTrajectory Velocity** | Predictive Nephrology & Vitals | First-derivative rate-of-change ($\frac{d[\text{Biomarker}]}{dt}$) detecting stealth organ decay ($\Delta \ge 15\%/\text{yr}$) | Gompertz-Makeham organ resilience curves |
| **🔬 TrialFinder Matcher** | Clinical Trial Recruitment | Geocoded patient matching against active NIH ClinicalTrials.gov protocols | FHIR R4 `ResearchStudy` referral bundle |
| **💬 SMS Compass Bridge** | Health Equity & Telehealth | Natural language parser converting 8th-grade SMS text messages to clinical telemetry without app downloads | Direct FHIR R4 `Observation` serialization |
| **🎯 DxRadar Socratic Engine** | Diagnostic Decision Support | Socratic "Don't Miss" secondary cause differential radar with Bayesian nomograms ($LR^+, LR^-$) | Popperian $H_0$ ruling-out lab order sets |
| **🧪 N-of-1 Experiment Engine** | Single-Case Clinical Trials | 56-day randomized ABAB crossover trial designer with 14-day washout intervals | Bayesian posterior superiority ($P > 95\%$), Cohen's $d$ |
| **🎙️ Ambient Clinical Scribe** | Ambient Medical Scribing | Multi-modal dialogue transcription synthesizing 4-quadrant structured SOAP encounter notes | ICD-10 (`I10`), SNOMED-CT (`38341003`), FHIR `Encounter` |
| **📽️ Grand Rounds & CARE Suite** | Academic Presentation | 1-click 7-slide Grand Rounds presentation deck and CARE Guidelines-compliant Case Report Markdown | William Caslon typography, Google Docs & Word export |
| **🏛️ Historical Luminaries Arena** | Retrospective Clinical Socratic Engine | Epochs of World Leaders & Scientific Pioneers (Alexander, Caesar, Lincoln, Curie, Darwin, Ramanujan, Kahlo) | Blinded Incognito Mode, SHA-256 anti-cheat, 1-click 3D patient load |
| **🤝 SNO-10 Craft Confidant Studio** | Passion-Based Health Literacy & Lost Buddy AI | Translates SNO-10 diagnoses (SNOMED-CT / ICD-10) into craft dialects (Mechanic, Woodworker, Arborist, Sailor, Musician) with custom memorial companion creation | Dual SNO-10 coding, workshop ergonomics, empathetic memory AI |
| **❤️ Couples Vitality & Cardiac Safety** | Cardiovascular Safety & Intimacy Medicine | Princeton Consensus III MET capacity risk stratification, Nitrate-PDE5 contraindication checks, and adaptive ergonomics for joint/stroke recovery | Princeton III / AHA guidelines, Spoon Theory energy budgeting |
| **🧭 Role & Pathway Docs Hub** | Role-Adaptive Clinical Guidance | 5 dynamic learning pathways (Clinician, Resident, Researcher, Executive, Patient) with 1-click tool actions | Role-tailored CDS workflows and compliance guides |
| **💳 Commercial Monetization Hub** | Practice Growth & Licensing | Turnkey 60-second clinic onboarding wizard, Stripe checkout tiers ($299/mo pilot, $3,500 sprint, $1,200/yr academic), and BAA kit | HIPAA BAA, Stripe Billing, CDISC SDTM |
| **✨ 5-Persona Clinical Simulator** | Role-Adaptive Walkthrough | Instant 1-click sandbox testing as Attending Physician, Triage Nurse, Patient/Family, Bioinformatician, or Hospital Executive | Role-based clinical workflow specialization |
| **🧭 3-Act Trajectory Compass** | Prognostic Longitudinal Care | Temporal narrative mapping (Where You've Been, Where You Stand, Where You're Going) + RSVP retinal fixation speed-reader | 45-second high-density Bionic reading notes |
| **📋 Ambulatory Scribe & Review Drawer** | Clinical Documentation History | Real-time encounter transcript viewer with structured SOAP and SBAR differential staging | 1-click Epic/Cerner clipboard export |
| **⚡ 7-Pillar SOTA ML & Causal Engine** | Causal Inference & Biosignals | Doubly Robust AIPW counterfactuals (`causal_inference.py`), 100–500 Hz Pan-Tompkins QRS/PPG DSP, Neural ODEs, Mahalanobis Epistemic OOD Detector, and Mondrian Inductive Conformal Prediction | 95% finite-sample coverage guarantee, Mayer wave spectral power ($0.1\text{ Hz}$) |
| **⚖️ Lifespan Posology Suite** | Pediatric, Elder & Maternal Dosing | Mosteller BSA ($BSA = \sqrt{\frac{W \times H}{3600}}$), Clark's/Fried's/Young's rules, Cockcroft-Gault $CrCl$, AGS Beers Criteria 2023 anticholinergic burden, and LactMed RID $< 10\%$ | Section 508 accessible posology calculator |
| **🏛️ USWDS 3.0 Federal Health Portal** | Veteran Care & Disability Adjudication | Objective 38 CFR § 4.87 DBQ & Medical Nexus Statement Generator (*"at least as likely as not [$\ge 50\%$ probability]"*) for combat blast overpressure tinnitus/hearing loss | VA Community Care Network (CCN), 18 U.S.C. § 701 Safe Harbor demarcation |
| **🛠️ WebMCP Clinical Agent Tool Catalog** | Agentic EHR Interoperability | Standardized Model-Context Protocol OpenAPI schemas exposing FHIR R4 observations, condition coding, and trajectory queries to local LLMs | Bidirectional agentic tooling (`WebMcpToolCatalogService`) |
| **💓 Active Pivot & Pulse Synthesizer** | Cybernetic Vital Telemetry | Real-time cybernetic vital sign feedback loops evaluating living telemetry against clinical pivot thresholds | Live overview telemetry card (`ActivePivotMonitorCardComponent`) |

### 🩺 Multi-Paradigm Clinical Lenses

| Lens | Focus |
|:---|:---|
| **🩺 Western Allopathic** | ICD-10/SNOMED coding, CMP panels (Troponin, ALT/AST, eGFR), lab workups, monitoring protocols |
| **🌿 Eastern TCM** | Zang-Fu Qi patterns, Ba Gang classification, tongue/pulse matrix, Jing-Luo meridian mapping |
| **🧘 Ayurvedic** | Tridosha balance (Vata/Pitta/Kapha), Agni metabolic fire types, Sushumna chakra visualization |
| **🧪 Orthomolecular** | Biochemical marker extraction (Mg, D3, B12, Zn) into glassmorphic nutrient matrix |

### 📋 10 Standardized Assessment Instruments

Built-in validated clinical instruments integrated directly into patient state:

| Instrument | Standard | Range | Purpose |
|:---|:---|:---:|:---|
| PHQ-9 | LOINC `44261-6` | 0–27 | Depression severity |
| GAD-7 | LOINC `69725-0` | 0–21 | Generalized anxiety |
| ISI | LOINC `86095-7` | 0–28 | Insomnia severity |
| C-SSRS | LOINC `84411-8` | 0–16 | Suicide risk screening with 988 Lifeline routing |
| ROS-14 | LOINC `69742-5` | 14 systems | Comprehensive review of systems |
| PHQ-15 | LOINC `81675-1` | 0–30 | Somatic symptom scale |
| PRAPARE | LOINC `93304-4` | 5 vectors | Social determinants of health (SDOH) |
| Ayurveda | — | 6 vectors | Tridosha inventory |
| TCM Shi Wen | — | 6 vectors | Ba Gang Qi/Yin/Yang patterns |
| GROW_THYSELF | — | 0–10 | Life sovereignty & epigenetic vitality |

### 🦅 6 Multi-Agent Gull Squadron Personas

Specialized Google ADK agents maintaining real-time patient state context:

1. **🔭 Gulliver (Overview & Synthesis)** — Holistic care plan strategy, multi-organ crosswalks, and timeline synthesis.
2. **⚡ Swoop (Interventions & Precision Dosing)** — Targeted pharmacogenomic dosing, CPIC guidelines, and drug-botanical safety.
3. **🔦 Sentinel (Recovery Vigilance & Trends)** — Continuous biomarker monitoring, Gompertz velocity tracking, and early warning signs.
4. **📖 Scribes (Patient Translation & Education)** — Plain-language medical translation, health literacy bridging, and compassionate analogies.
5. **⚡ Skimmer (Flash AI Inference Backbone)** — Sub-second edge triage, instant query routing, and real-time streaming.
6. **🚨 Samaritan (Emergency Override)** — Offline BLS field guidance, 110 BPM CPR metronome, and first-responder EMT QR handoffs.

### 🧭 5 Role-Adaptive Clinical & Stakeholder Pathways

Dynamically reconfigures documentation, toolbars, and workflows for each user role:

- **🩺 Attending Physician / Clinician** — High-efficiency CDS, 4-quadrant SOAP scribe, PGx RxGuard, and ICD-10 coding.
- **🏥 Resident / Fellow** — Board exam differential radar, Socratic teaching pearls, and academic season tiering.
- **🔬 Clinical Researcher** — $N$-of-1 crossover trial designer, NIH TrialFinder matcher, and FHIR `ResearchStudy` export.
- **🏛️ Hospital Executive / Health System Leader** — QOF/HEDIS quality metrics, DiGA/FSE compliance, and privacy ROI.
- **🧑‍🤝‍🧑 Empowered Patient / Caregiver** — Plain-language translation, SMS Compass health bridge, and life sovereignty goals.

### 📖 4 Adaptive Reading & Accessibility Modes

- **Classic Literary** — Clean Caslon typography with optimal baseline grid leading.
- **Bionic Speed Reading** — Fixation point bolding for rapid optical scanning.
- **Dyslexic Accessible** — Specialized OpenDyslexic typeface with weighted bottom gravity.
- **Audiobook Narrator** — Web Speech API bi-directional voice narration.

### 🚨 Emergency Good Samaritan Mode

Offline override mode for emergency field care:

- **110 BPM chest-compression metronome** with BLS safety-gated AI
- **FHIR-compliant EMT QR code** serialization for first responder handoff
- **Geo-Sentinel outbreak viewpoint deck** — WHO, PAHO, and CDC surveillance modes
- **Global telemetry suppression** — all network calls disabled for offline triage

### 🎨 Dieter Rams Design System

Adheres to *Weniger, aber besser* (less, but better) with WCAG 2.1 AA/AAA accessibility:

- **13+ curated themes** — Rice Paper Washi, Raw Hemp, Carrara Marble, Dark Obsidian, Madame Curie Lab
- **4-level progressive disclosure** — idle view → drill-down drawer → prescription state cycling → context menu
- **Rams Functionalist telemetry grid** — monospace instrument panel headers with high-contrast metric readouts
- **44px+ touch targets** — Fitts's Law compliant across all interactive elements

### 🔋 Edge-First Green Computing & Device Longevity Philosophy

> *"Heavy DRM or server polling burns mobile battery and turns phones into pocket hand-warmers. Our lightweight mathematical verification consumes less energy than a single screen refresh, preserving all-day battery life for long hospital shifts."*

- **Sub-Microsecond Cryptographic Verification**: Local SHA-256 salted hashing consumes $\approx 3\ \mu\text{J}$ (15,000x less power than waking a 5G/cellular modem for a remote API request), with zero flash memory wear ($0.000\text{ bytes written}$) and zero thermal degradation.
- **Blinded Incognito Diagnostic Arena**: Socratic active recall mystery cases for world leaders and scientific pioneers (Alexander, Caesar, Lincoln, Curie, Darwin, Ramanujan, Kahlo) with zero search-engine spoilers and 100% offline capability.
- **Client-Side WASM & Web Workers**: All Gompertz biomarker velocity models, Cohen's $d$ effect sizes, and Bayesian differentials execute purely on device, ensuring total patient privacy and uninterrupted reliability in hospital dead zones.

---

## 🏛️ Academic Research & Standards Alignment

Pocket Gull is architected as an empirical, peer-reviewed clinical intelligence testbed bridging engineering, computing, design, and health equity:

| Domain & Society | Standard / Framework | Implementation in Pocket Gull |
| :--- | :--- | :--- |
| **IEEE Biomedical Engineering** | IEEE 11073-10101, IEEE 2621, IEEE P7003 | • 1D Dilated CNN ECG/PPG Waveform Arrhythmia Classifier (`pocketgull_api/waveform_1d_cnn.py`)<br>• Real-time WebGPU Biosignal Shaders (`src/services/webgpu-bio-signal.service.ts`)<br>• Biometric Sensor Fusion & CGM Time-in-Range ($70-180\text{ mg/dL}$) Telemetry |
| **ACM Computing & Ethics** | ACM Code of Ethics §1.2 & §1.4, ACM HEALTH | • AST Global Taint-Tracking Engine (`scripts/taint-analysis-guard.mjs`)<br>• Stanford HCI Calibrated Confidence HUD (`src/components/ai-confidence-hud.component.ts`)<br>• Socratic "Don't Miss" Differential Radar with Bayesian Nomograms ($LR^+, LR^-$) |
| **AIGA Design & Typography** | Evidence-Based Clinical Communication | • Bionic Reading Saccadic Fixation (`src/components/shared/bionic-focus-benchmark.component.ts`)<br>• Custom *PocketGull Marker* & Caslon Medical Typography<br>• 3D Longitudinal Trajectory Comparison Slider (WebGL Three.js) |
| **ASU & NIH/NSF Translational** | NIH CTSA, NSF SBIR, SDOH Equity | • Automated SBIR Phase I Grant Binder Generator (`npm run grants:sbir`)<br>• PRAPARE SDOH & Population Health Equity Engine (`src/services/population-health-equity.service.ts`)<br>• Tribal Health Sovereignty & Cryptographically Sealed Patient Consent Logs |

---

## FHIR R4 Compliance

All patient data serialized across API boundaries conforms to the **FHIR R4 Bundle** standard:

- 1-click FHIR R4 Bundle export (JSON)
- PDF care plan generation (jsPDF)
- Epic MyChart patient brief export portal
- SMART on FHIR OAuth 2.0 identity bridge
- CMS CPT 99453/99454/99457 RPM billing export

---

## Monorepo Workspaces

| Workspace | Language | Purpose |
| :--- | :--- | :--- |
| `pocketgull` (root) | TypeScript | Angular 22 + Express SSR main application |
| `companion-apps/avs-therapy` | TypeScript | AVS Therapy companion app |
| `companion-apps/patient_app` | Dart/Flutter | Patient-facing mobile app |
| `companion-apps/provider_app` | Dart/Flutter | Provider-facing mobile app |
| `pocketgull_api` | Python | FastAPI ML scoring sidecar |

---

## 📦 Distributable Binaries & Downloadable Programs

Pocket-Gull provides a complete suite of production binaries, CLI tools, on-device models, browser extensions, and mobile application packages:

| Program / Artifact | Format & Type | Purpose & Compatibility | Build / Launch Command |
| :--- | :--- | :--- | :--- |
| **`gull` Clinical CLI Diagnostic Engine** | Node.js Executable (`bin: gull`) | Terminal diagnostic console with real-time ASCII EKG animation, patient directory, and FHIR export | `node scripts/gull.js [list\|show\|export]` |
| **Chrome Web Store EHR Sidepanel Extension** | Manifest V3 Zip Package (`.zip`) | Outpatient EHR browser sidepanel integrating directly with Epic, Cerner, and AthenaHealth | `node scripts/build-chrome-extension.mjs`<br>*(Outputs: `pocketgull-chrome-extension-v<version>.zip`)* |
| **Ollama Avian Navigator Models** | GGUF / Gemma 2B-12B Modelfiles | 6 local edge AI models with custom clinical system instructions and ISMP dosage guards | `powershell -ExecutionPolicy Bypass -File ollama/install_models.ps1`<br>`bash ollama/install_models.sh` |
| **Multi-Store Mobile Companion Suite** | Flutter `.aab`, `.apk`, `.ipa` | Patient & provider mobile companion apps with biometric Face ID, Play Integrity, and Fire OS support | `node scripts/build-mobile-stores.mjs`<br>*(Targets: Google Play, Amazon Appstore, Apple App Store)* |
| **On-Device ONNX Clinical Recovery Model** | FP16 ONNX Runtime (`.onnx`) | Sub-millisecond continuous recovery scoring executing on device via WebAssembly/WebGPU | `public/models/clinical_recovery_model.onnx`<br>`public/models/clinical_edge_weights.json` |
| **OpenType & WebFont Typographic Binaries** | WOFF2 / TTF Font Binaries | Clinical typography engine featuring PocketGull-Sign-VF 4-axis variable engine and ultra-fast Core subsets (15 KB) with ISMP zero-error disambiguation | `public/fonts/PocketGull-Sign-VF.woff2`<br>`public/fonts/PocketGull-Bold-Core.woff2` |
| **Production Container Image** | Docker OCI Container (`ghcr.io`) | Hermetic SSR container image signed with CNCF Sigstore Cosign keyless OIDC and SLSA Level 3 provenance | `docker pull ghcr.io/pocketgull-app/pocketgull:v<version>` |
| **Institutional & Regulatory Deliverables** | CycloneDX 1.6 SBOM, GAAP CSV, BAA | Audited machine-readable software bill of materials, tribal stewardship statement, and HIPAA BAA | `npm run sbom`<br>`PocketGull_GAAP_Tribal_Stewardship_Statement.csv` |

---

## Documentation Index

| Document | Description |
| :--- | :--- |
| [Clinical Case Studies Commons](CLINICAL_CASE_STUDIES_COMMONS.md) | 3B cognitive framework, biophysical radars & FHIR R4 cohorts |
| [Enterprise EHR Sidecar](ENTERPRISE_EHR_SIDECAR.md) | Epic, Cerner & MEDITECH sidecar, 45 CFR Part 171 Safe Harbor & RPM billing |
| [Porter's Five Forces](PORTERS_FIVE_FORCES.md) | Industry structural analysis, defensible moat & competitive dynamics |
| [Architecture](SIGARCH_QUANTITATIVE_SYSTEMS_ARCHITECTURE.md) | System design, data flow & reactive state |
| [Changelog](../CHANGELOG.md) | Complete release history |
| [Clinical Paradigms](TRI_PARADIGM_SYNTHESIS_INTEGRATION.md) | Western, TCM, Ayurvedic & Orthomolecular frameworks |
| [Federal USWDS Demarcation](FEDERAL_DESIGN_SYSTEM_DEMARCATION.md) | USWDS 3.0, VA Community Care & 18 U.S.C. § 701 Safe Harbor |
| [Gemma 4 Edge Architecture](GEMMA4_EDGE_ARCHITECTURE.md) | Chrome built-in AI, Prompt API & on-device zero-egress models |
| [Design System](design/DESIGN.md) | Dieter Rams aesthetics & agent personas |
| [Privacy & HIPAA](SIGSAC_HIPAA_ZERO_TRUST_PRIVACY.md) | Safe Harbor §164.514, DOMPurify, FHIR portability |
| [Security Policy](../SECURITY.md) | Vulnerability reporting & threat model |
| [Responsible AI](../RESPONSIBLE_AI.md) | Ethical principles, HITL & safety testing |
| [Google AI Alignment](GOOGLE_RESPONSIBLE_AI_ALIGNMENT.md) | Operationalization of Google's 3 AI Principles & PAIR Guidebook |
| [Epistemic Falsification](EPISTEMIC_FALSIFICATION_SUITE.md) | Popperian $H_0$ ruling out & skeptical CDS |
| [Contributing](../CONTRIBUTING.md) | Code standards & PR guidelines |
| [API Reference](../pocketgull_api/openapi.yaml) | OpenAPI 3.0 specification |
| [Valuation & FinOps](valuation_and_positioning.md) | COCOMO II software valuation & scale-to-zero FinOps |

---

### Methodological & Scientific Lineage
Pocket Gull stands on the shoulders of foundational researchers whose peer-reviewed discoveries power our algorithms:
* **The 3B Innovation Architecture**: Brandt & Eagleman (*The Runaway Species*, 2017)
* **The Inflammatory Reflex & Vagal Anti-Inflammatory Pathway**: Tracey (*Nature*, 2002)
* **Real-Time QRS DSP**: Pan & Tompkins (*IEEE Trans. Biomed. Eng.*, 1985)
* **Deterministic Renal Clearance ($CrCl$)**: Cockcroft & Gault (*Nephron*, 1976)
* **Metric Body Surface Area ($BSA$)**: Mosteller (*N. Engl. J. Med.*, 1987)
* **The Salutogenic Model & Sense of Coherence**: Antonovsky (*Health, Stress, and Coping*, 1979)
* **Laplace Differential Privacy**: Dwork, McSherry, Nissim, & Smith (*TCC*, 2006)
* **Bayesian Natural Frequency Communication**: Gigerenzer & Hoffrage (*Psychol. Rev.*, 1995)
* **Microvascular Amyloid Fibril Pathology**: Pretorius et al. (*Cardiovasc. Diabetol.*, 2021)
* **Uhthoff's Phenomenon & Conduction Safety**: Uhthoff (*Arch. Psychiatr. Nervenkr.*, 1890)
* **Numerical Trajectory Simulation**: Runge (1895) & Kutta (1901) 4th-Order Integration
* **Structural Industry Analysis**: Porter (*Harvard Business Review*, 2008)

*For complete bibliographic records and operationalization mapping, see [Foundational Citations](CLINICAL_CASE_STUDIES_COMMONS.md#7-foundational-mathematical-biophysical--methodological-citations).*

---

