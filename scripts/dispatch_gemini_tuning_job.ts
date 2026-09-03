import * as fs from 'fs';
import * as path from 'path';

/**
 * PocketGull - Google Vertex AI & Gemini Fine-Tuning Dispatcher
 * 
 * Target GCP Project: gen-lang-client-0540208645
 * Datasets:
 *  - scripts/gemini_tuning_dataset.jsonl (SFT Multimodal / Multi-Paradigm Dataset)
 *  - scripts/dpo_preference_dataset.jsonl (DPO Direct Preference Optimization Dataset)
 */

export interface ITuningConfig {
  projectId: string;
  location: string;
  baseModel: string;
  tuningType: 'SUPERVISED' | 'DPO_PREFERENCE';
  datasetPath: string;
  hyperparameters: {
    epochCount: number;
    learningRateMultiplier: number;
    adapterSize: number;
  };
}

export function validateDatasetJsonl(filePath: string): { totalRecords: number; validRecords: number; errors: string[] } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file not found at: ${filePath}`);
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim().length > 0);
  const errors: string[] = [];
  let validRecords = 0;

  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.contents || (parsed.prompt && parsed.chosen && parsed.rejected)) {
        validRecords++;
      } else {
        errors.push(`Line ${i + 1}: Missing required Vertex/Gemini tuning fields ('contents' or 'prompt/chosen/rejected').`);
      }
    } catch (e: any) {
      errors.push(`Line ${i + 1}: Invalid JSON - ${e.message}`);
    }
  }

  return { totalRecords: lines.length, validRecords, errors };
}

export function buildVertexTuningJobPayload(config: ITuningConfig): Record<string, any> {
  return {
    displayName: `pocketgull-specialist-tuning-${Date.now()}`,
    baseModel: config.baseModel,
    tuningType: config.tuningType,
    supervisedTuningSpec: config.tuningType === 'SUPERVISED' ? {
      trainingDatasetUri: `gs://${config.projectId}-tuning-sources/${path.basename(config.datasetPath)}`,
      hyperParameters: {
        epochCount: config.hyperparameters.epochCount,
        learningRateMultiplier: config.hyperparameters.learningRateMultiplier,
        adapterSize: config.hyperparameters.adapterSize
      }
    } : undefined,
    dpoTuningSpec: config.tuningType === 'DPO_PREFERENCE' ? {
      preferenceDatasetUri: `gs://${config.projectId}-tuning-sources/${path.basename(config.datasetPath)}`,
      hyperParameters: {
        epochCount: config.hyperparameters.epochCount,
        learningRateMultiplier: config.hyperparameters.learningRateMultiplier
      }
    } : undefined
  };
}

export async function dispatchTuningJob(configOverride?: Partial<ITuningConfig>): Promise<{ success: boolean; payload: any; summary: string }> {
  const rootDir = process.cwd();
  const datasetPath = path.join(rootDir, 'scripts', 'gemini_tuning_dataset.jsonl');

  const config: ITuningConfig = {
    projectId: 'gen-lang-client-0540208645',
    location: 'us-central1',
    baseModel: 'gemini-1.5-flash-002',
    tuningType: 'SUPERVISED',
    datasetPath,
    hyperparameters: {
      epochCount: 4,
      learningRateMultiplier: 1.0,
      adapterSize: 16
    },
    ...configOverride
  };

  console.log('================================================================');
  console.log('🚀 PocketGull Vertex AI / Gemini Fine-Tuning Dispatcher');
  console.log(`📌 Target Project : ${config.projectId}`);
  console.log(`📌 Base Model     : ${config.baseModel}`);
  console.log(`📌 Dataset File   : ${config.datasetPath}`);
  console.log('================================================================\n');

  // 1. Validate Dataset Integrity
  const validation = validateDatasetJsonl(config.datasetPath);
  console.log(`📊 Dataset Validation: ${validation.validRecords}/${validation.totalRecords} records verified.`);

  if (validation.errors.length > 0) {
    console.error('❌ Validation Errors:');
    validation.errors.forEach(err => console.error(`  - ${err}`));
    return { success: false, payload: null, summary: 'Dataset validation failed' };
  }

  // 2. Build Vertex Payload
  const payload = buildVertexTuningJobPayload(config);
  const outDir = path.join(rootDir, 'scratch');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const manifestPath = path.join(outDir, 'vertex_tuning_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`📝 Generated Vertex AI Tuning Manifest: ${manifestPath}`);

  const summary = `Successfully staged tuning job for ${validation.validRecords} records on ${config.projectId} (${config.baseModel}).`;
  console.log(`✅ ${summary}`);
  console.log('================================================================\n');

  return { success: true, payload, summary };
}

// CLI Execution
if (process.argv[1]?.endsWith('dispatch_gemini_tuning_job.ts') || process.argv[1]?.endsWith('dispatch_gemini_tuning_job.js')) {
  dispatchTuningJob();
}
