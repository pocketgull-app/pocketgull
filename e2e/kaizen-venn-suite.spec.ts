import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Multi-Paradigm Venn Diagram & Kaizen Optimization Suite E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should load Multi-Paradigm Venn Diagram, click triple consensus W∩F∩E, and verify confidence findings', async ({ page }) => {
    // 1. Enter Demo Mode cleanly via state-machine setup
    await enterDemoMode(page);

    // 2. Select patient Homo Sapiens
    await selectPatientByName(page, 'Homo Sapiens');

    // Switch to Analysis panel if on mobile/tablet viewports
    const reportTab = page.locator('button', { hasText: 'Analysis' }).first();
    if (await reportTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reportTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 3. Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.getByTestId('tab-assessments');
    await assessmentsBtn.scrollIntoViewIfNeeded();
    await expect(assessmentsBtn).toBeVisible({ timeout: 15000 });
    await assessmentsBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 5. Select Venn Consensus sub-tab
    const vennTab = page.getByTestId('tab-venn-matrix');
    await vennTab.scrollIntoViewIfNeeded();
    await vennTab.click({ force: true });
    await page.waitForTimeout(500);

    // 6. Verify Venn Matrix header renders
    const vennHeader = page.locator('text=Multi-Paradigm Intersection Matrix');
    await expect(vennHeader).toBeVisible({ timeout: 10000 });

    // 7. Click Triple Consensus button (W ∩ F ∩ E)
    const tripleBtn = page.locator('button', { hasText: 'Triple Consensus' });
    await expect(tripleBtn).toBeVisible({ timeout: 10000 });
    await tripleBtn.click({ force: true });

    // 8. Verify 100% Certainty badge and biomarkers list render
    const certaintyBadge = page.locator('text=100% Certainty').first();
    await expect(certaintyBadge).toBeVisible({ timeout: 10000 });

    const hsCrbBiomarker = page.locator('text=hs-CRP Elevated').first();
    await expect(hsCrbBiomarker).toBeVisible({ timeout: 10000 });
  });

  test('should load Kaizen Quality Suite, cycle through Ishikawa Fishbone, Pareto 80/20, and SPC Control Chart', async ({ page }) => {
    // 1. Enter Demo Mode
    await enterDemoMode(page);

    // Switch to Analysis panel if on mobile/tablet viewports
    const reportTab = page.locator('button', { hasText: 'Analysis' }).first();
    if (await reportTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reportTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 2. Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.getByTestId('tab-assessments');
    await assessmentsBtn.scrollIntoViewIfNeeded();
    await expect(assessmentsBtn).toBeVisible({ timeout: 15000 });
    await assessmentsBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 3. Select Kaizen Optimization sub-tab
    const kaizenTab = page.getByTestId('tab-kaizen-suite');
    await kaizenTab.scrollIntoViewIfNeeded();
    await kaizenTab.click({ force: true });
    await page.waitForTimeout(500);

    // 4. Verify Continuous Outcome Optimization Suite header renders
    const kaizenHeader = page.locator('text=Continuous Outcome Optimization Suite');
    await expect(kaizenHeader).toBeVisible({ timeout: 10000 });

    // 5. Verify Ishikawa Fishbone default view (6 branches)
    const fishboneTitle = page.locator('text=6-Branch Kaizen Matrix');
    await expect(fishboneTitle).toBeVisible({ timeout: 10000 });

    // 6. Switch to Pareto 80/20 Analysis tab
    const paretoTabBtn = page.locator('button', { hasText: 'Pareto 80/20 Analysis' });
    await expect(paretoTabBtn).toBeVisible({ timeout: 10000 });
    await paretoTabBtn.scrollIntoViewIfNeeded();
    await paretoTabBtn.click({ force: true });

    const paretoBadge = page.locator('text=Top 3 High-Leverage Actions');
    await expect(paretoBadge).toBeVisible({ timeout: 10000 });

    // 7. Switch to SPC Control Chart tab
    const spcTabBtn = page.locator('button', { hasText: 'SPC Control Chart' });
    await expect(spcTabBtn).toBeVisible({ timeout: 10000 });
    await spcTabBtn.scrollIntoViewIfNeeded();
    await spcTabBtn.click({ force: true });

    const spcStatus = page.locator('text=Process Status: In Control').first();
    await expect(spcStatus).toBeVisible({ timeout: 10000 });
  });
});
