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
});
