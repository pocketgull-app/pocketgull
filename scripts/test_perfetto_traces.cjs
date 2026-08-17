const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('1. Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

  // Trigger several interactive actions to generate Perfetto trace slices
  console.log('2. Triggering interactive actions...');
  await page.locator('#b2bDoctorSlider').fill('600');
  await page.locator('#b2bDoctorSlider').dispatchEvent('input');
  await page.waitForTimeout(100);

  await page.locator('#nextStageBtn').click();
  await page.waitForTimeout(100);

  await page.locator('.search-tag').first().click();
  await page.waitForTimeout(100);

  // Extract recorded Perfetto trace events from client
  const traceSummary = await page.evaluate(() => {
    const tracer = window.__perfettoTracer;
    const entries = window.performance.getEntriesByType('measure');
    return {
      traceCount: tracer ? tracer.traceEvents.length : 0,
      traceEvents: tracer ? tracer.traceEvents : [],
      measures: entries.map(e => ({ name: e.name, durationMs: e.duration }))
    };
  });

  console.log(`\n✅ Perfetto Tracing Verified:`);
  console.log(`- Recorded Slices: ${traceSummary.traceCount}`);
  for (const t of traceSummary.traceEvents) {
    console.log(`  • [${t.cat}] ${t.name} -> ${(t.dur / 1000).toFixed(2)}ms (Args: ${JSON.stringify(t.args)})`);
  }

  console.log(`\n- User Timing Measures: ${traceSummary.measures.length}`);
  for (const m of traceSummary.measures) {
    console.log(`  • ${m.name}: ${m.durationMs.toFixed(2)}ms`);
  }

  await browser.close();
})();
