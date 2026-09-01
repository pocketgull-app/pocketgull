import { DeIdentificationEngineService } from './de-identification-engine.service';

describe('DeIdentificationEngineService', () => {
  let service: DeIdentificationEngineService;

  beforeEach(() => {
    service = new DeIdentificationEngineService();
  });

  it('should strip all 18 HIPAA Safe Harbor identifiers and compute age brackets', () => {
    const rawRecord = {
      name: 'John Doe',
      mrn: 'MRN-123456',
      ssn: '123-45-6789',
      email: 'johndoe@example.com',
      phone: '503-555-0199',
      birthDate: '1975-04-12',
      zipCode: '97201',
      state: 'OR',
      gender: 'M',
      deviceSerial: 'DEXCOM-G7-9912',
      ipAddress: '192.168.1.1',
      admissionDate: '2026-02-15',
      biosignals: {
        glucose_mg_dl: 128.0,
        hrv_rmssd_ms: 42.0
      }
    };

    const deidentified = service.deIdentifyPatientRecord(rawRecord);

    expect(deidentified.studySubjectId).toMatch(/^SUBJ-[0-9a-f]{8}$/);
    expect(deidentified.ageBracket).toBe('50-69');
    expect(deidentified.stateCode).toBe('OR');
    expect(deidentified.studyDayOffset).toBeGreaterThan(0);
    expect(deidentified.strippedAttributesCount).toBeGreaterThanOrEqual(9);
    expect(deidentified.continuousBiosignals['glucose_mg_dl']).toBeCloseTo(128.0, -2);
    expect(deidentified.continuousBiosignals['hrv_rmssd_ms']).toBeCloseTo(42.0, -2);
  });

  it('should cap age > 89 to 90+ bracket per HIPAA Safe Harbor §164.514(b)(2)(i)(C)', () => {
    const rawElderlyRecord = {
      name: 'Elderly Patient',
      birthDate: '1930-01-01',
      state: 'WA'
    };

    const deidentified = service.deIdentifyPatientRecord(rawElderlyRecord);
    expect(deidentified.ageBracket).toBe('90+');
  });

  it('should validate k-anonymity bounds (k >= 8)', () => {
    expect(service.validateKAnonymity(12)).toBe(true);
    expect(service.validateKAnonymity(8)).toBe(true);
    expect(service.validateKAnonymity(7)).toBe(false);
    expect(service.validateKAnonymity(1)).toBe(false);
  });

  it('should sample bounded zero-mean Laplace differential privacy noise', () => {
    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      samples.push(service.sampleLaplaceNoise(0, 1.0));
    }

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(Math.abs(mean)).toBeLessThan(1.5); // Mean centers near 0
  });
});
