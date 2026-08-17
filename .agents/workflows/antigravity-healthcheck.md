---
description: Perform a comprehensive healthcheck of Pocket-Gull (TypeScript, Vitest, Python sidecar, HIPAA PHI, GCP cost scale-to-zero)
---

# Pocket-Gull Healthcheck Workflow (`/antigravity-healthcheck`)

Execute the following steps to verify full project health and regulatory compliance:

## Step 1: TypeScript Typecheck
Run the authoritative TypeScript compiler check:
```bash
node c:/Users/philg/Pocketgull/pocketgull/node_modules/typescript/lib/tsc.js -p c:/Users/philg/Pocketgull/pocketgull/tsconfig.json --noEmit
```
Verify: **0 errors**.

## Step 2: Vitest Unit Test Suite
Execute the full unit test suite:
```bash
node c:/Users/philg/Pocketgull/pocketgull/node_modules/vitest/vitest.mjs run --config c:/Users/philg/Pocketgull/pocketgull/vitest.config.ts
```
Verify: **100% tests passing** (539+ unit tests, 177+ spec files).

## Step 3: Python FastAPI Sidecar Check
Verify Pydantic models and ONNX FP16 inference engine:
```bash
python c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/run_tests.py
```

## Step 4: Security & Safe Harbor Verification
- Verify DOMPurify sanitization in `PatientStateService`.
- Verify `DANGEROUS_CONTENT = OFF` in `src/server/genkit.ts` per `SECURITY.md §2`.
- Verify commit subject limit (72 characters max).

## Step 5: GCP Cloud Scale-to-Zero Verification
- Verify Cloud Run `minScale: 0`.
- Verify Artifact Registry 7-day auto-deletion lifecycle (`olderThan: 604800s`).
