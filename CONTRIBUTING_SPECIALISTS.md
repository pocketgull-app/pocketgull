# Pocket-Gull Enterprise Specialist & Domain Expert Guide

Welcome to the **Pocket-Gull** engineering ecosystem under **`pocketgull-app`**.

This document outlines the standard operating procedures, repository boundaries, and contract-driven development workflows for subject matter experts (SMEs), medical imaging specialists, mobile engineers, and clinical consultants.

---

## 1. Core Principles for Specialists

1. **Contract-Driven Boundaries**:
   * All inter-service communications, request/response models, and ML predictions MUST strictly adhere to the OpenAPI specification in [`contracts/clinical-ml-openapi.yaml`](file:///c:/Users/philg/Pocketgull/pocketgull/contracts/clinical-ml-openapi.yaml) or FHIR R4 schema standards.
   * If an endpoint schema needs to evolve, update the contract first before modifying implementation code.

2. **Least Privilege & IP Isolation**:
   * Domain specialists work strictly within their assigned domain repository (`pocketgull-web`, `clinical-ml-engine`, `pocketgull-mobile`, or `fhir-interoperability`).
   * No raw Protected Health Information (PHI) is ever committed, transmitted, or logged. All patient vectors must adhere to HIPAA §164.514 Safe Harbor de-identification.

3. **Hermetic Testing & Empirical Verification**:
   * Every pull request must include deterministic unit tests with zero network mocking leaks.
   * ML pipelines must log Out-of-Fold (OOF) cross-validation progression and compute Popperian null-hypothesis $p$-values against baseline distributions.

---

## 2. Discipline-Specific Standards

### A. Clinical ML & Data Science Specialists (`pocketgull_api/` & `clinical-ml-engine`)
* **Python Version**: Python 3.12+ managed via `uv` or `pip`.
* **Formatting & Linting**: `ruff check .` and `black --line-length 88 .`
* **Schema Validation**: All request/response payloads MUST use **Pydantic v2** `BaseModel` classes with explicit types and field constraints.
* **Async Hygiene**: Use `async def` for I/O and standard `def` for CPU-bound PyTorch/scikit-learn matrix calculations.
* **Execution**:
  ```bash
  cd pocketgull_api
  pip install -r requirements.txt
  pytest tests/
  ```

### B. Frontend & Spatial Computing Specialists (`src/` & `pocketgull-web`)
* **Node & Angular**: Node.js v24.x, Angular 22 Standalone Components with Signals.
* **Styling**: TailwindCSS with curated color tokens. Avoid ad-hoc utility workarounds.
* **Three.js Graphics**: Biophysical PBR texture shaders with WebGL fallback and responsive resize observers.
* **Execution**:
  ```bash
  npm install
  npm test # Vitest suite
  npm run build # Angular build
  ```

### C. Mobile & Companion App Specialists (`pocketgull_flutter/` & `pocketgull-mobile`)
* **Framework**: Flutter 3.x with Riverpod state management.
* **Null Safety**: Strict null safety is mandatory.
* **Execution**:
  ```bash
  cd pocketgull_flutter
  flutter pub get
  flutter test
  ```

---

## 3. Pull Request & Review Workflow

1. **Branch Naming**: Follow `<type>/<short-description>` (e.g. `feat/dicom-knee-segmentation`, `fix/fhir-observation-code`).
2. **Commit Messages**: Follow Conventional Commits with a **72-character maximum** subject line:
   ```text
   feat(ml): add Asymmetric Loss to multi-label knee abnormality model
   fix(fhir): sanitize narrative text blocks in bundle serializer
   ```
3. **Automated Status Checks**:
   * Pull requests automatically trigger CodeQL security scanning, typechecking, and unit test suites.
   * Merges require signoff from the designated team in [`.github/CODEOWNERS`](file:///c:/Users/philg/Pocketgull/pocketgull/.github/CODEOWNERS).

---

## 4. 1-Click Cloud Developer Environment

You can start working immediately in your browser without local setup:
1. Open the repository on GitHub.
2. Click **Code** &rarr; **Codespaces** &rarr; **Create codespace on main**.
3. All dependencies (Node 24, Python 3.12, Angular CLI, extensions) will initialize automatically.
