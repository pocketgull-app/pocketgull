import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * USWDS 3.x Federal Footer
 * Implements statutory federal links, return-to-top anchor,
 * and Veterans Crisis Line integration.
 */
@Component({
  selector: 'app-usa-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="usa-footer bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-400 mt-auto shrink-0 print:bg-white print:text-black print:border-t-2 print:border-[#005ea2]">
      <!-- Return to top -->
      <div class="no-print max-w-7xl mx-auto px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/80 text-right">
        <a 
          href="#federal-main-content" 
          class="inline-flex items-center gap-1 font-semibold text-[#005ea2] dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-[#2491ff] rounded-xs px-1"
        >
          <span>Return to top</span>
          <span aria-hidden="true">↑</span>
        </a>
      </div>

      <!-- Main Footer Body -->
      <div class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Agency Info -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-base" aria-hidden="true">🏛️</span>
            <p class="font-bold text-zinc-900 dark:text-zinc-100 m-0">
              Federal Health Clinical Intelligence Engine
            </p>
          </div>
          <p class="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 m-0">
            An exploratory clinical decision support (CDS) architecture designed for integration with VA Health System (VistA/EHRM), CMS Medicare/Medicaid Quality Payment Programs, and HHS ONC HTI-1 health data environments.
          </p>
          <div class="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">
            Conforms to USWDS 3.0 • OMB M-23-22 • Section 508 (29 U.S.C. § 794d)
          </div>
        </div>

        <!-- Statutory & Governance Links -->
        <div class="space-y-2">
          <p class="font-bold uppercase tracking-wider text-[11px] text-zinc-900 dark:text-zinc-200 m-0">
            Statutory Transparency &amp; Governance
          </p>
          <ul class="list-none p-0 m-0 space-y-1.5 text-[11px]">
            <li>
              <a href="#accessibility" class="text-blue-700 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-[#2491ff]">
                Section 508 Accessibility Statement
              </a>
            </li>
            <li>
              <a href="#privacy" class="text-blue-700 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-[#2491ff]">
                Privacy Act &amp; SORN Disclosures (5 U.S.C. § 552a)
              </a>
            </li>
            <li>
              <a href="#foia" class="text-blue-700 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-[#2491ff]">
                Freedom of Information Act (FOIA)
              </a>
            </li>
            <li>
              <a href="#vdp" class="text-blue-700 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-[#2491ff]">
                Vulnerability Disclosure Policy (VDP)
              </a>
            </li>
          </ul>
        </div>

        <!-- 988 Veterans Crisis Box -->
        <div class="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xs space-y-1.5">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs">
            <span>🎖️</span>
            <span>Veterans Crisis Line</span>
          </div>
          <p class="text-[11px] text-red-900 dark:text-red-200 m-0 leading-relaxed">
            Are you a Veteran in crisis or concerned about one? Connect with the Veterans Crisis Line to reach caring, qualified responders 24/7.
          </p>
          <div class="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
            <span class="px-2 py-0.5 bg-red-700 text-white rounded-xs">Dial 988, Press 1</span>
            <span class="px-2 py-0.5 bg-white dark:bg-zinc-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 rounded-xs">Text 838255</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class UsaFooterComponent {}
