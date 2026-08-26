import { TestBed } from '@angular/core/testing';
import { GaapTribalStewardshipService } from './gaap-tribal-stewardship.service';

describe('GaapTribalStewardshipService', () => {
  let service: GaapTribalStewardshipService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GaapTribalStewardshipService]
    });
    service = TestBed.inject(GaapTribalStewardshipService);
  });

  it('should verify 85% Programmatic Efficiency under GAAP ASC 958', () => {
    expect(service.totalProgrammaticExpenditurePercent()).toBe(85);
    expect(service.isGaapCompliant()).toBe(true);
  });

  it('should account for 100% of total revenue across all 5 functional categories', () => {
    const total = service.statement().functionalExpenses.reduce((sum, e) => sum + e.percentage, 0);
    expect(total).toBe(100);
  });

  it('should export valid GAAP CSV financial statement', () => {
    const csv = service.generateGaapCsvExport();
    expect(csv).toContain('Tribal Health Sovereignty');
    expect(csv).toContain('PROGRAM_SERVICES');
    expect(csv).toContain('35%');
  });
});
