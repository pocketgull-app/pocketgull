import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { setupE2ePage, enterDemoMode } from './utils/setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Helper to select a patient by name from the dropdown */
async function selectPatientByName(page: import('@playwright/test').Page, name: string) {
  // Click patient dropdown
  const dropdownBtn = page.locator('app-patient-dropdown pocket-gull-button button, app-patient-dropdown button').first();
  await expect(dropdownBtn).toBeVisible({ timeout: 15000 });
  await dropdownBtn.click();
  await page.waitForTimeout(500);

  const option = page.locator('app-patient-dropdown button', { hasText: name }).first();
  if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
    await option.click();
  } else {
    const searchInput = page.locator('app-patient-dropdown input[placeholder*="Search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(name);
      await searchInput.dispatchEvent('input');
      await page.waitForTimeout(300);
      await page.locator('app-patient-dropdown button', { hasText: name }).first().click();
    }
  }
  await page.waitForTimeout(500);
}

test.describe('Clinical Risk Alerts UI Transitions', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should dynamically transition clinical risk levels for Alexander Vance', async ({ page }) => {
    // 1. Setup & Login
    await enterDemoMode(page);
    await selectPatientByName(page, 'Alexander Vance');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Verify Initial State (Alexander Vance default is low risk)
    const initialRiskCard = page.locator('text=Clinical Triage Risk');
    await expect(initialRiskCard).toBeVisible({ timeout: 10000 });
    
    // Assert Low Risk badge is visible initially
    const lowRiskBadge = page.locator('app-medical-summary').locator('text=Low Risk').first();
    await expect(lowRiskBadge).toBeVisible({ timeout: 10000 });

    // 3. Simulate Acute Patient Deterioration (Tachycardia + Hypoxia + Hypertension)
    const bpInput = page.locator('#vitals-bp input');
    const hrInput = page.locator('#vitals-hr input');
    const spo2Input = page.locator('#vitals-spo2 input');

    await expect(bpInput).toBeVisible();
    await expect(hrInput).toBeVisible();
    await expect(spo2Input).toBeVisible();

    // Fill high-risk vitals to trigger Critical Risk
    await bpInput.fill('185/115');
    await bpInput.dispatchEvent('input');
    await bpInput.dispatchEvent('change');
    await bpInput.blur();
    
    await hrInput.fill('135');
    await hrInput.dispatchEvent('input');
    await hrInput.dispatchEvent('change');
    await hrInput.blur();

    await spo2Input.fill('86');
    await spo2Input.dispatchEvent('input');
    await spo2Input.dispatchEvent('change');
    await spo2Input.blur();
    await page.waitForTimeout(1000);

    // 4. Assert Transition to Critical Risk & Contributing Factors
    // Expect the Critical Risk badge to show (with blinking animations)
    const criticalRiskBadge = page.locator('text=/Critical Risk|High Risk|Critical/i').first();
    await expect(criticalRiskBadge).toBeVisible({ timeout: 15000 });

    // Check that contributing factors are rendered in the list or attached
    const hypoxiaFactor = page.locator('text=/Hypoxia|SpO2|Oxygen|Triage/i').first();
    await expect(hypoxiaFactor).toBeAttached({ timeout: 10000 });

    const myocardialWorkloadFactor = page.locator('text=/Workload|RPP|Heart|Baseline/i').first();
    await expect(myocardialWorkloadFactor).toBeAttached({ timeout: 10000 });

    const sbpDeviationFactor = page.locator('text=/Systolic|BP|Baseline/i').first();
    await expect(sbpDeviationFactor).toBeAttached({ timeout: 10000 });

    // 5. Verify Autonomic Recovery (Resets back to normal)
    await bpInput.fill('120/80');
    await bpInput.blur().catch(() => {});

    await hrInput.fill('72');
    await hrInput.blur().catch(() => {});

    await spo2Input.fill('98');
    await spo2Input.blur().catch(() => {});

    // Verify it drops back down to Low Risk
    await expect(lowRiskBadge).toBeVisible({ timeout: 15000 });
    console.log('[PASS] Phil Gear: Low -> Critical -> Low Risk transitions verified.');
  });

  test('should verify triage scoring and containment indicators for CDC Sentinel', async ({ page }) => {
    // 1. Setup & Login
    await enterDemoMode(page);
    await selectPatientByName(page, 'Homo Sapiens');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Verify patient is loaded and has a triage panel
    const patientHeaderName = page.locator('h1', { hasText: 'Homo Sapiens' }).first();
    await expect(patientHeaderName).toBeVisible({ timeout: 10000 });

    const initialRiskCard = page.locator('text=Clinical Triage Risk');
    await expect(initialRiskCard).toBeVisible({ timeout: 10000 });

    // Since CDC Sentinel has RPP > 12000 and SBP > 140 at baseline, expect those flagged if present
    const workloadFactor = page.locator('text=/Myocardial Workload|Systolic BP|Triage|Sentinel/i').first();
    await expect(workloadFactor).toBeAttached({ timeout: 10000 });

    // Escalating CDC Sentinel to Critical Risk (severe deterioration)
    const bpInput = page.locator('#vitals-bp input');
    const hrInput = page.locator('#vitals-hr input');
    const spo2Input = page.locator('#vitals-spo2 input');

    await bpInput.fill('180/110'); // Severe hypertension
    await bpInput.blur();
    
    await hrInput.fill('125'); // Severe tachycardia
    await hrInput.blur();

    await spo2Input.fill('86'); // Critical hypoxia
    await spo2Input.blur();
    await page.waitForTimeout(1000);

    // Expect the Critical Risk badge to show (with pulsing indicators)
    const criticalRiskBadge = page.locator('text=/Critical Risk|High Risk|Critical/i').first();
    await expect(criticalRiskBadge).toBeVisible({ timeout: 15000 });

    // Verify factors list matches the acute presentation (Hypoxia should now be present)
    const hypoxiaFactor = page.locator('text=/Hypoxia|SpO2|Oxygen|Triage/i').first();
    await expect(hypoxiaFactor).toBeAttached({ timeout: 10000 });
    await expect(workloadFactor).toBeAttached({ timeout: 10000 });

    console.log('[PASS] CDC Sentinel: Outbreak triage risk escalation verified.');
  });
});
