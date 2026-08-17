import { TestBed } from '@angular/core/testing';
import { GlobalHealthUtilityService } from './global-health-utility.service';

describe('GlobalHealthUtilityService', () => {
  let service: GlobalHealthUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalHealthUtilityService]
    });
    service = TestBed.inject(GlobalHealthUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate positive QALY and economic utility for default cohort size', () => {
    const report = service.evaluateUtility(1000);
    expect(report.patientCohortSize).toBe(1000);
    expect(report.totalQalyGainedPerDecade).toBeGreaterThan(1500);
    expect(report.totalClinicianHoursSavedAnnual).toBe(18400);
    expect(report.domains.length).toBe(5);
  });

  it('should compute statistically significant epistemic confidence intervals (p < 0.05)', () => {
    const report = service.evaluateUtility(500);
    expect(report.epistemicConfidenceInterval.pValVsStandardOfCare).toBeLessThan(0.05);
    expect(report.epistemicConfidenceInterval.lowerBound95Pct).toBeLessThan(report.epistemicConfidenceInterval.upperBound95Pct);
  });

  it('should adjust cohort dynamically', () => {
    service.setCohortSize(2500);
    expect(service.activeCohortSize()).toBe(2500);
    const report = service.evaluateUtility();
    expect(report.patientCohortSize).toBe(2500);
  });
});
