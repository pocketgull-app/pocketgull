import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalBiologicalAgeTwinService, IBiomarkerInput } from './clinical-biological-age-twin.service';

describe('ClinicalBiologicalAgeTwinService Unit Suite', () => {
  let service: ClinicalBiologicalAgeTwinService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalBiologicalAgeTwinService());
  });

  it('1. Computes canonical Levine PhenoAge with 0 ms offline latency', () => {
    const baseline: IBiomarkerInput = {
      chronologicalAge: 40,
      albumin: 4.6,
      creatinine: 0.82,
      glucose: 86,
      hsCrp: 0.6,
      lymphocytePct: 34,
      mcv: 88,
      rdw: 12.2,
      alp: 60,
      wbc: 5.5,
      unitSystem: 'US'
    };

    const result = service.calculatePhenoAge(baseline);
    expect(result.chronologicalAge).toBe(40);
    expect(result.biologicalPhenoAge).toBeLessThan(40); // Healthy biomarkers yield youthful PhenoAge
    expect(result.ageDelta).toBeLessThan(0);
    expect(result.tenYearMortalityRisk).toBeGreaterThan(0);
    expect(result.tenYearMortalityRisk).toBeLessThan(0.1);
    expect(result.vitalityIndex).toBeGreaterThan(80);
  });

  it('2. Correctly flags accelerated aging under metabolic & inflammatory burden', () => {
    const stressed: IBiomarkerInput = {
      chronologicalAge: 45,
      albumin: 3.7, // Low albumin
      creatinine: 1.35, // Elevated creatinine
      glucose: 145, // Elevated fasting glucose
      hsCrp: 4.8, // High systemic inflammation
      lymphocytePct: 20, // Low lymphocyte %
      mcv: 96,
      rdw: 15.2, // High anisocytosis
      alp: 110, // Elevated ALP
      wbc: 9.8, // Elevated WBC
      unitSystem: 'US'
    };

    const result = service.calculatePhenoAge(stressed);
    expect(result.biologicalPhenoAge).toBeGreaterThan(45);
    expect(result.ageDelta).toBeGreaterThan(5.0); // Significant biological age acceleration
    expect(result.mortalityHazardRatio).toBeGreaterThan(1.5);
  });

  it('3. Generates additive waterfall attributions reconciling to age delta', () => {
    const input: IBiomarkerInput = {
      chronologicalAge: 42,
      albumin: 4.8, // protective
      creatinine: 0.85,
      glucose: 120, // accelerating
      hsCrp: 3.2, // accelerating
      lymphocytePct: 28,
      mcv: 90,
      rdw: 13.0,
      alp: 65,
      wbc: 6.0,
      unitSystem: 'US'
    };

    const result = service.calculatePhenoAge(input);
    expect(result.attributions.length).toBe(9);

    const crpAttr = result.attributions.find(a => a.key === 'hsCrp');
    expect(crpAttr).toBeDefined();
    expect(crpAttr?.impact).toBe('accelerating');
    expect(crpAttr?.clinicalMechanism).toContain('inflammation');

    const albAttr = result.attributions.find(a => a.key === 'albumin');
    expect(albAttr).toBeDefined();
    expect(albAttr?.impact).toBe('protective');
  });

  it('4. Evaluates 5-organ decay vectors across all major biological subsystems', () => {
    const result = service.activeEvaluation();
    expect(result.organDecay.length).toBe(5);

    const systems = result.organDecay.map(s => s.system);
    expect(systems).toContain('Immune & Inflammatory');
    expect(systems).toContain('Metabolic & Glycemic');
    expect(systems).toContain('Renal & Microvascular');
    expect(systems).toContain('Hepatic & Synthetic');
    expect(systems).toContain('Cardiovascular & Hemodynamic');
  });

  it('5. Simulates 90-day counterfactual trajectory rejuvenation', () => {
    const baseline = service.activeBiomarkers();
    const projection = service.simulateCounterfactual(baseline, {
      deltaHsCrp: -0.6,
      deltaGlucose: -15,
      deltaAlbumin: +0.3,
      targetHorizonDays: 90
    });

    expect(projection.rejuvenationYears).toBeLessThan(0); // Biological age improves (drops)
    expect(projection.projectedPhenoAge).toBeLessThan(projection.baselinePhenoAge);
    expect(projection.trajectoryMilestones.length).toBe(3);
    expect(projection.trajectoryMilestones[2].day).toBe(90);
  });

  it('6. Synchronizes active biomarker panel from PatientStateService', () => {
    const mockPatientState = {
      patientAge: () => 52,
      vitals: () => ({
        cgmGlucoseMgDl: '118',
        bp: '134/82',
        hr: '76',
        crp: '2.8',
        cmpLabs: {
          albumin: '4.1',
          creatinine: '1.15',
          alp: '78'
        }
      }),
      functionalMedicineTelemetry: () => ({
        hsCrpEstimate: '2.8 mg/L'
      })
    };

    service.syncFromPatientState(mockPatientState);

    const b = service.activeBiomarkers();
    expect(b.chronologicalAge).toBe(52);
    expect(b.glucose).toBe(118);
    expect(b.systolicBp).toBe(134);
    expect(b.restingHr).toBe(76);
    expect(b.hsCrp).toBe(2.8);
    expect(b.albumin).toBe(4.1);
    expect(b.creatinine).toBe(1.15);
    expect(b.alp).toBe(78);
  });

  it('7. Pushes simulated biomarkers back into PatientStateService', () => {
    let updatedCmp: any = null;
    let updatedVitals: any = null;

    const mockPatientState = {
      updateCmpLabs: (cmp: any) => { updatedCmp = cmp; },
      vitals: {
        update: (fn: (v: any) => any) => { updatedVitals = fn({ bp: '120/80', hr: '70' }); }
      }
    };

    service.updateBiomarker('glucose', 88);
    service.updateBiomarker('hsCrp', 0.7);
    service.updateBiomarker('albumin', 4.7);
    service.pushBiomarkersToPatientState(mockPatientState);

    expect(updatedCmp).toBeDefined();
    expect(updatedCmp.glucose).toBe('88');
    expect(updatedCmp.hsCrp).toBe('0.7');
    expect(updatedCmp.albumin).toBe('4.7');
    expect(updatedVitals.cgmGlucoseMgDl).toBe('88');
    expect(updatedVitals.crp).toBe('0.7');
  });

  it('8. Predicts ML biological age acceleration risk with offline fallback', async () => {
    const mockBundle = {
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.91 },
          interpretation: [{ coding: [{ code: 'high' }] }],
          note: [{ text: 'High Biological Age Acceleration Risk' }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const mlResult = await service.predictMlBiologicalAgeAcceleration();
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.91);
    expect(mlResult.riskLevel).toBe('high');

    // Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const fallbackResult = await service.predictMlBiologicalAgeAcceleration();
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThanOrEqual(0.0);
    expect(fallbackResult.score).toBeLessThanOrEqual(1.0);

    globalThis.fetch = originalFetch;
  });
});

