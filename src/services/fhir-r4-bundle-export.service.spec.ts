import { describe, it, expect, beforeEach } from 'vitest';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';

describe('FhirR4BundleExportService - Specialist CDS Bundles', () => {
  let service: FhirR4BundleExportService;

  beforeEach(() => {
    service = new FhirR4BundleExportService();
  });

  it('1. should compute valid FIPS 180-4 SHA-256 digital signature', () => {
    expect(service.computeSha256Signature('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    const sig = service.computeSha256Signature('test clinical payload');
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
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

    // HIPAA Safe Harbor: raw name stripped, no fabricated 48.5 ms HRV when unmeasured
    expect(JSON.stringify(bundle)).not.toContain('Phil Gear');
    const fabricatedHrv = bundle.entry.find(e => e.resource['id']?.startsWith('obs-hrv-'));
    expect(fabricatedHrv).toBeUndefined();
  });

  it('4. caps age > 89 to 90+ and emits HRV Observation ONLY when genuine hrvRmssd is measured', () => {
    const elderWithHrv = {
      id: 'patient-elder-92',
      name: 'Sensitive Name',
      gender: 'female',
      age: 92,
      issues: {},
      vitals: { bp: '122/78', hr: '68', temp: '36.7', spO2: '98%', weight: '62', height: '164', hrvRmssd: '54.2' }
    } as any;

    const bundle = service.generateFhirR4Bundle(elderWithHrv);
    const patientRes = bundle.entry.find(e => e.resource['resourceType'] === 'Patient')?.resource;
    expect(patientRes?.birthDate).toBeUndefined();
    expect(JSON.stringify(patientRes)).not.toContain('Sensitive Name');
    expect(patientRes?.extension?.some((ex: any) => ex.valueString === '90+')).toBe(true);

    const hrvObs = bundle.entry.find(e => e.resource['id']?.startsWith('obs-hrv-'))?.resource;
    expect(hrvObs).toBeDefined();
    expect(hrvObs?.valueQuantity?.value).toBe(54.2);
  });
});
