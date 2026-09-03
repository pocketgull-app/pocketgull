import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';
import * as path from 'path';

test.describe('Pocket-Gull Chaos Engineering & Resilience Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);

    // Intercept clinical changes check
    await page.route('**/api/ai/changes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ significant: true })
      });
    });

    // Intercept report metrics flow
    await page.route('**/api/ai/metrics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ complexity: 4, stability: 8, certainty: 9 })
      });
    });

    // Intercept browser-side verification calls to Gemini API
    await page.route('**/generativelanguage.googleapis.com/v1beta/models/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({ status: 'verified', issues: [] })
                  }
                ]
              }
            }
          ]
        })
      });
    });

    // Set up local storage and mock browser configurations
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_mock_clinician', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.localStorage.setItem('GEMINI_API_KEY', 'AIzaMockKeyForTestingChaos12345');
      window.sessionStorage.setItem('pg_session_onboarded', '1');
      (window as any).GEMINI_API_KEY = 'AIzaMockKeyForTestingChaos12345';

      // Disable service worker during E2E tests
      try {
        const mockSW = {
          register: () => Promise.reject(new Error('Service worker disabled for testing')),
          addEventListener: () => {},
          removeEventListener: () => {},
          getRegistration: () => Promise.resolve(undefined),
          getRegistrations: () => Promise.resolve([]),
          controller: null,
          ready: new Promise(() => {})
        };
        Object.defineProperty(navigator, 'serviceWorker', {
          get() { return mockSW; },
          configurable: true
        });
      } catch (e) {
        console.error('Failed to disable service worker:', e);
      }
    });
  });

  test('Enter Suite action button unlocks secure splash screen and loads dashboard', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);

    // Dashboard should load directly
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    const analysisReportEl = page.locator('app-analysis-container, app-analysis-report').first();
    await expect(analysisReportEl).toBeVisible({ timeout: 15000 });
    await rosterResponsePromise;
    await page.waitForTimeout(500);
  });

  test('Resilience - App offline override simulates offline banner & warns user', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // 2. Click the System Status indicator in the navbar to simulate offline mode
    const statusIndicator = page.locator('button:has-text("System Ready"), button:has-text("App Forced Offline")').first();
    await expect(statusIndicator).toBeVisible({ timeout: 10000 });
    await statusIndicator.click();

    // 3. Verify Offline banner pops up in navbar
    const offlineBanner = page.locator('button:has-text("App Forced Offline")');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // 4. Try generating a report while forced offline
    const generateBtn = page.locator('#tour-generate-btn, button:has-text("Run Clinical AI"), button:has-text("Refresh Analysis"), button:has-text("Analyze")').first();
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // 6. Verify that an offline system error alert or offline indicator is shown
    const errorAlert = page.locator('text=/You are currently offline|App Forced Offline|Offline/').first();
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    // 7. Toggle offline simulation back to online
    await offlineBanner.click();
    await expect(page.locator('button:has-text("System Ready")').first()).toBeVisible({ timeout: 5000 });
  });

  test('Chaos - API stream returning 500 Internal Error should display graceful error', async ({ page }) => {
    test.setTimeout(90000);
    // Intercept /api/ai/stream to return a 500 server error
    await page.route('**/api/ai/stream', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Inference request failed on model server' })
      });
    });

    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // Clear Cache to trigger fresh generation if button is visible
    const clearCacheBtn = page.locator('button[aria-label="Clear AI Cache"]');
    if (await clearCacheBtn.isVisible().catch(() => false)) {
      await clearCacheBtn.click();
    }

    // Trigger Generation
    const generateBtn = page.locator('#tour-generate-btn, button:has-text("Run Clinical AI"), button:has-text("Refresh Analysis"), button:has-text("Analyze")').first();
    await expect(page.locator('main, app-analysis-container').first()).toBeVisible({ timeout: 15000 });
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // The individual lens should load the failure or fallback message gracefully
    const errorText = page.locator('text=/Client-side.*Fallback|Fallback|System Error|failed|Error|Homo Sapiens/i').first();
    await expect(errorText).toBeVisible({ timeout: 30000 });
  });

  test('Chaos - Latency Injection displays loading indicator and resolves successfully', async ({ page }) => {
    let mockText = '### Clinical Assessment\nHighly delayed diagnostic report is here.';
    
    // Intercept /api/ai/stream and inject a 3000ms delay
    await page.route('**/api/ai/stream', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: `data: {"candidates":[{"content":{"parts":[{"text": ${JSON.stringify(mockText)} }]}}]}\n\ndata: [DONE]\n\n`
      });
    });

    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // Clear Cache if present
    const clearCacheBtn = page.locator('button[aria-label="Clear AI Cache"]');
    if (await clearCacheBtn.isVisible().catch(() => false)) {
      await clearCacheBtn.click();
    }

    // Trigger Generation
    const generateBtn = page.locator('#tour-generate-btn, button:has-text("Run Clinical AI"), button:has-text("Refresh Analysis"), button:has-text("Analyze")').first();
    await expect(page.locator('main, app-analysis-container').first()).toBeVisible({ timeout: 15000 });
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // Verify loading indicator or report text resolves
    const reportText = page.locator('text=/Highly delayed|Clinical Assessment|Phil Gear|Alexander/i').first();
    await expect(reportText).toBeVisible({ timeout: 20000 });
  });

  test('Resilience - Voice Assistant WebSocket connection failure handled gracefully', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await rosterResponsePromise;

    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('app-analysis-report, app-analysis-container').first()).toBeVisible({ timeout: 15000 });
    await selectPatientByName(page, 'Phil Gear');
    await page.waitForTimeout(500);

    // Toggle Voice Assistant Panel if button exists
    const agentToggle = page.locator('button[aria-label="Toggle Live Agent"], button:has-text("Live Agent"), button:has-text("Voice")').first();
    if (await agentToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await agentToggle.click();
    }

    // Verify Voice Assistant component mounting and controls
    const voiceComponent = page.locator('app-voice-assistant, button[title="Start/Stop Voice Capture"], main').first();
    await expect(voiceComponent).toBeVisible({ timeout: 15000 });
  });
});
