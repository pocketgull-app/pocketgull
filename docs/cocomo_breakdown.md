# COCOMO II Granular File Breakdown
**Project Architecture & Development Effort Cost Analysis**

This report details the Constructive Cost Model II (COCOMO II) estimation at the individual source file level. Effort allocation (Person-Hours) is calculated proportionally based on the total codebase size and product complexity.

## 📊 Summary Metrics

| Metric | Estimated Value | Details / Assumptions |
|---|---|---|
| **Total Lines of Code (SLOC)** | **264,249** | Source lines of code excluding comments/blanks across all scanned modules. |
| **Total Size (KSLOC)** | **264.249** | Thousands of Source Lines of Code. |
| **Exponent B** | **0.9990** | Based on scale factors: Precedentedness, Flexibility, Risk Resolution, Team Cohesion, and Process Maturity. |
| **Effort Adjustment Factor (EAF)** | **0.9884** | Based on multipliers: Reliability, Complexity, Time constraints, Personnel experience. |
| **Estimated Effort (Person-Months)** | **763.64 PM** | The total developer months required under standard velocity. |
| **Estimated Effort (Person-Hours)** | **116,074 hrs** | Based on 152 working hours per person-month. |
| **Estimated Schedule (TDEV)** | **24.98 months** | Recommended calendar schedule for a standard team size. |

---

## 📂 File-by-File Effort Distribution

The table below catalogs every analyzed TypeScript (`.ts`) source file, sorted descending by code size.

| File Path | Module | SLOC | Code Share | Effort (Hrs) | Complexity |
|---|---|---|---|---|---|
| [analysis-report.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.component.ts) | Web Client (Angular & SSR) | 3,532 | 1.34% | 1551.5 hrs | High |
| [styles.css](file:///C:/Users/philg/Pocketgull/pocketgull/src/styles.css) | Web Client (Angular & SSR) | 3,280 | 1.24% | 1440.8 hrs | High |
| [secure-splash.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/secure-splash.component.ts) | Web Client (Angular & SSR) | 2,843 | 1.08% | 1248.8 hrs | High |
| [export.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export.service.ts) | Web Client (Angular & SSR) | 2,760 | 1.04% | 1212.4 hrs | High |
| [body-3d-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/body-3d-viewer.component.ts) | Web Client (Angular & SSR) | 2,746 | 1.04% | 1206.2 hrs | High |
| [actuarial-longevity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-longevity.service.ts) | Web Client (Angular & SSR) | 2,470 | 0.93% | 1085.0 hrs | High |
| [app.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/app.component.ts) | Web Client (Angular & SSR) | 2,161 | 0.82% | 949.2 hrs | High |
| [main.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/main.py) | Python FastAPI Sidecar & ML Engines | 1,720 | 0.65% | 755.5 hrs | High |
| [webmcp-registration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webmcp-registration.service.ts) | Web Client (Angular & SSR) | 1,635 | 0.62% | 718.2 hrs | High |
| [medical-summary.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/medical-summary.component.ts) | Web Client (Angular & SSR) | 1,633 | 0.62% | 717.3 hrs | High |
| [patient_types.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/patient_types.dart) | Flutter Mobile Companion (Dart) | 1,490 | 0.56% | 654.5 hrs | High |
| [summary-node.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/summary-node.component.ts) | Web Client (Angular & SSR) | 1,415 | 0.54% | 621.6 hrs | High |
| [wordpress-articles.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/wordpress-articles.service.ts) | Web Client (Angular & SSR) | 1,403 | 0.53% | 616.3 hrs | High |
| [business-site.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/business-site.ts) | Web Client (Angular & SSR) | 1,370 | 0.52% | 601.8 hrs | High |
| [patient-state.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.service.ts) | Web Client (Angular & SSR) | 1,337 | 0.51% | 587.3 hrs | High |
| [intake-form.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/intake-form.component.ts) | Web Client (Angular & SSR) | 1,231 | 0.47% | 540.7 hrs | High |
| [cost-benefit-analysis.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/cost-benefit-analysis.component.ts) | Web Client (Angular & SSR) | 1,153 | 0.44% | 506.5 hrs | High |
| [discovery.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/discovery.routes.ts) | Web Client (Angular & SSR) | 1,115 | 0.42% | 489.8 hrs | High |
| [server.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server.ts) | Web Client (Angular & SSR) | 1,049 | 0.40% | 460.8 hrs | High |
| [finetune_gemma_lora.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/finetune_gemma_lora.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 1,027 | 0.39% | 451.1 hrs | High |
| [body-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/body-viewer.component.ts) | Web Client (Angular & SSR) | 995 | 0.38% | 437.1 hrs | High |
| [mood-consciousness-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/mood-consciousness-matrix.component.ts) | Web Client (Angular & SSR) | 976 | 0.37% | 428.7 hrs | High |
| [clinical-intelligence.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts) | Web Client (Angular & SSR) | 971 | 0.37% | 426.5 hrs | High |
| [typographic-3d-body.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/typographic-3d-body.component.ts) | Web Client (Angular & SSR) | 940 | 0.36% | 412.9 hrs | High |
| [node-agent-dialog.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/node-agent-dialog.component.ts) | Web Client (Angular & SSR) | 927 | 0.35% | 407.2 hrs | High |
| [research-frame.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-frame.component.ts) | Web Client (Angular & SSR) | 923 | 0.35% | 405.4 hrs | High |
| [avs-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/avs-engine.service.ts) | Web Client (Angular & SSR) | 912 | 0.35% | 400.6 hrs | High |
| [lens-insight-spark-shield.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lens-insight-spark-shield.component.ts) | Web Client (Angular & SSR) | 855 | 0.32% | 375.6 hrs | High |
| [chrono-weekly-meal-planner.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/chrono-weekly-meal-planner.component.ts) | Web Client (Angular & SSR) | 818 | 0.31% | 359.3 hrs | High |
| [actuarial-glee-audio.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/actuarial-glee-audio.service.ts) | Web Client (Angular & SSR) | 815 | 0.31% | 358.0 hrs | High |
| [skeptical-epistemology.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/skeptical-epistemology.service.ts) | Web Client (Angular & SSR) | 801 | 0.30% | 351.8 hrs | High |
| [emt-handoff-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/emt-handoff-lens-tab.component.ts) | Web Client (Angular & SSR) | 783 | 0.30% | 343.9 hrs | High |
| [patient-management.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/patient-management.service.ts) | Web Client (Angular & SSR) | 776 | 0.29% | 340.9 hrs | High |
| [sentinel_triage_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/sentinel_triage_widget.dart) | Flutter Mobile Companion (Dart) | 736 | 0.28% | 323.3 hrs | High |
| [multilingual-specimen.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/multilingual-specimen.component.ts) | Web Client (Angular & SSR) | 733 | 0.28% | 322.0 hrs | High |
| [local-gemma-studio.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/local-gemma-studio.component.ts) | Web Client (Angular & SSR) | 729 | 0.28% | 320.2 hrs | High |
| [healthcare.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/healthcare.ts) | Web Client (Angular & SSR) | 726 | 0.27% | 318.9 hrs | High |
| [family-health-quest.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/family/family-health-quest.component.ts) | Web Client (Angular & SSR) | 712 | 0.27% | 312.8 hrs | High |
| [historical-luminaries-game.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/historical-luminaries-game.service.ts) | Web Client (Angular & SSR) | 704 | 0.27% | 309.2 hrs | High |
| [petri-net-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/turing/petri-net-viewer.component.ts) | Web Client (Angular & SSR) | 692 | 0.26% | 304.0 hrs | High |
| [social-health-gravitation.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/social-health-gravitation.component.ts) | Web Client (Angular & SSR) | 687 | 0.26% | 301.8 hrs | High |
| [fhir-r4-bundle-export.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r4-bundle-export.service.ts) | Web Client (Angular & SSR) | 681 | 0.26% | 299.1 hrs | High |
| [monroe-persian-trance.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/monroe-persian-trance.service.ts) | Web Client (Angular & SSR) | 678 | 0.26% | 297.8 hrs | High |
| [gull.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gull.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 677 | 0.26% | 297.4 hrs | High |
| [clinical-tool-workbench.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-tool-workbench.component.ts) | Web Client (Angular & SSR) | 666 | 0.25% | 292.5 hrs | High |
| [awcim-integrative-prescriber.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/awcim-integrative-prescriber.component.ts) | Web Client (Angular & SSR) | 644 | 0.24% | 282.9 hrs | High |
| [talent-hr-portal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/talent-hr-portal.component.ts) | Web Client (Angular & SSR) | 639 | 0.24% | 280.7 hrs | High |
| [export_fine_tuning_dataset.ts](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/export_fine_tuning_dataset.ts) | Clinical Tooling, Data Pipelines & Dart Scripts | 626 | 0.24% | 275.0 hrs | High |
| [hobby-domain-companion.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hobby-domain-companion.service.ts) | Web Client (Angular & SSR) | 624 | 0.24% | 274.1 hrs | High |
| [care-plan-print-preview.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/care-plan-print-preview.component.ts) | Web Client (Angular & SSR) | 614 | 0.23% | 269.7 hrs | High |
| [voice-assistant.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/voice-assistant.component.ts) | Web Client (Angular & SSR) | 614 | 0.23% | 269.7 hrs | High |
| [quad-philosophy-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/quad-philosophy-matrix.component.ts) | Web Client (Angular & SSR) | 604 | 0.23% | 265.3 hrs | High |
| [data.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/data.ts) | Web Client (Angular & SSR) | 604 | 0.23% | 265.3 hrs | High |
| [holographic-3d-anatomy.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/holographic-3d-anatomy.component.ts) | Web Client (Angular & SSR) | 589 | 0.22% | 258.7 hrs | High |
| [typographic-anatomy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/typographic-anatomy.service.ts) | Web Client (Angular & SSR) | 586 | 0.22% | 257.4 hrs | High |
| [vertex-model-garden-portal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vertex-model-garden-portal.component.ts) | Web Client (Angular & SSR) | 585 | 0.22% | 257.0 hrs | High |
| [lens-rsna-knee.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lens-rsna-knee.component.ts) | Web Client (Angular & SSR) | 582 | 0.22% | 255.6 hrs | High |
| [update_training_notebook.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/update_training_notebook.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 580 | 0.22% | 254.8 hrs | High |
| [intake_form_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/intake_form_widget.dart) | Flutter Mobile Companion (Dart) | 579 | 0.22% | 254.3 hrs | High |
| [role-pathway-docs.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/role-pathway-docs.service.ts) | Web Client (Angular & SSR) | 577 | 0.22% | 253.5 hrs | High |
| [patient.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/patient.types.ts) | Web Client (Angular & SSR) | 564 | 0.21% | 247.7 hrs | High |
| [sentinel-triage.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-triage.component.ts) | Web Client (Angular & SSR) | 559 | 0.21% | 245.5 hrs | High |
| [ai.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/ai.routes.ts) | Web Client (Angular & SSR) | 556 | 0.21% | 244.2 hrs | High |
| [webmcp-registration.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webmcp-registration.service.spec.ts) | Web Client (Angular & SSR) | 548 | 0.21% | 240.7 hrs | High |
| [medical-chart.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/medical-chart.component.ts) | Web Client (Angular & SSR) | 547 | 0.21% | 240.3 hrs | High |
| [init-globals.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/init-globals.ts) | Automated Test Suites (Playwright & Vitest) | 545 | 0.21% | 239.4 hrs | High |
| [main-header-nav.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/main-header-nav.component.ts) | Web Client (Angular & SSR) | 538 | 0.20% | 236.3 hrs | High |
| [adk-live.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.ts) | Web Client (Angular & SSR) | 533 | 0.20% | 234.1 hrs | High |
| [walkthrough-tour.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/walkthrough-tour.component.ts) | Web Client (Angular & SSR) | 532 | 0.20% | 233.7 hrs | High |
| [medical-3d-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/medical-3d-viewer.component.ts) | Web Client (Angular & SSR) | 525 | 0.20% | 230.6 hrs | High |
| [rosetta-stone-anatomy.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/rosetta-stone-anatomy.component.ts) | Web Client (Angular & SSR) | 524 | 0.20% | 230.2 hrs | High |
| [cern-lhc-3d-visualizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/cern-lhc-3d-visualizer.component.ts) | Web Client (Angular & SSR) | 519 | 0.20% | 228.0 hrs | High |
| [immuno-oncology-tme-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/immuno-oncology-tme-viewer.component.ts) | Web Client (Angular & SSR) | 517 | 0.20% | 227.1 hrs | High |
| [healthy-hobbies-lifestyle.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/healthy-hobbies-lifestyle.component.ts) | Web Client (Angular & SSR) | 514 | 0.19% | 225.8 hrs | High |
| [pocketgull-sans-bench.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-sans-bench.component.ts) | Web Client (Angular & SSR) | 513 | 0.19% | 225.3 hrs | High |
| [splash_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/splash_screen.dart) | Flutter Mobile Companion (Dart) | 499 | 0.19% | 219.2 hrs | High |
| [task_flow_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/task_flow_widget.dart) | Flutter Mobile Companion (Dart) | 488 | 0.18% | 214.4 hrs | High |
| [geolocational-health-relocation.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/geolocational-health-relocation.component.ts) | Web Client (Angular & SSR) | 484 | 0.18% | 212.6 hrs | High |
| [cellular-biophysics-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/cellular-biophysics-viewer.component.ts) | Web Client (Angular & SSR) | 479 | 0.18% | 210.4 hrs | High |
| [dicom-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/dicom-viewer.component.ts) | Web Client (Angular & SSR) | 477 | 0.18% | 209.5 hrs | High |
| [articles-reader.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/articles-reader.component.ts) | Web Client (Angular & SSR) | 474 | 0.18% | 208.2 hrs | High |
| [genkit.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/genkit.ts) | Web Client (Angular & SSR) | 474 | 0.18% | 208.2 hrs | High |
| [ambient-flow-soundscape.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-flow-soundscape.service.ts) | Web Client (Angular & SSR) | 472 | 0.18% | 207.3 hrs | High |
| [visual-acuity-exam.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/visual-acuity-exam.component.ts) | Web Client (Angular & SSR) | 463 | 0.18% | 203.4 hrs | High |
| [paradigm-clinical-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/paradigm-clinical-dashboard.component.ts) | Web Client (Angular & SSR) | 462 | 0.17% | 202.9 hrs | High |
| [task-flow.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/task-flow.component.ts) | Web Client (Angular & SSR) | 459 | 0.17% | 201.6 hrs | High |
| [prepare_usability10_dataset.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/prepare_usability10_dataset.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 458 | 0.17% | 201.2 hrs | High |
| [triage_board_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/triage_board_screen.dart) | Flutter Mobile Companion (Dart) | 457 | 0.17% | 200.7 hrs | High |
| [clinical-commercial-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-commercial-hub.component.ts) | Web Client (Angular & SSR) | 454 | 0.17% | 199.4 hrs | High |
| [home_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/home_screen.dart) | Flutter Mobile Companion (Dart) | 452 | 0.17% | 198.5 hrs | High |
| [pantry-lazy-susan.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/pantry-lazy-susan.component.ts) | Web Client (Angular & SSR) | 449 | 0.17% | 197.2 hrs | High |
| [global-health-initiatives-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/global-health-initiatives-modal.component.ts) | Web Client (Angular & SSR) | 445 | 0.17% | 195.5 hrs | High |
| [sentinel_security_guard.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sentinel_security_guard.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 445 | 0.17% | 195.5 hrs | High |
| [train_clinical_risk_models.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/train_clinical_risk_models.py) | Python FastAPI Sidecar & ML Engines | 438 | 0.17% | 192.4 hrs | High |
| [adaptive-intake.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/adaptive-intake.service.ts) | Web Client (Angular & SSR) | 434 | 0.16% | 190.6 hrs | High |
| [theme.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/theme.service.ts) | Web Client (Angular & SSR) | 434 | 0.16% | 190.6 hrs | High |
| [aws-open-data.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/aws-open-data.service.ts) | Web Client (Angular & SSR) | 433 | 0.16% | 190.2 hrs | High |
| [ambient-scribe.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-scribe.service.ts) | Web Client (Angular & SSR) | 430 | 0.16% | 188.9 hrs | High |
| [positive-psychology-flourishing-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/positive-psychology-flourishing-hub.component.ts) | Web Client (Angular & SSR) | 422 | 0.16% | 185.4 hrs | High |
| [python-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.ts) | Web Client (Angular & SSR) | 422 | 0.16% | 185.4 hrs | High |
| [export_fine_tuning_dataset.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/export_fine_tuning_dataset.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 422 | 0.16% | 185.4 hrs | High |
| [doctor-shift-simulator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/doctor-shift-simulator.component.ts) | Web Client (Angular & SSR) | 420 | 0.16% | 184.5 hrs | High |
| [fitbit.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/fitbit.ts) | Web Client (Angular & SSR) | 419 | 0.16% | 184.0 hrs | High |
| [knee-hologram-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/knee-hologram-hud.component.ts) | Web Client (Angular & SSR) | 417 | 0.16% | 183.2 hrs | High |
| [mood_consciousness_matrix_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/mood_consciousness_matrix_widget.dart) | Flutter Mobile Companion (Dart) | 417 | 0.16% | 183.2 hrs | High |
| [counterfactual-simulator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/counterfactual-simulator.component.ts) | Web Client (Angular & SSR) | 413 | 0.16% | 181.4 hrs | High |
| [demo-data.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/demo-data.ts) | Web Client (Angular & SSR) | 412 | 0.16% | 181.0 hrs | High |
| [gull-narrative-dispatch.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/gull-narrative-dispatch.component.ts) | Web Client (Angular & SSR) | 404 | 0.15% | 177.5 hrs | High |
| [avs-therapy.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.ts) | AVS Therapy Companion (Angular) | 404 | 0.15% | 177.5 hrs | High |
| [generate_rsna_v5_notebook.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_rsna_v5_notebook.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 402 | 0.15% | 176.6 hrs | High |
| [analysis-container.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-container.component.ts) | Web Client (Angular & SSR) | 400 | 0.15% | 175.7 hrs | High |
| [global-health-initiatives.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/global-health-initiatives.service.ts) | Web Client (Angular & SSR) | 400 | 0.15% | 175.7 hrs | Nominal |
| [global-jurisdiction-matrix.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/global-jurisdiction-matrix.service.ts) | Web Client (Angular & SSR) | 400 | 0.15% | 175.7 hrs | Nominal |
| [clinical-fine-tuning-orchestrator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-fine-tuning-orchestrator.service.ts) | Web Client (Angular & SSR) | 399 | 0.15% | 175.3 hrs | Nominal |
| [clinical-prompts.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-prompts.ts) | Web Client (Angular & SSR) | 398 | 0.15% | 174.8 hrs | Nominal |
| [tri-paradigm-integrative-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/tri-paradigm-integrative-lens-tab.component.ts) | Web Client (Angular & SSR) | 396 | 0.15% | 173.9 hrs | High |
| [serene-intake.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/serene-intake.component.ts) | Web Client (Angular & SSR) | 396 | 0.15% | 173.9 hrs | High |
| [clinical-assessments-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-assessments-suite.component.ts) | Web Client (Angular & SSR) | 395 | 0.15% | 173.5 hrs | High |
| [teledentistry-odontogram.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/teledentistry-odontogram.component.ts) | Web Client (Angular & SSR) | 395 | 0.15% | 173.5 hrs | High |
| [update_submission_notebook_v4.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/update_submission_notebook_v4.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 395 | 0.15% | 173.5 hrs | Nominal |
| [native_body_viewer.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/native_body_viewer.dart) | Flutter Mobile Companion (Dart) | 394 | 0.15% | 173.1 hrs | High |
| [analysis_report_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/analysis_report_widget.dart) | Flutter Mobile Companion (Dart) | 393 | 0.15% | 172.6 hrs | Nominal |
| [counterfactual-simulation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/counterfactual-simulation.service.ts) | Web Client (Angular & SSR) | 391 | 0.15% | 171.8 hrs | High |
| [sentinel-telemetry-plotter.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-telemetry-plotter.component.ts) | Web Client (Angular & SSR) | 383 | 0.14% | 168.2 hrs | High |
| [doc_consciousness_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/doc_consciousness_widget.dart) | Flutter Mobile Companion (Dart) | 383 | 0.14% | 168.2 hrs | Nominal |
| [environmental-exposomics-toxicology.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/environmental-exposomics-toxicology.component.ts) | Web Client (Angular & SSR) | 382 | 0.14% | 167.8 hrs | High |
| [clinical-data-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-data-card.component.ts) | Web Client (Angular & SSR) | 381 | 0.14% | 167.4 hrs | Nominal |
| [clinical-menu.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-menu.component.ts) | Web Client (Angular & SSR) | 381 | 0.14% | 167.4 hrs | High |
| [telemetry.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/telemetry.ts) | Web Client (Angular & SSR) | 378 | 0.14% | 166.0 hrs | Nominal |
| [aws.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/aws.ts) | Web Client (Angular & SSR) | 377 | 0.14% | 165.6 hrs | Nominal |
| [avs-cymatics-visualizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/avs-cymatics-visualizer.component.ts) | Web Client (Angular & SSR) | 376 | 0.14% | 165.2 hrs | High |
| [barrows-clinical-inquiry-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/barrows-clinical-inquiry-hub.component.ts) | Web Client (Angular & SSR) | 375 | 0.14% | 164.7 hrs | High |
| [ncaa-sports-science.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ncaa-sports-science.service.ts) | Web Client (Angular & SSR) | 374 | 0.14% | 164.3 hrs | Nominal |
| [dashboard_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/dashboard_screen.dart) | Flutter Mobile Companion (Dart) | 372 | 0.14% | 163.4 hrs | Nominal |
| [positive-psychology.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/positive-psychology.service.ts) | Web Client (Angular & SSR) | 371 | 0.14% | 163.0 hrs | Nominal |
| [ncaa-sports-science-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-frame/ncaa-sports-science-hub.component.ts) | Web Client (Angular & SSR) | 369 | 0.14% | 162.1 hrs | High |
| [hobby-domain-companion.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hobby-domain-companion.component.ts) | Web Client (Angular & SSR) | 367 | 0.14% | 161.2 hrs | High |
| [glyph-forge-studio.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/glyph-forge-studio.component.ts) | Web Client (Angular & SSR) | 367 | 0.14% | 161.2 hrs | Nominal |
| [p_mara_santos.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_mara_santos.ts) | Web Client (Angular & SSR) | 367 | 0.14% | 161.2 hrs | Nominal |
| [billing.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/billing.routes.ts) | Web Client (Angular & SSR) | 367 | 0.14% | 161.2 hrs | Nominal |
| [patient-under-tree.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-under-tree.component.ts) | Web Client (Angular & SSR) | 366 | 0.14% | 160.8 hrs | High |
| [pet-auditory.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/pet-auditory.service.ts) | Web Client (Angular & SSR) | 365 | 0.14% | 160.3 hrs | Nominal |
| [instant-body-care-plan-sheet.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/instant-body-care-plan-sheet.component.ts) | Web Client (Angular & SSR) | 363 | 0.14% | 159.5 hrs | High |
| [historical-luminaries-game.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/historical-luminaries-game.component.ts) | Web Client (Angular & SSR) | 363 | 0.14% | 159.5 hrs | High |
| [akovos-longevity-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/akovos-longevity-hub.component.ts) | Web Client (Angular & SSR) | 360 | 0.14% | 158.1 hrs | High |
| [brand-package-generator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/brand-package-generator.component.ts) | Web Client (Angular & SSR) | 360 | 0.14% | 158.1 hrs | High |
| [open-evidence-commons.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/open-evidence-commons.service.ts) | Web Client (Angular & SSR) | 357 | 0.14% | 156.8 hrs | Nominal |
| [update_submission_notebook.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/update_submission_notebook.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 357 | 0.14% | 156.8 hrs | Nominal |
| [cellular-automata-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/turing/cellular-automata-viewer.component.ts) | Web Client (Angular & SSR) | 356 | 0.13% | 156.4 hrs | High |
| [pocketgull-typeface-specimen.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-typeface-specimen.component.ts) | Web Client (Angular & SSR) | 354 | 0.13% | 155.5 hrs | Nominal |
| [clinic-onboarding-wizard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinic-onboarding-wizard.component.ts) | Web Client (Angular & SSR) | 353 | 0.13% | 155.1 hrs | High |
| [patient-portal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-portal.component.ts) | Web Client (Angular & SSR) | 351 | 0.13% | 154.2 hrs | High |
| [patient.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient.types.ts) | AVS Therapy Companion (Angular) | 349 | 0.13% | 153.3 hrs | Nominal |
| [billing-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/billing-dashboard.component.ts) | Web Client (Angular & SSR) | 346 | 0.13% | 152.0 hrs | High |
| [adaptive-green-routing.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/adaptive-green-routing.service.ts) | Web Client (Angular & SSR) | 346 | 0.13% | 152.0 hrs | Nominal |
| [handoff-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/handoff-modal.component.ts) | Web Client (Angular & SSR) | 345 | 0.13% | 151.5 hrs | High |
| [brand-package-generator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/brand-package-generator.service.ts) | Web Client (Angular & SSR) | 345 | 0.13% | 151.5 hrs | Nominal |
| [api-pricing.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/api-pricing.component.ts) | Web Client (Angular & SSR) | 344 | 0.13% | 151.1 hrs | High |
| [skeptical-epistemology-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/skeptical-epistemology-hud.component.ts) | Web Client (Angular & SSR) | 344 | 0.13% | 151.1 hrs | High |
| [global-avs.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/global-avs.service.ts) | AVS Therapy Companion (Angular) | 343 | 0.13% | 150.7 hrs | High |
| [clinical-holodeck-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-holodeck-viewer.component.ts) | Web Client (Angular & SSR) | 342 | 0.13% | 150.2 hrs | High |
| [rsna-knee.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/rsna-knee.routes.ts) | Web Client (Angular & SSR) | 342 | 0.13% | 150.2 hrs | Nominal |
| [post-it-notes.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/post-it-notes.component.ts) | Web Client (Angular & SSR) | 341 | 0.13% | 149.8 hrs | High |
| [patient-health-trajectory-storybook.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-health-trajectory-storybook.component.ts) | Web Client (Angular & SSR) | 340 | 0.13% | 149.3 hrs | High |
| [patient-state.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.spec.ts) | Web Client (Angular & SSR) | 340 | 0.13% | 149.3 hrs | Nominal |
| [medha-sakti-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/medha-sakti-matrix.component.ts) | Web Client (Angular & SSR) | 339 | 0.13% | 148.9 hrs | High |
| [ambient-clinical-scribe.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/scribe/ambient-clinical-scribe.component.ts) | Web Client (Angular & SSR) | 339 | 0.13% | 148.9 hrs | High |
| [precision-nutrition-calculator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/precision-nutrition-calculator.component.ts) | Web Client (Angular & SSR) | 337 | 0.13% | 148.0 hrs | High |
| [lifestyle-adjunct.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/lifestyle-adjunct.service.ts) | Web Client (Angular & SSR) | 337 | 0.13% | 148.0 hrs | High |
| [import.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/import.service.ts) | Web Client (Angular & SSR) | 336 | 0.13% | 147.6 hrs | High |
| [biometric-history-chart.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biometric-history-chart.component.ts) | Web Client (Angular & SSR) | 333 | 0.13% | 146.3 hrs | High |
| [bionic-focus-benchmark.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/bionic-focus-benchmark.component.ts) | Web Client (Angular & SSR) | 332 | 0.13% | 145.8 hrs | High |
| [nih-who-goal-tracker.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/nih-who-goal-tracker.component.ts) | Web Client (Angular & SSR) | 332 | 0.13% | 145.8 hrs | High |
| [smart-health-card.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-health-card.service.ts) | Web Client (Angular & SSR) | 331 | 0.13% | 145.4 hrs | High |
| [walkthrough-tour.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/walkthrough-tour.service.ts) | Web Client (Angular & SSR) | 331 | 0.13% | 145.4 hrs | High |
| [ybocs_screener_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/ybocs_screener_widget.dart) | Flutter Mobile Companion (Dart) | 327 | 0.12% | 143.6 hrs | Nominal |
| [neuro-bionic-reader.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/neuro-bionic-reader.service.ts) | AVS Therapy Companion (Angular) | 327 | 0.12% | 143.6 hrs | High |
| [nano.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/nano.provider.ts) | Web Client (Angular & SSR) | 325 | 0.12% | 142.8 hrs | High |
| [consent_modal_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/consent_modal_widget.dart) | Flutter Mobile Companion (Dart) | 325 | 0.12% | 142.8 hrs | Nominal |
| [cost_benefit_analysis_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/cost_benefit_analysis_widget.dart) | Flutter Mobile Companion (Dart) | 325 | 0.12% | 142.8 hrs | Nominal |
| [docs-study.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/docs-study.component.ts) | Web Client (Angular & SSR) | 324 | 0.12% | 142.3 hrs | High |
| [patent-claims-hud-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/patent-claims-hud-modal.component.ts) | Web Client (Angular & SSR) | 324 | 0.12% | 142.3 hrs | High |
| [osce-case-simulator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/osce-case-simulator.component.ts) | Web Client (Angular & SSR) | 324 | 0.12% | 142.3 hrs | High |
| [camera_pulse_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/camera_pulse_widget.dart) | Flutter Mobile Companion (Dart) | 324 | 0.12% | 142.3 hrs | Nominal |
| [investor-valuation-portal-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/investor-valuation-portal-modal.component.ts) | Web Client (Angular & SSR) | 322 | 0.12% | 141.4 hrs | Nominal |
| [quantum-clinical-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/quantum-clinical-dashboard.component.ts) | Web Client (Angular & SSR) | 322 | 0.12% | 141.4 hrs | High |
| [interactions.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/interactions.provider.ts) | Web Client (Angular & SSR) | 322 | 0.12% | 141.4 hrs | High |
| [occupational-hazard-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/occupational-hazard-card.component.ts) | Web Client (Angular & SSR) | 321 | 0.12% | 141.0 hrs | High |
| [ga4gh-phenopacket.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ga4gh-phenopacket.service.ts) | Web Client (Angular & SSR) | 319 | 0.12% | 140.1 hrs | Nominal |
| [medical_summary_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/medical_summary_widget.dart) | Flutter Mobile Companion (Dart) | 319 | 0.12% | 140.1 hrs | Nominal |
| [fhir_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/fhir_service.dart) | Flutter Mobile Companion (Dart) | 318 | 0.12% | 139.7 hrs | Nominal |
| [export_fine_tuning_dataset.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/export_fine_tuning_dataset.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 318 | 0.12% | 139.7 hrs | Nominal |
| [role-pathway-documentation-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/role-pathway-documentation-hub.component.ts) | Web Client (Angular & SSR) | 317 | 0.12% | 139.2 hrs | High |
| [electroacupuncture-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/electroacupuncture-viewer.component.ts) | Web Client (Angular & SSR) | 317 | 0.12% | 139.2 hrs | High |
| [patient_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/patient_provider.dart) | Flutter Mobile Companion (Dart) | 316 | 0.12% | 138.8 hrs | Nominal |
| [patient_management_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/patient_management_service.dart) | Flutter Mobile Companion (Dart) | 315 | 0.12% | 138.4 hrs | Nominal |
| [pocket_gull_input_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/pocket_gull_input_widget.dart) | Flutter Mobile Companion (Dart) | 315 | 0.12% | 138.4 hrs | Nominal |
| [aws-open-data-browser.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research/aws-open-data-browser.component.ts) | Web Client (Angular & SSR) | 314 | 0.12% | 137.9 hrs | High |
| [biomarker-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biomarker-matrix.component.ts) | Web Client (Angular & SSR) | 313 | 0.12% | 137.5 hrs | High |
| [androscoggin-foraging-phytoncide.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/androscoggin-foraging-phytoncide.component.ts) | Web Client (Angular & SSR) | 312 | 0.12% | 137.0 hrs | High |
| [node_agent_dialog_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/node_agent_dialog_widget.dart) | Flutter Mobile Companion (Dart) | 311 | 0.12% | 136.6 hrs | Nominal |
| [dictation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/dictation.service.ts) | Web Client (Angular & SSR) | 306 | 0.12% | 134.4 hrs | High |
| [analysis_container_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/analysis_container_widget.dart) | Flutter Mobile Companion (Dart) | 306 | 0.12% | 134.4 hrs | Nominal |
| [clinical-trajectory-reader-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/clinical-trajectory-reader-modal.component.ts) | Web Client (Angular & SSR) | 305 | 0.12% | 134.0 hrs | High |
| [ssa-disability-navigator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ssa-disability-navigator.service.ts) | Web Client (Angular & SSR) | 305 | 0.12% | 134.0 hrs | Nominal |
| [clinical-context-avs.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/clinical-context-avs.service.ts) | AVS Therapy Companion (Angular) | 305 | 0.12% | 134.0 hrs | High |
| [federated-learning.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/federated-learning.service.ts) | Web Client (Angular & SSR) | 304 | 0.12% | 133.5 hrs | Nominal |
| [clinical_intelligence_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/clinical_intelligence_service.dart) | Flutter Mobile Companion (Dart) | 302 | 0.11% | 132.7 hrs | Nominal |
| [doc-consciousness.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/doc-consciousness.component.ts) | Web Client (Angular & SSR) | 301 | 0.11% | 132.2 hrs | High |
| [patient-dropdown.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-dropdown.component.ts) | Web Client (Angular & SSR) | 300 | 0.11% | 131.8 hrs | High |
| [spatial-scanner.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/spatial-scanner.component.ts) | Web Client (Angular & SSR) | 300 | 0.11% | 131.8 hrs | High |
| [fhir-passport-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/fhir-passport-modal.component.ts) | Web Client (Angular & SSR) | 299 | 0.11% | 131.3 hrs | High |
| [bio-symphony-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bio-symphony-engine.service.ts) | Web Client (Angular & SSR) | 299 | 0.11% | 131.3 hrs | High |
| [biomarker_matrix_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/biomarker_matrix_widget.dart) | Flutter Mobile Companion (Dart) | 298 | 0.11% | 130.9 hrs | Nominal |
| [biometric_history_chart_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/biometric_history_chart_widget.dart) | Flutter Mobile Companion (Dart) | 298 | 0.11% | 130.9 hrs | Nominal |
| [chronobiology-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/chronobiology-matrix.component.ts) | Web Client (Angular & SSR) | 295 | 0.11% | 129.6 hrs | High |
| [lemonade.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/lemonade.provider.ts) | Web Client (Angular & SSR) | 294 | 0.11% | 129.1 hrs | High |
| [clinical-model-studio-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-model-studio-card.component.ts) | Web Client (Angular & SSR) | 293 | 0.11% | 128.7 hrs | High |
| [wacom-crypto-ink.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/wacom-crypto-ink.service.ts) | Web Client (Angular & SSR) | 292 | 0.11% | 128.3 hrs | Nominal |
| [family-tree-pedigree.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/family-tree-pedigree.component.ts) | Web Client (Angular & SSR) | 291 | 0.11% | 127.8 hrs | Nominal |
| [clinical-trajectory-reader.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trajectory-reader.service.ts) | Web Client (Angular & SSR) | 291 | 0.11% | 127.8 hrs | High |
| [functional-medicine-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/functional-medicine-matrix.component.ts) | Web Client (Angular & SSR) | 288 | 0.11% | 126.5 hrs | High |
| [medical-supply-navigator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/medical-supply-navigator.component.ts) | Web Client (Angular & SSR) | 286 | 0.11% | 125.6 hrs | High |
| [research-data-dividend.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-data-dividend.component.ts) | Web Client (Angular & SSR) | 286 | 0.11% | 125.6 hrs | High |
| [cms-rpm-superbill.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cms-rpm-superbill.service.ts) | Web Client (Angular & SSR) | 286 | 0.11% | 125.6 hrs | High |
| [ble-wearables.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/ble-wearables.service.ts) | Web Client (Angular & SSR) | 286 | 0.11% | 125.6 hrs | High |
| [zamecznik-canvas.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/zamecznik-canvas.component.ts) | Web Client (Angular & SSR) | 284 | 0.11% | 124.7 hrs | High |
| [adaptive-green-routing-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/adaptive-green-routing-hud.component.ts) | Web Client (Angular & SSR) | 283 | 0.11% | 124.3 hrs | High |
| [holistic-sleep-toolkit.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/holistic-sleep-toolkit.component.ts) | Web Client (Angular & SSR) | 282 | 0.11% | 123.9 hrs | High |
| [kss-cognitive-shield.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/kss-cognitive-shield.component.ts) | Web Client (Angular & SSR) | 282 | 0.11% | 123.9 hrs | High |
| [pocket-gull-button.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-button.component.ts) | Web Client (Angular & SSR) | 282 | 0.11% | 123.9 hrs | High |
| [space-health-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/space-health-hud.component.ts) | Web Client (Angular & SSR) | 280 | 0.11% | 123.0 hrs | High |
| [ybocs_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/ybocs_service.dart) | Flutter Mobile Companion (Dart) | 279 | 0.11% | 122.6 hrs | Nominal |
| [university-league.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/university-league.service.ts) | Web Client (Angular & SSR) | 278 | 0.11% | 122.1 hrs | Nominal |
| [webllm.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/webllm.provider.ts) | Web Client (Angular & SSR) | 277 | 0.10% | 121.7 hrs | High |
| [dictation_modal_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/dictation_modal_widget.dart) | Flutter Mobile Companion (Dart) | 277 | 0.10% | 121.7 hrs | Nominal |
| [doc_protocol_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/doc_protocol_service.dart) | Flutter Mobile Companion (Dart) | 276 | 0.10% | 121.2 hrs | Nominal |
| [genomic-pathogenicity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/genomic-pathogenicity.service.ts) | Web Client (Angular & SSR) | 275 | 0.10% | 120.8 hrs | Nominal |
| [pocket_gull_button_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/pocket_gull_button_widget.dart) | Flutter Mobile Companion (Dart) | 275 | 0.10% | 120.8 hrs | Nominal |
| [tribal-health-sovereignty.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/tribal-health-sovereignty.service.ts) | Web Client (Angular & SSR) | 274 | 0.10% | 120.4 hrs | High |
| [train_historical_contests.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/train_historical_contests.py) | Python FastAPI Sidecar & ML Engines | 274 | 0.10% | 120.4 hrs | Nominal |
| [vagal-biofeedback-dock.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vagal-biofeedback-dock.component.ts) | Web Client (Angular & SSR) | 273 | 0.10% | 119.9 hrs | High |
| [neuro-bionic-reader.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/neuro-bionic-reader.component.ts) | AVS Therapy Companion (Angular) | 272 | 0.10% | 119.5 hrs | High |
| [spatial-lesion-markup.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/spatial-lesion-markup.service.ts) | Web Client (Angular & SSR) | 271 | 0.10% | 119.0 hrs | High |
| [metric_card_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/metric_card_widget.dart) | Flutter Mobile Companion (Dart) | 271 | 0.10% | 119.0 hrs | Nominal |
| [kaizen-quality-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/kaizen-quality-suite.component.ts) | Web Client (Angular & SSR) | 270 | 0.10% | 118.6 hrs | Nominal |
| [barrows-clinical-inquiry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/barrows-clinical-inquiry.service.ts) | Web Client (Angular & SSR) | 268 | 0.10% | 117.7 hrs | Nominal |
| [alpha-stem-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/alpha-stem-viewer.component.ts) | Web Client (Angular & SSR) | 267 | 0.10% | 117.3 hrs | High |
| [gemini.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/gemini.provider.ts) | Web Client (Angular & SSR) | 266 | 0.10% | 116.8 hrs | High |
| [ip-patent-registry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ip-patent-registry.service.ts) | Web Client (Angular & SSR) | 266 | 0.10% | 116.8 hrs | High |
| [molecular-docking-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/molecular-docking-viewer.component.ts) | Web Client (Angular & SSR) | 265 | 0.10% | 116.4 hrs | High |
| [pocketgull-brand-mark.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-brand-mark.component.ts) | Web Client (Angular & SSR) | 265 | 0.10% | 116.4 hrs | Nominal |
| [symptom-habit-journal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/symptom-habit-journal.component.ts) | Web Client (Angular & SSR) | 265 | 0.10% | 116.4 hrs | High |
| [live_agent_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/live_agent_widget.dart) | Flutter Mobile Companion (Dart) | 264 | 0.10% | 116.0 hrs | Nominal |
| [public-health-sentinel-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/public-health-sentinel-suite.component.ts) | Web Client (Angular & SSR) | 263 | 0.10% | 115.5 hrs | High |
| [longitudinal-organ-slider.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/longitudinal-organ-slider.component.ts) | Web Client (Angular & SSR) | 263 | 0.10% | 115.5 hrs | High |
| [utility.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/utility.routes.ts) | Web Client (Angular & SSR) | 263 | 0.10% | 115.5 hrs | Nominal |
| [cdisc-rwe-dossier.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cdisc-rwe-dossier.service.ts) | Web Client (Angular & SSR) | 263 | 0.10% | 115.5 hrs | High |
| [doc-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/doc-protocol.service.ts) | Web Client (Angular & SSR) | 263 | 0.10% | 115.5 hrs | Nominal |
| [lifestyle-adjunct.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/lifestyle-adjunct.service.ts) | AVS Therapy Companion (Angular) | 263 | 0.10% | 115.5 hrs | High |
| [patient-history-timeline.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-history-timeline.component.ts) | Web Client (Angular & SSR) | 261 | 0.10% | 114.6 hrs | High |
| [amazon-creators-api.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/amazon-creators-api.service.ts) | Web Client (Angular & SSR) | 261 | 0.10% | 114.6 hrs | High |
| [circadian_sleepiness_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/circadian_sleepiness_service.dart) | Flutter Mobile Companion (Dart) | 261 | 0.10% | 114.6 hrs | Nominal |
| [clinical-sleep-twin-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-sleep-twin-dashboard.component.ts) | Web Client (Angular & SSR) | 260 | 0.10% | 114.2 hrs | Nominal |
| [intimacy-relationship-vitality.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/intimacy-relationship-vitality.component.ts) | Web Client (Angular & SSR) | 260 | 0.10% | 114.2 hrs | High |
| [jurisdiction-matrix-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/jurisdiction-matrix-card.component.ts) | Web Client (Angular & SSR) | 260 | 0.10% | 114.2 hrs | High |
| [laaf-fhir-haptic-schedule.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/laaf-fhir-haptic-schedule.service.ts) | Web Client (Angular & SSR) | 260 | 0.10% | 114.2 hrs | High |
| [research-consent.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/research-consent.service.ts) | Web Client (Angular & SSR) | 260 | 0.10% | 114.2 hrs | Nominal |
| [chrono-clock-decision-rail.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/chrono-clock-decision-rail.component.ts) | Web Client (Angular & SSR) | 259 | 0.10% | 113.8 hrs | High |
| [deep-space-cds.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/deep-space-cds.service.ts) | Web Client (Angular & SSR) | 259 | 0.10% | 113.8 hrs | Nominal |
| [clinical-mandarinate-exam.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-mandarinate-exam.service.ts) | Web Client (Angular & SSR) | 258 | 0.10% | 113.3 hrs | Nominal |
| [mandiant-clinical-defense.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/mandiant-clinical-defense.service.ts) | Web Client (Angular & SSR) | 258 | 0.10% | 113.3 hrs | Nominal |
| [storage.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/storage.service.ts) | Web Client (Angular & SSR) | 258 | 0.10% | 113.3 hrs | High |
| [grow-thyself-legacy-vault.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/grow-thyself-legacy-vault.component.ts) | Web Client (Angular & SSR) | 255 | 0.10% | 112.0 hrs | High |
| [genesis-biophysical-substrate.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/genesis-biophysical-substrate.component.ts) | Web Client (Angular & SSR) | 253 | 0.10% | 111.1 hrs | High |
| [generate_app_icons.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_app_icons.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 253 | 0.10% | 111.1 hrs | Nominal |
| [uk-rio-pubmed-sourcing.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/uk-rio-pubmed-sourcing.component.ts) | Web Client (Angular & SSR) | 252 | 0.10% | 110.7 hrs | High |
| [vertex_model_garden_deploy.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/vertex_model_garden_deploy.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 252 | 0.10% | 110.7 hrs | Nominal |
| [nsf-grant-portal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nsf-grant-portal.component.ts) | Web Client (Angular & SSR) | 251 | 0.09% | 110.3 hrs | High |
| [circadian-sleepiness.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/circadian-sleepiness.service.ts) | Web Client (Angular & SSR) | 251 | 0.09% | 110.3 hrs | High |
| [floating-water-consciousness.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/floating-water-consciousness.component.ts) | Web Client (Angular & SSR) | 250 | 0.09% | 109.8 hrs | High |
| [teledentistry_odontogram_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/teledentistry_odontogram_widget.dart) | Flutter Mobile Companion (Dart) | 250 | 0.09% | 109.8 hrs | Nominal |
| [alphagenome-regulatory-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/alphagenome-regulatory-card.component.ts) | Web Client (Angular & SSR) | 249 | 0.09% | 109.4 hrs | High |
| [import_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/import_service.dart) | Flutter Mobile Companion (Dart) | 249 | 0.09% | 109.4 hrs | Nominal |
| [yoga-asana-3d-coach.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/yoga-asana-3d-coach.component.ts) | Web Client (Angular & SSR) | 248 | 0.09% | 108.9 hrs | High |
| [movement-healing-quest.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/movement-healing-quest.component.ts) | Web Client (Angular & SSR) | 248 | 0.09% | 108.9 hrs | High |
| [pocketgull-marker-font.css](file:///C:/Users/philg/Pocketgull/pocketgull/src/styles/pocketgull-marker-font.css) | Web Client (Angular & SSR) | 248 | 0.09% | 108.9 hrs | Nominal |
| [export_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/export_service.dart) | Flutter Mobile Companion (Dart) | 248 | 0.09% | 108.9 hrs | Nominal |
| [rules_engine_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/rules_engine_service.dart) | Flutter Mobile Companion (Dart) | 248 | 0.09% | 108.9 hrs | Nominal |
| [patient-directory.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-directory.component.ts) | Web Client (Angular & SSR) | 246 | 0.09% | 108.1 hrs | High |
| [gcp-healthcare-api.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/gcp-healthcare-api.service.ts) | Web Client (Angular & SSR) | 246 | 0.09% | 108.1 hrs | High |
| [international-university-geofence.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/international-university-geofence.service.ts) | Web Client (Angular & SSR) | 246 | 0.09% | 108.1 hrs | Nominal |
| [ml_cost_benefit_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/ml_cost_benefit_engine.py) | Python FastAPI Sidecar & ML Engines | 246 | 0.09% | 108.1 hrs | Nominal |
| [community-testimonial-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/community-testimonial-modal.component.ts) | Web Client (Angular & SSR) | 245 | 0.09% | 107.6 hrs | High |
| [clinical-reasoning-stream.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-reasoning-stream.component.ts) | Web Client (Angular & SSR) | 244 | 0.09% | 107.2 hrs | High |
| [ambient-flow-player.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ambient-flow-player.component.ts) | Web Client (Angular & SSR) | 244 | 0.09% | 107.2 hrs | High |
| [rich-media.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rich-media.service.ts) | Web Client (Angular & SSR) | 244 | 0.09% | 107.2 hrs | High |
| [food-safety-guardrail-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/food-safety-guardrail-card.component.ts) | Web Client (Angular & SSR) | 243 | 0.09% | 106.7 hrs | High |
| [body-explorer-game.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/body-explorer-game.component.ts) | Web Client (Angular & SSR) | 242 | 0.09% | 106.3 hrs | Nominal |
| [austere-research.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/austere-research.service.ts) | Web Client (Angular & SSR) | 242 | 0.09% | 106.3 hrs | Nominal |
| [pocket-gull-input.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-input.component.ts) | Web Client (Angular & SSR) | 241 | 0.09% | 105.9 hrs | High |
| [gamification.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/gamification.service.ts) | Web Client (Angular & SSR) | 241 | 0.09% | 105.9 hrs | High |
| [domain-suites-navigator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/domain-suites-navigator.component.ts) | Web Client (Angular & SSR) | 240 | 0.09% | 105.4 hrs | High |
| [dicom.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/dicom.service.ts) | Web Client (Angular & SSR) | 239 | 0.09% | 105.0 hrs | High |
| [ssa-disability-navigator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ssa-disability-navigator.component.ts) | Web Client (Angular & SSR) | 238 | 0.09% | 104.5 hrs | High |
| [research-lectures.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/research-lectures.service.ts) | Web Client (Angular & SSR) | 238 | 0.09% | 104.5 hrs | Nominal |
| [practice-roi-calculator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/practice-roi-calculator.component.ts) | Web Client (Angular & SSR) | 237 | 0.09% | 104.1 hrs | High |
| [ai-cache.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai-cache.service.ts) | Web Client (Angular & SSR) | 237 | 0.09% | 104.1 hrs | Nominal |
| [maternal-postpartum.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/maternal-postpartum.service.ts) | Web Client (Angular & SSR) | 237 | 0.09% | 104.1 hrs | Nominal |
| [run-clinical-evals.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-clinical-evals.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 237 | 0.09% | 104.1 hrs | Nominal |
| [austere-research-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/austere-research-hud/austere-research-hud.component.ts) | Web Client (Angular & SSR) | 236 | 0.09% | 103.7 hrs | High |
| [fhir-r5-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-r5-telemetry.service.ts) | Web Client (Angular & SSR) | 236 | 0.09% | 103.7 hrs | High |
| [google-saif-clinical-defense.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/google-saif-clinical-defense.service.ts) | Web Client (Angular & SSR) | 236 | 0.09% | 103.7 hrs | Nominal |
| [biochemical-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biochemical-suite.component.ts) | Web Client (Angular & SSR) | 234 | 0.09% | 102.8 hrs | High |
| [daily-action-checklist.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/daily-action-checklist.component.ts) | Web Client (Angular & SSR) | 234 | 0.09% | 102.8 hrs | High |
| [clinical-tool-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-tool-card.component.ts) | Web Client (Angular & SSR) | 234 | 0.09% | 102.8 hrs | High |
| [patient_vitals_chart_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/patient_vitals_chart_widget.dart) | Flutter Mobile Companion (Dart) | 234 | 0.09% | 102.8 hrs | Nominal |
| [art-therapy-canvas.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/art-therapy-canvas.component.ts) | Web Client (Angular & SSR) | 233 | 0.09% | 102.3 hrs | High |
| [clinical-gauge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-gauge.component.ts) | Web Client (Angular & SSR) | 233 | 0.09% | 102.3 hrs | Nominal |
| [ybocs-screener.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ybocs-screener.component.ts) | Web Client (Angular & SSR) | 233 | 0.09% | 102.3 hrs | High |
| [generate_med_skeptic_notebook.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_med_skeptic_notebook.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 232 | 0.09% | 101.9 hrs | Nominal |
| [clinical-mandarinate-exam-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-mandarinate-exam-card.component.ts) | Web Client (Angular & SSR) | 231 | 0.09% | 101.5 hrs | High |
| [ble_wearables_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/ble_wearables_service.dart) | Flutter Mobile Companion (Dart) | 229 | 0.09% | 100.6 hrs | Nominal |
| [body-mesh-factory.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/body-mesh-factory.service.ts) | Web Client (Angular & SSR) | 228 | 0.09% | 100.2 hrs | High |
| [clinician-onboarding.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinician-onboarding.component.ts) | Web Client (Angular & SSR) | 227 | 0.09% | 99.7 hrs | High |
| [research_data_dividend_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/research_data_dividend_screen.dart) | Flutter Mobile Companion (Dart) | 227 | 0.09% | 99.7 hrs | Nominal |
| [cellular-biophysics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cellular-biophysics.service.ts) | Web Client (Angular & SSR) | 226 | 0.09% | 99.3 hrs | Nominal |
| [federated_learning_card_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/federated_learning_card_widget.dart) | Flutter Mobile Companion (Dart) | 226 | 0.09% | 99.3 hrs | Nominal |
| [actuarial-glee-album.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/actuarial-glee-album.component.ts) | Web Client (Angular & SSR) | 225 | 0.09% | 98.8 hrs | High |
| [alphagenome-regulatory.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/alphagenome-regulatory.service.ts) | Web Client (Angular & SSR) | 225 | 0.09% | 98.8 hrs | Nominal |
| [sms-equity-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/sms-equity-bridge.service.ts) | Web Client (Angular & SSR) | 225 | 0.09% | 98.8 hrs | High |
| [hsa-incentive-network.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hsa-incentive-network.component.ts) | Web Client (Angular & SSR) | 224 | 0.08% | 98.4 hrs | High |
| [caregiver-bridge-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/caregiver-bridge-modal.component.ts) | Web Client (Angular & SSR) | 224 | 0.08% | 98.4 hrs | High |
| [mission-symphony-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/mission-symphony-engine.service.ts) | Web Client (Angular & SSR) | 224 | 0.08% | 98.4 hrs | Nominal |
| [rules-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rules-engine.service.ts) | Web Client (Angular & SSR) | 224 | 0.08% | 98.4 hrs | Nominal |
| [emergency-supply-finder.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/emergency-supply-finder.component.ts) | Web Client (Angular & SSR) | 223 | 0.08% | 98.0 hrs | Nominal |
| [biophilic-pathway-3d-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/biophilic-pathway-3d-viewer.component.ts) | Web Client (Angular & SSR) | 222 | 0.08% | 97.5 hrs | High |
| [biophysical-twin-timeline.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/biophysical-twin-timeline.component.ts) | Web Client (Angular & SSR) | 222 | 0.08% | 97.5 hrs | High |
| [fitbit.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/fitbit.service.ts) | Web Client (Angular & SSR) | 222 | 0.08% | 97.5 hrs | High |
| [medical-decoder.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/medical-decoder.service.ts) | Web Client (Angular & SSR) | 222 | 0.08% | 97.5 hrs | Nominal |
| [actuarial-longevity.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/actuarial-longevity.spec.ts) | Automated Test Suites (Playwright & Vitest) | 222 | 0.08% | 97.5 hrs | Nominal |
| [tri-cloud-care-plan-consensus.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical/tri-cloud-care-plan-consensus.component.ts) | Web Client (Angular & SSR) | 221 | 0.08% | 97.1 hrs | High |
| [genomic-variant-screener.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/genomic-variant-screener.component.ts) | Web Client (Angular & SSR) | 221 | 0.08% | 97.1 hrs | High |
| [breath-guide.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/breath-guide.component.ts) | AVS Therapy Companion (Angular) | 221 | 0.08% | 97.1 hrs | High |
| [doctor-shift-sales-demo.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/doctor-shift-sales-demo.component.ts) | Web Client (Angular & SSR) | 220 | 0.08% | 96.6 hrs | Nominal |
| [sms-equity-bridge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sms-equity-bridge.component.ts) | Web Client (Angular & SSR) | 220 | 0.08% | 96.6 hrs | High |
| [dicom.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/dicom.ts) | Web Client (Angular & SSR) | 220 | 0.08% | 96.6 hrs | Nominal |
| [maternal-postpartum-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/maternal-postpartum-lens-tab.component.ts) | Web Client (Angular & SSR) | 219 | 0.08% | 96.2 hrs | High |
| [cohort-triage-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/cohort-triage-matrix.component.ts) | Web Client (Angular & SSR) | 219 | 0.08% | 96.2 hrs | High |
| [presentation-export.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/presentation-export.service.ts) | Web Client (Angular & SSR) | 219 | 0.08% | 96.2 hrs | High |
| [inline_agent_chat_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/inline_agent_chat_widget.dart) | Flutter Mobile Companion (Dart) | 219 | 0.08% | 96.2 hrs | Nominal |
| [ingest_and_train_real_cohorts.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/pipelines/ingest_and_train_real_cohorts.py) | Python FastAPI Sidecar & ML Engines | 219 | 0.08% | 96.2 hrs | Nominal |
| [bibliotherapy-hobby-prescriber.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/bibliotherapy-hobby-prescriber.component.ts) | Web Client (Angular & SSR) | 218 | 0.08% | 95.8 hrs | High |
| [goal-planning-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/goal-planning-engine.service.ts) | Web Client (Angular & SSR) | 218 | 0.08% | 95.8 hrs | Nominal |
| [cgm_time_in_range_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/cgm_time_in_range_widget.dart) | Flutter Mobile Companion (Dart) | 218 | 0.08% | 95.8 hrs | Nominal |
| [plan-differential-inspector.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/plan-differential-inspector.component.ts) | Web Client (Angular & SSR) | 217 | 0.08% | 95.3 hrs | Nominal |
| [auth-sso.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/auth-sso.service.ts) | Web Client (Angular & SSR) | 217 | 0.08% | 95.3 hrs | High |
| [ble_waveform_oscilloscope_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/ble_waveform_oscilloscope_widget.dart) | Flutter Mobile Companion (Dart) | 217 | 0.08% | 95.3 hrs | Nominal |
| [skeptical_epistemology_card_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/skeptical_epistemology_card_widget.dart) | Flutter Mobile Companion (Dart) | 217 | 0.08% | 95.3 hrs | Nominal |
| [sec1557-audit-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/sec1557-audit-modal.component.ts) | Web Client (Angular & SSR) | 216 | 0.08% | 94.9 hrs | High |
| [vertex-agent.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/vertex-agent.routes.ts) | Web Client (Angular & SSR) | 216 | 0.08% | 94.9 hrs | Nominal |
| [longitudinal-trend-sparkline.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/longitudinal-trend-sparkline.component.ts) | Web Client (Angular & SSR) | 215 | 0.08% | 94.4 hrs | Nominal |
| [p002.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p002.ts) | Web Client (Angular & SSR) | 215 | 0.08% | 94.4 hrs | Nominal |
| [open-evidence-commons-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/open-evidence-commons-hud.component.ts) | Web Client (Angular & SSR) | 214 | 0.08% | 94.0 hrs | High |
| [onc-dsi-transparency-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/onc-dsi-transparency-card.component.ts) | Web Client (Angular & SSR) | 213 | 0.08% | 93.6 hrs | High |
| [encrypted-vault-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/encrypted-vault-modal.component.ts) | Web Client (Angular & SSR) | 213 | 0.08% | 93.6 hrs | High |
| [pocketgull-typeface-site.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-typeface-site.component.ts) | Web Client (Angular & SSR) | 213 | 0.08% | 93.6 hrs | Nominal |
| [amazon.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/amazon.routes.ts) | Web Client (Angular & SSR) | 213 | 0.08% | 93.6 hrs | Nominal |
| [bio-symphony-visualizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/bio-symphony-visualizer.component.ts) | Web Client (Angular & SSR) | 212 | 0.08% | 93.1 hrs | High |
| [firestore_sync_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/firestore_sync_service.dart) | Flutter Mobile Companion (Dart) | 212 | 0.08% | 93.1 hrs | Nominal |
| [multi-paradigm-venn.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/multi-paradigm-venn.component.ts) | Web Client (Angular & SSR) | 211 | 0.08% | 92.7 hrs | Nominal |
| [clinical-evals.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-evals.service.ts) | Web Client (Angular & SSR) | 211 | 0.08% | 92.7 hrs | Nominal |
| [co-regulation-panel.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/co-regulation-panel.component.ts) | AVS Therapy Companion (Angular) | 211 | 0.08% | 92.7 hrs | Nominal |
| [contactless-vitals-scanner.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/contactless-vitals-scanner.component.ts) | Web Client (Angular & SSR) | 210 | 0.08% | 92.2 hrs | High |
| [tier-config.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/tier-config.ts) | Web Client (Angular & SSR) | 210 | 0.08% | 92.2 hrs | Nominal |
| [fhir-bundle-factory.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-bundle-factory.service.ts) | Web Client (Angular & SSR) | 210 | 0.08% | 92.2 hrs | Nominal |
| [mandiant-cyber-defense-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/mandiant-cyber-defense-card.component.ts) | Web Client (Angular & SSR) | 209 | 0.08% | 91.8 hrs | High |
| [storm-analysis.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/storm-analysis.component.ts) | Web Client (Angular & SSR) | 208 | 0.08% | 91.4 hrs | High |
| [hybrid.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/hybrid.provider.ts) | Web Client (Angular & SSR) | 208 | 0.08% | 91.4 hrs | High |
| [phantom-limb-mirror-therapy.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/phantom-limb-mirror-therapy.component.ts) | Web Client (Angular & SSR) | 207 | 0.08% | 90.9 hrs | High |
| [synthesis_dashboard_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/synthesis/synthesis_dashboard_widget.dart) | Flutter Mobile Companion (Dart) | 207 | 0.08% | 90.9 hrs | Nominal |
| [bystander-action-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/bystander-action-suite.component.ts) | Web Client (Angular & SSR) | 206 | 0.08% | 90.5 hrs | High |
| [eyes-free-accessibility-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eyes-free-accessibility-hub.component.ts) | Web Client (Angular & SSR) | 206 | 0.08% | 90.5 hrs | High |
| [deep-space-cds-terminal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/deep-space-cds-terminal.component.ts) | Web Client (Angular & SSR) | 205 | 0.08% | 90.0 hrs | High |
| [adobe-firefly-texture.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/adobe-firefly-texture.service.ts) | Web Client (Angular & SSR) | 205 | 0.08% | 90.0 hrs | High |
| [seed-gcp-fhir-store.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/seed-gcp-fhir-store.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 205 | 0.08% | 90.0 hrs | Nominal |
| [intimacy-relationship-vitality.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/intimacy-relationship-vitality.service.ts) | Web Client (Angular & SSR) | 204 | 0.08% | 89.6 hrs | Nominal |
| [research_tab_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/research_tab_widget.dart) | Flutter Mobile Companion (Dart) | 204 | 0.08% | 89.6 hrs | Nominal |
| [mychart-brief-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/mychart-brief-modal.component.ts) | Web Client (Angular & SSR) | 203 | 0.08% | 89.2 hrs | High |
| [origami-papercraft-decorations.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/origami-papercraft-decorations.component.ts) | Web Client (Angular & SSR) | 202 | 0.08% | 88.7 hrs | High |
| [smart-fhir-sync.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-fhir-sync.service.ts) | Web Client (Angular & SSR) | 202 | 0.08% | 88.7 hrs | High |
| [space-biophysics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/space-biophysics.service.ts) | Web Client (Angular & SSR) | 202 | 0.08% | 88.7 hrs | Nominal |
| [emergency_supply_finder_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/emergency_supply_finder_widget.dart) | Flutter Mobile Companion (Dart) | 202 | 0.08% | 88.7 hrs | Nominal |
| [patient_directory_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/patient_directory_widget.dart) | Flutter Mobile Companion (Dart) | 202 | 0.08% | 88.7 hrs | Nominal |
| [debt_zen_solver.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/debt_zen_solver.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 202 | 0.08% | 88.7 hrs | Nominal |
| [ble-wearables-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ble-wearables-hud.component.ts) | Web Client (Angular & SSR) | 201 | 0.08% | 88.3 hrs | High |
| [clinical-ux-evaluation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-ux-evaluation.service.ts) | Web Client (Angular & SSR) | 201 | 0.08% | 88.3 hrs | Nominal |
| [rx-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rx-guard.service.ts) | Web Client (Angular & SSR) | 201 | 0.08% | 88.3 hrs | High |
| [yoga-asana-coaching.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/yoga-asana-coaching.service.ts) | Web Client (Angular & SSR) | 201 | 0.08% | 88.3 hrs | Nominal |
| [auth.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/auth.routes.ts) | Web Client (Angular & SSR) | 200 | 0.08% | 87.9 hrs | Nominal |
| [lifestyle_adjunct_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/lifestyle_adjunct_service.dart) | Flutter Mobile Companion (Dart) | 199 | 0.08% | 87.4 hrs | Nominal |
| [dietary-allergy-shield.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/dietary-allergy-shield.component.ts) | Web Client (Angular & SSR) | 198 | 0.07% | 87.0 hrs | High |
| [fhir-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/fhir-export-strategy.service.ts) | Web Client (Angular & SSR) | 198 | 0.07% | 87.0 hrs | High |
| [theme_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/theme_service.dart) | Flutter Mobile Companion (Dart) | 198 | 0.07% | 87.0 hrs | Nominal |
| [webgl-sacred-geometry.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/webgl-sacred-geometry.component.ts) | AVS Therapy Companion (Angular) | 198 | 0.07% | 87.0 hrs | High |
| [socratic-rounds-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/socratic-rounds-hud.component.ts) | Web Client (Angular & SSR) | 197 | 0.07% | 86.5 hrs | High |
| [agent-personas.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/agent-personas.ts) | Web Client (Angular & SSR) | 197 | 0.07% | 86.5 hrs | Nominal |
| [clinical-tri-cloud-consensus.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-tri-cloud-consensus.service.ts) | Web Client (Angular & SSR) | 197 | 0.07% | 86.5 hrs | Nominal |
| [pocketgull-desktop-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/pocketgull-desktop-suite.component.ts) | Web Client (Angular & SSR) | 196 | 0.07% | 86.1 hrs | Nominal |
| [ga4gh-phenopackets-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ga4gh-phenopackets-card.component.ts) | Web Client (Angular & SSR) | 196 | 0.07% | 86.1 hrs | High |
| [smart-fhir-sync-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/smart-fhir-sync-modal.component.ts) | Web Client (Angular & SSR) | 196 | 0.07% | 86.1 hrs | High |
| [gaap-accounting.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/gaap-accounting.service.ts) | Web Client (Angular & SSR) | 196 | 0.07% | 86.1 hrs | Nominal |
| [environmental-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/environmental-telemetry.service.ts) | Web Client (Angular & SSR) | 196 | 0.07% | 86.1 hrs | Nominal |
| [teledentistry-systemic-lens.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/teledentistry-systemic-lens.component.ts) | Web Client (Angular & SSR) | 194 | 0.07% | 85.2 hrs | High |
| [body-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/body-viewer.component.spec.ts) | Web Client (Angular & SSR) | 194 | 0.07% | 85.2 hrs | Nominal |
| [glossary-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/glossary-modal.component.ts) | Web Client (Angular & SSR) | 194 | 0.07% | 85.2 hrs | Nominal |
| [sdoh-navigator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sdoh-navigator.component.ts) | Web Client (Angular & SSR) | 194 | 0.07% | 85.2 hrs | High |
| [life-perils-paradigm-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/life-perils-paradigm-matrix.component.ts) | Web Client (Angular & SSR) | 193 | 0.07% | 84.8 hrs | High |
| [voice_assistant_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/voice_assistant_widget.dart) | Flutter Mobile Companion (Dart) | 193 | 0.07% | 84.8 hrs | Nominal |
| [hedis-star-rating.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hedis-star-rating.service.ts) | Web Client (Angular & SSR) | 192 | 0.07% | 84.3 hrs | Nominal |
| [n-of-1-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/n-of-1-engine.service.ts) | Web Client (Angular & SSR) | 192 | 0.07% | 84.3 hrs | High |
| [onc-dsi-transparency.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/onc-dsi-transparency.service.ts) | Web Client (Angular & SSR) | 192 | 0.07% | 84.3 hrs | Nominal |
| [tribal-health-sovereignty-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/tribal-health-sovereignty-card.component.ts) | Web Client (Angular & SSR) | 191 | 0.07% | 83.9 hrs | High |
| [history_timeline_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/history_timeline_widget.dart) | Flutter Mobile Companion (Dart) | 190 | 0.07% | 83.5 hrs | Nominal |
| [physionet-acoustic-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/physionet-acoustic-hud.component.ts) | Web Client (Angular & SSR) | 189 | 0.07% | 83.0 hrs | High |
| [population-health-equity-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/population-health-equity-hub.component.ts) | Web Client (Angular & SSR) | 189 | 0.07% | 83.0 hrs | High |
| [academic-lab-recruitment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/academic-lab-recruitment.service.ts) | Web Client (Angular & SSR) | 189 | 0.07% | 83.0 hrs | Nominal |
| [live_agent_visuals_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/live_agent_visuals_widget.dart) | Flutter Mobile Companion (Dart) | 189 | 0.07% | 83.0 hrs | Nominal |
| [research_frame_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/research_frame_widget.dart) | Flutter Mobile Companion (Dart) | 189 | 0.07% | 83.0 hrs | Nominal |
| [systems-equilibrium-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/systems-equilibrium-hud.component.ts) | Web Client (Angular & SSR) | 188 | 0.07% | 82.6 hrs | High |
| [cms-rpm-superbill-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/cms-rpm-superbill-modal.component.ts) | Web Client (Angular & SSR) | 188 | 0.07% | 82.6 hrs | High |
| [p001.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p001.ts) | Web Client (Angular & SSR) | 188 | 0.07% | 82.6 hrs | Nominal |
| [component-drilldown-unit.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/component-drilldown-unit.component.ts) | Web Client (Angular & SSR) | 187 | 0.07% | 82.1 hrs | High |
| [skeptical_epistemology_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/skeptical_epistemology_service.dart) | Flutter Mobile Companion (Dart) | 187 | 0.07% | 82.1 hrs | Nominal |
| [clinical-scorecard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-scorecard.component.ts) | Web Client (Angular & SSR) | 186 | 0.07% | 81.7 hrs | High |
| [privacy-sovereignty-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/privacy-sovereignty-dashboard.component.ts) | Web Client (Angular & SSR) | 186 | 0.07% | 81.7 hrs | High |
| [grow-thyself-legacy-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/grow-thyself-legacy-engine.service.ts) | Web Client (Angular & SSR) | 186 | 0.07% | 81.7 hrs | High |
| [api-key-manager.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/api-key-manager.component.ts) | Web Client (Angular & SSR) | 185 | 0.07% | 81.3 hrs | High |
| [conformal-readmission-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/conformal-readmission-card.component.ts) | Web Client (Angular & SSR) | 185 | 0.07% | 81.3 hrs | High |
| [evaluate_model.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/evaluate_model.py) | Python FastAPI Sidecar & ML Engines | 185 | 0.07% | 81.3 hrs | Nominal |
| [residency-osce-simulator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/residency-osce-simulator.component.ts) | Web Client (Angular & SSR) | 184 | 0.07% | 80.8 hrs | High |
| [turing-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/turing/turing-suite.component.ts) | Web Client (Angular & SSR) | 184 | 0.07% | 80.8 hrs | High |
| [biomarker-velocity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/biomarker-velocity.service.ts) | Web Client (Angular & SSR) | 184 | 0.07% | 80.8 hrs | High |
| [socratic-multilingual-terminal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/socratic-multilingual-terminal.component.ts) | Web Client (Angular & SSR) | 183 | 0.07% | 80.4 hrs | High |
| [sms.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/sms.routes.ts) | Web Client (Angular & SSR) | 183 | 0.07% | 80.4 hrs | Nominal |
| [clinical-intelligence.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.spec.ts) | Web Client (Angular & SSR) | 183 | 0.07% | 80.4 hrs | Nominal |
| [clinical-ux-evaluation-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-ux-evaluation-hub.component.ts) | Web Client (Angular & SSR) | 182 | 0.07% | 79.9 hrs | High |
| [summary_node_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/summary_node_widget.dart) | Flutter Mobile Companion (Dart) | 182 | 0.07% | 79.9 hrs | Nominal |
| [huggingface_model_hub_export.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/huggingface_model_hub_export.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 182 | 0.07% | 79.9 hrs | Nominal |
| [population-health-equity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/population-health-equity.service.ts) | Web Client (Angular & SSR) | 181 | 0.07% | 79.5 hrs | Nominal |
| [serene_intake_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/synthesis/serene_intake_widget.dart) | Flutter Mobile Companion (Dart) | 180 | 0.07% | 79.1 hrs | Nominal |
| [emergency-nutritional-bypass.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/emergency-nutritional-bypass.component.ts) | Web Client (Angular & SSR) | 179 | 0.07% | 78.6 hrs | High |
| [eyes-free-camera-scribe.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eyes-free-camera-scribe.component.ts) | Web Client (Angular & SSR) | 179 | 0.07% | 78.6 hrs | High |
| [navier-stokes-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/turing/navier-stokes-viewer.component.ts) | Web Client (Angular & SSR) | 179 | 0.07% | 78.6 hrs | High |
| [ambient-soap-parser.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-soap-parser.service.ts) | Web Client (Angular & SSR) | 179 | 0.07% | 78.6 hrs | Nominal |
| [test_clinical_risk_models.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_clinical_risk_models.py) | Python FastAPI Sidecar & ML Engines | 179 | 0.07% | 78.6 hrs | Nominal |
| [taint-analysis-guard.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/taint-analysis-guard.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 179 | 0.07% | 78.6 hrs | Nominal |
| [zen-sanctuary-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/zen-sanctuary-modal.component.ts) | Web Client (Angular & SSR) | 178 | 0.07% | 78.2 hrs | High |
| [run_local_inference.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run_local_inference.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 178 | 0.07% | 78.2 hrs | Nominal |
| [nantucket-tick-case-study.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/case-studies/nantucket-tick-case-study.component.ts) | Web Client (Angular & SSR) | 177 | 0.07% | 77.7 hrs | High |
| [socratic-multilingual-translator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-multilingual-translator.service.ts) | Web Client (Angular & SSR) | 177 | 0.07% | 77.7 hrs | Nominal |
| [athletic_protocol_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/athletic_protocol_service.dart) | Flutter Mobile Companion (Dart) | 177 | 0.07% | 77.7 hrs | Nominal |
| [pocket_gull_card_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/pocket_gull_card_widget.dart) | Flutter Mobile Companion (Dart) | 177 | 0.07% | 77.7 hrs | Nominal |
| [app-licensing-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/app-licensing-guard.service.ts) | Web Client (Angular & SSR) | 176 | 0.07% | 77.3 hrs | Nominal |
| [electroacupuncture.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/electroacupuncture.service.ts) | Web Client (Angular & SSR) | 176 | 0.07% | 77.3 hrs | Nominal |
| [eyes-free-accessibility.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/eyes-free-accessibility.service.ts) | Web Client (Angular & SSR) | 176 | 0.07% | 77.3 hrs | Nominal |
| [avs-ui.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/avs-ui.service.ts) | AVS Therapy Companion (Angular) | 176 | 0.07% | 77.3 hrs | High |
| [generate_sensory_ambient_dataset.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_sensory_ambient_dataset.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 176 | 0.07% | 77.3 hrs | Nominal |
| [ismp-safety-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ismp-safety-guard.service.ts) | Web Client (Angular & SSR) | 173 | 0.07% | 76.0 hrs | Nominal |
| [clinical_gauge_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/clinical_gauge_widget.dart) | Flutter Mobile Companion (Dart) | 173 | 0.07% | 76.0 hrs | Nominal |
| [generate_multi_paradigm_datasets.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_multi_paradigm_datasets.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 173 | 0.07% | 76.0 hrs | Nominal |
| [irmaa-decision-calculator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/irmaa-decision-calculator.component.ts) | Web Client (Angular & SSR) | 172 | 0.07% | 75.6 hrs | High |
| [ambient-clinical-scribe.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-clinical-scribe.service.ts) | Web Client (Angular & SSR) | 172 | 0.07% | 75.6 hrs | High |
| [benchmark_telemetry_stream.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/benchmark_telemetry_stream.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 172 | 0.07% | 75.6 hrs | Nominal |
| [collaboration-dock.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/collaboration-dock.component.ts) | Web Client (Angular & SSR) | 171 | 0.06% | 75.1 hrs | High |
| [contract-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/contract-hub.component.ts) | Web Client (Angular & SSR) | 171 | 0.06% | 75.1 hrs | High |
| [nng-usability-metrics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/nng-usability-metrics.service.ts) | Web Client (Angular & SSR) | 171 | 0.06% | 75.1 hrs | High |
| [acronym-expander.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/acronym-expander.service.ts) | Web Client (Angular & SSR) | 170 | 0.06% | 74.7 hrs | Nominal |
| [molecular-docking.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/molecular-docking.service.ts) | Web Client (Angular & SSR) | 170 | 0.06% | 74.7 hrs | Nominal |
| [visit_review_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/visit_review_widget.dart) | Flutter Mobile Companion (Dart) | 170 | 0.06% | 74.7 hrs | Nominal |
| [avs-therapy.component.html](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.html) | AVS Therapy Companion (Angular) | 170 | 0.06% | 74.7 hrs | Nominal |
| [smart-on-fhir-launcher.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/smart-on-fhir-launcher.service.ts) | Web Client (Angular & SSR) | 169 | 0.06% | 74.2 hrs | High |
| [open_evidence_commons_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/open_evidence_commons_provider.dart) | Flutter Mobile Companion (Dart) | 169 | 0.06% | 74.2 hrs | Nominal |
| [usage-licensing-paywall-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/usage-licensing-paywall-modal.component.ts) | Web Client (Angular & SSR) | 168 | 0.06% | 73.8 hrs | High |
| [socratic-rounds.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-rounds.service.ts) | Web Client (Angular & SSR) | 168 | 0.06% | 73.8 hrs | Nominal |
| [intake-toolbar.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/intake-toolbar.component.ts) | Web Client (Angular & SSR) | 167 | 0.06% | 73.4 hrs | High |
| [orcid_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/orcid_service.dart) | Flutter Mobile Companion (Dart) | 167 | 0.06% | 73.4 hrs | Nominal |
| [ingest_public_health_data.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/ingest_public_health_data.py) | Python FastAPI Sidecar & ML Engines | 167 | 0.06% | 73.4 hrs | Nominal |
| [functional-circadian-synergy-bridge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/functional-circadian-synergy-bridge.component.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | High |
| [inter-system-crosstalk-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/inter-system-crosstalk-card.component.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | High |
| [companion-sync-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/companion-sync-modal.component.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | High |
| [paradigm-arbitration-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/paradigm-arbitration-matrix.component.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | Nominal |
| [clinical-assessments.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/clinical-assessments.service.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | High |
| [institutional-compliance.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/institutional-compliance.service.ts) | Web Client (Angular & SSR) | 166 | 0.06% | 72.9 hrs | Nominal |
| [teledentistry_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/teledentistry_service.dart) | Flutter Mobile Companion (Dart) | 166 | 0.06% | 72.9 hrs | Nominal |
| [kaggle-challenge-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/kaggle-challenge-card.component.ts) | Web Client (Angular & SSR) | 165 | 0.06% | 72.5 hrs | Nominal |
| [perma-flourishing-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/perma-flourishing-suite.component.ts) | Web Client (Angular & SSR) | 165 | 0.06% | 72.5 hrs | Nominal |
| [snomed-icd-crosswalk.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/snomed-icd-crosswalk.service.ts) | Web Client (Angular & SSR) | 165 | 0.06% | 72.5 hrs | Nominal |
| [socratic-comorbidity-radar.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-comorbidity-radar.service.ts) | Web Client (Angular & SSR) | 165 | 0.06% | 72.5 hrs | High |
| [delimiter-parser.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/delimiter-parser.ts) | Web Client (Angular & SSR) | 165 | 0.06% | 72.5 hrs | Nominal |
| [clinical-trials-matcher.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trials-matcher.service.ts) | Web Client (Angular & SSR) | 164 | 0.06% | 72.0 hrs | High |
| [differential-diagnosis-radar.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/differential-diagnosis-radar.service.ts) | Web Client (Angular & SSR) | 164 | 0.06% | 72.0 hrs | High |
| [box_breathing_wrapper.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/box_breathing_wrapper.dart) | Flutter Mobile Companion (Dart) | 164 | 0.06% | 72.0 hrs | Nominal |
| [presentation-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/presentation-modal.component.ts) | Web Client (Angular & SSR) | 163 | 0.06% | 71.6 hrs | High |
| [quantum-clinical-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/quantum-clinical-engine.service.ts) | Web Client (Angular & SSR) | 163 | 0.06% | 71.6 hrs | Nominal |
| [international-university-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-frame/international-university-hub.component.ts) | Web Client (Angular & SSR) | 161 | 0.06% | 70.7 hrs | High |
| [amazon-product-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/amazon-product-card.component.ts) | Web Client (Angular & SSR) | 161 | 0.06% | 70.7 hrs | Nominal |
| [vision-accessibility-assist.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vision-accessibility-assist.component.ts) | Web Client (Angular & SSR) | 161 | 0.06% | 70.7 hrs | High |
| [generate_google_admin_logo.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_google_admin_logo.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 161 | 0.06% | 70.7 hrs | Nominal |
| [citizen-science-walk-report.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/citizen-science-walk-report.component.ts) | Web Client (Angular & SSR) | 160 | 0.06% | 70.3 hrs | High |
| [federated-learning-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/federated-learning-hud.component.ts) | Web Client (Angular & SSR) | 160 | 0.06% | 70.3 hrs | High |
| [akovos-longevity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/akovos-longevity.service.ts) | Web Client (Angular & SSR) | 160 | 0.06% | 70.3 hrs | Nominal |
| [encrypted-vault.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/encrypted-vault.service.ts) | Web Client (Angular & SSR) | 160 | 0.06% | 70.3 hrs | High |
| [gamification_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/gamification_service.dart) | Flutter Mobile Companion (Dart) | 160 | 0.06% | 70.3 hrs | Nominal |
| [ambient-clinical-scribe.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ambient-clinical-scribe.component.ts) | Web Client (Angular & SSR) | 159 | 0.06% | 69.8 hrs | High |
| [practice-roi.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/practice-roi.service.ts) | Web Client (Angular & SSR) | 159 | 0.06% | 69.8 hrs | Nominal |
| [support-ticket-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/support-ticket-modal.component.ts) | Web Client (Angular & SSR) | 158 | 0.06% | 69.4 hrs | High |
| [theme-studio-drawer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/theme-studio-drawer.component.ts) | Web Client (Angular & SSR) | 158 | 0.06% | 69.4 hrs | High |
| [turing-suite.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/turing/turing-suite.component.spec.ts) | Web Client (Angular & SSR) | 158 | 0.06% | 69.4 hrs | Nominal |
| [citizen-science-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/citizen-science-telemetry.service.ts) | Web Client (Angular & SSR) | 158 | 0.06% | 69.4 hrs | Nominal |
| [clinical-mission-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-mission-hud.component.ts) | Web Client (Angular & SSR) | 157 | 0.06% | 69.0 hrs | High |
| [patient-vitals-chart.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-vitals-chart.component.ts) | Web Client (Angular & SSR) | 157 | 0.06% | 69.0 hrs | High |
| [voice-assistant.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/voice-assistant.component.spec.ts) | Web Client (Angular & SSR) | 157 | 0.06% | 69.0 hrs | Nominal |
| [index.d.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/lib/dataconnect/index.d.ts) | Web Client (Angular & SSR) | 157 | 0.06% | 69.0 hrs | Nominal |
| [rich_media_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/rich_media_service.dart) | Flutter Mobile Companion (Dart) | 157 | 0.06% | 69.0 hrs | Nominal |
| [test_jax_ml_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_jax_ml_engine.py) | Python FastAPI Sidecar & ML Engines | 157 | 0.06% | 69.0 hrs | Nominal |
| [dictation-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/dictation-modal.component.ts) | Web Client (Angular & SSR) | 156 | 0.06% | 68.5 hrs | High |
| [medicare-billing-best-practices.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/medicare-billing-best-practices.service.ts) | Web Client (Angular & SSR) | 156 | 0.06% | 68.5 hrs | Nominal |
| [estimate-effort-detailed.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/estimate-effort-detailed.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 156 | 0.06% | 68.5 hrs | High |
| [ai-confidence-calibration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai-confidence-calibration.service.ts) | Web Client (Angular & SSR) | 155 | 0.06% | 68.1 hrs | Nominal |
| [fhir-prior-auth.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir-prior-auth.service.ts) | Web Client (Angular & SSR) | 154 | 0.06% | 67.6 hrs | Nominal |
| [avs-visualizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-visualizer.component.ts) | AVS Therapy Companion (Angular) | 154 | 0.06% | 67.6 hrs | Nominal |
| [kaggle_push_dataset.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/kaggle_push_dataset.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 154 | 0.06% | 67.6 hrs | Nominal |
| [gull-squadron-showcase.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/gull-squadron-showcase.component.ts) | Web Client (Angular & SSR) | 153 | 0.06% | 67.2 hrs | Nominal |
| [helpful-lists.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/helpful-lists.service.ts) | Web Client (Angular & SSR) | 153 | 0.06% | 67.2 hrs | Nominal |
| [rx-guard-lens.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/rx-guard-lens.component.ts) | Web Client (Angular & SSR) | 152 | 0.06% | 66.8 hrs | High |
| [ybocs.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/ybocs.service.ts) | Web Client (Angular & SSR) | 152 | 0.06% | 66.8 hrs | High |
| [spatial-ambisonics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/spatial-ambisonics.service.ts) | AVS Therapy Companion (Angular) | 152 | 0.06% | 66.8 hrs | High |
| [phi_compliance_scanner.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/phi_compliance_scanner.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 152 | 0.06% | 66.8 hrs | Nominal |
| [green-room-lounge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/green-room-lounge.component.ts) | Web Client (Angular & SSR) | 151 | 0.06% | 66.3 hrs | High |
| [on-device-embedder.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/on-device-embedder.service.ts) | Web Client (Angular & SSR) | 151 | 0.06% | 66.3 hrs | Nominal |
| [populate-all-mock-reports.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/populate-all-mock-reports.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 150 | 0.06% | 65.9 hrs | Nominal |
| [plain-language-glossary.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/plain-language-glossary.service.ts) | Web Client (Angular & SSR) | 149 | 0.06% | 65.4 hrs | Nominal |
| [clinical_prompts.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/clinical_prompts.dart) | Flutter Mobile Companion (Dart) | 149 | 0.06% | 65.4 hrs | Nominal |
| [vertex-search.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vertex-search.component.ts) | Web Client (Angular & SSR) | 148 | 0.06% | 65.0 hrs | High |
| [webgpu-edge-ai.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-edge-ai.service.ts) | Web Client (Angular & SSR) | 147 | 0.06% | 64.6 hrs | Nominal |
| [federated_learning_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/federated_learning_provider.dart) | Flutter Mobile Companion (Dart) | 147 | 0.06% | 64.6 hrs | Nominal |
| [goal-planning-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/goal-planning-card.component.ts) | Web Client (Angular & SSR) | 146 | 0.06% | 64.1 hrs | High |
| [secure-splash.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/secure-splash.component.spec.ts) | Web Client (Angular & SSR) | 146 | 0.06% | 64.1 hrs | Nominal |
| [pocket-gull-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-card.component.ts) | Web Client (Angular & SSR) | 146 | 0.06% | 64.1 hrs | High |
| [research.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/research.routes.ts) | Web Client (Angular & SSR) | 146 | 0.06% | 64.1 hrs | Nominal |
| [differential-diagnosis-radar.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/differential-diagnosis-radar.component.ts) | Web Client (Angular & SSR) | 145 | 0.05% | 63.7 hrs | High |
| [actuarial-qaly-calculator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/actuarial-qaly-calculator.component.ts) | Web Client (Angular & SSR) | 144 | 0.05% | 63.3 hrs | High |
| [ambient_lighting_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/ambient_lighting_service.dart) | Flutter Mobile Companion (Dart) | 144 | 0.05% | 63.3 hrs | Nominal |
| [sleep-insomnia-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/sleep-insomnia-protocol.service.ts) | AVS Therapy Companion (Angular) | 144 | 0.05% | 63.3 hrs | High |
| [prepare_usability10_dataset.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/prepare_usability10_dataset.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 144 | 0.05% | 63.3 hrs | Nominal |
| [google-health-sync-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/google-health-sync-hud.component.ts) | Web Client (Angular & SSR) | 143 | 0.05% | 62.8 hrs | High |
| [rpm-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/rpm-dashboard.component.ts) | Web Client (Angular & SSR) | 143 | 0.05% | 62.8 hrs | High |
| [sentinel_types.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/sentinel_types.dart) | Flutter Mobile Companion (Dart) | 143 | 0.05% | 62.8 hrs | Nominal |
| [asymmetric_loss_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/asymmetric_loss_engine.py) | Python FastAPI Sidecar & ML Engines | 143 | 0.05% | 62.8 hrs | Nominal |
| [qeeg-entrainment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/qeeg-entrainment.service.ts) | AVS Therapy Companion (Angular) | 143 | 0.05% | 62.8 hrs | High |
| [nng-usability-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nng-usability-hud.component.ts) | Web Client (Angular & SSR) | 142 | 0.05% | 62.4 hrs | High |
| [clinical-moe-router.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-moe-router.service.ts) | Web Client (Angular & SSR) | 142 | 0.05% | 62.4 hrs | High |
| [spatial-lesion-markup.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/spatial-lesion-markup.service.spec.ts) | Web Client (Angular & SSR) | 142 | 0.05% | 62.4 hrs | Nominal |
| [verify-ai.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/verify-ai.service.ts) | Web Client (Angular & SSR) | 142 | 0.05% | 62.4 hrs | High |
| [clinical-trials-matcher.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trials-matcher.component.ts) | Web Client (Angular & SSR) | 141 | 0.05% | 61.9 hrs | High |
| [planetary-health-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/planetary-health-hud.component.ts) | Web Client (Angular & SSR) | 141 | 0.05% | 61.9 hrs | High |
| [graph_synergy_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/graph_synergy_engine.py) | Python FastAPI Sidecar & ML Engines | 141 | 0.05% | 61.9 hrs | Nominal |
| [tri-paradigm-swarm-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/tri-paradigm-swarm-card.component.ts) | Web Client (Angular & SSR) | 140 | 0.05% | 61.5 hrs | High |
| [clinical-ai-provider-registry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-ai-provider-registry.service.ts) | Web Client (Angular & SSR) | 140 | 0.05% | 61.5 hrs | High |
| [biometric-sensor-fusion.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/biometric-sensor-fusion.service.ts) | Web Client (Angular & SSR) | 140 | 0.05% | 61.5 hrs | High |
| [huggingface_model_hub_export.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/huggingface_model_hub_export.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 140 | 0.05% | 61.5 hrs | Nominal |
| [body-3d-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/body-3d-viewer.component.spec.ts) | Web Client (Angular & SSR) | 139 | 0.05% | 61.1 hrs | Nominal |
| [smart-health-pass-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/smart-health-pass-modal.component.ts) | Web Client (Angular & SSR) | 139 | 0.05% | 61.1 hrs | High |
| [vitals-quick-dial-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vitals-quick-dial-hud.component.ts) | Web Client (Angular & SSR) | 139 | 0.05% | 61.1 hrs | High |
| [athletic-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/athletic-protocol.service.ts) | Web Client (Angular & SSR) | 139 | 0.05% | 61.1 hrs | Nominal |
| [medical_chart_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/medical_chart_widget.dart) | Flutter Mobile Companion (Dart) | 139 | 0.05% | 61.1 hrs | Nominal |
| [train_contest_model.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/train_contest_model.py) | Python FastAPI Sidecar & ML Engines | 139 | 0.05% | 61.1 hrs | Nominal |
| [athletic-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/athletic-protocol.service.ts) | AVS Therapy Companion (Angular) | 139 | 0.05% | 61.1 hrs | Nominal |
| [onnx-webgpu-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/onnx-webgpu-engine.service.ts) | Web Client (Angular & SSR) | 138 | 0.05% | 60.6 hrs | Nominal |
| [phi_compliance_scanner.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/phi_compliance_scanner.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 138 | 0.05% | 60.6 hrs | Nominal |
| [cgm-time-in-range.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/cgm-time-in-range.component.ts) | Web Client (Angular & SSR) | 137 | 0.05% | 60.2 hrs | High |
| [mobile-menu-qr-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/mobile-menu-qr-modal.component.ts) | Web Client (Angular & SSR) | 137 | 0.05% | 60.2 hrs | High |
| [pathways-moe-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pathways-moe-badge.component.ts) | Web Client (Angular & SSR) | 136 | 0.05% | 59.7 hrs | High |
| [movement-healing-quest.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/movement-healing-quest.service.ts) | Web Client (Angular & SSR) | 136 | 0.05% | 59.7 hrs | Nominal |
| [generate_origami_crane_logo.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_origami_crane_logo.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 136 | 0.05% | 59.7 hrs | Nominal |
| [coppa-privacy-shield.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/coppa-privacy-shield.service.ts) | Web Client (Angular & SSR) | 135 | 0.05% | 59.3 hrs | Nominal |
| [eyes-free-camera-scribe.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/eyes-free-camera-scribe.service.ts) | Web Client (Angular & SSR) | 135 | 0.05% | 59.3 hrs | Nominal |
| [impact-program-agreement.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/impact-program-agreement.service.ts) | Web Client (Angular & SSR) | 135 | 0.05% | 59.3 hrs | Nominal |
| [falsification_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/falsification_engine.py) | Python FastAPI Sidecar & ML Engines | 135 | 0.05% | 59.3 hrs | Nominal |
| [fhir.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/models/fhir.py) | Python FastAPI Sidecar & ML Engines | 135 | 0.05% | 59.3 hrs | Nominal |
| [survival_analysis_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/survival_analysis_engine.py) | Python FastAPI Sidecar & ML Engines | 135 | 0.05% | 59.3 hrs | Nominal |
| [n-of-1-designer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/n-of-1-designer.component.ts) | Web Client (Angular & SSR) | 134 | 0.05% | 58.9 hrs | High |
| [soap-note-generator.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/soap-note-generator.component.ts) | Web Client (Angular & SSR) | 134 | 0.05% | 58.9 hrs | High |
| [firestore-sync.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/firestore-sync.service.ts) | Web Client (Angular & SSR) | 134 | 0.05% | 58.9 hrs | High |
| [slack-integration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/slack-integration.service.ts) | Web Client (Angular & SSR) | 134 | 0.05% | 58.9 hrs | Nominal |
| [rppg-camera-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/rppg-camera-hud.component.ts) | AVS Therapy Companion (Angular) | 134 | 0.05% | 58.9 hrs | High |
| [generate-cocomo2-report.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate-cocomo2-report.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 134 | 0.05% | 58.9 hrs | Nominal |
| [ai-confidence-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ai-confidence-hud.component.ts) | Web Client (Angular & SSR) | 133 | 0.05% | 58.4 hrs | High |
| [biomarker-velocity-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biomarker-velocity-card.component.ts) | Web Client (Angular & SSR) | 133 | 0.05% | 58.4 hrs | High |
| [qeeg-entrainment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/neuro-somatic/qeeg-entrainment.service.ts) | Web Client (Angular & SSR) | 133 | 0.05% | 58.4 hrs | High |
| [test_lens_engines.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_lens_engines.py) | Python FastAPI Sidecar & ML Engines | 133 | 0.05% | 58.4 hrs | Nominal |
| [info-cern-1991-theme-showcase.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/info-cern-1991-theme-showcase.component.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | Nominal |
| [p010.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p010.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | Nominal |
| [adk-live.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.spec.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | Nominal |
| [consent-lineage.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/consent-lineage.service.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | High |
| [vibroacoustic-haptic.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/vibroacoustic-haptic.service.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | High |
| [visual-acuity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/visual-acuity.service.ts) | Web Client (Angular & SSR) | 132 | 0.05% | 58.0 hrs | Nominal |
| [benchmark_med_skeptic_eval.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/benchmark_med_skeptic_eval.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 132 | 0.05% | 58.0 hrs | Nominal |
| [assessments-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/assessments-lens-tab.component.ts) | Web Client (Angular & SSR) | 131 | 0.05% | 57.5 hrs | Nominal |
| [dual-pane-consultation.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/dual-pane-consultation.component.ts) | Web Client (Angular & SSR) | 131 | 0.05% | 57.5 hrs | High |
| [medical-device-affiliate.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/medical-device-affiliate.service.ts) | Web Client (Angular & SSR) | 131 | 0.05% | 57.5 hrs | Nominal |
| [saif-security-posture-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/saif-security-posture-card.component.ts) | Web Client (Angular & SSR) | 130 | 0.05% | 57.1 hrs | High |
| [data-science-citation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/data-science-citation.service.ts) | Web Client (Angular & SSR) | 130 | 0.05% | 57.1 hrs | Nominal |
| [hsa-incentive-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hsa-incentive-bridge.service.ts) | Web Client (Angular & SSR) | 130 | 0.05% | 57.1 hrs | High |
| [webgpu-bio-signal.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-bio-signal.service.ts) | Web Client (Angular & SSR) | 130 | 0.05% | 57.1 hrs | Nominal |
| [jax_mri_data_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/jax_mri_data_engine.py) | Python FastAPI Sidecar & ML Engines | 130 | 0.05% | 57.1 hrs | Nominal |
| [avs-session-scribe.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/avs-session-scribe.service.ts) | AVS Therapy Companion (Angular) | 130 | 0.05% | 57.1 hrs | High |
| [patient-story-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/patient-story-modal.component.ts) | Web Client (Angular & SSR) | 129 | 0.05% | 56.7 hrs | High |
| [biometric_import_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/biometric_import_service.dart) | Flutter Mobile Companion (Dart) | 129 | 0.05% | 56.7 hrs | Nominal |
| [hardware_telemetry_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/hardware_telemetry_service.dart) | Flutter Mobile Companion (Dart) | 129 | 0.05% | 56.7 hrs | Nominal |
| [offline-edge-controls.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/offline-edge-controls.component.ts) | Web Client (Angular & SSR) | 128 | 0.05% | 56.2 hrs | High |
| [slack.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/slack.routes.ts) | Web Client (Angular & SSR) | 128 | 0.05% | 56.2 hrs | Nominal |
| [google-health-api.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/google-health-api.service.ts) | Web Client (Angular & SSR) | 128 | 0.05% | 56.2 hrs | High |
| [export_onnx.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/export/export_onnx.py) | Python FastAPI Sidecar & ML Engines | 128 | 0.05% | 56.2 hrs | Nominal |
| [dead_code_audit.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/dead_code_audit.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 128 | 0.05% | 56.2 hrs | Nominal |
| [cdisc-rwe-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/cdisc-rwe-card.component.ts) | Web Client (Angular & SSR) | 127 | 0.05% | 55.8 hrs | High |
| [slack-integration-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/slack-integration-card.component.ts) | Web Client (Angular & SSR) | 127 | 0.05% | 55.8 hrs | High |
| [socratic-challenge-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/socratic-challenge-card.component.ts) | Web Client (Angular & SSR) | 127 | 0.05% | 55.8 hrs | Nominal |
| [secure-storage.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/secure-storage.service.ts) | Web Client (Angular & SSR) | 127 | 0.05% | 55.8 hrs | High |
| [zen-sanctuary.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/zen-sanctuary.service.ts) | Web Client (Angular & SSR) | 127 | 0.05% | 55.8 hrs | Nominal |
| [clinical-support-agent.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-support-agent.service.ts) | Web Client (Angular & SSR) | 126 | 0.05% | 55.3 hrs | Nominal |
| [irmaa-decision.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/irmaa-decision.service.ts) | Web Client (Angular & SSR) | 126 | 0.05% | 55.3 hrs | Nominal |
| [peer-network.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/peer-network.service.ts) | Web Client (Angular & SSR) | 126 | 0.05% | 55.3 hrs | Nominal |
| [waveform_1d_cnn.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/waveform_1d_cnn.py) | Python FastAPI Sidecar & ML Engines | 126 | 0.05% | 55.3 hrs | Nominal |
| [clinical-platform-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/clinical-platform-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 126 | 0.05% | 55.3 hrs | Nominal |
| [generate_cyclonedx_sbom.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_cyclonedx_sbom.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 126 | 0.05% | 55.3 hrs | Nominal |
| [research-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-tab.component.ts) | Web Client (Angular & SSR) | 125 | 0.05% | 54.9 hrs | Nominal |
| [gaap-tribal-stewardship-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/gaap-tribal-stewardship-card.component.ts) | Web Client (Angular & SSR) | 125 | 0.05% | 54.9 hrs | High |
| [p009.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p009.ts) | Web Client (Angular & SSR) | 125 | 0.05% | 54.9 hrs | Nominal |
| [patients.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/patients.routes.ts) | Web Client (Angular & SSR) | 125 | 0.05% | 54.9 hrs | Nominal |
| [estimate-effort.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/estimate-effort.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 125 | 0.05% | 54.9 hrs | Nominal |
| [institutional-compliance-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/institutional-compliance-modal.component.ts) | Web Client (Angular & SSR) | 124 | 0.05% | 54.5 hrs | High |
| [austere-research.model.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/models/austere-research.model.ts) | Web Client (Angular & SSR) | 123 | 0.05% | 54.0 hrs | Nominal |
| [audio-respiratory-visualizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/audio-respiratory-visualizer.component.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | High |
| [local-gemma-studio.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/local-gemma-studio.component.spec.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | Nominal |
| [sheet-music-notation.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sheet-music-notation.component.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | Nominal |
| [tcm-pulse-tongue-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/tcm-pulse-tongue-matrix.component.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | High |
| [sentinel-surveillance.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/sentinel-surveillance.service.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | High |
| [soap-note-generator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/soap-note-generator.service.ts) | Web Client (Angular & SSR) | 122 | 0.05% | 53.6 hrs | High |
| [social_gravitation_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/social_gravitation_service.dart) | Flutter Mobile Companion (Dart) | 122 | 0.05% | 53.6 hrs | Nominal |
| [qeeg-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/qeeg-hud.component.ts) | AVS Therapy Companion (Angular) | 122 | 0.05% | 53.6 hrs | High |
| [gen-mock.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gen-mock.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 122 | 0.05% | 53.6 hrs | Nominal |
| [update-porkbun-dns.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/update-porkbun-dns.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 122 | 0.05% | 53.6 hrs | Nominal |
| [avian-sea-shanty-deck.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/avian-sea-shanty-deck.component.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | High |
| [p_frida_kahlo.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_frida_kahlo.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | Nominal |
| [usage-meter.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/usage-meter.service.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | Nominal |
| [python-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.spec.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | Nominal |
| [tri-paradigm-swarm.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/tri-paradigm-swarm.service.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | High |
| [webauthn-passkey.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webauthn-passkey.service.ts) | Web Client (Angular & SSR) | 121 | 0.05% | 53.2 hrs | Nominal |
| [documentation_screen.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/screens/documentation_screen.dart) | Flutter Mobile Companion (Dart) | 121 | 0.05% | 53.2 hrs | Nominal |
| [walkthrough_tour_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/walkthrough_tour_service.dart) | Flutter Mobile Companion (Dart) | 121 | 0.05% | 53.2 hrs | Nominal |
| [human-dignity-pact.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/human-dignity-pact.component.ts) | Web Client (Angular & SSR) | 120 | 0.05% | 52.7 hrs | High |
| [ocular-vocal-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ocular-vocal-telemetry.service.ts) | Web Client (Angular & SSR) | 120 | 0.05% | 52.7 hrs | High |
| [knowledge_synthesis_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/knowledge_synthesis_service.dart) | Flutter Mobile Companion (Dart) | 120 | 0.05% | 52.7 hrs | Nominal |
| [patient_history_timeline_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/patient_history_timeline_widget.dart) | Flutter Mobile Companion (Dart) | 120 | 0.05% | 52.7 hrs | Nominal |
| [lego_foundation_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/lego_foundation_engine.py) | Python FastAPI Sidecar & ML Engines | 120 | 0.05% | 52.7 hrs | Nominal |
| [grounded-evidence-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/grounded-evidence-badge.component.ts) | Web Client (Angular & SSR) | 119 | 0.05% | 52.3 hrs | High |
| [pocketgull-ai-social-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-ai-social-card.component.ts) | Web Client (Angular & SSR) | 119 | 0.05% | 52.3 hrs | Nominal |
| [model-armor.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/model-armor.service.ts) | Web Client (Angular & SSR) | 119 | 0.05% | 52.3 hrs | Nominal |
| [community-testimonials.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/community-testimonials.service.ts) | Web Client (Angular & SSR) | 119 | 0.05% | 52.3 hrs | Nominal |
| [test_innovations_suite.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_innovations_suite.py) | Python FastAPI Sidecar & ML Engines | 119 | 0.05% | 52.3 hrs | Nominal |
| [test_lemonade_ai.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/test_lemonade_ai.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 119 | 0.05% | 52.3 hrs | Nominal |
| [joy-playful-flourishing.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/joy-playful-flourishing.service.ts) | Web Client (Angular & SSR) | 118 | 0.04% | 51.8 hrs | Nominal |
| [offline-edge-ai.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/offline-edge-ai.service.ts) | Web Client (Angular & SSR) | 118 | 0.04% | 51.8 hrs | High |
| [dictation_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/dictation_service.dart) | Flutter Mobile Companion (Dart) | 118 | 0.04% | 51.8 hrs | Nominal |
| [generate_triptych_specimen.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_triptych_specimen.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 118 | 0.04% | 51.8 hrs | Nominal |
| [radial-pie-menu.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/radial-pie-menu.component.ts) | Web Client (Angular & SSR) | 117 | 0.04% | 51.4 hrs | Nominal |
| [green-computing-sustainability.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/green-computing-sustainability.service.ts) | Web Client (Angular & SSR) | 117 | 0.04% | 51.4 hrs | Nominal |
| [clinical_trend_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/clinical_trend_widget.dart) | Flutter Mobile Companion (Dart) | 117 | 0.04% | 51.4 hrs | Nominal |
| [rpm-audit.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rpm-audit.service.ts) | Web Client (Angular & SSR) | 116 | 0.04% | 51.0 hrs | High |
| [uncertainty_calibrator.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/uncertainty_calibrator.py) | Python FastAPI Sidecar & ML Engines | 116 | 0.04% | 51.0 hrs | Nominal |
| [contactless-rppg.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/contactless-rppg.service.ts) | AVS Therapy Companion (Angular) | 116 | 0.04% | 51.0 hrs | High |
| [adobe-mcp-server.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/adobe-mcp-server.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 116 | 0.04% | 51.0 hrs | Nominal |
| [generate-parity-matrix.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate-parity-matrix.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 116 | 0.04% | 51.0 hrs | Nominal |
| [pharmacogenomics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/pharmacogenomics.service.ts) | Web Client (Angular & SSR) | 115 | 0.04% | 50.5 hrs | High |
| [wacom-crypto-ink.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/wacom-crypto-ink.service.spec.ts) | Web Client (Angular & SSR) | 115 | 0.04% | 50.5 hrs | Nominal |
| [analysis_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/analysis_provider.dart) | Flutter Mobile Companion (Dart) | 115 | 0.04% | 50.5 hrs | Nominal |
| [download-fonts.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/download-fonts.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 115 | 0.04% | 50.5 hrs | Nominal |
| [api-keys.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/api-keys.routes.ts) | Web Client (Angular & SSR) | 114 | 0.04% | 50.1 hrs | Nominal |
| [avs-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/avs-engine.service.spec.ts) | Web Client (Angular & SSR) | 114 | 0.04% | 50.1 hrs | Nominal |
| [clinical-act-lens-mapper.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-act-lens-mapper.service.ts) | Web Client (Angular & SSR) | 114 | 0.04% | 50.1 hrs | Nominal |
| [orcid.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/orcid.service.ts) | Web Client (Angular & SSR) | 114 | 0.04% | 50.1 hrs | High |
| [sleep-insomnia-panel.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/sleep-insomnia-panel.component.ts) | AVS Therapy Companion (Angular) | 114 | 0.04% | 50.1 hrs | High |
| [fhir-callback.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/fhir-callback.component.ts) | Web Client (Angular & SSR) | 113 | 0.04% | 49.6 hrs | High |
| [discord-activity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/discord-activity.service.ts) | Web Client (Angular & SSR) | 113 | 0.04% | 49.6 hrs | Nominal |
| [circadian_types.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/circadian_types.dart) | Flutter Mobile Companion (Dart) | 113 | 0.04% | 49.6 hrs | Nominal |
| [origami_seagull.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/origami_seagull.dart) | Flutter Mobile Companion (Dart) | 113 | 0.04% | 49.6 hrs | Nominal |
| [patient_dropdown_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/patient_dropdown_widget.dart) | Flutter Mobile Companion (Dart) | 113 | 0.04% | 49.6 hrs | Nominal |
| [holistic_risk_service.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/holistic_risk_service.py) | Python FastAPI Sidecar & ML Engines | 113 | 0.04% | 49.6 hrs | Nominal |
| [impact-channels-linking-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/impact-channels-linking-card.component.ts) | Web Client (Angular & SSR) | 112 | 0.04% | 49.2 hrs | High |
| [p008.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p008.ts) | Web Client (Angular & SSR) | 112 | 0.04% | 49.2 hrs | Nominal |
| [fhir-integration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-integration.service.ts) | Web Client (Angular & SSR) | 112 | 0.04% | 49.2 hrs | High |
| [hardware-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/hardware-telemetry.service.ts) | Web Client (Angular & SSR) | 112 | 0.04% | 49.2 hrs | High |
| [provider-treatment-network.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/provider-treatment-network.service.ts) | Web Client (Angular & SSR) | 112 | 0.04% | 49.2 hrs | Nominal |
| [fuzz_targets.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/fuzz_targets.py) | Python FastAPI Sidecar & ML Engines | 112 | 0.04% | 49.2 hrs | Nominal |
| [triage.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/triage.ts) | Python FastAPI Sidecar & ML Engines | 112 | 0.04% | 49.2 hrs | Nominal |
| [bigquery_dpo_synthesizer.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/bigquery_dpo_synthesizer.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 112 | 0.04% | 49.2 hrs | Nominal |
| [run-cocomo-ii.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-cocomo-ii.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 112 | 0.04% | 49.2 hrs | Nominal |
| [clinical-biochemistry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-biochemistry.service.ts) | Web Client (Angular & SSR) | 111 | 0.04% | 48.8 hrs | Nominal |
| [interactive-onboarding-tour.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/interactive-onboarding-tour.service.ts) | Web Client (Angular & SSR) | 111 | 0.04% | 48.8 hrs | Nominal |
| [draggable_window.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/draggable_window.dart) | Flutter Mobile Companion (Dart) | 111 | 0.04% | 48.8 hrs | Nominal |
| [patient_scans_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/patient_scans_widget.dart) | Flutter Mobile Companion (Dart) | 111 | 0.04% | 48.8 hrs | Nominal |
| [setup-gcp-healthcare-baa.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/setup-gcp-healthcare-baa.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 111 | 0.04% | 48.8 hrs | Nominal |
| [ambient-living-space-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ambient-living-space-dashboard.component.ts) | Web Client (Angular & SSR) | 110 | 0.04% | 48.3 hrs | High |
| [hsa.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/hsa.routes.ts) | Web Client (Angular & SSR) | 110 | 0.04% | 48.3 hrs | Nominal |
| [teledentistry.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/teledentistry.service.ts) | Web Client (Angular & SSR) | 110 | 0.04% | 48.3 hrs | Nominal |
| [clinical-assessments.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/clinical-assessments.service.spec.ts) | Web Client (Angular & SSR) | 109 | 0.04% | 47.9 hrs | Nominal |
| [gemini-context-cache.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/gemini-context-cache.service.ts) | Web Client (Angular & SSR) | 109 | 0.04% | 47.9 hrs | Nominal |
| [research_consent_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/research_consent_provider.dart) | Flutter Mobile Companion (Dart) | 109 | 0.04% | 47.9 hrs | Nominal |
| [deep-clinical-fuzzer.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/fuzzing/deep-clinical-fuzzer.spec.ts) | Automated Test Suites (Playwright & Vitest) | 109 | 0.04% | 47.9 hrs | Nominal |
| [seed_sample_articles.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/seed_sample_articles.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 109 | 0.04% | 47.9 hrs | Nominal |
| [compassionate-checkin-guardian.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/compassionate-checkin-guardian.component.ts) | Web Client (Angular & SSR) | 108 | 0.04% | 47.4 hrs | High |
| [gaap-tribal-stewardship.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/gaap-tribal-stewardship.service.ts) | Web Client (Angular & SSR) | 108 | 0.04% | 47.4 hrs | Nominal |
| [osce-trainer.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/osce-trainer.service.ts) | Web Client (Angular & SSR) | 108 | 0.04% | 47.4 hrs | Nominal |
| [consent-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/consent-modal.component.ts) | Web Client (Angular & SSR) | 107 | 0.04% | 47.0 hrs | High |
| [provider-treatment-network.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/provider-treatment-network.component.ts) | Web Client (Angular & SSR) | 107 | 0.04% | 47.0 hrs | High |
| [test_expanded_ml_engines.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_expanded_ml_engines.py) | Python FastAPI Sidecar & ML Engines | 107 | 0.04% | 47.0 hrs | Nominal |
| [deploy-production.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/deploy-production.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 106 | 0.04% | 46.6 hrs | Nominal |
| [living-obituary-memorial.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/living-obituary-memorial.component.ts) | Web Client (Angular & SSR) | 105 | 0.04% | 46.1 hrs | High |
| [p_edwin_smith_3.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_edwin_smith_3.ts) | Web Client (Angular & SSR) | 105 | 0.04% | 46.1 hrs | Nominal |
| [adaptive-intake.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/adaptive-intake.service.spec.ts) | Web Client (Angular & SSR) | 105 | 0.04% | 46.1 hrs | High |
| [veo.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/veo.service.ts) | Web Client (Angular & SSR) | 105 | 0.04% | 46.1 hrs | Nominal |
| [security-sanitizer.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/security-sanitizer.spec.ts) | Web Client (Angular & SSR) | 105 | 0.04% | 46.1 hrs | Nominal |
| [biometric-sensor-fusion-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biometric-sensor-fusion-card.component.ts) | Web Client (Angular & SSR) | 104 | 0.04% | 45.7 hrs | High |
| [travel-sports-ticketing-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/travel-sports-ticketing-hub.component.ts) | Web Client (Angular & SSR) | 104 | 0.04% | 45.7 hrs | High |
| [webllm-health.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webllm-health.service.ts) | Web Client (Angular & SSR) | 104 | 0.04% | 45.7 hrs | Nominal |
| [insight_card_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/synthesis/insight_card_widget.dart) | Flutter Mobile Companion (Dart) | 104 | 0.04% | 45.7 hrs | Nominal |
| [daily-clamav-scan.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/daily-clamav-scan.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 104 | 0.04% | 45.7 hrs | Nominal |
| [pharmacogenomics-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/pharmacogenomics-card.component.ts) | Web Client (Angular & SSR) | 103 | 0.04% | 45.2 hrs | High |
| [dpop-auth.interceptor.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/interceptors/dpop-auth.interceptor.ts) | Web Client (Angular & SSR) | 103 | 0.04% | 45.2 hrs | Nominal |
| [p003.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p003.ts) | Web Client (Angular & SSR) | 103 | 0.04% | 45.2 hrs | Nominal |
| [community-eco-localization.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/community-eco-localization.service.ts) | Web Client (Angular & SSR) | 103 | 0.04% | 45.2 hrs | Nominal |
| [walmart-affiliate.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/walmart-affiliate.service.ts) | Web Client (Angular & SSR) | 103 | 0.04% | 45.2 hrs | Nominal |
| [p004.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p004.ts) | Web Client (Angular & SSR) | 102 | 0.04% | 44.8 hrs | Nominal |
| [p005.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p005.ts) | Web Client (Angular & SSR) | 102 | 0.04% | 44.8 hrs | Nominal |
| [bigquery-cohort-exporter.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bigquery-cohort-exporter.service.ts) | Web Client (Angular & SSR) | 102 | 0.04% | 44.8 hrs | Nominal |
| [bio-haptic-feedback.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/bio-haptic-feedback.service.ts) | Web Client (Angular & SSR) | 102 | 0.04% | 44.8 hrs | Nominal |
| [hyperscaler-deployment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hyperscaler-deployment.service.ts) | Web Client (Angular & SSR) | 102 | 0.04% | 44.8 hrs | Nominal |
| [typology-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/typology-badge.component.ts) | Web Client (Angular & SSR) | 101 | 0.04% | 44.4 hrs | Nominal |
| [p_charles_darwin.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_charles_darwin.ts) | Web Client (Angular & SSR) | 101 | 0.04% | 44.4 hrs | Nominal |
| [p_marie_curie.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_marie_curie.ts) | Web Client (Angular & SSR) | 101 | 0.04% | 44.4 hrs | Nominal |
| [shield-gemma-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/shield-gemma-guard.service.ts) | Web Client (Angular & SSR) | 101 | 0.04% | 44.4 hrs | Nominal |
| [biometric-import.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/biometric-import.service.ts) | Web Client (Angular & SSR) | 101 | 0.04% | 44.4 hrs | High |
| [verify_ai_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/verify_ai_service.dart) | Flutter Mobile Companion (Dart) | 101 | 0.04% | 44.4 hrs | Nominal |
| [test_falsification_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_falsification_engine.py) | Python FastAPI Sidecar & ML Engines | 101 | 0.04% | 44.4 hrs | Nominal |
| [clinical-trend.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trend.component.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [hall-chronotherapy-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nobel/hall-chronotherapy-matrix.component.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [paabo-paleo-genomic.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nobel/paabo-paleo-genomic.component.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [pocketgull-icon.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-icon.component.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [p007.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p007.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [canary.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/canary.routes.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [vertex-agent-builder.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/vertex-agent-builder.service.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | High |
| [alpha-stem.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/alpha-stem.service.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | Nominal |
| [fhir-r7-horizon.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-r7-horizon.service.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | High |
| [travel-sports-ticketing.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/travel-sports-ticketing.service.ts) | Web Client (Angular & SSR) | 100 | 0.04% | 43.9 hrs | High |
| [benchmark_rsna_thresholds.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/benchmark_rsna_thresholds.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 100 | 0.04% | 43.9 hrs | Nominal |
| [lidar-scan-upload-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/lidar-scan-upload-modal.component.ts) | Web Client (Angular & SSR) | 99 | 0.04% | 43.5 hrs | High |
| [tier-enforcement.middleware.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/middleware/tier-enforcement.middleware.ts) | Web Client (Angular & SSR) | 99 | 0.04% | 43.5 hrs | Nominal |
| [clinical-trial-matcher.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trial-matcher.service.ts) | Web Client (Angular & SSR) | 99 | 0.04% | 43.5 hrs | Nominal |
| [evidence_attestation_badge_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/evidence_attestation_badge_widget.dart) | Flutter Mobile Companion (Dart) | 99 | 0.04% | 43.5 hrs | Low |
| [passkey-step-up-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/passkey-step-up-modal.component.ts) | Web Client (Angular & SSR) | 98 | 0.04% | 43.0 hrs | High |
| [p006.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p006.ts) | Web Client (Angular & SSR) | 98 | 0.04% | 43.0 hrs | Low |
| [lateral-thinking-health.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/lateral-thinking-health.service.ts) | Web Client (Angular & SSR) | 98 | 0.04% | 43.0 hrs | Nominal |
| [life-journey-navigator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/life-journey-navigator.service.ts) | Web Client (Angular & SSR) | 98 | 0.04% | 43.0 hrs | Nominal |
| [raycast-selection.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/raycast-selection.service.ts) | Web Client (Angular & SSR) | 98 | 0.04% | 43.0 hrs | High |
| [collaboration_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/collaboration_service.dart) | Flutter Mobile Companion (Dart) | 98 | 0.04% | 43.0 hrs | Nominal |
| [pet_auditory_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/pet_auditory_service.dart) | Flutter Mobile Companion (Dart) | 98 | 0.04% | 43.0 hrs | Nominal |
| [storage_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/storage_service.dart) | Flutter Mobile Companion (Dart) | 98 | 0.04% | 43.0 hrs | Nominal |
| [api-pricing.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/api-pricing.component.spec.ts) | Web Client (Angular & SSR) | 97 | 0.04% | 42.6 hrs | Low |
| [de-identification-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/privacy/de-identification-engine.service.ts) | Web Client (Angular & SSR) | 97 | 0.04% | 42.6 hrs | Nominal |
| [universal-living-will.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/universal-living-will.service.ts) | Web Client (Angular & SSR) | 97 | 0.04% | 42.6 hrs | Nominal |
| [webgpu-spatial-digital-twin.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-spatial-digital-twin.service.ts) | Web Client (Angular & SSR) | 97 | 0.04% | 42.6 hrs | Nominal |
| [clinical_publishing_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/clinical_publishing_engine.py) | Python FastAPI Sidecar & ML Engines | 97 | 0.04% | 42.6 hrs | Low |
| [tcm_meridian_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/tcm_meridian_engine.py) | Python FastAPI Sidecar & ML Engines | 97 | 0.04% | 42.6 hrs | Low |
| [role-demo-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/role-demo-modal.component.ts) | Web Client (Angular & SSR) | 96 | 0.04% | 42.2 hrs | High |
| [unified-paradigm-synthesizer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/unified-paradigm-synthesizer.component.ts) | Web Client (Angular & SSR) | 96 | 0.04% | 42.2 hrs | High |
| [visit-review.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/visit-review.component.ts) | Web Client (Angular & SSR) | 96 | 0.04% | 42.2 hrs | High |
| [csv-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/csv-export-strategy.service.ts) | Web Client (Angular & SSR) | 96 | 0.04% | 42.2 hrs | Nominal |
| [hl7v2-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/hl7v2-export-strategy.service.ts) | Web Client (Angular & SSR) | 96 | 0.04% | 42.2 hrs | Nominal |
| [metric_card.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/ui/metric_card.dart) | Flutter Mobile Companion (Dart) | 96 | 0.04% | 42.2 hrs | Low |
| [orcid.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/orcid.ts) | Python FastAPI Sidecar & ML Engines | 96 | 0.04% | 42.2 hrs | Low |
| [webllm-health-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/webllm-health-card.component.ts) | Web Client (Angular & SSR) | 95 | 0.04% | 41.7 hrs | High |
| [interactions-reasoning-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/interactions-reasoning-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 95 | 0.04% | 41.7 hrs | Nominal |
| [build_dinov2_submission_notebook.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/build_dinov2_submission_notebook.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 95 | 0.04% | 41.7 hrs | Low |
| [autonomic-coherence-bridge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/autonomic-coherence-bridge.component.ts) | Web Client (Angular & SSR) | 94 | 0.04% | 41.3 hrs | High |
| [collaboration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/collaboration.service.ts) | Web Client (Angular & SSR) | 94 | 0.04% | 41.3 hrs | High |
| [ga4gh-phenopacket.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ga4gh-phenopacket.service.spec.ts) | Web Client (Angular & SSR) | 94 | 0.04% | 41.3 hrs | Nominal |
| [hipaa-pdf-export.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hipaa-pdf-export.service.ts) | Web Client (Angular & SSR) | 94 | 0.04% | 41.3 hrs | High |
| [causal_treatment_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/causal_treatment_engine.py) | Python FastAPI Sidecar & ML Engines | 94 | 0.04% | 41.3 hrs | Low |
| [clinician-console.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/clinician-console.component.ts) | AVS Therapy Companion (Angular) | 94 | 0.04% | 41.3 hrs | Nominal |
| [avian-sea-shanty.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/avian-sea-shanty.service.ts) | Web Client (Angular & SSR) | 93 | 0.04% | 40.9 hrs | Nominal |
| [social_vector.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/social_vector.dart) | Flutter Mobile Companion (Dart) | 93 | 0.04% | 40.9 hrs | Low |
| [pocket_gull_badge_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/pocket_gull_badge_widget.dart) | Flutter Mobile Companion (Dart) | 93 | 0.04% | 40.9 hrs | Low |
| [defensive-guardrails.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/defensive-guardrails.service.ts) | Web Client (Angular & SSR) | 92 | 0.03% | 40.4 hrs | Nominal |
| [generate_parity.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/generate_parity.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 92 | 0.03% | 40.4 hrs | Low |
| [kaggle_push_model.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/kaggle_push_model.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 92 | 0.03% | 40.4 hrs | Low |
| [hyperscaler-marketplace-portal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hyperscaler-marketplace-portal.component.ts) | Web Client (Angular & SSR) | 91 | 0.03% | 40.0 hrs | High |
| [joy-playful-flourishing-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/joy-playful-flourishing-card.component.ts) | Web Client (Angular & SSR) | 91 | 0.03% | 40.0 hrs | High |
| [index.cjs.js](file:///C:/Users/philg/Pocketgull/pocketgull/src/lib/dataconnect/index.cjs.js) | Web Client (Angular & SSR) | 91 | 0.03% | 40.0 hrs | Low |
| [p_default_patient.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_default_patient.ts) | Web Client (Angular & SSR) | 91 | 0.03% | 40.0 hrs | Low |
| [allopathic_integrative_bridge_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/allopathic_integrative_bridge_engine.py) | Python FastAPI Sidecar & ML Engines | 91 | 0.03% | 40.0 hrs | Low |
| [circadian-dashboard.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/circadian-dashboard.component.ts) | AVS Therapy Companion (Angular) | 91 | 0.03% | 40.0 hrs | Nominal |
| [patient-scans.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/patient-scans.component.ts) | Web Client (Angular & SSR) | 90 | 0.03% | 39.5 hrs | High |
| [brand-package-generator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/brand-package-generator.service.spec.ts) | Web Client (Angular & SSR) | 90 | 0.03% | 39.5 hrs | Nominal |
| [infinite-clinical-synthesis.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/infinite-clinical-synthesis.service.ts) | Web Client (Angular & SSR) | 90 | 0.03% | 39.5 hrs | High |
| [generate_docs.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/generate_docs.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 90 | 0.03% | 39.5 hrs | High |
| [porkbun_tool.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/porkbun_tool.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 90 | 0.03% | 39.5 hrs | Low |
| [biomedical-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/biomedical-suite.component.ts) | Web Client (Angular & SSR) | 89 | 0.03% | 39.1 hrs | High |
| [global-health-initiatives.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/global-health-initiatives.service.spec.ts) | Web Client (Angular & SSR) | 89 | 0.03% | 39.1 hrs | Nominal |
| [delimiter-parser.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/delimiter-parser.spec.ts) | Web Client (Angular & SSR) | 89 | 0.03% | 39.1 hrs | Low |
| [piezo-mechanoreceptor-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lasker/piezo-mechanoreceptor-matrix.component.ts) | Web Client (Angular & SSR) | 88 | 0.03% | 38.7 hrs | Nominal |
| [ohsumi-autophagy-chronometer.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nobel/ohsumi-autophagy-chronometer.component.ts) | Web Client (Angular & SSR) | 88 | 0.03% | 38.7 hrs | Nominal |
| [dpop-validator.middleware.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/middleware/dpop-validator.middleware.ts) | Web Client (Angular & SSR) | 88 | 0.03% | 38.7 hrs | Low |
| [skeptical-epistemology.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/skeptical-epistemology.service.spec.ts) | Web Client (Angular & SSR) | 88 | 0.03% | 38.7 hrs | Nominal |
| [socratic-jargon-dictionary.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-jargon-dictionary.service.ts) | Web Client (Angular & SSR) | 88 | 0.03% | 38.7 hrs | Nominal |
| [network_state_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/network_state_service.dart) | Flutter Mobile Companion (Dart) | 88 | 0.03% | 38.7 hrs | Low |
| [safety.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/safety.spec.ts) | Automated Test Suites (Playwright & Vitest) | 88 | 0.03% | 38.7 hrs | Low |
| [austere-research.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/austere-research.service.spec.ts) | Web Client (Angular & SSR) | 87 | 0.03% | 38.2 hrs | High |
| [paradigm-lyrics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/paradigm-lyrics.service.ts) | Web Client (Angular & SSR) | 87 | 0.03% | 38.2 hrs | Nominal |
| [travel-localization.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/travel-localization.service.ts) | Web Client (Angular & SSR) | 87 | 0.03% | 38.2 hrs | Nominal |
| [generate-retroactive-prs.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate-retroactive-prs.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 87 | 0.03% | 38.2 hrs | High |
| [legal-consent-sovereignty-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/legal-consent-sovereignty-badge.component.ts) | Web Client (Angular & SSR) | 86 | 0.03% | 37.8 hrs | High |
| [who-cdc-health-equity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/who-cdc-health-equity.service.ts) | Web Client (Angular & SSR) | 86 | 0.03% | 37.8 hrs | Nominal |
| [package-all.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/package-all.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 86 | 0.03% | 37.8 hrs | Low |
| [patient-education-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/patient-education-lens-tab.component.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | Nominal |
| [dicom-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/dicom-viewer.component.spec.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | Nominal |
| [legalzoom-partner-hub.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/legalzoom-partner-hub.component.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | High |
| [rsna-knee.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/rsna-knee.routes.spec.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | Low |
| [console-integrity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/console-integrity.service.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | Nominal |
| [healthcare-intelligence.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/healthcare-intelligence.service.ts) | Web Client (Angular & SSR) | 85 | 0.03% | 37.3 hrs | Nominal |
| [research_cohort.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/research_cohort.dart) | Flutter Mobile Companion (Dart) | 85 | 0.03% | 37.3 hrs | Low |
| [audio_websocket_stream_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/audio_websocket_stream_service.dart) | Flutter Mobile Companion (Dart) | 85 | 0.03% | 37.3 hrs | High |
| [app_theme.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/theme/app_theme.dart) | Flutter Mobile Companion (Dart) | 85 | 0.03% | 37.3 hrs | Low |
| [lifestyle-adjunct-panel.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/lifestyle-adjunct-panel.component.ts) | AVS Therapy Companion (Angular) | 85 | 0.03% | 37.3 hrs | Nominal |
| [vertex-agent-builder.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/vertex-agent-builder.service.spec.ts) | Web Client (Angular & SSR) | 84 | 0.03% | 36.9 hrs | High |
| [elder-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/elder-bridge.service.ts) | Web Client (Angular & SSR) | 84 | 0.03% | 36.9 hrs | Nominal |
| [fhir_integration_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/fhir_integration_service.dart) | Flutter Mobile Companion (Dart) | 84 | 0.03% | 36.9 hrs | Nominal |
| [cooccurrence_prior_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/cooccurrence_prior_engine.py) | Python FastAPI Sidecar & ML Engines | 84 | 0.03% | 36.9 hrs | Low |
| [dyadic-sync-hud.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/dyadic-sync-hud.component.ts) | AVS Therapy Companion (Angular) | 84 | 0.03% | 36.9 hrs | High |
| [adaptive-green-routing-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/adaptive-green-routing-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 84 | 0.03% | 36.9 hrs | Nominal |
| [generate-api-contracts.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate-api-contracts.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 84 | 0.03% | 36.9 hrs | Low |
| [summary-overview-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/summary-overview-lens-tab.component.ts) | Web Client (Angular & SSR) | 83 | 0.03% | 36.5 hrs | High |
| [tri-paradigm-integrative-lens-tab.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/tri-paradigm-integrative-lens-tab.component.spec.ts) | Web Client (Angular & SSR) | 83 | 0.03% | 36.5 hrs | Nominal |
| [boredom-connection-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/boredom-connection-engine.service.ts) | Web Client (Angular & SSR) | 83 | 0.03% | 36.5 hrs | Nominal |
| [double-flip-state-machine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/double-flip-state-machine.service.ts) | Web Client (Angular & SSR) | 83 | 0.03% | 36.5 hrs | Nominal |
| [session_state_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/session_state_service.dart) | Flutter Mobile Companion (Dart) | 83 | 0.03% | 36.5 hrs | Low |
| [scfa-microbiome-vagal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/aaas/scfa-microbiome-vagal.component.ts) | Web Client (Angular & SSR) | 82 | 0.03% | 36.0 hrs | Nominal |
| [intake-form.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/intake-form.component.spec.ts) | Web Client (Angular & SSR) | 82 | 0.03% | 36.0 hrs | Nominal |
| [p_srinivasa_ramanujan.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_srinivasa_ramanujan.ts) | Web Client (Angular & SSR) | 82 | 0.03% | 36.0 hrs | Low |
| [transit-wellness-gateway.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/transit-wellness-gateway.service.ts) | Web Client (Angular & SSR) | 82 | 0.03% | 36.0 hrs | Nominal |
| [mobile_cgm_time_in_range_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_cgm_time_in_range_service.dart) | Flutter Mobile Companion (Dart) | 82 | 0.03% | 36.0 hrs | Nominal |
| [generate_clinical_dataset.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_clinical_dataset.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 81 | 0.03% | 35.6 hrs | Low |
| [main-header-nav.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/main-header-nav.component.spec.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Nominal |
| [vertex-search.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vertex-search.component.spec.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Low |
| [gcp-healthcare-api.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/gcp-healthcare-api.service.spec.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Nominal |
| [hypoglycemia-alert.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hypoglycemia-alert.service.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | High |
| [pivot-pulse-agent.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/pivot-pulse-agent.service.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Nominal |
| [youth-mentorship.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/youth-mentorship.service.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Nominal |
| [security-sanitizer.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/security-sanitizer.ts) | Web Client (Angular & SSR) | 80 | 0.03% | 35.1 hrs | Low |
| [deprescribing_sandbox_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/deprescribing_sandbox_engine.py) | Python FastAPI Sidecar & ML Engines | 80 | 0.03% | 35.1 hrs | Low |
| [interventions-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/interventions-lens-tab.component.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Nominal |
| [pocket-gull-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-badge.component.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Nominal |
| [recovery-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/recovery-suite.component.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | High |
| [summary-node.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/summary-node.component.spec.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Nominal |
| [amazon.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/amazon.routes.spec.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Low |
| [hsa.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/hsa.routes.spec.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Low |
| [clinical-icon-generator.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-icon-generator.service.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Nominal |
| [counterfactual-simulation.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/counterfactual-simulation.service.spec.ts) | Web Client (Angular & SSR) | 79 | 0.03% | 34.7 hrs | Nominal |
| [orcid_profile.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/orcid_profile.dart) | Flutter Mobile Companion (Dart) | 79 | 0.03% | 34.7 hrs | Low |
| [chronobiology_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/chronobiology_engine.py) | Python FastAPI Sidecar & ML Engines | 79 | 0.03% | 34.7 hrs | Low |
| [metric-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/metric-card.component.ts) | Web Client (Angular & SSR) | 78 | 0.03% | 34.3 hrs | Nominal |
| [readmission_sepsis_model.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/readmission_sepsis_model.py) | Python FastAPI Sidecar & ML Engines | 78 | 0.03% | 34.3 hrs | Nominal |
| [gcp_marketplace_package.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gcp_marketplace_package.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 78 | 0.03% | 34.3 hrs | Nominal |
| [tcm-meridian-stasis-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eastern/tcm-meridian-stasis-matrix.component.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Nominal |
| [longitudinal-organ-slider.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/longitudinal-organ-slider.component.spec.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Low |
| [active-defense-tarpit.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/active-defense-tarpit.service.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Nominal |
| [federated-learning.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/federated-learning.service.spec.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Nominal |
| [or-tools-goal-optimizer.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/or-tools-goal-optimizer.service.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Nominal |
| [smart-fhir-sync.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-fhir-sync.service.spec.ts) | Web Client (Angular & SSR) | 77 | 0.03% | 33.8 hrs | Nominal |
| [ayurvedic_tridosha_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/ayurvedic_tridosha_engine.py) | Python FastAPI Sidecar & ML Engines | 77 | 0.03% | 33.8 hrs | Low |
| [train.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/training/train.py) | Python FastAPI Sidecar & ML Engines | 77 | 0.03% | 33.8 hrs | Low |
| [verify_agy_skills.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/verify_agy_skills.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 77 | 0.03% | 33.8 hrs | Nominal |
| [zenodo-sync.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/zenodo-sync.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 77 | 0.03% | 33.8 hrs | Low |
| [procedural-investment-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/procedural-investment-matrix.component.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | High |
| [multilingual-specimen.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/multilingual-specimen.component.spec.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | Low |
| [nutrition-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/nutrition-suite.component.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | High |
| [index.esm.js](file:///C:/Users/philg/Pocketgull/pocketgull/src/lib/dataconnect/esm/index.esm.js) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | Low |
| [api-key.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/api-key.service.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | Nominal |
| [tier-config.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/tier-config.spec.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | Nominal |
| [ambient-lighting.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-lighting.service.ts) | Web Client (Angular & SSR) | 76 | 0.03% | 33.4 hrs | High |
| [risk_score_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/risk_score_provider.dart) | Flutter Mobile Companion (Dart) | 76 | 0.03% | 33.4 hrs | Nominal |
| [test_ml_cost_benefit_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_ml_cost_benefit_engine.py) | Python FastAPI Sidecar & ML Engines | 76 | 0.03% | 33.4 hrs | Low |
| [avs-export-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-export-modal.component.ts) | AVS Therapy Companion (Angular) | 76 | 0.03% | 33.4 hrs | High |
| [session-controls.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/session-controls.component.ts) | AVS Therapy Companion (Angular) | 76 | 0.03% | 33.4 hrs | Nominal |
| [dyadic-co-regulation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/dyadic-co-regulation.service.ts) | AVS Therapy Companion (Angular) | 76 | 0.03% | 33.4 hrs | High |
| [wachter-brookings-governance-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/wachter-brookings-governance-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 76 | 0.03% | 33.4 hrs | Nominal |
| [care-plan-print-preview.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/care-plan-print-preview.component.spec.ts) | Web Client (Angular & SSR) | 75 | 0.03% | 32.9 hrs | Nominal |
| [papercraft-backdrop.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/papercraft-backdrop.component.ts) | Web Client (Angular & SSR) | 75 | 0.03% | 32.9 hrs | Nominal |
| [global-health-initiatives-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/global-health-initiatives-modal.component.spec.ts) | Web Client (Angular & SSR) | 75 | 0.03% | 32.9 hrs | Nominal |
| [test_contest_endpoints.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_contest_endpoints.py) | Python FastAPI Sidecar & ML Engines | 75 | 0.03% | 32.9 hrs | Low |
| [generate_sbir_grant_binder.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_sbir_grant_binder.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 75 | 0.03% | 32.9 hrs | Low |
| [dhatu-tissue-chakra-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/dhatu-tissue-chakra-matrix.component.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | Nominal |
| [research.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/research.routes.spec.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | Low |
| [sms.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/sms.routes.spec.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | Low |
| [bio-theme-song-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bio-theme-song-engine.service.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | High |
| [jurisdiction-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/jurisdiction-guard.service.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | Nominal |
| [legalzoom-integration.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/legalzoom-integration.service.ts) | Web Client (Angular & SSR) | 74 | 0.03% | 32.5 hrs | High |
| [google-health-api-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/google-health-api-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 74 | 0.03% | 32.5 hrs | Nominal |
| [build-all.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/build-all.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 74 | 0.03% | 32.5 hrs | Low |
| [hue-relay.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/hue-relay.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 74 | 0.03% | 32.5 hrs | Low |
| [verify_google_legal_posture.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/verify_google_legal_posture.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 74 | 0.03% | 32.5 hrs | Nominal |
| [smart-fhir-launcher.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/smart-fhir-launcher.component.ts) | Web Client (Angular & SSR) | 73 | 0.03% | 32.1 hrs | High |
| [world-health.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/world-health.ts) | Web Client (Angular & SSR) | 73 | 0.03% | 32.1 hrs | Low |
| [clinical-game-theory.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-game-theory.service.ts) | Web Client (Angular & SSR) | 73 | 0.03% | 32.1 hrs | Nominal |
| [package-deploy-source.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/package-deploy-source.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 73 | 0.03% | 32.1 hrs | Low |
| [medical-chart.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/medical-chart.component.spec.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | Nominal |
| [pocketgull-sans-bench.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocketgull-sans-bench.component.spec.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | Low |
| [types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/types.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | Low |
| [hobby-domain-companion.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hobby-domain-companion.service.spec.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | Nominal |
| [physionet-acoustic.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/physionet-acoustic.service.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | High |
| [tribal-health-sovereignty.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/tribal-health-sovereignty.service.spec.ts) | Web Client (Angular & SSR) | 72 | 0.03% | 31.6 hrs | Nominal |
| [mobile_teledentistry_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_teledentistry_service.dart) | Flutter Mobile Companion (Dart) | 72 | 0.03% | 31.6 hrs | Nominal |
| [stress_intervention_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/stress_intervention_service.dart) | Flutter Mobile Companion (Dart) | 72 | 0.03% | 31.6 hrs | Nominal |
| [edge_contactless_biomarkers_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/edge_contactless_biomarkers_engine.py) | Python FastAPI Sidecar & ML Engines | 72 | 0.03% | 31.6 hrs | Low |
| [engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/inference/engine.py) | Python FastAPI Sidecar & ML Engines | 72 | 0.03% | 31.6 hrs | Low |
| [movement-healing-quest-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/movement-healing-quest-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 72 | 0.03% | 31.6 hrs | Nominal |
| [hipaa-pdf-export.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hipaa-pdf-export.component.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | High |
| [onboarding-tour-overlay.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/onboarding-tour-overlay.component.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | High |
| [patient-education-flip.directive.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/directives/patient-education-flip.directive.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | High |
| [hidden-partners-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/hidden/hidden-partners-modal.component.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | High |
| [clinical-moe-router.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-moe-router.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [dictation.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/dictation.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [gcp-healthcare.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/gcp-healthcare.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Low |
| [impact-partner-channels.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/impact-partner-channels.service.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [open-evidence-commons.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/open-evidence-commons.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [periodontal-systemic-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/periodontal-systemic-bridge.service.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | High |
| [positive-psychology.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/positive-psychology.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [socratic-comorbidity-radar.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-comorbidity-radar.service.spec.ts) | Web Client (Angular & SSR) | 71 | 0.03% | 31.2 hrs | Nominal |
| [perinatal_trajectory_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/perinatal_trajectory_engine.py) | Python FastAPI Sidecar & ML Engines | 71 | 0.03% | 31.2 hrs | Low |
| [hipaa_deidentifier.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/middleware/hipaa_deidentifier.py) | Python FastAPI Sidecar & ML Engines | 71 | 0.03% | 31.2 hrs | Low |
| [sibi_cross_talk_model.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/sibi_cross_talk_model.py) | Python FastAPI Sidecar & ML Engines | 71 | 0.03% | 31.2 hrs | Nominal |
| [audit_flourishing_matrix.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/audit_flourishing_matrix.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 71 | 0.03% | 31.2 hrs | Nominal |
| [package_submissions.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/package_submissions.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 71 | 0.03% | 31.2 hrs | Low |
| [cgm-time-in-range.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/cgm-time-in-range.service.ts) | Web Client (Angular & SSR) | 70 | 0.03% | 30.7 hrs | High |
| [historical-luminaries-game.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/historical-luminaries-game.service.spec.ts) | Web Client (Angular & SSR) | 70 | 0.03% | 30.7 hrs | Nominal |
| [clinical_risk_calculator.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/clinical_risk_calculator.dart) | Flutter Mobile Companion (Dart) | 70 | 0.03% | 30.7 hrs | Low |
| [mobile_local_intelligence.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_local_intelligence.dart) | Flutter Mobile Companion (Dart) | 70 | 0.03% | 30.7 hrs | Nominal |
| [biophysical_twin_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/biophysical_twin_engine.py) | Python FastAPI Sidecar & ML Engines | 70 | 0.03% | 30.7 hrs | Low |
| [onnx_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/onnx_engine.py) | Python FastAPI Sidecar & ML Engines | 70 | 0.03% | 30.7 hrs | Nominal |
| [test_api_advancements.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_api_advancements.py) | Python FastAPI Sidecar & ML Engines | 70 | 0.03% | 30.7 hrs | Low |
| [fhir-green-rx-careplan-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/fhir-green-rx-careplan-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 70 | 0.03% | 30.7 hrs | Nominal |
| [generate_parity.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_parity.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 70 | 0.03% | 30.7 hrs | Low |
| [consent-lineage.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/consent-lineage.service.spec.ts) | Web Client (Angular & SSR) | 69 | 0.03% | 30.3 hrs | High |
| [intelligence.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/intelligence.ts) | Python FastAPI Sidecar & ML Engines | 69 | 0.03% | 30.3 hrs | Nominal |
| [glp1-incretin-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/aaas/glp1-incretin-matrix.component.ts) | Web Client (Angular & SSR) | 68 | 0.03% | 29.9 hrs | Nominal |
| [mrna-lipid-nanoparticle-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lasker/mrna-lipid-nanoparticle-matrix.component.ts) | Web Client (Angular & SSR) | 68 | 0.03% | 29.9 hrs | Nominal |
| [fhir-skeptical-extensions.model.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/models/fhir-skeptical-extensions.model.ts) | Web Client (Angular & SSR) | 68 | 0.03% | 29.9 hrs | Low |
| [agent_personas.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/agent_personas.dart) | Flutter Mobile Companion (Dart) | 68 | 0.03% | 29.9 hrs | Low |
| [app_colors.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/theme/app_colors.dart) | Flutter Mobile Companion (Dart) | 68 | 0.03% | 29.9 hrs | Low |
| [gcp_artifact_registry_cleanup.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gcp_artifact_registry_cleanup.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 68 | 0.03% | 29.9 hrs | Low |
| [hsa-incentive-network.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hsa-incentive-network.component.spec.ts) | Web Client (Angular & SSR) | 67 | 0.03% | 29.4 hrs | Nominal |
| [role-pathway-documentation-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/role-pathway-documentation-hub.component.spec.ts) | Web Client (Angular & SSR) | 67 | 0.03% | 29.4 hrs | Nominal |
| [serene-intake.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/serene-intake.component.spec.ts) | Web Client (Angular & SSR) | 67 | 0.03% | 29.4 hrs | High |
| [hl7v2-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/hl7v2-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 67 | 0.03% | 29.4 hrs | Nominal |
| [test_holistic_risk.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/tests/test_holistic_risk.py) | Python FastAPI Sidecar & ML Engines | 67 | 0.03% | 29.4 hrs | Low |
| [test_tri_paradigm_suite.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_tri_paradigm_suite.py) | Python FastAPI Sidecar & ML Engines | 67 | 0.03% | 29.4 hrs | Low |
| [thought-signature-circulation.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/thought-signature-circulation.spec.ts) | Automated Test Suites (Playwright & Vitest) | 67 | 0.03% | 29.4 hrs | Nominal |
| [generate_ghostscript_specimen.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_ghostscript_specimen.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 67 | 0.03% | 29.4 hrs | Low |
| [security-audit.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/security-audit.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 67 | 0.03% | 29.4 hrs | Low |
| [environmental-exposomics-toxicology.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/environmental-exposomics-toxicology.component.spec.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Nominal |
| [coppa-privacy-shield.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/coppa-privacy-shield.service.spec.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Nominal |
| [corporate-identity.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/corporate-identity.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Low |
| [csv-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/csv-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Nominal |
| [pdf-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/pdf-export-strategy.service.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Nominal |
| [kachinka-audio.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/kachinka-audio.service.ts) | Web Client (Angular & SSR) | 66 | 0.02% | 29.0 hrs | Low |
| [auth_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/auth_service.dart) | Flutter Mobile Companion (Dart) | 66 | 0.02% | 29.0 hrs | Low |
| [publish_article_to_wordpress.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/publish_article_to_wordpress.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 66 | 0.02% | 29.0 hrs | Low |
| [diagnostics-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/diagnostics-lens-tab.component.ts) | Web Client (Angular & SSR) | 65 | 0.02% | 28.6 hrs | Nominal |
| [lens-rsna-knee.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lens-rsna-knee.component.spec.ts) | Web Client (Angular & SSR) | 65 | 0.02% | 28.6 hrs | Nominal |
| [clinical-storytelling.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-storytelling.service.ts) | Web Client (Angular & SSR) | 65 | 0.02% | 28.6 hrs | High |
| [fhir-bundle-factory.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-bundle-factory.service.spec.ts) | Web Client (Angular & SSR) | 65 | 0.02% | 28.6 hrs | Nominal |
| [gemini-context-cache.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/gemini-context-cache.service.spec.ts) | Web Client (Angular & SSR) | 65 | 0.02% | 28.6 hrs | Nominal |
| [python_bridge_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/python_bridge_service.dart) | Flutter Mobile Companion (Dart) | 65 | 0.02% | 28.6 hrs | Nominal |
| [primary_button.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/ui/primary_button.dart) | Flutter Mobile Companion (Dart) | 65 | 0.02% | 28.6 hrs | Low |
| [nof1_trial_designer_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/nof1_trial_designer_engine.py) | Python FastAPI Sidecar & ML Engines | 65 | 0.02% | 28.6 hrs | Low |
| [avs-cymatics-visualizer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/avs-cymatics-visualizer.component.spec.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | Nominal |
| [clinical-trajectory-biography.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trajectory-biography.component.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | High |
| [legacy-swarm-agents.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/legacy-swarm-agents.service.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | High |
| [data-adventure-engine.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/data-adventure-engine.service.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | Nominal |
| [fhir-r4-bundle-export.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r4-bundle-export.service.spec.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | Nominal |
| [role-demo-launcher.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/role-demo-launcher.service.ts) | Web Client (Angular & SSR) | 64 | 0.02% | 28.1 hrs | High |
| [ai_cache_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/ai_cache_service.dart) | Flutter Mobile Companion (Dart) | 64 | 0.02% | 28.1 hrs | Nominal |
| [consent_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/consent_service.dart) | Flutter Mobile Companion (Dart) | 64 | 0.02% | 28.1 hrs | Low |
| [epigenetic_longevity_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/epigenetic_longevity_engine.py) | Python FastAPI Sidecar & ML Engines | 64 | 0.02% | 28.1 hrs | Low |
| [clinical-gauge-svg.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-gauge-svg.component.ts) | Web Client (Angular & SSR) | 63 | 0.02% | 27.7 hrs | Nominal |
| [global-jurisdiction-matrix.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/global-jurisdiction-matrix.service.spec.ts) | Web Client (Angular & SSR) | 63 | 0.02% | 27.7 hrs | Nominal |
| [research-consent.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/research-consent.service.spec.ts) | Web Client (Angular & SSR) | 63 | 0.02% | 27.7 hrs | Nominal |
| [vocal-biomarker.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/vocal-biomarker.service.ts) | Web Client (Angular & SSR) | 63 | 0.02% | 27.7 hrs | Nominal |
| [run_tests.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/run_tests.py) | Python FastAPI Sidecar & ML Engines | 63 | 0.02% | 27.7 hrs | Low |
| [ambient-scribe.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/ambient-scribe.service.spec.ts) | Automated Test Suites (Playwright & Vitest) | 63 | 0.02% | 27.7 hrs | Nominal |
| [articles-reader.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/articles-reader.component.spec.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | High |
| [adaptive-green-routing.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/adaptive-green-routing.service.spec.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | High |
| [mbi.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/mbi.assessment.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Low |
| [differential-diagnosis-radar.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/differential-diagnosis-radar.service.spec.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Nominal |
| [multilingual-equity.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/multilingual-equity.service.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Nominal |
| [procedural-health-investment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/procedural-health-investment.service.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | High |
| [role-pathway-docs.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/role-pathway-docs.service.spec.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Nominal |
| [smart-on-fhir-launch.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-on-fhir-launch.service.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Nominal |
| [sms-equity-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/sms-equity-bridge.service.spec.ts) | Web Client (Angular & SSR) | 62 | 0.02% | 27.2 hrs | Nominal |
| [kaggle_tags.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/kaggle_tags.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 62 | 0.02% | 27.2 hrs | Low |
| [generate_dieter_rams_specimen.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_dieter_rams_specimen.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 62 | 0.02% | 27.2 hrs | Low |
| [vata-pitta-kapha-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/vata-pitta-kapha-matrix.component.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [clinical-reasoning-stream.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-reasoning-stream.component.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Low |
| [ga4gh-phenopackets-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ga4gh-phenopackets-card.component.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [stanford-hci-clinical-lens.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/stanford-hci-clinical-lens.component.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | High |
| [insight-grid.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-grid.component.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | High |
| [research-cohort.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/models/research-cohort.types.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Low |
| [api-contracts.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/api-contracts.types.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Low |
| [clinical-trials-matcher.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trials-matcher.service.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [edge-tamper-guard.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/edge-tamper-guard.service.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [export.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export.service.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [mandiant-clinical-defense.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/mandiant-clinical-defense.service.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [partner-ecosystem.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/partner-ecosystem.service.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | Nominal |
| [typographic-anatomy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/typographic-anatomy.service.spec.ts) | Web Client (Angular & SSR) | 61 | 0.02% | 26.8 hrs | High |
| [main.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/main.dart) | Flutter Mobile Companion (Dart) | 61 | 0.02% | 26.8 hrs | Nominal |
| [generate_master_specimen_images.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_master_specimen_images.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 61 | 0.02% | 26.8 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/index.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | Low |
| [google-health-consent-modal.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/google-health-consent-modal.component.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | High |
| [interactions.provider.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/interactions.provider.spec.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | Low |
| [autonomic-coherence-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/autonomic-coherence-bridge.service.spec.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | Nominal |
| [encrypted-vault.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/encrypted-vault.service.spec.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | Nominal |
| [physics-biophysics.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/physics-biophysics.service.ts) | Web Client (Angular & SSR) | 60 | 0.02% | 26.4 hrs | High |
| [clinic-onboarding-wizard.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinic-onboarding-wizard.component.spec.ts) | Web Client (Angular & SSR) | 59 | 0.02% | 25.9 hrs | Nominal |
| [nih-who-goal-tracker.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/nih-who-goal-tracker.component.spec.ts) | Web Client (Angular & SSR) | 59 | 0.02% | 25.9 hrs | Nominal |
| [ambient-clinical-scribe.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-clinical-scribe.service.spec.ts) | Web Client (Angular & SSR) | 59 | 0.02% | 25.9 hrs | Nominal |
| [vibroacoustic-haptic.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/vibroacoustic-haptic.service.spec.ts) | Web Client (Angular & SSR) | 59 | 0.02% | 25.9 hrs | Nominal |
| [hedis-star-rating.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hedis-star-rating.service.spec.ts) | Web Client (Angular & SSR) | 59 | 0.02% | 25.9 hrs | Nominal |
| [epigenetic_lineage_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/epigenetic_lineage_engine.py) | Python FastAPI Sidecar & ML Engines | 59 | 0.02% | 25.9 hrs | Low |
| [citizen-science-telemetry-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/citizen-science-telemetry-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 59 | 0.02% | 25.9 hrs | Nominal |
| [ncaa-sports-science-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-frame/ncaa-sports-science-hub.component.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [longitudinal-trend-sparkline.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/longitudinal-trend-sparkline.component.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Low |
| [smart-fhir-sync-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/smart-fhir-sync-modal.component.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [support.routes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/support.routes.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Low |
| [amazon-creators-api.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/amazon-creators-api.service.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [clinical-ux-evaluation.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-ux-evaluation.service.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [cross-border-health-wallet.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cross-border-health-wallet.service.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | High |
| [monroe-persian-trance.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/monroe-persian-trance.service.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [de-identification-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/privacy/de-identification-engine.service.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | Nominal |
| [ssa-disability-navigator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ssa-disability-navigator.service.spec.ts) | Web Client (Angular & SSR) | 58 | 0.02% | 25.5 hrs | High |
| [persona-mode-analysis.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/persona-mode-analysis.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 58 | 0.02% | 25.5 hrs | Low |
| [medha-sakti-matrix.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/medha-sakti-matrix.component.spec.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | Nominal |
| [osce-case-simulator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/osce-case-simulator.component.spec.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | Nominal |
| [skeptical-epistemology-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/skeptical-epistemology-hud.component.spec.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | Nominal |
| [ble-wearables.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/ble-wearables.service.spec.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | Nominal |
| [network-state.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/network-state.service.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | High |
| [public-service-corps.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/public-service-corps.service.ts) | Web Client (Angular & SSR) | 57 | 0.02% | 25.0 hrs | Nominal |
| [kaggle_sync_utility.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/kaggle_sync_utility.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 57 | 0.02% | 25.0 hrs | Low |
| [clinical-tool-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-tool-card.component.spec.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | Nominal |
| [ambient-flow-soundscape.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-flow-soundscape.service.spec.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | Nominal |
| [autonomic-coherence-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/autonomic-coherence-bridge.service.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | High |
| [bio-symphony-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bio-symphony-engine.service.spec.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | Nominal |
| [goal-planning-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/goal-planning-engine.service.spec.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | Nominal |
| [living-obituary-memorial.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/living-obituary-memorial.service.ts) | Web Client (Angular & SSR) | 56 | 0.02% | 24.6 hrs | High |
| [train_gemma_lora.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/train_gemma_lora.py) | Python FastAPI Sidecar & ML Engines | 56 | 0.02% | 24.6 hrs | Low |
| [epigenetic-longevity-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/epigenetic-longevity-lens-tab.component.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | High |
| [cdisc-rwe-dossier.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cdisc-rwe-dossier.service.spec.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | Nominal |
| [compassionate-analogy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/compassionate-analogy.service.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | Nominal |
| [intimacy-relationship-vitality.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/intimacy-relationship-vitality.service.spec.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | Nominal |
| [ncaa-sports-science.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ncaa-sports-science.service.spec.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | Nominal |
| [visual-haptic-entrainment.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/visual-haptic-entrainment.service.ts) | Web Client (Angular & SSR) | 55 | 0.02% | 24.2 hrs | High |
| [report_tabs_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/report_tabs_widget.dart) | Flutter Mobile Companion (Dart) | 55 | 0.02% | 24.2 hrs | Low |
| [test_dsp.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_dsp.py) | Python FastAPI Sidecar & ML Engines | 55 | 0.02% | 24.2 hrs | Low |
| [apply-gcp-quota-policy.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/apply-gcp-quota-policy.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 55 | 0.02% | 24.2 hrs | Nominal |
| [gh-release.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gh-release.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 55 | 0.02% | 24.2 hrs | Low |
| [kaggle_tags.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/kaggle_tags.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 55 | 0.02% | 24.2 hrs | Low |
| [setup-billing-killswitch.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/setup-billing-killswitch.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 55 | 0.02% | 24.2 hrs | Low |
| [wcag-theme-contrast-analysis.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/wcag-theme-contrast-analysis.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 55 | 0.02% | 24.2 hrs | Low |
| [electroacupuncture-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/electroacupuncture-viewer.component.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [encrypted-vault-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/encrypted-vault-modal.component.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [bionic-reading.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bionic-reading.service.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [phq9.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/phq9.assessment.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Low |
| [fhir-prior-auth.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir-prior-auth.service.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [grow-thyself-legacy-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/grow-thyself-legacy-engine.service.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [ismp-safety-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ismp-safety-guard.service.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [maternal-postpartum.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/maternal-postpartum.service.spec.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [microsoft-ibm-clinical-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/microsoft-ibm-clinical-bridge.service.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [navigation-shell.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/navigation-shell.service.ts) | Web Client (Angular & SSR) | 54 | 0.02% | 23.7 hrs | Nominal |
| [mobile_audio_respiratory_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_audio_respiratory_service.dart) | Flutter Mobile Companion (Dart) | 54 | 0.02% | 23.7 hrs | Nominal |
| [patient-state.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient-state.service.ts) | AVS Therapy Companion (Angular) | 54 | 0.02% | 23.7 hrs | Nominal |
| [fhir-export-occupational.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/fhir-export-occupational.spec.ts) | Automated Test Suites (Playwright & Vitest) | 54 | 0.02% | 23.7 hrs | Nominal |
| [austere-research-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/austere-research-hud/austere-research-hud.component.spec.ts) | Web Client (Angular & SSR) | 53 | 0.02% | 23.3 hrs | High |
| [growthyself.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/growthyself.assessment.ts) | Web Client (Angular & SSR) | 53 | 0.02% | 23.3 hrs | Low |
| [tcm.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/tcm.assessment.ts) | Web Client (Angular & SSR) | 53 | 0.02% | 23.3 hrs | Low |
| [fhir-r5-telemetry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-r5-telemetry.service.spec.ts) | Web Client (Angular & SSR) | 53 | 0.02% | 23.3 hrs | Nominal |
| [rx-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rx-guard.service.spec.ts) | Web Client (Angular & SSR) | 53 | 0.02% | 23.3 hrs | Nominal |
| [periodontal_systemic_bridge_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/periodontal_systemic_bridge_engine.py) | Python FastAPI Sidecar & ML Engines | 53 | 0.02% | 23.3 hrs | Low |
| [socratic-epistemology-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/socratic-epistemology-lens-tab.component.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | High |
| [analysis-report.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.types.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Low |
| [clinical-tool-workbench.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-tool-workbench.component.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [risk-tier-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/risk-tier-badge.component.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [spatial-scanner.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/spatial-scanner.component.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [therapeutics-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/suites/therapeutics-suite.component.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | High |
| [audio-respiratory-analyzer.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/audio-respiratory-analyzer.service.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | High |
| [compassionate-checkin-guardian.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/compassionate-checkin-guardian.service.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | High |
| [genomic-pathogenicity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/genomic-pathogenicity.service.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [jurisdiction-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/jurisdiction-guard.service.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [snomed-icd-crosswalk.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/snomed-icd-crosswalk.service.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [visual-acuity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/visual-acuity.service.spec.ts) | Web Client (Angular & SSR) | 52 | 0.02% | 22.8 hrs | Nominal |
| [test_asymmetric_loss.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_asymmetric_loss.py) | Python FastAPI Sidecar & ML Engines | 52 | 0.02% | 22.8 hrs | Low |
| [avs-header.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-header.component.ts) | AVS Therapy Companion (Angular) | 52 | 0.02% | 22.8 hrs | Nominal |
| [responsible-ai-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/responsible-ai-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 52 | 0.02% | 22.8 hrs | Nominal |
| [apply-gcp-lifecycle-policies.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/apply-gcp-lifecycle-policies.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 52 | 0.02% | 22.8 hrs | Nominal |
| [ayurvedic-systems-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ayurvedic/ayurvedic-systems-suite.component.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [pulse-tongue-pattern-diagnosis.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eastern/pulse-tongue-pattern-diagnosis.component.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [practice-roi-calculator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/practice-roi-calculator.component.spec.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [app-licensing-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/app-licensing-guard.service.spec.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | High |
| [bionic-reading.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bionic-reading.service.spec.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [deep-space-cds.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/deep-space-cds.service.spec.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [webauthn-passkey.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webauthn-passkey.service.spec.ts) | Web Client (Angular & SSR) | 51 | 0.02% | 22.4 hrs | Nominal |
| [bundle_theme_fonts.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/bundle_theme_fonts.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 51 | 0.02% | 22.4 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/index.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [food-safety-guardrail-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/food-safety-guardrail-card.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [nobel-laureates-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nobel/nobel-laureates-suite.component.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [quantum-clinical-dashboard.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/quantum-clinical-dashboard.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [sentinel-triage.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-triage.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [bionic-focus-benchmark.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/bionic-focus-benchmark.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [socratic-jargon-tooltip.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/socratic-jargon-tooltip.component.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | High |
| [vision-accessibility-assist.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vision-accessibility-assist.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [vitals-quick-dial-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vitals-quick-dial-hud.component.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [aiga-model-augmentation.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/aiga-model-augmentation.service.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | High |
| [clinical-fine-tuning-orchestrator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-fine-tuning-orchestrator.service.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [clinical-support-agent.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-support-agent.service.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [ip-patent-registry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ip-patent-registry.service.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | High |
| [onnx-webgpu-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/onnx-webgpu-engine.service.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [webgpu-bio-signal.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-bio-signal.service.spec.ts) | Web Client (Angular & SSR) | 50 | 0.02% | 22.0 hrs | Nominal |
| [transgenerational_stewardship_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/transgenerational_stewardship_engine.py) | Python FastAPI Sidecar & ML Engines | 50 | 0.02% | 22.0 hrs | Low |
| [deploy_fonts.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/deploy_fonts.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 50 | 0.02% | 22.0 hrs | Low |
| [generate_clinical_typeface.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_clinical_typeface.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 50 | 0.02% | 22.0 hrs | Low |
| [actuarial-glee-album.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/actuarial-glee-album.component.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Nominal |
| [console-integrity-badge.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/console-integrity-badge.component.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | High |
| [grounded-evidence-badge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/grounded-evidence-badge.component.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | High |
| [caregiver-bridge-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/caregiver-bridge-modal.component.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Nominal |
| [main.server.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/main.server.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Low |
| [alpha-stem.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/alpha-stem.service.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Nominal |
| [ayurveda.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/ayurveda.assessment.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Low |
| [space-biophysics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/space-biophysics.service.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Nominal |
| [teledentistry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/teledentistry.service.spec.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Nominal |
| [security-helper.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/utils/security-helper.ts) | Web Client (Angular & SSR) | 49 | 0.02% | 21.5 hrs | Low |
| [patient_management_provider.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/patient_management_provider.dart) | Flutter Mobile Companion (Dart) | 49 | 0.02% | 21.5 hrs | Nominal |
| [services_providers.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/providers/services_providers.dart) | Flutter Mobile Companion (Dart) | 49 | 0.02% | 21.5 hrs | Nominal |
| [mobile_camera_pulse_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_camera_pulse_service.dart) | Flutter Mobile Companion (Dart) | 49 | 0.02% | 21.5 hrs | Nominal |
| [fitts-law-mobile-a11y.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/fitts-law-mobile-a11y.spec.ts) | Automated Test Suites (Playwright & Vitest) | 49 | 0.02% | 21.5 hrs | Low |
| [adaptive-green-routing-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/adaptive-green-routing-hud.component.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | High |
| [instant-body-care-plan-sheet.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/instant-body-care-plan-sheet.component.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Low |
| [typographic-3d-body.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/typographic-3d-body.component.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Low |
| [patient-education-flip.directive.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/directives/patient-education-flip.directive.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Nominal |
| [pubgemma.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/pubgemma.provider.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Low |
| [barrows-clinical-inquiry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/barrows-clinical-inquiry.service.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Nominal |
| [biomarker-velocity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/biomarker-velocity.service.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Nominal |
| [clinical-mandarinate-exam.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-mandarinate-exam.service.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Nominal |
| [movement-healing-quest.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/movement-healing-quest.service.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | High |
| [rpm-audit.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/rpm-audit.spec.ts) | Web Client (Angular & SSR) | 48 | 0.02% | 21.1 hrs | Nominal |
| [generate-sbom.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate-sbom.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 48 | 0.02% | 21.1 hrs | Low |
| [radial-pie-menu.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/radial-pie-menu.component.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [amazon-product-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/amazon-product-card.component.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [ambient-flow-player.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ambient-flow-player.component.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [clinical-icon.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-icon.component.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | High |
| [paradigm-definitions.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/constants/paradigm-definitions.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [reveal.directive.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/directives/reveal.directive.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [art-therapy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/art-therapy.service.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [cvsq.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/cvsq.assessment.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [gad7.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/gad7.assessment.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [ros14.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/ros14.assessment.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Low |
| [cms-rpm-superbill.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cms-rpm-superbill.service.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [medicare-billing-best-practices.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/medicare-billing-best-practices.service.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [mission-symphony-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/mission-symphony-engine.service.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [session-state.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/session-state.service.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | High |
| [severity-particle.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/severity-particle.service.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | High |
| [smart-health-card.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-health-card.service.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [socratic-multilingual-translator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-multilingual-translator.service.spec.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | Nominal |
| [stanford-hci-clinical-lens.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/stanford-hci-clinical-lens.service.ts) | Web Client (Angular & SSR) | 47 | 0.02% | 20.6 hrs | High |
| [train_physionet_2026.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/train_physionet_2026.py) | Python FastAPI Sidecar & ML Engines | 47 | 0.02% | 20.6 hrs | Low |
| [nutritional-bypass-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/nutritional-bypass-lens-tab.component.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | Nominal |
| [international-university-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-frame/international-university-hub.component.spec.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | Nominal |
| [clinical-ai-provider-registry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-ai-provider-registry.service.spec.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | High |
| [hsa-incentive-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hsa-incentive-bridge.service.spec.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | Nominal |
| [optical-camera-vision.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/optical-camera-vision.service.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | High |
| [paradigm-arbiter.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/paradigm-arbiter.service.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | Nominal |
| [types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/types.ts) | Web Client (Angular & SSR) | 46 | 0.02% | 20.2 hrs | Low |
| [audit_audiophile_dsp.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/audit_audiophile_dsp.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 46 | 0.02% | 20.2 hrs | Low |
| [verify_caslon_typography.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/verify_caslon_typography.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 46 | 0.02% | 20.2 hrs | Low |
| [aaas-breakthroughs-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/aaas/aaas-breakthroughs-suite.component.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [seven-generations-stewardship-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/seven-generations-stewardship-lens-tab.component.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [barrows-clinical-inquiry-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/barrows-clinical-inquiry-hub.component.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [eastern-tcm-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eastern/eastern-tcm-suite.component.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [lasker-breakthrough-suite.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/lasker/lasker-breakthrough-suite.component.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [theme-studio-drawer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/theme-studio-drawer.component.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [phq15.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/phq15.assessment.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Low |
| [electroacupuncture.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/electroacupuncture.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [google-saif-clinical-defense.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/google-saif-clinical-defense.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [international-university-geofence.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/international-university-geofence.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [n-of-1-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/n-of-1-engine.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [quantum-clinical-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/quantum-clinical-engine.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [slack-integration.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/slack-integration.service.spec.ts) | Web Client (Angular & SSR) | 45 | 0.02% | 19.8 hrs | Nominal |
| [clinical_scorer.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/models/clinical_scorer.py) | Python FastAPI Sidecar & ML Engines | 45 | 0.02% | 19.8 hrs | Low |
| [fix_pocketgull_font.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/fix_pocketgull_font.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 45 | 0.02% | 19.8 hrs | Low |
| [kaggle_sync_notebooks.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/kaggle_sync_notebooks.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 45 | 0.02% | 19.8 hrs | Low |
| [body-explorer-game.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/body-explorer-game.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Low |
| [clinical-scorecard.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-scorecard.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [component-drilldown-unit.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/component-drilldown-unit.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [medical-supply-navigator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/medical-supply-navigator.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [patent-claims-hud-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/patent-claims-hud-modal.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/index.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [jurisdiction-matrix-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/jurisdiction-matrix-card.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | High |
| [teledentistry-odontogram.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/teledentistry-odontogram.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [tri-paradigm-swarm-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/tri-paradigm-swarm-card.component.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [ai-confidence-calibration.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai-confidence-calibration.service.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [bigquery-cohort-exporter.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bigquery-cohort-exporter.service.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [clinical-trajectory-reader.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trajectory-reader.service.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [smart-on-fhir.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/smart-on-fhir.spec.ts) | Web Client (Angular & SSR) | 44 | 0.02% | 19.3 hrs | Nominal |
| [mobile_offline_edge_ai_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/mobile_offline_edge_ai_service.dart) | Flutter Mobile Companion (Dart) | 44 | 0.02% | 19.3 hrs | Nominal |
| [test_jax_data_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_jax_data_engine.py) | Python FastAPI Sidecar & ML Engines | 44 | 0.02% | 19.3 hrs | Low |
| [wsl_ai_doctor.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/wsl_ai_doctor.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 44 | 0.02% | 19.3 hrs | Low |
| [genesis-biophysical-substrate.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/genesis-biophysical-substrate.component.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [daily-action-checklist.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/daily-action-checklist.component.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [awcim-integrative-prescriber.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/awcim-integrative-prescriber.component.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Low |
| [clinical-mandarinate-exam-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-mandarinate-exam-card.component.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [webllm-health-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/webllm-health-card.component.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [airlines.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/airlines.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [shield-gemma-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/shield-gemma-guard.service.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [assessment-registry.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/assessment-registry.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Low |
| [fhir-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/fhir-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [html-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/html-export-strategy.service.ts) | Web Client (Angular & SSR) | 43 | 0.02% | 18.9 hrs | Nominal |
| [build_pocketgull_ttf.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/build_pocketgull_ttf.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 43 | 0.02% | 18.9 hrs | Low |
| [fix-vitest-imports.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/fix-vitest-imports.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 43 | 0.02% | 18.9 hrs | Low |
| [package_v9_submissions.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/package_v9_submissions.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 43 | 0.02% | 18.9 hrs | Low |
| [nsf-grant-portal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nsf-grant-portal.component.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [talent-hr-portal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/talent-hr-portal.component.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Low |
| [webllm.provider.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/webllm.provider.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Low |
| [alphagenome-regulatory.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/alphagenome-regulatory.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [citizen-science-telemetry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/citizen-science-telemetry.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | High |
| [impact-program-agreement.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/impact-program-agreement.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [lifestyle-adjunct.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/lifestyle-adjunct.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [practice-roi.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/practice-roi.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [presentation-export.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/presentation-export.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [session-state.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/session-state.service.spec.ts) | Web Client (Angular & SSR) | 42 | 0.02% | 18.4 hrs | Nominal |
| [test_lego_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/tests/test_lego_engine.py) | Python FastAPI Sidecar & ML Engines | 42 | 0.02% | 18.4 hrs | Low |
| [androscoggin-foraging-phytoncide.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/androscoggin-foraging-phytoncide.component.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [movement-healing-quest.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/movement-healing-quest.component.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | High |
| [mandiant-cyber-defense-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/mandiant-cyber-defense-card.component.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [community-testimonials.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/community-testimonials.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | High |
| [google-health-api.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/google-health-api.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | High |
| [hypoglycemia-alert.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hypoglycemia-alert.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [image-optimization.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [irmaa-decision.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/irmaa-decision.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [knowledge-synthesis.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/knowledge-synthesis.service.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | High |
| [life-journey-navigator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/life-journey-navigator.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [living-obituary-memorial.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/living-obituary-memorial.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [smart-on-fhir-launch.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/smart-on-fhir-launch.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [socratic-rounds.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-rounds.service.spec.ts) | Web Client (Angular & SSR) | 41 | 0.02% | 18.0 hrs | Nominal |
| [test_conformal_risk.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/tests/test_conformal_risk.py) | Python FastAPI Sidecar & ML Engines | 41 | 0.02% | 18.0 hrs | Low |
| [yoga-asana-3d-coach.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/yoga-asana-3d-coach.component.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [biometric-sensor-fusion-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/biometric-sensor-fusion-card.component.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [brand-package-generator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/brand-package-generator.component.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Low |
| [nantucket-tick-case-study.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/case-studies/nantucket-tick-case-study.component.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | High |
| [passkey-step-up-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/passkey-step-up-modal.component.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [legacy-swarm-agents.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/legacy-swarm-agents.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [nano.provider.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/nano.provider.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | High |
| [auth.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/auth.service.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [cellular-biophysics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cellular-biophysics.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [institutional-compliance.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/institutional-compliance.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [legalzoom-integration.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/legalzoom-integration.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [nng-usability-metrics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/nng-usability-metrics.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [ocular-vocal-telemetry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ocular-vocal-telemetry.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [periodontal-systemic-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/periodontal-systemic-bridge.service.spec.ts) | Web Client (Angular & SSR) | 40 | 0.02% | 17.6 hrs | Nominal |
| [glass_container.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/ui/glass_container.dart) | Flutter Mobile Companion (Dart) | 40 | 0.02% | 17.6 hrs | Low |
| [enterprise-suite.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/enterprise-suite.spec.ts) | Automated Test Suites (Playwright & Vitest) | 40 | 0.02% | 17.6 hrs | Nominal |
| [add-porkbun-txt-record.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/add-porkbun-txt-record.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 40 | 0.02% | 17.6 hrs | Low |
| [build-chrome-extension.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/build-chrome-extension.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 40 | 0.02% | 17.6 hrs | Low |
| [investor-valuation-portal-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/investor-valuation-portal-modal.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Low |
| [occupational-hazard-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/occupational-hazard-card.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [open-evidence-commons-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/open-evidence-commons-hud.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [research-data-dividend.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/research-data-dividend.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [cellular-biophysics-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/cellular-biophysics-viewer.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [ssa-disability-navigator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/ssa-disability-navigator.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | High |
| [symptom-habit-journal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/symptom-habit-journal.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [zen-sanctuary-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/zen-sanctuary-modal.component.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | High |
| [on-device-embedder.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/on-device-embedder.service.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [ambient-soap-parser.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ambient-soap-parser.service.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [compassionate-checkin-guardian.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/compassionate-checkin-guardian.service.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [consent.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/consent.service.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | High |
| [smart-on-fhir-launcher.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/smart-on-fhir-launcher.service.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [legal-consent-sovereignty.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/legal-consent-sovereignty.service.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | Nominal |
| [secure-storage.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/secure-storage.service.spec.ts) | Web Client (Angular & SSR) | 39 | 0.01% | 17.1 hrs | High |
| [peregrine_pivot_pulse.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/peregrine_pivot_pulse.py) | Python FastAPI Sidecar & ML Engines | 39 | 0.01% | 17.1 hrs | Low |
| [summary-overview-lens-tab.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/summary-overview-lens-tab.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [autonomic-coherence-bridge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/autonomic-coherence-bridge.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [living-obituary-memorial.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/living-obituary-memorial.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [precision-nutrition-calculator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/precision-nutrition-calculator.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [alpha-stem-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/alpha-stem-viewer.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [immuno-oncology-tme-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/immuno-oncology-tme-viewer.component.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Low |
| [native-json-export-strategy.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/native-json-export-strategy.service.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/index.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [onc-dsi-transparency.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/onc-dsi-transparency.service.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | High |
| [role-demo-launcher.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/role-demo-launcher.service.spec.ts) | Web Client (Angular & SSR) | 38 | 0.01% | 16.7 hrs | Nominal |
| [body_part_geometry.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/body_part_geometry.dart) | Flutter Mobile Companion (Dart) | 38 | 0.01% | 16.7 hrs | Low |
| [import_svg_glyphs_to_font.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/import_svg_glyphs_to_font.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 38 | 0.01% | 16.7 hrs | Low |
| [msa_governance_guard.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/msa_governance_guard.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 38 | 0.01% | 16.7 hrs | Nominal |
| [setup-aws-healthlake.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/setup-aws-healthlake.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 38 | 0.01% | 16.7 hrs | Low |
| [cgm-time-in-range.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/cgm-time-in-range.component.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [grow-thyself-legacy-vault.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/grow-thyself-legacy-vault.component.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [usage-licensing-paywall-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/usage-licensing-paywall-modal.component.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | High |
| [planetary-health-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/planetary-health-hud.component.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [mock-patients.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Low |
| [legalzoom-partner-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/legalzoom-partner-hub.component.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [ticketmaster.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/ticketmaster.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [akovos-longevity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/akovos-longevity.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [audio-respiratory-analyzer.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/audio-respiratory-analyzer.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [avian-sea-shanty.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/avian-sea-shanty.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [clinical-evals.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-evals.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [theme.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/theme.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [vertex-ai-model-garden.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/vertex-ai-model-garden.service.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [zen-sanctuary.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/zen-sanctuary.service.spec.ts) | Web Client (Angular & SSR) | 37 | 0.01% | 16.3 hrs | Nominal |
| [audit_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/audit_service.dart) | Flutter Mobile Companion (Dart) | 37 | 0.01% | 16.3 hrs | Nominal |
| [conformal_risk_service.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/services/conformal_risk_service.py) | Python FastAPI Sidecar & ML Engines | 37 | 0.01% | 16.3 hrs | Low |
| [build-mobile-stores.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/build-mobile-stores.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 37 | 0.01% | 16.3 hrs | Low |
| [akovos-longevity-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/akovos-longevity-hub.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [citizen-science-walk-report.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/citizen-science-walk-report.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | High |
| [goal-planning-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/goal-planning-card.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | High |
| [irmaa-decision-calculator.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/irmaa-decision-calculator.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [quad-philosophy-matrix.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/quad-philosophy-matrix.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Low |
| [tribal-health-sovereignty-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/tribal-health-sovereignty-card.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [socratic-multilingual-terminal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/socratic-multilingual-terminal.component.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [canary.routes.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/routes/canary.routes.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Low |
| [data-science-citation.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/data-science-citation.service.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [medical-device-affiliate.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/medical-device-affiliate.service.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [webgpu-edge-ai.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-edge-ai.service.spec.ts) | Web Client (Angular & SSR) | 36 | 0.01% | 15.8 hrs | Nominal |
| [image_optimization_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/image_optimization_service.dart) | Flutter Mobile Companion (Dart) | 36 | 0.01% | 15.8 hrs | Nominal |
| [avs.constants.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs.constants.ts) | AVS Therapy Companion (Angular) | 36 | 0.01% | 15.8 hrs | Low |
| [patient-waiting.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/patient-waiting.component.ts) | AVS Therapy Companion (Angular) | 36 | 0.01% | 15.8 hrs | Nominal |
| [barrows-clinical-inquiry-e2e.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/barrows-clinical-inquiry-e2e.spec.ts) | Automated Test Suites (Playwright & Vitest) | 36 | 0.01% | 15.8 hrs | Nominal |
| [rsna-knee-pipeline.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/rsna-knee-pipeline.spec.ts) | Automated Test Suites (Playwright & Vitest) | 36 | 0.01% | 15.8 hrs | Low |
| [generate_clinical_typeface.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/generate_clinical_typeface.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 36 | 0.01% | 15.8 hrs | Low |
| [chronobiology-matrix-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/chronobiology-matrix-lens-tab.component.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Nominal |
| [billing-dashboard.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/billing-dashboard.component.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Low |
| [eyes-free-camera-scribe.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eyes-free-camera-scribe.component.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Nominal |
| [intake-toolbar.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/intake-toolbar.component.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Nominal |
| [onc-dsi-transparency-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/onc-dsi-transparency-card.component.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | High |
| [element.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/element.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Low |
| [eyes-free-accessibility.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/eyes-free-accessibility.service.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Nominal |
| [infinite-clinical-synthesis.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/infinite-clinical-synthesis.service.spec.ts) | Web Client (Angular & SSR) | 35 | 0.01% | 15.4 hrs | Nominal |
| [dr_gulliver.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/dr_gulliver.py) | Python FastAPI Sidecar & ML Engines | 35 | 0.01% | 15.4 hrs | Low |
| [notification.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/services/notification.ts) | Python FastAPI Sidecar & ML Engines | 35 | 0.01% | 15.4 hrs | Nominal |
| [test_onnx_engine.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_onnx_engine.py) | Python FastAPI Sidecar & ML Engines | 35 | 0.01% | 15.4 hrs | Low |
| [clinical-ux-evaluation-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-ux-evaluation-hub.component.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [compassionate-checkin-guardian.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/compassionate-checkin-guardian.component.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [pharmacogenomics-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/pharmacogenomics-card.component.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [vertex-model-garden-portal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/vertex-model-garden-portal.component.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Low |
| [eyes-free-camera-scribe.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/eyes-free-camera-scribe.service.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [molecular-docking.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/molecular-docking.service.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [osce-trainer.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/osce-trainer.service.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [osha-workplace-safety.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/osha-workplace-safety.service.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | High |
| [university-league.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/university-league.service.spec.ts) | Web Client (Angular & SSR) | 34 | 0.01% | 14.9 hrs | Nominal |
| [insight_grid_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/synthesis/insight_grid_widget.dart) | Flutter Mobile Companion (Dart) | 34 | 0.01% | 14.9 hrs | Low |
| [local_ehr_bridge.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/mcp_servers/local_ehr_bridge.py) | Python FastAPI Sidecar & ML Engines | 34 | 0.01% | 14.9 hrs | Low |
| [pubmed.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/pubmed.ts) | Python FastAPI Sidecar & ML Engines | 34 | 0.01% | 14.9 hrs | Low |
| [app.component.html](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.html) | AVS Therapy Companion (Angular) | 34 | 0.01% | 14.9 hrs | Low |
| [fetch_kaggle_log.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/fetch_kaggle_log.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 34 | 0.01% | 14.9 hrs | Low |
| [fix_vitest_imports.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/fix_vitest_imports.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 34 | 0.01% | 14.9 hrs | Low |
| [mcp-warmup.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/mcp-warmup.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 34 | 0.01% | 14.9 hrs | Low |
| [raw-server.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sandbox/raw-server.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 34 | 0.01% | 14.9 hrs | Low |
| [audio-respiratory-visualizer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/audio-respiratory-visualizer.component.spec.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Nominal |
| [eyes-free-accessibility-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/eyes-free-accessibility-hub.component.spec.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Nominal |
| [community-testimonial-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/community-testimonial-modal.component.spec.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | High |
| [clinical-model-studio-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-model-studio-card.component.spec.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Nominal |
| [insight-card.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-card.component.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Nominal |
| [isi.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/isi.assessment.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Low |
| [sibi.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/sibi.assessment.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Low |
| [image-optimization.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.ts) | Web Client (Angular & SSR) | 33 | 0.01% | 14.5 hrs | Nominal |
| [google-health-consent-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/google-health-consent-modal.component.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [cdisc-rwe-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/cdisc-rwe-card.component.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [hidden-partners-registry.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/hidden/hidden-partners-registry.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | High |
| [legalzoom-partner-connector.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/hidden/legalzoom-partner-connector.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [seatgeek.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/seatgeek.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [clinical-game-theory.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-game-theory.service.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [cgm-time-in-range.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/cgm-time-in-range.service.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [microsoft-health-nuance.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/microsoft-health-nuance.service.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [research-lectures.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/research-lectures.service.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [stress-intervention.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/stress-intervention.service.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | High |
| [webgpu-spatial-digital-twin.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webgpu-spatial-digital-twin.service.spec.ts) | Web Client (Angular & SSR) | 32 | 0.01% | 14.1 hrs | Nominal |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/engines/__init__.py) | Python FastAPI Sidecar & ML Engines | 32 | 0.01% | 14.1 hrs | Low |
| [functional-medicine-matrix-lens-tab.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/functional-medicine-matrix-lens-tab.component.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [google-health-sync-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/google-health-sync-hud.component.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | High |
| [clinical-trajectory-reader-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/clinical-trajectory-reader-modal.component.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [pathways-moe-badge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/pathways-moe-badge.component.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [safe-html.pipe.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/pipes/safe-html.pipe.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | High |
| [bio-theme-song-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/bio-theme-song-engine.service.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [dn4.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/dn4.assessment.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Low |
| [peer-network.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/peer-network.service.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [tri-paradigm-swarm.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/tri-paradigm-swarm.service.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [yoga-asana-coaching.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/yoga-asana-coaching.service.spec.ts) | Web Client (Angular & SSR) | 31 | 0.01% | 13.6 hrs | Nominal |
| [avs-session-scribe.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/avs-session-scribe.service.spec.ts) | AVS Therapy Companion (Angular) | 31 | 0.01% | 13.6 hrs | High |
| [fetch_inference_output.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/fetch_inference_output.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 31 | 0.01% | 13.6 hrs | Low |
| [sanitize-docs-study.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sanitize-docs-study.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 31 | 0.01% | 13.6 hrs | Low |
| [ai-confidence-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/ai-confidence-hud.component.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [biophilic-pathway-3d-viewer.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/anatomy-3d/biophilic-pathway-3d-viewer.component.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [art-therapy-canvas.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/art-therapy-canvas.component.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [clinical-mission-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-mission-hud.component.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [dpop-validator.middleware.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/middleware/dpop-validator.middleware.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Low |
| [moca.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/moca.assessment.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Low |
| [pivot-pulse-agent.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/pivot-pulse-agent.service.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [population-health-equity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/population-health-equity.service.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [walmart-affiliate.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/walmart-affiliate.service.spec.ts) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Nominal |
| [pocketgull-icon-font.css](file:///C:/Users/philg/Pocketgull/pocketgull/src/styles/pocketgull-icon-font.css) | Web Client (Angular & SSR) | 30 | 0.01% | 13.2 hrs | Low |
| [secure_key.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/secure_key.dart) | Flutter Mobile Companion (Dart) | 30 | 0.01% | 13.2 hrs | Low |
| [pubmed_search.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/mcp_servers/pubmed_search.py) | Python FastAPI Sidecar & ML Engines | 30 | 0.01% | 13.2 hrs | Low |
| [setup.ts](file:///C:/Users/philg/Pocketgull/pocketgull/tests/setup.ts) | Automated Test Suites (Playwright & Vitest) | 30 | 0.01% | 13.2 hrs | Low |
| [bibliotherapy-hobby-prescriber.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/bibliotherapy-hobby-prescriber.component.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Nominal |
| [gaap-tribal-stewardship-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/gaap-tribal-stewardship-card.component.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | High |
| [cds-transparency.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cds-transparency.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Nominal |
| [cssrs.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/cssrs.assessment.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Low |
| [navigation-shell.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/navigation-shell.service.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Nominal |
| [optical-camera-vision.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/optical-camera-vision.service.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Nominal |
| [transit-wellness-gateway.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/transit-wellness-gateway.service.spec.ts) | Web Client (Angular & SSR) | 29 | 0.01% | 12.7 hrs | Nominal |
| [sleep-insomnia-protocol.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/sleep-insomnia-protocol.service.spec.ts) | AVS Therapy Companion (Angular) | 29 | 0.01% | 12.7 hrs | High |
| [puppeteer-debug.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sandbox/puppeteer-debug.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 29 | 0.01% | 12.7 hrs | Low |
| [clinical-icons.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/assets/clinical-icons.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Low |
| [federated-learning-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/federated-learning-hud.component.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [nng-usability-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/nng-usability-hud.component.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [dpop-auth.interceptor.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/interceptors/dpop-auth.interceptor.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Low |
| [legalzoom.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/legalzoom.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [prapare.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/prapare.assessment.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Low |
| [sarcf.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/sarcf.assessment.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Low |
| [ibm-watsonx-clinical.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ibm-watsonx-clinical.service.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [microsoft-ibm-clinical-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/microsoft-ibm-clinical-bridge.service.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [paradigm-arbiter.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/paradigm-arbiter.service.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [travel-localization.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/travel-localization.service.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [travel-sports-ticketing.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/travel-sports-ticketing.service.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [visual-haptic-entrainment.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/visual-haptic-entrainment.service.spec.ts) | Web Client (Angular & SSR) | 28 | 0.01% | 12.3 hrs | Nominal |
| [run-python-tests.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-python-tests.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 28 | 0.01% | 12.3 hrs | Low |
| [provider-treatment-network.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/provider-treatment-network.component.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [auditc.assessment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/auditc.assessment.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Low |
| [clinical-biochemistry.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-biochemistry.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [helpful-lists.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/helpful-lists.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [interactive-onboarding-tour.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/interactive-onboarding-tour.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [joy-playful-flourishing.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/joy-playful-flourishing.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [legal-consent-sovereignty.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/legal-consent-sovereignty.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [vocal-biomarker.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/vocal-biomarker.service.spec.ts) | Web Client (Angular & SSR) | 27 | 0.01% | 11.9 hrs | Nominal |
| [test_readmission_risk.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_readmission_risk.py) | Python FastAPI Sidecar & ML Engines | 27 | 0.01% | 11.9 hrs | Low |
| [qeeg-entrainment.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/qeeg-entrainment.service.spec.ts) | AVS Therapy Companion (Angular) | 27 | 0.01% | 11.9 hrs | High |
| [publish-prs-to-astro.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/publish-prs-to-astro.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 27 | 0.01% | 11.9 hrs | Low |
| [seven-generations-stewardship-lens-tab.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report/seven-generations-stewardship-lens-tab.component.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [plan-differential-inspector.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/plan-differential-inspector.component.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Low |
| [space-health-hud.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/space-health-hud.component.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [model-armor.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/model-armor.service.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [academic-lab-recruitment.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/academic-lab-recruitment.service.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [intelligence.provider.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Low |
| [audit.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/audit.service.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | High |
| [hyperscaler-deployment.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hyperscaler-deployment.service.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | High |
| [soap-note-generator.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/soap-note-generator.service.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [wordpress-articles.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/wordpress-articles.service.spec.ts) | Web Client (Angular & SSR) | 26 | 0.01% | 11.4 hrs | Nominal |
| [phi_sanitizer.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/security/phi_sanitizer.py) | Python FastAPI Sidecar & ML Engines | 26 | 0.01% | 11.4 hrs | Low |
| [check_env.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/check_env.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 26 | 0.01% | 11.4 hrs | Low |
| [clip_origami_seagull.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/clip_origami_seagull.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 26 | 0.01% | 11.4 hrs | Low |
| [filter_training_log.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/filter_training_log.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 26 | 0.01% | 11.4 hrs | Low |
| [deep-space-cds-terminal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/deep-space-cds-terminal.component.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [hyperscaler-marketplace-portal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/hyperscaler-marketplace-portal.component.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [institutional-compliance-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/institutional-compliance-modal.component.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [saif-security-posture-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/saif-security-posture-card.component.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [hidden-partners-registry.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/hidden/hidden-partners-registry.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [active-defense-tarpit.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/server/services/active-defense-tarpit.service.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [gaap-tribal-stewardship.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/gaap-tribal-stewardship.service.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | High |
| [secure-key.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/secure-key.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [who-cdc-health-equity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/who-cdc-health-equity.service.spec.ts) | Web Client (Angular & SSR) | 25 | 0.01% | 11.0 hrs | Nominal |
| [create_dummy_edf.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/create_dummy_edf.py) | Python FastAPI Sidecar & ML Engines | 25 | 0.01% | 11.0 hrs | Low |
| [edf_parser.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/data_pipeline/edf_parser.py) | Python FastAPI Sidecar & ML Engines | 25 | 0.01% | 11.0 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/index.ts) | Python FastAPI Sidecar & ML Engines | 25 | 0.01% | 11.0 hrs | Low |
| [app.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.spec.ts) | AVS Therapy Companion (Angular) | 25 | 0.01% | 11.0 hrs | Low |
| [gcloud-preflight.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/gcloud-preflight.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 25 | 0.01% | 11.0 hrs | Nominal |
| [clinical-cds-disclaimer-banner.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-cds-disclaimer-banner.component.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [clinical-gauge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-gauge.component.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Low |
| [smart-fhir-launcher.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/smart-fhir-launcher.component.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [stanford-hci-clinical-lens.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/stanford-hci-clinical-lens.component.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [travel-sports-ticketing-hub.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/travel-sports-ticketing-hub.component.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [firebase.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/lib/firebase.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Low |
| [hidden-partners-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/hidden/hidden-partners-modal.component.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [boredom-connection-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/boredom-connection-engine.service.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [pdf-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/pdf-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [impact-partner-channels.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/impact-partner-channels.service.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [or-tools-goal-optimizer.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/or-tools-goal-optimizer.service.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [socratic-jargon-dictionary.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/socratic-jargon-dictionary.service.spec.ts) | Web Client (Angular & SSR) | 24 | 0.01% | 10.5 hrs | Nominal |
| [bq_dryrun_check.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/bq_dryrun_check.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 24 | 0.01% | 10.5 hrs | Low |
| [deploy_pocketgull_fonts.py](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/deploy_pocketgull_fonts.py) | Clinical Tooling, Data Pipelines & Dart Scripts | 24 | 0.01% | 10.5 hrs | Low |
| [tcm-pulse-tongue-matrix.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/tcm-pulse-tongue-matrix.component.spec.ts) | Web Client (Angular & SSR) | 23 | 0.01% | 10.1 hrs | Nominal |
| [ai-provider.types.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai-provider.types.ts) | Web Client (Angular & SSR) | 23 | 0.01% | 10.1 hrs | Low |
| [pharmacogenomics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/pharmacogenomics.service.spec.ts) | Web Client (Angular & SSR) | 23 | 0.01% | 10.1 hrs | Nominal |
| [public-service-corps.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/public-service-corps.service.spec.ts) | Web Client (Angular & SSR) | 23 | 0.01% | 10.1 hrs | Nominal |
| [universal-living-will.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/universal-living-will.service.spec.ts) | Web Client (Angular & SSR) | 23 | 0.01% | 10.1 hrs | Nominal |
| [prof_puffin.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/prof_puffin.py) | Python FastAPI Sidecar & ML Engines | 23 | 0.01% | 10.1 hrs | Low |
| [patients.ts](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/patients.ts) | Python FastAPI Sidecar & ML Engines | 23 | 0.01% | 10.1 hrs | Low |
| [contactless-rppg.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/contactless-rppg.service.spec.ts) | AVS Therapy Companion (Angular) | 23 | 0.01% | 10.1 hrs | High |
| [dyadic-co-regulation.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/dyadic-co-regulation.service.spec.ts) | AVS Therapy Companion (Angular) | 23 | 0.01% | 10.1 hrs | High |
| [spatial-ambisonics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/spatial-ambisonics.service.spec.ts) | AVS Therapy Companion (Angular) | 23 | 0.01% | 10.1 hrs | High |
| [puppeteer-standalone.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sandbox/puppeteer-standalone.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 23 | 0.01% | 10.1 hrs | Low |
| [impact-channels-linking-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/impact-channels-linking-card.component.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [legal-consent-sovereignty-badge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/legal-consent-sovereignty-badge.component.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [onboarding-tour-overlay.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/onboarding-tour-overlay.component.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [community-eco-localization.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/community-eco-localization.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [data-adventure-engine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/data-adventure-engine.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [html-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/html-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [green-computing-sustainability.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/green-computing-sustainability.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [biometric-sensor-fusion.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/biometric-sensor-fusion.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [lateral-thinking-health.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/lateral-thinking-health.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [stanford-hci-clinical-lens.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/stanford-hci-clinical-lens.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [youth-mentorship.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/youth-mentorship.service.spec.ts) | Web Client (Angular & SSR) | 22 | 0.01% | 9.7 hrs | Nominal |
| [documentation_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/documentation_service.dart) | Flutter Mobile Companion (Dart) | 22 | 0.01% | 9.7 hrs | Nominal |
| [markdown_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/markdown_service.dart) | Flutter Mobile Companion (Dart) | 22 | 0.01% | 9.7 hrs | Nominal |
| [ingest-public-data.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/ingest-public-data.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 22 | 0.01% | 9.7 hrs | Low |
| [retrain-models.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/retrain-models.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 22 | 0.01% | 9.7 hrs | Low |
| [run-e2e.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-e2e.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 22 | 0.01% | 9.7 hrs | Low |
| [legalzoom.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/legalzoom.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [seatgeek.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/seatgeek.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [ticketmaster.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/ticketmaster.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [clinical-trial-matcher.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-trial-matcher.service.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [elder-bridge.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/elder-bridge.service.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [multilingual-equity.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/multilingual-equity.service.spec.ts) | Web Client (Angular & SSR) | 21 | 0.01% | 9.2 hrs | Nominal |
| [make-deploy-tar.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/make-deploy-tar.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 21 | 0.01% | 9.2 hrs | Low |
| [puppeteer-trace.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sandbox/puppeteer-trace.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 21 | 0.01% | 9.2 hrs | Low |
| [clinical-cds-disclaimer-banner.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/clinical-cds-disclaimer-banner.component.spec.ts) | Web Client (Angular & SSR) | 20 | 0.01% | 8.8 hrs | Low |
| [airlines.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/partners/airlines.spec.ts) | Web Client (Angular & SSR) | 20 | 0.01% | 8.8 hrs | Nominal |
| [fhir-r7-horizon.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir/fhir-r7-horizon.service.spec.ts) | Web Client (Angular & SSR) | 20 | 0.01% | 8.8 hrs | Nominal |
| [bio-haptic-feedback.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/hardware/bio-haptic-feedback.service.spec.ts) | Web Client (Angular & SSR) | 20 | 0.01% | 8.8 hrs | Nominal |
| [webllm-health.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/webllm-health.service.spec.ts) | Web Client (Angular & SSR) | 20 | 0.01% | 8.8 hrs | Nominal |
| [nightingale.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/nightingale.py) | Python FastAPI Sidecar & ML Engines | 20 | 0.01% | 8.8 hrs | Low |
| [rx_robin.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/rx_robin.py) | Python FastAPI Sidecar & ML Engines | 20 | 0.01% | 8.8 hrs | Low |
| [copy-fonts.js](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/copy-fonts.js) | Clinical Tooling, Data Pipelines & Dart Scripts | 20 | 0.01% | 8.8 hrs | Low |
| [parse-lighthouse.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/parse-lighthouse.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 20 | 0.01% | 8.8 hrs | Low |
| [run-playwright-e2e.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-playwright-e2e.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 20 | 0.01% | 8.8 hrs | Low |
| [pubgemma.provider.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/pubgemma.provider.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | Low |
| [art-therapy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/art-therapy.service.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | Nominal |
| [double-flip-state-machine.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/double-flip-state-machine.service.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | Nominal |
| [edge-tamper-guard.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/edge-tamper-guard.service.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | Nominal |
| [ibm-watsonx-clinical.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ibm-watsonx-clinical.service.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | High |
| [microsoft-health-nuance.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/microsoft-health-nuance.service.spec.ts) | Web Client (Angular & SSR) | 19 | 0.01% | 8.3 hrs | High |
| [debt_zen_solver_test.dart](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/dart/debt_zen_solver_test.dart) | Clinical Tooling, Data Pipelines & Dart Scripts | 19 | 0.01% | 8.3 hrs | Low |
| [clinical-gauge-svg.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/clinical-gauge-svg.component.spec.ts) | Web Client (Angular & SSR) | 18 | 0.01% | 7.9 hrs | Low |
| [globals.d.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/globals.d.ts) | Web Client (Angular & SSR) | 18 | 0.01% | 7.9 hrs | Low |
| [native-json-export-strategy.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/export/native-json-export-strategy.service.spec.ts) | Web Client (Angular & SSR) | 18 | 0.01% | 7.9 hrs | Nominal |
| [test_outbreak_risk.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_outbreak_risk.py) | Python FastAPI Sidecar & ML Engines | 18 | 0.01% | 7.9 hrs | Low |
| [cms-rpm-superbill-modal.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/modals/cms-rpm-superbill-modal.component.spec.ts) | Web Client (Angular & SSR) | 17 | 0.01% | 7.5 hrs | Nominal |
| [risk-tier-badge.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/shared/risk-tier-badge.component.spec.ts) | Web Client (Angular & SSR) | 17 | 0.01% | 7.5 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mock-patients/index.ts) | Web Client (Angular & SSR) | 17 | 0.01% | 7.5 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/instruments/index.ts) | Web Client (Angular & SSR) | 17 | 0.01% | 7.5 hrs | Low |
| [physics-biophysics.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/physics-biophysics.service.spec.ts) | Web Client (Angular & SSR) | 17 | 0.01% | 7.5 hrs | Nominal |
| [markdown.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/markdown.service.ts) | Web Client (Angular & SSR) | 16 | 0.01% | 7.0 hrs | Nominal |
| [web_local_intelligence.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/web_local_intelligence.dart) | Flutter Mobile Companion (Dart) | 16 | 0.01% | 7.0 hrs | Nominal |
| [kaggle-challenge-card.component.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/components/kaggle-challenge-card.component.spec.ts) | Web Client (Angular & SSR) | 15 | 0.01% | 6.6 hrs | Low |
| [vertex-ai-model-garden.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/vertex-ai-model-garden.service.spec.ts) | Web Client (Angular & SSR) | 15 | 0.01% | 6.6 hrs | Nominal |
| [sync-vertex-docs.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/sync-vertex-docs.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 15 | 0.01% | 6.6 hrs | Low |
| [acronym-expander.pipe.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/pipes/acronym-expander.pipe.ts) | Web Client (Angular & SSR) | 14 | 0.01% | 6.1 hrs | High |
| [provider-treatment-network.service.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/provider-treatment-network.service.spec.ts) | Web Client (Angular & SSR) | 14 | 0.01% | 6.1 hrs | Nominal |
| [test_dr_gulliver.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/tests/test_dr_gulliver.py) | Python FastAPI Sidecar & ML Engines | 14 | 0.01% | 6.1 hrs | Low |
| [run-vitest.mjs](file:///C:/Users/philg/Pocketgull/pocketgull/scripts/run-vitest.mjs) | Clinical Tooling, Data Pipelines & Dart Scripts | 14 | 0.01% | 6.1 hrs | Low |
| [environment.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/environments/environment.ts) | Web Client (Angular & SSR) | 13 | 0.00% | 5.7 hrs | Low |
| [medical-decoder.pipe.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/pipes/medical-decoder.pipe.ts) | Web Client (Angular & SSR) | 13 | 0.00% | 5.7 hrs | High |
| [index.html](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/index.html) | AVS Therapy Companion (Angular) | 13 | 0.00% | 5.7 hrs | Low |
| [sfi-swarm-simulator.spec.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/sfi-swarm-simulator.spec.ts) | Web Client (Angular & SSR) | 12 | 0.00% | 5.3 hrs | Nominal |
| [app.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.ts) | AVS Therapy Companion (Angular) | 12 | 0.00% | 5.3 hrs | Nominal |
| [python-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/python-bridge.service.ts) | AVS Therapy Companion (Angular) | 12 | 0.00% | 5.3 hrs | Nominal |
| [chat_message.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/models/chat_message.dart) | Flutter Mobile Companion (Dart) | 11 | 0.00% | 4.8 hrs | Low |
| [web_download_web.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/web_download_web.dart) | Flutter Mobile Companion (Dart) | 9 | 0.00% | 4.0 hrs | Low |
| [body_viewer_widget.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/widgets/body_viewer_widget.dart) | Flutter Mobile Companion (Dart) | 9 | 0.00% | 4.0 hrs | Low |
| [image-sizes.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/constants/image-sizes.ts) | Web Client (Angular & SSR) | 8 | 0.00% | 3.5 hrs | Low |
| [webllm.worker.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/workers/webllm.worker.ts) | Web Client (Angular & SSR) | 8 | 0.00% | 3.5 hrs | Low |
| [gcp-config.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/config/gcp-config.ts) | Web Client (Angular & SSR) | 7 | 0.00% | 3.1 hrs | Low |
| [empty.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/mocks/empty.ts) | Web Client (Angular & SSR) | 7 | 0.00% | 3.1 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-ai/index.ts) | Web Client (Angular & SSR) | 7 | 0.00% | 3.1 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/fhir-interop/index.ts) | Web Client (Angular & SSR) | 5 | 0.00% | 2.2 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/neuro-somatic/index.ts) | Web Client (Angular & SSR) | 5 | 0.00% | 2.2 hrs | Low |
| [web_download.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/web_download.dart) | Flutter Mobile Companion (Dart) | 5 | 0.00% | 2.2 hrs | Low |
| [main.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/main.ts) | AVS Therapy Companion (Angular) | 5 | 0.00% | 2.2 hrs | Low |
| [app.config.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.config.ts) | AVS Therapy Companion (Angular) | 4 | 0.00% | 1.8 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/models/index.ts) | Web Client (Angular & SSR) | 3 | 0.00% | 1.3 hrs | Low |
| [intelligence.provider.token.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.token.ts) | Web Client (Angular & SSR) | 3 | 0.00% | 1.3 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/integrative-paradigms/index.ts) | Web Client (Angular & SSR) | 3 | 0.00% | 1.3 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/agents/__init__.py) | Python FastAPI Sidecar & ML Engines | 3 | 0.00% | 1.3 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/tests/__init__.py) | Python FastAPI Sidecar & ML Engines | 3 | 0.00% | 1.3 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/__init__.py) | Python FastAPI Sidecar & ML Engines | 3 | 0.00% | 1.3 hrs | Low |
| [avs-therapy.component.css](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.css) | AVS Therapy Companion (Angular) | 3 | 0.00% | 1.3 hrs | Low |
| [styles.css](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/styles.css) | AVS Therapy Companion (Angular) | 3 | 0.00% | 1.3 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/cardio-vitals/index.ts) | Web Client (Angular & SSR) | 2 | 0.00% | 0.9 hrs | Low |
| [data.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/services/clinical-assessments/data.ts) | Web Client (Angular & SSR) | 2 | 0.00% | 0.9 hrs | Low |
| [version.ts](file:///C:/Users/philg/Pocketgull/pocketgull/src/version.ts) | Web Client (Angular & SSR) | 2 | 0.00% | 0.9 hrs | Low |
| [web_download_stub.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/web_download_stub.dart) | Flutter Mobile Companion (Dart) | 2 | 0.00% | 0.9 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/export/__init__.py) | Python FastAPI Sidecar & ML Engines | 2 | 0.00% | 0.9 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/inference/__init__.py) | Python FastAPI Sidecar & ML Engines | 2 | 0.00% | 0.9 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/models/__init__.py) | Python FastAPI Sidecar & ML Engines | 2 | 0.00% | 0.9 hrs | Low |
| [__init__.py](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_api/training/__init__.py) | Python FastAPI Sidecar & ML Engines | 2 | 0.00% | 0.9 hrs | Low |
| [local_intelligence_service.dart](file:///C:/Users/philg/Pocketgull/pocketgull/pocketgull_flutter/lib/services/local_intelligence_service.dart) | Flutter Mobile Companion (Dart) | 1 | 0.00% | 0.4 hrs | Low |

---

*Report generated automatically by `scripts/estimate-effort-detailed.js`. All metrics adhere to the COCOMO II Post-Architecture Model.*
