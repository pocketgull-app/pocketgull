import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalDefenseGuardService, IClinicalSecurityControl } from '../../services/clinical-defense-guard.service';

@Component({
  selector: 'app-clinical-defense-guard-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-slate-950/90 backdrop-blur-xl border border-teal-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl font-sans text-zinc-100 transition-all">
      
      <!-- Top Header & Posture Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-teal-900/30 pb-4 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-teal-600/10 border border-teal-500/30 flex items-center justify-center text-2xl shadow-lg shadow-teal-950/50">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-zinc-50">
                Zero-Trust Security &amp; Compliance Safeguards
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-teal-950 text-teal-400 border border-teal-800/80">
                NIST SP 800-207 &amp; HHS 405(d)
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Technical Safeguards, Cryptographic Provenance, OWASP LLM Hardening &amp; Dual-Custody Clinical Governance
            </p>
          </div>
        </div>

        <!-- System Integrity Posture Indicator -->
        <div class="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800 font-mono text-xs">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase font-bold text-zinc-500">Security Score</span>
            <span class="text-emerald-400 font-black text-sm">{{ posture().systemIntegrityScore }}%</span>
          </div>
          <div class="h-6 w-px bg-zinc-800"></div>
          <div class="flex flex-col">
            <span class="text-[9px] uppercase font-bold text-zinc-500">Defense Posture</span>
            <span class="text-teal-400 font-black">
              {{ posture().threatLevel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div class="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-xs font-mono">
          <button (click)="activeTab.set('SECURITY_CONTROLS')"
                  [class.bg-teal-600]="activeTab() === 'SECURITY_CONTROLS'"
                  [class.text-white]="activeTab() === 'SECURITY_CONTROLS'"
                  [class.text-zinc-400]="activeTab() !== 'SECURITY_CONTROLS'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            🔒 Compliance Controls ({{ controls().length }})
          </button>
          <button (click)="activeTab.set('MITRE_ATLAS')"
                  [class.bg-teal-600]="activeTab() === 'MITRE_ATLAS'"
                  [class.text-white]="activeTab() === 'MITRE_ATLAS'"
                  [class.text-zinc-400]="activeTab() !== 'MITRE_ATLAS'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            🧠 OWASP &amp; ATLAS AI Safeguards
          </button>
          <button (click)="activeTab.set('DFIR_LOCKER')"
                  [class.bg-teal-600]="activeTab() === 'DFIR_LOCKER'"
                  [class.text-white]="activeTab() === 'DFIR_LOCKER'"
                  [class.text-zinc-400]="activeTab() !== 'DFIR_LOCKER'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            📋 Cryptographic Audit Trail
          </button>
        </div>

        <!-- Dual Custody Status Badge -->
        <div class="flex items-center gap-2 text-xs font-mono bg-teal-950/40 text-teal-300 border border-teal-800/50 px-3 py-1 rounded-xl">
          <span>⚖️</span>
          <span>Dual-Custody Active (&ge; \${{ service.dualCustodyThresholdUsd() }})</span>
        </div>
      </div>

      <!-- Tab 1: Compliance Controls View -->
      @if (activeTab() === 'SECURITY_CONTROLS') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (ctrl of controls(); track ctrl.controlId) {
            <div class="bg-zinc-900/60 border border-zinc-800/80 hover:border-teal-700/60 rounded-2xl p-4 transition flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono px-2 py-0.5 rounded-md bg-teal-950 text-teal-400 border border-teal-800 font-bold">
                      {{ ctrl.controlId }}
                    </span>
                    <span class="text-xs font-semibold text-zinc-300">
                      {{ ctrl.name }}
                    </span>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                    {{ ctrl.status }}
                  </span>
                </div>

                <p class="text-xs text-zinc-400 leading-relaxed mb-3">
                  {{ ctrl.complianceDescription }}
                </p>

                <div class="mb-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60 text-[11px] font-mono text-zinc-300">
                  <strong class="text-teal-400">Verification:</strong> {{ ctrl.verificationMechanism }}
                </div>
              </div>

              <div class="flex flex-wrap gap-1">
                @for (asset of ctrl.targetAssets; track asset) {
                  <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    {{ asset }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 2: MITRE ATLAS AI Safeguards View -->
      @if (activeTab() === 'MITRE_ATLAS') {
        <div class="space-y-3">
          @for (tactic of atlasTactics(); track tactic.tacticId) {
            <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                    {{ tactic.mitreAtlasId }}
                  </span>
                  <h4 class="text-sm font-bold text-zinc-100">{{ tactic.tacticName }}</h4>
                </div>
                <p class="text-xs text-zinc-400 mb-2">
                  <strong class="text-zinc-300">Target Vector:</strong> {{ tactic.clinicalThreatVector }}
                </p>
                <p class="text-xs text-teal-300 font-mono bg-teal-950/30 p-2 rounded-lg border border-teal-900/40">
                  <strong>Safeguard Rule:</strong> {{ tactic.defenseRule }}
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span class="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ✓ {{ tactic.countermeasureStatus }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 3: Cryptographic Audit Trail -->
      @if (activeTab() === 'DFIR_LOCKER') {
        <div class="space-y-3">
          @for (snap of forensicSnapshots(); track snap.snapshotId) {
            <div class="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-teal-400">{{ snap.snapshotId }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                    {{ snap.eventCategory }}
                  </span>
                </div>
                <span class="text-[11px] font-mono text-zinc-500">{{ snap.timestamp }}</span>
              </div>

              <p class="text-xs text-zinc-300 font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                {{ snap.containmentApplied }}
              </p>

              <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
                <span>Aligned: {{ snap.hhs405dAlignment }}</span>
                <span class="text-zinc-500 truncate max-w-xs">Hash: {{ snap.evidencePayloadHash }}</span>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class ClinicalDefenseGuardCardComponent {
  public service = inject(ClinicalDefenseGuardService);

  public activeTab = signal<'SECURITY_CONTROLS' | 'MITRE_ATLAS' | 'DFIR_LOCKER'>('SECURITY_CONTROLS');

  public controls = this.service.securityControls;
  public atlasTactics = this.service.atlasTactics;
  public forensicSnapshots = this.service.forensicSnapshots;
  public posture = this.service.defensePosture;
}

// Backwards-compatible export alias
export { ClinicalDefenseGuardCardComponent as MandiantCyberDefenseCardComponent };
