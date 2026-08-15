import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsaDisabilityNavigatorService } from '../../services/ssa-disability-navigator.service';

@Component({
  selector: 'app-ssa-disability-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl font-sans text-gray-900 dark:text-zinc-100 transition-all">
      
      <!-- Top Title Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800/80 pb-4 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">
            🏛️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-zinc-50">
                SSA Disability & Blue Book Navigator
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                20 CFR § 404 App 1
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              Automated Listing Matcher, Compassionate Allowances (CAL), and Residual Functional Capacity (RFC) Dossier
            </p>
          </div>
        </div>

        <!-- Provenance Badge -->
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-800 text-xs font-mono">
          <span class="text-emerald-500">🔒</span>
          <span class="text-gray-600 dark:text-zinc-400 text-[11px]">{{ report().auditProvenanceHash }}</span>
        </div>
      </div>

      <!-- Quick Alert: Compassionate Allowance (CAL) / Fast Track -->
      @if (report().calAssessment.isCalIdentified) {
        <div class="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <span class="text-xl shrink-0">⚡</span>
          <div>
            <h4 class="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Compassionate Allowance (CAL) Fast-Track Identified
            </h4>
            <p class="text-xs mt-1 leading-relaxed">
              {{ report().calAssessment.guidelineRecommendation }}
            </p>
            <div class="mt-2 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
              Estimated Adjudication: ~{{ report().calAssessment.fastTrackProcessingDays }} Days (vs. 220-day standard queue)
            </div>
          </div>
        </div>
      }

      <!-- Grid Layout: Blue Book Listings + RFC Synthesizer -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        
        <!-- Left: SSA Blue Book Matches (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              📖 Listing of Impairments Matcher
            </h3>
            <span class="text-[11px] text-gray-500 dark:text-zinc-400">
              {{ report().matchedListings.length }} Candidate Categories
            </span>
          </div>

          <div class="space-y-3">
            @for (listing of report().matchedListings; track listing.listingId) {
              <div class="p-4 rounded-2xl border transition-all"
                   [class.bg-emerald-500/5]="listing.isSatisfied"
                   [class.border-emerald-500/40]="listing.isSatisfied"
                   [class.dark:bg-emerald-950/20]="listing.isSatisfied"
                   [class.bg-gray-50/80]="!listing.isSatisfied"
                   [class.border-gray-200]="!listing.isSatisfied"
                   [class.dark:bg-zinc-950/50]="!listing.isSatisfied"
                   [class.dark:border-zinc-800]="!listing.isSatisfied">
                
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-black px-2 py-0.5 rounded-md"
                            [class.bg-emerald-600]="listing.isSatisfied"
                            [class.text-white]="listing.isSatisfied"
                            [class.bg-zinc-700]="!listing.isSatisfied"
                            [class.text-zinc-200]="!listing.isSatisfied">
                        Listing {{ listing.listingId }}
                      </span>
                      <span class="text-xs font-bold text-gray-900 dark:text-zinc-100">
                        {{ listing.title }}
                      </span>
                    </div>
                    <p class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
                      {{ listing.cfrCitation }}
                    </p>
                  </div>

                  <span class="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shrink-0"
                        [class.bg-emerald-600]="listing.isSatisfied"
                        [class.text-white]="listing.isSatisfied"
                        [class.bg-zinc-800]="!listing.isSatisfied"
                        [class.text-zinc-400]="!listing.isSatisfied">
                    {{ listing.isSatisfied ? 'MEETS LISTING' : listing.matchScorePercent + '% Match' }}
                  </span>
                </div>

                <p class="text-xs text-gray-600 dark:text-zinc-300 mb-3 leading-relaxed">
                  {{ listing.criteriaDescription }}
                </p>

                <!-- Qualifying Evidence -->
                @if (listing.qualifyingFindings.length > 0) {
                  <div class="mt-2 space-y-1">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      ✓ Documented Qualifying Findings:
                    </div>
                    @for (finding of listing.qualifyingFindings; track finding) {
                      <div class="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{{ finding }}</span>
                      </div>
                    }
                  </div>
                }

                <!-- Missing Evidence Gaps -->
                @if (listing.missingEvidence.length > 0) {
                  <div class="mt-2 space-y-1">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      ⚠️ Evidentiary Gaps to Satisfy Listing:
                    </div>
                    @for (gap of listing.missingEvidence; track gap) {
                      <div class="text-xs text-amber-800 dark:text-amber-300/90 font-medium flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>{{ gap }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right: Residual Functional Capacity (RFC) & Grid Rules (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            🦾 Residual Functional Capacity (RFC)
          </h3>

          <div class="p-4 rounded-2xl bg-gray-50/80 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 space-y-4">
            
            <!-- RFC Band -->
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800/80 pb-3">
              <div>
                <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-400">Physical RFC Classification</span>
                <div class="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {{ report().rfcAssessment.physicalRfcLevel }} Work
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-400">Disability Likelihood</span>
                <div class="text-xs font-black"
                     [class.text-emerald-500]="report().rfcAssessment.overallDisabilityLikelihood.includes('High')"
                     [class.text-amber-500]="report().rfcAssessment.overallDisabilityLikelihood.includes('Moderate')"
                     [class.text-zinc-400]="report().rfcAssessment.overallDisabilityLikelihood.includes('Low')">
                  {{ report().rfcAssessment.overallDisabilityLikelihood }}
                </div>
              </div>
            </div>

            <!-- Exertional Specs -->
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                <div class="text-[10px] text-gray-500 dark:text-zinc-400">Max Sit</div>
                <div class="text-sm font-black text-gray-900 dark:text-zinc-100 font-mono">{{ report().rfcAssessment.maxContinuousSittingHours }} hrs</div>
              </div>
              <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                <div class="text-[10px] text-gray-500 dark:text-zinc-400">Max Stand</div>
                <div class="text-sm font-black text-gray-900 dark:text-zinc-100 font-mono">{{ report().rfcAssessment.maxContinuousStandingHours }} hrs</div>
              </div>
              <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                <div class="text-[10px] text-gray-500 dark:text-zinc-400">Max Lift</div>
                <div class="text-sm font-black text-gray-900 dark:text-zinc-100 font-mono">{{ report().rfcAssessment.maxLiftingLbs }} lbs</div>
              </div>
            </div>

            <!-- Postural Limitations -->
            @if (report().rfcAssessment.posturalLimitations.length > 0) {
              <div>
                <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-400">Environmental & Postural Bounds:</span>
                <ul class="mt-1 space-y-1">
                  @for (postural of report().rfcAssessment.posturalLimitations; track postural) {
                    <li class="text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <span class="text-blue-500">•</span>
                      <span>{{ postural }}</span>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Mental RFC Tier -->
            <div class="pt-2 border-t border-gray-200 dark:border-zinc-800/80">
              <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-400">Mental Concentration & Pace:</span>
              <div class="text-xs font-bold mt-0.5 text-gray-900 dark:text-zinc-100">
                {{ report().rfcAssessment.mentalConcentrationTier }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pre-Filled Standard SSA Forms Download Dossier -->
      <div class="border-t border-gray-200 dark:border-zinc-800/80 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            📄 Auto-Populated Standard SSA Forms Dossier
          </h3>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Zero-Fee Claimant Sovereignty
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          @for (form of report().availableForms; track form.formId) {
            <div class="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">{{ form.formId }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Pre-Filled</span>
                </div>
                <div class="text-xs font-bold text-gray-900 dark:text-zinc-100 mt-1">
                  {{ form.formTitle }}
                </div>
              </div>

              <a [href]="form.downloadUrl" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="w-full py-2 px-3 text-xs font-bold text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                <span>⬇️</span> Download {{ form.formId }} PDF
              </a>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class SsaDisabilityNavigatorComponent {
  private ssaService = inject(SsaDisabilityNavigatorService);
  readonly report = this.ssaService.assessment;
}
