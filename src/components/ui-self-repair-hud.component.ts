// SPDX-License-Identifier: Apache-2.0
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSelfRepairService } from '../services/ui-self-repair.service';

@Component({
  selector: 'app-ui-self-repair-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Telemetry Indicator Pill (Stealth-aware: hidden if stealthMode is active and health is 100% with 0 repairs) -->
    @if (!repairService.stealthMode() || metrics().healthScore < 100 || metrics().autoRepairsExecuted > 0 || repairService.isHudOpen()) {
      <div class="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button 
          type="button"
          (click)="repairService.toggleHud()"
          class="group flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer"
          [class.bg-emerald-950]="metrics().healthScore >= 90"
          [class.border-emerald-500]="metrics().healthScore >= 90"
          [class.text-emerald-200]="metrics().healthScore >= 90"
          [class.bg-amber-950]="metrics().healthScore >= 70 && metrics().healthScore < 90"
          [class.border-amber-500]="metrics().healthScore >= 70 && metrics().healthScore < 90"
          [class.text-amber-200]="metrics().healthScore >= 70 && metrics().healthScore < 90"
          [class.bg-rose-950]="metrics().healthScore < 70"
          [class.border-rose-500]="metrics().healthScore < 70"
          [class.text-rose-200]="metrics().healthScore < 70"
          title="UI Self-Repair & Telemetry Monitor (Background Sentinel)"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span 
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              [class.bg-emerald-400]="metrics().healthScore >= 90"
              [class.bg-amber-400]="metrics().healthScore >= 70 && metrics().healthScore < 90"
              [class.bg-rose-400]="metrics().healthScore < 70"
            ></span>
            <span 
              class="relative inline-flex rounded-full h-2.5 w-2.5"
              [class.bg-emerald-500]="metrics().healthScore >= 90"
              [class.bg-amber-500]="metrics().healthScore >= 70 && metrics().healthScore < 90"
              [class.bg-rose-500]="metrics().healthScore < 70"
            ></span>
          </span>

          <span class="text-xs font-mono font-bold tracking-tight">
            UI HEALTH {{ metrics().healthScore }}%
          </span>

          @if (metrics().autoRepairsExecuted > 0) {
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              +{{ metrics().autoRepairsExecuted }} REPAIRED
            </span>
          }
        </button>
      </div>
    }

    <!-- Diagnostic & Self-Repair Flyout Drawer -->
    @if (repairService.isHudOpen()) {
      <div 
        class="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 bg-[#0c0c10] border-l border-[#272732] shadow-2xl p-5 flex flex-col font-sans text-[#f4f4f5] animate-slide-left backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="UI Self-Repair Telemetry HUD"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#272732]">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-bold text-white tracking-wide uppercase font-mono">UI Self-Repair Engine</h2>
              <p class="text-xs text-zinc-400">Background Sentinel (Idle-Throttled)</p>
            </div>
          </div>
          <button 
            type="button" 
            (click)="repairService.toggleHud()" 
            class="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Metric Badges -->
        <div class="grid grid-cols-4 gap-2 my-4">
          <div class="p-2 rounded-lg bg-[#181820] border border-[#272732] text-center">
            <div class="text-[9px] text-zinc-400 font-mono">HEALTH</div>
            <div class="text-base font-bold font-mono" [class.text-emerald-400]="metrics().healthScore >= 90" [class.text-amber-400]="metrics().healthScore < 90">
              {{ metrics().healthScore }}%
            </div>
          </div>
          <div class="p-2 rounded-lg bg-[#181820] border border-[#272732] text-center">
            <div class="text-[9px] text-zinc-400 font-mono">LENSES</div>
            <div class="text-base font-bold font-mono text-teal-400">
              {{ metrics().lensRepairsExecuted }}
            </div>
          </div>
          <div class="p-2 rounded-lg bg-[#181820] border border-[#272732] text-center">
            <div class="text-[9px] text-zinc-400 font-mono">FRAMES</div>
            <div class="text-base font-bold font-mono text-sky-400">
              {{ metrics().frameRepairsExecuted }}
            </div>
          </div>
          <div class="p-2 rounded-lg bg-[#181820] border border-[#272732] text-center">
            <div class="text-[9px] text-zinc-400 font-mono">PATIENT/SYMPTOMS</div>
            <div class="text-base font-bold font-mono text-purple-400">
              {{ metrics().patientStateRepairsExecuted }}
            </div>
          </div>
        </div>

        <!-- Targeted Repair Action Bar -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <button 
            type="button"
            (click)="repairService.repairAllLensesAndFrames()"
            class="px-2.5 py-2 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>🔬</span>
            <span>3D Lenses</span>
          </button>
          <button 
            type="button"
            (click)="repairService.repairAllLensesAndFrames()"
            class="px-2.5 py-2 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>📊</span>
            <span>Frames</span>
          </button>
          <button 
            type="button"
            (click)="repairService.repairPatientStateAndSymptoms()"
            class="px-2.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>🩺</span>
            <span>Symptoms</span>
          </button>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-[#121217] border border-[#272732] mb-4 text-xs">
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer" title="Automatically patch detected anomalies">
              <input 
                type="checkbox" 
                [checked]="repairService.isAutoRepairEnabled()" 
                (change)="repairService.toggleAutoRepair()"
                class="sr-only peer"
              >
              <div class="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-500"></div>
              <span class="ml-2 text-zinc-300 font-medium">Auto-Repair</span>
            </label>

            <label class="relative inline-flex items-center cursor-pointer" title="Hide floating indicator during healthy operation">
              <input 
                type="checkbox" 
                [checked]="repairService.stealthMode()" 
                (change)="repairService.toggleStealthMode()"
                class="sr-only peer"
              >
              <div class="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
              <span class="ml-2 text-zinc-400 font-medium text-[11px]">Stealth</span>
            </label>
          </div>

          <div class="flex gap-1.5">
            <button 
              type="button" 
              (click)="repairService.runFullAudit()"
              [disabled]="repairService.isAuditing()"
              class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              @if (repairService.isAuditing()) {
                <span class="animate-spin text-teal-400">⟳</span> Auditing...
              } @else {
                <span>Audit Now</span>
              }
            </button>
            <button 
              type="button" 
              (click)="repairService.revertAllPatches()"
              class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 font-mono text-[11px] cursor-pointer"
              title="Flush and rollback all dynamic patches"
            >
              Rollback
            </button>
          </div>
        </div>

        <!-- Feed of Anomalies & Repairs -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div class="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
            Realtime Audit Log & Forensic Patches
          </div>

          @if (repairService.anomalies().length === 0) {
            <div class="text-center py-10 px-4 rounded-lg border border-dashed border-[#272732] text-zinc-500 text-xs">
              <svg class="w-8 h-8 mx-auto mb-2 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Zero layout, lens, frame, or patient state anomalies detected. Background sentinel idle.
            </div>
          }

          @for (anomaly of repairService.anomalies(); track anomaly.id) {
            <div 
              class="p-3 rounded-lg border text-xs bg-[#121217]"
              [class.border-emerald-900]="anomaly.repairAction?.applied"
              [class.border-amber-900]="!anomaly.repairAction?.applied && anomaly.severity === 'warning'"
              [class.border-rose-900]="!anomaly.repairAction?.applied && anomaly.severity === 'critical'"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span 
                  class="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded font-bold"
                  [class.bg-emerald-500/20]="anomaly.repairAction?.applied"
                  [class.text-emerald-400]="anomaly.repairAction?.applied"
                  [class.bg-purple-500/20]="!anomaly.repairAction?.applied && (anomaly.category === 'patient-state-corruption' || anomaly.category === 'symptom-stream-fault')"
                  [class.text-purple-400]="!anomaly.repairAction?.applied && (anomaly.category === 'patient-state-corruption' || anomaly.category === 'symptom-stream-fault')"
                  [class.bg-amber-500/20]="!anomaly.repairAction?.applied && anomaly.severity === 'warning' && anomaly.category !== 'patient-state-corruption' && anomaly.category !== 'symptom-stream-fault'"
                  [class.text-amber-400]="!anomaly.repairAction?.applied && anomaly.severity === 'warning' && anomaly.category !== 'patient-state-corruption' && anomaly.category !== 'symptom-stream-fault'"
                  [class.bg-rose-500/20]="!anomaly.repairAction?.applied && anomaly.severity === 'critical'"
                  [class.text-rose-400]="!anomaly.repairAction?.applied && anomaly.severity === 'critical'"
                >
                  {{ anomaly.category }}
                </span>
                <span class="text-zinc-500 font-mono text-[10px]">
                  {{ anomaly.timestamp | date:'HH:mm:ss' }}
                </span>
              </div>

              <div class="text-zinc-200 font-medium mb-1">
                {{ anomaly.description }}
              </div>

              <div class="text-[11px] font-mono text-zinc-400 truncate mb-2">
                Target: <span class="text-zinc-300">{{ anomaly.selector }}</span>
              </div>

              <!-- Repair Status Indicator -->
              @if (anomaly.repairAction?.applied) {
                <div class="mt-2 pt-2 border-t border-emerald-900/50 flex items-start gap-1.5 text-emerald-300">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-[11px] leading-tight">
                    {{ anomaly.repairAction?.description }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="pt-3 mt-3 border-t border-[#272732] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>PocketGull Background Sentinel v1.1</span>
          <button (click)="repairService.clearAnomalies()" class="hover:text-zinc-300 cursor-pointer">Clear Logs</button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slideLeft {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-left {
      animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class UiSelfRepairHudComponent {
  readonly repairService = inject(UiSelfRepairService);
  readonly metrics = this.repairService.healthMetrics;
}
