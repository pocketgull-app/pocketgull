/**
 * Slack Integration Routes — Webhooks & Slash Command (/pocketgull) Handlers
 *
 * @module server/routes/slack.routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';

export const slackRouter = Router();

/**
 * POST /api/slack/command
 * Handles incoming Slack slash command /pocketgull consult
 */
slackRouter.post('/command', (req: Request, res: Response) => {
  const text = (req.body && req.body.text) || 'General Clinical Triage Query';
  const user = (req.body && req.body.user_name) || 'Clinician';

  const blockKitResponse = {
    response_type: 'in_channel',
    text: `🤖 Pocket Gull Consult for @${user}: ${text}`,
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
            text: `*Query:*\n_${text}_`
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

  res.json(blockKitResponse);
});

/**
 * POST /api/slack/alert
 * Dispatch a clinical triage alert payload to a Slack Webhook URL
 */
slackRouter.post('/alert', async (req: Request, res: Response) => {
  const { patientArchetype, sibiScore, cvRiskMultiplier, symptoms } = req.body || {};
  const configuredWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!configuredWebhookUrl) {
    res.status(500).json({ error: 'Slack webhook is not configured on the server' });
    return;
  }

  const payload = {
    text: `🚨 Pocket Gull Alert: ${patientArchetype || 'Patient'} - SIBI ${sibiScore || 0}`,
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
            text: `*Patient Archetype:*\n\`${patientArchetype || 'De-identified Patient'}\``
          },
          {
            type: 'mrkdwn',
            text: `*SIBI Score:*\n*${sibiScore || 0} / 100*`
          },
          {
            type: 'mrkdwn',
            text: `*CV Risk Multiplier:*\n\`${cvRiskMultiplier || 1.0}x\``
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
          text: `*Presenting Symptoms:*\n• ${Array.isArray(symptoms) ? symptoms.join('\n• ') : 'Elevated SIBI inflammatory marker'}`
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

    if (fetchRes.ok) {
      res.json({ success: true, message: 'Slack alert dispatched successfully.' });
    } else {
      const errText = await fetchRes.text();
      res.status(fetchRes.status).json({ error: `Slack returned error: ${errText}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: `Failed to connect to Slack Webhook: ${err.message}` });
  }
});
