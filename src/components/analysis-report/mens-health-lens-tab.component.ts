import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensHealthAndrologyService } from '../../services/mens-health-andrology.service';
import { SovereigntyHealthModelsService } from '../../services/sovereignty-health-models.service';

@Component({
  selector: 'app-mens-health-lens-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6 text-slate-100 font-sans">
      <!-- Main Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-zinc-900 to-sky-950/40 border border-sky-500/30 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⚓</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-white tracking-tight">Men's Health & Andrological Vitality Engine</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                  Princeton III Endothelial & Urological Suite
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Microvascular cardiovascular risk stratification, International Prostate Symptom Score (IPSS), and St. Louis ADAM hypogonadism screening.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="exportMensHealthBundle()"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-sm hover:shadow-sky-500/20 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export FHIR R4 Bundle
            </button>
          </div>
        </div>

        <!-- Telemetry HUD Grid -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1" [class.border-rose-700]="mens.princetonEvaluation().riskTier === 'High Risk'">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Princeton III CV Risk</span>
            <div class="text-lg font-bold" [ngClass]="getPrincetonBadgeClass(mens.princetonEvaluation().riskTier)">
              {{ mens.princetonEvaluation().riskTier }}
            </div>
            <span class="text-[11px] text-slate-400 font-sans">
              PDE5 Safe: {{ mens.princetonEvaluation().pde5PrescriptionSafe ? 'YES' : 'NO / CONTRAINDICATED' }}
            </span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">IPSS Prostate Score</span>
            <div class="text-lg font-bold text-sky-300">
              {{ mens.ipssScore().totalScore }} / 35
            </div>
            <span class="text-[11px] text-slate-400 font-sans">{{ mens.ipssScore().severity }}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">PSA Biomarker / Velocity</span>
            <div class="text-lg font-bold text-emerald-400">{{ mens.totalPsa() }} ng/mL</div>
            <span class="text-[11px] text-slate-400 font-sans">Velocity: +{{ mens.psaInterpretation().psaVelocityNgMlYr }} ng/mL/yr</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1" [class.border-amber-700]="mens.adamResult().isPositiveForHypogonadism">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">ADAM Androgen Screener</span>
            <div class="text-lg font-bold" [ngClass]="mens.adamResult().isPositiveForHypogonadism ? 'text-amber-400' : 'text-emerald-400'">
              {{ mens.adamResult().isPositiveForHypogonadism ? 'POSITIVE' : 'NEGATIVE' }}
            </div>
            <span class="text-[11px] text-slate-400 font-sans">{{ mens.adamResult().positiveResponsesCount }} / 10 symptoms</span>
          </div>
        </div>
      </div>

      <!-- Navigation Sub-Tabs -->
      <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          (click)="activeTab.set('princeton')"
          [class.bg-sky-600]="activeTab() === 'princeton'"
          [class.text-white]="activeTab() === 'princeton'"
          [class.text-slate-400]="activeTab() !== 'princeton'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          Princeton III & Cardiovascular Axis
        </button>
        <button
          type="button"
          (click)="activeTab.set('ipss')"
          [class.bg-sky-600]="activeTab() === 'ipss'"
          [class.text-white]="activeTab() === 'ipss'"
          [class.text-slate-400]="activeTab() !== 'ipss'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          Prostate Health & IPSS Instrument
        </button>
        <button
          type="button"
          (click)="activeTab.set('adam')"
          [class.bg-sky-600]="activeTab() === 'adam'"
          [class.text-white]="activeTab() === 'adam'"
          [class.text-slate-400]="activeTab() !== 'adam'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          ADAM Androgen & Circadian Screener
        </button>
      </div>

      <!-- TAB 1: PRINCETON III & MICROVASCULAR CARDIOVASCULAR RISK -->
      @if (activeTab() === 'princeton') {
        <div class="space-y-6">
          <!-- Hard ISMP Nitrate Safety Alert if Nitrates Active -->
          @if (mens.takesNitroglycerinOrNitrates()) {
            <div class="p-4 bg-rose-950/90 border-2 border-rose-600 rounded-2xl space-y-2 text-rose-100">
              <div class="flex items-center gap-2 font-bold text-sm text-rose-300">
                <span class="text-lg">🛑</span> FATAL DRUG INTERACTION CONTRAINDICATION (ISMP HIGH-RISK WARNING)
              </div>
              <p class="text-xs leading-relaxed">
                Patient is taking Nitroglycerin, Isosorbide Mononitrate/Dinitrate, or other organic nitrates. 
                Co-administration with PDE5 inhibitors (Sildenafil, Tadalafil, Vardenafil) is <strong>STRICTLY CONTRAINDICATED</strong> due to excessive accumulation of cyclic GMP causing severe, potentially fatal refractory hypotension.
              </p>
            </div>
          }

          <!-- Cardiovascular & Endothelial Evaluation Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Clinical History Inputs (6 cols) -->
            <div class="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div class="border-b border-slate-800 pb-3">
                <h4 class="text-base font-bold text-white">Cardiovascular History & Nitrate Screening</h4>
                <p class="text-xs text-slate-400">Princeton Consensus Conference III Clinical Stratification</p>
              </div>

              <div class="space-y-3 text-xs">
                <!-- Nitrate Toggle -->
                <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div class="space-y-0.5 pr-2">
                    <span class="font-bold text-white block">Nitroglycerin / Organic Nitrates Prescription</span>
                    <span class="text-slate-400 text-[11px] block">Sublingual nitro, isosorbide, or nitro patches</span>
                  </div>
                  <input
                    type="checkbox"
                    [ngModel]="mens.takesNitroglycerinOrNitrates()"
                    (ngModelChange)="mens.setNitrateUsage($event)"
                    class="w-4 h-4 accent-rose-500 rounded" />
                </label>

                <!-- Prior CAD / MI Toggle -->
                <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div class="space-y-0.5 pr-2">
                    <span class="font-bold text-white block">Known CAD / Prior Myocardial Infarction</span>
                    <span class="text-slate-400 text-[11px] block">History of heart attack, stent, or coronary bypass</span>
                  </div>
                  <input
                    type="checkbox"
                    [ngModel]="mens.hasKnownCadOrPriorMi()"
                    (ngModelChange)="mens.setPriorMi($event)"
                    class="w-4 h-4 accent-sky-500 rounded" />
                </label>

                <!-- Blood Pressure Sliders -->
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-white">Resting Blood Pressure:</span>
                    <span class="font-mono text-sky-300 font-bold">{{ mens.systolicBp() }} / {{ mens.diastolicBp() }} mmHg</span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-[10px] text-slate-400">Systolic (mmHg)</span>
                      <input
                        type="range"
                        min="90"
                        max="200"
                        [ngModel]="mens.systolicBp()"
                        (ngModelChange)="mens.systolicBp.set($event)"
                        class="w-full accent-sky-500 cursor-pointer" />
                    </div>
                    <div>
                      <span class="text-[10px] text-slate-400">Diastolic (mmHg)</span>
                      <input
                        type="range"
                        min="50"
                        max="120"
                        [ngModel]="mens.diastolicBp()"
                        (ngModelChange)="mens.diastolicBp.set($event)"
                        class="w-full accent-sky-500 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Endothelial & Microvascular Rationale (6 cols) -->
            <div class="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div class="border-b border-slate-800 pb-3">
                <h4 class="text-base font-bold text-white">The "Canary in the Coal Mine" Principle</h4>
                <p class="text-xs text-slate-400">Microvascular Penile Arteries (1-2mm) vs Coronary Arteries (3-4mm)</p>
              </div>

              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span class="font-bold text-sky-300 block uppercase tracking-wider text-[10px]">Endothelial Assessment</span>
                <p class="text-slate-300 leading-relaxed">{{ mens.princetonEvaluation().endothelialWarning }}</p>
              </div>

              <div class="space-y-2 text-xs">
                <span class="font-bold text-slate-300 block uppercase text-[10px]">Evidence-Based Cardiovascular Workup:</span>
                <ul class="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
                  @for (diag of mens.princetonEvaluation().recommendedDiagnostics; track diag) {
                    <li>{{ diag }}</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: PROSTATE HEALTH & IPSS INSTRUMENT -->
      @if (activeTab() === 'ipss') {
        <div class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 7-Question IPSS Interactive Assessment (7 cols) -->
            <div class="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 class="text-base font-bold text-white">International Prostate Symptom Score (IPSS)</h4>
                  <p class="text-xs text-slate-400">LOINC: 80976-4 &bull; Standardized 7-Item BPH Instrument</p>
                </div>
                <span
                  class="px-2.5 py-1 text-xs font-semibold rounded-lg border"
                  [ngClass]="mens.ipssScore().totalScore >= 20 ? 'bg-rose-950 text-rose-300 border-rose-700' : (mens.ipssScore().totalScore >= 8 ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700')">
                  Score: {{ mens.ipssScore().totalScore }} ({{ mens.ipssScore().severity }})
                </span>
              </div>

              <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                @for (q of ipssQuestionLabels; track $index) {
                  <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div class="font-medium text-slate-300">
                      <span class="font-bold text-sky-400">{{ $index + 1 }}.</span> {{ q }}
                    </div>
                    <div class="grid grid-cols-6 gap-1 text-[11px] font-mono text-center">
                      @for (opt of [0, 1, 2, 3, 4, 5]; track opt) {
                        <button
                          type="button"
                          (click)="mens.setIpssAnswer($index, opt)"
                          [class.bg-sky-600]="mens.ipssAnswers()[$index] === opt"
                          [class.text-white]="mens.ipssAnswers()[$index] === opt"
                          [class.bg-slate-900]="mens.ipssAnswers()[$index] !== opt"
                          [class.text-slate-400]="mens.ipssAnswers()[$index] !== opt"
                          class="py-1.5 rounded border border-slate-700 hover:bg-sky-900/40 transition">
                          {{ opt }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- PSA Velocity & Biomarker Integration (5 cols) -->
            <div class="lg:col-span-5 space-y-6">
              <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div class="border-b border-slate-800 pb-3">
                  <h4 class="text-base font-bold text-white">PSA Biomarker & Velocity Calibration</h4>
                  <p class="text-xs text-slate-400">Total PSA, Free PSA % & Annual Velocity</p>
                </div>

                <div class="space-y-3 text-xs">
                  <div>
                    <label class="text-slate-400 block mb-1">Current Total PSA (ng/mL):</label>
                    <input
                      type="number"
                      step="0.1"
                      [ngModel]="mens.totalPsa()"
                      (ngModelChange)="mens.totalPsa.set($event)"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" />
                  </div>

                  <div>
                    <label class="text-slate-400 block mb-1">Prior Year Total PSA (for velocity calculation):</label>
                    <input
                      type="number"
                      step="0.1"
                      [ngModel]="mens.priorYearPsa()"
                      (ngModelChange)="mens.priorYearPsa.set($event)"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" />
                  </div>

                  <div>
                    <label class="text-slate-400 block mb-1">Free PSA Percentage (%):</label>
                    <input
                      type="number"
                      step="1"
                      [ngModel]="mens.freePsaPercent()"
                      (ngModelChange)="mens.freePsaPercent.set($event)"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" />
                  </div>

                  <div>
                    <label class="text-slate-400 block mb-1">Prostate Volume (cc / cm³):</label>
                    <input
                      type="number"
                      step="1"
                      [ngModel]="sovereignty.prostateVolumeCc()"
                      (ngModelChange)="sovereignty.prostateVolumeCc.set($event)"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" />
                  </div>
                </div>

                <!-- PSA Density Biopsy Avoidance HUD -->
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400 text-[10px] uppercase font-bold">PSA Density (PSAD):</span>
                    <span class="font-mono font-bold" [class.text-emerald-400]="sovereignty.psaDensityTriage().unnecessaryBiopsyAvoidable" [class.text-amber-400]="!sovereignty.psaDensityTriage().unnecessaryBiopsyAvoidable">
                      {{ sovereignty.psaDensityTriage().psaDensityNgMlCm3 }} ng/mL/cc
                    </span>
                  </div>
                  <div class="text-[11px]" [ngClass]="sovereignty.psaDensityTriage().unnecessaryBiopsyAvoidable ? 'text-emerald-300' : 'text-amber-300'">
                    {{ sovereignty.psaDensityTriage().unnecessaryBiopsyAvoidable ? '✓ Blind Biopsy Safely Avoidable (BPH volume-driven)' : '⚠️ Elevated Density / Low Free PSA: mpMRI PI-RADS Indicated' }}
                  </div>
                </div>

                <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <span class="font-bold text-sky-300 block uppercase text-[10px]">Oncologic Interpretation:</span>
                  <div class="font-bold text-white">{{ mens.psaInterpretation().riskCategory }}</div>
                  <p class="text-slate-400 text-[11px] leading-relaxed">{{ mens.psaInterpretation().clinicalRecommendation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: ADAM ANDROGEN & CIRCADIAN HORMONES -->
      @if (activeTab() === 'adam') {
        <div class="space-y-6">
          <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 class="text-base font-bold text-white">St. Louis University ADAM Screener</h4>
                <p class="text-xs text-slate-400">Androgen Deficiency in the Aging Male (Validated 10-Item Instrument)</p>
              </div>
              <span
                class="px-2.5 py-1 text-xs font-semibold rounded-lg border"
                [ngClass]="mens.adamResult().isPositiveForHypogonadism ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'">
                Result: {{ mens.adamResult().isPositiveForHypogonadism ? 'POSITIVE' : 'NEGATIVE' }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              @for (item of adamQuestionLabels; track $index) {
                <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div class="pr-3 text-slate-300">
                    <span class="font-bold text-sky-400">{{ $index + 1 }}.</span> {{ item }}
                    @if ($index === 0 || $index === 6) {
                      <span class="text-[10px] text-amber-400 block font-mono font-bold">(Key Indicator Question)</span>
                    }
                  </div>
                  <input
                    type="checkbox"
                    [ngModel]="mens.adamAnswers()[$index]"
                    (ngModelChange)="mens.setAdamAnswer($index, $event)"
                    class="w-4 h-4 accent-sky-500 rounded" />
                </label>
              }
            </div>

            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <span class="font-bold text-sky-300 block uppercase text-[10px]">Clinical Decision Support Guidance:</span>
              <p class="text-slate-300 leading-relaxed">{{ mens.adamResult().clinicalGuidance }}</p>
              <div class="text-[11px] text-slate-500 font-mono pt-1">
                Note: Circadian testosterone production peaks between 8:00 AM and 10:00 AM. Evening draws produce false-positive hypogonadism rates up to 40%.
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Export Notification Toast -->
      @if (exportSuccessMessage()) {
        <div class="p-3 bg-emerald-950 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportSuccessMessage() }}</span>
          <button (click)="exportSuccessMessage.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class MensHealthLensTabComponent {
  public mens = inject(MensHealthAndrologyService);
  public sovereignty = inject(SovereigntyHealthModelsService);
  public activeTab = signal<'princeton' | 'ipss' | 'adam'>('princeton');
  public exportSuccessMessage = signal<string | null>(null);

  readonly ipssQuestionLabels = [
    'Incomplete Emptying: How often have you had a sensation of not emptying your bladder completely?',
    'Frequency: How often have you had to urinate again less than two hours after you finished urinating?',
    'Intermittency: How often have you found you stopped and started again several times when you urinated?',
    'Urgency: How often have you found it difficult to postpone urination?',
    'Weak Stream: How often have you had a weak urinary stream?',
    'Straining: How often have you had to push or strain to begin urination?',
    'Nocturia: How many times did you typically get up to urinate from the time you went to bed until the morning?'
  ];

  readonly adamQuestionLabels = [
    'Do you have a decrease in libido (sex drive)?',
    'Do you have a lack of energy?',
    'Do you have a decrease in strength and/or endurance?',
    'Have you lost height?',
    'Have you noticed a decreased "enjoyment of life"?',
    'Are you sad and/or grumpy?',
    'Are your erections less strong?',
    'Have you noticed a recent deterioration in your ability to play sports?',
    'Are you falling asleep after dinner?',
    'Has there been a recent deterioration in your work performance?'
  ];

  getPrincetonBadgeClass(tier: string): string {
    if (tier === 'Low Risk') return 'text-emerald-400';
    if (tier === 'Intermediate Risk') return 'text-amber-400';
    return 'text-rose-400';
  }

  exportMensHealthBundle(): void {
    const bundle = this.mens.exportFhirR4MensHealthBundle('homo-sapiens-male-58y');
    this.exportSuccessMessage.set(
      `Successfully generated Men's Health FHIR R4 Bundle with ${bundle['entry']?.length || 0} Observation resources.`
    );
  }
}
