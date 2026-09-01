import { TestBed } from '@angular/core/testing';
import { AdaptiveGreenRoutingService } from './adaptive-green-routing.service';

describe('AdaptiveGreenRoutingService', () => {
  let service: AdaptiveGreenRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdaptiveGreenRoutingService);
  });

  it('1. Initializes default access profile with ADA compliance and sensory shield mode', () => {
    const profile = service.userAccessProfile();
    expect(profile.physical.wheelchairAccessible).toBe(true);
    expect(profile.physical.maxSlopeGradePct).toBeLessThanOrEqual(4.8);
    expect(profile.cognitive.sensoryMode).toBe('SENSORY_SHIELD');
  });

  it('2. Computes biophilic green route with high canopy coverage and ADA certification', () => {
    const plan = service.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'STANDARD'
    );

    expect(plan.adaComplianceCertified).toBe(true);
    expect(plan.averageCanopyCoveragePct).toBeGreaterThanOrEqual(75);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.steps[0].hasCurbCutRamp).toBe(true);
  });

  it('3. Enforces low-noise acoustic constraints under Sensory-Shield mode', () => {
    const plan = service.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'SENSORY_SHIELD'
    );

    expect(plan.averageNoiseDba).toBeLessThanOrEqual(50);
    expect(plan.profileApplied.cognitive.avoidCrowdedTransitHubs).toBe(true);
  });

  it('4. Minimizes turn complexity under Landmark-Anchored cognitive mode', () => {
    const plan = service.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      'LANDMARK_ANCHORED'
    );

    expect(plan.turnComplexityScore).toBeLessThanOrEqual(2);
    expect(plan.steps[0].instruction).toContain('clock tower');
    expect(plan.steps[0].landmarkReference).toContain('postal building');
  });

  it('5. Triggers One-Touch Emergency Sanctuary guidance to closest certified haven', () => {
    const plan = service.triggerEmergencySanctuary();

    expect(service.isSanctuaryActive()).toBe(true);
    expect(service.isNavigating()).toBe(true);
    expect(plan.sanctuaryInfo).toBeDefined();
    expect(plan.sanctuaryInfo?.name).toContain('Botanical Garden');
    expect(plan.sanctuaryInfo?.averageNoiseDba).toBeLessThanOrEqual(45);
  });

  it('6. Advances step-by-step navigation through waypoints to arrival', () => {
    service.triggerEmergencySanctuary();
    expect(service.currentStepIndex()).toBe(0);

    service.nextStep();
    expect(service.currentStepIndex()).toBe(1);

    // Final step completes navigation
    service.nextStep();
    expect(service.isNavigating()).toBe(false);
    expect(service.isSanctuaryActive()).toBe(false);
  });
});
