import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, signal, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SecureSplashComponent } from './secure-splash.component';
import { SessionStateService } from '../services/session-state.service';
import { CircadianSleepinessService } from '../services/circadian-sleepiness.service';
import { FirestoreSyncService } from '../services/firestore-sync.service';
import { GamificationService } from '../services/gamification.service';
import { ThemeService } from '../services/theme.service';
import { PatientStateService } from '../services/patient-state.service';
import { PetAuditoryService } from '../services/pet-auditory.service';
import { EnvironmentalTelemetryService } from '../services/environmental-telemetry.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { AuthSsoService } from '../services/auth-sso.service';
import { AuthService } from '../services/auth.service';
import { PatientManagementService } from '../services/patient-management.service';
import { WacomCryptoInkService } from '../services/wacom-crypto-ink.service';
import { MonroePersianTranceService, HEMISPHERIC_PRESETS } from '../services/monroe-persian-trance.service';
import { MissionSymphonyEngineService } from '../services/mission-symphony-engine.service';
import { LifeJourneyNavigatorService } from '../services/life-journey-navigator.service';

describe('SecureSplashComponent Sensory Suite', () => {
  const createComponent = () => {
    const mockSanitizer = { bypassSecurityTrustHtml: (val: string) => val };
    const mockAuth = { currentUser: signal(null), isAuthenticated: signal(false) };
    const mockPatientMgmt = { activePatient: signal(null) };
    const mockSyncService = {
      isAuthLoading: signal(false),
      currentUserEmail: signal(''),
      isEmailRegistered: () => true
    };
    const mockKssService = { currentScore: signal(3), kssTheme: signal('kss-3'), setScore: () => {} };
    const mockPatientState = { activeSymptoms: signal([]), vitals: signal({}) };
    const mockGame = { currentPoints: signal(100), currentStreak: signal(3) };
    const mockAuthSso = { isAuthenticating: signal(false), launchGoogleSso: () => {}, launchSmartFhirSso: () => {} };
    const mockWacomInk = { isInitialized: signal(true), resetCanvas: () => {} };
    const mockSecureStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    const mockScheduler = { notify: () => {}, runningTick: false };
    const mockThemeService = {
      currentTheme: signal('dark'),
      reduceMotion: signal(false),
      setReduceMotion: () => {},
      isHighContrast: signal(false),
      seagullPersona: signal('classic')
    };

    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: mockScheduler },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: AuthService, useValue: mockAuth },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        { provide: SessionStateService, useClass: SessionStateService },
        { provide: CircadianSleepinessService, useValue: mockKssService },
        { provide: FirestoreSyncService, useValue: mockSyncService },
        { provide: GamificationService, useValue: mockGame },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PetAuditoryService, useClass: PetAuditoryService },
        { provide: EnvironmentalTelemetryService, useClass: EnvironmentalTelemetryService },
        { provide: SecureStorageService, useValue: mockSecureStorage },
        { provide: AuthSsoService, useValue: mockAuthSso },
        { provide: WacomCryptoInkService, useValue: mockWacomInk },
        { provide: MonroePersianTranceService, useClass: MonroePersianTranceService },
        { provide: MissionSymphonyEngineService, useClass: MissionSymphonyEngineService },
        { provide: LifeJourneyNavigatorService, useClass: LifeJourneyNavigatorService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    return runInInjectionContext(injector, () => new SecureSplashComponent());
  };

  it('1. Initializes with available Hemispherical Sync Presets and Theme controls', () => {
    const component = createComponent();
    expect(component.hemisphericPresets).toBeDefined();
    expect(component.hemisphericPresets.length).toBeGreaterThanOrEqual(17);
    expect(component.missionThemes).toBeDefined();
    expect(component.journeyProfiles).toBeDefined();
  });

  it('2. Exposes Monroe, Indigenous, Persian, and Animal presets across all categories', () => {
    const component = createComponent();
    const monroePresets = component.hemisphericPresets.filter(p => p.category === 'monroe');
    expect(monroePresets.length).toBeGreaterThanOrEqual(4);

    const indigenousPresets = component.hemisphericPresets.filter(p => p.category === 'indigenous');
    expect(indigenousPresets.length).toBeGreaterThanOrEqual(4);

    const persianPresets = component.hemisphericPresets.filter(p => p.category === 'persian');
    expect(persianPresets.length).toBeGreaterThanOrEqual(3);

    const animalPresets = component.hemisphericPresets.filter(p => p.category === 'animal');
    expect(animalPresets.length).toBeGreaterThanOrEqual(4);
  });
});
