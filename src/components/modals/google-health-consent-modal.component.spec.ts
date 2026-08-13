import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { GoogleHealthConsentModalComponent } from './google-health-consent-modal.component';
import { FitbitService } from '../../services/hardware/fitbit.service';

describe('GoogleHealthConsentModalComponent', () => {
  let component: GoogleHealthConsentModalComponent;
  let mockFitbitService: any;

  beforeEach(() => {
    mockFitbitService = {
      acceptConsent: vi.fn(),
      declineConsent: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: FitbitService, useValue: mockFitbitService }
      ]
    });

    component = runInInjectionContext(injector, () => new GoogleHealthConsentModalComponent());
  });

  it('should initialize component instance', () => {
    expect(component).toBeTruthy();
    expect(component.fitbit).toBe(mockFitbitService);
  });

  it('should delegate accept consent to FitbitService', () => {
    component.fitbit.acceptConsent();
    expect(mockFitbitService.acceptConsent).toHaveBeenCalledTimes(1);
  });

  it('should delegate decline consent to FitbitService', () => {
    component.fitbit.declineConsent();
    expect(mockFitbitService.declineConsent).toHaveBeenCalledTimes(1);
  });
});
