import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Human-in-the-Loop & Affirmative Clinical Oversight E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Frida Kahlo');

    // Scroll down to ensure the analysis container and toolbar are in viewport
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(800);
  });

  test('1. Caregiver Advocacy: Flesch-Kincaid Grade 6 & FDA Part 11 Proxy Seal', async ({ page }) => {
    // Open Caregiver Cheat Sheet via toolbar button
    const cheatSheetBtn = page.locator('button', { hasText: /CHEAT SHEET/i }).first();
    await expect(cheatSheetBtn).toBeVisible({ timeout: 15000 });
    await cheatSheetBtn.click();

    // Verify Cheat Sheet title
    const header = page.getByText(/Caregiver Advocacy & "Doctor Visit Cheat Sheet"/i).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    // Verify Grade 6 readability banner
    const readabilityBadge = page.getByText(/Flesch-Kincaid Grade/i).first();
    await expect(readabilityBadge).toBeVisible();

    // Verify 2:00 AM Red-Flag section
    const redFlagSection = page.getByText(/The 2:00 AM Red-Flag Guide/i).first();
    await expect(redFlagSection).toBeVisible();

    // Enter proxy name and check attestation
    const nameInput = page.locator('app-caregiver-cheat-sheet-modal input[type="text"]').first();
    await nameInput.fill('David Kahlo');

    const checkbox = page.locator('app-caregiver-cheat-sheet-modal input[type="checkbox"]').first();
    await checkbox.check();

    // Click Sign & Seal
    const sealBtn = page.locator('button', { hasText: /Sign & Cryptographically Seal/i }).first();
    await expect(sealBtn).toBeEnabled();
    await sealBtn.click();

    // Verify seal badge appears
    const sealedBadge = page.getByText(/SEALED:/i).first();
    await expect(sealedBadge).toBeVisible({ timeout: 5000 });

    // Close modal
    const closeBtn = page.locator('app-caregiver-cheat-sheet-modal button[aria-label="Close modal"]').first();
    await closeBtn.click();
    await expect(header).not.toBeVisible();
  });

  test('2. Affirmative Clinical Oversight & Non-Device Demarcation Verification', async ({ page }) => {
    // Scroll down to metadata footer
    const oversightText = page.getByText(/AI Generated Evidence\. Physician Oversight Mandated\./i).first();
    await expect(oversightText).toBeVisible({ timeout: 15000 });
  });
});
