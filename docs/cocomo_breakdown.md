# COCOMO II Granular File Breakdown
**Project Architecture & Development Effort Cost Analysis**

This report details the Constructive Cost Model II (COCOMO II) estimation at the individual source file level. Effort allocation (Person-Hours) is calculated proportionally based on the total codebase size and product complexity.

## 📊 Summary Metrics

| Metric | Estimated Value | Details / Assumptions |
|---|---|---|
| **Total Lines of Code (SLOC)** | **338,582** | Source lines of code excluding comments/blanks across all scanned modules. |
| **Total Size (KSLOC)** | **338.582** | Thousands of Source Lines of Code. |
| **Exponent B** | **1.0887** | Based on scale factors: Precedentedness, Flexibility, Risk Resolution, Team Cohesion, and Process Maturity. |
| **Effort Adjustment Factor (EAF)** | **0.4033** | Based on multipliers: Reliability, Complexity, Time constraints, Personnel experience. |
| **Estimated Effort (Person-Months)** | **673.01 PM** | The total developer months required under standard velocity. |
| **Estimated Effort (Person-Hours)** | **102,297 hrs** | Based on 152 working hours per person-month. |
| **Estimated Schedule (TDEV)** | **25.18 months** | Recommended calendar schedule for a standard team size. |
| **Optimal Team Size** | **26.7 FTE** | Derived from PM / TDEV. |
| **Solo Developer Equivalent** | **56.1 years** | Single-developer calendar time at standard velocity. |
| **Cost-to-Replicate (Blended $155/hr)** | **$15.86M** | At blended junior/mid/senior market rates. |

### SLOC Breakdown by Module (Aug 5, 2026)

| Module | Files | SLOC | Share |
|---|---|---|---|
| Angular `src/` (TypeScript) | 365 | 90,013 | 26.6% |
| Flutter / Dart (Mobile Suite) | 589 | 242,067 | 71.5% |
| Python FastAPI Sidecar | 26 | 3,479 | 1.0% |
| AVS Companion (TypeScript) | 13 | 3,023 | 0.9% |
| **Total** | **993** | **338,582** | **100%** |

---

## 📂 File-by-File Effort Distribution

The table below catalogs every analyzed TypeScript (`.ts`) source file, sorted descending by code size.

| File Path | Module | SLOC | Code Share | Effort (Hrs) | Complexity |
|---|---|---|---|---|---|
| [analysis-report.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.component.ts) | Web Client (Angular) | 3,521 | 4.43% | 935.5 hrs | High |
| [actuarial-longevity.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-longevity.service.ts) | Web Client (Angular) | 2,426 | 3.05% | 644.6 hrs | High |
| [app.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/app.component.ts) | Web Client (Angular) | 2,389 | 3.00% | 634.7 hrs | High |
| [export.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/export.service.ts) | Web Client (Angular) | 2,352 | 2.96% | 624.9 hrs | High |
| [body-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-3d-viewer.component.ts) | Web Client (Angular) | 2,000 | 2.52% | 531.4 hrs | High |
| [secure-splash.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/secure-splash.component.ts) | Web Client (Angular) | 1,918 | 2.41% | 509.6 hrs | High |
| [medical-summary.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-summary.component.ts) | Web Client (Angular) | 1,612 | 2.03% | 428.3 hrs | High |
| [intake-form.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/intake-form.component.ts) | Web Client (Angular) | 1,151 | 1.45% | 305.8 hrs | High |
| [server.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server.ts) | Web Client (Angular) | 1,123 | 1.41% | 298.4 hrs | High |
| [summary-node.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/summary-node.component.ts) | Web Client (Angular) | 1,052 | 1.32% | 279.5 hrs | High |
| [patient-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.service.ts) | Web Client (Angular) | 1,047 | 1.32% | 278.2 hrs | High |
| [avs-therapy.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.ts) | AVS Therapy Companion (Angular) | 1,019 | 1.28% | 270.7 hrs | High |
| [cost-benefit-analysis.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/cost-benefit-analysis.component.ts) | Web Client (Angular) | 1,000 | 1.26% | 265.7 hrs | High |
| [mood-consciousness-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/mood-consciousness-matrix.component.ts) | Web Client (Angular) | 981 | 1.23% | 260.6 hrs | High |
| [node-agent-dialog.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/node-agent-dialog.component.ts) | Web Client (Angular) | 922 | 1.16% | 245.0 hrs | High |
| [lens-insight-spark-shield.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lens-insight-spark-shield.component.ts) | Web Client (Angular) | 855 | 1.08% | 227.2 hrs | High |
| [chrono-weekly-meal-planner.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/chrono-weekly-meal-planner.component.ts) | Web Client (Angular) | 812 | 1.02% | 215.7 hrs | High |
| [clinical-intelligence.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts) | Web Client (Angular) | 799 | 1.00% | 212.3 hrs | High |
| [patient-management.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-management.service.ts) | Web Client (Angular) | 749 | 0.94% | 199.0 hrs | High |
| [shanty-karaoke-deck.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shanty-karaoke-deck.component.ts) | Web Client (Angular) | 724 | 0.91% | 192.4 hrs | High |
| [healthcare.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/healthcare.ts) | Web Client (Angular) | 703 | 0.88% | 186.8 hrs | High |
| [social-health-gravitation.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/social-health-gravitation.component.ts) | Web Client (Angular) | 687 | 0.86% | 182.5 hrs | High |
| [lyrica-concert.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lyrica-concert.component.ts) | Web Client (Angular) | 659 | 0.83% | 175.1 hrs | High |
| [research-frame.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/research-frame.component.ts) | Web Client (Angular) | 656 | 0.82% | 174.3 hrs | High |
| [voice-assistant.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/voice-assistant.component.ts) | Web Client (Angular) | 648 | 0.81% | 172.2 hrs | High |
| [data.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/data.ts) | Web Client (Angular) | 604 | 0.76% | 160.5 hrs | High |
| [sentinel-triage.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-triage.component.ts) | Web Client (Angular) | 551 | 0.69% | 146.4 hrs | High |
| [care-plan-print-preview.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/care-plan-print-preview.component.ts) | Web Client (Angular) | 550 | 0.69% | 146.1 hrs | High |
| [patient-fruit-tree.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-fruit-tree.component.ts) | Web Client (Angular) | 541 | 0.68% | 143.7 hrs | High |
| [medical-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-3d-viewer.component.ts) | Web Client (Angular) | 525 | 0.66% | 139.5 hrs | High |
| [rosetta-stone-anatomy.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/rosetta-stone-anatomy.component.ts) | Web Client (Angular) | 524 | 0.66% | 139.2 hrs | High |
| [healthy-hobbies-lifestyle.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/healthy-hobbies-lifestyle.component.ts) | Web Client (Angular) | 514 | 0.65% | 136.6 hrs | High |
| [walkthrough-tour.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/walkthrough-tour.component.ts) | Web Client (Angular) | 514 | 0.65% | 136.6 hrs | High |
| [actuarial-glee-audio.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-glee-audio.service.ts) | Web Client (Angular) | 492 | 0.62% | 130.7 hrs | High |
| [geolocational-health-relocation.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/geolocational-health-relocation.component.ts) | Web Client (Angular) | 484 | 0.61% | 128.6 hrs | High |
| [patient.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient.types.ts) | Web Client (Angular) | 470 | 0.59% | 124.9 hrs | High |
| [paradigm-clinical-dashboard.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/paradigm-clinical-dashboard.component.ts) | Web Client (Angular) | 464 | 0.58% | 123.3 hrs | High |
| [pantry-lazy-susan.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/pantry-lazy-susan.component.ts) | Web Client (Angular) | 449 | 0.56% | 119.3 hrs | High |
| [task-flow.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/task-flow.component.ts) | Web Client (Angular) | 421 | 0.53% | 111.9 hrs | High |
| [genkit.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/genkit.ts) | Web Client (Angular) | 416 | 0.52% | 110.5 hrs | High |
| [doctor-shift-simulator.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/doctor-shift-simulator.component.ts) | Web Client (Angular) | 412 | 0.52% | 109.5 hrs | High |
| [demo-data.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/demo-data.ts) | Web Client (Angular) | 412 | 0.52% | 109.5 hrs | High |
| [theme.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/theme.service.ts) | Web Client (Angular) | 410 | 0.52% | 108.9 hrs | High |
| [clinical-assessments-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-assessments-suite.component.ts) | Web Client (Angular) | 407 | 0.51% | 108.1 hrs | High |
| [gull-narrative-dispatch.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/gull-narrative-dispatch.component.ts) | Web Client (Angular) | 404 | 0.51% | 107.3 hrs | High |
| [fitbit.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/fitbit.ts) | Web Client (Angular) | 402 | 0.51% | 106.8 hrs | High |
| [analysis-container.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-container.component.ts) | Web Client (Angular) | 401 | 0.50% | 106.5 hrs | High |
| [adk-live.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.ts) | Web Client (Angular) | 392 | 0.49% | 104.1 hrs | High |
| [sentinel-telemetry-plotter.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-telemetry-plotter.component.ts) | Web Client (Angular) | 383 | 0.48% | 101.8 hrs | High |
| [instant-patient-action-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/instant-patient-action-suite.component.ts) | Web Client (Angular) | 382 | 0.48% | 101.5 hrs | High |
| [clinical-data-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-data-card.component.ts) | Web Client (Angular) | 381 | 0.48% | 101.2 hrs | Nominal |
| [clinical-menu.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-menu.component.ts) | Web Client (Angular) | 381 | 0.48% | 101.2 hrs | High |
| [aws.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/aws.ts) | Web Client (Angular) | 377 | 0.47% | 100.2 hrs | Nominal |
| [telemetry.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/telemetry.ts) | Web Client (Angular) | 373 | 0.47% | 99.1 hrs | Nominal |
| [patient-under-tree.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-under-tree.component.ts) | Web Client (Angular) | 366 | 0.46% | 97.2 hrs | High |
| [pet-auditory.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/pet-auditory.service.ts) | Web Client (Angular) | 363 | 0.46% | 96.4 hrs | Nominal |
| [medical-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-chart.component.ts) | Web Client (Angular) | 358 | 0.45% | 95.1 hrs | High |
| [patient.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient.types.ts) | AVS Therapy Companion (Angular) | 348 | 0.44% | 92.5 hrs | Nominal |
| [body-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-viewer.component.ts) | Web Client (Angular) | 342 | 0.43% | 90.9 hrs | High |
| [post-it-notes.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/post-it-notes.component.ts) | Web Client (Angular) | 341 | 0.43% | 90.6 hrs | High |
| [handoff-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/handoff-modal.component.ts) | Web Client (Angular) | 339 | 0.43% | 90.1 hrs | High |
| [medha-sakti-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/medha-sakti-matrix.component.ts) | Web Client (Angular) | 337 | 0.42% | 89.5 hrs | High |
| [lifestyle-adjunct.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/lifestyle-adjunct.service.ts) | Web Client (Angular) | 337 | 0.42% | 89.5 hrs | High |
| [import.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/import.service.ts) | Web Client (Angular) | 336 | 0.42% | 89.3 hrs | High |
| [biometric-history-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/biometric-history-chart.component.ts) | Web Client (Angular) | 333 | 0.42% | 88.5 hrs | High |
| [patient-health-trajectory-storybook.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-health-trajectory-storybook.component.ts) | Web Client (Angular) | 331 | 0.42% | 87.9 hrs | High |
| [p_mara_santos.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_mara_santos.ts) | Web Client (Angular) | 328 | 0.41% | 87.1 hrs | Nominal |
| [clinical-assessments.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/clinical-assessments.service.ts) | Web Client (Angular) | 319 | 0.40% | 84.8 hrs | High |
| [clinical-prompts.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-prompts.ts) | Web Client (Angular) | 318 | 0.40% | 84.5 hrs | Nominal |
| [biomarker-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/biomarker-matrix.component.ts) | Web Client (Angular) | 309 | 0.39% | 82.1 hrs | High |
| [androscoggin-foraging-phytoncide.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/androscoggin-foraging-phytoncide.component.ts) | Web Client (Angular) | 306 | 0.38% | 81.3 hrs | High |
| [clinical-context-avs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/clinical-context-avs.service.ts) | AVS Therapy Companion (Angular) | 305 | 0.38% | 81.0 hrs | High |
| [doc-consciousness.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/doc-consciousness.component.ts) | Web Client (Angular) | 299 | 0.38% | 79.4 hrs | High |
| [fhir-passport-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/fhir-passport-modal.component.ts) | Web Client (Angular) | 299 | 0.38% | 79.4 hrs | High |
| [vinyl-dj-store.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/vinyl-dj-store.component.ts) | Web Client (Angular) | 296 | 0.37% | 78.6 hrs | High |
| [family-tree-pedigree.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/family-tree-pedigree.component.ts) | Web Client (Angular) | 291 | 0.37% | 77.3 hrs | Nominal |
| [patient-dropdown.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-dropdown.component.ts) | Web Client (Angular) | 290 | 0.36% | 77.0 hrs | High |
| [dictation.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/dictation.service.ts) | Web Client (Angular) | 287 | 0.36% | 76.3 hrs | High |
| [python-bridge.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.ts) | Web Client (Angular) | 283 | 0.36% | 75.2 hrs | High |
| [functional-medicine-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/functional-medicine-matrix.component.ts) | Web Client (Angular) | 282 | 0.35% | 74.9 hrs | High |
| [holistic-sleep-toolkit.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/holistic-sleep-toolkit.component.ts) | Web Client (Angular) | 282 | 0.35% | 74.9 hrs | High |
| [pocket-gull-button.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-button.component.ts) | Web Client (Angular) | 281 | 0.35% | 74.7 hrs | High |
| [global-avs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/global-avs.service.ts) | AVS Therapy Companion (Angular) | 278 | 0.35% | 73.9 hrs | High |
| [chronobiology-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/chronobiology-matrix.component.ts) | Web Client (Angular) | 277 | 0.35% | 73.6 hrs | High |
| [cellular-automata-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/turing/cellular-automata-viewer.component.ts) | Web Client (Angular) | 275 | 0.35% | 73.1 hrs | High |
| [doc-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/doc-protocol.service.ts) | Web Client (Angular) | 263 | 0.33% | 69.9 hrs | Nominal |
| [lifestyle-adjunct.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/lifestyle-adjunct.service.ts) | AVS Therapy Companion (Angular) | 263 | 0.33% | 69.9 hrs | High |
| [patient-history-timeline.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-history-timeline.component.ts) | Web Client (Angular) | 261 | 0.33% | 69.3 hrs | High |
| [clinical-sleep-twin-dashboard.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-sleep-twin-dashboard.component.ts) | Web Client (Angular) | 260 | 0.33% | 69.1 hrs | Nominal |
| [laaf-fhir-haptic-schedule.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/laaf-fhir-haptic-schedule.service.ts) | Web Client (Angular) | 260 | 0.33% | 69.1 hrs | High |
| [chrono-clock-decision-rail.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/chrono-clock-decision-rail.component.ts) | Web Client (Angular) | 259 | 0.33% | 68.8 hrs | High |
| [vagal-biofeedback-dock.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/vagal-biofeedback-dock.component.ts) | Web Client (Angular) | 258 | 0.32% | 68.5 hrs | High |
| [uk-rio-pubmed-sourcing.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/uk-rio-pubmed-sourcing.component.ts) | Web Client (Angular) | 252 | 0.32% | 67.0 hrs | High |
| [floating-water-consciousness.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/floating-water-consciousness.component.ts) | Web Client (Angular) | 250 | 0.31% | 66.4 hrs | High |
| [patient-state.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.spec.ts) | Web Client (Angular) | 248 | 0.31% | 65.9 hrs | Nominal |
| [gemini.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/gemini.provider.ts) | Web Client (Angular) | 246 | 0.31% | 65.4 hrs | High |
| [storage.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/storage.service.ts) | Web Client (Angular) | 244 | 0.31% | 64.8 hrs | High |
| [food-safety-guardrail-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/food-safety-guardrail-card.component.ts) | Web Client (Angular) | 243 | 0.31% | 64.6 hrs | High |
| [rich-media.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/rich-media.service.ts) | Web Client (Angular) | 242 | 0.30% | 64.3 hrs | High |
| [zamecznik-canvas.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/zamecznik-canvas.component.ts) | Web Client (Angular) | 240 | 0.30% | 63.8 hrs | Nominal |
| [gamification.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/gamification.service.ts) | Web Client (Angular) | 239 | 0.30% | 63.5 hrs | Nominal |
| [dicom.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/dicom.service.ts) | Web Client (Angular) | 238 | 0.30% | 63.2 hrs | High |
| [ai-cache.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai-cache.service.ts) | Web Client (Angular) | 237 | 0.30% | 63.0 hrs | Nominal |
| [pocket-gull-input.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-input.component.ts) | Web Client (Angular) | 236 | 0.30% | 62.7 hrs | High |
| [ybocs-screener.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ybocs-screener.component.ts) | Web Client (Angular) | 233 | 0.29% | 61.9 hrs | High |
| [circadian-sleepiness.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/circadian-sleepiness.service.ts) | Web Client (Angular) | 232 | 0.29% | 61.6 hrs | High |
| [clinical-tool-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-tool-card.component.ts) | Web Client (Angular) | 231 | 0.29% | 61.4 hrs | High |
| [dicom-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dicom-viewer.component.ts) | Web Client (Angular) | 227 | 0.29% | 60.3 hrs | High |
| [vocal-biomarker-resonance.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/vocal-biomarker-resonance.component.ts) | Web Client (Angular) | 227 | 0.29% | 60.3 hrs | Nominal |
| [actuarial-glee-album.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/actuarial-glee-album.component.ts) | Web Client (Angular) | 225 | 0.28% | 59.8 hrs | High |
| [nano.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/nano.provider.ts) | Web Client (Angular) | 224 | 0.28% | 59.5 hrs | High |
| [emergency-supply-finder.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/emergency-supply-finder.component.ts) | Web Client (Angular) | 223 | 0.28% | 59.2 hrs | Nominal |
| [rules-engine.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/rules-engine.service.ts) | Web Client (Angular) | 223 | 0.28% | 59.2 hrs | Nominal |
| [fitbit.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fitbit.service.ts) | Web Client (Angular) | 222 | 0.28% | 59.0 hrs | High |
| [domain-suites-navigator.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/domain-suites-navigator.component.ts) | Web Client (Angular) | 221 | 0.28% | 58.7 hrs | High |
| [breath-guide.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/breath-guide.component.ts) | AVS Therapy Companion (Angular) | 221 | 0.28% | 58.7 hrs | High |
| [doctor-shift-sales-demo.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/doctor-shift-sales-demo.component.ts) | Web Client (Angular) | 220 | 0.28% | 58.5 hrs | Nominal |
| [clinical-gauge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-gauge.component.ts) | Web Client (Angular) | 216 | 0.27% | 57.4 hrs | Nominal |
| [sec1557-audit-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sec1557-audit-modal.component.ts) | Web Client (Angular) | 216 | 0.27% | 57.4 hrs | High |
| [p002.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p002.ts) | Web Client (Angular) | 215 | 0.27% | 57.1 hrs | Nominal |
| [dicom.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/dicom.ts) | Web Client (Angular) | 213 | 0.27% | 56.6 hrs | Nominal |
| [storm-analysis.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/storm-analysis.component.ts) | Web Client (Angular) | 208 | 0.26% | 55.3 hrs | High |
| [phantom-limb-mirror-therapy.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/phantom-limb-mirror-therapy.component.ts) | Web Client (Angular) | 207 | 0.26% | 55.0 hrs | High |
| [mychart-brief-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/mychart-brief-modal.component.ts) | Web Client (Angular) | 203 | 0.26% | 53.9 hrs | High |
| [spatial-scanner.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/spatial-scanner.component.ts) | Web Client (Angular) | 201 | 0.25% | 53.4 hrs | High |
| [hybrid.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/hybrid.provider.ts) | Web Client (Angular) | 199 | 0.25% | 52.9 hrs | High |
| [dietary-allergy-shield.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dietary-allergy-shield.component.ts) | Web Client (Angular) | 198 | 0.25% | 52.6 hrs | High |
| [glossary-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/glossary-modal.component.ts) | Web Client (Angular) | 194 | 0.24% | 51.5 hrs | Nominal |
| [sdoh-navigator.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sdoh-navigator.component.ts) | Web Client (Angular) | 194 | 0.24% | 51.5 hrs | High |
| [life-perils-paradigm-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/life-perils-paradigm-matrix.component.ts) | Web Client (Angular) | 193 | 0.24% | 51.3 hrs | High |
| [solfeggio-audio-deck.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/solfeggio-audio-deck.component.ts) | Web Client (Angular) | 192 | 0.24% | 51.0 hrs | High |
| [bystander-action-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/bystander-action-suite.component.ts) | Web Client (Angular) | 191 | 0.24% | 50.7 hrs | High |
| [kss-cognitive-shield.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/kss-cognitive-shield.component.ts) | Web Client (Angular) | 190 | 0.24% | 50.5 hrs | High |
| [occupational-hazard-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/occupational-hazard-card.component.ts) | Web Client (Angular) | 190 | 0.24% | 50.5 hrs | High |
| [patient-directory.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-directory.component.ts) | Web Client (Angular) | 190 | 0.24% | 50.5 hrs | High |
| [compassionate-analogy.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/compassionate-analogy.service.ts) | Web Client (Angular) | 189 | 0.24% | 50.2 hrs | Nominal |
| [p001.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p001.ts) | Web Client (Angular) | 188 | 0.24% | 49.9 hrs | Nominal |
| [clinical-intelligence.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.spec.ts) | Web Client (Angular) | 181 | 0.23% | 48.1 hrs | Nominal |
| [pubgemma.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/pubgemma.provider.ts) | Web Client (Angular) | 178 | 0.22% | 47.3 hrs | Nominal |
| [data.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/data.ts) | Web Client (Angular) | 178 | 0.22% | 47.3 hrs | Nominal |
| [avs-ui.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/avs-ui.service.ts) | AVS Therapy Companion (Angular) | 176 | 0.22% | 46.8 hrs | High |
| [emergency-nutritional-bypass.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/emergency-nutritional-bypass.component.ts) | Web Client (Angular) | 173 | 0.22% | 46.0 hrs | High |
| [collaboration-dock.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/collaboration-dock.component.ts) | Web Client (Angular) | 171 | 0.22% | 45.4 hrs | High |
| [firestore-sync.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/firestore-sync.service.ts) | Web Client (Angular) | 171 | 0.22% | 45.4 hrs | High |
| [acronym-expander.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/acronym-expander.service.ts) | Web Client (Angular) | 170 | 0.21% | 45.2 hrs | Nominal |
| [paradigm-arbitration-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/paradigm-arbitration-matrix.component.ts) | Web Client (Angular) | 166 | 0.21% | 44.1 hrs | Nominal |
| [patient-vitals-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-vitals-chart.component.ts) | Web Client (Angular) | 157 | 0.20% | 41.7 hrs | High |
| [petri-net-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/turing/petri-net-viewer.component.ts) | Web Client (Angular) | 157 | 0.20% | 41.7 hrs | Nominal |
| [index.d.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/lib/dataconnect/index.d.ts) | Web Client (Angular) | 157 | 0.20% | 41.7 hrs | Nominal |
| [fhir-r5-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r5-telemetry.service.ts) | Web Client (Angular) | 157 | 0.20% | 41.7 hrs | High |
| [dictation-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dictation-modal.component.ts) | Web Client (Angular) | 156 | 0.20% | 41.4 hrs | High |
| [agent-personas.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/agent-personas.ts) | Web Client (Angular) | 155 | 0.19% | 41.2 hrs | Nominal |
| [gull-squadron-showcase.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/gull-squadron-showcase.component.ts) | Web Client (Angular) | 153 | 0.19% | 40.6 hrs | Nominal |
| [walkthrough-tour.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/walkthrough-tour.service.ts) | Web Client (Angular) | 150 | 0.19% | 39.9 hrs | High |
| [theme-studio-drawer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/theme-studio-drawer.component.ts) | Web Client (Angular) | 149 | 0.19% | 39.6 hrs | High |
| [plain-language-glossary.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/plain-language-glossary.service.ts) | Web Client (Angular) | 149 | 0.19% | 39.6 hrs | Nominal |
| [actuarial-qaly-calculator.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/actuarial-qaly-calculator.component.ts) | Web Client (Angular) | 144 | 0.18% | 38.3 hrs | High |
| [arborist-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/arborist-3d-viewer.component.ts) | Web Client (Angular) | 144 | 0.18% | 38.3 hrs | High |
| [green-room-lounge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/green-room-lounge.component.ts) | Web Client (Angular) | 144 | 0.18% | 38.3 hrs | High |
| [mechanical-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/mechanical-3d-viewer.component.ts) | Web Client (Angular) | 144 | 0.18% | 38.3 hrs | High |
| [ybocs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/ybocs.service.ts) | Web Client (Angular) | 144 | 0.18% | 38.3 hrs | High |
| [medical-decoder.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/medical-decoder.service.ts) | Web Client (Angular) | 142 | 0.18% | 37.7 hrs | Nominal |
| [pocket-gull-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-card.component.ts) | Web Client (Angular) | 141 | 0.18% | 37.5 hrs | High |
| [athletic-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/athletic-protocol.service.ts) | Web Client (Angular) | 139 | 0.17% | 36.9 hrs | Nominal |
| [athletic-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/athletic-protocol.service.ts) | AVS Therapy Companion (Angular) | 139 | 0.17% | 36.9 hrs | Nominal |
| [mobile-menu-qr-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/mobile-menu-qr-modal.component.ts) | Web Client (Angular) | 137 | 0.17% | 36.4 hrs | High |
| [p_phil_gear.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_phil_gear.ts) | Web Client (Angular) | 134 | 0.17% | 35.6 hrs | Nominal |
| [paradigm-lyrics.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/paradigm-lyrics.service.ts) | Web Client (Angular) | 133 | 0.17% | 35.3 hrs | Nominal |
| [navier-stokes-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/turing/navier-stokes-viewer.component.ts) | Web Client (Angular) | 132 | 0.17% | 35.1 hrs | High |
| [patient-story-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-story-modal.component.ts) | Web Client (Angular) | 129 | 0.16% | 34.3 hrs | High |
| [companion-sync-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/companion-sync-modal.component.ts) | Web Client (Angular) | 125 | 0.16% | 33.2 hrs | High |
| [sheet-music-notation.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sheet-music-notation.component.ts) | Web Client (Angular) | 122 | 0.15% | 32.4 hrs | Nominal |
| [p_frida_kahlo.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_frida_kahlo.ts) | Web Client (Angular) | 122 | 0.15% | 32.4 hrs | Nominal |
| [verify-ai.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/verify-ai.service.ts) | Web Client (Angular) | 122 | 0.15% | 32.4 hrs | High |
| [dual-pane-consultation.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dual-pane-consultation.component.ts) | Web Client (Angular) | 121 | 0.15% | 32.1 hrs | High |
| [human-dignity-pact.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/human-dignity-pact.component.ts) | Web Client (Angular) | 120 | 0.15% | 31.9 hrs | High |
| [clinical-act-lens-mapper.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-act-lens-mapper.service.ts) | Web Client (Angular) | 114 | 0.14% | 30.3 hrs | Nominal |
| [fhir-callback.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/fhir-callback.component.ts) | Web Client (Angular) | 113 | 0.14% | 30.0 hrs | High |
| [webllm.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/webllm.provider.ts) | Web Client (Angular) | 112 | 0.14% | 29.8 hrs | High |
| [triage.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/triage.ts) | Backend API (Node) | 112 | 0.14% | 29.8 hrs | Nominal |
| [ambient-living-space-dashboard.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ambient-living-space-dashboard.component.ts) | Web Client (Angular) | 110 | 0.14% | 29.2 hrs | High |
| [consent-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/consent-modal.component.ts) | Web Client (Angular) | 110 | 0.14% | 29.2 hrs | High |
| [python-bridge.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.spec.ts) | Web Client (Angular) | 108 | 0.14% | 28.7 hrs | Nominal |
| [gcp-healthcare.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/gcp-healthcare.service.ts) | Web Client (Angular) | 107 | 0.13% | 28.4 hrs | High |
| [p_edwin_smith_3.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_edwin_smith_3.ts) | Web Client (Angular) | 106 | 0.13% | 28.2 hrs | Nominal |
| [veo.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/veo.service.ts) | Web Client (Angular) | 105 | 0.13% | 27.9 hrs | Nominal |
| [p003.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p003.ts) | Web Client (Angular) | 104 | 0.13% | 27.6 hrs | Nominal |
| [orcid.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/orcid.service.ts) | Web Client (Angular) | 104 | 0.13% | 27.6 hrs | High |
| [p004.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p004.ts) | Web Client (Angular) | 103 | 0.13% | 27.4 hrs | Nominal |
| [p005.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p005.ts) | Web Client (Angular) | 103 | 0.13% | 27.4 hrs | Nominal |
| [p008.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p008.ts) | Web Client (Angular) | 102 | 0.13% | 27.1 hrs | Nominal |
| [environmental-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/environmental-telemetry.service.ts) | Web Client (Angular) | 102 | 0.13% | 27.1 hrs | Nominal |
| [typology-badge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/typology-badge.component.ts) | Web Client (Angular) | 101 | 0.13% | 26.8 hrs | Nominal |
| [p007.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p007.ts) | Web Client (Angular) | 101 | 0.13% | 26.8 hrs | Nominal |
| [p_charles_darwin.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_charles_darwin.ts) | Web Client (Angular) | 101 | 0.13% | 26.8 hrs | Nominal |
| [p_marie_curie.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_marie_curie.ts) | Web Client (Angular) | 101 | 0.13% | 26.8 hrs | Nominal |
| [biometric-import.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/biometric-import.service.ts) | Web Client (Angular) | 101 | 0.13% | 26.8 hrs | High |
| [hall-chronotherapy-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/nobel/hall-chronotherapy-matrix.component.ts) | Web Client (Angular) | 100 | 0.13% | 26.6 hrs | Nominal |
| [paabo-paleo-genomic.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/nobel/paabo-paleo-genomic.component.ts) | Web Client (Angular) | 100 | 0.13% | 26.6 hrs | Nominal |
| [lidar-scan-upload-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lidar-scan-upload-modal.component.ts) | Web Client (Angular) | 99 | 0.12% | 26.3 hrs | High |
| [p006.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p006.ts) | Web Client (Angular) | 99 | 0.12% | 26.3 hrs | Low |
| [clinical-trend.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trend.component.ts) | Web Client (Angular) | 98 | 0.12% | 26.0 hrs | Nominal |
| [research-lectures.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/research-lectures.service.ts) | Web Client (Angular) | 97 | 0.12% | 25.8 hrs | Nominal |
| [visit-review.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/visit-review.component.ts) | Web Client (Angular) | 96 | 0.12% | 25.5 hrs | High |
| [orcid.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/orcid.ts) | Backend API (Node) | 96 | 0.12% | 25.5 hrs | Low |
| [hardware-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/hardware-telemetry.service.ts) | Web Client (Angular) | 94 | 0.12% | 25.0 hrs | High |
| [collaboration.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/collaboration.service.ts) | Web Client (Angular) | 93 | 0.12% | 24.7 hrs | High |
| [patient-scans.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-scans.component.ts) | Web Client (Angular) | 90 | 0.11% | 23.9 hrs | High |
| [fhir-integration.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-integration.service.ts) | Web Client (Angular) | 89 | 0.11% | 23.6 hrs | Nominal |
| [piezo-mechanoreceptor-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lasker/piezo-mechanoreceptor-matrix.component.ts) | Web Client (Angular) | 88 | 0.11% | 23.4 hrs | Nominal |
| [ohsumi-autophagy-chronometer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/nobel/ohsumi-autophagy-chronometer.component.ts) | Web Client (Angular) | 88 | 0.11% | 23.4 hrs | Nominal |
| [ble-wearables.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ble-wearables.service.ts) | Web Client (Angular) | 85 | 0.11% | 22.6 hrs | High |
| [healthcare-intelligence.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/healthcare-intelligence.service.ts) | Web Client (Angular) | 85 | 0.11% | 22.6 hrs | Nominal |
| [scfa-microbiome-vagal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/aaas/scfa-microbiome-vagal.component.ts) | Web Client (Angular) | 82 | 0.10% | 21.8 hrs | Nominal |
| [p_srinivasa_ramanujan.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_srinivasa_ramanujan.ts) | Web Client (Angular) | 82 | 0.10% | 21.8 hrs | Low |
| [pocket-gull-badge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-badge.component.ts) | Web Client (Angular) | 79 | 0.10% | 21.0 hrs | Nominal |
| [master-paradigm-synthesizer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/master-paradigm-synthesizer.component.ts) | Web Client (Angular) | 79 | 0.10% | 21.0 hrs | High |
| [metric-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/metric-card.component.ts) | Web Client (Angular) | 78 | 0.10% | 20.7 hrs | Nominal |
| [tcm-meridian-stasis-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/eastern/tcm-meridian-stasis-matrix.component.ts) | Web Client (Angular) | 77 | 0.10% | 20.5 hrs | Nominal |
| [procedural-investment-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/procedural-investment-matrix.component.ts) | Web Client (Angular) | 76 | 0.10% | 20.2 hrs | High |
| [ambient-lighting.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ambient-lighting.service.ts) | Web Client (Angular) | 76 | 0.10% | 20.2 hrs | High |
| [dhatu-tissue-chakra-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/dhatu-tissue-chakra-matrix.component.ts) | Web Client (Angular) | 74 | 0.09% | 19.7 hrs | Nominal |
| [intelligence.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/intelligence.ts) | Backend API (Node) | 69 | 0.09% | 18.3 hrs | Nominal |
| [glp1-incretin-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/aaas/glp1-incretin-matrix.component.ts) | Web Client (Angular) | 68 | 0.09% | 18.1 hrs | Nominal |
| [mrna-lipid-nanoparticle-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lasker/mrna-lipid-nanoparticle-matrix.component.ts) | Web Client (Angular) | 68 | 0.09% | 18.1 hrs | Nominal |
| [world-health.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/world-health.ts) | Web Client (Angular) | 67 | 0.08% | 17.8 hrs | Low |
| [research-tab.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/research-tab.component.ts) | Web Client (Angular) | 66 | 0.08% | 17.5 hrs | Nominal |
| [body-3d-viewer.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-3d-viewer.component.spec.ts) | Web Client (Angular) | 65 | 0.08% | 17.3 hrs | Nominal |
| [clinical-trajectory-biography.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trajectory-biography.component.ts) | Web Client (Angular) | 65 | 0.08% | 17.3 hrs | High |
| [clinical-storytelling.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-storytelling.service.ts) | Web Client (Angular) | 65 | 0.08% | 17.3 hrs | High |
| [procedural-health-investment.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/procedural-health-investment.service.ts) | Web Client (Angular) | 62 | 0.08% | 16.5 hrs | High |
| [vata-pitta-kapha-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/vata-pitta-kapha-matrix.component.ts) | Web Client (Angular) | 61 | 0.08% | 16.2 hrs | Nominal |
| [network-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/network-state.service.ts) | Web Client (Angular) | 59 | 0.07% | 15.7 hrs | High |
| [medha-sakti-matrix.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/medha-sakti-matrix.component.spec.ts) | Web Client (Angular) | 58 | 0.07% | 15.4 hrs | Nominal |
| [cross-border-health-wallet.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/cross-border-health-wallet.service.ts) | Web Client (Angular) | 58 | 0.07% | 15.4 hrs | High |
| [fhir-r5-telemetry.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r5-telemetry.service.spec.ts) | Web Client (Angular) | 57 | 0.07% | 15.1 hrs | Nominal |
| [session-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/session-state.service.ts) | Web Client (Angular) | 57 | 0.07% | 15.1 hrs | High |
| [consent.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/consent.service.ts) | Web Client (Angular) | 56 | 0.07% | 14.9 hrs | High |
| [dictation.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/dictation.service.spec.ts) | Web Client (Angular) | 55 | 0.07% | 14.6 hrs | Nominal |
| [patient-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient-state.service.ts) | AVS Therapy Companion (Angular) | 54 | 0.07% | 14.3 hrs | Nominal |
| [analysis-report.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.types.ts) | Web Client (Angular) | 52 | 0.07% | 13.8 hrs | Low |
| [clinical-tool-card.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-tool-card.component.spec.ts) | Web Client (Angular) | 52 | 0.07% | 13.8 hrs | Low |
| [biomedical-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/biomedical-suite.component.ts) | Web Client (Angular) | 52 | 0.07% | 13.8 hrs | High |
| [export.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/export.service.spec.ts) | Web Client (Angular) | 52 | 0.07% | 13.8 hrs | Nominal |
| [ayurvedic-systems-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/ayurvedic-systems-suite.component.ts) | Web Client (Angular) | 51 | 0.06% | 13.5 hrs | Nominal |
| [pulse-tongue-pattern-diagnosis.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/eastern/pulse-tongue-pattern-diagnosis.component.ts) | Web Client (Angular) | 51 | 0.06% | 13.5 hrs | Nominal |
| [food-safety-guardrail-card.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/food-safety-guardrail-card.component.spec.ts) | Web Client (Angular) | 51 | 0.06% | 13.5 hrs | Nominal |
| [turing-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/turing/turing-suite.component.ts) | Web Client (Angular) | 51 | 0.06% | 13.5 hrs | Nominal |
| [nobel-laureates-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/nobel/nobel-laureates-suite.component.ts) | Web Client (Angular) | 50 | 0.06% | 13.3 hrs | Nominal |
| [recovery-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/recovery-suite.component.ts) | Web Client (Angular) | 50 | 0.06% | 13.3 hrs | High |
| [aiga-model-augmentation.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/aiga-model-augmentation.service.ts) | Web Client (Angular) | 50 | 0.06% | 13.3 hrs | High |
| [reveal.directive.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/directives/reveal.directive.ts) | Web Client (Angular) | 47 | 0.06% | 12.5 hrs | Low |
| [types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/types.ts) | Web Client (Angular) | 46 | 0.06% | 12.2 hrs | Low |
| [aaas-breakthroughs-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/aaas/aaas-breakthroughs-suite.component.ts) | Web Client (Angular) | 45 | 0.06% | 12.0 hrs | Nominal |
| [eastern-tcm-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/eastern/eastern-tcm-suite.component.ts) | Web Client (Angular) | 45 | 0.06% | 12.0 hrs | Nominal |
| [lasker-breakthrough-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/lasker/lasker-breakthrough-suite.component.ts) | Web Client (Angular) | 45 | 0.06% | 12.0 hrs | Nominal |
| [theme-studio-drawer.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/theme-studio-drawer.component.spec.ts) | Web Client (Angular) | 45 | 0.06% | 12.0 hrs | Nominal |
| [origami-papercraft-decorations.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/origami-papercraft-decorations.component.ts) | Web Client (Angular) | 43 | 0.05% | 11.4 hrs | Nominal |
| [nutrition-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/nutrition-suite.component.ts) | Web Client (Angular) | 42 | 0.05% | 11.2 hrs | High |
| [therapeutics-suite.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/suites/therapeutics-suite.component.ts) | Web Client (Angular) | 42 | 0.05% | 11.2 hrs | High |
| [serene-intake.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/serene-intake.component.ts) | Web Client (Angular) | 42 | 0.05% | 11.2 hrs | Nominal |
| [image-optimization.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.spec.ts) | Web Client (Angular) | 42 | 0.05% | 11.2 hrs | Nominal |
| [knowledge-synthesis.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/knowledge-synthesis.service.ts) | Web Client (Angular) | 41 | 0.05% | 10.9 hrs | High |
| [occupational-hazard-card.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/occupational-hazard-card.component.spec.ts) | Web Client (Angular) | 40 | 0.05% | 10.6 hrs | Nominal |
| [main.server.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/main.server.ts) | Web Client (Angular) | 40 | 0.05% | 10.6 hrs | Low |
| [types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/types.ts) | Web Client (Angular) | 35 | 0.04% | 9.3 hrs | Low |
| [osha-workplace-safety.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/osha-workplace-safety.service.ts) | Web Client (Angular) | 34 | 0.04% | 9.0 hrs | High |
| [pubmed.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/pubmed.ts) | Backend API (Node) | 34 | 0.04% | 9.0 hrs | Low |
| [mock-patients.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients.ts) | Web Client (Angular) | 33 | 0.04% | 8.8 hrs | Low |
| [image-optimization.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.ts) | Web Client (Angular) | 33 | 0.04% | 8.8 hrs | Nominal |
| [auth.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/auth.service.ts) | Web Client (Angular) | 32 | 0.04% | 8.5 hrs | Nominal |
| [stress-intervention.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/stress-intervention.service.ts) | Web Client (Angular) | 32 | 0.04% | 8.5 hrs | High |
| [insight-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-card.component.ts) | Web Client (Angular) | 31 | 0.04% | 8.2 hrs | Nominal |
| [safe-html-new.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/safe-html-new.pipe.ts) | Web Client (Angular) | 31 | 0.04% | 8.2 hrs | High |
| [adk-live.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.spec.ts) | Web Client (Angular) | 31 | 0.04% | 8.2 hrs | Nominal |
| [notification.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/services/notification.ts) | Backend API (Node) | 31 | 0.04% | 8.2 hrs | Nominal |
| [intelligence.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.ts) | Web Client (Angular) | 26 | 0.03% | 6.9 hrs | Low |
| [audit.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/audit.service.ts) | Web Client (Angular) | 26 | 0.03% | 6.9 hrs | High |
| [clinical-gauge.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-gauge.component.spec.ts) | Web Client (Angular) | 25 | 0.03% | 6.6 hrs | Low |
| [index.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/index.ts) | Backend API (Node) | 25 | 0.03% | 6.6 hrs | Low |
| [app.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.spec.ts) | AVS Therapy Companion (Angular) | 25 | 0.03% | 6.6 hrs | Low |
| [research-lectures.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/research-lectures.service.spec.ts) | Web Client (Angular) | 22 | 0.03% | 5.8 hrs | Nominal |
| [secure-key.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/secure-key.ts) | Web Client (Angular) | 22 | 0.03% | 5.8 hrs | Low |
| [test_gem.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/test_gem.ts) | Web Client (Angular) | 21 | 0.03% | 5.6 hrs | Low |
| [patients.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/patients.ts) | Backend API (Node) | 21 | 0.03% | 5.6 hrs | Low |
| [radiology.agent.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/agents/radiology.agent.ts) | Web Client (Angular) | 19 | 0.02% | 5.0 hrs | Low |
| [clinical-icons.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/assets/clinical-icons.ts) | Web Client (Angular) | 18 | 0.02% | 4.8 hrs | Low |
| [ble-wearables.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ble-wearables.service.spec.ts) | Web Client (Angular) | 18 | 0.02% | 4.8 hrs | Nominal |
| [insight-grid.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-grid.component.ts) | Web Client (Angular) | 16 | 0.02% | 4.3 hrs | Nominal |
| [ai-provider.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai-provider.types.ts) | Web Client (Angular) | 16 | 0.02% | 4.3 hrs | Low |
| [markdown.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/markdown.service.ts) | Web Client (Angular) | 16 | 0.02% | 4.3 hrs | Nominal |
| [acronym-expander.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/acronym-expander.pipe.ts) | Web Client (Angular) | 14 | 0.02% | 3.7 hrs | High |
| [firebase.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/lib/firebase.ts) | Web Client (Angular) | 13 | 0.02% | 3.5 hrs | Low |
| [medical-decoder.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/medical-decoder.pipe.ts) | Web Client (Angular) | 13 | 0.02% | 3.5 hrs | High |
| [environment.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/environments/environment.ts) | Web Client (Angular) | 12 | 0.02% | 3.2 hrs | Low |
| [globals.d.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/globals.d.ts) | Web Client (Angular) | 12 | 0.02% | 3.2 hrs | Low |
| [safe-html.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/safe-html.pipe.ts) | Web Client (Angular) | 12 | 0.02% | 3.2 hrs | Low |
| [app.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.ts) | AVS Therapy Companion (Angular) | 12 | 0.02% | 3.2 hrs | Nominal |
| [python-bridge.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/python-bridge.service.ts) | AVS Therapy Companion (Angular) | 12 | 0.02% | 3.2 hrs | Nominal |
| [image-sizes.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/constants/image-sizes.ts) | Web Client (Angular) | 8 | 0.01% | 2.1 hrs | Low |
| [webllm.worker.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/workers/webllm.worker.ts) | Web Client (Angular) | 8 | 0.01% | 2.1 hrs | Low |
| [empty.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mocks/empty.ts) | Web Client (Angular) | 7 | 0.01% | 1.9 hrs | Low |
| [main.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/main.ts) | AVS Therapy Companion (Angular) | 5 | 0.01% | 1.3 hrs | Low |
| [app.config.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.config.ts) | AVS Therapy Companion (Angular) | 4 | 0.01% | 1.1 hrs | Low |
| [intelligence.provider.token.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.token.ts) | Web Client (Angular) | 3 | 0.00% | 0.8 hrs | Low |

---

*Report generated automatically by `scripts/estimate-effort-detailed.js`. All metrics adhere to the COCOMO II Post-Architecture Model.*
