#!/usr/bin/env node
/**
 * @file generate_terminal_schemes.mjs
 * @description Extracts ANSI terminal palettes from all 26 PocketGull VS Code theme definitions
 * and procedurally generates matching schemes for:
 * 1. Windows Terminal JSON Fragments (auto-discovered)
 * 2. Standalone Windows Terminal Schemes
 * 3. Ghostty Terminal Themes
 * 4. Alacritty TOML Themes
 * 5. Kitty Conf Themes
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');

const vscodeThemesDir = path.join(THEME_ROOT, 'ide', 'vscode', 'themes');
const pkgPath = path.join(THEME_ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const themeEntries = pkg.contributes?.themes || [];

console.log(`🌊 Generating Terminal Schemes across ${themeEntries.length} PocketGull Themes...`);

const wtSchemes = [];
const alacrittyDir = path.join(THEME_ROOT, 'system', 'terminal', 'alacritty');
const ghosttyDir = path.join(THEME_ROOT, 'system', 'terminal', 'ghostty');
const kittyDir = path.join(THEME_ROOT, 'system', 'terminal', 'kitty');

fs.mkdirSync(alacrittyDir, { recursive: true });
fs.mkdirSync(ghosttyDir, { recursive: true });
fs.mkdirSync(kittyDir, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

for (const entry of themeEntries) {
  const themeFile = path.join(THEME_ROOT, entry.path);
  if (!fs.existsSync(themeFile)) continue;

  const data = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const colors = data.colors || {};

  const name = entry.label;
  const slug = slugify(name);

  const bg = colors['terminal.background'] || colors['editor.background'] || '#09090b';
  const fg = colors['terminal.foreground'] || colors['editor.foreground'] || '#f4f4f5';
  const cursor = colors['terminalCursor.foreground'] || colors['editorCursor.foreground'] || colors['terminal.ansiCyan'] || fg;
  const selectionBg = colors['terminal.selectionBackground'] || colors['editor.selectionBackground'] || '#27272a';

  const black = colors['terminal.ansiBlack'] || '#18181b';
  const red = colors['terminal.ansiRed'] || '#f43f5e';
  const green = colors['terminal.ansiGreen'] || '#10b981';
  const yellow = colors['terminal.ansiYellow'] || '#f59e0b';
  const blue = colors['terminal.ansiBlue'] || '#38bdf8';
  const purple = colors['terminal.ansiMagenta'] || '#a855f7';
  const cyan = colors['terminal.ansiCyan'] || '#14b8a6';
  const white = colors['terminal.ansiWhite'] || fg;

  const brightBlack = colors['terminal.ansiBrightBlack'] || '#3f3f46';
  const brightRed = colors['terminal.ansiBrightRed'] || '#fb7185';
  const brightGreen = colors['terminal.ansiBrightGreen'] || '#34d399';
  const brightYellow = colors['terminal.ansiBrightYellow'] || '#fbbf24';
  const brightBlue = colors['terminal.ansiBrightBlue'] || '#60a5fa';
  const brightPurple = colors['terminal.ansiBrightMagenta'] || '#c084fc';
  const brightCyan = colors['terminal.ansiBrightCyan'] || '#2dd4bf';
  const brightWhite = colors['terminal.ansiBrightWhite'] || '#ffffff';

  // Windows Terminal Scheme
  const wtScheme = {
    name,
    background: bg,
    foreground: fg,
    black,
    blue,
    cyan,
    green,
    purple,
    red,
    white,
    yellow,
    brightBlack,
    brightBlue,
    brightCyan,
    brightGreen,
    brightPurple,
    brightRed,
    brightWhite,
    brightYellow,
    cursorColor: cursor,
    selectionBackground: selectionBg
  };
  wtSchemes.push(wtScheme);

  // Alacritty TOML
  const alacrittyContent = `# ${name} Alacritty Theme
[colors.primary]
background = "${bg}"
foreground = "${fg}"

[colors.cursor]
text = "${bg}"
cursor = "${cursor}"

[colors.selection]
text = "${fg}"
background = "${selectionBg}"

[colors.normal]
black = "${black}"
red = "${red}"
green = "${green}"
yellow = "${yellow}"
blue = "${blue}"
magenta = "${purple}"
cyan = "${cyan}"
white = "${white}"

[colors.bright]
black = "${brightBlack}"
red = "${brightRed}"
green = "${brightGreen}"
yellow = "${brightYellow}"
blue = "${brightBlue}"
magenta = "${brightPurple}"
cyan = "${brightCyan}"
white = "${brightWhite}"
`;
  fs.writeFileSync(path.join(alacrittyDir, `${slug}.toml`), alacrittyContent, 'utf8');

  // Ghostty
  const ghosttyContent = `# ${name} Ghostty Theme
background = ${bg}
foreground = ${fg}
cursor-color = ${cursor}
selection-background = ${selectionBg}
palette = 0=${black}
palette = 1=${red}
palette = 2=${green}
palette = 3=${yellow}
palette = 4=${blue}
palette = 5=${purple}
palette = 6=${cyan}
palette = 7=${white}
palette = 8=${brightBlack}
palette = 9=${brightRed}
palette = 10=${brightGreen}
palette = 11=${brightYellow}
palette = 12=${brightBlue}
palette = 13=${brightPurple}
palette = 14=${brightCyan}
palette = 15=${brightWhite}
`;
  fs.writeFileSync(path.join(ghosttyDir, slug), ghosttyContent, 'utf8');

  // Kitty Conf
  const kittyContent = `# ${name} Kitty Theme
background ${bg}
foreground ${fg}
cursor ${cursor}
selection_background ${selectionBg}
color0 ${black}
color1 ${red}
color2 ${green}
color3 ${yellow}
color4 ${blue}
color5 ${purple}
color6 ${cyan}
color7 ${white}
color8 ${brightBlack}
color9 ${brightRed}
color10 ${brightGreen}
color11 ${brightYellow}
color12 ${brightBlue}
color13 ${brightPurple}
color14 ${brightCyan}
color15 ${brightWhite}
`;
  fs.writeFileSync(path.join(kittyDir, `${slug}.conf`), kittyContent, 'utf8');
}

// 1. Write standalone Windows Terminal schemes
const schemesFile = path.join(THEME_ROOT, 'system', 'windows-terminal', 'pocketgull-schemes.json');
fs.writeFileSync(schemesFile, JSON.stringify(wtSchemes, null, 2) + '\n', 'utf8');

// 2. Write Windows Terminal Fragment with flagship profiles
const flagshipProfiles = [
  { name: 'PocketGull Obsidian (PowerShell)', scheme: 'PocketGull Obsidian', opacity: 98 },
  { name: 'PocketGull Scotopic 650nm (PowerShell)', scheme: 'PocketGull Scotopic 650nm Red', opacity: 95 },
  { name: 'PocketGull Washi (PowerShell)', scheme: 'PocketGull Washi Rice Paper', opacity: 100 },
  { name: 'PocketGull Curie (PowerShell)', scheme: 'PocketGull Curie Luminescence', opacity: 98 },
  { name: 'PocketGull Rams Functionalist (PowerShell)', scheme: 'PocketGull Rams Functionalist', opacity: 100 },
  { name: 'PocketGull Midnight Broadside (PowerShell)', scheme: 'PocketGull Midnight Broadside', opacity: 96 }
];

const wtFragment = {
  schemes: wtSchemes,
  profiles: flagshipProfiles.map(p => ({
    name: p.name,
    source: 'PocketGull.Theme',
    colorScheme: p.scheme,
    font: {
      face: 'Pocket Gull Mono',
      size: 11
    },
    cursorShape: 'vintage',
    opacity: p.opacity
  }))
};

const fragmentFile = path.join(THEME_ROOT, 'system', 'windows-terminal', 'fragments', 'PocketGull.json');
fs.writeFileSync(fragmentFile, JSON.stringify(wtFragment, null, 2) + '\n', 'utf8');

console.log(`✅ Successfully generated:`);
console.log(`   • ${wtSchemes.length} Windows Terminal schemes in ${schemesFile}`);
console.log(`   • ${wtSchemes.length} schemes & ${flagshipProfiles.length} profiles in ${fragmentFile}`);
console.log(`   • ${wtSchemes.length} Alacritty TOML configs in ${alacrittyDir}`);
console.log(`   • ${wtSchemes.length} Ghostty configs in ${ghosttyDir}`);
console.log(`   • ${wtSchemes.length} Kitty confs in ${kittyDir}\n`);
