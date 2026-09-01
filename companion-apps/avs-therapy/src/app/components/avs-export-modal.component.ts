import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvsSessionScribeService } from '../services/avs-session-scribe.service';

@Component({
  selector: 'app-avs-export-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="relative w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-5">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-black text-zinc-100 uppercase tracking-wider">Clinical AVS Scribe & FHIR R4 Export</h3>
              <p class="text-[11px] text-zinc-400">Gemma 4 Edge AI Vocal Biomarker & Autonomic Report</p>
            </div>
          </div>

          <button (click)="close.emit()" class="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Vocal Biomarker Pre/Post Comparison Grid -->
        <div class="grid grid-cols-2 gap-3 p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Pre-Session Vocal Stress</div>
            <div class="text-lg font-black text-rose-400 font-mono mt-0.5">
              {{ scribe.preSessionVocal().vocalArousalScore }} <span class="text-xs text-zinc-500">/ 100</span>
            </div>
            <div class="text-[9px] text-zinc-500 mt-1">Jitter: {{ scribe.preSessionVocal().vocalJitterPct }}% · F0: {{ scribe.preSessionVocal().f0FundamentalFrequencyHz }} Hz</div>
          </div>

          <div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Post-Session Autonomic State</div>
            <div class="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {{ scribe.postSessionVocal().vocalArousalScore }} <span class="text-xs text-zinc-500">/ 100</span>
              <span class="text-xs text-emerald-400 ml-1.5">(-{{ scribe.stressReductionPct() }}%)</span>
            </div>
            <div class="text-[9px] text-zinc-500 mt-1">Jitter: {{ scribe.postSessionVocal().vocalJitterPct }}% · F0: {{ scribe.postSessionVocal().f0FundamentalFrequencyHz }} Hz</div>
          </div>
        </div>

        <!-- Generated Clinical Summary -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Clinical Narrative Summary</label>
          <div class="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
            {{ scribe.generatedClinicalNotes() }}
          </div>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer">
            Dismiss
          </button>

          <button (click)="downloadFhir()"
                  class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download FHIR R4 Bundle (.json)
          </button>
        </div>
      </div>
    </div>
  `
})
export class AvsExportModalComponent {
  readonly scribe = inject(AvsSessionScribeService);
  @Output() close = new EventEmitter<void>();

  downloadFhir(): void {
    this.scribe.downloadFhirJson();
  }
}
