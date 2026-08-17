import '@angular/compiler';
import { expect } from 'vitest';
import { FhirPriorAuthService } from './fhir-prior-auth.service';

describe('FhirPriorAuthService Unit Suite', () => {
  let service: FhirPriorAuthService;

  beforeEach(() => {
    service = new FhirPriorAuthService();
  });

  it('1. Generates valid FHIR Da Vinci PAS Claim request', () => {
    const claim = service.createPasClaimRequest({
      patientId: 'p010',
      payerId: 'PAYER-MEDICARE-001',
      providerNpi: '1992837465',
      items: [
        { sequence: 1, cptCode: '70553', description: 'Brain MRI with & without contrast', unitPriceUsd: 1250, icd10DiagnosisCodes: ['G30.9', 'G20'] }
      ],
      clinicalDocumentationText: 'Patient presents with MMSE 19/30 cognitive memory loss and 3Hz resting tremor.'
    });

    expect(claim.resourceType).toBe('Claim');
    expect(claim.type).toBe('prior-authorization');
    expect(claim.items.length).toBe(1);
  });

  it('2. Grants automated sub-second prior-authorization approval under CMS-0057-F when medical necessity is satisfied', () => {
    const claim = service.createPasClaimRequest({
      patientId: 'p010',
      payerId: 'PAYER-MEDICARE-001',
      providerNpi: '1992837465',
      items: [
        { sequence: 1, cptCode: '70553', description: 'Brain MRI with & without contrast', unitPriceUsd: 1250, icd10DiagnosisCodes: ['G30.9'] }
      ],
      clinicalDocumentationText: 'Patient has progressive cognitive memory loss (MMSE 19/30) and spatial disorientation.'
    });

    const response = service.evaluatePriorAuthClaim(claim);
    expect(response.resourceType).toBe('ClaimResponse');
    expect(response.priorAuthStatus).toBe('approved');
    expect(response.authorizationNumber).toContain('AUTH-PAS-');
    expect(response.approvedItems.length).toBe(1);
    expect(response.latencyMs).toBeLessThan(500); // Sub-second CMS-0057-F mandate
  });

  it('3. Pends prior authorization when required clinical documentation keywords are missing', () => {
    const claim = service.createPasClaimRequest({
      patientId: 'p010',
      payerId: 'PAYER-MEDICARE-001',
      providerNpi: '1992837465',
      items: [
        { sequence: 1, cptCode: '70553', description: 'Brain MRI with & without contrast', unitPriceUsd: 1250, icd10DiagnosisCodes: ['G30.9'] }
      ],
      clinicalDocumentationText: 'Routine annual checkup, patient feels fine.' // Missing cognitive/memory keywords
    });

    const response = service.evaluatePriorAuthClaim(claim);
    expect(response.priorAuthStatus).toBe('pended');
    expect(response.pendedRequirements?.length).toBeGreaterThan(0);
    expect(response.disposition).toContain('PRIOR AUTHORIZATION PENDED');
  });
});
