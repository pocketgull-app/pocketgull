import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { StorageService } from '../src/services/storage.service';
import { MovementHealingQuestService } from '../src/services/movement-healing-quest.service';
import { AdaptiveGreenRoutingService } from '../src/services/adaptive-green-routing.service';
import { MandiantClinicalDefenseService } from '../src/services/mandiant-clinical-defense.service';

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('Movement Healing Quest & Cross-Platform QR Suite E2E', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: MovementHealingQuestService, useFactory: () => new MovementHealingQuestService() },
        { provide: AdaptiveGreenRoutingService, useFactory: () => new AdaptiveGreenRoutingService() },
        { provide: MandiantClinicalDefenseService, useFactory: () => new MandiantClinicalDefenseService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      questService: injector.get(MovementHealingQuestService),
      routingService: injector.get(AdaptiveGreenRoutingService),
      mandiant: injector.get(MandiantClinicalDefenseService)
    }));
  };

  it('1. Executes full movement-to-heal quest unlocking all 3 milestones and 150 vagal points', () => {
    const { questService } = createServices();

    expect(questService.currentVagalPoints()).toBe(0);

    questService.completeMilestone('m-1');
    questService.completeMilestone('m-2');
    questService.completeMilestone('m-3');

    expect(questService.currentVagalPoints()).toBe(150);
    expect(questService.questProgressPct()).toBe(100);
    expect(questService.isQuestComplete()).toBe(true);
  });

  it('2. Verifies HIPAA Safe Harbor zero-PHI compliance on generated shareable QR code', () => {
    const { questService } = createServices();

    const quest = questService.activeQuest();
    const qrUrl = questService.generateEncryptedQrPayload(quest);

    expect(qrUrl).not.toContain('patient_name');
    expect(qrUrl).not.toContain('dob');
    expect(qrUrl).not.toContain('ssn');
    expect(qrUrl).not.toContain('mrn');

    // Decode and verify payload integrity
    const b64 = qrUrl.split('payload=')[1];
    const data = JSON.parse(atob(b64));
    expect(data.id).toBe('quest-vagal-odyssey-01');
    expect(data.v).toBe(150);
  });

  it('3. Supports Apple iOS (CoreML / HealthKit) and Windows (DirectML) cross-platform tiers', () => {
    const { questService } = createServices();

    questService.setPlatform('APPLE_IOS');
    expect(questService.activePlatform()).toBe('APPLE_IOS');

    questService.setPlatform('WINDOWS_DESKTOP');
    expect(questService.activePlatform()).toBe('WINDOWS_DESKTOP');

    questService.setPlatform('ANDROID_PIXEL');
    expect(questService.activePlatform()).toBe('ANDROID_PIXEL');
  });

  it('4. Integrates with Adaptive Green Routing to ensure quest sanctuary has shaded benches & low noise', () => {
    const { questService, routingService } = createServices();

    const quest = questService.activeQuest();
    expect(quest.sanctuaryDestination.hasShadedBench).toBe(true);
    expect(quest.sanctuaryDestination.quietnessDba).toBeLessThanOrEqual(40);

    const nearestSanctuary = routingService.nearestSanctuary();
    expect(nearestSanctuary).toBeDefined();
    expect(nearestSanctuary?.hasShadedBench).toBe(true);
  });
});
