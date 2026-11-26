// SPDX-License-Identifier: Apache-2.0
/**
 * PocketGull v4.0.0 Sovereign Font CSS Sync
 * Uses @pocketgull/font (npm) and https://font.pocketgull.app CDN-first WOFF2s.
 * Enforces Rule §7: Body 400 weight strictly maps to PocketGull-Regular (NEVER Fineliner/Chiseltip).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.resolve(__dirname, '../public/fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const POCKETGULL_SUPERFAMILY_CSS = `/* ==========================================================================
   PocketGull v4.0.0 Sovereign Superfamily (npm @pocketgull/font + CDN WOFF2)
   Rule §7 Compliant: Zero .ttf in web CSS; Regular maps to 400; Brand isolated.
   ========================================================================== */

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGull-Regular.woff2?v=4.0.0') format('woff2');
}

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGull-Bold.woff2?v=4.0.0') format('woff2');
}

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGull-Black.woff2?v=4.0.0') format('woff2');
}

@font-face {
  font-family: 'PocketGull Brand';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGull-Chiseltip.woff2?v=4.0.0') format('woff2');
}

@font-face {
  font-family: 'PocketGull Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://font.pocketgull.app/fonts/woff2/PocketGullMono-Regular.woff2?v=4.0.0') format('woff2');
}
`;

const cssPath = path.resolve(fontsDir, 'fonts.css');
if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(cssPath, POCKETGULL_SUPERFAMILY_CSS, 'utf8');
  console.log('✅ Wrote Rule §7-compliant v4.0.0 CDN WOFF2 fonts.css.');
} else {
  console.log('✅ Existing public/fonts/fonts.css preserved (core cuts served from @pocketgull/font@4.0.0 npm).');
}
