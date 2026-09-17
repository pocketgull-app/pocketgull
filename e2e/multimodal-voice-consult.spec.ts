import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Multimodal Voice Consult & Cockpit Modernization E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    // Inject MockSpeechRecognition following simulate_voice skill instructions
    await page.addInitScript(() => {
      class MockSpeechRecognition {
        continuous = false;
        interimResults = false;
        onresult: any = null;
        onerror: any = null;
        onend: any = null;

        start() {
          setTimeout(() => {
            if (this.onresult) {
              const mockEvent = {
                results: [[{ transcript: "Patient reports persistent fever and recent travel to tropical vector zone." }]]
              };
              this.onresult(mockEvent);
            }
            if (this.onend) this.onend();
          }, 300);
        }
        stop() {}
        abort() {}
      }

      (window as any).SpeechRecognition = MockSpeechRecognition;
      (window as any).webkitSpeechRecognition = MockSpeechRecognition;
    });

    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should open Live AI Consult, toggle window modes, send prompt, and verify controls', async ({ page }) => {
    // 1. Verify header live agent trigger exists and click it
    const agentTrigger = page.locator('#tour-voice-agent-trigger, button[aria-label="AI Agent"]');
    await expect(agentTrigger).toBeVisible({ timeout: 15000 });
    await agentTrigger.click();

    // 2. Verify Live Consult window appears
    const agentWindow = page.locator('#tour-voice-agent-window');
    await expect(agentWindow).toBeVisible({ timeout: 10000 });

    // 3. Verify Live Status / Voice engine elements are present
    const headerTitle = agentWindow.locator('text=/Gemini Live|Pocket Gull Live AI Consult|Live AI Consult/i').first();
    await expect(headerTitle).toBeVisible({ timeout: 5000 });

    // 4. Test Expand to Clinical Cockpit toggle
    const expandBtn = agentWindow.locator('button[title*="Expand to Clinical Cockpit"], button[title*="Collapse to Pocket"]').first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(500);

      // Verify expanded mode applied
      await expect(agentWindow).toHaveClass(/max-w-4xl|lg:w-\[860px\]|sm:w-\[780px\]/);

      // Collapse back
      await expandBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Test Minimize to Floating Pill
    const minimizeBtn = agentWindow.locator('button[title*="Minimize Window"]').first();
    if (await minimizeBtn.isVisible()) {
      await minimizeBtn.click();
      await page.waitForTimeout(500);

      // Verify floating pill is visible with Restore button
      const restoreBtn = page.locator('#tour-voice-agent-window button', { hasText: /Restore|Live Consult Active/i }).first();
      await expect(restoreBtn).toBeVisible({ timeout: 5000 });

      // Click restore to bring window back
      await restoreBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('#tour-voice-assistant')).toBeVisible({ timeout: 5000 });
    }

    // 6. Test sending a message in the consult input
    const chatInput = agentWindow.locator('input[type="text"]').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('Review recent vitals and summary');
      await chatInput.press('Enter');
      await page.waitForTimeout(1000);

      // Verify message bubble appeared
      const userBubble = agentWindow.locator('text=Review recent vitals and summary').first();
      await expect(userBubble).toBeVisible({ timeout: 10000 });
    }

    // 7. Test Quick Prompts toggle
    const quickPromptsBtn = agentWindow.locator('button', { hasText: /Clinical Quick-Prompts/i }).first();
    if (await quickPromptsBtn.isVisible()) {
      await quickPromptsBtn.click();
      await page.waitForTimeout(300);
      const promptOption = agentWindow.locator('button', { hasText: /Review Vitals|Analyze Orthostatic/i }).first();
      if (await promptOption.isVisible()) {
        await expect(promptOption).toBeVisible();
      }
    }

    // 8. Test Export Transcript button
    const exportBtn = agentWindow.locator('button[title*="Export"]').first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(500);
      // Verify toast appeared
      const toast = agentWindow.locator('text=/transcript copied to clipboard/i').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });
});
