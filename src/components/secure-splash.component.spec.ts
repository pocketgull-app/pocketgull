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
import { AvsEngineService } from '../services/avs-engine.service';
import { BleWearablesService } from '../services/hardware/ble-wearables.service';
import { VibroacousticHapticService } from '../services/hardware/vibroacoustic-haptic.service';

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
    const mockPatientState = {
      activeSymptoms: signal([]),
      vitals: signal({}),
      isAvsSessionActive: signal(false),
      avsBrainwaveFrequencyHz: signal(6),
      avsBrainwaveFrequency: signal('theta')
    };
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

    const mockAvsEngine = {
      sessionConfig: signal({ carrierFreqHz: 528, binauralBeatHz: 6, isIsochronicPulseEnabled: false }),
      applySolfeggioTone: (hz: number | string) => {
        mockAvsEngine.sessionConfig.update(c => ({ ...c, carrierFreqHz: typeof hz === 'number' ? hz : 528 }));
      },
      applyBrainwavePreset: () => {},
      toggleSession: () => true,
      isPlaying: signal(false)
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
        { provide: AvsEngineService, useValue: mockAvsEngine },
        {
          provide: BleWearablesService,
          useValue: {
            isConnected: signal(false),
            heartRate: signal(72),
            autonomicCoherenceScore: signal(85),
            cardiacResonanceHz: signal(0.10),
            recommendedEntrainmentHz: signal({ beatFreqHz: 7.83, carrierFreqHz: 432, stateLabel: 'Coherence' })
          }
        },
        {
          provide: VibroacousticHapticService,
          useValue: {
            isHapticsActive: signal(false),
            isGamepadConnected: signal(false),
            isMobileVibrationSupported: signal(true),
            hapticIntensity: signal(0.75),
            toggleHaptics: () => true
          }
        },
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
    const categories = new Set(component.hemisphericPresets.map(p => p.category));
    expect(categories.has('monroe')).toBe(true);
    expect(categories.has('indigenous')).toBe(true);
    expect(categories.has('persian')).toBe(true);
    expect(categories.has('animal')).toBe(true);
  });

  it('3. Exposes Sacred Solfeggio Scale & AVS Studio Entrainment controls', () => {
    const component = createComponent();
    expect(component.solfeggioCatalog).toBeDefined();
    expect(component.solfeggioCatalog.length).toBe(10);
    expect(component.brainwavePresets).toBeDefined();
    expect(component.brainwavePresets.length).toBe(6);

    expect(component.avsEngine).toBeDefined();
    component.avsEngine?.applySolfeggioTone(528);
    expect(component.avsEngine?.sessionConfig().carrierFreqHz).toBe(528);
  });

  it('4. Exposes Wearable BLE integration for closed-loop biofeedback locking', () => {
    const component = createComponent();
    expect(component.bleWearables).toBeDefined();
    expect(component.bleWearables?.heartRate()).toBe(72);
    expect(component.bleWearables?.autonomicCoherenceScore()).toBe(85);
  });

  it('5. Exposes Vibroacoustic Somatosensory Haptics integration', () => {
    const component = createComponent();
    expect(component.haptics).toBeDefined();
    expect(component.haptics?.isHapticsActive()).toBe(false);
    expect(component.haptics?.isMobileVibrationSupported()).toBe(true);
  });

  it('6. Exposes Sloan 5:1 Bedside Thermal Print and Clinical Roles with native symbols', () => {
    const component = createComponent();
    expect(component.selectedIamRole).toBe('roles/aiplatform.user');
    expect(typeof component.printQuickBedsideLabel).toBe('function');
    // Calling printQuickBedsideLabel should execute safely without exceptions
    expect(() => component.printQuickBedsideLabel()).not.toThrow();
  });
});
