const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
  const content = await page.content();
  fs.writeFileSync('C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/rendered_page.html', content);
  console.log('Saved rendered_page.html, size:', content.length);
  
  await page.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/full_page_screenshot.png', fullPage: true });
  console.log('Saved full_page_screenshot.png');

  await browser.close();
})();
