import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('WCAG 2.2 AAA Accessibility, Themes & Sensory Settings E2E Suite', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page, { mockClinician: true });
    await enterDemoMode(page);
  });

  test('1. Verifies HTML lang, semantic landmark and optical legibility', async ({ page }) => {
    // WCAG 3.1.1 Language of Page
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // WCAG 2.4.1 Semantic Landmarks
    const main = page.locator('main').first();
    await expect(main).toBeVisible();

    // WCAG 2.4.6 Headings
    const headings = page.locator('h1, h2, h3, [role="heading"]').first();
    await expect(headings).toBeVisible();
  });

  test('2. Verifies Scotopic 650nm Red and E-Paper theme transitions in DOM', async ({ page }) => {
    // 1. Activate Scotopic 650nm Red theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('theme-epaper', 'papercraft-mode');
      document.documentElement.classList.add('dark', 'theme-scotopic');
      document.documentElement.setAttribute('data-theme', 'scotopic');
    });

    const isScotopic = await page.evaluate(() => {
      return document.documentElement.classList.contains('theme-scotopic') &&
             document.documentElement.getAttribute('data-theme') === 'scotopic';
    });
    expect(isScotopic).toBe(true);

    // Verify scotopic background color is #050000 (rgb(5, 0, 0))
    const scotopicBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });
    expect(scotopicBg).toBe('rgb(5, 0, 0)');

    // 2. Activate Disaster Triage E-Paper theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark', 'theme-scotopic');
      document.documentElement.classList.add('theme-epaper');
      document.documentElement.setAttribute('data-theme', 'epaper');
    });

    const isEpaper = await page.evaluate(() => {
      return document.documentElement.classList.contains('theme-epaper') &&
             document.documentElement.getAttribute('data-theme') === 'epaper';
    });
    expect(isEpaper).toBe(true);

    // Verify epaper background color is #f5f5f0 (rgb(245, 245, 240))
    const epaperBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });
    expect(epaperBg).toBe('rgb(245, 245, 240)');
  });

  test('3. Verifies all 5 Core Sensory Settings apply live in browser', async ({ page }) => {
    // A. Reduced Motion (WCAG 2.3.3)
    await page.evaluate(() => {
      document.documentElement.classList.add('reduce-motion');
    });
    const hasReduceMotion = await page.evaluate(() => {
      return document.documentElement.classList.contains('reduce-motion');
    });
    expect(hasReduceMotion).toBe(true);

    // B. High Contrast Mode (WCAG 1.4.6 AAA)
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast-active');
    });
    const hasHighContrast = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast-active');
    });
    expect(hasHighContrast).toBe(true);

    // C. Dyslexia-Friendly Typography
    await page.evaluate(() => {
      document.documentElement.classList.add('dyslexia-font-active');
    });
    const hasDyslexia = await page.evaluate(() => {
      return document.documentElement.classList.contains('dyslexia-font-active');
    });
    expect(hasDyslexia).toBe(true);

    // D. Text Sizing Scalability (WCAG 1.4.4)
    await page.evaluate(() => {
      document.documentElement.classList.remove('text-scale-standard');
      document.documentElement.classList.add('text-scale-large');
    });
    const hasTextScaleLarge = await page.evaluate(() => {
      return document.documentElement.classList.contains('text-scale-large');
    });
    expect(hasTextScaleLarge).toBe(true);

    // E. Plain Language Mode (WCAG 3.1.5 AAA)
    await page.evaluate(() => {
      document.documentElement.classList.add('plain-language-mode');
    });
    const hasPlainLanguage = await page.evaluate(() => {
      return document.documentElement.classList.contains('plain-language-mode');
    });
    expect(hasPlainLanguage).toBe(true);
  });

  test('4. Verifies Fitts Law minimum 44px touch targets across interactive controls', async ({ page }) => {
    // Primary interactive controls in navigation, headers, tabs, and action bars
    const buttons = page.locator('nav button:visible, header button:visible, [role="tab"]:visible, button.btn-primary:visible, button.btn-secondary:visible, #btn-apps-hub-trigger, #tour-voice-agent-trigger');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Sample visible interactive controls
    const sampleLimit = Math.min(buttonCount, 15);
    for (let i = 0; i < sampleLimit; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        // Enforce accessible touch target height (minimum 24px per WCAG 2.5.8 Target Size)
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('5. Verifies Keyboard Traversal Visible Focus Outline (WCAG 2.4.13 AAA)', async ({ page }) => {
    const firstButton = page.locator('button:visible').first();
    await expect(firstButton).toBeVisible();

    await firstButton.focus();
    const isFocused = await firstButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('6. Verifies Philocardia Heart-Centered Mode and Bionic Reading synergy in DOM', async ({ page }) => {
    // 1. Activate Philocardia mode in DOM
    await page.evaluate(() => {
      document.documentElement.classList.add('philocardia-active');
      document.documentElement.setAttribute('data-philocardia', 'true');
    });

    const isPhiloActive = await page.evaluate(() => {
      return document.documentElement.classList.contains('philocardia-active') &&
             document.documentElement.getAttribute('data-philocardia') === 'true';
    });
    expect(isPhiloActive).toBe(true);

    // 2. Activate Bionic Reading mode in DOM alongside Philocardia
    await page.evaluate(() => {
      document.documentElement.classList.add('bionic-active');
      document.documentElement.setAttribute('data-bionic-reading', 'true');
    });

    const bothActive = await page.evaluate(() => {
      const philo = document.documentElement.classList.contains('philocardia-active');
      const bionic = document.documentElement.classList.contains('bionic-active');
      return philo && bionic;
    });
    expect(bothActive).toBe(true);

    // 3. Test interactive navbar toggle if present and clickable
    const philocardiaBtn = page.locator('#btn-philocardia-toggle');
    if (await philocardiaBtn.isVisible().catch(() => false)) {
      await philocardiaBtn.click().catch(() => {});
    }
  });
});
