const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('[SCREENSHOT] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const ts = require('typescript');
  const code = fs.readFileSync(path.join(__dirname, '../src/server/business-site.ts'), 'utf8');
  const transpiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  
  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', transpiled.outputText);
  fn(m, m.exports, (mod) => require(mod));

  const html = m.exports.renderBusinessSiteHtml();

  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const section = await page.locator('#digital-twin');
  if (section) {
    const artDir = 'C:\\Users\\philg\\.gemini\\antigravity\\brain\\ac363530-9984-419f-8818-08671799635a';
    const outPath = path.join(artDir, 'lazy_susan_section_screenshot.png');
    await section.screenshot({ path: outPath });
    console.log('[SCREENSHOT] Captured Lazy Susan section screenshot to:', outPath);
  } else {
    console.error('[SCREENSHOT] #digital-twin section not found!');
  }

  await browser.close();
})();
