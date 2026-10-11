/**
 * Global Purchasing Power Parity (PPP) Pricing Service
 *
 * Implements equitable global healthcare software pricing based on
 * World Bank GDP per capita (PPP) and health expenditure indices.
 * Allows clinicians and researchers worldwide to access PocketGull
 * at locally competitive and fair market prices.
 */

export interface IPppTierInfo {
  tier: number;
  name: string;
  multiplier: number; // e.g. 0.25 = 75% discount
  discountPercent: number;
  countryCode: string;
  countryName: string;
}

// World Bank PPP classification mappings (ISO 3166-1 alpha-2)
const TIER_4_COUNTRIES: Record<string, string> = {
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  NG: 'Nigeria',
  KE: 'Kenya',
  GH: 'Ghana',
  NP: 'Nepal',
  UG: 'Uganda',
  TZ: 'Tanzania',
  ET: 'Ethiopia',
  RW: 'Rwanda',
  LK: 'Sri Lanka',
  ZW: 'Zimbabwe',
  MM: 'Myanmar',
  KH: 'Cambodia',
};

const TIER_3_COUNTRIES: Record<string, string> = {
  BR: 'Brazil',
  CO: 'Colombia',
  TR: 'Türkiye',
  TH: 'Thailand',
  VN: 'Vietnam',
  ID: 'Indonesia',
  PH: 'Philippines',
  EG: 'Egypt',
  AR: 'Argentina',
  PE: 'Peru',
  EC: 'Ecuador',
  MA: 'Morocco',
  UA: 'Ukraine',
  DZ: 'Algeria',
};

const TIER_2_COUNTRIES: Record<string, string> = {
  MX: 'Mexico',
  CL: 'Chile',
  ZA: 'South Africa',
  MY: 'Malaysia',
  CR: 'Costa Rica',
  PL: 'Poland',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  GR: 'Greece',
  PT: 'Portugal',
  UY: 'Uruguay',
  PA: 'Panama',
};

const TIER_1_COUNTRIES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  NZ: 'New Zealand',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  CH: 'Switzerland',
  JP: 'Japan',
  SG: 'Singapore',
  IE: 'Ireland',
  AT: 'Austria',
  BE: 'Belgium',
  FI: 'Finland',
  IT: 'Italy',
  ES: 'Spain',
  KR: 'South Korea',
};

export class PppPricingService {
  /**
   * Resolves the PPP pricing tier and multiplier for a given country code.
   * Defaults to Tier 1 (1.0x, standard pricing) if country is unknown or high-income.
   */
  public resolvePppInfo(countryCodeRaw?: string | null): IPppTierInfo {
    const code = (countryCodeRaw || 'US').trim().toUpperCase();

    if (TIER_4_COUNTRIES[code]) {
      return {
        tier: 4,
        name: 'Global Health Equity Tier (High Impact)',
        multiplier: 0.25, // 75% off
        discountPercent: 75,
        countryCode: code,
        countryName: TIER_4_COUNTRIES[code]!,
      };
    }

    if (TIER_3_COUNTRIES[code]) {
      return {
        tier: 3,
        name: 'Emerging Healthcare Market Tier',
        multiplier: 0.40, // 60% off
        discountPercent: 60,
        countryCode: code,
        countryName: TIER_3_COUNTRIES[code]!,
      };
    }

    if (TIER_2_COUNTRIES[code]) {
      return {
        tier: 2,
        name: 'Moderate Purchasing Power Tier',
        multiplier: 0.65, // 35% off
        discountPercent: 35,
        countryCode: code,
        countryName: TIER_2_COUNTRIES[code]!,
      };
    }

    const countryName = TIER_1_COUNTRIES[code] || 'Global Standard (Tier 1)';
    return {
      tier: 1,
      name: 'Standard Market Tier',
      multiplier: 1.0,
      discountPercent: 0,
      countryCode: code,
      countryName,
    };
  }

  /**
   * Calculates the adjusted unit amount in cents for a product under PPP.
   * Ensures minimum floor pricing ($5.00) to cover baseline interchange and processing fees.
   */
  public calculateAdjustedAmountCents(baseAmountCents: number, countryCode?: string | null): {
    finalAmountCents: number;
    baseAmountCents: number;
    pppInfo: IPppTierInfo;
  } {
    const pppInfo = this.resolvePppInfo(countryCode);
    const calculated = Math.round(baseAmountCents * pppInfo.multiplier);
    // Safety floor of 500 cents ($5.00) unless base was zero/free
    const minFloor = baseAmountCents > 1000 ? 500 : baseAmountCents;
    const finalAmountCents = Math.max(calculated, minFloor);

    return {
      finalAmountCents,
      baseAmountCents,
      pppInfo,
    };
  }
}

export const pppPricingService = new PppPricingService();
