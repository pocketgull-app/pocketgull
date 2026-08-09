import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAvsAdjunct, ISessionRecommendation } from '../services/patient.types';

@Component({
  selector: 'app-lifestyle-adjunct-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border dark:border-emerald-500/15 bg-emerald-500/[0.02] dark:bg-emerald-950/10 overflow-hidden"
         [class.border-emerald-500/40]="adjunct"
         [class.border-emerald-500/20]="!adjunct">

      <div class="px-4 py-3 border-b border-emerald-500/15 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Lifestyle &amp; Beverage Adjuncts</span>
        </div>
        @if (adjunct) {
          <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold uppercase tracking-wider">
            {{ adjunct.recommendations.length }} suggestions
          </span>
        }
      </div>

      <div class="p-4 space-y-3">
        @if (adjunct) {
          <p class="text-[10px] text-zinc-400 italic leading-relaxed">{{ adjunct.clinician_note }}</p>
          @for (rec of adjunct.recommendations; track rec.title) {
            <div class="p-3 rounded-lg border" [class]="recCardClass(rec)">
              <div class="flex items-start gap-2.5">
                <span class="text-base leading-none mt-0.5">{{ rec.emoji }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-[10px] font-bold uppercase tracking-widest" [class]="recTitleClass(rec)">{{ rec.title }}</p>
                    @if (rec.avsAdjust) {
                      <span class="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold uppercase tracking-wider shrink-0">AVS adj.</span>
                    }
                  </div>
                  <p class="text-[10px] text-zinc-300 leading-relaxed whitespace-pre-line">{{ rec.detail }}</p>
                </div>
              </div>
            </div>
          }
        } @else {
          <button (click)="generate.emit()"
                  class="w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
            Scan Chart for Lifestyle Adjuncts
          </button>
          <p class="text-[9px] text-zinc-600 text-center leading-snug">
            Reads clinical notes &amp; medications for tea, beverage &amp; session timing recommendations.
          </p>
        }
      </div>
    </div>
  `
})
export class LifestyleAdjunctPanelComponent {
  @Input() adjunct: IAvsAdjunct | null = null;
  @Output() generate = new EventEmitter<void>();

  recCardClass(rec: ISessionRecommendation): string {
    const MAP: Record<string, string> = {
      'beverage':      'bg-emerald-500/[0.05] border-emerald-500/20',
      'caution':       'bg-amber-500/[0.05] border-amber-500/20',
      'avs-adjustment':'bg-violet-500/[0.05] border-violet-500/20',
      'timing':        'bg-blue-500/[0.05] border-blue-500/20',
      'wind-down':     'bg-indigo-500/[0.05] border-indigo-500/20',
    };
    return MAP[rec.category] ?? 'bg-zinc-800/40 border-zinc-700/40';
  }

  recTitleClass(rec: ISessionRecommendation): string {
    const MAP: Record<string, string> = {
      'beverage':      'text-emerald-400',
      'caution':       'text-amber-400',
      'avs-adjustment':'text-violet-400',
      'timing':        'text-blue-400',
      'wind-down':     'text-indigo-400',
    };
    return MAP[rec.category] ?? 'text-zinc-400';
  }
}
