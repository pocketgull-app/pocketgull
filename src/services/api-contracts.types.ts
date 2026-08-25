/**
 * Pocket Gull — Auto-Generated API Contract Interfaces
 * Source: pocketgull_api/openapi.yaml
 * Generated at: 2026-08-17T22:43:18.313Z
 * DO NOT MANUALLY EDIT THIS FILE DIRECTLY.
 */

export interface IPubMedSearchQuery {
  term: string;
}

export interface IPubMedSummaryQuery {
  id: string;
}

export interface IOrcidRecordQuery {
  id: string;
}

export interface IChatMessageHistory {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
}

export interface IIntelligenceChatRequest {
  message: string;
  context?: string;
  history?: IChatMessageHistory[];
}

export interface IIntelligenceChatResponse {
  response: string;
  model: string;
  timestamp: string;
}

export interface IRiskScoreApiRequest {
  hr: number;
  bp_systolic: number;
  bp_diastolic: number;
  spo2: number;
  age?: number;
  conditions?: string[];
}

export interface IRiskScoreApiResponse {
  resourceType: 'Bundle';
  type: 'collection';
  entry: Array<{
    resource: {
      resourceType: 'RiskAssessment';
      prediction: Array<{
        qualitativeRisk: { text: 'low' | 'moderate' | 'high' | 'critical' };
        probabilityDecimal: number;
        rationale?: string;
      }>;
    };
  }>;
}

export interface ISidecarHardwareTelemetry {
  gpus: Array<{
    vendor: string;
    name: string;
    driverVersion: string;
    memoryTotalMiB: number;
    memoryUsedMiB: number;
    memoryFreeMiB: number;
    utilizationPercent: number;
    temperatureC: number;
  }>;
  cpuName: string;
  cpuLoadPercent: number;
  systemMemoryTotalGb: number;
  systemMemoryUsedGb: number;
}
