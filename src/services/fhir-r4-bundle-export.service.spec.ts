import { Injector, runInInjectionContext } from '@angular/core';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';
import { GlobalHealthInitiativesService } from './global-health-initiatives.service';
import { IPatient } from './patient.types';

describe('FhirR4BundleExportService - HL7 FHIR R4 Multi-Paradigm Exporter', () => {
  const createService = () => {
    const injector = Injector.create({
      providers: [
        FhirR4BundleExportService,
        GlobalHealthInitiativesService
      ]
    });
    return runInInjectionContext(injector, () => injector.get(FhirR4BundleExportService));
  };

  const samplePatient: IPatient = {
    id: 'pt-fhir-001',
    name: 'Eleanor Vance',
    age: 54,
    gender: 'Female',
    vitals: { bp: '138/88', hr: '74', spO2: '98', temp: '36.8', weight: '68', height: '165' },
    preexistingConditions: ['Essential Hypertension', 'Spleen Qi Deficiency', 'Post-Exertional Fatigue'],
    history: [],
    bookmarks: [],
    issues: {},
    lastVisit: '2026-08-20',
    patientGoals: 'Cardiovascular Longevity'
  };

  it('1. Generates a valid HL7 FHIR R4 document bundle with standard metadata', () => {
    const service = createService();
    const bundle = service.generateFhirR4Bundle(samplePatient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBeGreaterThan(3);
    expect(bundle.id).toContain('urn:uuid:bundle-pt-fhir-001');
  });

  it('2. Embeds WHO SDG 3.4 RiskAssessment and ICD-11 Chapter 26 dual-coded Conditions', () => {
    const service = createService();
    const bundle = service.generateFhirR4Bundle(samplePatient);

    // Verify RiskAssessment
    const riskResource = bundle.entry.find(e => e.resource.resourceType === 'RiskAssessment')?.resource;
    expect(riskResource).toBeDefined();
    expect(riskResource?.code.coding[0].system).toBe('http://who.int/sdg/3.4');
    expect(riskResource?.prediction[0].probabilityDecimal).toBeGreaterThan(0);

    // Verify Condition dual-coding
    const conditionResources = bundle.entry
      .filter(e => e.resource.resourceType === 'Condition')
      .map(e => e.resource);
    expect(conditionResources.length).toBeGreaterThan(0);
    expect(conditionResources[0].code.coding.some((c: any) => c.system === 'http://id.who.int/icd11/mms')).toBe(true);
    expect(conditionResources[0].code.coding.some((c: any) => c.system === 'http://hl7.org/fhir/sid/icd-10')).toBe(true);
  });

  it('3. Exports formatted JSON FHIR string successfully', () => {
    const service = createService();
    const jsonStr = service.exportBundleAsJson(samplePatient);
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'Composition')).toBe(true);
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'Observation')).toBe(true);
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'CarePlan')).toBe(true);
  });
});
