import '@angular/compiler';
import { expect } from 'vitest';
import { InteractiveOnboardingTourService } from './interactive-onboarding-tour.service';

describe('InteractiveOnboardingTourService Unit Suite', () => {
  let service: InteractiveOnboardingTourService;

  beforeEach(() => {
    service = new InteractiveOnboardingTourService();
  });

  it('1. Initializes onboarding tour for PATIENT persona', () => {
    service.startTour('PATIENT');
    const progress = service.progress();

    expect(service.isTourActive()).toBe(true);
    expect(progress.persona).toBe('PATIENT');
    expect(progress.currentStepIndex).toBe(0);
    expect(progress.activeStep).toBeDefined();
    expect(progress.activeStep?.title).toContain('Joy');
  });

  it('2. Navigates next/previous steps and completes tour', () => {
    service.startTour('CLINICIAN');
    expect(service.currentStepIndex()).toBe(0);

    service.nextStep();
    expect(service.currentStepIndex()).toBe(1);

    service.previousStep();
    expect(service.currentStepIndex()).toBe(0);

    service.completeTour();
    expect(service.isTourActive()).toBe(false);
  });
});
