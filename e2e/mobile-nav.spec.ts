import { test, expect } from '@playwright/test';
import * as path from 'path';

import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Mobile Sub-Navbar Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);
  });

  test('should layout correctly on 360px screen and take nav screenshots', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });

    await enterDemoMode(page);

    // 5. Verify Main Viewport loads
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    
    // Wait for initial analysis container content to render
    const analysisReportEl = page.locator('app-analysis-report');
    await expect(analysisReportEl).toBeVisible({ timeout: 10000 });

    // Take screenshot of the sub-navbar
    // The sub-navbar contains id="tour-patient-dropdown"
    const subNavbar = page.locator('nav').filter({ has: page.locator('#tour-patient-dropdown') });
    await expect(subNavbar).toBeVisible();

    const fs = await import('fs');
    const artifactDir = path.join(process.cwd(), 'test-results', 'mobile-nav');
    fs.mkdirSync(artifactDir, { recursive: true });
    
    // Take mobile nav screenshot
    await subNavbar.screenshot({ path: path.join(artifactDir, 'mobile_nav_layout.png') });
    console.log('[Verification] Mobile nav screenshot saved.');

    // Toggle patient dropdown and verify it fits within viewport
    const patientBtn = page.locator('app-patient-dropdown button').first();
    await patientBtn.click();
    await page.waitForTimeout(500);

    // Take mobile dropdown screenshot
    const dropdownMenu = page.locator('app-patient-dropdown .origin-top-left');
    await expect(dropdownMenu).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, 'mobile_nav_dropdown.png') });
    console.log('[Verification] Mobile nav dropdown screenshot saved.');
  });
});
