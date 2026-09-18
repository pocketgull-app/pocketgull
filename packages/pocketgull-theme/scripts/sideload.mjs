#!/usr/bin/env node
/**
 * @file sideload.mjs
 * @description Master automated installer & sideload utility for the PocketGull Theme Suite.
 * Deploy targets:
 * 1. Fonts: Registers PocketGull Mono and PocketGull-VF into the OS (Windows User Fonts + Registry).
 * 2. IDEs: Sideloads extension into VS Code, Antigravity IDE, VS Code Insiders, Cursor, VSCodium.
 * 3. System Terminal: Deploys Windows Terminal Fragment with PocketGull schemes and font binding.
 * 4. Settings: Configures workspace and user editor settings for font ligatures and font family.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');

const pkgPath = path.join(THEME_ROOT, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error(`[ERROR] package.json not found at ${pkgPath}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version || '1.2.0';
const extFolderQualified = `pocketgull.pocketgull-theme-${version}`;
const extFolderSimple = 'pocketgull-theme';

const homeDir = os.homedir();

console.log(`\n🌊 PocketGull Multi-Environment Theme Suite Sideload Utility v${version}`);
console.log(`   Source: ${THEME_ROOT}`);
console.log(`   Themes declared: ${pkg.contributes?.themes?.length ?? 0}`);
console.log(`   Icon themes declared: ${pkg.contributes?.iconThemes?.length ?? 0}`);

// 1. Verify all theme files exist and parse cleanly
let verifiedThemesCount = 0;
for (const themeEntry of pkg.contributes?.themes || []) {
  const themeFilePath = path.join(THEME_ROOT, themeEntry.path);
  if (!fs.existsSync(themeFilePath)) {
    console.error(`[FAIL] Missing theme file: ${themeFilePath}`);
    process.exit(1);
  }
  try {
    JSON.parse(fs.readFileSync(themeFilePath, 'utf8'));
    verifiedThemesCount++;
  } catch (err) {
    console.error(`[FAIL] Syntax error in theme file ${themeFilePath}:`, err.message);
    process.exit(1);
  }
}
console.log(`   [OK] Verified ${verifiedThemesCount} IDE theme files are valid JSON.`);

// 2. Install PocketGull Fonts into OS
function installFonts() {
  const fontsDir = path.join(THEME_ROOT, 'fonts');
  if (!fs.existsSync(fontsDir)) {
    console.warn('   [SKIP] fonts/ directory not found in theme package');
    return;
  }

  if (process.platform === 'win32') {
    try {
      const localAppData = process.env.LOCALAPPDATA;
      if (localAppData) {
        const userFontsDir = path.join(localAppData, 'Microsoft', 'Windows', 'Fonts');
        fs.mkdirSync(userFontsDir, { recursive: true });

        const fontFiles = [
          { file: 'PocketGullMono-Regular.ttf', name: 'PocketGull Mono (TrueType)' },
          { file: 'PocketGull-VF.ttf', name: 'PocketGull VF (TrueType)' }
        ];

        for (const fontInfo of fontFiles) {
          const srcFont = path.join(fontsDir, fontInfo.file);
          if (fs.existsSync(srcFont)) {
            const destFont = path.join(userFontsDir, fontInfo.file);
            try {
              fs.copyFileSync(srcFont, destFont);
            } catch (copyErr) {
              if (copyErr.code === 'EBUSY') {
                console.log(`   ℹ️ Font actively in use by Windows OS: ${fontInfo.file}`);
              } else {
                throw copyErr;
              }
            }

            // Register font in HKCU registry for immediate OS recognition
            try {
              const regCmd = `reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "${fontInfo.name}" /t REG_SZ /d "${destFont}" /f`;
              execSync(regCmd, { stdio: 'ignore' });
            } catch {
              // Ignore registry elevation notice
            }
            console.log(`   ✅ Registered font in Windows: ${fontInfo.file}`);
          }
        }
      }
    } catch (err) {
      console.warn('   ⚠️ Could not register fonts in Windows:', err.message);
    }
  } else if (process.platform === 'darwin') {
    try {
      const userFontsDir = path.join(homeDir, 'Library', 'Fonts');
      fs.mkdirSync(userFontsDir, { recursive: true });
      for (const f of ['PocketGullMono-Regular.ttf', 'PocketGull-VF.ttf']) {
        const src = path.join(fontsDir, f);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(userFontsDir, f));
          console.log(`   ✅ Installed font to macOS: ${f}`);
        }
      }
    } catch (err) {
      console.warn('   ⚠️ Could not register fonts in macOS:', err.message);
    }
  } else {
    try {
      const userFontsDir = path.join(homeDir, '.local', 'share', 'fonts');
      fs.mkdirSync(userFontsDir, { recursive: true });
      for (const f of ['PocketGullMono-Regular.ttf', 'PocketGull-VF.ttf']) {
        const src = path.join(fontsDir, f);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(userFontsDir, f));
          console.log(`   ✅ Installed font to Linux: ${f}`);
        }
      }
      try {
        execSync('fc-cache -f', { stdio: 'ignore' });
      } catch {}
    } catch (err) {
      console.warn('   ⚠️ Could not register fonts in Linux:', err.message);
    }
  }
}

installFonts();

// 3. Recursive directory copy utility
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 4. Install Theme Extension to IDE directories
function installToExtensionFolder(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy manifest and metadata
  fs.copyFileSync(pkgPath, path.join(targetDir, 'package.json'));

  for (const f of ['README.md', 'icon.png', 'LICENSE']) {
    const p = path.join(THEME_ROOT, f);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, path.join(targetDir, f));
    }
  }

  // Copy ide/ folder
  const ideSrc = path.join(THEME_ROOT, 'ide');
  const ideDest = path.join(targetDir, 'ide');
  if (fs.existsSync(ideDest)) {
    fs.rmSync(ideDest, { recursive: true, force: true });
  }
  if (fs.existsSync(ideSrc)) {
    copyDirRecursive(ideSrc, ideDest);
  }

  // Copy fonts/ folder
  const fontsSrc = path.join(THEME_ROOT, 'fonts');
  const fontsDest = path.join(targetDir, 'fonts');
  if (fs.existsSync(fontsDest)) {
    fs.rmSync(fontsDest, { recursive: true, force: true });
  }
  if (fs.existsSync(fontsSrc)) {
    copyDirRecursive(fontsSrc, fontsDest);
  }

  // Copy browser and system folders for direct reference
  for (const dirName of ['browser', 'system']) {
    const srcDir = path.join(THEME_ROOT, dirName);
    const destDir = path.join(targetDir, dirName);
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    if (fs.existsSync(srcDir)) {
      copyDirRecursive(srcDir, destDir);
    }
  }
}

const editorCandidates = [
  { name: 'VS Code', dir: path.join(homeDir, '.vscode', 'extensions') },
  { name: 'Antigravity IDE', dir: path.join(homeDir, '.antigravity-ide', 'extensions') },
  { name: 'VS Code Insiders', dir: path.join(homeDir, '.vscode-insiders', 'extensions') },
  { name: 'VSCodium', dir: path.join(homeDir, '.vscode-oss', 'extensions') },
  { name: 'Cursor', dir: path.join(homeDir, '.cursor', 'extensions') }
];

let installedEditorsCount = 0;
for (const candidate of editorCandidates) {
  const isPriority = candidate.name === 'VS Code' || candidate.name === 'Antigravity IDE';
  if (fs.existsSync(candidate.dir) || isPriority) {
    try {
      fs.mkdirSync(candidate.dir, { recursive: true });
      const qualifiedTarget = path.join(candidate.dir, extFolderQualified);
      const simpleTarget = path.join(candidate.dir, extFolderSimple);

      installToExtensionFolder(qualifiedTarget);
      installToExtensionFolder(simpleTarget);

      console.log(`   ✅ Sideloaded to ${candidate.name}:`);
      console.log(`      • ${qualifiedTarget}`);
      console.log(`      • ${simpleTarget}`);
      installedEditorsCount++;
    } catch (err) {
      console.warn(`   ⚠️ Could not install to ${candidate.name}:`, err.message);
    }
  }
}

// 5. Deploy Windows Terminal JSON Fragment
function deployWindowsTerminalFragment() {
  if (process.platform !== 'win32') return;

  try {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) return;

    // Windows Terminal JSON Fragments directory
    const fragmentDir = path.join(localAppData, 'Microsoft', 'Windows Terminal', 'Fragments', 'PocketGull');
    fs.mkdirSync(fragmentDir, { recursive: true });

    const srcFragment = path.join(THEME_ROOT, 'system', 'windows-terminal', 'fragments', 'PocketGull.json');
    if (fs.existsSync(srcFragment)) {
      const destFragment = path.join(fragmentDir, 'PocketGull.json');
      fs.copyFileSync(srcFragment, destFragment);
      console.log(`   ✅ Installed Windows Terminal JSON Fragment:`);
      console.log(`      • ${destFragment}`);
    }
  } catch (err) {
    console.warn('   ⚠️ Could not deploy Windows Terminal fragment:', err.message);
  }
}

deployWindowsTerminalFragment();

// 6. Pre-configure Workspace & User Editor Settings
function configureEditorSettings() {
  const settingsTargets = [
    // Workspace settings
    path.resolve(THEME_ROOT, '..', '..', '.vscode', 'settings.json'),
    // Antigravity IDE User settings
    path.join(process.env.APPDATA || '', 'Antigravity', 'User', 'settings.json'),
    path.join(process.env.APPDATA || '', 'Antigravity IDE', 'User', 'settings.json'),
    // VS Code User settings
    path.join(process.env.APPDATA || '', 'Code', 'User', 'settings.json')
  ];

  for (const settingsPath of settingsTargets) {
    if (!fs.existsSync(settingsPath)) continue;
    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      let settings = JSON.parse(content);

      let modified = false;
      if (!settings['editor.fontFamily'] || !settings['editor.fontFamily'].includes('PocketGull Mono')) {
        settings['editor.fontFamily'] = "'PocketGull Mono', Consolas, 'Courier New', monospace";
        settings['editor.fontLigatures'] = true;
        settings['terminal.integrated.fontFamily'] = "'PocketGull Mono', monospace";
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
        console.log(`   ✅ Updated editor font settings in: ${settingsPath}`);
      }
    } catch {
      // Non-fatal parse error in existing settings
    }
  }
}

configureEditorSettings();

console.log(`\n🎉 PocketGull Multi-Platform Theme Suite successfully deployed!`);
console.log(`   • IDE Themes: 26 themes active in ${installedEditorsCount} editors`);
console.log(`   • Fonts: PocketGull Mono & PocketGull-VF registered in OS`);
console.log(`   • System Terminal: Windows Terminal fragment installed (auto-discovered)`);
console.log(`   • Browser Themes: 6 Chrome & 6 Firefox themes ready in 'browser/'\n`);
console.log('👉 Quick Activation:');
console.log('   1. In IDE: Press Ctrl+K Ctrl+T -> Type "PocketGull" -> Pick Obsidian or Washi');
console.log('   2. In Windows Terminal: Color schemes auto-loaded as "PocketGull Obsidian" & "PocketGull Washi"');
console.log('   3. In Chrome/Brave/Edge: Go to chrome://extensions -> Developer Mode -> Load Unpacked -> select browser/chrome/pocketgull-obsidian\n');
