// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest';
import express from 'express';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { createDiscoveryRouter } from './discovery.routes';

describe('Discovery Router Body-Parser Isolation', () => {
  let server: http.Server | null = null;

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = null;
    }
  });

  it('does not attach a router-wide jsonParser that intercepts non-discovery routes', () => {
    const router = createDiscoveryRouter();
    const globalJsonLayers = router.stack.filter(
      (layer: { route?: unknown; name?: string }) => !layer.route && layer.name === 'jsonParser'
    );
    expect(globalJsonLayers.length).toBe(0);
  });

  it('allows a 500 KB POST /api/patients payload when discoveryRouter is mounted at / ahead of /api', async () => {
    const app = express();
    app.use(createDiscoveryRouter());
    app.use('/api', express.json({ limit: '10mb' }));
    app.post('/api/patients', (req, res) => {
      const count = Array.isArray(req.body) ? req.body.length : 0;
      res.status(200).json({ ok: true, count });
    });

    server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const { port } = server.address() as AddressInfo;

    const largePayload = JSON.stringify([
      { id: 'p_large', notes: 'x'.repeat(500 * 1024) }
    ]);

    const res = await fetch(`http://127.0.0.1:${port}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largePayload
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; count: number };
    expect(json.ok).toBe(true);
    expect(json.count).toBe(1);
  });

  it('still enforces the 100 KB cap on POST /v1/discovery/resolve', async () => {
    const app = express();
    app.use(createDiscoveryRouter());
    app.use((err: { status?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err?.type === 'entity.too.large' || err?.status === 413) {
        return res.status(413).json({ error: 'Payload Too Large' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    });

    server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const { port } = server.address() as AddressInfo;

    const oversizedDiscoveryPayload = JSON.stringify({
      query: 'q'.repeat(150 * 1024)
    });

    const res = await fetch(`http://127.0.0.1:${port}/v1/discovery/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedDiscoveryPayload
    });

    expect(res.status).toBe(413);
  });
});
