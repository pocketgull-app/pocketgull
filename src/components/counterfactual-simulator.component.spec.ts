import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { CounterfactualSimulatorComponent } from './counterfactual-simulator.component';
import { CounterfactualSimulationService } from '../services/counterfactual-simulation.service';

describe('CounterfactualSimulatorComponent Unit Suite', () => {
  let component: CounterfactualSimulatorComponent;
  let simService: CounterfactualSimulationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterfactualSimulatorComponent],
      providers: [CounterfactualSimulationService]
    }).compileComponents();

    const fixture = TestBed.createComponent(CounterfactualSimulatorComponent);
    component = fixture.componentInstance;
    simService = TestBed.inject(CounterfactualSimulationService);
  });

  afterEach(() => {
    simService.resetDeltas();
  });

  it('1. Instantiates successfully with scenarios tab and default cards unflipped', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('scenarios');
    expect(component.flippedCards().hba1c).toBe(false);
    expect(component.flippedCards().steps).toBe(false);
  });

  it('2. Computes baseline outcomes and multi-paradigm invariant checks', () => {
    expect(component.sim.baselineSibiScore()).toBeGreaterThanOrEqual(0);
    expect(component.sim.baselineCvRisk()).toBeGreaterThanOrEqual(0);
    expect(component.sim.multiParadigmChecks().length).toBeGreaterThan(0);
  });

  it('3. Switches between scenarios and inversion tabs', () => {
    component.activeTab.set('inversion');
    expect(component.activeTab()).toBe('inversion');

    component.activeTab.set('scenarios');
    expect(component.activeTab()).toBe('scenarios');
  });

  it('4. Toggles card flip state for specific biomarkers', () => {
    expect(component.flippedCards().hba1c).toBe(false);
    component.toggleCardFlip('hba1c');
    expect(component.flippedCards().hba1c).toBe(true);

    component.toggleCardFlip('hba1c');
    expect(component.flippedCards().hba1c).toBe(false);
  });

  it('5. Correctly formats positive, negative, and zero deltas', () => {
    expect(component.formatDelta(1.5, '%')).toBe('+1.5%');
    expect(component.formatDelta(-0.8, '%')).toBe('-0.8%');
    expect(component.formatDelta(0, '%')).toBe('No change');
    expect(component.abs(-5)).toBe(5);
  });

  it('6. Applies a scenario and resets deltas', () => {
    const scenarios = simService.socraticScenarios;
    if (scenarios.length > 0) {
      simService.applyScenario(scenarios[0]);
      expect(simService.hasActiveSimulation()).toBe(true);

      simService.resetDeltas();
      expect(simService.hasActiveSimulation()).toBe(false);
    }
  });
});
