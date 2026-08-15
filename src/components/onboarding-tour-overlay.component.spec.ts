import '@angular/compiler';
import { expect } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { OnboardingTourOverlayComponent } from './onboarding-tour-overlay.component';
import { InteractiveOnboardingTourService } from '../services/interactive-onboarding-tour.service';

describe('OnboardingTourOverlayComponent', () => {
  let component: OnboardingTourOverlayComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        InteractiveOnboardingTourService,
        OnboardingTourOverlayComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(OnboardingTourOverlayComponent));
  });

  it('1. Initializes onboarding tour overlay component', () => {
    expect(component.tourService).toBeDefined();
    expect(component.tourService.isTourActive()).toBe(false);
  });
});
