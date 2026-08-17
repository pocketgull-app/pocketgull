const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleLogs = [];
  const pageErrors = [];
  const requestFails = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.message + '\n' + err.stack));
  page.on('requestfailed', req => requestFails.push(`${req.url()} - ${req.failure()?.errorText}`));

  try {
    const response = await page.goto('http://localhost:8080', { waitUntil: 'load' });
    console.log('HTTP Status:', response.status());
    console.log('HTTP Headers:', response.headers());

    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('Body HTML length:', bodyHtml.length);
    console.log('Body child elements:', await page.evaluate(() => document.body.children.length));
    console.log('Body text length:', await page.evaluate(() => document.body.innerText.length));
    console.log('Body computed display:', await page.evaluate(() => window.getComputedStyle(document.body).display));
    console.log('Body computed color:', await page.evaluate(() => window.getComputedStyle(document.body).color));
    console.log('Body computed bg:', await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor));
    console.log('Main element count:', await page.locator('main').count());

    await page.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/forensic_screenshot.png' });
    console.log('Saved forensic_screenshot.png');
  } catch (e) {
    console.error('Page load error:', e);
  }

  console.log('\n--- Console Logs ---');
  consoleLogs.forEach(l => console.log(l));

  console.log('\n--- Page Errors ---');
  pageErrors.forEach(e => console.log(e));

  console.log('\n--- Request Failures ---');
  requestFails.forEach(f => console.log(f));

  await browser.close();
})();
