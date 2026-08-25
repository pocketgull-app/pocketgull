import { TriParadigmSwarmService } from './tri-paradigm-swarm.service';

describe('TriParadigmSwarmService', () => {
  const mockPatientState = {
    selectedIssues: () => [{ id: 'head', noteId: 'n1', name: 'Head', painLevel: 5, description: 'Chronic Fatigue', symptoms: [] }],
    activePatientSummary: () => 'Demo Patient'
  } as any;

  const mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  } as any;

  const service = new TriParadigmSwarmService();
  (service as any).state = mockPatientState;
  (service as any).storage = mockStorage;

  it('1. Initializes without active debate', () => {
    expect(service.currentDebate()).toBeNull();
    expect(service.activeConsensusScore()).toBe(0);
    expect(service.isDebating()).toBe(false);
  });

  it('2. Executes tri-paradigm consensus debate successfully', () => {
    const debate = service.executeSwarmDebate(['Insomnia', 'Post-Exertional Malaise']);

    expect(debate).toBeDefined();
    expect(debate.perspectives.western.specialistName).toContain('Gulliver');
    expect(debate.perspectives.eastern.specialistName).toContain('Swoop');
    expect(debate.perspectives.functional.specialistName).toContain('Sentinel');
    expect(debate.pointsOfConsensus.length).toBeGreaterThan(0);
    expect(debate.divergentPoints.length).toBeGreaterThan(0);
    expect(debate.overallConsensusScore).toBeGreaterThanOrEqual(80);
    expect(service.activeConsensusScore()).toBe(debate.overallConsensusScore);
  });
});
