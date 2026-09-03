import { TestBed } from '@angular/core/testing';
import { OpticalChronoTrajectoryService } from './optical-chrono-trajectory.service';
import { OpticalInnovationsService } from './optical-innovations.service';

describe('OpticalChronoTrajectoryService Suite', () => {
  let service: OpticalChronoTrajectoryService;
  let optical: OpticalInnovationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpticalInnovationsService, OpticalChronoTrajectoryService]
    });
    service = TestBed.inject(OpticalChronoTrajectoryService);
    optical = TestBed.inject(OpticalInnovationsService);
  });

  afterEach(() => {
    optical.pausePbmSession();
  });

  it('1. Initializes 3 prescribed daily optical phases and 3 longitudinal milestones', () => {
    expect(service.dailyPhases().length).toBe(3);
    expect(service.dailyPhases()[0].id).toBe('morning');
    expect(service.dailyPhases()[0].targetMode).toBe('photobiomodulation-670nm');
    expect(service.dailyPhases()[1].id).toBe('midday');
    expect(service.dailyPhases()[1].targetMode).toBe('okn-vor-grating');
    expect(service.dailyPhases()[2].id).toBe('evening');
    expect(service.dailyPhases()[2].targetMode).toBe('dichoptic-optical-beat');

    expect(service.milestones().length).toBe(3);
    expect(service.milestones()[0].daysTarget).toBe(30);
    expect(service.milestones()[1].daysTarget).toBe(60);
    expect(service.milestones()[2].daysTarget).toBe(90);
  });

  it('2. Launches scheduled phase and updates optical mode and circadian setting', () => {
    service.launchDailyPhase('evening');
    expect(optical.activeMode()).toBe('dichoptic-optical-beat');
    expect(optical.melanopicState().phase).toBe('night-ruby');

    service.launchDailyPhase('morning');
    expect(optical.activeMode()).toBe('photobiomodulation-670nm');
    expect(optical.melanopicState().phase).toBe('dawn-alert');
    expect(optical.pbmState().isActive).toBe(true);
  });

  it('3. Auto-tunes to Ganzfeld ORP Anchor when sympathetic overdrive (high RPP/HR) is observed', () => {
    const tuneResult = service.autoTuneFromLiveTelemetry(92, 24, 12800); // high HR, low HRV, high RPP
    expect(optical.activeMode()).toBe('ganzfeld-orp-reticle');
    expect(tuneResult.actionTaken).toContain('Ganzfeld ORP');
  });

  it('4. Records session completion and calculates parasympathetic gain and SHA-256 seal', () => {
    service.recordSessionCompletion('morning', 82, 72, 35, 52);

    const morningPhase = service.dailyPhases().find(p => p.id === 'morning');
    expect(morningPhase?.isCompleted).toBe(true);
    expect(morningPhase?.completedAt).toBeDefined();

    const coherence = service.lastCoherenceDelta();
    expect(coherence).not.toBeNull();
    expect(coherence?.hrDeltaBpm).toBe(-10);
    expect(coherence?.hrvDeltaMs).toBe(17);
    expect(coherence?.parasympatheticGainPercent).toBe(48.6);
    expect(coherence?.attestationDigest).toContain('FDA Part 11 Validated');
  });
});
