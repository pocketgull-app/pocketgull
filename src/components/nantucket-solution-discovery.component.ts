import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NantucketSolutionDiscoveryService,
  INovelSolutionCandidate
} from '../services/nantucket-solution-discovery.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';

@Component({
  selector: 'app-nantucket-solution-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 shadow-2xl space-y-6 max-w-7xl mx-auto font-sans">
      
      <!-- Top Title & Navigation Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest">
              ECOLOGICAL CDS
            </span>
            <h2 class="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-pocketgull-sans-clinical">
              Nantucket Novel Solution Discovery &amp; Epistemology Lab
            </h2>
            <span class="px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
              Popperian H₀ • Cochrane RoB 2 • E-Value
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Discovering, modeling, and mathematically falsifying next-generation ecological, biophysical, and immunological interventions for the Nantucket tick crisis.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="copyStudyProtocol()"
            class="px-3.5 py-1.5 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{{ protocolCopied() ? '✓ Protocol Copied' : '📜 Export Study Protocol Dossier' }}</span>
          </button>
        </div>
      </div>

      <!-- Candidate Solution Selector Strip (5 Candidates) -->
      <div class="space-y-2">
        <label class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          Select Novel Intervention Paradigm Candidate
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (candidate of discovery.solutions(); track candidate.id) {
            <button
              (click)="selectCandidate(candidate.id)"
              [class.bg-purple-500\/15]="discovery.selectedSolutionId() === candidate.id"
              [class.border-purple-400]="discovery.selectedSolutionId() === candidate.id"
              [class.text-white]="discovery.selectedSolutionId() === candidate.id"
              [class.bg-zinc-900\/60]="discovery.selectedSolutionId() !== candidate.id"
              [class.border-zinc-800]="discovery.selectedSolutionId() !== candidate.id"
              [class.text-zinc-400]="discovery.selectedSolutionId() !== candidate.id"
              class="p-3 rounded-xl border text-left transition hover:border-zinc-700 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-lg">{{ candidate.icon }}</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {{ candidate.paradigm }}
                  </span>
                </div>
                <div class="text-xs font-bold text-zinc-200 mt-2">{{ candidate.name }}</div>
                <p class="text-[10px] text-zinc-400 mt-1 line-clamp-2">{{ candidate.tagline }}</p>
              </div>

              <div class="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                <span class="text-emerald-400 font-bold">-{{ candidate.empiricalPrevalenceReductionPercent }}% Vector</span>
                <span class="text-zinc-500">d={{ candidate.cohenEffectSizeD }}</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Two-Column Analysis: Mechanism & Falsification Simulator -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Column 1: Biophysical Mechanism & Cochrane Bias Scorecard (6 Cols) -->
        <div class="lg:col-span-6 bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ discovery.activeSolution().icon }}</span>
                <div>
                  <h3 class="text-sm font-bold text-white">{{ discovery.activeSolution().name }}</h3>
                  <span class="text-[10px] font-mono text-purple-300">{{ discovery.activeSolution().tagline }}</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                Safety: {{ discovery.activeSolution().ecologicalSafetyIndex }}/100
              </span>
            </div>

            <!-- Biophysical Mechanism -->
            <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
              <span class="text-[11px] font-mono font-bold uppercase text-amber-400 block">
                🔬 Biophysical & Ecological Mechanism
              </span>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                {{ discovery.activeSolution().biophysicalMechanism }}
              </p>
            </div>

            <!-- Popperian Null Hypothesis Framing -->
            <div class="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="font-bold text-purple-300">⚖️ Popperian Null Hypothesis (H₀)</span>
                <span class="text-zinc-500">Target d = {{ discovery.activeSolution().cohenEffectSizeD }}</span>
              </div>
              <div class="text-xs text-zinc-300 font-mono p-2 bg-zinc-950/60 rounded-lg border border-purple-500/20">
                <strong class="text-rose-400">H₀:</strong> "{{ discovery.activeSolution().nullHypothesisH0 }}"
              </div>
              <div class="text-xs text-zinc-300 font-mono p-2 bg-zinc-950/60 rounded-lg border border-emerald-500/20">
                <strong class="text-emerald-400">H₁:</strong> "{{ discovery.activeSolution().alternativeHypothesisH1 }}"
              </div>
            </div>

            <!-- Cochrane Risk of Bias (RoB 2) Scorecard -->
            <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="font-bold text-zinc-300">📋 Cochrane RoB 2 Study Quality Assessment</span>
                <span class="text-zinc-500">Tier: {{ discovery.activeSolution().regulatoryFeasibilityTier }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-500">Randomization:</div>
                  <div class="font-bold text-emerald-400">{{ discovery.activeSolution().cochraneRiskOfBias.randomization }}</div>
                </div>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-500">Confounding:</div>
                  <div class="font-bold text-amber-400">{{ discovery.activeSolution().cochraneRiskOfBias.confounding }}</div>
                </div>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-500">Measurement:</div>
                  <div class="font-bold text-emerald-400">{{ discovery.activeSolution().cochraneRiskOfBias.measurement }}</div>
                </div>
                <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-500">Overall Bias:</div>
                  <div class="font-bold text-emerald-400">{{ discovery.activeSolution().cochraneRiskOfBias.overall }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
            Recommended Design: {{ discovery.activeSolution().recommendedTrialDesign }}
          </div>
        </div>

        <!-- Column 2: Live Monte Carlo Falsification Simulator & E-Value (6 Cols) -->
        <div class="lg:col-span-6 bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-5 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>⚡</span> Monte Carlo Falsification & Power Simulator
              </h3>
              <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                Welch Two-Sample Model
              </span>
            </div>

            <!-- Interactive Sliders -->
            <div class="space-y-3">
              <!-- Sample Size Slider -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-zinc-400">Sample Size (Plots / Transects N):</span>
                  <span class="font-bold text-teal-300">{{ discovery.simSampleSize() }} plots</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="200"
                  step="4"
                  [ngModel]="discovery.simSampleSize()"
                  (ngModelChange)="setSampleSize($event)"
                  class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <!-- Effect Size Multiplier Slider -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-zinc-400">Effect Size Multiplier:</span>
                  <span class="font-bold text-amber-300">{{ (discovery.simEffectSizeModifier() * 100).toFixed(0) }}% (d = {{ discovery.simulationResult().effectSizeD }})</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.1"
                  [ngModel]="discovery.simEffectSizeModifier()"
                  (ngModelChange)="setEffectModifier($event)"
                  class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <!-- Environmental Noise Slider -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-zinc-400">Environmental Stochastic Noise (σ):</span>
                  <span class="font-bold text-rose-300">σ = {{ discovery.simEnvironmentalNoise() }}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.55"
                  step="0.05"
                  [ngModel]="discovery.simEnvironmentalNoise()"
                  (ngModelChange)="setNoise($event)"
                  class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>

            <!-- Live Epistemic Results Box -->
            <div
              [class.bg-emerald-500\/10]="discovery.simulationResult().epistemicStatus === 'H0_FALSIFIED_STRONG'"
              [class.border-emerald-500\/30]="discovery.simulationResult().epistemicStatus === 'H0_FALSIFIED_STRONG'"
              [class.bg-amber-500\/10]="discovery.simulationResult().epistemicStatus === 'EQUIVOCAL_CONFOUNDED'"
              [class.border-amber-500\/30]="discovery.simulationResult().epistemicStatus === 'EQUIVOCAL_CONFOUNDED'"
              [class.bg-rose-500\/10]="discovery.simulationResult().epistemicStatus === 'H0_RETAINED_INSUFFICIENT'"
              [class.border-rose-500\/30]="discovery.simulationResult().epistemicStatus === 'H0_RETAINED_INSUFFICIENT'"
              class="p-4 rounded-xl border space-y-2.5 transition"
            >
              <div class="flex items-center justify-between font-mono text-xs">
                <span class="font-bold text-sm">
                  {{ discovery.simulationResult().isH0Falsified ? '🎯 H₀ Rejected (Empirical Falsification)' : '🛡️ H₀ Retained (Unproven)' }}
                </span>
                <span class="font-mono text-xs font-bold tabular-nums">
                  p = {{ discovery.simulationResult().computedPValue }} (t = {{ discovery.simulationResult().computedTStatistic }})
                </span>
              </div>

              <!-- Power Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>Statistical Power (1 - β):</span>
                  <span class="font-bold text-zinc-200">{{ discovery.simulationResult().statisticalPowerPercent }}% (Target ≥ 80%)</span>
                </div>
                <div class="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div
                    [style.width.%]="discovery.simulationResult().statisticalPowerPercent"
                    [class.bg-emerald-500]="discovery.simulationResult().statisticalPowerPercent >= 80"
                    [class.bg-amber-400]="discovery.simulationResult().statisticalPowerPercent >= 50 && discovery.simulationResult().statisticalPowerPercent < 80"
                    [class.bg-rose-500]="discovery.simulationResult().statisticalPowerPercent < 50"
                    class="h-full rounded-full transition-all duration-300"
                  ></div>
                </div>
              </div>

              <p class="text-xs text-zinc-300 font-sans leading-relaxed">
                {{ discovery.simulationResult().epistemicCommentary }}
              </p>
            </div>

            <!-- Causal E-Value Sensitivity Box -->
            <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-purple-300">📊 Causal Sensitivity (E-Value): {{ discovery.simulationResult().causalEValueAssessment.pointEstimateEValue }}</span>
                <span class="text-zinc-500 text-[10px]">VanderWeele & Ding Bound</span>
              </div>
              <p class="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {{ discovery.simulationResult().causalEValueAssessment.confounderRobustnessSummary }}
              </p>
            </div>
          </div>

          <div class="pt-3 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Critical Alpha: α = 0.05</span>
            <span>Two-Tailed Welch Approximation</span>
          </div>
        </div>
      </div>

      <!-- Socratic Epistemic Challenge Arena -->
      <div class="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">❓</span>
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Socratic Epistemic Counter-Challenge Arena
            </h3>
          </div>
          <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
            Concept: {{ discovery.activeSocraticChallenge().epistemicConcept }}
          </span>
        </div>

        <div class="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3">
          <div class="text-xs font-semibold text-zinc-200 leading-relaxed font-sans">
            {{ discovery.activeSocraticChallenge().question }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            @for (opt of discovery.activeSocraticChallenge().options; track $index; let idx = $index) {
              <button
                (click)="submitAnswer(idx)"
                [class.bg-emerald-500\/20]="selectedAnswer() === idx && idx === discovery.activeSocraticChallenge().correctIndex"
                [class.border-emerald-500]="selectedAnswer() === idx && idx === discovery.activeSocraticChallenge().correctIndex"
                [class.text-emerald-200]="selectedAnswer() === idx && idx === discovery.activeSocraticChallenge().correctIndex"
                [class.bg-rose-500\/20]="selectedAnswer() === idx && idx !== discovery.activeSocraticChallenge().correctIndex"
                [class.border-rose-500]="selectedAnswer() === idx && idx !== discovery.activeSocraticChallenge().correctIndex"
                [class.text-rose-200]="selectedAnswer() === idx && idx !== discovery.activeSocraticChallenge().correctIndex"
                [class.bg-zinc-900]="selectedAnswer() !== idx"
                [class.border-zinc-800]="selectedAnswer() !== idx"
                [class.text-zinc-400]="selectedAnswer() !== idx"
                class="p-2.5 rounded-lg border text-left text-xs font-sans transition hover:border-zinc-700"
              >
                <div class="flex items-start gap-2">
                  <span class="font-mono text-[10px] text-zinc-500 font-bold shrink-0 mt-0.5">[{{ ['A','B','C','D'][idx] }}]</span>
                  <span>{{ opt }}</span>
                </div>
              </button>
            }
          </div>

          @if (selectedAnswer() !== null) {
            <div
              [class.bg-emerald-500\/10]="selectedAnswer() === discovery.activeSocraticChallenge().correctIndex"
              [class.border-emerald-500\/30]="selectedAnswer() === discovery.activeSocraticChallenge().correctIndex"
              [class.bg-rose-500\/10]="selectedAnswer() !== discovery.activeSocraticChallenge().correctIndex"
              [class.border-rose-500\/30]="selectedAnswer() !== discovery.activeSocraticChallenge().correctIndex"
              class="p-3 rounded-xl border text-xs font-sans space-y-1 transition animate-in fade-in"
            >
              <div class="font-bold flex items-center gap-1.5 font-mono">
                <span>{{ selectedAnswer() === discovery.activeSocraticChallenge().correctIndex ? '✅ Correct Epistemic Deduction' : '❌ Epistemic Fallacy Detected' }}</span>
              </div>
              <p class="text-zinc-300 leading-relaxed">
                {{ discovery.activeSocraticChallenge().explanation }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Clinical & Ecological Research Notice -->
      <div class="p-4 rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs leading-relaxed space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-zinc-200 font-mono text-[11px] uppercase tracking-wider">
          <span>Clinical &amp; Ecological Research Notice</span>
        </div>
        <p class="text-zinc-400">
          This computational modeling environment provides open-access biophysical simulations, empirical power calculations, and Cochrane Risk of Bias assessments for potential ecological and immunological vector interventions. Intended for researchers, public health officials, and community scientists evaluating long-term vector eradication strategies.
        </p>
      </div>

    </div>
  `
})
export class NantucketSolutionDiscoveryComponent {
  discovery = inject(NantucketSolutionDiscoveryService);
  haptic = inject(BioHapticFeedbackService, { optional: true });

  selectedAnswer = signal<number | null>(null);
  protocolCopied = signal<boolean>(false);

  selectCandidate(id: string): void {
    this.discovery.selectedSolutionId.set(id);
    this.selectedAnswer.set(null);
    this.haptic?.triggerHapticPulse('exhale');
  }

  setSampleSize(n: number): void {
    this.discovery.simSampleSize.set(n);
  }

  setEffectModifier(mod: number): void {
    this.discovery.simEffectSizeModifier.set(mod);
  }

  setNoise(noise: number): void {
    this.discovery.simEnvironmentalNoise.set(noise);
  }

  submitAnswer(index: number): void {
    this.selectedAnswer.set(index);
    if (index === this.discovery.activeSocraticChallenge().correctIndex) {
      this.haptic?.playSolfeggioTone(528, 600);
    } else {
      this.haptic?.triggerHapticPulse('inhale');
    }
  }

  copyStudyProtocol(): void {
    const md = this.discovery.generateStudyProtocolMarkdown(this.discovery.activeSolution());
    navigator.clipboard.writeText(md);
    this.protocolCopied.set(true);
    setTimeout(() => this.protocolCopied.set(false), 2500);
  }
}
