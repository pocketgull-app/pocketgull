import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  RegionalSupplyChainService,
  REGIONAL_SUPPLY_CHAIN_DATABASE,
  GeographicRegionCode
} from './regional-supply-chain.service';

describe('RegionalSupplyChainService - Global Health Sovereignty Supply Chain', () => {
  let service: RegionalSupplyChainService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegionalSupplyChainService]
    });
    service = TestBed.inject(RegionalSupplyChainService);
  });

  it('1. Initializes with default West & Central Africa region', () => {
    expect(service).toBeDefined();
    expect(service.activeRegionCode()).toBe('AFRICA_WEST_CENTRAL');
    const profile = service.activeRegion();
    expect(profile.regionName).toContain('West & Central Africa');
    expect(profile.primaryPharmacies.some(p => p.name.includes('mPharma'))).toBe(true);
    expect(profile.primaryFoodsheds.some(f => f.name.includes('Sandaga'))).toBe(true);
  });

  it('2. Maps South Asia / Bharat to Jan Aushadhi and Shree Anna Millet Mandis', () => {
    service.setRegion('SOUTH_ASIA');
    expect(service.activeRegionCode()).toBe('SOUTH_ASIA');
    const profile = service.activeRegion();

    const janAushadhi = profile.primaryPharmacies.find(p => p.id === 'pharm_jan_aushadhi');
    expect(janAushadhi).toBeDefined();
    expect(janAushadhi?.samplePriceBenchmarksUsd.metforminMonthly).toBeLessThan(1.0); // ~$0.40/mo
    expect(janAushadhi?.typicalSavingsVsBrandPct).toBeGreaterThanOrEqual(80);

    const mandi = profile.primaryFoodsheds.find(f => f.id === 'food_mandi_rythu_bazar');
    expect(mandi?.indigenousStaples).toContain('Finger Millet (Ragi)');
    expect(mandi?.indigenousStaples).toContain('Pearl Millet (Bajra)');
  });

  it('3. Maps Latin America (Mexico & Andes) to Farmacias Similares and Tianguis', () => {
    service.setRegion('LATIN_AMERICA_MEXICO');
    const profile = service.activeRegion();
    const drSimi = profile.primaryPharmacies.find(p => p.name.includes('Similares'));
    expect(drSimi).toBeDefined();

    const tianguis = profile.primaryFoodsheds.find(f => f.name.includes('Tianguis'));
    expect(tianguis?.indigenousStaples).toContain('Fresh Nopal cactus paddles');
    expect(tianguis?.clinicalMetabolicSynergies.some(s => s.includes('Nopal'))).toBe(true);
  });

  it('4. Maps Brazil to SUS 100% Free Farmácia Popular and native foods', () => {
    service.setRegion('LATIN_AMERICA_BRAZIL');
    const profile = service.activeRegion();
    const farmaciaPopular = profile.primaryPharmacies.find(p => p.id === 'pharm_farmacia_popular_sus');
    expect(farmaciaPopular?.samplePriceBenchmarksUsd.metforminMonthly).toBe(0.00); // 100% free under SUS
    expect(farmaciaPopular?.samplePriceBenchmarksUsd.amlodipineMonthly).toBe(0.00);

    const feiras = profile.primaryFoodsheds.find(f => f.id === 'food_feiras_livres_brasil');
    expect(feiras?.indigenousStaples).toContain('Castanha-do-Pará (Brazil nuts)');
  });

  it('5. Auto-resolves geographic region from phone numbers and country indicators', () => {
    expect(service.resolveRegionFromPhoneOrCountry('+234 803 123 4567')).toBe('AFRICA_WEST_CENTRAL');
    expect(service.resolveRegionFromPhoneOrCountry('+254 712 345 678')).toBe('AFRICA_EAST');
    expect(service.resolveRegionFromPhoneOrCountry('+91 98765 43210')).toBe('SOUTH_ASIA');
    expect(service.resolveRegionFromPhoneOrCountry('+52 55 1234 5678')).toBe('LATIN_AMERICA_MEXICO');
    expect(service.resolveRegionFromPhoneOrCountry('Dakar, Senegal')).toBe('AFRICA_WEST_CENTRAL');
    expect(service.resolveRegionFromPhoneOrCountry('Bogotá, Colombia')).toBe('LATIN_AMERICA_ANDES');
  });

  it('6. Generates tailored regional care plan referrals with local currency estimates', () => {
    const referral = service.generateRegionalCarePlanReferral({ regionCode: 'AFRICA_WEST_CENTRAL' });
    expect(referral.currency).toBe('XOF / NGN');
    expect(referral.estimatedMonthlyDrugCostLocalCurrency).toContain('XOF / NGN');
    expect(referral.recommendedPharmacies.length).toBeGreaterThan(0);
    expect(referral.recommendedFoodsheds.length).toBeGreaterThan(0);
    expect(referral.sovereigntyDirectives.length).toBeGreaterThan(0);
  });
});
