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

## Agentic & AI Pairing Rules
- **Empirical Verification Guarantee**: Never declare a task resolved or a bug fixed based solely on code edits. Always gather concrete runtime evidence by executing the explicit TypeScript typecheck (`tsc --noEmit`), Vitest suite (`npm test`), or Angular build (`ng build`).
- **Context & Symbol Defensiveness**: Never mutate function signatures, interfaces, or dependency overrides from partial/truncated file views. If an imported symbol or type is referenced, inspect its authoritative definition first to prevent broken contract calls across workspace packages.
- **Sub-Dependency Peer Traceability**: When adding or upgrading a root package override (e.g., `undici`, `esbuild`, `postcss`), always verify peer dependency requirements of consumer dev-tools (such as `jsdom`, `@angular/build`, or `vitest`) using `npm view <package> dependencies` to prevent runtime loader failures in CI.
- **Strict Pre-Commit Self-Healing**: Husky pre-commit hooks (`lint-staged`, commit-msg 72-char limit, Sentinel security guard) are mandatory. If a pre-commit check fails, read the un-truncated log output, fix the root cause, and re-commit. Never bypass hooks with `--no-verify`.
- **Token Budget & Research Subagent Isolation**: Offload heavy codebase surveys, log extractions, or multi-file research to background subagents (`research` or `self`). Allow the primary session to maintain clean focus on implementation and verification.

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



