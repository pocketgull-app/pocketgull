import { TestBed } from '@angular/core/testing';
import { CitizenScienceTelemetryService } from './citizen-science-telemetry.service';

describe('CitizenScienceTelemetryService', () => {
  let service: CitizenScienceTelemetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitizenScienceTelemetryService);
  });

  it('1. Initializes default citizen science state with opt-in enabled', () => {
    expect(service.isCitizenScienceOptedIn()).toBe(true);
    expect(service.liveNoiseDba()).toBe(42);
    expect(service.totalDividendAccumulatedUsd()).toBeGreaterThanOrEqual(0);
  });

  it('2. Toggles opt-in state off and on', () => {
    service.toggleOptIn(false);
    expect(service.isCitizenScienceOptedIn()).toBe(false);

    service.toggleOptIn(true);
    expect(service.isCitizenScienceOptedIn()).toBe(true);
  });

  it('3. Excludes telemetry packets recorded within 300m home geofence for privacy', () => {
    // Exact home location (0 meters away)
    const packet = service.recordTelemetrySample(37.7749, -122.4194, 45, 800, true, 37.7749, -122.4194);
    expect(packet).toBeNull();
  });

  it('4. Ingests telemetry packet beyond 300m with coarse 100m grid snapping', () => {
    // ~1.1 km away from home
    const packet = service.recordTelemetrySample(37.7849, -122.4094, 44, 950, true, 37.7749, -122.4194);
    expect(packet).not.toBeNull();
    expect(packet?.gridCellId).toContain('cell-37.784_');
    expect(packet?.differentialPrivacyEpsilon).toBe(0.5);
    expect(packet?.adaRampDetected).toBe(true);
  });

  it('5. Finalizes walk session, awards points and increments research dividend wallet', () => {
    const initialPoints = service.totalCitizenPoints();
    const initialDividend = service.totalDividendAccumulatedUsd();

    const summary = service.finalizeWalkSession(650, 42.0, 85.0);

    expect(summary.totalMetersMapped).toBe(650);
    expect(summary.earnedCitizenSciencePoints).toBeGreaterThan(0);
    expect(summary.earnedDividendUsd).toBeGreaterThan(0);
    expect(service.totalCitizenPoints()).toBe(initialPoints + summary.earnedCitizenSciencePoints);
    expect(service.totalDividendAccumulatedUsd()).toBe(parseFloat((initialDividend + summary.earnedDividendUsd).toFixed(2)));
    expect(summary.privacyAttestation.zeroPhiVerified).toBe(true);
  });
});
