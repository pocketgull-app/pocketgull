import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ImpactProgramAgreementService } from './impact-program-agreement.service';

describe('ImpactProgramAgreementService (Impact.com MPA Legal Compliance)', () => {
  let service: ImpactProgramAgreementService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ImpactProgramAgreementService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ImpactProgramAgreementService));
  });

  it('1. Verifies full compliance with Impact.com MPA', () => {
    expect(service.mpaEffectiveDate()).toBe('2025-04-01');
    expect(service.mpaComplianceRules().length).toBe(4);
    expect(service.isFullMpaCompliant()).toBe(true);
  });
});
