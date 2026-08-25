import { GlobalHealthInitiativesService } from './global-health-initiatives.service';
import { IPatient } from './patient.types';

describe('GlobalHealthInitiativesService', () => {
  const service = new GlobalHealthInitiativesService();

  const mockPatient: IPatient = {
    id: 'pt-who-01',
    name: 'Jane Doe',
    age: 52,
    gender: 'Female',
    vitals: { bp: '138/86', hr: '74', spO2: '98', temp: '36.8', weight: '68', height: '165' },
    preexistingConditions: ['Mild Fatigue', 'Stress-Induced Tension Headache'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'NCD Prevention & Longevity',
    lastVisit: '2026-08-20'
  };

  it('1. Computes WHO SDG 3.4 & HEARTS 10-year CVD risk profile', () => {
    const res = service.calculateWhoCvdRisk(mockPatient);
    expect(res.riskScorePercent).toBeGreaterThan(0);
    expect(res.riskTier).toBeDefined();
    expect(res.whoHeartsRecommendations.length).toBeGreaterThan(0);
    expect(res.sdg34TargetAssessment).toContain('UN SDG 3.4');
  });

  it('2. Maps clinical syndromes to WHO ICD-11 Chapter 26 (Traditional Medicine) codes', () => {
    const mappings = service.mapToWhoIcd11Chapter26(['Chronic Fatigue', 'Digestive Bloating', 'Tension Headache']);
    expect(mappings.length).toBeGreaterThanOrEqual(2);

    const spleen = mappings.find(m => m.icd11Tm1Code.includes('SF01'));
    expect(spleen).toBeDefined();
    expect(spleen?.paradigm).toBe('TCM');

    const liver = mappings.find(m => m.icd11Tm1Code.includes('SF20'));
    expect(liver).toBeDefined();
    expect(liver?.biomedicalCorrelates).toContain('Tension Headache (G44.2)');
  });

  it('3. Computes NIH Geroscience biological age delta and 0.1 Hz vagal breathing protocol', () => {
    const nih = service.assessNihGeroscienceAndVagalTone(mockPatient);
    expect(nih.chronologicalAge).toBe(52);
    expect(nih.estimatedBiologicalAge).toBeDefined();
    expect(nih.vagalToneScore).toBeGreaterThan(0);
    expect(nih.recommended01HzPacingRate).toContain('0.1 Hz RSA Resonance');
  });

  it('4. Assesses ARPA-H resilient point-of-care emergency START triage', () => {
    const criticalPatient: IPatient = {
      ...mockPatient,
      vitals: { bp: '80/50', hr: '135', spO2: '88', temp: '36.0', weight: '70', height: '170' }
    };
    const triage = service.assessArpahEmergencyTriage(criticalPatient);
    expect(triage.triageCategory).toContain('IMMEDIATE (Red)');
    expect(triage.actionableDirectives[0]).toContain('Immediate airway');
    expect(triage.meshHandoffQrCodePayload).toContain('pt-who-01');
  });

  it('5. Computes WHO ICOPE intrinsic capacity and detects flagged domains', () => {
    const healthyIcope = service.assessWhoIcope(mockPatient);
    expect(healthyIcope.domains.length).toBe(6);
    expect(healthyIcope.intrinsicCapacityScore).toBeGreaterThanOrEqual(5);

    const decliningPatient: IPatient = {
      ...mockPatient,
      preexistingConditions: ['Cognitive memory decline', 'Gait instability and joint arthritis', 'Macular vision blur'],
      vitals: { ...mockPatient.vitals!, weight: '45', height: '165' } // BMI 16.5 (malnutrition)
    };
    const icope = service.assessWhoIcope(decliningPatient);
    expect(icope.flaggedDomainsCount).toBeGreaterThanOrEqual(3);
    expect(icope.intrinsicCapacityScore).toBeLessThanOrEqual(3);
    expect(icope.statusTier).toBeDefined();
    expect(icope.clinicalDirectives.length).toBeGreaterThan(0);
    expect(icope.clinicalDirectives.some(d => d.includes('Cognition') || d.includes('Mobility'))).toBe(true);
  });

  it('6. Computes NIH RECOVER Long-COVID 12-symptom consensus score and PASC threshold', () => {
    const baselineRecover = service.assessNihRecover(mockPatient);
    expect(baselineRecover.pascScore).toBeLessThan(12);
    expect(baselineRecover.thresholdMet).toBe(false);

    const longCovidPatient: IPatient = {
      ...mockPatient,
      preexistingConditions: [
        'Post-exertional malaise (PEM) crash after walking',
        'Severe chronic fatigue',
        'Brain fog and memory lapses',
        'Orthostatic dizziness POTS',
        'Heart palpitations'
      ]
    };
    const pasc = service.assessNihRecover(longCovidPatient);
    expect(pasc.pascScore).toBeGreaterThanOrEqual(12);
    expect(pasc.thresholdMet).toBe(true);
    expect(pasc.pascProbabilityTier).toBe('HIGH_PROBABILITY_PASC');
    expect(pasc.pacingAndRecoveryDirectives.some(d => d.includes('Energy Envelope'))).toBe(true);
    expect(pasc.pacingAndRecoveryDirectives.some(d => d.includes('0.1 Hz Vagal'))).toBe(true);
  });
});
