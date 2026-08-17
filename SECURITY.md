# Security Policy

At **Pocket Gull**, security and privacy are foundational, especially given the clinical context of the application. We take vulnerabilities and data handling extremely seriously.

## Supported Versions

Only the latest `main` branch and currently deployed production versions receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Pocket Gull, please do **not** disclose it publicly. Instead, use one of the following private channels:

1.  **GitHub Private Vulnerability Reporting**: [Report a vulnerability](https://github.com/pocketgull-app/pocketgull/security/advisories/new) (preferred).
2.  **Data Protection Officer (DPO)**: Send inquiries, security disclosures, or GDPR/HIPAA requests to **dpo@pocketgull.app**.

### Data Protection Officer (DPO) & Regulatory Governance
- **Designated DPO & HIPAA Privacy Lead**: Phil Gear (`dpo@pocketgull.app`)
- **Scope**: HIPAA §164.514 Safe Harbor adherence, GDPR Article 37/38 compliance, FDA 21 CFR §520(o) Non-Device CDS risk posture, and cryptographic de-identification auditing.
- **SLA**: Initial assessment and acknowledgment within 24–48 hours.

---

## Architecture & Security Best Practices

As a clinical co-pilot, Pocket Gull operates under strict security and data-handling best practices to ensure patient safety and data integrity.

### 1. Transient Data & No PHI Persistence
- **No Remote Database**: Pocket Gull does **not** persist Protected Health Information (PHI) to any centralized database.
- **Local Storage**: All patient state is stored locally within the browser (`localStorage` or IndexedDB) and is strictly constrained to the clinician's current device profile.
- **Transient Inference**: Payloads sent to the Google Gemini API or other external AI inference engines are ephemeral. We strictly rely on enterprise or opt-out tiers to ensure data is **not** used to train foundation models.

### 2. Generative AI Safeguards (Google Responsible AI)

#### Clinical CDS Safety Filter Policy

Pocket Gull is a **clinical decision-support (CDS) tool** under **FDA 21 CFR §520(o)**, where the entire subject matter is medical content — diseases, medications, drug dosages, toxicology, trauma assessment, self-harm screening (PHQ-9/C-SSRS), surgical procedures, and reproductive health. Gemini's consumer-oriented safety filters were designed to protect untrained users from harmful chatbot output; in a clinical CDS context, these same filters can **silently block** legitimate care plan text, translation, and analysis.

All Genkit flows in `src/server/genkit.ts` reference this section for their safety settings.

**Per-Category Thresholds (Text Flows)**:

| Category | Threshold | Rationale |
|---|---|---|
| `HARM_CATEGORY_HARASSMENT` | `BLOCK_ONLY_HIGH` | Rarely triggered by clinical text. Retains protection against genuinely abusive content while allowing mental health assessments discussing abuse/DV screening. |
| `HARM_CATEGORY_HATE_SPEECH` | `BLOCK_ONLY_HIGH` | Almost never relevant to clinical text. Retains baseline protection. |
| `HARM_CATEGORY_SEXUALLY_EXPLICIT` | `BLOCK_ONLY_HIGH` | Permits OB/GYN, STI screening, reproductive endocrinology, and sexual health education. See "Imaging Flows" below for stricter relaxation on multimodal inputs. |
| `HARM_CATEGORY_DANGEROUS_CONTENT` | **`OFF`** | Clinical text *routinely* discusses drug dosages, toxic exposures, overdose management, suicidal ideation screening, and weapon injuries (trauma assessment). Any threshold above `OFF` produces false-positive blocking on standard-of-care clinical plans. |

**Per-Category Thresholds (Imaging & Document OCR Flows)**:

| Category | Threshold | Rationale |
|---|---|---|
| All categories | **`OFF`** | Medical imaging (X-rays, dermatological photography, wound assessment, anatomical imaging) and clinical document OCR can trigger false positives across *all* safety categories. These flows require fully permissive settings to function. |

**Affected Flows**:
- `generateMetricsFlow` — Text policy
- `detectClinicalChangesFlow` — Text policy
- `translateReadingLevelFlow` — Text policy
- `analyzeTranslationFlow` — Text policy
- `synthesizeKnowledgeFlow` — Text policy
- `analyzeImageFlow` — Imaging policy (all `OFF`)
- `scanDocumentFlow` — Imaging policy (all `OFF`)

#### Defense-in-Depth (Why Consumer Safety Filters Are Redundant)

Pocket Gull maintains its own multi-layer safety stack that renders Gemini's consumer-grade safety filters redundant for this application context:

1. **`DefensiveGuardrailsService`** — Application-level clinical guardrails
2. **DOMPurify Sanitization** — HIPAA-grade input/output sanitization on all AI text
3. **FDA 21 CFR §520(o) CDS Transparency** — All AI output is explicitly positioned as non-diagnostic decision support requiring human clinician verification
4. **Authenticated Access** — Behind PIN/gesture auth; not a public-facing chatbot
5. **FHIR R4 Serialization** — Structured data boundaries on all clinical payloads
6. **Gödel Incompleteness Bound** — Epistemic uncertainty disclosure on every analysis
7. **Human-in-the-Loop Task Bracketing** — Manual clinician vetting before any AI suggestion can be saved or executed

- **Adversarial Testing**: The repository contains active adversarial test suites (`tests/safety.spec.ts`) to simulate prompt injection and ensure safety layers do not degrade.

### 3. Application Security (AppSec)
- **Content Security Policy (CSP)**: Strict CSP headers are configured to prevent XSS (Cross-Site Scripting) and unauthorized data exfiltration.
- **Sandboxing**: External research surfaces (such as the Google Programmable Search Frame) are executed within heavily restricted `<iframe>` sandboxes (`sandbox="allow-scripts allow-same-origin"`).
- **Dependency Auditing**: Critical dependencies (Vite, Genkit, Angular) are subject to automated vulnerability tracking. Transient vulnerabilities must be overridden explicitly via `package.json` resolutions.

### 4. Development Environment
- **Secrets Management**: API keys (e.g., `GEMINI_API_KEY`) must never be committed to version control. They are injected strictly via Google Cloud Secret Manager at runtime or via local `.env` files.
- **No Unsigned Binaries**: The build pipeline only permits verified and audited Node modules.

### 5. GitHub Code Security & Google Cloud Integration
To align with HIPAA compliance and secure clinical engineering, we integrate GitHub Advanced Security (GHAS) settings in tandem with our Google Cloud Platform (GCP) setup:
- **Keyless Authentication & Secrets**: Do not store long-lived GCP Service Account JSON keys in GitHub Secrets. We authenticate strictly using keyless **Workload Identity Federation (WIF)** in our CI/CD pipelines. Application secrets (such as the `GEMINI_API_KEY`) are stored securely in **GCP Secret Manager** and bound dynamically to Cloud Run containers at runtime.
- **Push Protection**: Enforce GitHub's *Secret Scanning Push Protection* to intercept and block commits containing leaked GCP credentials or API keys before they reach the repository.
- **Continuous Container Scanning**: Dependabot alerts are utilized for early static workspace package warnings. However, the source of truth for runtime safety is **GCP Artifact Registry Container Analysis**, which performs continuous automated CVE scanning on the compiled container layers.
- **Unified Compliance Dashboard**: For production deployments, CodeQL static analysis alerts are connected to **GCP Security Command Center (SCC)** via security source integrations, presenting a unified dashboard for infrastructure, cloud compliance, and source code health.

### 6. Anti-Surveillance Data Sovereignty Architecture
To protect patients and clinicians from invasive telemetry, dragnet background tracking, and unauthorized data harvesting, Pocket Gull strictly enforces anti-surveillance engineering principles:
- **Default to Edge Computation**: All real-time telemetry calculations, biophysical equations, and clinical symptom classifications run locally on the client device via WebAssembly (WASM), WebGPU, or client-side Web Workers (`OfflineEdgeAiService`). External API requests are reserved for explicit, high-level AI consults.
- **Strict Prohibition of Third-Party Trackers**: Pocket Gull contains zero third-party analytics pixels, fingerprinting scripts, or passive telemetry pingers (Google Analytics, Segment, Mixpanel, Meta Pixel).
- **Explicit Opt-In Telemetry**: All network operations require deliberate, user-initiated actions. Passive continuous background harvesting of location, micro-phone audio, or user keystrokes is strictly prohibited.
- **Ephemeral Lifecycle & 1-Click State Purging**: All active clinical state is stored in ephemeral Angular Signals and transient local storage. Clinicians can purge all in-memory patient signals and transient caches on demand via the 1-click **"Purge Transient State"** control or WebMCP tool (`purge_transient_patient_state`).

---

## Clinical Engineering & Risk Management Guidelines

To manage the long-term lifecycle and infrastructure safety of Understory, we adhere to the following core software engineering and operational risk practices:

### 1. "Shift-Left" Risk Detection
Google’s engineering practices emphasize "Shifting Left" to identify security risks and bugs as early as possible.
- **Automated CI Scanning**: Fully integrate CodeQL code scanning and Dependabot into our GitHub Actions / CI pipeline.
- **Pre-Deployment Auditing**: Automate vulnerability checks in the Angular frontend and Express.js backend before any container deployment to Google Cloud Run.

### 2. Architect for Failure in Compute Services
Because the application runs on serverless Google Cloud Run (Compute as a Service), instances are transient and can crash or restart unexpectedly.
- **Zero Remote Database Dependency**: Data risk is minimized by relying on local browser persistence and exporting patient records as FHIR bundles rather than using a centralized database.
- **Resilient AI Interchanges**: Future roadmaps include automated Disaster Recovery and Chaos Engineering tests to ensure the UI gracefully handles dropped, throttled, or timed-out inference requests to the Google Gemini API.

### 3. Dependency Compatibility & Risk Management
Modern web applications rely heavily on a complex web of packages (e.g., Angular v21.1, Three.js, Tailwind CSS, and Google GenAI SDK).
- **Stability Over "Live at Head"**: To safeguard clinical workflows from unexpected regressions, we actively track the "Compatibility Promises" of upstream frameworks and pin critical packages rather than automatically updating to the latest head.

### 4. Mitigating the "Bus Factor"
The "Bus Factor" represents the project risk of having sole maintainers on critical systems (e.g., NIH PubMed E-utilities XML parsing, Express backend proxies, AI orchestration, and 3D anatomical body mapping).
- **Canonical Sources of Information**: Maintain rigorous, central documentation in the repository (such as this `SECURITY.md` policy).
- **Standardized Code Reviews**: Enforce pull-request reviews on orchestrators and rendering pipelines to ensure codebase familiarity is shared across contributors.

---

Thank you for helping us keep the clinical ocean safe and secure.
