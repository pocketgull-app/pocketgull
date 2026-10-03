---
name: greenops-deployment-guard
description: Audits, enforces, and optimizes carbon-aware lightweight deployments across Cloud Run, Cloud Build, Docker, and GitHub Actions, ensuring sub-10MB build contexts, font CDN offloading, Docker layer caching, and scale-to-zero FinOps compliance.
---

# GreenOps & Carbon-Aware Deployment Guard

## Overview
The `greenops-deployment-guard` enforces sustainable software engineering, minimal cloud costs, and carbon-aware deployments across PocketGull repositories (`pocketgull`, `pocketgull-com`, and companion apps).

## Core Principles & Invariants

### 1. Zero-TTF Web Container Rule
- **Never bundle desktop TTF font binaries (`*.ttf`) into web container images.**
- Raw `.ttf` fonts average 2–3 MB per weight, accumulating 120+ MB of dead payload that web browsers never download when `.woff2` is present.
- **Enforcement**: Verify `.gcloudignore` and `.dockerignore` contain:
  ```gitignore
  *.ttf
  public/fonts/*.ttf
  public/brand/
  typefaces_vault/
  ```

### 2. Canonical Font CDN Offloading (`font.pocketgull.app`)
- The single source of truth for the PocketGull typography superfamily is `https://font.pocketgull.app/fonts/woff2/...`.
- All `@font-face` rules in CSS/HTML must prioritize the Fastly/GitHub-backed edge CDN with `Access-Control-Allow-Origin: *`:
  ```css
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGull-Bold.woff2?v=3.3.0') format('woff2'),
       url('/fonts/PocketGull-Bold.woff2') format('woff2');
  ```
- Local containers must only retain the core referenced `.woff2` files (~4 MB) for offline intranet fallback.

### 3. Docker Layer Caching (`--cache-from`) in Cloud Build
- Every `cloudbuild.yaml` must pull the existing `:latest` image before building to warm the Docker cache:
  ```yaml
  steps:
    - name: 'gcr.io/cloud-builders/docker'
      entrypoint: 'bash'
      args:
        - '-c'
        - |
          docker pull gcr.io/$PROJECT_ID/<service>:latest || true
    - name: 'gcr.io/cloud-builders/docker'
      args:
        - 'build'
        - '--cache-from'
        - 'gcr.io/$PROJECT_ID/<service>:latest'
        - '-t'
        - 'gcr.io/$PROJECT_ID/<service>:latest'
        - '.'
  ```
- When `package.json` is unchanged, `npm ci` is skipped via cache hit, reducing build execution time by >80% (from ~55s to ~10s).

### 4. Local-First Staging & Batching Invariant
- **Prohibit single-line continuous deployments.**
- Always verify changes locally on `http://localhost:4001/` or `http://localhost:4200/` across all three reading modes (Standard, 6th Grade, Journal).
- Run full pre-flight verification chains (`npm run build`, `npm run observatory:audit`, `npm test`) locally before triggering a deployment.
- Batch editorial and feature updates into one consolidated release per turn/session.

### 5. GitHub Actions Concurrency & Path Filtering
- Workflows must include concurrency control:
  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```
- Workflows must include path filtering to prevent running builds for documentation or markdown changes:
  ```yaml
  paths-ignore:
    - '**.md'
    - '.gitignore'
    - 'LICENSE'
  ```

### 6. Cloud Run Scale-to-Zero & 7-Day Auto-Pruning
- Cloud Run services must specify `--min-instances 0` to ensure zero compute and zero watts when idle.
- Enforce a 7-day auto-deletion policy (`olderThan: "604800s"`, `keepCount: 3`) on Artifact Registry and GCS source buckets (`gs://*_cloudbuild`, `gs://run-sources-*`).
