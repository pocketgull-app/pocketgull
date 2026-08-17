import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const apikey = process.env.PORKBUN_API_KEY;
const secretkey = process.env.PORKBUN_SECRET_KEY;

async function cleanAcmeRecords(domain) {
  const res = await fetch(`https://api.porkbun.com/api/json/v3/dns/retrieve/${domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey, secretapikey: secretkey })
  });
  const data = await res.json();
  for (const record of data.records || []) {
    if (record.name.startsWith('_acme-challenge')) {
      console.log(`Deleting stale ACME record ID ${record.id} (${record.name})...`);
      const delRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/delete/${domain}/${record.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey, secretapikey: secretkey })
      });
      const delData = await delRes.json();
      console.log(`Delete Result for ${record.id}:`, delData);
    }
  }
}

cleanAcmeRecords('pocketgull.com');
