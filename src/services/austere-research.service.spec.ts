import { TestBed } from '@angular/core/testing';
import { AustereResearchService } from './austere-research.service';
import {
  IAustereFhirPatientResource,
  IAustereFhirObservationResource,
  IAustereFhirClinicalImpressionResource
} from '../models/austere-research.model';

describe('AustereResearchService', () => {
  let service: AustereResearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AustereResearchService]
    });
    service = TestBed.inject(AustereResearchService);
  });

  it('should be created with default austere state', () => {
    expect(service).toBeTruthy();
    expect(service.activeArchetype()).toContain('Homo Sapiens');
    expect(service.isPurged()).toBe(false);
    expect(service.vitals().length).toBe(4);
    expect(service.dataSovereignty().hipaaSafeHarborVerified).toBe(true);
    expect(service.computePolicy().networkEgressBlocked).toBe(true);
  });

  it('generates a 32-character hex nonce from NIST SP 800-90A CSPRNG entropy', () => {
    const nonce1 = service.generateHardwareEntropyNonce();
    const nonce2 = service.generateHardwareEntropyNonce();

    expect(nonce1).toBeDefined();
    expect(nonce1.length).toBe(32);
    expect(nonce2.length).toBe(32);
    expect(nonce1).not.toBe(nonce2);
    expect(/^[0-9a-f]{32}$/.test(nonce1)).toBe(true);
  });

  it('computes FDA 21 CFR Part 11 SHA-256 integrity seals', async () => {
    const payload = 'Test Clinical Payload';
    const seal = await service.computeIntegritySeal(payload);

    expect(seal.startsWith('sha256:')).toBe(true);
    expect(seal.length).toBe(71); // 'sha256:' (7) + 64 hex chars
  });

  it('executes 1-click zero-egress ephemeral RAM purge', () => {
    const purgeResult = service.purgeTransientPatientState();

    expect(purgeResult.purgedItemsCount).toBeGreaterThanOrEqual(4);
    expect(service.isPurged()).toBe(true);
    expect(service.vitals().length).toBe(0);
    expect(service.activeArchetype()).toBe('PURGED_EPHEMERAL_STATE');
    expect(service.integritySeal()).toBe('0000000000000000000000000000000000000000000000000000000000000000');
  });

  it('restores default archetype state after purge', () => {
    service.purgeTransientPatientState();
    expect(service.isPurged()).toBe(true);

    service.restoreDefaultArchetype();
    expect(service.isPurged()).toBe(false);
    expect(service.activeArchetype()).toContain('Homo Sapiens');
    expect(service.vitals().length).toBe(4);
  });

  it('generates a HIPAA Safe Harbor and FVEY compliant FHIR R4 Bundle', () => {
    const bundle = service.generateAustereFhirBundle();

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.meta.tag).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'HIPAA-SAFE-HARBOR-STRIPPED' }),
        expect.objectContaining({ code: 'ZERO-EGRESS-LOCAL-EDGE' })
      ])
    );

    // Verify Patient resource is de-identified
    const patientEntry = bundle.entry.find(e => e.resource.resourceType === 'Patient');
    expect(patientEntry).toBeDefined();
    const patientResource = patientEntry?.resource as IAustereFhirPatientResource;
    expect(patientResource.name?.[0]?.use).toBe('anonymous');
    expect(patientResource.name?.[0]?.text).toContain('Homo Sapiens');

    // Verify LOINC Observation resources with statistical p-value extensions
    const observationEntries = bundle.entry
      .filter((e): e is typeof e & { resource: IAustereFhirObservationResource } => e.resource.resourceType === 'Observation');
    expect(observationEntries.length).toBe(4);

    const hrObs = observationEntries.find(e => e.resource.code.coding[0].code === '8867-4');
    expect(hrObs).toBeDefined();
    expect(hrObs?.resource.valueQuantity?.value).toBe(72);

    // Verify ClinicalImpression summary
    const impressionEntry = bundle.entry.find(e => e.resource.resourceType === 'ClinicalImpression');
    expect(impressionEntry).toBeDefined();
    const impressionResource = impressionEntry?.resource as IAustereFhirClinicalImpressionResource;
    expect(impressionResource?.summary).toContain('3-Act Austere Assessment');
  });

  it('serializes FHIR R4 Bundle to valid JSON string', () => {
    const jsonStr = service.exportFhirBundleJson();
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
  });
});
