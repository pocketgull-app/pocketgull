/**
 * NSF Open Knowledge Network (NSF OKN) Model Definitions
 * Aligned with the national federation of 43+ connected knowledge graphs (NIH, USGS, NOAA, NIJ, EPA, NSF).
 * Enforces HIPAA §164.514 Safe Harbor de-identification and ONC HTI-1 explainable provenance.
 */

export type OknAgencySource = 'NIH' | 'USGS' | 'NOAA' | 'NIJ' | 'EPA' | 'NSF' | 'CDC' | 'FDA' | 'WHO';

export type OknKnowledgeDomain =
  | 'biomedical'
  | 'pharmacogenomics'
  | 'environmental_toxicology'
  | 'hydrology_groundwater'
  | 'atmospheric_climate'
  | 'nutritional_biochemistry'
  | 'forensic_justice'
  | 'social_determinants_of_health';

export interface IOknEntityNode {
  uri: string;
  label: string;
  domain: OknKnowledgeDomain;
  agencySource: OknAgencySource;
  externalOntologyIds?: {
    snomed?: string;
    rxnorm?: string;
    loinc?: string;
    mesh?: string;
    pubchemCid?: string;
    epaRegistryId?: string;
    usgsSiteId?: string;
  };
  description: string;
  properties?: Record<string, string | number | boolean>;
}

export type OknPredicateType =
  | 'inhibits'
  | 'upregulates'
  | 'downregulates'
  | 'metabolized_by'
  | 'contaminates'
  | 'exacerbates'
  | 'ameliorates'
  | 'biomarker_for'
  | 'contraindicated_with'
  | 'interacts_with'
  | 'prevalent_in_watershed';

export interface IOknRelationshipEdge {
  id: string;
  sourceUri: string;
  targetUri: string;
  predicate: OknPredicateType;
  agencySource: OknAgencySource;
  evidenceSourceUri?: string;
  evidenceCitation?: string;
  epistemicConfidence: number; // 0.0 to 1.0 (Bayesian confidence)
  doiOrPmid?: string;
}

export interface IOknCrossGraphPath {
  pathId: string;
  pathDescription: string;
  participatingAgencies: OknAgencySource[];
  hopCount: number;
  nodes: IOknEntityNode[];
  edges: IOknRelationshipEdge[];
  clinicalSignificance: string;
  cochraneRelevance: 'Level A (Replicated RCTs)' | 'Level B (Cohort / Preliminary)' | 'Level C (Mechanistic Plausibility)';
}

export interface IOknCrossGraphQueryResult {
  queryTerm: string;
  timestamp: string;
  totalNodesMatched: number;
  totalEdgesTraversed: number;
  connectedPaths: IOknCrossGraphPath[];
  crossAgencySynthesis: string;
  hipaaSafeHarborAttested: boolean;
  sha256AttestationSeal: string;
}

export interface IOknVerificationBadge {
  isVerified: boolean;
  badgeLabel: string; // e.g. "[🏛️ NSF OKN Verified]"
  agencySources: OknAgencySource[];
  primaryPathSummary: string;
  auditTrailHash: string;
  evidenceUri?: string;
}
