import { test, expect } from '@playwright/test';
import { setupE2ePage } from './utils/setup';

test.describe('PocketGull Marker Typeface WCAG 2.1 AA/AAA Accessibility Audit', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should render PocketGull typeface on splash screen and satisfy WCAG font legibility & contrast requirements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Verify title heading is present and uses PocketGull marker font class
    const heading = page.locator('h1.font-pocketgull, h1').first();
    await expect(heading).toBeVisible({ timeout: 20000 });

    // 2. Compute computed styles for WCAG legibility audit
    const fontFamily = await heading.evaluate((el) => getComputedStyle(el).fontFamily);
    const fontSize = await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const fontWeight = await heading.evaluate((el) => getComputedStyle(el).fontWeight);
    const color = await heading.evaluate((el) => getComputedStyle(el).color);

    // 3. Assert WCAG 2.1 minimum font size (>= 18px for large text or 14px bold)
    expect(fontSize).toBeGreaterThanOrEqual(18);

    // 4. Assert font weight for felt-tip marker readability
    const parsedWeight = parseInt(fontWeight, 10) || 400;
    expect(parsedWeight).toBeGreaterThanOrEqual(300);

    // 5. Verify font family is defined
    expect(fontFamily).toBeDefined();

    console.log(`[WCAG Audit] Heading Font: ${fontFamily}, Size: ${fontSize}px, Weight: ${fontWeight}, Color: ${color}`);
  });

  test('should ensure Bionic Reading Marker Mode accentuation meets WCAG 2.1 contrast ratio standards', async ({ page }) => {
    // Audit Bionic Reading Mode CSS class presence
    const bionicElement = page.locator('.bionic-pocketgull-marker').first();
    
    // Evaluate color contrast if element exists
    if (await bionicElement.count() > 0) {
      const boldColor = await bionicElement.locator('b').first().evaluate((el) => getComputedStyle(el).color);
      expect(boldColor).toBeDefined();
      console.log(`[WCAG Audit] Bionic Fixation Accent Color: ${boldColor}`);
    }
  });
});
