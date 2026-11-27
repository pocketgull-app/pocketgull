// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'node:crypto';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { fhirSubscriptionRouter } from './fhir-subscription.routes';
import { signSessionToken } from '../middleware/auth-guard';

describe('FHIR R4 Real-time Subscription Router (HMAC-SHA256 + Safe Harbor + Auth)', () => {
  const testWebhookSecret = 'fhir_webhook_test_secret_2026_random';
  const clinicianToken = signSessionToken({
    sub: 'dr_fhir_1',
    tenantId: 'tenant_ehr',
    role: 'CLINICIAN'
  });

  beforeEach(() => {
    process.env['FHIR_SUBSCRIPTION_WEBHOOK_SECRET'] = testWebhookSecret;
  });

  afterEach(() => {
    delete process.env['FHIR_SUBSCRIPTION_WEBHOOK_SECRET'];
    delete process.env['FHIR_JWKS_PUBLIC_JSON'];
  });

  async function withFhirSubServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use(express.json());
    app.use('/api/fhir/subscription', fhirSubscriptionRouter);
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  function signBody(bodyObj: unknown): string {
    return (
      'sha256=' +
      crypto.createHmac('sha256', testWebhookSecret).update(JSON.stringify(bodyObj), 'utf8').digest('hex')
    );
  }

  it('1. Exposes GET /status returning subscription channel telemetry', async () => {
    await withFhirSubServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/fhir/subscription/status`);
      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.status).toBe('ACTIVE');
      expect(data.supportedTopics.length).toBeGreaterThan(0);
    });
  });

  it('2. Fails closed (401) on unsigned or forged POST / webhook notifications and accepts valid HMAC-SHA256', async () => {
    const handshakePayload = {
      resourceType: 'Bundle',
      type: 'handshake',
      subscription: 'Subscription/pg-adt-subscription-01'
    };

    const encounterPayload = {
      resourceType: 'Encounter',
      id: 'enc-admission-7701',
      status: 'in-progress',
      subject: { reference: 'Patient/pat-9912' },
      identifier: [{ value: 'MRN-RAW-999111' }]
    };

    await withFhirSubServer(async baseUrl => {
      // Missing signature -> 401
      const noSig = await fetch(`${baseUrl}/api/fhir/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encounterPayload)
      });
      expect(noSig.status).toBe(401);

      // Valid HMAC handshake -> 200
      const hsRes = await fetch(`${baseUrl}/api/fhir/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Subscription-Signature': signBody(handshakePayload)
        },
        body: JSON.stringify(handshakePayload)
      });
      expect(hsRes.status).toBe(200);
      expect((await hsRes.json() as any).status).toBe('HANDSHAKE_ACKNOWLEDGED');

      // Valid HMAC encounter -> 200 with pseudonymized MRN (zero raw MRN leak)
      const encRes = await fetch(`${baseUrl}/api/fhir/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Subscription-Signature': signBody(encounterPayload)
        },
        body: JSON.stringify(encounterPayload)
      });
      expect(encRes.status).toBe(200);
      const encData = await encRes.json() as any;
      expect(encData.status).toBe('RECEIVED_AND_QUEUED');
      expect(encData.patientMrnPseudonym).toMatch(/^anon_mrn_/);
      expect(JSON.stringify(encData)).not.toContain('MRN-RAW-999111');
    });
  });

  it('3. Gates GET /history behind auth and omits rawPayload and raw patientMrn', async () => {
    await withFhirSubServer(async baseUrl => {
      const unauth = await fetch(`${baseUrl}/api/fhir/subscription/history`);
      expect(unauth.status).toBe(401);

      const simRes = await fetch(`${baseUrl}/api/fhir/subscription/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clinicianToken}`
        },
        body: JSON.stringify({ type: 'ADT_ADMISSION', mrn: 'MRN-SIM-7849' })
      });
      expect(simRes.status).toBe(200);

      const histRes = await fetch(`${baseUrl}/api/fhir/subscription/history`, {
        headers: { Authorization: `Bearer ${clinicianToken}` }
      });
      expect(histRes.status).toBe(200);
      const histData = await histRes.json() as any;
      expect(histData.events.length).toBeGreaterThan(0);
      expect(histData.events[0].rawPayload).toBeUndefined();
      expect(histData.events[0].patientMrn).toBeUndefined();
      expect(histData.events[0].patientMrnPseudonym).toMatch(/^anon_mrn_/);
      expect(JSON.stringify(histData)).not.toContain('MRN-SIM-7849');
    });
  });

  it('4. GET /jwks does not emit fabricated ACTIVE_CERTIFIED placeholder RSA keys', async () => {
    await withFhirSubServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/fhir/subscription/jwks`);
      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(Array.isArray(data.keys)).toBe(true);
      expect(data.keys.length).toBe(0);
      expect(JSON.stringify(data)).not.toContain('ACTIVE_CERTIFIED');
      expect(JSON.stringify(data)).not.toContain('EXAMPLE_RSA_PUBLIC_MODULUS');
    });
  });
});
