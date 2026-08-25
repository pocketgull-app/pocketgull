// Scripts: WCAG 2.1 AAA/AA Color Contrast Ratio Analyzer for Pocket Gull Themes
import fs from 'fs';

function srgbToLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
}

function getContrastRatio(hex1, hex2) {
  const lum1 = srgbToLuminance(...hexToRgb(hex1));
  const lum2 = srgbToLuminance(...hexToRgb(hex2));
  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);
  return (max + 0.05) / (min + 0.05);
}

const themeColorPairs = [
  { name: 'Light Standard Mode', fg: '#1C1C1C', bg: '#FAFAFA', cardBg: '#FFFFFF', heading: '#0F172A' },
  { name: 'Dark Obsidian Mode', fg: '#F3F4F6', bg: '#111827', cardBg: '#1F2937', heading: '#38BDF8' },
  { name: 'Rice Papercraft (rice)', fg: '#18181B', bg: '#FAF8F0', cardBg: '#FFFFFF', heading: '#047857' },
  { name: 'Hemp Papercraft (hemp)', fg: '#1F1912', bg: '#F5EFE0', cardBg: '#FAF6ED', heading: '#B45309' },
  { name: 'Construction Papercraft (construction)', fg: '#0F172A', bg: '#ECEAE2', cardBg: '#F8F6F0', heading: '#0369A1' },
  { name: 'Classic Papercraft (papercraft)', fg: '#1C1917', bg: '#FDFBF7', cardBg: '#FFFFFF', heading: '#15803D' },
  { name: 'White Marble (white-marble)', fg: '#0F172A', bg: '#FAFAFC', cardBg: '#FFFFFF', heading: '#0369A1' },
  { name: 'Black Marble (black-marble)', fg: '#F8FAFC', bg: '#0B0C10', cardBg: '#13151D', heading: '#38BDF8' },
  { name: 'Papyrus Illuminated (papyrus)', fg: '#F3EAD6', bg: '#13100C', cardBg: '#1C1813', heading: '#F59E0B' },
  { name: 'Spark Ember (spark)', fg: '#FFF7ED', bg: '#0A0503', cardBg: '#170B07', heading: '#F97316' },
  { name: 'Ocean Pool Light (pool-light)', fg: '#0F172A', bg: '#7DD3FC', cardBg: '#FFFFFF', heading: '#0369A1' },
  { name: 'Ocean Pool Dark (pool-dark)', fg: '#F8FAFC', bg: '#081F3D', cardBg: '#0F172A', heading: '#38BDF8' },
  { name: 'Mandala Solfeggio (mandala)', fg: '#F5F3FF', bg: '#16112D', cardBg: '#211A42', heading: '#C084FC' }
];

console.log('=============================================================================');
console.log('  POCKET GULL WCAG 2.1 COLOR CONTRAST ANALYSIS REPORT (ALL 13 THEMES)');
console.log('=============================================================================');

let passCount = 0;
themeColorPairs.forEach(t => {
  const bodyRatio = getContrastRatio(t.fg, t.cardBg);
  const headingRatio = getContrastRatio(t.heading, t.cardBg);
  const passesAAA = bodyRatio >= 7.0 && headingRatio >= 4.5;
  const passesAA = bodyRatio >= 4.5 && headingRatio >= 3.0;

  if (passesAAA) passCount++;

  console.log(`\n🎨 [THEME]: ${t.name}`);
  console.log(`   Body Text (${t.fg} on ${t.cardBg}): ${bodyRatio.toFixed(2)} : 1 -> ${bodyRatio >= 7.0 ? '✅ PASS AAA (>=7:1)' : (bodyRatio >= 4.5 ? '✅ PASS AA (>=4.5:1)' : '❌ FAIL')}`);
  console.log(`   Headings  (${t.heading} on ${t.cardBg}): ${headingRatio.toFixed(2)} : 1 -> ${headingRatio >= 4.5 ? '✅ PASS AAA (>=4.5:1)' : (headingRatio >= 3.0 ? '✅ PASS AA (>=3:1)' : '❌ FAIL')}`);
});

console.log('\n=============================================================================');
console.log(`  SUMMARY: ${passCount} / ${themeColorPairs.length} themes pass strict WCAG 2.1 AAA compliance!`);
console.log('=============================================================================');
