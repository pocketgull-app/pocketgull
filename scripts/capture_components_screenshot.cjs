const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching headless browser to screenshot #components...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  let loaded = false;
  try {
    console.log('Navigating to https://pocketgull.app/business...');
    await page.goto('https://pocketgull.app/business', { waitUntil: 'networkidle', timeout: 20000 });
    loaded = true;
  } catch (err) {
    console.log('Remote load failed, attempting local URL or HTML fallback:', err.message);
  }

  if (!loaded) {
    const filePath = path.resolve(__dirname, '../dist/browser/index.html');
    if (fs.existsSync(filePath)) {
      await page.goto('file://' + filePath);
    }
  }

  // Find components section and scroll into view
  const selector = '#components';
  await page.waitForSelector(selector, { timeout: 10000 }).catch(() => null);
  const element = await page.$(selector);

  if (element) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }

  const artDir = 'C:\\Users\\philg\\.gemini\\antigravity\\brain\\ac363530-9984-419f-8818-08671799635a';
  const screenshotPath1 = path.join(artDir, 'components_section_screenshot.png');
  const screenshotPathFull = path.join(artDir, 'components_section_full.png');

  if (element) {
    await element.screenshot({ path: screenshotPath1 });
    console.log('Captured element screenshot:', screenshotPath1);
  } else {
    await page.screenshot({ path: screenshotPath1, fullPage: true });
    console.log('Captured fullpage screenshot fallback:', screenshotPath1);
  }

  await page.screenshot({ path: screenshotPathFull, fullPage: false });
  console.log('Captured viewport screenshot:', screenshotPathFull);

  await browser.close();
  console.log('Done screenshotting!');
})().catch(e => {
  console.error('Screenshot error:', e);
  process.exit(1);
});
