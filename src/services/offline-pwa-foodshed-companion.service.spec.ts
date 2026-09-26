import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OfflinePwaFoodshedCompanionService } from './offline-pwa-foodshed-companion.service';

describe('OfflinePwaFoodshedCompanionService', () => {
  let service: OfflinePwaFoodshedCompanionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfflinePwaFoodshedCompanionService]
    });
    service = TestBed.inject(OfflinePwaFoodshedCompanionService);
  });

  it('should initialize successfully', () => {
    expect(service).toBeDefined();
  });

  it('should return offline cached stores for a target city without network egress', () => {
    const stores = service.getCachedStores('dest_ojai');
    expect(stores.length).toBeGreaterThan(0);
    expect(stores[0].name).toContain('Rainbow Bridge');
    expect(stores[0].acceptsSnapWic).toBe(true);
    expect(stores[0].seasonalHighlights).toContain('Pixie Tangerines');
  });

  it('should scan and flag emulsifiers and artificial sweeteners', () => {
    const rawLabel = 'Ingredients: Water, Almonds, Polysorbate 80, Sucralose, Red 40, Natural Flavors';
    const result = service.scanIngredientText(rawLabel);

    expect(result.isSafeForPatient).toBe(false);
    expect(result.flaggedHarmfulAdditives.length).toBe(3);
    expect(result.flaggedHarmfulAdditives.some(a => a.name === 'Polysorbate 80')).toBe(true);
    expect(result.ismpSafetyDirectives.length).toBeGreaterThan(0);
    expect(result.offlineIntegrityHash).toContain('offline-hash:');
  });

  it('should identify clean beneficial phytonutrients in whole food scans', () => {
    const cleanLabel = 'Ingredients: Organic Wild Blueberries, Extra Virgin Olive Oil, Chicory Root Inulin';
    const result = service.scanIngredientText(cleanLabel);

    expect(result.flaggedHarmfulAdditives.length).toBe(0);
    expect(result.beneficialPhytonutrients.length).toBe(3);
    expect(result.beneficialPhytonutrients.some(p => p.includes('Anthocyanins'))).toBe(true);
    expect(result.beneficialPhytonutrients.some(p => p.includes('Oleocanthal'))).toBe(true);
  });
});
