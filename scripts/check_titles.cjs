const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

  const headingAudit = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .staff-card h3, #stageTitle, .flip-card-front h3'));
    return headings.map(h => {
      const style = window.getComputedStyle(h);
      const rect = h.getBoundingClientRect();
      return {
        tag: h.tagName,
        id: h.id || h.closest('section')?.id || 'no-id',
        text: h.innerText.trim().slice(0, 40),
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        visible: rect.width > 0 && rect.height > 0
      };
    });
  });

  console.log('--- HEADING AUDIT REPORT ---');
  console.log(`Found ${headingAudit.length} headings:`);
  
  for (const h of headingAudit) {
    console.log(`[${h.tag}] [Sec: ${h.id}] "${h.text}" -> color: ${h.color}`);
  }

  // Take a full page screenshot
  await page.screenshot({ path: 'C:/Users/philg/.gemini/antigravity/brain/ac363530-9984-419f-8818-08671799635a/titles_fixed_screenshot.png', fullPage: true });
  console.log('Saved screenshot to titles_fixed_screenshot.png');

  await browser.close();
})();
