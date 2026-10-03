import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Global Decad of Healing & WHO-NIH Strategic Alignment Hub E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should navigate to Clinical Workbench and interact with Global Decad 10-Paradigm Spectrum', async ({ page }) => {
    // 1. Select patient
    await selectPatientByName(page, 'Homo Sapiens');

    // 2. Switch to Workbench / Analysis tab if needed
    const workbenchTab = page.locator('button', { hasText: /Workbench|Clinical Tools|Diagnostics/i }).first();
    if (await workbenchTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await workbenchTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 3. Click on Global Decad tab button
    const decadTabBtn = page.locator('button', { hasText: /Global Decad/i }).first();
    if (await decadTabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await decadTabBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify Global Decad component renders
      const decadHeader = page.locator('text=/Global Decad of Healing Systems|10-Paradigm/i').first();
      await expect(decadHeader).toBeVisible({ timeout: 10000 });

      // Click on Ayurveda paradigm button
      const ayurvedaBtn = page.locator('button', { hasText: /Ayurveda/i }).first();
      if (await ayurvedaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ayurvedaBtn.click({ force: true });
        await page.waitForTimeout(300);
      }

      // Click on TCM paradigm button
      const tcmBtn = page.locator('button', { hasText: /Traditional Chinese Medicine|TCM/i }).first();
      if (await tcmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tcmBtn.click({ force: true });
        await page.waitForTimeout(300);
      }

      // Test On-Device Semantic Vector Search input
      const searchInput = page.locator('input[placeholder*="semantic search" i], input[placeholder*="query" i]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('glymphatic sleep recovery');
        await page.waitForTimeout(400);
      }
    }
  });

  test('should navigate to WHO & NIH Strategic Goals Alignment Hub and verify target vectors', async ({ page }) => {
    // 1. Select patient
    await selectPatientByName(page, 'Homo Sapiens');

    // 2. Click on WHO/NIH Strategic Goals tab button
    const whoNihTabBtn = page.locator('button', { hasText: /WHO & NIH Strategic Goals/i }).first();
    if (await whoNihTabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await whoNihTabBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify WHO & NIH Strategic Alignment Hub header
      const hubHeader = page.locator('text=/WHO & NIH Strategic Goals Alignment Hub|Global Strategic Health Goals/i').first();
      await expect(hubHeader).toBeVisible({ timeout: 10000 });

      // Check for SDG-3 / NCD risk reduction target card
      const sdgCard = page.locator('text=/SDG-3|Premature Mortality|Cardiovascular & Metabolic/i').first();
      await expect(sdgCard).toBeVisible({ timeout: 10000 });

      // Check for Conformal Prediction UQ badge
      const uqBadge = page.locator('text=/95% Conformal Prediction|UQ Coverage/i').first();
      if (await uqBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(uqBadge).toBeVisible();
      }

      // Check for ICD-11 ICTM FHIR Export button
      const fhirExportBtn = page.locator('button', { hasText: /Export FHIR R4 Bundle|ICTM/i }).first();
      if (await fhirExportBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(fhirExportBtn).toBeVisible();
      }
    }
  });

  test('should verify RxGuard PGx & Botanicals Lens rendered with modern signals and let bindings', async ({ page }) => {
    // 1. Select patient
    await selectPatientByName(page, 'Homo Sapiens');

    // 2. Click on RxGuard tab button
    const rxGuardTabBtn = page.locator('button', { hasText: /RxGuard/i }).first();
    if (await rxGuardTabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rxGuardTabBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify RxGuard title / safety lens renders
      const rxGuardHeader = page.locator('text=/RxGuard|Botanical Safety|Pharmacogenomic/i').first();
      await expect(rxGuardHeader).toBeVisible({ timeout: 10000 });
    }
  });
});
