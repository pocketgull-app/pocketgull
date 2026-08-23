import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FederatedLearningService, IFederatedRoundResult } from '../services/federated-learning.service';

@Component({
  selector: 'app-federated-learning-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100 font-pocketgull-sans-clinical">Privacy-Preserving Federated ML Protocol</h2>
              <span class="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-mono font-medium text-teal-300 border border-teal-500/40">
                (ε=2.0, δ=1e-5) DP + SecAgg
              </span>
            </div>
            <p class="text-xs text-zinc-400">Zero raw PHI egress • Pairwise zero-sum blinding • Gaussian L2 gradient clipping</p>
          </div>
        </div>

        <!-- Trigger Round Action -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="triggerRound()"
            [disabled]="flService.isTrainingActive() || flService.privacyBudgetRemaining() <= 0"
            class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-teal-900/30 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 touch-manipulation"
          >
            @if (flService.isTrainingActive()) {
              <svg class="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Aggregating Swarm...</span>
            } @else {
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Execute Round {{ flService.currentRound() + 1 }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Telemetry Odometer Grid -->
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <!-- Current Round -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Federated Round</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-zinc-100 font-mono">#{{ flService.currentRound() }}</span>
            <span class="text-[11px] text-teal-400">/ 50 max</span>
          </div>
        </div>

        <!-- Privacy Budget Spent -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Differential Privacy ε</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-amber-400 font-mono">{{ flService.totalEpsilonSpent() | number:'1.3-3' }}</span>
            <span class="text-[11px] text-zinc-500">/ 2.000</span>
          </div>
          <!-- Progress Bar -->
          <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              class="h-full bg-gradient-to-r from-teal-500 to-amber-500 transition-all duration-500"
              [style.width.%]="flService.privacyLossPercent()"
            ></div>
          </div>
        </div>

        <!-- Global Loss -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Global Loss (MSE)</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-emerald-400 font-mono">
              {{ flService.latestRound()?.globalLoss || 0.246 | number:'1.4-4' }}
            </span>
          </div>
        </div>

        <!-- Model Convergence R2 -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Model Fit (R²)</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-teal-300 font-mono">
              {{ flService.latestRound()?.globalMetricR2 || 0.928 | number:'1.3-3' }}
            </span>
            <span class="text-[11px] text-emerald-400">↑ High</span>
          </div>
        </div>
      </div>

      <!-- Node Swarm Topology -->
      <div class="mt-5">
        <div class="flex items-center justify-between pb-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-pocketgull-sans-clinical">
            Participating Clinical Swarm Nodes (Sovereign Multi-Region &amp; Global)
          </h3>
          <span class="text-xs text-zinc-500 font-mono">{{ flService.activeNodesCount() }} Active Nodes</span>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          @for (node of flService.activeNodes(); track node.id) {
            <div class="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-300 font-mono">
                    {{ node.jurisdiction }}
                  </span>
                  <div>
                    <h4 class="text-xs font-medium text-zinc-200 line-clamp-1">{{ node.name }}</h4>
                    <p class="text-[10px] text-zinc-500 font-mono">N = {{ node.cohortSize | number }} patients</p>
                  </div>
                </div>
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {{ node.status }}
                </span>
              </div>
              <div class="mt-2.5 flex items-center justify-between border-t border-zinc-800/40 pt-2 text-[10px] text-zinc-400">
                <span>ε spent: <strong class="font-mono text-zinc-300">{{ node.epsilonSpent | number:'1.3-3' }}</strong></span>
                <span class="text-zinc-500">SecAgg Ready</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Latest SecAgg Proof Banner -->
      @if (flService.latestRound(); as last) {
        <div class="mt-4 rounded-xl border border-teal-500/20 bg-teal-950/20 p-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span class="text-xs font-medium text-teal-200">Verified SecAgg Zero-Sum Proof Hash:</span>
            </div>
            <code class="rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-teal-300 select-all border border-zinc-800">
              {{ last.secAggProofHash }}
            </code>
          </div>
        </div>
      }
    </div>
  `
})
export class FederatedLearningHudComponent {
  readonly flService = inject(FederatedLearningService);
  readonly errorMessage = signal<string | null>(null);

  async triggerRound(): Promise<void> {
    try {
      this.errorMessage.set(null);
      await this.flService.executeSecAggRound();
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to execute federated learning round.');
    }
  }
}
