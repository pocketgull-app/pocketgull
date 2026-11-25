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

    it('should enforce Kence Anderson Pre-Softmax Safety Shield action masking on STAT red-flag cues', () => {
      // Trigger BE-FAST / STEMI red-flag cue while also mentioning non-acute trial/housing keywords
      service.setTranscriptQuery('crushing chest pain stemi facial droop clinical trial housing');
      const selector = service.activeSelectorDecision();
      const scores = service.uiGatingScores();

      expect(selector.regime).toBe('STAT Safety Shield (Red-Flag Preemption)');
      expect(selector.safetyShieldActive).toBe(true);
      expect(selector.maskedExpertIds.length).toBe(8); // 12 total - 4 STAT allowlisted skills = 8 masked
      expect(service.primaryUiExpert()?.expert.id).toBe('edge-ml-hud');

      const maskedTrial = scores.find(s => s.expert.id === 'clinical-trials-matcher');
      expect(maskedTrial?.isSafetyMasked).toBe(true);
      expect(maskedTrial?.weight).toBe(0);

      service.clearOverrides();
    });

    it('should prevent Top-1 slot thrashing when Selector Hysteresis lock is within deadband margin', () => {
      // Commit default Top-1 ('analysis-report' via Summary Overview lens affinity) with a 25% deadband
      service.setHysteresisMargin(0.25);
      const initialTop1 = service.primaryUiExpert()?.expert.id;
      expect(initialTop1).toBe('analysis-report');
      service.commitCurrentPrimarySkill();

      // Add conversational keywords for counterfactual-simulator that slightly exceed analysis-report (< 25% margin)
      service.setTranscriptQuery('what-if scenario projection');
      expect(service.primaryUiExpert()?.expert.id).toBe('analysis-report');
      expect(service.primaryUiExpert()?.hysteresisLocked).toBe(true);
      expect(service.activeSelectorDecision().hysteresisApplied).toBe(true);

      // Strong multi-keyword cue exceeds 25% deadband and cleanly hands off control
      service.setTranscriptQuery('medication dosage drug posology metformin renal clearance interaction');
      expect(service.primaryUiExpert()?.expert.id).toBe('ismp-posology');

      service.clearOverrides();
    });

    it('should classify heterogeneous Skill Modalities across Edge Wasm, WebGPU, Symbolic API, and Generative', () => {
      const scores = service.uiGatingScores();
      const posology = scores.find(s => s.expert.id === 'ismp-posology');
      const knee = scores.find(s => s.expert.id === 'knee-hologram');
      const trials = scores.find(s => s.expert.id === 'clinical-trials-matcher');
      const report = scores.find(s => s.expert.id === 'analysis-report');

      expect(posology?.skillModality).toBe('Deterministic Wasm Solver');
      expect(knee?.skillModality).toBe('Spatial Physics Shader');
      expect(trials?.skillModality).toBe('Symbolic FHIR / API Engine');
      expect(report?.skillModality).toBe('Hybrid Generative Synthesizer');
    });

    it('Innovation 1: computes Micro-Skill Display Policy across specialist-full, caregiver-digest, and stat-focused modes', () => {
      // Default specialist-full
      expect(service.microSkillDisplayPolicy().densityMode).toBe('specialist-full');
      expect(service.microSkillDisplayPolicy().collapseExploratorySubViews).toBe(false);

      // Automatic STAT escalation when Safety Shield activates
      service.setManualRedFlagOverride(true);
      expect(service.microSkillDisplayPolicy().densityMode).toBe('stat-focused');
      expect(service.microSkillDisplayPolicy().collapseExploratorySubViews).toBe(true);
      expect(service.microSkillDisplayPolicy().collapseRawFhirTables).toBe(true);
      expect(service.microSkillDisplayPolicy().highlightIsmpCriticalControls).toBe(true);

      // Explicit manual density override to caregiver-digest
      service.setManualRedFlagOverride(false);
      service.setMicroSkillDensityOverride('caregiver-digest');
      expect(service.microSkillDisplayPolicy().densityMode).toBe('caregiver-digest');
      expect(service.microSkillDisplayPolicy().collapseExploratorySubViews).toBe(true);
      expect(service.microSkillDisplayPolicy().highlightIsmpCriticalControls).toBe(false);

      service.clearOverrides();
    });

    it('Innovation 2: exposes Latent Whisper Chips with 1-metric micro-perceptors and drift-alert detection', () => {
      const chipsNominal = service.latentWhisperChips();
      expect(chipsNominal.length).toBeGreaterThan(0);

      // Induce glycemic drift (CGM 210 mg/dL) while pinning knee-hologram so ismp-posology sits on the latent shelf
      service.pinExpert('knee-hologram');
      service.setKValue(1);
      service.setLabVitalsOverride({ cgmGlucoseMgDl: 210, spO2Percent: 90 });

      const chipsDrift = service.latentWhisperChips();
      const posologyChip = chipsDrift.find(c => c.expertId === 'ismp-posology');
      expect(posologyChip).toBeDefined();
      expect(posologyChip?.microMetricValue).toContain('210 mg/dL');
      expect(posologyChip?.status).toBe('drift-alert');

      service.clearOverrides();
    });

    it('Innovation 3: broadcasts Live Cross-Component Synapse Signal Pulses between paired Slot 1 & Slot 2 skills', () => {
      service.emitSynapseSignalPulse(
        'glycemic-renal-coupling',
        'counterfactual-simulator',
        'ismp-posology',
        'HbA1c Delta',
        '-1.2%'
      );

      expect(service.activeSynapseToken()).toBe('glycemic-renal-coupling');
      expect(service.activeSynapsePulse()?.sourceExpertId).toBe('counterfactual-simulator');
      expect(service.activeSynapsePulse()?.targetExpertId).toBe('ismp-posology');
      expect(service.activeSynapsePulse()?.parameterValue).toBe('-1.2%');

      service.clearSynapseSignalPulse();
      expect(service.activeSynapsePulse()).toBeNull();
      service.clearOverrides();
    });

    it('Innovation 4: compacts completed Skill Goals into 64-char hex receipts and auto-demotes to promote the next skill', () => {
      const initialPrimary = service.primaryUiExpert()?.expert.id;
      expect(initialPrimary).toBe('analysis-report');

      const receipt = service.completeAndRetireSkillGoal(
        'analysis-report',
        'Multi-paradigm synthesis reviewed & attested'
      );

      expect(receipt).not.toBeNull();
      expect(receipt?.sha256DigestHex).toMatch(/^[0-9a-f]{64}$/);
      expect(service.completedSkillReceipts().length).toBe(1);

      // Completed skill yields Top-1 slot automatically to next highest priority skill
      const promotedPrimary = service.primaryUiExpert()?.expert.id;
      expect(promotedPrimary).not.toBe('analysis-report');
      expect(receipt?.promotedNextExpertId).toBe(promotedPrimary);

      // Reopening restores the skill to active contention
      service.reopenRetiredSkillGoal('analysis-report');
      expect(service.completedSkillReceipts().length).toBe(0);
      expect(service.primaryUiExpert()?.expert.id).toBe('analysis-report');

      service.clearOverrides();
    });

    it('3D Spatial Autonomy: computes Camera & Shader Sub-Selector policy, respects manual camera hysteresis until STAT override, and surfaces Off-Frustum Spatial Whispers', () => {
      // Baseline whole-body front orientation
      expect(service.activeSpatialBodyPolicy().recommendedCamera).toBe('front');
      expect(service.activeSpatialBodyPolicy().freezeAutoSpin).toBe(false);

      // Radicular spinal cue routes to spinal camera + biomechanical_strain
      service.setTranscriptQuery('cervical radiculopathy lumbar sciatic pain');
      expect(service.activeSpatialBodyPolicy().recommendedCamera).toBe('spinal');
      expect(service.activeSpatialBodyPolicy().recommendedShader).toBe('biomechanical_strain');

      // Clinician manually orbits/locks camera to 'cranial' -> hysteresis protects camera from non-acute flips
      service.lockSpatialCamera('cranial');
      expect(service.activeSpatialBodyPolicy().recommendedCamera).toBe('cranial');
      expect(service.activeSpatialBodyPolicy().manualCameraHysteresisLocked).toBe(true);

      // While zoomed into 'cranial', hypoxemic drift in lungs triggers an Off-Frustum Spatial Whisper!
      service.setLabVitalsOverride({ spO2Percent: 91 });
      const whispers = service.computeOffFrustumSpatialWhispers('cranial');
      expect(whispers.some(w => w.regionId === 'visceral' && w.partId === 'lungs')).toBe(true);

      // Severe STAT hypoxemia (< 90%) activates Safety Shield, overriding manual camera lock to visceral + freezing spin
      service.setLabVitalsOverride({ spO2Percent: 87 });
      expect(service.activeSpatialBodyPolicy().recommendedCamera).toBe('visceral');
      expect(service.activeSpatialBodyPolicy().freezeAutoSpin).toBe(true);
      expect(service.activeSpatialBodyPolicy().suppressHeavyPostProcessing).toBe(true);

      service.clearOverrides();
    });

    it('Persona, Auth & Clinical Role Autonomy: applies Role Priors, Scope-of-Practice masks, and Splash Gate Selector policies without blocking STAT overrides', () => {
      service.clearOverrides();

      // 1. Researcher pathway elevates Clinical Trials Matcher & sets Top-k = 3
      const resPreview = service.applyClinicalRolePathway('researcher');
      expect(resPreview.recommendedTopK).toBe(3);
      expect(service.kValue()).toBe(3);
      expect(service.primaryUiExpert()?.expert.id).toBe('clinical-trials-matcher');

      // 2. Patient pathway sets Top-k = 1, caregiver-digest density, and scope-masks raw SOAP / Genomics
      const patPreview = service.applyClinicalRolePathway('patient');
      expect(patPreview.recommendedTopK).toBe(1);
      expect(service.microSkillDisplayPolicy().densityMode).toBe('caregiver-digest');
      const patScores = service.uiGatingScores();
      expect(patScores.find(s => s.expert.id === 'soap-generator')?.isSafetyMasked).toBe(true);
      expect(patScores.find(s => s.expert.id === 'biophysics-genomics')?.isSafetyMasked).toBe(true);

      // 3. STAT Red-Flag Preemption ALWAYS overrides patient role masks for emergency resuscitation skills
      service.setLabVitalsOverride({ spO2Percent: 86 });
      expect(service.activeSelectorDecision().safetyShieldActive).toBe(true);
      expect(service.primaryUiExpert()?.expert.id).toBe('edge-ml-hud');
      expect(service.microSkillDisplayPolicy().densityMode).toBe('stat-focused');
      service.resetLabVitalsOverride();

      // 4. Splash Gate Selector adapts across KSS High Fatigue, Locked Biometric, Demo Sandbox, and STAT Break-Glass
      const highFatigueGate = service.evaluateSplashGatePolicy({ kssScore: 8, isPlatformAuthenticatorAvailable: true });
      expect(highFatigueGate.regime).toBe('High-Fatigue Night-Shift Scotopic Gate');
      expect(highFatigueGate.collapseDecorativeSensoryWidgets).toBe(true);
      expect(highFatigueGate.enforceScotopicContrastHint).toBe(true);

      const statGate = service.evaluateSplashGatePolicy({ isEmergencyHold: true, kssScore: 3 });
      expect(statGate.regime).toBe('STAT Good Samaritan Emergency Gate');
      expect(statGate.recommendedAuthSkill).toBe('stat-break-glass');

      service.clearOverrides();
    });
  });
});

