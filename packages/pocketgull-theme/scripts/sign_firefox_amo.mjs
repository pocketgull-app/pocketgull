#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * @file sign_firefox_amo.mjs
 * @description Zero-dependency Mozilla AMO v5 unlisted/listed XPI signer using Node.js v24
 * built-in `node:crypto` (HS256 JWT) and `fetch` FormData.
 *
 * Required environment variables (from https://addons.mozilla.org/developers/addon/api/key/):
 *   - AMO_JWT_ISSUER (e.g. user:12345678:987)
 *   - AMO_JWT_SECRET (hex secret string)
 * Optional:
 *   - AMO_CHANNEL    ('unlisted' default for self-distribution, or 'listed' for public store)
 *   - AMO_TARGET     (addon folder slug, default 'pocketgull-circadian-auto')
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');

const issuer = (process.env.AMO_JWT_ISSUER || '').trim();
const jwtKey = (process.env.AMO_JWT_SECRET || '').trim();
const channel = (process.env.AMO_CHANNEL || 'unlisted').trim();
const targetSlug = (process.env.AMO_TARGET || 'pocketgull-circadian-auto').trim();

if (process.argv.includes('--dry-run')) {
  const xpiCheck = path.join(THEME_ROOT, 'browser', 'firefox', 'dist', `${targetSlug}.xpi`);
  console.log(`[DRY-RUN] Ready to sign ${xpiCheck} (exists=${fs.existsSync(xpiCheck)}, channel=${channel})`);
  process.exit(0);
}

if (!issuer || !jwtKey) {
  console.error('[AMO Signer] Missing AMO_JWT_ISSUER or AMO_JWT_SECRET environment variables.');
  console.error('Generate free Mozilla Developer credentials at: https://addons.mozilla.org/developers/addon/api/key/');
  process.exit(1);
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function mintAmoJwt() {
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

async function amoFetchJson(url, options = {}) {
  const headers = {
    Authorization: `JWT ${mintAmoJwt()}`,
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AMO HTTP ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function main() {
  const distDir = path.join(THEME_ROOT, 'browser', 'firefox', 'dist');
  const unsignedXpi = path.join(distDir, `${targetSlug}.xpi`);
  const manifestPath = path.join(THEME_ROOT, 'browser', 'firefox', targetSlug, 'manifest.json');

  if (!fs.existsSync(unsignedXpi) || !fs.existsSync(manifestPath)) {
    throw new Error(`Build artifacts missing: run 'npm run build:browser && npm run package:browser' first.`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const addonId = manifest?.browser_specific_settings?.gecko?.id;
  const version = manifest?.version;

  console.log(`🦊 Uploading ${targetSlug}.xpi (${addonId} v${version}, channel=${channel}) to Mozilla AMO v5...`);
  const xpiBytes = fs.readFileSync(unsignedXpi);
  const form = new FormData();
  form.append('upload', new Blob([xpiBytes], { type: 'application/x-xpinstall' }), `${targetSlug}.xpi`);
  form.append('channel', channel);

  let uploadDetail = await amoFetchJson('https://addons.mozilla.org/api/v5/addons/upload/', {
    method: 'POST',
    body: form
  });

  const pollUrl = `https://addons.mozilla.org/api/v5/addons/upload/${encodeURIComponent(uploadDetail.uuid)}/`;
  for (let attempt = 0; attempt < 24 && !uploadDetail.processed; attempt++) {
    await new Promise(r => setTimeout(r, 5000));
    uploadDetail = await amoFetchJson(pollUrl);
    process.stdout.write('.');
  }
  console.log('');

  if (!uploadDetail.valid) {
    throw new Error(`AMO validation failed: ${JSON.stringify(uploadDetail.validation, null, 2)}`);
  }

  const versionUrl = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(addonId)}/versions/`;
  let versionDetail = await amoFetchJson(versionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload: uploadDetail.uuid })
  });

  const versionPollUrl = `${versionUrl}${encodeURIComponent(String(versionDetail.id))}/`;
  for (let attempt = 0; attempt < 24 && !versionDetail?.file?.url; attempt++) {
    await new Promise(r => setTimeout(r, 5000));
    versionDetail = await amoFetchJson(versionPollUrl);
  }

  const downloadUrl = versionDetail?.file?.url;
  if (!downloadUrl) {
    throw new Error('Timed out waiting for signed XPI download URL from Mozilla AMO.');
  }

  const dlRes = await fetch(downloadUrl, {
    headers: { Authorization: `JWT ${mintAmoJwt()}` }
  });
  if (!dlRes.ok) {
    throw new Error(`Failed downloading signed XPI: HTTP ${dlRes.status}`);
  }

  const signedBuf = Buffer.from(await dlRes.arrayBuffer());
  const signedOut = path.join(distDir, `${targetSlug}-signed.xpi`);
  fs.writeFileSync(signedOut, signedBuf);
  fs.copyFileSync(signedOut, unsignedXpi);
  console.log(`✅ Signed Mozilla Firefox XPI written to: ${signedOut}`);
}

main().catch((err) => {
  console.error(`❌ [AMO Signer] ${err.message}`);
  process.exit(1);
});
