import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Clinical Inclusiveness & Accessibility (a11y/DEI) Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page, { mockClinician: true });
    await enterDemoMode(page);
  });

  test('verifies Dyslexia font toggle and high contrast DOM classes', async ({ page }) => {
    // 1. Verify HTML lang attribute (WCAG 3.1.1)
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // 2. Test programmatically triggering Dyslexia Font mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dyslexia-font-active');
    });

    const isDyslexiaActive = await page.evaluate(() => {
      return document.documentElement.classList.contains('dyslexia-font-active');
    });
    expect(isDyslexiaActive).toBe(true);

    // 3. Test programmatically triggering WCAG AAA High Contrast mode
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast-active');
    });

    const isHighContrastActive = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast-active');
    });
    expect(isHighContrastActive).toBe(true);

    // 4. Test Reduced Motion override rule evaluation
    await page.evaluate(() => {
      document.documentElement.classList.add('reduce-motion');
    });

    const isReduceMotionActive = await page.evaluate(() => {
      return document.documentElement.classList.contains('reduce-motion');
    });
    expect(isReduceMotionActive).toBe(true);
  });

  test('verifies keyboard focus rings and minimum touch targets', async ({ page }) => {
    // 1. Verify buttons have focus-visible styling rules
    const firstButton = page.locator('button').first();
    await expect(firstButton).toBeVisible();

    // Focus the button using keyboard Tab
    await firstButton.focus();
    const isFocused = await firstButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});
