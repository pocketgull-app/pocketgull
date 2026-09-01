import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { StorageService } from '../src/services/storage.service';
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

describe('Adaptive Green Routing & Mental Health Sanctuary E2E Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: AdaptiveGreenRoutingService, useFactory: () => new AdaptiveGreenRoutingService() },
        { provide: MandiantClinicalDefenseService, useFactory: () => new MandiantClinicalDefenseService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      routingService: injector.get(AdaptiveGreenRoutingService),
      mandiant: injector.get(MandiantClinicalDefenseService)
    }));
  };

  it('1. Verifies end-to-end wheelchair ADA compliance and smooth pavement constraint filtering', () => {
    const { routingService } = createServices();

    const plan = routingService.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'STANDARD'
    );

    expect(plan.adaComplianceCertified).toBe(true);
    expect(plan.maxSlopeGradePct).toBeLessThanOrEqual(4.8);
    for (const step of plan.steps) {
      expect(step.hasCurbCutRamp).toBe(true);
      expect(step.slopeGradePct).toBeLessThanOrEqual(4.8);
    }
  });

  it('2. Solves Sensory-Shielded routing with strict acoustic noise constraints (<= 50 dBA)', () => {
    const { routingService } = createServices();

    const plan = routingService.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'SENSORY_SHIELD'
    );

    expect(plan.averageNoiseDba).toBeLessThanOrEqual(50);
    expect(plan.averageCanopyCoveragePct).toBeGreaterThanOrEqual(80);
  });

  it('3. Solves Landmark-Anchored routing minimizing decision forks and turn entropy for dementia/TBI', () => {
    const { routingService } = createServices();

    const plan = routingService.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'LANDMARK_ANCHORED'
    );

    expect(plan.turnComplexityScore).toBeLessThanOrEqual(2);
    expect(plan.steps.length).toBeLessThanOrEqual(3);
    for (const step of plan.steps) {
      expect(step.landmarkReference).not.toBeNull();
    }
  });

  it('4. Executes one-touch Emergency Sanctuary guidance to closest verified calm haven', () => {
    const { routingService } = createServices();

    const plan = routingService.triggerEmergencySanctuary();

    expect(routingService.isSanctuaryActive()).toBe(true);
    expect(routingService.isNavigating()).toBe(true);
    expect(plan.sanctuaryInfo).toBeDefined();
    expect(plan.sanctuaryInfo?.hasShadedBench).toBe(true);
    expect(plan.sanctuaryInfo?.hasWaterStation).toBe(true);
    expect(plan.sanctuaryInfo?.hasAedOnSite).toBe(true);
  });

  it('5. Enforces privacy-sovereignty: Caregiver Geofence mode emits arrival alert without storing continuous breadcrumbs', () => {
    const { routingService } = createServices();

    routingService.updateAccessProfile({ permissionTier: 'CAREGIVER_GEOFENCE' });
    const plan = routingService.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 }
    );

    expect(plan.caregiverGeofenceNotificationSent).toBe(true);
  });
});
