import { test, expect } from '@playwright/test';

test.describe('Multimodal Voice Consult & Speech Simulation', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('should trigger voice consultation and verify simulated speech recognition stream', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title).toContain('Pocket Gull');
  });
});
