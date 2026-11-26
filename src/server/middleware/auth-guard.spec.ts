// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import crypto from 'node:crypto';
import {
  signSessionToken,
  verifySessionToken,
  signDualCustodyToken,
  verifyDualCustodyTokens,
  requireAuth,
  requireScimAuth,
  timingSafeStringEqual
} from './auth-guard';

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

describe('Cryptographic Auth Guard & M-of-N Dual-Custody Verification', () => {
  const prevSecret = process.env['SESSION_SIGNING_SECRET'];
  const prevScim = process.env['SCIM_BEARER_TOKEN'];
  const prevDemo = process.env['ALLOW_UNAUTH_LOCAL_DEMO'];

  beforeEach(() => {
    process.env['SESSION_SIGNING_SECRET'] = 'test-signing-secret-with-high-entropy-2026!';
    process.env['SCIM_BEARER_TOKEN'] = 'scim-enterprise-secret-token-2026';
    delete process.env['ALLOW_UNAUTH_LOCAL_DEMO'];
  });

  afterEach(() => {
    if (prevSecret === undefined) delete process.env['SESSION_SIGNING_SECRET'];
    else process.env['SESSION_SIGNING_SECRET'] = prevSecret;
    if (prevScim === undefined) delete process.env['SCIM_BEARER_TOKEN'];
    else process.env['SCIM_BEARER_TOKEN'] = prevScim;
    if (prevDemo === undefined) delete process.env['ALLOW_UNAUTH_LOCAL_DEMO'];
    else process.env['ALLOW_UNAUTH_LOCAL_DEMO'] = prevDemo;
  });

  it('mints and verifies HMAC-SHA256 session tokens and rejects tampered payloads', () => {
    const token = signSessionToken({
      sub: 'clinician-001',
      email: 'dr.jane@pocketgull.app',
      tenantId: 'tenant-clinic-a',
      role: 'CLINICIAN'
    });
    expect(token.startsWith('pgs1.')).toBe(true);

    const principal = verifySessionToken(token);
    expect(principal).not.toBeNull();
    expect(principal?.sub).toBe('clinician-001');
    expect(principal?.tenantId).toBe('tenant-clinic-a');
    expect(principal?.roles).toContain('CLINICIAN');

    // Tamper payload (escalate role to ADMIN) without valid signature
    const [prefix, payloadB64, sigB64] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    decoded.role = 'ADMIN';
    decoded.roles = ['ADMIN'];
    const tamperedPayload = Buffer.from(JSON.stringify(decoded)).toString('base64url');
    expect(verifySessionToken(`${prefix}.${tamperedPayload}.${sigB64}`)).toBeNull();
  });

  it('rejects expired session tokens', () => {
    const expiredPayload = {
      sub: 'clinician-expired',
      tenantId: 'tenant-a',
      role: 'CLINICIAN',
      roles: ['CLINICIAN'],
      iat: Date.now() - 120_000,
      exp: Date.now() - 10_000,
      jti: 'expired1'
    };
    const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const key = crypto.createHash('sha256').update(process.env['SESSION_SIGNING_SECRET']!, 'utf8').digest();
    const sigB64 = crypto.createHmac('sha256', key).update(`pgs1.${payloadB64}`, 'utf8').digest('base64url');
    expect(verifySessionToken(`pgs1.${payloadB64}.${sigB64}`)).toBeNull();
  });

  it('enforces M-of-N Dual-Custody: distinct subjects, distinct roles, DPO/COMPLIANCE/CHIEF authorizer, TTL <= 15m', () => {
    const reqTok = signDualCustodyToken({ sub: 'soc-1', role: 'SOC_ANALYST', action: 'CONTAIN' });
    const dpoTok = signDualCustodyToken({ sub: 'dpo-1', role: 'DPO', action: 'CONTAIN' });

    const ok = verifyDualCustodyTokens(reqTok, dpoTok);
    expect(ok.verified).toBe(true);
    expect(ok.requestor?.sub).toBe('soc-1');
    expect(ok.authorizer?.role).toBe('DPO');

    // Same subject self-approval MUST fail
    const sameSubAuth = signDualCustodyToken({ sub: 'soc-1', role: 'DPO', action: 'CONTAIN' });
    expect(verifyDualCustodyTokens(reqTok, sameSubAuth).verified).toBe(false);

    // Non-DPO/COMPLIANCE/CHIEF authorizer MUST fail
    const lowRoleAuth = signDualCustodyToken({ sub: 'clinician-2', role: 'CLINICIAN', action: 'CONTAIN' });
    expect(verifyDualCustodyTokens(reqTok, lowRoleAuth).verified).toBe(false);

    // Same role MUST fail
    const dpoReq = signDualCustodyToken({ sub: 'dpo-2', role: 'DPO', action: 'CONTAIN' });
    expect(verifyDualCustodyTokens(dpoReq, dpoTok).verified).toBe(false);

    // Crafted TTL > 15 minutes MUST fail even with valid signature
    const now = Date.now();
    const longLivedClaims = {
      sub: 'dpo-long',
      role: 'DPO',
      iat: now,
      exp: now + 30 * 60 * 1000,
      jti: 'long1',
      purpose: 'dual_custody'
    };
    const key = crypto.createHash('sha256').update(process.env['SESSION_SIGNING_SECRET']!, 'utf8').digest();
    const p64 = Buffer.from(JSON.stringify(longLivedClaims)).toString('base64url');
    const s64 = crypto.createHmac('sha256', key).update(`pgdc1.${p64}`, 'utf8').digest('base64url');
    const ttlRes = verifyDualCustodyTokens(reqTok, `pgdc1.${p64}.${s64}`);
    expect(ttlRes.verified).toBe(false);
    expect(ttlRes.reason).toContain('15-minute');
  });

  it('enforces requireAuth role gating and requireScimAuth constant-time verification', async () => {
    const app = express();
    app.get('/admin-only', requireAuth(['ADMIN']), (_req, res) => res.json({ ok: true }));
    app.get('/scim', requireScimAuth(), (_req, res) => res.json({ scim: true }));

    await withServer(app, async baseUrl => {
      // Unauthenticated -> 401
      expect((await fetch(`${baseUrl}/admin-only`)).status).toBe(401);

      // Clinician calling admin-only -> 403
      const clinicianToken = signSessionToken({ sub: 'c1', tenantId: 't1', role: 'CLINICIAN' });
      expect(
        (await fetch(`${baseUrl}/admin-only`, { headers: { Authorization: `Bearer ${clinicianToken}` } })).status
      ).toBe(403);

      // Admin calling admin-only -> 200
      const adminToken = signSessionToken({ sub: 'a1', tenantId: 't1', role: 'ADMIN' });
      expect(
        (await fetch(`${baseUrl}/admin-only`, { headers: { Authorization: `Bearer ${adminToken}` } })).status
      ).toBe(200);

      // SCIM endpoint rejects wrong token and accepts configured token
      expect((await fetch(`${baseUrl}/scim`, { headers: { Authorization: 'Bearer wrong' } })).status).toBe(401);
      expect(
        (
          await fetch(`${baseUrl}/scim`, {
            headers: { Authorization: 'Bearer scim-enterprise-secret-token-2026' }
          })
        ).status
      ).toBe(200);
      expect(timingSafeStringEqual('abc', 'abc')).toBe(true);
      expect(timingSafeStringEqual('abc', 'abcd')).toBe(false);
    });
  });
});
