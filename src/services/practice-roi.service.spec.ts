import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PracticeRoiService } from './practice-roi.service';

describe('PracticeRoiService', () => {
  let service: PracticeRoiService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PracticeRoiService]
    });
    service = runInInjectionContext(injector, () => injector.get(PracticeRoiService));
  });

  it('should initialize with default 200 patients and 2 clinician seats', () => {
    expect(service).toBeTruthy();
    expect(service.patientCohortCount()).toBe(200);
    expect(service.clinicianSeats()).toBe(2);
    expect(service.selectedTier()).toBe('clinic');
  });

  it('should calculate gross annual reimbursement and net practice profit correctly', () => {
    const summary = service.financialSummary();
    expect(summary.monthlyGrossReimbursement).toBeGreaterThan(30000);
    expect(summary.annualGrossReimbursement).toBeGreaterThan(400000);
    expect(summary.netAnnualPracticeProfit).toBeGreaterThan( summary.annualGrossReimbursement - 10000 );
    expect(summary.roiMultiple).toBeGreaterThan(50);
  });

  it('should adjust calculations when switching tiers or toggling RPM/CCM', () => {
    service.setTier('solo');
    service.setSeats(1);
    service.setPatients(100);

    const summarySolo = service.financialSummary();
    expect(summarySolo.monthlySaaSExpense).toBe(149);
    expect(summarySolo.patients).toBe(100);

    service.toggleCcm(); // Disable CCM
    const summaryWithoutCcm = service.financialSummary();
    expect(summaryWithoutCcm.monthlyGrossReimbursement).toBeLessThan(summarySolo.monthlyGrossReimbursement);
  });

  it('should calculate clinical hours saved per month', () => {
    service.setSeats(3);
    const summary = service.financialSummary();
    expect(summary.hoursSavedMonthly).toBe(55.5);
    expect(summary.clinicalTimeValueMonthly).toBe(Math.round(55.5 * 150));
  });
});
