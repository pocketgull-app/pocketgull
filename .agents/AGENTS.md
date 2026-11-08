# Pocket Gull Workspace & Engineering Operations Rules

## 1. Runtime, Build & Monorepo Overrides
- **Node.js Version**: Strictly use **Node.js v24.x** (`.node-version`, `.nvmrc`, `package.json`).
- **Default Commands (Explicit Node Paths)**:
  - **TypeScript Typecheck**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit`
  - **Angular Build**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build`
  - **Unit Tests**: `npm test -- --run`
  - **GCP Security Audit**: `npm run gcp:audit`
- **esbuild Overrides**: Global `esbuild` is pinned to `0.27.2`; `@angular/build` & `@angular-devkit/build-angular` override `esbuild` to `0.28.1`; `astro` & `@astrojs/mdx` live in root `devDependencies`. Keep sub-workspace `overrides` (`companion-apps/avs-therapy`, `pocketgull_api`) synced with root `package.json`.

## 2. Language & Companion Standards
- **Python / FastAPI (`pocketgull_api`)**: Format with `ruff` and `black` (88 chars). Strictly type all models with Pydantic v2 `BaseModel` & `Field` (zero raw dicts/`Any`). Use `async def` for I/O and sync `def` for CPU/ML matrix work. Raise `fastapi.HTTPException` with structured detail payloads, log via `logging`/`structlog` (never `print()`), and write Google Style docstrings.
- **Flutter / Dart (`pocketgull_flutter`)**: Prefer **Dart** (`dart run script.dart`) over Python for standalone scripts/FHIR tools (Randal L. Schwartz Standard). Use **Riverpod** for state management, small stateless widgets, and strict null safety.
- **Ruby / Rails (`pocketgull-fhir-rails`)**: Ruby 3.3.x+ with YJIT on `ruby:3.3-alpine`, namespaced under `module Pocketgull`, zero `rubocop` offenses, `~>` gemspec pins, and `WebMock`/`VCR` test isolation.

## 3. Conventional Commits & OpenSSF Git Hygiene
- **Format**: `<type>(<scope>): <description>` — **STRICT MAX 72 CHARS** on subject line, imperative mood, lowercase description start, no trailing period. Sign off with DCO (`git commit -s`).
- **Types**: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`.
- **Scopes**: `ui`, `ux`, `layout`, `theme`, `print`, `ai`, `gemini`, `adk`, `voice`, `clinical`, `fhir`, `intake`, `triage`, `server`, `ssr`, `api`, `flutter`, `dart`, `mobile`, `python`, `ml`, `sidecar`, `security`, `csp`, `codeql`, `hipaa`, `ci`, `cd`, `docker`, `deploy`, `cloudrun`, `demo`, `mock`, `e2e`, `playwright`, `test`, `three`, `anatomy`, `3d`, `sentinel`, `companion`, `types`, `build`, `deps`.
- **SPDX Headers**: Include `// SPDX-License-Identifier: Apache-2.0` on all new source files.

## 4. Gemini Safety Filter Policy (`src/server/genkit.ts` / `SECURITY.md §2`)
- **DANGEROUS_CONTENT = `OFF`**: Required so drug dosages, toxicology, overdose care, and PHQ-9/C-SSRS suicide screening are never false-positive blocked.
- **Imaging & OCR Flows = All `OFF`**: Medical imaging and clinical OCR require permissive settings across all categories.
- **HARASSMENT & HATE_SPEECH = `BLOCK_ONLY_HIGH`**, **SEXUALLY_EXPLICIT = `BLOCK_ONLY_HIGH`** (text) / **`OFF`** (imaging). Never revert to `BLOCK_LOW_AND_ABOVE` or `BLOCK_MEDIUM_AND_ABOVE`.

## 5. CI/CD, CodeQL Taint Breaking & Playwright E2E
- **CodeQL Taint Breaking (Zero `lgtm[]` comments)**:
  - *System Prompt Injection*: Keep `systemInstruction` static (`BASE_CLINICAL_PROMPT`); pass sanitized user directives prefixed with `[CLINICAL DIRECTIVE CONTEXT]` in user content.
  - *Binary Writes*: Validate magic bytes (e.g., `0x00 0x01 0x00 0x00` for TTF) and copy into `Buffer.alloc()` before disk writes.
  - *Log Injection & URL Matching*: Destructure primitive fields before logging; use exact string equality (`svc == _GCS_SERVICE_NAME`) instead of substring containment.
- **Playwright E2E**: Call `await enterDemoMode(page)` after `setupE2ePage(page)` in `beforeEach` and use case-insensitive regex locators (`text=/.../i`).
- **Harden Runner & Docker**: Set `disable-sudo: false` when `apt-get` installing C-extension deps (`libhdf5-dev`). Copy all workspace `package*.json` files in root `Dockerfile` and gate `release.yml` jobs with `if: github.event_name != 'pull_request'`. Use portable relative script paths.

## 6. Subagent Delegation Matrix

| Subagent Role | Type / Name | Trigger Conditions & Responsibilities |
| :--- | :--- | :--- |
| **Broad Research** | `research` | Scanning >5 files, reading long logs, external docs (Read-Only, single-turn synthesis). |
| **Invasive Refactors** | `self` (`branch`) | High-risk multi-file refactors or dependency upgrades isolated in branched workspace. |
| **Clinical & FHIR Audit** | `clinical-auditor` | Patient state signals, PHQ/GAD/C-SSRS scoring, FHIR R4 serialization, HIPAA Safe Harbor, Popperian $H_0$ & 12 fallacies. |
| **SWE Code Review** | `swe-code-reviewer` | Angular 22 standalone components, Signal graph architecture, Hyrum's Law & SWE Book compliance. |
| **CUDA & GPU Architect** | `nvidia-cuda-architect` | Tesla T4/A100/H100 AMP FP16/BF16, FlashAttention-2/SDPA, MONAI SmartCache, Tensor Core profiling. |
| **Observatory 125 Guard** | `observatory-125-guard` | Express/SSR headers, CSP nonces, HSTS, routing, live synthetic 125/100 verification. |
| **WebMCP Tester** | `webmcp-tester` | `WebMcpRegistrationService` JSON schema contracts, `AbortController` signals, unit spec coverage. |

## 7. Context Hygiene & Proof-of-Work
- **Search-First**: Use `grep_search` before `view_file` on files $>300$ lines; view bounded chunks ($\le 150$ lines). Store scratch files in `<appDataDir>\brain\<conversation-id>/scratch/`.
- **Self-Healing Proof**: Fix type errors at root interfaces (no `any` or `@ts-ignore`, no `--no-verify`) and run the terminal proof chain before concluding implementation turns.
- **Domain Rules**:
  - BigQuery $\leftrightarrow$ Kaggle & Data Science: [.agents/rules/bigquery-kaggle-ml.md](file:///c:/Users/philg/Pocketgull/pocketgull/.agents/rules/bigquery-kaggle-ml.md)
  - Typefoundry & Cross-Repo Parity: [.agents/rules/typefoundry-and-repos.md](file:///c:/Users/philg/Pocketgull/pocketgull/.agents/rules/typefoundry-and-repos.md)
