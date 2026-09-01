# QUESTIONS.md — Codebase Discovery Backlog

**Audit Date**: 2026-08-05
**Auditor**: Enterprise Codebase Audit (ISO/IEC 25010 + SIG + ATAM)
**Standard**: Structured Discovery Protocol with 6-Tag Taxonomy

---

## Tag Taxonomy

| Tag | Meaning | Action |
|---|---|---|
| `verified` | Fully intended and documented product behavior | Retain; document rationale in system specs |
| `partial` | Partially understood or partially meets intended behavior | Schedule targeted deep-dives |
| `blocked` | Remediation blocked by external dependency or third-party limitation | Escalate to product management or vendor |
| `deferred` | Acknowledged but postponed due to immediate product priorities | Log in technical debt registry |
| `out-of-scope` | Outside the boundaries of the current audit | Document boundary; exclude from active backlog |
| `caveat` | Accepted but carries operational warnings or performance risks | Insert inline docs; configure runtime observability |

---

## Structural Boundaries

### Q1. `app.component.ts` Monolith Orchestration `caveat`

**File**: [app.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/app.component.ts) (2,735 LOC)
**Observation**: This single component orchestrates 30+ UI concerns including finalize preview, cognitive translation, animal therapy, theming, and patient management. It imports and coordinates the majority of the application's services.
**Question**: Is this intentional as the "God component" orchestrator, or is this a decomposition candidate? What is the planned extraction strategy for reducing this file below 1000 LOC?

---

### Q2. `analysis-report.component.ts` Size Anomaly `partial`

**File**: [analysis-report.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.component.ts) (4,153 LOC)
**Observation**: This is the single largest file in the entire codebase — 2x the size of the next largest file. It renders the multi-lens analysis report (assessments, interventions, diagnostics, etc.).
**Question**: Does this contain rendering logic that should be extracted into dedicated child lens components (e.g., `AssessmentsLensTabComponent` extraction has already started)? What is the target decomposition?

---

### Q3. `export.service.ts` Multi-Format Handler `partial`

**File**: [export.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/export.service.ts) (2,813 LOC)
**Observation**: This single service handles PDF generation (jsPDF), FHIR R4 Bundle serialization, CSV export, print layout, and QR code generation. It contains 21 `:any` usages.
**Question**: Should export formats be decomposed into a strategy pattern (e.g., `PdfExportStrategy`, `FhirExportStrategy`, `CsvExportStrategy`) to reduce unit size and improve testability?

---

### Q4. `actuarial-longevity.service.ts` Clinical Data Volume `partial`

**File**: [actuarial-longevity.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-longevity.service.ts) (2,545 LOC)
**Observation**: Large service containing actuarial calculation logic, life expectancy models, and QALY scoring. High clinical data density.
**Question**: Is the LOC primarily driven by clinical lookup tables and constants, or by computation logic? If tables, should they be extracted into a separate data file?

---

### Q5. `body-3d-viewer.component.ts` Three.js Complexity `caveat`

**File**: [body-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-3d-viewer.component.ts) (2,484 LOC)
**Observation**: Three.js procedural skeletal model with 9 `:any` usages. WebGL geometry and material setup is inherently verbose.
**Question**: Is the Three.js scene graph setup logic extractable into a dedicated `BodyMeshFactory` service, or does the component need direct access to the rendering loop for performance?

---

## Validation Handlers

### Q6. innerHTML vs DOMPurify Coverage `verified`

**Files**: 19 files use `innerHTML`, 19 files import `DOMPurify`
**Observation**: The count is equal, but **are they the same files?** An innerHTML usage without a corresponding DOMPurify sanitization is a CWE-79 (XSS) vulnerability.
**Answer**: Cross-reference completed. **18/19 files are fully sanitized** via one of three mechanisms:
1. `SafeHtmlPipe` (wraps DOMPurify) — 9 files
2. `DomSanitizer.bypassSecurityTrustHtml()` on pre-sanitized SVG/icon content — 6 files
3. Safe static patterns (`innerHTML = ''` DOM clears, `dataURL` QR codes) — 3 files

**1 Watch file**: `patient-health-trajectory-storybook.component.ts` uses `formatParagraphText()` which injects `<strong>` tags via regex without sanitization. Currently safe (hardcoded chapter data at line 217) but would become an XSS vector if paragraph content becomes dynamic.

**No active XSS vulnerabilities detected.** See AUDIT_REPORT.md §2.4 for the full sanitizer coverage matrix.

---

## Environment Configurations

### Q7. `server.ts` Type Safety `caveat`

**File**: [server.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server.ts) (1,507 LOC, 62 `:any` usages)
**Observation**: This is the most type-unsafe file in the codebase. Express route handlers accept untyped request/response objects throughout. At 62 `:any` occurrences, 4.1% of the file is effectively untyped.
**Question**: Should Express route handlers be extracted into typed controller modules (e.g., `controllers/ai.controller.ts`, `controllers/patient.controller.ts`) with explicit request/response interface types?

---

### Q8. localStorage Scatter `partial`

**Files**: 17 files across services and components
**Observation**: Raw `localStorage.getItem()` and `localStorage.setItem()` calls are scattered across the codebase without a centralized storage abstraction.
**Question**: Is there a planned boundary between `StorageService`, `PatientStateService`, and direct localStorage access? Should all localStorage calls be routed through a single `SecureStorageService` that handles serialization, encryption, and SSR-safe guards?

Files with direct localStorage access:
- `walkthrough-tour.service.ts`
- `verify-ai.service.ts`
- `theme.service.ts`
- `secure-key.ts`
- `orcid.service.ts`
- `network-state.service.ts`
- `gamification.service.ts`
- `firestore-sync.service.ts`
- `export.service.ts`
- `consent.service.ts`
- `webllm.provider.ts`
- `gemini.provider.ts`
- `secure-splash.component.ts`
- `voice-assistant.component.ts`
- `ybocs-screener.component.ts`
- `summary-node.component.ts`
- `app.component.ts`

---

## Authentication Controls

### Q9. `secure-splash.component.ts` Error Swallowing `caveat`

**File**: [secure-splash.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/secure-splash.component.ts) (2,276 LOC)
**Observation**: Contains 4 swallowed catch blocks out of 7 total try blocks (57% suppression rate). This is the authentication gateway component — silent failures here could mask auth bypass scenarios.
**Question**: Are the 4 swallowed catches handling expected failures (e.g., biometric API unavailable on desktop), or are they masking security-relevant errors that should be logged?

---

## Asynchronous Flows

### Q10. HybridProvider Silent Fallback `partial`

**File**: [hybrid.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/hybrid.provider.ts)
**Observation**: When ALL AI providers fail, the HybridProvider returns the original text rather than throwing. This caused the Cognitive Localization bug (safety-blocked translations returned empty strings, which passed as "successful" translations).
**Question**: Beyond the Genkit safety filter fix applied today, should the HybridProvider be refactored to throw a typed error (`AIProviderExhaustedError`) when all providers fail, allowing upstream consumers to decide on fallback behavior?

---

### Q11. `adk-live.service.ts` WebSocket Resilience `partial`

**File**: [adk-live.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.ts) (2 swallowed catches / 9 try blocks)
**Observation**: The ADK Live service manages full-duplex multimodal audio streaming over WebSocket. Two catch blocks swallow errors silently.
**Question**: What is the reconnection strategy when the WebSocket drops mid-conversation? Is there exponential backoff with jitter, and are dropped audio frames logged for diagnostic purposes?

---

## AI Integration Boundaries

### Q12. `clinical-intelligence.service.ts` Error Handling `verified`

**File**: [clinical-intelligence.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts) (986 LOC)
**Observation**: 18 try blocks with only 1 swallowed catch (6% suppression rate). This is the best error handling ratio in the AI layer.
**Question**: Confirmed — this is the model for error handling discipline. Can the pattern used here be propagated to other AI services?

---

### Q13. `gamification.service.ts` Full Error Suppression `caveat`

**File**: [gamification.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/gamification.service.ts) (3 swallowed / 3 total = 100%)
**Observation**: Every try-catch in this service swallows the error. This means any gamification feature failure is completely invisible.
**Question**: Is this intentional because gamification is non-critical ("nice to have"), or should failures be logged at `warn` level for diagnostic visibility?

---

## State Management

### Q14. Patient State Service Boundaries `partial`

**Files**:
- [patient-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.service.ts) (1,371 LOC)
- [patient-management.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-management.service.ts) (908 LOC)
- [storage.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/storage.service.ts) (8 `:any`)
**Observation**: Three separate services handle patient state. The boundary between "state" (signals/computed), "management" (CRUD operations), and "storage" (persistence) is unclear.
**Question**: What is the intended separation of concerns? Should PatientManagementService be a facade over PatientStateService + StorageService?

---

### Q15. `firestore-sync.service.ts` Error Handling `caveat`

**File**: [firestore-sync.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/firestore-sync.service.ts) (2 swallowed / 4 try blocks = 50%)
**Observation**: Cloud sync failures are silently swallowed. If Firestore is unreachable, the user has no indication that their data is not being persisted remotely.
**Question**: Should sync failures trigger a visible "offline mode" indicator in the UI, or are they intentionally silent?

---

## Supply Chain

### Q16. SBOM License Resolution `partial`

**File**: [sbom.spdx.json](file:///c:/Users/philg/Pocketgull/pocketgull/sbom.spdx.json)
**Observation**: 44 of 45 packages have `licenseConcluded: NOASSERTION`. The SBOM currently functions as an inventory but not as a compliance artifact.
**Question**: Should the SBOM be enriched with resolved license identifiers from the npm registry to satisfy EU CRA Section I(II)(1) requirements?

---

### Q17. Dependabot Merge Velocity `verified`

**File**: [dependabot.yml](file:///c:/Users/philg/Pocketgull/pocketgull/.github/dependabot.yml)
**Observation**: On Aug 4, 2026, 12 Dependabot PRs were merged in rapid succession (05:38 - 06:02). This is consistent with batch dependency updates.
**Question**: Confirmed — batch merging of Dependabot PRs is acceptable practice. The dependency-review action gates block non-permissive licenses.

---

### Q18. `python-bridge.service.ts` Cross-Runtime Typing `caveat`

**File**: [python-bridge.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.ts) (9 `:any`)
**Observation**: The bridge between TypeScript and the Python FastAPI sidecar uses 9 `:any` typed payloads. This means the contract between runtimes is not enforced at compile time.
**Question**: Should the Python-TypeScript bridge use a shared schema (e.g., generated from the OpenAPI spec) to enforce type parity across runtimes?
