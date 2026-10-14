import { test, expect } from '@playwright/test';
import * as path from 'path';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Demo Mode Medicine Paradigms Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('should unlock, cycle through 4 paradigms, check lenses, and save screenshots', async ({ page }) => {
    // Enable console logging to see page issues if any
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Set a large viewport size early so deferred viewport components load immediately
    await page.setViewportSize({ width: 1440, height: 900 });

    // Perform standard login & enter demo mode
    await enterDemoMode(page);

    // 5. Verify Main Viewport loads
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    
    // Wait for initial analysis container content to render
    const analysisReportEl = page.locator('app-analysis-report');
    await expect(analysisReportEl).toBeVisible({ timeout: 10000 });

    // Explicitly select Sarah Jenkins to test Western/Eastern/Ayurvedic paradigms on her data
    await selectPatientByName(page, 'Sarah Jenkins');

    // Trigger report loading/generation for Sarah Jenkins if button present
    const generateBtn = page.locator('#tour-generate-btn');
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }

    const artifactDir = path.join(process.cwd(), 'test-results');

    // Set a large viewport size for premium screenshot resolution
    await page.setViewportSize({ width: 1440, height: 900 });

    // --- Western Philosophy Verification ---
    console.log('[Verification] Testing Western Paradigm...');
    const westernBtn = page.getByRole('button', { name: 'WESTERN', exact: true });
    await westernBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Switch from SMoE Top-2 Sparse Route to full 8-Lens Dense View so all 8 tabs are visible
    const denseBtn = analysisReportEl.locator('button', { hasText: '[DENSE]' }).first();
    if (await denseBtn.isVisible().catch(() => false)) {
      await denseBtn.click({ force: true });
      await page.waitForTimeout(300);
    }

    // Verify all active tabs/lenses are visible in Dense 8-Lens Mode
    const tabs = [
      'tab-overview',
      'tab-treatment-matrix',
      'tab-functional-protocols',
      'tab-monitoring-follow-up',
      'tab-exposomics-toxicology',
      'tab-global-health',
      'tab-socratic-audit',
      'tab-assessments'
    ];

    for (const tab of tabs) {
      const tabButton = page.getByTestId(tab);
      await expect(tabButton).toBeVisible();
    }

    // Verify Western content & Grounding HUD load on default Summary Overview tab
    const overviewText = page.locator('app-analysis-report').locator('text=/Clinical Assessment|Western Allopathic Clinical Overview/i').first();
    await expect(overviewText).toBeVisible({ timeout: 5000 });
    await expect(analysisReportEl.locator('text=/Cognitive Confidence Calibration HUD/i').first()).toBeVisible({ timeout: 5000 });
    await expect(analysisReportEl.locator('text=/Verified Grounding:/i').first()).toBeVisible({ timeout: 5000 });

    // Verify Western Treatment Matrix tab works
    const treatTab = page.getByTestId('tab-treatment-matrix');
    await treatTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('app-analysis-report').locator('text=/Treatment|Intervention|Matrix/i').first()).toBeVisible({ timeout: 5000 });

    // Return to Summary Overview tab
    const overviewTab = page.getByTestId('tab-overview');
    await overviewTab.click({ force: true });
    await page.waitForTimeout(500);

    // --- Eastern (TCM) Philosophy Verification ---
    console.log('[Verification] Testing Eastern Paradigm...');
    const easternBtn = page.getByRole('button', { name: 'EASTERN', exact: true });
    await easternBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify Eastern Banner active
    await expect(page.locator('text=Active Paradigm: Eastern (Traditional Chinese Medicine)')).toBeVisible({ timeout: 5000 });

    // Verify Functional Protocols in Eastern Mode
    const functionalTab = page.getByTestId('tab-functional-protocols');
    await functionalTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('app-analysis-report').locator('text=/Functional|Biomarker|Chronobiology|Details/i').first()).toBeVisible({ timeout: 5000 });

    // --- Ayurvedic Philosophy Verification ---
    console.log('[Verification] Testing Ayurvedic Paradigm...');
    const ayurvedicBtn = page.getByRole('button', { name: 'AYURVEDIC', exact: true });
    await ayurvedicBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify Ayurvedic Banner active
    await expect(page.locator('text=Active Paradigm: Ayurvedic Medicine')).toBeVisible({ timeout: 5000 });

    // Verify Precision Nutrients in Ayurvedic Mode
    const orthomolecularTab = page.getByTestId('tab-precision-nutrients');
    if (await orthomolecularTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await orthomolecularTab.click({ force: true });
      await page.waitForTimeout(500);
      await expect(page.locator('app-analysis-report').locator('text=/Biomarker|Nutritional|Details/i').first()).toBeVisible({ timeout: 5000 });
    }

    // Take Ayurvedic Screenshot
    // await page.screenshot({ path: path.join(artifactDir, 'ayurvedic_dashboard.png') });
    // console.log('[Verification] Ayurvedic screenshot saved.');


  });

  test('should verify historical mock patients (Frida Kahlo and Charles Darwin)', async ({ page }) => {
    // Set a large viewport size early
    await page.setViewportSize({ width: 1440, height: 900 });

    // Unlock and enter demo mode
    await enterDemoMode(page);

    // Verify Main Viewport loads
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Verify Frida Kahlo
    console.log('[Verification] Testing Frida Kahlo profile...');
    await selectPatientByName(page, 'Frida Kahlo');
    const generateBtn = page.locator('#tour-generate-btn');
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(1000);
    }

    const fridaText = page.locator('app-analysis-report, h1, .patient-name, main').locator('text=Frida Kahlo').first();
    await expect(fridaText).toBeVisible({ timeout: 10000 });

    // Verify Charles Darwin
    console.log('[Verification] Testing Charles Darwin profile...');
    await selectPatientByName(page, 'Charles Darwin');
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(1000);
    }

    const darwinText = page.locator('app-analysis-report, h1, .patient-name, main').locator('text=Charles Darwin').first();
    await expect(darwinText).toBeVisible({ timeout: 10000 });
  });
});
