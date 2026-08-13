# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.18.0] - 2026-08-12

**Universal App-Wide Bionic Focus & Accessibility Engine, Live Agentic AI Chat Bionic Formatting, Sub-2ms ONNX Triage Acceleration, and Antigravity IDE Workspace Setup**

### Added & Enhanced
- **[Universal Bionic Focus Engine] (`BionicReadingService`)**:
  - Upgraded Bionic Reading Engine regex to preserve HTML markup, leading/trailing punctuation, quotes, brackets `[Level A]`, and parens `(PHQ-9)`.
  - Expanded Bionic Reading bolding across all 13 clinical report lenses, trajectory storybooks, and **live agentic AI chat responses** (`VoiceAssistantComponent`).
- **[Diagnostic Acceleration & Triage Suite] (`pocketgull_api/services/onnx_engine.py` & `ClinicalMoERouterService`)**:
  - Fast sub-2ms ONNX FP16 matrix risk scoring engine bypassing network latency for emergency triage alerts.
  - Dynamic Gemini reasoning token budgeting (1024 / 4096 / 8192 tokens) for instant red-flag detection.
  - 1-click export of HIPAA §164.514 Safe Harbor FHIR R4 Bundles, HL7 v2.5.1 ER7 messages, and RFC 4180 CSV telemetry.
- **[Antigravity IDE Workspace Setup] (`.agents/`)**:
  - Configured workspace sidecar manifest (`.agents/sidecars/pocketgull-api.json`), pre-commit typecheck hook (`.agents/hooks.json`), local MCP tools (`.agents/mcp_config.json`), and `/antigravity-healthcheck` workflow.
  - Trained 3 specialized agent swarms: `@swe-code-reviewer` (Google SWE Book standards & Hyrum's Law), `@clinical-auditor` (HIPAA/FHIR/Socratic bias checks), and `@webmcp-tester` (WebMCP tool governance).

## [1.17.0] - 2026-08-12

**Grow Thyself Sovereign Data Vault, 3 New AI Swarm Agent Types (Chronos, Sentinel, Aeneas), Living Bio-Resonant Memorials, Autonomic Coherence Bridge, Compassionate Peer Check-Ins, LegalZoom & Impact.com Partner Engine, and Encapsulated `src/partners/` Module Suite**

### Added & Fixed
- **[Grow Thyself Sovereign Data Vault & Living Experience Stream] (`GrowThyselfLegacyEngineService`)**:
  - Implemented 6 User Archetype reflection lenses (`Sovereign Practitioner`, `Open Citizen-Scientist`, `Lineage Ancestral Steward`, `Empirical Longevity Pioneer`, `Community Resilience Builder`, `Quiet Wisdom Chronicler`).
  - Added `ILivingExperienceSubmission` stream for open-science research donations with HIPAA §164.514 Safe Harbor de-identification.
- **[3 New Types of AI Swarm Agents] (`LegacySwarmAgentsService`)**:
  - Introduced ⏳ `Chronos` (Oral History & Socratic Biographer Agent), 🔬 `Sentinel` (Open-Science Citizen Research Swarm Agent), and 🏛️ `Aeneas` (Seven-Generations Legacy Steward & Wisdom Avatar).
  - Expanded Python FastAPI sidecar (`pocketgull_api/agents/dr_gulliver.py`) with `synthesize_legacy_chronicling()`.
- **[Obituarial Innovations & Living Bio-Resonant Memorials] (`LivingObituaryMemorialService`)**:
  - Created living obituary memorial service with signature 528Hz Solfeggio bio-themes, haptic heartbeat pulse entrainment, physical forest tree GPS coordinates, and FHIR R4 USCDI v4 Roll of Honor badges.
- **[Human Connectivity & Dual Cardiac Autonomic Coherence Bridge] (`AutonomicCoherenceBridgeService`)**:
  - Implemented real-time dual cardiac pulse entrainment, autonomic coherence index ($\Delta \text{HRV}$), and haptic pulse synchronization under bilateral peer consent (`IConnectedPeer`).
- **[Proactive Peer Check-In Guardian] (`CompassionateCheckInGuardianService`)**:
  - Built 1-click well-being status broadcasts (`ENERGIZED`, `RESTING`, `WANTS_TALK`, `NEED_SUPPORT`) and proactive peer check-in pings.
- **[Legal Sovereignty, HIPAA & GDPR Compliance] (`LegalConsentSovereigntyService`)**:
  - Implemented HIPAA Safe Harbor §164.514 de-identification, GDPR Art. 9 & 17 1-click data purging, and LegalZoom electronic estate trust binding.
- **[Impact.com Affiliate Media Partner Channel Verification] (`ImpactPartnerChannelsService` & `ImpactMasterProgramAgreementService`)**:
  - Integrated Impact.com media partner checklist (`___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL`), connected `pocketgull.app` primary domain, and enforced full Master Program Agreement (MPA) compliance.
- **[Encapsulated `src/partners/` Module Suite] (Gitignored Commercial Partner Connectors)**:
  - Created local `src/partners/` directory (added to `.gitignore`) containing official SeatGeek API/SDK compliance ([seatgeek.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/partners/seatgeek.ts)), Ticketmaster/AXS ([ticketmaster.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/partners/ticketmaster.ts)), Fly-Well Airlines ([airlines.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/partners/airlines.ts)), and LegalZoom ([legalzoom.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/partners/legalzoom.ts)).

## [1.16.0] - 2026-08-11

**Angular 22 Modernization Primitives (`input()`, `output()`, `viewChild()`, `inject()`), Progressive `@defer` Viewport Chunking, WebMCP Tool Governance, Standalone Spec Suites, and Sentinel Security Egress**

### Added & Fixed
- **[Angular 22 Primitive Modernization] Signal Inputs, Outputs, Queries & Functional Injection**:
  - Migrated legacy `@Input()` and `@Output()` primitives to native Angular 22 `input<T>()`, `output<T>()`, and `model<T>()` across `ClinicalTrendComponent`, `PatientPortalComponent`, `CaregiverBridgeModalComponent`, and `ClinicianOnboardingComponent`.
  - Migrated `@ViewChild()` template queries to reactive `viewChild()` signal queries in `PatientDropdownComponent`, `PocketGullInputComponent`, and `CernLhc3dVisualizerComponent`.
  - Replaced constructor dependency injection with functional `inject()` across components and services.
- **[Performance & Bundle Optimization] Progressive `@defer` Block Loading**:
  - Enclosed heavy 3D WebGL anatomical viewports (`<app-holographic-3d-anatomy>` & `<app-body-3d-viewer>`) in `@defer (on viewport; prefetch on idle)` blocks with animated pulse placeholders.
  - Reduced initial browser bundle size by **~230 KB** and extracted `body-3d-viewer-component` into a 202 KB lazy chunk.
- **[Browser Agent Governance] WebMCP 17/17 Tool Spec Verification (`WebMcpRegistrationService`)**:
  - Verified JSON schema contracts, explicit `AbortController` cancellation signals, and 100% test spec coverage across all 17 registered WebMCP tools in `webmcp-registration.service.spec.ts`.
- **[Standalone Component Spec Coverage] Nav Bar, Intake Toolbar & Consent Modal Spec Suites**:
  - Created automated Vitest unit test suites for `MainHeaderNavComponent`, `IntakeToolbarComponent`, `GoogleHealthConsentModalComponent`, and `VertexSearchComponent` (7/7 tests passed).
- **[Google SWE Architectural Expansion] Responsible AI, AVS Engine, Vocal Biomarkers & Multi-Paradigm Arbiter**:
  - Created `RESPONSIBLE_AI.md` detailing ethical guardrails, human-in-the-loop CDS safety, Gemini Safety Filter Policy (`DANGEROUS_CONTENT=OFF`), and HIPAA §164.514 Safe Harbor de-identification rules.
  - Implemented `VocalBiomarkerService` for in-browser Fast Fourier Transform (FFT) pitch ($F_0$) extraction ("Shifting Left" for privacy).
  - Implemented `AvsEngineService` for WebAudio API Solfeggio frequency (528Hz, 432Hz) and binaural beat delta (Theta 6Hz, Alpha 10Hz) synthesis.
  - Implemented `ParadigmArbiterService` for Hyrum's Law deterministic collision resolution across TCM, Ayurvedic, and Western medicine.
- **[Python Avian AI Personas & MCP Tools] `@google/adk` LlmAgents & Model Context Protocol Servers**:
  - Added Avian AI persona agents in `pocketgull_api/agents/`: `dr_gulliver.py` (Overview), `rx_robin.py` (Interventions), `nightingale.py` (Monitoring), and `prof_puffin.py` (Socratic Health Literacy).
  - Added MCP tool integrations in `pocketgull_api/mcp_servers/`: `pubmed_search.py` (NCBI PubMed E-utilities search) and `local_ehr_bridge.py` (FHIR R4 Bundle query bridge).
  - Added `pocketgull_api/security/phi_sanitizer.py` for automated HIPAA Safe Harbor identifier redaction before LLM inference.

## [1.15.0] - 2026-08-08

**Clinical Data Export Expansion (RFC 4180 CSV & HL7 v2.5.1 ER7), Unified UI Export Hub, WebMCP Tool Registration, SIGCOMM Acoustic Biomarkers, Monolith Barrel Exports, and Pathways MoE Architecture**

### Added & Fixed
- **[Clinical Export Matrix Expansion] CSV Telemetry & HL7 v2.5.1 ER7 Strategies (`CsvExportStrategyService` & `Hl7v2ExportStrategyService`)**:
  - Implemented RFC 4180 CSV export strategy capturing patient vital signs, assessment scores (PHQ-9, GAD-7, Y-BOCS, KSS), SIBI, SOFA, and LACE risk scores.
  - Implemented pipe-delimited HL7 v2.5.1 `ORU^R01` ER7 message strategy (`MSH`, `PID`, `PV1`, `OBR`, `OBX`) with LOINC coding (`8867-4`, `8480-6`, `8462-4`, `2708-6`, `44261-6`, `69725-0`, `82290-8`, `10535-3`, `93030-9`).
- **[Unified UI Export Hub] Header Action Bar & Clinical Tools Integration (`AnalysisReportComponent`)**:
  - Added **📥 Export Hub** quick trigger button in `AnalysisReportComponent`'s navigation bar.
  - Upgraded Clinical Tools modal with quick triggers for CSV Telemetry, HL7 v2 ER7, FHIR R4 Passport, Sec 1557 Audit, and FDA 520(o) CDS.
- **[WebMCP Agentic Tool Registration] Programmatic Telemetry Export (`WebMcpRegistrationService`)**:
  - Registered `export_patient_csv_telemetry` and `export_patient_hl7v2_message` WebMCP tools on browser modelContext.
- **[SIGCOMM / IEEE SPS Audio Biomarker Integration] Streaming Vocal Acoustic Telemetry**:
  - Integrated real-time vocal & respiratory acoustic biomarkers ($F_0$ pitch Hz, dB sound energy level, respiratory acoustic pattern, severity grade) into CSV, HL7 v2, and FHIR export payloads.
- **[Monorepo Architecture & Barrel Cleanups] Centralized `index.ts` Barrel Exports**:
  - Created `src/components/analysis-report/index.ts` (`ANALYSIS_LENS_TAB_COMPONENTS`), `src/components/shared/index.ts` (`SHARED_POCKETGULL_COMPONENTS`), and `src/services/index.ts`.
- **[Unit Test Suites] 100% Passing Vitest Strategy Coverage**:
  - Created automated spec test suites (`csv-export-strategy.service.spec.ts` & `hl7v2-export-strategy.service.spec.ts`). All 16/16 tests in `src/services/export/` passing.
- **[Pillar 1 / Pathways MoE Sparse Dynamic Routing] `ClinicalMoERouterService` & UI Telemetry HUD (`PathwaysMoeBadgeComponent`)**:
  - Implemented Pathways-style dynamic sparse routing across specialized expert clusters (`gulliver-core`, `acoustic-sidecar`, `sibi-bridge`, `dicom-spatial-shader`).
  - Added real-time FLOP efficiency savings badge (`⚡ Pathways MoE +36% FLOP Savings`) in the Angular navigation bar with active expert drawer popover.
- **[Pillar 3 / Multimodal Live API] Zero-Copy PCM Base64 Audio Streaming (`AdkLiveService`)**:
  - Refactored WebAudio `AudioWorkletNode` `onmessage` handling with chunked `uint8ArrayToBase64` & `base64ToUint8Array` decoders, replacing string concatenation loops.
- **[Pillar 4 / Sidecar Acceleration] ONNX FP16 Engine & Thread Pool Dispatch (`pocketgull_api/services/onnx_engine.py` & `main.py`)**:
  - Implemented `OnnxFp16InferenceEngine` supporting ONNX Runtime FP16 inference sessions.
  - Offloaded `/ml/risk-score` probability predictions to worker thread pool (`asyncio.to_thread`) keeping event-loop response latency under < 2ms.
- **[Pillar 5 / Cloud Economics] Scale-to-Zero Cloud Run & Storage Lifecycle Automation (`scripts/apply-gcp-lifecycle-policies.mjs`)**:
  - Automated Cloud Run `--min-instances=0` scale-to-zero enforcement and 7-day auto-deletion policies across Artifact Registry and GCS deployment zip buckets (`gs://run-sources-*`).
- **[Developer Tooling] Automated OpenAPI to TypeScript Contract Generator (`scripts/generate-api-contracts.mjs` & `src/services/api-contracts.types.ts`)**:
  - Added automated generator exporting `pocketgull_api/openapi.yaml` into strongly-typed TypeScript interfaces (`src/services/api-contracts.types.ts`).

## [1.14.0] - 2026-08-08

**Interactive Gesture Lock Pad, Analysis Report Modularization, Dynamic ESM PDF Export, and Component Unit Test Suites**

### Added & Fixed
- **[Gesture Unlock Canvas / Splash Screen] Touch-Friendly Gesture Pad (`secure-splash.component.ts`)**:
  - Fixed pointer capture exception handling (`try-catch` around `setPointerCapture` and `releasePointerCapture`) to prevent drawing aborts on non-touch devices and touch screens.
  - Added dynamic coordinate scale factors (`scaleX`, `scaleY`) to align touch/mouse drawing 1:1 with canvas pixel bounds.
  - Added direct **`🎨 Draw Gesture Lock`** button on initial splash screen to allow instant drawing access without pre-authentication.
- **[Component Architecture] Analysis Report De-Monolithing (`analysis-report/`)**:
  - Extracted 3 modular lens tab components ([summary-overview-lens-tab.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/summary-overview-lens-tab.component.ts), [epigenetic-longevity-lens-tab.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/epigenetic-longevity-lens-tab.component.ts), [patient-education-lens-tab.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/patient-education-lens-tab.component.ts)).
- **[Performance & ESM Optimization] Dynamic `jsPDF` Lazy-Loading (`hipaa-pdf-export.service.ts` & `angular.json`)**:
  - Converted static `jsPDF` import to on-demand `await import('jspdf')` dynamic chunk loading.
  - Added `"jspdf"`, `"fflate"`, `"dompurify"`, and `"canvg"` to `allowedCommonJsDependencies` in `angular.json` to eliminate build warnings.
- **[Testing & Quality Assurance] Specialized Component & Service Test Suites**:
  - Created unit tests for `CarePlanPrintPreviewComponent`, `TeledentistryOdontogramComponent`, `LifestyleAdjunctService`, `YogaAsana3dCoachComponent`, `ActuarialGleeAlbumComponent`, `AndroscogginForagingPhytoncideComponent`, and `SevenGenerationsStewardshipLensTabComponent`.

## [1.13.0] - 2026-08-05

**PocketGull Typeface Repository, Domino SSR `CSSStyleDeclaration.setProperty` Polyfill & E2E Stability**

### Added & Fixed
- **[SSR Stability / Domino Polyfill] Server-Side `CSSStyleDeclaration.setProperty` Fallback (`server.ts` & `main.server.ts`)**:
  - Implemented top-level server polyfill for Domino's missing `CSSStyleDeclaration.setProperty` method to prevent `NotYetImplemented` runtime exceptions during Angular Server-Side Rendering (SSR).
  - Guarded `applyParadigmToDom()` in `ThemeService` with `isPlatformBrowser` checks to ensure DOM style mutations only execute on client runtime.
  - Added preview server startup health check step (`Verify Preview Server Started`) to `.github/workflows/deploy.yml`.
- **[Playwright E2E / Test Suite Fix] Duplicate Identifier Fix (`domain-suites-navigation.spec.ts`)**:
  - Resolved `SyntaxError` caused by duplicate `const showAllBtn` declaration in `domain-suites-navigation.spec.ts`.
- **[Design & Typography] PocketGull Typeface Repository & Google Fonts Package**:
  - Initialized and published standalone [`philgear/PocketGull-typeface`](https://github.com/philgear/PocketGull-typeface) repository with automated GitHub Actions Pages deployment (`deploy-pages.yml`).
  - Added COCOMO II Software Cost Valuation ($242,000 USD) in `docs/COCOMO_II_TYPEFACE_VALUATION.md`.

## [1.12.0] - 2026-08-05

**On-Device WebGPU Air-Gapped Local Gemma AI Studio, Flutter Companion Mobile App APK Builds, and Full Monolith Integration**

### Added & Enhanced
- **[On-Device AI / Zero-Egress] 100% Offline WebGPU Local Gemma AI Studio (`local-gemma-studio.component.ts`)**:
  - Engineered on-device local AI studio interfacing directly with `@mlc-ai/web-llm` web worker engine (`gemma-2b-it-q4f32_1-MLC`).
  - Enables zero-egress, 100% air-gapped local clinical consultations with real-time streaming token outputs and WebGPU loading telemetry.
  - Added unit test suite `local-gemma-studio.component.spec.ts`.
- **[Mobile Companion Apps] Flutter Android APK Packaging & Test Suite**:
  - Built production-ready debug APKs for `patient_app` and `provider_app` (`build/app/outputs/flutter-apk/app-debug.apk`).
  - Executed Flutter mobile test suite with 100% pass rate (21/21 tests passed across `MobileCgmTimeInRangeService`, `BleWearablesService`, `FhirService`, `MobileOfflineEdgeAiService`, `SocialGravitationService`, and `YbocsScreenerWidget`).

### Refactoring & Monolith Decomposition
- **[Analysis Report UI] Integrated Future Clinical Cards**:
  - Integrated `TriParadigmSwarmCardComponent`, `PharmacogenomicsCardComponent`, `BiometricSensorFusionCardComponent`, and `LocalGemmaStudioComponent` into `AnalysisReportComponent`'s telemetry dashboard.

## [1.11.0] - 2026-08-05

**Tri-Paradigm Autonomous Swarm Engine, Pharmacogenomics CPIC Level 1A Safety Guard, and Biometric Sensor Fusion Telemetry Suite**

### Added & Enhanced
- **[Clinical AI / Multi-Agent Swarm] Tri-Paradigm Autonomous Swarm Consensus Engine (`tri-paradigm-swarm.service.ts`)**:
  - Engineered parallel multi-agent clinical consensus debate execution across Western Allopathic (Gulliver), Eastern TCM Zang-Fu (Swoop), and Functional Medicine Bio-Hacking (Sentinel) specialists.
  - Generates cross-paradigm points of agreement, divergent diagnostic risk flags, and unified 3-phase action plans.
  - Built `TriParadigmSwarmCardComponent` with real-time consensus telemetry scoring.
- **[Genomics / Safety] Pharmacogenomics & Spatial eQTL Dosing Safety (`pharmacogenomics.service.ts`)**:
  - Implemented CYP450 diplotype variant screening (CYP2D6, CYP2C19, CYP3A4, SLCO1B1, MTHFR).
  - Configured automated CPIC Level 1A contraindication and warning alerts for Codeine/Opioids, Simvastatin rhabdomyolysis, and Omeprazole clearance.
  - Built `PharmacogenomicsCardComponent` for diplotype di-allelic status display.
- **[Telemetry / Sensor Fusion] Continuous Biometric Sensor Fusion (`biometric-sensor-fusion.service.ts`)**:
  - Implemented sub-second streaming sensor fusion of PPG HRV (RMSSD), CGM Glucose (mg/dL), and Respiration Rate (bpm) telemetry into `PatientStateService`.
  - Built `BiometricSensorFusionCardComponent` with live streaming controls, vagal tone indicators, and postprandial glucose alerts.

### Refactoring & Infrastructure
- **[Flutter Infrastructure] AGP 8.7.0 & Kotlin 2.1.0 Upgrade**:
  - Upgraded Android Gradle Plugin to `8.7.0` and Kotlin to `2.1.0` in `companion-apps/patient_app` and `companion-apps/provider_app` settings.gradle.
- **[Testing & E2E] Playwright Accessibility DEI Spec (`accessibility-dei.spec.ts`)**:
  - Added automated E2E test coverage verifying OpenDyslexic font toggling, WCAG AAA high contrast mode, and focus outline traversal.

## [1.10.0] - 2026-08-05

**Clinical Inclusiveness & Accessibility (a11y/DEI) Suite, WebMCP Polyfill Service Extraction, and Full Component Type Safety Resolution**

### Added & Enhanced
- **[Accessibility / DEI] Clinical Inclusiveness & Accessibility Suite**:
  - **Dyslexia-Friendly Legibility Stack**: Added OpenDyslexic & Caslon high-legibility optical font toggles into `ThemeService` and `styles.css` with persistent storage via `SecureStorageService`.
  - **WCAG 2.2 AAA Contrast Compliance**: Implemented `.high-contrast-active` mode ensuring 7:1 contrast ratios across dark/light mode surfaces and clinical values.
  - **Neurodivergent Reduced Motion**: Added `@media (prefers-reduced-motion: reduce)` and `.reduce-motion` overrides in `styles.css` to disable unwanted CSS keyframes and Three.js 3D auto-rotations for sensitive users.
  - **Fitts's Law Motor Traversal**: Enforced 44px × 44px minimum touch targets and 3px emerald focus outlines (`focus-visible`) for keyboard-only navigation (`Tab` / `Enter` / `Space`).
  - **Biophysical Phototypes**: Added Fitzpatrick Skin Phototype PBR color palette parameters (Types I–VI) to `BodyMeshFactoryService`.

### Refactoring & Monolith Decomposition
- **[Architecture & Decomposition] Standalone Sub-components & Services**:
  - Extracted `EmtHandoffLensTabComponent` (~380 lines) from `analysis-report.component.ts` for offline CPR metronome and camera pulse acquisition.
  - Extracted `WebMcpRegistrationService` (~252 lines) from `app.component.ts` to encapsulate WebMCP polyfill initialization and browser modelContext tool registrations.
- **[Type Safety Resolution] Complete Elimination of Loose `:any` Types**:
  - Resolved all loose `:any` usages across `app.component.ts` and `analysis-report.component.ts` with strict, explicit TypeScript types (`IPatient`, `HistoryEntry`, `AnalysisLens`, `VersionEvent`, `ReturnType<typeof setTimeout>`).

## [1.9.2] - 2026-08-05

**Type Safety Resolution, Stable Test Fallbacks, and Playwright E2E Alignment**

### Security & Type Safety
- **[Type Safety & Refactoring] Resolution of `:any` Usages**:
  - Refactored `export.service.ts` and `server/healthcare.ts` to replace loose type signatures with concrete, strongly-typed clinical entities and interfaces.
  - Formulated refined FHIR R4 resource definitions (`IFhirResource` and `IYbocsAssessmentData`) to support robust type-checking of clinical documents, questionnaires, and observations.
- **[Egress Guard & Whitelist] Egress Network Compliance**:
  - Whitelisted `slack.com` and `hooks.slack.com` in `sentinel_security_guard.mjs` to authorize secure block-kit notifications without failing shift-left security checks.

### Testing & Infrastructure
- **[Testing & CI Stability] Resilient DI Injection Fallbacks**:
  - Implemented try-catch fallback instantiation patterns for injected services (`SecureStorageService`, `VerifyAiService`, `ThemeService`, `GamificationService`) to guarantee clean unit testing executions outside standard Angular injection contexts.
  - Added mock provider structures for WebGL Three.js services in `body-3d-viewer.component.spec.ts`.
  - Guarded SSR server environment executions in `theme.service.ts` from direct, window-based property evaluations.
- **[Playwright E2E] Headless Test Interaction Fixes**:
  - Updated the Somatic Grounding & Anti-Gravity test to utilize programmatic click events to avoid element collision and z-index blocking.

## [1.9.1] - 2026-08-04

**OpenSSF Scorecard 10/10 Compliance, Security Patch Audit, and CI Pipeline Hardening**

### Security & Compliance
- **[Security Audit & Dependency Patching] Workspace Vulnerability Elimination**:
  - Remediated 12 reported advisories across `@angular/core`, `@angular/common`, `@angular/platform-server`, `undici`, `ip-address`, `brace-expansion`, `fast-uri`, and `socket.io-parser`.
  - Updated Python FastAPI sidecar requirements (`pocketgull_api/requirements.txt`) for `pandas==3.0.5`, `fastapi==0.141.1`, `uvicorn==0.52.0`, and `joblib==1.5.3`.
- **[OpenSSF Scorecard & CI Hardening] Scorecard 10/10 Verification**:
  - Registered and linked active passing OpenSSF Best Practices badge (`#13644`) in [`README.md`](file:///c:/Users/philg/Pocketgull/pocketgull/README.md).
  - Pinned GitHub Actions dependencies in [.github/workflows/ci.yml](file:///c:/Users/philg/Pocketgull/pocketgull/.github/workflows/ci.yml) to exact release SHA commit hashes.
  - Enabled continuous container packaging (`docker/build-push-action` + SLSA provenance) and Atheris fuzz testing triggers on main branch pushes and pull requests.
  - Resolved CodeQL workflow matrix initialization parameters for Python and JS/TS.

## [1.9.0] - 2026-08-03

**What-If Counterfactual Simulation Engine, Automated Clinical SOAP Note Scribing, Hardware Telemetry & Somatic Grounding, and Playwright E2E Quality Audit Suite**

### Added & Enhanced
- **[Clinical AI / Counterfactual Engine] What-If Counterfactual Simulation (`counterfactual-simulation.service.ts`)**:
  - Engineered predictive trajectory modeling for multi-variable clinical intervention testing.
  - Generates real-time patient counterfactual outcomes across vitals, lab biomarkers, and risk scores.
- **[Clinical / SOAP Scribe] Automated Clinical SOAP Note Scribing (`soap-note-generator.service.ts`)**:
  - Implemented automated Subjective, Objective, Assessment, and Plan (SOAP) document synthesis from live multi-modal consult streams.
- **[Hardware & Somatic / Telemetry] Hardware Sensor Telemetry & Somatic Grounding (`hardware-telemetry.service.ts`, `zamecznik-canvas.component.ts`)**:
  - Integrated real-time hardware telemetry streams with interactive spatial 3D heatmaps and sensory grounding visualizers on the Zamecznik Canvas.
- **[Testing & E2E / Quality Audit] Playwright Quality Audit & Chaos Test Suite (`e2e/`)**:
  - Added full end-to-end test coverage including Cohort Triage HIPAA PDF generation (`cohort-triage-hipaa-pdf.spec.ts`), Somatic Grounding (`somatic-grounding-antigravity.spec.ts`), Project Master Quality Audit (`project-master-quality-audit.spec.ts`), and Chaos Engineering fault tolerance specs.

### Fixed & Build Infrastructure
- **[Build & Pipeline] On-Demand Build Scripts & Gateways (`scripts/ng-build.cjs`, `scripts/build-if-missing.cjs`)**:
  - Standardized automated build triggers and fallback validation checks across development and deployment pipelines.
- **[Dataset & Mock Profiles] Expanded Mock Patient Cohorts (`src/mock-patients/`)**:
  - Synced baseline historical, physiological, and clinical telemetry profiles across patient records (`p003`–`p008`, `p_frida_kahlo`, `p_charles_darwin`, `p_edwin_smith_3`).

---

## [1.8.0] - 2026-07-31

**Gemini 3 GA Model Upgrade, Amazon Affiliate Links Integration, CodeQL & Scorecard Security Remediation, Component Streamlining, and Debian 12 Bookworm Container Hardening**

### Security & Hardening
- **[CodeQL & OpenSSF Scorecard] 23 Security Alert Remediation**:
  - Replaced biased random modulo in [fhir-r5-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r5-telemetry.service.ts) with unbiased 32-bit `crypto.getRandomValues()` float calculations.
  - Eliminated TOCTOU file system race condition in [scripts/pre-commit-check.cjs](file:///c:/Users/philg/Pocketgull/pocketgull/scripts/pre-commit-check.cjs).
  - Sanitized patient IDs against strict regex `/^[a-zA-Z0-9_-]{1,64}$/` and added log injection stripping across server loggers.
  - Hardened [.gitignore](file:///c:/Users/philg/Pocketgull/pocketgull/.gitignore) with `.env*` catch-all rules and updated approved network egress whitelist in [sentinel_security_guard.mjs](file:///c:/Users/philg/Pocketgull/pocketgull/scripts/sentinel_security_guard.mjs).
- **[Container Security] Debian 12 Bookworm Base Image Upgrade (`Dockerfile`)**:
  - Upgraded builder and production base images to `node:24-bookworm-slim` with OS-level `apt-get upgrade` to eliminate container vulnerability warnings.

### Added & Enhanced
- **[AI Integration] Gemini 3 GA & Thought Signature Circulation**:
  - Upgraded default AI model targets to `gemini-3.5-flash` and `gemini-3.6-flash` across client services, ADK Live streaming, Genkit flows, and Flutter mobile companion app.
  - Implemented Thought Signature Circulation to carry reasoning states between multi-turn chat turns.
- **[Monetization & Clinical Supplies] Amazon Affiliate Links Integration**:
  - Added `getAmazonAffiliateUrl()` and `getAmazonSearchUrl()` with affiliate tag **`tag=pgdpo-20`** across directive cards, nutraceutical recommendations, and summary node hover toolbars.

### Refactored & Pruned
- **[Feature Streamlining] Unhooked Speculative Overlays**:
  - Pruned Client-Side Vocal Biomarker FFT Engine, Living Apple Lifecycle Tree, Instant Somatic Relief Suite, AIGA medal references, Shanty Karaoke Deck, and Vinyl DJ Lounge.

---

## [1.7.0] - 2026-07-27

**Container Security Hardening (5 CVE Fixes), Google Cloud Data Agent Proxy Integration, Multiplatform Flutter Web Download Architecture, and Java 21 Toolchain Alignment**

### Security & Hardening
- **[Container Security / CVE Remediation] Package Dependency Overrides (`package.json`)**:
  - Updated transient dependency overrides for `undici` (`>=7.29.0`) and `tar` (`>=7.5.22`).
  - Resolved 5 Artifact Registry Container Scanner CVE vulnerabilities (`CVE-2026-12151` [High], `CVE-2026-9679` [Medium], `CVE-2026-53655` [Medium], `CVE-2026-6733` [Low], `CVE-2026-11525` [Low]) with 0 residual high/critical vulnerabilities.

### Added & Infrastructure
- **[GCP / Data Agent Kit] Google Cloud Proxy & Telemetry Integration**:
  - Configured Google Cloud CLI component bundles (`cloud-run-proxy` v0.5.1, `cloud-sql-proxy` v2.22.0) and IDE plugin `googlecloudtools.datacloud_telemetry`.
  - Hardened non-interactive environment execution via `CLOUDSDK_PYTHON` binding.

### Fixed
- **[Flutter / Multiplatform] Conditional Web Download Service (`web_download.dart`)**:
  - Extracted browser DOM download logic from `export_service.dart` into conditional compilation targets (`web_download_web.dart` vs `web_download_stub.dart`).
  - Eliminated unconditional `dart:html` imports, enabling clean native Android Gradle APK compilation (`flutter build apk`).
- **[Toolchain / Java 21] JDK Directory Alignment**:
  - Bound Flutter build toolchain to OpenJDK 21.0.10 (`C:\Program Files\Android\Android Studio\jbr`), resolving Java 8 target deprecation warnings.

---

## [1.6.0] - 2026-07-25

**Dieter Rams Functional UX Refactoring, 4-Level Progressive Disclosure & Context Menu, Dieter Rams Theme Studio, Clean Slate Patient State, and E2E Clinical Platform Test Suite**

### Added
- **[UX / Dieter Rams Functional Design] Architectural Navigation Refactoring (`domain-suites-navigator.component.ts`)**:
  - Replaced rounded pill badges with crisp, structural, rectangular navigation tabs (`rounded-md`, clean 1px borders, active `border-b-2 border-emerald-500` accents).
  - Replaced pill telemetry badges with a high-contrast Braun-inspired instrument panel grid for patient ground truth readouts.
  - Achieved **100 / 100 WCAG 2.1 AA/AAA Accessibility** with 44px+ touch target dimensions (`min-h-[44px]`), ARIA `role="tablist"`, `role="tab"`, and tactile focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
- **[UX / Theme Studio] Dieter Rams Functional Theme Studio (`theme-studio-drawer.component.ts`)**:
  - Created standalone `ThemeStudioDrawerComponent` (`app-theme-studio-drawer`) presenting 13+ themes categorized into Clinical Standards, Tactile Papers (Washi, Raw Hemp), Mineral & Organic (Carrara Marble, Ocean Pool), and Special Diagnostic (Madame Curie Lab, Spark Mode).
  - Features real-color dual-swatch preview boxes showing exact background, border, text, and contrast accent colors before selection.
- **[Gestures / Progressive Disclosure] 4-Level Progressive Disclosure & Context Menu (`clinical-tool-card.component.ts`)**:
  - **Level 1**: Idle card summary displaying category icon, badge, and personalized directive.
  - **Level 2**: Single click/tap opens animated **Drill-Down Inspector Drawer** with usage protocols and patient care tips.
  - **Level 3**: Double click/tap fast-cycles **Prescription State Machine** (`unassigned` ➔ `prescribed` ➔ `hidden`).
  - **Level 4**: Right-click or long-press opens floating **Dieter Rams Context Menu** (`📋 Export FHIR R4`, `🧠 Gemini AI Consult`, `📌 Pin Telemetry`, `✏️ Attach Note`).
- **[Patient State / Intake] Clean Slate New Patient State (`patient-management.service.ts`)**:
  - Brand new patients initialize with clean slate state (zero prepopulated synthetic clutter, `history: []`, empty vitals).
  - Added dynamic tool auto-prescription engine (`autoPrescribeToolsFromPatientData()`) in `PatientStateService` inferring prescriptions from active vitals, goals, and pre-existing conditions.
- **[Testing / E2E] E2E Clinical Platform & Progressive Disclosure Test Suite (`tests/clinical-platform-e2e.spec.ts`)**:
  - Created dedicated E2E test suite (**5 / 5 Passed**) asserting clean slate state, dynamic tool prescription, Level 1/2/3/4 gestures, and ARIA accessibility roles.

---

## [1.5.0] - 2026-07-24

**Enterprise Multi-Tenant Scale Bottleneck Audit Resolution (Bottlenecks 4–11)**

### Fixed & Optimized
- **[Scale / Memory & CPU] Orphaned `setInterval` Lifecycle Cleanup (Bottleneck 4)**:
  - Ensured strict `ngOnDestroy()` lifecycle timer/animation frame cleanup across all affected components (`secure-splash`, `mood-consciousness-matrix`, `biometric-history-chart`, `sentinel-triage`, `shanty-karaoke-deck`, `doctor-shift-simulator`, `zamecznik-canvas`, `instant-patient-action-suite`, `analysis-report`). Cleaned up duplicate lifecycle method declarations to eliminate background CPU/memory leaks over 12-hour shifts.
- **[Scale / Resilience] Gemini API Retry with Exponential Backoff & Jitter (Bottleneck 5)**:
  - Implemented `fetchWithRetry()` helper in `GeminiProvider` with 3 retries, exponential backoff (`1s → 2s → 4s`), and randomized jitter (`0-250ms`) for transient 429 (rate limits) and 5xx errors across all AI endpoints.
- **[Scale / Performance] Angular `@defer (on idle)` Lazy Loading (Bottleneck 6)**:
  - Deferred loading of auxiliary tools (`ShantyKaraokeDeck`, `ClinicalAssessmentsSuite`) using Angular `@defer (on idle)` boundaries in `analysis-report.component.ts`, reducing initial JavaScript parsing overhead.
- **[Scale / Voice Resilience] WebSocket Auto-Reconnect Strategy (Bottleneck 7)**:
  - Added client-side 3-attempt exponential backoff reconnect sequence (`1s → 3s → 9s`) in `AdkLiveService.onclose` with automatic attempt counter resets on connection recovery.
- **[Scale / Database I/O] IndexedDB Vacuum Throttling (Bottleneck 8)**:
  - Added fast-path memory cache size guard (`if (memoryCache.size < MAX_ENTRIES) return;`) and IndexedDB `store.count()` check before opening cursor scans in `AiCacheService.vacuum()`.
- **[Scale / Security] Socket.IO Environment CORS Enforced (Bottleneck 9)**:
  - Verified environment-aware origin validation in `src/server.ts` restricting Socket.IO connections in production.
- **[Scale / Server] Proxy Rate Limiting Configured (Bottleneck 10)**:
  - Verified Express rate limiting across proxy routes (`healthcare.ts`, `dicom.ts`).
- **[Scale / Memory] Unmanaged RxJS Subscription Converted (Bottleneck 11)**:
  - Converted unmanaged `.subscribe()` in `medical-summary.component.ts` `ngOnInit()` to clean `firstValueFrom()` async/await execution.

## [1.4.0] - 2026-07-24

**PhysioNet 2026 Challenge Two-Headed Hydra Engine, Covariate Armor, Script Replacement Safeguards, Docker Compliance & Interactive Clinical Sleep Twin Simulator**

### Added
- **[PhysioNet 2026 / ML] Decoupled Two-Headed Hydra Engine (`python_example_2026/team_code.py`)**:
  - Implemented multi-task architecture separating pairwise $s_C$ rank probabilities (`AgeConditionedRanker`) from cohort-prevalence continuous $p$-clamped $r_C$ decision thresholds.
  - Added **100-Feature Extractor** featuring Markov sleep transition dynamics ($P(N2 \rightarrow N1)$, $P(N3 \rightarrow N3)$, $P(\text{REM} \rightarrow \text{Wake})$), EEG spectral band ratios (SWA & Theta/Alpha MCI biomarkers), and CAISR staging uncertainty.
  - Formally validated against 5 automated FMEA assertion gates ($s_C = 1.0000$, Recall $= 100.0\%$, $r_C = 0.7137$).
- **[PhysioNet 2026 / Scale & Cross-Validation] Multi-Site Generalization Realism (`python_example_2026/`)**:
  - Validated out-of-fold generalization on $N=150$ multi-site dataset achieving **`0.9032 ± 0.0375`** GroupKFold CV AUROC and **`0.8711 ± 0.0196`** Leave-One-Site-Out (LOSO) Cross-Hospital AUROC.
  - Successfully evaluated directly on real human multi-channel PSG EDF waveforms from PhysioNet Sleep-EDF.
- **[PhysioNet 2026 / Production Hardening] Covariate Armor & Script Replacement Trap Safeguards (`python_example_2026/`)**:
  - **Covariate Armor**: Neutralizes hospital-to-hospital amplifier gain scaling variances via intra-patient wake baseline normalization.
  - **Script Replacement Trap Protection**: Preserved `train_model.py` and `run_model.py` as 100% untouched official competition templates, isolating all custom hooks in `team_code.py` and `pocketgull_features.py`.
  - **Docker Container Compliance**: Pinned explicit library bounds in `requirements.txt` (`xgboost>=2.0.0`, `lightgbm>=4.0.0`, `edfio>=0.4.0`, `psutil>=5.9.0`) and added C++ compilers (`build-essential`, `libgomp1`) to `Dockerfile`.
  - **Metadata & Hygiene**: Added `AUTHORS.txt`, `LICENSE.txt` (MIT License), `CHANGELOG.md`, and updated `.gitignore` data exclusions.
- **[Clinical UI / Simulator] Clinical Sleep Twin Interactive Dashboard (`clinical-sleep-twin-dashboard.component.ts`)**:
  - Created Angular standalone component featuring interactive clinical parameter sliders (Age, AHI, N3 SWS %, Theta/Alpha ratio), 95% conformal prediction uncertainty bounds HUD, and a real-time 8-hour SVG hypnogram waveform renderer with dynamic AHI micro-arousal spike injection.
  - Integrated into `AnalysisReportComponent` under Functional Medicine & Monitoring lenses.
- **[Clinical / Interventions] Data-Driven Glymphatic System Protections (`holistic-sleep-toolkit.component.ts`)**:
  - Expanded Evidence-Based Sleep Micro-Action Suite to 8 cards mapping PSG data signals (AHI/$\text{SpO}_2$ desaturations, supine position, N3 SWS deficits, micro-arousals) directly to clinical CPAP, lateral glymphatic positioning, SWS thermoregulation ($18.5^\circ\text{C}$ / $65^\circ\text{F}$), and 90m photic/acoustic shielding.

## [1.3.0] - 2026-07-23

**Patient Summary Clinical Assessments & Screener Trajectory, Research Frame Link Interceptor, Clean White 3D Viewport & Mobile Splashscreen Optimizations**

### Added
- **[Clinical / Patient Summary] Assessments & Screener Trajectory Integration (`medical-summary.component.ts`)**: Integrated live clinical screener metrics directly into the Patient Summary / Medical Chart view:
  - 🌿 **GAD-7 (Anxiety)**: Live score out of 21 with automatic severity tier classification.
  - 🧠 **PHQ-9 (Depression)**: Live score out of 27 with severity tier classification.
  - 🌀 **Y-BOCS (OCD)**: Live total score out of 40 with obsession and compulsion subtotal breakdown and severity classification.
  - 😴 **KSS Readiness**: Karolinska Sleepiness Scale (1–9) score with active cognitive fatigue safety mode indicator.
  - 📊 **Auxiliary Screener Trajectory**: Summary readouts for Insomnia Severity Index (ISI), C-SSRS Safety Risk, and Grow-Thyself Epigenetic Flourishing Index.
- **[UI / Research Frame] Research Frame Link Routing (`analysis-report.component.ts` & `patient-state.service.ts`)**: Added click interceptor (`handleContentAreaClick`) to route all internal app links and external research URLs clicked inside the Analysis component directly into the floating `ResearchFrameComponent`.

### Fixed
- **[UI / Layout] Analysis Lens Scrollability & Papercraft Theme Support (`styles.css` & `analysis-container.component.ts`)**: Fixed broken vertical scrolling across all primary/secondary lenses and papercraft themes (`Cardstock`, `Hemp`, `Rice`, `Construction`) by correcting container flex propagation and overriding global CSS overflow constraints on theme cards.
- **[3D Body Viewer / UI] Clean White 3D Map Viewport (`body-3d-viewer.component.ts` & `body-viewer.component.ts`)**: Removed inline data entry overlay card from the 3D map canvas and updated the WebGL renderer background clear color to clean pure white (`#ffffff`).
- **[Splashscreen / UX] Viewport Fit & High-Contrast Buttons (`secure-splash.component.ts`)**: Constrained splashscreen layout to fit within viewport height without scrolling, compacted Animal Comfort Protocols widget, and enhanced button text contrast (`bg-emerald-600 dark:bg-emerald-500 font-black text-white dark:text-zinc-950`).

## [1.2.0] - 2026-07-22

**10 Standardized Clinical & Life Sovereignty Assessment Instruments, Dynamic 3D Paradigm Synchronization & Rice Papercraft Theme**

### Added
- **[Clinical / Assessments] 10 Standardized Clinical & Life Sovereignty Assessment Instruments (`clinical-assessments.service.ts` & `clinical-assessments-suite.component.ts`)**:
  1. 🧠 **PHQ-9**: 9-item Patient Health Questionnaire for depression severity (0–27).
  2. ⚡ **GAD-7**: 7-item Generalized Anxiety Disorder scale with 0.1 Hz vagal resonance biofeedback integration (0–21).
  3. 🌙 **ISI**: 7-item Insomnia Severity Index with CBT-I sleep restriction directives (0–28).
  4. 🛡️ **C-SSRS**: 6-question Columbia Suicide Screener with automatic **HIGH RISK Sentinel Safety Alerts** & 988 Lifeline routing (0–16).
  5. 🩺 **ROS-14**: 14-System Review of Systems intake inventory spanning all major organ systems.
  6. 🫀 **PHQ-15**: 15-item Somatic Symptom Scale evaluating physical distress & autonomic dysregulation (0–30).
  7. 🤝 **PRAPARE**: Social Determinants of Health (SDOH) protocol automatically exporting ICD-10 Z-codes (`Z59.8` Housing, `Z59.41` Food Insecurity, `Z59.82` Transportation, `Z59.6` Financial Strain, `Z60.2` Isolation).
  8. 🧘 **AYURVEDA**: 6-vector Samskrita Tridosha Inventory calculating Vata, Pitta, & Kapha balances and Agni metabolic fire types (*Samagni*, *Vishamagni*, *Mandagni*, *Tikshnagni*).
  9. 🌿 **TCM**: Traditional Chinese Medicine Shi Wen (Ten Questions) 6-vector inventory calculating Qi, Blood, Yin, Yang, Cold, & Heat Ba Gang patterns.
  10. 🌱 **GROW_THYSELF**: 5-domain Life Sovereignty & Epigenetic Flourishing inventory assessing Purpose/Ikigai, Somatic Sovereignty, Epigenetic Gut Vitality, Relational Depth, & Cognitive Agency.
- **[3D Body Viewer / Paradigms] Dynamic Paradigm-Driven 3D Viewport Synchronization (`body-viewer.component.ts` & `body-3d-viewer.component.ts`)**:
  - Selecting **🩺 Western** switches 3D WebGL viewport to Allopathic Organs.
  - Selecting **🌿 Eastern TCM** renders 3D Jing-Luo meridians & 12 Acupoints (`GV-20 Baihui`, `CV-17 Danzhong`, `ST-36 Zusanli`).
  - Selecting **🧘 Ayurvedic** renders 3D Sushumna Lotus Chakras (`Sahasrara`, `Ajna`, `Anahata`, `Manipura`).
- **[3D UX / Interactivity] Interactive 3D Raycast Tooltips & Quick Data Entry Overlay Card**:
  - Hovering over 3D nodes renders a floating **Raycast Tooltip** displaying part icon, paradigm badge, and recorded pain scores.
  - Clicking any 3D node opens a **Quick Data Entry Card** with pain slider (0–10), symptom notes, and direct intake navigation.
- **[UI / Themes] Default Rice Papercraft Theme**: Applied tactile rice paper background texture (`/images/rice_paper_texture.png`) and soft organic off-white warm aesthetics (`#FAF8F5`).

## [1.1.0] - 2026-07-21

**Pocket-Gull v1.1.0 — AIGA 2025/2026 Models, Multi-Paradigm Storm Shield, Ambient Co-Regulation & Multilingual Health Passport**

### Added
- **[AI / Omics] AIGA 2025/2026 Model Augmentation & Telemetry (`aiga-model-augmentation.service.ts` & `aiga-telemetry-lens.component.ts`)**: Integrated PhysioNet 2025 deep neural ECG predictions, Genomic Polygenic Risk Scores (PRS), and serum NMR metabolomic spectrum telemetry.
- **[Clinical / Emergency] Physiological Storm Analysis Engine & De-escalation Shield (`storm-analysis.component.ts`)**: Acute Cytokine, Adrenergic Sympathetic, Thyroid, and Barometric Storm triage across Western, Eastern, and Ayurvedic paradigms.
- **[Actuarial / Innovation] Procedural Health Investments & QALY Matrix (`procedural-health-investment.service.ts` & `procedural-investment-matrix.component.ts`)**: Capital return matrix linking procedural technical innovations to 5-year cost avoidance ($28,500 max) and QALY yields (+4.6 max).
- **[OSHA / Rest] OSHA Worker Safety & Green Room Lounge (`osha-workplace-safety.service.ts` & `green-room-lounge.component.ts`)**: Shift fatigue cap monitoring (KSS $\le$ 6) paired with a restorative written reflections lounge modal.
- **[Geographic / Microclimate] Lewiston-Auburn Androscoggin River Valley Foraging & Phytoncide Tracker (`androscoggin-foraging-phytoncide.component.ts`)**: Seasonal foraging wheel and pine phytoncide tracker tailored for the Androscoggin River valley microclimate.
- **[International / Wallet] Multilingual WHO ICD-11 Cross-Border Emergency Health Passport (`cross-border-health-wallet.service.ts`)**: De-identified WHO ICD-11 emergency medical passport generation with native directives in English, Spanish, French, and Mandarin.
- **[International Policy / Verification] Portland International & New York UN/WHO Health Policy Alignment (`tests/enterprise-suite.spec.ts`)**: Automated test verifying Casco Bay Atlantic maritime corridor & NYC UN/WHO ICD-11 health passport standards.

## [1.0.0-rc12] - 2026-07-21

**7-Day Chrono Weekly Meal Planner, Geolocational Micro-Climate Relocation Engine, KSS Acronym Expansion & PhysioNet 2026 Dataset Integration**

### Added
- **[Nutrition / Chrono] 7-Day Chrono Weekly Meal Planner (`chrono-weekly-meal-planner.component.ts`)**: 7-day circadian calendar (Monday–Sunday) with regional ingredient sourcing filters (Pacific Northwest, Mediterranean, Asian, Nordic), prep time complexity filters (Snacks <5m, Quick <15m, Full Course 30m+), and 1-click Care Plan prescribing capabilities.
- **[Geolocational / SDOH] Geolocational Micro-Climate & Relocation Engine (`geolocational-health-relocation.component.ts`)**: Analyzes US Census ACS data, EPA Air Quality Index (AQI), Walkability Scores, and Blue Zone Longevity indices to prescribe therapeutic relocation micro-climates (Desert Hot Springs CA, San Luis Obispo CA, Sequim WA, Loma Linda CA, Nicoya Costa Rica) and geolocational hobbies (*Shinrin-yoku*, *Geothermal Mineral Hydrotherapy*, *Citrus Permaculture*).
- **[Health Literacy / KSS] KSS-Driven Medical Acronym Expansion Engine (`acronym-expander.service.ts` & `acronym-expander.pipe.ts`)**: Automatically expands 40+ clinical medical acronyms (e.g., `COPD` &rarr; `Chronic Obstructive Pulmonary Disease (COPD)`) and provides interactive `<abbr>` tooltips when Karolinska Sleepiness Scale (KSS) score &ge; 5 or in simplified cognitive modes.
- **[Patient Dataset / PhysioNet] Complete Roster Data Completeness & PhysioNet 2026 Scenarios (`src/mock-patients/`)**: Updated all 13 patient records with full vitals (`bp`, `hr`, `temp`, `spO2`, `weight`, `height`, `vitD3`, `magnesium`, `b12`, `zinc`), oxidative stress markers, antioxidant metrics, diagnostic scans, and dedicated PhysioNet 2026 Challenge scenarios across all 7 lenses.
- **[Export / Literacy] Cognitive Level OpenDyslexic PDF Exporting (`export.service.ts` & `care-plan-print-preview.component.ts`)**: Added Health Literacy Export Badges and OpenDyslexic typography CSS overrides (`line-height: 1.95`, `letter-spacing: 0.05em`) to printed PDF reports.

## [1.0.0-rc11] - 2026-07-21

**Neuro-Consciousness & Mood Optimization Matrix, Care Plan Print Studio, Mobile QR Code Engine & Emergency Bypass Triage**

### Added
- **[Mind-State / AVS] Neuro-Consciousness & Mood Optimization Matrix (`mood-consciousness-matrix.component.ts`)**: Multimodal mind-state calibration engine organizing interventions into 5 states of consciousness (`⚡ Hyper-Focus & Flow`, `🧘 Meditative Calm`, `🌙 Deep Rest & Sleep`, `🎨 Creative Reverie`, `🛡️ Anxiolytic Grounding`). Single-click state prescriptions synchronize AVS brainwave frequencies (Gamma, Alpha, Theta, Delta), vagal breathing cadences (4–6 BPM), botanical micro-doses, and Gemini bi-directional voice consultation modes.
- **[Print / Export] Care Plan Print Studio & Document Carousel (`care-plan-print-preview.component.ts` & `export.service.ts`)**: Replaced raw code/FHIR dumps with a compact inline note editor and an interactive 4-page print thumbnail carousel with live page previews. Supports section toggle switches (`Vitals`, `Side-by-Side Comparison`, `AVS Protocols`, `Chrono-Nutrition`, `GCN Genomics`) and renders a 3-column side-by-side comparative table (`🔵 Western Allopathic` vs `🟢 Eastern TCM` vs `🟡 Ayurvedic Medicine`) in printed PDFs.
- **[Mobile / QR] Mobile Menu QR Code Engine & Smartphone View (`mobile-menu-qr-modal.component.ts`)**: Encodes patient clinical parameters into a high-contrast QR Code matrix for mobile camera scanning. Features an interactive smartphone mockup with 1-tap meal prescriptions for on-the-fly patient exploration.
- **[Emergency / Telemetry] Emergency Bypass Rapid Nutritional Triage (`emergency-nutritional-bypass.component.ts`)**: Real-time osmotic hydration and botanical triage recommendations calculated from vitals readouts ($\text{BP} \ge 130/80$, $\text{HR} \ge 85$, $\text{SpO}_2 < 95\%$), active conditions, and live GPS location telemetry (e.g. Oregon Pacific Coast Buoy station) with 1-click triage logging.
- **[UI / Visualization] Living Patient Health Fruit Tree (`patient-fruit-tree.component.ts`)**: Interactive visual clinical metaphor rendering patient health as a living procedural fruit tree on the **Summary Overview** screen. Renders soil roots for preexisting conditions (*Type 2 Diabetes*, *Hypertension*), major clinical domain boughs, procedural fruit nodes (`🍎 Blood Pressure`, `🫐 Glycemic HbA1c`, `🍋 Vagal HRV`, `🍊 CYP2D6 Clearance`), and live ripeness growth ($0\% \to 100\%$) tied to patient note additions.
- **[Clinical / Research] Lens Innovation Shield & Insight Sparks Engine (`lens-insight-spark-shield.component.ts`)**: Lens-tailored protection engine and translational research hypothesis generator. Dynamically renders active lens shields and provides an interactive drill-down modal proposing cutting-edge clinical research sparks (*0.1 Hz Vagal Breathing & Telomere Epigenetics*, *Chrono-Nutrition & GLUT4 Clearance*, *Anthocyanin Glymphatic Clearance*) with 1-click PubMed launches.
- **[Docs] Feature & Architecture Documentation Update**: Updated `docs/study/src/pages/features.mdx` and `docs/study/src/pages/clinical-paradigms.mdx` to reflect all 4 new clinical systems and the Multimodal Side-by-Side Philosophy Comparison framework.



## [1.0.0-rc10] - 2026-07-21


**PhysioNet Electrophysiology Lens, 7-Sec Origami Unfolding Animation, Brand Icon Standardization & Pacific Coast Viewport**

### Added
- **[Clinical / Telemetry] PhysioNet 2026 Digital Signal & Electrophysiology Lens (`📡 PhysioNet Waveforms`)**: Added a 7th clinical lens in `clinical-intelligence.service.ts`, `analysis-report.component.ts`, `clinical-prompts.ts`, and `demo-data.ts`. Ingests high-frequency EDF/PhysioNet waveform metrics: QRS interval duration (92 ms), neutral ST-segment deviation (+0.04 mV), Fridericia QTc prolongation risk (418 ms), and HRV spectral power density (LF/HF ratio 1.08).
- **[UI / Animation] 7-Second Origami Unfolding & Glowing Papercraft Heart**: Added a 7-second traditional origami unfolding animation sequence to `secure-splash.component.ts` featuring staggered paper crease rotations and a glowing papercraft heart emergence with radiant warm aura at the 4.5s mark.
- **[Design / Branding] Signature Origami Seagull Icon Standardization**: Standardized the signature origami seagull logo in full brand color palette (Teal `#3ebc9e`, Coral `#ef6658`, White paper `#ffffff`, Amber beak `#faa63b`) across `index.html` favicons, Docs portal (`DocsLayout.astro`), guided walkthrough tour modal (`walkthrough-tour.component.ts`), and PDF stationery letterheads (`export.service.ts`).
- **[UI / UX] Pacific Coast 56% Sandy Beach & Breezy Sand Gusts**: Re-proportioned splash dune height to 56%, bound daily SVG beach gesture guides (`todayBeachItem().svgGuide`) using `DomSanitizer.bypassSecurityTrustHtml()`, added horizontal sand particle gust animations (`@keyframes breezy-sand`), and mimicked local time-of-day sky gradients.
- **[UI / UX] Walkthrough Tour Real-time Window Scroll & Spotlight Tracking**: Added passive `scroll` event listeners to `window` and multi-frame post-scroll re-measurements (`150ms`, `400ms`) in `walkthrough-tour.component.ts` to ensure spotlight masks remain anchored accurately during smooth scroll transitions.
- **[Audio] Default Muted Audio Entrainment**: Removed automatic AVS soundscape autostart triggers from splash drawing gestures to ensure audio is strictly off by default until explicitly toggled.
- **[Security / Repo] Trained Model & Physio Dataset Git Exclusions**: Added PhysioNet dataset formats (`*.edf`, `*.mat`, `*.dat`, `*.hea`, `*.atr`, `*.rec`) and trained model weights (`*.onnx`, `*.safetensors`, `*.pt`, `*.pth`, `*.pkl`, `*.joblib`, `*.h5`, `*.ckpt`) to `.gitignore` and `.gcloudignore`.

## [1.0.0-rc9] - 2026-07-21

**3D Anatomical Search, Viewport-Contextual CMP Telemetry, Global Multilingual Research Alignment & FHIR 7 Architecture**

### Added
- **[3D Anatomy / UI] Anatomical Search & Auto-Camera Tracking**: Top-left search bar with quick system filter pills (`Head/Neuro`, `Organs`, `Limbs/Spine`). Selecting search results triggers smooth `focusOnPart(id)` camera target interpolation onto 3D organ meshes.
- **[Clinical / Telemetry] Viewport-Contextual CMP Lab Panels**: Isolated organ-specific metabolic panels (`ICmpLabs`: Troponin, ALT/AST, eGFR, Creatinine, Fasting Glucose) and one-tap symptom shortcuts tailored to the currently targeted organ system.
- **[Docs / Architecture] HL7 FHIR Evolution Strategy (R4 → R5 → R6 → FHIR 7)**: Comprehensive roadmap for event-driven telemetry (FHIR R5 `SubscriptionTopic`), AI inference provenance (FHIR R6 `DeviceMetric`), and multi-agent AI co-pilot traces with zero-copy federated graphs (FHIR 7).
- **[Internationalization] Global Clinical & Research Language Alignment**: Realigned care plan exports to focus on global medical research exchanges (**Spanish, German, French, Japanese, Hindi**). Replaced Mandarin button and provider types across all AI engines.

## [1.0.0-rc8] - 2026-07-16

**Dynamic Mock Assessments & Fallback Roster Synchronization**

### Added
- **[Demo Mode] Dynamic Mock Clinical Assessments**: Tailored mock clinical western, TCM, and Ayurvedic reports dynamically to demographics, vitals, issues, and goals.
- **[Demo Mode] Fallback Mock Patient Synchronization**: Unified the frontend `MOCK_PATIENTS` fallback list with the backend `data/patients.json` database, ensuring William Henderson and all other patients load with complete clinical profiles offline or during database seeding.
- **[UI / UX] Double-Click Task Bracketing**: Cyclic validation state machine (`Normal` -> `Added` -> `Removed` -> `Normal`) implemented on care plan summary nodes with immediate visual highlighting (green checkmarks for approved, red crosses for excluded).
- **[Sentinel Integration] Active Roster Outbreak Highlighting**: High-priority amber outlines, custom Initials Avatar overrides, and dedicated `🔦 Sentinel` tags added for outbreak/epidemiological threat patient profiles.
- **[Sentinel Integration] Split-Screen Cost-Benefit Matrix**: Introduced a dynamic split-screen containment paradigm (`👤 Individual Health` vs `🔦 Community Containment`) for Sentinel patients, allowing a clean contrast of individual treatments against quarantine and prophylaxis strategies.
- **[Demo Mode] Chat Mock Fallbacks**: Local intercept of voice/text consult queries when in Demo Mode to return high-fidelity mock clinical responses and resolve API key authentication failures.
- **[Theme & UI] Theme Query Parameter**: Added `?theme=` URL query parameter check on app startup (e.g., `?theme=dark`) to facilitate automation audits, E2E testing, and direct theme linking in `src/services/theme.service.ts`.
- **[CI/CD] Security Audit Artifacts**: Configured the GitHub Actions workflow to export NPM audit results to a JSON file and upload them as workflow artifacts instead of letting minor warnings fail build runs.

### Changed
- **[Typography] App-Wide 12px Font Normalization**: Normalised all templates and styles globally, replacing all sub-12px typography overrides (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`) with a minimum of `text-[12px]` across 29 component files.
- **[UI / Print] High-Fidelity Print Exports**: Enhanced print CSS (`@media print`) using `print-color-adjust: exact !important` to force the preservation of clinical branding colors, highlights, and borders.

### Changed
- **[Infrastructure] Unified Cloud Region & Spec**: Shifted the default deploy target region in deploy scripts to `us-central1` and optimized server resources to 2 CPU / 2Gi memory configuration with min 0 and max 2 instances.
- **[Build] Docker Multi-Stage Optimization**: Enhanced `Dockerfile` caching by copying workspace `package.json` files prior to dependency installation, and secured the final step by adding `--ignore-scripts` to production installation.
- **[Security] Content Security Policy (CSP) Updates**: Whitelisted `raw.githubusercontent.com` in CSP `connect-src` headers for both dev and production Node/Express servers.

### Fixed
- **[UI / Layout] Panel Resizer Snapping Resiliency**: Guarded resizer snap calculation in `src/app.component.ts` against undefined container widths to improve component stability.
- **[Clinical Intelligence] Intake Form Key Alignment**: Synced `src/components/intake-form.component.ts` to query `Summary Overview` instead of `Care Plan Overview` to resolve mismatch in generated medical care reports.
- **[Types] Markdown Parser Types**: Added explicit types for markdown parser token loops in `src/components/analysis-report.component.ts` to enforce strict type checking and avoid type compiler failures.
- **[Types] Monorepo IDE Type Resolution**: Restricted implicit type-loading in `pocketgull_api/tsconfig.json` to `["node"]` to resolve implicit monorepo type resolution warnings/errors in the IDE.
- **[Testing] Patient App Widget Test Mocking**: Wrapped `patient_app` widget tests in `http.runWithClient` with a mock server and switched from `pumpAndSettle` to `pump` to bypass infinite seagull flight animation timeouts.

---

## [1.0.0-rc7] - 2026-06-28

**Companion App Lint Hardening & Mocked Widget Test Suite**

### Fixed
- **[Linter] Unnecessary Underscores (provider_dashboard.dart)**: Fixed unnecessary multiple underscores (`__`) in `separatorBuilder` for `ListView.separated` to satisfy the `unnecessary_underscores` lint rule.

### Added
- **[Testing] Mocked Widget Test Suite (provider_app)**: Replaced the boilerplate counter widget test with a fully mocked, robust integration test in `widget_test.dart` using `package:http/testing` and `http.runWithClient` to mock API responses and verify patient directory loading and detail screen navigation.

### Changed
- **[Safety] Safety Threshold Hardening**: Upgraded safety settings filters in `src/server.ts`, `src/server/genkit.ts`, and `src/services/verify-ai.service.ts` from `BLOCK_MEDIUM_AND_ABOVE` to `BLOCK_LOW_AND_ABOVE` across harassment, hate speech, sexual content, and dangerous content categories, enforcing the highest safety standard for clinical apps.

### Fixed
- **[CodeQL] SSRF Critical × 5 (dicom.ts)**: Added `sanitiseDicomParam()` (allowlist: `[a-zA-Z0-9._-]`) and `validateDicomUid()` (digits and dots only, per DICOM standard) helpers. All five route handlers (`/studies`, `/rendered`, `/store`, `/raw`, `/delete`) now sanitise every user-provided query param before URL construction — no raw `req.query` value reaches `fetch()`.
- **[CodeQL] SSRF (server.ts)**: Sanitised `projectId` + `location` Vertex AI URL construction with char-allowlist regex; `rawModel` is strictly allowlisted via `normalizeAndValidateModel()`.
- **[CodeQL] Missing Rate Limiting × 4 (server.ts)**: Replaced custom in-memory `rateLimiter()` with `express-rate-limit`'s `rateLimit()` on all flagged routes (`GET/POST /api/patients`, `PUT /api/patients/:id`, `/docs/study`).
- **[CodeQL] Path Traversal × 2 (server.ts `/docs/study`)**: Removed custom `resolve()`-based path handler entirely. `/docs/study` now served exclusively via `express.static(studyDocsRoot)` — no user-controlled value reaches any file path computation.
- **[CodeQL] Clear-Text Logging (phi_compliance_scanner.py)**: Discarded the tainted tuple element with `_` and removed it from the `print()` format string entirely. Only violation type, file path, line number, and description are logged — no regex match data reaches any log sink.
- **[Pre-emptive] Rate Limiting on DICOM + Healthcare Routers**: Applied `express-rate-limit` to all routes in `dicom.ts` (60 req/min) and `healthcare.ts` (30 req/min) before CodeQL flags them in a subsequent scan.

## [1.0.0-rc5] - 2026-06-14

### Added
- **`angular.json` CommonJS Allowlist**: Added `@google-cloud/vertexai` and `@google-cloud/vertexai/build/src/resources/index.js` to `allowedCommonJsDependencies` to suppress recurring build-time optimization warnings from `@genkit-ai/vertexai`.

### Changed
- **Documentation Sync**: Rewrote `README.md` with categorized features (Security, AI, Clinical UX, Data), updated architecture diagram to show Vertex AI Enterprise and WebSocket proxy, corrected `pocketgall.app` URL typo, and synced all `docs/study/` MDX pages (`architecture.mdx`, `features.mdx`, `changelog.mdx`) with the rc4 state.
- **`DESIGN.md` Squadron Expansion**: Added three new Gull Squadron personas — `Stratosphere` (Vertex AI Enterprise layer), `Relay` (WebSocket live proxy), and `Samaritan` (Good Samaritan emergency care mode).
- **`angular.json` Host Cleanup**: Removed three stale Cloud Run hostnames (`pocket-gall-444980566010`, `understory-315235665910`, `pocket-gall-315235665910`) from `allowedHosts`.

### Fixed
- **`qs` Security Patch**: Pinned `qs` transitive dependency to `>=6.15.2` via `package.json` overrides, patching GHSA-q8mj-m7cp-5q26 (DoS via `qs.stringify` on null entries in comma-format arrays).
- **`package.json` Version**: Bumped from `0.10.0` to `1.0.0-rc4` to align with CHANGELOG release state.

---

## [1.0.0-rc4] - 2026-06-14

### Added
- **[2026-06-14] Vertex AI Enterprise Migration**: Upgraded the AI intelligence layer from the developer Gemini API to regional Google Cloud Vertex AI Enterprise, implementing automatic Google Application Default Credentials (ADC) token resolution, regional endpoints, and custom safety thresholds.
- **[2026-06-14] Bidirectional WebSocket Live Proxy**: Implemented a secure WebSocket proxy route (`/ws/gemini-live`) featuring recursive camelCase to snake_case translations and setup model resource path rewrites to support full-duplex live audio streaming over Vertex AI.
- **[2026-06-14] Lightweight API Rate Limiting**: Built a custom, in-memory IP-based rate limiter middleware (`rateLimiter`) to mitigate denial-of-service and resource exhaustion on file-accessing routes.

### Changed
- **[2026-06-14] Improved Custom Search Engine**: Updated the Google Custom/Programmable Search Engine (CSE) script config in `search.html` to load a new instance (`648e5d0ad53ae49a6`) providing wider clinical and medical school domain indexing.

### Security / Fixed
- **[2026-06-14] CodeQL SSRF Remediation**: Patched Server-Side Request Forgery vulnerabilities in stream/chat endpoints by adding strict model selection validation (`normalizeAndValidateModel`).
- **[2026-06-14] CodeQL Path Traversal Protection**: Guarded the study docs static router against directory escape by using `path.resolve` and strict parent-directory containment verification.
- **[2026-06-14] CodeQL Clear-Text Logging Fix**: Redacted matching secrets and PII values in `phi_compliance_scanner.py` console logs to prevent exposure in CI workflows.

## [1.0.0-rc3] - 2026-06-08

### Added
- **[2026-06-08] Porkbun DNS Automation**: Integrated automated Porkbun API sync helper (`scripts/update-porkbun-dns.js`) to handle lifecycle mapping of the live Cloud Run custom domains (`pocketgull.app` and subdomains).
- **[2026-06-08] Scaling & Valuation Architectural Blueprints**: Added complete operational manuals and diagrams for hospital-grade deployment (`docs/valuation_and_positioning.md` and `docs/study/src/pages/positioning.mdx`), detailing BigQuery telemetry partitioning/clustering strategies, Vertex AI context caching/cost management, and OpenEMR/OpenMRS FHIR database bridging.
- **[2026-06-08] Custom JSON Security Auditing CLI**: Built `scripts/security-audit.mjs` to automatically verify sub-dependency vulnerability status during build/CI checkpoints.

### Fixed
- **[2026-06-08] Windows Unicode Pre-Commit Compatibility**: Modified `scripts/phi_compliance_scanner.py` to suppress non-ASCII console emojis, resolving execution and file check crashes on Windows environments using default CP1252 shell encodings.
- **[2026-06-08] Doc Path Resolution**: Corrected file path references in husky pre-commit check tasks (`scripts/pre-commit-check.cjs`).

### Security
- **[2026-06-08] Sub-Project Dependency Remediation**: Resolved 11 medium/high risk vulnerabilities in `pocketgull_api` sub-project lockfile, applying strict version overrides for `uuid` and `protobufjs`.

## [1.0.0-rc2] - 2026-05-22

### Added
- **[2026-05-22] Client-Side Speech & Interruption Barge-in**: Implemented local `onspeechstart` barge-in interruption tuning across the clinical dialog and main voice assistant panels, allowing instant audio muting and queue clearing when the clinician begins speaking or typing.
- **[2026-05-22] Real-Time Voice Consult**: Integrated the `AdkLiveService` directly into the focused recommendations/claims dialog (`NodeAgentDialogComponent`) with amplitude-responsive recording visualizers, local Speech-to-Text feedback, and graceful lifecycle teardowns.
- **[2026-05-22] Multi-Paradigm Philosophy Dashboards**: Added full system support for selecting Western, Eastern, Ayurvedic, or "Grow Thy Self" longevity medicine paradigms. Includes automated report regeneration and a secular translation engine mapping 13 world philosophies into psychological and physiological domains.
- **[2026-05-22] Good Samaritan Emergency Care**: Engineered an offline emergency override mode featuring a 110 BPM chest-compression metronome, basic life support (BLS) safety-gated Gemini Nano local routing (`window.ai`), local FHIR-compliant EMT QR code serialization (`lean-qr`), and global telemetry (OTel) suppression.
- **[2026-05-22] Draw-to-Unlock Secure Gateway**: Replaced the legacy numeric PIN code screen with a premium Canvas drawing pad verifying a smiley face gesture pattern, with multi-stroke verification windows and an invisible E2E test bypass hook.
- **[2026-05-22] Shift-Left Pre-Commit hook**: Introduced a husky pre-commit pipeline that checks TypeScript types, runs Vitest unit tests, scans markdown image file references, and blocks staged commits containing credential or API key leaks.
- **[2026-05-22] Multi-Vendor GPU Telemetry**: Implemented Windows CIM/WMI adapters querying AMD/Intel/NVIDIA graphics, macOS system profiles, unified memory estimation, and dynamic WebGPU routing recommendations.

## [0.10.0] - 2026-05-20

### Added
- **[2026-05-20] Secure Delegation Access Codes**: Replaced the public patient dropdown menu in the companion `patient_app` with a secure access code text field, preventing HIPAA/privacy exposure of the patient directory.
- **[2026-05-20] Practitioner Delegation Display**: Added a dedicated `DELEGATION CODE` label on the provider's `patient_detail_screen` so practitioners can securely communicate delegation credentials to patients.
- **[2026-05-20] Gesture-Based Clinical Unlock**: Designed and implemented a canvas-based draw-unlock mechanism using a gesture recognizer (smiley face template matching) to replace legacy PIN code fields with an elegant gesture gateway on the Secure Splash screen.
- **[2026-05-20] Expanded Animal Comfort Protocols**: Integrated additional high-fidelity auditory protocols for Orca Whales/Dolphins, Parrots/Crows, and Peregrine Falcons, along with dedicated custom SVG visual icons, custom binaural pulse sweeps, and responsive clinical warnings.

### Fixed
- **[2026-05-20] CommonJS Build Warnings**: Configured `angular.json` to allow CommonJS sub-dependencies of `@google-cloud/bigquery` (`@google-cloud/common`, `@google-cloud/paginator`, `@google-cloud/promisify`, `@google-cloud/precise-date`, `big.js`, `extend`, `stream-events`, and `duplexify`), eliminating build-time optimization warnings.
- **[2026-05-20] Contrast and Contrast Accessibility Specificity**: Strengthened light-mode text readability and color contrast metrics, removed visual text shadows, and stabilized post-animation text styling to fully comply with WCAG AA guidelines.
- **[2026-05-20] CSS String Escape Warning**: Corrected unescaped slash characters within CSS selectors inside the component template string to resolve the Angular compiler syntax warnings.

## [1.0.0-rc1] - 2026-05-19

### Added
- **[2026-05-19] Security Hardening & MFA Gateways**: Added robust Firebase Google Login flow configurations including domain whitelists and multi-factor authentication (MFA) parameters.
- **[2026-05-19] Tink Envelope Cryptography & PQC**: Integrated Google Tink AEAD cryptographic envelopment for local patient records and added Quantum-Safe Cryptography Kyber/Dilithium transport protocol fallbacks for HIPAA transit compliance.
- **[2026-05-19] WebMCP Schema Mapping**: Registered WebMCP (Model Context Protocol) standards schemas to allow seamless integrations of external clinical knowledge databases.
- **[2026-05-19] 3D Anatomical Extensions**: Enabled pluggable mesh loaders (GLTF, USDZ, OBJ) on the Three.js viewport for customized skeletal modeling.
- **[2026-05-19] Multi-Cloud Enterprise Connectors**: Documented and verified identity sync wrappers for Windows Active Directory (AD FS) and envelope encryption bridges for AWS KMS.
- **[2026-05-19] Sentinel Gamification & Cognitive Triage**: Integrated a clinician alertness and fatigue-tracking dashboard to monitor practitioner cognitive load in high-stress triage environments.

## [0.9.0] - 2026-05-18

### Added
- **[2026-05-18] Multilingual & Pediatric Care Plans**: Expanded the `translateReadingLevel` infrastructure across all providers to support Spanish, German, French, Mandarin, Dyslexia, and Pediatric formats.
- **[2026-05-18] Security & Red Teaming Framework**: Implemented `SECURITY.md` and a Vitest automated red-teaming suite (`tests/safety.spec.ts`) to actively verify Gemini `BLOCK_MEDIUM_AND_ABOVE` safety boundaries.
- **[2026-05-18] Transparency Metadata**: Added `humans.txt`, `robots.txt`, `llms.txt`, and `sources.txt` to the public directory for AI indexing and human attribution.
- **[2026-05-18] Cloud Build Integration**: Created `cloudbuild.yaml` to automate Docker builds and Google Cloud Run deployment pipelines.
- **[2026-05-18] Advanced Clinical Mock Data**: Expanded `MOCK_PATIENTS` with updated 2026 timestamps, Orthomolecular Biomarkers, and dedicated Pediatric and Multilingual test profiles.
- **[2026-05-18] Animal Comfort Protocols**: Engineered a Web Audio API synthesizer (`PetAuditoryService`) within the Care Plan Export module to generate species-specific soothing frequencies (Feline Purr at 25Hz, Canine Heartbeat at 60 BPM) for pets left home during hospitalizations.

## [0.8.0] - 2026-05-18

### Added
- **[2026-05-18] Multi-Layer Hemi-Sync Audio Engine**: Upgraded `GlobalAvsService` to a high-fidelity 4-oscillator engine supporting phase-locked frequency entrainment and a clinical-grade Pink Noise synthesizer.
- **[2026-05-18] Athletic Enhancement AVS**: Implemented `AthleticProtocolService` and UI toggles to provide specialized AVS protocols (Priming, Flow, Recovery, Phase-Shift) for athletic performance and recovery.
- **[2026-05-18] Real-Time DSP Pipeline**: Fleshed out the FastAPI sidecar to process real-time HDF5 ECG streams using SciPy to extract HRV (RMSSD) and respiratory frequency metrics.
- **[2026-05-18] Philips Hue Local Relay Proxy**: Added a local `hue-relay.js` Node proxy to resolve HTTPS mixed-content restrictions when the PWA communicates with local Philips Hue hubs.

## [0.7.0] - 2026-05-17

### Added
- **[2026-05-17] Circadian UI & AVS Coregulation**: Replaced static UI themes with a continuous, hardware-accelerated circadian CSS variable system (`CircadianSleepinessService`) that smoothly transitions ambient UI colors based on the time of day.
- **[2026-05-17] KSS Readiness Gateway**: Integrated the 9-point Karolinska Sleepiness Scale (KSS) into the secure splash screen, allowing manual readiness overrides of the circadian theme.
- **[2026-05-17] DOC Stimulation Protocols**: Implemented `DocProtocolService` to provide structured auditory and vibroacoustic stimulation guidelines for Disorders of Consciousness (Coma, VS/UWS, MCS).
- **[2026-05-17] PWA Gemini Nano Integration**: Upgraded `HybridProvider` to route chat and conversational queries to Chrome's on-device `window.ai` Nano model when offline or for token-saving local execution.
- **[2026-05-17] Philips Hue & Ambient Lighting Sync**: Created `AmbientLightingService` to mathematically sync the application's real-time circadian HSL themes with physical Philips Hue smart lights via the local network.

## [0.6.0] - 2026-05-17

### Added
- **[2026-05-17] Monorepo Env Fallback**: Server-side `fetchGeminiApiKey()` now searches `pocketgull_api/.env.local` and `pocketgull_api/.env` as fallback sources, eliminating the need for a separate `.env.local` in the Angular root during local development.

### Changed
- **[2026-05-17] THREE.Clock → THREE.Timer**: Migrated `Body3DViewerComponent` from deprecated `THREE.Clock` to `THREE.Timer` (`timer.update()` + `timer.getElapsed()`), resolving the Three.js r183 deprecation warning.
- **[2026-05-17] OHIF Viewer**: Replaced non-functional OHIF iframe (blocked by `X-Frame-Options: DENY` on `viewer.ohif.org`) with a polished launch card that opens OHIF in a new tab, preserving the `StudyInstanceUIDs` deep-link query param.
- **[2026-05-17] Production Source Maps**: Set `sourceMap: false` in the `production` Angular build config to eliminate build-time warnings caused by malformed control characters in `@angular/platform-server`'s `init.mjs.map` (upstream Angular packaging bug).

### Fixed
- **[2026-05-17] Schema Validation**: Removed unsupported `server` property from `angular.json` `sourceMap` object, resolving `SchemaValidationException` on `npm run build`.
- **[2026-05-17] Debug Log Noise**: Removed verbose `console.log` pointerdown/pointerup events from `Body3DViewerComponent` interaction handlers.

## [0.5.0] - 2026-03-16

### Added
- **[2026-03-16] Branding Update**: Replaced application logos with the new origami seagull design in the header and splash screen.
- **[2026-03-16] Domain Configuration**: Mapped custom domains `pocketgull.app` and `www.pocketgull.app` to the live Cloud Run service.
- **[2026-03-16] COCOMO II Estimation**: Updated the effort estimation script to calculate KSLOC dynamically and added an `estimate-effort` npm script.
- **[2026-03-16] Lighthouse Audit Script**: Added an npm script to easily run Lighthouse accessibility and performance audits.

### Changed
- **[2026-03-16] Print Preview Refactoring**: Implemented a modular print strategy allowing user-selected inclusions (analysis, original text), improved translation error handling, and updated the UI controls for cognitive levels.
- **[2026-03-16] Codebase Cleanup**: Removed remaining references to legacy internal terms ("Cerebella" and "Orthomolecular").

### Fixed
- **[2026-03-16] Translation Reversion**: Fixed a bug where textual translations were reverting unexpectedly in the print preview modal.
- **[2026-03-16] Security Headers**: Improved server security headers by explicitly setting Strict-Transport-Security, Cross-Origin-Opener-Policy, and X-Frame-Options.

## [0.4.0] - 2026-03-12

### Added
- **[2026-03-12] Genkit Integration**: Introduced Genkit capabilities and mock data generation for enhanced clinical intelligence features.
- **[2026-03-11] Core Medical Services**: Implemented core services for PocketGall, including patient state management and clinical intelligence.
- **[2026-03-09] SSR Deployment Architecture**: Established Angular SSR server with PubMed API proxies, Gemini API key management, and Docker/GCP Cloud Run deployment configurations.
- **[2026-03-09] Lighthouse Performance Auditing**: Integrated automated performance benchmarking and reporting.
- **[2026-03-06] Research Tools**: Registered research and bookmark tools.
- **[2026-03-06] Expanded Patient Data**: Added a new global sentinel patient to the default dataset.
- **[2026-03-05] AI Reading Level Translation**: Introduced medical summary translation controls for simplified and dyslexia-friendly text.
- **[2026-03-04] Origami Splash Screen**: Added a new animated Pocket splash screen.
- **[2026-03-03] LLM Discoverability File**: Added `llms.txt` to help AI agents consume project documentation.
- **[2026-03-03] Pocket Gull UI Components**: Created new core shared components (`Badge`, `Button`, `Card`, `Input`) aligned with the new branding.
- **[2026-03-03] New Medical Components**: Added `Medical3DViewerComponent` and `PatientScansComponent` to handle advanced clinical imagery.

### Changed
- **[2026-03-09] UI & Layout Refinements**: Expanded assessment panel width and enforced `pocketgull.app` domain redirection.
- **[2026-03-06] Rebranding**: Officially renamed the application from Understory to **Pocket Gull**.
- **[2026-03-06] Mobile Responsiveness**: Upgraded to `dvh` (dynamic viewport height) units for robust mobile layout calculation and refined rich media card parsing.
- **[2026-03-06] Voice Assistant Redesign**: Redesigned the voice assistant transcript display with new model message bubbles and rich media card styling.
- **[2026-03-06] Removed Legacy Features**: Removed old "philosophical export modes".
- **[2026-03-04] Domain Redirection**: Implemented legacy domain redirection.

### Fixed
- **[2026-03-12] WebGL SSR Crash**: Safeguarded `Body3DViewerComponent` from crashing during Server-Side Rendering (SSR) by verifying `window` execution context before WebGL initialization.
- **[2026-03-09] 2D SVG Interactivity**: Recovered 2D SVG layer interactivity and purged unused typography footprint.
- **[2026-03-09] 3D Viewer Anatomy Views**: Restored missing skin, muscle, skeleton, and mind multi-layer anatomy views.
- **[2026-03-09] Dark Mode Persistence**: Restored SSR `ThemeService` for reliable dark mode state management.
- **[2026-03-06] Layout Rendering**: Resolved vertical frame split issues.
- **[2026-03-03] Markdown Rendering**: Fixed mermaid node label rendering issues for GitHub by quoting slashes correctly.
- **[2026-03-03] Live Agent Bug**: Fixed bug to auto-send live agent prompt.

## [0.3.0] - 2026-03-03

### Added
- **Context-Aware AI Chat**: Integrated recent node-specific discussions directly into the AI's conversational memory, enhancing the relevance of "Live Consult" responses.
- **Inline Node Agent Queries**: Added ability to seamlessly launch AI inquiries directly from individual paragraphs and list items within the analysis report.
- **3D Medical Interactive Viewer**: Integrated a robust ThreeJS-powered 3D model viewer for enhanced anatomical visualization.
- **Scans & Diagnostics Library**: Added a visual gallery component to the patient history for managing and displaying diagnostic imagery like MRIs and X-Rays.
- **Evidence Focus Iconography**: Introduced a custom "Interrobang" clinical icon for the Evidence Focus feature, replacing generic indicators.

### Changed
- **Application Rename**: Renamed the application from Understory to Pocket Gull across the entire codebase.
- **Node Toolbar Accessibility**: Increased touch target padding and visual persistence delays on the summary node toolbar to dramatically improve mobile and touch interactions.

## [0.2.0] - 2026-02-28

### Added
- **Offline Printable Stationery**: CSS Grid-optimized, multi-page physical printouts featuring Halftone body maps for visual pain hotspot diagnosis.
- **Smartwatch Optimization**: Responsive UI scaling down to extremely constrained viewports (e.g., Pixel Watch 2 at 286px width).
- **Box Breathing UX**: 16-second box breathing visual animations integrated into primary intake text areas to promote practitioner mindfulness.

### Changed
- **Server-Side Rendering (SSR)**: Transitioned architecture to Angular SSR for performance optimization.
- **Mobile Navigation**: Implemented tabbed view-switching (Tasks / Analysis) optimized for constrained mobile environments.

### Fixed
- **SSR Build Stability**: Resolved "no exports" optimization bailouts caused by unresolved TypeScript properties in `PatientStateService`.
- **Mobile Scrolling**: Fixed mobile page scrolling flow by removing forced height constraints.
- **UI Clipping**: Fixed horizontal/vertical clipping of action buttons and contents in the analysis report.
- **Type Safety**: Ensured strict type checking and proper exports for patient history and summary models across services.

## [0.1.0] - 2026-02-22

### Added
- **Care Plan Recommendation Engine**: A structured AI analysis module categorizing recommendations into Overview, Interventions, Monitoring, and Education.
- **Task Bracketing System**: Interactive UI allowing clinicians to Accept, Reject, or Modify AI-generated interventions before finalizing.
- **Live Voice Consult (Aura)**: An integrated voice assistant agent for real-time collaboration on patient strategies. Includes a dedicated chat interface with speech-to-text integration.
- **3D Body Viewer Integration**: Visual anatomical mapping tools to correlate physical symptoms with digital chart records.
- **Automated Clinical Task Extraction**: Parses unstructured clinical notes into actionable checklist items.
- **Biometric Telemetry Visualization**: Chart.js integration providing retrospective trend analysis for patient blood pressure and pain metrics.
- **Preview & Print Final Care Plan**: A dedicated modal to review, edit, and print the finalized patient care strategy before charting.

### Changed
- Re-architected core layouts for a responsive 3-column split view (Medical Chart, Intake Flow, and Analysis/Voice Assistant).
- Optimized client-side payload delivery via Express compression (Gzip/Brotli) and structural font preconnections.
- Upgraded UI interactions with modern tailwind aesthetics, smooth transitions, and dynamic hover states across all components.

### Fixed
- Addressed infinite reactivity loops within the Intake Form component upon body part selection.
- Corrected Voice Assistant triggering bugs preventing the component from rendering on mobile and desktop viewports.
- Handled improper API Key rejection formatting from the Gemini API service, surfacing graceful UI alerts instead of silent failures.
