// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { hsaRouter } from './hsa.routes';
import { signSessionToken, signDualCustodyToken } from '../middleware/auth-guard';

describe('Express HSA Incentive Router (/api/hsa — Patient Scoping & >=$500 Dual-Custody)', () => {
  const patientScopedToken = signSessionToken({
    sub: 'pt_user_p001',
    tenantId: 'tenant_hsa',
    role: 'CLINICIAN',
    patientId: 'P001'
  });

  async function withHsaServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use(express.json());
    app.use('/api/hsa', hsaRouter);
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  it('1. Links card and disburses routine <$500 rebate for authenticated patient', async () => {
    await withHsaServer(async baseUrl => {
      const linkRes = await fetch(`${baseUrl}/api/hsa/cards/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientScopedToken}`
        },
        body: JSON.stringify({
          patientId: 'P001',
          issuerName: 'Fidelity HSA',
          cardType: 'HSA',
          last4: '7721'
        })
      });
      expect(linkRes.status).toBe(200);
      const linkBody = await linkRes.json() as any;
      expect(linkBody.success).toBe(true);
      expect(linkBody.maskedPan).toContain('7721');

      const disbRes = await fetch(`${baseUrl}/api/hsa/rebate/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientScopedToken}`
        },
        body: JSON.stringify({
          patientId: 'P001',
          adherenceDomain: 'MEDICATION_PDC',
          amountUsd: 25.00,
          reason: '90-Day Metformin PDC > 80%'
        })
      });
      expect(disbRes.status).toBe(200);
      expect((await disbRes.json() as any).disbursedAmountUsd).toBe(25);
    });
  });

  it('2. Enforces cryptographic M-of-N Dual-Custody on disbursements >= $500', async () => {
    await withHsaServer(async baseUrl => {
      // Missing Dual-Custody tokens -> 403
      const blocked = await fetch(`${baseUrl}/api/hsa/rebate/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientScopedToken}`
        },
        body: JSON.stringify({
          patientId: 'P001',
          adherenceDomain: 'MEDICATION_PDC',
          amountUsd: 550.00,
          reason: 'Large annual wellness disbursement'
        })
      });
      expect(blocked.status).toBe(403);

      // Valid signed Dual-Custody tokens -> 200
      const reqToken = signDualCustodyToken({ sub: 'clinician_a', role: 'CLINICAL_LEAD' });
      const authToken = signDualCustodyToken({ sub: 'compliance_b', role: 'COMPLIANCE_OFFICER' });
      const approved = await fetch(`${baseUrl}/api/hsa/rebate/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientScopedToken}`
        },
        body: JSON.stringify({
          patientId: 'P001',
          adherenceDomain: 'MEDICATION_PDC',
          amountUsd: 550.00,
          reason: 'Large annual wellness disbursement',
          dualCustody: { requestorToken: reqToken, authorizerToken: authToken }
        })
      });
      expect(approved.status).toBe(200);
      expect((await approved.json() as any).disbursedAmountUsd).toBe(550);
    });
  });

  it('3. Strictly scopes GET and POST /ledger to authenticated patient and rejects cross-patient access', async () => {
    await withHsaServer(async baseUrl => {
      const unauth = await fetch(`${baseUrl}/api/hsa/ledger`);
      expect(unauth.status).toBe(401);

      const ownRes = await fetch(`${baseUrl}/api/hsa/ledger`, {
        headers: { Authorization: `Bearer ${patientScopedToken}` }
      });
      expect(ownRes.status).toBe(200);
      const ownBody = await ownRes.json() as any;
      expect(ownBody.patientId).toBe('P001');
      expect(ownBody.ledger.every((t: any) => t.patientId === 'P001')).toBe(true);

      // Attempting to query another patient P999 MUST fail with 403
      const crossPatientRes = await fetch(`${baseUrl}/api/hsa/ledger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientScopedToken}`
        },
        body: JSON.stringify({ patientId: 'P999' })
      });
      expect(crossPatientRes.status).toBe(403);
    });
  });
});
