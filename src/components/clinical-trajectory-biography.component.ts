import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';

@Component({
  selector: 'app-clinical-trajectory-biography',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-emerald-900/50 shadow-2xl p-6 font-sans">
      
      <!-- Biography Header -->
      <div class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-700/50">
              Longitudinal Biography Engine
            </span>
            <h3 class="text-lg font-black text-white">
              {{ biography().title }}
            </h3>
          </div>
          <p class="text-xs text-zinc-400 font-medium mt-1">
            Chronological health trajectory translated through your chosen health literacy persona.
          </p>
        </div>
      </div>

      <!-- Chronological Timeline Cards -->
      <div class="space-y-4">
        @for (chapter of biography().chapters; track chapter.era) {
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 transition-all hover:border-emerald-500/40 relative overflow-hidden group">
            
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-all"></span>
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  {{ chapter.era }}
                </span>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 font-mono border border-zinc-800">
                {{ chapter.badge }}
              </span>
            </div>

            <h4 class="text-sm font-black text-white mb-1">
              {{ chapter.heading }}
            </h4>

            <p class="text-xs text-zinc-300 font-medium leading-relaxed">
              {{ chapter.body }}
            </p>
          </div>
        }
      </div>

    </div>
  `
})
export class ClinicalTrajectoryBiographyComponent {
  protected readonly patientState = inject(PatientStateService);
  protected readonly themeService = inject(ThemeService);
  protected readonly compassionateAnalogy = inject(CompassionateAnalogyService);

  readonly biography = computed(() => {
    const name = this.patientState.patientName() || 'Patient';
    return this.compassionateAnalogy.generateTrajectoryBiography(name);
  });
}
