/**
 * PocketGull Ethical Research Data Dividend & Disease Cohort Marketplace Types
 * 
 * Modeled after verified ethical research institutions:
 * 1. NIH "All of Us" Research Program (EHR & Biosignal Registry + Participant Insights)
 * 2. LunaDNA Public Benefit Cooperative (Patient Equity & Data Dividends)
 * 3. Ciitizen / Invitae Rare Disease Registry (Patient-Governed FDA Accelerated Studies)
 *
 * Compliant with:
 * - HIPAA § 164.514 Safe Harbor (De-Identification)
 * - HIPAA § 164.508 Electronic Research Authorization
 * - FTC Act § 5 Transparency Mandates
 * - Common Rule (45 CFR § 46) Participant Protection
 *
 * @module models/research-cohort.types
 */

export type DiseaseCategory = 
  | 'metabolic_endocrine' 
  | 'oncology_genomics' 
  | 'post_viral_autonomic' 
  | 'cardiopulmonary' 
  | 'neuro_developmental' 
  | 'rare_orphan_diseases';

export type EthicalPrecedentFramework = 
  | 'nih_all_of_us' 
  | 'luna_dna_public_benefit' 
  | 'ciitizen_rare_disease';

export interface IResearchCohortListing {
  id: string;
  category: DiseaseCategory;
  title: string;
  sponsorOrInstitution: string;
  ethicalFramework: EthicalPrecedentFramework;
  description: string;
  clinicalObjective: string;
  participantCount: number;
  dataPointsCount: number;
  compensationPerQueryUsd: number;
  participantBenefitDescription: string; // e.g. Free genomic / biomarker insight report returned to patient
  sampleFields: string[];
  kAnonymityScore: number;
  differentialPrivacyEpsilon?: number;
  differentialPrivacyDelta?: number;
  linkageAttackRiskTier?: LinkageRiskTier;
  fhirResourceType: 'ResearchStudy' | 'Observation' | 'Condition' | 'DiagnosticReport';
  tags: string[];
}

export type LinkageRiskTier = 'LOW' | 'MODERATE' | 'CRITICAL_QUARANTINE';

export interface IDifferentialPrivacyConfig {
  epsilon: number;
  delta: number;
  mechanism: 'LAPLACE' | 'GAUSSIAN';
  calibratedNoiseScale: number;
}

export interface ILinkageAttackRiskEvaluation {
  cohortId: string;
  quasiIdentifierEntropyScore: number;
  kAnonymityScore: number;
  riskTier: LinkageRiskTier;
  isQuarantined: boolean;
  quarantineReason: string | null;
  allowedForEgress: boolean;
  differentialPrivacy: IDifferentialPrivacyConfig;
}

export interface IResearchDividendLedgerEntry {
  id: string;
  timestamp: string;
  cohortId: string;
  cohortTitle: string;
  buyerInstitution: string;
  ethicalFramework: EthicalPrecedentFramework;
  amountUsd: number;
  patientRevenueSharePercent: number; // e.g. 85% goes directly to the contributing patient
  status: 'accrued' | 'paid_out';
  transactionHash: string;
  researchFindingSummary?: string; // Summary of medical research discovery made with this query
}

export interface IPatientResearchEnrollment {
  enrolledCohortIds: string[];
  isHipaaAuthorized: boolean;
  hipaaAuthorizationSignedAt: string | null;
  authorizationSignatureHash: string | null;
  ethicalCharterAccepted: boolean;
  returnOfInsightsEnabled: boolean; // Opt-in to receive scientific discoveries & biomarker benchmarks
  payoutMethod: 'stripe_connect' | 'direct_deposit' | 'unconfigured';
  payoutAccountMasked: string | null;
  lifetimeEarningsUsd: number;
  availableBalanceUsd: number;
  ledger: IResearchDividendLedgerEntry[];
}

export interface IResearchAccessQueryRequest {
  cohortId: string;
  researcherOrg: string;
  researchProtocolId: string;
  queryFilters?: Record<string, unknown>;
  licenseTier: 'academic_single_query' | 'biotech_annual_license';
}

/**
 * BigQuery Analytics Hub Cohort Listing Descriptor
 * Conforms to Google Cloud Analytics Hub Exchange & Listing specification.
 * GCP Project: gen-lang-client-0540208645
 * Data Exchange: pocketgull_data_exchange
 */
export interface IBigQueryAnalyticsHubListing {
  listingId: string;
  dataExchangeId: string;
  displayName: string;
  description: string;
  primaryContact: string;
  documentationUrl?: string;
  project: string;
  datasetReference: string;
  category: DiseaseCategory;
  differentialPrivacyBudget: {
    epsilon: number;
    delta: number;
  };
  kAnonymityScore: number;
  subscriberCount: number;
  dryRunSqlTemplate: string;
  sampleColumns: Array<{
    name: string;
    type: string;
    description: string;
    isDeIdentified: boolean;
  }>;
}

export interface IDryRunSqlQueryResult {
  cohortId: string;
  sql: string;
  estimatedBytesBilled: number;
  estimatedParticipantsMatched: number;
  differentialPrivacyEpsilonConsumed: number;
  perturbedAggregateSample: Record<string, number>;
  isValid: boolean;
  executionNotice: string;
}

export interface IStripeConnectExpressPayout {
  payoutId: string;
  timestamp: string;
  amountUsd: number;
  feeUsd: number;
  netPayoutUsd: number;
  arrivalEstimate: string;
  destinationAccountMasked: string;
  status: 'pending' | 'in_transit' | 'paid' | 'requires_dual_custody';
  dualCustodyAttestation?: {
    isAttested: boolean;
    primarySigner: string;
    secondarySigner: string;
    signatureHash: string;
    timestamp: string;
  };
}

export interface IStripeConnectAccountStatus {
  accountId: string;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  currency: string;
  country: string;
  dashboardUrl: string;
  lastPayoutAt?: string;
}

