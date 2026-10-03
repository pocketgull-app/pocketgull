import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MultiParadigmReasoningService } from './multi-paradigm-reasoning.service';
import { PatientStateService } from './patient-state.service';
import { PythonBridgeService } from './python-bridge.service';

describe('MultiParadigmReasoningService', () => {
  const createService = () => {
    const mockPatientSnapshot = {
      id: 'pt-001',
      name: 'Eleanor Vance',
      age: 54,
      gender: 'Female' as const,
      vitals: { bp: '138/88', hr: '74', spO2: '98' },
      preexistingConditions: ['Essential Hypertension'],
      medications: [{ name: 'Atorvastatin', dose: '20mg', frequency: 'Daily' }],
      dietarySupplements: [{ name: 'Curcumin', dose: '500mg' }, { name: 'Piperine', dose: '10mg' }],
      history: [],
      bookmarks: [],
      issues: {}
    };

    const mockPatientState = {
      vitals: signal(mockPatientSnapshot.vitals),
      asPatientSnapshot: () => mockPatientSnapshot
    };

    const mockPythonBridge = {
      evaluateBotanicalSynergy: async () => ({
        composite_interaction_risk_score: 0.05,
        risk_level: 'LOW' as const,
        phenocopy_risk_detected: false,
        estimated_hepatic_clearance_pct: 92.0,
        cyp_isoenzyme_status: [],
        synergy_pairs_detected: [{
          botanical_a: 'Piperine',
          botanical_b: 'Curcumin',
          synergy_type: 'Bioavailability Enhancement',
          amplification_factor: 20.0,
          clinical_mechanism: 'Glucuronidation inhibition'
        }],
        herb_drug_interactions: [],
        ismp_safety_alerts: [],
        evidence_grounded_recommendations: ['Synergy verified'],
        provenance_hash: 'sha256:1234567890abcdef',
        evaluated_at_utc: new Date().toISOString()
      })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PythonBridgeService, useValue: mockPythonBridge }
      ]
    });

    return runInInjectionContext(injector, () => new MultiParadigmReasoningService());
  };

  it('1. Synthesizes all 4 clinical dimensions (Allopathic, Ayurvedic, TCM, Functional)', () => {
    const service = createService();
    const synthesis = service.holisticSynthesis();

    expect(synthesis).toBeTruthy();
    expect(synthesis.allopathic.vitalSignsRiskTier).toBe('STAGE_1');
    expect(synthesis.ayurvedic.dominantPrakriti).toBe('Pitta-Kapha');
    expect(synthesis.tcm.zangFuDisharmony).toContain('Liver Yang');
    expect(synthesis.functional.lifestylePacingScore).toBeGreaterThan(0);
    expect(synthesis.concordantTherapies.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Refreshes botanical synergy via Python bridge', async () => {
    const service = createService();
    const result = await service.refreshBotanicalSynergy();

    expect(result).toBeTruthy();
    expect(result?.risk_level).toBe('LOW');
    expect(result?.synergy_pairs_detected.length).toBe(1);
    expect(service.liveBotanicalSynergy()?.estimated_hepatic_clearance_pct).toBe(92.0);
  });
});
