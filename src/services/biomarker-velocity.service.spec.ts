import '@angular/compiler';
import { BiomarkerVelocityService } from './biomarker-velocity.service';
import { IPatient } from './patient.types';

describe('BiomarkerVelocityService - Longitudinal Rate-of-Change Suite', () => {
  let service: BiomarkerVelocityService;

  const mockHypertensivePatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175', hba1c: '6.8' },
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes']
  };

  beforeEach(() => {
    service = new BiomarkerVelocityService();
  });

  it('1. Computes mathematical velocity (dV/dt) and annual percent change', () => {
    // 88 mL/min 12 months ago -> 64 mL/min today
    const res = service.calculateVelocity({ value: 88, monthsAgo: 12 }, { value: 64, monthsAgo: 0 });
    expect(res.velocityPerYear).toBe(-24.0);
    expect(res.percentChangePerYear).toBe(-27.3);
  });

  it('2. Detects stealth decline alert when eGFR drops >15%/yr while still in normal range (64 mL/min)', () => {
    const report = service.evaluatePatientTrajectory(mockHypertensivePatient);
    expect(report.metrics.length).toBe(4);

    const egfr = report.metrics.find(m => m.name.includes('eGFR'));
    expect(egfr).toBeDefined();
    expect(egfr?.isStealthDeclineAlert).toBe(true);
    expect(egfr?.clinicalAction).toContain('Stealth Decay Alert');
  });

  it('3. Computes Gompertz-Makeham hazard multiplier and organ resilience score', () => {
    const report = service.evaluatePatientTrajectory(mockHypertensivePatient);
    expect(report.organResilienceScore).toBeLessThan(80);
    expect(report.gompertzHazardMultiplier).toBeGreaterThan(1.0);
  });

  it('4. Generates standard FHIR R4 Observation collection bundle with velocity extensions', () => {
    const report = service.evaluatePatientTrajectory(mockHypertensivePatient);
    const bundle = report.fhirObservationBundle;
    expect(bundle['resourceType']).toBe('Bundle');
    expect((bundle['entry'] as any[]).length).toBe(4);
  });
});
