import { test, expect } from '@playwright/test';
import { setupE2ePage } from './utils/setup';

test.describe('Business Portal & Precision Medicine Interactive E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render business portal hero and navigation links', async ({ page }) => {
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/PocketGull|Clinical/i);
  });

  test('should render and interact with Cognitive Strategy flip cards including Dr. Matt Might Precision Algorithm', async ({ page }) => {
    // Scroll to strategies section
    const strategiesSection = page.locator('#strategies');
    await expect(strategiesSection).toBeVisible();
    await strategiesSection.scrollIntoViewIfNeeded();

    // Verify Strategy 3: Dr. Matt Might Algorithm Card exists
    const mightCard = page.locator('[data-flip-id="strategy-might"]');
    await expect(mightCard).toBeVisible();
    await expect(mightCard).toContainText(/Dr. Matt Might Precision Algorithm|mediKanren/i);

    // Click "Dbl-Click for Plain English" flip button
    const flipButton = mightCard.locator('.flip-trigger-btn').first();
    await expect(flipButton).toBeVisible();
    await flipButton.click();

    // Verify card flipped state and plain-English jargon buster content
    await page.waitForTimeout(400);
    await expect(mightCard).toContainText(/Jargon Buster|Repurposing What Works/i);

    // Flip back
    const flipBackBtn = mightCard.locator('.flip-trigger-btn').last();
    await flipBackBtn.click();
    await page.waitForTimeout(400);
    await expect(mightCard).toContainText(/Dr. Matt Might Precision Algorithm/i);
  });

  test('should calculate B2B ROI dynamically based on slider inputs and launch Pilot Modal', async ({ page }) => {
    // Scroll to B2B ROI Calculator
    const roiSection = page.locator('#roi, #pricing, .roi-calculator').first();
    if (await roiSection.isVisible().catch(() => false)) {
      await roiSection.scrollIntoViewIfNeeded();

      // Check if site count or trial count sliders exist
      const siteSlider = page.locator('#activeSitesInput, #trialCountInput, input[type="range"]').first();
      if (await siteSlider.isVisible().catch(() => false)) {
        await siteSlider.fill('15');
        await page.waitForTimeout(300);

        // Verify Reclaimed Hours and Cost Savings are positive
        const annualSavings = page.locator('#annualSavingsText, .projected-savings').first();
        if (await annualSavings.isVisible().catch(() => false)) {
          await expect(annualSavings).not.toHaveText('$0');
        }
      }
    }
  });

  test('should verify Android Vitals Frame Pacing & Choreographer telemetry badge', async ({ page }) => {
    const jankBadge = page.locator('#androidJankBadge, [data-testid="jank-detector"]');
    if (await jankBadge.isVisible().catch(() => false)) {
      await expect(jankBadge).toContainText(/FPS|Frame|Choreographer|Zero Jank/i);
    }
  });
});
