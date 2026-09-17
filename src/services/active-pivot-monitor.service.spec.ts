import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivePivotMonitorService } from './active-pivot-monitor.service';
import { ClinicalSpecialtyRiskSuiteService } from './clinical-specialty-risk-suite.service';
import { PatientStateService } from './patient-state.service';

import { TemporalTelemetryDynamicsService } from './temporal-telemetry-dynamics.service';
import { WaveformDspEngineService } from './waveform-dsp-engine.service';
import { CausalInferenceService } from './causal-inference.service';
import { EpistemicOodDetectorService } from './epistemic-ood-detector.service';

describe('ActivePivotMonitorService', () => {
  let service: ActivePivotMonitorService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        ActivePivotMonitorService,
        ClinicalSpecialtyRiskSuiteService,
        PatientStateService,
        TemporalTelemetryDynamicsService,
        WaveformDspEngineService,
        CausalInferenceService,
        EpistemicOodDetectorService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ActivePivotMonitorService));
  });

  it('1. Initializes with baseline multi-specialty clinical pivot triggers', () => {
    const triggers = service.activeTriggers();
    expect(triggers.length).toBe(4);
    expect(service.pendingTriggersCount()).toBe(4);
    expect(triggers.map(t => t.id)).toContain('trig_hypoglycemia_botanical');
    expect(triggers.map(t => t.id)).toContain('trig_ms_uhthoff_thermal');
    expect(triggers.map(t => t.id)).toContain('trig_anticholinergic_delirium');
    expect(triggers.map(t => t.id)).toContain('trig_oral_endotoxin_sibi');
  });

  it('2. Dynamically flags STAT_OVERRIDE on severe hypoglycemic telemetry', () => {
    service.evaluateLivingTelemetry({ glucoseMgDl: 48 });
    const triggers = service.activeTriggers();
    const hypoTrig = triggers.find(t => t.id === 'trig_hypoglycemia_botanical');
    expect(hypoTrig?.urgency).toBe('STAT_OVERRIDE');
    expect(hypoTrig?.currentBreachValue).toContain('48 mg/dL');
    expect(service.hasStatOverrides()).toBe(true);
  });

  it('3. Executes 1-click clinical order with FDA 21 CFR Part 11 cryptographic attestation', () => {
    const receipt = service.executePivotOrder('trig_hypoglycemia_botanical', 'DR_CHANDRASEKHAR_MD', 'Emergency glucose administered');
    expect(receipt).toBeDefined();
    expect(receipt.part11Compliant).toBe(true);
    expect(receipt.digitalAttestationDigest).toContain('sha256-fda-part11-');
    expect(receipt.clinicianId).toBe('DR_CHANDRASEKHAR_MD');

    const executedTrig = service.activeTriggers().find(t => t.id === 'trig_hypoglycemia_botanical');
    expect(executedTrig?.isExecuted).toBe(true);
    expect(executedTrig?.attestationSeal).toBe(receipt.digitalAttestationDigest);
    expect(service.executionReceipts().length).toBe(1);
    expect(service.pendingTriggersCount()).toBe(3);
  });

  it('4. Multi-Paradigm Tri-Pulse Fusion unifies Western PPG, TCM, and Ayurvedic Nadi', () => {
    const fusion = service.calculateTriPulseFusion({ vitals: { hr: '82' } });
    expect(fusion.westernHrv.hrBpm).toBe(82);
    expect(fusion.westernHrv.pulseMomentum).toBeGreaterThan(0.0);
    expect(fusion.tcmSphygmology.predominantQuality).toBeDefined();
    expect(fusion.tcmSphygmology.leftWrist.cun).toBeDefined();
    expect(fusion.ayurvedicNadi.dominantDosha).toBeDefined();
    expect(fusion.ayurvedicNadi.ojasVitalityReserve).toBeGreaterThanOrEqual(30);
    expect(fusion.fusedVitalityIndex).toBeGreaterThan(0);
  });

  it('5. Counterfactual "What-If" Trajectory Simulator projects multi-model risk reduction', async () => {
    const sim = await service.simulateWhatIfScenario({
      interventionLabel: 'Holistic Trajectory Optimization',
      botanicalInhibitorAdd: false,
      sulfonylureaDeEscalate: true,
      coolingVestActive: true,
      periodontalDebridementDone: true,
      anticholinergicDeprescribe: true
    });

    expect(sim.isNetPositive).toBe(true);
    expect(sim.after.cypClearancePct).toBe(88); // Restored from 32%
    expect(sim.after.deliriumRiskPct).toBeLessThan(sim.before.deliriumRiskPct); // 14.6% vs 54.2%
    expect(sim.after.piraAnnualEdssVelocity).toBeLessThan(sim.before.piraAnnualEdssVelocity); // 0.18 vs 0.38
    expect(sim.after.hsCrpSpikeRiskPct).toBeLessThan(sim.before.hsCrpSpikeRiskPct); // 9.4% vs 46.8%
    expect(sim.benefitSummary).toContain('Delirium/Fall risk reduced');
    expect(sim.benefitSummary).toContain('PIRA Disability velocity halved');
  });

  it('6. Fuses high-frequency waveform DSP into Tri-Pulse telemetry', () => {
    const fusion = service.calculateTriPulseFusion({ vitals: { hr: '76' } });
    expect(fusion.westernHrv.augmentationIndexPct).toBeDefined();
    expect(fusion.westernHrv.estimatedPwvMPerS).toBeDefined();
    expect(fusion.westernHrv.arterialComplianceTier).toBeDefined();
  });

  it('7. Computes Doubly Robust causal ITE in What-If simulator', async () => {
    const sim = await service.simulateWhatIfScenario({
      interventionLabel: 'Anticholinergic Deprescribing Protocol',
      botanicalInhibitorAdd: false,
      sulfonylureaDeEscalate: false,
      coolingVestActive: false,
      periodontalDebridementDone: false,
      anticholinergicDeprescribe: true
    });

    expect(sim.benefitSummary).toBeDefined();
    expect(sim.isNetPositive).toBe(true);
  });

  it('8. Evaluates epistemic OOD and temporal velocity during telemetry feed', () => {
    service.evaluateLivingTelemetry({
      glucoseMgDl: 62,
      crclMlMin: 45,
      coreTempC: 37.5
    });

    const ood = service.oodStatus();
    expect(ood).toBeDefined();
    expect(ood?.action).toBe('PROCEED'); // in-distribution
  });
});
