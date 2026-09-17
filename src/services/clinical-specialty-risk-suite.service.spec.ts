import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import {
  ClinicalSpecialtyRiskSuiteService,
  IMsProgressionInput,
  IWhoHeartsCvdInput,
  IDysautonomiaPemInput,
  IOncologyCachexiaInput
} from './clinical-specialty-risk-suite.service';

describe('ClinicalSpecialtyRiskSuiteService Unit Suite', () => {
  let service: ClinicalSpecialtyRiskSuiteService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalSpecialtyRiskSuiteService());
  });

  it('1. Predicts MS Progression risk with ML response and offline fallback', async () => {
    const mockBundle = {
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.82 },
          interpretation: [{ coding: [{ code: 'high' }] }],
          note: [{ text: 'High Neuro-Axonal Progression Risk' }],
          component: [{ code: { text: 'Elevated sNfL 18.2 pg/mL' } }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const input: IMsProgressionInput = {
      serumNflPgMl: 18.2,
      baselineEdss: 2.5,
      timed25ftWalkSec: 6.8,
      nineHolePegTestSec: 24.5,
      serumVitaminDNgMl: 18.0,
      serumHomocysteineUmolL: 14.1,
      modifiedFatigueImpactScore: 52.0
    };

    const mlResult = await service.predictMsProgression(input);
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.82);
    expect(mlResult.riskLevel).toBe('high');
    expect(mlResult.factors.length).toBeGreaterThan(0);

    // Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const fallbackResult = await service.predictMsProgression(input);
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThan(0.5);
    expect(fallbackResult.riskLevel).toBe('high');

    globalThis.fetch = originalFetch;
  });

  it('2. Predicts WHO HEARTS CVD risk with ML response and offline fallback', async () => {
    const mockBundle = {
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.28 },
          interpretation: [{ coding: [{ code: 'critical' }] }],
          note: [{ text: 'High 10-Year CVD Event Risk' }],
          component: [{ code: { text: 'Systolic Hypertension 160 mmHg' } }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const input: IWhoHeartsCvdInput = {
      ageYears: 65,
      systolicBpMmhg: 162,
      bodyMassIndex: 32.5,
      isSmoker: true,
      restingHeartRateBpm: 88,
      waistToHeightRatio: 0.68,
      knownDiabetesHistory: true
    };

    const mlResult = await service.predictWhoHeartsCvd(input);
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.28);
    expect(mlResult.riskLevel).toBe('critical');

    // Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const fallbackResult = await service.predictWhoHeartsCvd(input);
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThanOrEqual(0.20);
    expect(fallbackResult.riskLevel).toBe('critical');

    globalThis.fetch = originalFetch;
  });

  it('3. Predicts NIH Dysautonomia PEM crash risk with ML response and offline fallback', async () => {
    const mockBundle = {
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.86 },
          interpretation: [{ coding: [{ code: 'critical' }] }],
          note: [{ text: 'Imminent Post-Exertional Malaise Crash' }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const input: IDysautonomiaPemInput = {
      orthostaticHrDeltaBpm: 40,
      restingRmssdMs: 15,
      diurnalPulsePressureVariance: 42,
      priorDayExertionLoad: 9200,
      sleepEfficiencyPct: 50,
      morningVasFatigue: 9.0
    };

    const mlResult = await service.predictDysautonomiaPem(input);
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.86);

    // Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const fallbackResult = await service.predictDysautonomiaPem(input);
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThanOrEqual(0.70);
    expect(fallbackResult.riskLevel).toBe('critical');

    globalThis.fetch = originalFetch;
  });

  it('4. Predicts NIH NCI Oncology Cachexia risk with ML response and offline fallback', async () => {
    const mockBundle = {
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.91 },
          interpretation: [{ coding: [{ code: 'critical' }] }],
          note: [{ text: 'Severe Cancer Cachexia and Sarcopenic Decline' }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const input: IOncologyCachexiaInput = {
      weightLossPct6mo: 15.0,
      crpToAlbuminRatio: 3.1,
      skeletalMuscleIndexCm2M2: 32.0,
      dailyCaloricDeficitKcal: 700,
      anorexiaSymptomScore: 8.5
    };

    const mlResult = await service.predictOncologyCachexia(input);
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.91);

    // Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const fallbackResult = await service.predictOncologyCachexia(input);
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThanOrEqual(0.70);
    expect(fallbackResult.riskLevel).toBe('critical');

    globalThis.fetch = originalFetch;
  });

  it('5. Guarantees distinct, individualized clinical outcomes across patient cohort', async () => {
    // 1. Mara Santos -> High MS progression, Low CVD, Low Cachexia
    const maraProfile = await service.evaluatePatientSpecialtyProfile({
      id: 'p_mara_santos',
      name: 'Homo Sapiens (Female, Neurological & Methylation, 34y)'
    });
    expect(maraProfile.msProgression.score).toBeGreaterThanOrEqual(0.60);
    expect(maraProfile.whoHeartsCvd.score).toBeLessThan(0.10);
    expect(maraProfile.oncologyCachexia.score).toBeLessThan(0.20);
    expect(maraProfile.primaryClinicalVulnerability).toContain('Neuro-Axonal');
    expect(maraProfile.recommendedParadigmInterventions.some(i => i.includes('Vitamin D3'))).toBe(true);
    expect(maraProfile.recommendedParadigmInterventions.some(i => i.includes('Mitochondrial'))).toBe(true);

    // 2. Charles Darwin -> High Dysautonomia PEM crash risk, Low MS progression
    const darwinProfile = await service.evaluatePatientSpecialtyProfile({
      id: 'p_charles_darwin',
      name: 'Charles Darwin'
    });
    expect(darwinProfile.dysautonomiaPem.score).toBeGreaterThanOrEqual(0.60);
    expect(darwinProfile.msProgression.score).toBeLessThan(0.35);
    expect(darwinProfile.primaryClinicalVulnerability).toContain('Dysautonomia');
    expect(darwinProfile.recommendedParadigmInterventions.some(i => i.includes('Rachel Nabors Parasympathetic'))).toBe(true);

    // 3. Pancreatic Oncology (p009) -> Critical Cachexia, Low MS progression
    const p009Profile = await service.evaluatePatientSpecialtyProfile({
      id: 'p009',
      name: 'Homo Sapiens (Male, Pancreatic Oncology & Cachexia, 62y)'
    });
    expect(p009Profile.oncologyCachexia.score).toBeGreaterThanOrEqual(0.65);
    expect(p009Profile.msProgression.score).toBeLessThan(0.40);
    expect(p009Profile.primaryClinicalVulnerability).toContain('Cachexia');
    expect(p009Profile.recommendedParadigmInterventions.some(i => i.includes('Leucine/HMB'))).toBe(true);

    // 4. Metabolic Syndrome (p001) -> Elevated WHO HEARTS CVD Risk, Low MS progression, Zero cachexia
    const p001Profile = await service.evaluatePatientSpecialtyProfile({
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)'
    });
    expect(p001Profile.whoHeartsCvd.score).toBeGreaterThanOrEqual(0.15);
    expect(p001Profile.msProgression.score).toBeLessThan(0.30);
    expect(p001Profile.oncologyCachexia.score).toBeLessThan(0.15);
    expect(p001Profile.primaryClinicalVulnerability).toContain('Cardiovascular');
    expect(p001Profile.recommendedParadigmInterventions.some(i => i.includes('Antihypertensive'))).toBe(true);

    // 5. Linus Pauling (p008) -> Low composite risks
    const paulingProfile = await service.evaluatePatientSpecialtyProfile({
      id: 'p008',
      name: 'Linus P (Orthomolecular Profile)'
    });
    expect(paulingProfile.msProgression.score).toBeLessThan(0.20);
    expect(paulingProfile.dysautonomiaPem.score).toBeLessThan(0.30);
    expect(paulingProfile.oncologyCachexia.score).toBeLessThan(0.15);
    expect(paulingProfile.recommendedParadigmInterventions.length).toBeGreaterThan(0);
  });

  it('6. Evaluates MS lifespan phenotypes: POMS, Adult RRMS, and Late-Onset LOMS', () => {
    // Pediatric POMS
    const poms = service.evaluateMsLifespanPhenotype({
      id: 'p_poms_adolescent',
      age: 15,
      preexistingConditions: ['Pediatric-Onset Multiple Sclerosis (POMS)']
    });
    expect(poms.phenotype).toBe('PEDIATRIC_POMS');
    expect(poms.relapseVelocityAnnualized).toBe(2.0);
    expect(poms.piraPredominance).toBe('FOCAL_INFLAMMATORY');
    expect(poms.immunosenescenceRisk).toBe('LOW');

    // Adult RRMS (Mara Santos)
    const adult = service.evaluateMsLifespanPhenotype({
      id: 'p_mara_santos',
      age: 34,
      preexistingConditions: ['Relapsing-Remitting Multiple Sclerosis (RRMS)']
    });
    expect(adult.phenotype).toBe('ADULT_RRMS');
    expect(adult.piraPredominance).toBe('COMPARTMENTALIZED_SMOLDERING');
    expect(adult.smolderingPiraScore).toBeGreaterThanOrEqual(0.70);

    // Late-Onset LOMS
    const loms = service.evaluateMsLifespanPhenotype({
      id: 'p_loms_elder',
      age: 58,
      preexistingConditions: ['Late-Onset Primary Progressive Multiple Sclerosis (LOMS / PPMS)']
    });
    expect(loms.phenotype).toBe('LATE_ONSET_LOMS_PPMS');
    expect(loms.piraPredominance).toBe('SPINAL_CORD_PROGRESSIVE');
    expect(loms.immunosenescenceRisk).toBe('HIGH');
  });

  it('7. Evaluates Smoldering PIRA score, differential alerts, and Uhthoff thermal reserve', () => {
    // PIRA score
    const piraMara = service.evaluateSmolderingPiraRisk({ id: 'p_mara_santos' });
    expect(piraMara).toBe(0.78);
    const piraPauling = service.evaluateSmolderingPiraRisk({ id: 'p008' });
    expect(piraPauling).toBe(0.12);

    // Differentials: normal vs AQP4 vs MOGAD vs X-ALD
    const normalAlerts = service.evaluateDemyelinatingDifferential({ id: 'p_mara_santos' });
    expect(normalAlerts[0]).toContain('No non-MS mimic red flags');

    const devicAlerts = service.evaluateDemyelinatingDifferential({
      preexistingConditions: ['Longitudinally Extensive Transverse Myelitis (LETM)']
    });
    expect(devicAlerts.some(a => a.includes('AQP4-IgG NMOSD'))).toBe(true);

    const xaldAlerts = service.evaluateDemyelinatingDifferential({
      preexistingConditions: ['Adrenoleukodystrophy (X-ALD)']
    });
    expect(xaldAlerts.some(a => a.includes('X-Linked Adrenoleukodystrophy'))).toBe(true);

    // Uhthoff Thermal Reserve
    const safeReserve = service.computeUhthoffThermalReserve(37.0, 72, 8);
    expect(safeReserve).toBeGreaterThan(0.4);
    const dangerReserve = service.computeUhthoffThermalReserve(37.4, 88, 5);
    expect(dangerReserve).toBeLessThan(safeReserve);
  });

  it('8. Generates dynamic 3-Act Pivot & Pulse Care Plan suggestions for MS', () => {
    const plan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_mara_santos',
      name: 'Mara Santos'
    });

    expect(plan.act1WhereYouveBeen).toContain('RRMS');
    expect(plan.act2WhereYouStandToday).toContain('PIRA');
    expect(plan.act3WhereYoureGoing).toContain('Vitamin D3');
    expect(plan.continuousPulseChecklist.length).toBeGreaterThanOrEqual(4);
    expect(plan.agilePivotTriggers.length).toBeGreaterThanOrEqual(2);
    expect(plan.precisionNutrients.some(n => n.compound.includes('Ubiquinol'))).toBe(true);
  });

  it('9. Generates specialized 3-Act Pivot & Pulse plans for Darwin, Kahlo, and Metabolic CVD', () => {
    // Charles Darwin: Dysautonomia / POTS / PEM
    const darwinPlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_charles_darwin',
      name: 'Charles Darwin'
    });
    expect(darwinPlan.act1WhereYouveBeen).toContain('HMS Beagle');
    expect(darwinPlan.act2WhereYouStandToday).toContain('POTS');
    expect(darwinPlan.act3WhereYoureGoing).toContain('0.1 Hz');
    expect(darwinPlan.continuousPulseChecklist.some(c => c.metric.includes('RMSSD'))).toBe(true);
    expect(darwinPlan.agilePivotTriggers.some(t => t.triggerCondition.includes('PEM'))).toBe(true);
    expect(darwinPlan.precisionNutrients.some(n => n.compound.includes('Sodium Chloride'))).toBe(true);

    // Frida Kahlo: Polytrauma / Neuropathic Spine Pain
    const kahloPlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_frida_kahlo',
      name: 'Frida Kahlo'
    });
    expect(kahloPlan.act1WhereYouveBeen).toContain('polytrauma');
    expect(kahloPlan.act2WhereYouStandToday).toContain('neuropathic');
    expect(kahloPlan.act3WhereYoureGoing).toContain('aquatic');
    expect(kahloPlan.continuousPulseChecklist.some(c => c.metric.includes('Pain Intensity'))).toBe(true);
    expect(kahloPlan.precisionNutrients.some(n => n.compound.includes('PEA'))).toBe(true);

    // Metabolic Syndrome / CVD Stewardship
    const metabolicPlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p001',
      name: 'Metabolic Patient'
    });
    expect(metabolicPlan.act1WhereYouveBeen).toContain('metabolic syndrome');
    expect(metabolicPlan.act2WhereYouStandToday).toContain('WHO HEARTS');
    expect(metabolicPlan.act3WhereYoureGoing).toContain('DASH');
    expect(metabolicPlan.continuousPulseChecklist.some(c => c.metric.includes('Blood Pressure'))).toBe(true);
    expect(metabolicPlan.precisionNutrients.some(n => n.compound.includes('Berberine'))).toBe(true);
  });

  it('10. Generates tailored 6-Pillar precision care plans for Marie Curie, Ramanujan, and Edwin Smith 3', () => {
    // Marie Curie: Radiation aplastic anemia & 8-OHdG
    const curiePlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_marie_curie',
      name: 'Madame Marie Curie'
    });
    expect(curiePlan.act1WhereYouveBeen).toContain('radium-226');
    expect(curiePlan.act2WhereYouStandToday).toContain('8-OHdG');
    expect(curiePlan.precisionNutrients.some(n => n.compound.includes('Sulforaphane'))).toBe(true);
    expect(curiePlan.differentialSafetyDemarcation?.ruledOutMimics).toContain('Myelodysplastic Syndrome with Del(5q)');

    // Srinivasa Ramanujan: Hepatic amoebiasis & gut mucosal restoration
    const ramanujanPlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_srinivasa_ramanujan',
      name: 'Srinivasa Ramanujan'
    });
    expect(ramanujanPlan.act1WhereYouveBeen).toContain('amoebiasis');
    expect(ramanujanPlan.act2WhereYouStandToday).toContain('calprotectin');
    expect(ramanujanPlan.precisionNutrients.some(n => n.compound.includes('PepZin GI'))).toBe(true);

    // Edwin Smith 3: Ancient cranial trauma & cervical immobilization
    const smithPlan = service.generateDynamicPivotPulseCarePlan({
      id: 'p_edwin_smith_3',
      name: 'Edwin Smith 3'
    });
    expect(smithPlan.act1WhereYouveBeen).toContain('cranial');
    expect(smithPlan.act2WhereYouStandToday).toContain('dural pulsation');
    expect(smithPlan.precisionNutrients.some(n => n.compound.includes('Honey Poultice'))).toBe(true);
  });
});
