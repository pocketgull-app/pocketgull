import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Checking gcloud token and Vertex AI / Gemini video API endpoints...');
  
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  const projectId = 'gen-lang-client-0540208645';
  const location = 'us-central1';

  console.log(`✅ Obtained gcloud access token for project: ${projectId}`);

  // Test Vertex AI Veo endpoint
  const candidateModels = [
    'veo-2.0-generate-001',
    'veo-001',
    'imagegeneration@006',
    'imagen-3.0-generate-002'
  ];

  console.log('🔍 Checking available Vertex AI foundation models...');
  
  for (const model of candidateModels) {
    try {
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Model [${model}] status: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`Model [${model}] check failed: ${err.message}`);
    }
  }
}

main().catch(console.error);
