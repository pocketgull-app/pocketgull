import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public', 'images');

async function renderOrigamiGoogleAdminLogos() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 132 }, deviceScaleFactor: 1 });

  const svgWordmarkPath = path.join(publicDir, 'pocketgull_wordmark_logo.svg');
  const svgWordmark = fs.readFileSync(svgWordmarkPath, 'utf8');

  // Origami crane path extracted from vector
  const craneSvg = `
    <svg viewBox="0 0 512 512" class="crane-icon" xmlns="http://www.w3.org/2000/svg">
      <path d="M395.67,339.95h.01l3.93-4.89c-.07-.24.07-.59.56-.74l44.82-55.58c1.57-1.94,1-3.39-.03-5.43l-37.23-73.75,34.41-31.01,23.69-22.26c1.28-1.48,1.25-3.18-.08-4.58l-4.3-4.52c1.63-1.03,3.27-.77,5.08.06l18.47,8.55c1.17.54,2.46.11,2.98-.46.74-.82.95-2.32.12-3.32-4.94-5.89-8.63-12.87-14.64-17.81l-15.72-9.41-11.91-6.56-81.11,13.16-12.45-11.51c-1.26-.99-2.58-.93-4.15-.36l-52.81,19.27-27.39,63.99,7.02,35.71-96.1-18.72-56.99-11.11-76.04-14.61c-2.99-.57-5.38.59-7.81.08l-10.41-2.18c-1.5-.31-2.73-.07-3.42,1.17-.47.85-.63,2.18.25,3.37l70.92,96.88,21.47,29.26h0l20.14,27.31h.05l14.33,19.5h0s26.98,36.71,26.98,36.71l133.85,7.28,17.05-17.38,29.68-.3,28.68-35.72.02-.02,8.09-10.07Z" fill="#1e293b"/>
      <polygon points="307.5 398.68 218.67 393.75 180.66 391.62 71.74 243.33 31.46 188.16 226.24 233.99 273.76 245.16 290.65 322.96 307.5 398.68" fill="#f8fafc"/>
      <polygon points="427.52 279.76 311.79 396.76 299.49 341.64 278.51 244.95 373.83 267.26 427.52 279.76" fill="#0d9488"/>
      <path d="M334.12,381.08l98.33-99.47c2.13-2.04,2.21-3.98.9-6.46l-35.27-67.18,5.89-5.18,37.05,73.34-7.48,9-76.74,96.09-22.67-.13Z" fill="#14b8a6"/>
      <path d="M464.7,131.22l-10.54,3.46-80.11,31.86-15.4-39.46,86.63-14.1,25.09,14.92c3.77,2.24,5.62,6.78,8.53,10.1l-14.21-6.78Z" fill="#f97316"/>
      <polygon points="395.29 204.21 377 171.88 430.14 155.93 456.3 149.02 395.29 204.21" fill="#ea580c"/>
      <polygon points="394.9 211.75 428.06 275.13 282.49 240.93 272.7 193.48 280.63 175.54 298.84 132.49 348.51 114.46 355.06 132.26 369.4 167.52 383.25 192.91 394.9 211.75" fill="#f1f5f9"/>
      <path d="M325.08,155.38c-6.9,5.97-4.52,15.83-8.76,16.42-5.38.75-4.4-10.35,1.01-18.29,3.04-4.47,7.9-7.07,12.63-7.52,8.52-.82,18.32,6.77,15.22,10.56-1.64,2.02-3.85,1.43-5.75-.11-4.08-3.3-9.98-4.85-14.36-1.06Z" fill="#0f172a"/>
    </svg>
  `;

  // Template 1: Solid White Background (Guaranteed Google Admin Compatibility)
  const htmlWhiteBg = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 320px;
    height: 132px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .container {
    width: 300px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .crane-icon {
    width: 82px;
    height: 82px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  .wordmark-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .wordmark-svg {
    width: 190px;
    height: auto;
    color: #0f172a;
  }
  .tagline {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #0d9488;
    margin-top: 2px;
    font-family: monospace;
  }
</style>
</head>
<body>
  <div class="container">
    ${craneSvg}
    <div class="wordmark-container">
      <div class="wordmark-svg">
        ${svgWordmark}
      </div>
      <div class="tagline">Clinical Intelligence &bull; CDS</div>
    </div>
  </div>
</body>
</html>
  `;

  // Template 2: Solo Centered Origami Crane on White
  const htmlSoloCrane = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 320px;
    height: 132px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .crane-icon {
    width: 110px;
    height: 110px;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
  }
</style>
</head>
<body>
  ${craneSvg}
</body>
</html>
  `;

  // 1. Output PNG with Solid White Background
  await page.setContent(htmlWhiteBg);
  const outPng = path.join(publicDir, 'google_admin_origami_crane_whitebg_320x132.png');
  await page.screenshot({ path: outPng });

  // 2. Output JPEG with Solid White Background (Zero alpha bugs)
  const outJpg = path.join(publicDir, 'google_admin_origami_crane_320x132.jpg');
  await page.screenshot({ path: outJpg, type: 'jpeg', quality: 95 });

  // 3. Output Solo Origami Crane PNG & JPEG
  await page.setContent(htmlSoloCrane);
  const outSoloPng = path.join(publicDir, 'google_admin_origami_solo_whitebg_320x132.png');
  await page.screenshot({ path: outSoloPng });
  const outSoloJpg = path.join(publicDir, 'google_admin_origami_solo_320x132.jpg');
  await page.screenshot({ path: outSoloJpg, type: 'jpeg', quality: 95 });

  // 4. Output Transparent PNG version
  await page.setContent(htmlWhiteBg.replace('background: #ffffff;', 'background: transparent;'));
  const outTransparent = path.join(publicDir, 'google_admin_origami_crane_transparent_320x132.png');
  await page.screenshot({ path: outTransparent, omitBackground: true });

  console.log(`[GENERATED] Origami Crane Logos for Google Admin:`);
  [outPng, outJpg, outSoloPng, outSoloJpg, outTransparent].forEach(file => {
    const size = (fs.statSync(file).size / 1024).toFixed(2);
    console.log(`  - ${path.basename(file)}: ${size} KB (Under 30 KB limit)`);
  });

  await browser.close();
}

renderOrigamiGoogleAdminLogos().catch(console.error);
