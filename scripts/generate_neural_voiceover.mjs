import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
const audioDir = 'c:\\Users\\philg\\Pocketgull\\pocketgull\\public\\assets\\audio';
fs.mkdirSync(audioDir, { recursive: true });

const scenes = [
  {
    num: 1,
    text: "Every doctor wants to spend more time truly listening to their patients. But too often, busy screens and endless paperwork get in the way."
  },
  {
    num: 2,
    text: "Science is a candle in the dark — lighting the way to better health. Meet Pocket-Gull, where gentle, natural conversation helps doctors and families connect using Google Gemini Live."
  },
  {
    num: 3,
    text: "An interactive three D digital model that helps you explore how your body works. Friendly, clear, and easy for everyone to understand."
  },
  {
    num: 4,
    text: "Journeying inside our cells to discover the tiny engines called mitochondria — keeping our bodies energetic, strong, and thriving."
  },
  {
    num: 5,
    text: "Bringing together whole-body wellness — from healthy daily habits and restful sleep to bright smiles and preventive care."
  },
  {
    num: 6,
    text: "Helping every generation live longer, healthier, and happier lives together. Discover the wonder of science at pocket gull dot app."
  }
];

async function generateVoice(voiceName, langCode, subDir, rate = 0.95) {
  const targetDir = path.join(audioDir, subDir);
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`\n🎙️ Generating Studio Voiceover: ${voiceName} (${subDir})...`);

  for (const s of scenes) {
    const payload = {
      input: { text: s.text },
      voice: { languageCode: langCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate }
    };

    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': 'gen-lang-client-0540208645'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.audioContent) {
      const outPath = path.join(targetDir, `scene${s.num}.mp3`);
      fs.writeFileSync(outPath, Buffer.from(data.audioContent, 'base64'));
      console.log(`  ✓ Generated scene${s.num}.mp3 (${fs.statSync(outPath).size} bytes)`);
    } else {
      console.error(`  ✗ Error generating scene${s.num}:`, data.error?.message || data);
    }
  }
}

async function main() {
  // 1. Google Journey Male (Warm, thoughtful, documentary)
  await generateVoice('en-US-Journey-D', 'en-US', 'journey-male', 0.95, -1.0);
  
  // 2. Google Journey Female (Empathetic, clear, natural)
  await generateVoice('en-US-Journey-F', 'en-US', 'journey-female', 0.95, 0.0);

  // 3. Google Studio Male (Broadcast trailer narrator)
  await generateVoice('en-US-Studio-O', 'en-US', 'studio-male', 0.92, -2.0);

  // 4. Google Neural2 British (BBC Documentary style)
  await generateVoice('en-GB-Neural2-B', 'en-GB', 'british-neural', 0.94, -0.5);

  console.log('\n🎉 All Studio Neural Voiceovers generated successfully!');
}

main().catch(console.error);
