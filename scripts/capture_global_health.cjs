const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const count = await page.locator('#global-health').count();
  console.log('Count of #global-health elements:', count);

  if (count > 0) {
    const el = page.locator('#global-health');
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await el.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/global_health_section_screenshot.png' });
    console.log('Successfully saved global_health_section_screenshot.png');
  }

  await browser.close();
})();
