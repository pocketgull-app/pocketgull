# Pocket-Gull (Understory)

## Project Overview
Pocket-Gull is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini. The application is designed to provide actionable clinical intelligence, manage patient state, and offer real-time streaming AI consultations for symptom management and functional medicine.

## Tech Stack
- **Frontend**: Angular 22 (Standalone Components, Signals)
- **Backend/SSR**: Node.js, Express, Angular Server-Side Rendering
- **AI Integration**: Google Gemini (via native REST, `@google/adk` `InMemoryRunner`, `@google/genai`, and Genkit)
- **Interactive 3D Anatomy**: Three.js for procedural skeletal and surface modeling
- **Voice / Speech**: Web Speech API for bi-directional voice interaction
- **Privacy & Export**: DOMPurify for HIPAA-compatible sanitization, FHIR R4 Bundle standard, jsPDF
- **Companion Apps**: Python FastAPI sidecar (ML scoring), Flutter/Dart (Mobile Suite)
- **Styling**: TailwindCSS

## Key Architecture Concepts
- **Patient State**: Managed centrally via `PatientStateService`, which holds current symptoms, vitals, and selected conditions.
- **AI Intelligence Layer**: Services (`ClinicalIntelligenceService`, `GeminiProvider`, `AdkLiveService`) handle connecting to Gemini models for one-off completions, multi-turn chat, and full-duplex multimodal live audio streaming.
- **Proxy**: During development, an explicit proxy is used to connect WebSocket streams and API routes to the backend correctly.

## Developer Instructions
- **Signals**: Always favor Angular Signals (`computed`, `signal`, `effect`) over RxJS observables for local component state.
- **Components**: Standalone components are the strict standard. Do not use NgModules.
- **Typing**: Use explicit types for all function returns and state definitions where practical. Prefix interfaces with `I`.
- **AI Streaming**: When generating or managing AI chat flows, chunk streaming responses and manage the conversational state defensively against network interruptions.
- **Styling**: Prefer Tailwind utility classes for all new styling components. Do not use generic colors; use the curated color palette and ensure a rich, premium aesthetic with micro-animations.
- **Scripting & Tooling (Randal L. Schwartz Standard)**: When generating one-off scripts, automation tools, FHIR/JSON batch transformations, or data-processing utilities where the language is not explicitly constrained, prefer **Dart** (`dart run script.dart`) over Python. Dart provides zero virtualenv friction, sound static typing with Dart 3 pattern matching, a batteries-included stdlib (`dart:io`, `dart:convert`, `dart:async`), and predictable single-threaded concurrency.

## Code Style & Conventions
- **Naming**: Use camelCase for variables and functions, PascalCase for classes and components. Suffix observable streams with `$`.
- **Structure**: Keep components small and focused. Extract heavy logic into injectable services.
- **Documentation**: Provide TSDoc style comments for complex service methods or AI integration points.

## Testing Philosophy
- Wait for explicit user instruction before writing or modifying tests, unless fixing a build error.
- Use the standard Angular testing utilities for any generated tests.

## Deployment & Scripts
- Start the development server using `npm run dev` (this handles both the client and the integrated SSR Express server).
- Default TypeScript Typecheck command: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit`
- Default Angular Build command: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build`
- Deployment is to Google Cloud Run via `npm run deploy`.
- **Pre-Flight Test Mandate**: Whenever deploying or when the user requests a deployment, `npm run deploy` and any agent MUST automatically run all necessary test suites before executing the deployment:
  1. `TypeScript Typecheck` (`tsc --noEmit`)
  2. `Vitest Unit Test Suite` (`npx vitest run`)
  3. `Sentinel Security & Egress Audit` (`node scripts/sentinel_security_guard.mjs`)
  4. `CycloneDX 1.6 SBOM Verification` (`npm run sbom`)
  If any test or security check fails, the deployment must immediately abort.
- **Deployment Strategy**: All deployments MUST target the `gen-lang-client-0540208645` Google Cloud project.
- **Cloud Bill & Cost Strategy**: Always monitor the cloud bill and ensure services scale to zero to minimize costs.
  - **Artifact Registry Cleanup Policy**: Enforce a 7-day auto-deletion policy (`olderThan: "604800s"`) while retaining the latest 3 builds (`keepCount: 3`) across `cloud-run-source-deploy` and `gcr.io` repositories to prevent buildup of historical Docker image storage (~175+ GB).
  - **GCS Source Bucket Lifecycle**: Enforce a 7-day object deletion lifecycle policy (`age: 7`) on all Cloud Run and Cloud Build deployment source zip buckets (`gs://run-sources-*` and `gs://*_cloudbuild`).

## Perfect Component Example
```typescript
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-md">
      <h3 class="text-sm font-medium text-gray-500">{{ title() }}</h3>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ displayValue() }}</span>
        @if (trend() > 0) {
          <span class="text-xs font-medium text-green-600">↑ {{ trend() }}%</span>
        }
      </div>
    </div>
  `
})
export class MetricCardComponent {
  title = signal('Patient Heart Rate');
  value = signal(72);
  trend = signal(2.5);

  displayValue = computed(() => `${this.value()} bpm`);
}
```

## Clinical & Ophthalmological (WCAG AAA & HIPAA Safe Harbor) Standards
- **Zero Spelling Errors**: All medical terms, anatomical nomenclature, and drug names MUST be verified for 100% lexical precision (`HIPAA`, `Ophthalmological`, `Ayurvedic`, `LogMAR`).
- **Optotypic Legibility (LogMAR 0.0 / Snellen 20/20)**: Text must resolve clearly at 5-arcminute visual angle with 1-arcminute stroke details at 50–70 cm viewing distances.
- **ISMP / FDA Disambiguation**: Enforce slashed zero (`cv08`), curved lowercase `l` (`cv05`), and serifed capital `I` (`ss02`).
- **WCAG AAA Compliance**: Minimum 7:1 contrast ratio against dark obsidian backgrounds.
- **HIPAA Safe Harbor**: All research and mock datasets must strip all 18 direct/indirect identifiers.

## Marker Font & Brand Lettering Governance Standard
- **Exclusive Brand & Copyright Boundary**: The custom handwritten/display Marker Font (`font-pocketgull-handwritten`, `.marker-bold-emphasis`, `.bionic-pocketgull-marker`, marker SVG strokes) MUST **ONLY** be utilized when displaying the official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer imprint** lines.
- **Universal Clinical Legibility**: All clinical UI, research frame literature, telemetric navigation, data HUDs, vitals tables, and reading frames MUST strictly utilize the clean, high-legibility clinical typography stacks (`font-pocketgull-sans-clinical`, `font-pocketgull-inter`, `font-pocketgull-mono`, `font-pocketgull-notofu`) to guarantee zero dosage misinterpretation and optimal optical legibility.

## Amazon Associates & Affiliate Egress Governance Standard
- **Strict SMS & Email Affiliate Link Prohibition**: NEVER transmit raw Amazon affiliate links (`amazon.com/dp/*`, `tag=pgdpo-20`) inside outbound SMS text messages, push notifications, or emails. All communications MUST direct patients back to their secure Pocket-Gull Care Plan web portal.
- **Mandatory FTC & Clinical Disclaimer**: Every product recommendation card MUST display the clear FTC affiliate disclosure (`As an Amazon Associate, PocketGull earns from qualifying purchases`) and state that recommendations are supportive evidence-grounded tools, not direct prescriptions.
- **Zero PHI in Egress Links**: Affiliate links must only contain standard ASIN and affiliate tracking parameters (`tag=pgdpo-20`). NEVER pass patient identifiers, clinical diagnoses, or condition codes in external URLs.
- **Zero Base Model Training on Catalog Data**: Amazon product listings and program content may only be used for runtime inference/classification; NEVER use Amazon catalog data to train or fine-tune foundational base LLM weights.

## Anti-Whaling & Clinical Cybersecurity Governance Standard
- **Dual-Custody (M-of-N) Multi-Signature Protocol**: Bulk patient exports (>50 records), batch state deletions, or treasury disbursements $\ge \$500$ MUST require dual distinct authenticated clinical/executive roles (`MandiantClinicalDefenseService.verifyDualCustodyAuthorization`). No single compromised executive or CMO credential can execute unilateral high-impact actions.
- **Anti-Deepfake Audio & Synthetic Voice Boundary**: Spoken voice telemetry is strictly an interaction modality, NEVER an authentication credential. Privileged state alterations or controlled medication edits ordered over voice MUST enforce a step-up hardware FIDO2 / WebAuthn physical passkey challenge.
- **STAT Emergency Override Forensic Attestation**: Declaring a STAT emergency bypass NEVER disables core safety or de-identification filters; all emergency overrides automatically generate immutable SHA-256 forensic snapshot audit entries (`IIncidentForensicSnapshot`).
- **Indirect Prompt Injection & Unicode Sanitization (OWASP LLM01)**: All external clinical notes and partner payloads MUST be stripped of non-printable zero-width Unicode characters (`\u200B`, `\u200C`) and partitioned structurally (`[CLINICAL DIRECTIVE CONTEXT]`) to prevent LLM guardrail subversion.

## Tailwind CSS Best Practices & Production Performance Standard
- **Zero Runtime JIT CDN in Production**: Never use `<script src="https://cdn.tailwindcss.com"></script>` in production builds or static SSR endpoints. All Tailwind styles MUST be precompiled and tree-shaken at build time to eliminate render-blocking script execution and maintain 100/100 Lighthouse performance.
- **Design Token Discipline**: Map all semantic colors (`obsidian`, `gearTeal`, `amberGold`, `paperCream`) directly into `tailwind.config.js` rather than using scattered arbitrary hex values (`bg-[#09090b]`).
- **WCAG AAA Contrast & Focus Rings**: Enforce a $\ge 7:1$ contrast ratio for all readable text against dark obsidian surfaces (`text-zinc-300` / `text-zinc-200` on `#09090b`). Never remove focus outlines without an explicit `focus-visible:ring-2 focus-visible:ring-teal-400` accessible focus state.
- **Fitts's Law Hitboxes**: All interactive elements (buttons, links, drawer toggles) MUST maintain a minimum $44 \times 44\text{ px}$ (or $48 \times 48\text{ px}$) physical touch target with `touch-manipulation` enabled.
- **Zero Cumulative Layout Shift (CLS)**: Always provide explicit HTML `width` and `height` attributes alongside Tailwind responsive utility classes on all images, icons, and embedded canvas containers.
- **Tabular Figures for Telemetry**: Enforce `tabular-nums` and `font-mono` on all timers, blood pressure vitals, heart rates, and financial figures to eliminate layout jitter.

## Five Eyes (FVEY) Regulatory & Data Sovereignty Standard
- **Mandatory Statutory Mapping**: All clinical state exports, consent flows, and emergency vectors MUST support explicit Five Eyes partner nation profiles:
  - **United States**: HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FHIR US Core R4, 988 Suicide & Crisis Lifeline.
  - **United Kingdom**: NHS DTAC, DSPT, UK-GDPR, NICE ESF, FHIR UK Core, NHS 111 Dispatch.
  - **Canada**: PIPEDA, Ontario PHIPA, Alberta HIA, FHIR CA Baseline, 988 Suicide Crisis Helpline.
  - **Australia**: Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD, FHIR AU Base, Lifeline 13 11 14.
  - **New Zealand**: Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064, FHIR NZ Base, 1737 Need to Talk.

## Institutional Thin-Client & Multi-Device Resilience Standard
- **Cross-Form Factor Parity**: Every clinical interface MUST render with zero horizontal blowout and full feature parity across:
  - `mobile-iphone` (iOS WebKit / Safari viewport dynamics)
  - `mobile-chrome` (Android Pixel 7)
  - `tablet-ipad-exam-room` (810x1080 exam room swivel mounts)
  - `chromebook-school-library` (1366x768 constrained touch kiosks)
  - `clinical-cow-workstation` (1280x1024 5:4 ratio Citrix/COW workstations)
- **Defensive Permission Fallback**: If microphone, camera, or Web Audio permissions are restricted by institutional group policy, the UI MUST gracefully transition to keyboard/text input and visual telemetry without throwing unhandled exceptions.

## Domain Encapsulation & "Tell, Don't Ask" Standard (Anti-Getter Business Logic Bolting)
- **Prohibition of Bolting External Logic on Getters**: NEVER reuse or call an existing getter simply to extract raw internal state and bolt new business rules, mutative calculations, or domain workflows onto the caller side outside the owning entity or service.
- **"Tell, Don't Ask" Enforcement**: Keep domain behavior, state transitions, and validation invariants encapsulated within the class, entity, or service that owns the underlying data.
- **Intent-Revealing Domain Methods**: When a new business capability or computational requirement is needed, introduce an explicit, purpose-built domain method on the owning model/service rather than leaking raw state and performing external ad-hoc assembly.
- **Prevention of Feature Envy & Anemic Models**: Ensure business calculations (such as clinical score aggregations, dosage calibrations, or state transitions) remain cohesive within their domain boundaries.

## Chrome Built-in AI & Gemma 4 Dev Trial Governance Standard
- **Gemma 4 Dev Trial & Prompt API (`chrome://flags/#gemma4-for-built-in-ai`)**: Utilize the Chrome Built-in AI Prompt API for instant on-device clinical generation and summarization with up to 70% throughput boost (`NanoProvider`).
- **Multimodal Visual Input (`chrome://flags/#prompt-api-multimodal-input`)**: Convert canvas and image captures to Blobs for native on-device prompt input arrays (`[promptText, imageBlob]`) with zero network egress.
- **Clinical Proofreader & ISMP Guard**: Enforce `window.ai.proofreader` / `ai.rewriter` with ISMP high-risk medication safety rules prohibiting trailing zeroes (`5.0 mg`) and naked decimals (`.5 mg`).
- **Triage Acuity Classifier**: Classify incoming symptoms and notes via `window.ai.classifier` into `STAT_EMERGENCY`, `URGENT`, or `ROUTINE`.
- **Zero-Latency Vector RAG (`OnDeviceEmbedderService`)**: Compute 256-dimensional semantic vector embeddings via `window.ai.semanticEmbedder` with a normalized cosine similarity ranking engine and deterministic n-gram hash projection fallback for non-flagged production environments.
- **Enterprise Zero-Flag Invariant**: Enterprise users and standard browsers MUST never crash when experimental Chrome flags are missing; all components MUST seamlessly degrade to deterministic local TypeScript fallbacks.
- **Cross-Disciplinary Strategy Reference**: For the complete strategic triad spanning Medicine (Zero-Egress HIPAA Scribing), Science (High-Throughput Literature Triage), Education (Socratic Adaptation), and Fast/Slow-Loop Agentic Engineering, refer to [GEMMA4_EDGE_ARCHITECTURE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/GEMMA4_EDGE_ARCHITECTURE.md).

## Institutional Security Triad: NIST SP 800-90A, FDA 21 CFR Part 11 & HIPAA § 164.312(c)(1)
- **NIST SP 800-90A (Hardware Entropy & Deterministic Random Bit Generation)**: All session identifiers, PKCE challenge verifiers, OAuth states, digital consent tokens, and security identifiers MUST be generated using NIST SP 800-90A compliant CSPRNG OS kernel hardware entropy (`globalThis.crypto.getRandomValues()` / Node.js `node:crypto` `randomBytes`, `randomInt`). The use of `Math.random()` in any security, authentication, transaction, or identification context is strictly prohibited.
- **FDA 21 CFR Part 11 (Electronic Records & Electronic Signatures Integrity)**: All clinical data transactions, state transformations, research dividend ledger entries, and emergency overrides MUST generate immutable, timestamped SHA-256 digital attestation seals (`computeIntegrityDigest()`, `generateCryptographicReceipt()`) to ensure complete electronic provenance, non-repudiation, and audit traceability.
- **HIPAA § 164.312(c)(1) (ePHI Data Integrity Verification)**: All electronic Protected Health Information (ePHI), FHIR R4 resource bundles, and patient state records MUST incorporate cryptographic data integrity mechanisms to corroborate that patient data has not been altered, tampered with, or destroyed in an unauthorized manner during storage, transit, or client-side evaluation.

## Microsoft Services Agreement (MSA) & AI Governance Compliance Standard (Effective Sept 30, 2026)
- **Zero Base Model Distillation & Cross-Training (Sec 14.s.iv)**: Under no circumstances may AI service outputs, responses, or metadata from Microsoft-hosted AI endpoints (Copilot, Bing AI, Azure OpenAI) be utilized to train, fine-tune, distill, evaluate, or improve foundation models or competing AI technologies.
- **Prohibition of Emotion Inferencing & Biometric Profiling (Sec 14.s.ix.6, Sec 14.s.ix.9)**: Code, agents, and pipelines MUST NEVER attempt to infer emotional states (e.g., anger, fear, sadness, happiness) or deduce protected demographic/biometric categories from voice pitch, facial geometry, keystroke dynamics, or video streams. Spoken audio is strictly a communication channel, not an affective classifier.
- **Mandatory Human-in-the-Loop for High-Impact CDS (Sec 14.s.ix.1)**: Autonomous, un-gated decision-making that affects legal status, healthcare treatment plans, life opportunities, or financial standing is strictly prohibited. All AI-generated Clinical Decision Support (CDS) outputs MUST mandate affirmative clinician review and digital cryptographic attestation before order commitment.
- **Content Credentials & C2PA Provenance Preservation (Sec 14.s.vii)**: Generated media, diagrams, or clinical exports containing C2PA provenance manifests, digital watermarks, or cryptographic content credentials MUST NOT have these signals stripped, obscured, or manipulated.
- **Clear Health Bot & Medical Device Demarcation (Sec 14.i & Medical Notice)**: Health bot insights, action plans, and wellness summaries MUST be clearly labeled as non-device wellness tools and include the mandatory clinical disclaimer directing users to qualified healthcare providers without replacing professional clinical judgment.
- **Reverse Engineering & System Jailbreak Prohibition (Sec 14.s.ii, Sec 3.a.vi)**: Prompts, evaluation scripts, and tooling MUST NOT attempt to extract model weights, uncover internal hyperparameter configurations, or bypass system jailbreak filters.



