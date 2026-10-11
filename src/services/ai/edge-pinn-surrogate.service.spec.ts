import { TestBed } from '@angular/core/testing';
import { EdgePinnSurrogateService, IPinnFluidInput } from './edge-pinn-surrogate.service';

describe('EdgePinnSurrogateService', () => {
  let service: EdgePinnSurrogateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdgePinnSurrogateService]
    });
    service = TestBed.inject(EdgePinnSurrogateService);
  });

  it('should initialize successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should predict convective regime and low CAA risk under optimal N3 sleep conditions', () => {
    const input: IPinnFluidInput = {
      vesselRadiusUm: 20,
      csfBulkVelocityMmS: 4.8,
      soluteHydrodynamicRadiusNm: 1.09, // Amyloid-beta 42
      soluteMolecularWeightDa: 4514,
      aqp4PolarityRatio: 0.90, // Highly polarized endfeet
      mayerWaveResonanceHz: 0.10
    };

    const pred = service.predict(input);

    expect(pred.wallShearStressPa).toBeGreaterThan(0.5);
    expect(pred.transportRegime).toBe('CONVECTIVE_DOMINATED');
    expect(pred.caaNucleationProbability).toBeLessThan(0.15);
    expect(pred.gelationRiskAlert).toBe(false);
    expect(pred.inferenceDurationMs).toBeLessThan(5.0); // Ultra-lean edge inference
  });

  it('should flag stagnant stasis and elevated gelation/CAA risk when wakefulness and AQP4 depolarization occur', () => {
    const input: IPinnFluidInput = {
      vesselRadiusUm: 20,
      csfBulkVelocityMmS: 0.6, // Low wakefulness velocity
      soluteHydrodynamicRadiusNm: 1.09,
      soluteMolecularWeightDa: 4514,
      aqp4PolarityRatio: 0.25, // Depolarized astrocytic endfeet
      mayerWaveResonanceHz: 0.05
    };

    const pred = service.predict(input);

    expect(pred.transportRegime).toBe('STAGNANT_STASIS');
    expect(pred.caaNucleationProbability).toBeGreaterThan(0.40);
    expect(pred.gelationRiskAlert).toBe(true);
    expect(pred.spinodalGapDeltaChi).toBeGreaterThanOrEqual(0.0);
  });

  it('should categorize small nutraceuticals as diffusive-permissive', () => {
    const input: IPinnFluidInput = {
      vesselRadiusUm: 15,
      csfBulkVelocityMmS: 2.1,
      soluteHydrodynamicRadiusNm: 0.32, // Spermidine
      soluteMolecularWeightDa: 145,
      aqp4PolarityRatio: 0.85,
      mayerWaveResonanceHz: 0.10
    };

    const pred = service.predict(input);

    expect(pred.transportRegime).toBe('DIFFUSIVE_PERMISSIVE');
    expect(pred.caaNucleationProbability).toBe(0.0);
    expect(pred.gelationRiskAlert).toBe(false);
  });
});
