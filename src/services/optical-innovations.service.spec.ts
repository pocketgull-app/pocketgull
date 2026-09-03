import { TestBed } from '@angular/core/testing';
import { OpticalInnovationsService } from './optical-innovations.service';

describe('OpticalInnovationsService (PocketGull Main Service)', () => {
  let service: OpticalInnovationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpticalInnovationsService]
    });
    service = TestBed.inject(OpticalInnovationsService);
  });

  afterEach(() => {
    service.pausePbmSession();
  });

  it('1. Initializes in 670nm PBM mode with 180s clinical timer and +21.4% ATP elevation index', () => {
    expect(service.activeMode()).toBe('photobiomodulation-670nm');
    expect(service.pbmState().wavelengthNm).toBe(670);
    expect(service.pbmState().durationSecondsTotal).toBe(180);
    expect(service.pbmState().secondsRemaining).toBe(180);
    expect(service.pbmState().atpElevationIndex).toBe(21.4);
    expect(service.pbmState().irradianceMwCm2).toBe(4.2);
    expect(service.pbmState().isActive).toBe(false);
  });

  it('2. Starts, pauses, and resets 670nm PBM session accurately', () => {
    service.startPbmSession();
    expect(service.pbmState().isActive).toBe(true);

    service.pausePbmSession();
    expect(service.pbmState().isActive).toBe(false);

    service.resetPbmSession();
    expect(service.pbmState().secondsRemaining).toBe(180);
  });

  it('3. Calibrates OKN/VOR vestibular gratings parameters', () => {
    service.updateOknSpatialFrequency(1.8);
    expect(service.oknState().spatialFrequencyCpd).toBe(1.8);

    service.updateOknVelocity(14.0);
    expect(service.oknState().driftVelocityDegPerSec).toBe(14.0);

    service.updateOknDirection('bilateral-respiratory');
    expect(service.oknState().direction).toBe('bilateral-respiratory');
  });

  it('4. Enforces CIE S 026 Melanopic ipRGC Circadian daylight vs ruby zero-blue thresholds', () => {
    service.setCircadianPhase('dawn-alert');
    expect(service.melanopicState().phase).toBe('dawn-alert');
    expect(service.melanopicState().equivalentMelanopicLux).toBe(285.0);
    expect(service.melanopicState().blueAttenuationPercent).toBe(0);

    service.setCircadianPhase('night-ruby');
    expect(service.melanopicState().phase).toBe('night-ruby');
    expect(service.melanopicState().equivalentMelanopicLux).toBe(0.8);
    expect(service.melanopicState().blueAttenuationPercent).toBe(100);
  });

  it('5. Computes dichoptic interocular cortical beat frequencies and render modes', () => {
    service.updateDichopticFrequencies(10.0, 10.5);
    expect(service.dichopticState().leftEyeFreqHz).toBe(10.0);
    expect(service.dichopticState().rightEyeFreqHz).toBe(10.5);
    expect(service.dichopticState().interocularBeatHz).toBe(0.5);

    service.setDichopticRenderMode('side-by-side');
    expect(service.dichopticState().renderMode).toBe('side-by-side');
  });

  it('6. Toggles Ganzfeld Bionic ORP 0.1Hz breathing anchor', () => {
    expect(service.ganzfeldState().isBreathingAnchorActive).toBe(true);
    service.toggleGanzfeldBreathingAnchor();
    expect(service.ganzfeldState().isBreathingAnchorActive).toBe(false);
  });
});
