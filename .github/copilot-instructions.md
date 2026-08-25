# PocketGull Copilot & Autonomous Agentic Directives

All Copilot Chat interactions, autonomous SWE agents, and automated PR review triggers (`copilot_swe_agent_pull_request_opened_trigger`) MUST strictly enforce the following clinical, technical, and regulatory requirements across the PocketGull monorepo.

---

## 1. Angular 22 & Reactive State (Signals Strict Standard)
- **Always Favor Angular Signals**: Use `signal`, `computed`, and `effect` over RxJS observables for local component state.
- **Standalone Components Strict Standard**: Do not use `NgModule`. Every component must be standalone with explicit typed imports.
- **"Tell, Don't Ask" Domain Encapsulation**: Never reuse or call an existing getter simply to extract raw internal state and bolt new business rules or calculations onto the caller side. Keep domain behavior, calculations, and state transitions encapsulated within the owning entity or service.
- **Strict Typing**: Prefix interfaces with `I` (e.g. `IPatientRecord`, `IEnvironmentalTelemetry`). Use explicit return types for all public service functions.

---

## 2. Clinical & Ophthalmological Legibility (WCAG AAA & HIPAA Safe Harbor)
- **Zero Spelling Errors**: All medical terms, anatomical nomenclature, and drug names MUST be verified for 100% lexical precision (`HIPAA`, `Ophthalmological`, `Ayurvedic`, `LogMAR`, `Kellgren-Lawrence`).
- **Optotypic Legibility (LogMAR 0.0 / Snellen 20/20)**: Text must resolve clearly at 5-arcminute visual angle with 1-arcminute stroke details at 50–70 cm viewing distances.
- **ISMP / FDA Disambiguation**: Enforce slashed zero (`cv08`), curved lowercase `l` (`cv05`), and serifed capital `I` (`ss02`).
- **WCAG AAA Compliance**: Minimum 7:1 contrast ratio against dark obsidian (`#09090b`) backgrounds (`text-zinc-300` / `text-zinc-200`).
- **Fitts's Law Hitboxes**: All interactive buttons, links, and drawers MUST maintain a minimum $44 \times 44\text{ px}$ (or $48 \times 48\text{ px}$) touch target with `touch-manipulation`.
- **Tabular Figures for Telemetry**: Enforce `tabular-nums` and `font-mono` on all timers, blood pressure vitals, heart rates, and financial metrics to eliminate layout jitter.

---

## 3. Marker Font & Brand Lettering Boundary
- **Exclusive Brand Boundary**: The custom handwritten Marker Font (`font-pocketgull-handwritten`, `.marker-bold-emphasis`) is strictly reserved for the official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer** imprint lines.
- **Universal Clinical Legibility**: All clinical UI, data tables, research frames, and telemetry HUDs MUST strictly use clinical typography stacks (`font-pocketgull-sans-clinical`, `font-pocketgull-inter`, `font-pocketgull-mono`).

---

## 4. Anti-Whaling & Clinical Cybersecurity Governance Standard
- **Dual-Custody (M-of-N) Multi-Signature Protocol**: Bulk patient exports (>50 records), batch state deletions, or treasury disbursements $\ge \$500$ MUST require dual distinct authenticated clinical/executive roles (`MandiantClinicalDefenseService.verifyDualCustodyAuthorization`).
- **Anti-Deepfake Audio Boundary**: Spoken voice telemetry is strictly an interaction modality, NEVER an authentication credential. Privileged state alterations or medication edits ordered over voice MUST enforce a step-up hardware FIDO2 / WebAuthn physical passkey challenge.
- **STAT Emergency Override Forensic Attestation**: Declaring a STAT emergency bypass NEVER disables core safety or de-identification filters; all emergency overrides automatically generate immutable SHA-256 forensic snapshot audit entries (`IIncidentForensicSnapshot`).
- **Indirect Prompt Injection Defense (OWASP LLM01)**: All external clinical notes and partner payloads MUST be stripped of non-printable zero-width Unicode characters (`\u200B`, `\u200C`) and partitioned structurally (`[CLINICAL DIRECTIVE CONTEXT]`) to prevent LLM guardrail subversion.

---

## 5. Five Eyes (FVEY) Regulatory & Health Data Sovereignty
All clinical state exports, consent flows, and emergency vectors MUST support explicit Five Eyes partner nation profiles:
- **United States**: HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FHIR US Core R4, 988 Suicide & Crisis Lifeline.
- **United Kingdom**: NHS DTAC, DSPT, UK-GDPR, NICE ESF, FHIR UK Core, NHS 111 Dispatch.
- **Canada**: PIPEDA, Ontario PHIPA, Alberta HIA, FHIR CA Baseline, 988 Suicide Crisis Helpline.
- **Australia**: Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD, FHIR AU Base, Lifeline 13 11 14.
- **New Zealand**: Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064, FHIR NZ Base, 1737 Need to Talk.

---

## 6. Amazon Associates & Affiliate Egress Governance
- **Strict Outbound Communication Prohibition**: NEVER transmit raw Amazon affiliate links (`amazon.com/dp/*`, `tag=pgdpo-20`) inside outbound SMS text messages, push notifications, or emails. All communications MUST direct patients back to their secure Pocket-Gull Care Plan web portal.
- **Mandatory FTC Disclosure**: Every product recommendation card MUST display the clear FTC affiliate disclosure (`As an Amazon Associate, PocketGull earns from qualifying purchases`).
- **Zero PHI in Egress Links**: Affiliate links must only contain standard ASIN and affiliate tracking parameters (`tag=pgdpo-20`). NEVER pass patient identifiers, clinical diagnoses, or condition codes in external URLs.
- **Zero Base Model Training on Catalog Data**: Amazon product listings and program content may only be used for runtime inference/classification; NEVER use Amazon catalog data to train or fine-tune foundational base LLM weights.

---

## 7. Python / FastAPI & Data Science Engineering Standards
- **Node.js Environment**: Strictly require **Node.js v24.x** across all workspaces and CI/CD pipelines.
- **Pydantic Validation**: All request and response models in `pocketgull_api` sidecars MUST be strictly typed using Pydantic v2 `BaseModel` classes. Avoid returning raw dictionaries or untyped `Any`.
- **Async & Event Loop Hygiene**: Use `async def` for non-blocking I/O route handlers (`httpx`, async DB calls) and standard synchronous `def` for CPU-bound matrix/ML computations (`scikit-learn`, `numpy`) so FastAPI dispatches them cleanly to thread pools.
- **Leak-Free Cross-Validation Anchoring (`GroupKFold`)**: Group splits strictly by `patient_id` using `GroupKFold(n_splits=5)` to prevent patient-feature leakage between train and validation splits in volumetric medical imaging.
- **Kaggle Usability 10 Standard**: Every published Model Hub entry or Dataset MUST generate complete `model-metadata.json` / `dataset-metadata.json` containing explicit data dictionaries, open source licenses (`Apache 2.0` / `CC-BY-4.0`), and HIPAA §164.514 Safe Harbor verification.

---

## 8. Pre-Flight Test & Proof-of-Work Verification Chain
Every pull request, commit, and deployment must verify all 4 required status checks:
1. `TypeScript Strict Typecheck`: `node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit`
2. `Vitest Unit Test Suite`: `node scripts/run-vitest.mjs` (100% test pass across 367+ test files)
3. `Sentinel Security & Egress Guard`: `node scripts/sentinel_security_guard.mjs`
4. `CycloneDX 1.6 SBOM Verification`: `npm run sbom`
