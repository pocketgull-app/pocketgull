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

const txtToken = process.argv[2] || 'google-site-verification=7DLtI4w7G-9eR3NFT3fg__TccuAlzKDTsLN-nVnC9X4';

async function addTxtRecord(domain, content) {
  console.log(`Adding TXT record to Porkbun for ${domain}: "${content}"...`);
  const res = await fetch(`https://api.porkbun.com/api/json/v3/dns/create/${domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey,
      secretapikey: secretkey,
      name: '',
      type: 'TXT',
      content: content,
      ttl: 300
    })
  });
  const data = await res.json();
  console.log(`Porkbun Response for ${domain}:`, data);
}

async function main() {
  await addTxtRecord('pocketgull.com', txtToken);
  await addTxtRecord('pocketgall.com', txtToken);
}

main();
