import { describe, it, expect, beforeEach } from 'vitest';
import { ExposomePosologyService, IEnvironmentalTelemetrySnapshot } from './exposome-posology.service';

describe('ExposomePosologyService (Engine 3: Climate Flare Early Warning & Posology)', () => {
  let service: ExposomePosologyService;

  beforeEach(() => {
    service = new ExposomePosologyService();
  });

  it('1. Triggers Wildfire Smoke PM2.5 advance protective directive for asthma patient', () => {
    const telemetry: IEnvironmentalTelemetrySnapshot = {
      aqiPm25: 165, // Unhealthy
      ozonePpm: 0.04,
      pollenSporeIndex: 3.0,
      barometricPressureDeltaHpa6h: -1.2,
      heatIndexFahrenheit: 75,
      forecastHorizonHours: 18
    };

    const directives = service.evaluateAtmosphericFlareRisk(telemetry, ['Asthma', 'Allergic Bronchospasm']);
    expect(directives.length).toBeGreaterThanOrEqual(1);

    const pm25Directive = directives.find(d => d.hazard === 'WILDFIRE_SMOKE_PM25');
    expect(pm25Directive).toBeDefined();
    expect(pm25Directive?.severity).toBe('EMERGENCY_PROTECTION');
    expect(pm25Directive?.advancePosologyInstruction).toContain('maintenance inhaled corticosteroid');
    expect(pm25Directive?.environmentalMitigationAction).toContain('MERV-13');
  });

  it('2. Triggers 12h advance Barometric Pressure drop hydration & posology directive for migraine', () => {
    const telemetry: IEnvironmentalTelemetrySnapshot = {
      aqiPm25: 35,
      ozonePpm: 0.02,
      pollenSporeIndex: 2.0,
      barometricPressureDeltaHpa6h: -6.8, // Rapid drop
      heatIndexFahrenheit: 70,
      forecastHorizonHours: 12
    };

    const directives = service.evaluateAtmosphericFlareRisk(telemetry, ['Chronic Migraine']);
    expect(directives.length).toBe(1);

    const baroDirective = directives[0];
    expect(baroDirective.hazard === 'BAROMETRIC_DROP').toBe(true);
    expect(baroDirective.leadTimeHours).toBe(12);
    expect(baroDirective.advancePosologyInstruction).toContain('Magnesium Glycinate');
    expect(baroDirective.clinicalEvidenceGrounding).toContain('trigeminovascular');
  });

  it('3. Triggers Extreme Heat Index electrolyte & compression directive for POTS', () => {
    const telemetry: IEnvironmentalTelemetrySnapshot = {
      aqiPm25: 45,
      ozonePpm: 0.03,
      pollenSporeIndex: 4.0,
      barometricPressureDeltaHpa6h: 0.5,
      heatIndexFahrenheit: 102, // Heat wave
      forecastHorizonHours: 24
    };

    const directives = service.evaluateAtmosphericFlareRisk(telemetry, ['Postural Orthostatic Tachycardia Syndrome (POTS)']);
    expect(directives.length).toBe(1);

    const heatDirective = directives[0];
    expect(heatDirective.hazard === 'EXTREME_HEAT_INDEX').toBe(true);
    expect(heatDirective.advancePosologyInstruction).toContain('compression garments');
    expect(heatDirective.advancePosologyInstruction).toContain('sodium');
  });
});
