import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

@Component({
  selector: 'app-functional-circadian-synergy-bridge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl font-sans text-zinc-100 relative overflow-hidden my-6">
      <!-- Glow ambient backdrop -->
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"></span>
            <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2 font-mono">
              <span>🔀</span> Functional-Circadian Cross-Lens Synergy Engine
            </h3>
            <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
              IFM 7-Node × SCN Diurnal Cross-Talk
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Evaluates bi-directional feedback between suprachiasmatic nucleus (SCN) circadian rhythms and systemic mucosal & inflammatory degradation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div class="px-3.5 py-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 font-mono">
            <span class="text-xs text-zinc-400">Synergy Burden:</span>
            <span class="text-sm font-black" [ngClass]="{
              'text-emerald-400': synergy().score < 30,
              'text-amber-400': synergy().score >= 30 && synergy().score < 60,
              'text-rose-400': synergy().score >= 60
            }">{{ synergy().score }}/100</span>
          </div>
        </div>
      </div>

      <!-- Main Dual Telemetry & Synergy Matrix -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10">
        
        <!-- 1. Inflammatory Cascade Input -->
        <div class="p-5 bg-zinc-900/80 rounded-2xl border border-rose-500/20 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Systemic Inflammatory Node</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                IFM Matrix
              </span>
            </div>
            <div class="flex items-baseline gap-2 mb-2 font-mono">
              <span class="text-3xl font-black text-rose-400">{{ fmTelemetry().inflammatoryScore }}</span>
              <span class="text-xs text-zinc-500">/ 100 hs-CRP Index</span>
            </div>
            <div class="space-y-1.5 text-xs text-zinc-300 font-mono">
              <div class="flex justify-between">
                <span class="text-zinc-500">hs-CRP Level:</span>
                <span class="font-bold text-rose-300">{{ fmTelemetry().hsCrpEstimate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Mucosal Integrity:</span>
                <span class="font-bold text-emerald-400">{{ fmTelemetry().mucosalBarrierIntegrity }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Mito Reserve:</span>
                <span class="font-bold text-amber-300">{{ fmTelemetry().mitochondrialReserve }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Circadian Master Clock SCN Input -->
        <div class="p-5 bg-zinc-900/80 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Circadian SCN Clock</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Diurnal Rhythm
              </span>
            </div>
            <div class="flex items-baseline gap-2 mb-2 font-mono">
              <span class="text-3xl font-black text-amber-400">{{ chronoTelemetry().circadianDisruptionIndex }}</span>
              <span class="text-xs text-zinc-500">/ 100 Disruption Index</span>
            </div>
            <div class="space-y-1.5 text-xs text-zinc-300 font-mono">
              <div class="flex justify-between">
                <span class="text-zinc-500">Current Phase:</span>
                <span class="font-bold text-amber-300">{{ chronoTelemetry().scnPhase }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">BMAL1 Expression:</span>
                <span class="font-bold text-amber-400">{{ chronoTelemetry().bmal1ExpressionPct }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">TRF Window:</span>
                <span class="font-bold text-emerald-400">{{ chronoTelemetry().trfWindowHours }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Dynamic Cross-Lens Synthesis & Action Protocol -->
        <div class="p-5 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-emerald-950/40 rounded-2xl border border-amber-500/40 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧬</span> Synergy Status
              </span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                {{ synergy().status }}
              </span>
            </div>
            
            <p class="text-xs text-zinc-300 leading-relaxed mb-4">
              @if (synergy().isCascadeRisk) {
                <span class="text-rose-300 font-semibold">Alert:</span> Circadian desynchronization is exacerbating mucosal gut lining permeability and blunting nocturnal growth hormone repair cycles.
              } @else {
                <span class="text-emerald-300 font-semibold">Optimal Alignment:</span> SCN circadian pacemaking is actively suppressing systemic NF-κB inflammatory signaling.
              }
            </p>
          </div>

          <div class="pt-3 border-t border-zinc-800/80 flex flex-wrap gap-2">
            <button (click)="prescribeVagalTool()" type="button"
                    class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1">
              <span>🫁</span> Prescribe Vagal HRV
            </button>
            <button (click)="prescribeMealSync()" type="button"
                    class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1">
              <span>🥗</span> Sync Meal Window
            </button>
          </div>
        </div>

      </div>

      <!-- Bi-directional Biological Feedback Loop Visualization -->
      <div class="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/80 relative z-10">
        <h4 class="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <span>🔄</span> Bi-Directional Biological Feedback Pathway
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div class="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span class="text-[10px] text-amber-400 font-bold uppercase block mb-1">1. Master SCN Clock</span>
            <p class="text-zinc-400 text-[11px]">Light & meal cues synchronize BMAL1 / PER2 transcriptional feedback loops in the hypothalamus.</p>
          </div>
          <div class="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span class="text-[10px] text-emerald-400 font-bold uppercase block mb-1">2. Peripheral Barrier Repair</span>
            <p class="text-zinc-400 text-[11px]">Nocturnal melatonin & growth hormone regulate intestinal mucosal tight junction (Zonulin) integrity.</p>
          </div>
          <div class="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span class="text-[10px] text-rose-400 font-bold uppercase block mb-1">3. Inflammatory Resolution</span>
            <p class="text-zinc-400 text-[11px]">Reduced TNF-α & IL-6 cascades protect mitochondrial cristae structure and ATP generation capacity.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FunctionalCircadianSynergyBridgeComponent {
  private patientState = inject(PatientStateService);

  fmTelemetry = computed(() => this.patientState.functionalMedicineTelemetry());
  chronoTelemetry = computed(() => this.patientState.chronobiologyTelemetry());
  synergy = computed(() => this.patientState.functionalCircadianSynergy());

  prescribeVagalTool() {
    this.patientState.cycleToolState('vagal');
  }

  prescribeMealSync() {
    this.patientState.dietaryProtocol.set('Time-Restricted Feeding (10:00 - 18:00)');
  }
}
