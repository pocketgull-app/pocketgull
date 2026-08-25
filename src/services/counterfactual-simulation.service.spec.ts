import { CounterfactualSimulationService } from './counterfactual-simulation.service';

describe('CounterfactualSimulationService', () => {
  let service: CounterfactualSimulationService;

  beforeEach(() => {
    service = new CounterfactualSimulationService();
  });

  it('should initialize with 0 deltas', () => {
    expect(service.deltaHbA1c()).toBe(0);
    expect(service.deltaSteps()).toBe(0);
    expect(service.deltaSleep()).toBe(0);
    expect(service.deltaHrv()).toBe(0);
    expect(service.deltaSystolic()).toBe(0);
    expect(service.hasActiveSimulation()).toBe(false);
  });

  it('should compute simulated HbA1c correctly when delta is set', () => {
    const base = service.baselineHbA1c();
    service.deltaHbA1c.set(-0.5);
    expect(service.simulatedHbA1c()).toBe(+(base - 0.5).toFixed(1));
    expect(service.hasActiveSimulation()).toBe(true);
  });

  it('should compute SIBI score improvements when vitals and labs improve', () => {
    const initialSibi = service.simulatedSibiScore();
    service.deltaHbA1c.set(-1.0);
    service.deltaHrv.set(20);
    service.deltaSystolic.set(-15);
    expect(service.simulatedSibiScore()).toBeLessThan(initialSibi);
    expect(service.sibiDelta()).toBeLessThan(0);
  });

  it('should reset deltas cleanly', () => {
    service.deltaHbA1c.set(-0.8);
    service.deltaSteps.set(2000);
    expect(service.hasActiveSimulation()).toBe(true);

    service.resetDeltas();
    expect(service.deltaHbA1c()).toBe(0);
    expect(service.deltaSteps()).toBe(0);
    expect(service.hasActiveSimulation()).toBe(false);
  });
});
