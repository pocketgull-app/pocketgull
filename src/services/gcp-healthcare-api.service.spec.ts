import { describe, it, expect } from 'vitest';
import { GcpHealthcareApiService } from './gcp-healthcare-api.service';

describe('GcpHealthcareApiService', () => {
  const service = new GcpHealthcareApiService();

  it('1. Generates canonical GCP Cloud Healthcare API FHIR Store REST Base URL', () => {
    const fhirUrl = service.getFhirStoreBaseUrl();
    expect(fhirUrl).toContain('gen-lang-client-0540208645');
    expect(fhirUrl).toContain('us-central1');
    expect(fhirUrl).toContain('pocketgull-fhir-r4-store/fhir');
  });

  it('2. Formats FHIR payload for GCP Healthcare API ingestion', () => {
    const payload = service.formatGcpFhirIngestPayload('Observation', { id: 'obs-001', valueQuantity: { value: 72 } });
    expect(payload['resourceType']).toBe('Observation');
    expect(payload['meta']['profile'][0]).toContain('Observation');
  });

  it('3. De-identifies patient payload according to HIPAA §164.514 Safe Harbor standards', () => {
    const rawPatient = {
      resourceType: 'Patient',
      name: [{ text: 'Charles Darwin' }],
      telecom: [{ value: '555-0199' }],
      birthDate: '1809-02-12',
      address: [{ city: 'Shrewsbury' }]
    };

    const deidentified = service.deidentifyFhirPayload(rawPatient);
    expect(deidentified['name'][0]['text']).toContain('Homo Sapiens');
    expect(deidentified['telecom']).toBeUndefined();
    expect(deidentified['address']).toBeUndefined();
    expect(deidentified['birthDate']).toBe('1809-01-01'); // Year retained, month/day truncated
  });

  it('4. Performs hybrid FHIR dual-sync across GCP Healthcare API & AWS HealthLake (Dry-Run)', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [{ resource: { resourceType: 'Patient', name: [{ text: 'Jane Doe' }] } }]
    };

    const res = await service.syncHybridFhirBundle(bundle, { deidentify: true });
    expect(res.gcpSyncSuccess).toBe(true);
    expect(res.awsSyncSuccess).toBe(true);
    expect(res.deidentifiedBundle.entry[0].resource.name[0].text).toContain('Homo Sapiens');
    expect(res.timestamp).toBeTruthy();
  });
});
