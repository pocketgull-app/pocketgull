import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClinicianOnboardingComponent } from './clinician-onboarding.component';

describe('ClinicianOnboardingComponent', () => {
  let component: ClinicianOnboardingComponent;
  let fixture: ComponentFixture<ClinicianOnboardingComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicianOnboardingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ClinicianOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the component with default practitioner tier', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTier()).toBe('practitioner');
    expect(component.selectedTierTitle()).toBe('Solo Practice ($199/mo)');
    expect(component.isSubmitting()).toBe(false);
  });

  it('should render modal dialog header and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Clinician & Academic Medical Onboarding');
    expect(compiled.textContent).toContain('Select your clinical practice tier or medical school residency program');
  });

  it('should render all 4 clinician tiers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Independent Practitioner');
    expect(compiled.textContent).toContain('$199');
    expect(compiled.textContent).toContain('Group Clinic');
    expect(compiled.textContent).toContain('$499');
    expect(compiled.textContent).toContain('Medical School');
    expect(compiled.textContent).toContain('$1,499');
    expect(compiled.textContent).toContain('Resident Scholar');
    expect(compiled.textContent).toContain('$0');
  });

  it('should update selected tier and action button text when switching tiers', () => {
    component.selectedTier.set('clinic');
    fixture.detectChanges();
    expect(component.selectedTierTitle()).toBe('Group Practice ($499/mo)');

    component.selectedTier.set('academic');
    fixture.detectChanges();
    expect(component.selectedTierTitle()).toBe('Medical School ($1,499/mo)');

    component.selectedTier.set('resident');
    fixture.detectChanges();
    expect(component.selectedTierTitle()).toBe('Resident Grant ($0)');
  });

  it('should emit close output when close is triggered', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });

    component.close.emit();
    expect(emitted).toBe(true);
  });

  it('should send POST request to /api/billing/checkout on submitCheckout', () => {
    component.selectedTier.set('academic');
    component.licenseId = 'NPI-9948201';
    component.email = 'dean@hopkins.edu';

    component.submitCheckout();
    expect(component.isSubmitting()).toBe(true);

    const req = httpTesting.expectOne('/api/billing/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      priceId: 'price_1U3KRiBK1Sz8xlZGqjW4dJfp',
      customerEmail: 'dean@hopkins.edu',
      endowmentFund: 'Alumni Health & Research Endowment',
      revenueSplit: '0-80-20',
      metadata: {
        license_id: 'NPI-9948201',
        tier: 'academic'
      }
    });

    req.flush({ url: 'https://checkout.stripe.com/c/pay/test_session' });
  });

  it('should handle checkout error and reset isSubmitting', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.submitCheckout();
    expect(component.isSubmitting()).toBe(true);

    const req = httpTesting.expectOne('/api/billing/checkout');
    req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });

    expect(component.isSubmitting()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
