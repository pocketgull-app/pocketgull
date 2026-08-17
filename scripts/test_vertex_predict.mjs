import { execSync } from 'child_process';

async function testVertexAiPredict() {
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  const projectId = 'gen-lang-client-0540208645';
  const location = 'us-central1';

  console.log('🚀 Testing Vertex AI prediction endpoint with gcloud token...');
  
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`;
  
  const payload = {
    instances: [
      { prompt: "Cinematic shot of a medical research lab, 4k" }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9"
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log(`Status: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (res.ok) {
    console.log('✅ Vertex AI predict call succeeded!');
    console.log(`Predictions returned: ${data.predictions?.length || 0}`);
  } else {
    console.log('Error details:', JSON.stringify(data, null, 2));
  }
}

testVertexAiPredict().catch(console.error);
