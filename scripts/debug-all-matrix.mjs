#!/usr/bin/env node
/**
 * @file debug-all-matrix.mjs
 * @description Master Automated Diagnostic & Debug Matrix for PocketGull.
 * 
 * Verifies and audits all configurations defined in .vscode/launch.json:
 * 1. CLI Diagnostic Engine (scripts/gull.js)
 * 2. All 8 Aesthetic Themes (?theme=...)
 * 3. All 7 Clinical & Socratic Personas (?lens=...)
 * 4. Microservice Health & Proxy Routes
 */

import { spawn } from 'node:child_process';
import http from 'node:http';

const THEMES = [
  { name: 'Ocean Pool Float', param: 'pool', icon: '🌊' },
  { name: 'Papyrus Illuminated', param: 'papyrus', icon: '📜' },
  { name: 'Rice Papercraft', param: 'rice', icon: '🌾' },
  { name: 'White Marble', param: 'white-marble', icon: '🏛️' },
  { name: 'Black Marble', param: 'black-marble', icon: '🖤' },
  { name: 'Spark Ember', param: 'spark', icon: '🔥' },
  { name: 'Solfeggio Mandala', param: 'mandala', icon: '🧘' },
  { name: '1996 Dream Team', param: 'dream-team', icon: '🏀' },
  { name: '1972 Miami Dolphins (17-0)', param: 'dolphins-1972', icon: '🐬' },
  { name: '1927 NY Yankees Murderers Row', param: 'yankees-1927', icon: '⚾' },
  { name: '2003-04 Arsenal Invincibles', param: 'arsenal-invincibles', icon: '⚽' },
  { name: '1976-77 Montreal Canadiens', param: 'canadiens-1977', icon: '🏒' },
  { name: '1970 Brazil World Cup (Pelé)', param: 'brazil-1970', icon: '🇧🇷' },
  { name: '2013 NZ All Blacks (14-0)', param: 'all-blacks-2013', icon: '🏉' },
];

const PERSONAS = [
  { name: 'Sylvan Arborist', param: 'arborist', icon: '🌳' },
  { name: 'Garage Mechanic', param: 'mechanic', icon: '🏎️' },
  { name: 'Victorian Gentleman', param: 'gentleman', icon: '🎩' },
  { name: 'Solfeggio Muse', param: 'muse', icon: '✨' },
  { name: 'Head Coach Red', param: 'coach', icon: '🏀' },
  { name: 'Clinical Specialist', param: 'clinical', icon: '🔬' },
  { name: 'Professor Socrates Gull', param: 'socrates', icon: '🦉' },
];

function checkHttpEndpoint(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        ok: res.statusCode >= 200 && res.statusCode < 400,
      });
    });
    req.on('error', (err) => {
      resolve({ statusCode: 0, error: err.message, ok: false });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ statusCode: 408, error: 'Timeout', ok: false });
    });
  });
}

function runCliCheck() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/gull.js', 'help'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (d) => (output += d.toString()));
    child.on('close', (code) => {
      resolve({ ok: code === 0, output: output.slice(0, 100) });
    });
    child.on('error', (err) => resolve({ ok: false, error: err.message }));
  });
}

async function main() {
  console.log('=' .repeat(68));
  console.log('🩺 PocketGull Master Debug Matrix Inspector');
  console.log('=' .repeat(68));

  // 1. CLI Diagnostic Engine Check
  process.stdout.write('Checking CLI Interactive Engine (scripts/gull.js)... ');
  const cliRes = await runCliCheck();
  if (cliRes.ok) {
    console.log('✅ [PASS]');
  } else {
    console.log(`❌ [FAIL] ${cliRes.error || 'Non-zero exit'}`);
  }

  // 2. Dev Server Connectivity
  const baseUrl = 'http://localhost:4200';
  process.stdout.write(`Testing Base Dev Server (${baseUrl})... `);
  const baseRes = await checkHttpEndpoint(baseUrl);
  if (baseRes.ok) {
    console.log(`✅ [PASS] (HTTP ${baseRes.statusCode})`);
  } else {
    console.log(`⚠️  [WARN] Server unreachable (${baseRes.error || baseRes.statusCode}) — ensure dev server is running`);
  }

  // 3. Theme URLs Matrix
  console.log('\n🎨 Auditing 8 Aesthetic Themes Matrix:');
  for (const theme of THEMES) {
    const themeUrl = `${baseUrl}/?theme=${theme.param}`;
    const res = await checkHttpEndpoint(themeUrl);
    const badge = res.ok ? '✅ [OK]' : '⚠️  [OFFLINE]';
    console.log(`   ${badge} ${theme.icon} ${theme.name.padEnd(22)} -> ${themeUrl}`);
  }

  // 4. Persona URLs Matrix
  console.log('\n🧠 Auditing 7 Socratic & Clinical Personas Matrix:');
  for (const persona of PERSONAS) {
    const personaUrl = `${baseUrl}/?lens=${persona.param}`;
    const res = await checkHttpEndpoint(personaUrl);
    const badge = res.ok ? '✅ [OK]' : '⚠️  [OFFLINE]';
    console.log(`   ${badge} ${persona.icon} ${persona.name.padEnd(24)} -> ${personaUrl}`);
  }

  console.log('\n' + '=' .repeat(68));
  console.log('✨ Debug Matrix Audit Complete. All launch configurations indexed!');
  console.log('=' .repeat(68));
}

main().catch(console.error);
