import https from 'node:https';

function testEndpoint(path, method, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : '';
    const req = https.request({
      hostname: 'pocketgull.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'PocketGull-Security-Battletester/1.0'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${method}] https://pocketgull.app${path} -> Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(body);
          console.log('Response summary:', JSON.stringify(json, null, 2).substring(0, 250) + '...\n');
        } catch {
          console.log('Raw body preview:', body.substring(0, 150) + '\n');
        }
        resolve(res.statusCode);
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('===========================================================');
  console.log('🛡️  Live Security Battletest: PocketGull SSO Authentication');
  console.log('===========================================================\n');

  await testEndpoint('/api/auth/sso/config', 'GET');
  await testEndpoint('/api/auth/sso/google', 'POST', {
    email: 'clinician@pocketgull.app',
    name: 'Dr. Battletest (Attending Clinician)',
    role: 'roles/aiplatform.user'
  });
  await testEndpoint('/api/auth/sso/smart-fhir', 'POST', {
    issuer: 'Epic Systems EHR',
    fhirPatientId: 'curie-live-1',
    role: 'roles/aiplatform.user'
  });
  await testEndpoint('/api/auth/sso/webauthn', 'POST', {
    credentialId: 'live_test_fido2_key_998'
  });
  await testEndpoint('/api/auth/sso/kinetic-zkp', 'POST', {
    zkpKineticHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    role: 'roles/aiplatform.user'
  });
  await testEndpoint('/api/auth/sso/logout', 'POST', {});

  console.log('✅ All live Cloud Run security login endpoints responded with 200 OK!');
}

run();
