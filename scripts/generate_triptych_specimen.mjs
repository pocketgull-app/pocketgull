import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve(process.cwd(), 'public/images/specimens');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 🎨 Triptych Artwork Specimen SVG (1800x600 px - 3 Panels: Clinical | Papercraft | Dieter Rams Minimalist)
const triptychSvg = `
<svg width="1800" height="600" viewBox="0 0 1800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer Dark Frame -->
  <rect width="100%" height="100%" fill="#09090b"/>
  
  <!-- Panel 1: Left — Clinical High-Contrast Inter (Dark ICU Mode) -->
  <g transform="translate(30, 30)">
    <rect width="550" height="540" rx="24" fill="#0f172a" stroke="#334155" stroke-width="4"/>
    <rect x="30" y="30" width="160" height="28" rx="14" fill="#2563eb"/>
    <text x="45" y="49" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="2">
      PANEL I: CLINICAL AAA
    </text>

    <!-- Medical EHR & Lab Readout Text -->
    <text x="30" y="110" font-family="'Inter', sans-serif" font-weight="900" font-size="32" fill="#f8fafc">
      PocketGull Inter Clinical
    </text>
    <text x="30" y="150" font-family="'Inter', sans-serif" font-weight="600" font-size="18" fill="#38bdf8">
      Slashed Zero &amp; High-Contrast Disambiguation
    </text>

    <!-- Lab Values Grid -->
    <g transform="translate(30, 200)" font-family="'Fira Code', monospace" font-size="20" fill="#e2e8f0">
      <text x="0" y="0">HbA1c: 5.4%  ±0.1</text>
      <text x="0" y="45">Glucose: 98 mg/dL</text>
      <text x="0" y="90">SpO2: 99%  (ICU Monitor 01)</text>
      <text x="0" y="135">Dosage: ½ Tab q12h (250mg)</text>
      <text x="0" y="180">Stage: III  [Cranial Nerve V]</text>
      <text x="0" y="225">Diacritics: ñ é ü æ ç å α β Ω Б</text>
    </g>
  </g>

  <!-- Panel 2: Center — Handcrafted Felt-Tip Marker & GearArts Warm Sunlight -->
  <g transform="translate(625, 30)">
    <radialGradient id="panelSunlight" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fba668"/>
      <stop offset="100%" stop-color="#f48242"/>
    </radialGradient>
    <rect width="550" height="540" rx="24" fill="url(#panelSunlight)" stroke="#e07a3c" stroke-width="6"/>
    <rect x="30" y="30" width="180" height="28" rx="14" fill="#ea580c"/>
    <text x="45" y="49" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="2">
      PANEL II: MARKER BRAND
    </text>

    <!-- Master SVG Wordmark Geometry -->
    <g transform="translate(30, 110) scale(1.75)">
      <path fill="#1c1917" d="M196.15,49.52l-9.6-.21.09-8.54,15.88-.29c.65-.01,2.52.43,2.52.95v2.81c.06,10.75-.26,30.08-8.37,32.91-6.32,2.21-14.76,2.19-20.36-2.27-4.48-3.58-6.6-10.34-6.93-15.95-.79-13.46-.64-26.4.95-39.66.74-6.14,3.43-12.02,8.95-15.03,6.72-3.67,15.91-2.63,21.43,2.87,3,2.99,3.5,8.2,3.78,11.85l-10.09,1.57c-.49-2.94-.73-5.14-2.04-7.49-.95-1.71-4.87-1.76-6.91-1.01-1.76.64-3.57,3.21-4.1,5.77-2.86,13.79-3.4,32.74-.03,46.06.86,3.39,3.85,5.11,6.77,5.1s6.51-1.43,6.82-5.01l1.25-14.45Z"/>
      <path fill="#1c1917" d="M12.38,78.22l-10.64.54c-1.03.05-1.07-2-1.06-3.25l.07-23.9L0,4.29l15.98-1.9c5.21-.62,11.35-.07,15.69,2.7,7,4.48,7.96,12.52,7.21,20.09-.74,7.47-4.74,12.96-12.61,14.38-4.56.83-9.87.84-14.7.78l.8,37.87ZM23.39,11.92l-12.54-.24.41,20.69,7.03-.13c3.04-.06,6.15-.86,8.02-2.88,4.52-4.89,2.17-17.35-2.92-17.44Z"/>
      <path fill="#1c1917" d="M110.9,77.72l-10.89-22.1.23,21.94-10.23.2c1.2-11.34.86-22.07.66-33.6l-.37-21.01-.66-15.25,10.05-2.58.26,36.25,9.93-12.58c3.18-.34,6.17-.35,10.48.16l-14.67,17.43,14.45,27.49,1.32,3.22-10.55.45Z"/>
      <path fill="#1c1917" d="M209.14,68.45l-.62-9.64-.28-25.1,9.45.07c-.74,10.56-2.46,33.12,2.21,35.68.89.49,3.22-.23,4.06-1.04,2.01-1.93,1.69-4.65,1.66-7.21l-.34-26.95c2.7-1.2,6.69-1.43,9.42-.8l-.2,14.39c-.14,9.8-1.9,19.41,1.24,28.88l-8.96,1.66-1.14-3.74c-3.03,2.87-7.61,4.39-11.71,2.31-2.79-1.41-4.57-5.15-4.79-8.52Z"/>
      <path fill="#1c1917" d="M136.06,68.26l1.5-3.94,8.11.83c.29,7.61-5.49,12.79-12.7,12.71-7.57-.08-13.14-4.93-13.65-12.68-1.02-15.73-2.46-32.08,13.55-33.07,5.14-.32,8.88,1.69,10.89,6.61,1.88,4.62,2.14,9.73,1.89,15.27l-18.07,2.83,2.58,10.97c.18.77,1.74,2,2.5,2.24.91.29,3.05-.85,3.4-1.75ZM137.29,49.42c-.39-2.78-1.04-7.03-3.11-9.44-1.72-2.01-5.92.14-6.09,2.41l-.64,8.53,9.84-1.49Z"/>
      <path fill="#1c1917" d="M167.9,76.56c-4.86,2.52-10.67,2.85-14.93-.96-1.62-1.45-2.68-5.72-2.68-8.18l-.04-33.05-5.57-.06-.21-7.02,6.06-.34.03-8.96,9.01-3.01-.32,11.99,6.69-.41.43,7.48-7.42.35.42,31.56c.35,1.09.92,3.51,1.84,3.65s2.48-.19,4.47-.51c1.14,1.21,1.94,4.49,2.22,7.46Z"/>
      <path fill="#1c1917" d="M262.72,79.03l-10.71-.18,1.24-49.69-.96-25.67,10.3-3.49c-1.07,18.26-2.37,35.25-1.41,53.12l.72,13.46.83,12.46Z"/>
      <path fill="#1c1917" d="M78.98,66.4c1.62-1.64,5.91-2.22,8.6-1.68.84,4.2-.29,9.24-3.91,11.88-5.74,4.19-14.46,3.12-19.23-2.21s-4.39-22.04-2.41-30.79c1.34-5.9,6.57-9.44,12.38-9.91,6.97-.56,13.05,3.67,13.24,10.98-2.66.96-5.58,1.47-8.35,1.55-.43-2.7-2.07-5.29-4.14-5.73-1.37-.29-3.94,1.95-4.15,3.21-1.72,10.36-2.02,28.87,4.53,27.82,2.26-.36,3.01-1.97,3.43-5.12Z"/>
      <path fill="#1c1917" d="M238.5,77.9l.09-21.45c.05-12.68.74-25.05-.13-37.74l-.8-11.63,10.22-3.36-.79,42.99,1.33,31.43-9.91-.23Z"/>
      <path fill="#1c1917" d="M54.12,75.97c-6.6,4.26-15.26,4.46-20.85-1.24-3.03-3.08-3.9-8.37-3.87-12.56l.09-10.61c.03-3.51.48-7.91,2.63-10.83,5.31-7.19,16.34-8.1,22.67-1.75,2.67,2.68,3.25,7.47,3.31,11.07l.18,11.45c.08,5.18-1.17,9.8-4.16,14.47ZM47.98,45.94c-.34-1.88-2.32-3.67-3.91-3.78-1.23-.08-4.03,1.33-4.22,2.61l-1.11,7.48c-1.09,7.37-.75,18.69,4.67,19.92,6.69,1.52,6.41-15.94,4.58-26.23Z"/>
    </g>

    <text x="30" y="320" font-family="'Inter', sans-serif" font-weight="800" font-size="22" fill="#1c1917">
      Handcrafted Felt-Tip Marker
    </text>
    <text x="30" y="360" font-family="'Inter', sans-serif" font-weight="600" font-size="16" fill="#7c2d12">
      GearArts Papercraft Sunlight Theme
    </text>
    
    <!-- Origami Seagull Overlay -->
    <g transform="translate(350, 320) scale(1.6)">
      <polygon points="10,40 50,50 60,75 35,75" fill="rgba(255,255,255,0.4)" stroke="#1c1917" stroke-width="3"/>
      <polygon points="50,50 55,25 68,20 80,50" fill="#ffffff" stroke="#1c1917" stroke-width="3"/>
      <polygon points="68,20 90,22 92,30 75,38" fill="#ea580c" stroke="#1c1917" stroke-width="2"/>
    </g>
  </g>

  <!-- Panel 3: Right — Minimalist Grid ("Weniger, aber besser") -->
  <g transform="translate(1220, 30)">
    <rect width="550" height="540" rx="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
    <rect x="30" y="30" width="220" height="28" rx="14" fill="#475569"/>
    <text x="45" y="49" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="2">
      PANEL III: MINIMAL GRID
    </text>

    <text x="30" y="110" font-family="'Inter', sans-serif" font-weight="900" font-size="30" fill="#0f172a">
      "Weniger, aber besser"
    </text>
    <text x="30" y="150" font-family="'Inter', sans-serif" font-weight="600" font-size="16" fill="#64748b">
      10 Principles of Good Design
    </text>

    <!-- Grid List of 10 Principles -->
    <g transform="translate(30, 200)" font-family="'Inter', sans-serif" font-size="14" fill="#334155" font-weight="600">
      <text x="0" y="0">1. Innovative</text>
      <text x="250" y="0">6. Honest</text>
      <text x="0" y="45">2. Useful</text>
      <text x="250" y="45">7. Long-lasting</text>
      <text x="0" y="90">3. Aesthetic</text>
      <text x="250" y="90">8. Thorough</text>
      <text x="0" y="135">4. Understandable</text>
      <text x="250" y="135">9. Eco-friendly</text>
      <text x="0" y="180">5. Unobtrusive</text>
      <text x="250" y="180">10. Less, but better</text>
    </g>

    <!-- Minimalist Monoline Icons Row -->
    <g transform="translate(30, 440)">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#0f172a" stroke-width="3"/>
      <path d="M60 5 L80 15 V30 C80 40 60 48 60 48 C60 48 40 40 40 30 V15 Z" fill="none" stroke="#0f172a" stroke-width="3"/>
      <rect x="110" y="10" width="30" height="20" rx="10" fill="none" stroke="#0f172a" stroke-width="3"/>
      <line x1="125" y1="10" x2="125" y2="30" stroke="#0f172a" stroke-width="3"/>
    </g>
  </g>
</svg>
`;

const imgPath = path.join(outputDir, 'triptych_pocketgull_specimen.png');
sharp(Buffer.from(triptychSvg))
  .png()
  .toFile(imgPath)
  .then(() => {
    console.log(`✅ Generated Triptych Artwork Specimen PNG: ${imgPath}`);
  })
  .catch(err => {
    console.error('Error generating Triptych artwork image via Sharp:', err);
  });
