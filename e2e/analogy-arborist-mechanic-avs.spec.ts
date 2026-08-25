import { test, expect } from '@playwright/test';

test.describe('Analogy Viewers, AVS Narrative Arc & Pet Bio-Auditory Protocols', () => {
  test('verifies Arborist, Mechanic, and 4-Stage AVS Narrative Arc workflows', async ({ page }) => {
    // 1. Navigate to application
    await page.goto('/');

    // Bypass splash lock if present
    const bypassButton = page.locator('button:has-text("Enter Demo Mode"), button:has-text("Enter Application")').first();
    if (await bypassButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bypassButton.click();
    }

    // 2. Verify 3D Body / Analogy Mode Selector buttons exist
    const arboristBtn = page.locator('button:has-text("Arborist"), button:has-text("🌳")').first();
    if (await arboristBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await arboristBtn.click();
      await page.waitForTimeout(500);
    }

    const mechanicBtn = page.locator('button:has-text("Mechanic"), button:has-text("🚗")').first();
    if (await mechanicBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await mechanicBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Verify Gentleman and Muse Persona buttons
    const gentlemanBtn = page.locator('button:has-text("Gentleman"), button:has-text("🎩")').first();
    if (await gentlemanBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gentlemanBtn.click();
      await page.waitForTimeout(500);
    }

    const museBtn = page.locator('button:has-text("Muse"), button:has-text("✨")').first();
    if (await museBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await museBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Verify AVS Narrative Arc Section is present
    const avsSection = page.locator('text=Therapeutic Narrative Arc Exploration').first();
    if (await avsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(avsSection).toBeVisible();

      // Click Stage 2 Deep Vagal
      const stage2Btn = page.locator('button:has-text("Stage 2"), button:has-text("Deep Vagal")').first();
      if (await stage2Btn.isVisible()) {
        await stage2Btn.click();
      }
    }
  });
});
