const { chromium } = require('playwright');
const axeCore = require('axe-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

  // Evaluate axe-core source directly inside page context
  await page.evaluate(axeCore.source);

  const results = await page.evaluate(async () => {
    return await window.axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      }
    });
  });

  console.log('--- AXE ACCESSIBILITY AUDIT ---');
  console.log(`Violations: ${results.violations.length}`);
  for (const v of results.violations) {
    console.log(`\n[${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
    console.log(`Help: ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`  - Target: ${node.target.join(', ')}`);
      console.log(`    HTML: ${node.html.slice(0, 100)}`);
      console.log(`    Failure: ${node.failureSummary}`);
    }
  }

  console.log(`\nPasses: ${results.passes.length}`);
  console.log(`Incomplete: ${results.incomplete.length}`);

  await browser.close();
})();
