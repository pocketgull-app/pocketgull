import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Desktop Clinical Flow & Ambient Soundscape E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('should unlock splash, render master branding, and interact with Ambient Flow music player', async ({ page }) => {
    // 1. Enter Demo Mode and unlock clinical dashboard
    await enterDemoMode(page);

    // 2. Verify Main Navigation and Header Brand Mark
    const brandMark = page.locator('app-pocketgull-brand-mark').first();
    await expect(brandMark).toBeVisible({ timeout: 15000 });

    // 3. Verify Desktop Quick Utility Bar is present
    const ambientFlowBtn = page.locator('button', { hasText: /Ambient Flow|Flow Active/i }).first();
    await expect(ambientFlowBtn).toBeVisible({ timeout: 10000 });

    // 4. Open Ambient Flow Music Player Popover
    await ambientFlowBtn.click();
    const playerContainer = page.locator('app-ambient-flow-player');
    await expect(playerContainer).toBeVisible({ timeout: 5000 });

    // 5. Test Play / Pause Toggle
    const playBtn = playerContainer.locator('button[aria-label="Toggle Ambient Flow Music"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    await page.waitForTimeout(500);

    // Verify visual status pulse or text update
    const statusBadge = playerContainer.locator('text=FLOW ACTIVE');
    await expect(statusBadge).toBeVisible();

    // 6. Expand Settings & Switch Soundscape Preset
    const expandBtn = playerContainer.locator('button[title*="Player"]').last();
    await expandBtn.click();
    await page.waitForTimeout(300);

    const sevenGenBtn = playerContainer.locator('button', { hasText: /Seven Generations Fireside/i });
    if (await sevenGenBtn.isVisible()) {
      await sevenGenBtn.click();
      await page.waitForTimeout(300);
      await expect(playerContainer.locator('text=Seven Generations Fireside').first()).toBeVisible();
    }

    // 7. Verify Analysis Report and Care Plan Lenses
    const analysisReport = page.locator('app-analysis-report');
    await expect(analysisReport).toBeVisible({ timeout: 10000 });

    // Verify Paradigm Switcher Buttons
    const westernBtn = page.locator('button', { hasText: 'Western' }).first();
    if (await westernBtn.isVisible()) {
      await westernBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should load Business Site with certified corporate identity and master branding', async ({ page }) => {
    // Navigate directly to /business static endpoint
    await page.goto('/business', { waitUntil: 'domcontentloaded' });

    // Verify Corporate LLC imprint and credentials
    await expect(page.locator('body')).toContainText(/PocketGull/i, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Clinical|Assistant|Documentation/i);

    // Verify SVG Wordmark Brand presence
    const wordmarkSvg = page.locator('svg').first();
    await expect(wordmarkSvg).toBeVisible();
  });
});
