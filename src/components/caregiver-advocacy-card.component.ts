import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaregiverReliefService, CaregiverProxyRole, ICaregiverShiftMemo, IAdvocacyQuestion } from '../services/caregiver-relief.service';

@Component({
  selector: 'app-caregiver-advocacy-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950 rounded-3xl border border-indigo-500/30 shadow-2xl font-mono text-xs text-zinc-100 space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-indigo-500/20">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-2xl shadow-md">
            🤝
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white tracking-tight">
                Family Caregiver Shadow Portal &amp; Respite Shield
              </h3>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 uppercase">
                Intergenerational Dignity • Seven Generations
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5 font-sans">
              Preventing caregiver burnout, coordinating shift memos, generating clinical visit cheat sheets, and protecting elder dignity.
            </p>
          </div>
        </div>

        <!-- Role Badge -->
        <div class="flex items-center gap-2 font-sans">
          <span class="text-zinc-400 text-xs">Caregiver Role:</span>
          <select
            [ngModel]="selectedRole()"
            (ngModelChange)="selectedRole.set($event)"
            class="bg-zinc-900 border border-zinc-700 text-indigo-300 text-xs rounded-lg px-2.5 py-1 font-bold">
            <option value="ADULT_CHILD">Adult Child (Daughter/Son)</option>
            <option value="SPOUSE">Spouse / Partner</option>
            <option value="PROFESSIONAL_AIDE">Professional Aide</option>
            <option value="GUARDIAN">Legal Guardian</option>
          </select>
        </div>
      </div>

      <!-- Quick Shift Memo Voice Dictation / Note Input -->
      <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 font-sans">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-zinc-200 flex items-center gap-2">
            <span>🎙️</span> Log 30-Second Shift Handoff Memo
          </span>
          <span class="text-[10px] text-zinc-500 font-mono">Parsed into 4 Bedside Observation Pillars</span>
        </div>

        <textarea
          [ngModel]="quickMemoInput()"
          (ngModelChange)="quickMemoInput.set($event)"
          placeholder="e.g. Mom had oatmeal for breakfast and drank 2 glasses of water. She felt unsteady when walking to the bathroom around 2 PM. Mood was pleasant, but she woke up twice last night."
          rows="3"
          class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 font-sans"></textarea>

        <div class="flex justify-end">
          <button
            type="button"
            (click)="recordCurrentMemo()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md">
            <span>✓</span> Save Shift Handoff Memo
          </button>
        </div>
      </div>

      <!-- Display Parsed Observations from Latest Memo -->
      @if (caregiver.shiftMemos().length > 0) {
        <div class="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span class="text-xs font-bold text-indigo-300">Latest Bedside Observation Handoff</span>
            <span class="text-[10px] text-zinc-500">{{ caregiver.shiftMemos()[0].timestamp | date:'short' }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
            <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-emerald-400 font-bold block text-[10px] uppercase font-mono">🍽️ Nutrition &amp; Hydration</span>
              <p class="text-zinc-300 text-[11px]">{{ caregiver.shiftMemos()[0].parsedObservations.nutritionHydration }}</p>
            </div>

            <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-amber-400 font-bold block text-[10px] uppercase font-mono">🚶 Mobility &amp; Fall Safety</span>
              <p class="text-zinc-300 text-[11px]">{{ caregiver.shiftMemos()[0].parsedObservations.mobilitySafety }}</p>
            </div>

            <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-teal-400 font-bold block text-[10px] uppercase font-mono">🧠 Affect &amp; Cognition</span>
              <p class="text-zinc-300 text-[11px]">{{ caregiver.shiftMemos()[0].parsedObservations.cognitiveMood }}</p>
            </div>

            <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-indigo-400 font-bold block text-[10px] uppercase font-mono">🌙 Sleep &amp; Restlessness</span>
              <p class="text-zinc-300 text-[11px]">{{ caregiver.shiftMemos()[0].parsedObservations.sleepRestlessness }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Caregiver Stamina & Burnout Prevention Shield -->
      <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 font-sans">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-zinc-200 flex items-center gap-2">
            <span>🛡️</span> Caregiver Sleep Debt &amp; Stamina Gauge
          </h4>
          <span class="text-[10px] text-zinc-400 font-mono">Self-Care is Patient Safety</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span class="text-zinc-400 block text-[10px]">Your Daily Burnout (1-10)</span>
            <input
              type="range"
              min="1"
              max="10"
              [ngModel]="burnoutScore()"
              (ngModelChange)="burnoutScore.set($event)"
              class="w-full accent-indigo-500 cursor-pointer" />
            <div class="text-right text-indigo-400 font-bold">{{ burnoutScore() }}/10</div>
          </div>

          <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span class="text-zinc-400 block text-[10px]">Average Nightly Sleep (Hours)</span>
            <input
              type="number"
              min="3"
              max="12"
              [ngModel]="sleepHours()"
              (ngModelChange)="sleepHours.set($event)"
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white font-bold" />
          </div>

          <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between">
            <span class="text-zinc-400 block text-[10px]">Respite Support Status</span>
            <span
              class="text-xs font-bold"
              [class.text-emerald-400]="caregiverStatus().riskLevel === 'LOW'"
              [class.text-amber-400]="caregiverStatus().riskLevel === 'ELEVATED'"
              [class.text-rose-400]="caregiverStatus().riskLevel === 'CRITICAL_BURNOUT'">
              {{ caregiverStatus().riskLevel }}
            </span>
          </div>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          {{ caregiverStatus().supportiveAdvice }}
        </p>
      </div>
    </div>
  `
})
export class CaregiverAdvocacyCardComponent {
  public caregiver = inject(CaregiverReliefService);

  readonly selectedRole = signal<CaregiverProxyRole>('ADULT_CHILD');
  readonly quickMemoInput = signal<string>('');
  readonly burnoutScore = signal<number>(4);
  readonly sleepHours = signal<number>(7);

  caregiverStatus() {
    return this.caregiver.assessCaregiverWellbeing(this.burnoutScore(), this.sleepHours());
  }

  recordCurrentMemo(): void {
    const text = this.quickMemoInput().trim();
    if (!text) return;
    this.caregiver.recordShiftMemo(text, this.selectedRole());
    this.quickMemoInput.set('');
  }
}
