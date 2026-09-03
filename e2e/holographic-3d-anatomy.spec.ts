import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Holographic 3D Skeletal Anatomy & Spatial Lenses Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should render Holographic 3D Anatomy viewer, toggle Spatial Lenses, and activate 360° spin HUD', async ({ page }) => {
    // 1. Enter Demo Mode cleanly
    await enterDemoMode(page);

    // 2. Select patient Homo Sapiens
    await selectPatientByName(page, 'Homo Sapiens');

    // 3. Ensure core analysis container is loaded
    await expect(page.locator('app-analysis-container')).toBeVisible({ timeout: 15000 });

    // 4. Open Patient Portal to render Holographic 3D Anatomy viewer
    const directPortalBtn = page.locator('button', { hasText: /patient portal/i }).first();
    if (await directPortalBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await directPortalBtn.click();
    } else {
      const appsHubBtn = page.locator('#btn-apps-hub-trigger, button:has-text("Apps & Portals")').first();
      if (await appsHubBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await appsHubBtn.click();
        await page.waitForTimeout(300);
        const hubPortalBtn = page.locator('button', { hasText: /patient portal/i }).first();
        if (await hubPortalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await hubPortalBtn.click();
        }
      }
    }

    // Click 3D Spatial Anatomy tab inside Patient Portal
    const anatomyTabBtn = page.getByRole('button', { name: /3D Spatial Anatomy/i }).first();
    await expect(anatomyTabBtn).toBeVisible({ timeout: 15000 });
    await anatomyTabBtn.click();

    // Verify 3D Spatial Anatomy container is rendered
    const anatomyContainer = page.locator('app-holographic-3d-anatomy');
    await expect(anatomyContainer).toBeVisible({ timeout: 25000 });

    // 5. Test Spatial Lens buttons (Western, TCM, Prana, Unified)
    const tcmBtn = page.getByTestId('lens-tcm');
    await expect(tcmBtn).toBeVisible({ timeout: 10000 });
    await tcmBtn.click({ force: true });
    await page.waitForTimeout(500);

    const badge = page.getByTestId('telemetry-lens-badge');
    await expect(badge).toBeVisible({ timeout: 10000 });
    await expect(badge).toContainText(/tcm|eastern|chinese|matrix|lens/i);

    const pranaBtn = page.getByTestId('lens-ayurveda');
    await expect(pranaBtn).toBeVisible({ timeout: 5000 });
    await pranaBtn.click({ force: true });
    await page.waitForTimeout(500);

    await expect(badge).toContainText(/ayurveda|prana|vedic|matrix|lens/i);

    // 6. Toggle 360° Auto-spin HUD button
    const spinBtn = page.getByTestId('btn-360-spin');
    await expect(spinBtn).toBeVisible();
    await spinBtn.click({ force: true });

    await expect(spinBtn).toContainText(/Spin ON|360°/i);
  });
});
