import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MaternalPostpartumSentinelService,
  EPDS_QUESTIONS,
  IEpdsQuestion,
  ILatchScoreInput,
  IInfantCircadianInput
} from '../../services/maternal-postpartum-sentinel.service';

@Component({
  selector: 'app-maternal-postpartum-lens-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Top Banner -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-purple-950/40 to-pink-950/40 border border-purple-500/30 shadow-2xl backdrop-blur-xl">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🤰</span>
            <div>
              <h3 class="text-lg font-extrabold tracking-wide text-zinc-100 uppercase">
                4th-Trimester Maternal & Doula Telemetry Suite
              </h3>
              <p class="text-xs text-zinc-400">
                ACOG AIM Preeclampsia Radar • 10-Item EPDS Screener • LATCH Lactation Mechanics • Circadian Synchrony
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-full text-xs font-mono font-bold border"
              [ngClass]="maternal.isUrgentAlertActive() ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'">
              {{ maternal.isUrgentAlertActive() ? '🚨 Urgent Maternal Alert Active' : '✨ 4th-Trimester Stable' }}
            </span>

            <button (click)="downloadFhirBundle()"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-1.5">
              <span>📥</span> FHIR R4 Bundle
            </button>
          </div>
        </div>

        <!-- 4 Key Telemetry Cards -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <!-- 1. ACOG AIM BP & MAP Radar -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Blood Pressure / MAP</span>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold"
                [ngClass]="maternal.currentAssessment()?.riskTier === 'CRITICAL_EMERGENCY' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'">
                {{ maternal.currentAssessment()?.riskTier || 'LOW_STANDARD' }}
              </span>
            </div>
            <div class="text-xl font-bold text-zinc-100">
              128/82 <span class="text-xs text-zinc-400 font-normal">mmHg (MAP: {{ maternal.currentAssessment()?.meanArterialPressure || 97.3 }} mmHg)</span>
            </div>
            <button (click)="runPreeclampsiaCheck()"
              class="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition cursor-pointer">
              ⚡ Evaluate ACOG AIM Radar
            </button>
          </div>

          <!-- 2. EPDS Mood Screener -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">EPDS Screener</span>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold"
                [ngClass]="epdsRiskBadgeClass()">
                {{ maternal.currentEpdsAssessment()?.riskTier || 'NORMAL' }}
              </span>
            </div>
            <div class="text-xl font-bold"
              [ngClass]="(maternal.currentEpdsAssessment()?.totalScore || 0) >= 13 ? 'text-red-400' : (maternal.currentEpdsAssessment()?.totalScore || 0) >= 10 ? 'text-amber-400' : 'text-emerald-400'">
              {{ maternal.currentEpdsAssessment()?.totalScore ?? 4 }} / 30
            </div>
            <button (click)="openEpdsModal()"
              class="w-full py-1.5 px-3 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-bold uppercase transition cursor-pointer">
              📝 Open 10-Item Screener
            </button>
          </div>

          <!-- 3. LATCH Lactation Mechanics -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">LATCH Score</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {{ maternal.currentLactationAssessment()?.supportLevel || 'INDEPENDENT' }}
              </span>
            </div>
            <div class="text-xl font-bold text-emerald-400">
              {{ maternal.currentLactationAssessment()?.totalLatchScore ?? 9 }} / 10
            </div>
            <button (click)="runLactationAssessment()"
              class="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition cursor-pointer">
              🤱 Doula LATCH Check
            </button>
          </div>

          <!-- 4. Infant Circadian Synchrony -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Circadian Synchrony</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                {{ maternal.currentCircadianAssessment()?.maternalSleepFragmentationIndex || 'LOW' }} FRAG
              </span>
            </div>
            <div class="text-xl font-bold text-blue-400">
              {{ maternal.currentCircadianAssessment()?.circadianMaturityScore ?? 85 }}%
            </div>
            <button (click)="runCircadianAssessment()"
              class="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition cursor-pointer">
              🌙 Assess Sleep Synchrony
            </button>
          </div>
        </div>
      </div>

      <!-- Item 10 Crisis Alert Banner if Triggered -->
      @if (maternal.currentEpdsAssessment()?.crisisProtocolTriggered) {
        <div class="p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-100 flex items-center gap-4 animate-bounce">
          <span class="text-3xl">⚠️</span>
          <div class="space-y-1">
            <h4 class="text-sm font-extrabold uppercase tracking-wider text-red-200">
              Perinatal Crisis Intervention Protocol Active
            </h4>
            <p class="text-xs text-red-300 font-mono">
              Item 10 on EPDS was positive for self-harm thoughts. Immediate clinical escalation initiated. Call or text <strong>988</strong> Suicide & Crisis Lifeline.
            </p>
          </div>
        </div>
      }

      <!-- Doula Galactagogue & Lactation Guidance Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🌿</span>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              Evidence-Based Galactagogues & Herbal Safety
            </h4>
          </div>
          <div class="space-y-2">
            @for (rec of (maternal.currentLactationAssessment()?.galactagogueRecommendations || defaultGalactagogues); track rec.herb) {
              <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-zinc-200">{{ rec.herb }}</span>
                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                    {{ rec.evidenceLevel }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-400 leading-relaxed">{{ rec.safetyNote }}</p>
              </div>
            }
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛡️</span>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-purple-400">
              ACOG AIM Disparity Mitigation & Clinical Protocol
            </h4>
          </div>
          <div class="p-3 rounded-xl bg-zinc-950 border border-purple-500/20 space-y-2 text-[11px] text-zinc-300">
            <p>
              {{ maternal.currentAssessment()?.disparityMitigationNotice || 'ACOG AIM Equity Protocol Active: Mandating identical objective diagnostic and escalation criteria regardless of insurance status, eliminating racial disparities in postpartum maternal mortality.' }}
            </p>
            <div class="border-t border-zinc-800 pt-2 space-y-1">
              <span class="text-zinc-500 uppercase tracking-wider text-[9px] font-bold block">Current Recommendations</span>
              <ul class="list-disc pl-4 space-y-1 text-zinc-400">
                @for (rec of (maternal.currentAssessment()?.acogAimBundleRecommendations || defaultRecs); track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- EPDS Modal Questionnaire -->
      @if (showEpdsModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-zinc-950 border border-purple-500/40 text-zinc-100 shadow-2xl font-mono overflow-hidden">
            <!-- Header -->
            <div class="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
              <div class="flex items-center gap-2">
                <span class="text-2xl">📝</span>
                <div>
                  <h3 class="text-sm font-bold uppercase tracking-wider text-purple-400">
                    Edinburgh Postnatal Depression Scale (EPDS)
                  </h3>
                  <p class="text-[10px] text-zinc-400">10-Item Validated Perinatal Mood Screener</p>
                </div>
              </div>
              <button (click)="showEpdsModal.set(false)"
                class="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition">
                ✕
              </button>
            </div>

            <!-- Questionnaire Form -->
            <div class="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              @for (q of epdsQuestions; track q.id) {
                <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span class="font-bold text-zinc-200 block text-[11px]">
                    {{ q.id }}. {{ q.prompt }}
                  </span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (opt of q.options; track opt.score) {
                      <button (click)="selectAnswer(q.id - 1, opt.score)"
                        class="p-2.5 rounded-xl text-left transition border cursor-pointer text-[11px]"
                        [ngClass]="epdsAnswers()[q.id - 1] === opt.score ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'">
                        {{ opt.text }} ({{ opt.score }} pt)
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
              <div class="text-xs">
                Calculated Score: <strong class="text-purple-400 font-bold">{{ calculateCurrentScore() }} / 30</strong>
              </div>
              <div class="flex gap-2">
                <button (click)="showEpdsModal.set(false)"
                  class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase cursor-pointer">
                  Cancel
                </button>
                <button (click)="submitEpds()"
                  class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer">
                  Submit & Score
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MaternalPostpartumLensTabComponent {
  readonly maternal = inject(MaternalPostpartumSentinelService);

  readonly showEpdsModal = signal<boolean>(false);
  readonly epdsQuestions = EPDS_QUESTIONS;
  readonly epdsAnswers = signal<number[]>([0, 0, 0, 1, 0, 1, 1, 1, 0, 0]);

  readonly defaultGalactagogues = [
    { herb: 'Moringa Oleifera (Malunggay)', evidenceLevel: 'Level A' as const, safetyNote: 'Proven to significantly increase prolactin and milk volume by Day 3-5 postpartum.' },
    { herb: 'Galega Officinalis (Goat’s Rue)', evidenceLevel: 'Level B' as const, safetyNote: 'Supports development of mammary glandular tissue in IGT / hypoplasia.' },
    { herb: 'Trigonella Foenum-Graecum (Fenugreek)', evidenceLevel: 'Level B' as const, safetyNote: 'Monitor for maternal hypoglycemia and GI upset; avoid in thyroid disorders.' }
  ];

  readonly defaultRecs = [
    'Routine 4th-trimester postpartum recovery plan; continue pelvic floor rehabilitation and iron/folate repletion.',
    'Schedule standard 2-week and 6-week postpartum maternal check-ins.'
  ];

  constructor() {
    // Initialize standard baseline evaluations on load
    this.runPreeclampsiaCheck();
    this.runLactationAssessment();
    this.runCircadianAssessment();
  }

  epdsRiskBadgeClass(): string {
    const tier = this.maternal.currentEpdsAssessment()?.riskTier || 'NORMAL';
    if (tier === 'PROBABLE_DEPRESSION') return 'bg-red-500/20 text-red-400';
    if (tier === 'MILD_MODERATE_DISTRESS') return 'bg-amber-500/20 text-amber-400';
    return 'bg-emerald-500/20 text-emerald-400';
  }

  runPreeclampsiaCheck(): void {
    this.maternal.evaluatePostpartumMorbidity({
      systolicBp: 128,
      diastolicBp: 82,
      heartRate: 74,
      spO2Percent: 98,
      daysPostpartum: 14,
      symptoms: {}
    });
  }

  runLactationAssessment(): void {
    this.maternal.evaluateLactation({
      latch: 2,
      audibleSwallowing: 2,
      typeOfNipple: 2,
      comfort: 2,
      hold: 1
    });
  }

  runCircadianAssessment(): void {
    this.maternal.evaluateCircadianSynchrony({
      dailyFeedingCount: 9,
      longestSleepStretchHours: 4.5,
      nightWakeningCount: 2,
      maternalSleepHours: 6.8
    });
  }

  openEpdsModal(): void {
    this.showEpdsModal.set(true);
  }

  selectAnswer(index: number, score: number): void {
    this.epdsAnswers.update(arr => {
      const copy = [...arr];
      copy[index] = score;
      return copy;
    });
  }

  calculateCurrentScore(): number {
    return this.epdsAnswers().reduce((acc, curr) => acc + curr, 0);
  }

  submitEpds(): void {
    this.maternal.evaluateEpds(this.epdsAnswers(), 14);
    this.showEpdsModal.set(false);
  }

  downloadFhirBundle(): void {
    const json = this.maternal.generateFhirMaternalBundle('p_maternal_001');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Maternal_FHIR_R4_Bundle_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
