# Feature Parity Matrix

This document maps the components and services from the live Angular application to the Flutter companion suite to track architectural parity.

| Feature / Base Name | Angular (Live) | Flutter (Companion) | Status |
| :--- | :--- | :--- | :--- |
| **aaas breakthroughs suite** | `src/components/aaas/aaas-breakthroughs-suite.component.ts` | - | ❌ Missing in Flutter |
| **academic lab recruitment** | `src/services/academic-lab-recruitment.service.ts` | - | ❌ Missing in Flutter |
| **acronym expander** | `src/services/acronym-expander.service.ts`<br>`src/pipes/acronym-expander.pipe.ts` | - | ❌ Missing in Flutter |
| **actuarial glee album** | `src/components/actuarial-glee-album.component.ts` | - | ❌ Missing in Flutter |
| **actuarial glee audio** | `src/services/actuarial-glee-audio.service.ts` | - | ❌ Missing in Flutter |
| **actuarial longevity** | `src/services/actuarial-longevity.service.ts` | - | ❌ Missing in Flutter |
| **actuarial qaly calculator** | `src/components/actuarial-qaly-calculator.component.ts` | - | ❌ Missing in Flutter |
| **adaptive green routing** | `src/services/adaptive-green-routing.service.ts` | - | ❌ Missing in Flutter |
| **adaptive green routing hud** | `src/components/adaptive-green-routing-hud.component.ts` | - | ❌ Missing in Flutter |
| **adaptive intake** | `src/services/adaptive-intake.service.ts` | - | ❌ Missing in Flutter |
| **adk live** | `src/services/ai/adk-live.service.ts` | - | ❌ Missing in Flutter |
| **adobe firefly texture** | `src/services/adobe-firefly-texture.service.ts` | - | ❌ Missing in Flutter |
| **agent personas** | `src/services/agent-personas.ts` | `pocketgull_flutter/lib/services/agent_personas.dart` | ✅ Parity |
| **ai cache** | `src/services/ai-cache.service.ts` | `pocketgull_flutter/lib/services/ai_cache_service.dart` | ✅ Parity |
| **ai confidence calibration** | `src/services/ai-confidence-calibration.service.ts` | - | ❌ Missing in Flutter |
| **ai confidence hud** | `src/components/ai-confidence-hud.component.ts` | - | ❌ Missing in Flutter |
| **ai provider.types** | `src/services/ai-provider.types.ts` | - | ❌ Missing in Flutter |
| **aiga model augmentation** | `src/services/aiga-model-augmentation.service.ts` | - | ❌ Missing in Flutter |
| **akovos longevity** | `src/services/akovos-longevity.service.ts` | - | ❌ Missing in Flutter |
| **akovos longevity hub** | `src/components/akovos-longevity-hub.component.ts` | - | ❌ Missing in Flutter |
| **alpha stem** | `src/services/alpha-stem.service.ts` | - | ❌ Missing in Flutter |
| **alpha stem viewer** | `src/components/shared/alpha-stem-viewer.component.ts` | - | ❌ Missing in Flutter |
| **alphagenome regulatory** | `src/services/alphagenome-regulatory.service.ts` | - | ❌ Missing in Flutter |
| **alphagenome regulatory card** | `src/components/alphagenome-regulatory-card.component.ts` | - | ❌ Missing in Flutter |
| **amazon creators api** | `src/services/amazon-creators-api.service.ts` | - | ❌ Missing in Flutter |
| **amazon product card** | `src/components/shared/amazon-product-card.component.ts` | - | ❌ Missing in Flutter |
| **ambient clinical scribe** | `src/components/ambient-clinical-scribe.component.ts`<br>`src/components/scribe/ambient-clinical-scribe.component.ts`<br>`src/services/ambient-clinical-scribe.service.ts` | - | ❌ Missing in Flutter |
| **ambient flow player** | `src/components/shared/ambient-flow-player.component.ts` | - | ❌ Missing in Flutter |
| **ambient flow soundscape** | `src/services/ambient-flow-soundscape.service.ts` | - | ❌ Missing in Flutter |
| **ambient lighting** | `src/services/ambient-lighting.service.ts` | `pocketgull_flutter/lib/services/ambient_lighting_service.dart` | ✅ Parity |
| **ambient living space dashboard** | `src/components/ambient-living-space-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **ambient scribe** | `src/services/ambient-scribe.service.ts` | - | ❌ Missing in Flutter |
| **ambient soap parser** | `src/services/ambient-soap-parser.service.ts` | - | ❌ Missing in Flutter |
| **analysis** | - | `pocketgull_flutter/lib/providers/analysis_provider.dart` | ⚠️ Flutter Only |
| **analysis container** | `src/components/analysis-container.component.ts` | `pocketgull_flutter/lib/widgets/analysis_container_widget.dart` | ✅ Parity |
| **analysis report** | `src/components/analysis-report.component.ts` | `pocketgull_flutter/lib/widgets/analysis_report_widget.dart` | ✅ Parity |
| **analysis report.types** | `src/components/analysis-report.types.ts` | - | ❌ Missing in Flutter |
| **androscoggin foraging phytoncide** | `src/components/androscoggin-foraging-phytoncide.component.ts` | - | ❌ Missing in Flutter |
| **anti confirmation bias** | - | `pocketgull_flutter/lib/widgets/anti_confirmation_bias_widget.dart` | ⚠️ Flutter Only |
| **api contracts.types** | `src/services/api-contracts.types.ts` | - | ❌ Missing in Flutter |
| **api key manager** | `src/components/api-key-manager.component.ts` | - | ❌ Missing in Flutter |
| **api pricing** | `src/components/api-pricing.component.ts` | - | ❌ Missing in Flutter |
| **app colors** | - | `pocketgull_flutter/lib/theme/app_colors.dart` | ⚠️ Flutter Only |
| **app licensing guard** | `src/services/app-licensing-guard.service.ts` | - | ❌ Missing in Flutter |
| **app theme** | - | `pocketgull_flutter/lib/theme/app_theme.dart` | ⚠️ Flutter Only |
| **aria score hud** | `src/components/aria-score-hud/aria-score-hud.component.ts` | - | ❌ Missing in Flutter |
| **aria scoring** | `src/services/aria-scoring.service.ts` | - | ❌ Missing in Flutter |
| **art therapy** | `src/services/art-therapy.service.ts` | - | ❌ Missing in Flutter |
| **art therapy canvas** | `src/components/art-therapy-canvas.component.ts` | - | ❌ Missing in Flutter |
| **articles reader** | `src/components/articles-reader.component.ts` | - | ❌ Missing in Flutter |
| **assessment registry** | `src/services/clinical-assessments/assessment-registry.ts` | - | ❌ Missing in Flutter |
| **assessments lens tab** | `src/components/analysis-report/assessments-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **athletic protocol** | `src/services/athletic-protocol.service.ts` | `pocketgull_flutter/lib/services/athletic_protocol_service.dart` | ✅ Parity |
| **audio respiratory analyzer** | `src/services/audio-respiratory-analyzer.service.ts` | - | ❌ Missing in Flutter |
| **audio respiratory visualizer** | `src/components/audio-respiratory-visualizer.component.ts` | - | ❌ Missing in Flutter |
| **audio websocket stream** | - | `pocketgull_flutter/lib/services/audio_websocket_stream_service.dart` | ⚠️ Flutter Only |
| **audit** | `src/services/audit.service.ts` | `pocketgull_flutter/lib/services/audit_service.dart` | ✅ Parity |
| **auditc.assessment** | `src/services/clinical-assessments/instruments/auditc.assessment.ts` | - | ❌ Missing in Flutter |
| **austere research** | `src/services/austere-research.service.ts` | - | ❌ Missing in Flutter |
| **austere research hud** | `src/components/austere-research-hud/austere-research-hud.component.ts` | - | ❌ Missing in Flutter |
| **auth** | `src/services/auth.service.ts` | `pocketgull_flutter/lib/services/auth_service.dart` | ✅ Parity |
| **auth sso** | `src/services/auth-sso.service.ts` | - | ❌ Missing in Flutter |
| **autonomic coherence bridge** | `src/components/autonomic-coherence-bridge.component.ts`<br>`src/services/autonomic-coherence-bridge.service.ts` | - | ❌ Missing in Flutter |
| **avian sea shanty** | `src/services/avian-sea-shanty.service.ts` | - | ❌ Missing in Flutter |
| **avian sea shanty deck** | `src/components/avian-sea-shanty-deck.component.ts` | - | ❌ Missing in Flutter |
| **avs cymatics visualizer** | `src/components/avs-cymatics-visualizer.component.ts` | - | ❌ Missing in Flutter |
| **avs engine** | `src/services/avs-engine.service.ts` | - | ❌ Missing in Flutter |
| **awcim integrative prescriber** | `src/components/shared/awcim-integrative-prescriber.component.ts` | - | ❌ Missing in Flutter |
| **aws open data** | `src/services/aws-open-data.service.ts` | - | ❌ Missing in Flutter |
| **aws open data browser** | `src/components/research/aws-open-data-browser.component.ts` | - | ❌ Missing in Flutter |
| **ayurveda.assessment** | `src/services/clinical-assessments/instruments/ayurveda.assessment.ts` | - | ❌ Missing in Flutter |
| **ayurvedic systems suite** | `src/components/ayurvedic/ayurvedic-systems-suite.component.ts` | - | ❌ Missing in Flutter |
| **barrows clinical inquiry** | `src/services/barrows-clinical-inquiry.service.ts` | - | ❌ Missing in Flutter |
| **barrows clinical inquiry hub** | `src/components/barrows-clinical-inquiry-hub.component.ts` | - | ❌ Missing in Flutter |
| **bibliotherapy hobby prescriber** | `src/components/bibliotherapy-hobby-prescriber.component.ts` | - | ❌ Missing in Flutter |
| **bigquery cohort exporter** | `src/services/bigquery-cohort-exporter.service.ts` | - | ❌ Missing in Flutter |
| **billing dashboard** | `src/components/billing-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **bio haptic feedback** | `src/services/hardware/bio-haptic-feedback.service.ts` | - | ❌ Missing in Flutter |
| **bio symphony engine** | `src/services/bio-symphony-engine.service.ts` | - | ❌ Missing in Flutter |
| **bio symphony visualizer** | `src/components/bio-symphony-visualizer.component.ts` | - | ❌ Missing in Flutter |
| **bio theme song engine** | `src/services/bio-theme-song-engine.service.ts` | - | ❌ Missing in Flutter |
| **biochemical suite** | `src/components/biochemical-suite.component.ts` | - | ❌ Missing in Flutter |
| **biomarker matrix** | `src/components/biomarker-matrix.component.ts` | `pocketgull_flutter/lib/widgets/biomarker_matrix_widget.dart` | ✅ Parity |
| **biomarker velocity** | `src/services/biomarker-velocity.service.ts` | - | ❌ Missing in Flutter |
| **biomarker velocity card** | `src/components/biomarker-velocity-card.component.ts` | - | ❌ Missing in Flutter |
| **biomedical suite** | `src/components/suites/biomedical-suite.component.ts` | - | ❌ Missing in Flutter |
| **biometric history chart** | `src/components/biometric-history-chart.component.ts` | `pocketgull_flutter/lib/widgets/biometric_history_chart_widget.dart` | ✅ Parity |
| **biometric import** | `src/services/hardware/biometric-import.service.ts` | `pocketgull_flutter/lib/services/biometric_import_service.dart` | ✅ Parity |
| **biometric sensor fusion** | `src/services/hardware/biometric-sensor-fusion.service.ts` | - | ❌ Missing in Flutter |
| **biometric sensor fusion card** | `src/components/biometric-sensor-fusion-card.component.ts` | - | ❌ Missing in Flutter |
| **biomolecular physics** | `src/services/biomolecular-physics.service.ts` | - | ❌ Missing in Flutter |
| **bionic focus benchmark** | `src/components/shared/bionic-focus-benchmark.component.ts` | - | ❌ Missing in Flutter |
| **bionic reading** | `src/services/bionic-reading.service.ts` | `pocketgull_flutter/lib/services/bionic_reading_service.dart`<br>`pocketgull_flutter/lib/providers/bionic_reading_provider.dart` | ✅ Parity |
| **bionic text** | - | `pocketgull_flutter/lib/widgets/bionic_text_widget.dart` | ⚠️ Flutter Only |
| **biophilic pathway 3d viewer** | `src/components/anatomy-3d/biophilic-pathway-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **biophysical twin timeline** | `src/components/anatomy-3d/biophysical-twin-timeline.component.ts` | - | ❌ Missing in Flutter |
| **ble waveform oscilloscope** | - | `pocketgull_flutter/lib/widgets/ble_waveform_oscilloscope_widget.dart` | ⚠️ Flutter Only |
| **ble wearables** | `src/services/hardware/ble-wearables.service.ts` | `pocketgull_flutter/lib/services/ble_wearables_service.dart` | ✅ Parity |
| **ble wearables hud** | `src/components/ble-wearables-hud.component.ts` | - | ❌ Missing in Flutter |
| **body 3d viewer** | `src/components/anatomy-3d/body-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **body explorer game** | `src/components/body-explorer-game.component.ts` | - | ❌ Missing in Flutter |
| **body mesh factory** | `src/services/body-mesh-factory.service.ts` | - | ❌ Missing in Flutter |
| **body part geometry** | - | `pocketgull_flutter/lib/models/body_part_geometry.dart` | ⚠️ Flutter Only |
| **body viewer** | `src/components/anatomy-3d/body-viewer.component.ts` | `pocketgull_flutter/lib/widgets/body_viewer_widget.dart` | ✅ Parity |
| **boredom connection engine** | `src/services/boredom-connection-engine.service.ts` | - | ❌ Missing in Flutter |
| **box breathing wrapper** | - | `pocketgull_flutter/lib/widgets/box_breathing_wrapper.dart` | ⚠️ Flutter Only |
| **brand package generator** | `src/components/brand-package-generator.component.ts`<br>`src/services/brand-package-generator.service.ts` | - | ❌ Missing in Flutter |
| **bystander action suite** | `src/components/bystander-action-suite.component.ts` | - | ❌ Missing in Flutter |
| **camera pulse** | - | `pocketgull_flutter/lib/widgets/camera_pulse_widget.dart` | ⚠️ Flutter Only |
| **care plan print preview** | `src/components/care-plan-print-preview.component.ts` | - | ❌ Missing in Flutter |
| **caregiver bridge modal** | `src/components/modals/caregiver-bridge-modal.component.ts` | - | ❌ Missing in Flutter |
| **cdisc rwe card** | `src/components/shared/cdisc-rwe-card.component.ts` | - | ❌ Missing in Flutter |
| **cdisc rwe dossier** | `src/services/cdisc-rwe-dossier.service.ts` | - | ❌ Missing in Flutter |
| **cellular automata viewer** | `src/components/turing/cellular-automata-viewer.component.ts` | - | ❌ Missing in Flutter |
| **cellular biophysics** | `src/services/cellular-biophysics.service.ts` | - | ❌ Missing in Flutter |
| **cellular biophysics viewer** | `src/components/shared/cellular-biophysics-viewer.component.ts` | - | ❌ Missing in Flutter |
| **cern lhc 3d visualizer** | `src/components/anatomy-3d/cern-lhc-3d-visualizer.component.ts` | - | ❌ Missing in Flutter |
| **cgm time in range** | `src/components/cgm-time-in-range.component.ts`<br>`src/services/hardware/cgm-time-in-range.service.ts` | `pocketgull_flutter/lib/widgets/cgm_time_in_range_widget.dart` | ✅ Parity |
| **chat message** | - | `pocketgull_flutter/lib/models/chat_message.dart` | ⚠️ Flutter Only |
| **chromatin 3d fiber** | `src/components/turing/chromatin-3d-fiber.component.ts` | - | ❌ Missing in Flutter |
| **chrono clock decision rail** | `src/components/chrono-clock-decision-rail.component.ts` | - | ❌ Missing in Flutter |
| **chrono weekly meal planner** | `src/components/chrono-weekly-meal-planner.component.ts` | - | ❌ Missing in Flutter |
| **chronobiology matrix** | `src/components/chronobiology-matrix.component.ts` | - | ❌ Missing in Flutter |
| **chronobiology matrix lens tab** | `src/components/analysis-report/chronobiology-matrix-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **circadian** | - | `pocketgull_flutter/lib/models/circadian_types.dart` | ⚠️ Flutter Only |
| **circadian sleepiness** | `src/services/circadian-sleepiness.service.ts` | `pocketgull_flutter/lib/services/circadian_sleepiness_service.dart` | ✅ Parity |
| **citizen science telemetry** | `src/services/citizen-science-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **citizen science walk report** | `src/components/citizen-science-walk-report.component.ts` | - | ❌ Missing in Flutter |
| **clinic onboarding wizard** | `src/components/shared/clinic-onboarding-wizard.component.ts` | - | ❌ Missing in Flutter |
| **clinical act lens mapper** | `src/services/clinical-act-lens-mapper.service.ts` | - | ❌ Missing in Flutter |
| **clinical ai provider registry** | `src/services/clinical-ai-provider-registry.service.ts` | - | ❌ Missing in Flutter |
| **clinical assessments** | `src/services/clinical-assessments/clinical-assessments.service.ts` | - | ❌ Missing in Flutter |
| **clinical assessments suite** | `src/components/clinical-assessments-suite.component.ts` | - | ❌ Missing in Flutter |
| **clinical biochemistry** | `src/services/clinical-biochemistry.service.ts` | - | ❌ Missing in Flutter |
| **clinical cds disclaimer banner** | `src/components/clinical-cds-disclaimer-banner.component.ts` | - | ❌ Missing in Flutter |
| **clinical commercial hub** | `src/components/shared/clinical-commercial-hub.component.ts` | - | ❌ Missing in Flutter |
| **clinical data card** | `src/components/clinical-data-card.component.ts` | - | ❌ Missing in Flutter |
| **clinical defense guard** | `src/services/clinical-defense-guard.service.ts` | - | ❌ Missing in Flutter |
| **clinical defense guard card** | `src/components/shared/clinical-defense-guard-card.component.ts` | - | ❌ Missing in Flutter |
| **clinical evals** | `src/services/clinical-evals.service.ts` | - | ❌ Missing in Flutter |
| **clinical fine tuning orchestrator** | `src/services/clinical-fine-tuning-orchestrator.service.ts` | - | ❌ Missing in Flutter |
| **clinical game theory** | `src/services/clinical-game-theory.service.ts` | - | ❌ Missing in Flutter |
| **clinical gauge** | `src/components/clinical-gauge.component.ts` | `pocketgull_flutter/lib/widgets/clinical_gauge_widget.dart` | ✅ Parity |
| **clinical gauge svg** | `src/components/shared/clinical-gauge-svg.component.ts` | - | ❌ Missing in Flutter |
| **clinical holodeck viewer** | `src/components/clinical-holodeck-viewer.component.ts` | - | ❌ Missing in Flutter |
| **clinical icon** | `src/components/shared/clinical-icon.component.ts` | - | ❌ Missing in Flutter |
| **clinical icon generator** | `src/services/clinical-icon-generator.service.ts` | - | ❌ Missing in Flutter |
| **clinical intelligence** | `src/services/clinical-intelligence.service.ts` | `pocketgull_flutter/lib/services/clinical_intelligence_service.dart` | ✅ Parity |
| **clinical mandarinate exam** | `src/services/clinical-mandarinate-exam.service.ts` | - | ❌ Missing in Flutter |
| **clinical mandarinate exam card** | `src/components/shared/clinical-mandarinate-exam-card.component.ts` | - | ❌ Missing in Flutter |
| **clinical menu** | `src/components/clinical-menu.component.ts` | - | ❌ Missing in Flutter |
| **clinical mission hud** | `src/components/clinical-mission-hud.component.ts` | - | ❌ Missing in Flutter |
| **clinical model studio card** | `src/components/shared/clinical-model-studio-card.component.ts` | - | ❌ Missing in Flutter |
| **clinical moe router** | `src/services/clinical-moe-router.service.ts` | - | ❌ Missing in Flutter |
| **clinical prompts** | `src/services/clinical-prompts.ts` | `pocketgull_flutter/lib/services/clinical_prompts.dart` | ✅ Parity |
| **clinical reasoning stream** | `src/components/clinical-reasoning-stream.component.ts` | - | ❌ Missing in Flutter |
| **clinical risk calculator** | - | `pocketgull_flutter/lib/services/clinical_risk_calculator.dart` | ⚠️ Flutter Only |
| **clinical scorecard** | `src/components/clinical-scorecard.component.ts` | - | ❌ Missing in Flutter |
| **clinical sleep twin dashboard** | `src/components/clinical-sleep-twin-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **clinical storytelling** | `src/services/clinical-storytelling.service.ts` | - | ❌ Missing in Flutter |
| **clinical support agent** | `src/services/clinical-support-agent.service.ts` | - | ❌ Missing in Flutter |
| **clinical tool card** | `src/components/shared/clinical-tool-card.component.ts` | - | ❌ Missing in Flutter |
| **clinical tool workbench** | `src/components/clinical-tool-workbench.component.ts` | - | ❌ Missing in Flutter |
| **clinical trajectory biography** | `src/components/clinical-trajectory-biography.component.ts` | - | ❌ Missing in Flutter |
| **clinical trajectory reader** | `src/services/clinical-trajectory-reader.service.ts` | - | ❌ Missing in Flutter |
| **clinical trajectory reader modal** | `src/components/modals/clinical-trajectory-reader-modal.component.ts` | - | ❌ Missing in Flutter |
| **clinical trend** | `src/components/clinical-trend.component.ts` | `pocketgull_flutter/lib/widgets/clinical_trend_widget.dart` | ✅ Parity |
| **clinical tri cloud consensus** | `src/services/clinical-tri-cloud-consensus.service.ts` | - | ❌ Missing in Flutter |
| **clinical triage guard** | `src/services/clinical-triage-guard.service.ts` | - | ❌ Missing in Flutter |
| **clinical trial matcher** | `src/services/clinical-trial-matcher.service.ts` | - | ❌ Missing in Flutter |
| **clinical trials matcher** | `src/components/clinical-trials-matcher.component.ts`<br>`src/services/clinical-trials-matcher.service.ts` | - | ❌ Missing in Flutter |
| **clinical ux evaluation** | `src/services/clinical-ux-evaluation.service.ts` | - | ❌ Missing in Flutter |
| **clinical ux evaluation hub** | `src/components/clinical-ux-evaluation-hub.component.ts` | - | ❌ Missing in Flutter |
| **clinician onboarding** | `src/components/clinician-onboarding.component.ts` | - | ❌ Missing in Flutter |
| **cms rpm superbill** | `src/services/cms-rpm-superbill.service.ts` | - | ❌ Missing in Flutter |
| **cms rpm superbill modal** | `src/components/modals/cms-rpm-superbill-modal.component.ts` | - | ❌ Missing in Flutter |
| **cohort triage matrix** | `src/components/cohort-triage-matrix.component.ts` | - | ❌ Missing in Flutter |
| **collaboration** | `src/services/collaboration.service.ts` | `pocketgull_flutter/lib/services/collaboration_service.dart` | ✅ Parity |
| **collaboration dock** | `src/components/collaboration-dock.component.ts` | - | ❌ Missing in Flutter |
| **community eco localization** | `src/services/community-eco-localization.service.ts` | - | ❌ Missing in Flutter |
| **community testimonial modal** | `src/components/modals/community-testimonial-modal.component.ts` | - | ❌ Missing in Flutter |
| **community testimonials** | `src/services/community-testimonials.service.ts` | - | ❌ Missing in Flutter |
| **companion sync modal** | `src/components/modals/companion-sync-modal.component.ts` | - | ❌ Missing in Flutter |
| **compassionate analogy** | `src/services/compassionate-analogy.service.ts` | - | ❌ Missing in Flutter |
| **compassionate checkin guardian** | `src/components/compassionate-checkin-guardian.component.ts`<br>`src/services/compassionate-checkin-guardian.service.ts` | - | ❌ Missing in Flutter |
| **component drilldown unit** | `src/components/component-drilldown-unit.component.ts` | - | ❌ Missing in Flutter |
| **condensate 3d droplet** | `src/components/turing/condensate-3d-droplet.component.ts` | - | ❌ Missing in Flutter |
| **conformal readmission card** | `src/components/conformal-readmission-card.component.ts` | - | ❌ Missing in Flutter |
| **consent** | `src/services/consent.service.ts` | `pocketgull_flutter/lib/services/consent_service.dart` | ✅ Parity |
| **consent lineage** | `src/services/consent-lineage.service.ts` | - | ❌ Missing in Flutter |
| **consent modal** | `src/components/modals/consent-modal.component.ts` | `pocketgull_flutter/lib/widgets/consent_modal_widget.dart` | ✅ Parity |
| **console integrity** | `src/services/console-integrity.service.ts` | - | ❌ Missing in Flutter |
| **console integrity badge** | `src/components/console-integrity-badge.component.ts` | - | ❌ Missing in Flutter |
| **contactless vitals scanner** | `src/components/contactless-vitals-scanner.component.ts` | - | ❌ Missing in Flutter |
| **contract hub** | `src/components/contract-hub.component.ts` | - | ❌ Missing in Flutter |
| **coppa privacy shield** | `src/services/coppa-privacy-shield.service.ts` | - | ❌ Missing in Flutter |
| **corporate identity** | `src/services/corporate-identity.ts` | - | ❌ Missing in Flutter |
| **cost benefit analysis** | `src/components/cost-benefit-analysis.component.ts` | `pocketgull_flutter/lib/widgets/cost_benefit_analysis_widget.dart` | ✅ Parity |
| **counterfactual simulation** | `src/services/counterfactual-simulation.service.ts` | - | ❌ Missing in Flutter |
| **counterfactual simulator** | `src/components/counterfactual-simulator.component.ts` | - | ❌ Missing in Flutter |
| **crispr 3d unwinder** | `src/components/turing/crispr-3d-unwinder.component.ts` | - | ❌ Missing in Flutter |
| **cross border health wallet** | `src/services/cross-border-health-wallet.service.ts` | - | ❌ Missing in Flutter |
| **cssrs.assessment** | `src/services/clinical-assessments/instruments/cssrs.assessment.ts` | - | ❌ Missing in Flutter |
| **csv export strategy** | `src/services/export/csv-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **cvsq.assessment** | `src/services/clinical-assessments/instruments/cvsq.assessment.ts` | - | ❌ Missing in Flutter |
| **daily action checklist** | `src/components/daily-action-checklist.component.ts` | - | ❌ Missing in Flutter |
| **dashboard** | - | `pocketgull_flutter/lib/screens/dashboard_screen.dart` | ⚠️ Flutter Only |
| **data** | `src/services/clinical-assessments/data.ts`<br>`src/services/ybocs/data.ts` | - | ❌ Missing in Flutter |
| **data adventure engine** | `src/services/data-adventure-engine.service.ts` | - | ❌ Missing in Flutter |
| **data science citation** | `src/services/data-science-citation.service.ts` | - | ❌ Missing in Flutter |
| **de identification engine** | `src/services/privacy/de-identification-engine.service.ts` | - | ❌ Missing in Flutter |
| **deep space cds** | `src/services/deep-space-cds.service.ts` | - | ❌ Missing in Flutter |
| **deep space cds terminal** | `src/components/deep-space-cds-terminal.component.ts` | - | ❌ Missing in Flutter |
| **defensive guardrails** | `src/services/defensive-guardrails.service.ts` | - | ❌ Missing in Flutter |
| **dhatu tissue chakra matrix** | `src/components/ayurvedic/dhatu-tissue-chakra-matrix.component.ts` | - | ❌ Missing in Flutter |
| **diagnostics lens tab** | `src/components/analysis-report/diagnostics-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **dicom** | `src/services/dicom.service.ts` | `pocketgull_flutter/lib/providers/dicom_provider.dart` | ✅ Parity |
| **dicom models** | - | `pocketgull_flutter/lib/models/dicom_models.dart` | ⚠️ Flutter Only |
| **dicom viewer** | `src/components/dicom-viewer.component.ts` | `pocketgull_flutter/lib/widgets/dicom_viewer_widget.dart` | ✅ Parity |
| **dictation** | `src/services/dictation.service.ts` | `pocketgull_flutter/lib/services/dictation_service.dart` | ✅ Parity |
| **dictation modal** | `src/components/modals/dictation-modal.component.ts` | `pocketgull_flutter/lib/widgets/dictation_modal_widget.dart` | ✅ Parity |
| **dietary allergy shield** | `src/components/dietary-allergy-shield.component.ts` | - | ❌ Missing in Flutter |
| **differential diagnosis radar** | `src/components/differential-diagnosis-radar.component.ts`<br>`src/services/differential-diagnosis-radar.service.ts` | - | ❌ Missing in Flutter |
| **discord activity** | `src/services/discord-activity.service.ts` | - | ❌ Missing in Flutter |
| **dn4.assessment** | `src/services/clinical-assessments/instruments/dn4.assessment.ts` | - | ❌ Missing in Flutter |
| **doc consciousness** | `src/components/doc-consciousness.component.ts` | `pocketgull_flutter/lib/widgets/doc_consciousness_widget.dart` | ✅ Parity |
| **doc protocol** | `src/services/doc-protocol.service.ts` | `pocketgull_flutter/lib/services/doc_protocol_service.dart` | ✅ Parity |
| **docs study** | `src/components/docs-study.component.ts` | - | ❌ Missing in Flutter |
| **doctor shift sales demo** | `src/components/doctor-shift-sales-demo.component.ts` | - | ❌ Missing in Flutter |
| **doctor shift simulator** | `src/components/doctor-shift-simulator.component.ts` | - | ❌ Missing in Flutter |
| **documentation** | - | `pocketgull_flutter/lib/screens/documentation_screen.dart`<br>`pocketgull_flutter/lib/services/documentation_service.dart` | ⚠️ Flutter Only |
| **domain suites navigator** | `src/components/suites/domain-suites-navigator.component.ts` | - | ❌ Missing in Flutter |
| **double flip state machine** | `src/services/double-flip-state-machine.service.ts` | - | ❌ Missing in Flutter |
| **draggable window** | - | `pocketgull_flutter/lib/widgets/draggable_window.dart` | ⚠️ Flutter Only |
| **dual pane consultation** | `src/components/dual-pane-consultation.component.ts` | - | ❌ Missing in Flutter |
| **eastern tcm suite** | `src/components/eastern/eastern-tcm-suite.component.ts` | - | ❌ Missing in Flutter |
| **edge ml hud** | `src/components/edge-ml-hud/edge-ml-hud.component.ts` | - | ❌ Missing in Flutter |
| **edge tamper guard** | `src/services/edge-tamper-guard.service.ts` | - | ❌ Missing in Flutter |
| **elder bridge** | `src/services/elder-bridge.service.ts` | - | ❌ Missing in Flutter |
| **electroacupuncture** | `src/services/electroacupuncture.service.ts` | - | ❌ Missing in Flutter |
| **electroacupuncture viewer** | `src/components/shared/electroacupuncture-viewer.component.ts` | - | ❌ Missing in Flutter |
| **emergency nutritional bypass** | `src/components/emergency-nutritional-bypass.component.ts` | - | ❌ Missing in Flutter |
| **emergency supply finder** | `src/components/emergency-supply-finder.component.ts` | `pocketgull_flutter/lib/widgets/emergency_supply_finder_widget.dart` | ✅ Parity |
| **emt handoff lens tab** | `src/components/analysis-report/emt-handoff-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **encrypted vault** | `src/services/encrypted-vault.service.ts` | - | ❌ Missing in Flutter |
| **encrypted vault modal** | `src/components/shared/encrypted-vault-modal.component.ts` | - | ❌ Missing in Flutter |
| **environmental exposomics toxicology** | `src/components/environmental-exposomics-toxicology.component.ts` | - | ❌ Missing in Flutter |
| **environmental telemetry** | `src/services/environmental-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **epigenetic longevity lens tab** | `src/components/analysis-report/epigenetic-longevity-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **epistemic assertion** | - | `pocketgull_flutter/lib/providers/epistemic_assertion_provider.dart` | ⚠️ Flutter Only |
| **epistemic models** | - | `pocketgull_flutter/lib/models/epistemic_models.dart` | ⚠️ Flutter Only |
| **evidence attestation badge** | - | `pocketgull_flutter/lib/widgets/evidence_attestation_badge_widget.dart` | ⚠️ Flutter Only |
| **export** | `src/services/export.service.ts` | `pocketgull_flutter/lib/services/export_service.dart` | ✅ Parity |
| **eyes free accessibility** | `src/services/eyes-free-accessibility.service.ts` | - | ❌ Missing in Flutter |
| **eyes free accessibility hub** | `src/components/eyes-free-accessibility-hub.component.ts` | - | ❌ Missing in Flutter |
| **eyes free camera scribe** | `src/components/eyes-free-camera-scribe.component.ts`<br>`src/services/eyes-free-camera-scribe.service.ts` | - | ❌ Missing in Flutter |
| **family health quest** | `src/components/family/family-health-quest.component.ts` | - | ❌ Missing in Flutter |
| **family tree pedigree** | `src/components/family-tree-pedigree.component.ts` | - | ❌ Missing in Flutter |
| **federated learning** | `src/services/federated-learning.service.ts` | `pocketgull_flutter/lib/providers/federated_learning_provider.dart` | ✅ Parity |
| **federated learning card** | - | `pocketgull_flutter/lib/widgets/federated_learning_card_widget.dart` | ⚠️ Flutter Only |
| **federated learning hud** | `src/components/federated-learning-hud.component.ts` | - | ❌ Missing in Flutter |
| **fhir** | - | `pocketgull_flutter/lib/services/fhir_service.dart` | ⚠️ Flutter Only |
| **fhir bundle factory** | `src/services/fhir/fhir-bundle-factory.service.ts` | - | ❌ Missing in Flutter |
| **fhir callback** | `src/components/fhir-callback.component.ts` | - | ❌ Missing in Flutter |
| **fhir export strategy** | `src/services/export/fhir-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **fhir integration** | `src/services/fhir/fhir-integration.service.ts` | `pocketgull_flutter/lib/services/fhir_integration_service.dart` | ✅ Parity |
| **fhir passport modal** | `src/components/modals/fhir-passport-modal.component.ts` | - | ❌ Missing in Flutter |
| **fhir prior auth** | `src/services/fhir-prior-auth.service.ts` | - | ❌ Missing in Flutter |
| **fhir r4 bundle export** | `src/services/fhir-r4-bundle-export.service.ts` | - | ❌ Missing in Flutter |
| **fhir r5 telemetry** | `src/services/fhir/fhir-r5-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **fhir r7 horizon** | `src/services/fhir/fhir-r7-horizon.service.ts` | - | ❌ Missing in Flutter |
| **firestore sync** | `src/services/firestore-sync.service.ts` | `pocketgull_flutter/lib/services/firestore_sync_service.dart` | ✅ Parity |
| **fitbit** | `src/services/hardware/fitbit.service.ts` | - | ❌ Missing in Flutter |
| **floating water consciousness** | `src/components/floating-water-consciousness.component.ts` | - | ❌ Missing in Flutter |
| **food as medicine prescription hub** | `src/components/research-frame/food-as-medicine-prescription-hub.component.ts` | - | ❌ Missing in Flutter |
| **food safety guardrail card** | `src/components/food-safety-guardrail-card.component.ts` | - | ❌ Missing in Flutter |
| **foveal reticle rsvp** | `src/components/shared/foveal-reticle-rsvp.component.ts` | - | ❌ Missing in Flutter |
| **functional circadian synergy bridge** | `src/components/analysis-report/functional-circadian-synergy-bridge.component.ts` | - | ❌ Missing in Flutter |
| **functional medicine matrix** | `src/components/functional-medicine-matrix.component.ts` | - | ❌ Missing in Flutter |
| **functional medicine matrix lens tab** | `src/components/analysis-report/functional-medicine-matrix-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **ga4gh phenopacket** | `src/services/ga4gh-phenopacket.service.ts` | - | ❌ Missing in Flutter |
| **ga4gh phenopackets card** | `src/components/shared/ga4gh-phenopackets-card.component.ts` | - | ❌ Missing in Flutter |
| **gaap tribal stewardship** | `src/services/gaap-tribal-stewardship.service.ts` | - | ❌ Missing in Flutter |
| **gaap tribal stewardship card** | `src/components/shared/gaap-tribal-stewardship-card.component.ts` | - | ❌ Missing in Flutter |
| **gad7.assessment** | `src/services/clinical-assessments/instruments/gad7.assessment.ts` | - | ❌ Missing in Flutter |
| **gamification** | `src/services/gamification.service.ts` | `pocketgull_flutter/lib/services/gamification_service.dart` | ✅ Parity |
| **gcp healthcare api** | `src/services/fhir/gcp-healthcare-api.service.ts` | - | ❌ Missing in Flutter |
| **gemini context cache** | `src/services/gemini-context-cache.service.ts` | - | ❌ Missing in Flutter |
| **gemini.provider** | `src/services/ai/gemini.provider.ts` | - | ❌ Missing in Flutter |
| **genesis biophysical substrate** | `src/components/anatomy-3d/genesis-biophysical-substrate.component.ts` | - | ❌ Missing in Flutter |
| **genomic pathogenicity** | `src/services/genomic-pathogenicity.service.ts` | - | ❌ Missing in Flutter |
| **genomic variant screener** | `src/components/genomic-variant-screener.component.ts` | - | ❌ Missing in Flutter |
| **geofenced exposomics radar** | `src/components/research-frame/geofenced-exposomics-radar.component.ts` | - | ❌ Missing in Flutter |
| **geolocational health relocation** | `src/components/geolocational-health-relocation.component.ts` | - | ❌ Missing in Flutter |
| **geriatric longevity frailty hub** | `src/components/research-frame/geriatric-longevity-frailty-hub.component.ts` | - | ❌ Missing in Flutter |
| **glass container** | - | `pocketgull_flutter/lib/widgets/ui/glass_container.dart` | ⚠️ Flutter Only |
| **global health initiatives** | `src/services/global-health-initiatives.service.ts` | - | ❌ Missing in Flutter |
| **global health initiatives modal** | `src/components/shared/global-health-initiatives-modal.component.ts` | - | ❌ Missing in Flutter |
| **global jurisdiction matrix** | `src/services/global-jurisdiction-matrix.service.ts` | - | ❌ Missing in Flutter |
| **glossary modal** | `src/components/modals/glossary-modal.component.ts` | - | ❌ Missing in Flutter |
| **glp1 incretin matrix** | `src/components/aaas/glp1-incretin-matrix.component.ts` | - | ❌ Missing in Flutter |
| **glyph forge studio** | `src/components/shared/glyph-forge-studio.component.ts` | - | ❌ Missing in Flutter |
| **goal planning card** | `src/components/goal-planning-card.component.ts` | - | ❌ Missing in Flutter |
| **goal planning engine** | `src/services/goal-planning-engine.service.ts` | - | ❌ Missing in Flutter |
| **google health api** | `src/services/hardware/google-health-api.service.ts` | - | ❌ Missing in Flutter |
| **google health consent modal** | `src/components/modals/google-health-consent-modal.component.ts` | - | ❌ Missing in Flutter |
| **google health sync hud** | `src/components/google-health-sync-hud.component.ts` | - | ❌ Missing in Flutter |
| **google saif clinical defense** | `src/services/google-saif-clinical-defense.service.ts` | - | ❌ Missing in Flutter |
| **green computing sustainability** | `src/services/green-computing-sustainability.service.ts` | - | ❌ Missing in Flutter |
| **green room lounge** | `src/components/green-room-lounge.component.ts` | - | ❌ Missing in Flutter |
| **grounded evidence badge** | `src/components/grounded-evidence-badge.component.ts` | - | ❌ Missing in Flutter |
| **grow thyself legacy engine** | `src/services/grow-thyself-legacy-engine.service.ts` | - | ❌ Missing in Flutter |
| **grow thyself legacy vault** | `src/components/grow-thyself-legacy-vault.component.ts` | - | ❌ Missing in Flutter |
| **growthyself.assessment** | `src/services/clinical-assessments/instruments/growthyself.assessment.ts` | - | ❌ Missing in Flutter |
| **gse explorer** | `src/services/gse-explorer.service.ts` | - | ❌ Missing in Flutter |
| **gull narrative dispatch** | `src/components/gull-narrative-dispatch.component.ts` | - | ❌ Missing in Flutter |
| **gull squadron showcase** | `src/components/gull-squadron-showcase.component.ts` | - | ❌ Missing in Flutter |
| **hall chronotherapy matrix** | `src/components/nobel/hall-chronotherapy-matrix.component.ts` | - | ❌ Missing in Flutter |
| **handoff modal** | `src/components/modals/handoff-modal.component.ts` | - | ❌ Missing in Flutter |
| **hardware telemetry** | `src/services/hardware/hardware-telemetry.service.ts` | `pocketgull_flutter/lib/services/hardware_telemetry_service.dart` | ✅ Parity |
| **health connect** | - | `pocketgull_flutter/lib/providers/health_connect_provider.dart` | ⚠️ Flutter Only |
| **health connect bridge** | - | `pocketgull_flutter/lib/services/health_connect_bridge_service.dart` | ⚠️ Flutter Only |
| **healthcare intelligence** | `src/services/healthcare-intelligence.service.ts` | - | ❌ Missing in Flutter |
| **healthy hobbies lifestyle** | `src/components/healthy-hobbies-lifestyle.component.ts` | - | ❌ Missing in Flutter |
| **hedis star rating** | `src/services/hedis-star-rating.service.ts` | - | ❌ Missing in Flutter |
| **helpful lists** | `src/services/helpful-lists.service.ts` | - | ❌ Missing in Flutter |
| **hipaa pdf export** | `src/components/hipaa-pdf-export.component.ts`<br>`src/services/hipaa-pdf-export.service.ts` | - | ❌ Missing in Flutter |
| **historical luminaries game** | `src/components/historical-luminaries-game.component.ts`<br>`src/services/historical-luminaries-game.service.ts` | - | ❌ Missing in Flutter |
| **history timeline** | - | `pocketgull_flutter/lib/widgets/history_timeline_widget.dart` | ⚠️ Flutter Only |
| **hl7v2 export strategy** | `src/services/export/hl7v2-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **hobby domain companion** | `src/components/hobby-domain-companion.component.ts`<br>`src/services/hobby-domain-companion.service.ts` | - | ❌ Missing in Flutter |
| **holistic sleep toolkit** | `src/components/holistic-sleep-toolkit.component.ts` | - | ❌ Missing in Flutter |
| **hologram export** | `src/services/hologram-export.service.ts` | - | ❌ Missing in Flutter |
| **holographic 3d anatomy** | `src/components/anatomy-3d/holographic-3d-anatomy.component.ts` | - | ❌ Missing in Flutter |
| **home** | - | `pocketgull_flutter/lib/screens/home_screen.dart` | ⚠️ Flutter Only |
| **hsa incentive bridge** | `src/services/hsa-incentive-bridge.service.ts` | - | ❌ Missing in Flutter |
| **hsa incentive network** | `src/components/hsa-incentive-network.component.ts` | - | ❌ Missing in Flutter |
| **html export strategy** | `src/services/export/html-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **human dignity pact** | `src/components/human-dignity-pact.component.ts` | - | ❌ Missing in Flutter |
| **hybrid.provider** | `src/services/ai/hybrid.provider.ts` | - | ❌ Missing in Flutter |
| **hyperscaler deployment** | `src/services/hyperscaler-deployment.service.ts` | - | ❌ Missing in Flutter |
| **hyperscaler marketplace portal** | `src/components/hyperscaler-marketplace-portal.component.ts` | - | ❌ Missing in Flutter |
| **hypoglycemia alert** | `src/services/hypoglycemia-alert.service.ts` | - | ❌ Missing in Flutter |
| **ibm watsonx clinical** | `src/services/ibm-watsonx-clinical.service.ts` | - | ❌ Missing in Flutter |
| **image optimization** | `src/services/image-optimization.service.ts` | `pocketgull_flutter/lib/services/image_optimization_service.dart` | ✅ Parity |
| **immuno oncology tme viewer** | `src/components/shared/immuno-oncology-tme-viewer.component.ts` | - | ❌ Missing in Flutter |
| **impact channels linking card** | `src/components/impact-channels-linking-card.component.ts` | - | ❌ Missing in Flutter |
| **impact partner channels** | `src/services/impact-partner-channels.service.ts` | - | ❌ Missing in Flutter |
| **impact program agreement** | `src/services/impact-program-agreement.service.ts` | - | ❌ Missing in Flutter |
| **import** | `src/services/import.service.ts` | `pocketgull_flutter/lib/services/import_service.dart` | ✅ Parity |
| **index** | `src/components/analysis-report/index.ts`<br>`src/components/index.ts`<br>`src/components/shared/index.ts`<br>`src/services/cardio-vitals/index.ts`<br>`src/services/clinical-ai/index.ts`<br>`src/services/clinical-assessments/instruments/index.ts`<br>`src/services/fhir-interop/index.ts`<br>`src/services/index.ts`<br>`src/services/integrative-paradigms/index.ts`<br>`src/services/neuro-somatic/index.ts` | - | ❌ Missing in Flutter |
| **infinite clinical synthesis** | `src/services/infinite-clinical-synthesis.service.ts` | - | ❌ Missing in Flutter |
| **info cern 1991 theme showcase** | `src/components/info-cern-1991-theme-showcase.component.ts` | - | ❌ Missing in Flutter |
| **inline agent chat** | - | `pocketgull_flutter/lib/widgets/inline_agent_chat_widget.dart` | ⚠️ Flutter Only |
| **insight card** | `src/components/synthesis/insight-card.component.ts` | `pocketgull_flutter/lib/widgets/synthesis/insight_card_widget.dart` | ✅ Parity |
| **insight grid** | `src/components/synthesis/insight-grid.component.ts` | `pocketgull_flutter/lib/widgets/synthesis/insight_grid_widget.dart` | ✅ Parity |
| **instant body care plan sheet** | `src/components/anatomy-3d/instant-body-care-plan-sheet.component.ts` | - | ❌ Missing in Flutter |
| **institutional compliance** | `src/services/institutional-compliance.service.ts` | - | ❌ Missing in Flutter |
| **institutional compliance modal** | `src/components/modals/institutional-compliance-modal.component.ts` | - | ❌ Missing in Flutter |
| **intake form** | `src/components/intake-form.component.ts` | `pocketgull_flutter/lib/widgets/intake_form_widget.dart` | ✅ Parity |
| **intake toolbar** | `src/components/intake-toolbar.component.ts` | - | ❌ Missing in Flutter |
| **intelligence.provider** | `src/services/ai/intelligence.provider.ts` | - | ❌ Missing in Flutter |
| **intelligence.provider.token** | `src/services/ai/intelligence.provider.token.ts` | - | ❌ Missing in Flutter |
| **inter system crosstalk card** | `src/components/analysis-report/inter-system-crosstalk-card.component.ts` | - | ❌ Missing in Flutter |
| **interactions.provider** | `src/services/ai/interactions.provider.ts` | - | ❌ Missing in Flutter |
| **interactive onboarding tour** | `src/services/interactive-onboarding-tour.service.ts` | - | ❌ Missing in Flutter |
| **international university geofence** | `src/services/international-university-geofence.service.ts` | - | ❌ Missing in Flutter |
| **international university hub** | `src/components/research-frame/international-university-hub.component.ts` | - | ❌ Missing in Flutter |
| **interventions lens tab** | `src/components/analysis-report/interventions-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **intimacy relationship vitality** | `src/components/intimacy-relationship-vitality.component.ts`<br>`src/services/intimacy-relationship-vitality.service.ts` | - | ❌ Missing in Flutter |
| **investor valuation portal modal** | `src/components/modals/investor-valuation-portal-modal.component.ts` | - | ❌ Missing in Flutter |
| **ip patent registry** | `src/services/ip-patent-registry.service.ts` | - | ❌ Missing in Flutter |
| **irmaa decision** | `src/services/irmaa-decision.service.ts` | - | ❌ Missing in Flutter |
| **irmaa decision calculator** | `src/components/shared/irmaa-decision-calculator.component.ts` | - | ❌ Missing in Flutter |
| **isi.assessment** | `src/services/clinical-assessments/instruments/isi.assessment.ts` | - | ❌ Missing in Flutter |
| **ismp safety guard** | `src/services/ismp-safety-guard.service.ts` | - | ❌ Missing in Flutter |
| **joy playful flourishing** | `src/services/joy-playful-flourishing.service.ts` | - | ❌ Missing in Flutter |
| **joy playful flourishing card** | `src/components/joy-playful-flourishing-card.component.ts` | - | ❌ Missing in Flutter |
| **jurisdiction guard** | `src/services/jurisdiction-guard.service.ts` | - | ❌ Missing in Flutter |
| **jurisdiction matrix card** | `src/components/shared/jurisdiction-matrix-card.component.ts` | - | ❌ Missing in Flutter |
| **kaggle challenge card** | `src/components/kaggle-challenge-card.component.ts` | - | ❌ Missing in Flutter |
| **kaizen quality suite** | `src/components/kaizen-quality-suite.component.ts` | - | ❌ Missing in Flutter |
| **knee hologram hud** | `src/components/knee-hologram-hud.component.ts` | - | ❌ Missing in Flutter |
| **knowledge synthesis** | `src/services/knowledge-synthesis.service.ts` | `pocketgull_flutter/lib/services/knowledge_synthesis_service.dart` | ✅ Parity |
| **kss cognitive shield** | `src/components/kss-cognitive-shield.component.ts` | - | ❌ Missing in Flutter |
| **laaf fhir haptic schedule** | `src/services/fhir/laaf-fhir-haptic-schedule.service.ts` | - | ❌ Missing in Flutter |
| **lasker breakthrough suite** | `src/components/lasker/lasker-breakthrough-suite.component.ts` | - | ❌ Missing in Flutter |
| **lateral thinking health** | `src/services/lateral-thinking-health.service.ts` | - | ❌ Missing in Flutter |
| **legacy swarm agents** | `src/services/ai/legacy-swarm-agents.service.ts` | - | ❌ Missing in Flutter |
| **legal consent sovereignty** | `src/services/legal-consent-sovereignty.service.ts` | - | ❌ Missing in Flutter |
| **legal consent sovereignty badge** | `src/components/legal-consent-sovereignty-badge.component.ts` | - | ❌ Missing in Flutter |
| **legalzoom integration** | `src/services/legalzoom-integration.service.ts` | - | ❌ Missing in Flutter |
| **lemonade.provider** | `src/services/ai/lemonade.provider.ts` | - | ❌ Missing in Flutter |
| **lens biomolecular physics** | `src/components/turing/lens-biomolecular-physics.component.ts` | - | ❌ Missing in Flutter |
| **lens insight spark shield** | `src/components/lens-insight-spark-shield.component.ts` | - | ❌ Missing in Flutter |
| **lens physical genomics** | `src/components/turing/lens-physical-genomics.component.ts` | - | ❌ Missing in Flutter |
| **lens rsna knee** | `src/components/lens-rsna-knee.component.ts` | - | ❌ Missing in Flutter |
| **lidar scan upload modal** | `src/components/modals/lidar-scan-upload-modal.component.ts` | - | ❌ Missing in Flutter |
| **life journey navigator** | `src/services/life-journey-navigator.service.ts` | - | ❌ Missing in Flutter |
| **life perils paradigm matrix** | `src/components/life-perils-paradigm-matrix.component.ts` | - | ❌ Missing in Flutter |
| **lifestyle adjunct** | `src/services/lifestyle-adjunct.service.ts` | `pocketgull_flutter/lib/services/lifestyle_adjunct_service.dart` | ✅ Parity |
| **live agent** | - | `pocketgull_flutter/lib/widgets/live_agent_widget.dart` | ⚠️ Flutter Only |
| **live agent visuals** | - | `pocketgull_flutter/lib/widgets/live_agent_visuals_widget.dart` | ⚠️ Flutter Only |
| **living obituary memorial** | `src/components/living-obituary-memorial.component.ts`<br>`src/services/living-obituary-memorial.service.ts` | - | ❌ Missing in Flutter |
| **local gemma studio** | `src/components/local-gemma-studio.component.ts` | - | ❌ Missing in Flutter |
| **local intelligence** | - | `pocketgull_flutter/lib/services/local_intelligence_service.dart` | ⚠️ Flutter Only |
| **longitudinal organ slider** | `src/components/shared/longitudinal-organ-slider.component.ts` | - | ❌ Missing in Flutter |
| **longitudinal trend sparkline** | `src/components/shared/longitudinal-trend-sparkline.component.ts` | - | ❌ Missing in Flutter |
| **main header nav** | `src/components/main-header-nav.component.ts` | - | ❌ Missing in Flutter |
| **mandiant clinical defense** | `src/services/mandiant-clinical-defense.service.ts` | - | ❌ Missing in Flutter |
| **mandiant cyber defense card** | `src/components/shared/mandiant-cyber-defense-card.component.ts` | - | ❌ Missing in Flutter |
| **markdown** | `src/services/markdown.service.ts` | `pocketgull_flutter/lib/services/markdown_service.dart` | ✅ Parity |
| **maternal postpartum** | `src/services/maternal-postpartum.service.ts` | - | ❌ Missing in Flutter |
| **maternal postpartum lens tab** | `src/components/analysis-report/maternal-postpartum-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **mbi.assessment** | `src/services/clinical-assessments/instruments/mbi.assessment.ts` | - | ❌ Missing in Flutter |
| **medha sakti matrix** | `src/components/ayurvedic/medha-sakti-matrix.component.ts` | - | ❌ Missing in Flutter |
| **medical 3d viewer** | `src/components/anatomy-3d/medical-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **medical chart** | `src/components/medical-chart.component.ts` | `pocketgull_flutter/lib/widgets/medical_chart_widget.dart` | ✅ Parity |
| **medical decoder** | `src/services/medical-decoder.service.ts`<br>`src/pipes/medical-decoder.pipe.ts` | - | ❌ Missing in Flutter |
| **medical device affiliate** | `src/services/medical-device-affiliate.service.ts` | - | ❌ Missing in Flutter |
| **medical summary** | `src/components/medical-summary.component.ts` | `pocketgull_flutter/lib/widgets/medical_summary_widget.dart` | ✅ Parity |
| **medical supply navigator** | `src/components/medical-supply-navigator.component.ts` | - | ❌ Missing in Flutter |
| **medicare billing best practices** | `src/services/medicare-billing-best-practices.service.ts` | - | ❌ Missing in Flutter |
| **metric card** | `src/components/shared/metric-card.component.ts` | `pocketgull_flutter/lib/widgets/metric_card_widget.dart`<br>`pocketgull_flutter/lib/widgets/ui/metric_card.dart` | ✅ Parity |
| **microsoft health nuance** | `src/services/microsoft-health-nuance.service.ts` | - | ❌ Missing in Flutter |
| **microsoft ibm clinical bridge** | `src/services/microsoft-ibm-clinical-bridge.service.ts` | - | ❌ Missing in Flutter |
| **mission symphony engine** | `src/services/mission-symphony-engine.service.ts` | - | ❌ Missing in Flutter |
| **mobile audio respiratory** | - | `pocketgull_flutter/lib/services/mobile_audio_respiratory_service.dart` | ⚠️ Flutter Only |
| **mobile camera pulse** | - | `pocketgull_flutter/lib/services/mobile_camera_pulse_service.dart` | ⚠️ Flutter Only |
| **mobile cgm time in range** | - | `pocketgull_flutter/lib/services/mobile_cgm_time_in_range_service.dart` | ⚠️ Flutter Only |
| **mobile local intelligence** | - | `pocketgull_flutter/lib/services/mobile_local_intelligence.dart` | ⚠️ Flutter Only |
| **mobile menu qr modal** | `src/components/modals/mobile-menu-qr-modal.component.ts` | - | ❌ Missing in Flutter |
| **mobile offline edge ai** | - | `pocketgull_flutter/lib/services/mobile_offline_edge_ai_service.dart` | ⚠️ Flutter Only |
| **mobile teledentistry** | - | `pocketgull_flutter/lib/services/mobile_teledentistry_service.dart` | ⚠️ Flutter Only |
| **moca.assessment** | `src/services/clinical-assessments/instruments/moca.assessment.ts` | - | ❌ Missing in Flutter |
| **molecular docking** | `src/services/molecular-docking.service.ts` | - | ❌ Missing in Flutter |
| **molecular docking viewer** | `src/components/molecular-docking-viewer.component.ts` | - | ❌ Missing in Flutter |
| **monroe persian trance** | `src/services/monroe-persian-trance.service.ts` | - | ❌ Missing in Flutter |
| **mood consciousness matrix** | `src/components/mood-consciousness-matrix.component.ts` | `pocketgull_flutter/lib/widgets/mood_consciousness_matrix_widget.dart` | ✅ Parity |
| **movement healing quest** | `src/components/movement-healing-quest.component.ts`<br>`src/services/movement-healing-quest.service.ts` | - | ❌ Missing in Flutter |
| **mrna lipid nanoparticle matrix** | `src/components/lasker/mrna-lipid-nanoparticle-matrix.component.ts` | - | ❌ Missing in Flutter |
| **multi paradigm venn** | `src/components/multi-paradigm-venn.component.ts` | - | ❌ Missing in Flutter |
| **multilingual equity** | `src/services/multilingual-equity.service.ts` | - | ❌ Missing in Flutter |
| **multilingual specimen** | `src/components/shared/multilingual-specimen.component.ts` | - | ❌ Missing in Flutter |
| **mychart brief modal** | `src/components/modals/mychart-brief-modal.component.ts` | - | ❌ Missing in Flutter |
| **n of 1 designer** | `src/components/n-of-1-designer.component.ts` | - | ❌ Missing in Flutter |
| **n of 1 engine** | `src/services/n-of-1-engine.service.ts` | - | ❌ Missing in Flutter |
| **nano.provider** | `src/services/ai/nano.provider.ts` | - | ❌ Missing in Flutter |
| **nanobot swarm** | - | `pocketgull_flutter/lib/providers/nanobot_swarm_provider.dart`<br>`pocketgull_flutter/lib/models/nanobot_swarm_model.dart` | ⚠️ Flutter Only |
| **nanobot swarm 3d** | `src/components/turing/nanobot-swarm-3d.component.ts` | - | ❌ Missing in Flutter |
| **nanobot swarm hud card** | - | `pocketgull_flutter/lib/widgets/nanobot_swarm_hud_card.dart` | ⚠️ Flutter Only |
| **nanobot swarm physics** | `src/services/nanobot-swarm-physics.service.ts` | - | ❌ Missing in Flutter |
| **nantucket tick case study** | `src/components/case-studies/nantucket-tick-case-study.component.ts` | - | ❌ Missing in Flutter |
| **native body viewer** | - | `pocketgull_flutter/lib/widgets/native_body_viewer.dart` | ⚠️ Flutter Only |
| **native json export strategy** | `src/services/export/native-json-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **navier stokes viewer** | `src/components/turing/navier-stokes-viewer.component.ts` | - | ❌ Missing in Flutter |
| **navigation shell** | `src/services/navigation-shell.service.ts` | - | ❌ Missing in Flutter |
| **ncaa sports science** | `src/services/ncaa-sports-science.service.ts` | - | ❌ Missing in Flutter |
| **ncaa sports science hub** | `src/components/research-frame/ncaa-sports-science-hub.component.ts` | - | ❌ Missing in Flutter |
| **network state** | `src/services/network-state.service.ts` | `pocketgull_flutter/lib/services/network_state_service.dart` | ✅ Parity |
| **nih who goal tracker** | `src/components/shared/nih-who-goal-tracker.component.ts` | - | ❌ Missing in Flutter |
| **nng usability hud** | `src/components/nng-usability-hud.component.ts` | - | ❌ Missing in Flutter |
| **nng usability metrics** | `src/services/nng-usability-metrics.service.ts` | - | ❌ Missing in Flutter |
| **nobel laureates suite** | `src/components/nobel/nobel-laureates-suite.component.ts` | - | ❌ Missing in Flutter |
| **node agent dialog** | `src/components/node-agent-dialog.component.ts` | `pocketgull_flutter/lib/widgets/node_agent_dialog_widget.dart` | ✅ Parity |
| **nsf grant portal** | `src/components/nsf-grant-portal.component.ts` | - | ❌ Missing in Flutter |
| **nucleosome 3d puller** | `src/components/turing/nucleosome-3d-puller.component.ts` | - | ❌ Missing in Flutter |
| **nucleus 3d deformer** | `src/components/turing/nucleus-3d-deformer.component.ts` | - | ❌ Missing in Flutter |
| **nutrition suite** | `src/components/suites/nutrition-suite.component.ts` | - | ❌ Missing in Flutter |
| **nutritional bypass lens tab** | `src/components/analysis-report/nutritional-bypass-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **occupational hazard card** | `src/components/occupational-hazard-card.component.ts` | - | ❌ Missing in Flutter |
| **ocular vocal telemetry** | `src/services/ocular-vocal-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **offline edge ai** | `src/services/offline-edge-ai.service.ts` | - | ❌ Missing in Flutter |
| **offline edge controls** | `src/components/offline-edge-controls.component.ts` | - | ❌ Missing in Flutter |
| **ohsumi autophagy chronometer** | `src/components/nobel/ohsumi-autophagy-chronometer.component.ts` | - | ❌ Missing in Flutter |
| **on device embedder** | `src/services/ai/on-device-embedder.service.ts` | - | ❌ Missing in Flutter |
| **onboarding tour overlay** | `src/components/onboarding-tour-overlay.component.ts` | - | ❌ Missing in Flutter |
| **onc dsi transparency** | `src/services/onc-dsi-transparency.service.ts` | - | ❌ Missing in Flutter |
| **onc dsi transparency card** | `src/components/onc-dsi-transparency-card.component.ts` | - | ❌ Missing in Flutter |
| **onnx webgpu engine** | `src/services/onnx-webgpu-engine.service.ts` | - | ❌ Missing in Flutter |
| **open evidence commons** | `src/services/open-evidence-commons.service.ts` | `pocketgull_flutter/lib/providers/open_evidence_commons_provider.dart` | ✅ Parity |
| **open evidence commons hud** | `src/components/open-evidence-commons-hud.component.ts` | - | ❌ Missing in Flutter |
| **optical camera vision** | `src/services/optical-camera-vision.service.ts` | - | ❌ Missing in Flutter |
| **or tools goal optimizer** | `src/services/or-tools-goal-optimizer.service.ts` | - | ❌ Missing in Flutter |
| **orcid** | `src/services/orcid.service.ts` | `pocketgull_flutter/lib/services/orcid_service.dart` | ✅ Parity |
| **orcid profile** | - | `pocketgull_flutter/lib/models/orcid_profile.dart` | ⚠️ Flutter Only |
| **origami papercraft decorations** | `src/components/origami-papercraft-decorations.component.ts` | - | ❌ Missing in Flutter |
| **origami seagull** | - | `pocketgull_flutter/lib/widgets/origami_seagull.dart` | ⚠️ Flutter Only |
| **orp foveal reticle** | - | `pocketgull_flutter/lib/widgets/orp_foveal_reticle_widget.dart` | ⚠️ Flutter Only |
| **osce case simulator** | `src/components/osce-case-simulator.component.ts` | - | ❌ Missing in Flutter |
| **osce trainer** | `src/services/osce-trainer.service.ts` | - | ❌ Missing in Flutter |
| **osha workplace safety** | `src/services/osha-workplace-safety.service.ts` | - | ❌ Missing in Flutter |
| **paabo paleo genomic** | `src/components/nobel/paabo-paleo-genomic.component.ts` | - | ❌ Missing in Flutter |
| **pantry lazy susan** | `src/components/pantry-lazy-susan.component.ts` | - | ❌ Missing in Flutter |
| **papercraft backdrop** | `src/components/papercraft-backdrop.component.ts` | - | ❌ Missing in Flutter |
| **paradigm arbiter** | `src/services/paradigm-arbiter.service.ts` | - | ❌ Missing in Flutter |
| **paradigm arbitration matrix** | `src/components/paradigm-arbitration-matrix.component.ts` | - | ❌ Missing in Flutter |
| **paradigm clinical dashboard** | `src/components/paradigm-clinical-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **paradigm lyrics** | `src/services/paradigm-lyrics.service.ts` | - | ❌ Missing in Flutter |
| **partner ecosystem** | `src/services/partner-ecosystem.service.ts` | - | ❌ Missing in Flutter |
| **passkey step up modal** | `src/components/modals/passkey-step-up-modal.component.ts` | - | ❌ Missing in Flutter |
| **patent claims hud modal** | `src/components/modals/patent-claims-hud-modal.component.ts` | - | ❌ Missing in Flutter |
| **pathways moe badge** | `src/components/shared/pathways-moe-badge.component.ts` | - | ❌ Missing in Flutter |
| **patient** | - | `pocketgull_flutter/lib/providers/patient_provider.dart`<br>`pocketgull_flutter/lib/models/patient_types.dart` | ⚠️ Flutter Only |
| **patient directory** | `src/components/patient-directory.component.ts` | `pocketgull_flutter/lib/widgets/patient_directory_widget.dart` | ✅ Parity |
| **patient dropdown** | `src/components/patient-dropdown.component.ts` | `pocketgull_flutter/lib/widgets/patient_dropdown_widget.dart` | ✅ Parity |
| **patient education flip** | `src/directives/patient-education-flip.directive.ts` | - | ❌ Missing in Flutter |
| **patient education lens tab** | `src/components/analysis-report/patient-education-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **patient health trajectory storybook** | `src/components/patient-health-trajectory-storybook.component.ts` | - | ❌ Missing in Flutter |
| **patient history timeline** | `src/components/patient-history-timeline.component.ts` | `pocketgull_flutter/lib/widgets/patient_history_timeline_widget.dart` | ✅ Parity |
| **patient management** | `src/services/patient-management.service.ts` | `pocketgull_flutter/lib/services/patient_management_service.dart`<br>`pocketgull_flutter/lib/providers/patient_management_provider.dart` | ✅ Parity |
| **patient portal** | `src/components/patient-portal.component.ts` | - | ❌ Missing in Flutter |
| **patient scans** | `src/components/patient-scans.component.ts` | `pocketgull_flutter/lib/widgets/patient_scans_widget.dart` | ✅ Parity |
| **patient state** | `src/services/patient-state.service.ts` | - | ❌ Missing in Flutter |
| **patient story modal** | `src/components/modals/patient-story-modal.component.ts` | - | ❌ Missing in Flutter |
| **patient under tree** | `src/components/patient-under-tree.component.ts` | - | ❌ Missing in Flutter |
| **patient vitals chart** | `src/components/patient-vitals-chart.component.ts` | `pocketgull_flutter/lib/widgets/patient_vitals_chart_widget.dart` | ✅ Parity |
| **patient.types** | `src/services/patient.types.ts` | - | ❌ Missing in Flutter |
| **pdf export strategy** | `src/services/export/pdf-export-strategy.service.ts` | - | ❌ Missing in Flutter |
| **pediatric clinical trajectory hub** | `src/components/research-frame/pediatric-clinical-trajectory-hub.component.ts` | - | ❌ Missing in Flutter |
| **peer network** | `src/services/peer-network.service.ts` | - | ❌ Missing in Flutter |
| **periodontal systemic bridge** | `src/services/periodontal-systemic-bridge.service.ts` | - | ❌ Missing in Flutter |
| **perma flourishing suite** | `src/components/perma-flourishing-suite.component.ts` | - | ❌ Missing in Flutter |
| **pet auditory** | `src/services/pet-auditory.service.ts` | `pocketgull_flutter/lib/services/pet_auditory_service.dart` | ✅ Parity |
| **petri net viewer** | `src/components/turing/petri-net-viewer.component.ts` | - | ❌ Missing in Flutter |
| **phantom limb mirror therapy** | `src/components/phantom-limb-mirror-therapy.component.ts` | - | ❌ Missing in Flutter |
| **pharmacogenomics** | `src/services/pharmacogenomics.service.ts` | - | ❌ Missing in Flutter |
| **pharmacogenomics card** | `src/components/pharmacogenomics-card.component.ts` | - | ❌ Missing in Flutter |
| **phq15.assessment** | `src/services/clinical-assessments/instruments/phq15.assessment.ts` | - | ❌ Missing in Flutter |
| **phq9.assessment** | `src/services/clinical-assessments/instruments/phq9.assessment.ts` | - | ❌ Missing in Flutter |
| **physical genomics** | `src/services/physical-genomics.service.ts` | `pocketgull_flutter/lib/providers/physical_genomics_provider.dart`<br>`pocketgull_flutter/lib/models/physical_genomics_model.dart` | ✅ Parity |
| **physical genomics hud card** | - | `pocketgull_flutter/lib/widgets/physical_genomics_hud_card.dart` | ⚠️ Flutter Only |
| **physical genomics mobile** | - | `pocketgull_flutter/lib/services/physical_genomics_mobile_service.dart` | ⚠️ Flutter Only |
| **physics biophysics** | `src/services/physics-biophysics.service.ts` | - | ❌ Missing in Flutter |
| **physionet acoustic** | `src/services/physionet-acoustic.service.ts` | - | ❌ Missing in Flutter |
| **physionet acoustic hud** | `src/components/physionet-acoustic-hud.component.ts` | - | ❌ Missing in Flutter |
| **piezo mechanoreceptor matrix** | `src/components/lasker/piezo-mechanoreceptor-matrix.component.ts` | - | ❌ Missing in Flutter |
| **pivot pulse agent** | `src/services/pivot-pulse-agent.service.ts` | - | ❌ Missing in Flutter |
| **plain language glossary** | `src/services/plain-language-glossary.service.ts` | - | ❌ Missing in Flutter |
| **plan differential inspector** | `src/components/plan-differential-inspector.component.ts` | - | ❌ Missing in Flutter |
| **planetary health hud** | `src/components/planetary-health-hud.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull badge** | `src/components/shared/pocket-gull-badge.component.ts` | `pocketgull_flutter/lib/widgets/pocket_gull_badge_widget.dart` | ✅ Parity |
| **pocket gull button** | `src/components/shared/pocket-gull-button.component.ts` | `pocketgull_flutter/lib/widgets/pocket_gull_button_widget.dart` | ✅ Parity |
| **pocket gull card** | `src/components/shared/pocket-gull-card.component.ts` | `pocketgull_flutter/lib/widgets/pocket_gull_card_widget.dart` | ✅ Parity |
| **pocket gull input** | `src/components/shared/pocket-gull-input.component.ts` | `pocketgull_flutter/lib/widgets/pocket_gull_input_widget.dart` | ✅ Parity |
| **pocketgull ai social card** | `src/components/shared/pocketgull-ai-social-card.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull brand mark** | `src/components/shared/pocketgull-brand-mark.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull desktop suite** | `src/components/pocketgull-desktop-suite.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull icon** | `src/components/shared/pocketgull-icon.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull sans bench** | `src/components/shared/pocketgull-sans-bench.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull typeface site** | `src/components/shared/pocketgull-typeface-site.component.ts` | - | ❌ Missing in Flutter |
| **pocketgull typeface specimen** | `src/components/shared/pocketgull-typeface-specimen.component.ts` | - | ❌ Missing in Flutter |
| **population health equity** | `src/services/population-health-equity.service.ts` | - | ❌ Missing in Flutter |
| **population health equity hub** | `src/components/population-health-equity-hub.component.ts` | - | ❌ Missing in Flutter |
| **positive psychology** | `src/services/positive-psychology.service.ts` | - | ❌ Missing in Flutter |
| **positive psychology flourishing hub** | `src/components/positive-psychology-flourishing-hub.component.ts` | - | ❌ Missing in Flutter |
| **post it notes** | `src/components/shared/post-it-notes.component.ts` | - | ❌ Missing in Flutter |
| **practice roi** | `src/services/practice-roi.service.ts` | - | ❌ Missing in Flutter |
| **practice roi calculator** | `src/components/shared/practice-roi-calculator.component.ts` | - | ❌ Missing in Flutter |
| **prapare.assessment** | `src/services/clinical-assessments/instruments/prapare.assessment.ts` | - | ❌ Missing in Flutter |
| **precision nutrition calculator** | `src/components/precision-nutrition-calculator.component.ts` | - | ❌ Missing in Flutter |
| **presentation export** | `src/services/presentation-export.service.ts` | - | ❌ Missing in Flutter |
| **presentation modal** | `src/components/presentation-modal.component.ts` | - | ❌ Missing in Flutter |
| **primary button** | - | `pocketgull_flutter/lib/widgets/ui/primary_button.dart` | ⚠️ Flutter Only |
| **privacy sovereignty dashboard** | `src/components/privacy-sovereignty-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **procedural health investment** | `src/services/procedural-health-investment.service.ts` | - | ❌ Missing in Flutter |
| **procedural investment matrix** | `src/components/procedural-investment-matrix.component.ts` | - | ❌ Missing in Flutter |
| **protac context scrubber** | `src/services/protac-context-scrubber.service.ts` | - | ❌ Missing in Flutter |
| **provider treatment network** | `src/components/provider-treatment-network.component.ts`<br>`src/services/provider-treatment-network.service.ts` | - | ❌ Missing in Flutter |
| **pubgemma.provider** | `src/services/ai/pubgemma.provider.ts` | - | ❌ Missing in Flutter |
| **public health sentinel suite** | `src/components/public-health-sentinel-suite.component.ts` | - | ❌ Missing in Flutter |
| **public service corps** | `src/services/public-service-corps.service.ts` | - | ❌ Missing in Flutter |
| **pulse tongue pattern diagnosis** | `src/components/eastern/pulse-tongue-pattern-diagnosis.component.ts` | - | ❌ Missing in Flutter |
| **python bridge** | `src/services/python-bridge.service.ts` | `pocketgull_flutter/lib/services/python_bridge_service.dart` | ✅ Parity |
| **qeeg entrainment** | `src/services/neuro-somatic/qeeg-entrainment.service.ts` | - | ❌ Missing in Flutter |
| **quad philosophy matrix** | `src/components/shared/quad-philosophy-matrix.component.ts` | - | ❌ Missing in Flutter |
| **quantum clinical dashboard** | `src/components/quantum-clinical-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **quantum clinical engine** | `src/services/quantum-clinical-engine.service.ts` | - | ❌ Missing in Flutter |
| **quantum speculative sampler** | `src/services/quantum-speculative-sampler.service.ts` | - | ❌ Missing in Flutter |
| **radial pie menu** | `src/components/anatomy-3d/radial-pie-menu.component.ts` | - | ❌ Missing in Flutter |
| **raycast selection** | `src/services/raycast-selection.service.ts` | - | ❌ Missing in Flutter |
| **recovery suite** | `src/components/suites/recovery-suite.component.ts` | - | ❌ Missing in Flutter |
| **report tabs** | - | `pocketgull_flutter/lib/widgets/report_tabs_widget.dart` | ⚠️ Flutter Only |
| **research cohort** | - | `pocketgull_flutter/lib/models/research_cohort.dart` | ⚠️ Flutter Only |
| **research consent** | `src/services/research-consent.service.ts` | `pocketgull_flutter/lib/providers/research_consent_provider.dart` | ✅ Parity |
| **research data dividend** | `src/components/research-data-dividend.component.ts` | `pocketgull_flutter/lib/screens/research_data_dividend_screen.dart` | ✅ Parity |
| **research frame** | `src/components/research-frame.component.ts` | `pocketgull_flutter/lib/widgets/research_frame_widget.dart` | ✅ Parity |
| **research lectures** | `src/services/research-lectures.service.ts` | - | ❌ Missing in Flutter |
| **research tab** | `src/components/research-tab.component.ts` | `pocketgull_flutter/lib/widgets/research_tab_widget.dart` | ✅ Parity |
| **residency osce simulator** | `src/components/residency-osce-simulator.component.ts` | - | ❌ Missing in Flutter |
| **reveal** | `src/directives/reveal.directive.ts` | - | ❌ Missing in Flutter |
| **rich media** | `src/services/rich-media.service.ts` | `pocketgull_flutter/lib/services/rich_media_service.dart` | ✅ Parity |
| **risk score** | - | `pocketgull_flutter/lib/providers/risk_score_provider.dart` | ⚠️ Flutter Only |
| **risk tier badge** | `src/components/shared/risk-tier-badge.component.ts` | - | ❌ Missing in Flutter |
| **role demo launcher** | `src/services/role-demo-launcher.service.ts` | - | ❌ Missing in Flutter |
| **role demo modal** | `src/components/role-demo-modal.component.ts` | - | ❌ Missing in Flutter |
| **role pathway docs** | `src/services/role-pathway-docs.service.ts` | - | ❌ Missing in Flutter |
| **role pathway documentation hub** | `src/components/role-pathway-documentation-hub.component.ts` | - | ❌ Missing in Flutter |
| **ros14.assessment** | `src/services/clinical-assessments/instruments/ros14.assessment.ts` | - | ❌ Missing in Flutter |
| **rosetta stone anatomy** | `src/components/anatomy-3d/rosetta-stone-anatomy.component.ts` | - | ❌ Missing in Flutter |
| **rpm audit** | `src/services/rpm-audit.service.ts` | - | ❌ Missing in Flutter |
| **rpm dashboard** | `src/components/rpm-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **rules engine** | `src/services/rules-engine.service.ts` | `pocketgull_flutter/lib/services/rules_engine_service.dart` | ✅ Parity |
| **rx guard** | `src/services/rx-guard.service.ts` | - | ❌ Missing in Flutter |
| **rx guard lens** | `src/components/rx-guard-lens.component.ts` | - | ❌ Missing in Flutter |
| **safe html** | `src/pipes/safe-html.pipe.ts` | - | ❌ Missing in Flutter |
| **saif security posture card** | `src/components/shared/saif-security-posture-card.component.ts` | - | ❌ Missing in Flutter |
| **sarcf.assessment** | `src/services/clinical-assessments/instruments/sarcf.assessment.ts` | - | ❌ Missing in Flutter |
| **scfa microbiome vagal** | `src/components/aaas/scfa-microbiome-vagal.component.ts` | - | ❌ Missing in Flutter |
| **sdoh navigator** | `src/components/sdoh-navigator.component.ts` | - | ❌ Missing in Flutter |
| **sec1557 audit modal** | `src/components/modals/sec1557-audit-modal.component.ts` | - | ❌ Missing in Flutter |
| **secure key** | `src/services/secure-key.ts` | `pocketgull_flutter/lib/services/secure_key.dart` | ✅ Parity |
| **secure splash** | `src/components/secure-splash.component.ts` | - | ❌ Missing in Flutter |
| **secure storage** | `src/services/secure-storage.service.ts` | - | ❌ Missing in Flutter |
| **sentinel** | - | `pocketgull_flutter/lib/models/sentinel_types.dart` | ⚠️ Flutter Only |
| **sentinel surveillance** | `src/services/sentinel-surveillance.service.ts` | - | ❌ Missing in Flutter |
| **sentinel telemetry plotter** | `src/components/sentinel-telemetry-plotter.component.ts` | - | ❌ Missing in Flutter |
| **sentinel triage** | `src/components/sentinel-triage.component.ts` | `pocketgull_flutter/lib/widgets/sentinel_triage_widget.dart` | ✅ Parity |
| **serene intake** | `src/components/synthesis/serene-intake.component.ts` | `pocketgull_flutter/lib/widgets/synthesis/serene_intake_widget.dart` | ✅ Parity |
| **services providers** | - | `pocketgull_flutter/lib/providers/services_providers.dart` | ⚠️ Flutter Only |
| **session state** | `src/services/session-state.service.ts` | `pocketgull_flutter/lib/services/session_state_service.dart` | ✅ Parity |
| **seven generations stewardship lens tab** | `src/components/analysis-report/seven-generations-stewardship-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **severity particle** | `src/services/severity-particle.service.ts` | - | ❌ Missing in Flutter |
| **sheet music notation** | `src/components/sheet-music-notation.component.ts` | - | ❌ Missing in Flutter |
| **shield gemma guard** | `src/services/ai/shield-gemma-guard.service.ts` | - | ❌ Missing in Flutter |
| **sibi.assessment** | `src/services/clinical-assessments/instruments/sibi.assessment.ts` | - | ❌ Missing in Flutter |
| **skeptical epistemology** | `src/services/skeptical-epistemology.service.ts` | `pocketgull_flutter/lib/services/skeptical_epistemology_service.dart` | ✅ Parity |
| **skeptical epistemology card** | - | `pocketgull_flutter/lib/widgets/skeptical_epistemology_card_widget.dart` | ⚠️ Flutter Only |
| **skeptical epistemology hud** | `src/components/skeptical-epistemology-hud.component.ts` | - | ❌ Missing in Flutter |
| **slack integration** | `src/services/slack-integration.service.ts` | - | ❌ Missing in Flutter |
| **slack integration card** | `src/components/slack-integration-card.component.ts` | - | ❌ Missing in Flutter |
| **smart fhir launcher** | `src/components/smart-fhir-launcher.component.ts` | - | ❌ Missing in Flutter |
| **smart fhir sync** | `src/services/smart-fhir-sync.service.ts` | - | ❌ Missing in Flutter |
| **smart fhir sync modal** | `src/components/shared/smart-fhir-sync-modal.component.ts` | - | ❌ Missing in Flutter |
| **smart health card** | `src/services/smart-health-card.service.ts` | - | ❌ Missing in Flutter |
| **smart health pass modal** | `src/components/smart-health-pass-modal.component.ts` | - | ❌ Missing in Flutter |
| **smart on fhir launch** | `src/services/smart-on-fhir-launch.service.ts` | - | ❌ Missing in Flutter |
| **smart on fhir launcher** | `src/services/fhir/smart-on-fhir-launcher.service.ts` | - | ❌ Missing in Flutter |
| **sms equity bridge** | `src/components/sms-equity-bridge.component.ts`<br>`src/services/sms-equity-bridge.service.ts` | - | ❌ Missing in Flutter |
| **snomed icd crosswalk** | `src/services/snomed-icd-crosswalk.service.ts` | - | ❌ Missing in Flutter |
| **soap note generator** | `src/components/soap-note-generator.component.ts`<br>`src/services/soap-note-generator.service.ts` | - | ❌ Missing in Flutter |
| **social gravitation** | - | `pocketgull_flutter/lib/services/social_gravitation_service.dart` | ⚠️ Flutter Only |
| **social health gravitation** | `src/components/social-health-gravitation.component.ts` | - | ❌ Missing in Flutter |
| **social vector** | - | `pocketgull_flutter/lib/models/social_vector.dart` | ⚠️ Flutter Only |
| **socratic challenge card** | `src/components/socratic-challenge-card.component.ts` | - | ❌ Missing in Flutter |
| **socratic comorbidity radar** | `src/services/socratic-comorbidity-radar.service.ts` | - | ❌ Missing in Flutter |
| **socratic epistemology lens tab** | `src/components/analysis-report/socratic-epistemology-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **socratic jargon dictionary** | `src/services/socratic-jargon-dictionary.service.ts` | - | ❌ Missing in Flutter |
| **socratic jargon tooltip** | `src/components/shared/socratic-jargon-tooltip.component.ts` | - | ❌ Missing in Flutter |
| **socratic multilingual terminal** | `src/components/socratic-multilingual-terminal.component.ts` | - | ❌ Missing in Flutter |
| **socratic multilingual translator** | `src/services/socratic-multilingual-translator.service.ts` | - | ❌ Missing in Flutter |
| **socratic rounds** | `src/services/socratic-rounds.service.ts` | - | ❌ Missing in Flutter |
| **socratic rounds hud** | `src/components/socratic-rounds-hud.component.ts` | - | ❌ Missing in Flutter |
| **space biophysics** | `src/services/space-biophysics.service.ts` | - | ❌ Missing in Flutter |
| **space health hud** | `src/components/space-health-hud.component.ts` | - | ❌ Missing in Flutter |
| **spatial lesion markup** | `src/services/spatial-lesion-markup.service.ts` | - | ❌ Missing in Flutter |
| **spatial scanner** | `src/components/spatial-scanner.component.ts` | - | ❌ Missing in Flutter |
| **specialist cds suite** | `src/components/specialist-cds/specialist-cds-suite.component.ts` | - | ❌ Missing in Flutter |
| **splash** | - | `pocketgull_flutter/lib/screens/splash_screen.dart` | ⚠️ Flutter Only |
| **ssa disability navigator** | `src/components/shared/ssa-disability-navigator.component.ts`<br>`src/services/ssa-disability-navigator.service.ts` | - | ❌ Missing in Flutter |
| **stanford hci clinical lens** | `src/components/stanford-hci-clinical-lens.component.ts`<br>`src/services/stanford-hci-clinical-lens.service.ts` | - | ❌ Missing in Flutter |
| **steeep quality audit** | `src/services/steeep-quality-audit.service.ts` | - | ❌ Missing in Flutter |
| **steeep quality hud** | `src/components/steeep-quality-hud/steeep-quality-hud.component.ts` | - | ❌ Missing in Flutter |
| **storage** | `src/services/storage.service.ts` | `pocketgull_flutter/lib/services/storage_service.dart` | ✅ Parity |
| **storm analysis** | `src/components/storm-analysis.component.ts` | - | ❌ Missing in Flutter |
| **stress intervention** | `src/services/stress-intervention.service.ts` | `pocketgull_flutter/lib/services/stress_intervention_service.dart` | ✅ Parity |
| **summary node** | `src/components/summary-node.component.ts` | `pocketgull_flutter/lib/widgets/summary_node_widget.dart` | ✅ Parity |
| **summary overview lens tab** | `src/components/analysis-report/summary-overview-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **support ticket modal** | `src/components/modals/support-ticket-modal.component.ts` | - | ❌ Missing in Flutter |
| **symptom habit journal** | `src/components/symptom-habit-journal.component.ts` | - | ❌ Missing in Flutter |
| **synthesis dashboard** | - | `pocketgull_flutter/lib/widgets/synthesis/synthesis_dashboard_widget.dart` | ⚠️ Flutter Only |
| **systems equilibrium hud** | `src/components/analysis-report/systems-equilibrium-hud.component.ts` | - | ❌ Missing in Flutter |
| **talent hr portal** | `src/components/talent-hr-portal.component.ts` | - | ❌ Missing in Flutter |
| **task flow** | `src/components/task-flow.component.ts` | `pocketgull_flutter/lib/widgets/task_flow_widget.dart` | ✅ Parity |
| **tcm meridian stasis matrix** | `src/components/eastern/tcm-meridian-stasis-matrix.component.ts` | - | ❌ Missing in Flutter |
| **tcm pulse tongue matrix** | `src/components/tcm-pulse-tongue-matrix.component.ts` | - | ❌ Missing in Flutter |
| **tcm.assessment** | `src/services/clinical-assessments/instruments/tcm.assessment.ts` | - | ❌ Missing in Flutter |
| **teledentistry** | `src/services/teledentistry.service.ts` | `pocketgull_flutter/lib/services/teledentistry_service.dart` | ✅ Parity |
| **teledentistry odontogram** | `src/components/teledentistry-odontogram.component.ts` | `pocketgull_flutter/lib/widgets/teledentistry_odontogram_widget.dart` | ✅ Parity |
| **teledentistry systemic lens** | `src/components/analysis-report/teledentistry-systemic-lens.component.ts` | - | ❌ Missing in Flutter |
| **theme** | `src/services/theme.service.ts` | `pocketgull_flutter/lib/services/theme_service.dart` | ✅ Parity |
| **theme studio drawer** | `src/components/shared/theme-studio-drawer.component.ts` | - | ❌ Missing in Flutter |
| **therapeutics suite** | `src/components/suites/therapeutics-suite.component.ts` | - | ❌ Missing in Flutter |
| **transit wellness gateway** | `src/services/transit-wellness-gateway.service.ts` | - | ❌ Missing in Flutter |
| **travel localization** | `src/services/travel-localization.service.ts` | - | ❌ Missing in Flutter |
| **travel sports ticketing** | `src/services/travel-sports-ticketing.service.ts` | - | ❌ Missing in Flutter |
| **travel sports ticketing hub** | `src/components/travel-sports-ticketing-hub.component.ts` | - | ❌ Missing in Flutter |
| **tri cloud care plan consensus** | `src/components/clinical/tri-cloud-care-plan-consensus.component.ts` | - | ❌ Missing in Flutter |
| **tri paradigm integrative lens tab** | `src/components/analysis-report/tri-paradigm-integrative-lens-tab.component.ts` | - | ❌ Missing in Flutter |
| **tri paradigm swarm** | `src/services/tri-paradigm-swarm.service.ts` | - | ❌ Missing in Flutter |
| **tri paradigm swarm card** | `src/components/tri-paradigm-swarm-card.component.ts` | - | ❌ Missing in Flutter |
| **triage board** | - | `pocketgull_flutter/lib/screens/triage_board_screen.dart` | ⚠️ Flutter Only |
| **tribal health sovereignty** | `src/services/tribal-health-sovereignty.service.ts` | - | ❌ Missing in Flutter |
| **tribal health sovereignty card** | `src/components/shared/tribal-health-sovereignty-card.component.ts` | - | ❌ Missing in Flutter |
| **turing suite** | `src/components/turing/turing-suite.component.ts` | - | ❌ Missing in Flutter |
| **types** | `src/services/clinical-assessments/types.ts`<br>`src/services/ybocs/types.ts` | - | ❌ Missing in Flutter |
| **typographic 3d body** | `src/components/shared/typographic-3d-body.component.ts` | - | ❌ Missing in Flutter |
| **typographic anatomy** | `src/services/typographic-anatomy.service.ts` | - | ❌ Missing in Flutter |
| **typology badge** | `src/components/shared/typology-badge.component.ts` | - | ❌ Missing in Flutter |
| **uk rio pubmed sourcing** | `src/components/uk-rio-pubmed-sourcing.component.ts` | - | ❌ Missing in Flutter |
| **unified paradigm synthesizer** | `src/components/suites/unified-paradigm-synthesizer.component.ts` | - | ❌ Missing in Flutter |
| **universal living will** | `src/services/universal-living-will.service.ts` | - | ❌ Missing in Flutter |
| **university league** | `src/services/university-league.service.ts` | - | ❌ Missing in Flutter |
| **usage licensing paywall modal** | `src/components/modals/usage-licensing-paywall-modal.component.ts` | - | ❌ Missing in Flutter |
| **vagal biofeedback dock** | `src/components/vagal-biofeedback-dock.component.ts` | - | ❌ Missing in Flutter |
| **vata pitta kapha matrix** | `src/components/ayurvedic/vata-pitta-kapha-matrix.component.ts` | - | ❌ Missing in Flutter |
| **veo** | `src/services/veo.service.ts` | - | ❌ Missing in Flutter |
| **verify ai** | `src/services/verify-ai.service.ts` | `pocketgull_flutter/lib/services/verify_ai_service.dart` | ✅ Parity |
| **vertex agent builder** | `src/services/ai/vertex-agent-builder.service.ts` | - | ❌ Missing in Flutter |
| **vertex ai model garden** | `src/services/vertex-ai-model-garden.service.ts` | - | ❌ Missing in Flutter |
| **vertex model garden portal** | `src/components/vertex-model-garden-portal.component.ts` | - | ❌ Missing in Flutter |
| **vertex search** | `src/components/vertex-search.component.ts` | - | ❌ Missing in Flutter |
| **vibroacoustic haptic** | `src/services/hardware/vibroacoustic-haptic.service.ts` | - | ❌ Missing in Flutter |
| **vision accessibility assist** | `src/components/vision-accessibility-assist.component.ts` | - | ❌ Missing in Flutter |
| **visit review** | `src/components/visit-review.component.ts` | `pocketgull_flutter/lib/widgets/visit_review_widget.dart` | ✅ Parity |
| **visual acuity** | `src/services/visual-acuity.service.ts` | - | ❌ Missing in Flutter |
| **visual acuity exam** | `src/components/shared/visual-acuity-exam.component.ts` | - | ❌ Missing in Flutter |
| **visual haptic entrainment** | `src/services/visual-haptic-entrainment.service.ts` | - | ❌ Missing in Flutter |
| **vitals quick dial hud** | `src/components/vitals-quick-dial-hud.component.ts` | - | ❌ Missing in Flutter |
| **vocal biomarker** | `src/services/vocal-biomarker.service.ts` | - | ❌ Missing in Flutter |
| **voice assistant** | `src/components/voice-assistant.component.ts` | `pocketgull_flutter/lib/widgets/voice_assistant_widget.dart` | ✅ Parity |
| **wacom crypto ink** | `src/services/wacom-crypto-ink.service.ts` | - | ❌ Missing in Flutter |
| **walkthrough tour** | `src/components/walkthrough-tour.component.ts`<br>`src/services/walkthrough-tour.service.ts` | `pocketgull_flutter/lib/services/walkthrough_tour_service.dart` | ✅ Parity |
| **walmart affiliate** | `src/services/walmart-affiliate.service.ts` | - | ❌ Missing in Flutter |
| **web download** | - | `pocketgull_flutter/lib/services/web_download.dart` | ⚠️ Flutter Only |
| **web download stub** | - | `pocketgull_flutter/lib/services/web_download_stub.dart` | ⚠️ Flutter Only |
| **web download web** | - | `pocketgull_flutter/lib/services/web_download_web.dart` | ⚠️ Flutter Only |
| **web local intelligence** | - | `pocketgull_flutter/lib/services/web_local_intelligence.dart` | ⚠️ Flutter Only |
| **webauthn passkey** | `src/services/webauthn-passkey.service.ts` | - | ❌ Missing in Flutter |
| **webgpu bio signal** | `src/services/webgpu-bio-signal.service.ts` | - | ❌ Missing in Flutter |
| **webgpu edge ai** | `src/services/webgpu-edge-ai.service.ts` | - | ❌ Missing in Flutter |
| **webgpu spatial digital twin** | `src/services/webgpu-spatial-digital-twin.service.ts` | - | ❌ Missing in Flutter |
| **webllm health** | `src/services/webllm-health.service.ts` | - | ❌ Missing in Flutter |
| **webllm health card** | `src/components/shared/webllm-health-card.component.ts` | - | ❌ Missing in Flutter |
| **webllm.provider** | `src/services/ai/webllm.provider.ts` | - | ❌ Missing in Flutter |
| **webmcp registration** | `src/services/webmcp-registration.service.ts` | - | ❌ Missing in Flutter |
| **whispy bioreactor** | - | `pocketgull_flutter/lib/providers/whispy_bioreactor_provider.dart`<br>`pocketgull_flutter/lib/models/whispy_bioreactor_model.dart` | ⚠️ Flutter Only |
| **whispy bioreactor hud card** | - | `pocketgull_flutter/lib/widgets/whispy_bioreactor_hud_card.dart` | ⚠️ Flutter Only |
| **whispy swarm bioreactor** | `src/services/whispy-swarm-bioreactor.service.ts` | - | ❌ Missing in Flutter |
| **whispy swarm bioreactor 3d** | `src/components/turing/whispy-swarm-bioreactor-3d.component.ts` | - | ❌ Missing in Flutter |
| **who cdc health equity** | `src/services/who-cdc-health-equity.service.ts` | - | ❌ Missing in Flutter |
| **who nih goal steering hub** | `src/components/research-frame/who-nih-goal-steering-hub.component.ts` | - | ❌ Missing in Flutter |
| **wordpress articles** | `src/services/wordpress-articles.service.ts` | - | ❌ Missing in Flutter |
| **ybocs** | `src/services/ybocs/ybocs.service.ts` | `pocketgull_flutter/lib/services/ybocs_service.dart` | ✅ Parity |
| **ybocs screener** | `src/components/ybocs-screener.component.ts` | `pocketgull_flutter/lib/widgets/ybocs_screener_widget.dart` | ✅ Parity |
| **yoga asana 3d coach** | `src/components/anatomy-3d/yoga-asana-3d-coach.component.ts` | - | ❌ Missing in Flutter |
| **yoga asana coaching** | `src/services/yoga-asana-coaching.service.ts` | - | ❌ Missing in Flutter |
| **youth mentorship** | `src/services/youth-mentorship.service.ts` | - | ❌ Missing in Flutter |
| **zamecznik canvas** | `src/components/shared/zamecznik-canvas.component.ts` | - | ❌ Missing in Flutter |
| **zen sanctuary** | `src/services/zen-sanctuary.service.ts` | - | ❌ Missing in Flutter |
| **zen sanctuary modal** | `src/components/zen-sanctuary-modal.component.ts` | - | ❌ Missing in Flutter |

## Summary
- **Matched Features**: 90
- **Missing in Flutter (Needs Migration)**: 597
- **Flutter Only (New Architecture/Components)**: 64
