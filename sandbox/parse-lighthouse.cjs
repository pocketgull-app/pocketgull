const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'lighthouse_report.report.json');
const outputPath = process.env.LIGHTHOUSE_REPORT_OUT || path.join(process.cwd(), 'lighthouse_audit_report.md');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = data.categories;

const score = (category) => (category && category.score !== null) ? Math.round(category.score * 100) : 'N/A';

const md = `# Lighthouse Audit Results

**Audited URL:** ${data.finalDisplayedUrl}
**Fetch Time:** ${new Date(data.fetchTime).toLocaleString()}

## Overall Scores

- **Performance:** ${score(categories.performance)}
- **Accessibility:** ${score(categories.accessibility)}
- **Best Practices:** ${score(categories['best-practices'])}
- **SEO:** ${score(categories.seo)}

## Key Performance Metrics

- **First Contentful Paint (FCP):** ${data.audits['first-contentful-paint'].displayValue}
- **Largest Contentful Paint (LCP):** ${data.audits['largest-contentful-paint'].displayValue}
- **Total Blocking Time (TBT):** ${data.audits['total-blocking-time'].displayValue}
- **Cumulative Layout Shift (CLS):** ${data.audits['cumulative-layout-shift'].displayValue}
- **Speed Index:** ${data.audits['speed-index'].displayValue}

A full HTML report was also generated at \`lighthouse_report.html\`.
`;

fs.writeFileSync(outputPath, md);
console.log('Markdown report generated successfully.');
