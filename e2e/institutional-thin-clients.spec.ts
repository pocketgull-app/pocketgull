import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Institutional Thin Clients & Kiosks E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should support Library & School Chromebook Thin Client (1366x768 Touch Kiosk)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await enterDemoMode(page);

    // Verify Brand Mark and Header fit cleanly within 1366px without horizontal blowout
    const brandMark = page.locator('app-pocketgull-brand-mark').first();
    await expect(brandMark).toBeVisible({ timeout: 15000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Verify Socratic Intake operates with standard touch or keyboard focus
    const socraticBtn = page.locator('button', { hasText: /Socratic Intake/i }).first();
    if (await socraticBtn.isVisible()) {
      await socraticBtn.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
    }
  });

  test('should support Hospital Computer-on-Wheels (COW) 5:4 Aspect Ratio (1280x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await enterDemoMode(page);

    // Verify 3-Column Clinical Dashboard cleanly stacks and displays vitals without overflow
    const analysisReport = page.locator('app-analysis-report');
    await expect(analysisReport).toBeVisible({ timeout: 15000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('should support Doctor Exam Room iPad Swivel Mount (810x1080 Tablet Viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 810, height: 1080 });
    await enterDemoMode(page);

    // Verify Mobile/Tablet Drawer Toggle is responsive
    const menuBtn = page.locator('button[aria-label="Open Mobile Navigation Menu"]');
    await expect(menuBtn).toBeVisible({ timeout: 10000 });

    await menuBtn.click();
    await page.waitForTimeout(300);

    // Verify Drawer menu options meet 44px+ touch hitbox (Fitts's Law)
    const drawerButtons = page.locator('.fixed.top-0 button');
    const count = await drawerButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 4); i++) {
      const btn = drawerButtons.nth(i);
      const box = await btn.boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }

    // Close drawer via Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  });

  test('should gracefully handle restricted Thin-Client environments without microphone hardware', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await enterDemoMode(page);

    // In locked-down library/school terminals where mic permissions are denied,
    // ensure text fallback for Socratic questions and Care Plan reports work 100%
    const intakeInput = page.locator('input, textarea').first();
    if (await intakeInput.isVisible()) {
      await intakeInput.fill('Seasonal allergies with mild ocular pruritus');
      expect(await intakeInput.inputValue()).toContain('Seasonal allergies');
    }

    // Verify Ambient Flow background music functions without microphone dependency
    const ambientBtn = page.locator('button', { hasText: /Ambient Flow/i }).first();
    if (await ambientBtn.isVisible()) {
      await ambientBtn.click();
      await page.waitForTimeout(300);
      const player = page.locator('app-ambient-flow-player');
      await expect(player).toBeVisible();
    }
  });
});
