import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Stripe Billing & Self-Service Customer Portal E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
    await enterDemoMode(page);
  });

  test('should open Billing & Subscription modal and display active plan metrics', async ({ page }) => {
    // 1. Locate and click Billing & Plan header button
    const billingHeaderBtn = page.locator('button', { hasText: /billing & plan/i });
    await expect(billingHeaderBtn).toBeVisible({ timeout: 15000 });
    await billingHeaderBtn.click({ force: true });

    // 2. Verify Billing & Subscription modal dialog opens
    const modalDialog = page.locator('div[role="dialog"]');
    await expect(modalDialog).toBeVisible({ timeout: 10000 });
    await expect(modalDialog).toContainText(/billing & subscription/i);

    // 3. Verify Active Plan badge & API usage progress indicators
    await expect(modalDialog).toContainText(/clinical pro active/i);
    await expect(modalDialog).toContainText(/clinical pro/i);
    await expect(modalDialog).toContainText(/4,281/i);
    await expect(modalDialog).toContainText(/10,000 queries/i);

    // 4. Verify Upgrade to Enterprise & Manage Subscription buttons exist
    const upgradeBtn = modalDialog.locator('button', { hasText: /upgrade to enterprise/i });
    const portalBtn = modalDialog.locator('button', { hasText: /manage subscription/i });

    await expect(upgradeBtn).toBeVisible();
    await expect(portalBtn).toBeVisible();
  });

  test('should trigger Stripe Checkout Session API with correct priceId payload', async ({ page }) => {
    let capturedCheckoutPayload: any = null;

    // Route intercept /api/billing/checkout to verify API contract & return mock checkout URL
    await page.route('**/api/billing/checkout', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        capturedCheckoutPayload = JSON.parse(request.postData() || '{}');
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.stripe.com/c/pay/cs_test_mock_session_123456789'
        })
      });
    });

    // 1. Open Billing Modal
    const billingHeaderBtn = page.locator('button', { hasText: /billing & plan/i });
    await expect(billingHeaderBtn).toBeVisible({ timeout: 15000 });
    await billingHeaderBtn.click({ force: true });

    const modalDialog = page.locator('div[role="dialog"]');
    await expect(modalDialog).toBeVisible();

    // 2. Click Upgrade to Enterprise button
    const upgradeBtn = modalDialog.locator('button', { hasText: /upgrade to enterprise/i });
    await upgradeBtn.click({ force: true });

    // 3. Assert captured API payload matches Stripe expectations
    await expect.poll(() => capturedCheckoutPayload).not.toBeNull();
    expect(capturedCheckoutPayload.priceId).toBe('price_1U3KRiBK1Sz8xlZGqjW4dJfp');
    expect(capturedCheckoutPayload.customerEmail).toBe('admin@demo-tenant.com');
  });

  test('should trigger Stripe Customer Portal Session API for self-service subscription management', async ({ page }) => {
    let capturedPortalPayload: any = null;

    // Route intercept /api/billing/portal to verify customer email payload & return portal session URL
    await page.route('**/api/billing/portal', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        capturedPortalPayload = JSON.parse(request.postData() || '{}');
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://billing.stripe.com/p/session/test_mock_portal_987654321'
        })
      });
    });

    // 1. Open Billing Modal
    const billingHeaderBtn = page.locator('button', { hasText: /billing & plan/i });
    await expect(billingHeaderBtn).toBeVisible({ timeout: 15000 });
    await billingHeaderBtn.click({ force: true });

    const modalDialog = page.locator('div[role="dialog"]');
    await expect(modalDialog).toBeVisible();

    // 2. Click Manage Subscription button
    const portalBtn = modalDialog.locator('button', { hasText: /manage subscription/i });
    await portalBtn.click({ force: true });

    // 3. Assert captured API payload matches customer portal expectations
    await expect.poll(() => capturedPortalPayload).not.toBeNull();
    expect(capturedPortalPayload.customerEmail).toBe('admin@demo-tenant.com');
  });
});
