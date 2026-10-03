import '@angular/compiler';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SentinelTelemetryPlotterComponent } from './sentinel-telemetry-plotter.component';
import { ExportService } from '../services/export.service';
import { PatientStateService } from '../services/patient-state.service';

describe('SentinelTelemetryPlotterComponent Unit Suite', () => {
  let component: SentinelTelemetryPlotterComponent;
  let exportService: ExportService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentinelTelemetryPlotterComponent],
      providers: [
        ExportService,
        PatientStateService,
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SentinelTelemetryPlotterComponent);
    component = fixture.componentInstance;
    exportService = TestBed.inject(ExportService);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully with default transmission and recovery rates', () => {
    expect(component).toBeTruthy();
    expect(component.beta()).toBe(0.35);
    expect(component.gamma()).toBe(0.10);
    expect(component.quarantineEfficacy()).toBe(20);
    expect(component.vaccinationCoverage()).toBe(10);
  });

  it('2. Computes basic reproduction number R0 and effective Re', () => {
    expect(component.basicReproductionNumber()).toBeCloseTo(3.5, 1);
    expect(component.effectiveReproductionNumber()).toBeLessThan(component.basicReproductionNumber());
  });

  it('3. Simulates Euler numerical integration for SIR differential curves', () => {
    const points = component.sirDataPoints();
    expect(points.length).toBe(101);
    expect(points[0].day).toBe(0);
    expect(component.peakDay()).toBeGreaterThan(0);
    expect(component.maxInfected()).toBeGreaterThan(0);
    expect(component.finalRecovered()).toBeGreaterThan(0);
  });

  it('4. Updates parameters and triggers reactive re-computation', () => {
    const inputEventBeta = { target: { value: '0.50' } } as unknown as Event;
    component.onBetaChange(inputEventBeta);
    expect(component.beta()).toBe(0.50);

    const inputEventGamma = { target: { value: '0.20' } } as unknown as Event;
    component.onGammaChange(inputEventGamma);
    expect(component.gamma()).toBe(0.20);

    const inputEventQuarantine = { target: { value: '40' } } as unknown as Event;
    component.onQuarantineChange(inputEventQuarantine);
    expect(component.quarantineEfficacy()).toBe(40);

    const inputEventVaccination = { target: { value: '50' } } as unknown as Event;
    component.onVaccinationChange(inputEventVaccination);
    expect(component.vaccinationCoverage()).toBe(50);
  });

  it('5. Exports macro-sentinel FHIR R4 Bundle', () => {
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-bundle');
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.exportFhirBundle();
    expect(createUrlSpy).toHaveBeenCalled();
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:mock-bundle');
  });

  it('6. Safely handles ngOnDestroy without crashing', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
