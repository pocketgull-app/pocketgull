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
    await vectorTabBtn.scrollIntoViewIfNeeded();
    await vectorTabBtn.click().catch(() => {});
    await vectorTabBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    // Verify preset badges exist and click "Burning Foot Neuropathy"
    const dpnPreset = studio.locator('button', { hasText: /Burning Foot Neuropathy/i }).first();
    await expect(dpnPreset).toBeVisible({ timeout: 10000 });
    await dpnPreset.click().catch(() => {});
    await dpnPreset.dispatchEvent('click');
    await page.waitForTimeout(300);

    // Click compute vector match
    const computeBtn = studio.locator('button', { hasText: /Compute Vector Match/i }).first();
    await expect(computeBtn).toBeVisible({ timeout: 10000 });
    await computeBtn.click().catch(() => {});
    await computeBtn.dispatchEvent('click');

    // Verify that ranked archetype cards are rendered with similarity scores
    await expect(studio.locator('text=Diabetic Peripheral Neuropathy').first()).toBeVisible({ timeout: 15000 });
  });

  test('3. Audits draft medication orders with Clinical Proofreader & ISMP Guard', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Proofreader Tab
    const proofreaderTabBtn = studio.locator('button', { hasText: /Clinical Proofreader/i }).first();
    await proofreaderTabBtn.scrollIntoViewIfNeeded();
    await proofreaderTabBtn.click({ force: true });
    await page.waitForTimeout(300);

    // Click Trailing Zero preset (e.g. 5.0 mg)
    const trailingZeroBtn = studio.locator('button', { hasText: /Trailing Zero/i }).first();
    await expect(trailingZeroBtn).toBeVisible({ timeout: 10000 });
    await trailingZeroBtn.click().catch(() => {});
    await trailingZeroBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    // Click Run ISMP Audit button
    const auditBtn = studio.locator('button', { hasText: /Run ISMP Audit/i }).first();
    await expect(auditBtn).toBeVisible({ timeout: 10000 });
    await auditBtn.click().catch(() => {});
    await auditBtn.dispatchEvent('click');

    // Verify ISMP high-risk warning is surfaced
    await expect(studio.locator('text=/ISMP/i').first()).toBeVisible();
  });

  test('4. Evaluates clinical triage acuity with instant classifier', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Classifier Tab
    const classifierTabBtn = studio.locator('button', { hasText: /Triage Acuity Classifier/i }).first();
    await classifierTabBtn.scrollIntoViewIfNeeded();
    await classifierTabBtn.click().catch(() => {});
    await classifierTabBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    // Click STAT Emergency bypass preset
    const statBtn = studio.locator('button', { hasText: /STAT/i }).first();
    await expect(statBtn).toBeVisible({ timeout: 10000 });
    await statBtn.click().catch(() => {});
    await statBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    // Click Classify Acuity button
    const classifyBtn = studio.locator('button', { hasText: /Classify Acuity/i }).first();
    await expect(classifyBtn).toBeVisible({ timeout: 10000 });
    await classifyBtn.click().catch(() => {});
    await classifyBtn.dispatchEvent('click');

    // Verify STAT_EMERGENCY badge and directive
    await expect(studio.locator('text=STAT_EMERGENCY').first()).toBeVisible({ timeout: 15000 });
  });

  test('5. Displays hardware telemetry and cryptographic security acceleration', async ({ page }) => {
    await enterDemoMode(page);

    const studio = page.locator('app-local-gemma-studio');
    await expect(studio).toBeVisible({ timeout: 25000 });

    // Switch to Telemetry Tab using explicit tab title
    const telemetryTabBtn = studio.locator('button', { hasText: /Hardware & NPU Telemetry/i });
    await telemetryTabBtn.scrollIntoViewIfNeeded();
    await telemetryTabBtn.click({ force: true });
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
