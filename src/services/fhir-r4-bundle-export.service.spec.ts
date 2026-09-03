import { describe, it, expect, beforeEach } from 'vitest';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';

describe('FhirR4BundleExportService - Specialist CDS Bundles', () => {
  let service: FhirR4BundleExportService;

  beforeEach(() => {
    service = new FhirR4BundleExportService();
  });

  it('1. should compute valid SHA-256 digital signature', () => {
    const sig = service.computeSha256Signature('test clinical payload');
    expect(sig).toBeTruthy();
    expect(sig.length).toBe(64);
  });

  it('2. should generate structured Specialist CDS FHIR R4 document bundle', () => {
    const bundle = service.generateSpecialistCdsBundle({
      patientId: 'patient-402',
      patientName: 'Ada Lovelace',
      discipline: 'cardiology',
      guidelineBody: 'AHA/ACC 2022',
      findings: { lvef: 32, sbp: 118, k: 4.4 },
      recommendation: 'Initiate 4-pillar GDMT: Sacubitril/Valsartan, Metoprolol, Spironolactone, Dapagliflozin',
      gdmtScore: '4-Pillars Indicated'
    });

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBe(2);

    const carePlan = bundle.entry[0].resource;
    expect(carePlan['resourceType']).toBe('CarePlan');
    expect(carePlan['title']).toContain('CARDIOLOGY Protocol');
    expect(carePlan['extension']?.[0]?.url).toContain('fda-21cfr-part11-seal');

    const observation = bundle.entry[1].resource;
    expect(observation['resourceType']).toBe('Observation');
    expect(observation['code']?.coding?.[0]?.code).toBe('CARDIOLOGY');
    expect(observation['component']?.length).toBe(3);
  });

  it('3. should generate complete FHIR R4 bundle with Popperian epistemic formulation and Part 11 signature', () => {
    const mockPatient = {
      id: 'patient-test-1',
      name: 'Phil Gear',
      gender: 'male',
      age: 38,
      issues: {},
      preexistingConditions: ['L4-L5 Disc Herniation']
    } as any;

    const bundle = service.generateFhirR4Bundle(mockPatient);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');

    // Find grounded condition
    const conditionEntry = bundle.entry.find(e => e.resource['id'] === 'condition-grounded-patient-test-1');
    expect(conditionEntry).toBeDefined();
    const condition = conditionEntry!.resource;
    expect(condition['resourceType']).toBe('Condition');
    expect(condition['code'].coding[0].code).toBe('M51.26');

    // Verify Grounded Epistemic Extensions
    const ext = condition['extension']?.find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/grounded-clinical-assertion');
    expect(ext).toBeDefined();
    const nested = ext.extension;
    expect(nested.find((n: any) => n.url === 'null-hypothesis-h0')).toBeDefined();
    expect(nested.find((n: any) => n.url === 'p-value')?.valueDecimal).toBeLessThan(0.05);
    expect(nested.find((n: any) => n.url === 'counter-hypotheses')?.valueString).toContain('Sacroiliac joint dysfunction');
    expect(nested.find((n: any) => n.url === 'disconfirming-physical-exams')?.valueString).toContain('Straight Leg Raise');

    // Verify Provenance
    const provEntry = bundle.entry.find(e => e.resource['resourceType'] === 'Provenance');
    expect(provEntry).toBeDefined();
    const prov = provEntry!.resource;
    expect(prov.signature[0].data).toBeDefined();
    expect(prov.target.some((t: any) => t.reference.includes('condition-grounded'))).toBe(true);
  });
});
