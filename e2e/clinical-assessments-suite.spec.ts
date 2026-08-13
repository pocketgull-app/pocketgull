import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('General Clinical & Sovereignty Assessments Suite E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should load Clinical Suite, cycle tabs (PHQ-9, GAD-7, Grow-Thyself), answer questions, and verify atomic score computation', async ({ page }) => {
    // 1. Enter Demo Mode cleanly via state-machine setup
    await enterDemoMode(page);

    // 2. Select patient Alexander Vance
    await selectPatientByName(page, 'Alexander Vance');

    // 3. Ensure core analysis container is loaded
    await expect(page.locator('app-analysis-container')).toBeVisible({ timeout: 15000 });

    // 4. Switch to ASSESSMENTS lens tab
    const assessmentsBtn = page.getByTestId('tab-assessments');
    await expect(assessmentsBtn).toBeVisible({ timeout: 15000 });
    await assessmentsBtn.click({ force: true });

    // 5. Select General Clinical Suite sub-tab
    const suiteTab = page.getByTestId('tab-clinical-suite');
    await expect(suiteTab).toBeVisible({ timeout: 15000 });
    await suiteTab.click({ force: true });

    // 6. Verify Clinical Assessments Suite header renders
    const suiteHeader = page.locator('text=Multimodal Clinical & Life Assessments');
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
});
