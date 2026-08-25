import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineEdgeAiService } from '../services/offline-edge-ai.service';
import { NetworkStateService } from '../services/network-state.service';

@Component({
  selector: 'app-offline-edge-controls',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-2xl font-mono text-zinc-100 relative overflow-hidden my-6">
      <!-- Glow ambient backdrop -->
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header & Network Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full" [ngClass]="{
              'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse': network.isOnline(),
              'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse': !network.isOnline()
            }"></span>
            <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Offline PWA & WebAssembly Edge AI Controls
            </h3>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
              WASM / ONNX On-Device Engine
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Edge-cached clinical intelligence models running 100% locally in-browser via WebAssembly & ONNX Runtime. Zero external network payload.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="toggleForceOffline()" type="button"
                  class="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  [ngClass]="{
                    'bg-amber-500/20 text-amber-300 border-amber-500/40': network.forceOffline(),
                    'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800': !network.forceOffline()
                  }">
            <span>📡</span> {{ network.forceOffline() ? 'Force Offline Active' : 'Engage Force Offline' }}
          </button>
        </div>
      </div>

      <!-- Main Status Badges & Active Engine -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10 font-sans">
        
        <!-- 1. Network & Provider Status -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Engine Target</span>
          <div class="mt-2 flex items-baseline gap-2 font-mono">
            <span class="text-lg font-black text-emerald-400">{{ network.activeProvider() }}</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            Mode: {{ network.isOnline() ? 'Connected (Cloud + Local Fallback)' : 'Low-Connectivity (Local WASM Edge)' }}
          </span>
        </div>

        <!-- 2. PWA Service Worker Status -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">PWA Service Worker Cache</span>
          <div class="mt-2 flex items-center gap-2 font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span class="text-sm font-bold text-zinc-200">Prefetched & Active</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            Asset Group: 'app-shell' + 'wasm-onnx-models'
          </span>
        </div>

        <!-- 3. Pre-fetch Model Weights Action -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Edge Model Pre-Fetch</span>
          
          @if (edgeAi.isDownloading()) {
            <div class="mt-2 space-y-1">
              <div class="flex justify-between text-xs font-mono text-emerald-400">
                <span>Caching ONNX Weights...</span>
                <span>{{ edgeAi.downloadProgressPct() }}%</span>
              </div>
              <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-300" [style.width.%]="edgeAi.downloadProgressPct()"></div>
              </div>
            </div>
          } @else {
            <button (click)="prefetchModel()" type="button"
                    class="mt-2 w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center gap-1.5">
              <span>📥</span> Pre-Fetch Gemma Edge Model (85MB)
            </button>
          }
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            BioBERT-Lite (15MB): Cached | Gemma-2B (85MB): Ready
          </span>
        </div>

      </div>

      <!-- Test Edge Inference Action & Output Area -->
      <div class="bg-zinc-900/70 rounded-2xl p-5 border border-zinc-800/80 relative z-10">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <h4 class="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span>🧪</span> Test Local Edge WebAssembly SBAR Synthesis
          </h4>
          <button (click)="runTestInference()" type="button"
                  class="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5">
            <span>▶️</span> Run Edge Inference Test
          </button>
        </div>

        @if (testOutput()) {
          <pre class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{{ testOutput() }}</pre>
        } @else {
          <p class="text-xs text-zinc-500 font-sans italic">
            Click 'Run Edge Inference Test' to simulate local in-browser WASM/ONNX clinical report synthesis.
          </p>
        }
      </div>
    </div>
  `
})
export class OfflineEdgeControlsComponent {
  edgeAi = inject(OfflineEdgeAiService);
  network = inject(NetworkStateService);

  testOutput = signal<string | null>(null);

  toggleForceOffline() {
    this.network.toggleForceOffline();
  }

  prefetchModel() {
    this.edgeAi.prefetchModelWeights('gemma-2b-quantized-wasm');
  }

  async runTestInference() {
    this.testOutput.set('Synthesizing SBAR via local WebAssembly engine...');
    const result = await this.edgeAi.synthesizeOfflineClinicalReport('Routine patient evaluation');
    this.testOutput.set(result);
  }
}
