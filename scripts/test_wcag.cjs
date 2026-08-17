const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let errorCount = 0;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
      errorCount++;
    }
  });

  await page.goto('http://localhost:8080#digital-twin', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('[TEST] Checking Accessibility Attributes on Rotary Dial:');
  const knob = page.locator('#rotaryKnobBtn');
  console.log('Knob aria-label:', await knob.getAttribute('aria-label'));

  console.log('\n[TEST] Testing Keyboard Navigation: pressing ArrowRight on focused knob...');
  await knob.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);

  console.log('After ArrowRight - Stage Title:', await page.textContent('#stageTitle'));
  console.log('Knob updated aria-label:', await knob.getAttribute('aria-label'));

  console.log('\n[TEST] Testing Keyboard Navigation: pressing ArrowLeft on focused knob...');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(200);

  console.log('After ArrowLeft - Stage Title:', await page.textContent('#stageTitle'));
  console.log('Knob updated aria-label:', await knob.getAttribute('aria-label'));

  console.log('\n[TEST] Checking Skip Link...');
  const skipLink = page.locator('a[href="#main-content"]');
  console.log('Skip link text:', (await skipLink.textContent()).trim());

  console.log('\nTotal Browser Errors:', errorCount);
  await browser.close();
})();
