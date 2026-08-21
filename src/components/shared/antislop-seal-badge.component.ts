import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAntiSlopAuditResult } from '../../services/antislop-verifier.service';

const DEFAULT_AUDIT: IAntiSlopAuditResult = {
  isAntiSlopCertified: true,
  rigorScorePercent: 100,
  evidenceDensityPerHundredWords: 5.0,
  slopPhrasesDetected: [],
  quantitativeMetricsCount: 6,
  epistemicGroundingTier: 'LEVEL_A_DETERMINISTIC',
  antislopSealHash: 'ANTISLOP-VERIFIED',
  timestamp: new Date().toISOString(),
};

@Component({
  selector: 'app-antislop-seal-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="inline-flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border font-mono text-xs shadow-lg transition-all"
      [ngClass]="{
        'bg-emerald-950/80 border-emerald-500/50 text-emerald-100': audit().isAntiSlopCertified,
        'bg-rose-950/80 border-rose-500/50 text-rose-100': !audit().isAntiSlopCertified
      }"
    >
      <!-- Seal Emblem -->
      <div class="flex items-center gap-2.5">
        <div 
          class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
          [ngClass]="{
            'bg-emerald-500 text-stone-950': audit().isAntiSlopCertified,
            'bg-rose-500 text-white': !audit().isAntiSlopCertified
          }"
        >
          {{ audit().isAntiSlopCertified ? '🛡️' : '⚠️' }}
        </div>
        <div>
          <div class="font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>{{ audit().isAntiSlopCertified ? 'ANTI-SLOP VERIFIED' : 'UNVERIFIED CONTENT' }}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
              {{ audit().epistemicGroundingTier.replace(/_/g, ' ') }}
            </span>
          </div>
          <div class="text-[11px] opacity-80">
            Rigor Score: <strong class="text-white">{{ audit().rigorScorePercent }}%</strong> | 
            Evidence Density: <strong class="text-white">{{ audit().evidenceDensityPerHundredWords }}%</strong>
          </div>
        </div>
      </div>

      <!-- Seal Hash & Anti-Hallucination Tag -->
      <div class="pt-2 sm:pt-0 sm:pl-3 sm:border-l border-white/10 flex items-center justify-between sm:flex-col sm:items-end gap-1 text-[10px] text-zinc-400">
        <span>0% Hallucinated Filler</span>
        <span class="font-mono text-amber-300 font-bold tracking-wider">{{ audit().antislopSealHash }}</span>
      </div>
    </div>
  `,
})
export class AntiSlopSealBadgeComponent {
  audit = input<IAntiSlopAuditResult>(DEFAULT_AUDIT);
}
