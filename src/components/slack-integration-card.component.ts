import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlackIntegrationService } from '../services/slack-integration.service';
import { TeledentistryService } from '../services/teledentistry.service';

@Component({
  selector: 'app-slack-integration-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-purple-500/30 rounded-2xl shadow-xl space-y-5 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-extrabold text-lg">
            💬
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Slack Clinical Command & AI Triage Integration
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Real-time Slack Block Kit alerts, SIBI threshold notifications, and /pocketgull slash command consults.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold font-mono">
            {{ slack.isConnected() ? '🟢 CONNECTED' : '🟡 SIMULATION MODE' }}
          </span>
        </div>
      </div>

      <!-- Webhook Configuration -->
      <div class="p-4 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
        <label class="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
          Slack Webhook Endpoint URL (Incoming Webhook)
        </label>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            [value]="slack.webhookUrl()"
            (input)="onWebhookChange($event)"
            placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
            class="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            (click)="testDispatchAlert()"
            [disabled]="isDispatching()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0 shadow-md shadow-purple-900/30 flex items-center gap-1.5">
            <span>{{ isDispatching() ? '⏳ Dispatching...' : '🚀 Test Slack Alert' }}</span>
          </button>
        </div>
        
        @if (slack.lastAlertStatus(); as status) {
          <div class="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] font-mono text-purple-200 animate-in fade-in duration-200">
            {{ status }}
          </div>
        }
      </div>

      <!-- Interactive Slack Slash Command Tester -->
      <div class="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <span>⚡ Interactive Slack Slash Command Tester</span>
          <span class="px-2 py-0.5 bg-purple-500/20 rounded text-[10px] font-mono font-normal text-purple-200">/pocketgull</span>
        </h4>

        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            [value]="slashQuery()"
            (input)="slashQuery.set($any($event.target).value)"
            placeholder="e.g. /pocketgull consult SIBI 72 periodontal probing"
            class="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            (click)="runSlashCommand()"
            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/40 rounded-xl font-bold text-xs transition cursor-pointer shrink-0">
            Run Slash Command ↵
          </button>
        </div>

        <!-- Render Block Kit Preview -->
        @if (activeBlockKit(); as kit) {
          <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs text-zinc-300 animate-in fade-in duration-200">
            <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Live Slack Channel Block Kit Preview</div>
            <div class="p-3 rounded-lg bg-zinc-900 border border-purple-500/30 space-y-2">
              <div class="font-bold text-purple-300">{{ kit.text }}</div>
              @for (block of kit.blocks; track $index) {
                @if (block.type === 'section' && block.text) {
                  <div class="text-zinc-200 text-[11px] italic leading-relaxed whitespace-pre-wrap">{{ block.text.text }}</div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SlackIntegrationCardComponent {
  readonly slack = inject(SlackIntegrationService);
  private dental = inject(TeledentistryService);

  readonly isDispatching = signal<boolean>(false);
  readonly slashQuery = signal<string>('/pocketgull consult SIBI score 68 and periodontal PPD >= 4mm');
  readonly activeBlockKit = signal<any>(null);

  constructor() {
    // Initialize preview with slash command response
    this.runSlashCommand();
  }

  onWebhookChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.slack.webhookUrl.set(val);
  }

  async testDispatchAlert() {
    this.isDispatching.set(true);
    const sibi = this.dental.sibiScore();
    const cvRisk = this.dental.cvRiskMultiplier();
    
    await this.slack.sendTriageAlert(
      'Homo Sapiens (Female, Neurological, 34y)',
      sibi,
      cvRisk,
      ['Periodontal Probing Depth >= 4mm', 'Elevated Inflammatory SIBI Score', 'Vagal HRV Baroreflex Strain']
    );
    this.isDispatching.set(false);
  }

  runSlashCommand() {
    const kit = this.slack.processSlashCommand(this.slashQuery());
    this.activeBlockKit.set(kit);
  }
}
