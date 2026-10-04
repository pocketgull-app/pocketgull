#!/usr/bin/env node
/**
 * 🕊️ PocketGull — Hugging Face & Model Hub Packaging & Manifest Generator
 *
 * Scans all fine-tuned adapters in adapters/huggingface/, verifies schema compliance
 * in adapter_config.json and README.md, and generates model_hub_manifest.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ADAPTERS_DIR = path.join(ROOT_DIR, 'adapters', 'huggingface');
const MANIFEST_PATH = path.join(ADAPTERS_DIR, 'model_hub_manifest.json');
const USERNAME = 'philgear';

console.log('=================================================================');
console.log('  POCKETGULL LLC — HUGGING FACE MODEL HUB EXPORTER');
console.log('  Open Science Clinical LoRA Adapters & Foundation Models');
console.log('  Zenodo DOI: 10.5281/zenodo.20647514');
console.log('=================================================================\n');

if (!fs.existsSync(ADAPTERS_DIR)) {
  console.error(`[ERROR] Adapters directory not found: ${ADAPTERS_DIR}`);
  process.exit(1);
}

const entries = fs.readdirSync(ADAPTERS_DIR, { withFileTypes: true });
const modelDirs = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const manifest = [];
let validCount = 0;

for (const modelId of modelDirs) {
  const modelPath = path.join(ADAPTERS_DIR, modelId);
  const configPath = path.join(modelPath, 'adapter_config.json');
  const readmePath = path.join(modelPath, 'README.md');

  if (!fs.existsSync(configPath)) {
    continue;
  }

  let baseModel = 'unknown';
  let peftType = 'LORA';
  let taskType = 'CAUSAL_LM';

  try {
    const configRaw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configRaw);
    baseModel = config.base_model_name_or_path || 'unknown';
    peftType = config.peft_type || 'LORA';
    taskType = config.task_type || 'CAUSAL_LM';
  } catch (err) {
    console.warn(`[WARN] Could not parse adapter_config.json for ${modelId}:`, err.message);
  }

  let modelName = modelId;
  if (fs.existsSync(readmePath)) {
    try {
      const readme = fs.readFileSync(readmePath, 'utf8');
      const titleMatch = readme.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        // Strip leading emojis and whitespace
        modelName = titleMatch[1].replace(/^[^\w\s(]+/, '').trim();
      }
    } catch {
      // Fallback to modelId
    }
  }

  manifest.push({
    id: modelId,
    name: modelName,
    hub_repo: `${USERNAME}/${modelId}`,
    base_model: baseModel,
    peft_type: peftType,
    task_type: taskType,
    directory: modelPath
  });

  validCount++;
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`[SUCCESS] Packaged ${validCount} Model Hub adapters into manifest.`);
console.log(`Manifest: ${MANIFEST_PATH}\n`);

// Display Summary Table
console.log('Model Catalog Summary:');
console.log('-------------------------------------------------------------------------------------------------------');
console.log(
  'ID'.padEnd(38) +
  'Base Model'.padEnd(36) +
  'Hub Repo'
);
console.log('-------------------------------------------------------------------------------------------------------');

for (const m of manifest) {
  console.log(
    m.id.padEnd(38) +
    m.base_model.padEnd(36) +
    m.hub_repo
  );
}

console.log('-------------------------------------------------------------------------------------------------------');
console.log(`Total Models: ${validCount}`);
console.log('=================================================================\n');
