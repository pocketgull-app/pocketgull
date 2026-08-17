import '@angular/compiler';
import { CsvExportStrategyService } from './csv-export-strategy.service';
import type { IPatient } from '../patient.types';

describe('CsvExportStrategyService Suite', () => {
  let service: CsvExportStrategyService;

  beforeEach(() => {
    service = new CsvExportStrategyService();
  });


  const mockPatient: IPatient = {
    id: 'pt-csv-101',
    name: 'Curie, Marie "Radiant"',
    age: 66,
    gender: 'Female',
    vitals: {
      hr: '76',
      bp: '124/82',
      spO2: '99',
      cgmGlucoseMgDl: '105',
      temp: '37.0',
      weight: '60',
      height: '165'
    },
    preexistingConditions: ['Radiation Therapy Study', 'Bone Marrow Fatigue'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Isolate radium isotopes',
    lastVisit: '2026-08-08',
    phq9Score: 3,
    gad7Score: 2,
    ybocsScore: 4,
    kssScore: 2,
    occupation: 'Nuclear Physicist & Research Scientist'
  };

  it('escapes quotes and special characters per RFC 4180 CSV specifications', () => {
    const csv = service.generatePatientCsv(mockPatient);
    expect(csv).toContain('"Curie, Marie ""Radiant"""');
  });

  it('correctly parses systolic and diastolic blood pressure components into CSV columns', () => {
    const csv = service.generatePatientCsv(mockPatient);
    expect(csv).toContain('"124"');
    expect(csv).toContain('"82"');
  });

  it('includes clinical assessment scores, SIGCOMM acoustic biomarkers, and occupational headers', () => {
    const csv = service.generatePatientCsv(mockPatient);
    expect(csv).toContain('Acoustic Dominant Freq (Hz)');
    expect(csv).toContain('Acoustic Energy (dB)');
    expect(csv).toContain('Acoustic Pattern');
    expect(csv).toContain('"Normal Breathing"');
    expect(csv).toContain('PHQ-9 Score');
    expect(csv).toContain('GAD-7 Score');
    expect(csv).toContain('Y-BOCS Score');
    expect(csv).toContain('KSS Sleepiness Score');
    expect(csv).toContain('SIBI Periodontal Score');
    expect(csv).toContain('SOFA Deterioration Risk Score');
    expect(csv).toContain('LACE Readmission Risk Score');
    expect(csv).toContain('"Nuclear Physicist & Research Scientist"');
  });

  it('handles missing or partial patient telemetry gracefully without throwing errors', () => {
    const partialPatient: Partial<IPatient> = { id: 'p-sparse-001' };
    const csv = service.generatePatientCsv(partialPatient);
    expect(csv).toContain('"p-sparse-001"');
    expect(csv).toContain('"Patient"');
    expect(csv).toContain('Timestamp');
  });
});
