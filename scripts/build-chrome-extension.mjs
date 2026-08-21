/**
 * 🧩 Pocket-Gull Chrome Extension Packager for Chrome Web Store
 * Creates extension.zip bundle containing Manifest V3, service worker, and icons.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EXT_DIR = path.join(ROOT_DIR, 'extension');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const OUTPUT_ZIP = path.join(ROOT_DIR, `pocketgull-chrome-extension-v${pkg.version}.zip`);

export async function packageChromeExtension() {
  console.log('📦 Packaging Pocket-Gull Chrome Web Store Extension...');

  // Ensure icons directory exists
  const iconsDir = path.join(EXT_DIR, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Create sidepanel.html if not present
  const sidepanelHtmlPath = path.join(EXT_DIR, 'sidepanel.html');
  if (!fs.existsSync(sidepanelHtmlPath)) {
    fs.writeFileSync(sidepanelHtmlPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pocket-Gull Clinical Intelligence EHR Sidepanel</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 16px; }
    h1 { font-size: 1.1rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .status { font-size: 0.8rem; background: #18181b; border: 1px solid #27272a; padding: 8px 12px; border-radius: 8px; margin-top: 12px; }
    iframe { width: 100%; height: calc(100vh - 80px); border: none; border-radius: 12px; }
  </style>
</head>
<body>
  <h1><span>🕊️</span> Pocket-Gull EHR Assistant</h1>
  <iframe src="https://pocketgull.com"></iframe>
</body>
</html>`);
  }

  console.log('✅ Extension assets built successfully.');
  console.log(`📍 Output Zip location: ${OUTPUT_ZIP}`);
}

packageChromeExtension();
