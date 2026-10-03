import { Injector, runInInjectionContext, signal } from '@angular/core';
import { GlobalHealingParadigmsService } from './global-healing-paradigms.service';
import { PatientStateService } from './patient-state.service';
import { PythonBridgeService } from './python-bridge.service';

describe('GlobalHealingParadigmsService', () => {
  const createService = () => {
    const mockPatientSnapshot = {
      id: 'pt-001',
      name: 'Eleanor Vance',
      age: 54,
      gender: 'Female' as const,
      vitals: { bp: '136/88', hr: '74', spO2: '98' },
      preexistingConditions: ['Essential Hypertension', 'Metabolic Syndrome'],
      medications: [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }],
      dietarySupplements: [
        { id: 's1', name: 'Curcumin', value: '500mg' },
        { id: 's2', name: 'Piperine', value: '10mg' }
      ],
      history: [],
      bookmarks: [],
      issues: {}
    };

    const mockPatientState = {
      vitals: signal(mockPatientSnapshot.vitals),
      asPatientSnapshot: () => mockPatientSnapshot
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PythonBridgeService, useValue: {} }
      ]
    });

    return runInInjectionContext(injector, () => new GlobalHealingParadigmsService());
  };

  it('1. Computes consensus across all 10 Global Healing Paradigms', () => {
    const service = createService();
    const consensus = service.decadConsensus();

    expect(consensus).toBeTruthy();
    expect(consensus.totalParadigmsEvaluated).toBe(10);
    expect(consensus.epistemicConvergenceScore).toBeGreaterThanOrEqual(0.85);

    // Verify presence of all 10 paradigms
    expect(consensus.allopathic).toBeDefined();
    expect(consensus.osteopathic).toBeDefined();
    expect(consensus.naturopathic).toBeDefined();
    expect(consensus.tcm).toBeDefined();
    expect(consensus.ayurvedic).toBeDefined();
    expect(consensus.functional).toBeDefined();
    expect(consensus.unaniTibb).toBeDefined();
    expect(consensus.indigenousTek).toBeDefined();
    expect(consensus.siddhaSowaRigpa).toBeDefined();
    expect(consensus.chronobiologyExposomics).toBeDefined();
  });

  it('2. Evaluates Naturopathic Therapeutic Order stepped ladder', () => {
    const service = createService();
    const consensus = service.decadConsensus();

    expect(consensus.therapeuticOrderSteppedLadder.length).toBe(7);
    const tier1 = consensus.therapeuticOrderSteppedLadder.find(t => t.tier.includes('Establish_Conditions'));
    expect(tier1?.status).toBe('Satisfied');

    const tier6 = consensus.therapeuticOrderSteppedLadder.find(t => t.tier.includes('Synthetic_Pharmaceuticals'));
    expect(tier6?.status).toBe('Satisfied');
  });

  it('3. Generates Unani-Tibb Mizaj and Akhlat assessment', () => {
    const service = createService();
    const consensus = service.decadConsensus();

    expect(consensus.unaniTibb.dominantMizaj).toBe('Safrawi_Choleric');
    expect(consensus.unaniTibb.quwwatEMudabbiraSelfHealingPower).toBeGreaterThan(50);
    expect(consensus.unaniTibb.recommendedTibbFormulary.length).toBeGreaterThan(0);
  });

  it('4. Synthesizes cross-paradigm consensus action plan and contraindications', () => {
    const service = createService();
    const consensus = service.decadConsensus();

    expect(consensus.consensusActionPlan.length).toBeGreaterThanOrEqual(3);
    expect(consensus.crossParadigmContraindications.length).toBeGreaterThanOrEqual(2);
    expect(consensus.fdaPart11IntegrityDigest).toContain('sha256:');
  });
});
