// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response } from 'express';
import { createAuthRouter, ISsoUserSession } from './auth.routes';
import { verifySessionToken } from '../middleware/auth-guard';

function createMockReqRes(body: Record<string, unknown> = {}, query: Record<string, string> = {}) {
  const req = {
    body,
    query,
    headers: {},
    hostname: 'pocketgull.app'
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: any = null;
  const headers: Record<string, string> = {};

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((payload: any) => {
      jsonPayload = payload;
      return res;
    }),
    setHeader: vi.fn((name: string, val: string) => {
      headers[name.toLowerCase()] = val;
      return res;
    }),
    getStatus: () => statusCode,
    getJson: () => jsonPayload,
    getHeaders: () => headers
  } as unknown as Response & {
    getStatus: () => number;
    getJson: () => any;
    getHeaders: () => Record<string, string>;
  };

  return { req, res };
}

describe('Auth SSO Security & Login Routes (Hardened OIDC + Signed Session Tokens)', () => {
  const mockVerifyIdToken = vi.fn();
  const router = createAuthRouter({
    oauthClient: { verifyIdToken: mockVerifyIdToken } as any
  });

  const getConfigHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/config')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postGoogleHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/google')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postSmartFhirHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/smart-fhir')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postWebAuthnHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/webauthn')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postKineticZkpHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/kinetic-zkp')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postLogoutHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/logout')?.route?.stack.slice(-1)[0] as any)?.handle;

  beforeEach(() => {
    mockVerifyIdToken.mockReset();
  });

  afterEach(() => {
    delete process.env['ADMIN_ALLOWLIST_EMAILS'];
  });

  describe('1. GET /api/auth/sso/config — Discovery & Endpoint Hardening', () => {
    it('returns public SSO provider discovery metadata with secure Cache-Control', () => {
      const { req, res } = createMockReqRes();
      getConfigHandler(req, res);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.getHeaders()['cache-control']).toBe('public, max-age=300');
      const data = res.getJson();
      expect(data.status).toBe('active');
      expect(data.google.enabled).toBe(true);
      expect(data.google.supportedScopes).toContain('openid');
      expect(data.smartOnFhir.enabled).toBe(true);
      expect(data.smartOnFhir.issuers.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('2. POST /api/auth/sso/google — Verified Google OIDC ID Token Authentication', () => {
    it('rejects unverified payload lacking a Google OIDC idToken with HTTP 401', async () => {
      const { req, res } = createMockReqRes({
        email: 'attacker@evil.example',
        role: 'roles/healthcare.datasetAdmin'
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.getJson().error).toContain('idToken');
    });

    it('rejects invalid or expired Google OIDC idToken with HTTP 401', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Token used too late'));
      const { req, res } = createMockReqRes({ idToken: 'forged.jwt.token' });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.getJson().error).toContain('Invalid or expired');
    });

    it('authenticates verified Google OIDC clinician and prevents non-allowlisted admin self-escalation', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-curie-01',
          email: 'dr.curie@pocketgull.app',
          email_verified: true,
          name: 'Dr. Marie Curie'
        })
      });

      const { req, res } = createMockReqRes({
        idToken: 'valid.google.idtoken',
        role: 'roles/healthcare.datasetAdmin' // Attempted self-escalation
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session: ISsoUserSession = res.getJson().session;
      expect(session.email).toBe('dr.curie@pocketgull.app');
      expect(session.name).toBe('Dr. Marie Curie');
      // Downgraded to least-privilege clinician role since email is not in ADMIN_ALLOWLIST_EMAILS
      expect(session.clinicalRole).toBe('roles/aiplatform.user');
      expect(session.sessionToken.startsWith('pgs1.')).toBe(true);

      const verifiedPrincipal = verifySessionToken(session.sessionToken);
      expect(verifiedPrincipal).not.toBeNull();
      expect(verifiedPrincipal?.email).toBe('dr.curie@pocketgull.app');
    });

    it('grants Healthcare Dataset Admin role only to allowlisted verified admin emails', async () => {
      process.env['ADMIN_ALLOWLIST_EMAILS'] = 'director@pocketgull.app,dpo@pocketgull.app';
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-director',
          email: 'director@pocketgull.app',
          email_verified: true,
          name: 'Chief Medical Officer'
        })
      });

      const { req, res } = createMockReqRes({
        idToken: 'valid.admin.idtoken',
        role: 'roles/healthcare.datasetAdmin'
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session = res.getJson().session;
      expect(session.clinicalRole).toBe('roles/healthcare.datasetAdmin');
      expect(session.roleTitle).toBe('Medical Director (EHR & FHIR Admin)');
    });
  });

  describe('3. POST /api/auth/sso/smart-fhir — SMART-on-FHIR Hospital EHR Launch', () => {
    it('authenticates SMART EHR launch with signed HMAC session token and blocks admin self-escalation', () => {
      const { req, res } = createMockReqRes({
        issuer: 'Epic Systems EHR',
        fhirPatientId: 'patient-curie-2026',
        role: 'roles/healthcare.datasetAdmin'
      });
      postSmartFhirHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session: ISsoUserSession = res.getJson().session;
      expect(session.provider).toBe('smart-fhir');
      expect(session.clinicalRole).toBe('roles/aiplatform.user');
      expect(session.fhirPatientId).toBe('patient-curie-2026');
      expect(session.tenantId).toBe('tenant_smart_fhir_epic_systems_ehr');
      expect(verifySessionToken(session.sessionToken)).not.toBeNull();
    });
  });

  describe('4. POST /api/auth/sso/webauthn & kinetic-zkp & logout', () => {
    it('mints verifiable HMAC session tokens for WebAuthn and Kinetic ZKP', () => {
      const w = createMockReqRes({ credentialId: 'fido2_passkey_test_token_123' });
      postWebAuthnHandler(w.req, w.res);
      expect(w.res.status).toHaveBeenCalledWith(200);
      expect(verifySessionToken(w.res.getJson().session.sessionToken)).not.toBeNull();

      const k = createMockReqRes({
        zkpKineticHash: 'sha256:abcd1234efgh5678ijkl9012mnop3456qrst7890',
        role: 'roles/aiplatform.user'
      });
      postKineticZkpHandler(k.req, k.res);
      expect(k.res.status).toHaveBeenCalledWith(200);
      expect(verifySessionToken(k.res.getJson().session.sessionToken)).not.toBeNull();

      const kBad = createMockReqRes({});
      postKineticZkpHandler(kBad.req, kBad.res);
      expect(kBad.res.status).toHaveBeenCalledWith(400);

      const l = createMockReqRes();
      postLogoutHandler(l.req, l.res);
      expect(l.res.status).toHaveBeenCalledWith(200);
      expect(l.res.getJson().success).toBe(true);
    });
  });
});
