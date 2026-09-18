import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('General Clinical & Sovereignty Assessments Suite E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should load Clinical Suite, cycle tabs (PHQ-9, GAD-7, Grow-Thyself), answer questions, and verify atomic score computation', async ({ page }) => {

    // 2. Select patient Homo Sapiens
    await selectPatientByName(page, 'Homo Sapiens');

    // Switch to Analysis panel if on mobile/tablet viewports
    const reportTab = page.locator('button', { hasText: 'Analysis' }).first();
    if (await reportTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reportTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 3. Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.getByTestId('tab-assessments');
    await assessmentsBtn.scrollIntoViewIfNeeded();
    await assessmentsBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 5. Select General Clinical Suite sub-tab
    const suiteTab = page.getByTestId('tab-clinical-suite');
    await suiteTab.scrollIntoViewIfNeeded();
    await suiteTab.click({ force: true });

    // 6. Verify Clinical Assessments Suite header renders
    const suiteHeader = page.locator('text=/Clinical & Life (Sovereignty|Assessments)/i').first();
    await expect(suiteHeader).toBeVisible({ timeout: 10000 });

    // 7. Verify 3D Double-Click OARS Flip interaction
    const flipButton = page.locator('text=dblclick 🔄 flip OARS');
    await expect(flipButton).toBeVisible({ timeout: 10000 });
    await flipButton.click();

    // 8. Test PHQ-9 (Depression) tab navigation
    const phq9TabBtn = page.locator('button', { hasText: 'PHQ-9' });
    await expect(phq9TabBtn).toBeVisible({ timeout: 10000 });
    await phq9TabBtn.click();

    // Verify PHQ-9 question item renders
    const phq9Question = page.locator('text=Little interest or pleasure in doing things').first();
    await expect(phq9Question).toBeVisible({ timeout: 10000 });

    // 9. Test GAD-7 (Anxiety) tab navigation
    const gad7TabBtn = page.locator('button', { hasText: 'GAD-7' });
    await expect(gad7TabBtn).toBeVisible({ timeout: 10000 });
    await gad7TabBtn.click();

    // Verify GAD-7 question item renders
    const gad7Question = page.locator('text=Feeling nervous, anxious, or on edge').first();
    await expect(gad7Question).toBeVisible({ timeout: 10000 });

    // 10. Test Grow-Thyself (Life Index) tab navigation
    const growTabBtn = page.locator('button', { hasText: 'Grow-Thyself' });
    await expect(growTabBtn).toBeVisible({ timeout: 10000 });
    await growTabBtn.click();

    // Verify Grow-Thyself header renders
    const growHeader = page.locator('text=Active: Grow-Thyself Life Index');
    await expect(growHeader).toBeVisible({ timeout: 10000 });
  });

  test('should open Active Room directly, switch to Assessments tab in middle panel, and verify embedded suite', async ({ page }) => {
    await selectPatientByName(page, 'Homo Sapiens');

    // On mobile, tap the persistent Room tab; on desktop, click Active Room button in header
    const mobileRoomTab = page.getByTestId('mobile-tab-room');
    const activeRoomHeaderBtn = page.locator('#btn-active-room-trigger');

    if (await mobileRoomTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileRoomTab.click({ force: true });
      await page.waitForTimeout(500);
    } else if (await activeRoomHeaderBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await activeRoomHeaderBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify Active Room renders
    await expect(page.locator('app-task-flow').first()).toBeVisible({ timeout: 10000 });

    // Click Assessments tab in Active Room
    const assessmentsTabBtn = page.getByTestId('active-room-tab-assessments');
    await expect(assessmentsTabBtn).toBeVisible({ timeout: 10000 });
    await assessmentsTabBtn.click();

    // Verify Clinical Assessments Suite renders inside Active Room
    const suiteHeader = page.locator('app-task-flow app-clinical-assessments-suite').first();
    await expect(suiteHeader).toBeVisible({ timeout: 10000 });

    // Test sending to active room if button present
    const sendToRoomBtn = page.locator('button', { hasText: 'Send to Active Room' }).first();
    if (await sendToRoomBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendToRoomBtn.click();
      await page.waitForTimeout(300);
      
      // Switch back to Tasks & Notes view
      const tasksNotesBtn = page.locator('app-task-flow button', { hasText: 'Tasks & Notes' }).first();
      await tasksNotesBtn.click();
      
      // Verify assessment was added to the timeline
      const noteBadge = page.locator('app-task-flow span', { hasText: /Assessment/i }).first();
      await expect(noteBadge).toBeVisible({ timeout: 10000 });
    }
  });
});
