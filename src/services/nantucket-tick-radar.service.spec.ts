import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import {
  NantucketTickRadarService,
  NANTUCKET_GEO_HOTSPOTS,
  EMPIRICAL_NANTUCKET_PRIORS
} from './nantucket-tick-radar.service';

describe('NantucketTickRadarService', () => {
  it('should initialize with default hotspots, priors, and inspection zones', () => {
    const service = new NantucketTickRadarService();

    expect(service.hotspots().length).toBeGreaterThanOrEqual(5);
    expect(service.selectedHotspotId()).toBe('squam_farm');
    expect(service.activeHotspot().name).toContain('Squam Farm');
    expect(service.activeHotspot().vectorRiskLevel).toBe('EXTREME');
    expect(service.inspectionZones().length).toBe(7);
  });

  it('should accurately calculate dwell time and prophylaxis eligibility for blacklegged ticks', () => {
    const service = new NantucketTickRadarService();

    // 1. Under 24 hours: Low transmission, no prophylaxis
    const assessmentUnder24 = service.assessDwellTime(18, 2, 'ixodes_nymph');
    expect(assessmentUnder24.dwellTier).toBe('under_24h');
    expect(assessmentUnder24.lymeTransmissionProbability).toBeLessThanOrEqual(2);
    expect(assessmentUnder24.doxycyclineProphylaxisEligible).toBe(false);

    // 2. >= 36 hours attached and removed within 72 hours: Prophylaxis indicated
    const assessmentEligible = service.assessDwellTime(48, 12, 'ixodes_nymph');
    expect(assessmentEligible.dwellTier).toBe('36_to_72h');
    expect(assessmentEligible.lymeTransmissionProbability).toBeGreaterThanOrEqual(14);
    expect(assessmentEligible.doxycyclineProphylaxisEligible).toBe(true);
    expect(assessmentEligible.clinicalRecommendation).toContain('Single-dose oral Doxycycline');

    // 3. Removed past 72 hours: Window expired
    const assessmentLate = service.assessDwellTime(48, 80, 'ixodes_nymph');
    expect(assessmentLate.doxycyclineProphylaxisEligible).toBe(false);
    expect(assessmentLate.clinicalRecommendation).toContain('Past 72-Hour Prophylaxis Window');
  });

  it('should not recommend Lyme prophylaxis for non-blacklegged ticks (Lone Star or Dog Tick)', () => {
    const service = new NantucketTickRadarService();
    const assessment = service.assessDwellTime(48, 10, 'lone_star');

    expect(assessment.doxycyclineProphylaxisEligible).toBe(false);
    expect(assessment.lymeTransmissionProbability).toBe(0);
    expect(assessment.clinicalRecommendation).toContain('Prophylaxis Not Indicated for Non-Blacklegged Ticks');
  });

  it('should perform Bayesian multi-pathogen triage and reject null hypothesis for pathognomonic signs', () => {
    const service = new NantucketTickRadarService();

    // With Erythema migrans (bulls-eye rash)
    const triageLyme = service.calculateBayesianTriage(
      ['bulls_eye_erythema', 'fatigue_malaise'],
      'ixodes_nymph',
      40,
      'squam_farm'
    );

    const topPathogen = triageLyme[0];
    expect(topPathogen.pathogenId).toBe('lyme_borrelia');
    expect(topPathogen.posteriorPercent).toBeGreaterThan(90);
    expect(topPathogen.pValueH0).toBeLessThan(0.05);
    expect(topPathogen.nullHypothesisRejected).toBe(true);
  });

  it('should elevate Babesiosis probability when dark urine and drenching sweats are present', () => {
    const service = new NantucketTickRadarService();
    const triage = service.calculateBayesianTriage(
      ['dark_urine_sweats'],
      'ixodes_nymph',
      36,
      'polpis_harbor'
    );

    const babesia = triage.find(t => t.pathogenId === 'babesiosis');
    expect(babesia).toBeDefined();
    expect(babesia!.posteriorPercent).toBeGreaterThan(60);
    expect(babesia!.treatmentSummary).toContain('Atovaquone');
  });

  it('should elevate Alpha-Gal syndrome probability for Lone Star tick bites with post-meat symptoms', () => {
    const service = new NantucketTickRadarService();
    const triage = service.calculateBayesianTriage(
      ['meat_allergy_anaphylaxis'],
      'lone_star',
      12,
      'smooth_hummocks'
    );

    const alphaGal = triage[0];
    expect(alphaGal.pathogenId).toBe('alpha_gal');
    expect(alphaGal.posteriorPercent).toBeGreaterThan(80);
    expect(alphaGal.treatmentSummary).toContain('Epinephrine');
  });

  it('should generate a valid FHIR R4 Bundle with Composition, Observation, and Condition resources', () => {
    const service = new NantucketTickRadarService();
    const bundle: any = service.generateFhirR4Bundle('TEST-MINOR-123');

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBe(3);

    const comp = bundle.entry.find((e: any) => e.resource.resourceType === 'Composition');
    expect(comp).toBeDefined();
    expect(comp.resource.title).toContain('Nantucket Cottage Hospital');

    const obs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation');
    expect(obs).toBeDefined();
    expect(obs.resource.code.coding[0].code).toBe('79190-5'); // LOINC for tick attachment duration

    const cond = bundle.entry.find((e: any) => e.resource.resourceType === 'Condition');
    expect(cond).toBeDefined();
    expect(cond.resource.code.coding[0].code).toBe('23502006'); // SNOMED for Lyme disease
  });

  it('should toggle inspection zones correctly and compute inspected count', () => {
    const service = new NantucketTickRadarService();
    expect(service.inspectedZonesCount()).toBe(0);

    service.toggleInspectionZone('scalp_hairline');
    service.toggleInspectionZone('groin_pelvis');
    expect(service.inspectedZonesCount()).toBe(2);

    service.toggleInspectionZone('scalp_hairline');
    expect(service.inspectedZonesCount()).toBe(1);
  });
});
