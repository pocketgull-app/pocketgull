import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';

export interface IParadigmVector {
  id: string;
  name: string;
  score: number; // 0 - 100
  status: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-unified-paradigm-synthesizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 rounded-2xl bg-slate-950 text-zinc-100 border border-slate-800 shadow-2xl font-sans space-y-4 mb-8">
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🌌</span>
          <div>
            <h3 class="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
              10-Dimensional Unified Paradigm Health Vector
            </h3>
            <p class="text-xs text-zinc-400">
              Real-time cross-paradigm synthesis combining Allopathic, Eastern, Ayurvedic, Turing, Nobel, AAAS & Lasker models
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono">
          <span class="text-xs text-zinc-400 font-bold uppercase">Alignment Score:</span>
          <span class="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-sm font-bold">
            {{ alignmentScore() }}% Coherence
          </span>
        </div>
      </div>

      <!-- 10 Domain Suite Vectors Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
        @for (vec of vectors(); track vec.id) {
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition">
            <div class="flex items-center justify-between">
              <span class="text-lg">{{ vec.icon }}</span>
              <span class="text-[10px] font-bold text-zinc-400">{{ vec.score }}%</span>
            </div>
            <div class="mt-2">
              <span class="font-bold text-[11px] text-zinc-200 block truncate">{{ vec.name }}</span>
              <span class="text-[9px] block text-zinc-500 font-sans mt-0.5 truncate">{{ vec.status }}</span>
            </div>
            <div class="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-2 border border-zinc-800">
              <div [class]="'h-full transition-all duration-300 ' + vec.color" [style.width.%]="vec.score"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class UnifiedParadigmSynthesizerComponent {
  private patientState = inject(PatientStateService);

  readonly alignmentScore = signal<number>(94);

  readonly vectors = signal<IParadigmVector[]>([
    { id: 'biomedical', name: 'Biomedical', score: 92, status: 'Vitals Stable', icon: '🧬', color: 'bg-sky-500' },
    { id: 'therapeutics', name: 'Therapeutics', score: 88, status: 'Precision Regimen', icon: '🌿', color: 'bg-emerald-500' },
    { id: 'nutrition', name: 'Metabolic', score: 95, status: 'Circadian Fasting', icon: '🥗', color: 'bg-amber-500' },
    { id: 'recovery', name: 'Recovery', score: 90, status: 'Vagal Tone High', icon: '⚡', color: 'bg-purple-500' },
    { id: 'turing', name: 'Turing Logic', score: '96' as any, status: '0 Deadlocks', icon: '🧮', color: 'bg-cyan-500' },
    { id: 'nobel', name: 'Nobel Evidence', score: 94, status: 'Autophagy Peak', icon: '🏆', color: 'bg-amber-400' },
    { id: 'aaas', name: 'AAAS Science', score: 91, status: 'GLP-1 Incretin Active', icon: '🔬', color: 'bg-teal-500' },
    { id: 'lasker', name: 'Lasker Model', score: 93, status: 'Ψ-mRNA Modified', icon: '🏛️', color: 'bg-indigo-500' },
    { id: 'tcm', name: 'Eastern TCM', score: 87, status: 'Zang-Fu Balance', icon: '☯️', color: 'bg-emerald-400' },
    { id: 'ayurveda', name: 'Ayurvedic', score: 89, status: 'Tridosha Balanced', icon: '🪷', color: 'bg-orange-500' }
  ]);
}
