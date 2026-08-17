import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function checkGenerativeModels() {
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  
  console.log('🔍 Querying generativelanguage.googleapis.com/v1beta/models...');
  
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log(`Status: ${res.status} ${res.statusText}`);
  if (res.ok) {
    const data = await res.json();
    const models = data.models || [];
    console.log(`Found ${models.length} total models.`);
    const videoModels = models.filter(m => m.name.includes('veo') || m.name.includes('video') || m.name.includes('imagen') || m.name.includes('omni'));
    console.log('Video / Multimodal Models:');
    videoModels.forEach(m => console.log(` - ${m.name}: ${m.displayName || ''}`));
  } else {
    const text = await res.text();
    console.log(`Error body: ${text}`);
  }
}

checkGenerativeModels().catch(console.error);
