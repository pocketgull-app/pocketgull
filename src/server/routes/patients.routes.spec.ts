// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, vi, afterEach } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import fsPromises from 'node:fs/promises';
import { createPatientsRouter } from './patients.routes';
import { signSessionToken, signDualCustodyToken } from '../middleware/auth-guard';

describe('Patients & FHIR R4 Routes Suite (Auth + Safe Harbor + Cryptographic Dual-Custody)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function withPatientsServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use('/api/patients', createPatientsRouter());
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  const clinicianToken = signSessionToken({
    sub: 'dr_clinician_1',
    email: 'clinician@pocketgull.app',
    tenantId: 'tenant_clinic',
    role: 'CLINICIAN'
  });

  it('1. Rejects unauthenticated access to patient and FHIR endpoints with HTTP 401', async () => {
    await withPatientsServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/patients/export/fhir`);
      expect(res.status).toBe(401);
    });
  });

  it('2. GET /api/patients/export/fhir returns HIPAA Safe Harbor de-identified FHIR R4 Bundle', async () => {
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue(
      JSON.stringify([
        {
          id: 'MRN-12345678',
          name: 'Johnathan Sensitive Doe',
          age: 92,
          gender: 'male',
          vitals: { heartRate: 74 },
          conditions: ['Hypertension (Contact john@example.com SSN 123-45-6789)']
        }
      ]) as any
    );

    await withPatientsServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/patients/export/fhir`, {
        headers: { Authorization: `Bearer ${clinicianToken}` }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/fhir+json');
      expect(res.headers.get('x-fhir-integrity-sha256')).toMatch(/^[a-f0-9]{64}$/);
      const body = await res.json() as any;
      expect(body.resourceType).toBe('Bundle');
      expect(body.type).toBe('collection');

      const serialized = JSON.stringify(body);
      expect(serialized).not.toContain('Johnathan Sensitive Doe');
      expect(serialized).not.toContain('john@example.com');
      expect(serialized).not.toContain('123-45-6789');
      expect(serialized).toContain('90+');
    });
  });

  it('3. Enforces cryptographic M-of-N Dual-Custody Anti-Whaling gate when exporting > 50 records', async () => {
    const largeRoster = Array.from({ length: 55 }, (_, i) => ({
      id: `pt-${i + 1}`,
      gender: 'unknown',
      vitals: { heartRate: 72 }
    }));
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue(JSON.stringify(largeRoster) as any);

    await withPatientsServer(async baseUrl => {
      // Without cryptographic Dual-Custody tokens -> HTTP 403
      const blockedRes = await fetch(`${baseUrl}/api/patients/export/fhir`, {
        headers: {
          Authorization: `Bearer ${clinicianToken}`,
          'x-dual-custody-requestor': 'ATTENDING_CLINICIAN',
          'x-dual-custody-authorizer': 'DPO_OFFICER'
        }
      });
      expect(blockedRes.status).toBe(403);
      expect(((await blockedRes.json()) as any).error).toContain('Anti-Whaling Guard');

      // With distinct signed Dual-Custody tokens -> HTTP 200
      const reqToken = signDualCustodyToken({ sub: 'clinician_1', role: 'ATTENDING_CLINICIAN' });
      const authToken = signDualCustodyToken({ sub: 'dpo_officer_2', role: 'DPO_OFFICER' });

      const authorizedRes = await fetch(`${baseUrl}/api/patients/export/fhir`, {
        headers: {
          Authorization: `Bearer ${clinicianToken}`,
          'x-dual-custody-requestor-token': reqToken,
          'x-dual-custody-authorizer-token': authToken,
          'x-dual-custody-rationale': 'Audited IRB registry export'
        }
      });
      expect(authorizedRes.status).toBe(200);
      expect(((await authorizedRes.json()) as any).resourceType).toBe('Bundle');
    });
  });
});
