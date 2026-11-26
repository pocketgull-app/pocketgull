// SPDX-License-Identifier: Apache-2.0
import { Router } from 'express';
import { apiKeyService } from '../services/api-key.service';
import { rateLimit } from 'express-rate-limit';
import { usageMeterService } from '../services/usage-meter.service';
import { TIER_DEFINITIONS } from '../services/tier-config';
import type { SubscriptionTier } from '../services/tier-config';
import { Firestore } from '@google-cloud/firestore';
import { requireAuth, type IAuthenticatedRequest } from '../middleware/auth-guard';

export function createApiKeysRouter() {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    validate: { trustProxy: false },
    message: { error: 'Too many requests for API key management.' }
  });

  router.use(limiter);
  // Strictly enforce verified clinician/admin authentication on all API key management routes
  router.use(requireAuth(['CLINICIAN']));

  // Derive tenantId strictly from verified cryptographic auth principal — NEVER trust raw X-Tenant-Id header
  const getVerifiedTenantId = (req: IAuthenticatedRequest): string => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Missing verified tenant identity.');
    }
    return tenantId;
  };

  router.get('/', async (req: IAuthenticatedRequest, res) => {
    try {
      const tenantId = getVerifiedTenantId(req);
      const keys = await apiKeyService.listKeys(tenantId);
      // Defense-in-depth: strip any keyHash property if present
      const sanitizedKeys = keys.map((k) => {
        const { keyHash: _omitted, ...rest } = k as Record<string, unknown>;
        return rest;
      });
      res.json(sanitizedKeys);
    } catch (err: unknown) {
      console.error('[API Keys] Error listing keys:', (err as Error)?.message);
      res.status(500).json({ error: 'Failed to list API keys' });
    }
  });

  router.post('/generate', async (req: IAuthenticatedRequest, res) => {
    try {
      const tenantId = getVerifiedTenantId(req);
      const { name } = req.body || {};

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'A name is required for the API key.' });
      }

      const result = await apiKeyService.generateKey(tenantId, name.trim().slice(0, 120));
      res.status(201).json(result);
    } catch (err: unknown) {
      console.error('[API Keys] Error generating key:', (err as Error)?.message);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  });

  router.delete('/:keyId', async (req: IAuthenticatedRequest, res) => {
    try {
      const tenantId = getVerifiedTenantId(req);
      const keyId = String(req.params['keyId'] || '');

      const success = await apiKeyService.revokeKey(keyId, tenantId);
      if (success) {
        res.json({ success: true, message: 'API key revoked successfully.' });
      } else {
        res.status(404).json({ error: 'Key not found or already revoked.' });
      }
    } catch (err: unknown) {
      console.error('[API Keys] Error revoking key:', (err as Error)?.message);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  // ── Usage Dashboard ──────────────────────────────────────────────────
  let _usageDb: Firestore | null = null;
  function getUsageDb(): Firestore {
    if (!_usageDb) {
      _usageDb = new Firestore();
    }
    return _usageDb;
  }

  /** GET /api/keys/usage — Current month usage + quota for authenticated tenant */
  router.get('/usage', async (req: IAuthenticatedRequest, res) => {
    try {
      const tenantId = getVerifiedTenantId(req);
      const usage = await usageMeterService.getUsage(tenantId);

      // Fetch tenant tier from Firestore
      let tier: SubscriptionTier = 'explorer';
      try {
        const tenantDoc = await getUsageDb().collection('tenants').doc(tenantId).get();
        if (tenantDoc.exists && tenantDoc.data()?.['subscriptionTier']) {
          tier = tenantDoc.data()!['subscriptionTier'] as SubscriptionTier;
        }
      } catch (err: unknown) {
        console.warn('[API Keys] Failed to fetch tenant from Firestore:', (err as Error)?.message);
      }

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
    } catch (err: unknown) {
      console.error('[API Keys] Error fetching usage:', (err as Error)?.message);
      res.status(500).json({ error: 'Failed to fetch usage data' });
    }
  });

  /** GET /api/keys/usage/history — Last 6 months usage trend */
  router.get('/usage/history', async (req: IAuthenticatedRequest, res) => {
    try {
      const tenantId = getVerifiedTenantId(req);
      const months = Math.min(Math.max(1, parseInt(String(req.query['months'] || '6'), 10) || 6), 12);
      const history = await usageMeterService.getUsageHistory(tenantId, months);
      res.json({ tenantId, history });
    } catch (err: unknown) {
      console.error('[API Keys] Error fetching usage history:', (err as Error)?.message);
      res.status(500).json({ error: 'Failed to fetch usage history' });
    }
  });

  return router;
}
