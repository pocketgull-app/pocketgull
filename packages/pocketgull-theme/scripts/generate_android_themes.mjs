#!/usr/bin/env node
/**
 * @file generate_android_themes.mjs
 * @description Extracts colors from all 26 PocketGull IDE themes and generates:
 * 1. system/android/pocketgull-android-themes.json (Material You + OLED/Paper Substrate tokens)
 * 2. system/android/apply_pixel_theme.ps1 (1-click ADB Material You + Wallpaper + Circadian sync)
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

const androidDir = path.join(THEME_ROOT, 'system', 'android');
fs.mkdirSync(androidDir, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function cleanHex6(hex, fallback = '14B8A6') {
  if (!hex || typeof hex !== 'string') return fallback;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length < 6) return fallback;
  return c.slice(0, 6).toUpperCase();
}

function pickMonetStyle(slug, isDark) {
  if (slug.includes('hypertext') || slug.includes('achromatopsia') || slug.includes('darkfield')) {
    return 'MONOCHROMATIC';
  }
  if (slug.includes('washi') || slug.includes('hemp') || slug.includes('kraft') || slug.includes('rams') || slug.includes('triage') || slug.includes('carrara')) {
    return 'SPRITZ';
  }
  if (slug.includes('spot-color') || slug.includes('curie') || slug.includes('confocal') || slug.includes('acuity')) {
    return 'EXPRESSIVE';
  }
  return 'TONAL_SPOT';
}

const SHORT_ALIASES = {
  'pocketgull-obsidian': ['obsidian', 'dark', 'default'],
  'pocketgull-washi-rice-paper': ['washi', 'daylight', 'light', 'paper'],
  'pocketgull-hemp-fiber': ['hemp', 'sepia', 'afternoon'],
  'pocketgull-scotopic-650nm-red': ['scotopic', '670', '650', 'night', 'red'],
  'pocketgull-curie-luminescence': ['curie', 'radium'],
  'pocketgull-rams-functionalist': ['rams', 'braun'],
  'pocketgull-radiograph-luminescence': ['radiograph', 'xray'],
  'pocketgull-midnight-broadside': ['broadside', 'midnight'],
  'pocketgull-spot-color-press': ['spot', 'press'],
  'pocketgull-hypertext-1991': ['hypertext', '1991'],
  'pocketgull-okabe-ito-divergent': ['okabe', 'colorblind'],
  'pocketgull-viridis-perceptual': ['viridis'],
  'pocketgull-achromatopsia-high-luminance': ['achromatopsia', 'mono']
};

const androidThemes = [];

for (const entry of themeEntries) {
  const themeFile = path.join(THEME_ROOT, entry.path);
  if (!fs.existsSync(themeFile)) continue;

  const data = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const colors = data.colors || {};
  const name = entry.label;
  const slug = slugify(name);
  const isDark = entry.uiTheme === 'vs-dark';

  const bgHex = cleanHex6(colors['editor.background'], isDark ? '09090B' : 'FAF8F0');
  const fgHex = cleanHex6(colors['editor.foreground'], isDark ? 'F4F4F5' : '18181B');
  const cardHex = cleanHex6(colors['sideBar.background'] || colors['editorWidget.background'], isDark ? '121216' : 'F2EFE5');
  const accentHex = cleanHex6(
    colors['tab.activeBorderTop'] || colors['focusBorder'] || colors['button.background'] || colors['terminal.ansiCyan'],
    isDark ? '14B8A6' : '0F766E'
  );
  const secondaryHex = cleanHex6(
    colors['terminal.ansiYellow'] || colors['editorWarning.foreground'] || colors['terminal.ansiGreen'],
    isDark ? 'F59E0B' : 'B45309'
  );
  const borderHex = cleanHex6(
    colors['tab.border'] || colors['sideBar.border'] || colors['panel.border'],
    isDark ? '27272A' : 'E4DEC9'
  );

  const monetStyle = pickMonetStyle(slug, isDark);
  const nightLight = slug.includes('scotopic');
  const isFeatured = [
    'pocketgull-obsidian',
    'pocketgull-washi-rice-paper',
    'pocketgull-hemp-fiber',
    'pocketgull-scotopic-650nm-red'
  ].includes(slug);

  androidThemes.push({
    id: slug,
    label: name,
    shortLabel: name.replace(/^PocketGull\s+/i, ''),
    aliases: SHORT_ALIASES[slug] || [slug.replace(/^pocketgull-/, '')],
    isDark,
    isFeatured,
    monetStyle,
    nightLight,
    contrastLevel: 1.0,
    substrateHex: bgHex,
    surfaceHex: cardHex,
    foregroundHex: fgHex,
    accentHex,
    secondaryHex,
    borderHex
  });
}

const jsonPath = path.join(androidDir, 'pocketgull-android-themes.json');
fs.writeFileSync(jsonPath, JSON.stringify(androidThemes, null, 2) + '\n', 'utf8');
console.log(`✅ Generated ${androidThemes.length} Android Material You themes -> ${jsonPath}`);
