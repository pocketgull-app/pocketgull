import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SkepticalEpistemologyService', () => {
  const service = new SkepticalEpistemologyService();

  it('1. Evaluates Popperian falsifiability and null-hypothesis (H0) p-values', () => {
    const evalResult = service.evaluateFalsifiability('Vagal Heart Rate Deceleration', 62, 72, 25);

    expect(evalResult.metricName).toBe('Vagal Heart Rate Deceleration');
    expect(evalResult.pValue).toBeLessThan(0.05);
    expect(evalResult.isFalsified).toBe(true);
    expect(evalResult.epistemicConfidencePercent).toBeGreaterThan(90);
    expect(evalResult.skepticalWarningNotice).toBeNull();
  });

  it('2. Flags high p-value observations with explicit Skeptical Guardrail notices', () => {
    const evalResult = service.evaluateFalsifiability('Quantum Coherence Frequency', 72.1, 72.0, 5);

    expect(evalResult.pValue).toBeGreaterThan(0.05);
    expect(evalResult.isFalsified).toBe(false);
    expect(evalResult.skepticalWarningNotice).toContain('Null hypothesis H0 cannot be rejected');
  });

  it('3. Generates Cochrane Risk of Bias (RoB 2) academic assessments', () => {
    const biasReport = service.evaluateCochraneRiskOfBias('cit_vagal_rsa_2023');

    expect(biasReport.citationId).toBe('cit_vagal_rsa_2023');
    expect(biasReport.overallRiskOfBias).toBe('Some Concerns');
    expect(biasReport.skepticalSummary).toContain('moderate risk of bias');
  });

  it('4. Generates FDA 21 CFR Section 520(o) non-device CDS compliance reports', () => {
    const complianceReport = service.evaluateCdsCompliance('Functional Medicine Matrix', 2);

    expect(complianceReport.isFdaSection520oCompliant).toBe(true);
    expect(complianceReport.disclaimer).toContain('Non-Device Clinical Decision Support (CDS)');
    expect(complianceReport.regulatoryMetadata.cfrReference).toContain('21 CFR Part 860');
    expect(complianceReport.regulatoryMetadata.clinicianMandate).toContain('Licensed Healthcare Professional');
    expect(['Level A (RCTs)', 'Level B (Cohort)']).toContain(complianceReport.evidenceLevel);
  });

  it('5. Generates relevant Socratic challenge questions matching lens keywords', () => {
    const questions = service.generateSocraticChallenges('Treatment Matrix', 'Check statistical significance with p-value and correlation', 3);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].question).toBeDefined();
    expect(questions[0].options.length).toBe(4);
    expect(questions[0].explanation).toBeDefined();
    expect(questions[0].epistemicTag).toBeDefined();
  });

  it('6. Generates fallback Socratic challenges when no keyword matches', () => {
    const questions = service.generateSocraticChallenges(
      'Unusual Lens Target',
      'Xyz unknown topic with no matching keywords that meets minimum length threshold for processing.',
      2
    );

    expect(questions.length).toBe(2);
    expect(questions[0].id).toContain('socratic-unusual-lens-target');
  });

  it('7. Matches DOI-backed Socratic questions for ambient scribe and knee MRI kinematics', () => {
    const ambientChallenges = service.generateSocraticChallenges(
      'Ambient Scribe',
      'Ambient audio dictation transcript producing SOAP notes and review of systems.',
      2
    );
    expect(ambientChallenges.some(c => c.epistemicTag === 'Ambient Scribe Hallucination')).toBe(true);

    const kneeChallenges = service.generateSocraticChallenges(
      'Physical Medicine',
      'Patient with knee joint meniscus tear and ACL laxity evaluated on MRI.',
      2
    );
    expect(kneeChallenges.some(c => c.epistemicTag === 'Joint-Prior Bayesian Calibration')).toBe(true);
  });

  it('8. Retrieves the complete biohack epistemic catalog', () => {
    const biohacks = service.getAllBiohacks();
    expect(biohacks.length).toBeGreaterThanOrEqual(8);
    expect(biohacks.some(b => b.id === 'cold-immersion')).toBe(true);
    expect(biohacks.some(b => b.id === 'photobiomodulation')).toBe(true);
    expect(biohacks.some(b => b.id === 'nad-precursors')).toBe(true);
  });

  it('9. Correctly flags unrejected H0 biohacks with skeptical warnings (NAD+ and Vitamin C)', () => {
    const nad = service.evaluateBiohack('nad-precursors');
    expect(nad.falsifiability.isFalsified).toBe(false);
    expect(nad.falsifiability.pValue).toBeGreaterThanOrEqual(0.05);
    expect(nad.falsifiability.skepticalWarningNotice).toContain('Null hypothesis H0 cannot be rejected');
    expect(nad.cochraneBias.overallRiskOfBias).toBe('High Risk of Bias');

    const cold = service.evaluateBiohack('cold-immersion');
    expect(cold.falsifiability.isFalsified).toBe(true);
    expect(cold.falsifiability.pValue).toBeLessThan(0.05);
    expect(cold.falsifiability.skepticalWarningNotice).toBeNull();
  });

  it('10. Dynamically generates epistemic assessments for novel biohack queries', () => {
    const custom = service.evaluateBiohack('Hyperbaric Ozone Therapy');
    expect(custom.name).toBe('Hyperbaric Ozone Therapy');
    expect(custom.falsifiability).toBeDefined();
    expect(custom.cochraneBias).toBeDefined();
    expect(custom.contraindications.length).toBeGreaterThan(0);
  });

  it('11. Evaluates PROTAC 3-body Hook Effect saturation & competitive auto-inhibition for polypharmacy', () => {
    const suppressed = service.evaluateProtacHookEffectFalsification(9, 3);
    expect(suppressed.isHookEffectSuppressed).toBe(true);
    expect(suppressed.hookRatio).toBeGreaterThan(1.45);
    expect(suppressed.falsifiability.pValue).toBeGreaterThan(0.05);
    expect(suppressed.falsifiability.skepticalWarningNotice).toContain('Hook Effect Alert');

    const optimal = service.evaluateProtacHookEffectFalsification(4, 1);
    expect(optimal.isHookEffectSuppressed).toBe(false);
    expect(optimal.falsifiability.pValue).toBeLessThan(0.05);
  });

  it('12. Evaluates LLPS Cahn-Hilliard Phase Boundary for plaque/aggregate dissolution claims', () => {
    const unachieved = service.evaluateLlpsPhaseBoundaryFalsification('Curcumin Liposomal', 'Amyloid Fibrils', 1.2, 0.25);
    expect(unachieved.isPhaseBoundaryAchieved).toBe(false);
    expect(unachieved.falsifiability.pValue).toBeGreaterThan(0.05);
    expect(unachieved.falsifiability.skepticalWarningNotice).toContain('LLPS Thermodynamic Guardrail');

    const achieved = service.evaluateLlpsPhaseBoundaryFalsification('Engineered Condensate', 'Stress Granules', 2.4, -0.15);
    expect(achieved.isPhaseBoundaryAchieved).toBe(true);
    expect(achieved.falsifiability.pValue).toBeLessThan(0.05);
  });

  it('13. Falsifies bio-resonance quantum devices against physiological thermal noise floor (k_B T)', () => {
    const bioResonance = service.evaluateQuantumThermalFalsification('Scalar Harmonizer', 1e-6, 7.83);
    expect(bioResonance.isThermalNoiseOvercome).toBe(false);
    expect(bioResonance.falsifiability.pValue).toBeGreaterThan(0.9);
    expect(bioResonance.falsifiability.skepticalWarningNotice).toContain('k_B T');
    expect(bioResonance.cochraneBias.overallRiskOfBias).toBe('High Risk of Bias');
  });

  it('14. Computes Zeeman-steered continuous evidence superposition (|S⟩ vs. |T⟩)', () => {
    const highAcuity = service.evaluateQuantumDualSpinSuperposition(0.92);
    expect(highAcuity.singletYieldPhiS).toBeGreaterThan(0.7);
    expect(highAcuity.dominantBranch).toBe('Singlet |S⟩ (Standard of Care)');

    const lowAcuity = service.evaluateQuantumDualSpinSuperposition(0.12);
    expect(lowAcuity.tripletYieldPhiT).toBeGreaterThan(0.7);
    expect(lowAcuity.dominantBranch).toBe('Triplet |T⟩ (Integrative Synthesis)');

    const balanced = service.evaluateQuantumDualSpinSuperposition(0.50);
    expect(balanced.dominantBranch).toBe('Superposition |Ψ⟩');
  });

  it('15. Audits Reticular framework pore size-exclusion and essential mineral depletion', () => {
    const zeolite = service.evaluateReticularPoreSelectivityFalsification('Zeolite Clay', 4.01, 4.28, 0.75);
    expect(zeolite.isSelectivelySieved).toBe(false);
    expect(zeolite.depletionRiskMinerals).toContain('Magnesium (Mg2+)');
    expect(zeolite.falsifiability.skepticalWarningNotice).toContain('Reticular Pore Selectivity Alert');

    const catalog = service.getAllBiophysicalFalsifications();
    expect(catalog.protacPolypharmacy).toBeDefined();
    expect(catalog.llpsPhaseBoundary).toBeDefined();
    expect(catalog.quantumThermalNoise).toBeDefined();
    expect(catalog.quantumDualSpin).toBeDefined();
    expect(catalog.reticularPoreSieve).toBeDefined();
  });

  it('16. Evaluates Grounded Clinical Assertions against H0 and Cochrane risk of bias', () => {
    const validAssertion = {
      hypothesis: 'Lumbar disc protrusion L4-L5',
      icd10Code: 'M51.26',
      snomedCtId: '202794008',
      epistemicConfidence: 0.91,
      nullHypothesisH0: 'Asymptomatic morphological variant without radiculopathy',
      pValueNullRejection: 0.004,
      cochraneRiskOfBias: 'Low Risk of Bias' as const,
      evidenceTier: 'Level A (Replicated RCTs)' as const,
      counterHypotheses: [
        'Sacroiliac joint dysfunction',
        'Piriformis syndrome',
        'Thoracolumbar Maigne syndrome'
      ] as [string, string, string],
      disconfirmingPhysicalExams: ['Negative Straight Leg Raise at > 70 deg'],
      redFlagExceptions: ['Cauda equina syndrome'],
      statutoryCitations: [],
      attestationTimestamp: new Date().toISOString()
    };

    const evaluation = service.evaluateGroundedAssertion(validAssertion);
    expect(evaluation.isFalsified).toBe(false);
    expect(evaluation.pValue).toBe(0.004);
    expect(evaluation.skepticalWarningNotice).toBeNull();
    expect(evaluation.epistemicConfidencePercent).toBe(91);

    // Test non-significant p-value warning
    const nonSigAssertion = {
      ...validAssertion,
      pValueNullRejection: 0.12
    };
    const nonSigEval = service.evaluateGroundedAssertion(nonSigAssertion);
    expect(nonSigEval.isFalsified).toBe(true);
    expect(nonSigEval.skepticalWarningNotice).toContain('H0 Null Hypothesis cannot be rejected');
  });

  it('17. Generates System 2 Deliberative Thinking Prompt enforcing 3 counter-hypotheses', () => {
    const prompt = service.buildSystem2ThinkingPrompt('Phil Gear, 38y Male', 'L4-L5 posterior disc protrusion');
    expect(prompt).toContain('[SYSTEM 2 DELIBERATIVE SKEPTICAL REASONING PROTOCOL]');
    expect(prompt).toContain('FORMULATE EXACTLY 3 ORTHOGONAL COUNTER-HYPOTHESES');
    expect(prompt).toContain('DISCONFIRMING PHYSICAL EXAMS');
    expect(prompt).toContain('STATISTICAL H0 TESTING');
    expect(prompt).toContain('COCHRANE RISK OF BIAS');
  });
});

