import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { RxGuardService } from './rx-guard.service';
import { IPatient } from './patient.types';

describe('RxGuardService - Precision PGx & Herb-Drug Matrix Suite', () => {
  let service: RxGuardService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' },
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
    medications: [{ id: 'm1', name: 'Warfarin 5mg', value: '5mg' }, { id: 'm2', name: 'Metformin 1000mg', value: '1000mg' }, { id: 'm3', name: 'Lisinopril 20mg', value: '20mg' }],
    dietarySupplements: [{ id: 's1', name: 'Ginkgo Biloba 120mg', value: '120mg' }, { id: 's2', name: 'Ashwagandha 600mg', value: '600mg' }]
  };

  beforeEach(() => {
    service = new RxGuardService();
  });

  it('1. Resolves CPIC-concordant PGx gene profiles for metabolic patient', () => {
    const profiles = service.getPatientPgxProfiles(mockPatient);
    expect(profiles.length).toBeGreaterThanOrEqual(4);

    const cyp2d6 = profiles.find(p => p.gene === 'CYP2D6');
    expect(cyp2d6).toBeDefined();
    expect(cyp2d6?.phenotype).toBe('Poor Metabolizer');
    expect(cyp2d6?.activityScore).toBe(0.0);
  });

  it('2. Detects severe CONTRAINDICATED Warfarin + Ginkgo Biloba interaction', () => {
    const interactions = service.evaluateInteractions(['Warfarin 5mg'], ['Ginkgo Biloba 120mg']);
    expect(interactions.length).toBeGreaterThanOrEqual(1);

    const ginkgo = interactions.find(i => i.herbOrNutrient.includes('Ginkgo'));
    expect(ginkgo).toBeDefined();
    expect(ginkgo?.severity).toBe('CONTRAINDICATED');
    expect(ginkgo?.evidenceGrade).toContain('Level A');
  });

  it('3. Computes overall high-risk tier and dose clearance adjustments', () => {
    const assessment = service.evaluatePatient(mockPatient);
    expect(assessment.overallRiskTier).toBe('CONTRAINDICATED');
    expect(assessment.clearanceAdjustments.length).toBeGreaterThan(0);
    expect(assessment.clearanceAdjustments[0].adjustedClearancePct).toBe(40);
  });

  it('4. Generates standard FHIR R4 GuidanceResponse resource', () => {
    const assessment = service.evaluatePatient(mockPatient);
    const fhir = assessment.fhirGuidanceResponse;
    expect(fhir['resourceType']).toBe('GuidanceResponse');
    expect(fhir['status']).toBe('success');
    expect((fhir['result'] as any).riskTier).toBe('CONTRAINDICATED');
  });
});
