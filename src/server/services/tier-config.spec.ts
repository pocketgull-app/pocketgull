import {
  TIER_DEFINITIONS,
  meetsMinimumTier,
  resolveTierFromPriceId,
  getQuotaLimit,
  type SubscriptionTier,
  type UsageCategory
} from './tier-config';

describe('TierConfig Service', () => {
  describe('TIER_DEFINITIONS', () => {
    it('should define all subscription tiers with correct monthly prices', () => {
      expect(TIER_DEFINITIONS.explorer.priceMonthlyUsd).toBe(0);
      expect(TIER_DEFINITIONS.academic.priceMonthlyUsd).toBe(19);
      expect(TIER_DEFINITIONS.practitioner.priceMonthlyUsd).toBe(49);
      expect(TIER_DEFINITIONS.institution.priceMonthlyUsd).toBe(299);
    });

    it('should configure appropriate quotas across tiers', () => {
      // Explorer free tier
      expect(TIER_DEFINITIONS.explorer.quotas.discovery_read).toBe(-1);
      expect(TIER_DEFINITIONS.explorer.quotas.discovery_resolve).toBe(50);
      expect(TIER_DEFINITIONS.explorer.quotas.discovery_probe).toBe(25);
      expect(TIER_DEFINITIONS.explorer.quotas.tool_execution).toBe(0);
      expect(TIER_DEFINITIONS.explorer.quotas.pipeline_graph).toBe(0);

      // Academic / Resident tier
      expect(TIER_DEFINITIONS.academic.quotas.discovery_resolve).toBe(500);
      expect(TIER_DEFINITIONS.academic.quotas.tool_execution).toBe(2500);

      // Practitioner
      expect(TIER_DEFINITIONS.practitioner.quotas.discovery_resolve).toBe(1000);
      expect(TIER_DEFINITIONS.practitioner.quotas.tool_execution).toBe(5000);

      // Institution
      expect(TIER_DEFINITIONS.institution.quotas.discovery_resolve).toBe(25000);
      expect(TIER_DEFINITIONS.institution.quotas.tool_execution).toBe(100000);
    });
  });

  describe('meetsMinimumTier', () => {
    it('should correctly evaluate tier requirements', () => {
      expect(meetsMinimumTier('explorer', 'explorer')).toBe(true);
      expect(meetsMinimumTier('explorer', 'academic')).toBe(false);
      expect(meetsMinimumTier('explorer', 'practitioner')).toBe(false);
      expect(meetsMinimumTier('explorer', 'institution')).toBe(false);

      expect(meetsMinimumTier('academic', 'explorer')).toBe(true);
      expect(meetsMinimumTier('academic', 'academic')).toBe(true);
      expect(meetsMinimumTier('academic', 'practitioner')).toBe(false);

      expect(meetsMinimumTier('practitioner', 'explorer')).toBe(true);
      expect(meetsMinimumTier('practitioner', 'academic')).toBe(true);
      expect(meetsMinimumTier('practitioner', 'practitioner')).toBe(true);
      expect(meetsMinimumTier('practitioner', 'institution')).toBe(false);

      expect(meetsMinimumTier('institution', 'explorer')).toBe(true);
      expect(meetsMinimumTier('institution', 'academic')).toBe(true);
      expect(meetsMinimumTier('institution', 'practitioner')).toBe(true);
      expect(meetsMinimumTier('institution', 'institution')).toBe(true);
    });
  });

  describe('resolveTierFromPriceId', () => {
    it('should resolve academic stripe price IDs', () => {
      const academicPriceId = TIER_DEFINITIONS.academic.stripePriceIds[0];
      expect(resolveTierFromPriceId(academicPriceId)).toBe('academic');
    });

    it('should resolve practitioner stripe price IDs', () => {
      const practitionerPriceId = TIER_DEFINITIONS.practitioner.stripePriceIds[0];
      expect(resolveTierFromPriceId(practitionerPriceId)).toBe('practitioner');
    });

    it('should resolve institution stripe price IDs', () => {
      const institutionPriceId = TIER_DEFINITIONS.institution.stripePriceIds[0];
      expect(resolveTierFromPriceId(institutionPriceId)).toBe('institution');
    });

    it('should default to explorer for unknown price IDs', () => {
      expect(resolveTierFromPriceId('price_unknown_12345')).toBe('explorer');
      expect(resolveTierFromPriceId('')).toBe('explorer');
    });
  });

  describe('getQuotaLimit', () => {
    it('should return the correct quota limit per tier and category', () => {
      expect(getQuotaLimit('explorer', 'discovery_read')).toBe(-1);
      expect(getQuotaLimit('explorer', 'tool_execution')).toBe(0);
      expect(getQuotaLimit('practitioner', 'discovery_probe')).toBe(500);
      expect(getQuotaLimit('institution', 'pipeline_graph')).toBe(2000);
    });
  });
});
