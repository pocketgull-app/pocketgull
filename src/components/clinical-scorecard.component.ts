import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

export interface IChadsVascCriteria {
  congestiveHeartFailure: boolean; // C = +1
  hypertension: boolean; // H = +1
  age75OrOlder: boolean; // A2 = +2
  diabetes: boolean; // D = +1
  strokeOrTiaHistory: boolean; // S2 = +2
  vascularDisease: boolean; // V = +1
  age65To74: boolean; // A = +1
  femaleSex: boolean; // Sc = +1
}

@Component({
  selector: 'app-clinical-scorecard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-purple-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-extrabold text-lg">
            📊
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Clinical Intelligence Scorecard & Thromboembolic Risk
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Evidence-based CHA2DS2-VASc stroke risk and Lee Revised Cardiac Risk Index (RCRI) calculators.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold font-mono">
            LOINC 89269-5
          </span>
        </div>
      </div>

      <!-- CHA2DS2-VASc Score & Stroke Risk Display -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-4 bg-purple-500/5 border border-purple-500/30 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
              CHA2DS2-VASc Score
            </span>
            <span class="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {{ chadsVascScore() }} / 9
            </span>
          </div>
          <div class="text-[11px] font-bold" [class.text-emerald-500]="chadsVascScore() === 0" [class.text-amber-500]="chadsVascScore() === 1" [class.text-rose-500]="chadsVascScore() >= 2">
            Annual Adjusted Stroke Risk: {{ annualStrokeRiskPercent() }}% / year
          </div>
          <p class="text-[10.5px] text-gray-500 dark:text-zinc-400">
            {{ antithromboticRecommendation() }}
          </p>
        </div>

        <!-- Lee Revised Cardiac Risk Index (RCRI) -->
        <div class="p-4 bg-indigo-500/5 border border-indigo-500/30 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Lee RCRI Perioperative Score
            </span>
            <span class="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              Class {{ rcriClass() }} ({{ rcriScore() }} pts)
            </span>
          </div>
          <div class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            30-Day Major Adverse Cardiac Events: {{ maceRiskPercent() }}%
          </div>
          <p class="text-[10.5px] text-gray-500 dark:text-zinc-400">
            Evaluates perioperative myocardial infarction, cardiac arrest, and mortality risk before surgery.
          </p>
        </div>
      </div>

      <!-- CHA2DS2-VASc Interactive Checkbox Criteria -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          CHA2DS2-VASc Criteria (Toggle criteria to compute stroke risk):
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <button (click)="toggleCriterion('congestiveHeartFailure')" [attr.aria-pressed]="criteria().congestiveHeartFailure" aria-label="Toggle Congestive Heart Failure criterion" [class.bg-purple-600]="criteria().congestiveHeartFailure" [class.text-white]="criteria().congestiveHeartFailure" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>C - Heart Failure (+1)</span>
            <span aria-hidden="true">{{ criteria().congestiveHeartFailure ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('hypertension')" [attr.aria-pressed]="criteria().hypertension" aria-label="Toggle Hypertension criterion" [class.bg-purple-600]="criteria().hypertension" [class.text-white]="criteria().hypertension" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>H - Hypertension (+1)</span>
            <span aria-hidden="true">{{ criteria().hypertension ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('age75OrOlder')" [attr.aria-pressed]="criteria().age75OrOlder" aria-label="Toggle Age 75 or older criterion" [class.bg-purple-600]="criteria().age75OrOlder" [class.text-white]="criteria().age75OrOlder" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>A2 - Age &ge; 75 (+2)</span>
            <span aria-hidden="true">{{ criteria().age75OrOlder ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('diabetes')" [attr.aria-pressed]="criteria().diabetes" aria-label="Toggle Diabetes criterion" [class.bg-purple-600]="criteria().diabetes" [class.text-white]="criteria().diabetes" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>D - Diabetes (+1)</span>
            <span aria-hidden="true">{{ criteria().diabetes ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('strokeOrTiaHistory')" [attr.aria-pressed]="criteria().strokeOrTiaHistory" aria-label="Toggle Prior Stroke or TIA criterion" [class.bg-purple-600]="criteria().strokeOrTiaHistory" [class.text-white]="criteria().strokeOrTiaHistory" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>S2 - Prior Stroke/TIA (+2)</span>
            <span aria-hidden="true">{{ criteria().strokeOrTiaHistory ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('vascularDisease')" [attr.aria-pressed]="criteria().vascularDisease" aria-label="Toggle Vascular Disease criterion" [class.bg-purple-600]="criteria().vascularDisease" [class.text-white]="criteria().vascularDisease" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>V - Vascular Disease (+1)</span>
            <span aria-hidden="true">{{ criteria().vascularDisease ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('age65To74')" [attr.aria-pressed]="criteria().age65To74" aria-label="Toggle Age 65 to 74 criterion" [class.bg-purple-600]="criteria().age65To74" [class.text-white]="criteria().age65To74" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>A - Age 65-74 (+1)</span>
            <span aria-hidden="true">{{ criteria().age65To74 ? '✅' : '⚪' }}</span>
          </button>

          <button (click)="toggleCriterion('femaleSex')" [attr.aria-pressed]="criteria().femaleSex" aria-label="Toggle Female Sex criterion" [class.bg-purple-600]="criteria().femaleSex" [class.text-white]="criteria().femaleSex" class="p-2.5 border rounded-lg text-left transition cursor-pointer font-semibold flex justify-between items-center bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <span>Sc - Female Sex (+1)</span>
            <span aria-hidden="true">{{ criteria().femaleSex ? '✅' : '⚪' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ClinicalScorecardComponent {
  private patientState = inject(PatientStateService);
  private decoder = inject(MedicalDecoderService);

  readonly criteria = signal<IChadsVascCriteria>({
    congestiveHeartFailure: false,
    hypertension: true,
    age75OrOlder: false,
    diabetes: false,
    strokeOrTiaHistory: false,
    vascularDisease: false,
    age65To74: true,
    femaleSex: false
  });

  readonly chadsVascScore = computed<number>(() => {
    const c = this.criteria();
    let score = 0;
    if (c.congestiveHeartFailure) score += 1;
    if (c.hypertension) score += 1;
    if (c.age75OrOlder) score += 2;
    if (c.diabetes) score += 1;
    if (c.strokeOrTiaHistory) score += 2;
    if (c.vascularDisease) score += 1;
    if (c.age65To74 && !c.age75OrOlder) score += 1;
    if (c.femaleSex) score += 1;
    return score;
  });

  readonly annualStrokeRiskPercent = computed<number>(() => {
    const score = this.chadsVascScore();
    const riskMap: Record<number, number> = { 0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8, 5: 6.7, 6: 9.8, 7: 9.6, 8: 12.5, 9: 15.2 };
    return riskMap[Math.min(9, score)] ?? 15.2;
  });

  readonly antithromboticRecommendation = computed<string>(() => {
    const score = this.chadsVascScore();
    if (score === 0) return 'Low Risk: No oral anticoagulation (OAC) therapy recommended.';
    if (score === 1) return 'Moderate Risk: Consider Oral Anticoagulant (NOAC / DOAC like Apixaban or Rivaroxaban).';
    return 'High Risk: Oral Anticoagulation (DOAC / Warfarin) strongly recommended unless contraindicated.';
  });

  readonly rcriScore = computed<number>(() => {
    const c = this.criteria();
    let pts = 0;
    if (c.congestiveHeartFailure) pts += 1;
    if (c.strokeOrTiaHistory) pts += 1;
    if (c.diabetes) pts += 1;
    if (c.vascularDisease) pts += 1;
    return pts;
  });

  readonly rcriClass = computed<string>(() => {
    const s = this.rcriScore();
    if (s === 0) return 'I';
    if (s === 1) return 'II';
    if (s === 2) return 'III';
    return 'IV';
  });

  readonly maceRiskPercent = computed<number>(() => {
    const s = this.rcriScore();
    if (s === 0) return 0.4;
    if (s === 1) return 0.9;
    if (s === 2) return 6.6;
    return 11.0;
  });

  toggleCriterion(key: keyof IChadsVascCriteria): void {
    this.criteria.update(curr => ({ ...curr, [key]: !curr[key] }));
  }
}
