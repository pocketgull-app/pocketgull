# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: 9/17/2026, 10:44:14 AM
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | 1,475 | 281,443 | 281.44 |
| **Dart (Flutter Mobile Suite)** | 256 | 44,581 | 44.58 |
| **Python (FastAPI Sidecar & ML)** | 189 | 33,461 | 33.46 |
| **CSS / Styling System** | 9 | 5,062 | 5.06 |
| **JSON & YAML Manifests** | 4,509 | 85,037 | 85.04 |
| **Markdown Documentation** | 164 | 18,138 | 18.14 |
| **TOTAL MONOREPO** | **6,602** | **467,722** | **467.72 KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Executable Code Base (KSLOC)** | **364.55 KSLOC** (TS + Dart + Python + CSS) |
| **Effort Estimate** | **1225.28 Person-Months** |
| **Estimated Development Time (TDEV)** | **30.50 Months** |
| **Average Full-Time Staffing** | **40.2 Engineers** |
| **Estimated Commercial Value / Replacement Cost** | **$18,379,268 USD** ($15k/month burdened rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Modular standalone component architecture.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR R4 validation, & Vitest suites.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
