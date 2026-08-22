import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Mobile Clinical Flow & Touch Accessibility E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    // Standard mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should responsive unlock, open mobile drawer, and control Ambient Flow player', async ({ page }) => {
    // 1. Enter Demo Mode on mobile viewport
    await enterDemoMode(page);

    // 2. Verify Mobile Brand Mark
    const brandMark = page.locator('app-pocketgull-brand-mark').first();
    await expect(brandMark).toBeVisible({ timeout: 15000 });

    // 3. Verify Mobile Hamburger Button is visible (Desktop quick bar hidden)
    const hamburgerBtn = page.locator('button[aria-label="Open Mobile Navigation Menu"]');
    await expect(hamburgerBtn).toBeVisible({ timeout: 10000 });

    // 4. Open Mobile Drawer
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    // 5. Verify Drawer Navigation Links (Fitts's Law 48px minimum target size)
    const ambientFlowDrawerBtn = page.locator('button', { hasText: /Ambient Flow Music Player/i });
    await expect(ambientFlowDrawerBtn).toBeVisible({ timeout: 5000 });

    const box = await ambientFlowDrawerBtn.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44); // Meets WCAG / Fitts's Law target guidelines
    }

    // 6. Launch Ambient Flow Player from Mobile Drawer
    await ambientFlowDrawerBtn.click();
    await page.waitForTimeout(400);

    const playerContainer = page.locator('app-ambient-flow-player');
    await expect(playerContainer).toBeVisible({ timeout: 5000 });

    // 7. Toggle Ambient Music Playback on Mobile
    const playBtn = playerContainer.locator('button[aria-label="Toggle Ambient Flow Music"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    await page.waitForTimeout(400);

    await expect(playerContainer.locator('text=FLOW ACTIVE')).toBeVisible();

    // 8. Verify No Horizontal Page Overflow on Mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('should render responsive mobile view of Business Site', async ({ page }) => {
    await page.goto('/business', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/PocketGull/i, { timeout: 15000 });

    // Check that layout adapts cleanly to 390px mobile viewport without horizontal blowout
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
