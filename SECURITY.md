# Security Policy

At **Pocket Gull**, security and privacy are foundational, especially given the clinical context of the application. We take vulnerabilities and data handling extremely seriously.

## Supported Versions

Only the latest `main` branch and currently deployed production versions receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.25.x  | :white_check_mark: |
| 1.24.x  | :white_check_mark: |
| < 1.24  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Pocket Gull, please do **not** disclose it publicly. Instead, use one of the following private channels:

1.  **GitHub Private Vulnerability Reporting**: [Report a vulnerability](https://github.com/pocketgull-app/pocketgull/security/advisories/new) (preferred).
2.  **Email**: Send details to **dpo@pocketgull.app**.

We will review the submission within 48 hours and work with you to patch the vulnerability safely before public disclosure.

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
- **Explicit Opt-In Telemetry**: All network operations require deliberate, user-initiated actions. Passive continuous background harvesting of location, microphone audio, or user keystrokes is strictly prohibited.
- **Ephemeral Lifecycle & 1-Click State Purging**: All active clinical state is stored in ephemeral Angular Signals and transient local storage. Clinicians can purge all in-memory patient signals and transient caches on demand via the 1-click **"Purge Transient State"** control or WebMCP tool (`purge_transient_patient_state`).

### 7. Mandiant Dual-Custody (M-of-N) Multi-Signature Protocol
- **High-Impact Action Verification**: Bulk patient record exports (>50 records), batch state purges, or treasury disbursements $\ge \$500$ MUST require dual distinct authenticated clinical/executive roles (`MandiantClinicalDefenseService.verifyDualCustodyAuthorization`). No single compromised executive or CMO credential can execute unilateral high-impact actions.
- **STAT Emergency Override Forensic Attestation**: Declaring a STAT emergency bypass NEVER disables core safety or de-identification filters; all emergency overrides automatically generate immutable SHA-256 forensic snapshot audit entries (`IIncidentForensicSnapshot`).


### 8. Anti-Deepfake Audio & Synthetic Voice Boundary
- **Interaction Modality Only**: Spoken voice telemetry is strictly an interaction modality, NEVER an authentication credential.
- **Hardware Passkey Step-Up**: Privileged state alterations, dosage overrides, or controlled medication edits ordered over voice MUST enforce a step-up hardware FIDO2 / WebAuthn physical passkey challenge before execution.

### 9. Indirect Prompt Injection & Unicode Sanitization (OWASP LLM01)
- **Zero-Width Unicode Filtering**: All incoming clinical notes, partner FHIR resources, and external literature payloads MUST be stripped of non-printable zero-width Unicode characters (`\u200B`, `\u200C`, `\uFEFF`) before LLM ingestion.
- **Structural Partitioning**: System instructions remain static (`BASE_CLINICAL_PROMPT`). Sanitized user directives are partitioned into explicit context blocks (`[CLINICAL DIRECTIVE CONTEXT]`) to prevent LLM guardrail subversion.

### 10. Five Eyes (FVEY) Statutory Health Data Sovereignty
All data serialization, export, and telemetry vectors strictly comply with Five Eyes partner nation standards:
- **United States**: HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FHIR US Core R4.
- **United Kingdom**: NHS DTAC, DSPT, UK-GDPR, NICE ESF, FHIR UK Core.
- **Canada**: PIPEDA, Ontario PHIPA, Alberta HIA, FHIR CA Baseline.
- **Australia**: Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD, FHIR AU Base.
- **New Zealand**: Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064, FHIR NZ Base.

### 11. Amazon Associates & Affiliate Link Security
- **Strict Outbound Channel Isolation**: Raw Amazon affiliate links (`amazon.com/dp/*`, `tag=pgdpo-20`) are strictly prohibited in outbound SMS text messages, push notifications, and emails.
- **Zero PHI in Query Parameters**: Affiliate URLs contain only ASIN and tracking tags. No patient identifiers, diagnoses, or condition codes may ever appear in outbound links.

### 12. Institutional Security Triad: NIST SP 800-90A, FDA 21 CFR Part 11 & HIPAA §164.312(c)(1)
- **NIST SP 800-90A (Hardware Entropy & Deterministic Random Bit Generation)**: All session identifiers, PKCE challenge verifiers, OAuth states, digital consent tokens, and security identifiers MUST be generated using NIST SP 800-90A compliant CSPRNG OS kernel hardware entropy (`globalThis.crypto.getRandomValues()` / Node.js `node:crypto` `randomBytes`, `randomInt`). The use of `Math.random()` in any security, authentication, transaction, or identification context is strictly prohibited.
- **FDA 21 CFR Part 11 (Electronic Records & Electronic Signatures Integrity)**: All clinical data transactions, state transformations, research dividend ledger entries, and emergency overrides generate immutable, timestamped SHA-256 digital attestation seals (`computeIntegrityDigest()`, `generateCryptographicReceipt()`) to guarantee electronic record provenance, non-repudiation, and audit traceability.
- **HIPAA § 164.312(c)(1) (ePHI Data Integrity Verification)**: All electronic Protected Health Information (ePHI), FHIR R4 resource bundles, and patient state records incorporate data integrity verification mechanisms to corroborate that patient clinical data has not been altered, tampered with, or destroyed in an unauthorized manner during storage, transit, or client-side evaluation.

### 13. 4-Layer Defense-in-Depth Sandboxing & Execution Isolation Standard
- **Layer 1: Cloud & Kernel Isolation (gVisor & VPC-SC)**: All serverless container microservices run inside Google Cloud Run Second Generation (`gen2`) utilizing Google's user-space `gVisor` (`runsc`) kernel sandbox to intercept syscalls and eliminate host-kernel escalation vectors. Scale-to-zero (`minScale: 0`) ensures zero idle persistence.
- **Layer 2: Container Runtime Hardening (Non-Root & Ephemeral Vol)**: Production images execute as unprivileged non-root users (`USER node`, UID 1000) with dropped Linux capabilities and ephemeral memory volumes for scratch files.
- **Layer 3: Agentic Execution & Policy-as-Code Guards**: Pre-commit hooks enforce automated secret scans, egress domain auditing, CodeQL modulo linting, and taint flow analysis across 1,500+ source files. Irreversible destructive operations require explicit user affirmation.
- **Layer 4: Client-Side Sandbox & Zero-Egress On-Device AI**: Clinical scribing and triage acuity inference leverage on-device models (Chrome Built-in AI / Gemma 4 Dev Trial) with mathematical zero-network-egress privacy, ensuring full HIPAA §164.514 Safe Harbor compliance. Heavy 3D biophysical simulations run isolated inside Web Workers to ensure UI responsiveness.

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
