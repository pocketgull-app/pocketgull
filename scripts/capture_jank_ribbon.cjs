const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // let RAF loop compute 60fps

  await page.screenshot({ path: 'jank_detection_ribbon_screenshot.png' });
  console.log('Screenshot saved to jank_detection_ribbon_screenshot.png');

  await browser.close();
})();
