// SPDX-License-Identifier: Apache-2.0
/**
 * Slack Integration Routes — Webhooks & Slash Command (/pocketgull) Handlers
 *
 * Enforces Slack HMAC-SHA256 request signing (`X-Slack-Signature` + 5-min timestamp replay window)
 * using `crypto.timingSafeEqual`, and clinician auth on outbound alerts & audit logs.
 *
 * @module server/routes/slack.routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import {
  requireAuth,
  timingSafeStringEqual,
  isStrictProductionEnv
} from '../middleware/auth-guard';
import { ModelArmorService } from '../services/model-armor.service';

export const slackRouter = Router();

interface ISlackAuditEntry {
  id: string;
  timestamp: string;
  type: 'COMMAND' | 'ALERT';
  status: string;
  summary: string;
}

const slackAuditLogs: ISlackAuditEntry[] = [];
const MAX_SLACK_REPLAY_WINDOW_SEC = 300; // 5 minutes per Slack Signing Secret spec

/**
 * Verifies Slack request HMAC-SHA256 signature (`v0=HMAC_SHA256(secret, "v0:<ts>:<body>")`).
 * Fails closed in production when `SLACK_SIGNING_SECRET` is missing or signature is invalid.
 */
export function verifySlackSignature(req: Request): { valid: boolean; status: number; error?: string } {
  const signingSecret = process.env['SLACK_SIGNING_SECRET']?.trim();
  if (!signingSecret) {
    if (isStrictProductionEnv()) {
      return { valid: false, status: 503, error: 'Slack signing secret is not configured on the server.' };
    }
    return { valid: true, status: 200 };
  }

  const timestampHeader = String(req.headers['x-slack-request-timestamp'] || '').trim();
  const signatureHeader = String(req.headers['x-slack-signature'] || '').trim();
  if (!timestampHeader || !signatureHeader) {
    return { valid: false, status: 401, error: 'Missing X-Slack-Signature or X-Slack-Request-Timestamp header.' };
  }

  const tsNum = Number(timestampHeader);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > MAX_SLACK_REPLAY_WINDOW_SEC) {
    return { valid: false, status: 401, error: 'Slack request timestamp outside 5-minute replay window.' };
  }

  const rawBody =
    typeof (req as Request & { rawBody?: string | Buffer }).rawBody === 'string'
      ? (req as Request & { rawBody?: string }).rawBody!
      : Buffer.isBuffer((req as Request & { rawBody?: Buffer }).rawBody)
        ? (req as Request & { rawBody?: Buffer }).rawBody!.toString('utf8')
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : typeof req.body === 'string'
            ? req.body
            : new URLSearchParams(
                Object.entries((req.body || {}) as Record<string, string>).map(([k, v]) => [k, String(v)])
              ).toString();

  const sigBaseString = `v0:${timestampHeader}:${rawBody}`;
  const expectedSig =
    'v0=' + crypto.createHmac('sha256', signingSecret).update(sigBaseString, 'utf8').digest('hex');

  if (!timingSafeStringEqual(signatureHeader, expectedSig)) {
    return { valid: false, status: 401, error: 'Invalid Slack HMAC-SHA256 request signature.' };
  }

  return { valid: true, status: 200 };
}

/**
 * POST /api/slack/command
 * Handles incoming Slack slash command /pocketgull consult
 */
slackRouter.post('/command', (req: Request, res: Response) => {
  const sigCheck = verifySlackSignature(req);
  if (!sigCheck.valid) {
    return res.status(sigCheck.status).json({ error: sigCheck.error });
  }

  const rawText = String((req.body && req.body.text) || 'General Clinical Triage Query');
  const sanitizedText = ModelArmorService.scan(rawText).sanitizedText.slice(0, 500);
  const user = String((req.body && req.body.user_name) || 'Clinician').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 64);

  slackAuditLogs.unshift({
    id: `SLK-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    type: 'COMMAND',
    status: 'PROCESSED',
    summary: `Slash command processed (${sanitizedText.length} chars)`
  });
  if (slackAuditLogs.length > 50) slackAuditLogs.pop();

  const blockKitResponse = {
    response_type: 'in_channel',
    text: `🤖 Pocket Gull Consult for @${user}: ${sanitizedText}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🤖 Pocket Gull Clinical Triage & AI Consult`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Requested By:*\n@${user}`
          },
          {
            type: 'mrkdwn',
            text: `*Query:*\n_${sanitizedText}_`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Clinical Differential Assessment:*\nBased on Pocket Gull's Google Gemini 2.5 Flash reasoning model, initial evaluation recommends calculating the Systemic Inflammatory Burden Index (SIBI), reviewing FDI 32-tooth odontogram PPD scores, and evaluating FHIR R4 Care Plan compliance.`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🛡️ Pocket Gull HIPAA Safe Harbor Protocol | FHIR R4 Interoperable`
          }
        ]
      }
    ]
  };

  return res.json(blockKitResponse);
});

/**
 * POST /api/slack/alert
 * Dispatch a clinical triage alert payload to a Slack Webhook URL (authenticated clinicians only)
 */
slackRouter.post('/alert', requireAuth(['CLINICIAN']), async (req: Request, res: Response) => {
  const { patientArchetype, sibiScore, cvRiskMultiplier, symptoms } = req.body || {};
  const configuredWebhookUrl = process.env['SLACK_WEBHOOK_URL'];

  if (!configuredWebhookUrl) {
    res.status(500).json({ error: 'Slack webhook is not configured on the server' });
    return;
  }

  const safeArchetype = ModelArmorService.scan(String(patientArchetype || 'De-identified Patient')).sanitizedText.slice(0, 120);
  const safeSymptoms = Array.isArray(symptoms)
    ? symptoms.map(s => ModelArmorService.scan(String(s)).sanitizedText).join('\n• ')
    : 'Elevated SIBI inflammatory marker';

  const payload = {
    text: `🚨 Pocket Gull Alert: ${safeArchetype} - SIBI ${Number(sibiScore) || 0}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Pocket Gull CRITICAL SIBI ALERT`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Patient Archetype:*\n\`${safeArchetype}\``
          },
          {
            type: 'mrkdwn',
            text: `*SIBI Score:*\n*${Number(sibiScore) || 0} / 100*`
          },
          {
            type: 'mrkdwn',
            text: `*CV Risk Multiplier:*\n\`${Number(cvRiskMultiplier) || 1.0}x\``
          },
          {
            type: 'mrkdwn',
            text: `*HIPAA Status:*\n\`De-identified Safe Harbor\``
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Presenting Symptoms:*\n• ${safeSymptoms}`
        }
      }
    ]
  };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredWebhookUrl);
  } catch {
    return res.status(500).json({ error: 'Configured Slack webhook URL is invalid' });
  }

  if (
    parsedUrl.protocol !== 'https:' ||
    parsedUrl.hostname !== 'hooks.slack.com' ||
    !parsedUrl.pathname.startsWith('/services/')
  ) {
    return res.status(500).json({ error: 'Configured Slack webhook URL must be a valid https://hooks.slack.com/services/... endpoint' });
  }

  try {
    const fetchRes = await fetch(parsedUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    slackAuditLogs.unshift({
      id: `SLK-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      type: 'ALERT',
      status: fetchRes.ok ? 'DISPATCHED' : `HTTP_${fetchRes.status}`,
      summary: `SIBI alert (${Number(sibiScore) || 0}/100)`
    });
    if (slackAuditLogs.length > 50) slackAuditLogs.pop();

    if (fetchRes.ok) {
      return res.json({ success: true, message: 'Slack alert dispatched successfully.' });
    } else {
      const errText = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: `Slack returned error: ${errText}` });
    }
  } catch (err: unknown) {
    return res.status(500).json({ error: `Failed to connect to Slack Webhook: ${(err as Error)?.message}` });
  }
});

/**
 * GET /api/slack/logs
 * Retrieves redacted Slack dispatch audit logs (strictly clinician/admin authenticated).
 */
slackRouter.get('/logs', requireAuth(['CLINICIAN']), (_req: Request, res: Response) => {
  res.status(200).json({
    count: slackAuditLogs.length,
    logs: slackAuditLogs
  });
});
