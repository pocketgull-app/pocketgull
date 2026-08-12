import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocraticChallengeCardComponent } from '../socratic-challenge-card.component';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';
import { DailyActionChecklistComponent } from '../daily-action-checklist.component';
import { SymptomHabitJournalComponent } from '../symptom-habit-journal.component';
import { CaregiverBridgeModalComponent } from '../modals/caregiver-bridge-modal.component';
import { ISocraticChallenge } from '../../services/skeptical-epistemology.service';

const DEFAULT_SOCRATIC_CHALLENGE: ISocraticChallenge = {
  id: 'chal-001',
  question: 'How does daily circadian rhythm alignment support autonomic nervous system recovery?',
  options: [
    'Optimizes diurnal cortisol slope and vagal nerve tone',
    'Increases sympathetic overdrive indefinitely',
    'Eliminates cellular energy production',
    'Suppresses immune surveillance'
  ],
  correctIndex: 0,
  explanation: 'Aligning sleep/wake cycles with diurnal circadian rhythms balances the sympathetic and parasympathetic nervous systems, reducing systemic inflammation.',
  difficulty: 'analytical',
  epistemicTag: 'CIRCADIAN_RECOVERY',
  lensName: 'Patient Education'
};

@Component({
  selector: 'app-patient-education-lens-tab',
  standalone: true,
  imports: [
    CommonModule, 
    SocraticChallengeCardComponent, 
    PocketGullBadgeComponent,
    DailyActionChecklistComponent,
    SymptomHabitJournalComponent,
    CaregiverBridgeModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6 font-sans">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">📖</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-gray-100 uppercase tracking-wide">
              Patient Education & Self-Care Empowerment
            </h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Personalized micro-habits, symptom journals, and caregiver family sharing.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm focus:outline-none flex items-center gap-1.5"
            (click)="showCaregiverBridge.set(true)"
          >
            <span>🤝</span>
            <span>Share with Caregiver</span>
          </button>
          <pocket-gull-badge label="HEALTH LITERACY" severity="info"></pocket-gull-badge>
        </div>
      </div>

      <!-- Socratic Challenge Card Component -->
      <app-socratic-challenge-card [challenge]="challenge() || defaultChallenge"></app-socratic-challenge-card>

      <!-- Daily Action Checklist Component -->
      <app-daily-action-checklist></app-daily-action-checklist>

      <!-- Symptom & Habit Correlation Journal Component -->
      <app-symptom-habit-journal></app-symptom-habit-journal>

      <!-- Caregiver Sharing Bridge Modal -->
      @if (showCaregiverBridge()) {
        <app-caregiver-bridge-modal (close)="showCaregiverBridge.set(false)"></app-caregiver-bridge-modal>
      }

      <!-- Content Slot -->
      <div class="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-zinc-300">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PatientEducationLensTabComponent {
  reportText = input<string>('');
  challenge = input<ISocraticChallenge | null>(null);
  readonly defaultChallenge = DEFAULT_SOCRATIC_CHALLENGE;
  readonly showCaregiverBridge = signal<boolean>(false);
}

