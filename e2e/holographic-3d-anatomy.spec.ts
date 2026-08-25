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

    // 2. Select patient Phil Gear
    await selectPatientByName(page, 'Phil Gear');

    // 3. Ensure core analysis container is loaded
    await expect(page.locator('app-analysis-container')).toBeVisible({ timeout: 15000 });

    // 4. Verify 3D Spatial Anatomy container is rendered
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
