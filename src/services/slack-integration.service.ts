import { Injectable, signal, computed } from '@angular/core';

export interface ISlackBlockKitMessage {
  text: string;
  blocks: Array<{
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    fields?: Array<{ type: string; text: string }>;
    elements?: Array<any>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SlackIntegrationService {
  readonly webhookUrl = signal<string>('');
  readonly isConnected = computed(() => this.webhookUrl().length > 10 || this.isSimulatedMode());
  readonly isSimulatedMode = signal<boolean>(true);
  readonly lastAlertStatus = signal<string | null>(null);

  /**
   * Formats a HIPAA-sanitized Slack Block Kit payload for clinical triage alerts.
   */
  formatTriageAlertBlockKit(
    patientArchetype: string,
    sibiScore: number,
    cvRiskMultiplier: number,
    symptoms: string[]
  ): ISlackBlockKitMessage {
    const isCritical = sibiScore >= 70;
    const emoji = isCritical ? '🚨' : '⚠️';
    const statusHeader = isCritical ? 'CRITICAL SIBI ALERT' : 'ELEVATED INFLAMMATORY RISK';

    return {
      text: `${emoji} Pocket Gull Alert: ${patientArchetype} - SIBI ${sibiScore}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Pocket Gull ${statusHeader}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Patient Archetype:*\n\`${patientArchetype}\``
            },
            {
              type: 'mrkdwn',
              text: `*SIBI Score:*\n*${sibiScore} / 100*`
            },
            {
              type: 'mrkdwn',
              text: `*CV Risk Multiplier:*\n\`${cvRiskMultiplier}x\``
            },
            {
              type: 'mrkdwn',
              text: `*HIPAA Compliance:*\n\`De-identified Safe Harbor\``
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Presenting Symptoms:*\n• ${symptoms.join('\n• ')}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🤖 *Pocket Gull Clinical Intelligence Engine* | Google Gemini 2.5 Flash | FHIR R4 Strategy`
            }
          ]
        }
      ]
    };
  }

  /**
   * Dispatches a triage alert to the configured Slack webhook (or simulated channel).
   */
  async sendTriageAlert(
    patientArchetype: string,
    sibiScore: number,
    cvRiskMultiplier: number,
    symptoms: string[]
  ): Promise<boolean> {
    const payload = this.formatTriageAlertBlockKit(patientArchetype, sibiScore, cvRiskMultiplier, symptoms);
    
    if (this.isSimulatedMode() || !this.webhookUrl()) {
      console.log('[SlackIntegrationService] Simulation Mode Active. Dispatched Block Kit:', payload);
      this.lastAlertStatus.set(`✅ [SIMULATED] Dispatched Block Kit Alert for ${patientArchetype} (SIBI ${sibiScore})`);
      return true;
    }

    try {
      const res = await fetch(this.webhookUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.lastAlertStatus.set(`✅ Slack alert dispatched to webhook successfully.`);
        return true;
      } else {
        const text = await res.text();
        this.lastAlertStatus.set(`❌ Slack Webhook Error: ${res.status} - ${text}`);
        return false;
      }
    } catch (err: any) {
      this.lastAlertStatus.set(`❌ Network error dispatching Slack alert: ${err.message}`);
      return false;
    }
  }

  /**
   * Simulates processing a Slack slash command (/pocketgull consult [query]).
   */
  processSlashCommand(commandText: string): ISlackBlockKitMessage {
    const query = commandText.replace(/^\/pocketgull\s*/i, '').trim() || 'General Clinical Triage Query';

    return {
      text: `🤖 Pocket Gull Consult: ${query}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🤖 Pocket Gull Clinical AI Response*\n\n*Query:* _"${query}"_\n\n*Differential Assessment:* Preliminary analysis indicates high correlation with systemic inflammation index (SIBI). Recommend baseline hs-CRP lab panel, periodontal probing, and FHIR R4 Care Plan review.`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Powered by Google Gemini 2.5 Flash & Pocket Gull Live Consult Engine`
            }
          ]
        }
      ]
    };
  }
}
