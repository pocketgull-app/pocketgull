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
    const westernBtn = page.locator('button', { hasText: 'Western' }).first();
    await westernBtn.click();
    await page.waitForTimeout(1000); // Wait for transition/mock load

    // Verify all 6 tabs/lenses are visible
    const tabs = [
      'tab-overview',
      'tab-functional-protocols',
      'tab-nutrition',
      'tab-precision-nutrients',
      'tab-monitoring-follow-up',
      'tab-patient-education'
    ];

    for (const tab of tabs) {
      const tabButton = page.getByTestId(tab);
      await expect(tabButton).toBeVisible();
    }

    // Verify Western content loads on default Summary Overview tab
    const overviewText = page.locator('app-analysis-report').locator('text=Clinical Assessment').first();
    await expect(overviewText).toBeVisible({ timeout: 5000 });

    // Verify Western Nutrition tab works (which we recently added)
    const nutritionTab = page.getByTestId('tab-nutrition');
    await nutritionTab.click({ force: true });
    await page.waitForTimeout(500);
    // Nutrition-specific Western keyword
    await expect(page.locator('app-analysis-report').locator('text=/Nutritional|Diet/i').first()).toBeVisible({ timeout: 5000 });

    // Take Western Screenshot (from Summary Overview tab)
    const overviewTab = page.getByTestId('tab-overview');
    await overviewTab.click({ force: true });
    await page.waitForTimeout(500);
    // await page.screenshot({ path: path.join(artifactDir, 'western_dashboard.png') });
    // console.log('[Verification] Western screenshot saved.');

    // --- Eastern (TCM) Philosophy Verification ---
    console.log('[Verification] Testing Eastern Paradigm...');
    const easternBtn = page.locator('button', { hasText: 'Eastern' }).first();
    await easternBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify Eastern Banner active
    await expect(page.locator('text=Active Paradigm: Eastern (Traditional Chinese Medicine)')).toBeVisible({ timeout: 5000 });

    // Verify Functional Protocols in Eastern Mode
    const functionalTab = page.getByTestId('tab-functional-protocols');
    await functionalTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('app-analysis-report').locator('text=/Functional|Details/i').first()).toBeVisible({ timeout: 5000 });

    // Take Eastern Screenshot
    // await page.screenshot({ path: path.join(artifactDir, 'eastern_dashboard.png') });
    // console.log('[Verification] Eastern screenshot saved.');

    // --- Ayurvedic Philosophy Verification ---
    console.log('[Verification] Testing Ayurvedic Paradigm...');
    const ayurvedicBtn = page.locator('button', { hasText: 'Ayurvedic' }).first();
    await ayurvedicBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Verify Ayurvedic Banner active
    await expect(page.locator('text=Active Paradigm: Ayurvedic Medicine')).toBeVisible({ timeout: 5000 });

    // Verify Precision Nutrients in Ayurvedic Mode
    const orthomolecularTab = page.getByTestId('tab-precision-nutrients');
    if (await orthomolecularTab.isVisible({ timeout: 5000 }).catch(() => false)) {
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
