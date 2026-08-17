import { Injectable } from '@angular/core';

export type PriorAuthStatus = 'approved' | 'pended' | 'denied';

export interface IFhirPasClaimItem {
  sequence: number;
  cptCode: string;
  description: string;
  unitPriceUsd: number;
  icd10DiagnosisCodes: string[];
}

export interface IFhirPasClaimRequest {
  resourceType: 'Claim';
  id: string;
  status: 'active';
  type: 'prior-authorization';
  patientId: string;
  payerId: string;
  providerNpi: string;
  created: string;
  items: IFhirPasClaimItem[];
  clinicalDocumentationText?: string;
}

export interface IFhirPasClaimResponse {
  resourceType: 'ClaimResponse';
  id: string;
  status: 'active';
  outcome: 'complete' | 'pended' | 'error';
  priorAuthStatus: PriorAuthStatus;
  authorizationNumber?: string;
  disposition: string;
  created: string;
  approvedItems: { sequence: number; cptCode: string; approvedCostUsd: number }[];
  pendedRequirements?: string[];
  denialRationale?: string;
  latencyMs: number; // CMS-0057-F requires real-time sub-second responses
}

@Injectable({
  providedIn: 'root'
})
export class FhirPriorAuthService {

  // Authoritative ICD-10 to CPT Medical Necessity Rules Matrix (CMS-0057-F & Da Vinci PAS IG)
  private readonly medicalNecessityRules: Record<string, { validIcd10: string[]; requiredKeywords: string[] }> = {
    '70553': { // Brain MRI with & without contrast
      validIcd10: ['G30.9', 'G30.0', 'G30.1', 'G20', 'G31.83', 'F03.90'],
      requiredKeywords: ['MMSE', 'cognitive', 'memory', 'tremor', 'neurological']
    },
    '78607': { // DaTscan Dopamine Transporter SPECT
      validIcd10: ['G20', 'G31.83', 'R25.1'],
      requiredKeywords: ['tremor', 'bradykinesia', 'parkinson', 'dopamine']
    },
    '74177': { // Abdominal CT with contrast
      validIcd10: ['C25.0', 'C25.9', 'K86.1', 'R10.11'],
      requiredKeywords: ['pancreatic', 'epigastric', 'jaundice', 'mass']
    },
    '99454': { // RPM Monthly Device Transmission
      validIcd10: ['I10', 'E11.9', 'G20', 'G30.9'],
      requiredKeywords: ['telemetry', 'readings', 'monitoring', 'days']
    }
  };

  /**
   * Generates a standard HL7 FHIR Da Vinci PAS Claim Request (resourceType: 'Claim', type: 'prior-authorization').
   */
  public createPasClaimRequest(params: {
    patientId: string;
    payerId: string;
    providerNpi: string;
    items: IFhirPasClaimItem[];
    clinicalDocumentationText?: string;
  }): IFhirPasClaimRequest {
    return {
      resourceType: 'Claim',
      id: `claim_pas_${Date.now()}`,
      status: 'active',
      type: 'prior-authorization',
      patientId: params.patientId,
      payerId: params.payerId,
      providerNpi: params.providerNpi,
      created: new Date().toISOString(),
      items: params.items,
      clinicalDocumentationText: params.clinicalDocumentationText
    };
  }

  /**
   * Evaluates FHIR PAS Claim Request against CMS-0057-F rules and returns a FHIR ClaimResponse.
   */
  public evaluatePriorAuthClaim(claim: IFhirPasClaimRequest): IFhirPasClaimResponse {
    const startTime = Date.now();
    const approvedItems: { sequence: number; cptCode: string; approvedCostUsd: number }[] = [];
    const pendedRequirements: string[] = [];

    let isFullyApproved = true;
    let hasPendedItems = false;
    const docText = (claim.clinicalDocumentationText || '').toLowerCase();

    for (const item of claim.items) {
      const rule = this.medicalNecessityRules[item.cptCode];

      if (!rule) {
        // Unknown CPT code default to approval if ICD-10 is present
        if (item.icd10DiagnosisCodes.length > 0) {
          approvedItems.push({ sequence: item.sequence, cptCode: item.cptCode, approvedCostUsd: item.unitPriceUsd });
        } else {
          isFullyApproved = false;
          hasPendedItems = true;
          pendedRequirements.push(`Item ${item.sequence} (${item.cptCode}): Missing ICD-10 diagnosis code.`);
        }
        continue;
      }

      // Check ICD-10 match
      const hasValidDiagnosis = item.icd10DiagnosisCodes.some(code => rule.validIcd10.includes(code));
      
      // Check clinical documentation keywords
      const hasRequiredDocs = rule.requiredKeywords.some(kw => docText.includes(kw));

      if (hasValidDiagnosis && hasRequiredDocs) {
        approvedItems.push({ sequence: item.sequence, cptCode: item.cptCode, approvedCostUsd: item.unitPriceUsd });
      } else {
        isFullyApproved = false;
        hasPendedItems = true;
        if (!hasValidDiagnosis) {
          pendedRequirements.push(`Item ${item.sequence} (${item.cptCode}): Diagnosis ${item.icd10DiagnosisCodes.join(', ')} does not meet payer LCD medical necessity criteria.`);
        }
        if (!hasRequiredDocs) {
          pendedRequirements.push(`Item ${item.sequence} (${item.cptCode}): Clinical note missing required supporting terms (${rule.requiredKeywords.join(', ')}).`);
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    if (isFullyApproved) {
      return {
        resourceType: 'ClaimResponse',
        id: `resp_pas_${Date.now()}`,
        status: 'active',
        outcome: 'complete',
        priorAuthStatus: 'approved',
        authorizationNumber: `AUTH-PAS-${Math.floor(100000 + Math.random() * 900000)}`,
        disposition: 'AUTOMATED PRIOR AUTHORIZATION GRANTED: Medical necessity criteria satisfied under CMS-0057-F.',
        created: new Date().toISOString(),
        approvedItems,
        latencyMs
      };
    } else if (hasPendedItems) {
      return {
        resourceType: 'ClaimResponse',
        id: `resp_pas_${Date.now()}`,
        status: 'active',
        outcome: 'pended',
        priorAuthStatus: 'pended',
        disposition: 'PRIOR AUTHORIZATION PENDED: Additional clinical documentation required.',
        created: new Date().toISOString(),
        approvedItems,
        pendedRequirements,
        latencyMs
      };
    } else {
      return {
        resourceType: 'ClaimResponse',
        id: `resp_pas_${Date.now()}`,
        status: 'active',
        outcome: 'error',
        priorAuthStatus: 'denied',
        disposition: 'PRIOR AUTHORIZATION DENIED: Fails payer medical necessity policy.',
        created: new Date().toISOString(),
        approvedItems: [],
        denialRationale: 'Non-covered procedure or missing primary diagnostic justification.',
        latencyMs
      };
    }
  }
}
