import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgeGateService, UserAgeTier, AGE_TIER_METADATA } from '../../services/age-gate.service';

@Component({
  selector: 'app-age-gate-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
         role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 mb-1 shadow-lg shadow-indigo-500/10">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          <h2 id="age-gate-title" class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome to Pocket-Gull
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Select who you are personalizing care for today. We adapt clinical safety rules, language clarity, and telemetry to your needs.
          </p>
        </div>

        <!-- 4 Persona Cards -->
        <div class="grid grid-cols-1 gap-3">
          
          <!-- 1. Adult Self-Care -->
          <button
            type="button"
            (click)="selectTier('adult')"
            class="w-full text-left p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/50 transition-all duration-200 group flex items-start gap-4 min-h-[56px] cursor-pointer"
            aria-label="Select Adult Self-Care mode for ages 18 and older">
            
            <div class="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Adult Self-Care
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/20">
                  18+
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5 leading-snug">
                Personal wellness, circadian balance, and holistic symptom strategies.
              </p>
            </div>
          </button>

          <!-- 2. Parent / Guardian Mode -->
          <button
            type="button"
            (click)="selectTier('parent')"
            class="w-full text-left p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-200 group flex items-start gap-4 min-h-[56px] cursor-pointer"
            aria-label="Select Parent or Guardian mode for minor children">
            
            <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  Parent / Child Guardian
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/20">
                  Pediatric Safe
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5 leading-snug">
                Pediatric clinical guardrails, infant fever thresholds, and weight checks.
              </p>
            </div>
          </button>

          <!-- 3. Healthcare Clinician -->
          <button
            type="button"
            (click)="selectTier('clinician')"
            class="w-full text-left p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-purple-500/50 transition-all duration-200 group flex items-start gap-4 min-h-[56px] cursor-pointer"
            aria-label="Select Healthcare Clinician mode">
            
            <div class="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                  Healthcare Clinician
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/20">
                  Clinician Pro
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5 leading-snug">
                LOINC, ICD-10, FHIR R4 Bundle exports, and high-density telemetry HUD.
              </p>
            </div>
          </button>

          <!-- 4. Youth (<18) -->
          <button
            type="button"
            (click)="selectTier('minor')"
            class="w-full text-left p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/50 transition-all duration-200 group flex items-start gap-4 min-h-[56px] cursor-pointer"
            aria-label="Select Youth Self-Care mode for ages under 18">
            
            <div class="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  Youth Self-Care (< 18)
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/20">
                  Supportive
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5 leading-snug">
                Health literacy, mindful wellness habits, and 24/7 crisis support links.
              </p>
            </div>
          </button>

        </div>

        <!-- Privacy & Safe Harbor Footnote -->
        <div class="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero server-side PHI storage • AES-256 local encryption</span>
          </div>
          <div class="text-zinc-600">
            Change anytime in Settings
          </div>
        </div>

      </div>
    </div>
  `
})
export class AgeGateModalComponent {
  private ageGateService = inject(AgeGateService);

  /** Event emitted after user selects their persona */
  tierSelected = output<UserAgeTier>();

  selectTier(tier: UserAgeTier): void {
    this.ageGateService.selectTier(tier);
    this.tierSelected.emit(tier);
  }
}
