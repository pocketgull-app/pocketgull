// SPDX-License-Identifier: Apache-2.0
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VertexAgentBuilderService } from '../services/ai/vertex-agent-builder.service';

@Component({
  selector: 'app-grounded-evidence-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs transition-all">
      <!-- Top Status Row -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              [ngClass]="groundingColorClass()"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2.5 w-2.5"
              [ngClass]="groundingColorClass()"
            ></span>
          </span>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Vertex AI + Hybrid RRF Grounding
          </span>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full border"
            [ngClass]="evidenceTierBadgeClass()"
          >
            {{ agentService.topEvidenceTier() }}
          </span>

          <span class="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
            {{ displayScore() }}%
          </span>
        </div>
      </div>

      <!-- Popperian H0 & FDA 21 CFR Part 11 Provenance Strip -->
      <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-zinc-400">
        <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700">
          p = {{ agentService.pValue() }} ({{ agentService.isNullFalsified() ? 'H0 Rejected' : 'H0 Retained' }})
        </span>
        <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700">
          RoB 2: {{ agentService.cochraneRob2() }}
        </span>
        @if (agentService.taxonomyGrounding(); as tax) {
          <span class="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
            LOINC {{ tax.loinc.code }} • SNOMED {{ tax.snomed.id }}
          </span>
        }
        <span
          class="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800 truncate max-w-[180px]"
          [title]="'FDA 21 CFR Part 11 Seal: ' + agentService.sha256Digest()"
        >
          Part 11: {{ shortDigest() }}
        </span>
      </div>

      <!-- Quick Action Summary & Citation Drawer Trigger -->
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mt-1">
        <span>
          @if (agentService.isLoading()) {
            <span class="animate-pulse">Retrieving grounded literature...</span>
          } @else if (agentService.citationCount() > 0) {
            {{ agentService.citationCount() }} Grounded Citation(s) Available
          } @else {
            Ready for Clinical Query
          }
        </span>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="toggleWhyMatters()"
            class="text-teal-700 dark:text-teal-400 hover:underline font-medium focus:outline-hidden cursor-pointer"
          >
            {{ whyMattersOpen() ? 'Hide Value ▲' : '💡 Why This Matters' }}
          </button>

          @if (agentService.citationCount() > 0) {
            <button
              type="button"
              (click)="toggleDrawer()"
              class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus:outline-hidden cursor-pointer"
            >
              {{ drawerOpen() ? 'Hide Sources ▲' : 'View Sources ▼' }}
            </button>
          }
        </div>
      </div>

      <!-- Quiet Workshop Value Education Card (4-Slot Working Memory Aligned) -->
      @if (whyMattersOpen()) {
        <div class="mt-2 p-2.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/70 text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5 animate-fadeIn">
          <div class="font-bold text-teal-800 dark:text-teal-300 flex items-center justify-between">
            <span>🛡️ Quiet Workshop Guide: Clinical & Workflow Value</span>
            <span class="font-mono text-[10px]">Saves ~4 min/visit</span>
          </div>
          <ul class="list-disc pl-4 space-y-1">
            <li><strong>Zero Unchecked Hallucinations:</strong> Tests every claim against Popperian <code>H0</code> falsifiability (<code>p &lt; 0.05</code>) and Gigerenzer natural frequencies (<code>out of 10,000 patients</code>).</li>
            <li><strong>Instant EHR Coding:</strong> Auto-maps citations to discrete <strong>LOINC</strong> and <strong>SNOMED-CT</strong> codes so you never copy-paste 1,500-word text walls.</li>
            <li><strong>Audit-Ready Provenance:</strong> Stamps an immutable <strong>FDA 21 CFR Part 11</strong> SHA-256 integrity seal on every clinical synthesis.</li>
          </ul>
        </div>
      }

      <!-- Expandable Citation List -->
      @if (drawerOpen() && agentService.citationCount() > 0) {
        <div class="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2 animate-fadeIn">
          @for (citation of agentService.citations(); track citation.uri) {
            <div class="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 text-xs">
              <div class="flex items-start justify-between gap-2">
                <a
                  [href]="citation.uri"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                >
                  {{ citation.title }} ↗
                </a>
                <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                  {{ (citation.relevanceScore * 100).toFixed(0) }}% match
                </span>
              </div>
              <p class="text-slate-600 dark:text-zinc-400 text-[11px] mt-1 line-clamp-2 italic">
                "{{ citation.snippet }}"
              </p>
              @if (citation.loincCode || citation.sha256Digest) {
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  @if (citation.loincCode) {
                    <span>LOINC: {{ citation.loincCode }}</span>
                  }
                  @if (citation.snomedId) {
                    <span>• SNOMED: {{ citation.snomedId }}</span>
                  }
                  @if (citation.cochraneRob2) {
                    <span>• RoB 2: {{ citation.cochraneRob2 }}</span>
                  }
                  @if (citation.sha256Digest) {
                    <span class="truncate max-w-[140px]" [title]="citation.sha256Digest">
                      • {{ citation.sha256Digest }}
                    </span>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class GroundedEvidenceBadgeComponent {
  readonly agentService = inject(VertexAgentBuilderService);
  readonly drawerOpen = signal<boolean>(false);
  readonly whyMattersOpen = signal<boolean>(false);

  readonly displayScore = computed(() => {
    return (this.agentService.groundingScore() * 100).toFixed(0);
  });

  readonly shortDigest = computed(() => {
    const full = this.agentService.sha256Digest() || '';
    return full.length > 22 ? `${full.slice(0, 22)}…` : full;
  });

  readonly groundingColorClass = computed(() => {
    return this.agentService.isHighGrounding() ? 'bg-emerald-500' : 'bg-amber-500';
  });

  readonly evidenceTierBadgeClass = computed(() => {
    const tier = this.agentService.topEvidenceTier();
    if (tier.includes('Tier A')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (tier.includes('Tier B')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
  });

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  toggleWhyMatters(): void {
    this.whyMattersOpen.update((v) => !v);
  }
}
