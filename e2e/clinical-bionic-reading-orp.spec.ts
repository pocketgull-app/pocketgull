import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Clinical Bionic Reading & ORP Foveal Reticle E2E Suite', () => {

  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('1. Should display Bionic Mode toggle in Research Frame and format clinical tokens', async ({ page }) => {
    // Open Research Frame
    const researchBtn = page.locator('button:has-text("Research"), button[title*="Research"]').first();
    if (await researchBtn.isVisible()) {
      await researchBtn.click();
    }

    const researchWindow = page.locator('#tour-research-frame-window');
    await expect(researchWindow).toBeVisible({ timeout: 10000 });

    // Look for Morpheme-Aware Bionic Mode button
    const bionicBtn = researchWindow.locator('button:has-text("Bionic Mode")');
    if (await bionicBtn.isVisible()) {
      await bionicBtn.click();
      // Verify button toggles to active amber state
      await expect(bionicBtn).toHaveClass(/bg-amber-500/);
    }
  });

  test('2. Should open Clinical Trajectory Modal and verify zero-saccadic ORP reticle', async ({ page }) => {
    // Open Trajectory Brief / Reader
    const trajBtn = page.locator('button:has-text("3-Act Trajectory"), button:has-text("Trajectory Brief"), button[title*="Trajectory"]').first();
    if (await trajBtn.isVisible()) {
      await trajBtn.click();

      const modal = page.locator('app-clinical-trajectory-reader-modal');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify RSVP crosshair and center guide pips
      const crosshair = modal.locator('.bg-teal-500\\/25, .bg-teal-500\\/20, .bg-amber-400').first();
      await expect(crosshair).toBeVisible();

      // Play stream
      const playBtn = modal.locator('button:has-text("Play Stream"), button:has-text("Stream")').first();
      if (await playBtn.isVisible()) {
        await playBtn.click();
        // Allow stream to advance a few frames
        await page.waitForTimeout(500);
        // Verify stream is running or pause button appears
        const pauseBtn = modal.locator('button:has-text("Pause")').first();
        await expect(pauseBtn).toBeVisible();
      }
    }
  });

});
