#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * @file sign_firefox_amo.mjs
 * @description Mozilla AMO v5 unlisted/listed XPI signer using Node.js v24 built-in
 * `node:crypto` (HS256 JWT) and `fetch` FormData.
 *
 * Automatically:
 *   1. Loads AMO_JWT_ISSUER and AMO_JWT_SECRET from root `.env` (or prompts interactively in TTY)
 *   2. Re-packages the latest Firefox manifest into `dist/<slug>.xpi` so AMO rules stay synced
 *   3. Handles both first-time AMO add-on creation and subsequent version updates
 *   4. Writes `<slug>-signed.xpi` into `packages/pocketgull-theme/browser/firefox/dist/`
 */

import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(THEME_ROOT, '..', '..');
const ROOT_ENV_PATH = path.join(WORKSPACE_ROOT, '.env');
const AMO_KEYS_URL = 'https://addons.mozilla.org/developers/addon/api/key/';

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    let v = trimmed.slice(eqIdx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) {
      process.env[k] = v;
    }
  }
}

function upsertEnvVar(filePath, key, value) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const lineRegex = new RegExp(`^\\s*${escaped}\\s*=.*$`, 'm');
  const nextLine = `${key}=${value}`;
  if (lineRegex.test(content)) {
    content = content.replace(lineRegex, nextLine);
  } else {
    content = content.trimEnd() + (content.length ? '\n' : '') + `${nextLine}\n`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function openUrlInBrowser(url) {
  if (process.platform === 'win32') {
    const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true });
    child.unref();
  } else if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  } else {
    const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  }
}

function askLine(rl, promptText) {
  return new Promise((resolve) => rl.question(promptText, (ans) => resolve(ans.trim())));
}

function buildFreshXpi(targetSlug) {
  const srcDir = path.join(THEME_ROOT, 'browser', 'firefox', targetSlug);
  const manifestPath = path.join(srcDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Firefox theme directory not found: ${srcDir}`);
  }
  const distDir = path.join(THEME_ROOT, 'browser', 'firefox', 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  const outXpi = path.join(distDir, `${targetSlug}.xpi`);

  const zip = new AdmZip();
  zip.addLocalFolder(srcDir);
  zip.writeZip(outXpi);
  return { outXpi, manifestPath, distDir };
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function mintAmoJwt(issuer, jwtKey) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: issuer,
    jti: crypto.randomUUID(),
    iat: nowSec,
    exp: nowSec + 180
  };
  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const sig = crypto.createHmac('sha256', jwtKey).update(signingInput).digest();
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

async function amoRequest(url, issuer, jwtKey, options = {}) {
  const headers = {
    Authorization: `JWT ${mintAmoJwt(issuer, jwtKey)}`,
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, text, json };
}

async function ensureCredentialsInteractive() {
  let issuer = (process.env.AMO_JWT_ISSUER || '').trim();
  let jwtKey = (process.env.AMO_JWT_SECRET || '').trim();
  if (issuer && jwtKey) return { issuer, jwtKey };

  if (!process.stdin.isTTY || process.argv.includes('--no-prompt')) {
    console.error('\n🦊 [AMO Signer] AMO_JWT_ISSUER and AMO_JWT_SECRET are not set in .env yet.');
    console.error(`   1. Open: ${AMO_KEYS_URL}`);
    console.error('   2. Add AMO_JWT_ISSUER and AMO_JWT_SECRET to your root .env file (or run `npm run sign:firefox` in an interactive terminal).\n');
    process.exit(1);
  }

  console.log('\n🦊 PocketGull Firefox AMO One-Time Setup');
  console.log('──────────────────────────────────────────────────────');
  console.log(`Mozilla signs private Firefox add-ons for free via:\n  ${AMO_KEYS_URL}\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    await askLine(rl, 'Press Enter to open Mozilla Developer API Keys in your browser (or Ctrl+C to cancel)... ');
    openUrlInBrowser(AMO_KEYS_URL);
    issuer = await askLine(rl, '\nPaste JWT Issuer (looks like user:12345678:987): ');
    jwtKey = await askLine(rl, 'Paste JWT Secret (hex string): ');
  } finally {
    rl.close();
  }

  if (!issuer || !jwtKey) {
    console.error('❌ Cancelled — both JWT Issuer and JWT Secret are required.');
    process.exit(1);
  }

  upsertEnvVar(ROOT_ENV_PATH, 'AMO_JWT_ISSUER', issuer);
  upsertEnvVar(ROOT_ENV_PATH, 'AMO_JWT_SECRET', jwtKey);
  console.log('✅ Saved AMO credentials to local .env (gitignored).\n');
  return { issuer, jwtKey };
}

async function main() {
  loadDotEnvFile(ROOT_ENV_PATH);
  loadDotEnvFile(path.join(THEME_ROOT, '.env'));

  const channel = (process.env.AMO_CHANNEL || 'unlisted').trim();
  const targetSlug = (process.env.AMO_TARGET || 'pocketgull-circadian-auto').trim();
  const { outXpi, manifestPath, distDir } = buildFreshXpi(targetSlug);

  if (process.argv.includes('--dry-run')) {
    console.log(`[DRY-RUN] Repacked and verified ${outXpi} (channel=${channel})`);
    return;
  }

  const { issuer, jwtKey } = await ensureCredentialsInteractive();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const addonId = manifest?.browser_specific_settings?.gecko?.id;
  const version = manifest?.version;

  console.log(`🦊 Uploading ${targetSlug}.xpi (${addonId} v${version}, channel=${channel}) to Mozilla AMO v5...`);
  const xpiBytes = fs.readFileSync(outXpi);
  const form = new FormData();
  form.append('upload', new Blob([xpiBytes], { type: 'application/x-xpinstall' }), `${targetSlug}.xpi`);
  form.append('channel', channel);

  const uploadRes = await amoRequest('https://addons.mozilla.org/api/v5/addons/upload/', issuer, jwtKey, {
    method: 'POST',
    body: form
  });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed (HTTP ${uploadRes.status}): ${uploadRes.text}`);
  }

  let uploadDetail = uploadRes.json;
  const pollUploadUrl = `https://addons.mozilla.org/api/v5/addons/upload/${encodeURIComponent(uploadDetail.uuid)}/`;
  for (let attempt = 0; attempt < 30 && !uploadDetail.processed; attempt++) {
    await new Promise((r) => setTimeout(r, 4000));
    const p = await amoRequest(pollUploadUrl, issuer, jwtKey);
    if (!p.ok) throw new Error(`Upload poll failed (HTTP ${p.status}): ${p.text}`);
    uploadDetail = p.json;
    process.stdout.write('.');
  }
  console.log('');

  if (!uploadDetail.valid) {
    throw new Error(`AMO linter rejected package:\n${JSON.stringify(uploadDetail.validation, null, 2)}`);
  }

  // Check whether add-on already exists on AMO or needs initial creation
  const addonUrl = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(addonId)}/`;
  const existingCheck = await amoRequest(addonUrl, issuer, jwtKey);

  let versionId = null;
  if (existingCheck.status === 404) {
    console.log('   → First-time AMO submission detected; creating unlisted add-on record...');
    const createRes = await amoRequest('https://addons.mozilla.org/api/v5/addons/addon/', issuer, jwtKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: { upload: uploadDetail.uuid } })
    });
    if (!createRes.ok) {
      throw new Error(`Add-on creation failed (HTTP ${createRes.status}): ${createRes.text}`);
    }
    versionId = createRes.json?.current_version?.id || createRes.json?.latest_unlisted_version?.id;
  } else if (existingCheck.ok) {
    console.log('   → Existing AMO add-on found; attaching new version...');
    const verRes = await amoRequest(`${addonUrl}versions/`, issuer, jwtKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload: uploadDetail.uuid })
    });
    if (!verRes.ok) {
      throw new Error(`Version creation failed (HTTP ${verRes.status}): ${verRes.text}`);
    }
    versionId = verRes.json?.id;
  } else {
    throw new Error(`Add-on lookup failed (HTTP ${existingCheck.status}): ${existingCheck.text}`);
  }

  console.log('   → Waiting for Mozilla cryptographic signature (META-INF/mozilla.rsa)...');
  let signedDownloadUrl = null;
  for (let attempt = 0; attempt < 36 && !signedDownloadUrl; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));
    const checkUrl = versionId
      ? `${addonUrl}versions/${encodeURIComponent(String(versionId))}/`
      : `${addonUrl}versions/?filter=all_with_unlisted`;
    const vPoll = await amoRequest(checkUrl, issuer, jwtKey);
    if (vPoll.ok && vPoll.json) {
      const verObj = versionId ? vPoll.json : vPoll.json?.results?.[0];
      const fileObj = verObj?.file;
      if (fileObj?.status === 'public' && fileObj?.url) {
        signedDownloadUrl = fileObj.url;
      }
    }
    process.stdout.write('.');
  }
  console.log('');

  if (!signedDownloadUrl) {
    throw new Error('Timed out waiting for Mozilla AMO signature approval. Check https://addons.mozilla.org/developers/addons');
  }

  const dlRes = await fetch(signedDownloadUrl, {
    headers: { Authorization: `JWT ${mintAmoJwt(issuer, jwtKey)}` }
  });
  if (!dlRes.ok) {
    throw new Error(`Failed downloading signed XPI (HTTP ${dlRes.status})`);
  }

  const signedBuf = Buffer.from(await dlRes.arrayBuffer());
  const signedOut = path.join(distDir, `${targetSlug}-signed.xpi`);
  fs.writeFileSync(signedOut, signedBuf);
  fs.copyFileSync(signedOut, outXpi);

  console.log(`\n✅ Signed Firefox extension saved to:\n   ${signedOut}`);
  console.log('\n👉 Install once into standard release Firefox with:');
  console.log('   pwsh -File packages/pocketgull-theme/scripts/install_browser_theme.ps1 -Browser Firefox -SignedXpi\n');
}

main().catch((err) => {
  console.error(`\n❌ [AMO Signer] ${err.message}`);
  process.exit(1);
});
