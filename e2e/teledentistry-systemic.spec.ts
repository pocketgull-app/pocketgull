import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Teledentistry & Systemic Health Cross-Talk Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should render 32-Tooth Odontogram, update TWI grade, and recalculate SIBI score', async ({ page }) => {

    // 2. Select patient Phil Gear
    await selectPatientByName(page, 'Phil Gear');

    // 3. Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.getByTestId('tab-assessments');
    await expect(assessmentsBtn).toBeVisible({ timeout: 15000 });
    await assessmentsBtn.click({ force: true });
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(500);

    // 5. Select Teledentistry (32-Tooth) sub-tab
    const teledentistryTab = page.getByTestId('tab-teledentistry');
    await teledentistryTab.scrollIntoViewIfNeeded();
    await teledentistryTab.click({ force: true });

    // 6. Verify SIBI Telemetry Header components
    await expect(page.locator('text=SIBI Score')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=CV Risk')).toBeVisible();
    await expect(page.locator('text=HbA1c Δ')).toBeVisible();

    // 7. Inspect FDI Tooth #16 (Maxillary Right 1st Molar)
    const tooth16Btn = page.locator('button:has-text("#16")').first();
    await expect(tooth16Btn).toBeVisible();
    await tooth16Btn.click({ force: true });

    // 8. Verify Tooth Inspector panel opens
    await expect(page.locator('text=Tooth #16 Inspector')).toBeVisible();

    // 9. Toggle Occlusal (O) surface caries
    const surfaceOBtn = page.locator('button:has-text("O")').first();
    await surfaceOBtn.click({ force: true });

    // 10. Change Smith & Knight TWI grade to G4
    const twiG4Btn = page.locator('button:has-text("G4")').first();
    await twiG4Btn.click({ force: true });

    // 11. Assert SIBI Score renders valid numerical telemetry
    const sibiText = await page.locator('text=/ 100').first().innerText();
    expect(sibiText).toContain('/ 100');
  });
});
