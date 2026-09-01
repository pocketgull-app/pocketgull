# <p align="center">🕊️ Pocket-Gull Enterprise Clinical Intelligence Ecosystem</p>

<p align="center">
  <strong>Insight Beneath the Surface.</strong><br/>
  Real-time multimodal medical care planning, Tri-Paradigm clinical strategy, and zero-PHI sovereign edge computing powered by Google Gemini.
</p>

<p align="center">
  <a href="https://pocketgull.app"><img src="https://img.shields.io/badge/Live_Platform-pocketgull.app-0ea5e9?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Live App"></a>
  <a href="https://github.com/pocketgull-app/pocketgull/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/pocketgull-app/pocketgull/deploy.yml?style=for-the-badge&label=Cloud_Run_Deploy" alt="Deploy"></a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/pocketgull-app/pocketgull"><img src="https://img.shields.io/badge/OpenSSF-10%2F10-blueviolet?style=for-the-badge" alt="OpenSSF Scorecard"></a>
  <a href="https://github.com/pocketgull-app/pocketgull"><img src="https://img.shields.io/badge/SLSA-Level_3-blueviolet?style=for-the-badge&logo=googlecloud" alt="SLSA 3"></a>
  <a href="https://doi.org/10.5281/zenodo.20647514"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.20647514.svg" alt="DOI"></a>
</p>

---

## 🏛️ Enterprise Engineering Architecture

```
                                  ┌──────────────────────────────┐
                                  │   Pocket-Gull Contracts      │
                                  │  (OpenAPI 3.1 & FHIR Schema) │
                                  └──────────────┬───────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            │                                    │                                    │
            ▼                                    ▼                                    ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│       pocketgull-web         │ │     clinical-ml-engine       │ │      pocketgull-mobile       │
│  Angular 22 • Three.js 3D    │ │   Python 3.12 • PyTorch      │ │    Flutter 3.x • Riverpod    │
│   Multimodal Gemini Live     │ │  FastDICOM • Conformal ML    │ │  HealthKit / Google Fit Core │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
            │                                    │                                    │
            └────────────────────────────────────┼────────────────────────────────────┘
                                                 │
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │    fhir-interoperability     │
                                  │  Ruby 3.3 • Rails FHIR R4    │
                                  │   SMART-on-FHIR • EHR Sync   │
                                  └──────────────────────────────┘
```

---

## 🔬 Core Repositories & Domain Specializations

| Repository | Domain Discipline | Primary Tech Stack | Specialist Role |
| :--- | :--- | :--- | :--- |
| **[`pocketgull`](https://github.com/pocketgull-app/pocketgull)** | Primary Monorepo Platform | Angular 22 Signals, Node/Express, Three.js | Lead Architects & Full-Stack |
| **`clinical-ml-engine`** | Medical Imaging & Risk Models | Python 3.12, PyTorch, FastDICOM, FastAPI | Radiologists & ML Engineers |
| **`pocketgull-mobile`** | Patient & Provider Companion Apps | Flutter 3.x, Riverpod, Fastlane | iOS & Android Engineers |
| **`fhir-interoperability`** | Healthcare Data Standards | Ruby 3.3 YJIT, Rails Engine, Synthea | Health Informatics Experts |
| **`pocketgull-contracts`** | API Schemas & Multi-Language SDKs | OpenAPI 3.1, JSON Schema, Protobuf | Systems Engineers |

---

## 🔒 Enterprise Security, Privacy & Ethics

* **Zero-PHI Persistence**: Client-side ephemeral execution with WebAssembly & WebGPU. No protected health information is stored in centralized databases.
* **HIPAA §164.514 Compliance**: All synthetic datasets and test archetypes adhere to strict Safe Harbor de-identification standards.
* **Human-in-the-Loop (HITL)**: All clinical decision support recommendations mandate licensed physician review before execution.
* **Supply Chain Security**: SLSA Level 3 build provenance, OpenSSF 10/10 Scorecards, and automated secret push protection.

---

## 👥 Enterprise Governance & Teams

* **`@pocketgull-app/core-maintainers`**: Executive architecture, contracts, and release gatekeeping.
* **`@pocketgull-app/clinical-ai`**: Deep learning models, DICOM inference pipelines, and LLM safety filters.
* **`@pocketgull-app/mobile-team`**: Cross-platform Flutter client development and app store deployments.
* **`@pocketgull-app/security-leads`**: DevSecOps, GCP infrastructure hardening, and HIPAA compliance audits.

---

## 🚀 Onboarding for Domain Specialists

Domain experts and contractors can spin up an isolated, GPU-enabled cloud development environment in **under 30 seconds** via GitHub Codespaces:

1. Navigate to the relevant domain repository.
2. Click **Code** &rarr; **Codespaces** &rarr; **Create codespace on main**.
3. Read the [Specialist Contributing Guidelines](https://github.com/pocketgull-app/pocketgull/blob/main/CONTRIBUTING_SPECIALISTS.md).

---

<p align="center">
  <sub>© 2026 PocketGull LLC. Distributed under the MIT and Apache-2.0 Licenses.</sub>
</p>
