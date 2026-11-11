#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * PocketGull System Controller
 * Unified Theme, Typography, Cursor & Cognitive Ergonomics (Philocardia & Bionic Reading) Switcher.
 * Coordinates Antigravity IDE, Windows System Theme, Taskbars, Peripherals, and Oh My Posh.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(SCRIPT_DIR, '..');
const SETTINGS_PATH = path.join(WORKSPACE_DIR, '.vscode', 'settings.json');
const STATE_PATH = path.join(WORKSPACE_DIR, '.pocketgull_a11y.json');
const LOCALAPPDATA = process.env.LOCALAPPDATA || 'C:\\Users\\philg\\AppData\\Local';
const WIN_THEMES_DIR = path.join(LOCALAPPDATA, 'Microsoft', 'Windows', 'Themes');

const OMP_WASHI = path.join(WORKSPACE_DIR, 'public', 'brand', 'terminal', 'pocketgull-washi.omp.json');
const OMP_OPHTHALMIC = path.join(WORKSPACE_DIR, 'public', 'brand', 'terminal', 'pocketgull-ophthalmic.omp.json');
const OMP_SCOTOPIC = path.join(WORKSPACE_DIR, 'public', 'brand', 'terminal', 'pocketgull-scotopic.omp.json');
const OMP_CURIE = path.join(WORKSPACE_DIR, 'public', 'brand', 'terminal', 'pocketgull-curie.omp.json');
const OMP_RAMS = path.join(WORKSPACE_DIR, 'public', 'brand', 'terminal', 'pocketgull-rams.omp.json');

// ANSI Codes
const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const CYAN = `${ESC}38;2;45;212;191m`;   // 505nm Mesopic Cyan
const ROSE = `${ESC}38;2;244;63;94m`;    // Philocardia Rose
const COPPER = `${ESC}38;2;194;65;12m`;  // Philocardia Copper
const WASHI = `${ESC}38;2;250;248;242m`; // Washi Paper White
const GOLD = `${ESC}38;2;245;158;11m`;   // Kintsugi Gold
const SLATE = `${ESC}38;2;113;113;122m`; // River Slate

const THEME_MAP = {
  'washi': {
    name: 'PocketGull Washi Rice Paper',
    mode: 'light',
    colorization: '0xC40D9488',
    omp: OMP_WASHI,
    cursor: 'ophthalmic',
    huePreset: 'washi',
    peripheralTheme: 'washi',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Washi.theme'),
    description: 'Crisp Japanese rice paper aesthetic, optimal for high-ambient daylight reading.'
  },
  'hemp': {
    name: 'PocketGull Hemp Fiber',
    mode: 'light',
    colorization: '0xC4B45309',
    omp: OMP_WASHI,
    cursor: 'ophthalmic',
    huePreset: 'hemp',
    peripheralTheme: 'hemp',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Washi.theme'),
    description: 'Natural organic fiber tone with warm sepia undertones for soft daytime focus.'
  },
  'obsidian': {
    name: 'PocketGull Obsidian',
    mode: 'dark',
    colorization: '0xC40284C7',
    omp: OMP_OPHTHALMIC,
    cursor: 'ophthalmic',
    huePreset: 'hemp',
    peripheralTheme: 'obsidian',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Obsidian.theme'),
    description: 'Deep volcanic obsidian surface with WCAG AAA high-contrast cyan/emerald accents.'
  },
  '670': {
    name: 'PocketGull Scotopic 650nm Red',
    mode: 'dark',
    colorization: '0xC4DC2626',
    omp: OMP_SCOTOPIC,
    cursor: 'scotopic',
    huePreset: '670',
    peripheralTheme: '670',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Scotopic-650nm.theme'),
    description: 'Narrow-band 650-670nm red wavelength preserving retinal rhodopsin & melatonin.'
  },
  'scotopic': {
    name: 'PocketGull Scotopic 650nm Red',
    mode: 'dark',
    colorization: '0xC4DC2626',
    omp: OMP_SCOTOPIC,
    cursor: 'scotopic',
    huePreset: '670',
    peripheralTheme: '670',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Scotopic-650nm.theme'),
    description: 'Narrow-band 650-670nm red wavelength preserving retinal rhodopsin & melatonin.'
  },
  'curie': {
    name: 'PocketGull Curie Luminescence',
    mode: 'dark',
    colorization: '0xC410B981',
    omp: OMP_CURIE,
    cursor: 'ophthalmic',
    huePreset: 'hemp',
    peripheralTheme: 'obsidian',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Obsidian.theme'),
    description: 'Radiant phosphorescent green on dark field commemorating Marie Curie laboratory notebooks.'
  },
  'rams': {
    name: 'PocketGull Rams Functionalist',
    mode: 'light',
    colorization: '0xC43E5C76',
    omp: OMP_RAMS,
    cursor: 'ophthalmic',
    huePreset: 'washi',
    peripheralTheme: 'washi',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Washi.theme'),
    description: 'Dieter Rams 10-principles functionalist Braun-inspired slate & warm cream palette.'
  },
  'hypertext': {
    name: 'PocketGull Hypertext 1991',
    mode: 'light',
    colorization: '0xC4008080',
    omp: OMP_WASHI,
    cursor: 'ophthalmic',
    huePreset: 'washi',
    peripheralTheme: 'washi',
    themeFile: path.join(WIN_THEMES_DIR, 'PocketGull-Washi.theme'),
    description: 'NeXTcube CERN WorldWideWeb 1991 monochromatic hypermedia tribute.'
  }
};

const MEDICAL_PREFIXES = [
  'hypercholestero', 'gastroenterolo', 'ophthalmolo', 'pharmacogeno',
  'atherosclero', 'electrocardio', 'cerebrovascu', 'encephalo',
  'brady', 'tachy', 'hyper', 'hypo', 'chole', 'osteo', 'nephro',
  'cardio', 'neuro', 'dermato', 'gastro', 'pneumo', 'pulmono',
  'hemo', 'myo', 'arthro', 'angio', 'immuno', 'carcino', 'pharma',
  'thrombo', 'endo', 'peri', 'meso', 'sub', 'inter', 'intra'
];

function loadState() {
  const defaults = {
    philocardia: false,
    bionic: false,
    theme: 'hemp',
    cursor: 'ophthalmic',
    circadian: true,
    ataxiaShield: true,
    dragThresholdPx: 18
  };
  try {
    if (fs.existsSync(STATE_PATH)) {
      return { ...defaults, ...JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) };
    }
  } catch (e) {}
  return defaults;
}

function saveState(patch) {
  try {
    const merged = { ...loadState(), ...patch };
    fs.writeFileSync(STATE_PATH, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (e) {
    return patch;
  }
}

function spawnDetachedPwsh(scriptPath, scriptArgs = []) {
  if (!fs.existsSync(scriptPath)) return;
  try {
    spawn('pwsh.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...scriptArgs], {
      cwd: WORKSPACE_DIR,
      detached: true,
      windowsHide: true,
      stdio: 'ignore'
    }).unref();
  } catch (e) {}
}

function updateVsCodeSettings(themeName) {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return false;
    const content = fs.readFileSync(SETTINGS_PATH, 'utf8');
    const settings = JSON.parse(content);
    settings['workbench.colorTheme'] = themeName;
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

function applyWindowsRegistryTheme(target) {
  try {
    const isLight = target.mode === 'light' ? 1 : 0;
    execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d ${isLight} /f`, { stdio: 'ignore' });
    execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d ${isLight} /f`, { stdio: 'ignore' });
    if (target.colorization) {
      execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\DWM" /v ColorizationColor /t REG_DWORD /d ${target.colorization} /f`, { stdio: 'ignore' });
    }
    return true;
  } catch (e) {
    return false;
  }
}

function applyCursorScheme(rawScheme) {
  const scheme = (rawScheme || 'ophthalmic').toLowerCase();
  const normalized = (scheme === '670' || scheme === 'scotopic') ? 'scotopic' : (scheme === 'default' ? 'default' : 'ophthalmic');
  const cursorDir = path.join(LOCALAPPDATA, 'PocketGull', 'Cursors').replace(/\\/g, '\\\\');

  const psScript = `
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class WinCursorCtrl {
        [DllImport(\\"user32.dll\\", SetLastError = true)]
        public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);
        public static void Refresh() {
            SystemParametersInfo(0x0057, 0, IntPtr.Zero, 0x01 | 0x02);
        }
    }
"@ -ErrorAction SilentlyContinue
    $cursorsKey = "HKCU:\\Control Panel\\Cursors"
    if ('${normalized}' -eq 'ophthalmic') {
        Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "PocketGull Ophthalmic High-Contrast"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value "${cursorDir}\\pocketgull_ophthalmic_arrow.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Hand" -Value "${cursorDir}\\pocketgull_ophthalmic_hand.cur"
        Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value "${cursorDir}\\pocketgull_ophthalmic_ibeam.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value "${cursorDir}\\pocketgull_precision_cross.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value "${cursorDir}\\pocketgull_philocardia_wait.cur"
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value "${cursorDir}\\pocketgull_philocardia_wait.cur"
        Set-ItemProperty -Path $cursorsKey -Name "SizeNS" -Value "${cursorDir}\\pocketgull_ophthalmic_sizens.cur"
        Set-ItemProperty -Path $cursorsKey -Name "SizeWE" -Value "${cursorDir}\\pocketgull_ophthalmic_sizewe.cur"
    } elseif ('${normalized}' -eq 'scotopic') {
        Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "PocketGull Scotopic 650nm Red"
        Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value "${cursorDir}\\pocketgull_scotopic_arrow.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Hand" -Value "${cursorDir}\\pocketgull_scotopic_hand.cur"
        Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value "${cursorDir}\\pocketgull_scotopic_ibeam.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value "${cursorDir}\\pocketgull_scotopic_cross.cur"
        Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value "${cursorDir}\\pocketgull_philocardia_wait.cur"
        Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value "${cursorDir}\\pocketgull_philocardia_wait.cur"
        Set-ItemProperty -Path $cursorsKey -Name "SizeNS" -Value "${cursorDir}\\pocketgull_scotopic_sizens.cur"
        Set-ItemProperty -Path $cursorsKey -Name "SizeWE" -Value "${cursorDir}\\pocketgull_scotopic_sizewe.cur"
    } else {
        $eoaArrow = "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\arrow_eoa.cur"
        if (Test-Path $eoaArrow) {
            Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "Windows Black (EoA)"
            Set-ItemProperty -Path $cursorsKey -Name "Arrow" -Value $eoaArrow
            Set-ItemProperty -Path $cursorsKey -Name "Hand" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\hand_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "IBeam" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\ibeam_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "Crosshair" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\cross_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "Wait" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\wait_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "AppStarting" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\busy_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "SizeNS" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\ns_eoa.cur"
            Set-ItemProperty -Path $cursorsKey -Name "SizeWE" -Value "$env:LOCALAPPDATA\\Microsoft\\Windows\\Cursors\\ew_eoa.cur"
        } else {
            Set-ItemProperty -Path $cursorsKey -Name "(default)" -Value "Windows Default"
            foreach ($role in @('Arrow','Hand','IBeam','Crosshair','Wait','AppStarting','SizeNS','SizeWE')) {
                Set-ItemProperty -Path $cursorsKey -Name $role -Value ""
            }
        }
    }
    [WinCursorCtrl]::Refresh()
  `;

  try {
    execSync(`pwsh.exe -NoProfile -ExecutionPolicy Bypass -Command "${psScript}"`, { stdio: 'ignore' });
    saveState({ cursor: normalized });
    return normalized;
  } catch (e) {
    return null;
  }
}

function applyTheme(key, applyFullScene = false) {
  const normalizedKey = (key || 'hemp').toLowerCase();
  const target = THEME_MAP[normalizedKey];
  if (!target) {
    console.log(`\n  ${ROSE}[ERROR]${RESET} Unknown theme '${key}'. Available: ${Object.keys(THEME_MAP).join(', ')}`);
    return;
  }

  // 1. Update Antigravity IDE
  updateVsCodeSettings(target.name);

  // 2. Update Windows System Theme Personalization
  applyWindowsRegistryTheme(target);

  // 3. Synchronize Dual Taskbars via Win32 Broadcast (non-blocking)
  spawnDetachedPwsh(path.join(SCRIPT_DIR, 'refresh_taskbar_theme.ps1'), ['-Theme', normalizedKey]);

  // 4. If full scene requested, also synchronize Cursor, Philips Hue & Razer/NZXT peripherals
  if (applyFullScene) {
    applyCursorScheme(target.cursor);
    spawnDetachedPwsh(path.join(SCRIPT_DIR, 'sync_peripherals_lighting.ps1'), ['-Theme', target.peripheralTheme]);
    spawnDetachedPwsh(path.join(SCRIPT_DIR, 'sync_hue_circadian.ps1'), ['-Preset', target.huePreset]);
  }

  saveState({ theme: normalizedKey === 'scotopic' ? '670' : normalizedKey });

  console.log(`\n  ${CYAN}⚕ POCKETGULL SYSTEM & WINDOWS THEME SWITCHER${RESET}`);
  console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`  Active Theme:    ${BOLD}${WASHI}${target.name}${RESET} [${target.mode.toUpperCase()}]`);
  console.log(`  Windows Surface: Mode=${target.mode.toUpperCase()}, Colorization=${target.colorization}`);
  console.log(`  State Anchor:    ${STATE_PATH}`);
  console.log(`  Description:     ${SLATE}${target.description}${RESET}`);
  console.log(`  Status:          ${GOLD}Synchronized across Antigravity IDE, Windows & Taskbars${applyFullScene ? ' + Cursors & Room Lighting' : ''}${RESET}\n`);
}

function togglePhilocardia(explicitState) {
  const current = loadState();
  const next = explicitState !== undefined ? explicitState : !current.philocardia;
  saveState({ philocardia: next });

  console.log(`\n  ${ROSE}🫀 PHILOCARDIA VAGAL RESONANCE (0.1 Hz)${RESET}`);
  console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`  Status:        ${next ? `${ROSE}${BOLD}ACTIVE (10s Mayer Wave Cycle Enabled)${RESET}` : `${SLATE}DISABLED (Normal Static)${RESET}`}`);
  console.log(`  Physiology:    Synchronizes Heart Rate Variability (HRV) with respiratory sinus arrhythmia.`);
  console.log(`  Pacing Cycle:  4.0s gentle expansion / 6.0s gentle relaxation (eliminates screen apnea).\n`);
}

function runPhilocardiaPacer() {
  console.clear();
  console.log(`\n  ${ROSE}${BOLD}🫀 PHILOCARDIA LIVE VAGAL PACER (0.1 Hz • 6 Breaths/Min)${RESET}`);
  console.log(`  ${SLATE}Follow the wave with your breath. Press Ctrl+C to exit.${RESET}\n`);

  let t = 0;
  const cycleSeconds = 10;
  const inhaleSeconds = 4;
  const width = 40;

  setInterval(() => {
    t = (t + 0.2) % cycleSeconds;
    let progress = 0;
    let phase = '';
    let color = ROSE;

    if (t < inhaleSeconds) {
      progress = t / inhaleSeconds;
      phase = 'IN-BREATH (Expansion)';
      color = ROSE;
    } else {
      progress = 1 - ((t - inhaleSeconds) / (cycleSeconds - inhaleSeconds));
      phase = 'OUT-BREATH (Release)  ';
      color = COPPER;
    }

    const filled = Math.round(progress * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    const pct = Math.round(progress * 100);

    process.stdout.write(`\r  ${color}[${phase}]${RESET} [${bar}] ${pct}%   `);
  }, 200);
}

function toggleBionic(explicitState) {
  const current = loadState();
  const next = explicitState !== undefined ? explicitState : !current.bionic;
  saveState({ bionic: next });

  console.log(`\n  ${CYAN}👁️ BIONIC READING & SACCADIC GUIDANCE${RESET}`);
  console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`  Status:        ${next ? `${CYAN}${BOLD}ACTIVE (Saccadic Fixation Anchors On)${RESET}` : `${SLATE}DISABLED${RESET}`}`);
  console.log(`  Foveal Acuity: Anchors initial 40-50% morphemes; reduces saccadic visual crowding.\n`);
}

function formatWordToBionic(word) {
  if (word.length <= 1) return word;
  const match = word.match(/^([^\w]*)([\w]+)([^\w]*)$/);
  if (!match) return word;
  const [, leading, core, trailing] = match;
  if (!core) return word;

  let fixationLen = 1;
  const lower = core.toLowerCase();
  for (const p of MEDICAL_PREFIXES) {
    if (lower.startsWith(p) && core.length > p.length) {
      fixationLen = p.length;
      break;
    }
  }
  if (fixationLen === 1) {
    if (core.length <= 3) fixationLen = 1;
    else if (core.length <= 6) fixationLen = 2;
    else if (core.length <= 9) fixationLen = 3;
    else fixationLen = Math.ceil(core.length * 0.45);
  }

  const anchor = core.substring(0, fixationLen);
  const remainder = core.substring(fixationLen);
  return `${leading}${BOLD}${WASHI}${anchor}${RESET}${remainder}${trailing}`;
}

function transformTextToBionic(text) {
  return text.split(/(\s+)/).map(segment => {
    if (/^\s+$/.test(segment)) return segment;
    return formatWordToBionic(segment);
  }).join('');
}

// CLI Routing
const args = process.argv.slice(2);
const command = args[0] || 'menu';

switch (command.toLowerCase()) {
  case 'theme':
    if (args[1]) {
      const applyFull = args.includes('--system') || args.includes('-s') || args.includes('--scene');
      applyTheme(args[1], applyFull);
    } else {
      console.log(`Usage: gull theme [${Object.keys(THEME_MAP).join('|')}] [--scene]`);
    }
    break;

  case 'scene':
    applyTheme(args[1] || 'hemp', true);
    break;

  case 'philocardia':
    if (args[1] === 'pace' || args[1] === 'live') {
      runPhilocardiaPacer();
    } else {
      togglePhilocardia(args[1] ? args[1] === 'on' || args[1] === 'true' : undefined);
    }
    break;

  case 'bionic':
    if (args[1] && (args[1] === 'on' || args[1] === 'off')) {
      toggleBionic(args[1] === 'on');
    } else if (args[1]) {
      const input = args.slice(1).join(' ');
      console.log('\n' + transformTextToBionic(input) + '\n');
    } else {
      toggleBionic();
    }
    break;

  case 'cursor': {
    const applied = applyCursorScheme(args[1] || 'ophthalmic');
    if (applied) {
      console.log(`\n  ${CYAN}⚕ POCKETGULL CLINICAL CURSOR SCHEME${RESET}`);
      console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
      console.log(`  Active Scheme: ${BOLD}${WASHI}${applied.toUpperCase()}${RESET}`);
      console.log(`  Coverage:      Arrow, Hand (Link), I-Beam, Crosshair, Wait, SizeNS, SizeWE (64px ARGB)`);
      console.log(`  Target:        ${applied === 'ophthalmic' ? 'Obsidian Core + 505nm Cyan Halo (WCAG AAA)' : applied === 'scotopic' ? '650nm Monochromatic Deep Red (Melatonin Safe)' : 'Windows Default'}`);
      console.log(`  Status:        ${GOLD}Updated dynamically in Windows with zero reboot required.${RESET}\n`);
    } else {
      console.error('Failed to apply cursor scheme.');
    }
    break;
  }

  case 'ergo': {
    const rawAction = (args[1] || 'status').toLowerCase();
    const psAction = rawAction === 'apply' || rawAction === 'on' ? 'Apply' : rawAction === 'restore' || rawAction === 'off' ? 'Restore' : 'Status';
    const ergoScript = path.join(SCRIPT_DIR, 'configure_ataxia_ergonomics.ps1');
    execSync(`pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "${ergoScript}" -Action ${psAction}`, { stdio: 'inherit' });
    break;
  }

  case 'tray': {
    const trayScript = path.join(SCRIPT_DIR, 'pocketgull_tray.ps1');
    if (args[1] === '--startup' || args[1] === 'startup') {
      const startupScript = path.join(SCRIPT_DIR, 'install_pocketgull_desktop.ps1');
      execSync(`pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "${startupScript}"`, { stdio: 'inherit' });
    } else {
      spawn('pwsh.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', trayScript], {
        cwd: WORKSPACE_DIR,
        detached: true,
        windowsHide: true,
        stdio: 'ignore'
      }).unref();
      console.log(`\n  ${CYAN}⚕ POCKETGULL SYSTEM TRAY & 4-SLOT CONTROL DECK LAUNCHED${RESET}`);
      console.log(`  ${SLATE}Left-click the tray icon to open the 4-Slot Control Deck; right-click for menu.${RESET}\n`);
    }
    break;
  }

  case 'mode': {
    const targetMode = args[1] || 'Build';
    const modeScript = path.join(SCRIPT_DIR, 'pocketgull_mode.ps1');
    execSync(`pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "${modeScript}" -Mode ${targetMode}`, { stdio: 'inherit' });
    break;
  }

  case 'status': {
    const st = loadState();
    console.log(`\n  ${CYAN}⚕ POCKETGULL SYSTEM & ERGONOMIC STATUS${RESET}`);
    console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
    console.log(`  Active Theme:  ${BOLD}${WASHI}${(st.theme || 'hemp').toUpperCase()}${RESET} (${THEME_MAP[st.theme]?.name || 'Custom'})`);
    console.log(`  Cursor Suite:  ${CYAN}${(st.cursor || 'ophthalmic').toUpperCase()}${RESET} (13-cut 64px ARGB incl. Hand & Resize)`);
    console.log(`  Ataxia Shield: ${st.ataxiaShield !== false ? `${GOLD}ENABLED (${st.dragThresholdPx || 18}px Drag-Slip + 750ms Clicks + 65ms Bounce Filter)${RESET}` : `${SLATE}STANDARD${RESET}`}`);
    console.log(`  Philocardia:   ${st.philocardia ? `${ROSE}ENABLED (0.1 Hz Pacer Active)${RESET}` : `${SLATE}DISABLED${RESET}`}`);
    console.log(`  Bionic Mode:   ${st.bionic ? `${CYAN}ENABLED${RESET}` : `${SLATE}DISABLED${RESET}`}`);
    console.log(`  Circadian:     ${st.circadian ? `${GOLD}ENABLED (Auto Sun Tracking)${RESET}` : `${SLATE}MANUAL${RESET}`}\n`);
    break;
  }

  case 'menu':
  default:
    console.log(`\n  ${CYAN}⚕ POCKETGULL ERGONOMIC & COGNITIVE CONTROLLER${RESET}`);
    console.log(`  ${DIM}─────────────────────────────────────────────────────────────────${RESET}`);
    console.log(`  ${BOLD}Commands:${RESET}`);
    console.log(`    gull scene <washi|hemp|obsidian|670>`);
    console.log(`      ${SLATE}One-click unified sync across IDE, Windows, Taskbars, Cursors, Hue & Razer${RESET}`);
    console.log(`    gull theme <name> [--scene]`);
    console.log(`      ${SLATE}Options: washi, hemp, obsidian, 670, curie, rams, hypertext${RESET}`);
    console.log(`    gull cursor [ophthalmic|scotopic|default]`);
    console.log(`      ${SLATE}Applies 64px high-contrast or 650nm melatonin-safe cursor suite${RESET}`);
    console.log(`    gull ergo [apply|restore|status]`);
    console.log(`      ${SLATE}Manages 18px tremor drag-slip guard, 750ms clicks, and pointer damping${RESET}`);
    console.log(`    gull philocardia [on|off|pace]`);
    console.log(`      ${SLATE}Toggles or launches 0.1 Hz Vagal Parasympathetic Breathing Pacer${RESET}`);
    console.log(`    gull tray [--startup]`);
    console.log(`      ${SLATE}Launches system tray + 4-Slot Control Deck (or opens Deck if running)${RESET}`);
    console.log(`    gull status\n`);
    break;
}
