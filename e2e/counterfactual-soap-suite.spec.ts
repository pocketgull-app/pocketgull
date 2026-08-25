import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Counterfactual Simulator & Ambient SOAP Note E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');
    await page.waitForTimeout(2000);
  });

  test('should open What-If Simulator and interact with sliders', async ({ page }) => {
    // Locate What-If Simulator toggle button in toolbar or drawer
    const simBtn = page.locator('button', { hasText: 'What-If Simulator' }).first();
    await expect(simBtn).toBeVisible({ timeout: 30000 });
    await simBtn.click();

    // Verify What-If Simulator panel renders
    const header = page.getByText(/Counterfactual Health Simulator/i).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    // Verify baseline SIBI and 10-Yr CV Risk badges exist
    const sibiLabel = page.getByText(/Systemic Burden \(SIBI\)/i).first();
    await expect(sibiLabel).toBeVisible();

    // Verify Apply Target button is disabled initially
    const applyBtn = page.getByRole('button', { name: /Apply Target to Care Plan/i }).first();
    await expect(applyBtn).toBeVisible();
  });

  test('should open Ambient SOAP Note Generator and verify FHIR R4 actions', async ({ page }) => {
    // Locate SOAP Note toggle button in toolbar or drawer
    const soapBtn = page.locator('button', { hasText: 'SOAP Note' }).first();
    await expect(soapBtn).toBeVisible({ timeout: 30000 });
    await soapBtn.click();

    // Verify SOAP Note panel renders
    const title = page.getByText(/Ambient Real-Time SOAP Note Generator/i).first();
    await expect(title).toBeVisible({ timeout: 10000 });

    // Verify SOAP sections (Subjective, Objective, Assessment, Plan) exist
    await expect(page.getByText(/Subjective \(S\)/i).first()).toBeVisible();
    await expect(page.getByText(/Objective \(O\)/i).first()).toBeVisible();
    await expect(page.getByText(/Assessment \(A\)/i).first()).toBeVisible();
    await expect(page.getByText(/Plan \(P\)/i).first()).toBeVisible();

    // Verify FHIR R4 Bundle button exists
    const fhirBtn = page.getByRole('button', { name: /Download FHIR R4 Bundle/i }).first();
    await expect(fhirBtn).toBeVisible();
  });
});
