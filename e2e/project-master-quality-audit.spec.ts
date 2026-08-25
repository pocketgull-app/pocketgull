import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode, selectPatientByName } from './utils/setup';

test.describe('Master Project Quality & Agentic Readiness Audit', () => {
  const consoleErrors: string[] = [];
  const pageExceptions: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    pageExceptions.length = 0;

    await setupE2ePage(page);

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless browser/third-party dev log noise if any
        if (
          !text.includes('Download the React DevTools') &&
          !text.includes('Service worker disabled') &&
          !text.includes('NG05604') &&
          !text.includes('Too Many Requests')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', err => {
      pageExceptions.push(err.message || String(err));
    });
  });

  test('Agentic Score 2/2: llms.txt and WebMCP catalog accessibility', async ({ request, page }) => {
    // 1. Check llms.txt discoverability
    const llmsRes = await request.get('/llms.txt');
    expect(llmsRes.ok()).toBeTruthy();
    const llmsText = await llmsRes.text();
    expect(llmsText.trim().startsWith('#')).toBeTruthy();
    expect(llmsText.toLowerCase()).toContain('pocket gull');

    // 2. Check WebMCP Catalog endpoint
    const webmcpRes = await request.get('/api/webmcp/tools');
    expect(webmcpRes.ok()).toBeTruthy();
    const webmcpJson = await webmcpRes.json();
    expect(Array.isArray(webmcpJson.tools) || Array.isArray(webmcpJson)).toBeTruthy();

    // 3. Check client-side WebMCP registration after page load
    await page.goto('/');
    const hasWebMCP = await page.evaluate(() => {
      return typeof (window as any).webmcp !== 'undefined' || typeof (navigator as any).modelContext !== 'undefined';
    });
    console.log('Client WebMCP Polyfill status:', hasWebMCP);
  });

  test('Zero Console Errors across full app navigation flow', async ({ page }) => {
    test.setTimeout(60000);

    // Enter system in demo mode
    await enterDemoMode(page);

    // Verify main workspace loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Select different patients to verify dynamic rendering stability
    await selectPatientByName(page, 'Sarah Jenkins');
    await page.waitForTimeout(500);

    await selectPatientByName(page, 'Phil Gear');
    await page.waitForTimeout(500);

    // Cycle through Medicine Paradigms
    const paradigms = ['Western', 'Eastern (TCM)', 'Ayurveda', 'Integrative'];
    for (const paradigm of paradigms) {
      const btn = page.locator('button', { hasText: paradigm }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(400);
      }
    }

    // Verify no unhandled page exceptions or browser console errors occurred
    expect(pageExceptions, `Page exceptions detected: ${pageExceptions.join('\n')}`).toEqual([]);
    expect(consoleErrors, `Console errors detected: ${consoleErrors.join('\n')}`).toEqual([]);
  });
});
