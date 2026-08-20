import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalMoERouterService, IExpertSubnet } from '../../services/clinical-moe-router.service';

@Component({
  selector: 'app-pathways-moe-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left font-sans">
      <!-- Pathways MoE Telemetry Pill -->
      <button
        type="button"
        (click)="toggleExpanded()"
        [attr.aria-expanded]="isExpanded()"
        class="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 border shadow-sm cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        [ngClass]="{
          'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-900/20': savingsPercent() > 20,
          'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 hover:border-indigo-400/60 shadow-indigo-900/20': savingsPercent() <= 20
        }"
      >
        <!-- Pulse Indicator for Active Sub-networks -->
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <!-- Badge Label & FLOP Savings -->
        <span class="flex items-center gap-1.5 tracking-wide">
          <span class="text-emerald-400 group-hover:scale-110 transition-transform">⚡</span>
          <span>Pathways MoE</span>
          <span class="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            +{{ savingsPercent() }}% FLOP Savings
          </span>
        </span>

        <!-- Active Subnets Count Pill -->
        <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700">
          {{ activeExperts().length }} {{ activeExperts().length === 1 ? 'Expert' : 'Experts' }}
        </span>

        <!-- Chevron Icon -->
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 group-hover:text-zinc-200"
          [ngClass]="{ 'rotate-180': isExpanded() }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Sub-network Drawer Popover -->
      @if (isExpanded()) {
        <div
          class="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-900/95 border border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <div>
              <h4 class="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <span>Sparse Dynamic Route</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  Pathways MoE
                </span>
              </h4>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Active Diagnostic Lens: <span class="text-zinc-200 font-medium">{{ activeLens() }}</span>
              </p>
            </div>
            <button
              (click)="isExpanded.set(false)"
              class="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Active Subnets List -->
          <div class="space-y-2">
            <p class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Active Sub-Networks ({{ activeExperts().length }} / 4)
            </p>

            @for (expert of activeExperts(); track expert.id) {
              <div class="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between hover:bg-zinc-800 transition-colors">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <div class="text-xs font-medium text-zinc-200">{{ expert.name }}</div>
                    <div class="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      @if (expert.requiresSidecar) {
                        <span class="text-amber-400 font-mono">Python Sidecar</span>
                      }
                      @if (expert.requiresAudioStream) {
                        <span class="text-cyan-400 font-mono">Audio Stream</span>
                      }
                      @if (expert.requires3DShader) {
                        <span class="text-purple-400 font-mono">WebGL Shader</span>
                      }
                    </div>
                  </div>
                </div>

                <span class="font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">
                  {{ expert.estimatedFlopsGiga }} GFLOPs
                </span>
              </div>
            }
          </div>

          <!-- Footer Compute Savings Bar -->
          <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span class="text-zinc-400">Dense Pass Footprint:</span>
            <span class="font-mono text-zinc-400 line-through">1.88 GFLOPs</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-xs">
            <span class="text-emerald-400 font-medium">Sparse Compute Footprint:</span>
            <span class="font-mono text-emerald-300 font-bold">{{ activeFlops() }} GFLOPs</span>
          </div>
        </div>
      }
    </div>
  `
})
export class PathwaysMoeBadgeComponent {
  readonly moeRouter = (() => {
    try {
      return inject(ClinicalMoERouterService);
    } catch (e) {
      return new ClinicalMoERouterService();
    }
  })();

  readonly isExpanded = signal(false);
  readonly activeLens = computed(() => this.moeRouter.activeLens());
  readonly activeExperts = computed(() => this.moeRouter.activeExpertCluster());
  readonly savingsPercent = computed(() => this.moeRouter.computeEfficiencySavingsPercent());

  readonly activeFlops = computed(() => {
    const sum = this.activeExperts().reduce((acc: number, e: IExpertSubnet) => acc + e.estimatedFlopsGiga, 0);
    return Math.round(sum * 100) / 100;
  });

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }
}
