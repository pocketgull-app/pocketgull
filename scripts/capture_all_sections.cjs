const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:8080', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Capture Digital Twin Lazy Susan section
  const twin = page.locator('#digital-twin');
  await twin.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await twin.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/lazy_susan_fixed_screenshot.png' });
  console.log('Saved lazy_susan_fixed_screenshot.png');

  // Capture WHO & NIH section
  const who = page.locator('#global-health');
  await who.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await who.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/who_nih_fixed_screenshot.png' });
  console.log('Saved who_nih_fixed_screenshot.png');

  await browser.close();
})();
