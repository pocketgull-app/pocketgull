import { Injector, runInInjectionContext, signal } from '@angular/core';
import { SessionStateService } from './session-state.service';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

describe('SessionStateService Streamlining & Invariant Suite', () => {
  let service: SessionStateService;

  beforeEach(() => {
    const mockAuth = {
      currentUser: signal(null),
      isAuthenticated: signal(false),
      promptLocalBiometric: async () => true,
    };
    const mockPatientMgmt = {
      activePatient: signal(null),
      selectedPatientId: signal(null),
      triggerImmediateSaveAndSync: () => {},
    };

    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
      ],
    });

    service = runInInjectionContext(injector, () => new SessionStateService());
  });

  it('1. Defaults to unlocked state for seamless clinician entry', () => {
    expect(service.isLocked()).toBe(false);
  });

  it('2. Defaults to onboarding complete, eliminating roadblocking splash loops', () => {
    expect(service.isOnboardingComplete()).toBe(true);
  });

  it('3. Supports explicit manual lock and unlock state transitions', async () => {
    service.lock();
    expect(service.isLocked()).toBe(true);

    const unlocked = await service.unlock();
    expect(unlocked).toBe(true);
    expect(service.isLocked()).toBe(false);
  });

  it('4. Allows resetting idle timer safely', () => {
    expect(() => service.resetIdleTimer()).not.toThrow();
  });
});
