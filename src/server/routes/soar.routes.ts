// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * 🛡️ PocketGull Serverless SOAR Webhook & SOC Orchestration Routes
 *
 * Exposes:
 * - GET  /api/soar/status           — Live SOAR posture, IP blocklist stats, and recent receipts
 * - GET  /api/soar/playbooks        — Canonical automated playbook catalog (PG-SOP-IR-01)
 * - POST /api/soar/pubsub/webhook   — OIDC-verified Google Cloud Pub/Sub alert sink receiver (mandatory audience + exact SA email)
 * - POST /api/soar/execute          — SOC/Admin auth-gated playbook execution
 * - POST /api/soar/containment/reset — SOC/Admin auth + Cryptographic M-of-N Dual-Custody gated reset
 */

import { Router, Request, Response, json as expressJson } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { rateLimit } from 'express-rate-limit';
import {
  SoarOrchestratorService,
  ISoarAlertEvent,
  SoarSeverity,
  SoarPlaybookId,
  IDualCustodyAttestation
} from '../services/soar-orchestrator.service';
import { IpBlocklistService } from '../services/ip-blocklist.service';
import { requireAuth, isStrictProductionEnv } from '../middleware/auth-guard';

const soarOAuth2Client = new OAuth2Client();

const VALID_EVENT_CATEGORIES = new Set<ISoarAlertEvent['eventCategory']>([
  'CREDENTIAL_LEAK',
  'PROMPT_INJECTION',
  'PHI_TAINT_LEAK',
  'CANARY_PROBE_SURGE',
  'INFRASTRUCTURE_DOS'
]);

const VALID_SEVERITIES = new Set<SoarSeverity>([
  'P1_CRITICAL',
  'P2_HIGH',
  'P3_MEDIUM',
  'P4_LOW'
]);

const VALID_PLAYBOOK_IDS = new Set<SoarPlaybookId>([
  'PB-01_COMPROMISED_CREDENTIAL',
  'PB-02_ADVERSARIAL_PROMPT_INJECTION',
  'PB-03_PHI_TAINT_BOUNDARY_LEAK',
  'PB-04_INFRASTRUCTURE_DOS_HONEYPOT'
]);

/**
 * Verifies Google Cloud Pub/Sub OIDC push token in production environments.
 * Enforces mandatory `audience` and exact Service Account email equality (never downgraded by CI=true).
 */
export async function verifySoarPubSubOidcToken(req: Request): Promise<boolean> {
  if (!isStrictProductionEnv()) {
    return true;
  }

  const expectedAudience = (
    process.env['SOAR_PUBSUB_AUDIENCE'] ||
    process.env['PUBSUB_WEBHOOK_AUDIENCE'] ||
    ''
  ).trim();
  const expectedSaEmail = (
    process.env['SOAR_PUBSUB_SA_EMAIL'] ||
    process.env['PUBSUB_PUSH_SERVICE_ACCOUNT'] ||
    'pocketgull-run@gen-lang-client-0540208645.iam.gserviceaccount.com'
  ).trim().toLowerCase();

  // Fail closed when audience is unconfigured in production
  if (!expectedAudience) {
    console.warn('[SOAR Pub/Sub Auth] Rejecting push request: SOAR_PUBSUB_AUDIENCE / PUBSUB_WEBHOOK_AUDIENCE is not set.');
    return false;
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    return false;
  }

  try {
    const ticket = await soarOAuth2Client.verifyIdToken({
      idToken,
      audience: expectedAudience
    });
    const payload = ticket.getPayload();
    return Boolean(
      payload &&
      payload.email_verified &&
      typeof payload.email === 'string' &&
      payload.email.toLowerCase() === expectedSaEmail
    );
  } catch (err: unknown) {
    const safeMsg = ((err as Error)?.message || 'OIDC verification error').replace(/[\r\n]/g, ' ');
    console.warn('[SOAR Pub/Sub Auth] Token verification rejected:', safeMsg);
    return false;
  }
}

function extractDualCustodyAttestation(req: Request, rawBody: Record<string, unknown>): IDualCustodyAttestation | undefined {
  const rawDual = rawBody['dualCustody'] as Record<string, unknown> | undefined;
  const headers = (req.headers || {}) as Record<string, unknown>;

  const requestorToken =
    (rawDual && typeof rawDual['requestorToken'] === 'string' ? rawDual['requestorToken'] : undefined) ||
    (typeof headers['x-dual-custody-requestor-token'] === 'string' ? headers['x-dual-custody-requestor-token'] : undefined);
  const authorizerToken =
    (rawDual && typeof rawDual['authorizerToken'] === 'string' ? rawDual['authorizerToken'] : undefined) ||
    (typeof headers['x-dual-custody-authorizer-token'] === 'string' ? headers['x-dual-custody-authorizer-token'] : undefined);
  const rationale =
    (rawDual && typeof rawDual['rationale'] === 'string' ? rawDual['rationale'] : undefined) ||
    (typeof headers['x-dual-custody-rationale'] === 'string' ? headers['x-dual-custody-rationale'] : undefined);

  if (!rawDual && !requestorToken && !authorizerToken) {
    return undefined;
  }

  return {
    requestorToken,
    authorizerToken,
    requestorRole: rawDual && typeof rawDual['requestorRole'] === 'string' ? rawDual['requestorRole'] : undefined,
    authorizerRole: rawDual && typeof rawDual['authorizerRole'] === 'string' ? rawDual['authorizerRole'] : undefined,
    rationale
  };
}

function normalizeAlertPayload(
  raw: Record<string, unknown>,
  defaultSource: ISoarAlertEvent['source'],
  fallbackIp?: string,
  dualCustodyOverride?: IDualCustodyAttestation
): ISoarAlertEvent {
  const rawCategory = String(raw['eventCategory'] || 'CANARY_PROBE_SURGE') as ISoarAlertEvent['eventCategory'];
  const eventCategory: ISoarAlertEvent['eventCategory'] = VALID_EVENT_CATEGORIES.has(rawCategory)
    ? rawCategory
    : 'CANARY_PROBE_SURGE';

  const rawSeverity = String(raw['severity'] || 'P2_HIGH') as SoarSeverity;
  const severity: SoarSeverity = VALID_SEVERITIES.has(rawSeverity) ? rawSeverity : 'P2_HIGH';

  const rawPlaybook = raw['playbookId'] ? (String(raw['playbookId']) as SoarPlaybookId) : undefined;
  const playbookId = rawPlaybook && VALID_PLAYBOOK_IDS.has(rawPlaybook) ? rawPlaybook : undefined;

  const rawDual = raw['dualCustody'] as Record<string, unknown> | undefined;
  const dualCustody: IDualCustodyAttestation | undefined =
    dualCustodyOverride ??
    (rawDual && typeof rawDual === 'object'
      ? {
          requestorToken: typeof rawDual['requestorToken'] === 'string' ? rawDual['requestorToken'] : undefined,
          authorizerToken: typeof rawDual['authorizerToken'] === 'string' ? rawDual['authorizerToken'] : undefined,
          requestorRole: typeof rawDual['requestorRole'] === 'string' ? rawDual['requestorRole'] : undefined,
          authorizerRole: typeof rawDual['authorizerRole'] === 'string' ? rawDual['authorizerRole'] : undefined,
          rationale: typeof rawDual['rationale'] === 'string' ? rawDual['rationale'] : undefined
        }
      : undefined);

  return {
    alertId: typeof raw['alertId'] === 'string' ? raw['alertId'].slice(0, 80) : undefined,
    source: defaultSource,
    ...(playbookId ? { playbookId } : {}),
    eventCategory,
    severity,
    offendingIp:
      typeof raw['offendingIp'] === 'string'
        ? raw['offendingIp'].slice(0, 64)
        : fallbackIp,
    compromisedKeyId:
      typeof raw['compromisedKeyId'] === 'string' ? raw['compromisedKeyId'].slice(0, 128) : undefined,
    tenantId: typeof raw['tenantId'] === 'string' ? raw['tenantId'].slice(0, 128) : undefined,
    rawPayloadSample:
      typeof raw['rawPayloadSample'] === 'string' ? raw['rawPayloadSample'].slice(0, 2048) : undefined,
    requiresDestructiveAction: Boolean(raw['requiresDestructiveAction']),
    ...(dualCustody ? { dualCustody } : {}),
    mode: raw['mode'] === 'DRY_RUN' ? 'DRY_RUN' : 'AUTOMATED_CONTAINMENT'
  };
}

export function createSoarRouter(): Router {
  const router = Router();

  const isTestingEnv =
    !isStrictProductionEnv() &&
    Boolean(process.env['NODE_ENV'] === 'test' || process.env['VITEST'] || process.env['PLAYWRIGHT_TESTING']);

  const soarRateLimiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv ? 10_000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { error: 'SOAR rate limit exceeded.' }
  });

  router.use(soarRateLimiter);
  router.use(expressJson({ limit: '256kb' }));

  /**
   * GET /api/soar/status
   * Live SOAR telemetry, containment mode state, IP blocklist stats, and masked execution receipts.
   */
  router.get('/status', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const summary = SoarOrchestratorService.getStatusSummary();
    res.status(200).json(summary);
  });

  /**
   * GET /api/soar/playbooks
   * Returns all automated incident response playbooks mapped to PG-SOP-IR-01.
   */
  router.get('/playbooks', (_req: Request, res: Response) => {
    res.status(200).json({
      governingStandard: 'NIST SP 800-61r2 & PG-SOP-IR-01 v2.4.0',
      playbooks: SoarOrchestratorService.getPlaybookCatalog()
    });
  });

  /**
   * POST /api/soar/pubsub/webhook
   * Event-driven Cloud Logging Sink -> Cloud Pub/Sub -> SOAR Playbook Executor.
   */
  router.post('/pubsub/webhook', async (req: Request, res: Response) => {
    const authorized = await verifySoarPubSubOidcToken(req);
    if (!authorized) {
      res.status(401).json({
        error: 'Unauthorized: Missing or invalid Google Cloud Pub/Sub OIDC token.'
      });
      return;
    }

    const body = (req.body || {}) as Record<string, unknown>;
    const message = body['message'] as Record<string, unknown> | undefined;
    if (!message || typeof message['data'] !== 'string') {
      res.status(400).json({ error: 'Invalid Cloud Pub/Sub envelope: message.data (base64) is required.' });
      return;
    }

    let decodedJson: Record<string, unknown> = {};
    try {
      const jsonStr = Buffer.from(message['data'], 'base64').toString('utf-8');
      decodedJson = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      res.status(400).json({ error: 'Malformed base64 JSON in Pub/Sub message.data.' });
      return;
    }

    const alertEvent = normalizeAlertPayload(decodedJson, 'CLOUD_MONITORING_PUBSUB');
    const receipt = await SoarOrchestratorService.orchestrateAlert(alertEvent);

    const safeExecId = receipt.executionId.replace(/[\r\n]/g, '');
    const safePlaybook = receipt.playbookId.replace(/[\r\n]/g, '');
    console.log(`[SOAR Pub/Sub Executed] id=${safeExecId} playbook=${safePlaybook} digest=${receipt.sha256EvidenceDigest}`);

    res.status(200).json({
      acknowledged: true,
      receipt
    });
  });

  /**
   * POST /api/soar/execute
   * Direct SOC / Tabletop SOAR trigger — gated behind verified SOC/Admin auth.
   * Destructive containment actions additionally enforce cryptographic Dual-Custody verification.
   */
  router.post('/execute', requireAuth(['SOC', 'ADMIN']), async (req: Request, res: Response) => {
    const rawBody = (req.body || {}) as Record<string, unknown>;
    if (!rawBody['eventCategory'] && !rawBody['playbookId']) {
      res.status(400).json({
        error: 'Missing required field: eventCategory or playbookId.'
      });
      return;
    }

    const dualCustody = extractDualCustodyAttestation(req, rawBody);
    const callerIp = IpBlocklistService.extractClientIp(req);
    const alertEvent = normalizeAlertPayload(
      {
        ...rawBody,
        mode: rawBody['mode'] === 'AUTOMATED_CONTAINMENT' ? 'AUTOMATED_CONTAINMENT' : 'DRY_RUN'
      },
      rawBody['source'] === 'BIGQUERY_SIEM' ? 'BIGQUERY_SIEM' : 'MANUAL_SOC',
      rawBody['offendingIp'] ? undefined : callerIp || undefined,
      dualCustody
    );

    const receipt = await SoarOrchestratorService.orchestrateAlert(alertEvent);
    res.status(200).json({ receipt });
  });

  /**
   * POST /api/soar/containment/reset
   * Resets server-side SOAR containment lockdown — strictly requires SOC/Admin auth + cryptographic M-of-N Dual-Custody.
   */
  router.post('/containment/reset', requireAuth(['SOC', 'ADMIN']), (req: Request, res: Response) => {
    const rawBody = (req.body || {}) as Record<string, unknown>;
    const dualCustody = extractDualCustodyAttestation(req, rawBody);
    const verification = SoarOrchestratorService.verifyDualCustody(dualCustody);

    if (!verification.verified) {
      res.status(403).json({
        error: 'Dual-Custody verification failed for containment reset.',
        reason: verification.reason
      });
      return;
    }

    SoarOrchestratorService.setContainmentActive(false);
    res.status(200).json({
      containmentModeActive: false,
      message: `Containment lockdown lifted. ${verification.reason}`
    });
  });

  return router;
}
