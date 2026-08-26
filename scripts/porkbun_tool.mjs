/**
 * 🐷 Porkbun API & DNS Management Tool
 * Queries and updates DNS records, domain status, and email forwarding rules via Porkbun v3 API.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function loadEnv(filepath) {
  if (!fs.existsSync(filepath)) return {};
  const content = fs.readFileSync(filepath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      env[key] = val;
    }
  }
  return env;
}

const env = {
  ...loadEnv(path.join(rootDir, '.env')),
  ...loadEnv(path.join(rootDir, '.env.local')),
  ...process.env
};

const apikey = env.PORKBUN_API_KEY;
const secretapikey = env.PORKBUN_SECRET_KEY || env.PORKBUN_SECRET_API_KEY;

export async function porkbunRequest(endpoint, payload = {}) {
  if (!apikey || !secretapikey) {
    throw new Error(
      'Missing PORKBUN_API_KEY or PORKBUN_SECRET_KEY. Please provide your Porkbun API keys in .env or environment variables.'
    );
  }

  const url = `https://api.porkbun.com/api/json/v3/${endpoint.replace(/^\//, '')}`;
  const body = JSON.stringify({
    apikey,
    secretapikey,
    ...payload
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });

  const json = await res.json();
  return json;
}

export async function pingPorkbun() {
  return await porkbunRequest('ping');
}

export async function getDnsRecords(domain) {
  return await porkbunRequest(`dns/retrieve/${domain}`);
}

export async function getEmailForwarding(domain) {
  return await porkbunRequest(`domain/getEmailForwarding/${domain}`);
}

export async function createDnsRecord(domain, { name, type, content, ttl = '600', prio = '' }) {
  return await porkbunRequest(`dns/create/${domain}`, {
    name,
    type,
    content,
    ttl: String(ttl),
    prio: prio ? String(prio) : undefined
  });
}

// CLI Execution Handler
if (process.argv[1] && process.argv[1].endsWith('porkbun_tool.mjs')) {
  const command = process.argv[2] || 'ping';
  const targetDomain = process.argv[3] || 'pocketgull.app';

  (async () => {
    try {
      console.log(`📡 Executing Porkbun API: ${command} for ${targetDomain}...`);
      if (command === 'ping') {
        const res = await pingPorkbun();
        console.log('✅ Porkbun Ping Status:', res);
      } else if (command === 'dns' || command === 'records') {
        const res = await getDnsRecords(targetDomain);
        console.log(`📋 DNS Records for ${targetDomain}:`, JSON.stringify(res, null, 2));
      } else if (command === 'email' || command === 'forwarding') {
        const res = await getEmailForwarding(targetDomain);
        console.log(`📬 Email Forwarding for ${targetDomain}:`, JSON.stringify(res, null, 2));
      } else {
        console.log(`Unknown command: ${command}. Use 'ping', 'dns <domain>', or 'email <domain>'.`);
      }
    } catch (err) {
      console.error('❌ Porkbun Request Failed:', err.message);
    }
  })();
}
