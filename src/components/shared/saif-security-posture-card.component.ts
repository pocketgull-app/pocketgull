import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSaifClinicalDefenseService, ISaifPillarStatus, ISaifThreatEvent } from '../../services/google-saif-clinical-defense.service';

@Component({
  selector: 'app-saif-security-posture-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 sm:p-6 rounded-2xl bg-zinc-950/95 border border-emerald-500/30 text-zinc-100 shadow-2xl backdrop-blur-md font-sans space-y-6">
      
      <!-- Top Title & Overall Posture Gauge -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-xl shadow-md">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-extrabold uppercase tracking-wide text-emerald-200 font-mono">
                Google SAIF (Secure AI Framework) Posture HUD
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                NIST AI RMF &amp; OWASP LLM01-10
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              6-Pillar automated clinical defense, indirect injection filtering &amp; HIPAA Safe Harbor redaction
            </p>
          </div>
        </div>

        <!-- SAIF Security Posture Score -->
        <div class="flex items-center gap-3">
          <div class="text-right font-mono">
            <span class="text-[10px] uppercase font-bold text-zinc-400 block">Posture Index</span>
            <span class="text-xl font-black text-emerald-400 font-mono">{{ saifService.overallPostureScore() }}%</span>
          </div>
          <button type="button" (click)="refreshAudit()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
            <span>🔄</span> Audit Now
          </button>
        </div>
      </div>

      <!-- 6 SAIF Pillars Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        @for (pillar of saifService.pillarStatuses(); track pillar.id) {
          <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-2.5">
            
            <div class="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <span class="font-bold text-zinc-200 text-[11px] truncate uppercase block" [title]="pillar.name">
                {{ pillar.shortTitle }}
              </span>
              <span class="px-2 py-0.5 rounded text-[9.5px] font-black uppercase"
                    [class.bg-emerald-500\/20]="pillar.complianceLevel === 'COMPLIANT'"
                    [class.text-emerald-300]="pillar.complianceLevel === 'COMPLIANT'"
                    [class.border]="true"
                    [class.border-emerald-500\/40]="pillar.complianceLevel === 'COMPLIANT'"
                    [class.bg-sky-500\/20]="pillar.complianceLevel === 'ACTIVE_DEFENSE'"
                    [class.text-sky-300]="pillar.complianceLevel === 'ACTIVE_DEFENSE'"
                    [class.border-sky-500\/40]="pillar.complianceLevel === 'ACTIVE_DEFENSE'"
                    [class.bg-purple-500\/20]="pillar.complianceLevel === 'ADAPTIVE_MITIGATION'"
                    [class.text-purple-300]="pillar.complianceLevel === 'ADAPTIVE_MITIGATION'"
                    [class.border-purple-500\/40]="pillar.complianceLevel === 'ADAPTIVE_MITIGATION'">
                {{ pillar.score }}% {{ pillar.complianceLevel }}
              </span>
            </div>

            <p class="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {{ pillar.description }}
            </p>

            <div class="space-y-1 pt-1">
              <span class="text-[9.5px] font-bold text-zinc-500 uppercase block">Active Controls:</span>
              <div class="flex flex-wrap gap-1">
                @for (control of pillar.activeControls; track control) {
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    {{ control }}
                  </span>
                }
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Real-Time Threat Interception Log Feed -->
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 font-mono">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">⚡</span>
            <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Live Threat Interception &amp; Sanitization Log
            </h4>
          </div>
          <span class="text-[10px] text-zinc-500">
            {{ saifService.threatHistory().length }} Interceptions Logged
          </span>
        </div>

        @if (saifService.threatHistory().length === 0) {
          <div class="p-3 rounded-lg bg-zinc-950/60 border border-zinc-850 text-center text-xs text-zinc-400 font-sans">
            ✅ No active threats detected in current session. All prompt egress and ingress streams verified.
          </div>
        } @else {
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            @for (event of saifService.threatHistory(); track event.id) {
              <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                        [class.bg-red-500\/20]="event.severity === 'HIGH' || event.severity === 'CRITICAL'"
                        [class.text-red-400]="event.severity === 'HIGH' || event.severity === 'CRITICAL'"
                        [class.bg-amber-500\/20]="event.severity === 'MEDIUM'"
                        [class.text-amber-400]="event.severity === 'MEDIUM'">
                    {{ event.threatType }}
                  </span>
                  <span class="text-zinc-300 text-[11px] font-sans truncate max-w-sm">
                    {{ event.rawPayloadSnippet }}
                  </span>
                </div>
                <span class="text-[10px] text-emerald-400">
                  {{ event.mitigationAction }}
                </span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class SaifSecurityPostureCardComponent {
  readonly saifService = inject(GoogleSaifClinicalDefenseService);

  public refreshAudit(): void {
    this.saifService.generatePostureAudit();
  }
}
