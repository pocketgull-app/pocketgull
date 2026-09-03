import { TestBed } from '@angular/core/testing';
import { OpticalChronoTrajectoryService } from './optical-chrono-trajectory.service';
import { OpticalInnovationsService } from './optical-innovations.service';

describe('OpticalChronoTrajectoryService (Main App Suite)', () => {
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
    expect(service.milestones().length).toBe(3);
    expect(service.milestones()[0].daysTarget).toBe(30);
    expect(service.milestones()[1].daysTarget).toBe(60);
    expect(service.milestones()[2].daysTarget).toBe(90);
  });

  it('2. Launches scheduled phase and activates corresponding optical mode and circadian spectral parameters', () => {
    service.launchDailyPhase('evening');
    expect(optical.activeMode()).toBe('dichoptic-optical-beat');
    expect(optical.melanopicState().phase).toBe('night-ruby');

    service.launchDailyPhase('morning');
    expect(optical.activeMode()).toBe('photobiomodulation-670nm');
    expect(optical.melanopicState().phase).toBe('dawn-alert');
    expect(optical.pbmState().isActive).toBe(true);
  });

  it('3. Auto-tunes to Ganzfeld ORP Anchor when sympathetic overdrive is detected', () => {
    const res = service.autoTuneFromLiveTelemetry(94, 22, 13100);
    expect(optical.activeMode()).toBe('ganzfeld-orp-reticle');
    expect(res.actionTaken).toContain('Ganzfeld ORP');
  });

  it('4. Records session completion and computes parasympathetic shift with FDA Part 11 seal', () => {
    service.recordSessionCompletion('morning', 84, 70, 32, 54);

    const phase = service.dailyPhases().find(p => p.id === 'morning');
    expect(phase?.isCompleted).toBe(true);
    expect(phase?.completedAt).toBeDefined();

    const coherence = service.lastCoherenceDelta();
    expect(coherence?.hrDeltaBpm).toBe(-14);
    expect(coherence?.hrvDeltaMs).toBe(22);
    expect(coherence?.parasympatheticGainPercent).toBe(68.8);
    expect(coherence?.attestationDigest).toContain('FDA Part 11 Validated');
  });
});
