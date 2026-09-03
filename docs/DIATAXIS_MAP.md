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
| [tutorial-first-encounter.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/tutorial-first-encounter.md) | Complete | 6-step guided walkthrough: splash → patient → 3D anatomy → AI care plan → evidence → export |

---

### How-To Guides (Goal-Oriented / Action + Application)

_Provide practical directions to solve specific, real-world problems._

| Document | Path | Status |
|---|---|---|
| GSD Runbook | [docs/runbook.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/runbook.md) | Complete |
| Token Optimization Guide | [docs/token-optimization-guide.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/token-optimization-guide.md) | Complete |
| Model Selection Playbook | [docs/model-selection-playbook.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/model-selection-playbook.md) | Complete |
| Contributing Guide | [CONTRIBUTING.md](file:///c:/Users/philg/Pocketgull/pocketgull/CONTRIBUTING.md) | Complete |
| SDLC/AIDLC Roadmap | [docs/SDLC_AIDLC_ROADMAP.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SDLC_AIDLC_ROADMAP.md) | Complete |
| Google Fonts Submission | [docs/GOOGLE_FONTS_SUBMISSION.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/GOOGLE_FONTS_SUBMISSION.md) | Complete |

---

### Reference (Information-Oriented / Cognition + Application)

_Objective descriptions of system machinery (API schemas, config flags)._

| Document | Path | Status |
|---|---|---|
| OpenAPI Specification | [docs/openapi.json](file:///c:/Users/philg/Pocketgull/pocketgull/docs/openapi.json) | Complete |
| CHANGELOG | [CHANGELOG.md](file:///c:/Users/philg/Pocketgull/pocketgull/CHANGELOG.md) | Complete |
| Dependency Register | [DEPENDENCIES.md](file:///c:/Users/philg/Pocketgull/pocketgull/DEPENDENCIES.md) | Complete |
| SBOM (SPDX) | [sbom.spdx.json](file:///c:/Users/philg/Pocketgull/pocketgull/sbom.spdx.json) | Partial |
| Feature Parity Matrix | [parity_matrix.md](file:///c:/Users/philg/Pocketgull/pocketgull/parity_matrix.md) | Complete |
| COCOMO II Report | [cocomo2_report.md](file:///c:/Users/philg/Pocketgull/pocketgull/cocomo2_report.md) | Complete |
| Audit Report | [AUDIT_REPORT.md](file:///c:/Users/philg/Pocketgull/pocketgull/AUDIT_REPORT.md) | Complete (new) |
| Env Vars & CLI Reference | [docs/reference-env-vars.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/reference-env-vars.md) | Complete (new) |
| Epistemic Falsification Suite | [docs/EPISTEMIC_FALSIFICATION_SUITE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/EPISTEMIC_FALSIFICATION_SUITE.md) | Complete (new) |

---

### Explanation (Understanding-Oriented / Cognition + Acquisition)

_Broader context and conceptual justifications._

| Document | Path | Status |
|---|---|---|
| Design System | [DESIGN.md](file:///c:/Users/philg/Pocketgull/pocketgull/DESIGN.md) | Complete |
| Security Policy | [SECURITY.md](file:///c:/Users/philg/Pocketgull/pocketgull/SECURITY.md) | Complete |
| Case Study | [docs/case_study.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/case_study.md) | Complete |
| Valuation and Positioning | [docs/valuation_and_positioning.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/valuation_and_positioning.md) | Complete |
| Eurostars Proposal Blueprint | [docs/eurostars_proposal_blueprint.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/eurostars_proposal_blueprint.md) | Complete |
| COCOMO II Typeface Valuation | [docs/COCOMO_II_TYPEFACE_VALUATION.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/COCOMO_II_TYPEFACE_VALUATION.md) | Complete |
| Accessibility (SIGCHI) | [docs/ACCESSIBILITY_SIGCHI.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/ACCESSIBILITY_SIGCHI.md) | Complete |
| Systems Architecture (SIGARCH) | [docs/SIGARCH_QUANTITATIVE_SYSTEMS_ARCHITECTURE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGARCH_QUANTITATIVE_SYSTEMS_ARCHITECTURE.md) | Complete |
| Clinical Knowledge Mining (SIGBIO/SIGKDD) | [docs/SIGBIO_SIGKDD_CLINICAL_KNOWLEDGE_MINING.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGBIO_SIGKDD_CLINICAL_KNOWLEDGE_MINING.md) | Complete (new) |
| WebGPU & Biophysical Shaders (SIGGRAPH) | [docs/SIGGRAPH_WEBGPU_BIOPHYSICAL_RENDERING.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGGRAPH_WEBGPU_BIOPHYSICAL_RENDERING.md) | Complete (new) |
| Audio Streaming & Biomarkers (SIGCOMM/SPS) | [docs/SIGCOMM_SPS_STREAMING_AUDIO_BIOMARKERS.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGCOMM_SPS_STREAMING_AUDIO_BIOMARKERS.md) | Complete (new) |
| Zero-Trust & Cryptographic Privacy (SIGSAC/SIGSEC) | [docs/SIGSAC_HIPAA_ZERO_TRUST_PRIVACY.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGSAC_HIPAA_ZERO_TRUST_PRIVACY.md) | Complete (new) |
| Formally Verified State Architecture (SIGSOFT/SIGPLAN) | [docs/SIGSOFT_SIGPLAN_REACTIVE_STATE_ARCHITECTURE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/SIGSOFT_SIGPLAN_REACTIVE_STATE_ARCHITECTURE.md) | Complete (new) |
| Energetics & Green Computing (IEEE PES) | [docs/IEEE_PES_POWER_ENERGY_SUSTAINABILITY.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/IEEE_PES_POWER_ENERGY_SUSTAINABILITY.md) | Complete (new) |
| Sustainability, Performance & TCO Audit | [docs/EVALUATION_SUSTAINABILITY_AND_PERFORMANCE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/EVALUATION_SUSTAINABILITY_AND_PERFORMANCE.md) | Complete (new) |
| Epistemic Falsification Architecture | [docs/EPISTEMIC_FALSIFICATION_SUITE.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/EPISTEMIC_FALSIFICATION_SUITE.md) | Complete (new) |
| Discovery Backlog | [QUESTIONS.md](file:///c:/Users/philg/Pocketgull/pocketgull/QUESTIONS.md) | Complete (new) |

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
| ~~Tutorial~~ | ~~First-user onboarding~~ | [tutorial-first-encounter.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/tutorial-first-encounter.md) | **DONE** |
| ~~Reference~~ | ~~Environment configuration~~ | [reference-env-vars.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/reference-env-vars.md) | **DONE** |
