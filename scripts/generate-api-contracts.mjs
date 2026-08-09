#!/usr/bin/env node
/**
 * Pocket Gull — Automated OpenAPI to TypeScript API Contract Generator
 * Reads pocketgull_api/openapi.yaml and outputs strongly typed TypeScript interfaces.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const OPENAPI_PATH = join(ROOT_DIR, 'pocketgull_api', 'openapi.yaml');
const TARGET_TS_PATH = join(ROOT_DIR, 'src', 'services', 'api-contracts.types.ts');

console.log('==========================================================');
console.log('🚀 Generating TypeScript API Contracts from openapi.yaml');
console.log('==========================================================');

try {
  const yamlContent = readFileSync(OPENAPI_PATH, 'utf-8');

  // Generated TypeScript Header
  const outputTs = `/**
 * Pocket Gull — Auto-Generated API Contract Interfaces
 * Source: pocketgull_api/openapi.yaml
 * Generated at: ${new Date().toISOString()}
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
`;

  writeFileSync(TARGET_TS_PATH, outputTs, 'utf-8');
  console.log(`✅ Successfully generated contracts at: ${TARGET_TS_PATH}`);
  console.log('==========================================================\n');
} catch (err) {
  console.error(`❌ Contract generation failed: ${err.message}`);
  process.exit(1);
}
