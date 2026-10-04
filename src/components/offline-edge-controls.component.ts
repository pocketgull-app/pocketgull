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
          <button (click)="runReachabilityProbe()" type="button"
                  id="btn-probe-ping"
                  class="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5">
            <span>🌐</span> Probe Ping
          </button>
          <button (click)="toggleForceOffline()" type="button"
                  id="btn-toggle-force-offline"
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10 font-sans">
        
        <!-- 1. Network & Provider Status -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Engine</span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md" [ngClass]="{
              'bg-emerald-950 text-emerald-300 border border-emerald-800': network.networkQuality() === 'OPTIMAL',
              'bg-amber-950 text-amber-300 border border-amber-800': network.networkQuality() === 'CONSTRAINED',
              'bg-rose-950 text-rose-300 border border-rose-800': network.networkQuality() === 'LIE_FI_SUSPECTED',
              'bg-zinc-800 text-zinc-400 border border-zinc-700': network.networkQuality() === 'OFFLINE'
            }">{{ network.networkQuality() }}</span>
          </div>
          <div class="mt-2 flex items-baseline gap-2 font-mono">
            <span class="text-lg font-black text-emerald-400">{{ network.activeProvider() }}</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono">
            <span>{{ network.isOnline() ? 'Connected' : 'Edge-Only' }}</span>
            <span>RTT: {{ network.latencyMs() ? network.latencyMs() + 'ms' : '--' }}</span>
          </div>
        </div>

        <!-- 2. Store-and-Forward Sync Queue -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Store &amp; Forward</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border"
                  [class.bg-amber-950]="network.pendingQueueCount() > 0"
                  [class.text-amber-300]="network.pendingQueueCount() > 0"
                  [class.border-amber-800]="network.pendingQueueCount() > 0"
                  [class.bg-zinc-800]="network.pendingQueueCount() === 0"
                  [class.text-zinc-400]="network.pendingQueueCount() === 0"
                  [class.border-zinc-700]="network.pendingQueueCount() === 0">
              {{ network.pendingQueueCount() }} Queued
            </span>
          </div>
          <div class="mt-2">
            <button (click)="flushSyncQueue()"
                    type="button"
                    id="btn-sync-offline-queue"
                    [disabled]="network.isFlushingQueue() || network.pendingQueueCount() === 0"
                    class="w-full py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer': !network.isFlushingQueue() && network.pendingQueueCount() > 0,
                      'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed': network.pendingQueueCount() === 0 && !network.isFlushingQueue(),
                      'bg-teal-900/50 text-teal-300 border border-teal-700 animate-pulse cursor-wait': network.isFlushingQueue()
                    }">
              @if (network.isFlushingQueue()) {
                <span>🔄 Syncing Queue...</span>
              } @else {
                <span>⚡ Sync Queue Now</span>
              }
            </button>
          </div>
          <div class="text-[10px] text-zinc-500 mt-2 font-mono truncate">
            @if (network.isLieFiSuspected()) {
              <span class="text-rose-400 font-bold">⚠️ Lie-Fi: Cloud Unreachable</span>
            } @else if (network.lastSyncTimestamp()) {
              <span>Last sync: {{ network.lastSyncTimestamp() | date:'shortTime' }}</span>
            } @else {
              <span>Encrypted Local FIFO</span>
            }
          </div>
        </div>

        <!-- 3. PWA Service Worker Status -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">PWA Service Worker</span>
          <div class="mt-2 flex items-center gap-2 font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span class="text-sm font-bold text-zinc-200">Prefetched &amp; Active</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono truncate">
            Groups: app-shell + wasm
          </span>
        </div>

        <!-- 4. Pre-fetch Model Weights Action -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Edge Model Pre-Fetch</span>
          
          @if (edgeAi.isDownloading()) {
            <div class="mt-2 space-y-1">
              <div class="flex justify-between text-xs font-mono text-emerald-400">
                <span>Caching Weights...</span>
                <span>{{ edgeAi.downloadProgressPct() }}%</span>
              </div>
              <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-300" [style.width.%]="edgeAi.downloadProgressPct()"></div>
              </div>
            </div>
          } @else {
            <button (click)="prefetchModel()" type="button"
                    class="mt-2 w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center gap-1.5">
              <span>📥</span> Pre-Fetch Gemma (85MB)
            </button>
          }
          <span class="text-[11px] text-zinc-500 mt-2 font-mono truncate">
            BioBERT: Cached | Gemma-2B: Ready
          </span>
        </div>

      </div>

      <!-- Test Edge Inference Action & Output Area -->
      <div class="bg-zinc-900/70 rounded-2xl p-5 border border-zinc-800/80 relative z-10">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <h4 class="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span>🧪</span> Test Local Edge WebAssembly SBAR Synthesis
          </h4>
          <div class="flex flex-wrap items-center gap-2">
            <button (click)="runTestInference()" type="button"
                    class="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5">
              <span>▶️</span> SBAR Synthesis
            </button>
            <button (click)="runAcuityClassifierTest()" type="button"
                    class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5">
              <span>⚡</span> Acuity Classifier
            </button>
            <button (click)="runSoapScribeTest()" type="button"
                    class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5">
              <span>🎙️</span> Offline SOAP Scribe
            </button>
          </div>
        </div>

        @if (testOutput()) {
          <pre class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{{ testOutput() }}</pre>
        } @else {
          <p class="text-xs text-zinc-500 font-sans italic">
            Select an edge test button above to simulate local on-device SBAR, Acuity Classification, or SOAP Scribe.
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

  async runReachabilityProbe() {
    await this.network.checkReachability();
  }

  async flushSyncQueue() {
    await this.network.flushOfflineQueue();
  }

  prefetchModel() {
    this.edgeAi.prefetchModelWeights('gemma-2b-quantized-wasm');
  }

  async runTestInference() {
    this.testOutput.set('Synthesizing SBAR via local WebAssembly engine...');
    const result = await this.edgeAi.synthesizeOfflineClinicalReport('Routine patient evaluation');
    this.testOutput.set(result);
  }

  async runAcuityClassifierTest() {
    this.testOutput.set('Running on-device acuity classifier (Chrome Built-in AI / Gemma 4)...');
    const res = await this.edgeAi.classifyAcuity('Patient in trauma pod with crushing retrosternal chest pain and shortness of breath.');
    const formatted = `[ON-DEVICE ACUITY CLASSIFICATION]
CATEGORY: ${res.category}
CONFIDENCE: ${(res.confidence * 100).toFixed(0)}%
ENGINE: ${res.modelEngine} (${res.latencyMs}ms)
RATIONALE: ${res.rationale}
ISMP SAFETY: ${res.ismpSafetyAudit.isSafe ? 'VERIFIED SAFE' : 'WARNINGS FOUND'}`;
    this.testOutput.set(formatted);
  }

  async runSoapScribeTest() {
    this.testOutput.set('Structuring dictation into SOAP format with ISMP posology check...');
    const res = await this.edgeAi.structureVoiceNoteOffline('Patient reports burning lower spine ache after lifting. Order gabapentin 300.0 mg and .5 mg clonazepam at bedtime.');
    this.testOutput.set(res.formattedNote);
  }
}
