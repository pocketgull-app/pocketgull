import '@angular/compiler';
import { NngUsabilityHudComponent } from './nng-usability-hud.component';
import { NngUsabilityMetricsService } from '../services/nng-usability-metrics.service';

describe('NngUsabilityHudComponent Unit Suite', () => {
  let component: NngUsabilityHudComponent;
  let service: NngUsabilityMetricsService;

  beforeEach(() => {
    service = new NngUsabilityMetricsService();
    component = new NngUsabilityHudComponent();
    component.service = service;
  });

  it('1. Renders 10 NN/g usability heuristics by default', () => {
    expect(component.filteredHeuristics().length).toBe(10);
    expect(component.service.overallSusScore()).toBeGreaterThanOrEqual(90);
  });

  it('2. Filters heuristics by exemplary performance tier', () => {
    component.filterCategory.set('EXEMPLARY');
    const list = component.filteredHeuristics();
    expect(list.length).toBeGreaterThan(0);
    list.forEach((h) => {
      expect(h.score).toBeGreaterThanOrEqual(95);
    });
  });

  it('3. Verifies Fitts Law touch targets and WCAG AAA compliance rate', () => {
    expect(component.service.minTouchTargetSizePx()).toBeGreaterThanOrEqual(44);
    expect(component.service.wcagAaaComplianceRate()).toBe(100);
  });
});
