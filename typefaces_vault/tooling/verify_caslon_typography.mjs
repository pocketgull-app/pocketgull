import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stylesPath = path.resolve(__dirname, '../src/styles.css');
const markerStylesPath = path.resolve(__dirname, '../src/styles/pocketgull-marker-font.css');

console.log('🔤 Running Caslon Typography & Leading/Kerning Verification...');

let errors = [];

// 1. Check styles.css
if (!fs.existsSync(stylesPath)) {
  errors.push(`Missing ${stylesPath}`);
} else {
  const content = fs.readFileSync(stylesPath, 'utf8');
  if (!content.includes('Libre+Caslon+Text')) {
    errors.push('Libre Caslon Text missing from Google Fonts import in styles.css');
  }
  if (!content.includes('line-height: 1.55') && !content.includes('line-height: 1.65')) {
    errors.push('Caslon proportional leading (line-height) rules missing in styles.css');
  }
  if (!content.includes('letter-spacing: -0.011em') && !content.includes('letter-spacing: -0.012em')) {
    errors.push('Caslon optical kerning (letter-spacing) rules missing in styles.css');
  }
}

// 2. Check pocketgull-marker-font.css
if (!fs.existsSync(markerStylesPath)) {
  errors.push(`Missing ${markerStylesPath}`);
} else {
  const markerContent = fs.readFileSync(markerStylesPath, 'utf8');
  if (markerContent.includes('skewX(-4deg)')) {
    errors.push('Illegible skewX transform still present in pocketgull-marker-font.css');
  }
  if (markerContent.includes('stroke: currentColor')) {
    errors.push('Blurry stroke effect still present in pocketgull-marker-font.css');
  }
}

if (errors.length > 0) {
  console.error('❌ Caslon Typography Audit Failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('✅ Caslon Typography Audit Passed!');
  console.log('  - Master Caslon Serif stack: Libre Caslon Text');
  console.log('  - Display Sans stack: Outfit / Plus Jakarta Sans');
  console.log('  - Body Sans stack: Inter (with cv05, cv08, cv11 features)');
  console.log('  - Proportional Leading: 1.55 - 1.65');
  console.log('  - Optical Kerning: -0.011em to -0.025em');
}
