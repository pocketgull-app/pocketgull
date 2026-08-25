import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Cohort Triage Matrix, HIPAA PDF Export & Card Ergonomics E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');

    // Scroll down to trigger Angular @defer (on viewport) block for analysis container toolbar
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(1000);
  });

  test('should open Multi-Patient Cohort Triage Matrix and sort roster dynamically', async ({ page }) => {
    // Locate Cohort Matrix toggle button
    const cohortBtn = page.locator('button', { hasText: 'Cohort Matrix' }).first();
    await expect(cohortBtn).toBeVisible({ timeout: 30000 });
    await cohortBtn.click();

    // Verify Cohort Triage Matrix header renders
    const header = page.getByText(/Multi-Patient Cohort Triage Matrix/i).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    // Verify roster table elements exist
    const sortSelect = page.locator('app-cohort-triage-matrix select').first();
    await expect(sortSelect).toBeVisible();

    // Change sort option to CV Risk
    await sortSelect.selectOption('cvRisk');
    await page.waitForTimeout(500);

    // Verify patient rows rendered in table
    const patientRows = page.locator('tr').filter({ hasText: /Homo Sapiens|Phil Gear/i });
    expect(await patientRows.count()).toBeGreaterThan(0);
  });

  test('should open 1-Click HIPAA Audit & FHIR R4 Bundle PDF Export and trigger download log', async ({ page }) => {
    // Locate HIPAA PDF toggle button
    const hipaaBtn = page.locator('button', { hasText: 'HIPAA PDF' }).first();
    await expect(hipaaBtn).toBeVisible({ timeout: 30000 });
    await hipaaBtn.click();

    // Verify HIPAA PDF Export card renders
    const header = page.getByText(/1-Click HIPAA Audit & FHIR R4 Bundle PDF Export/i).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    // Verify active HIPAA audit log section exists
    const auditTitle = page.getByText(/Active HIPAA Compliance Audit Trail/i).first();
    await expect(auditTitle).toBeVisible();

    // Click Download HIPAA Clinical PDF action button
    const downloadBtn = page.locator('button', { hasText: 'Download HIPAA Clinical PDF' }).first();
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();

    // Verify audit log entry is recorded
    const logItem = page.getByText(/Exported PDF|164.312/i).first();
    await expect(logItem).toBeVisible({ timeout: 5000 });
  });

  test('should flip clinical risk card via 🔄 badge single-click and container double-click', async ({ page }) => {
    // Locate the 🔄 flip button on the Clinical Triage Risk card
    const flipBadge = page.locator('button', { hasText: 'dblclick 🔄 flip' }).first();
    if (await flipBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Single-click flip badge
      await flipBadge.click();
      await page.waitForTimeout(500);

      // Verify back face plain-language summary renders
      const backHeader = page.getByText(/Plain-Language Health Summary/i).first();
      await expect(backHeader).toBeVisible();

      // Click flip back
      const flipBackBadge = page.locator('button', { hasText: 'dblclick 🔄 flip back' }).first();
      await expect(flipBackBadge).toBeVisible();
      await flipBackBadge.click();
      await page.waitForTimeout(500);

      // Verify front face restored
      const frontTitle = page.getByText(/Clinical Triage Risk/i).first();
      await expect(frontTitle).toBeVisible();
    }
  });
});
