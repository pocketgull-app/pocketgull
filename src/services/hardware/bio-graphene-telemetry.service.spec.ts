import { TestBed } from '@angular/core/testing';
import { BioGrapheneTelemetryService, BioGrapheneAdhesionState } from './bio-graphene-telemetry.service';

describe('BioGrapheneTelemetryService (University of Oregon Alemán Lab)', () => {
  let service: BioGrapheneTelemetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BioGrapheneTelemetryService]
    });
    service = TestBed.inject(BioGrapheneTelemetryService);
  });

  afterEach(() => {
    service.stopSimulationStream();
  });

  it('should initialize with baseline UO CAMCOR calibration profile and initial frame', () => {
    const profile = service.calibrationProfile();
    expect(profile.sensorId).toContain('UO-CAMCOR-GRAPHENE-TRAMPOLINE');
    expect(profile.f0BaseHz).toBe(78_400_000);
    expect(profile.activeFluidMedium).toBe('CELL_CULTURE_MEDIUM');

    const frame = service.activeFrame();
    expect(frame.frameId).toBeDefined();
    expect(frame.frequencyShiftHz).toBeLessThan(0); // Mass loading decreases resonant frequency
    expect(frame.adsorbedMassFemtograms).toBeGreaterThan(0);
    expect(frame.tractionForcePicoNewtons).toBeGreaterThan(0);
    expect(frame.geofenceEnclave).toContain('University of Oregon');
  });

  it('should update telemetry metrics when cellular adhesion state changes', () => {
    // 1. Test floating pre-adhesion state
    service.setCellularAdhesionState('floating_pre_adhesion');
    let frame = service.activeFrame();
    expect(frame.adhesionState).toBe('floating_pre_adhesion');
    expect(frame.tractionForcePicoNewtons).toBeLessThan(50);

    // 2. Test mature focal adhesions state
    service.setCellularAdhesionState('mature_focal_adhesions');
    frame = service.activeFrame();
    expect(frame.adhesionState).toBe('mature_focal_adhesions');
    expect(frame.tractionForcePicoNewtons).toBeGreaterThan(500);
    expect(frame.frequencyShiftHz).toBeLessThan(-30_000); // Higher mass deposition

    // 3. Test hyper contractile stress state
    service.setCellularAdhesionState('hyper_contractile_stress');
    frame = service.activeFrame();
    expect(frame.adhesionState).toBe('hyper_contractile_stress');
    expect(frame.tractionForcePicoNewtons).toBeGreaterThan(1200);
  });

  it('should toggle and control live simulation streaming', () => {
    expect(service.isStreaming()).toBe(false);
    service.startSimulationStream();
    expect(service.isStreaming()).toBe(true);

    service.toggleStream();
    expect(service.isStreaming()).toBe(false);
  });

  it('should allow custom sensor frame injection with sequence increment and tamper seal', () => {
    const initialSeq = service.activeFrame().sequenceNumber;
    service.injectSensorFrame({
      frequencyShiftHz: -25000,
      tractionForcePicoNewtons: 450,
      signalQualityIndexPct: 99
    });

    const updated = service.activeFrame();
    expect(updated.sequenceNumber).toBe(initialSeq + 1);
    expect(updated.frequencyShiftHz).toBe(-25000);
    expect(updated.tractionForcePicoNewtons).toBe(450);
    expect(updated.tamperSealSha256).toContain('sha256:uo-aleman-');
  });

  it('should compute stream summary with averages and peak forces', () => {
    service.setCellularAdhesionState('early_integrin_clustering');
    service.setCellularAdhesionState('mature_focal_adhesions');

    const summary = service.streamSummary();
    expect(summary.frameCount).toBeGreaterThanOrEqual(2);
    expect(summary.peakTractionForcePicoNewtons).toBeGreaterThan(0);
    expect(summary.isIntegrityVerified).toBe(true);
  });

  it('should reset calibration to CAMCOR factory baseline', () => {
    service.updateCalibration({ springConstantNm: 0.150 });
    expect(service.calibrationProfile().springConstantNm).toBe(0.150);

    service.resetCalibration();
    expect(service.calibrationProfile().springConstantNm).toBe(0.085);
  });
});
