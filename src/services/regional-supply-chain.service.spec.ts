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

  it('7. Maps North Africa & Maghreb to Officines PPV and Souk Municipal Barley & Olive Oil', () => {
    service.setRegion('AFRICA_NORTH_MAGHREB');
    const profile = service.activeRegion();
    expect(profile.regionName).toContain('North Africa & Maghreb');
    expect(profile.localCurrencyCode).toContain('MAD');

    const officine = profile.primaryPharmacies.find(p => p.id === 'pharm_maghreb_officine');
    expect(officine).toBeDefined();
    expect(officine?.typicalSavingsVsBrandPct).toBeGreaterThanOrEqual(75);

    const souk = profile.primaryFoodsheds.find(f => f.id === 'food_souk_maghreb');
    expect(souk?.indigenousStaples).toContain('Barley couscous (Dchicha)');
    expect(souk?.indigenousStaples).toContain('Cold-pressed extra virgin olive oil (Zit Zitoun)');
  });

  it('8. Maps Southeast Asia & Philippines to The Generics Pharmacy and Palengke Ampalaya', () => {
    service.setRegion('SOUTHEAST_ASIA_PHILIPPINES');
    const profile = service.activeRegion();
    expect(profile.regionName).toContain('Philippines');

    const tgp = profile.primaryPharmacies.find(p => p.id === 'pharm_generics_pharmacy');
    expect(tgp?.coverageDescription).toContain('barangay');

    const palengke = profile.primaryFoodsheds.find(f => f.id === 'food_palengke_southeast');
    expect(palengke?.indigenousStaples).toContain('Malunggay (Moringa oleifera)');
    expect(palengke?.indigenousStaples).toContain('Ampalaya (Bitter melon / Momordica charantia)');
  });

  it('9. Maps Caribbean Basin to National Health Fund (NHF) and Coronation Market Callaloo', () => {
    service.setRegion('CARIBBEAN_ISLANDS');
    const profile = service.activeRegion();
    expect(profile.regionName).toContain('Caribbean Basin');

    const nhf = profile.primaryPharmacies.find(p => p.id === 'pharm_caribbean_nhf');
    expect(nhf?.keyCapabilities).toContain('NHF card subsidies covering 17 chronic diseases');

    const coronation = profile.primaryFoodsheds.find(f => f.id === 'food_caribbean_markets');
    expect(coronation?.indigenousStaples).toContain('Callaloo (Amaranthus viridis)');
    expect(coronation?.indigenousStaples).toContain('Breadfruit (Artocarpus altilis)');

    // Phone resolution check
    expect(service.resolveRegionFromPhoneOrCountry('+212 612 345678')).toBe('AFRICA_NORTH_MAGHREB');
    expect(service.resolveRegionFromPhoneOrCountry('+63 917 123 4567')).toBe('SOUTHEAST_ASIA_PHILIPPINES');
    expect(service.resolveRegionFromPhoneOrCountry('+1876 922 1234')).toBe('CARIBBEAN_ISLANDS');
  });
});

