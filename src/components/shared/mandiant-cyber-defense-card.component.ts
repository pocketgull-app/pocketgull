import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MandiantClinicalDefenseService, IMandiantThreatActor } from '../../services/mandiant-clinical-defense.service';

@Component({
  selector: 'app-mandiant-cyber-defense-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-slate-950/90 backdrop-blur-xl border border-red-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl font-sans text-zinc-100 transition-all">
      
      <!-- Top Header & Posture Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-red-900/30 pb-4 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-2xl shadow-lg shadow-red-950/50">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-zinc-50">
                Google Mandiant Threat Intelligence & Clinical Cyber-Defense
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-red-950 text-red-400 border border-red-800/80">
                M-Trends Defense Suite
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Adversary Group Profiling, MITRE ATLAS AI Hardening, and Automated DFIR Incident Containment
            </p>
          </div>
        </div>

        <!-- System Integrity Posture Indicator -->
        <div class="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800 font-mono text-xs">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase font-bold text-zinc-500">System Integrity</span>
            <span class="text-emerald-400 font-black text-sm">{{ posture().systemIntegrityScore }}%</span>
          </div>
          <div class="h-6 w-px bg-zinc-800"></div>
          <div class="flex flex-col">
            <span class="text-[9px] uppercase font-bold text-zinc-500">Threat Posture</span>
            <span [class.text-emerald-400]="posture().threatLevel === 'DEFCON_4_GUARDED'"
                  [class.text-red-400]="posture().threatLevel === 'DEFCON_1_CRITICAL'"
                  class="font-black">
              {{ posture().threatLevel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div class="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-xs font-mono">
          <button (click)="activeTab.set('THREAT_ACTORS')"
                  [class.bg-red-600]="activeTab() === 'THREAT_ACTORS'"
                  [class.text-white]="activeTab() === 'THREAT_ACTORS'"
                  [class.text-zinc-400]="activeTab() !== 'THREAT_ACTORS'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            🎯 Threat Actors ({{ threatActors().length }})
          </button>
          <button (click)="activeTab.set('MITRE_ATLAS')"
                  [class.bg-red-600]="activeTab() === 'MITRE_ATLAS'"
                  [class.text-white]="activeTab() === 'MITRE_ATLAS'"
                  [class.text-zinc-400]="activeTab() !== 'MITRE_ATLAS'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            🧠 MITRE ATLAS (AI Defense)
          </button>
          <button (click)="activeTab.set('DFIR_LOCKER')"
                  [class.bg-red-600]="activeTab() === 'DFIR_LOCKER'"
                  [class.text-white]="activeTab() === 'DFIR_LOCKER'"
                  [class.text-zinc-400]="activeTab() !== 'DFIR_LOCKER'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer border-0">
            📂 DFIR Evidence Locker
          </button>
        </div>

        <!-- Emergency Containment Protocol Button -->
        <div>
          @if (!service.isContainmentModeActive()) {
            <button (click)="triggerEmergencyLockdown()"
                    class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition cursor-pointer flex items-center gap-2">
              <span>🚨</span> Trigger Zero-Trust Containment
            </button>
          } @else {
            <button (click)="service.resetContainment()"
                    class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-500 transition cursor-pointer flex items-center gap-2 animate-pulse">
              <span>✅</span> Containment Active — Reset Defenses
            </button>
          }
        </div>
      </div>

      <!-- Tab 1: Threat Actors Matrix -->
      @if (activeTab() === 'THREAT_ACTORS') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (actor of threatActors(); track actor.actorId) {
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-red-500/40 transition flex flex-col justify-between gap-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900">
                    {{ actor.actorId }}
                  </span>
                  <span class="text-xs font-mono font-black text-rose-400">Risk: {{ actor.riskScore }}/100</span>
                </div>
                
                <h4 class="text-sm font-bold text-zinc-100">{{ actor.name }}</h4>
                <div class="text-[10px] text-zinc-400 font-mono mb-2">Aliases: {{ actor.aliases.join(', ') }}</div>
                
                <p class="text-xs text-zinc-300 leading-relaxed mb-3">
                  {{ actor.mandiantThreatDescription }}
                </p>
              </div>

              <div class="space-y-2 border-t border-zinc-800/80 pt-2">
                <div>
                  <span class="text-[9px] uppercase font-bold text-zinc-500">Targeted Health Assets</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (asset of actor.targetAssets; track asset) {
                      <span class="px-1.5 py-0.5 text-[9px] rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        {{ asset }}
                      </span>
                    }
                  </div>
                </div>

                <div>
                  <span class="text-[9px] uppercase font-bold text-zinc-500">MITRE ATT&CK TTPs</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (ttp of actor.mitreAttAndCkTechniques; track ttp) {
                      <span class="px-1.5 py-0.5 text-[9px] rounded bg-red-950/40 text-red-300 border border-red-900/40 font-mono">
                        {{ ttp }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 2: MITRE ATLAS AI Defense Matrix -->
      @if (activeTab() === 'MITRE_ATLAS') {
        <div class="space-y-3">
          @for (tactic of atlasTactics(); track tactic.tacticId) {
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {{ tactic.mitreAtlasId }}
                  </span>
                  <span class="text-sm font-bold text-zinc-100">{{ tactic.tacticName }}</span>
                </div>
                <p class="text-xs text-zinc-300">
                  <strong class="text-rose-400">Clinical Threat:</strong> {{ tactic.clinicalThreatVector }}
                </p>
                <p class="text-xs text-emerald-300/90 font-mono">
                  <strong>Mandiant Rule:</strong> {{ tactic.mandiantDefenseRule }}
                </p>
              </div>

              <span class="px-3 py-1 text-xs font-black font-mono uppercase rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                🛡️ {{ tactic.countermeasureStatus }}
              </span>
            </div>
          }
        </div>
      }

      <!-- Tab 3: DFIR Forensic Evidence Locker -->
      @if (activeTab() === 'DFIR_LOCKER') {
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
            <span>Immutable Forensic Audit Ledger (HHS 405(d) HICP Standard)</span>
            <span class="text-emerald-400 font-bold">SHA-256 Validated</span>
          </div>

          @for (snapshot of forensicSnapshots(); track snapshot.snapshotId) {
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-zinc-200">{{ snapshot.snapshotId }}</span>
                  <span [class.bg-rose-950]="snapshot.severity === 'CRITICAL'"
                        [class.text-rose-400]="snapshot.severity === 'CRITICAL'"
                        [class.bg-amber-950]="snapshot.severity === 'MEDIUM'"
                        [class.text-amber-400]="snapshot.severity === 'MEDIUM'"
                        [class.bg-blue-950]="snapshot.severity === 'INFO'"
                        [class.text-blue-400]="snapshot.severity === 'INFO'"
                        class="px-2 py-0.5 text-[9px] font-black uppercase rounded border border-zinc-700">
                    {{ snapshot.severity }}
                  </span>
                  <span class="text-[10px] text-zinc-500 font-mono">{{ snapshot.timestamp }}</span>
                </div>
                <div class="text-xs text-zinc-300 font-medium">
                  {{ snapshot.containmentApplied }}
                </div>
                <div class="text-[10px] text-zinc-400 font-mono">
                  {{ snapshot.hhs405dAlignment }}
                </div>
              </div>

              <div class="font-mono text-[9px] text-zinc-500 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800 break-all max-w-xs">
                {{ snapshot.evidencePayloadHash }}
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class MandiantCyberDefenseCardComponent {
  public service = inject(MandiantClinicalDefenseService);

  public readonly activeTab = signal<'THREAT_ACTORS' | 'MITRE_ATLAS' | 'DFIR_LOCKER'>('THREAT_ACTORS');
  public readonly posture = this.service.defensePosture;
  public readonly threatActors = this.service.threatActors;
  public readonly atlasTactics = this.service.atlasTactics;
  public readonly forensicSnapshots = this.service.forensicSnapshots;

  public triggerEmergencyLockdown(): void {
    this.service.triggerEmergencyContainment();
    this.activeTab.set('DFIR_LOCKER');
  }
}
