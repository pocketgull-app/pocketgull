import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('10-Dimensional Master Domain Suites E2E Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.localStorage.setItem('pocketgull_pin_unlocked', 'true');
      window.localStorage.setItem('pg_splash_dismissed', 'true');
    });
    await setupE2ePage(page);
  });

  test('should display 10-Dimensional Master Paradigm Synthesizer & navigate all 10 domain suites', async ({ page }) => {
    // Perform full login and enter demo mode
    await enterDemoMode(page);

    // Toggle viewMode to 'suites' in AnalysisContainerComponent
    const domainSuitesToggle = page.locator('button').filter({ hasText: /Domain Suites/i }).first();
    await expect(domainSuitesToggle).toBeVisible({ timeout: 45000 });
    await domainSuitesToggle.click();

    // Verify Unified Paradigm Synthesizer Card is rendered
    const synthesizerHeader = page.locator('h3:has-text("10-Dimensional Unified Paradigm Health Vector")');
    await expect(synthesizerHeader).toBeVisible({ timeout: 20000 });

    // Click "All Paradigms" toggle to reveal all 10+ suites
    const showAllBtn = page.locator('button[aria-label="Toggle all domain suite paradigms view"]');
    if (await showAllBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await showAllBtn.click();
    }

    // Define suite tab names to test
    const suites = [
      'Biomedical & Diagnostic',
      'Therapeutics & Botanical',
      'Nutritional & Metabolic',
      'Kinetic & Recovery',
      'Turing Formal Logic',
      'Nobel Evidence Engine',
      'AAAS Science Breakthroughs',
      'Lasker & Breakthrough',
      'Eastern TCM Jing-Luo',
      'Ayurvedic Tridosha'
    ];

    // Click "Show All" toggle if present so all 12 domain suite buttons are rendered
    const showAllSuitesBtn = page.locator('button', { hasText: /Show All|All 12|Master Suites/i }).first();
    if (await showAllSuitesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showAllSuitesBtn.click();
      await page.waitForTimeout(500);
    }

    for (const suiteName of suites) {
      const tabButton = page.locator(`button:has-text("${suiteName}")`).first();
      await expect(tabButton).toBeVisible();
      await tabButton.click();
      await page.waitForTimeout(200);
    }
  });
});
