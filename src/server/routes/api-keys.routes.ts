import { Router } from 'express';
import { apiKeyService } from '../services/api-key.service';
import { rateLimit } from 'express-rate-limit';
import { usageMeterService } from '../services/usage-meter.service';
import { TIER_DEFINITIONS } from '../services/tier-config';
import type { SubscriptionTier } from '../services/tier-config';
import { Firestore } from '@google-cloud/firestore';

export function createApiKeysRouter() {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many requests for API key management.' }
  });

  router.use(limiter);

  const getTenantId = (req: any) => {
    // Mocking tenant resolution for now. In real app, decode JWT.
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-123';
    return typeof tenantId === 'string' ? tenantId : 'demo-tenant-123';
  };

  router.get('/', async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const keys = await apiKeyService.listKeys(tenantId);
      res.json(keys);
    } catch (err: any) {
      console.error('[API Keys] Error listing keys:', err.message);
      res.status(500).json({ error: 'Failed to list API keys' });
    }
  });

  router.post('/generate', async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'A name is required for the API key.' });
      }

      const result = await apiKeyService.generateKey(tenantId, name.trim());
      res.status(201).json(result);
    } catch (err: any) {
      console.error('[API Keys] Error generating key:', err.message);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  });

  router.delete('/:keyId', async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const { keyId } = req.params;
      
      const success = await apiKeyService.revokeKey(keyId, tenantId);
      if (success) {
        res.json({ success: true, message: 'API key revoked successfully.' });
      } else {
        res.status(404).json({ error: 'Key not found or already revoked.' });
      }
    } catch (err: any) {
      console.error('[API Keys] Error revoking key:', err.message);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  // ── Usage Dashboard ──────────────────────────────────────────────────
  const usageDb = new Firestore();

  /** GET /api/keys/usage — Current month usage + quota for authenticated tenant */
  router.get('/usage', async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const usage = await usageMeterService.getUsage(tenantId);

      // Fetch tenant tier from Firestore
      const tenantDoc = await usageDb.collection('tenants').doc(tenantId).get();
      const tier: SubscriptionTier = (tenantDoc.exists && tenantDoc.data()?.['subscriptionTier'])
        ? tenantDoc.data()!['subscriptionTier'] as SubscriptionTier
        : 'explorer';

      const tierDef = TIER_DEFINITIONS[tier];

      res.json({
        tenantId,
        tier: tierDef.name,
        tierLabel: tierDef.label,
        priceMonthlyUsd: tierDef.priceMonthlyUsd,
        currentMonth: new Date().toISOString().slice(0, 7),
        usage,
        quotas: tierDef.quotas,
        remaining: {
          discovery_read: tierDef.quotas.discovery_read === -1 ? 'unlimited' : Math.max(0, tierDef.quotas.discovery_read - usage.discovery_read),
          discovery_resolve: tierDef.quotas.discovery_resolve === -1 ? 'unlimited' : Math.max(0, tierDef.quotas.discovery_resolve - usage.discovery_resolve),
          discovery_probe: tierDef.quotas.discovery_probe === -1 ? 'unlimited' : Math.max(0, tierDef.quotas.discovery_probe - usage.discovery_probe),
          tool_execution: tierDef.quotas.tool_execution === -1 ? 'unlimited' : Math.max(0, tierDef.quotas.tool_execution - usage.tool_execution),
          pipeline_graph: tierDef.quotas.pipeline_graph === -1 ? 'unlimited' : Math.max(0, tierDef.quotas.pipeline_graph - usage.pipeline_graph)
        },
        upgradeUrl: tier !== 'institution' ? '/api/billing/checkout' : null
      });
    } catch (err: any) {
      console.error('[API Keys] Error fetching usage:', err.message);
      res.status(500).json({ error: 'Failed to fetch usage data' });
    }
  });

  /** GET /api/keys/usage/history — Last 6 months usage trend */
  router.get('/usage/history', async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const months = Math.min(parseInt(String(req.query['months'] || '6'), 10), 12);
      const history = await usageMeterService.getUsageHistory(tenantId, months);
      res.json({ tenantId, history });
    } catch (err: any) {
      console.error('[API Keys] Error fetching usage history:', err.message);
      res.status(500).json({ error: 'Failed to fetch usage history' });
    }
  });

  return router;
}
