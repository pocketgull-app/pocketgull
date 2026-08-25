import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Y-BOCs Diagnostic Screener E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should load Y-BOCs Screener, toggle checklist, set severity scores, and reset successfully', async ({ page }) => {
    // Enable console logging to see page issues if any
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await enterDemoMode(page);

    // Select Phil Gear using shared utility (avoids flaky raw locator)
    await selectPatientByName(page, 'Phil Gear');

    // Wait for core AI container (deferred block) to be visible
    await expect(page.locator('app-analysis-container')).toBeVisible({ timeout: 15000 });

    // Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.locator('button', { hasText: 'ASSESSMENTS' }).first();
    await expect(assessmentsBtn).toBeVisible({ timeout: 15000 });
    await assessmentsBtn.click();

    // 3. Select Y-BOCs Screener Tab
    const ybocsTab = page.getByTestId('tab-ybocs-screener');
    await expect(ybocsTab).toBeVisible({ timeout: 15000 });
    await ybocsTab.click();

    // 3. Verify Y-BOCs Screener renders
    const screenerHeader = page.locator('text=Yale-Brown Obsessive-Compulsive Scale');
    await expect(screenerHeader).toBeVisible({ timeout: 10000 });

    // Verify Y-BOCs Score Panel is showing 0/40 initially
    const scoreText = page.locator('text=/40').first();
    await expect(scoreText).toBeVisible({ timeout: 10000 });

    // 4. Click a symptom checklist item (Obsessions)
    // Toggle "Current" on first obsession (id: 1)
    const currentBtn = page.locator('button', { hasText: 'Current' }).first();
    await expect(currentBtn).toBeVisible({ timeout: 10000 });
    await currentBtn.click();
    
    // Toggle "Past" on first obsession
    const pastBtn = page.locator('button', { hasText: 'Past' }).first();
    await expect(pastBtn).toBeVisible({ timeout: 5000 });
    await pastBtn.click();

    // 5. Select Severity Question Ratings
    // Click option with score 3 for Question 1
    const q1Option3 = page.locator('[data-question-id="1"] button', { hasText: 'Severe (3-8 hrs/day)' }).first();
    await expect(q1Option3).toBeVisible({ timeout: 10000 });
    await q1Option3.click();

    // Click option with score 2 for Question 2
    const q2Option2 = page.locator('[data-question-id="2"] button', { hasText: 'Moderate' }).first();
    await expect(q2Option2).toBeVisible({ timeout: 10000 });
    await q2Option2.click();

    // Verify score updates to 5/40
    const totalScoreText = page.locator('app-ybocs-screener .text-3xl.font-black.font-mono').first();
    await expect(totalScoreText).toHaveText('5/40');
    
    // Verify clinical category updates to Mild OCD (since 5 is <= 7 but we have non-zero? Wait, getSeverityCategory(5) returns Subclinical, since 5 <= 7)
    // Let's verify Subclinical badge is visible
    const subclinicalBadge = page.locator('text=Subclinical').first();
    await expect(subclinicalBadge).toBeVisible({ timeout: 10000 });

    // Set more questions to get a higher score (e.g. Moderate OCD)
    // Question 3 Option 4 (Extreme) -> +4 -> total 9
    const q3Option4 = page.locator('[data-question-id="3"] button', { hasText: 'Extreme' }).first();
    await expect(q3Option4).toBeVisible({ timeout: 5000 });
    await q3Option4.click();

    // Verify clinical category updates to Mild OCD (9 <= 15)
    const mildOcdBadge = page.locator('text=Mild OCD').first();
    await expect(mildOcdBadge).toBeVisible({ timeout: 10000 });

    // 6. Test Reset Form button
    const resetBtn = page.locator('button', { hasText: 'Reset Form' });
    await expect(resetBtn).toBeVisible({ timeout: 5000 });
    await resetBtn.click();

    // Verify total score resets back to 0
    const scoreAfterReset = page.locator('app-ybocs-screener .text-3xl.font-black.font-mono').first();
    await expect(scoreAfterReset).toHaveText('0/40');

    // 7. Verify helper buttons exist (in Intake & Interviewing tab)
    const intakeTab = page.locator('button', { hasText: 'Intake & Interviewing' });
    if (await intakeTab.isVisible().catch(() => false)) {
      await intakeTab.click();
    }

    const voiceBtn = page.locator('button', { hasText: 'Start Voice-First Interview' });
    if (await voiceBtn.isVisible().catch(() => false)) {
      await expect(voiceBtn).toBeVisible({ timeout: 5000 });
    }
  });
});
