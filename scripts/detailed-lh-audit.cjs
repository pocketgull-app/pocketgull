const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'lighthouse-report.json');
const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('\n=== FAILING AUDITS (Score < 1.0) ===');
for (const [id, audit] of Object.entries(r.audits)) {
  if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative') {
    console.log(`\n[${id}] ${audit.title} (Score: ${audit.score})`);
    if (audit.displayValue) console.log(`  Value: ${audit.displayValue}`);
    if (audit.explanation) console.log(`  Explanation: ${audit.explanation}`);
    if (audit.details && audit.details.items && audit.details.items.length > 0) {
      console.log('  Items:', audit.details.items.slice(0, 3));
    }
  }
}
