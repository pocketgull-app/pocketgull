# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: 9/15/2026, 1:47:20 PM
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | 1,419 | 264,728 | 264.73 |
| **Dart (Flutter Mobile Suite)** | 256 | 44,581 | 44.58 |
| **Python (FastAPI Sidecar & ML)** | 171 | 25,955 | 25.95 |
| **CSS / Styling System** | 12 | 5,069 | 5.07 |
| **JSON & YAML Manifests** | 4,492 | 93,639 | 93.64 |
| **Markdown Documentation** | 161 | 17,639 | 17.64 |
| **TOTAL MONOREPO** | **6,511** | **451,611** | **451.61 KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Executable Code Base (KSLOC)** | **340.33 KSLOC** (TS + Dart + Python + CSS) |
| **Effort Estimate** | **1143.98 Person-Months** |
| **Estimated Development Time (TDEV)** | **29.89 Months** |
| **Average Full-Time Staffing** | **38.3 Engineers** |
| **Estimated Commercial Value / Replacement Cost** | **$17,159,656 USD** ($15k/month burdened rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Modular standalone component architecture.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR R4 validation, & Vitest suites.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
