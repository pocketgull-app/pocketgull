// Use native global fetch

const apikey = process.env.PORKBUN_API_KEY;
const secretkey = process.env.PORKBUN_SECRET_KEY;

if (!apikey || !secretkey) {
  console.error('Error: PORKBUN_API_KEY and PORKBUN_SECRET_KEY environment variables must be set.');
  process.exit(1);
}

// Google Cloud Run Domain Mapping target IPs (A and AAAA records)
const cloudRunAIPs = [
  '216.239.32.21',
  '216.239.34.21',
  '216.239.36.21',
  '216.239.38.21'
];

const cloudRunAAAAIPs = [
  '2001:4860:4802:32::15',
  '2001:4860:4802:34::15',
  '2001:4860:4802:36::15',
  '2001:4860:4802:38::15'
];

async function updateDomain(domain) {
  console.log(`\nChecking DNS records for ${domain}...`);
  try {
    // 1. Retrieve current DNS records
    const res = await fetch(`https://api.porkbun.com/api/json/v3/dns/retrieve/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey: secretkey })
    });
    
    const data = await res.json();
    if (data.status !== 'SUCCESS') {
      throw new Error(`Failed to retrieve records: ${data.message || JSON.stringify(data)}`);
    }

    // Prepare target records for this domain
    const targets = [];
    
    // Apex domain A and AAAA records
    for (const ip of cloudRunAIPs) {
      targets.push({ name: '', type: 'A', content: ip });
    }
    for (const ip of cloudRunAAAAIPs) {
      targets.push({ name: '', type: 'AAAA', content: ip });
    }

    // Subdomains CNAME records to Google Cloud Run endpoint
    for (const sub of ['www', 'api', 'lean']) {
      targets.push({ name: sub, type: 'CNAME', content: 'ghs.googlehosted.com' });
      for (const ip of cloudRunAIPs) {
        targets.push({ name: sub, type: 'A', content: ip });
      }
      for (const ip of cloudRunAAAAIPs) {
        targets.push({ name: sub, type: 'AAAA', content: ip });
      }
    }

    // GitHub Pages custom domain
    targets.push({ name: 'typeface', type: 'CNAME', content: 'philgear.github.io' });

    const existingRecords = data.records || [];

    // 2. Add or verify target records
    for (const target of targets) {
      const recordName = target.name ? `${target.name}.${domain}` : domain;
      const match = existingRecords.find(r => 
        r.name === recordName && 
        r.type === target.type && 
        r.content === target.content
      );

      if (match) {
        console.log(`[PASS] Record ${target.type} for ${recordName || '@'} is already pointing to ${target.content}`);
      } else {
        console.log(`[CREATE] Creating new ${target.type} record for ${recordName || '@'} pointing to ${target.content}...`);
        const createRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/create/${domain}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apikey,
            secretapikey: secretkey,
            name: target.name,
            type: target.type,
            content: target.content,
            ttl: 600
          })
        });
        const createData = await createRes.json();
        if (createData.status === 'SUCCESS') {
          console.log(`[SUCCESS] Created ${recordName || '@'} (${target.type} -> ${target.content}) successfully.`);
        } else {
          console.error(`[ERROR] Failed to create ${recordName || '@'} (${target.type}): ${createData.message}`);
        }
      }
    }

    // 3. Clean up stale A and AAAA records for apex and www that are NOT in target
    for (const existing of existingRecords) {
      if (existing.type !== 'A' && existing.type !== 'AAAA') continue;
      
      const isApex = existing.name === domain;
      const isWww = existing.name === `www.${domain}`;
      if (!isApex && !isWww) continue;

      const sub = isWww ? 'www' : '';
      const inTarget = targets.some(t => 
        t.name === sub && 
        t.type === existing.type && 
        t.content === existing.content
      );

      if (!inTarget) {
        console.log(`[CLEAN] Deleting stale ${existing.type} record for ${existing.name} pointing to ${existing.content}...`);
        const deleteRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/delete/${domain}/${existing.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apikey, secretapikey: secretkey })
        });
        const deleteData = await deleteRes.json();
        if (deleteData.status === 'SUCCESS') {
          console.log(`[SUCCESS] Deleted stale record ${existing.id} successfully.`);
        } else {
          console.error(`[ERROR] Failed to delete stale record ${existing.id}: ${deleteData.message}`);
        }
      }
    }

  } catch (err) {
    console.error(`Error processing domain ${domain}:`, err.message);
  }
}

async function main() {
  await updateDomain('pocketgull.app');
  await updateDomain('pocketgull.com');
  await updateDomain('pocketgall.com');
}

main();
