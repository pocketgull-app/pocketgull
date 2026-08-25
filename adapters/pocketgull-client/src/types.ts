/**
 * @file types.ts
 * @description Strongly-typed Port and Gateway contracts for @pocketgull/client.
 */

export interface IPocketGullClientConfig {
  /** Base URL for PocketGull REST API. Defaults to 'https://pocketgull.app' */
  baseUrl?: string;
  /** WebSocket URL for Live Consult audio and telemetry streams. Defaults to 'wss://pocketgull.app' */
  wsUrl?: string;
  /** Optional API token or OAuth2 Bearer token */
  apiKey?: string;
  /** Enable automatic offline fallback to local edge evaluation. Defaults to true */
  offlineFallback?: boolean;
  /** Request timeout in milliseconds. Defaults to 10,000ms */
  timeoutMs?: number;
}

export interface IResearchCohortSummary {
  id: string;
  title: string;
  conditionCode: string;
  description: string;
  compensationPerQueryUsd: number;
  activeEnrolledCount: number;
  kAnonymityScore: number;
  ethicalPrecedent: 'nih_all_of_us' | 'luna_dna_public_benefit' | 'ciitizen_rare_disease';
}

export interface IPatientDividendSummary {
  patientId: string;
  lifetimeEarningsUsd: number;
  availableBalanceUsd: number;
  enrolledCohortIds: string[];
  stripeConnectAccountId?: string;
}

export interface IStripeConnectLinkResponse {
  onboardingUrl: string;
  expiresAt: string;
  accountId: string;
}

export interface IPayoutExecutionResponse {
  success: boolean;
  transferId?: string;
  amountUsd: number;
  remainingBalanceUsd: number;
  requiresDualCustody?: boolean;
  message: string;
}

export interface IClinicalConsultRequest {
  patientContext: {
    age?: number;
    gender?: string;
    symptoms: string[];
    vitals?: Record<string, number | string>;
  };
  prompt: string;
  lensType?: 'western' | 'tcm' | 'ayurvedic' | 'integrative';
}

export interface IClinicalConsultResponse {
  consultId: string;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    evidenceGrade: 'A' | 'B' | 'C' | 'Expert Consensus';
    cochraneRiskOfBias?: string;
  }>;
  safetyAlerts: string[];
  fhirBundleSnippet?: Record<string, unknown>;
}
