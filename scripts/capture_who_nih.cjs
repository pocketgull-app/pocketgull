const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  
  await page.goto('http://localhost:8080', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const el = page.locator('#global-health');
  await el.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/who_nih_showcase_screenshot.png' });
  console.log('Saved who_nih_showcase_screenshot.png');

  await browser.close();
})();
