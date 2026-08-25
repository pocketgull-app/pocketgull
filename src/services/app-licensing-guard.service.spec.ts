import { TestBed } from '@angular/core/testing';
import { AppLicensingGuardService } from './app-licensing-guard.service';

describe('AppLicensingGuardService', () => {
  let service: AppLicensingGuardService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AppLicensingGuardService]
    });
    service = TestBed.inject(AppLicensingGuardService);
  });

  it('should initialize in free trial mode with 5 remaining consults', () => {
    expect(service.isLicenseActive()).toBe(false);
    expect(service.consultCount()).toBe(0);
    expect(service.remainingConsults()).toBe(5);
    expect(service.isGated()).toBe(false);
  });

  it('should consume consults until quota is exhausted', () => {
    for (let i = 0; i < 5; i++) {
      const allowed = service.consumeConsult();
      expect(allowed).toBe(true);
    }

    expect(service.consultCount()).toBe(5);
    expect(service.remainingConsults()).toBe(0);
    expect(service.isGated()).toBe(true);

    // 6th attempt should be gated
    const sixthAttempt = service.consumeConsult();
    expect(sixthAttempt).toBe(false);
  });

  it('should activate valid founder license key and ungate usage', () => {
    // First exhaust quota
    for (let i = 0; i < 5; i++) {
      service.consumeConsult();
    }
    expect(service.isGated()).toBe(true);

    const activation = service.activateLicenseKey('PG-FND-8823-9941-K4A2');
    expect(activation.success).toBe(true);
    expect(service.isLicenseActive()).toBe(true);
    expect(service.activeTier()).toBe('founder_lifetime');
    expect(service.isGated()).toBe(false);

    // Should now allow consumption without gating
    expect(service.consumeConsult()).toBe(true);
  });

  it('should activate clinic annual license key properly', () => {
    const activation = service.activateLicenseKey('PG-CLN-7712-4421-V9B8');
    expect(activation.success).toBe(true);
    expect(service.activeTier()).toBe('clinic_annual');
  });

  it('should reject invalid license key format', () => {
    const activation = service.activateLicenseKey('INVALID-KEY');
    expect(activation.success).toBe(false);
    expect(service.isLicenseActive()).toBe(false);
  });
});
