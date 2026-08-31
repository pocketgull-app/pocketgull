import { describe, it, expect, beforeEach } from 'vitest';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';
import { IPatient } from './patient.types';

describe('FhirR4BundleExportService - Skeptical Epistemology & Provenance Suite', () => {
  let service: FhirR4BundleExportService;

  const mockPatient: IPatient = {
    id: 'p-research-001',
    name: 'Homo Sapiens (Female, Neurological Model, 34y)',
    age: 34,
    gender: 'Female',
    lastVisit: '2026-08-31',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Optimize autonomic vagal resilience and circadian sleep architecture',
    vitals: { bp: '118/76', hr: '72', spO2: '99%', temp: '36.8', weight: '62', height: '168' },
    preexistingConditions: ['Dysautonomia', 'Post-Viral Fatigue'],
    medications: [{ id: 'm1', name: 'Propranolol 10mg', value: '10mg' }],
    dietarySupplements: [{ id: 's1', name: 'Magnesium Glycinate 400mg', value: '400mg' }]
  };

  beforeEach(() => {
    service = new FhirR4BundleExportService();
  });

  it('1. Generates an official HL7 FHIR R4 document Bundle with valid headers', () => {
    const bundle = service.generateFhirR4Bundle(mockPatient);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.id).toContain('p-research-001');
    expect(bundle.entry.length).toBeGreaterThanOrEqual(6);
  });

  it('2. Includes an Observation with Skeptical Epistemology extensions', () => {
    const bundle = service.generateFhirR4Bundle(mockPatient);
    const obsEntry = bundle.entry.find(e => e.resource['resourceType'] === 'Observation' && e.resource['id']?.includes('obs-hrv-vagal'));
    expect(obsEntry).toBeDefined();

    const obs = obsEntry?.resource;
    expect(obs?.['extension']).toBeDefined();
    const skepticalExt = obs?.['extension'].find((ext: any) => ext.url === 'http://pocketgull.app/fhir/StructureDefinition/skeptical-epistemology');
    expect(skepticalExt).toBeDefined();

    const subExts = skepticalExt.extension;
    const pVal = subExts.find((e: any) => e.url === 'p-value');
    const h0 = subExts.find((e: any) => e.url === 'null-hypothesis-h0');
    const rob2 = subExts.find((e: any) => e.url === 'cochrane-rob2-overall');

    expect(pVal?.valueDecimal).toBe(0.014);
    expect(h0?.valueString).toContain('Autonomic vagal tone');
    expect(rob2?.valueString).toBe('Low Risk of Bias');
  });

  it('3. Generates FDA 21 CFR Part 11 compliant Provenance electronic seal', () => {
    const bundle = service.generateFhirR4Bundle(mockPatient);
    const provEntry = bundle.entry.find(e => e.resource['resourceType'] === 'Provenance');
    expect(provEntry).toBeDefined();

    const prov = provEntry?.resource;
    expect(prov?.['signature']).toBeDefined();
    expect(prov?.['signature'][0].sigFormat).toBe('application/jose');
    expect(prov?.['signature'][0].data).toBeTruthy();
    expect(prov?.['signature'][0].extension[0].valueString).toBe('FDA-21-CFR-PART-11-ELECTRONIC-RECORDS-VALIDATED');
  });

  it('4. Correctly formats and serializes the complete FHIR bundle into JSON string', () => {
    const jsonStr = service.exportBundleAsJson(mockPatient);
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'Provenance')).toBe(true);
  });
});
