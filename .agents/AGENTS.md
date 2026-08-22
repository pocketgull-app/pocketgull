# Pocket Gull Workspace Rules

## Node.js Version
- **Strict Requirement**: Use **Node.js v24.x** for all local development, testing, and CI/CD pipelines. This is configured in `.node-version`, `.nvmrc`, and root `package.json` (`engines`).

## Package Overrides (esbuild Version Mismatch Workaround)
- To prevent version mismatch crashes with `esbuild` in the monorepo workspace environment, `esbuild` version overrides are structured as follows:
  - **Global default override**: Set `esbuild` (and all platform binaries `@esbuild/*`) to `0.27.2`.
  - **Angular CLI specific override**: Override `esbuild` (and all platform-specific `@esbuild/*` binaries) to `0.28.1` specifically under `@angular/build` and `@angular-devkit/build-angular`.
  - **Astro Promotion**: `astro` and `@astrojs/mdx` are included as direct root devDependencies to ensure their transitive `esbuild` dependencies are correctly caught by the root context overrides, bypassing npm workspace link boundary resolution bugs.
- **Note**: Do not modify these overrides without full regression testing of both the Angular build and the Astro `docs-study` workspace build.

## Python / FastAPI Standards
- **Formatting & Linting**: Adhere to PEP-8 standards. Use **`ruff`** for linting/import sorting and **`black`** (88-character max line length) for code formatting.
- **Pydantic Validation**: All request and response models in `pocketgull_api` sidecars MUST be strictly typed using Pydantic v2 `BaseModel` classes. Avoid returning raw dictionaries or untyped `Any`. Use `pydantic.Field` for numeric constraints, defaults, and API field descriptions.
- **Async & Event Loop Hygiene**: Use `async def` for non-blocking I/O route handlers (`httpx`, async DB calls) and standard synchronous `def` for CPU-bound matrix/ML computations (`scikit-learn`, `numpy`) so FastAPI automatically dispatches them to the thread pool without blocking the main event loop.
- **Structured Logging & Error Handling**: Mask internal exceptions by throwing `fastapi.HTTPException` with explicit HTTP status codes and structured detail payloads (`detail={"code": ..., "message": ...}`). Avoid `print()`; use standard `logging` or `structlog` to ensure GCP stdout ingestion parses log levels (`INFO`, `WARNING`, `ERROR`) cleanly.
- **Docstring Conventions**: Use Google Style docstrings for all complex scoring methods, ML pipelines, and public service functions.

## Ruby / Rails & Gems Standards
- **Ruby Version**: Require **Ruby 3.3.x+** with YJIT enabled for all Rails engines and micro-gems (`pocketgull-fhir-rails`, `pocketgull-ruby`).
- **Linting & Code Quality**: Use **`rubocop`** with `rubocop-rails` and `rubocop-performance`. Enforce zero-offense passes before PR submission.
- **Rails Engine Isolation**: All Rails engines MUST be strictly namespaced under `module Pocketgull` (e.g., `Pocketgull::Fhir::Rails::Engine`). Prevent global constant leakage into host applications.
- **Dependency Hygiene**: Gemspecs MUST use explicit version constraints (`~>`) and avoid un-pinned open dependencies. Prefer standard library (`net/http`, `json`, `uri`) over external gems wherever practical.
- **Environment Isolation**: Strictly separate real clinical API calls from mock/test stubs using `Rails.env.test?` and `ENV['POCKETGULL_LIVE_DEMO']`. Never execute live external OAuth endpoints in test suites.
- **Testing**: Use **`Minitest`** or **`RSpec`** with `WebMock` / `VCR` for all HTTP & ActionCable WebSocket channel testing.
- **Containerization**: Always use **Alpine Linux (`ruby:3.3-alpine`)** for Docker builds to maintain zero base-OS vulnerabilities and low memory footprints on AWS App Runner / ECS Fargate.

## Flutter / Dart Architecture
- **State Management**: Use **Riverpod** for state management across the `pocketgull_flutter` companion app. Avoid `setState` for complex business logic.
- **Widget Composability**: Keep widget classes small and focused. Extract deeply nested UI trees into standalone, reusable, stateless widgets.
- **Null Safety**: Strict null safety must be maintained at all times.

## Commit Message Convention
- **Format**: Follow the **Conventional Commits** specification strictly: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`
- **Scope**: Use a bracketed category tag that identifies the sub-system. Common scopes include:
  - `ui`, `ux`, `layout`, `theme`, `print` — Frontend visual changes
  - `ai`, `gemini`, `adk`, `voice` — AI and voice integration
  - `clinical`, `fhir`, `intake`, `triage` — Clinical intelligence and data
  - `server`, `ssr`, `api` — Backend / Express / SSR
  - `flutter`, `dart`, `mobile` — Flutter companion apps
  - `python`, `ml`, `sidecar` — Python FastAPI sidecar
  - `security`, `csp`, `codeql`, `hipaa` — Security hardening
  - `ci`, `cd`, `docker`, `deploy`, `cloudrun` — CI/CD and infrastructure
  - `demo`, `mock` — Demo mode and mock data
  - `e2e`, `playwright`, `test` — Testing
  - `three`, `anatomy`, `3d` — Three.js anatomy viewer
  - `sentinel`, `companion` — Sentinel triage and companion apps
  - `types`, `build`, `deps` — TypeScript types, build config, dependencies
- **Subject line rules**:
  - **STRICT MAX LENGTH**: Must be **72 characters or fewer** (including `type(scope): ` prefix). Husky `commit-msg` hook strictly rejects subjects over 72 characters.
  - Use imperative mood ("add", "fix", "remove", not "added", "fixes", "removed")
  - Do NOT capitalize the first letter of the description
  - No period at the end
- **Body** (optional): If the diff is non-trivial, add a blank line after the subject, then a concise body explaining *why* the change was made, not *what* (the diff shows what). Wrap at 80 characters. Move extra details here if the subject would exceed 72 characters.
- **Breaking changes**: Prefix the body with `BREAKING CHANGE:` if the commit introduces breaking changes.
- **Examples of good commit messages**:
  - `feat(ai): add Gemini 2.5 Flash streaming to voice assistant`
  - `fix(clinical): sync intake form keys with care plan report structure`
  - `security(server): sanitize Vertex AI URL params against SSRF`
  - `chore(deps): bump Angular to v22.1 and resolve esbuild overrides`
  - `feat(demo): add dynamic mock clinical assessments per patient demographics`
  - `fix(types): add explicit token loop types in analysis-report parser`

## FHIR R4 Compliance
- **Data Serialization**: Anytime patient data (symptoms, history, conditions) is serialized, exported, or passed across API boundaries, the payload MUST strictly conform to the **FHIR R4 Bundle** standard.
- **Sanitization**: All incoming/outgoing string data must be sanitized using DOMPurify before being stored or rendered to ensure HIPAA-compatible privacy and security.

## GCP Cloud Cost & Storage Lifecycle Standards
- **Cloud Project Target**: All deployments MUST target the `gen-lang-client-0540208645` Google Cloud project.
- **Cloud Run Scaling**: Ensure all Cloud Run microservices scale to 0 (`minScale: 0`) when idle to eliminate baseline computing charges.
- **Artifact Registry & GCS Pruning**: Retain a 7-day cleanup policy (`olderThan: 604800s`, `keepCount: 3`) on Artifact Registry repositories (`cloud-run-source-deploy`, `gcr.io`) and GCS source buckets (`gs://run-sources-*`) to cap artifact storage usage at ~2–4 GB ($0.20/mo) and prevent unpruned build accumulation.

## Default Node & TypeScript Commands
- **Strict Requirement**: Always use the explicit project Node module paths for typechecking and builds to prevent PATH resolution mismatches:
  - **TypeScript Typecheck**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit`
  - **Angular Build**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build`

## AI Coding Hygiene & Continuous Cleanup
- **End-of-Session Pruning**: Before wrapping up features or releases, proactively purge unused imports, delete unreferenced dead code, merge duplicate helper functions, and remove commented-out blocks.
- **Secret & Egress Boundaries**: Never commit API keys or credentials. Ensure `.env*` is strictly matched in `.gitignore`, and verify all external domains with `Sentinel Security Guard`.

## Gemini Safety Filter Policy (Clinical CDS)
- **Canonical Reference**: `SECURITY.md §2` documents the full policy. All Genkit flows in `src/server/genkit.ts` reference this section.
- **DANGEROUS_CONTENT = `OFF`**: Clinical text routinely discusses drug dosages, toxic exposures, overdose management, suicidal ideation screening (PHQ-9/C-SSRS), and trauma. Any threshold above `OFF` produces false-positive blocking on standard-of-care care plans.
- **Imaging & OCR Flows = All `OFF`**: Medical imaging (X-rays, dermatology, wound assessment) and clinical document OCR require fully permissive safety settings across all categories.
- **HARASSMENT & HATE_SPEECH = `BLOCK_ONLY_HIGH`**: Retained as baseline protection; rarely triggered by clinical text.
- **SEXUALLY_EXPLICIT = `BLOCK_ONLY_HIGH`** (text flows) / **`OFF`** (imaging flows): Permits OB/GYN, STI, and reproductive health content.
- **Do NOT revert to `BLOCK_LOW_AND_ABOVE` or `BLOCK_MEDIUM_AND_ABOVE`**: These thresholds silently block legitimate medical content and were the root cause of the Cognitive Localization translation failure.

## NN/g (Nielsen Norman Group) Usability & Accessibility Standards
- **Form Accessibility**: All input components MUST include explicit `[attr.aria-describedby]` error/hint linking, `[attr.aria-invalid]`, and 44px+ touch target hitboxes (Fitts's Law).
- **System Status Visibility**: Telemetry badges and connection state indicators MUST provide instant visual feedback without layout shifts.
- **User Freedom & Exit Vectors**: Read-only or historical review states MUST display prominent, un-missable exit banners (e.g., `"Return to Current State"`).

## HIPAA Safe Harbor Patient De-Identification Policy
- **Demographic Archetypes**: Mock and test patient profiles MUST be de-identified using HIPAA §164.514 Safe Harbor standards (e.g., `Homo Sapiens (Female, Neurological, 34y)` or `Pongo Pygmaeus (Orangutan Comparative Model)`).
- **Historical Legacies**: Preserve named historical/scientific luminaries who dedicated their lives to science (Curie, Darwin, Kahlo, Ramanujan, Smith, Pauling, Gear).

## Biophysical PBR Substrates & Unbiased Cryptography
- **Edwin Smith Surgical Codex**: Describe 3D WebGL PBR texture maps using Edwin Smith III's empirical surgical codex biophysical descriptions.
- **Unbiased Cryptographic Floats**: When generating random floats from cryptographic entropy, use the 53-bit IEEE-754 mantissa formula `(high * 4294967296.0 + low) / 9007199254740992.0` to eliminate modulo bias.

## CI/CD Pipeline & GitHub Security Guardrails
- **System Dependencies & Harden Runner**: Any workflow job installing Python packages with C extensions (e.g. `h5py` requiring `libhdf5-dev`) MUST set `disable-sudo: false` in `step-security/harden-runner` and include `sudo apt-get update && sudo apt-get install -y libhdf5-dev`.
- **CodeQL Taint Chain Patterning**: Never rely on legacy `lgtm[]` comments. Break taint chains structurally:
  - *System Prompt Injection*: Keep `systemInstruction` strictly static (`BASE_CLINICAL_PROMPT`). Pass sanitized user directives as a `[CLINICAL DIRECTIVE CONTEXT]` prefix in the user content array.
  - *Network Data Writes*: Validate binary header magic bytes (e.g., `0x00 0x01 0x00 0x00` for TTF) and copy to a new `Buffer.alloc()` before writing to disk.
  - *Log Injection*: Destructure explicit primitive fields into a new typed object and stringify instead of logging raw `req.body` objects directly.
- **Playwright E2E Test Setup**: All E2E test suites MUST call `await enterDemoMode(page)` in `beforeEach` after `setupE2ePage(page)` to ensure the app navigates away from `about:blank`, unlocks the splash screen, and renders DOM elements before querying attributes or clicking buttons. Use case-insensitive locators (`text=/.../i`) for text matching.
- **Monorepo Docker Context**: The root `Dockerfile` MUST copy all package manifests across all workspaces (`COPY docs/study/package*.json ./docs/study/`, `COPY companion-apps/avs-therapy/package*.json ./companion-apps/avs-therapy/`, `COPY pocketgull_api/package*.json ./pocketgull_api/`) and run `npm install --legacy-peer-deps --workspaces`.
- **PR vs. Release Isolation**: Production release workflows (`release.yml`) MUST enforce `if: github.event_name != 'pull_request'` at the job level so GHCR package pushes and SLSA attestations trigger only on `main` branch pushes or release tags (`v*`).
- **Portable Script Paths**: All scripts in `package.json` and `scripts/` MUST use relative paths (`./run-playwright.cjs`, `process.cwd()`) — never hardcoded local machine paths (`c:/Users/philg/...`).

## Subagent Delegation & Escalation Protocol
Agents MUST delegate specialized and compute/context-heavy tasks according to the following matrix:

| Subagent Role | Type / Name | Trigger Conditions & Responsibilities | Boundary & Anti-Pattern |
| :--- | :--- | :--- | :--- |
| **Broad Research & Log Surveys** | `research` | • Scanning or grepping >5 files.<br>• Reading multi-hundred line log/transcript files.<br>• Investigating 3rd-party library internals or external docs. | **Read-Only**: Must NEVER attempt file writes or execution. Must return structured syntheses to the primary agent in a single turn. |
| **Experimental & Invasive Changes** | `self` (branch) | • High-risk architectural refactors.<br>• Multi-file migrations where rollback may be necessary.<br>• Testing breaking dependency updates. | Use `Workspace: "branch"`. Isolate changes until hermetic build verification passes. |
| **Clinical, FHIR & Epistemology Audit** | `clinical-auditor` | • Any modification to patient state signals, PHQ/GAD/C-SSRS clinical scoring, or FHIR R4 schema serialization.<br>• Ensuring HIPAA §164.514 Safe Harbor de-identification.<br>• Cochrane Risk of Bias & $H_0$ p-value verification. | Must be invoked before merging or completing PRs with clinical CDS touchpoints. |
| **SWE Architecture & Code Review** | `swe-code-reviewer` | • New Angular 22 standalone component additions.<br>• Angular Signal reactive graph design reviews.<br>• Hyrum's Law & Google SWE Book conformance audits. | Verifies single-directional reactive data flow and zero memory leaks. |
| **Accessibility & Mobile Review** | `flutter_a11y_agent` | • Touch target size validation (<44px hitboxes strictly flagged).<br>• WCAG AAA contrast audits against dark obsidian backgrounds.<br>• ARIA state binding (`[attr.aria-describedby]`, `[attr.aria-invalid]`). | Required for all public-facing UI and mobile screen components. |

### Subagent Escalation Invariants:
1. **Single-Turn Synthesis**: Subagents must return actionable conclusions, verified diffs, or structured findings in a single response. Prohibit multi-turn ping-pong loops between subagents.
2. **Context Isolation**: Never pass raw multi-megabyte log files directly to parent context. Have the subagent extract only the exact failing lines and stack traces.

## Hermetic Verification & Proof-of-Work Invariants
Never declare a task resolved, a bug fixed, or a refactor complete based solely on code edits. Every change requires empirical proof:

### 1. Mandatory Terminal Proof Chain
Before concluding any implementation turn, execute the explicit workspace commands:
- **TypeScript Typecheck**:
  ```powershell
  node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit
  ```
- **Angular Production Build**:
  ```powershell
  node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build
  ```
- **Unit Test Suite**:
  ```powershell
  npm test -- --run
  ```

### 2. Self-Healing Protocol
- If a build or typecheck fails, inspect the un-truncated compiler diagnostic.
- Fix root causes directly at the type and interface definitions; do not cast to `any` or suppress errors with `@ts-ignore` unless explicitly authorized.
- Never bypass git pre-commit hooks using `--no-verify`.
- Maintain peer dependency traceability: When updating root overrides, verify peer dependencies using `npm view <package> dependencies`.

## Context & Token Hygiene Protocols
To prevent context window degradation, attention drift, and token exhaustion:
1. **Search-First Paradigm**:
   - NEVER call `view_file` on large (>300 line) files without prior targeted search.
   - Use `grep_search` to pinpoint exact line numbers, then view bounded line ranges (max 100–150 lines per chunk).
2. **Ephemeral File Hygiene**:
   - Place scratch data, temporary JSON transformations, and one-off debug scripts strictly inside `<appDataDir>\brain\<conversation-id>/scratch/`.
   - Proactively delete or prune intermediate artifacts before session completion.
3. **Structured Response Economy**:
   - Keep conversational commentary concise, high-signal, and linked to concrete workspace symbols.
   - Provide clickable file links using GitHub-style markdown: `[file.ts](file:///absolute/path/file.ts)`.


## Data Science & ML Competition Engineering Standards
1. **Leak-Free Cross-Validation Anchoring (`GroupKFold`)**: In medical imaging datasets where patients have multiple series/scans, group splits strictly by `patient_id` using `GroupKFold(n_splits=5)` to prevent patient-feature leakage between train and validation splits.
2. **Empirical Pipeline Verification (Numerical Proof First)**: Never claim an architecture edit or post-processing pipeline works based on intuition alone. Record Out-of-Fold (OOF) metric progression at every stage.
3. **Experiment Tracking & Model Hashing (`MLflow` / `W&B` / `git` SHA)**: Log seed, git commit SHA, exact hyperparameters, and OOF target scores for every run. Save weights named by OOF score (e.g. `convnext_large_fold0_auc0.942.pt`).
4. **Asymmetric Loss (ASL) for Specificity & Class Imbalance**: Use Asymmetric Loss with $\gamma_- = 4.0, \gamma_+ = 1.0, \text{clip} = 0.05$ for sparse multi-label targets to focus gradient updates on hard positive abnormalities.
5. **Anatomical Co-Occurrence Prior Calibration**: Build an empirical target co-occurrence matrix $M_{ij} = \mathbb{P}(\text{Target}_j \mid \text{Target}_i)$ and calibrate predicted probabilities using Bayesian prior smoothing.
6. **Diversity Ensembling & 2nd-Level Meta-Stacking**: Train 2nd-level Gradient Boosted Trees (LightGBM/XGBoost) on Out-of-Fold predictions from diverse backbones (ConvNeXt + Swin + mDeBERTa).
7. **Nelder-Mead Target-Specific Threshold Optimization**: Use Nelder-Mead optimization to tune target decision thresholds $\tau_1, \tau_2, \dots, \tau_K$ on OOF predictions rather than using default $0.50$.
8. **Sub-Second Efficiency Latency Optimization**: For competition efficiency tracks, sample 8 central key slices, export PyTorch models to ONNX Runtime with FP16, and use multi-threaded asynchronous DICOM I/O pools.
9. **Semantic Versioning (`SemVer v1.0.0`) & Clean Identifiers**: Protect competitive edge by using clean, standardized public version tags without exposing internal proprietary recipe names on public leaderboards.
10. **Continuous Automated Verification (`vitest` / `pytest`)**: Write automated unit tests covering preprocessors, matrix math formulas, and DICOM tensor transformations across edge cases (empty text reports, missing headers, NaNs).
11. **Kaggle Code Competition Submission Protocol & Zero-Crash Rules**:
    - **Hardware & Accelerator Conformance**: Use `enable_gpu: false` (CPU mode) or explicit T4 GPU settings (`gpu_t4`). NEVER use un-gated GPU settings that default to P100 GPUs, which are prohibited by competition submission rules.
    - **Immediate Baseline Disk Output**: Always write a baseline `submission.csv` to disk at the very beginning of the submission cell *before* starting any ML inference loop.
    - **Defensive Symbol & Engine Guards**: Wrap imports in `try-except` blocks and check `if 'engine' in globals() and engine is not None:` before calling inference methods to prevent unhandled `NameError` crashes.
    - **ASCII Terminal Hygiene**: Use plain text status tags (`[OK]`, `[WARN]`) instead of non-ASCII emojis (`✅`, `⚠️`) in notebook `print()` calls to prevent Papermill `UnicodeEncodeError` failures.
    - **In-Place Schema Preservation**: Load candidate `sample_submission.csv` directly, modify target columns in-place, format floats with `float_format='%.6f'`, and preserve exact row index order.
    - **Memory Hygiene**: Call `gc.collect()` and `torch.cuda.empty_cache()` every 100 studies to prevent RAM/CUDA OOM during hidden test evaluation.
12. **Kaggle Tagging & Platform Asset Governance (March 2026 Guidelines Compliance)**:
    - **Synthetic Dataset Tagging Mandatory**: Per Kaggle's Synthetic Dataset Etiquette, any dataset containing partially or fully synthetic clinical consult vectors or LLM-generated weak labels MUST include the `synthetic` tag.
    - **Standardized Tag Taxonomy**: All published Kaggle models, datasets, utility scripts, and notebooks MUST import and utilize `get_standard_tags()` from `scripts/kaggle_tags.py` to enforce unified metadata tags (`CLINICAL_TAGS`, `AI_ML_TAGS`, `PROJECT_TAGS`).
    - **Usability 10 Checklist**: Every published Model Hub entry or Dataset MUST generate complete `model-metadata.json` / `dataset-metadata.json` containing explicit data dictionaries, open source licenses (`Apache 2.0` / `CC-BY-4.0`), and HIPAA §164.514(b)(2) Safe Harbor verification to maintain a perfect 10/10 usability rating.
    - **Zero Spam & Self-Promotion**: Strictly prohibit upvote begging, off-topic self-promotion, plagiarism, or attaching unrelated datasets/models to notebooks. All shared work must provide genuine educational, research, or competition modeling value.
## Anti-Surveillance & Ephemeral Data Sovereignty Standards
- **Default to Edge Computation**: All real-time telemetry calculations, biophysical equations, and clinical symptom classifications MUST run locally on the client device via WebAssembly (WASM), WebGPU, or client-side Web Workers (`OfflineEdgeAiService`). External API calls are reserved for explicit, user-initiated AI consults.
- **Prohibition of Third-Party Trackers**: Zero third-party analytics pixels, fingerprinting scripts, or passive telemetry pingers (Google Analytics, Segment, Mixpanel, Meta Pixel) are permitted.
- **Explicit Opt-In Telemetry**: All network operations require deliberate, user-initiated actions. Passive background harvesting of location, mic audio, or user keystrokes is strictly prohibited.
- **1-Click Ephemeral State Purging**: All active clinical state MUST be stored in ephemeral Angular Signals and transient local storage, with 1-click state purging capabilities (`purgeTransientPatientState`).

## Skeptical Epistemology & Falsifiability Standards
- **Popperian Null-Hypothesis ($H_0$) Testing**: Every clinical or biophysical metric evaluation MUST compute $p$-values against population baseline means (`SkepticalEpistemologyService`). Any observation where $p \ge 0.05$ MUST trigger an explicit `skepticalWarningNotice` disclosing that the finding cannot reject the null hypothesis.
- **Cochrane Risk of Bias (RoB 2)**: All literature references and clinical citations MUST incorporate explicit Cochrane Risk of Bias assessments across randomization, intervention deviation, missing data, and measurement bias.
- **Evidence Hierarchy Demarcation**: Clinical recommendations MUST be explicitly tagged with evidence tiers (`Level A (RCTs)`, `Level B (Cohort)`, or `Level C (Expert Consensus / Plausibility)`) to prevent uncritical acceptance or science-washing.
- **Socratic Evidence Literacy**: Analysis reports MUST embed interactive Socratic challenges to test user critical reasoning, correlation vs. causation discernment, and publication bias awareness.

## WebMCP Tool & Browser Agent Governance
- **Explicit Tool Contracts**: Every browser tool exposed to AI model contexts MUST be registered via `WebMcpRegistrationService`, declare strict JSON Schema inputs, and provide an explicit `AbortController` cancellation signal.
- **Mandatory Spec Coverage**: Any addition or modification to registered WebMCP tools MUST include corresponding unit tests in `webmcp-registration.service.spec.ts` verifying registration, execution, and error handling.

## Clinical, Ophthalmological & Optotypic Quality Standards (WCAG AAA & HIPAA Safe Harbor)
1. **Zero Orthographic & Typographic Spelling Errors (100% Lexical Precision)**:
   - All text, graphics, labels, image generation prompts, code comments, and UI strings MUST adhere to strictly verified medical, pharmacological, and anatomical spellings.
   - Canonical spellings mandatory:
     * `HIPAA` (Health Insurance Portability and Accountability Act) — NEVER `HIPPA`.
     * `Ophthalmology` / `Ophthalmic` / `Optotypic` — NEVER `Optimological` or `Opthamology`.
     * `Ayurvedic` (`आयुर्वेद`) / `Tridosha` (`त्रिदोष`) — NEVER `Avyerdic`.
     * `Variable Font` / `Visualization` — NEVER `Vadiabe` or `Islsualization`.
     * `Nomina Anatomica` Latin: `Cerebrum`, `Myocardium`, `Hepar`, `Oculus`, `Ren`, `Pulmo`.
2. **Ophthalmological / Optotypic Visual Acuity (LogMAR 0.0 & Snellen 20/20)**:
   - Design text hierarchies to resolve clearly at a 5-arcminute total visual angle with 1-arcminute stroke details at $50\text{--}70\text{ cm}$ surgical/ICU monitor viewing distance.
   - Maintain an elevated x-height to cap-height ratio ($0.70\text{--}0.74$) with wide, un-constricted counterforms (`c`, `e`, `a`, `o`, `s`, `6`, `8`, `9`) to prevent astigmatic letter collision.
   - Maintain strict WCAG AAA contrast ratio ($\ge 7:1$) against `#020617` / `#09090b` obsidian backgrounds.
3. **ISMP & FDA Clinical Drug Dosage Disambiguation**:
   - Enforce slashed zero (`cv08` / `zero`) to distinguish `0` from capital `O`.
   - Enforce curved lowercase `l` with exit spur (`cv05`) vs. capital `I` with bilateral serifs (`ss02`) vs. numeral `1` with sharp top flag.
   - Enforce tabular figures (`tnum`) for jitter-free real-time ICU telemetry metrics.
   - Enforce mandatory leading zeros (`0.5 mg`, NEVER `.5 mg`) and strictly prohibit trailing zeros (`1 mg`, NEVER `1.0 mg`).
4. **HIPAA §164.514 Safe Harbor & FHIR R4 Research Conformance**:
   - All research datasets, mock profiles, and case studies MUST strip all 18 direct/indirect HIPAA identifiers.
   - Sanitize all I/O via DOMPurify and ensure strict FHIR R4 Bundle schema conformance for patient observations and clinical crosswalks.
5. **Quad-Philosophy Diagnostic Integrity (Ayurvedic, TCM, Allopathic, Osteopathic)**:
   - When modeling human biology across paradigms, preserve authentic nomenclature:
     * **Ayurvedic**: Sanskrit Devanagari ligatures (`हृदयम्`, `शिरस्`, `आलोचक पित्त`).
     * **TCM**: Traditional/Simplified Hanzi & Kampo Kanji (`心`, `肝开窍于目`, `任脉`, `足三里`).
     * **Allopathic**: Latin *Nomina Anatomica* with ICD-10/SNOMED-CT codes and hemodynamic formulas ($CO = HR \times SV$, $MAP$).
     * **Osteopathic**: Somatic dysfunction T.A.R.T. criteria (Tissue, Asymmetry, Restriction, Tenderness) and Craniosacral PRM ($8\text{--}12\text{ cpm}$).
6. **Marker Font & Brand Lettering Governance Standard**:
   - The custom handwritten/display Marker Font (`font-pocketgull-handwritten`, `.marker-bold-emphasis`, `.bionic-pocketgull-marker`, marker SVG paths) MUST **ONLY** be utilized when displaying the official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer imprint** lines.
   - All clinical UI, research frame literature, telemetric navigation, data HUDs, vitals tables, and reading frames MUST strictly utilize the clean, high-legibility clinical typography stacks (`font-pocketgull-sans-clinical`, `font-pocketgull-inter`, `font-pocketgull-mono`, `font-pocketgull-notofu`) to guarantee zero dosage misinterpretation and optimal optical legibility.
7. **Amazon Associates & Commercial Affiliate Egress Governance Standard**:
   - **Strict SMS & Email Link Prohibition**: NEVER include raw Amazon affiliate links (`amazon.com/dp/*`, `tag=pgdpo-20`) in outbound SMS messages, push notifications, or emails. Outbound communications must direct patients back to their secure Pocket-Gull web Care Plan URL.
   - **Mandatory FTC & Clinical Disclosure**: All product cards and affiliate components MUST display the clear FTC disclosure (`As an Amazon Associate, PocketGull earns from qualifying purchases`) and state that recommendations are supportive evidence-grounded resources, not direct prescriptions.
   - **Zero PHI in Outbound URLs**: External affiliate links must never include patient identifiers, medical record numbers, diagnoses, or condition codes in query parameters.
   - **Zero Foundation Model Training on Catalog Content**: Amazon product catalog content and metadata may only be used for runtime inference/classification; NEVER use Amazon catalog data to train or fine-tune foundational base LLM weights.
8. **Anti-Whaling & Clinical Cybersecurity Governance Standard**:
   - **Dual-Custody (M-of-N) Multi-Signature Protocol**: Bulk patient exports (>50 records), batch state deletions, or treasury disbursements $\ge \$500$ MUST require dual distinct authenticated clinical/executive roles (`MandiantClinicalDefenseService.verifyDualCustodyAuthorization`). No single compromised executive or CMO credential can execute unilateral high-impact actions.
   - **Anti-Deepfake Audio & Synthetic Voice Boundary**: Spoken voice telemetry is strictly an interaction modality, NEVER an authentication credential. Privileged state alterations or controlled medication edits ordered over voice MUST enforce a step-up hardware FIDO2 / WebAuthn physical passkey challenge.
   - **STAT Emergency Override Forensic Attestation**: Declaring a STAT emergency bypass NEVER disables core safety or de-identification filters; all emergency overrides automatically generate immutable SHA-256 forensic snapshot audit entries (`IIncidentForensicSnapshot`).
   - **Indirect Prompt Injection & Unicode Sanitization (OWASP LLM01)**: All external clinical notes and partner payloads MUST be stripped of non-printable zero-width Unicode characters (`\u200B`, `\u200C`) and partitioned structurally (`[CLINICAL DIRECTIVE CONTEXT]`) to prevent LLM guardrail subversion.
9. **Tailwind CSS Best Practices & Production Performance Standard**:
   - **Zero Runtime JIT CDN in Production**: Never use `<script src="https://cdn.tailwindcss.com"></script>` in production builds or static SSR endpoints. All Tailwind styles MUST be precompiled and tree-shaken at build time to eliminate render-blocking script execution and maintain 100/100 Lighthouse performance.
   - **Design Token Discipline**: Map all semantic colors (`obsidian`, `gearTeal`, `amberGold`, `paperCream`) directly into `tailwind.config.js` rather than using scattered arbitrary hex values (`bg-[#09090b]`).
   - **WCAG AAA Contrast & Focus Rings**: Enforce a $\ge 7:1$ contrast ratio for all readable text against dark obsidian surfaces (`text-zinc-300` / `text-zinc-200` on `#09090b`). Never remove focus outlines without an explicit `focus-visible:ring-2 focus-visible:ring-teal-400` accessible focus state.
   - **Fitts's Law Hitboxes**: All interactive elements (buttons, links, drawer toggles) MUST maintain a minimum $44 \times 44\text{ px}$ (or $48 \times 48\text{ px}$) physical touch target with `touch-manipulation` enabled.
   - **Zero Cumulative Layout Shift (CLS)**: Always provide explicit HTML `width` and `height` attributes alongside Tailwind responsive utility classes on all images, icons, and embedded canvas containers.
   - **Tabular Figures for Telemetry**: Enforce `tabular-nums` and `font-mono` on all timers, blood pressure vitals, heart rates, and financial figures to eliminate layout jitter.
10. **Five Eyes (FVEY) Regulatory & Data Sovereignty Standard**:
   - **Mandatory Statutory Mapping**: All clinical state exports, consent flows, and emergency vectors MUST support explicit Five Eyes partner nation profiles:
     * **United States**: HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FHIR US Core R4, 988 Suicide & Crisis Lifeline.
     * **United Kingdom**: NHS DTAC, DSPT, UK-GDPR, NICE ESF, FHIR UK Core, NHS 111 Dispatch.
     * **Canada**: PIPEDA, Ontario PHIPA, Alberta HIA, FHIR CA Baseline, 988 Suicide Crisis Helpline.
     * **Australia**: Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD, FHIR AU Base, Lifeline 13 11 14.
     * **New Zealand**: Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064, FHIR NZ Base, 1737 Need to Talk.
11. **Institutional Thin-Client & Multi-Device Resilience Standard**:
    - **Cross-Form Factor Parity**: Every clinical interface MUST render with zero horizontal blowout and full feature parity across:
      * `mobile-iphone` (iOS WebKit / Safari viewport dynamics)
      * `mobile-chrome` (Android Pixel 7)
      * `tablet-ipad-exam-room` (810x1080 exam room swivel mounts)
      * `chromebook-school-library` (1366x768 constrained touch kiosks)
      * `clinical-cow-workstation` (1280x1024 5:4 ratio Citrix/COW workstations)
    - **Defensive Permission Fallback**: If microphone, camera, or Web Audio permissions are restricted by institutional group policy, the UI MUST gracefully transition to keyboard/text input and visual telemetry without throwing unhandled exceptions.
12. **Domain Encapsulation & "Tell, Don't Ask" Architecture Standard (Anti-Getter Business Logic Bolting)**:
    - **Prohibition of Bolting External Logic on Getters**: NEVER reuse or query an existing getter simply to extract raw state and bolt new business logic, domain calculations, or state mutations externally on the caller side.
    - **"Tell, Don't Ask" Principle**: Direct objects to perform domain actions and calculate their own results. Move operations to the entity, model, or domain service that owns the relevant data and business invariants.
    - **Intent-Revealing Domain Methods**: When new business capabilities or workflows arise, create explicit, purpose-built domain methods directly on the owning class rather than chaining logic around generic property accessors.
    - **Prevent Feature Envy & Anemic Domain Models**: Encapsulate validation, invariants, and multi-field transformations within domain boundaries rather than scattering raw getter computations across UI components and callers.
