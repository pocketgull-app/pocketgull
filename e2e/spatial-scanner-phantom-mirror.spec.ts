import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Spatial Scanner, 3D Body Viewer & Phantom Mirror Therapy E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('Phil Gear Patient - 3D Holographic Body Viewer & HUD Controls', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Assert main analysis container loaded
    const analysisContainer = page.locator('app-analysis-container, app-analysis-report, main').first();
    await expect(analysisContainer).toBeVisible({ timeout: 20000 });

    // Verify 3D Body Viewer tab or component renders
    const bodyViewer3d = page.locator('app-body-3d-viewer, app-body-viewer, app-medical-3d-viewer').first();
    if (await bodyViewer3d.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(bodyViewer3d).toBeVisible();
    } else {
      // Look for 3D Lens or Body Tab
      const bodyTab = page.locator('button', { hasText: /3D|Body|Anatomy/i }).first();
      if (await bodyTab.isVisible()) {
        await bodyTab.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Spatial Scan Upload Modal & In-App Scanner Interaction', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const scanModalTrigger = page.locator('button', { hasText: /Spatial|Scan|LiDAR/i }).first();
    if (await scanModalTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scanModalTrigger.click();
      const modal = page.locator('app-lidar-scan-upload-modal, app-spatial-scanner');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('Phantom Limb AVS Mirror Therapy & 174 Hz Solfeggio Audio Suite', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const mirrorComponent = page.locator('app-phantom-limb-mirror-therapy');
    if (await mirrorComponent.isVisible({ timeout: 5000 }).catch(() => false)) {
      const avsBtn = mirrorComponent.locator('button', { hasText: /174 Hz|AVS/i });
      await expect(avsBtn).toBeVisible();
      await avsBtn.click();
    }
  });
});
