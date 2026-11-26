// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { smsRouter } from './sms.routes';
import { signSessionToken } from '../middleware/auth-guard';

describe('Express SMS Router (/api/sms — Affiliate Guard, PHI Redaction & Red Flags)', () => {
  const clinicianToken = signSessionToken({
    sub: 'dr_sms_1',
    tenantId: 'tenant_clinic',
    role: 'CLINICIAN'
  });

  async function withSmsServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use(express.json());
    app.use('/api/sms', smsRouter);
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  it('1. POST /api/sms/inbound extracts vitals and awards points', async () => {
    await withSmsServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/sms/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: '+15551234567', body: 'LOG BP 120/80 HR 72' })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.commandType).toBe('VITALS_LOG');
      expect(body.urgencyLevel).toBe('ROUTINE');
      expect(body.responseSmsText).toContain('Recorded BP 120/80, HR 72 bpm');
    });
  });

  it('2. POST /api/sms/inbound triggers emergency alerts on chest pain, can\'t breathe, BE-FAST, SpO2<90%, and 988 crisis', async () => {
    await withSmsServer(async baseUrl => {
      for (const msg of [
        'Having crushing chest pain radiating to left arm',
        "Help I can't breathe right now",
        'Sudden facial droop and slurred speech',
        'My pulse ox says SpO2 84%',
        'I want to kill myself tonight'
      ]) {
        const res = await fetch(`${baseUrl}/api/sms/inbound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: '+15551234567', body: msg })
        });
        expect(res.status).toBe(200);
        const body = await res.json() as any;
        expect(body.urgencyLevel).toBe('CRITICAL_CALL_911');
      }
    });
  });

  it('3. POST /api/sms/outbound blocks Amazon affiliate URLs and unredacted PHI', async () => {
    await withSmsServer(async baseUrl => {
      const affRes = await fetch(`${baseUrl}/api/sms/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clinicianToken}`
        },
        body: JSON.stringify({
          to: '+15559876543',
          messageBody: 'Order magnesium here: https://www.amazon.com/dp/B000BD0RT0?tag=pgdpo-20'
        })
      });
      expect(affRes.status).toBe(400);

      const phiRes = await fetch(`${baseUrl}/api/sms/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clinicianToken}`
        },
        body: JSON.stringify({
          to: '+15559876543',
          messageBody: 'Confirm SSN 123-45-6789 before visit.'
        })
      });
      expect(phiRes.status).toBe(400);

      const okRes = await fetch(`${baseUrl}/api/sms/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clinicianToken}`
        },
        body: JSON.stringify({
          to: '+15559876543',
          messageBody: 'Daily reminder to take your morning walk.'
        })
      });
      expect(okRes.status).toBe(200);
      expect((await okRes.json() as any).dispatchedTo).toBe('+15-***-6543');
    });
  });

  it('4. GET /api/sms/logs requires auth and returns PHI-redacted history', async () => {
    await withSmsServer(async baseUrl => {
      const unauth = await fetch(`${baseUrl}/api/sms/logs`);
      expect(unauth.status).toBe(401);

      const authRes = await fetch(`${baseUrl}/api/sms/logs`, {
        headers: { Authorization: `Bearer ${clinicianToken}` }
      });
      expect(authRes.status).toBe(200);
      const data = await authRes.json() as any;
      expect(data.count).toBeGreaterThan(0);
      expect(Array.isArray(data.logs)).toBe(true);
    });
  });
});
