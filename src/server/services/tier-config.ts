/**
 * Tier Configuration — Static subscription tier definitions, quota limits,
 * and Stripe priceId mappings for the Pocket-Gull agentic API.
 *
 * @module server/services/tier-config
 */

// ── Subscription Tiers ──────────────────────────────────────────────────

export type SubscriptionTier = 'explorer' | 'practitioner' | 'institution';

/** Usage category identifiers for metering. */
export type UsageCategory =
  | 'discovery_read'
  | 'discovery_resolve'
  | 'discovery_probe'
  | 'tool_execution'
  | 'pipeline_graph';

/** Monthly quota limits per usage category. -1 = unlimited. */
export interface ITierQuota {
  discovery_read: number;
  discovery_resolve: number;
  discovery_probe: number;
  tool_execution: number;
  pipeline_graph: number;
}

export interface ITierDefinition {
  name: SubscriptionTier;
  label: string;
  priceMonthlyUsd: number;
  quotas: ITierQuota;
  stripePriceIds: string[];
  features: string[];
}

// ── Tier Definitions ────────────────────────────────────────────────────

export const TIER_DEFINITIONS: Record<SubscriptionTier, ITierDefinition> = {
  explorer: {
    name: 'explorer',
    label: 'Explorer (Free)',
    priceMonthlyUsd: 0,
    quotas: {
      discovery_read: -1,        // Unlimited — this is the storefront
      discovery_resolve: 50,     // 50/month free trial allowance
      discovery_probe: 25,       // 25/month free trial allowance
      tool_execution: 0,         // Gated
      pipeline_graph: 0          // Gated
    },
    stripePriceIds: [],
    features: [
      'Agent manifest & tool catalog browsing',
      'Taxonomy & artifact schema read access',
      'Limited entity resolution (50/mo)',
      'Limited capability probing (25/mo)',
      'Community support'
    ]
  },
  practitioner: {
    name: 'practitioner',
    label: 'Practitioner',
    priceMonthlyUsd: 49,
    quotas: {
      discovery_read: -1,
      discovery_resolve: 1000,
      discovery_probe: 500,
      tool_execution: 5000,
      pipeline_graph: 200
    },
    stripePriceIds: [
      process.env['STRIPE_PRICE_PRACTITIONER_LIVE'] || '',
      process.env['STRIPE_PRICE_PRACTITIONER'] || '',
      'price_1U4M4fJLexbgGCRFzIHyPrzT'  // Stripe test mode — prod_V4V4O81Wqj3g4h
    ].filter(Boolean),
    features: [
      'Full discovery endpoint access',
      '1,000 entity resolutions/mo',
      '500 capability probes/mo',
      '5,000 tool executions/mo',
      'Pipeline DAG inspection (read-only)',
      'Email support'
    ]
  },
  institution: {
    name: 'institution',
    label: 'Institution',
    priceMonthlyUsd: 299,
    quotas: {
      discovery_read: -1,
      discovery_resolve: 25000,
      discovery_probe: 10000,
      tool_execution: 100000,
      pipeline_graph: 2000
    },
    stripePriceIds: [
      process.env['STRIPE_PRICE_INSTITUTION_LIVE'] || '',
      process.env['STRIPE_PRICE_INSTITUTION'] || '',
      'price_1U4M5MJLexbgGCRFg5LrWabu'  // Stripe test mode — prod_V4V5JhSTSTyYOQ
    ].filter(Boolean),
    features: [
      'Everything in Practitioner',
      '25,000 entity resolutions/mo',
      '10,000 capability probes/mo',
      '100,000 tool executions/mo',
      'Full pipeline DAG + custom pipelines',
      'Priority support',
      'Custom taxonomy extensions',
      'FHIR dual-sync (GCP + AWS HealthLake)'
    ]
  }
};

// ── Helpers ─────────────────────────────────────────────────────────────

/** Ordered tier hierarchy for comparison. */
const TIER_ORDER: SubscriptionTier[] = ['explorer', 'practitioner', 'institution'];

/**
 * Returns true if `actual` tier meets or exceeds `required` tier.
 */
export function meetsMinimumTier(actual: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(actual) >= TIER_ORDER.indexOf(required);
}

/**
 * Resolves a Stripe priceId to the corresponding subscription tier.
 * Returns 'explorer' if not matched.
 */
export function resolveTierFromPriceId(priceId: string): SubscriptionTier {
  for (const tier of Object.values(TIER_DEFINITIONS)) {
    if (tier.stripePriceIds.includes(priceId)) {
      return tier.name;
    }
  }
  return 'explorer';
}

/**
 * Returns the quota limit for a specific category on a given tier.
 * -1 means unlimited.
 */
export function getQuotaLimit(tier: SubscriptionTier, category: UsageCategory): number {
  return TIER_DEFINITIONS[tier].quotas[category];
}
