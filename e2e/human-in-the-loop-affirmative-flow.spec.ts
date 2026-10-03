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

  test('1. Bedside Multimodal Interpreter: ACA § 1557 Qualified Language Access Flow', async ({ page }) => {
    // Open Interpreter modal via toolbar button
    const interpBtn = page.locator('button', { hasText: /INTERPRETER/i }).first();
    await expect(interpBtn).toBeVisible({ timeout: 15000 });
    await interpBtn.click();

    // Verify modal title and ACA 1557 header
    const title = page.getByText(/Bedside Live Consult & Multimodal Interpreter/i).first();
    await expect(title).toBeVisible({ timeout: 10000 });

    // Verify target language selector is present
    const langSelect = page.locator('app-bedside-interpreter-modal select').first();
    await expect(langSelect).toBeVisible();

    // Verify existing bilingual utterances exist
    const utteranceRows = page.locator('app-bedside-interpreter-modal [class*="rounded-2xl"]');
    expect(await utteranceRows.count()).toBeGreaterThan(0);

    // Send a quick prompt
    const quickPromptBtn = page.locator('button', { hasText: /Where is your pain most severe/i }).first();
    if (await quickPromptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await quickPromptBtn.click();
      await page.waitForTimeout(500);
    }

    // Close interpreter modal
    const closeBtn = page.locator('app-bedside-interpreter-modal button[aria-label="Close modal"]').first();
    await closeBtn.click();
    await expect(title).not.toBeVisible();
  });

  test('2. Caregiver Advocacy: Flesch-Kincaid Grade 6 & FDA Part 11 Proxy Seal', async ({ page }) => {
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

  test('3. Mass Casualty Rapid Triage: Tactile Physical Exam & Surge Capacity HUD', async ({ page }) => {
    // Open Disaster Triage modal via toolbar button
    const disasterBtn = page.locator('button', { hasText: /DISASTER/i }).first();
    await expect(disasterBtn).toBeVisible({ timeout: 15000 });
    await disasterBtn.click();

    // Verify Disaster Triage header
    const header = page.getByText(/Mass Casualty \/ Disaster Rapid Triage Command/i).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    // Verify Surge Status badge
    const surgeStatus = page.getByText(/SURGE STATUS: CODE RED ACTIVE/i).first();
    await expect(surgeStatus).toBeVisible();

    // Verify Tactile Console elements
    const walksBtn = page.locator('button', { hasText: /Yes \(Walks\)/i }).first();
    await walksBtn.click();

    // Verify Calculated Tag changes to GREEN
    const greenTag = page.locator('app-disaster-triage-modal').getByText(/GREEN/i).first();
    await expect(greenTag).toBeVisible();

    // Switch to Stretcher
    const stretcherBtn = page.locator('button', { hasText: /No \(Stretcher\)/i }).first();
    await stretcherBtn.click();

    // Set tachypneic breathing slider or pulse absent
    const pulseAbsentBtn = page.locator('button', { hasText: /Pulse: Absent/i }).first();
    await pulseAbsentBtn.click();

    // Verify Calculated Tag changes to RED
    const redTag = page.locator('app-disaster-triage-modal').getByText(/RED/i).first();
    await expect(redTag).toBeVisible();

    // Commit casualty to roster
    const admitBtn = page.locator('button', { hasText: /Tag & Admit Casualty/i }).first();
    await admitBtn.click();

    // Verify newly logged casualty appears in roster table
    const casualtyRows = page.locator('app-disaster-triage-modal table tbody tr');
    await expect(casualtyRows).toHaveCount(6, { timeout: 10000 });

    // Close modal
    const closeBtn = page.locator('app-disaster-triage-modal button[aria-label="Close modal"]').first();
    await closeBtn.click();
    await expect(header).not.toBeVisible();
  });

  test('4. Affirmative Clinical Oversight & Non-Device Demarcation Verification', async ({ page }) => {
    // Scroll down to metadata footer
    const oversightText = page.getByText(/AI Generated Evidence\. Physician Oversight Mandated\./i).first();
    await expect(oversightText).toBeVisible({ timeout: 15000 });
  });
});
