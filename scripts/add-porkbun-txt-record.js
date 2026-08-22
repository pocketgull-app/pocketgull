// scripts/add-porkbun-txt-record.js
const apikey = process.env.PORKBUN_API_KEY;
const secretapikey = process.env.PORKBUN_SECRET_KEY || process.env.PORKBUN_SECRET_API_KEY;

if (!apikey || !secretapikey) {
  console.error('❌ Error: PORKBUN_API_KEY and PORKBUN_SECRET_KEY environment variables must be set.');
  console.log('Usage: PORKBUN_API_KEY="pk1_..." PORKBUN_SECRET_KEY="sk1_..." node scripts/add-porkbun-txt-record.js');
  process.exit(1);
}

const domain = 'pocketgull.app';
const subdomain = '_github-pages-challenge-philgear';
const content = '399f429d911a775ee74719ee6ae762';

async function addTxtRecord() {
  console.log(`📡 Adding TXT record to Porkbun for ${subdomain}.${domain}...`);
  try {
    const res = await fetch(`https://api.porkbun.com/api/json/v3/dns/create/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey,
        secretapikey,
        name: subdomain,
        type: 'TXT',
        content: content,
        ttl: '600'
      })
    });

    const data = await res.json();
    if (data.status === 'SUCCESS') {
      console.log(`✅ [SUCCESS] Created TXT record on Porkbun! Record ID: ${data.id}`);
      console.log(`Host: ${subdomain}.${domain}`);
      console.log(`Value: ${content}`);
    } else {
      console.error(`❌ [FAILED] Porkbun API returned error:`, data.message || JSON.stringify(data));
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Network error communicating with Porkbun API:', err);
    process.exit(1);
  }
}

addTxtRecord();
