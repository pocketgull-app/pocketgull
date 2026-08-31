/**
 * PocketGull Austere Research Profile Models & FHIR R4 Contracts
 * 
 * Engineered for air-gapped, bandwidth-constrained, compute-limited,
 * or high-security clinical field environments.
 * 
 * Conforms to:
 * - HIPAA § 164.514 Safe Harbor (All 18 identifiers stripped)
 * - FDA 21 CFR Part 11 Electronic Records Provenance Integrity
 * - Five Eyes (FVEY) Data Sovereignty Matrix
 * - LOINC & SNOMED-CT Clinical Coding Standards
 * 
 * @module models/austere-research.model
 */

export interface IAustereVital {
  label: string;
  value: number | string;
  unit: string;
  pValue: number;
  isStatisticallySignificant: boolean;
  loincCode?: string;
  snomedCode?: string;
}

export interface IAustereDataSovereignty {
  jurisdiction: 'FVEY_GLOBAL_SAFE_HARBOR' | 'US_HIPAA_SAFE_HARBOR' | 'UK_NHS_DSPT' | 'CA_PIPEDA' | 'AU_PRIVACY_ACT';
  hipaaSafeHarborVerified: boolean;
  identifiersStripped: number;
  subjectArchetype: string;
  cryptographicProvenanceSeal: string;
}

export interface IAustereComputePolicy {
  engine: 'OFFLINE_DETERMINISTIC_LOCAL' | 'WASM_EDGE_KERNEL' | 'WEBGPU_EDGE_AI';
  networkEgressBlocked: boolean;
  thirdPartyTrackers: number;
  ephemeralStatePurgeAvailable: boolean;
}

export interface IThreeActTrajectory {
  act1WhereYouveBeen: string;
  act2WhereYouStandToday: string;
  act3WhereYoureGoing: string;
}

export interface IAustereStateSnapshot {
  timestamp: string;
  entropyNonce: string;
  integritySeal: string;
  subjectArchetype: string;
  cohort: string;
  profileMode: 'AUSTERE_RESEARCH';
  dataSovereignty: IAustereDataSovereignty;
  computePolicy: IAustereComputePolicy;
  vitals: IAustereVital[];
  trajectory: IThreeActTrajectory;
}

/**
 * FHIR R4 De-Identified Collection Bundle for Austere Research Profile
 */
export interface IAustereFhirCoding {
  system: string;
  code: string;
  display: string;
}

export interface IAustereFhirQuantity {
  value: number;
  unit: string;
  system: string;
  code: string;
}

export interface IAustereFhirExtension {
  url: string;
  valueDecimal?: number;
  valueBoolean?: boolean;
  valueString?: string;
}

export interface IAustereFhirPatientResource {
  resourceType: 'Patient';
  id: string;
  active: boolean;
  name: Array<{
    use: 'anonymous';
    text: string;
  }>;
  gender: 'female' | 'male' | 'other' | 'unknown';
  birthDate?: string; // YYYY only for HIPAA Safe Harbor (< 90y)
  extension?: IAustereFhirExtension[];
}

export interface IAustereFhirObservationResource {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  category?: Array<{
    coding: IAustereFhirCoding[];
  }>;
  code: {
    coding: IAustereFhirCoding[];
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: IAustereFhirQuantity;
  valueString?: string;
  interpretation?: Array<{
    coding: IAustereFhirCoding[];
  }>;
  extension?: IAustereFhirExtension[];
}

export interface IAustereFhirClinicalImpressionResource {
  resourceType: 'ClinicalImpression';
  id: string;
  status: 'completed';
  subject: {
    reference: string;
  };
  summary: string;
  note?: Array<{
    text: string;
  }>;
}

export type IAustereFhirEntryResource = 
  | IAustereFhirPatientResource 
  | IAustereFhirObservationResource 
  | IAustereFhirClinicalImpressionResource;

export interface IAustereFhirBundleEntry {
  fullUrl: string;
  resource: IAustereFhirEntryResource;
}

export interface IAustereFhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  meta: {
    profile: string[];
    tag: Array<{
      system: string;
      code: string;
    }>;
  };
  entry: IAustereFhirBundleEntry[];
}
