import { TestBed } from '@angular/core/testing';
import { BioAdaptiveTypographyService, SloanPhoropterMode } from './bio-adaptive-typography.service';
import { PatientStateService } from './patient-state.service';
import { VisualAcuityService } from './visual-acuity.service';

describe('BioAdaptiveTypographyService Unit Suite', () => {
  let service: BioAdaptiveTypographyService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BioAdaptiveTypographyService,
        PatientStateService,
        VisualAcuityService
      ]
    });
    service = TestBed.inject(BioAdaptiveTypographyService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('should initialize with standard clinical baseline (55 cm, 120 lux, STANDARD_20_20)', () => {
    expect(service.distanceCm()).toBe(55);
    expect(service.ambientLux()).toBe(120);
    expect(service.phoropterMode()).toBe('STANDARD_20_20');
    expect(service.sloanDilationFactor()).toBe(1.0);
  });

  it('should expand Sloan apertures in MESOPIC_ICU mode to prevent dark-adapted blooming', () => {
    service.setPhoropterMode('MESOPIC_ICU');
    expect(service.sloanDilationFactor()).toBe(1.20);
  });

  it('should expand Sloan apertures and boost contrast in STAT_TRAUMA mode', () => {
    service.setPhoropterMode('STAT_TRAUMA');
    expect(service.sloanDilationFactor()).toBe(1.25);
    expect(service.strokeContrast()).toBe(1.25);
  });

  it('should provide maximum Sloan counter dilation in LOW_VISION mode for cataracts/retinopathy', () => {
    service.setPhoropterMode('LOW_VISION');
    expect(service.sloanDilationFactor()).toBe(1.35);
    expect(service.strokeContrast()).toBe(1.25);
  });

  it('should dynamically scale dilation in AUTO_DISTANCE mode as clinician steps back', () => {
    service.setPhoropterMode('AUTO_DISTANCE');
    service.setDistanceCm(55);
    expect(service.sloanDilationFactor()).toBe(1.0);

    service.setDistanceCm(110);
    expect(service.sloanDilationFactor()).toBeGreaterThan(1.1);
  });

  it('should dynamically apply mesopic compensation in STANDARD mode when ambient light is low (<40 lux)', () => {
    service.setPhoropterMode('STANDARD_20_20');
    service.setAmbientLux(30);
    expect(service.sloanDilationFactor()).toBe(1.15);
  });

  it('should compute letter-spacing em directly proportional to Sloan dilation', () => {
    service.setPhoropterMode('LOW_VISION'); // 1.35
    expect(service.letterSpacingEm()).toBe('0.014em');
  });

  it('should compute optotype pixel height maintaining invariant 5-arcminute visual angle', () => {
    service.setDistanceCm(55);
    const heightAt55 = service.optotypePixelHeight();
    expect(heightAt55).toBeGreaterThan(0);

    service.setDistanceCm(110);
    const heightAt110 = service.optotypePixelHeight();
    expect(heightAt110).toBeGreaterThan(heightAt55);
  });

  it('should compile valid 203 DPI thermal label and Zebra ZPL II payload', () => {
    const payload = service.thermalLabelPayload();
    expect(payload.patientName).toContain('SAPIENS');
    expect(payload.mrn).toBe('#9842-01');
    expect(payload.dosageSchedule).toContain('⌀18G IV');
    expect(payload.zplCode).toContain('^XA');
    expect(payload.zplCode).toContain('^CI28');
    expect(payload.zplCode).toContain('^XZ');
  });

  it('should safely clamp distance and lux bounds', () => {
    service.setDistanceCm(10); // Below min 25
    expect(service.distanceCm()).toBe(25);

    service.setDistanceCm(500); // Above max 200
    expect(service.distanceCm()).toBe(200);

    service.setAmbientLux(0); // Below min 5
    expect(service.ambientLux()).toBe(5);

    service.setAmbientLux(5000); // Above max 2000
    expect(service.ambientLux()).toBe(2000);
  });
});
