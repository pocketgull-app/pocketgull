/**
 * Types for USWDS Clinical Decision Support (CDS) React Components
 * Grounded in USWDS 3.0, 18 U.S.C. § 701 safe harbor, and VA MISSION Act.
 */

export type FederalBannerMode = 'official-gov' | 'community-partner';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface VaPatientProfile {
  id: string;
  code: string;
  name: string;
  age: number;
  gender: string;
  branch: string;
  serviceEra: string;
  theater: string;
  pactActPresumptive: boolean;
  chiefComplaint: string;
  vaDisabilityRating: string;
  vitals: {
    bp: string;
    hr: string;
    spo2: string;
    bmi: string;
  };
  conditions: string[];
}

export interface MedicalNexusOpinion {
  condition: string;
  serviceConnectionLikelihood: string;
  statutoryStandard: string;
  objectiveEvidence: string[];
  rationale: string;
  sha256Attestation: string;
}

export interface FhirRow {
  resourceType: string;
  profile: string;
  element: string;
  value: string;
  codingSystem: string;
  code: string;
}

export interface StepItem {
  id: number;
  label: string;
  status: 'complete' | 'current' | 'incomplete';
}
