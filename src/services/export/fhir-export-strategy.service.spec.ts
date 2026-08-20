import '@angular/compiler';
import { FhirExportStrategyService } from './fhir-export-strategy.service';
import type { IPatient } from '../patient.types';

describe('FhirExportStrategyService Suite', () => {
  const service = new FhirExportStrategyService();

  const mockPatient: IPatient = {
    id: 'pt-spec-99',
    name: 'Ada Lovelace',
    age: 36,
    gender: 'Female',
    vitals: { hr: '72', bp: '120/80', spO2: '98', temp: '36.6', weight: '65', height: '168' },
    preexistingConditions: ['Mathematical Computing Focus'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Mathematical Computing Focus',
    lastVisit: '2026-08-05'
  };

  it('normalizes gender to FHIR R4 standard', () => {
    expect(service.toFhirGender('Female')).toBe('female');
    expect(service.toFhirGender('Male')).toBe('male');
    expect(service.toFhirGender('Non-binary')).toBe('other');
    expect(service.toFhirGender(undefined)).toBe('unknown');
  });

  it('sanitizes malicious script tags during export', () => {
    const dirtyHtml = 'Patient Note <script>alert("xss")</script>';
    const cleanStr = service.sanitizeForExport(dirtyHtml);
    expect(cleanStr).not.toContain('<script>');
  });

  it('generates a valid FHIR R4 collection bundle with Practitioner NPI provenance', () => {
    const bundle = service.generateFhirBundle(mockPatient);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBeGreaterThan(1);

    const patientResource = bundle.entry[0].resource;
    expect(patientResource.resourceType).toBe('Patient');
    expect(patientResource.gender).toBe('female');

    const practitionerResource = bundle.entry.find(e => e.resource.resourceType === 'Practitioner')?.resource;
    expect(practitionerResource).toBeDefined();
    expect((practitionerResource?.identifier as any)?.[0]?.value).toBe('1487569752');
    expect((practitionerResource?.name as any)?.[0]?.family).toBe('Gear');
  });
});
