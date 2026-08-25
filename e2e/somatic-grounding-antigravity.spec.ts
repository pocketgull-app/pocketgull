import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Somatic Grounding & Anti-Gravity Physics Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await setupE2ePage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterDemoMode(page);
  });

  test('should open Zamecznik Calibrator canvas, toggle Anti-Gravity Mode, and adjust gravity scaling', async ({ page }) => {
    // Wait for Angular to mount app-zamecznik-canvas and register __openZamecznikCanvas helper
    await page.waitForFunction(() => typeof (window as any).__openZamecznikCanvas === 'function', { timeout: 30000 });

    // Open Zamecznik Canvas
    await page.evaluate(() => {
      (window as any).__openZamecznikCanvas();
    });

    // Verify Zamecznik Canvas HUD heading is visible when active
    const groundingHeading = page.locator('h2', { hasText: 'Somatic Grounding' }).first();
    await expect(groundingHeading).toBeVisible({ timeout: 20000 });

    // Click Anti-Gravity toggle button
    const antiGBtn = page.locator('#antigravity-toggle-btn');
    await expect(antiGBtn).toBeVisible({ timeout: 15000 });
    await antiGBtn.evaluate((el: HTMLElement) => el.click());
    await expect(antiGBtn).toContainText('ON', { timeout: 15000 });

    // Test gravity scale controls (0.5x, 2.0x) by explicit element IDs
    const scale05Btn = page.locator('#scale-05-btn');
    await scale05Btn.evaluate((el: HTMLElement) => el.click());
    await expect(scale05Btn).toHaveClass(/text-emerald-400/, { timeout: 10000 });

    const scale20Btn = page.locator('#scale-20-btn');
    await scale20Btn.evaluate((el: HTMLElement) => el.click());
    await expect(scale20Btn).toHaveClass(/text-emerald-400/, { timeout: 10000 });

    // Close the overlay via close button ID
    const closeBtn = page.locator('#zamecznik-close-btn');
    await closeBtn.click({ force: true });

    // Verify overlay heading is detached/hidden
    await expect(groundingHeading).not.toBeVisible({ timeout: 10000 });
  });
});
