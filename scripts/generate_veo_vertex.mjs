#!/usr/bin/env node
/**
 * Pocket-Gull: Pure Node.js Google Vertex AI Veo Video Generation Pipeline
 * Build with Gemini + XPRIZE Hackathon Video Renderer
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCENES = {
  1: {
    name: "Scene 1: Voice Awakening (Gemini Live Consult)",
    prompt: "Cinematic high-end medical commercial shot, 35mm anamorphic lens, f/1.8. A doctor and patient having a warm, natural conversation in a sunlit Scandinavian clinic. Between them, a delicate, glowing golden-teal audio frequency waveform floats organically in mid-air, pulsing smoothly to their speech. Orbital camera rotation, soft volumetric rim lighting, photorealistic, 8k resolution, 24fps.",
    image: "public/assets/veo-frames/scene2_gemini_live.jpg",
    output: "scene1_gemini_live.mp4"
  },
  2: {
    name: "Scene 2: 3D Biophysical Digital Twin",
    prompt: "Close-up macro cinematic shot of a sleek glass tablet displaying an ultra-detailed 3D holographic human anatomical skeleton with glowing vascular pathways and neural networks. A physician's finger smoothly touches the holographic spine, triggering a radiant emerald and amber biophysical heat map. Depth of field focus pull, high-tech titanium studio lighting, octane render aesthetic, hyper-realistic, 4k.",
    image: "public/assets/veo-frames/scene3_biophysical_twin.jpg",
    output: "scene2_biophysical_twin.mp4"
  },
  3: {
    name: "Scene 3: Microscopic 3D Organelles & Mitochondria",
    prompt: "Microscopic cinematic dive inside a living human cell. Bioluminescent mitochondria with glowing golden inner cristae membranes and endoplasmic reticulum floating in deep violet-teal cellular fluid. SBF-SEM electron microscopy 3D mesh reconstruction, volumetric light rays, scientific visualization, national geographic documentary quality, photorealistic 4k.",
    image: "public/assets/veo-frames/scene4_organelle_mitochondria.jpg",
    output: "scene3_organelles.mp4"
  },
  4: {
    name: "Scene 4: The XPRIZE Healthspan Horizon",
    prompt: "Wide cinematic shot at golden hour sunrise. An active, healthy 40-year-old woman smiles confidently as she walks along a modern coastal promenade overlooking the ocean. Soft golden sun flares, gentle ocean breeze. High-end lifestyle commercial, Arri Alexa, master anamorphic lens, warm hopeful color grade, 4k 24fps.",
    image: "public/assets/veo-frames/scene6_xprize_healthspan.jpg",
    output: "scene4_xprize_healthspan.mp4"
  }
};

async function main() {
  const args = process.argv.slice(2);
  const sceneNum = parseInt(args[0] || '1', 10);
  const selected = SCENES[sceneNum] || SCENES[1];

  console.log(`🎬 [POCKET-GULL VEO] Initializing Vertex AI Video Generation Pipeline...`);
  console.log(`  • Selected Scene: ${selected.name}`);
  console.log(`  • Model: Google Veo / Gemini Omni Flash`);
  console.log(`  • Output File: public/assets/veo-videos/${selected.output}`);

  // Obtain active gcloud OAuth token
  let token = '';
  try {
    token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
    console.log('✅ Obtained active gcloud OAuth token.');
  } catch (e) {
    console.error('❌ Failed to obtain gcloud access token. Ensure gcloud is authenticated.');
    process.exit(1);
  }

  const projectId = 'gen-lang-client-0540208645';
  const location = 'us-central1';

  const outputDir = path.resolve(__dirname, '../public/assets/veo-videos');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n🚀 [Submitting Job to Vertex AI Video Generation Endpoint]...`);
  console.log(`Prompt: "${selected.prompt}"`);

  // Vertex AI REST call for Veo video generation
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;
  
  const payload = {
    instances: [
      {
        prompt: selected.prompt
      }
    ],
    parameters: {
      aspectRatio: "16:9",
      durationSeconds: 5,
      sampleCount: 1
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📡 Vertex AI Response Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    
    if (res.ok) {
      console.log('🎉 [Job Submitted] Operation Name:', data.name);
      console.log('Polling operation for video render completion...');
    } else {
      console.log('ℹ️ [Vertex AI Notice]:', data.error?.message || JSON.stringify(data));
      console.log('\n💡 [Alternative]: You can also generate in 1 click in Google AI Studio or use the live 60 FPS Canvas Video Engine at https://pocketgull.app/video-showcase.html');
    }
  } catch (err) {
    console.error('❌ Network error communicating with Vertex AI:', err.message);
  }
}

main().catch(console.error);
