import { TestBed } from '@angular/core/testing';
import { WhispySwarmBioreactorService } from './whispy-swarm-bioreactor.service';

describe('WhispySwarmBioreactorService Unit Suite', () => {
  let service: WhispySwarmBioreactorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WhispySwarmBioreactorService]
    });
    service = TestBed.inject(WhispySwarmBioreactorService);
  });

  it('1. Initializes in SCAN_INGESTION phase with default patient scan', () => {
    expect(service.currentPhase()).toBe('SCAN_INGESTION');
    const tele = service.chamberTelemetry();
    expect(tele.chamberPressureKpa).toBe(101.3);
    expect(tele.gelationFraction).toBe(0.0);
    expect(tele.isAcousticFieldLocked).toBe(false);
    expect(tele.targetVoxelCount).toBe(1850);
  });

  it('2. Computes positive Gor\'kov acoustic trapping potential', () => {
    const initialPotential = service.gorkovPotentialNn();
    expect(initialPotential).toBeGreaterThan(0);

    // Increasing acoustic pressure should deepen the Gor'kov trap
    service.updateControls({ acousticPressureMpa: 2.0 });
    const boostedPotential = service.gorkovPotentialNn();
    expect(boostedPotential).toBeGreaterThan(initialPotential);
  });

  it('3. Advances sequentially through all 6 manufacturing phases', () => {
    expect(service.currentPhase()).toBe('SCAN_INGESTION');

    service.advancePhase();
    expect(service.currentPhase()).toBe('MIST_INOCULATION');
    expect(service.chamberTelemetry().dropletDensityCm3).toBeGreaterThan(1e6);

    service.advancePhase();
    expect(service.currentPhase()).toBe('ACOUSTIC_SCULPTING');
    expect(service.chamberTelemetry().isAcousticFieldLocked).toBe(true);

    service.advancePhase();
    expect(service.currentPhase()).toBe('SOL_GEL_CROSSLINK');
    expect(service.chamberTelemetry().gelationFraction).toBeGreaterThan(0.8);

    service.advancePhase();
    expect(service.currentPhase()).toBe('BIOELECTRIC_POLARIZATION');
    expect(service.chamberTelemetry().bioelectricFieldMvMm).toBe(80.0);

    service.advancePhase();
    expect(service.currentPhase()).toBe('HARVEST_READY');
    expect(service.chamberTelemetry().chamberPressureKpa).toBeLessThan(100.0); // vacuum transfer

    service.advancePhase();
    expect(service.currentPhase()).toBe('SCAN_INGESTION'); // cycles back
  });

  it('4. Resets chamber cleanly and loads new patient scans', () => {
    service.advancePhase();
    service.advancePhase();
    expect(service.currentPhase()).toBe('ACOUSTIC_SCULPTING');

    service.resetChamber();
    expect(service.currentPhase()).toBe('SCAN_INGESTION');

    service.loadPatientScan('DICOM-SERIES-BURN-TISSUE', 2400);
    expect(service.patientScanId()).toBe('DICOM-SERIES-BURN-TISSUE');
    expect(service.targetVoxelCount()).toBe(2400);
  });
});
