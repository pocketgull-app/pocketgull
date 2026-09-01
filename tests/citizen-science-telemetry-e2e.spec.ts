import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { StorageService } from '../src/services/storage.service';
import { CitizenScienceTelemetryService } from '../src/services/citizen-science-telemetry.service';
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

describe('Citizen Science Telemetry & Ethical Dividend E2E Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: CitizenScienceTelemetryService, useFactory: () => new CitizenScienceTelemetryService() },
        { provide: MovementHealingQuestService, useFactory: () => new MovementHealingQuestService() },
        { provide: MandiantClinicalDefenseService, useFactory: () => new MandiantClinicalDefenseService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      citizenService: injector.get(CitizenScienceTelemetryService),
      questService: injector.get(MovementHealingQuestService),
      mandiant: injector.get(MandiantClinicalDefenseService)
    }));
  };

  it('1. Emits differential-privacy environmental packets snapped to 100m grid cells', () => {
    const { citizenService } = createServices();

    const packet = citizenService.recordTelemetrySample(37.7849, -122.4094, 43, 900, true, 37.7749, -122.4194);
    expect(packet).not.toBeNull();
    expect(packet?.gridCellId).toBeDefined();
    expect(packet?.differentialPrivacyEpsilon).toBe(0.5);
    expect(packet?.cryptographicReceipt).toContain('sig-sha256-cs-');
  });

  it('2. Strictly filters and redacts telemetry within 300m of patient home address', () => {
    const { citizenService } = createServices();

    // 50m away from home
    const homePacket = citizenService.recordTelemetrySample(37.7750, -122.4194, 40, 850, true, 37.7749, -122.4194);
    expect(homePacket).toBeNull();
  });

  it('3. Accumulates research dividend micro-stipends and awards citizen badges on walk finalization', () => {
    const { citizenService } = createServices();

    const summary = citizenService.finalizeWalkSession(850, 41.0, 88.0);
    expect(summary.totalMetersMapped).toBe(850);
    expect(summary.earnedCitizenSciencePoints).toBeGreaterThanOrEqual(80);
    expect(summary.earnedDividendUsd).toBeGreaterThan(0);
    expect(summary.unlockedBadge).toBeDefined();
    expect(summary.unlockedBadge?.title).toContain('Accessibility & Canopy Sentinel');
  });

  it('4. Enforces 0-byte audio recording invariant (zero speech stored/streamed)', () => {
    const { citizenService } = createServices();

    const summary = citizenService.latestWalkSummary();
    expect(summary.privacyAttestation.audioRecordingZeroByteProof).toBe(true);
    expect(summary.privacyAttestation.zeroPhiVerified).toBe(true);
  });
});
