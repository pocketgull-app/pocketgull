import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebLlmHealthService } from '../../services/webllm-health.service';

@Component({
  selector: 'app-webllm-health-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950/90 text-zinc-100 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 font-mono text-xs shadow-xl backdrop-blur-md">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">⚡</span>
          <div>
            <h4 class="font-bold text-zinc-100 uppercase tracking-wider text-[11px]">Edge AI &amp; WebGPU Diagnostic Sentinel</h4>
            <p class="text-[10px] text-zinc-400 font-sans">Zero Cloud PHI Inference &amp; Hardware Profile</p>
          </div>
        </div>

        <button
          type="button"
          (click)="refresh()"
          [disabled]="healthService.isChecking()"
          class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold cursor-pointer transition disabled:opacity-50"
        >
          @if (healthService.isChecking()) {
            <span>⏳ Probing...</span>
          } @else {
            <span>🔄 Re-Probe</span>
          }
        </button>
      </div>

      <!-- Status Pills -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div class="text-[9.5px] uppercase text-zinc-400">WebGPU Engine</div>
          <div class="text-xs font-bold mt-0.5" [class.text-emerald-400]="profile().supported" [class.text-amber-400]="!profile().supported">
            {{ profile().supported ? '🟢 Accelerated' : '🟡 CPU Fallback' }}
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div class="text-[9.5px] uppercase text-zinc-400">VRAM Capacity</div>
          <div class="text-xs font-bold text-cyan-300 mt-0.5">
            {{ profile().estimatedVramTier }}
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div class="text-[9.5px] uppercase text-zinc-400">Buffer Size</div>
          <div class="text-xs font-bold text-teal-300 mt-0.5">
            {{ profile().maxBufferSizeMb > 0 ? profile().maxBufferSizeMb + ' MB' : 'Standard' }}
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div class="text-[9.5px] uppercase text-zinc-400">OPFS Storage</div>
          <div class="text-xs font-bold text-indigo-300 mt-0.5">
            {{ profile().storageQuotaMb > 0 ? (profile().storageQuotaMb / 1024).toFixed(1) + ' GB' : 'Unlimited' }}
          </div>
        </div>
      </div>

      <!-- Adapter & Recommended Model Info -->
      <div class="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5 text-[10.5px]">
        <div class="flex items-center justify-between">
          <span class="text-zinc-400">GPU Adapter:</span>
          <span class="text-zinc-200 font-bold">{{ profile().adapterDescription || profile().adapterVendor || 'System Default' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-zinc-400">Optimal Local Model:</span>
          <span class="text-emerald-400 font-bold">{{ profile().recommendedModel }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-zinc-400">Privacy Safeguard:</span>
          <span class="text-cyan-400 font-bold">100% On-Device Client Execution (0 Egress)</span>
        </div>
      </div>
    </div>
  `
})
export class WebLlmHealthCardComponent implements OnInit {
  healthService: WebLlmHealthService;
  profile: any;

  constructor() {
    try {
      this.healthService = inject(WebLlmHealthService);
    } catch {
      this.healthService = new WebLlmHealthService();
    }
    this.profile = this.healthService.profile;
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.healthService.probeHardware();
  }
}
