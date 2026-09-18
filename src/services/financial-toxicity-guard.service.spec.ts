import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialToxicityGuardService } from './financial-toxicity-guard.service';

describe('FinancialToxicityGuardService (Pillar 3: Financial Toxicity & Generic Parity Shield)', () => {
  let service: FinancialToxicityGuardService;

  beforeEach(() => {
    service = new FinancialToxicityGuardService();
  });

  it('1. Flags HIGH_FINANCIAL_TOXICITY for costly items (>$50/mo)', () => {
    const audit = service.evaluateFinancialToxicity({
      name: 'Branded Advair Diskus Inhaler',
      monthlyCostUsd: 260.00,
      isBrandedOrAffiliate: true
    });

    expect(audit.toxicityBurden).toBe('HIGH_FINANCIAL_TOXICITY');
    expect(audit.hasGenericEquivalent).toBe(true);
    expect(audit.genericAlternative?.genericChemicalName).toContain('Fluticasone / Salmeterol');
    expect(audit.genericAlternative?.estimatedMonthlyCostUsd).toBe(32.00);
    expect(audit.genericAlternative?.savingsPercent).toBeGreaterThanOrEqual(80);
    expect(audit.assistanceProgramsAvailable.length).toBeGreaterThan(0);
  });

  it('2. Enforces Generic Parity matching on branded supplements (Magnesium L-Threonate)', () => {
    const audit = service.evaluateFinancialToxicity({
      name: 'Magnesium L-Threonate Cognition Complex',
      monthlyCostUsd: 48.00,
      isBrandedOrAffiliate: true
    });

    expect(audit.hasGenericEquivalent).toBe(true);
    expect(audit.genericAlternative?.genericChemicalName).toContain('Magnesium Glycinate');
    expect(audit.genericAlternative?.estimatedMonthlyCostUsd).toBe(8.50);
    expect(audit.genericAlternative?.savingsPercent).toBe(82);
    expect(audit.clinicalVsCommercialDemarcationNote).toContain('must never obscure lower-cost generic equivalents');
  });

  it('3. Categorizes MINIMAL_BURDEN for low-cost generic essentials (<$20/mo)', () => {
    const audit = service.evaluateFinancialToxicity({
      name: 'Generic Vitamin D3 2000 IU',
      monthlyCostUsd: 6.00,
      isBrandedOrAffiliate: false
    });

    expect(audit.toxicityBurden).toBe('MINIMAL_BURDEN');
    expect(audit.assistanceProgramsAvailable.length).toBe(0);
  });
});
