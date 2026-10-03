import '@angular/compiler';
import { ClinicalMoERouterService } from './clinical-moe-router.service';

describe('ClinicalMoERouterService', () => {
  let service: ClinicalMoERouterService;

  beforeEach(() => {
    service = new ClinicalMoERouterService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should activate base Gulliver Core synthesizer by default', () => {
    const cluster = service.activeExpertCluster();
    expect(cluster.length).toBe(1);
    expect(cluster[0].id).toBe('gulliver-core');
    expect(service.computeEfficiencySavingsPercent()).toBe(36); // 1.2 / 1.88 GFLOPs active = ~36% savings
  });

  it('should dynamically activate Acoustic Sidecar when acoustic telemetry is enabled', () => {
    service.setAcousticTelemetryState(true);
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('acoustic-sidecar');
    expect(service.computeEfficiencySavingsPercent()).toBe(28); // (1.2 + 0.15) / 1.88 GFLOPs active
  });

  it('should dynamically activate SIBI Bridge when lens is Teledentistry & Systemic Health', () => {
    service.setActiveLens('Teledentistry & Systemic Health');
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('sibi-bridge');
    expect(service.computeEfficiencySavingsPercent()).toBe(32); // (1.2 + 0.08) / 1.88 GFLOPs active
  });

  it('should dynamically activate Spatial 3D DICOM Shader when DICOM volume is present', () => {
    service.setDICOMVolumeState(true);
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('dicom-spatial-shader');
    expect(service.computeEfficiencySavingsPercent()).toBe(12); // (1.2 + 0.45) / 1.88 GFLOPs active
  });

  it('should activate all subnets when all triggers are active', () => {
    service.setAcousticTelemetryState(true);
    service.setDICOMVolumeState(true);
    service.setActiveLens('Teledentistry & Systemic Health');

    const cluster = service.activeExpertCluster();
    expect(cluster.length).toBe(4);
    expect(service.computeEfficiencySavingsPercent()).toBe(0); // 100% of dense pass active
  });

  it('should assign Fast (Low Latency) thinking budget for Summary Overview by default', () => {
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(0);
    expect(config.reasoningTier).toBe('Fast (Low Latency)');
    expect(config.includeThoughts).toBe(false);
  });

  it('should assign Deep Clinical Synthesis (High Acuity) thinking budget for high-complexity lenses', () => {
    service.setActiveLens('RSNA Knee Abnormality');
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(2048);
    expect(config.reasoningTier).toBe('Deep Clinical Synthesis (High Acuity)');
  });

  it('should allow custom thinking budget overrides', () => {
    service.setCustomThinkingBudget(16384);
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(16384);
    expect(config.reasoningTier).toBe('Deep Clinical Synthesis (High Acuity)');

    service.setCustomThinkingBudget(512);
    expect(service.currentThinkingConfig().reasoningTier).toBe('Fast (Low Latency)');

    service.setCustomThinkingBudget(null);
    expect(service.currentThinkingConfig().thinkingBudget).toBe(0);
  });

  describe('Frontend SMoE UI Gating Router', () => {
    it('should compute initial UI gating scores and partition into primary, secondary, and latent', () => {
      const scores = service.uiGatingScores();
      expect(scores.length).toBe(12); // 12 registered UI experts
      expect(service.primaryUiExpert()).not.toBeNull();
      expect(service.secondaryUiExpert()).not.toBeNull();
      expect(service.latentUiExperts().length).toBe(10);
      expect(service.cognitiveNoiseReductionPercent()).toBe(83); // (1 - 2/12) * 100%
    });

    it('should route knee-hologram as primary and counterfactual-simulator as secondary in Knee OA scenario', () => {
      service.loadDemoScenario('knee_oa');
      const primary = service.primaryUiExpert();
      const secondary = service.secondaryUiExpert();

      expect(primary?.expert.id).toBe('knee-hologram');
      expect(secondary?.expert.id).toBe('counterfactual-simulator');
      expect(service.activeLens()).toBe('RSNA Knee Abnormality');

      // Verify Cross-Attention Bridge activation
      const bridge = service.activeCrossAttentionBridge();
      expect(bridge).not.toBeNull();
      expect(bridge?.id).toBe('bridge-knee-whatif');
      expect(bridge?.benchmarkMetric).toBe('-18% Medial Shear Stress');
    });

    it('should dynamically calculate Softmax Viewport Proportioning clamped between 55% and 72%', () => {
      service.loadDemoScenario('knee_oa');
      const primaryRatio = service.primaryViewportRatio();
      const secondaryRatio = service.secondaryViewportRatio();

      expect(primaryRatio).toBeGreaterThanOrEqual(55);
      expect(primaryRatio).toBeLessThanOrEqual(72);
      expect(primaryRatio + secondaryRatio).toBe(100);
    });

    it('should dynamically elevate ismp-posology when conversational cue contains medication keywords', () => {
      service.setTranscriptQuery('need to review metformin dosage and renal clearance');
      const primary = service.primaryUiExpert();
      expect(primary?.expert.id).toBe('ismp-posology');
      expect(primary?.routingRationale).toContain('Conversational cue match');
    });

    it('should allow clinician to pin an expert with highest priority', () => {
      service.pinExpert('steeep-quality-hud');
      const primary = service.primaryUiExpert();
      expect(primary?.expert.id).toBe('steeep-quality-hud');
      expect(primary?.routingRationale).toContain('Clinician Manual Pin Override');

      service.clearOverrides();
      expect(service.pinnedExpertId()).toBeNull();
    });

    it('should adjust kValue and update latent shelf size accordingly', () => {
      service.setKValue(3);
      expect(service.kValue()).toBe(3);
      expect(service.latentUiExperts().length).toBe(9);
      expect(service.cognitiveNoiseReductionPercent()).toBe(75); // (1 - 3/12) * 100%

      service.setKValue(1);
      expect(service.kValue()).toBe(1);
      expect(service.latentUiExperts().length).toBe(11);
      expect(service.cognitiveNoiseReductionPercent()).toBe(92); // (1 - 1/12) * 100%
    });

    it('should load shift patient and configure targeted expert and vitals', () => {
      service.loadShiftPatient('p001');
      expect(service.activeShiftPatientId()).toBe('p001');
      expect(service.activeShiftPatient()?.name).toBe('Homo Sapiens (Male, Metabolic)');
      expect(service.primaryUiExpert()?.expert.id).toBe('ismp-posology');

      service.loadShiftPatient('p_edwin_smith_3');
      expect(service.activeShiftPatient()?.name).toBe('Edwin Smith');
      expect(service.primaryUiExpert()?.expert.id).toBe('knee-hologram');

      service.clearOverrides();
      expect(service.activeShiftPatientId()).toBeNull();
      expect(service.activeShiftPatient()).toBeNull();
    });

    it('should retrieve all 10 clinical shift decision flows and individual patient flows', () => {
      const allFlows = service.getAllDecisionFlows();
      expect(allFlows.length).toBe(10);

      const p001Flow = service.getDecisionFlow('p001');
      expect(p001Flow).not.toBeNull();
      expect(p001Flow?.patientName).toBe('Homo Sapiens (Male, Metabolic)');
      expect(p001Flow?.resultingRouting.primaryExpertId).toBe('ismp-posology');
      expect(p001Flow?.resultingRouting.noiseReductionPercent).toBe(75);

      const curieFlow = service.getDecisionFlow('p_marie_curie');
      expect(curieFlow).not.toBeNull();
      expect(curieFlow?.patientName).toBe('Marie Curie');
      expect(curieFlow?.resultingRouting.primaryExpertId).toBe('biomolecular-physics');
    });

    it('should track activeDecisionFlow when a shift patient is loaded', () => {
      expect(service.activeDecisionFlow()).toBeNull();

      service.loadShiftPatient('p002');
      const flow = service.activeDecisionFlow();
      expect(flow).not.toBeNull();
      expect(flow?.patientName).toBe('Homo Sapiens (Female, Asthma)');
      expect(flow?.resultingRouting.primaryExpertId).toBe('edge-ml-hud');
      expect(flow?.resultingRouting.secondaryExpertId).toBe('steeep-quality-hud');

      service.clearOverrides();
      expect(service.activeDecisionFlow()).toBeNull();
    });

    it('should synthesize rich epistemic explainability text for AI agent and clinician review', () => {
      const explanation = service.explainDecisionFlow('p_frida_kahlo');
      expect(explanation).toContain('Frida Kahlo');
      expect(explanation).toContain('Somatosensory Re-Mapping & Central Sensitization Mitigation Bridge');
      expect(explanation).toContain('Sparse Gating Softmax Distribution');
      expect(explanation).toContain('75% noise reduction');

      const nonExistent = service.explainDecisionFlow('unknown_patient_xyz');
      expect(nonExistent).toContain('No SMoE decision flow profile found');
    });

    it('should elevate specialist-referral, clinical-trials-matcher, sdoh-navigator, and environmental-exposomics on relevant conversational cues', () => {
      // 1. Specialist Referral trigger
      service.setTranscriptQuery('need to refer to a cardiologist for urgent subspecialist consult');
      expect(service.primaryUiExpert()?.expert.id).toBe('specialist-referral');

      // 2. Clinical Trials trigger
      service.setTranscriptQuery('looking for an active recruiting clinical trial for orphan disease novel therapy');
      expect(service.primaryUiExpert()?.expert.id).toBe('clinical-trials-matcher');

      // 3. SDOH Navigator trigger
      service.setTranscriptQuery('patient experiencing severe food insecurity and housing instability copay difficulty');
      expect(service.primaryUiExpert()?.expert.id).toBe('sdoh-navigator');

      // 4. Environmental Exposomics trigger
      service.setTranscriptQuery('wildfire smoke plume causing severe air quality aqi spike and heatwave');
      expect(service.primaryUiExpert()?.expert.id).toBe('environmental-exposomics');

      service.clearOverrides();
    });
  });
});

