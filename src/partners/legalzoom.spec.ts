import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalZoomPartnerModuleService } from './legalzoom';

describe('LegalZoomPartnerModuleService (src/partners/legalzoom.ts)', () => {
  let service: LegalZoomPartnerModuleService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalZoomPartnerModuleService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LegalZoomPartnerModuleService));
  });

  it('1. Initializes LegalZoom partner module inside src/partners/', () => {
    expect(service.partnerConfig().partnerId).toBe('partner_legalzoom_01');
    expect(service.partnerConfig().impactChecklistId).toBe('___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL');
    expect(service.features().length).toBe(4);
  });
});
