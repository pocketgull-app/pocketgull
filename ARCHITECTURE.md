# System Architecture & Technical Specifications

**Pocket-Gull (Understory Clinical AI System)**  
*Institutional Clinical Decision Support, Edge Multimodal Inference & FHIR R4 Interoperability*  
*A Peer-Reviewed Testbed Bridging Systems Engineering, Cryptography, Biomedical IoMT & Planetary Health*

---

## Table of Contents
1. [Architectural Overview & Fast-Loop / Slow-Loop Symbiosis](#1-architectural-overview)
2. [Pillar 1: Cryptographic Engineering, Zero-Trust & Systems Security](#pillar-1-cryptography)
3. [Pillar 2: Biomedical Engineering, IoMT & Sensory Hardware](#pillar-2-biomedical-iomt)
4. [Pillar 3: Data Science, Mathematical Statistics & Medical AI](#pillar-3-data-science)
5. [Pillar 4: Computer Systems & Software Engineering](#pillar-4-software-engineering)
6. [Pillar 5: Clinical Pharmacology, Posology & Tri-Paradigm Consilience](#pillar-5-clinical-pharmacology)
7. [Pillar 6: Statutory Governance, Sovereignty & Regulatory Affairs](#pillar-6-international-law)
8. [Pillar 7: Human-Computer Interaction, Ergonomics & Design Systems](#pillar-7-hci-ergonomics)
9. [Pillar 8: Carbon-Aware GreenOps & Cloud FinOps](#pillar-8-greenops-finops)
10. [Trust Boundaries & Data Flow Invariants](#10-trust-boundaries--data-flow-invariants)

---

## 🏗️ 1. Architectural Overview

Pocket Gull is engineered around an asymmetric **Fast-Loop (On-Device Edge) / Slow-Loop (Cloud Hyperscaler)** symbiotic architecture designed to balance real-time responsiveness, strict patient sovereignty, and deep longitudinal analytics:

* **The Fast Loop (Local Workstation / Mobile NPU, 0–45ms)**: Real-time telemetry, 0.1 Hz vagal pacing visualizers, 3D WebGL biophysics, and voice interaction execute 100% on the clinician's workstation or patient's phone with zero cloud network egress.
* **The Slow Loop (Enterprise Cloud / Hyperscaler)**: Longitudinal population epidemiology, complex genomic variant re-annotation, and federated model retraining scale into cloud infrastructures.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FAST-LOOP / SLOW-LOOP COLLABORATION                  │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ FAST-LOOP EDGE (0–45ms, $0 Egress, HIPAA Sovereign)                 │
│     • Chrome Built-in AI (Prompt API / Gemma 4 Dev Trial)              │
│     • Windows Copilot+ DirectML / ONNX Runtime Web                     │
│     • Three.js Procedural Anatomy & Canvas Biophysical Radars          │
│     • Local WASM / Web Worker Gompertz Biomarker Velocity Models       │
├────────────────────────────────────────────────────────────────────────┤
│  ☁️ SLOW-LOOP ENTERPRISE CLOUD (Longitudinal, Deep Analytics)          │
│     • Google Cloud Healthcare API & BigQuery Data Exchange             │
│     • Microsoft Azure Health Data Services & Direct FHIR Store         │
│     • Amazon HealthLake & Amazon Pharmacy RxPass $5/mo Stepping        │
└────────────────────────────────────────────────────────────────────────┘
```

```
                             ┌──────────────────────────────────────────┐
                             │       CLINICAL CLIENT (PORTABLE)         │
                             │   Angular 22 Standalone + Signals        │
                             │   • Interactive 3D Anatomy (Three.js)    │
                             │   • Web Speech API (Bidirectional)       │
                             │   • Sensory Studio & Scotopic UI         │
                             └────────────┬─────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
      ┌───────────────────────────┐               ┌───────────────────────────┐
      │   OFFLINE LOCAL EDGE AI   │               │    HYBRID BACKEND / SSR   │
      │  Chrome Prompt API (Nano) │               │  Node 24 + Express + SSR  │
      │  WebLLM / WebGPU / ONNX   │               │  WebSocket Streaming Proxy│
      │  Zero-Egress Processing   │               │  DOMPurify Sanitization   │
      └───────────────────────────┘               └─────────────┬─────────────┘
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              │                                   │
                                              ▼                                   ▼
                                ┌───────────────────────────┐       ┌───────────────────────────┐
                                │   PYTHON ML SIDECAR       │       │    UPSTREAM CLOUD AI      │
                                │  FastAPI (Port 8000)      │       │  Google Gemini 2.5 / Flash│
                                │  Asymmetric Loss Models   │       │  Genkit Multi-turn Chat   │
                                │  DICOM / FHIR Converters  │       │  Secret Manager KMS       │
                                └───────────────────────────┘       └───────────────────────────┘
```

---

<a id="pillar-1-cryptography"></a>
## 🔒 Pillar 1: Cryptographic Engineering, Zero-Trust & Systems Security (ACM SIGSAC, NIST, ISO/IEC, Mozilla)

Pocket Gull treats data protection not as an afterthought configuration, but as an intrinsic compile-time and runtime mathematical invariant.

### 1.1 Mozilla HTTP Observatory 125/100 (Grade A+) Global Security Baseline
All web entrypoints (Express, SSR, FastAPI sidecars, custom domains) maintain a verified rating of **125 / 100 on the Mozilla HTTP Observatory**, enforced by pre-flight validation (`scripts/observatory_headers_guard.mjs`):
* **Middleware #1 Invariant**: Security headers execute as the very first middleware before any route, domain dispatcher, or static asset handler, eliminating route short-circuiting.
* **Level 3 CSP Dynamic Nonces**: Production Content Security Policy enforces per-request cryptographic nonces (`'nonce-...'`), `'strict-dynamic'`, and `default-src 'none'`.
* **Zero `'unsafe-inline'` / `'unsafe-eval'`**: The production `script-src` policy strictly forbids `'unsafe-inline'`. Static asset builds compile nonces and hashes directly into HTML shells.
* **Isolation Suite (+25 Bonus Points)**:
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (+10 pts)
  * `Cross-Origin-Opener-Policy: same-origin` (+10 pts)
  * `Cross-Origin-Resource-Policy: same-origin` (+10 pts)
  * `Cross-Origin-Embedder-Policy: credentialless` (+10 pts)
  * `Referrer-Policy: strict-origin-when-cross-origin` (+5 pts)
  * `X-Frame-Options: SAMEORIGIN` (+5 pts)
  * `X-Content-Type-Options: nosniff` (0 penalty)

### 1.2 NIST SP 800-90A CSPRNG & Unbiased Mantissa Cryptography
* **Zero `Math.random()` Invariant**: The use of pseudo-random generators (`Math.random()`) in any security, authentication, transaction, clinical scoring, or randomization context is strictly prohibited across all workspaces.
* **Hardware Entropy**: All session identifiers, PKCE verifiers, OAuth states, and clinical consent tokens are derived from OS kernel hardware entropy via `globalThis.crypto.getRandomValues()` (browser) or `node:crypto.randomBytes` (server).
* **53-Bit IEEE-754 Mantissa Float Derivation**: When generating uniform floating-point values in $[0, 1)$ for stochastic clinical risk simulations or $N$-of-1 crossover trial allocation, Pocket Gull derives a 53-bit mantissa from two 32-bit cryptographically secure integers to completely eliminate modulo bias:
  $$\text{RandomFloat} = \frac{\text{high} \times 4294967296.0 + \text{low}}{9007199254740992.0}$$

### 1.3 FDA 21 CFR Part 11 Electronic Records & Non-Repudiation Seals
* All clinical data transactions, state transformations, research dividend ledger entries, and emergency overrides generate immutable, timestamped SHA-256 digital attestation seals (`computeIntegrityDigest()`, `generateCryptographicReceipt()`).
* Provides complete electronic provenance, non-repudiation, and audit traceability conforming to FDA 21 CFR Part 11 and HIPAA § 164.312(c)(1) ePHI data integrity verification.

### 1.4 Anti-Whaling & Clinical Cybersecurity Governance
* **Dual-Custody (M-of-N) Multi-Signature Protocol**: Bulk patient exports (>50 records), batch state deletions, or high-impact actions mandate dual distinct authenticated clinical/executive roles (`MandiantClinicalDefenseService.verifyDualCustodyAuthorization`). No single compromised credential can execute unilateral high-impact actions.
* **Anti-Deepfake Spoken Audio Boundary**: Spoken voice telemetry is strictly an interaction modality, **never an authentication credential**. Privileged state alterations or controlled medication edits ordered over voice enforce a step-up hardware FIDO2 / WebAuthn physical passkey challenge.
* **STAT Emergency Override Forensic Attestation**: Declaring a STAT emergency bypass never disables core safety or de-identification filters; all overrides automatically generate immutable SHA-256 forensic snapshot audit entries (`IIncidentForensicSnapshot`).
* **OWASP LLM01 Sanitization**: Clinical notes and partner payloads are stripped of non-printable zero-width Unicode characters (`\u200B`, `\u200C`) and structurally partitioned (`[CLINICAL DIRECTIVE CONTEXT]`) to prevent indirect prompt injection.
* **Shift-Left AST Taint Analysis**: Verified by `scripts/taint-analysis-guard.mjs` and `scripts/phi_taint_boundary_linter.dart`, ensuring zero un-sanitized source-to-sink flows cross network boundaries (`npm run taint:audit`).

---

<a id="pillar-2-biomedical-iomt"></a>
## 🫀 Pillar 2: Biomedical Engineering, IoMT & Sensory Hardware (IEEE EMB, IEEE P2933, IEEE PES)

### 2.1 IEEE P2933™ TIPPSS 6-Pillar Statutory Trust
All connected wearables, IoMT sensors, and bedside kiosks verify the 6 pillars of **Trust, Identity, Privacy, Protection, Safety, and Security** before biometric data ingestion:
* **Trust**: Hardware Root of Trust attestation (Titan M2, Apple Secure Enclave, ARM TrustZone).
* **Identity**: Non-spoofable cryptographic patient-to-device binding tokens.
* **Privacy**: Fine-grained micro-consents per biometric modality; zero raw waveform egress by default.
* **Protection**: Monotonic hardware counters and RSSI proximity gating ($\ge -85\text{ dBm}$) preventing wireless relay and man-in-the-middle attacks.
* **Safety**: Optical and lead detachment detection with physiological Signal Quality Index (SQI) bounds inhibiting erroneous clinical alarms.
* **Security**: FDA 21 CFR Part 11 compliant SHA-256 integrity digests stamped on every vital ingestion transaction.

### 2.2 Circular Hardware Lifecycle & Anti-Data Landfill (IEEE PES)
* **Web Battery API Intelligent Cycling**: Bedside clinical tablets and continuous exam-room displays monitor battery status via the Web Battery API. The system provides active 20%–80% cycling guidance to prevent lithium-ion pouch cells from continuous-charge swelling, extending device lifespan by **+3.0 to +6.5 years**.
* **Edge Waveform Decimation**: High-frequency biosignals (100–500 Hz ECG/PPG) are buffered and processed locally at the edge. The system extracts Mayer wave spectral power ($0.1\text{ Hz}$ autonomic resonance) and Pan-Tompkins QRS intervals, decimating raw data to eliminate **99.5% of telemetry egress**.

---

<a id="pillar-3-data-science"></a>
## 📊 Pillar 3: Data Science, Mathematical Statistics & Medical AI (JMLR, IEEE TMI, NeurIPS)

### 3.1 Causal Inference & Conformal Prediction Guarantees
* **Doubly Robust AIPW Estimator**: Implemented in `pocketgull_api/causal_inference.py`, combining propensity score weighting with outcome regression to yield unbiased counterfactual treatment effect estimates even if one of the models is misspecified.
* **Mondrian Inductive Conformal Prediction**: Replaces arbitrary softmax neural probabilities with mathematically rigorous prediction sets guaranteeing **95% finite-sample marginal coverage** across demographic and clinical strata.
* **Mahalanobis Epistemic OOD Detector**: Measures covariance-scaled distance in latent activation manifolds to flag anomalous patient vectors that deviate from validated training distributions.

### 3.2 Continuous-Time Trajectories & Differential Equations
* **Neural ODEs & Runge-Kutta 4th-Order Integration**: Evaluates biomarker velocity ($\frac{d[\text{Biomarker}]}{dt}$) over continuous non-uniform time grids, modeling organ decline and recovery curves (Gompertz-Makeham resilience) rather than discrete point estimates.

### 3.3 Medical Imaging Rigor (RSNA / DINOv2 / ConvNeXt)
* **Leak-Free Partitioning**: Enforces strict `GroupKFold(n_splits=5)` grouped by `patient_id`, preventing multi-series patient leakage between training and validation splits.
* **Asymmetric Loss (ASL)**: Uses $\gamma_- = 4.0, \gamma_+ = 1.0, \text{clip} = 0.05$ to prevent negative gradients from swamping sparse positive radiological findings.
* **Nelder-Mead Threshold Calibration**: Multi-dimensional simplex optimization tuning target-specific decision cutoffs on Out-of-Fold predictions rather than relying on default $0.50$ thresholds.

### 3.4 Chrome Built-in AI & Gemma 4 On-Device Architecture
* Documented in [`docs/GEMMA4_EDGE_ARCHITECTURE.md`](docs/GEMMA4_EDGE_ARCHITECTURE.md), leveraging Chrome Prompt API (`window.ai`), Proofreader, and Acuity Classifier.
* **Zero-Latency Vector RAG**: Computes 256-dimensional semantic vector embeddings via `window.ai.semanticEmbedder` with normalized cosine similarity and a deterministic $n$-gram hash projection fallback for non-flagged production environments.

---

<a id="pillar-4-software-engineering"></a>
## 💻 Pillar 4: Computer Systems & Software Engineering (ACM SIGSOFT, SIGPLAN, Google SWE)

### 4.1 Angular 22 Zoneless Reactive Graph & Signals
* Complete elimination of `zone.js` dirty-checking overhead in favor of fine-grained **Angular Signals** (`signal`, `computed`, `effect`).
* UI updates propagate along a directed acyclic graph (DAG) of explicit dependencies, providing deterministic rendering cycles and zero accidental layout re-evaluations.

### 4.2 "Tell, Don't Ask" Domain Encapsulation (Clinical Safety Mechanism)
* **Prohibition of Bolting External Logic on Getters**: Pocket Gull strictly forbids extracting raw internal state via getters to assemble business rules or state mutations on the caller side.
* **Clinical Safety Invariant**: In medical software, leaking raw state leads to fragmented business rules, un-validated dosage overrides, and inconsistent telemetry updates across components. Keeping mutations encapsulated within owning domain services ensures that all validation invariants (ISMP limits, pediatric BSA caps, renal clearances) execute atomically.

### 4.3 Cross-Language Monorepo Contract Parity
* Automated AST schema validation across **TypeScript (Web/SSR) ↔ Dart/Flutter (Mobile) ↔ Python (FastAPI ML)**.
* Continuous schema parity enforced via `scripts/tippss_schema_parity.dart` (`npm run tippss:audit`), guaranteeing zero field, type, or unit drift across polyglot microservices.
* **Poka-Yoke (Shingo Mistake-Proofing) Compile-Time Guards**: Enforced by `scripts/poka_yoke_type_guard.mjs`, preventing accidental unit conversion errors (`mmHg`, `eGFR`, `CPIC alleles`) at compile time.

---

<a id="pillar-5-clinical-pharmacology"></a>
## 💊 Pillar 5: Clinical Pharmacology, Posology & Tri-Paradigm Consilience (ISMP, FDA, WHO, CPIC)

### 5.1 Three Acts Clinical Reality Standard
All condition guides, care plans, and clinical CDS engines strictly demarcate peer-reviewed neurobiology from conceptual in silico models across three distinct operational phases:
* **Act I: Auxiliary Metabolic Bridge & Baseline Screening (Days 0–30)**: Acute symptomatic stabilization, mitochondrial metabolic bridging, and foundational lab baseline capture.
* **Act II: Sleep Architecture, Glymphatic Protection & Autonomic Pacing (Weeks 2–12)**: Sleep staging, glymphatic clearance optimization, and 0.1 Hz vagal autonomic pacing.
* **Act III: Multi-Modal Stepped-Care Partnership & Long-Term Resilience (Months 6 to Decades)**: Longitudinal polypharmacy de-prescribing, epigenetic lifestyle sovereignty, and sustained resilience.

### 5.2 ISMP / FDA High-Alert Medication Safety & Typography
* **Prohibition of Error-Prone Decimals**: Strict enforcement against trailing zeros (`5.0 mg` $\rightarrow$ `5 mg`) and naked decimals (`.5 mg` $\rightarrow$ `0.5 mg`) to eliminate 10-fold medication dosing errors.
* **OpenType Character Disambiguation**: Custom clinical font cuts enforce slashed zero (`cv08`), curved lowercase `l` (`cv05`), and serifed capital `I` (`ss02`).

### 5.3 Teledentistry & Oral-Systemic Link (SIBI)
* Vectorized FDI 32-tooth odontogram surface mapping, Smith & Knight Tooth Wear Index (TWI Grades 0–4), and Periodontal Probing Depth ($\text{PPD} \ge 4\text{ mm}$).
* Evaluates cross-talk to cardiovascular events and glycemic control through the **Systemic Inflammatory Burden Index (SIBI)**.

### 5.4 Transparent Pharmacy Pricing Benchmarks
* Standard Retail Benchmark presented alongside transparent $4–$10 generic pricing benchmarks at Walmart, Kroger, Walgreens, and Amazon Pharmacy ($5/mo RxPass).

---

<a id="pillar-6-international-law"></a>
## ⚖️ Pillar 6: Statutory Governance, Sovereignty & Regulatory Affairs (Five Eyes, Microsoft MSA, FTC)

### 6.1 Five Eyes (FVEY) Regulatory & Data Sovereignty Architecture
All clinical state exports, consent flows, and emergency vectors support native statutory profiles:
* **United States**: HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FHIR US Core R4, 988 Suicide & Crisis Lifeline.
* **United Kingdom**: NHS DTAC, DSPT, UK-GDPR, NICE ESF, FHIR UK Core, NHS 111 Dispatch.
* **Canada**: PIPEDA, Ontario PHIPA, Alberta HIA, FHIR CA Baseline, 988 Suicide Crisis Helpline.
* **Australia**: Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD, FHIR AU Base, Lifeline 13 11 14.
* **New Zealand**: Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064, FHIR NZ Base, 1737 Need to Talk.

### 6.2 Microsoft Services Agreement (MSA) AI Governance (Sec 14.s / 14.i)
Enforced by `scripts/msa_governance_guard.mjs`:
* **Prohibition of Emotion Inferencing (Sec 14.s.ix.6)**: Audio pitch and video frames are treated strictly as communication channels; code and models never attempt to infer emotion or protected demographic profiles.
* **Zero Base Model Distillation (Sec 14.s.iv)**: AI outputs and responses are never used to train or fine-tune competing foundational models.
* **Mandatory Clinician Review (Sec 14.s.ix.1)**: Autonomous un-gated decision-making is forbidden; all high-impact CDS recommendations require affirmative human-in-the-loop review.

### 6.3 Federal Health Portal & Veterans Disability Adjudication
* Documented in [`docs/FEDERAL_DESIGN_SYSTEM_DEMARCATION.md`](docs/FEDERAL_DESIGN_SYSTEM_DEMARCATION.md).
* Objective 38 CFR § 4.87 DBQ & Medical Nexus Statement Generator (*"at least as likely as not [$\ge 50\%$ probability]"*) for combat blast overpressure tinnitus/hearing loss, with 18 U.S.C. § 701 Safe Harbor demarcation.

---

<a id="pillar-7-hci-ergonomics"></a>
## 👁️ Pillar 7: Human-Computer Interaction, Ergonomics & Design Systems (ACM SIGCHI, USWDS, AIGA)

### 7.1 Optotypic Legibility (LogMAR 0.0 / Snellen 20/20)
* All critical clinical telemetry is calibrated to resolve at a **5-arcminute visual angle with 1-arcminute stroke details** at standard 50–70 cm clinical viewing distances.
* Minimum **7:1 contrast ratio** against dark obsidian surfaces (`#09090b`), exceeding WCAG AAA standards.

### 7.2 Institutional Thin-Client Cross-Form Factor Parity
* Verified zero-horizontal-blowout rendering across:
  * Citrix COW workstations (1280x1024, 5:4 aspect ratio)
  * School/library Chromebook kiosks (1366x768)
  * Exam-room swivel mounts (810x1080)
  * Mobile devices (iPhone Safari WebKit & Android Chrome)
* **Defensive Permission Fallback**: When audio/video hardware is blocked by institutional group policy, the UI transitions gracefully to keyboard and visual telemetry without unhandled errors.

### 7.3 Typography Discipline & Marker Font Quarantine
* **Universal Clinical Legibility**: Clinical UI, lab tables, and HUDs exclusively use high-legibility clinical typography stacks (`PocketGull-Sign-VF`, `Inter`, `Mono`).
* **Exclusive Brand Boundary**: The custom handwritten marker font is strictly quarantined to the official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer imprints**.

### 7.4 Rachel Nabors Ethical Clinical Motion
* 0.1 Hz vagal autonomic pacing synchronizers, origami spatial continuity across state transitions, anti-dark-pattern layouts, and full compliance with `prefers-reduced-motion`.

---

<a id="pillar-8-greenops-finops"></a>
## 🌿 Pillar 8: Carbon-Aware GreenOps & Cloud FinOps (CNCF Green, Cloud Run, Google Cloud CDN)

### 8.1 Zero-TTF Container Invariant & Asset Offloading
* Desktop TTF font binaries (~121 MB) are strictly excluded from web container images via `.gcloudignore` and `.dockerignore`.
* Web fonts are offloaded to `https://font.pocketgull.app` (backed by a Google Cloud Storage origin on Google Cloud CDN with Anycast edge caching) with minimal local WOFF2 fallbacks (~4 MB), reducing container deployment sizes by **>96%**.
* **Zero Inter-Cloud Egress**: Utilizing Google Cloud CDN with a GCS backend (`gs://font.pocketgull.app`) ensures all cache fills traverse Google's internal private fiber backbone (B4) without incurring external third-party egress fees.

### 8.2 Scale-to-Zero FinOps & 7-Day Auto-Pruning
* Container builds in Cloud Build utilize `--cache-from` referencing `:latest` images to warm Docker layer caches and eliminate redundant npm installs.
* All Cloud Run microservices run with `minScale: 0`, scaling to zero when idle for an average baseline cost of **~$0.20/month**.
* Artifact Registry repositories and GCS source build buckets enforce a **7-day auto-deletion policy** (`olderThan: "604800s"`, `keepCount: 3`).

---

<a id="10-trust-boundaries--data-flow-invariants"></a>
## 🔒 10. Trust Boundaries & Data Flow Invariants

| Invariant | Implementation Mechanism | Statutory / Standard Reference |
| :--- | :--- | :--- |
| **Zero PHI Persistence** | Ephemeral in-memory state; no identifiable data persisted to disk or external databases. | HIPAA §164.514 Safe Harbor |
| **Input Sanitization** | DOMPurify sanitization of all rendered HTML, notes, and SVG vectors. | OWASP LLM01 / XSS Prevention |
| **Data Interoperability** | Clinical exports formatted as standard HL7 FHIR R4 Bundles. | ONC HTI-1 / HL7 FHIR R4 |
| **Hardware Entropy** | CSPRNG kernel entropy via `crypto.getRandomValues()` (never `Math.random()`). | NIST SP 800-90A |
| **Deterministic Override** | STAT red-flag emergency vectors intercept execution prior to stochastic LLM generation. | FDA 21 CFR Part 11 CDS |
| **Egress Boundaries** | Whitelisted egress domains enforced by pre-commit Sentinel Guard. | IEEE P2933 Protection |

---
<sub>© 2026 PocketGull LLC &amp; Phillip Gear · System Architecture Whitepaper · <a href="LICENSE">Apache 2.0 License</a></sub>
