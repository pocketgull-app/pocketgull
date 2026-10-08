#!/usr/bin/env node
/**
 * @file generate_browser_themes.mjs
 * @description Extracts colors from all 26 PocketGull IDE themes and procedurally generates:
 * 1. 26 Google Chrome / Chromium / Edge / Brave Manifest V3 Themes
 * 2. 26 Mozilla Firefox WebExtension Themes
 * 3. 1 Dynamic Firefox Circadian Auto-Switching Extension (08:00 Washi, 13:00 Hemp, 19:30 Scotopic)
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

const chromeBaseDir = path.join(THEME_ROOT, 'browser', 'chrome');
const firefoxBaseDir = path.join(THEME_ROOT, 'browser', 'firefox');

fs.mkdirSync(chromeBaseDir, { recursive: true });
fs.mkdirSync(firefoxBaseDir, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function hexToRgb(hex, fallback = [24, 24, 27]) {
  if (!hex || typeof hex !== 'string') return fallback;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length < 6) return fallback;
  const num = parseInt(c.slice(0, 6), 16);
  if (Number.isNaN(num)) return fallback;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

console.log(`🌐 Generating Browser Themes across ${themeEntries.length} PocketGull Themes...`);

const generatedThemes = [];

for (const entry of themeEntries) {
  const themeFile = path.join(THEME_ROOT, entry.path);
  if (!fs.existsSync(themeFile)) continue;

  const data = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const colors = data.colors || {};

  const name = entry.label;
  const slug = slugify(name);

  const isDark = entry.uiTheme === 'vs-dark';

  // Base Tokens
  const editorBg = colors['editor.background'] || (isDark ? '#09090b' : '#f6f4ee');
  const editorFg = colors['editor.foreground'] || (isDark ? '#f4f4f5' : '#1f2328');
  const titleBarBg = colors['titleBar.activeBackground'] || colors['editorGroupHeader.tabsBackground'] || editorBg;
  const titleBarInactiveBg = colors['titleBar.inactiveBackground'] || titleBarBg;
  const tabActiveBg = colors['tab.activeBackground'] || editorBg;
  const tabActiveFg = colors['tab.activeForeground'] || editorFg;
  const tabInactiveFg = colors['tab.inactiveForeground'] || (isDark ? '#a1a1aa' : '#57606a');
  const accent = colors['tab.activeBorderTop'] || colors['focusBorder'] || colors['terminal.ansiCyan'] || (isDark ? '#14b8a6' : '#0f766e');
  const border = colors['tab.border'] || colors['sideBar.border'] || (isDark ? '#27272a' : '#e4dec9');

  // 1. Google Chrome Manifest V3 Theme
  const chromeThemeDir = path.join(chromeBaseDir, slug);
  fs.mkdirSync(chromeThemeDir, { recursive: true });

  // Copy icons
  const icon128Src = path.join(THEME_ROOT, '..', '..', 'public', 'icons', 'icon-128x128.png');
  const icon512Src = path.join(THEME_ROOT, 'icon.png');
  if (fs.existsSync(icon128Src)) {
    fs.copyFileSync(icon128Src, path.join(chromeThemeDir, 'icon-128.png'));
  }
  if (fs.existsSync(icon512Src)) {
    fs.copyFileSync(icon512Src, path.join(chromeThemeDir, 'icon-512.png'));
  }

  const chromeManifest = {
    manifest_version: 3,
    version: '1.2.0',
    name: `${name} Theme`,
    description: `PocketGull ${name} browser theme engineered for optical legibility and WCAG AAA contrast.`,
    icons: {
      '128': 'icon-128.png',
      '512': 'icon-512.png'
    },
    theme: {
      colors: {
        frame: hexToRgb(titleBarBg),
        frame_inactive: hexToRgb(titleBarInactiveBg),
        toolbar: hexToRgb(tabActiveBg),
        tab_text: hexToRgb(tabActiveFg),
        tab_background_text: hexToRgb(tabInactiveFg),
        bookmark_text: hexToRgb(editorFg),
        toolbar_button_icon: hexToRgb(accent),
        toolbar_text: hexToRgb(editorFg),
        ntp_background: hexToRgb(editorBg),
        ntp_text: hexToRgb(editorFg)
      }
    }
  };

  fs.writeFileSync(
    path.join(chromeThemeDir, 'manifest.json'),
    JSON.stringify(chromeManifest, null, 2) + '\n',
    'utf8'
  );

  // 2. Mozilla Firefox WebExtension Theme
  const firefoxThemeDir = path.join(firefoxBaseDir, slug);
  fs.mkdirSync(firefoxThemeDir, { recursive: true });

  if (fs.existsSync(icon128Src)) {
    fs.copyFileSync(icon128Src, path.join(firefoxThemeDir, 'icon-128.png'));
  }
  if (fs.existsSync(icon512Src)) {
    fs.copyFileSync(icon512Src, path.join(firefoxThemeDir, 'icon-512.png'));
  }

  const firefoxManifest = {
    manifest_version: 2,
    version: '1.2.0',
    name: `${name} Theme`,
    description: `PocketGull ${name} browser theme engineered for optical legibility and WCAG AAA contrast.`,
    icons: {
      '128': 'icon-128.png',
      '512': 'icon-512.png'
    },
    browser_specific_settings: {
      gecko: {
        id: `${slug}@theme.pocketgull.app`,
        strict_min_version: '58.0'
      }
    },
    theme: {
      colors: {
        frame: titleBarBg,
        frame_inactive: titleBarInactiveBg,
        tab_selected: tabActiveBg,
        tab_background_text: tabInactiveFg,
        tab_text: tabActiveFg,
        tab_line: accent,
        toolbar: tabActiveBg,
        toolbar_text: editorFg,
        toolbar_field: editorBg,
        toolbar_field_text: editorFg,
        toolbar_top_separator: border,
        toolbar_bottom_separator: border,
        icons: accent,
        ntp_background: editorBg,
        ntp_text: editorFg
      }
    }
  };

  fs.writeFileSync(
    path.join(firefoxThemeDir, 'manifest.json'),
    JSON.stringify(firefoxManifest, null, 2) + '\n',
    'utf8'
  );

  generatedThemes.push({ name, slug, isDark, colors: firefoxManifest.theme.colors });
}

// 3. Dynamic Circadian Auto Firefox Extension
const circadianDir = path.join(firefoxBaseDir, 'pocketgull-circadian-auto');
fs.mkdirSync(circadianDir, { recursive: true });

const icon128Src = path.join(THEME_ROOT, '..', '..', 'public', 'icons', 'icon-128x128.png');
const icon512Src = path.join(THEME_ROOT, 'icon.png');
if (fs.existsSync(icon128Src)) {
  fs.copyFileSync(icon128Src, path.join(circadianDir, 'icon-128.png'));
}
if (fs.existsSync(icon512Src)) {
  fs.copyFileSync(icon512Src, path.join(circadianDir, 'icon-512.png'));
}

const circadianManifest = {
  manifest_version: 2,
  name: 'PocketGull Circadian Auto Theme (Firefox)',
  version: '1.2.0',
  description: 'Automatically transitions browser chrome according to the solar cycle: 08:00 Washi Rice Paper, 13:00 Hemp Fiber, 19:30 Scotopic 650nm Red.',
  icons: {
    '128': 'icon-128.png',
    '512': 'icon-512.png'
  },
  browser_specific_settings: {
    gecko: {
      id: 'circadian-auto@theme.pocketgull.app',
      strict_min_version: '58.0'
    }
  },
  permissions: ['theme', 'alarms'],
  background: {
    scripts: ['background.js']
  }
};

fs.writeFileSync(
  path.join(circadianDir, 'manifest.json'),
  JSON.stringify(circadianManifest, null, 2) + '\n',
  'utf8'
);

const washiColors = generatedThemes.find(t => t.slug === 'pocketgull-washi-rice-paper')?.colors;
const hempColors = generatedThemes.find(t => t.slug === 'pocketgull-hemp-fiber')?.colors;
const scotopicColors = generatedThemes.find(t => t.slug === 'pocketgull-scotopic-650nm-red')?.colors;

const backgroundJs = `// PocketGull Circadian Auto Switcher for Firefox
const THEMES = {
  washi: ${JSON.stringify(washiColors, null, 2)},
  hemp: ${JSON.stringify(hempColors, null, 2)},
  scotopic: ${JSON.stringify(scotopicColors, null, 2)}
};

function getActiveCircadianKey() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  if (h >= 8 && h < 13) {
    return 'washi';     // 08:00 AM - 01:00 PM Daylight
  } else if (h >= 13 && (h < 19 || (h === 19 && m < 30))) {
    return 'hemp';      // 01:00 PM - 07:30 PM Focus
  } else {
    return 'scotopic';  // 07:30 PM - 08:00 AM Night 650nm
  }
}

function applyCircadianTheme() {
  const key = getActiveCircadianKey();
  const colors = THEMES[key];
  if (colors && browser.theme && browser.theme.update) {
    browser.theme.update({ colors });
    console.log('[PocketGull] Applied Circadian Browser Theme:', key);
  }
}

// Check every 60 seconds
browser.alarms.create('circadian-check', { periodInMinutes: 1 });
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'circadian-check') {
    applyCircadianTheme();
  }
});

// Run on startup
applyCircadianTheme();
`;

fs.writeFileSync(path.join(circadianDir, 'background.js'), backgroundJs, 'utf8');

console.log(`✅ Successfully generated:`);
console.log(`   • ${generatedThemes.length} Chrome Manifest V3 themes in ${chromeBaseDir}`);
console.log(`   • ${generatedThemes.length} Firefox WebExtension themes in ${firefoxBaseDir}`);
console.log(`   • Dynamic Firefox Circadian Auto-Switcher in ${circadianDir}\n`);
