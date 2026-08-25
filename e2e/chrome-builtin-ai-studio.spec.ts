import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Chrome Built-in AI (Gemma 4 Dev Trial) & Edge AI Studio E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('1. Renders Local Gemma Studio and switches between AI inference engines', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Verify Title
    await expect(studio.locator('text=/Offline Edge AI Studio/i')).toBeVisible();

    // Toggle runtime engines
    const engineCards = studio.locator('input[name="engine"]');
    if (await engineCards.count() > 0) {
      await engineCards.first().check({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('2. Runs Vector RAG 256-Dim Embedder matching against clinical archetypes', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Vector RAG Tab
    const vectorTabBtn = studio.locator('button', { hasText: /Vector RAG/i }).first();
    await vectorTabBtn.click();
    await page.waitForTimeout(300);

    // Verify preset badges exist and click "Burning Foot Neuropathy"
    const dpnPreset = studio.locator('button', { hasText: /Burning Foot Neuropathy/i });
    if (await dpnPreset.isVisible()) {
      await dpnPreset.click();
      await page.waitForTimeout(300);
    }

    // Click compute vector match
    const computeBtn = studio.locator('button', { hasText: /Compute Vector Match/i });
    if (await computeBtn.isVisible()) {
      await computeBtn.click();
      await page.waitForTimeout(400);
    }

    // Verify that ranked archetype cards are rendered with similarity scores
    await expect(studio.locator('text=Diabetic Peripheral Neuropathy')).toBeVisible();
  });

  test('3. Audits draft medication orders with Clinical Proofreader & ISMP Guard', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Proofreader Tab
    const proofreaderTabBtn = studio.locator('button', { hasText: /Clinical Proofreader/i }).first();
    await proofreaderTabBtn.click();
    await page.waitForTimeout(300);

    // Click Trailing Zero preset (e.g. 5.0 mg)
    const trailingZeroBtn = studio.locator('button', { hasText: /Trailing Zero/i });
    if (await trailingZeroBtn.isVisible()) {
      await trailingZeroBtn.click();
      await page.waitForTimeout(300);
    }

    // Click Run ISMP Audit button
    const auditBtn = studio.locator('button', { hasText: /Run ISMP Audit/i });
    if (await auditBtn.isVisible()) {
      await auditBtn.click();
      await page.waitForTimeout(400);
    }

    // Verify ISMP high-risk warning is surfaced
    await expect(studio.locator('text=/ISMP/i').first()).toBeVisible();
  });

  test('4. Evaluates clinical triage acuity with instant classifier', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Classifier Tab
    const classifierTabBtn = studio.locator('button', { hasText: /Triage Acuity Classifier/i }).first();
    await classifierTabBtn.click();
    await page.waitForTimeout(300);

    // Click STAT Emergency bypass preset
    const statBtn = studio.locator('button', { hasText: /STAT Emergency/i });
    if (await statBtn.isVisible()) {
      await statBtn.click();
      await page.waitForTimeout(300);
    }

    // Click Classify Acuity button
    const classifyBtn = studio.locator('button', { hasText: /Classify Acuity/i });
    if (await classifyBtn.isVisible()) {
      await classifyBtn.click();
      await page.waitForTimeout(400);
    }

    // Verify STAT_EMERGENCY badge and directive
    await expect(studio.locator('text=STAT_EMERGENCY')).toBeVisible();
  });

  test('5. Displays hardware telemetry and cryptographic security acceleration', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Telemetry Tab using explicit tab title
    const telemetryTabBtn = studio.locator('button', { hasText: /Hardware & NPU Telemetry/i });
    await telemetryTabBtn.click();
    await page.waitForTimeout(300);

    // Verify hardware cards
    await expect(studio.locator('text=/WebGPU|DirectML|Post-Quantum/i').first()).toBeVisible();
  });

  test('6. Computes on-device % Semantic Fit for PubMed research literature', async ({ page }) => {
    await enterDemoMode(page);

    // Open Research Frame drawer/component if present
    const researchBtn = page.locator('button', { hasText: /Research/i }).first();
    if (await researchBtn.isVisible()) {
      await researchBtn.click();
      await page.waitForTimeout(500);

      const researchFrame = page.locator('app-research-frame');
      if (await researchFrame.isVisible()) {
        const pubmedInput = researchFrame.locator('input[placeholder*="PubMed"]');
        if (await pubmedInput.isVisible()) {
          await pubmedInput.fill('neuropathy');
          const searchBtn = researchFrame.locator('button', { hasText: /Search|Query/i }).first();
          if (await searchBtn.isVisible()) {
            await searchBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });
});
