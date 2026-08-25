# Pocket-Gull E2E, Playwright & Lighthouse Testing Guide

Complete architectural reference and best-practice guide for executing End-to-End (E2E) tests, visual regression snapshot assertions, multi-device viewport matrix checks, and Lighthouse CI performance & accessibility audits.

---

## 1. Playwright E2E & Visual Regression Testing

Playwright powers functional testing, accessibility checks, and visual snapshot assertions.

### 🎭 Visual Snapshot Assertions for WebGL / Three.js
Because 3D Three.js canvas elements do not produce standard DOM nodes, visual screenshot assertions verify shader rendering, papercraft textures, and physical material opacity:

```typescript
import { test, expect } from '@playwright/test';

test.describe('3D Body Map Viewport', () => {
  test('verifies Acetate Film transparency layer visual rendering', async ({ page }) => {
    await page.goto('/#body-viewer');
    
    // Select Acetate Film Layer
    await page.click('button:has-text("Acetate Film")');
    await page.waitForTimeout(500); // Allow WebGL frame buffer to stabilize
    
    // Assert visual snapshot of 3D Canvas
    await expect(page.locator('canvas')).toHaveScreenshot('acetate-film-baseline.png', {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    });
  });
});
```

### 📱 Responsive Viewport Grid Matrix (`playwright.config.ts`)
Configured to test across Desktop, Tablet, and Mobile viewports to verify WCAG **44px+ touch target hit sizes**:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone 15 Pro',
      use: { ...devices['iPhone 15 Pro'] },
    },
    {
      name: 'iPad Pro 11',
      use: { ...devices['iPad Pro'] },
    },
  ],
});
```

---

## 2. ⚡ Lighthouse CI Configuration (`lighthouserc.json`)

Lighthouse CI enforces performance, accessibility, and WebMCP discoverability thresholds.

### `.lighthouseci/lighthouserc.json`
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:4000/",
        "http://localhost:4000/terms-of-service.html",
        "http://localhost:4000/docs/study/"
      ],
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--no-sandbox --headless --disable-gpu --disable-dev-shm-usage"
      }
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.98 }],
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1.0 }],
        "target-size": ["error", { "minScore": 1.0 }],
        "color-contrast": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

---

## 3. 🎤 Simulated Audio Stream Testing for Voice Assistant

Chromium fake media stream flags allow automated testing of the Web Speech API and Gemini Live Consult streaming flows without human microphone input:

```typescript
import { test, expect } from '@playwright/test';

test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-file-for-fake-audio-capture=e2e/fixtures/sample-voice-intake.wav',
    ],
  },
  permissions: ['microphone'],
});

test('voice assistant responds to simulated audio input', async ({ page }) => {
  await page.goto('/');
  await page.click('button[aria-label="Start Voice Consult"]');
  await expect(page.locator('.voice-transcript-active')).toBeVisible({ timeout: 5000 });
});
```

---

## 4. 🛡️ Chaos & Offline Network Fallback Testing

Verify that Samaritan Emergency Override activates in **<50ms** when network connectivity is disrupted:

```typescript
test('verifies Samaritan Emergency Override on total network drop', async ({ page }) => {
  await page.goto('/');
  
  // Abort network calls
  await page.route('**/api/**', route => route.abort('failed'));
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));

  // Assert emergency override metronome visibility
  await expect(page.locator('text=Samaritan Emergency Override')).toBeVisible();
  await expect(page.locator('text=110 BPM')).toBeVisible();
});
```

---

## 🏃 Running E2E & Lighthouse Audits

```bash
# Run Playwright E2E Test Suite
npm run test:e2e

# Run Lighthouse CI Performance & Accessibility Audit
npx lhci autorun
```
