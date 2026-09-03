import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Physical Genomics & 3D Genome Engineering Suite E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.localStorage.setItem('pocketgull_pin_unlocked', 'true');
      window.localStorage.setItem('pg_splash_dismissed', 'true');
    });
    await setupE2ePage(page);
  });

  test('should open Physical Genomics suite via [🧬 GENOMICS] toolbar button and exercise all 5 engineering paradigms', async ({ page }) => {
    // 1. Enter demo mode
    await enterDemoMode(page);

    // 2. Locate and click the [🧬 GENOMICS] button in AnalysisContainerComponent
    const genomicsBtn = page.locator('button', { hasText: 'GENOMICS' }).first();
    await expect(genomicsBtn).toBeVisible({ timeout: 25000 });
    await genomicsBtn.click();

    // 3. Verify the Physical Genomics Suite component is rendered
    const suiteHeader = page.locator('h2', { hasText: /Physical Genomics & 3D Genome Engineering Suite/i });
    await expect(suiteHeader).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // TAB 1: 3D Chromatin Loops & Cohesin Extrusion (Hi-C)
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 1: 3D Chromatin Loops & Cohesin Extrusion...');
    const hicCanvas = page.locator('app-lens-physical-genomics canvas').first();
    await expect(hicCanvas).toBeVisible();

    const insulationHud = page.locator('app-lens-physical-genomics').getByText(/Insulation:/i).first();
    await expect(insulationHud).toBeVisible();

    // Mutate CTCF Barrier
    const mutateBtn = page.locator('button', { hasText: /Mutate Central CTCF|CTCF Motif Deleted/i }).first();
    await expect(mutateBtn).toBeVisible();
    await mutateBtn.click();
    await page.waitForTimeout(300);

    const resetBtn = page.locator('button', { hasText: /Reset/i }).first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TAB 2: Super-Enhancer Transcriptional Condensates (LLPS)
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 2: Super-Enhancer Condensates...');
    const condensatesTabBtn = page.locator('button', { hasText: /Super-Enhancers/i }).first();
    await expect(condensatesTabBtn).toBeVisible();
    await condensatesTabBtn.click();

    const dropletHud = page.locator('app-lens-physical-genomics').getByText(/MED1|Phase Separation/i).first();
    await expect(dropletHud).toBeVisible();

    const burstRateHud = page.locator('app-lens-physical-genomics').getByText(/Burst Rate:/i).first();
    await expect(burstRateHud).toBeVisible();

    // -------------------------------------------------------------
    // TAB 3: CRISPR-Cas Mechanical R-Loop Energetics
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 3: CRISPR-Cas R-Loop Energetics...');
    const crisprTabBtn = page.locator('button', { hasText: /CRISPR R-Loop/i }).first();
    await expect(crisprTabBtn).toBeVisible();
    await crisprTabBtn.click();

    const seedRegionLabel = page.locator('app-lens-physical-genomics').getByText(/PAM|Seed Region/i).first();
    await expect(seedRegionLabel).toBeVisible();

    const cleavageProbHud = page.locator('app-lens-physical-genomics').getByText(/Cleavage Prob:/i).first();
    await expect(cleavageProbHud).toBeVisible();

    // Test seed mismatch preset
    const seedMismatchPresetBtn = page.locator('button', { hasText: /Seed Mismatch/i }).first();
    await expect(seedMismatchPresetBtn).toBeVisible();
    await seedMismatchPresetBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TAB 4: Nucleosome Optical Tweezers & Epigenetics
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 4: Nucleosome Optical Tweezers...');
    const nucleosomeTabBtn = page.locator('button', { hasText: /Nucleosome Tweezers/i }).first();
    await expect(nucleosomeTabBtn).toBeVisible();
    await nucleosomeTabBtn.click();

    const outerRipLabel = page.locator('app-lens-physical-genomics').getByText(/Nucleosome|Unwrapping|Turn/i).first();
    await expect(outerRipLabel).toBeVisible();

    const polycombBtn = page.locator('button', { hasText: /Polycomb Repressive/i }).first();
    await expect(polycombBtn).toBeVisible();
    await polycombBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TAB 5: LINC Mechanotransduction & Nuclear Reprogramming
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 5: LINC Mechanotransduction...');
    const lincTabBtn = page.locator('button', { hasText: /LINC Mechanotransduction/i }).first();
    await expect(lincTabBtn).toBeVisible();
    await lincTabBtn.click();

    const ecmLabel = page.locator('app-lens-physical-genomics').getByText(/Extracellular Matrix|LINC/i).first();
    await expect(ecmLabel).toBeVisible();

    const sunLoadHud = page.locator('app-lens-physical-genomics').getByText(/SUN-Nesprin Load:/i).first();
    await expect(sunLoadHud).toBeVisible();

    // -------------------------------------------------------------
    // Snapshot Export & Modal Close
    // -------------------------------------------------------------
    const exportBtn = page.locator('button', { hasText: /Export FHIR|3D Snapshot/i }).first();
    await expect(exportBtn).toBeVisible();

    // Close panel
    await genomicsBtn.click();
    await page.waitForTimeout(500);
    await expect(suiteHeader).not.toBeVisible();
  });
});
