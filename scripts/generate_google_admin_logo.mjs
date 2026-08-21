import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public', 'images');

async function generateLogos() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 132 }, deviceScaleFactor: 1 });

  const svgWordmarkPath = path.join(publicDir, 'pocketgull_wordmark_logo.svg');
  const svgWordmark = fs.readFileSync(svgWordmarkPath, 'utf8');

  // 1. Standard Light Theme (Dark Slate Wordmark for standard Google White headers)
  const htmlLight = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 320px;
    height: 132px;
    background: transparent;
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
    gap: 12px;
  }
  .icon {
    width: 58px;
    height: 58px;
    flex-shrink: 0;
  }
  .wordmark-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .wordmark-svg {
    width: 210px;
    height: auto;
    color: #1e293b;
  }
  .tagline {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #0d9488;
    margin-top: 3px;
    font-family: monospace;
  }
</style>
</head>
<body>
  <div class="container">
    <svg class="icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="#0d9488" fill-opacity="0.15" stroke="#0d9488" stroke-width="3"/>
      <path d="M50 15 L50 85 L75 50 Z" fill="#0d9488" fill-opacity="0.3"/>
      <path d="M15 50 L50 15 L50 50 Z" fill="#6366f1" fill-opacity="0.4"/>
      <path d="M50 50 L85 50 L50 85 Z" fill="#0d9488" fill-opacity="0.8"/>
      <circle cx="50" cy="50" r="4" fill="#0d9488"/>
    </svg>
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

  await page.setContent(htmlLight);
  const outLight = path.join(publicDir, 'google_admin_logo_320x132.png');
  await page.screenshot({ path: outLight, omitBackground: true });

  // 2. White Wordmark Theme (for dark Google Workspace themes)
  const htmlDark = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 320px;
    height: 132px;
    background: transparent;
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
    gap: 12px;
  }
  .icon {
    width: 58px;
    height: 58px;
    flex-shrink: 0;
  }
  .wordmark-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .wordmark-svg {
    width: 210px;
    height: auto;
    color: #f8fafc;
  }
  .tagline {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #2dd4bf;
    margin-top: 3px;
    font-family: monospace;
  }
</style>
</head>
<body>
  <div class="container">
    <svg class="icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="#2dd4bf" fill-opacity="0.25" stroke="#2dd4bf" stroke-width="3"/>
      <path d="M50 15 L50 85 L75 50 Z" fill="#2dd4bf" fill-opacity="0.4"/>
      <path d="M15 50 L50 15 L50 50 Z" fill="#818cf8" fill-opacity="0.5"/>
      <path d="M50 50 L85 50 L50 85 Z" fill="#2dd4bf" fill-opacity="0.9"/>
      <circle cx="50" cy="50" r="4" fill="#2dd4bf"/>
    </svg>
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

  await page.setContent(htmlDark);
  const outDark = path.join(publicDir, 'google_admin_logo_white_320x132.png');
  await page.screenshot({ path: outDark, omitBackground: true });

  console.log(`[SUCCESS] Generated Google Admin Logo (Standard): ${outLight} (${(fs.statSync(outLight).size / 1024).toFixed(2)} KB)`);
  console.log(`[SUCCESS] Generated Google Admin Logo (White/Dark Theme): ${outDark} (${(fs.statSync(outDark).size / 1024).toFixed(2)} KB)`);

  await browser.close();
}

generateLogos().catch(console.error);
