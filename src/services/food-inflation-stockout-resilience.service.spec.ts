import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FoodInflationStockoutResilienceService } from './food-inflation-stockout-resilience.service';

describe('FoodInflationStockoutResilienceService', () => {
  let service: FoodInflationStockoutResilienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FoodInflationStockoutResilienceService]
    });
    service = TestBed.inject(FoodInflationStockoutResilienceService);
  });

  it('should initialize successfully', () => {
    expect(service).toBeDefined();
  });

  it('should compute significant monthly savings (>70%) for whole basket substitutions', () => {
    const audit = service.auditBasketForInflation();
    expect(audit.basketTotalOriginalUsd).toBeGreaterThan(audit.basketTotalFrugalUsd);
    expect(audit.totalMonthlyProjectedSavingsUsd).toBeGreaterThan(200);
    expect(audit.averageSavingsPct).toBeGreaterThanOrEqual(70);
    expect(audit.substitutions.length).toBe(7);
  });

  it('should find clean stockout contingency for fresh berries', () => {
    const contingency = service.findContingencyForStockout('berries');
    expect(contingency).toBeDefined();
    expect(contingency?.recommendedFrugalAlternative).toContain('Frozen');
    expect(contingency?.stockoutResilienceStrategy).toBe('Frozen Whole-Food');
    expect(contingency?.shelfLifeAndPantryResilience).toContain('12 months');
  });

  it('should filter substitutions strictly by dietary restriction (e.g. VEGAN_PLANT_BASED excludes sardines)', () => {
    const veganAudit = service.auditBasketForInflation(undefined, 'VEGAN_PLANT_BASED');
    expect(veganAudit.activeDietaryRestriction).toBe('VEGAN_PLANT_BASED');
    expect(veganAudit.substitutions.every(s => s.suitableDiets.includes('VEGAN_PLANT_BASED'))).toBe(true);
    expect(veganAudit.substitutions.some(s => s.recommendedFrugalAlternative.includes('Sardines'))).toBe(false);
    expect(veganAudit.clinicalFrugalityVerdict).toContain('VEGAN PLANT BASED');
  });

  it('should ensure all items in GLUTEN_FREE filter declare Gluten-Free status', () => {
    const gfAudit = service.auditBasketForInflation(undefined, 'GLUTEN_FREE');
    expect(gfAudit.substitutions.every(s => s.allergenFreeFrom.includes('Gluten'))).toBe(true);
  });

  it('should ensure NUT_FREE filter items declare Peanut & Tree Nut freedom', () => {
    const nutFreeAudit = service.auditBasketForInflation(undefined, 'NUT_FREE');
    expect(nutFreeAudit.substitutions.every(s => 
      s.allergenFreeFrom.includes('Peanuts') && s.allergenFreeFrom.includes('Tree Nuts')
    )).toBe(true);
  });
});
