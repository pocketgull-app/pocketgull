import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ProviderTreatmentNetworkComponent } from './provider-treatment-network.component';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';

describe('ProviderTreatmentNetworkComponent', () => {
  let component: ProviderTreatmentNetworkComponent;
  let service: ProviderTreatmentNetworkService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        ProviderTreatmentNetworkService,
        ProviderTreatmentNetworkComponent
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ProviderTreatmentNetworkService));
    component = runInInjectionContext(injector, () => injector.get(ProviderTreatmentNetworkComponent));
  });

  it('1. Initializes with default peer clinician view', () => {
    expect(component.activeTab()).toBe('peers');
    expect(service.peers().length).toBe(3);
  });

  it('2. Supports switching active tab to treatment facilities', () => {
    component.activeTab.set('facilities');
    expect(component.activeTab()).toBe('facilities');
    expect(service.treatmentCenters().length).toBe(3);
  });
});
