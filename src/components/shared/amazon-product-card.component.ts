import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAmazonProductItem } from '../../services/amazon-creators-api.service';

@Component({
  selector: 'app-amazon-product-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group relative p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between"
      [attr.aria-label]="'Amazon Recommended Product: ' + product().title">

      <!-- Top Section -->
      <div class="space-y-2.5">
        <!-- Badges Row -->
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <div class="flex items-center gap-1.5">
            @if (product().hsaFsaEligible) {
              <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span>🛡️</span>
                <span>HSA/FSA ELIGIBLE</span>
              </span>
            }
            @if (product().primeEligible) {
              <span class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                prime
              </span>
            }
          </div>

          @if (product().category) {
            <span class="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {{ categoryLabel() }}
            </span>
          }
        </div>

        <!-- Product Image & Title Flex -->
        <div class="flex items-start gap-3">
          @if (product().imageUrl) {
            <div class="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center p-1">
              <img
                [src]="product().imageUrl"
                [alt]="product().title"
                class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-200"
                loading="lazy" />
            </div>
          }

          <div class="space-y-1 min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 leading-snug">
              {{ product().title }}
            </h4>

            @if (product().price) {
              <div class="flex items-baseline gap-2">
                <span class="text-sm font-black text-amber-600 dark:text-amber-400">
                  {{ product().price?.displayPrice }}
                </span>
                @if (product().rating) {
                  <span class="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    ★ {{ product().rating }} ({{ product().ratingsCount || 0 }})
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Clinical Evidence & Context Annotation -->
        @if (showClinicalContext() && product().clinicalContext) {
          <div class="p-2 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-[11px] text-teal-900 dark:text-teal-200 space-y-0.5">
            <div class="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-cyan-400 flex items-center gap-1">
              <span>🩺</span>
              <span>Clinical Utility</span>
              @if (product().evidenceScore) {
                <span class="ml-auto text-[8.5px] opacity-90 font-mono">[{{ product().evidenceScore }}]</span>
              }
            </div>
            <p class="leading-tight italic">
              "{{ product().clinicalContext }}"
            </p>
          </div>
        }
      </div>

      <!-- Action Button & FTC Tag -->
      <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col gap-1.5">
        <a
          [href]="product().detailPageUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="min-h-[44px] w-full px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-zinc-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
          <span>🛒</span>
          <span>View on Amazon</span>
          <span class="text-[10px] font-mono opacity-80">↗</span>
        </a>

        <p class="text-[8.5px] text-slate-400 dark:text-zinc-500 leading-tight font-sans text-center">
          Affiliate link (tag: pgdpo-20) • Supports non-profit health research
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AmazonProductCardComponent {
  product = input.required<IAmazonProductItem>();
  showClinicalContext = input<boolean>(true);
  compact = input<boolean>(false);

  categoryLabel = computed(() => {
    const cat = this.product()?.category;
    switch (cat) {
      case 'medical_device': return 'Medical Device';
      case 'books_bibliotherapy': return 'Bibliotherapy Book';
      case 'supplements': return 'Dietary / Orthomolecular';
      case 'ergonomics': return 'Physical Ergonomics';
      case 'fitness_wellness': return 'Somatic Wellness';
      default: return 'Therapeutic Resource';
    }
  });
}
