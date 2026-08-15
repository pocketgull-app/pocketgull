/**
 * Tier Enforcement Middleware — Express middleware that gates API endpoints
 * by subscription tier and enforces monthly usage quotas.
 *
 * Usage:
 *   router.post('/resolve', requireTier('practitioner', 'discovery_resolve'), handler);
 *
 * Behavior:
 *   - Unauthenticated requests on free-tier endpoints → pass through
 *   - Unauthenticated requests on gated endpoints → 403 Forbidden
 *   - Authenticated requests below minimum tier → 403 Upgrade Required
 *   - Authenticated requests exceeding quota → 429 Too Many Requests
 *   - Valid requests → pass through + record usage in background
 *
 * @module server/middleware/tier-enforcement.middleware
 */
import type { Request, Response, NextFunction } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { apiKeyService } from '../services/api-key.service';
import { usageMeterService } from '../services/usage-meter.service';
import type { SubscriptionTier, UsageCategory } from '../services/tier-config';
import { meetsMinimumTier } from '../services/tier-config';

const db = new Firestore();

/**
 * Resolves tenant ID and subscription tier from the incoming request.
 * Returns null if no API key is provided (anonymous/free-tier request).
 */
async function resolveTenantContext(req: Request): Promise<{
  tenantId: string;
  tier: SubscriptionTier;
} | null> {
  const apiKey = req.headers['x-gemini-api-key'];
  const rawKey = typeof apiKey === 'string' ? apiKey.trim() : '';

  if (!rawKey || !rawKey.startsWith('sk_live_')) {
    return null;
  }

  const tenantId = await apiKeyService.validateKey(rawKey);
  if (!tenantId) {
    return null;
  }

  // Fetch subscription tier from Firestore tenants collection
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  const tier: SubscriptionTier = (tenantDoc.exists && tenantDoc.data()?.['subscriptionTier'])
    ? tenantDoc.data()!['subscriptionTier'] as SubscriptionTier
    : 'explorer';

  // Inject tenant context into request headers for downstream use
  req.headers['x-tenant-id'] = tenantId;
  req.headers['x-subscription-tier'] = tier;

  return { tenantId, tier };
}

/**
 * Express middleware factory that enforces minimum subscription tier
 * and monthly usage quotas on API endpoints.
 *
 * @param minimumTier - Minimum subscription tier required. Use 'explorer' for free-tier-with-quota.
 * @param category - Usage category to meter against.
 * @param allowAnonymous - If true, unauthenticated requests pass as 'explorer' tier. Default false.
 */
export function requireTier(
  minimumTier: SubscriptionTier,
  category: UsageCategory,
  allowAnonymous: boolean = false
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = await resolveTenantContext(req);

      // No API key provided
      if (!tenantContext) {
        if (allowAnonymous && minimumTier === 'explorer') {
          // Anonymous access on free-tier endpoints — skip metering
          return next();
        }
        res.status(403).json({
          error: 'API key required',
          message: 'This endpoint requires authentication. Provide an sk_live_* API key via the X-Gemini-API-Key header.',
          upgrade_url: '/api/billing/checkout',
          docs_url: '/.well-known/agent.json'
        });
        return;
      }

      const { tenantId, tier } = tenantContext;

      // Check tier level
      if (!meetsMinimumTier(tier, minimumTier)) {
        res.status(403).json({
          error: 'Insufficient subscription tier',
          message: `This endpoint requires the '${minimumTier}' tier or above. Your current tier is '${tier}'.`,
          current_tier: tier,
          required_tier: minimumTier,
          upgrade_url: '/api/billing/checkout'
        });
        return;
      }

      // Check quota
      const quotaResult = await usageMeterService.checkQuota(tenantId, tier, category);

      // Set rate limit headers on all responses
      if (quotaResult.limit !== -1) {
        res.setHeader('X-RateLimit-Limit', String(quotaResult.limit));
        res.setHeader('X-RateLimit-Remaining', String(quotaResult.remaining));
        res.setHeader('X-RateLimit-Reset', quotaResult.resetsAt);
      }

      if (!quotaResult.allowed) {
        res.status(429).json({
          error: 'Monthly quota exceeded',
          message: `You have used ${quotaResult.used}/${quotaResult.limit} calls for '${category}' this month. Quota resets on ${quotaResult.resetsAt}.`,
          category,
          used: quotaResult.used,
          limit: quotaResult.limit,
          resets_at: quotaResult.resetsAt,
          upgrade_url: '/api/billing/checkout'
        });
        return;
      }

      // Record usage in background (fire and forget)
      usageMeterService.recordUsage(tenantId, category).catch((err: Error) => {
        console.error(`[UsageMeter] Failed to record usage for ${tenantId}/${category}:`, err.message);
      });

      next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[TierEnforcement] Error:', message);
      res.status(500).json({ error: 'Internal authentication error' });
    }
  };
}
