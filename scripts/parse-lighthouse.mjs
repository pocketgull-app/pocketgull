import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));

console.log('--- LIGHTHOUSE AUDIT RESULTS ---');
if (data.categories) {
  for (const [key, category] of Object.entries(data.categories)) {
    const score = Math.round((category.score || 0) * 100);
    console.log(`${category.title}: ${score}/100`);
  }
}

console.log('\n--- AGENTIC & WEBMCP AUDITS ---');
const agenticAudits = ['webmcp-registered-tools', 'webmcp-form-coverage', 'webmcp-schemas-valid', 'llms-txt'];
for (const auditId of agenticAudits) {
  if (data.audits && data.audits[auditId]) {
    const audit = data.audits[auditId];
    console.log(`- ${audit.title}: ${audit.score === 1 ? 'PASS ✅' : 'FAIL ❌'} (${audit.displayValue || ''})`);
    if (audit.details) {
      console.log(`  Full Details:`, JSON.stringify(audit.details, null, 2));
    }
  }
}
