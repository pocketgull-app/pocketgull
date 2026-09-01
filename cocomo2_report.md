# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: 8/31/2026, 6:05:39 PM
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | 1,287 | 222,642 | 222.64 |
| **Dart (Flutter Mobile Suite)** | 201 | 33,890 | 33.89 |
| **Python (FastAPI Sidecar & ML)** | 141 | 19,381 | 19.38 |
| **CSS / Styling System** | 12 | 4,882 | 4.88 |
| **JSON & YAML Manifests** | 4,457 | 94,074 | 94.07 |
| **Markdown Documentation** | 159 | 13,457 | 13.46 |
| **TOTAL MONOREPO** | **6,257** | **388,326** | **388.33 KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Executable Code Base (KSLOC)** | **280.80 KSLOC** (TS + Dart + Python + CSS) |
| **Effort Estimate** | **944.03 Person-Months** |
| **Estimated Development Time (TDEV)** | **28.22 Months** |
| **Average Full-Time Staffing** | **33.4 Engineers** |
| **Estimated Commercial Value / Replacement Cost** | **$14,160,462 USD** ($15k/month burdened rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Modular standalone component architecture.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR R4 validation, & Vitest suites.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
