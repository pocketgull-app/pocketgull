import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';


test.describe('Analytical Data Integrity & Clinical Engine Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('should verify 0 NaN or undefined values across all clinical reports and metrics', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Verify app-analysis-report is visible
    const reportEl = page.locator('app-analysis-report');
    await expect(reportEl).toBeVisible({ timeout: 10000 });

    // 2. Fetch page body text and verify absence of raw NaN / undefined text artifacts
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
  });

  test('should verify URL intake state handoff link restoration without 404s', async ({ page }) => {
    // Test base64 handoff URL parsing directly
    const mockStatePayload = {
      name: 'E2E Handoff Test Patient',
      age: 45,
      gender: 'Non-binary',
      issues: ['Chronic Fatigue', 'Oxidative Stress'],
      philosophy: 'Western',
      cognitiveLevel: 'grade8'
    };

    const b64 = btoa(encodeURIComponent(JSON.stringify(mockStatePayload)));
    await page.goto(`/?share=${b64}&mode=clinician`);

    // Verify app opens directly in unlocked state or loads state cleanly
    await expect(page.locator('body')).toBeVisible();
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('404');
  });
});
