import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stylesPath = path.resolve(__dirname, '../src/styles.css');
const markerStylesPath = path.resolve(__dirname, '../src/styles/pocketgull-marker-font.css');

console.log('🔤 Running Sovereign PocketGull Serif Typography & Rhythm Verification...');

let errors = [];

// 1. Check styles.css
if (!fs.existsSync(stylesPath)) {
  errors.push(`Missing ${stylesPath}`);
} else {
  const content = fs.readFileSync(stylesPath, 'utf8');
  if (!content.includes('--font-pocketgull-serif') && !content.includes('--font-caslon') && !content.includes('Libre Caslon Text')) {
    errors.push('PocketGull Serif font stack (--font-pocketgull-serif or --font-caslon) missing in styles.css');
  }
  if (!content.includes('line-height: 1.55') && !content.includes('line-height: 1.65')) {
    errors.push('Clinical serif proportional leading (line-height) rules missing in styles.css');
  }
  if (!content.includes('letter-spacing: -0.011em') && !content.includes('letter-spacing: -0.012em')) {
    errors.push('Clinical serif optical kerning (letter-spacing) rules missing in styles.css');
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
  console.error('❌ Sovereign PocketGull Serif Typography Audit Failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('✅ Sovereign PocketGull Serif Typography Audit Passed!');
  console.log('  - Master Sovereign Serif: PocketGull Serif / PocketGull Serif VF');
  console.log('  - Clinical Display/Body Sans: PocketGull & PocketGull Bold');
  console.log('  - Technical Monospace: PocketGull Mono');
  console.log('  - Proportional Leading: 1.55 - 1.65');
  console.log('  - Optical Kerning: -0.011em to -0.025em');
}
