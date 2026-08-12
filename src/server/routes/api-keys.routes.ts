import { Router } from 'express';
import { apiKeyService } from '../services/api-key.service';
import { rateLimit } from 'express-rate-limit';

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

  return router;
}
