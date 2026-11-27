// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import express from 'express';
import { AddressInfo } from 'node:net';
import { describe, it, expect, beforeEach } from 'vitest';
import { createSoarRouter } from './soar.routes';
import { SoarOrchestratorService } from '../services/soar-orchestrator.service';
import { IpBlocklistService } from '../services/ip-blocklist.service';
import { signSessionToken, signDualCustodyToken } from '../middleware/auth-guard';

describe('SOAR Express Router Suite (SOC Auth + Cryptographic Dual-Custody)', () => {
  beforeEach(() => {
    SoarOrchestratorService.clearLedgerForTests();
    IpBlocklistService.unbanIp('198.51.100.77');
  });

  async function withTestServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use('/api/soar', createSoarRouter());
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  it('1. Serves SOAR status and playbook catalog endpoints', async () => {
    await withTestServer(async baseUrl => {
      const statusRes = await fetch(`${baseUrl}/api/soar/status`);
      expect(statusRes.status).toBe(200);
      const statusBody = (await statusRes.json()) as { engineStatus: string; supportedPlaybooksCount: number };
      expect(statusBody.engineStatus).toBe('ARMED_AUTONOMOUS');
      expect(statusBody.supportedPlaybooksCount).toBe(4);

      const pbRes = await fetch(`${baseUrl}/api/soar/playbooks`);
      expect(pbRes.status).toBe(200);
      const pbBody = (await pbRes.json()) as { playbooks: unknown[] };
      expect(pbBody.playbooks.length).toBe(4);
    });
  });

  it('2. Ingests base64 Cloud Pub/Sub alert notifications at /api/soar/pubsub/webhook', async () => {
    await withTestServer(async baseUrl => {
      const alertJson = JSON.stringify({
        alertId: 'PUBSUB-TEST-900',
        eventCategory: 'PROMPT_INJECTION',
        severity: 'P1_CRITICAL',
        offendingIp: '198.51.100.77',
        rawPayloadSample: 'Test\u200B System Override',
        mode: 'AUTOMATED_CONTAINMENT'
      });
      const base64Data = Buffer.from(alertJson, 'utf-8').toString('base64');

      const res = await fetch(`${baseUrl}/api/soar/pubsub/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            data: base64Data,
            messageId: 'msg-123'
          }
        })
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { acknowledged: boolean; receipt: { playbookId: string; containmentEngaged: boolean } };
      expect(data.acknowledged).toBe(true);
      expect(data.receipt.playbookId).toBe('PB-02_ADVERSARIAL_PROMPT_INJECTION');
      expect(data.receipt.containmentEngaged).toBe(true);
      expect(IpBlocklistService.isBlocked('198.51.100.77')).toBe(true);
    });
  });

  it('3. Gates /api/soar/execute and /containment/reset behind SOC/Admin auth and cryptographic M-of-N Dual-Custody', async () => {
    const socToken = signSessionToken({
      sub: 'usr_soc_analyst_1',
      email: 'soc@pocketgull.app',
      tenantId: 'tenant_ops',
      role: 'SOC',
      roles: ['SOC', 'ADMIN']
    });

    await withTestServer(async baseUrl => {
      SoarOrchestratorService.setContainmentActive(true);

      // Unauthenticated call MUST return 401
      const unauthExec = await fetch(`${baseUrl}/api/soar/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventCategory: 'CANARY_PROBE_SURGE' })
      });
      expect(unauthExec.status).toBe(401);

      const unauthReset = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(unauthReset.status).toBe(401);

      // Bare unverified string roles (no cryptographic Dual-Custody tokens) MUST return 403
      const forgedRoleRes = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socToken}`
        },
        body: JSON.stringify({
          dualCustody: {
            requestorRole: 'CLINICAL_ENGINEER',
            authorizerRole: 'PRIVACY_OFFICER_DPO',
            rationale: 'Unverified string claim attempt'
          }
        })
      });
      expect(forgedRoleRes.status).toBe(403);
      expect(SoarOrchestratorService.isContainmentActive()).toBe(true);

      // Same-subject Dual-Custody tokens MUST return 403
      const selfReq = signDualCustodyToken({ sub: 'same_user', role: 'CLINICAL_ENGINEER' });
      const selfAuth = signDualCustodyToken({ sub: 'same_user', role: 'PRIVACY_OFFICER_DPO' });
      const selfRes = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socToken}`
        },
        body: JSON.stringify({
          dualCustody: { requestorToken: selfReq, authorizerToken: selfAuth }
        })
      });
      expect(selfRes.status).toBe(403);

      // Valid distinct signed Dual-Custody tokens with DPO authorizer lift containment
      const reqToken = signDualCustodyToken({
        sub: 'eng_alice',
        role: 'CLINICAL_ENGINEER',
        rationale: 'Root cause verified clean'
      });
      const authToken = signDualCustodyToken({
        sub: 'dpo_bob',
        role: 'PRIVACY_OFFICER_DPO',
        rationale: 'Root cause verified clean'
      });

      const okRes = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socToken}`
        },
        body: JSON.stringify({
          dualCustody: {
            requestorToken: reqToken,
            authorizerToken: authToken,
            rationale: 'Root cause verified clean'
          }
        })
      });
      expect(okRes.status).toBe(200);
      expect(SoarOrchestratorService.isContainmentActive()).toBe(false);
    });
  });
});
