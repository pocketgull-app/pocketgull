import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('USWDS Federal Edition & Section 508 E2E Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    test.setTimeout(90000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await setupE2ePage(page);
  });

  test('should launch USWDS Federal Workstation, verify .gov banner, cycle tabs, and test 508 controls', async ({ page }) => {
    // 1. Establish viewport and enter demo mode
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterDemoMode(page);

    // 2. Locate and trigger the Federal Edition Workstation
    const federalBtn = page.locator('#btn-federal-uswds-trigger');
    if (await federalBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await federalBtn.click();
    } else {
      // Fallback to Apps & Portals dropdown
      const appsHubBtn = page.locator('#btn-apps-hub-trigger');
      await expect(appsHubBtn).toBeVisible({ timeout: 10000 });
      await appsHubBtn.click();
      const federalMenuOption = page.locator('button', { hasText: /USWDS Federal Health Edition/i }).first();
      await expect(federalMenuOption).toBeVisible({ timeout: 5000 });
      await federalMenuOption.click();
    }

    // 3. Verify the Federal Workstation Modal is rendered
    const modal = page.locator('app-federal-uswds-portal div[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // 4. Verify Non-Governmental Community Practice Banner by Default (18 U.S.C. § 701 Safe Harbor)
    const banner = modal.locator('app-usa-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/Independent Healthcare Practice/i);

    // Switch to Official Federal Host to test .gov banner and HTTPS accordion
    const officialModeBtn = modal.locator('#btn-mode-official-gov');
    await expect(officialModeBtn).toBeVisible();
    await officialModeBtn.click();
    await expect(banner).toContainText(/official website of the United States government/i);

    const bannerToggle = banner.locator('button', { hasText: /Here's how you know/i });
    await expect(bannerToggle).toBeVisible();
    await bannerToggle.click();

    // Verify expanded explanation
    const bannerContent = page.locator('#gov-banner-content');
    await expect(bannerContent).toBeVisible({ timeout: 5000 });
    await expect(bannerContent).toContainText(/Official websites use .gov/i);
    await expect(bannerContent).toContainText(/Secure .gov websites use HTTPS/i);

    // 5. Verify Federal Header & 988 Lifeline Integration
    const header = modal.locator('app-usa-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText(/U\.S\. Federal Health Workstation/i);
    await expect(header).toContainText(/988 Lifeline/i);

    // 6. Test Tab 1: Veteran & Beneficiary CDS Care Plan & Dual Perspective
    await expect(modal).toContainText(/Veteran Subject #VA-77042/i);
    await expect(modal).toContainText(/PACT Act Toxic Exposure/i);
    await expect(modal).toContainText(/ISMP Clinical Prescribing Guard/i);
    await expect(modal).toContainText(/90-Day Vitality & Rehabilitation Trajectory/i);
    await expect(modal).toContainText(/VA Disability Rating & Medical Nexus Opinion/i);

    // Test Perspective Switch back to Private Practice / VA Community Care (CCN)
    const communityModeBtn = modal.locator('#btn-mode-community-partner');
    await expect(communityModeBtn).toBeVisible();
    await communityModeBtn.click();
    await expect(banner).toContainText(/Independent Healthcare Practice/i);
    await expect(modal).toContainText(/Beacon Hill Community Health/i);
    await expect(modal).toContainText(/Independent Healthcare Practice/i);

    // Test Copy Nexus Statement in Community Mode
    const copyNexusBtn = modal.locator('#btn-copy-nexus-statement');
    await expect(copyNexusBtn).toBeVisible();
    await copyNexusBtn.click();
    await expect(copyNexusBtn).toContainText(/Nexus Statement/i);

    // Switch back to Official Federal Host
    await officialModeBtn.click();
    await expect(modal).toContainText(/VA Boston Healthcare System/i);

    // Test Accordion Interaction
    const functionalAccordionBtn = modal.locator('button', { hasText: /Functional & Integrative/i });
    await expect(functionalAccordionBtn).toBeVisible();
    await functionalAccordionBtn.click();
    await page.waitForTimeout(200);

    // 7. Test Tab 2: Clinical Intake & Triage Steps
    const intakeTabBtn = modal.locator('button', { hasText: /Clinical Intake & Triage Steps/i });
    await expect(intakeTabBtn).toBeVisible();
    await intakeTabBtn.click();

    // Step 1: Chief complaint and character counter
    await expect(modal).toContainText(/Step 1: Clinical Chief Complaint/i);
    const textarea = modal.locator('#complaint-input');
    await expect(textarea).toBeVisible();
    await textarea.fill('Testing combat blast exposure symptom progression for Section 508 review.');
    await expect(modal).toContainText(/characters remaining/i);

    // Advance to Step 2
    const nextBtn = modal.locator('button', { hasText: /Next Step →/i });
    await nextBtn.click();
    await expect(modal).toContainText(/Step 2: Approximate Date of Symptom Onset/i);
    await expect(modal.locator('#date-month')).toBeVisible();

    // Advance to Step 3
    await nextBtn.click();
    await expect(modal).toContainText(/Step 3: Military & Environmental Exposure Screening/i);

    // Advance to Step 4
    await nextBtn.click();
    await expect(modal).toContainText(/Step 4: Affirmative Clinician Review/i);
    await expect(modal).toContainText(/FDA CDSR Non-Device Wellness Demarcation/i);

    // Test Attestation Checkbox
    const attestCheckbox = modal.locator('input[type="checkbox"]');
    await attestCheckbox.check();
    await expect(modal).toContainText(/SHA256:/i);

    // 8. Test Tab 3: FHIR US Core R4 Matrix
    const fhirTabBtn = modal.locator('button', { hasText: /FHIR US Core R4 Matrix/i });
    await fhirTabBtn.click();

    const fhirTable = modal.locator('table.usa-table');
    await expect(fhirTable).toBeVisible();
    await expect(fhirTable).toContainText(/us-core-patient/i);
    await expect(fhirTable).toContainText(/Lisinopril/i);

    // Test Raw JSON view toggle
    const rawJsonBtn = modal.locator('button', { hasText: /View Raw JSON/i });
    await rawJsonBtn.click();
    await expect(modal.locator('pre')).toBeVisible();

    // 9. Test Tab 4: Section 508 & IDEA Act Audit Scorecard
    const auditTabBtn = modal.locator('button', { hasText: /Section 508 & IDEA Act Audit/i });
    await auditTabBtn.click();

    await expect(modal).toContainText(/100% AUDIT PASS/i);
    await expect(modal).toContainText(/21st Century IDEA Act/i);
    await expect(modal).toContainText(/OMB Memorandum M-23-22/i);

    // Test Screen Reader Announcement simulator
    const testSrBtn = modal.locator('button', { hasText: /Test Screen Reader Announcement/i });
    await testSrBtn.click();
    await expect(modal.locator('[aria-live="assertive"]')).toBeVisible();
    await expect(modal.locator('[aria-live="assertive"]')).toContainText(/ScreenReader ARIA-Live/i);

    // 10. Verify Federal Footer
    const footer = modal.locator('app-usa-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Veterans Crisis Line/i);
    await expect(footer).toContainText(/Section 508 Accessibility Statement/i);

    // 11. Test Exit Federal View
    const exitBtn = modal.locator('button', { hasText: /Exit Federal View/i });
    await exitBtn.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('should format clinical care plan properly in @media print emulation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterDemoMode(page);

    const federalBtn = page.locator('#btn-federal-uswds-trigger');
    if (await federalBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await federalBtn.click();
    } else {
      const appsHubBtn = page.locator('#btn-apps-hub-trigger');
      await expect(appsHubBtn).toBeVisible({ timeout: 10000 });
      await appsHubBtn.click();
      const federalMenuOption = page.locator('button', { hasText: /USWDS Federal Health Edition/i }).first();
      await expect(federalMenuOption).toBeVisible({ timeout: 5000 });
      await federalMenuOption.click();
    }

    const modal = page.locator('app-federal-uswds-portal div[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // 1. Verify Print-Only Clinical Letterhead is visible (Community Care default)
    const letterhead = page.locator('#print-clinical-letterhead');
    await expect(letterhead).toBeVisible();
    await expect(letterhead).toContainText(/VA Community Care Network/i);
    await expect(letterhead).toContainText(/Private Practice Care Plan & Medical Nexus Statement/i);

    // 2. Verify screen-only controls are suppressed in print mode
    const printPlanBtn = modal.locator('button', { hasText: /Print Plan/i });
    await expect(printPlanBtn).not.toBeVisible();

    const exitBtn = modal.locator('button', { hasText: /Exit Federal View/i });
    await expect(exitBtn).not.toBeVisible();

    const navTabs = modal.locator('.usa-nav');
    await expect(navTabs).not.toBeVisible();

    const govBanner = modal.locator('.usa-banner');
    await expect(govBanner).not.toBeVisible();

    // 3. Verify clinical sections & 3-Act arc print properly
    await expect(modal).toContainText(/Veteran Subject #VA-77042/i);
    await expect(modal).toContainText(/90-Day Vitality & Rehabilitation Trajectory/i);
    await expect(modal).toContainText(/Conventional Allopathic Interventions/i);

    // 4. Verify all 3 accordion contents are visible in print layout
    const allopathicContent = page.locator('#accordion-allopathic-content');
    await expect(allopathicContent).toBeVisible();

    const functionalContent = page.locator('#accordion-functional-content');
    await expect(functionalContent).toBeVisible();

    const somaticContent = page.locator('#accordion-somatic-content');
    await expect(somaticContent).toBeVisible();

    // 5. Verify clinician attestation & signature block is visible
    await expect(page.locator('text=Attending Clinician Signature & Part 11 Attestation')).toBeVisible();

    // Reset media back to screen
    await page.emulateMedia({ media: 'screen' });
    await expect(printPlanBtn).toBeVisible();
  });
});
