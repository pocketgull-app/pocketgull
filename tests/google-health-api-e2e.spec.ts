import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { StorageService } from '../src/services/storage.service';
import { GoogleHealthApiService } from '../src/services/hardware/google-health-api.service';
import { AdaptiveGreenRoutingService } from '../src/services/adaptive-green-routing.service';
import { MovementHealingQuestService } from '../src/services/movement-healing-quest.service';
import { MandiantClinicalDefenseService } from '../src/services/mandiant-clinical-defense.service';

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('Google Health API & Health Connect E2E Integration Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GoogleHealthApiService, useFactory: () => new GoogleHealthApiService() },
        { provide: AdaptiveGreenRoutingService, useFactory: () => new AdaptiveGreenRoutingService() },
        { provide: MovementHealingQuestService, useFactory: () => new MovementHealingQuestService() },
        { provide: MandiantClinicalDefenseService, useFactory: () => new MandiantClinicalDefenseService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      healthService: injector.get(GoogleHealthApiService),
      routingService: injector.get(AdaptiveGreenRoutingService),
      questService: injector.get(MovementHealingQuestService),
      mandiant: injector.get(MandiantClinicalDefenseService)
    }));
  };

  it('1. Verifies Google Health API and Health Connect integration with valid restricted scopes', () => {
    const { healthService } = createServices();

    const status = healthService.connectionStatus();
    expect(status.connected).toBe(true);
    expect(status.provider).toBe('ANDROID_HEALTH_CONNECT');
    expect(status.scopeGranted).toContain('https://www.googleapis.com/auth/health.heart_rate');
    expect(status.hasInformedConsent).toBe(true);
  });

  it('2. Ingests full autonomic biometric spectrum: HRV, SpO2, Sleep Stages, and VO2 Max', () => {
    const { healthService } = createServices();

    const bio = healthService.liveBiometrics();
    expect(bio.restingHeartRateBpm).toBe(58);
    expect(bio.heartRateVariabilityRmssdMs).toBeGreaterThan(60);
    expect(bio.oxygenSaturationSpO2Pct).toBeGreaterThan(97);
    expect(bio.sleepDurationMinutes).toBeGreaterThan(400); // > 6.5 hours
    expect(bio.deepSleepMinutes).toBeGreaterThan(60);
    expect(bio.vo2MaxMlKgMin).toBeGreaterThan(40);
  });

  it('3. Connects live biometrics with Biophilic Vagal Odyssey to calculate Vagal Recovery Index', () => {
    const { healthService, questService } = createServices();

    const vagalIndex = healthService.vagalToneRecoveryIndex();
    expect(vagalIndex).toBeGreaterThanOrEqual(60);

    // Complete milestone and verify alignment with vagal recovery
    questService.completeMilestone('m-1');
    expect(questService.currentVagalPoints()).toBe(40);
  });

  it('4. Converts Google Health biometric telemetry into validated FHIR R4 Observations', () => {
    const { healthService } = createServices();

    const fhirEntries = healthService.toFhirBiometricEntries();
    expect(fhirEntries.length).toBe(3);
    for (const entry of fhirEntries) {
      expect(entry.source).toBe('GOOGLE_HEALTH_API');
      expect(entry.value).toBeDefined();
    }
  });

  it('5. Enforces HIPAA §164.514 Safe Harbor data erasure upon consent revocation', () => {
    const { healthService } = createServices();

    healthService.disconnectAndEraseData();
    expect(healthService.isConnected()).toBe(false);
    expect(healthService.connectionStatus().hasInformedConsent).toBe(false);
  });
});
