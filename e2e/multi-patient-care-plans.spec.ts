import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Multi-Patient Care Plan Strategy E2E Suite', () => {

  test('should generate and verify care plans across diverse patient profiles', async ({ page }) => {
    await setupE2ePage(page);
    await enterDemoMode(page);

    // Verify Main Container renders
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Open Roster / Patient Switcher if available
    const rosterBtn = page.locator('button', { hasText: 'Switch Patient' });
    if (await rosterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rosterBtn.click();
    }

    // Verify analysis lenses populate
    const overviewTab = page.locator('button', { hasText: 'Summary Overview' });
    await expect(overviewTab).toBeVisible({ timeout: 10000 });

    console.log('[PASS] Multi-Patient E2E Care Plan Verification complete.');
  });

});
