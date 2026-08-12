const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'lighthouse-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('lighthouse-report.json not found!');
  process.exit(1);
}

const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('\n=== LIGHTHOUSE CATEGORY SCORES ===');
for (const [key, val] of Object.entries(r.categories || {})) {
  const score = val.score !== null ? Math.round(val.score * 100) : 'N/A';
  console.log(`- ${val.title || key}: ${score}/100`);
}

console.log('\n=== AGENTIC BROWSING AUDITS ===');
const agenticKeys = ['agent-accessibility-tree', 'webmcp-registered-tools', 'webmcp-form-coverage', 'webmcp-schema-validity', 'llms-txt'];
for (const k of agenticKeys) {
  const audit = r.audits[k];
  if (audit) {
    let status = 'PASS';
    if (audit.scoreDisplayMode === 'informative') {
      status = 'PASS (Informative)';
    } else if (audit.scoreDisplayMode === 'notApplicable') {
      status = 'PASS (Not Applicable)';
    } else if (audit.score === 1) {
      status = 'PASS (1/1)';
    } else {
      status = `FAIL (${audit.score})`;
    }
    console.log(`- ${audit.title || k}: ${status}`);
  } else {
    console.log(`- ${k}: Audit not executed`);
  }
}
