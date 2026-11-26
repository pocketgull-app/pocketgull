// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Genkit OTel runtime so pure auditGenkitClinicalGrounding tests run cleanly without OTLP side effects
vi.mock('genkit', () => {
  const chain: Record<string, unknown> = {};
  const builder = new Proxy(() => chain, {
    get: () => builder,
    apply: () => builder
  });
  return {
    genkit: () => ({
      defineFlow: (_cfg: unknown, fn: unknown) => fn,
      generate: vi.fn()
    }),
    z: builder
  };
});
vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: () => ({}),
  vertexAI: () => ({})
}));

import express from 'express';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import crypto from 'node:crypto';
import { signSessionToken } from '../middleware/auth-guard';
import { createApiKeysRouter } from './api-keys.routes';
import { apiKeyService } from '../services/api-key.service';
import { slackRouter } from './slack.routes';
import { createDiscoveryRouter } from './discovery.routes';
import { createUtilityRouter } from './utility.routes';
import { sanitiseDicomParam, validateDicomUid, dicomRouter } from '../dicom';
import { auditGenkitClinicalGrounding } from '../genkit';
import { createSidecarProxy } from '../../../packages/sidecar-proxy/src/index';

async function withServer(app: express.Express, fn: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const { port } = server.address() as AddressInfo;
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('Lane A Cross-Route Security & Proxy Hardening', () => {
  const prevSecret = process.env['SESSION_SIGNING_SECRET'];
  const prevSlackSecret = process.env['SLACK_SIGNING_SECRET'];
  const prevPublicBase = process.env['PUBLIC_BASE_URL'];

  beforeEach(() => {
    process.env['SESSION_SIGNING_SECRET'] = 'lane-a-hardening-test-secret-2026!';
    process.env['SLACK_SIGNING_SECRET'] = 'slack-test-hmac-secret-2026';
    process.env['PUBLIC_BASE_URL'] = 'https://pocketgull.app';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevSecret === undefined) delete process.env['SESSION_SIGNING_SECRET'];
    else process.env['SESSION_SIGNING_SECRET'] = prevSecret;
    if (prevSlackSecret === undefined) delete process.env['SLACK_SIGNING_SECRET'];
    else process.env['SLACK_SIGNING_SECRET'] = prevSlackSecret;
    if (prevPublicBase === undefined) delete process.env['PUBLIC_BASE_URL'];
    else process.env['PUBLIC_BASE_URL'] = prevPublicBase;
  });

  it('api-keys.routes derives tenantId strictly from verified auth token and strips keyHash', async () => {
    const listSpy = vi.spyOn(apiKeyService, 'listKeys').mockResolvedValue([
      {
        id: 'key-1',
        tenantId: 'verified-tenant-42',
        name: 'Clinic Bot',
        keyPrefix: 'sk_live_abc',
        keyHash: 'MUST_NEVER_BE_RETURNED',
        createdAt: new Date().toISOString(),
        isActive: true
      } as never
    ]);

    const app = express();
    app.use(express.json());
    app.use('/api/keys', createApiKeysRouter());

    await withServer(app, async baseUrl => {
      expect((await fetch(`${baseUrl}/api/keys`)).status).toBe(401);

      const token = signSessionToken({
        sub: 'clinician-42',
        tenantId: 'verified-tenant-42',
        role: 'CLINICIAN'
      });
      const res = await fetch(`${baseUrl}/api/keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Id': 'spoofed-attacker-tenant'
        }
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<Record<string, unknown>>;
      expect(listSpy).toHaveBeenCalledWith('verified-tenant-42');
      expect(body[0]['keyHash']).toBeUndefined();
      expect(body[0]['id']).toBe('key-1');
    });
  });

  it('slack.routes enforces HMAC-SHA256 signature & 5-minute replay window and protects /logs', async () => {
    const app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use('/api/slack', slackRouter);

    await withServer(app, async baseUrl => {
      // Missing signature -> 401
      expect(
        (
          await fetch(`${baseUrl}/api/slack/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'text=hello'
          })
        ).status
      ).toBe(401);

      // Stale timestamp (> 5 min) -> 401
      const oldTs = String(Math.floor(Date.now() / 1000) - 600);
      const body = 'text=clinical+triage&user_name=drsmith';
      const staleSig =
        'v0=' +
        crypto
          .createHmac('sha256', process.env['SLACK_SIGNING_SECRET']!)
          .update(`v0:${oldTs}:${body}`)
          .digest('hex');
      expect(
        (
          await fetch(`${baseUrl}/api/slack/command`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Slack-Request-Timestamp': oldTs,
              'X-Slack-Signature': staleSig
            },
            body
          })
        ).status
      ).toBe(401);

      // Fresh valid signature -> 200
      const freshTs = String(Math.floor(Date.now() / 1000));
      const validSig =
        'v0=' +
        crypto
          .createHmac('sha256', process.env['SLACK_SIGNING_SECRET']!)
          .update(`v0:${freshTs}:${body}`)
          .digest('hex');
      const okRes = await fetch(`${baseUrl}/api/slack/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Slack-Request-Timestamp': freshTs,
          'X-Slack-Signature': validSig
        },
        body
      });
      expect(okRes.status).toBe(200);

      // /logs requires clinician auth
      expect((await fetch(`${baseUrl}/api/slack/logs`)).status).toBe(401);
      const token = signSessionToken({ sub: 'c1', tenantId: 't1', role: 'CLINICIAN' });
      expect(
        (await fetch(`${baseUrl}/api/slack/logs`, { headers: { Authorization: `Bearer ${token}` } })).status
      ).toBe(200);
    });
  });

  it('discovery.routes uses pinned PUBLIC_BASE_URL instead of reflecting attacker Host header', async () => {
    const app = express();
    app.use('/', createDiscoveryRouter());

    await withServer(app, async baseUrl => {
      // Use raw http.request to send a custom spoofed Host header (fetch forbids overriding Host)
      const parsed = new URL(`${baseUrl}/api/fhir/metadata`);
      const resBody = await new Promise<string>((resolve, reject) => {
        const req = http.request(
          {
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.pathname,
            method: 'GET',
            headers: { Host: 'evil-cache-poison.example' }
          },
          res => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          }
        );
        req.on('error', reject);
        req.end();
      });

      const json = JSON.parse(resBody) as { url: string };
      expect(resBody).not.toContain('evil-cache-poison.example');
      expect(json.url).toBe('https://pocketgull.app/api/fhir/metadata');
    });
  });

  it('utility.routes exposes /api/equity/who-cdc (no double /api/api) and rejects unredacted PHI in /research/donate', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', createUtilityRouter({ getApiKey: async () => '', rootDir: process.cwd() }));

    await withServer(app, async baseUrl => {
      const equityRes = await fetch(`${baseUrl}/api/equity/who-cdc?housing=true&food=true`);
      expect(equityRes.status).toBe(200);
      const equityBody = (await equityRes.json()) as { sdohPrapareVectorCount: number };
      expect(equityBody.sdohPrapareVectorCount).toBe(2);

      // Unredacted PHI in research bundle MUST be rejected with 422
      const phiRes = await fetch(`${baseUrl}/api/research/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundle: { resourceType: 'Bundle', patient_name: 'Jane Doe', ssn: '123-45-6789' } })
      });
      expect(phiRes.status).toBe(422);
      const phiBody = (await phiRes.json()) as { safeHarborVerified: boolean };
      expect(phiBody.safeHarborVerified).toBe(false);

      // Clean de-identified FHIR bundle succeeds
      const cleanRes = await fetch(`${baseUrl}/api/research/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundle: { resourceType: 'Bundle', type: 'collection', ageBracket: '50-54y' } })
      });
      expect(cleanRes.status).toBe(200);
      const cleanBody = (await cleanRes.json()) as { safeHarborVerified: boolean };
      expect(cleanBody.safeHarborVerified).toBe(true);
    });
  });

  it('dicom.ts blocks `..` traversal in params/UIDs and enforces auth', async () => {
    expect(sanitiseDicomParam('study-123_ok')).toBe('study-123_ok');
    expect(sanitiseDicomParam('../etc/passwd')).toBeNull();
    expect(sanitiseDicomParam('foo..bar')).toBeNull();
    expect(validateDicomUid('1.2.840.10008.5.1.4.1.1.2')).toBe('1.2.840.10008.5.1.4.1.1.2');
    expect(validateDicomUid('1.2..3')).toBeNull();

    const app = express();
    app.use('/api/dicom', dicomRouter);
    await withServer(app, async baseUrl => {
      expect((await fetch(`${baseUrl}/api/dicom/studies`)).status).toBe(401);
    });
  });

  it('genkit.ts auditGenkitClinicalGrounding produces genuine 64-hex SHA-256, pValue: null, and detects fallacies', () => {
    const clean = auditGenkitClinicalGrounding('Randomized trial suggests benefit in subgroup.', 90);
    expect(clean.pValue).toBeNull();
    expect(clean.calibrated).toBe(false);
    expect(clean.sha256Digest).toMatch(/^sha256_part11_genkit_[0-9a-f]{64}$/);
    expect(clean.detectedFallacies.length).toBe(0);

    const fallacious = auditGenkitClinicalGrounding(
      'This intervention is 100% certain with zero risk and correlation proves causation.',
      95
    );
    expect(fallacious.cochraneRob2).toBe('HighRisk');
    expect(fallacious.detectedFallacies.length).toBeGreaterThanOrEqual(3);
  });

  it('sidecar-proxy forwards empty {} JSON POST without hanging, strips auth/cookie, and preserves Observatory headers', async () => {
    let seenHeaders: http.IncomingHttpHeaders = {};
    let seenBody = '';

    const mockUpstream = http.createServer((req, res) => {
      seenHeaders = req.headers;
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        seenBody = Buffer.concat(chunks).toString('utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Security-Policy': "default-src 'unsafe-inline'",
          'X-Powered-By': 'SneakySidecar',
          'X-HIPAA-Safe-Harbor': '164.514(b)(2)-ENFORCED'
        });
        res.end(JSON.stringify({ echoed: seenBody }));
      });
    });

    await new Promise<void>(resolve => mockUpstream.listen(0, '127.0.0.1', resolve));
    const addr = mockUpstream.address() as AddressInfo;

    try {
      const app = express();
      app.disable('x-powered-by');
      app.use((_req, res, next) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'");
        next();
      });
      app.use(express.json());
      app.use(
        '/api/python',
        createSidecarProxy({
          target: `http://127.0.0.1:${addr.port}`,
          pathRewrite: { '^/api/python': '' }
        })
      );

      await withServer(app, async baseUrl => {
        const res = await fetch(`${baseUrl}/api/python/echo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'session=secret-cookie',
            Authorization: 'Bearer super-secret-jwt'
          },
          body: JSON.stringify({})
        });

        expect(res.status).toBe(200);
        const body = (await res.json()) as { echoed: string };
        expect(body.echoed).toBe('{}');
        expect(seenHeaders['cookie']).toBeUndefined();
        expect(seenHeaders['authorization']).toBeUndefined();
        expect(res.headers.get('content-security-policy')).toBe("default-src 'none'");
        expect(res.headers.get('x-powered-by')).toBeNull();
        expect(res.headers.get('x-hipaa-safe-harbor')).toBe('164.514(b)(2)-ENFORCED');
      });
    } finally {
      await new Promise<void>(resolve => mockUpstream.close(() => resolve()));
    }
  });
});
