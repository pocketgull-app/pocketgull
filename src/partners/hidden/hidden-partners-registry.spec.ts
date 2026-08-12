import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { HiddenPartnersRegistryService } from './hidden-partners-registry';
import { LegalZoomPartnerConnectorService } from './legalzoom-partner-connector';

describe('HiddenPartnersRegistryService (Hidden Partners Module & LegalZoom Connector)', () => {
  let registry: HiddenPartnersRegistryService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalZoomPartnerConnectorService,
        HiddenPartnersRegistryService
      ]
    });
    registry = runInInjectionContext(injector, () => injector.get(HiddenPartnersRegistryService));
  });

  it('1. Initializes hidden partners registry with LegalZoom and Travel/Sports partners', () => {
    expect(registry.registeredHiddenPartners().length).toBe(3);
    const lz = registry.registeredHiddenPartners().find(p => p.partnerId === 'partner_legalzoom_hidden_01');
    expect(lz).toBeDefined();
    expect(lz?.category).toBe('LEGAL_ESTATE');
    expect(lz?.isHidden).toBe(true);
  });
});
