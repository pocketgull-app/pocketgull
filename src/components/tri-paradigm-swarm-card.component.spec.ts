import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TriParadigmSwarmCardComponent } from './tri-paradigm-swarm-card.component';
import { TriParadigmSwarmService } from '../services/tri-paradigm-swarm.service';

describe('TriParadigmSwarmCardComponent', () => {
  const createComponent = () => {
    const mockSwarmService = {
      isDebating: signal(false),
      currentDebate: signal(null),
      executeSwarmDebate: vi.fn(() => {
        mockSwarmService.currentDebate.set({
          id: 'DEBATE-1',
          patientId: 'P1',
          timestamp: new Date().toISOString(),
          perspectives: {
            western: { paradigm: 'western', specialistName: 'Gulliver', avatarIcon: '🔬', primaryDiagnosis: 'Metabolic', keyInterventions: ['CMP'], riskFlags: [], confidenceScore: 90 },
            eastern: { paradigm: 'eastern', specialistName: 'Swoop', avatarIcon: '☯️', primaryDiagnosis: 'Spleen Qi', keyInterventions: ['Herbs'], riskFlags: [], confidenceScore: 85 },
            functional: { paradigm: 'functional', specialistName: 'Sentinel', avatarIcon: '🧬', primaryDiagnosis: 'Mitochondrial', keyInterventions: ['CoQ10'], riskFlags: [], confidenceScore: 92 }
          },
          pointsOfConsensus: ['Gut-mitochondrial link'],
          divergentPoints: ['Lab timing'],
          synthesizedClinicalPlan: 'Phase 1: Labs + Glutamine',
          overallConsensusScore: 88
        });
      })
    };

    const injector = Injector.create({
      providers: [
        { provide: TriParadigmSwarmService, useValue: mockSwarmService }
      ]
    });

    const comp = runInInjectionContext(injector, () => new TriParadigmSwarmCardComponent());
    return { comp, mockSwarmService };
  };

  it('1. Creates component with default initial state', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
  });

  it('2. Triggers swarm debate execution when runDebate is called', () => {
    const { comp, mockSwarmService } = createComponent();
    comp.runDebate();
    expect(mockSwarmService.executeSwarmDebate).toHaveBeenCalled();
  });
});
