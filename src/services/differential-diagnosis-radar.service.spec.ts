import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { DifferentialDiagnosisRadarService } from './differential-diagnosis-radar.service';
import { IPatient } from './patient.types';

describe('DifferentialDiagnosisRadarService - Socratic Don’t-Miss Differential Suite', () => {
  let service: DifferentialDiagnosisRadarService;

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
    vitals: { bp: '152/96', hr: '78', spO2: '98%', temp: '36.6', weight: '82', height: '175' },
    preexistingConditions: ['Refractory Hypertension', 'Type 2 Diabetes']
  };

  const mockPostpartumPatient: IPatient = {
    id: 'p007',
    name: 'Homo Sapiens (Female, 4th-Trimester Postpartum, 29y)',
    age: 29,
    gender: 'Female',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '124/82', hr: '84', spO2: '99%', temp: '36.6', weight: '65', height: '168' },
    preexistingConditions: ['Postpartum Mood Disturbance']
  };

  beforeEach(() => {
    service = new DifferentialDiagnosisRadarService();
  });

  it('1. Computes Bayesian post-test probability using prior probability and positive likelihood ratio', () => {
    // Prior = 10%, LR+ = 7.2 -> Post Odds = (0.10/0.90) * 7.2 = 0.8 -> Post Prob = 0.8 / 1.8 = 44.4%
    const postProb = service.calculateBayesianPostTest(10.0, 7.2);
    expect(postProb).toBeCloseTo(44.4, 0.5);
  });

  it('2. Evaluates hypertensive encounter and prioritizes Conn Syndrome & Pheochromocytoma ruling-out tests', () => {
    const report = service.evaluateDifferentials(mockHypertensivePatient);
    expect(report.topCannotMissDifferentials.length).toBeGreaterThanOrEqual(3);

    const conn = report.topCannotMissDifferentials.find(d => d.conditionName.includes('Primary Hyperaldosteronism'));
    expect(conn).toBeDefined();
    expect(conn?.goldStandardTest).toContain('Plasma Aldosterone');
    expect(conn?.socraticRulingOutQuestion).toContain('aldosterone-to-renin ratio');
  });

  it('3. Generates postpartum-specific differential radar for thyroiditis and late preeclampsia', () => {
    const report = service.evaluateDifferentials(mockPostpartumPatient);
    const thyroid = report.topCannotMissDifferentials.find(d => d.conditionName.includes('Thyroiditis'));
    expect(thyroid).toBeDefined();
    expect(thyroid?.targetClinicalCutoff).toContain('TSH');
  });

  it('4. Provides Popperian H0 hypothesis statement and actionable diagnostic order checklist', () => {
    const report = service.evaluateDifferentials(mockHypertensivePatient);
    expect(report.popperianNullHypothesis).toContain('H₀');
    expect(report.diagnosticActionChecklist.length).toBeGreaterThanOrEqual(3);
  });
});
