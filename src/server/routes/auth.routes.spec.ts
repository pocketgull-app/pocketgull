import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createAuthRouter, ISsoUserSession } from './auth.routes';

function createMockReqRes(body: Record<string, unknown> = {}, query: Record<string, string> = {}) {
  const req = {
    body,
    query,
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

describe('Auth SSO Security & Login Routes (Battletest Server Handlers)', () => {
  const router = createAuthRouter();

  // Extract handlers from router stack
  const getConfigHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/config')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postGoogleHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/google')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postSmartFhirHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/smart-fhir')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postWebAuthnHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/webauthn')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postKineticZkpHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/kinetic-zkp')?.route?.stack.slice(-1)[0] as any)?.handle;
  const postLogoutHandler = (router.stack.find((layer: any) => layer.route?.path === '/sso/logout')?.route?.stack.slice(-1)[0] as any)?.handle;

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
      expect(data.webauthn.enabled).toBe(true);
      expect(data.kineticZkp.enabled).toBe(true);
    });
  });

  describe('2. POST /api/auth/sso/google — Google Cloud IAM Authentication', () => {
    it('authenticates attending clinician with default AI Platform role', async () => {
      const { req, res } = createMockReqRes({
        email: 'dr.curie@pocketgull.app',
        name: 'Dr. Marie Curie',
        role: 'roles/aiplatform.user'
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data.success).toBe(true);
      const session: ISsoUserSession = data.session;
      expect(session.email).toBe('dr.curie@pocketgull.app');
      expect(session.name).toBe('Dr. Marie Curie');
      expect(session.clinicalRole).toBe('roles/aiplatform.user');
      expect(session.roleTitle).toBe('Attending Clinician (CDS & AI Consult)');
      expect(session.provider).toBe('google');
      expect(session.tenantId).toBe('tenant_gen_lang_client_0540208645');
      expect(session.sessionToken).toHaveLength(64); // NIST SP 800-90A CSPRNG
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('authenticates medical director with Healthcare Dataset Admin role', async () => {
      const { req, res } = createMockReqRes({
        email: 'director@pocketgull.app',
        name: 'Chief Medical Officer',
        role: 'roles/healthcare.datasetAdmin'
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session = res.getJson().session;
      expect(session.clinicalRole).toBe('roles/healthcare.datasetAdmin');
      expect(session.roleTitle).toBe('Medical Director (EHR & FHIR Admin)');
    });

    it('attaches Wacom WILL 3.0 Zero-Knowledge Kinetic proof hash when provided', async () => {
      const kineticHash = 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      const { req, res } = createMockReqRes({
        email: 'clinician@pocketgull.app',
        zkpKineticHash: kineticHash
      });
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.getJson().session.zkpKineticHash).toBe(kineticHash);
    });

    it('handles empty or missing payload gracefully with fallback clinician identity', async () => {
      const { req, res } = createMockReqRes({});
      await postGoogleHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session = res.getJson().session;
      expect(session.email).toBe('clinician@pocketgull.app');
      expect(session.clinicalRole).toBe('roles/aiplatform.user');
      expect(session.sessionToken).toBeDefined();
    });
  });

  describe('3. POST /api/auth/sso/smart-fhir — SMART-on-FHIR Hospital EHR Launch', () => {
    it('authenticates SMART EHR launch with patient scope and tenant namespace', () => {
      const { req, res } = createMockReqRes({
        issuer: 'Epic Systems EHR',
        fhirPatientId: 'patient-curie-2026',
        role: 'roles/aiplatform.user'
      });
      postSmartFhirHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session: ISsoUserSession = res.getJson().session;
      expect(session.provider).toBe('smart-fhir');
      expect(session.fhirPatientId).toBe('patient-curie-2026');
      expect(session.tenantId).toBe('tenant_smart_fhir_epic_systems_ehr');
      expect(session.roleTitle).toBe('SMART-on-FHIR Launch (Epic Systems EHR)');
      expect(session.sessionToken).toHaveLength(64);
    });

    it('supports Cerner and AthenaHealth issuer namespaces cleanly', () => {
      const { req, res } = createMockReqRes({
        issuer: 'Oracle Cerner Millennium',
        fhirPatientId: 'pat-cerner-991'
      });
      postSmartFhirHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session = res.getJson().session;
      expect(session.tenantId).toBe('tenant_smart_fhir_oracle_cerner_millennium');
      expect(session.fhirPatientId).toBe('pat-cerner-991');
    });
  });

  describe('4. POST /api/auth/sso/webauthn — FIDO2 Biometric Passkey Assertion', () => {
    it('authenticates biometric passkey assertion with hardware token identifier', () => {
      const { req, res } = createMockReqRes({
        credentialId: 'fido2_passkey_test_token_123'
      });
      postWebAuthnHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session: ISsoUserSession = res.getJson().session;
      expect(session.provider).toBe('webauthn');
      expect(session.tenantId).toBe('tenant_webauthn_passkey');
      expect(session.roleTitle).toBe('FIDO2 / WebAuthn Biometric Clinician');
      expect(session.sessionToken).toHaveLength(64);
    });
  });

  describe('5. POST /api/auth/sso/kinetic-zkp — Wacom WILL 3.0 Kinetic Proof', () => {
    it('authenticates valid kinetic motor entropy proof', () => {
      const { req, res } = createMockReqRes({
        zkpKineticHash: 'sha256:abcd1234efgh5678ijkl9012mnop3456qrst7890',
        role: 'roles/aiplatform.user'
      });
      postKineticZkpHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const session = res.getJson().session;
      expect(session.provider).toBe('kinetic-wacom');
      expect(session.zkpKineticHash).toBe('sha256:abcd1234efgh5678ijkl9012mnop3456qrst7890');
      expect(session.tenantId).toBe('tenant_kinetic_zkp');
    });

    it('rejects kinetic authentication if proof hash is missing', () => {
      const { req, res } = createMockReqRes({});
      postKineticZkpHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.getJson().error).toContain('Missing kinetic entropy proof');
    });
  });

  describe('6. POST /api/auth/sso/logout — Session Revocation', () => {
    it('successfully revokes and confirms session logout', () => {
      const { req, res } = createMockReqRes();
      postLogoutHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.getJson().success).toBe(true);
      expect(res.getJson().message).toBe('Session logged out');
    });
  });
});
