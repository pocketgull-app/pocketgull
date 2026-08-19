import { Component, ChangeDetectionStrategy, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolePathwayDocsService, ClinicalRolePathway, IPathwayDocumentation } from '../services/role-pathway-docs.service';

@Component({
  selector: 'app-role-pathway-documentation-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-950/95 text-zinc-100 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Top Header & Role Selector -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-xs">
            🧭
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              Role & Pathway Adaptive Documentation
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Persona-Tailored View
              </span>
            </h3>
            <p class="text-xs text-zinc-400">
              Select your clinical role to customize documentation depth, relevant tool recommendations, and regulatory standards.
            </p>
          </div>
        </div>

        <div class="text-xs font-mono text-zinc-400">
          Viewing as: <strong class="text-indigo-400 font-bold">{{ currentPathwayDoc().roleTitle }}</strong>
        </div>
      </div>

      <!-- 5 Role Pathway Selection Buttons -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        @for (pathway of allPathways(); track pathway.pathwayId) {
          <button (click)="selectPathway(pathway.pathwayId)"
                  [class.border-indigo-500]="activePathwayId() === pathway.pathwayId"
                  [class.bg-indigo-950/50]="activePathwayId() === pathway.pathwayId"
                  [class.ring-2]="activePathwayId() === pathway.pathwayId"
                  [class.ring-indigo-500/40]="activePathwayId() === pathway.pathwayId"
                  [class.border-zinc-800]="activePathwayId() !== pathway.pathwayId"
                  [class.bg-zinc-900/80]="activePathwayId() !== pathway.pathwayId"
                  class="p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-850 flex flex-col justify-between space-y-1.5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xl">{{ pathway.icon }}</span>
              @if (activePathwayId() === pathway.pathwayId) {
                <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              }
            </div>
            <div>
              <span class="text-xs font-bold block text-white leading-snug">{{ pathway.roleTitle.split('&')[0] }}</span>
              <span class="text-[10px] font-mono text-zinc-400 block truncate">{{ pathway.targetAudience.split(',')[0] }}</span>
            </div>
          </button>
        }
      </div>

      <!-- Role Overview Banner -->
      <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ currentPathwayDoc().icon }}</span>
            <h4 class="text-sm font-black text-white">{{ currentPathwayDoc().roleTitle }}</h4>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-[10px] font-mono text-indigo-300 font-bold border border-zinc-700">
            Tone: {{ currentPathwayDoc().toneAndDensity.split('(')[0] }}
          </span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          {{ currentPathwayDoc().tagline }}
        </p>
      </div>

      <!-- 2-Column: Quick Actions + Recommended Tools -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- Left: Quick Actions -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
            <span>⚡ High-Priority Actions for Your Role</span>
          </h4>
          <div class="space-y-2.5">
            @for (action of currentPathwayDoc().quickActions; track action.title) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {{ action.icon }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h5 class="text-xs font-bold text-white">{{ action.title }}</h5>
                      <span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                        {{ action.badge }}
                      </span>
                    </div>
                    <p class="text-[11px] text-zinc-400 mt-0.5">{{ action.description }}</p>
                  </div>
                </div>
                <button (click)="navigateToTab.emit(action.targetTabId)"
                        class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold transition cursor-pointer shrink-0 shadow-xs">
                  Launch →
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Right: Recommended Tool Suite -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
            <span>🧰 Curated Tool Matrix</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            @for (tool of currentPathwayDoc().recommendedTools; track tool.name) {
              <button (click)="navigateToTab.emit(tool.tabId)"
                      class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left hover:border-cyan-500/50 transition cursor-pointer group flex flex-col justify-between">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-base">{{ tool.icon }}</span>
                  <span class="text-xs font-bold text-white group-hover:text-cyan-300 transition">{{ tool.name }}</span>
                </div>
                <p class="text-[10px] text-zinc-400 line-clamp-2">{{ tool.purpose }}</p>
              </button>
            }
          </div>
        </div>

      </div>

      <!-- Regulatory Standards & Compliance Footer -->
      <div class="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-mono uppercase font-bold text-indigo-300 text-[10px]">
            Governance & Standards Compliance:
          </span>
          <div class="flex flex-wrap gap-1.5">
            @for (std of currentPathwayDoc().regulatoryAndStandards; track std) {
              <span class="px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-200 text-[10px] font-mono font-semibold border border-indigo-700/40">
                {{ std }}
              </span>
            }
          </div>
        </div>
        <p class="text-zinc-400 text-[11px] italic pt-1 border-t border-indigo-500/20">
          "{{ currentPathwayDoc().takeHomeSummary }}"
        </p>
      </div>

    </div>
  `
})
export class RolePathwayDocumentationHubComponent {
  private docsService = inject(RolePathwayDocsService);

  readonly navigateToTab = output<string>();

  activePathwayId = computed(() => this.docsService.activePathway());
  allPathways = computed(() => this.docsService.getAllPathways());
  currentPathwayDoc = computed<IPathwayDocumentation>(() => this.docsService.getPathway(this.activePathwayId()));

  selectPathway(id: ClinicalRolePathway): void {
    this.docsService.setPathway(id);
  }
}
