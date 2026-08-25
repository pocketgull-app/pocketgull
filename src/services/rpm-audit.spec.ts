import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { RpmAuditService } from './rpm-audit.service';
import { PatientStateService } from './patient-state.service';

describe('RpmAuditService (CMS Remote Patient Monitoring Reimbursement Audit)', () => {
  let service: RpmAuditService;
  let mockPatientState: any;
  let injector: Injector;

  beforeEach(() => {
    mockPatientState = {
      patientId: signal<string>('pt-test-999'),
      patientName: signal<string>('Arthur Pendelton')
    };

    injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    runInInjectionContext(injector, () => {
      service = new RpmAuditService();
    });
  });

  it('should calculate initial RPM metrics and 16-day CPT 99454 eligibility', () => {
    const metrics = service.rpmMetrics();

    expect(metrics.patientId).toBe('pt-test-999');
    expect(metrics.cpt99453Eligible).toBe(true);
    expect(metrics.cpt99454Eligible).toBe(true); // Default 18 days >= 16
    expect(metrics.careManagementMinutes).toBe(25); // Initial logs = 15 + 10 = 25m
    expect(metrics.cpt99457Eligible).toBe(true); // >= 20m
    expect(metrics.cpt99458Units).toBe(0); // (25-20)/20 = 0
    expect(metrics.estimatedReimbursementUsd).toBeGreaterThan(100);
  });

  it('should log clinical care management minutes and update CPT 99458 units', () => {
    service.logClinicalTime(20, 'Multidisciplinary review of telemetry anomalies');
    const metrics = service.rpmMetrics();

    expect(metrics.careManagementMinutes).toBe(45); // 25 + 20 = 45m
    expect(metrics.cpt99457Eligible).toBe(true);
    expect(metrics.cpt99458Units).toBe(1); // (45-20)/20 = 1 unit
  });

  it('should generate a valid CMS 1500 / 837P electronic claim payload', () => {
    const claim = service.generateCmsClaimPayload();

    expect(claim.claimType).toContain('CMS-1500 / 837P');
    expect(claim.patient.name).toBe('Arthur Pendelton');
    expect(claim.billingCodes).toBeDefined();
    expect(claim.billingCodes.some((c: any) => c.code === '99454')).toBe(true);
    expect(claim.totalClaimUsd).toBeGreaterThan(0);
  });
});
