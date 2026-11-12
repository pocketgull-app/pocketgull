# Diataxis Documentation Quadrant Map

**Standard**: Diataxis Framework (diataxis.fr)
**Audit Date**: 2026-08-05

This document maps all existing PocketGull documentation into the four Diataxis quadrants and identifies coverage gaps.

---

## Quadrant Grid

```
                        [ACTION-ORIENTED]
                 Tutorials    |    How-To Guides
                 (Good)        |    (Good coverage)
  [ACQUISITION] --------------+-------------- [APPLICATION]
                 Explanations |    Reference
                 (Good)       |    (Good)
                        [COGNITION-ORIENTED]
```

---

## Classification

### Tutorials (Learning-Oriented / Action + Acquisition)

_Guide beginners through step-by-step practical tasks in a controlled environment._

| Document | Status | Notes |
|---|---|---|
| [tutorial-first-encounter.md](docs/tutorial-first-encounter.md) | Complete | 6-step guided walkthrough: splash → patient → 3D anatomy → AI care plan → evidence → export |

---

### How-To Guides (Goal-Oriented / Action + Application)

_Provide practical directions to solve specific, real-world problems._

| Document | Path | Status |
|---|---|---|
| GSD Runbook | [docs/runbook.md](docs/runbook.md) | Complete |
| Token Optimization Guide | [docs/token-optimization-guide.md](docs/token-optimization-guide.md) | Complete |
| Model Selection Playbook | [docs/model-selection-playbook.md](docs/model-selection-playbook.md) | Complete |
| Contributing Guide | [CONTRIBUTING.md](CONTRIBUTING.md) | Complete |
| SDLC/AIDLC Roadmap | [docs/SDLC_AIDLC_ROADMAP.md](docs/SDLC_AIDLC_ROADMAP.md) | Complete |
| Google Fonts Submission | [docs/GOOGLE_FONTS_SUBMISSION.md](docs/GOOGLE_FONTS_SUBMISSION.md) | Complete |

---

### Reference (Information-Oriented / Cognition + Application)

_Objective descriptions of system machinery (API schemas, config flags)._

| Document | Path | Status |
|---|---|---|
| OpenAPI Specification | [docs/openapi.json](docs/openapi.json) | Complete |
| CHANGELOG | [CHANGELOG.md](CHANGELOG.md) | Complete |
| Dependency Register | [package.json](package.json) | Complete |
| SBOM (SPDX) | [sbom.spdx.json](sbom.spdx.json) | Partial |
| Feature Parity Matrix | [docs/research/parity_matrix.md](docs/research/parity_matrix.md) | Complete |
| COCOMO II Report | [cocomo2_report.md](cocomo2_report.md) | Complete |
| Audit Report | [docs/compliance/AUDIT_REPORT.md](docs/compliance/AUDIT_REPORT.md) | Complete (new) |
| Env Vars & CLI Reference | [docs/reference-env-vars.md](docs/reference-env-vars.md) | Complete (new) |
| Epistemic Falsification Suite | [docs/EPISTEMIC_FALSIFICATION_SUITE.md](docs/EPISTEMIC_FALSIFICATION_SUITE.md) | Complete (new) |

---

### Explanation (Understanding-Oriented / Cognition + Acquisition)

_Broader context and conceptual justifications._

| Document | Path | Status |
|---|---|---|
| Design System | [docs/design/DESIGN.md](docs/design/DESIGN.md) | Complete |
| Security Policy | [SECURITY.md](SECURITY.md) | Complete |
| Case Study | [docs/case_study.md](docs/case_study.md) | Complete |
| Valuation and Positioning | [docs/valuation_and_positioning.md](docs/valuation_and_positioning.md) | Complete |
| Eurostars Proposal Blueprint | [docs/eurostars_proposal_blueprint.md](docs/eurostars_proposal_blueprint.md) | Complete |
| COCOMO II Typeface Valuation | [docs/COCOMO_II_TYPEFACE_VALUATION.md](docs/COCOMO_II_TYPEFACE_VALUATION.md) | Complete |
| Accessibility (SIGCHI) | [docs/ACCESSIBILITY_SIGCHI.md](docs/ACCESSIBILITY_SIGCHI.md) | Complete |
| Systems Architecture (SIGARCH) | [docs/SIGARCH_QUANTITATIVE_SYSTEMS_ARCHITECTURE.md](docs/SIGARCH_QUANTITATIVE_SYSTEMS_ARCHITECTURE.md) | Complete |
| Clinical Knowledge Mining (SIGBIO/SIGKDD) | [docs/SIGBIO_SIGKDD_CLINICAL_KNOWLEDGE_MINING.md](docs/SIGBIO_SIGKDD_CLINICAL_KNOWLEDGE_MINING.md) | Complete (new) |
| WebGPU & Biophysical Shaders (SIGGRAPH) | [docs/SIGGRAPH_WEBGPU_BIOPHYSICAL_RENDERING.md](docs/SIGGRAPH_WEBGPU_BIOPHYSICAL_RENDERING.md) | Complete (new) |
| Audio Streaming & Biomarkers (SIGCOMM/SPS) | [docs/SIGCOMM_SPS_STREAMING_AUDIO_BIOMARKERS.md](docs/SIGCOMM_SPS_STREAMING_AUDIO_BIOMARKERS.md) | Complete (new) |
| Zero-Trust & Cryptographic Privacy (SIGSAC/SIGSEC) | [docs/SIGSAC_HIPAA_ZERO_TRUST_PRIVACY.md](docs/SIGSAC_HIPAA_ZERO_TRUST_PRIVACY.md) | Complete (new) |
| Formally Verified State Architecture (SIGSOFT/SIGPLAN) | [docs/SIGSOFT_SIGPLAN_REACTIVE_STATE_ARCHITECTURE.md](docs/SIGSOFT_SIGPLAN_REACTIVE_STATE_ARCHITECTURE.md) | Complete (new) |
| Energetics & Green Computing (IEEE PES) | [docs/IEEE_PES_POWER_ENERGY_SUSTAINABILITY.md](docs/IEEE_PES_POWER_ENERGY_SUSTAINABILITY.md) | Complete (new) |
| Sustainability, Performance & TCO Audit | [docs/EVALUATION_SUSTAINABILITY_AND_PERFORMANCE.md](docs/EVALUATION_SUSTAINABILITY_AND_PERFORMANCE.md) | Complete (new) |
| Epistemic Falsification Architecture | [docs/EPISTEMIC_FALSIFICATION_SUITE.md](docs/EPISTEMIC_FALSIFICATION_SUITE.md) | Complete (new) |
| Discovery Backlog | [docs/research/QUESTIONS.md](docs/research/QUESTIONS.md) | Complete (new) |

---

## Misclassification Warnings

| Document | Current Classification | Issue | Recommendation |
|---|---|---|---|
| `README.md` | Mixed | Combines tutorial-style setup, architectural explanation, and reference badges | Split into: Tutorial (setup) + Explanation (architecture) |
| `SECURITY.md` | Mixed | Combines policy rationale (Explanation) with procedural compliance steps (How-To) | Acceptable as-is for security docs; consider splitting if >500 LOC |

---

## Gap Summary

| Quadrant | Gap | Recommended Deliverable | Priority |
|---|---|---|---|
| ~~Tutorial~~ | ~~First-user onboarding~~ | [tutorial-first-encounter.md](docs/tutorial-first-encounter.md) | **DONE** |
| ~~Reference~~ | ~~Environment configuration~~ | [reference-env-vars.md](docs/reference-env-vars.md) | **DONE** |
