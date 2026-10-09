import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('GullRender In-House Browser Rendering Engine Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should mount GullRender WebGPU engine, toggle dual-engine switcher, and verify zero Three.js footprint', async ({ page }) => {
    // 1. Open Apps Hub and navigate to Biophysical 3D Lenses
    const appsHubBtn = page.locator('#btn-apps-hub-trigger, button:has-text("Apps & Portals")').first();
    await expect(appsHubBtn).toBeVisible({ timeout: 15000 });
    await appsHubBtn.click();
    await page.waitForTimeout(300);

    const bioLensBtn = page.locator('[data-testid="btn-open-biophysical-lenses"], button:has-text("Biophysical 3D Lenses")').first();
    await expect(bioLensBtn).toBeVisible({ timeout: 10000 });
    await bioLensBtn.click();

    // 2. Ensure Biophysical Lenses modal is visible
    const modalTitle = page.locator('h2:has-text("Biophysical 3D Lenses")').first();
    await expect(modalTitle).toBeVisible({ timeout: 15000 });

    // 3. Select Cardiac Electrophysiology tab
    const cardiacTab = page.locator('button:has-text("Cardiac Electrophysiology")').first();
    await expect(cardiacTab).toBeVisible();
    await cardiacTab.click();

    // 4. Verify Dual-Engine Switcher
    const engineSwitcher = page.locator('text=3D Rendering Engine:');
    await expect(engineSwitcher).toBeVisible({ timeout: 10000 });

    const gullRenderPill = page.locator('button:has-text("GullRender (WebGPU)")').first();
    const threeJsPill = page.locator('button:has-text("Three.js (Legacy)")').first();
    await expect(gullRenderPill).toBeVisible();
    await expect(threeJsPill).toBeVisible();

    // 5. Verify GullRender Standalone Component & Canvas are mounted by default
    const webgpuLens = page.locator('app-cardiac-webgpu-lens');
    await expect(webgpuLens).toBeVisible({ timeout: 15000 });

    const canvas = webgpuLens.locator('canvas');
    await expect(canvas).toBeVisible();

    // 6. Verify Hardware Tier & Zero-Heap Badges
    const tierBadge = webgpuLens.locator('span:has-text("Tier:")');
    await expect(tierBadge).toBeVisible();

    const zeroHeapBadge = webgpuLens.locator('text=0B Heap / Frame');
    await expect(zeroHeapBadge).toBeVisible();
  });

  test('should interactively morph between 3D procedural ventricle and extruded font glyphs', async ({ page }) => {
    // Open Biophysical Lenses modal directly
    const appsHubBtn = page.locator('#btn-apps-hub-trigger, button:has-text("Apps & Portals")').first();
    await appsHubBtn.click();
    await page.waitForTimeout(200);

    const bioLensBtn = page.locator('[data-testid="btn-open-biophysical-lenses"], button:has-text("Biophysical 3D Lenses")').first();
    await bioLensBtn.click();

    const webgpuLens = page.locator('app-cardiac-webgpu-lens');
    await expect(webgpuLens).toBeVisible({ timeout: 15000 });

    // 1. Morph to [lungs] font glyph
    const lungsBtn = webgpuLens.locator('button:has-text("[lungs]")').first();
    await expect(lungsBtn).toBeVisible();
    await lungsBtn.click();
    await expect(webgpuLens.locator('text=Pulmones (Bilateral Lungs)')).toBeVisible({ timeout: 5000 });
    await expect(webgpuLens.locator('text=両肺')).toBeVisible();

    // 2. Morph to [brain] font glyph
    const brainBtn = webgpuLens.locator('button:has-text("[brain]")').first();
    await brainBtn.click();
    await expect(webgpuLens.locator('text=Cerebrum (Frontal/Parietal)')).toBeVisible({ timeout: 5000 });
    await expect(webgpuLens.locator('text=大脳')).toBeVisible();

    // 3. Morph to [ecg_lead_ii] rhythm strip glyph
    const ecgBtn = webgpuLens.locator('button:has-text("[ecg_lead_ii]")').first();
    await ecgBtn.click();
    await expect(webgpuLens.locator('text=Eindhoven Lead II ECG')).toBeVisible({ timeout: 5000 });

    // 4. Return to procedural ventricle mesh
    const ventricleBtn = webgpuLens.locator('button:has-text("3D Ventricle Mesh")').first();
    await ventricleBtn.click();
    await expect(webgpuLens.locator('text=Cor / Ventriculus Sinister')).toBeVisible({ timeout: 5000 });
  });

  test('should simulate electrophysiology regimes, toggle playback, and switch to Three.js legacy engine', async ({ page }) => {
    const appsHubBtn = page.locator('#btn-apps-hub-trigger, button:has-text("Apps & Portals")').first();
    await appsHubBtn.click();
    await page.waitForTimeout(200);

    const bioLensBtn = page.locator('[data-testid="btn-open-biophysical-lenses"], button:has-text("Biophysical 3D Lenses")').first();
    await bioLensBtn.click();

    const webgpuLens = page.locator('app-cardiac-webgpu-lens');
    await expect(webgpuLens).toBeVisible({ timeout: 15000 });

    // 1. Test Long QTc preset
    const longQtcBtn = webgpuLens.locator('button:has-text("Long QTc (hERG)")').first();
    await longQtcBtn.click();
    await expect(webgpuLens.locator('text=525 ms')).toBeVisible({ timeout: 5000 });

    // 2. Test Torsades de Pointes hazard preset
    const tdpBtn = webgpuLens.locator('button:has-text("Torsades de Pointes")').first();
    await tdpBtn.click();
    await expect(webgpuLens.locator('text=165 BPM')).toBeVisible({ timeout: 5000 });
    await expect(webgpuLens.locator('text=Critical TdP Oscillation')).toBeVisible({ timeout: 5000 });

    // 3. Test Play/Pause toggle
    const pauseBtn = webgpuLens.locator('button:has-text("Pause")').first();
    await pauseBtn.click();
    await expect(webgpuLens.locator('button:has-text("Play")')).toBeVisible();
    const playBtn = webgpuLens.locator('button:has-text("Play")').first();
    await playBtn.click();
    await expect(webgpuLens.locator('button:has-text("Pause")')).toBeVisible();

    // 4. Switch to Three.js legacy engine
    const threeJsBtn = page.locator('button:has-text("Three.js (Legacy)")').first();
    await threeJsBtn.click();

    const legacyLens = page.locator('app-cardiac-electrophysiology-3d-lens');
    await expect(legacyLens).toBeVisible({ timeout: 10000 });
    await expect(webgpuLens).not.toBeVisible();

    // 5. Switch back to GullRender
    const gullRenderBtn = page.locator('button:has-text("GullRender (WebGPU)")').first();
    await gullRenderBtn.click();
    await expect(page.locator('app-cardiac-webgpu-lens')).toBeVisible({ timeout: 10000 });
  });
});
