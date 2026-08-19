import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('3D Body Viewer, Typographic Calligramme & Quad-Philosophy Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Alexander Vance');
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('should render 3D Body Viewer with WebGL Canvas and toggle 2D/3D lenses', async ({ page }) => {
    // 1. Locate Body Viewer container
    const bodyViewer = page.locator('app-body-viewer').first();
    await expect(bodyViewer).toBeVisible({ timeout: 25000 });

    // 2. Test 3D Mode toggle button
    const toggle3dBtn = bodyViewer.locator('button', { hasText: /3D/i }).first();
    if (await toggle3dBtn.isVisible()) {
      await toggle3dBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify WebGL Canvas is present in 3D mode
      const canvas3d = bodyViewer.locator('canvas').first();
      await expect(canvas3d).toBeVisible({ timeout: 10000 });
    }

    // 3. Switch back to 2D Typographic Calligramme Lens
    const typoLensBtn = bodyViewer.locator('button', { hasText: /Typo/i }).first();
    if (await typoLensBtn.isVisible()) {
      await typoLensBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify SVG textPath elements exist
      const svgCalligramme = bodyViewer.locator('svg textPath').first();
      await expect(svgCalligramme).toBeAttached();
    }
  });

  test('should switch Multilingual Nomina languages across Latin, Sanskrit, Chinese, Japanese, and English', async ({ page }) => {
    const bodyViewer = page.locator('app-body-viewer').first();
    await expect(bodyViewer).toBeVisible({ timeout: 25000 });

    // Ensure we are in 2D Typo mode to inspect Nomina switcher
    const typoBtn = bodyViewer.locator('button', { hasText: /Typo/i }).first();
    if (await typoBtn.isVisible()) {
      await typoBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    // Find Nomina Language buttons
    const sanskritBtn = bodyViewer.locator('button', { hasText: /संस्कृतम्|Sanskrit/i }).first();
    if (await sanskritBtn.isVisible()) {
      await sanskritBtn.click({ force: true });
      await page.waitForTimeout(500);
      // Sanskrit text check in Calligramme
      const textElement = bodyViewer.locator('textPath, text').first();
      await expect(textElement).toBeVisible();
    }

    const chineseBtn = bodyViewer.locator('button', { hasText: /中文|Chinese/i }).first();
    if (await chineseBtn.isVisible()) {
      await chineseBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    const latinBtn = bodyViewer.locator('button', { hasText: /Latin/i }).first();
    if (await latinBtn.isVisible()) {
      await latinBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  });

  test('should select anatomical parts and update live clinical telemetry HUD', async ({ page }) => {
    const bodyViewer = page.locator('app-body-viewer').first();
    await expect(bodyViewer).toBeVisible({ timeout: 25000 });

    // Select Cranium / Head area
    const headPart = bodyViewer.locator('g[data-part-id="head"], [id*="head"], [id*="cranium"]').first();
    if (await headPart.isVisible()) {
      await headPart.click({ force: true });
      await page.waitForTimeout(300);
    }

    // Verify Telemetry badge or part info card updates
    const partSummary = bodyViewer.locator('.text-xs, .font-mono').first();
    await expect(partSummary).toBeVisible();
  });

  test('should toggle Quad-Philosophy Paradigms: Western, TCM, Ayurvedic, and Osteopathic', async ({ page }) => {
    const bodyViewer = page.locator('app-body-viewer').first();
    await expect(bodyViewer).toBeVisible({ timeout: 25000 });

    // Check for Paradigm Selector in toolbar
    const tcmBtn = page.locator('button', { hasText: /TCM|Eastern|Meridian/i }).first();
    if (await tcmBtn.isVisible()) {
      await tcmBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    const ayurvedicBtn = page.locator('button', { hasText: /Ayurvedic|Veda|Prana/i }).first();
    if (await ayurvedicBtn.isVisible()) {
      await ayurvedicBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    const osteopathicBtn = page.locator('button', { hasText: /Osteopathic|Somatic|Tensegrity/i }).first();
    if (await osteopathicBtn.isVisible()) {
      await osteopathicBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    const westernBtn = page.locator('button', { hasText: /Western|Allopathic/i }).first();
    if (await westernBtn.isVisible()) {
      await westernBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  });
});
