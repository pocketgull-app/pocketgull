import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';

test.describe('Frontier Molecular Biophysics & Chemical Systems Suite E2E', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.localStorage.setItem('pocketgull_pin_unlocked', 'true');
      window.localStorage.setItem('pg_splash_dismissed', 'true');
    });
    await setupE2ePage(page);
  });

  test('should open Molecular Biophysics suite via [⚛️ BIOPHYSICS] toolbar button and exercise all 4 solvers', async ({ page }) => {
    // 1. Enter demo mode
    await enterDemoMode(page);

    // 2. Locate and click the [⚛️ BIOPHYSICS] button in AnalysisContainerComponent
    const biophysicsBtn = page.locator('button', { hasText: /\[⚛️ BIOPHYSICS\]/i }).first();
    await expect(biophysicsBtn).toBeVisible({ timeout: 25000 });
    await biophysicsBtn.click();

    // 3. Verify the Molecular Biophysics Suite component is rendered
    const suiteHeader = page.locator('h2', { hasText: /Frontier Molecular Biophysics & Chemical Systems Suite/i });
    await expect(suiteHeader).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // TAB 1: LLPS Phase Separation & Cahn-Hilliard PDE
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 1: LLPS Phase Separation...');
    const llpsCanvas = page.locator('app-lens-biomolecular-physics canvas');
    await expect(llpsCanvas).toBeVisible();

    const cahnHilliardHud = page.locator('app-lens-biomolecular-physics').getByText(/Cahn-Hilliard Phase Field/i);
    await expect(cahnHilliardHud).toBeVisible();

    // Test perturbation buttons
    const pulseStressBtn = page.locator('button', { hasText: /Pulse Stress Granule/i }).first();
    await expect(pulseStressBtn).toBeVisible();
    await pulseStressBtn.click();
    await page.waitForTimeout(300);

    const tauHyperBtn = page.locator('button', { hasText: /Inject Tau Hyperphosphorylation/i }).first();
    await expect(tauHyperBtn).toBeVisible();
    await tauHyperBtn.click();
    await page.waitForTimeout(300);

    const resetLatticeBtn = page.locator('button', { hasText: /Reset Lattice/i }).first();
    await expect(resetLatticeBtn).toBeVisible();
    await resetLatticeBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TAB 2: PROTAC Degrader Kinetics & Hook Effect
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 2: PROTAC Degrader Kinetics...');
    const protacTabBtn = page.locator('button', { hasText: /PROTAC Degrader/i }).first();
    await expect(protacTabBtn).toBeVisible();
    await protacTabBtn.click();

    const ternaryCurve = page.locator('app-lens-biomolecular-physics text', { hasText: /100% Ternary/i });
    await expect(ternaryCurve).toBeVisible();

    const activeTernaryLegend = page.locator('app-lens-biomolecular-physics').getByText(/Active Ternary \[E3:PROTAC:POI\]/i);
    await expect(activeTernaryLegend).toBeVisible();

    const optimalDoseBadge = page.locator('app-lens-biomolecular-physics').getByText(/Optimal Dose \(C_opt\):/i);
    await expect(optimalDoseBadge).toBeVisible();

    // -------------------------------------------------------------
    // TAB 3: Quantum Cryptochrome Radical Pairs
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 3: Quantum Cryptochrome Radical Pairs...');
    const quantumTabBtn = page.locator('button', { hasText: /Quantum Cryptochrome/i }).first();
    await expect(quantumTabBtn).toBeVisible();
    await quantumTabBtn.click();

    const singletStateText = page.locator('app-lens-biomolecular-physics text', { hasText: /\|S⟩ Singlet/i });
    await expect(singletStateText).toBeVisible();

    const singletYieldHud = page.locator('app-lens-biomolecular-physics').getByText(/Singlet Yield \(Φ_S\):/i);
    await expect(singletYieldHud).toBeVisible();

    // Pulse RF noise
    const injectRfBtn = page.locator('button', { hasText: /Inject 1.4 MHz Larmor RF/i }).first();
    await expect(injectRfBtn).toBeVisible();
    await injectRfBtn.click();
    await page.waitForTimeout(300);

    // Restore quantum coherence
    const restoreCoherenceBtn = page.locator('button', { hasText: /Restore Quantum Coherence/i }).first();
    await expect(restoreCoherenceBtn).toBeVisible();
    await restoreCoherenceBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TAB 4: Reticular Metal-Organic Frameworks (MOF)
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 4: Reticular Metal-Organic Frameworks...');
    const mofTabBtn = page.locator('button', { hasText: /Reticular MOF/i }).first();
    await expect(mofTabBtn).toBeVisible();
    await mofTabBtn.click();

    const mofIsothermText = page.locator('app-lens-biomolecular-physics text', { hasText: /0.55 g\/g \(Q_sat\)/i });
    await expect(mofIsothermText).toBeVisible();

    const dailyYieldHud = page.locator('app-lens-biomolecular-physics').getByText(/Daily Yield:/i);
    await expect(dailyYieldHud).toBeVisible();

    // -------------------------------------------------------------
    // TAB 5: Cannabinoid Cytoskeletal Microtubule Dynamics
    // -------------------------------------------------------------
    console.log('[E2E] Testing Tab 5: Cannabinoid Cytoskeletal Microtubules...');
    const cannaTabBtn = page.locator('button', { hasText: /Cytoskeletal Tubulin/i }).first();
    await expect(cannaTabBtn).toBeVisible();
    await cannaTabBtn.click();

    const microtubuleHeader = page.locator('app-lens-biomolecular-physics').getByText(/13-Protofilament Microtubule Lattice/i);
    await expect(microtubuleHeader).toBeVisible();

    const vesicleCargoText = page.locator('app-lens-biomolecular-physics text', { hasText: /Vesicle Cargo/i });
    await expect(vesicleCargoText).toBeVisible();

    const lys40Badge = page.locator('app-lens-biomolecular-physics').getByText(/Lys40 Acetylation/i).first();
    await expect(lys40Badge).toBeVisible();

    // Test compound selection
    const cbdBtn = page.locator('app-lens-biomolecular-physics button', { hasText: /CBD/i }).first();
    await expect(cbdBtn).toBeVisible();
    await cbdBtn.click();
    await page.waitForTimeout(300);

    const bcpBtn = page.locator('app-lens-biomolecular-physics button', { hasText: /β-Caryophyllene/i }).first();
    await expect(bcpBtn).toBeVisible();
    await bcpBtn.click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Biophysical Snapshot Export
    // -------------------------------------------------------------
    const exportBtn = page.locator('button', { hasText: /Export Molecular Biophysics Snapshot/i }).first();
    await expect(exportBtn).toBeVisible();

    // Close biophysics modal by clicking the toolbar button again
    await biophysicsBtn.click();
    await page.waitForTimeout(500);
    await expect(suiteHeader).not.toBeVisible();
  });
});
