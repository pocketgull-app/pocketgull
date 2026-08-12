import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { HiddenPartnersModalComponent } from './hidden-partners-modal.component';
import { HiddenPartnersRegistryService } from './hidden-partners-registry';
import { LegalZoomPartnerConnectorService } from './legalzoom-partner-connector';

describe('HiddenPartnersModalComponent', () => {
  let component: HiddenPartnersModalComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalZoomPartnerConnectorService,
        HiddenPartnersRegistryService,
        HiddenPartnersModalComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(HiddenPartnersModalComponent));
  });

  it('1. Initializes hidden partners modal component with registry', () => {
    expect(component.registry.registeredHiddenPartners().length).toBe(3);
    expect(component.legalZoomConnector.exportCapabilities().length).toBe(4);
  });
});
