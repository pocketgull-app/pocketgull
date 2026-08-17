const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:8080', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const headings = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    return list.map(h => {
      const rect = h.getBoundingClientRect();
      const style = window.getComputedStyle(h);
      const parentStyle = window.getComputedStyle(h.parentElement);
      let bg = style.backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        bg = parentStyle.backgroundColor;
      }
      return {
        tag: h.tagName,
        id: h.id || '(no-id)',
        text: h.innerText.trim().replace(/\n/g, ' ').substring(0, 50),
        color: style.color,
        bg: bg,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        visible: rect.width > 0 && rect.height > 0
      };
    });
  });

  console.log(JSON.stringify(headings, null, 2));

  await browser.close();
})();
