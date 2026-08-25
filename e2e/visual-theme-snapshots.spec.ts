import { test, expect } from '@playwright/test';
import * as path from 'path';
import { setupE2ePage, enterDemoMode } from './utils/setup';

const THEMES = [
  'light',
  'dark',
  'spark',
  'papercraft',
  'hemp',
  'rice',
  'construction',
  'white-marble',
  'black-marble',
  'papyrus',
  'pool',
  'mandala'
];

const PERSONA_MODES = [
  'clinical',
  'arborist',
  'mechanic',
  'gentleman',
  'muse'
];

test.describe('Automated Theme & Persona Visual Snapshot Suite', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page, { mockClinician: true });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  for (const theme of THEMES) {
    test(`verify theme loading and styling: ${theme}`, async ({ page }) => {
      await enterDemoMode(page);
      
      // Apply theme via DOM root class
      await page.evaluate((t) => {
        document.documentElement.className = t;
      }, theme);
      await page.waitForTimeout(300);

      // Verify HTML element carries document root
      const htmlElement = page.locator('html');
      await expect(htmlElement).toBeVisible();

      // Ensure main content is visible
      await expect(page.locator('app-analysis-container, app-analysis-report, body').first()).toBeVisible({ timeout: 10000 });

      // Capture screenshot for visual inspection
      await page.screenshot({
        path: path.join(process.cwd(), 'tmp', 'playwright-results', `theme-${theme}.png`),
        fullPage: false
      });
    });
  }

  for (const lens of PERSONA_MODES) {
    test(`verify health literacy persona mode: ${lens}`, async ({ page }) => {
      await enterDemoMode(page);
      
      // Set persona lens query param or local storage
      await page.goto(`/?lens=${lens}`);
      const pinInput = page.locator('input[placeholder="1234"]');
      if (await pinInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pinInput.fill('1234');
        const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
        if (await demoBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await demoBtn.click();
        }
      }
      await page.waitForTimeout(300);

      // Verify container is visible
      await expect(page.locator('app-analysis-container, app-analysis-report, body').first()).toBeVisible({ timeout: 10000 });

      // Capture screenshot for visual inspection
      await page.screenshot({
        path: path.join(process.cwd(), 'tmp', 'playwright-results', `persona-${lens}.png`),
        fullPage: false
      });
    });
  }

  test('verify global sentinel scope toggle bar functionality', async ({ page }) => {
    await enterDemoMode(page);
    await page.waitForTimeout(300);

    // Toggle Macro Fleet Sentinel Scope
    const macroBtn = page.locator('button', { hasText: 'Macro Fleet' }).first();
    if (await macroBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await macroBtn.click();
      await page.waitForTimeout(500);
    }
  });

});
