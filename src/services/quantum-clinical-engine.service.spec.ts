import { TestBed } from '@angular/core/testing';
import { QuantumClinicalEngineService } from './quantum-clinical-engine.service';

describe('QuantumClinicalEngineService', () => {
  let service: QuantumClinicalEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuantumClinicalEngineService);
  });

  it('1. Initializes 32-qubit Google Quantum AI circuit state', () => {
    const state = service.circuitState();
    expect(state.numQubits).toBe(32);
    expect(state.provider).toContain('Google Quantum AI');
    expect(state.status).toBe('IDLE');
  });

  it('2. Executes VQE molecular docking algorithm and measures ground state energy', async () => {
    const result = await service.runVqeDrugDocking('Epigallocatechin Gallate', 'IL-6 Inflammatory Receptor');
    expect(result.moleculeName).toBe('Epigallocatechin Gallate');
    expect(result.bindingAffinityKcalMol).toBeLessThan(0);
    expect(service.circuitState().status).toBe('MEASURED');
  });
});
