// SPDX-License-Identifier: Apache-2.0
import { test, expect, Page } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

/**
 * Enables Developer Mode via localStorage before navigating so `<app-ui-self-repair-hud />`
 * mounts inside `@if (navShell.developerMode())` without cluttering clinical users.
 */
async function enableDeveloperModeAndEnter(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('pg_developer_mode', 'true');
    } catch {
      // ignore sandboxed frames
    }
  });
  await enterDemoMode(page);
  const pill = page.getByTestId('ui-self-repair-pill');
  await expect(pill).toBeVisible({ timeout: 15000 });
}

test.describe('UI Self-Repair Engine — Live Chromium DOM Self-Healing E2E', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);
  });

  test('1. Stays completely hidden from clinicians/patients by default and mounts only in Developer Mode', async ({ page }) => {
    await enterDemoMode(page);
    await page.waitForTimeout(800);
    await expect(page.getByTestId('ui-self-repair-pill')).toHaveCount(0);

    // Toggle Developer Mode live in-session via the Apps Hub menu button
    const hubTrigger = page.locator('#btn-apps-hub-trigger');
    await expect(hubTrigger).toBeVisible({ timeout: 10000 });
    await hubTrigger.click();
    const devToggle = page.locator('button', { hasText: /DEV MODE: OFF/i }).first();
    await expect(devToggle).toBeVisible({ timeout: 5000 });
    await devToggle.click();

    await expect(page.getByTestId('ui-self-repair-pill')).toBeVisible({ timeout: 10000 });
  });

  test('2. Detects and actually repairs a live horizontal layout overflow blowout without duplicating patches', async ({ page }) => {
    await enableDeveloperModeAndEnter(page);

    // Inject a genuine horizontal layout blowout (non-!important inline styles so stylesheet !important patch repairs it)
    await page.evaluate(() => {
      const brokenSection = document.createElement('section');
      brokenSection.id = 'e2e-overflow-fault';
      brokenSection.style.position = 'fixed';
      brokenSection.style.top = '80px';
      brokenSection.style.left = '0px';
      brokenSection.style.width = '2400px';
      brokenSection.style.maxWidth = 'none';
      brokenSection.style.height = '60px';
      brokenSection.style.overflowX = 'visible';
      brokenSection.style.zIndex = '10';
      brokenSection.textContent = 'Simulated wide clinical table blowout';
      document.body.appendChild(brokenSection);
    });

    // Confirm real blowout exists BEFORE self-repair
    const beforeMetrics = await page.evaluate(() => {
      const el = document.getElementById('e2e-overflow-fault')!;
      return {
        right: el.getBoundingClientRect().right,
        viewport: document.documentElement.clientWidth
      };
    });
    expect(beforeMetrics.right).toBeGreaterThan(beforeMetrics.viewport + 100);

    // Open Self-Repair HUD and run live audit
    await page.getByTestId('ui-self-repair-pill').click();
    await expect(page.getByTestId('ui-self-repair-drawer')).toBeVisible();
    await page.getByTestId('ui-self-repair-audit-btn').click();

    // Empirically verify real Chromium computed CSS & bounding box were repaired
    await expect.poll(async () => {
      return page.evaluate(() => {
        const el = document.getElementById('e2e-overflow-fault')!;
        const st = window.getComputedStyle(el);
        return {
          maxWidth: st.maxWidth,
          overflowX: st.overflowX,
          fitsViewport: el.getBoundingClientRect().right <= document.documentElement.clientWidth + 4
        };
      });
    }, { timeout: 5000 }).toMatchObject({
      maxWidth: '100%',
      overflowX: 'auto',
      fitsViewport: true
    });

    // Verify drawer logs the repaired layout-overflow anomaly
    await expect(page.getByTestId('ui-self-repair-drawer')).toContainText(/layout-overflow/i);

    // Run Audit Now a second time and verify style rules are strictly deduplicated (no runaway growth)
    const ruleLenBefore = await page.evaluate(
      () => (document.getElementById('pocketgull-self-repair-styles')?.textContent || '').length
    );
    await page.getByTestId('ui-self-repair-audit-btn').click();
    await page.waitForTimeout(250);
    const ruleLenAfter = await page.evaluate(
      () => (document.getElementById('pocketgull-self-repair-styles')?.textContent || '').length
    );
    expect(ruleLenAfter).toBe(ruleLenBefore);
  });

  test('3. Repairs unreadable dark-on-dark text to bone cream (#ede3d2) while leaving dark-on-light pills untouched', async ({ page }) => {
    await enableDeveloperModeAndEnter(page);

    await page.evaluate(() => {
      const host = document.querySelector('main') || document.body;

      // Real unreadable dark-on-dark clinical warning
      const darkCard = document.createElement('div');
      darkCard.style.backgroundColor = 'rgb(13, 9, 11)';
      darkCard.style.padding = '12px';
      const darkText = document.createElement('p');
      darkText.id = 'e2e-dark-on-dark';
      darkText.style.color = 'rgb(22, 18, 20)';
      darkText.textContent = 'Unreadable dark-on-dark clinical alert';
      darkCard.appendChild(darkText);
      host.prepend(darkCard);

      // Negative control: crisp dark text on a white badge (MUST NOT be painted white!)
      const lightPill = document.createElement('div');
      lightPill.style.backgroundColor = 'rgb(255, 255, 255)';
      lightPill.style.padding = '8px';
      const lightPillText = document.createElement('p');
      lightPillText.id = 'e2e-dark-on-light-pill';
      lightPillText.style.color = 'rgb(15, 23, 42)';
      lightPillText.textContent = 'High-contrast dark text on white badge';
      lightPill.appendChild(lightPillText);
      host.prepend(lightPill);
    });

    await page.getByTestId('ui-self-repair-pill').click();
    await page.getByTestId('ui-self-repair-audit-btn').click();

    await expect.poll(async () => {
      return page.evaluate(() => ({
        darkRepaired: window.getComputedStyle(document.getElementById('e2e-dark-on-dark')!).color,
        lightUntouched: window.getComputedStyle(document.getElementById('e2e-dark-on-light-pill')!).color
      }));
    }, { timeout: 5000 }).toEqual({
      darkRepaired: 'rgb(237, 227, 210)', // #ede3d2 bone cream
      lightUntouched: 'rgb(15, 23, 42)'   // untouched dark slate
    });

    await expect(page.getByTestId('ui-self-repair-drawer')).toContainText(/wcag-contrast/i);
  });

  test('4. Repairs visibly clipped analysis frames & collapsed 3D lenses, ignores hidden canvases, and rolls back cleanly', async ({ page }) => {
    await enableDeveloperModeAndEnter(page);

    await page.evaluate(() => {
      const host = document.querySelector('main') || document.body;

      // 1. Clipped visible analysis frame
      const frame = document.createElement('app-research-frame');
      frame.id = 'e2e-clipped-frame';
      frame.style.display = 'block';
      frame.style.width = '400px';
      frame.style.height = '80px';
      frame.style.overflow = 'hidden';
      const tallInner = document.createElement('div');
      tallInner.style.height = '420px';
      tallInner.textContent = 'Overflowing clinical research findings trapped by overflow:hidden';
      frame.appendChild(tallInner);
      host.prepend(frame);

      // 2. Collapsed visible 3D biophysical lens
      const lens = document.createElement('app-cardiac-electrophysiology-3d-lens');
      lens.id = 'e2e-collapsed-lens';
      lens.style.display = 'block';
      lens.style.width = '400px';
      lens.style.height = '12px';
      host.prepend(lens);

      // 3. Negative control: hidden sparkline <canvas> (MUST NOT be blown up to 360px/420px)
      const hiddenWrap = document.createElement('div');
      hiddenWrap.className = 'hidden';
      hiddenWrap.style.display = 'none';
      const hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.id = 'e2e-hidden-canvas';
      hiddenCanvas.width = 0;
      hiddenCanvas.height = 0;
      hiddenWrap.appendChild(hiddenCanvas);
      host.prepend(hiddenWrap);
    });

    await page.getByTestId('ui-self-repair-pill').click();

    // Trigger distinct targeted repairs for Frames and 3D Lenses
    await page.getByTestId('ui-self-repair-frames-btn').click();
    await page.getByTestId('ui-self-repair-lenses-btn').click();

    await expect.poll(async () => {
      return page.evaluate(() => ({
        frameOverflowY: window.getComputedStyle(document.getElementById('e2e-clipped-frame')!).overflowY,
        lensHeight: document.getElementById('e2e-collapsed-lens')!.getBoundingClientRect().height,
        hiddenCanvasMinHeight: window.getComputedStyle(document.getElementById('e2e-hidden-canvas')!).minHeight
      }));
    }, { timeout: 5000 }).toEqual({
      frameOverflowY: 'auto',
      lensHeight: 360,
      hiddenCanvasMinHeight: '0px'
    });

    // Click Rollback and verify injected <style> is flushed and original computed styles return
    await page.getByTestId('ui-self-repair-rollback-btn').click();
    await expect.poll(async () => {
      return page.evaluate(() => ({
        styleText: (document.getElementById('pocketgull-self-repair-styles')?.textContent || '').trim(),
        frameOverflowY: window.getComputedStyle(document.getElementById('e2e-clipped-frame')!).overflowY,
        lensHeight: document.getElementById('e2e-collapsed-lens')!.getBoundingClientRect().height
      }));
    }, { timeout: 5000 }).toEqual({
      styleText: '',
      frameOverflowY: 'hidden',
      lensHeight: 12
    });
  });
});
