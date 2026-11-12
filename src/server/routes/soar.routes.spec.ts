// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import express from 'express';
import { AddressInfo } from 'node:net';
import { describe, it, expect, beforeEach } from 'vitest';
import { createSoarRouter } from './soar.routes';
import { SoarOrchestratorService } from '../services/soar-orchestrator.service';
import { IpBlocklistService } from '../services/ip-blocklist.service';

describe('SOAR Express Router Suite', () => {
  beforeEach(() => {
    SoarOrchestratorService.clearLedgerForTests();
    IpBlocklistService.unbanIp('198.51.100.77');
  });

  async function withTestServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use('/api/soar', createSoarRouter());
    const server = app.listen(0);
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      server.close();
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

  it('3. Enforces M-of-N Dual-Custody verification before resetting containment lockdown', async () => {
    await withTestServer(async baseUrl => {
      SoarOrchestratorService.setContainmentActive(true);

      // Missing/invalid dual-custody must return 403
      const failRes = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dualCustody: {
            requestorRole: 'ENGINEER',
            authorizerRole: 'ENGINEER',
            rationale: 'Self-reset attempt'
          }
        })
      });
      expect(failRes.status).toBe(403);
      expect(SoarOrchestratorService.isContainmentActive()).toBe(true);

      // Valid distinct roles with DPO co-signature must lift containment
      const okRes = await fetch(`${baseUrl}/api/soar/containment/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dualCustody: {
            requestorRole: 'CLINICAL_ENGINEER',
            authorizerRole: 'PRIVACY_OFFICER_DPO',
            rationale: 'Root cause verified clean'
          }
        })
      });
      expect(okRes.status).toBe(200);
      expect(SoarOrchestratorService.isContainmentActive()).toBe(false);
    });
  });
});
