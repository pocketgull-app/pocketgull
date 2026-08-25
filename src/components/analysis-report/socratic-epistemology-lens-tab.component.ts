import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkepticalEpistemologyService } from '../../services/skeptical-epistemology.service';
import { SocraticChallengeCardComponent } from '../socratic-challenge-card.component';
import { PocketGullCardComponent } from '../shared/pocket-gull-card.component';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';

@Component({
  selector: 'app-socratic-epistemology-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    SocraticChallengeCardComponent,
    PocketGullCardComponent,
    PocketGullBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Socratic Epistemology Header -->
      <pocket-gull-card>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🧠</span>
            <div>
              <h3 class="font-extrabold text-sm uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Skeptical Epistemology & Socratic Challenge Matrix
              </h3>
              <p class="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                Stress-testing clinical hypotheses against cognitive bias, diagnostic premature closure, and empirical counter-evidence.
              </p>
            </div>
          </div>
          <pocket-gull-badge label="Epistemology Verified" severity="info"></pocket-gull-badge>
        </div>
      </pocket-gull-card>

      <!-- Socratic Challenge Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (challenge of challenges(); track challenge.id) {
          <app-socratic-challenge-card [challenge]="challenge"></app-socratic-challenge-card>
        } @empty {
          <div class="col-span-2 p-6 text-center text-xs text-gray-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
            No active cognitive bias or diagnostic closure warnings detected for this encounter.
          </div>
        }
      </div>
    </div>
  `
})
export class SocraticEpistemologyLensTabComponent {
  private epistemologyService = inject(SkepticalEpistemologyService);
  readonly challenges = input<any[]>([]);
}
