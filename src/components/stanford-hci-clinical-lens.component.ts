import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StanfordHciClinicalLensService } from '../services/stanford-hci-clinical-lens.service';

@Component({
  selector: 'app-stanford-hci-clinical-lens',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-amber-900/40 text-gray-100 shadow-2xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌲</span>
            <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400">
              Stanford HCI Human-Centered AI Lens
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Cognitive Ergonomics
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Applying Stanford HCI Generative Agents, Mixed-Initiative UI, and Artful Design to Clinical Workflows.
          </p>
        </div>
      </div>

      <!-- Principle Selector Tabs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        @for (item of hci.hciPrinciples(); track item.id; let idx = $index) {
          <button 
            (click)="hci.selectPrinciple(idx)"
            [class.border-amber-500]="hci.activePrincipleIndex() === idx"
            [class.bg-amber-950\/30]="hci.activePrincipleIndex() === idx"
            [class.bg-zinc-900\/80]="hci.activePrincipleIndex() !== idx"
            class="p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 text-left transition">
            <div class="text-xs font-bold text-amber-400 mb-1">{{ item.stanfordLab }}</div>
            <div class="text-sm font-semibold text-gray-200 mb-2">{{ item.name }}</div>
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Cognitive Load: -{{ item.cognitiveLoadReductionPct }}%</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[9px] text-amber-300">{{ item.userAgencyLevel }}</span>
            </div>
          </button>
        }
      </div>

      <!-- Active Principle Detail -->
      @let active = hci.currentPrinciple();
      <div class="p-5 bg-amber-950/20 rounded-xl border border-amber-800/40">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-amber-300">Active Stanford HCI Design Pattern:</span>
          <span class="text-xs font-mono text-emerald-400 font-bold">100% Clinician Sovereignty Preserved</span>
        </div>

        <h3 class="text-base font-bold text-gray-100 mb-2">{{ active.name }}</h3>
        <p class="text-xs text-gray-300 leading-relaxed bg-black/60 p-3 rounded-lg border border-zinc-800">
          {{ active.clinicalApplication }}
        </p>
      </div>
    </div>
  `
})
export class StanfordHciClinicalLensComponent {
  readonly hci = inject(StanfordHciClinicalLensService);
}
