import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiConfidenceCalibrationService, IAiConfidenceMetrics } from '../services/ai-confidence-calibration.service';

@Component({
  selector: 'app-ai-confidence-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-indigo-500/30 text-zinc-100 shadow-xl backdrop-blur-md font-mono space-y-4">
      
      <!-- Top Header Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 text-base shadow-sm">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-200">
                Cognitive Confidence Calibration HUD
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border"
                    [class]="calibrationService.confidenceBadgeClass()">
                {{ metrics().guidelineConcordanceGrade }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans">
              Real-time epistemic entropy, semantic uncertainty &amp; citation grounding density
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase font-bold text-zinc-400">
            DORA Trust Score:
          </span>
          <span class="text-base font-black px-2.5 py-0.5 rounded-lg border font-mono"
                [class]="calibrationService.confidenceBadgeClass()">
            {{ metrics().overallConfidencePercent }}%
          </span>
        </div>
      </div>

      <!-- Core Telemetry Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <!-- Metric 1: Epistemic Status -->
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Epistemic Status</span>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black truncate block text-zinc-200" [title]="metrics().epistemicStatus">
              {{ metrics().epistemicStatus === 'Definitive Standard of Care' ? '⚡ Standard Care' : (metrics().epistemicStatus === 'Evidence-Grounded Recommendation' ? '📋 Evidenced' : '🔬 Hypothesis') }}
            </span>
          </div>
          <span class="text-[9.5px] text-zinc-400 block truncate font-sans">
            {{ metrics().epistemicStatus }}
          </span>
        </div>

        <!-- Metric 2: Citation Density -->
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Citation Density</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-black text-sky-400 font-mono">{{ metrics().citationGroundingDensity }}</span>
            <span class="text-[10px] text-zinc-400">/ 100 words</span>
          </div>
          <span class="text-[9.5px] text-zinc-400 block font-sans">
            {{ metrics().citationCount }} verified citations
          </span>
        </div>

        <!-- Metric 3: Hedging Entropy -->
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Hedging Entropy</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-black font-mono"
                  [class.text-emerald-400]="metrics().hedgingEntropyScore <= 20"
                  [class.text-amber-400]="metrics().hedgingEntropyScore > 20 && metrics().hedgingEntropyScore <= 45"
                  [class.text-red-400]="metrics().hedgingEntropyScore > 45">
              {{ metrics().hedgingEntropyScore }}%
            </span>
            <span class="text-[10px] text-zinc-400">uncertainty</span>
          </div>
          <span class="text-[9.5px] text-zinc-400 block font-sans">
            {{ metrics().hedgingEntropyScore <= 20 ? 'Low semantic ambiguity' : 'Moderate hedging detected' }}
          </span>
        </div>

        <!-- Metric 4: FDA 520(o) CDS Alignment -->
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">FDA 520(o) CDS</span>
          <div class="flex items-center gap-1">
            <span class="text-emerald-400 text-xs">✓</span>
            <span class="text-xs font-black text-emerald-300 font-mono">NON-DEVICE</span>
          </div>
          <span class="text-[9.5px] text-zinc-400 block font-sans">
            Clinician In-the-Loop
          </span>
        </div>

      </div>

      <!-- Verifiable Citations Drawer -->
      @if (metrics().verifiableCitations.length > 0) {
        <div class="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-bold uppercase text-zinc-500 mr-1">Verified Grounding:</span>
          @for (citation of metrics().verifiableCitations; track citation) {
            <span class="px-2 py-0.5 rounded-md bg-zinc-900 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-medium flex items-center gap-1">
              <span>📄</span> {{ citation }}
            </span>
          }
        </div>
      }

      <!-- Uncertainty Alerts (if any) -->
      @if (metrics().uncertaintyFlags.length > 0) {
        <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1 font-sans">
          <div class="flex items-center gap-1.5 font-bold uppercase text-[10.5px] text-amber-300 font-mono">
            <span>⚠️</span>
            <span>Epistemic Uncertainty Notice:</span>
          </div>
          <ul class="list-disc list-inside space-y-0.5 text-[11px] text-amber-100/90">
            @for (flag of metrics().uncertaintyFlags; track flag) {
              <li>{{ flag }}</li>
            }
          </ul>
        </div>
      }

    </div>
  `
})
export class AiConfidenceHudComponent {
  readonly calibrationService = inject(AiConfidenceCalibrationService);

  /** Optional input text to calibrate dynamically; defaults to calibrationService.latestMetrics */
  inputText = input<string>('');

  readonly metrics = computed<IAiConfidenceMetrics>(() => {
    const text = this.inputText();
    if (text && text.trim().length > 0) {
      return this.calibrationService.calculateMetrics(text);
    }
    return this.calibrationService.latestMetrics();
  });
}
