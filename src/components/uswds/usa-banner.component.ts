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
      [attr.aria-label]="mode() === 'official-gov' ? 'Official website of the United States government' : 'Independent Healthcare Provider conforming to USWDS accessibility standards'"
    >
      <div class="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <!-- Emblem / Flag Vector -->
          @if (mode() === 'official-gov') {
            <span class="inline-flex items-center justify-center w-4 h-3 bg-red-700 rounded-[1px] overflow-hidden border border-zinc-300 dark:border-zinc-700 shrink-0" aria-hidden="true">
              <span class="w-full h-full bg-linear-to-b from-red-600 via-white to-blue-800 opacity-90"></span>
            </span>
            <p class="m-0 font-medium text-[11px] sm:text-xs">
              An official website of the United States government
            </p>
          } @else {
            <span class="inline-flex items-center justify-center w-4 h-4 bg-[#005ea2] text-white rounded-xs text-[10px] font-bold shrink-0" aria-hidden="true">
              🏥
            </span>
            <p class="m-0 font-medium text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200">
              <strong class="text-[#005ea2] dark:text-blue-400">Independent Healthcare Practice</strong> • Built with U.S. Web Design System (USWDS 3.0) for VA Community Care &amp; CMS Interoperability
            </p>
          }
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
          @if (mode() === 'official-gov') {
            <div class="flex items-start gap-3">
              <span class="text-base p-1 bg-blue-100 dark:bg-blue-950/60 rounded-xs border border-blue-200 dark:border-blue-800" aria-hidden="true">🏛️</span>
              <div>
                <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Official websites use .gov</p>
                <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                  A <strong>.gov</strong> website belongs to an official government organization in the United States.
                </p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <span class="text-base p-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-xs border border-emerald-200 dark:border-emerald-800" aria-hidden="true">🔒</span>
              <div>
                <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Secure .gov websites use HTTPS</p>
                <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                  A lock (🔒) or <strong>https://</strong> means you've safely connected to the .gov website. Share sensitive clinical or personal information only on official, secure websites.
                </p>
              </div>
            </div>
          } @else {
            <div class="flex items-start gap-3">
              <span class="text-base p-1 bg-blue-100 dark:bg-blue-950/60 rounded-xs border border-blue-200 dark:border-blue-800" aria-hidden="true">🏥</span>
              <div>
                <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Non-Governmental Healthcare Practice</p>
                <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                  PocketGull is an <strong>independent clinical decision support engine</strong>. It is not an agency of the federal government or VA, but partners with VA Community Care Network (CCN) providers and private clinicians under the VA MISSION Act (P.L. 115-182).
                </p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <span class="text-base p-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-xs border border-emerald-200 dark:border-emerald-800" aria-hidden="true">⚡</span>
              <div>
                <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">Public-Domain USWDS &amp; Section 508 Standards</p>
                <p class="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5 leading-relaxed">
                  We adopt open-source federal design tokens, 7:1 contrast ratios, and FHIR US Core R4 interoperability to ensure veterans and Medicare patients experience zero friction and seamless electronic health record exchange.
                </p>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class UsaBannerComponent {
  public readonly mode = input<FederalBannerMode>('official-gov');
  public readonly isOpen = signal<boolean>(false);

  public toggleBanner(): void {
    this.isOpen.update(open => !open);
  }
}
