import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ImpactMasterProgramAgreementService } from './impact-master-program-agreement.service';

describe('ImpactMasterProgramAgreementService (Impact.com MPA Legal Compliance)', () => {
  let service: ImpactMasterProgramAgreementService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ImpactMasterProgramAgreementService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ImpactMasterProgramAgreementService));
  });

  it('1. Verifies full compliance with Impact.com Master Program Agreement (MPA)', () => {
    expect(service.mpaEffectiveDate()).toBe('2025-04-01');
    expect(service.mpaComplianceRules().length).toBe(4);
    expect(service.isFullMpaCompliant()).toBe(true);
  });
});
