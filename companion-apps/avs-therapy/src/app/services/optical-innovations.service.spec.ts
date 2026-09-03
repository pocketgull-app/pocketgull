import { TestBed } from '@angular/core/testing';
import { OpticalInnovationsService } from './optical-innovations.service';

describe('OpticalInnovationsService Unit Suite', () => {
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

  it('1. Initializes with default 670nm PBM mode and 180s clinical dosage', () => {
    expect(service.activeMode()).toBe('photobiomodulation-670nm');
    expect(service.pbmState().wavelengthNm).toBe(670);
    expect(service.pbmState().secondsRemaining).toBe(180);
    expect(service.pbmState().atpElevationIndex).toBe(21.4);
    expect(service.pbmState().isActive).toBe(false);
  });

  it('2. Starts and pauses 670nm PBM session cleanly', () => {
    service.startPbmSession();
    expect(service.pbmState().isActive).toBe(true);

    service.pausePbmSession();
    expect(service.pbmState().isActive).toBe(false);
  });

  it('3. Resets 670nm PBM session back to 180 seconds', () => {
    service.startPbmSession();
    service.resetPbmSession();
    expect(service.pbmState().secondsRemaining).toBe(180);
    expect(service.pbmState().isActive).toBe(false);
  });

  it('4. Updates OKN/VOR spatial frequency and drift velocity', () => {
    service.updateOknSpatialFrequency(2.0);
    expect(service.oknState().spatialFrequencyCpd).toBe(2.0);

    service.updateOknVelocity(16.0);
    expect(service.oknState().driftVelocityDegPerSec).toBe(16.0);

    service.updateOknDirection('left-to-right');
    expect(service.oknState().direction).toBe('left-to-right');
  });

  it('5. Adjusts CIE S 026 Melanopic ipRGC Circadian phase parameters', () => {
    service.setCircadianPhase('dawn-alert');
    expect(service.melanopicState().phase).toBe('dawn-alert');
    expect(service.melanopicState().equivalentMelanopicLux).toBe(285.0);
    expect(service.melanopicState().blueAttenuationPercent).toBe(0);

    service.setCircadianPhase('night-ruby');
    expect(service.melanopicState().phase).toBe('night-ruby');
    expect(service.melanopicState().equivalentMelanopicLux).toBe(0.8);
    expect(service.melanopicState().blueAttenuationPercent).toBe(100);
  });

  it('6. Calculates dichoptic interocular cortical beat accurately', () => {
    service.updateDichopticFrequencies(12.0, 13.0);
    expect(service.dichopticState().leftEyeFreqHz).toBe(12.0);
    expect(service.dichopticState().rightEyeFreqHz).toBe(13.0);
    expect(service.dichopticState().interocularBeatHz).toBe(1.0);

    service.setDichopticRenderMode('anaglyph-red-cyan');
    expect(service.dichopticState().renderMode).toBe('anaglyph-red-cyan');
  });

  it('7. Toggles Ganzfeld ORP breathing anchor state', () => {
    expect(service.ganzfeldState().isBreathingAnchorActive).toBe(true);
    service.toggleGanzfeldBreathingAnchor();
    expect(service.ganzfeldState().isBreathingAnchorActive).toBe(false);
    service.toggleGanzfeldBreathingAnchor();
    expect(service.ganzfeldState().isBreathingAnchorActive).toBe(true);
  });
});
