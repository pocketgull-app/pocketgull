import fs from 'fs';
import path from 'path';
import { generate, correction } from 'lean-qr';

const imgPath = path.resolve('public/images/gull_squadron_railing.jpg');
const brandSvgPath = path.resolve('public/images/pocketgull_wordmark_brand.svg');

const imgBuffer = fs.readFileSync(imgPath);
const imgBase64 = imgBuffer.toString('base64');
const brandmarkSvg = fs.readFileSync(brandSvgPath, 'utf8');

// Strip root <svg> tags to embed inner contents and set brandmark text color to yellow
const innerBrand = brandmarkSvg
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>/, '')
  .replace(/id="pocketgull-wordmark" transform="translate\(142, 6\)" fill="#0f172a"/, 'id="pocketgull-wordmark" transform="translate(142, 6)" fill="#facc15"');

/**
 * Generates an SVG group containing a branded QR code for a given URL and label.
 */
function generateQrSvgGroup(url, label, subtitle, x, y, size = 160) {
  const code = generate(url, { minCorrectionLevel: correction.M });
  const matrixSize = code.size;
  const padding = 2;
  const totalGrid = matrixSize + padding * 2;
  const moduleSize = (size - 32) / totalGrid;
  const startX = 16 + padding * moduleSize;
  const startY = 16 + padding * moduleSize;

  let modulesSvg = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (code.get(c, r)) {
        const mx = (startX + c * moduleSize).toFixed(2);
        const my = (startY + r * moduleSize).toFixed(2);
        const mw = (moduleSize * 0.92).toFixed(2);
        const rx = (moduleSize * 0.25).toFixed(2);
        modulesSvg += `<rect x="${mx}" y="${my}" width="${mw}" height="${mw}" rx="${rx}" fill="#09090b" />`;
      }
    }
  }

  const containerW = size + 4;
  const containerH = size + 48;

  return `
    <g transform="translate(${x}, ${y})" filter="url(#brand-drop-shadow)">
      <!-- Backing Frosted Container -->
      <rect x="0" y="0" width="${containerW}" height="${containerH}" rx="18" fill="#09090b" fill-opacity="0.82" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.5" />
      
      <!-- White QR substrate pad for 100% optical camera readability -->
      <rect x="8" y="8" width="${size - 12}" height="${size - 12}" rx="12" fill="#ffffff" />
      
      <!-- QR Data Matrix Modules -->
      <g transform="translate(-4, -4)">
        ${modulesSvg}
      </g>

      <!-- Label and URL text -->
      <text x="${containerW / 2}" y="${size + 18}" text-anchor="middle" fill="#facc15" font-family="'JetBrains Mono', 'Segoe UI', sans-serif" font-size="11" font-weight="800" letter-spacing="1">${label}</text>
      <text x="${containerW / 2}" y="${size + 34}" text-anchor="middle" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" letter-spacing="0.5">${subtitle}</text>
    </g>
  `;
}

// QR Code 1: Website (pocketgull.com)
const qrWebsiteSvg = generateQrSvgGroup(
  'https://pocketgull.com',
  'POCKETGULL.COM',
  'Research & Commons',
  1370,
  46,
  152
);

// QR Code 2: Web App (pocketgull.app)
const qrAppSvg = generateQrSvgGroup(
  'https://pocketgull.app',
  'POCKETGULL.APP',
  'Live Clinical Consult',
  1560,
  46,
  152
);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1024" width="1792" height="1024">
  <defs>
    <filter id="brand-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <linearGradient id="scrim-top" x1="0%" y1="0%" x2="0%" y2="100%">
      <feStop offset="0%" stop-color="#09090b" stop-opacity="0.80"/>
      <feStop offset="45%" stop-color="#09090b" stop-opacity="0.30"/>
      <feStop offset="100%" stop-color="#09090b" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Photographic Background with Opacity -->
  <image href="data:image/jpeg;base64,${imgBase64}" x="0" y="0" width="1792" height="1024" opacity="0.88" />

  <!-- Subtle Top Atmospheric Gradient Scrim -->
  <rect x="0" y="0" width="1792" height="340" fill="url(#scrim-top)" />

  <!-- Official PocketGull Mascot Icon, Wordmark (Yellow) & Clinical CDS Subtitle -->
  <g transform="translate(64, 52) scale(1.65)" filter="url(#brand-drop-shadow)">
    <!-- Backing pill plate for maximum optical contrast against facade -->
    <rect x="-16" y="-12" width="445" height="128" rx="20" fill="#09090b" fill-opacity="0.75" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4" />
    <g transform="translate(0, 0)">
      ${innerBrand}
    </g>
  </g>

  <!-- High-Readability Vector QR Badges: Website & App -->
  ${qrWebsiteSvg}
  ${qrAppSvg}
</svg>`;

fs.writeFileSync('public/images/gull_squadron_brand_banner.svg', svgContent, 'utf8');
fs.writeFileSync('docs/images/gull_squadron_brand_banner.svg', svgContent, 'utf8');
console.log('Created gull_squadron_brand_banner.svg with website & app QR codes successfully');
