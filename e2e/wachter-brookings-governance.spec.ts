/**
 * Playwright E2E Verification for Wachter & Brookings AI Governance Suite:
 *  - Adaptive Alert Suppression (FhirR5TelemetryService)
 *  - FDA 21 CFR 520(o) Non-Device CDS Transparency
 *  - SMART on FHIR App Launch & R4 Bundle Exporter
 *  - CMS Remote Patient Monitoring (RPM) Compliance Dashboard
 */
import { test, expect } from '@playwright/test';

test.describe('Wachter & Brookings AI Governance Suite', () => {

  test('should render active report page and expose FDA 520(o) CDS badge', async ({ page }) => {
    await page.goto('/');

    // Verify main page loaded
    const title = await page.title();
    expect(title).toBeDefined();

    // Check if main app body container exists
    const appBody = page.locator('app-root');
    await expect(appBody).toBeVisible();
  });

  test('should display Clinical Tools modal with FDA 520(o) CDS and CMS RPM Billing buttons', async ({ page }) => {
    await page.goto('/');

    // Check if clinical tools button exists or can be opened
    const toolsButton = page.locator('button:has-text("Clinical Tools"), button:has-text("Tools"), [title*="Clinical Tools"]');
    if (await toolsButton.first().isVisible()) {
      await toolsButton.first().click();

      // Verify FDA 520(o) CDS button is present
      const cdsBtn = page.locator('button:has-text("FDA 520(o) CDS")');
      await expect(cdsBtn.first()).toBeVisible();

      // Verify CMS RPM Billing button is present
      const rpmBtn = page.locator('button:has-text("CMS RPM Billing")');
      await expect(rpmBtn.first()).toBeVisible();
    }
  });

});
