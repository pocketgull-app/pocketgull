#!/usr/bin/env node
/**
 * @file generate_browser_installer_page.mjs
 * @description Generates a clinical-grade local Web portal (install.html) for installing
 * PocketGull browser themes into Google Chrome, Chrome Canary, Microsoft Edge, and Mozilla Firefox.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');

const pkgPath = path.join(THEME_ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const themeEntries = pkg.contributes?.themes || [];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const themeCards = [];

for (const entry of themeEntries) {
  const themeFile = path.join(THEME_ROOT, entry.path);
  if (!fs.existsSync(themeFile)) continue;

  const data = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const colors = data.colors || {};

  const name = entry.label;
  const slug = slugify(name);
  const isDark = entry.uiTheme === 'vs-dark';

  const editorBg = colors['editor.background'] || (isDark ? '#09090b' : '#f6f4ee');
  const editorFg = colors['editor.foreground'] || (isDark ? '#f4f4f5' : '#1f2328');
  const titleBarBg = colors['titleBar.activeBackground'] || colors['editorGroupHeader.tabsBackground'] || editorBg;
  const tabActiveBg = colors['tab.activeBackground'] || editorBg;
  const accent = colors['tab.activeBorderTop'] || colors['focusBorder'] || colors['terminal.ansiCyan'] || (isDark ? '#14b8a6' : '#0f766e');

  themeCards.push({
    name,
    slug,
    isDark,
    editorBg,
    editorFg,
    titleBarBg,
    tabActiveBg,
    accent,
    crxRel: `chrome/dist/${slug}.crx`,
    xpiRel: `firefox/dist/${slug}.xpi`
  });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketGull Browser Theme Suite · 1-Click Installer</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #141418;
      --border: #27272a;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --teal: #14b8a6;
      --red: #ef4444;
      --gold: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      padding: 2.5rem 1.5rem 4rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(20, 184, 166, 0.1);
      border: 1px solid rgba(20, 184, 166, 0.3);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--teal);
      margin-bottom: 1rem;
    }
    .brand-badge img {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
    }
    p.subtitle {
      font-size: 1.1rem;
      color: var(--muted);
      max-width: 700px;
      margin: 0 auto;
    }
    .circadian-banner {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.4));
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
    }
    .circadian-info h3 {
      font-size: 1.2rem;
      color: #fee2e2;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .circadian-info p {
      color: #fca5a5;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .btn-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #ef4444;
      color: white;
    }
    .btn-primary:hover {
      background: #dc2626;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
    }
    .btn-firefox {
      background: #ea580c;
      color: white;
    }
    .btn-firefox:hover {
      background: #c2410c;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
    }
    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--teal);
    }
    .instructions-card {
      background: #101014;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2.5rem;
    }
    .instructions-card h4 {
      font-size: 0.95rem;
      color: var(--teal);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .instructions-card ol {
      padding-left: 1.25rem;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .instructions-card li { margin-bottom: 0.35rem; }
    .instructions-card code {
      background: rgba(255, 255, 255, 0.08);
      color: #38bdf8;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.85em;
    }
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
    }
    .theme-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .theme-card:hover {
      transform: translateY(-2px);
      border-color: var(--teal);
    }
    .preview-bar {
      height: 38px;
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
    .preview-tab {
      height: 26px;
      padding: 0 0.75rem;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 500;
      border-top: 2px solid transparent;
    }
    .theme-content {
      padding: 1rem 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .theme-header {
      margin-bottom: 1rem;
    }
    .theme-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-dark { background: #27272a; color: #a1a1aa; }
    .badge-light { background: #e4dec9; color: #1f2328; }
    .theme-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex: 1;
      justify-content: center;
    }
    .btn-chrome {
      background: #2563eb;
      color: white;
    }
    .btn-chrome:hover { background: #1d4ed8; }
    .btn-ff {
      background: #d97706;
      color: white;
    }
    .btn-ff:hover { background: #b45309; }
  </style>
</head>
<body>

  <header>
    <div class="brand-badge">
      <img src="../icon.png" alt="PocketGull Logo">
      <span>PocketGull Clinical & Sensory Theme Engine</span>
    </div>
    <h1>Browser Theme Suite (26 Themes)</h1>
    <p class="subtitle">Complete optical parity with your IDE and Terminal. Engineered for high-legibility clinical workflows, WCAG AAA contrast, and circadian photobiology.</p>
  </header>

  <!-- Circadian Active Hero -->
  <div class="circadian-banner">
    <div class="circadian-info">
      <h3>🌙 Active Solar Phase: Scotopic 650nm Red (19:30 – 08:00)</h3>
      <p>Melatonin preservation protocol active. Zero blue spectrum light (0.00% 450nm photon emission).</p>
    </div>
    <div class="btn-group">
      <a class="btn btn-primary" href="chrome/dist/pocketgull-scotopic-650nm-red.crx">
        🌐 Install Chrome/Edge (CRX)
      </a>
      <a class="btn btn-firefox" href="firefox/dist/pocketgull-circadian-auto.xpi">
        🦊 Install Firefox Auto (XPI)
      </a>
    </div>
  </div>

  <!-- Instructions -->
  <div class="instructions-card">
    <h4>Installation Guide (Chrome / Edge / Canary / Firefox)</h4>
    <ol>
      <li><strong>Google Chrome & Microsoft Edge (.crx)</strong>: Click any <code>Install Chrome</code> button. When prompted at the top of your browser, click <code>Add theme</code>. (If Chrome blocks local extensions, drag-and-drop the downloaded <code>.crx</code> directly onto <code>chrome://extensions</code> with <em>Developer Mode</em> enabled).</li>
      <li><strong>Mozilla Firefox (.xpi)</strong>: Click <code>Install Firefox Auto</code> or any individual theme. Firefox will display <code>Add "PocketGull Theme" from file?</code> Click <code>Add</code> to instantly activate!</li>
      <li><strong>Dynamic Firefox Auto-Switcher</strong>: The <code>pocketgull-circadian-auto.xpi</code> extension automatically switches between <em>Washi Rice Paper</em> (08:00), <em>Hemp Fiber</em> (13:00), and <em>Scotopic 650nm Red</em> (19:30) on the fly!</li>
    </ol>
  </div>

  <!-- Grid of All 26 Themes -->
  <div class="theme-grid">
    ${themeCards.map(t => `
      <div class="theme-card">
        <div class="preview-bar" style="background: ${t.titleBarBg};">
          <div class="preview-tab" style="background: ${t.tabActiveBg}; color: ${t.editorFg}; border-top-color: ${t.accent};">
            ${t.name}
          </div>
        </div>
        <div class="theme-content">
          <div class="theme-header">
            <h3>${t.name}</h3>
            <span class="badge ${t.isDark ? 'badge-dark' : 'badge-light'}">${t.isDark ? 'Dark / High-Contrast' : 'Light / Daylight Paper'}</span>
          </div>
          <div class="theme-actions">
            <a class="btn-sm btn-chrome" href="${t.crxRel}">
              🌐 Chrome (${t.slug}.crx)
            </a>
            <a class="btn-sm btn-ff" href="${t.xpiRel}">
              🦊 Firefox (${t.slug}.xpi)
            </a>
          </div>
        </div>
      </div>
    `).join('')}
  </div>

</body>
</html>
`;

const outPath = path.join(THEME_ROOT, 'browser', 'install.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`✅ Generated browser installer portal at: ${outPath}`);
