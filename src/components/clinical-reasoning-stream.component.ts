import { Component, signal, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InteractionsProvider } from '../services/ai/interactions.provider';
import { ClinicalAiProviderRegistryService } from '../services/clinical-ai-provider-registry.service';

export interface IReasoningThoughtStep {
  id: string;
  phase: 'HYPOTHESIS' | 'FALSIFICATION' | 'ISMP_SAFETY' | 'SYNTHESIS';
  phaseTitle: string;
  thoughtSnippet: string;
  tokensConsumed: number;
  falsificationScore?: number;
  timestamp: string;
}

@Component({
  selector: 'app-clinical-reasoning-stream',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 font-sans" role="region" aria-label="Clinical AI Extended Reasoning Stream">
      <!-- Header HUD -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <svg class="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            @if (isReasoningActive()) {
              <span class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            }
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100">Interactions Reasoning Stream</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-teal-950/80 text-teal-300 border border-teal-800/50">
                Gemini 3.7 Flash
              </span>
            </div>
            <p class="text-xs text-zinc-400">Real-time differential logic & skeptical null-hypothesis falsification</p>
          </div>
        </div>

        <!-- Token Counter & Budget Controls -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-xs font-mono text-zinc-400 block">Reasoning Budget</span>
            <span class="text-sm font-mono font-bold text-teal-400 tabular-nums">{{ currentBudget() }} tokens</span>
          </div>
          <button
            type="button"
            (click)="toggleExpanded()"
            class="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-teal-400"
            [attr.aria-expanded]="isExpanded()"
            [attr.aria-label]="isExpanded() ? 'Collapse reasoning thought details' : 'Expand reasoning thought details'">
            {{ isExpanded() ? 'Hide Stream' : 'Inspect Thoughts' }}
          </button>
        </div>
      </div>

      <!-- Thinking Budget Preset Selector -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60">
        <span class="text-xs font-medium text-zinc-300">Acuity Calibration:</span>
        <div class="flex flex-wrap gap-2">
          @for (preset of budgetPresets; track preset.tokens) {
            <button
              type="button"
              (click)="setBudget(preset.tokens)"
              [class.bg-teal-600]="currentBudget() === preset.tokens"
              [class.text-white]="currentBudget() === preset.tokens"
              [class.bg-zinc-800]="currentBudget() !== preset.tokens"
              [class.text-zinc-300]="currentBudget() !== preset.tokens"
              class="min-h-[44px] px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-teal-700 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400"
              [attr.aria-pressed]="currentBudget() === preset.tokens">
              {{ preset.label }} ({{ preset.tokens }}t)
            </button>
          }
        </div>
      </div>

      <!-- 4-Phase Pipeline Status Badges -->
      <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div 
          [class.border-teal-500]="activePhase() === 'HYPOTHESIS'"
          [class.bg-teal-950/40]="activePhase() === 'HYPOTHESIS'"
          class="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 transition-colors">
          <span class="text-[10px] font-mono uppercase text-zinc-400 block">Phase 1</span>
          <span class="text-xs font-semibold text-zinc-200">Hypothesis Tree</span>
        </div>
        <div 
          [class.border-teal-500]="activePhase() === 'FALSIFICATION'"
          [class.bg-teal-950/40]="activePhase() === 'FALSIFICATION'"
          class="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 transition-colors">
          <span class="text-[10px] font-mono uppercase text-zinc-400 block">Phase 2</span>
          <span class="text-xs font-semibold text-zinc-200">Skeptical H₀ Test</span>
        </div>
        <div 
          [class.border-teal-500]="activePhase() === 'ISMP_SAFETY'"
          [class.bg-teal-950/40]="activePhase() === 'ISMP_SAFETY'"
          class="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 transition-colors">
          <span class="text-[10px] font-mono uppercase text-zinc-400 block">Phase 3</span>
          <span class="text-xs font-semibold text-zinc-200">ISMP / Rx Guard</span>
        </div>
        <div 
          [class.border-teal-500]="activePhase() === 'SYNTHESIS'"
          [class.bg-teal-950/40]="activePhase() === 'SYNTHESIS'"
          class="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 transition-colors">
          <span class="text-[10px] font-mono uppercase text-zinc-400 block">Phase 4</span>
          <span class="text-xs font-semibold text-zinc-200">Care Protocol</span>
        </div>
      </div>

      <!-- Expandable Reasoning Thoughts Stream -->
      @if (isExpanded()) {
        <div class="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar border-t border-zinc-800/80 pt-3" role="feed" aria-label="Reasoning thoughts stream">
          @if (thoughts().length === 0) {
            <div class="py-6 text-center text-zinc-400 text-xs italic">
              No active thought traces recorded. Trigger a consult or click "Simulate Reasoning Stream" below.
            </div>
          } @else {
            @for (thought of thoughts(); track thought.id) {
              <div class="rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3 text-xs">
                <div class="flex items-center justify-between text-zinc-400 font-mono text-[11px] mb-1.5">
                  <span class="font-semibold text-teal-300">[{{ thought.phaseTitle }}]</span>
                  <span class="tabular-nums text-zinc-500">{{ thought.timestamp }} · {{ thought.tokensConsumed }} tokens</span>
                </div>
                <p class="text-zinc-200 leading-relaxed">{{ thought.thoughtSnippet }}</p>
                @if (thought.falsificationScore !== undefined) {
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-[10px] font-mono text-zinc-400">Null-Hypothesis p-value:</span>
                    <span class="text-[11px] font-mono font-bold" [class.text-emerald-400]="thought.falsificationScore < 0.05" [class.text-amber-400]="thought.falsificationScore >= 0.05">
                      p = {{ thought.falsificationScore.toFixed(3) }} ({{ thought.falsificationScore < 0.05 ? 'H₀ Rejected / Significant' : 'H₀ Retained / Inconclusive' }})
                    </span>
                  </div>
                }
              </div>
            }
          }
        </div>

        <!-- Action Footer -->
        <div class="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            (click)="simulateReasoningStream()"
            class="min-h-[44px] px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-400">
            Simulate 4-Phase Reasoning Stream
          </button>
          <button
            type="button"
            (click)="clearThoughts()"
            class="min-h-[44px] px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400">
            Clear Stream
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(24, 24, 27, 0.5); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(63, 63, 70, 0.8); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 166, 0.6); }
  `]
})
export class ClinicalReasoningStreamComponent {
  private readonly interactionsProvider = inject(InteractionsProvider, { optional: true });
  private readonly registry = inject(ClinicalAiProviderRegistryService, { optional: true });

  @Input() patientId: string = 'ANON-7842';

  readonly isExpanded = signal<boolean>(true);
  readonly isReasoningActive = signal<boolean>(false);
  readonly activePhase = signal<'HYPOTHESIS' | 'FALSIFICATION' | 'ISMP_SAFETY' | 'SYNTHESIS'>('SYNTHESIS');
  readonly thoughts = signal<IReasoningThoughtStep[]>([]);

  readonly currentBudget = computed(() => {
    return this.interactionsProvider?.thinkingBudget() ?? 2048;
  });

  readonly budgetPresets = [
    { label: 'Routine', tokens: 0 },
    { label: 'Standard CDS', tokens: 1024 },
    { label: 'Complex Diagnostic', tokens: 2048 },
    { label: 'High Acuity / Rare', tokens: 4096 }
  ];

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  setBudget(budget: number): void {
    if (this.interactionsProvider) {
      this.interactionsProvider.setThinkingBudget(budget);
    }
  }

  clearThoughts(): void {
    this.thoughts.set([]);
    this.isReasoningActive.set(false);
  }

  simulateReasoningStream(): void {
    this.clearThoughts();
    this.isReasoningActive.set(true);
    this.activePhase.set('HYPOTHESIS');

    const sampleSteps: IReasoningThoughtStep[] = [
      {
        id: 't-1',
        phase: 'HYPOTHESIS',
        phaseTitle: 'Hypothesis Generation',
        thoughtSnippet: 'Evaluating patient biometrics (Elevated systolic BP 142 mmHg, HRV 28ms, hs-CRP 3.2 mg/L). Formulating differential matrix: Autonomic dysregulation vs secondary hypertensive renovascular etiology.',
        tokensConsumed: 412,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 't-2',
        phase: 'FALSIFICATION',
        phaseTitle: 'Skeptical H₀ Null Falsification',
        thoughtSnippet: 'Testing null hypothesis H₀: "Elevated CRP is incidental baseline variation without systemic inflammatory consequence". Evaluating empirical cohorts (NHANES III baseline).',
        tokensConsumed: 840,
        falsificationScore: 0.018,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 't-3',
        phase: 'ISMP_SAFETY',
        phaseTitle: 'ISMP & High-Risk Drug Guard',
        thoughtSnippet: 'Verifying contraindications against active supplement stack (Curcumin 500mg, Magnesium glycinate 400mg). No cytochrome P450 CYP3A4 inhibitors flagged. ISMP leading zero rules verified.',
        tokensConsumed: 1260,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 't-4',
        phase: 'SYNTHESIS',
        phaseTitle: 'Care Protocol Synthesis',
        thoughtSnippet: 'Finalizing 3-horizon clinical care strategy: 1) Immediate parasympathetic vagal biofeedback entrainment, 2) 4-week dietary sodium:potassium ratio calibration, 3) 6-month renal duplex ultrasound follow-up.',
        tokensConsumed: 1980,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < sampleSteps.length) {
        const step = sampleSteps[stepIndex];
        this.activePhase.set(step.phase);
        this.thoughts.update(list => [...list, step]);
        stepIndex++;
      } else {
        clearInterval(interval);
        this.isReasoningActive.set(false);
      }
    }, 400);
  }
}
