import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FederalTabType = 'care-plan' | 'intake' | 'fhir' | 'audit';

/**
 * USWDS 3.x Federal Basic Header with Skip Navigation
 * Conforms to 21st Century IDEA Act branding standards and Section 508 accessibility.
 */
@Component({
  selector: 'app-usa-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 508 Skip Navigation Target -->
    <a 
      href="#federal-main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#005ea2] focus:text-white focus:font-bold focus:shadow-xl focus:outline-hidden focus:ring-4 focus:ring-[#2491ff]"
    >
      Skip to main content
    </a>

    <header class="usa-header no-print border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shrink-0 print:hidden">
      <!-- Title Bar -->
      <div class="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <!-- Federal Health Emblem -->
          <div class="w-10 h-10 rounded-sm bg-[#005ea2] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#1a4480] shrink-0 select-none">
            🦅
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#005ea2] dark:text-blue-400 font-mono">
                U.S. Federal Health Workstation
              </span>
              <span class="px-1.5 py-0.5 rounded-xs text-[10px] font-bold uppercase font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                USWDS 3.0 • IDEA ACT
              </span>
            </div>
            <h1 class="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight m-0">
              PocketGull Clinical Decision Support (CDS) Edition
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Print Clinical Care Plan Action -->
          <button
            type="button"
            (click)="printPlan.emit()"
            class="no-print px-3 py-1.5 rounded-xs bg-[#005ea2] hover:bg-[#1a4480] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff]"
            aria-label="Print Clinical Care Plan"
          >
            🖨️ Print Plan
          </button>

          <!-- 988 Lifeline Fast Vector -->
          <div class="no-print hidden sm:flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xs text-xs">
            <span class="text-red-700 dark:text-red-400 font-bold">🆘 988 Lifeline:</span>
            <span class="text-zinc-700 dark:text-zinc-300">Dial 988, Press 1 for Veterans</span>
          </div>

          <!-- Close Modal Vector -->
          <button
            type="button"
            (click)="closePortal.emit()"
            class="no-print px-3 py-1.5 rounded-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff]"
            aria-label="Return to Primary Clinical Chart"
          >
            ✕ Exit Federal View
          </button>
        </div>
      </div>

      <!-- USWDS Primary Navigation Bar -->
      <nav class="usa-nav no-print bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-200 dark:border-zinc-800 px-4" aria-label="Federal Workstation Navigation">
        <div class="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          <button
            type="button"
            (click)="tabChange.emit('care-plan')"
            [class.border-[#005ea2]]="activeTab() === 'care-plan'"
            [class.text-[#005ea2]]="activeTab() === 'care-plan'"
            [class.dark:text-blue-400]="activeTab() === 'care-plan'"
            [class.dark:border-blue-400]="activeTab() === 'care-plan'"
            [class.bg-white]="activeTab() === 'care-plan'"
            [class.dark:bg-zinc-950]="activeTab() === 'care-plan'"
            [attr.aria-current]="activeTab() === 'care-plan' ? 'page' : null"
            class="px-3.5 py-2 text-xs font-semibold border-b-2 border-transparent hover:text-[#005ea2] dark:hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff] focus-visible:outline-hidden"
          >
            🎖️ Veteran & Beneficiary CDS Plan
          </button>

          <button
            type="button"
            (click)="tabChange.emit('intake')"
            [class.border-[#005ea2]]="activeTab() === 'intake'"
            [class.text-[#005ea2]]="activeTab() === 'intake'"
            [class.dark:text-blue-400]="activeTab() === 'intake'"
            [class.dark:border-blue-400]="activeTab() === 'intake'"
            [class.bg-white]="activeTab() === 'intake'"
            [class.dark:bg-zinc-950]="activeTab() === 'intake'"
            [attr.aria-current]="activeTab() === 'intake' ? 'page' : null"
            class="px-3.5 py-2 text-xs font-semibold border-b-2 border-transparent hover:text-[#005ea2] dark:hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff] focus-visible:outline-hidden"
          >
            📋 Clinical Intake & Triage Steps
          </button>

          <button
            type="button"
            (click)="tabChange.emit('fhir')"
            [class.border-[#005ea2]]="activeTab() === 'fhir'"
            [class.text-[#005ea2]]="activeTab() === 'fhir'"
            [class.dark:text-blue-400]="activeTab() === 'fhir'"
            [class.dark:border-blue-400]="activeTab() === 'fhir'"
            [class.bg-white]="activeTab() === 'fhir'"
            [class.dark:bg-zinc-950]="activeTab() === 'fhir'"
            [attr.aria-current]="activeTab() === 'fhir' ? 'page' : null"
            class="px-3.5 py-2 text-xs font-semibold border-b-2 border-transparent hover:text-[#005ea2] dark:hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff] focus-visible:outline-hidden"
          >
            ⚡ FHIR US Core R4 Matrix
          </button>

          <button
            type="button"
            (click)="tabChange.emit('audit')"
            [class.border-[#005ea2]]="activeTab() === 'audit'"
            [class.text-[#005ea2]]="activeTab() === 'audit'"
            [class.dark:text-blue-400]="activeTab() === 'audit'"
            [class.dark:border-blue-400]="activeTab() === 'audit'"
            [class.bg-white]="activeTab() === 'audit'"
            [class.dark:bg-zinc-950]="activeTab() === 'audit'"
            [attr.aria-current]="activeTab() === 'audit' ? 'page' : null"
            class="px-3.5 py-2 text-xs font-semibold border-b-2 border-transparent hover:text-[#005ea2] dark:hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2491ff] focus-visible:outline-hidden"
          >
            ⚖️ Section 508 & IDEA Act Audit
          </button>
        </div>
      </nav>
    </header>
  `
})
export class UsaHeaderComponent {
  public readonly activeTab = input<FederalTabType>('care-plan');
  public readonly tabChange = output<FederalTabType>();
  public readonly closePortal = output<void>();
  public readonly printPlan = output<void>();
}
