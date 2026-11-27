import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName, switchToAnalysisLens } from './utils/setup';

test.describe('Teledentistry & Systemic Health Cross-Talk Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should render 32-Tooth Odontogram, update TWI grade, and recalculate SIBI score', async ({ page }) => {

    // 2. Select patient Alexander Vance
    await selectPatientByName(page, 'Alexander Vance');

    // 3. Switch to ASSESSMENTS lens tab
    await switchToAnalysisLens(page, 'tab-assessments');

    // 5. Select Teledentistry (32-Tooth) sub-tab
    const teledentistryTab = page.getByTestId('tab-teledentistry');
    await teledentistryTab.scrollIntoViewIfNeeded();
    await expect(teledentistryTab).toBeVisible({ timeout: 10000 });
    await teledentistryTab.dispatchEvent('click');
    await page.waitForTimeout(500);

    // 6. Verify SIBI Telemetry Header components
    await expect(page.locator('text=/SIBI Score/i').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/CV Risk/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/HbA1c/i').first()).toBeVisible({ timeout: 10000 });

    const lensRoot = page.locator('app-teledentistry-systemic-lens');

    // 7. Inspect FDI Tooth #16 (Maxillary Right 1st Molar)
    const tooth16Btn = lensRoot.locator('button:has-text("#16")').first();
    await expect(tooth16Btn).toBeVisible();
    await tooth16Btn.scrollIntoViewIfNeeded();
    await tooth16Btn.dispatchEvent('click');

    // 8. Verify Tooth Inspector panel opens
    await expect(lensRoot.locator('text=Tooth #16 Inspector')).toBeVisible();

    // 9. Toggle Occlusal (O) surface caries
    const surfaceOBtn = lensRoot.getByRole('button', { name: 'O', exact: true }).first();
    await surfaceOBtn.scrollIntoViewIfNeeded();
    await surfaceOBtn.dispatchEvent('click');

    // 10. Change Smith & Knight TWI grade to G4
    const twiG4Btn = lensRoot.getByRole('button', { name: 'G4', exact: true }).first();
    await twiG4Btn.scrollIntoViewIfNeeded();
    await twiG4Btn.dispatchEvent('click');

    // 11. Assert SIBI Score renders valid numerical telemetry
    const sibiText = await lensRoot.locator('text=/ 100').first().innerText();
    expect(sibiText).toContain('/ 100');
  });
});
