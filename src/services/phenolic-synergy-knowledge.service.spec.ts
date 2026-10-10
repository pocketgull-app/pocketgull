import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PhenolicSynergyKnowledgeService } from './phenolic-synergy-knowledge.service';
import { PatientStateService } from './patient-state.service';
import { signal } from '@angular/core';

describe('PhenolicSynergyKnowledgeService', () => {
  let service: PhenolicSynergyKnowledgeService;
  let mockPatientState: { anatomyViewMode: ReturnType<typeof signal> };

  beforeEach(() => {
    mockPatientState = {
      anatomyViewMode: signal('standard')
    };

    TestBed.configureTestingModule({
      providers: [
        PhenolicSynergyKnowledgeService,
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    service = TestBed.inject(PhenolicSynergyKnowledgeService);
  });

  it('should initialize with USDA / Phenol-Explorer compounds', () => {
    const list = service.allPhenolics();
    expect(list.length).toBeGreaterThanOrEqual(8);
    expect(list.some(p => p.compoundName.includes('Curcumin'))).toBe(true);
    expect(list.some(p => p.compoundName.includes('Sulforaphane'))).toBe(true);
  });

  it('should search phenolics by pathway or organ target', () => {
    const liverTargets = service.searchPhenolics('Liver');
    expect(liverTargets.length).toBeGreaterThanOrEqual(2);
    expect(liverTargets.some(p => p.targetOrgan === 'Liver')).toBe(true);

    const nrf2Targets = service.searchPhenolics('Nrf2');
    expect(nrf2Targets.length).toBeGreaterThanOrEqual(2);
  });

  it('should calculate meal synergies for turmeric and black pepper (2000% boost)', () => {
    const analysis = service.analyzeMealSynergies(['turmeric powder', 'cracked black pepper', 'lentils']);
    expect(analysis.activeSynergies.length).toBeGreaterThanOrEqual(1);
    expect(analysis.activeSynergies[0].pair).toContain('Curcumin');
    expect(analysis.activeSynergies[0].multiplier).toBe(20.0);
    expect(analysis.overallSynergyScore).toBeGreaterThanOrEqual(50);
  });

  it('should calculate cruciferous and mustard seed myrosinase synergy', () => {
    const analysis = service.analyzeMealSynergies(['steamed broccoli florets', 'ground raw mustard seed']);
    expect(analysis.activeSynergies.some(s => s.pair.includes('Myrosinase'))).toBe(true);
    expect(analysis.nrf2ActivationPotential).toBe('Moderate');
  });

  it('should trigger 3D cellular docking simulation and update anatomy mode', () => {
    service.trigger3dNutrigenomicDocking('curcumin-01');
    expect(service.selectedCompound()?.id).toBe('curcumin-01');
    expect(mockPatientState.anatomyViewMode()).toBe('nutrigenomics');
  });
});
