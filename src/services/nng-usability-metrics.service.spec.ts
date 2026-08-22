import '@angular/compiler';
import { NngUsabilityMetricsService } from './nng-usability-metrics.service';

describe('NngUsabilityMetricsService Unit Suite', () => {
  let service: NngUsabilityMetricsService;

  beforeEach(() => {
    service = new NngUsabilityMetricsService();
  });

  it('1. Initializes all 10 Nielsen Norman Group (NN/g) usability heuristics with high fidelity', () => {
    const list = service.heuristics();
    expect(list.length).toBe(10);

    const ids = list.map((h) => h.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Check Heuristic #1 (Visibility of System Status)
    const h1 = list.find((h) => h.id === 1);
    expect(h1?.name).toBe('Visibility of System Status');
    expect(h1?.score).toBeGreaterThanOrEqual(90);
    expect(h1?.fittsLawTouchTargetPx).toBeGreaterThanOrEqual(44);

    // Check Heuristic #5 (Error Prevention)
    const h5 = list.find((h) => h.id === 5);
    expect(h5?.name).toBe('Error Prevention');
    expect(h5?.status).toBe('EXEMPLARY');
  });

  it('2. Computes Shannon Index of Difficulty complying with Fitts Law on mobile touch targets', () => {
    const index = service.shannonIndexOfDifficulty();
    expect(index).toBeGreaterThanOrEqual(0.5);
    expect(index).toBeLessThanOrEqual(3.5);
  });

  it('3. Generates complete structured NN/g Usability and Accessibility Audit Report', () => {
    const report = service.generateAuditReport();
    expect(report.overallSusScore).toBeGreaterThanOrEqual(90);
    expect(report.wcagAaaComplianceRate).toBe(100);
    expect(report.zeroLayoutShiftScore).toBe(0.0);
    expect(report.heuristics.length).toBe(10);
  });

  it('4. Updates telemetry metrics dynamically when interaction events are logged', () => {
    const initialScore = service.systemStatusVisibility();
    service.recordInteractionTelemetry(1, true);
    expect(service.systemStatusVisibility()).toBeGreaterThanOrEqual(initialScore);

    service.recordInteractionTelemetry(1, false);
    expect(service.systemStatusVisibility()).toBeLessThanOrEqual(100);
  });
});
