const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  let errorCount = 0;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
      errorCount++;
    }
  });

  await page.goto('http://localhost:8080', { waitUntil: 'load' });
  console.log('[LOCAL SERVER 8080] Page Title:', await page.title());
  console.log('[LOCAL SERVER 8080] Lazy Susan Stage:', await page.textContent('#stageTitle'));
  console.log('[LOCAL SERVER 8080] WHO/NIH Section Count:', await page.locator('#global-health').count());
  console.log('[LOCAL SERVER 8080] Enterprise ROI Count:', await page.locator('#enterprise-roi').count());
  console.log('[LOCAL SERVER 8080] Total Errors:', errorCount);

  await browser.close();
})();
