import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BillingDashboardComponent } from './billing-dashboard.component';
import { of } from 'rxjs';

describe('BillingDashboardComponent (Stripe Add-To-Cart & Commercial Packages)', () => {
  let component: BillingDashboardComponent;
  let mockHttpClient: { post: (url: string, body: any) => any };

  beforeEach(() => {
    mockHttpClient = {
      post: (url: string, body: any) => of({ url: 'https://checkout.stripe.com/c/pay/cs_test_mock' })
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        BillingDashboardComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(BillingDashboardComponent));
  });

  it('1. Initializes default custom institutions and endowment split settings', () => {
    expect(component.selectedEndowment).toBe('Alumni Health & Research Endowment');
    expect(component.selectedSplit).toBe('50-30-20');
    expect(component.customInstitutions().length).toBeGreaterThan(0);
  });

  it('2. Adds a new educational institution domain slot', () => {
    component.newInstitutionDomain = 'ox.ac.uk';
    component.addInstitution();
    expect(component.customInstitutions().some(i => i.url === 'ox.ac.uk')).toBe(true);
  });

  it('3. Triggers Stripe checkout for commercial career health package', () => {
    component.checkoutPackage('price_cardio_vitals_01', 'Cardio Vitals');
    expect(component.isLoadingCheckout()).toBe(true);
  });
});
