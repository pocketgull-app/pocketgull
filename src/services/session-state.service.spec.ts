import { Injector, runInInjectionContext, signal } from '@angular/core';
import { SessionStateService } from './session-state.service';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

describe('SessionStateService Streamlining & Invariant Suite', () => {
  let service: SessionStateService;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const storageImpl = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
      length: 0,
      key: (_i: number) => null,
    };
    (globalThis as any).sessionStorage = storageImpl;
    (globalThis as any).localStorage = storageImpl;

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

  it('1. Defaults to locked state for HIPAA-compliant biometric splash gatekeeper entry', () => {
    expect(service.isLocked()).toBe(true);
  });

  it('2. Defaults to onboarding complete, preserving clinical onboarding state across locks', () => {
    expect(service.isOnboardingComplete()).toBe(true);
  });

  it('3. Supports explicit biometric unlock and lock state transitions with sessionStorage persistence', async () => {
    expect(service.isLocked()).toBe(true);

    const unlocked = await service.unlock();
    expect(unlocked).toBe(true);
    expect(service.isLocked()).toBe(false);
    expect(window.sessionStorage?.getItem('pg_session_unlocked')).toBe('true');

    service.lock();
    expect(service.isLocked()).toBe(true);
    expect(window.sessionStorage?.getItem('pg_session_unlocked')).toBeNull();
    expect(window.sessionStorage?.getItem('pg_session_locked')).toBe('true');
  });

  it('4. Allows resetting idle timer safely', () => {
    expect(() => service.resetIdleTimer()).not.toThrow();
  });

  it('5. Initializes as unlocked when sessionStorage has active unlocked token', () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('pg_session_unlocked', 'true');
    }

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

    const activeService = runInInjectionContext(injector, () => new SessionStateService());
    expect(activeService.isLocked()).toBe(false);
  });
});
