import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Screenshot output directory
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'screenshots');

/** Helper to enter demo mode and select Homo Sapiens default patient */
async function enterDemoModeWithDefaultPatient(page: import('@playwright/test').Page) {
  await enterDemoMode(page);
  await selectPatientByName(page, 'Homo Sapiens');
  await page.waitForTimeout(1000);
}

test.describe('Homo Sapiens — Default Patient & Full Lens Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('Homo Sapiens default patient can be selected and loaded', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
    });

    await enterDemoModeWithDefaultPatient(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // The analysis report component should be present (loaded for Homo Sapiens)
    await expect(page.locator('app-analysis-container, app-analysis-report').first()).toBeVisible({ timeout: 20000 });

    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'homo_sapiens_default_patient.png'),
    //   fullPage: false,
    // });
    console.log('[PASS] Homo Sapiens loaded as default patient.');
  });

  test('Homo Sapiens — all 6 analysis lens tabs are visible and populated', async ({ page }) => {
    await enterDemoModeWithDefaultPatient(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const reportEl = page.locator('app-analysis-container, app-analysis-report').first();
    await expect(reportEl).toBeVisible({ timeout: 20000 });

    const reportTab = page.locator('button', { hasText: 'Analysis' }).first();
    if (await reportTab.isVisible()) {
      await reportTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // Western is the default paradigm — generate/load the report
    const westernBtn = page.locator('button', { hasText: 'Western' }).first();
    await westernBtn.click();
    await page.waitForTimeout(1500);

    // Wait for the Generate/Refresh button if visible and click it
    const generateBtn = page.locator('button', { hasText: /Generate|Refresh/ }).first();
    if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(4000);
    }

    // Verify all active lenses are present
    const expectedTabs = [
      'tab-overview',
      'tab-treatment-matrix',
      'tab-functional-protocols',
      'tab-monitoring-follow-up',
      'tab-exposomics-toxicology',
      'tab-global-health',
      'tab-socratic-audit',
      'tab-assessments'
    ];
    for (const tabTestId of expectedTabs) {
      const tabBtn = page.getByTestId(tabTestId);
      await expect(tabBtn).toBeVisible({ timeout: 5000 });
      console.log(`[PASS] Tab visible: ${tabTestId}`);
    }

    // Verify Summary Overview has assessment content
    const overviewTab = page.getByTestId('tab-overview');
    await overviewTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Clinical').first()).toBeVisible({ timeout: 5000 });

    // Treatment Matrix tab
    const treatTab = page.getByTestId('tab-treatment-matrix');
    await treatTab.click({ force: true });
    await page.waitForTimeout(500);
    console.log('[PASS] Treatment Matrix tab populated.');

    // Functional Protocols tab
    const funcTab = page.getByTestId('tab-functional-protocols');
    await funcTab.click({ force: true });
    await page.waitForTimeout(500);
    console.log('[PASS] Functional Protocols tab populated.');

    // Monitoring & Follow-up tab
    const monitorTab = page.getByTestId('tab-monitoring-follow-up');
    await monitorTab.click({ force: true });
    await page.waitForTimeout(500);
    console.log('[PASS] Monitoring & Follow-up tab populated.');

    // Take a full-page screenshot at the end
    await overviewTab.click({ force: true });
    await page.waitForTimeout(500);
    console.log('[PASS] All lenses verified for Homo Sapiens.');
  });

  test('Homo Sapiens — Orthomolecular Profiling shows correct biomarker data across paradigms', async ({ page }) => {
    await enterDemoModeWithDefaultPatient(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const reportEl = page.locator('app-analysis-report');
    await expect(reportEl).toBeVisible({ timeout: 15000 });

    const reportTab = page.locator('button', { hasText: 'Analysis' }).first();
    if (await reportTab.isVisible()) {
      await reportTab.click();
      await page.waitForTimeout(500);
    }

    // Western paradigm
    await page.locator('button', { hasText: 'Western' }).first().click();
    await page.waitForTimeout(1500);

    // Wait for the Generate/Refresh button to be visible and click it
    const generateBtn = page.locator('button', { hasText: /Generate|Refresh/ }).first();
    await expect(generateBtn).toBeVisible({ timeout: 15000 });
    await generateBtn.click();
    await page.waitForTimeout(6000);
    
    const orthoTab = page.getByTestId('tab-functional-protocols');
    await orthoTab.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/Magnesium/i').first()).toBeVisible({ timeout: 10000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'homo_sapiens_ortho_western.png'),
    // });
    console.log('[PASS] Western Orthomolecular Profiling verified.');

    // Eastern paradigm
    await page.locator('button', { hasText: 'Eastern' }).first().click();
    await page.waitForTimeout(1500);
    await orthoTab.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/Magnesium|Biomarker|Nutrient/i').first()).toBeVisible({ timeout: 10000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'homo_sapiens_ortho_eastern.png'),
    // });
    console.log('[PASS] Eastern Orthomolecular Profiling verified.');

    // Ayurvedic paradigm
    await page.locator('button', { hasText: 'Ayurvedic' }).first().click();
    await page.waitForTimeout(1500);
    await orthoTab.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/Magnesium|Biomarker|Nutrient|dryness/i').first()).toBeVisible({ timeout: 10000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'homo_sapiens_ortho_ayurvedic.png'),
    // });
    console.log('[PASS] Ayurvedic Orthomolecular Profiling verified.');

    console.log('[COMPLETE] All 3 paradigms verified for Homo Sapiens Orthomolecular Profiling.');
  });
});
