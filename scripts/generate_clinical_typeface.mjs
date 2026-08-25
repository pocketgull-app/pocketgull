import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve(process.cwd(), 'public/fonts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Generate Metadata Spec JSON
const metadata = {
  fontFamily: 'PocketGull Inter Clinical',
  baseFont: 'Inter',
  variants: ['Regular', 'Bold', 'BionicMarker', 'HighContrastClinical'],
  wcagCompliance: {
    minContrastRatio: 7.0,
    level: 'AAA',
    fontSizeThresholdPx: 18
  },
  supportedLenses: ['Western', 'TCM', 'Ayurvedic', 'Orthomolecular']
};

fs.writeFileSync(
  path.join(outputDir, 'pocketgull_inter_clinical_spec.json'),
  JSON.stringify(metadata, null, 2)
);
console.log('✅ Generated Typeface Spec JSON');

// 2. Generate SVG High-Legibility Specimen Image using Sharp
const svgContent = `
<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fff8f0" stroke="#e07a3c" stroke-width="8"/>
  <text x="50" y="80" font-family="'Inter', sans-serif" font-weight="900" font-size="36" fill="#0f172a">
    PocketGull Inter Clinical Typeface
  </text>
  <text x="50" y="140" font-family="'Inter', sans-serif" font-weight="700" font-size="22" fill="#ea580c">
    Inter-Based High-Contrast Clinical Legibility (WCAG 2.1 AAA)
  </text>
  <text x="50" y="210" font-family="'Inter', sans-serif" font-weight="500" font-size="28" fill="#1e293b">
    Aa Bb Cc Dd Ee Ff Gg 1234567890 Ññ Éé Üü
  </text>
  <text x="50" y="290" font-family="'Permanent Marker', cursive" font-size="30" fill="#2563eb">
    ⚡ Bionic Marker Fixation Accentuation &amp; Inter Hybrid
  </text>
</svg>
`;

const pngPath = path.join(outputDir, 'pocketgull_typeface_specimen.png');
sharp(Buffer.from(svgContent))
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log(`✅ Generated Typeface Specimen Banner via Sharp: ${pngPath}`);
  })
  .catch(err => {
    console.error('Error generating image via Sharp:', err);
  });
