import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VertexAgentBuilderService, IVertexCitation } from '../services/ai/vertex-agent-builder.service';

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
            Vertex AI Grounding
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

        @if (agentService.citationCount() > 0) {
          <button
            type="button"
            (click)="toggleDrawer()"
            class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus:outline-hidden"
          >
            {{ drawerOpen() ? 'Hide Sources ▲' : 'View Sources ▼' }}
          </button>
        }
      </div>

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

  readonly displayScore = computed(() => {
    return (this.agentService.groundingScore() * 100).toFixed(0);
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
}
