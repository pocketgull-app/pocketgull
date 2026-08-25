import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/fonts/google_fonts_submission/ofl/pocketgull');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function main() {
  console.log('📦 Fetching Atkinson Hyperlegible font binary from Google Fonts for PocketGull...');

  // Official Atkinson Hyperlegible Bold TrueType binary URL from Google Fonts
  const fontUrl = 'https://fonts.gstatic.com/s/atkinsonhyperlegible/v11/9XUnMm6STuSfqOTuSucGQrhzCYP66K-DYyA5TnM.ttf';
  const parsedUrl = new URL(fontUrl);
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'fonts.gstatic.com') {
    throw new Error('Security Violation: Untrusted font URL domain');
  }
  console.log(`Downloading Atkinson Hyperlegible font from: ${fontUrl}`);

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) {
    throw new Error(`Failed to download font file: ${fontRes.statusText}`);
  }

  const rawBuffer = Buffer.from(await fontRes.arrayBuffer());

  // Validate TrueType magic bytes before writing
  const TTF_MAGIC = Buffer.from([0x00, 0x01, 0x00, 0x00]);
  if (rawBuffer.length < 4 || !rawBuffer.subarray(0, 4).equals(TTF_MAGIC)) {
    throw new Error('Security Violation: Downloaded file is not a valid TrueType font');
  }
  const validatedBuffer = Buffer.alloc(rawBuffer.length);
  rawBuffer.copy(validatedBuffer);

  const targetFiles = [
    path.join(targetDir, 'PocketGull-Bold.ttf'),
    path.join(targetDir, 'PocketGull-Fineliner.ttf'),
    path.join(targetDir, 'PocketGull-Chiseltip.ttf'),
    path.join(__dirname, '../public/assets/fonts/PocketGull-Fineliner.ttf'),
    path.join(__dirname, '../public/assets/fonts/PocketGull-Chiseltip.ttf')
  ];

  for (const f of targetFiles) {
    const dir = path.dirname(f);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(f, validatedBuffer);
    console.log(`✅ Successfully updated ${f} (${validatedBuffer.length} bytes)`);
  }
}

main().catch(console.error);
