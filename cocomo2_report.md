# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: 7/27/2026, 8:29:24 PM
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | 404 | 103,770 | 103.77 |
| **Dart (Flutter Mobile Suite)** | 167 | 28,853 | 28.85 |
| **Python (FastAPI Sidecar & ML)** | 56 | 9,430 | 9.43 |
| **CSS / Styling System** | 9 | 6,072 | 6.07 |
| **JSON & YAML Manifests** | 156 | 158,990 | 158.99 |
| **Markdown Documentation** | 71 | 5,866 | 5.87 |
| **TOTAL MONOREPO** | **863** | **312,981** | **312.98 KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Effort Estimate** | **1052.13 Person-Months** |
| **Estimated Development Time (TDEV)** | **29.15 Months** |
| **Average Full-Time Staffing** | **36.1 Engineers** |
| **Estimated Project Cost** | **$15,781,885 USD** ($15k/month rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Flexible open API & modular standalone component design.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR validation, & unit tests.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
