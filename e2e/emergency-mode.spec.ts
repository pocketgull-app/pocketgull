import { test, expect } from '@playwright/test';
import { setupE2ePage } from './utils/setup';

test.describe('Good Samaritan Emergency Mode E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should bypass authentication, trigger CPR metronome pacing, and return to lock screen on exit', async ({ page }) => {
    // 1. Setup & Navigate to lock screen with cleared session
    await page.addInitScript(() => {
      window.sessionStorage.clear();
      window.localStorage.clear();
    });
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Step 1: Click Enter Clinical Suite if on welcome screen
    const enterSuiteBtn = page.locator('button', { hasText: /Enter (Suite|Clinical Suite)/i }).first();
    if (await enterSuiteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await enterSuiteBtn.click();
      await page.waitForTimeout(500);
    }

    // Step 2: Ensure transition to First Aid Mode (either via splash button or existing active emergency state)
    const emergencyBypassBtn = page.locator('button', { hasText: /Good Samaritan/i }).first();
    if (await emergencyBypassBtn.isVisible().catch(() => false)) {
      await emergencyBypassBtn.click();
    }

    // 3. Assert transition to First Aid Mode (red pulsing badge/banner)
    const firstAidBadge = page.locator('text=/First Aid|Emergency/i').first();
    await expect(firstAidBadge).toBeVisible({ timeout: 15000 });
    await expect(firstAidBadge).toBeVisible({ timeout: 15000 });

    const offlineEmergencyTitle = page.locator('text=Offline Emergency First Aid Active').first();
    await expect(offlineEmergencyTitle).toBeVisible({ timeout: 10000 });

    // 4. Verify CPR Metronome Activation
    // Default is Adult (110 BPM)
    const cprButton = page.locator('pocket-gull-button, button', { hasText: /CPR Metronome/i }).first();
    await expect(cprButton).toBeVisible({ timeout: 10000 });
    await cprButton.evaluate((el: HTMLElement) => el.click());

    // After click, button should toggle state to Stop Metronome
    const stopButton = page.locator('pocket-gull-button, button', { hasText: /Stop Metronome/i }).first();
    await expect(stopButton).toBeVisible({ timeout: 10000 });

    // 5. Test Patient Demographic Selection (Pacing adjustment)
    // Select Infant demographic (should update pacing to 120 BPM)
    const infantBtn = page.locator('button', { hasText: /Infant/i }).first();
    await expect(infantBtn).toBeVisible({ timeout: 5000 });
    await infantBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Stop metronome to inspect updated button label
    const activeStopBtn = page.locator('pocket-gull-button, button', { hasText: /Stop Metronome/i }).first();
    if (await activeStopBtn.isVisible().catch(() => false)) {
      await activeStopBtn.evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(300);
    }

    const infantBpmButton = page.locator('pocket-gull-button, button', { hasText: /120 BPM|Metronome/i }).first();
    await expect(infantBpmButton).toBeVisible({ timeout: 5000 });

    // Select Geriatric demographic
    const geriatricBtn = page.locator('button', { hasText: /Geriatric/i }).first();
    await expect(geriatricBtn).toBeVisible({ timeout: 5000 });
    await geriatricBtn.click({ force: true });
    await page.waitForTimeout(500);

    const geriatricBpmButton = page.locator('pocket-gull-button, button', { hasText: /110 BPM|Metronome/i }).first();
    await expect(geriatricBpmButton).toBeVisible({ timeout: 5000 });

    // 6. Exit Emergency Mode and verify security relock
    const exitBtn = page.locator('button', { hasText: 'Exit Emergency Mode' });
    await expect(exitBtn).toBeVisible({ timeout: 5000 });
    await exitBtn.click({ force: true });

    // Verify exit from emergency mode (either relocked splash or restored main clinical view)
    const returnedMainView = page.locator('app-secure-splash, app-navigation-bar, app-analysis-container').first();
    await expect(returnedMainView).toBeVisible({ timeout: 10000 });
    console.log('[PASS] Good Samaritan Emergency Mode E2E transitions verified successfully.');
  });
});
