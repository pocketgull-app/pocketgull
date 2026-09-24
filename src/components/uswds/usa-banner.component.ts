import { Component, signal, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FederalBannerMode = 'community-partner' | 'official-gov';

/**
 * USWDS 3.x Banner Component with Dual Entity Support
 * Supports:
 * - 'official-gov': Official United States Government agency deployment (OMB M-23-22).
 * - 'community-partner': Independent private healthcare provider / contractor conforming
 *    to USWDS 3.0 & Section 508 accessibility standards for VA Community Care & CMS interoperability.
 */
@Component({
  selector: 'app-usa-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section 
      class="usa-banner no-print bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition-colors print:hidden"
      [attr.aria-label]="'Independent Veteran Healthcare Support conforming to USWDS accessibility standards'"
    >
      <div class="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center justify-center w-4 h-4 bg-[#005ea2] text-white rounded-xs text-[10px] font-bold shrink-0" aria-hidden="true">
            🎖️
          </span>
          <p class="m-0 font-medium text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200">
            <strong class="text-[#005ea2] dark:text-blue-400">Independent Veteran Support Tool</strong> • Dedicated to helping and solving Veterans' health issues (Built with USWDS 3.0)
          </p>
        </div>

        <button 
          type="button"
          class="no-print inline-flex items-center gap-1 text-[11px] sm:text-xs text-blue-700 dark:text-blue-400 font-semibold underline hover:no-underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff] focus-visible:outline-hidden rounded-xs px-1"
          [attr.aria-expanded]="isOpen()"
          aria-controls="gov-banner-content"
          (click)="toggleBanner()"
        >
          <span>Here's how you know</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="w-3 h-3 transition-transform duration-200 text-blue-700 dark:text-blue-400" 
            [class.rotate-180]="isOpen()"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      @if (isOpen()) {
        <div 
          id="gov-banner-content" 
          class="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 text-xs bg-zinc-50/70 dark:bg-zinc-950/60 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div class="flex items-start gap-3">
            <span class="text-base p-1 bg-blue-100 dark:bg-blue-950/60 rounded-xs border border-blue-200 dark:border-blue-800" aria-hidden="true">🎖️</span>
            <div>
              <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Dedicated to Helping &amp; Solving Veteran Health Issues</p>
              <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                Pocket-Gull is an <strong>independent clinical decision support platform</strong>. We are not an official government agency, but a purpose-built tool designed to help veterans, their families, and clinicians resolve service-connected conditions (tinnitus, blast trauma, toxic burn pit exposures) and streamline care under the VA MISSION Act and PACT Act.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="text-base p-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-xs border border-emerald-200 dark:border-emerald-800" aria-hidden="true">♿</span>
            <div>
              <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Public-Domain USWDS &amp; Section 508 Accessibility</p>
              <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                We implement the open-source U.S. Web Design System (USWDS 3.0) and Section 508 / WCAG 2.2 AAA guidelines to ensure high-contrast optotype legibility, screen-reader compatibility, and accessible care for veterans with sensory impairments.
              </p>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class UsaBannerComponent {
  public readonly mode = input<FederalBannerMode>('community-partner');
  public readonly isOpen = signal<boolean>(false);

  public toggleBanner(): void {
    this.isOpen.update(open => !open);
  }
}
