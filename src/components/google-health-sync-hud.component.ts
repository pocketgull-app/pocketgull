import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleHealthApiService } from '../services/hardware/google-health-api.service';

@Component({
  selector: 'app-google-health-sync-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 font-sans space-y-4" role="region" aria-label="Google Health API &amp; Health Connect Sync HUD">
      
      <!-- Top Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold">
            <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100">Google Health API &amp; Health Connect</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                Unified 2026 Engine
              </span>
            </div>
            <p class="text-xs text-zinc-400">Continuous biometric telemetry &amp; biophilic recovery syncing</p>
          </div>
        </div>

        <!-- Sync Trigger & Connection State -->
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {{ status().provider === 'ANDROID_HEALTH_CONNECT' ? 'Health Connect (Pixel)' : 'Google Health API' }}
          </span>
          <button
            type="button"
            (click)="syncNow()"
            [disabled]="isSyncing()"
            class="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Sync with Google Health">
            <span>{{ isSyncing() ? 'Syncing...' : 'Sync Now 🔄' }}</span>
          </button>
        </div>
      </div>

      <!-- Biometric Telemetry Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <!-- Metric 1: Resting Heart Rate -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Resting HR</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl font-bold font-mono text-zinc-100 tabular-nums">{{ bio().restingHeartRateBpm }}</span>
            <span class="text-xs text-zinc-400">bpm</span>
          </div>
          <span class="text-[10px] text-emerald-400 block">Optimal Recovery</span>
        </div>

        <!-- Metric 2: HRV (RMSSD) -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">HRV (RMSSD)</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl font-bold font-mono text-cyan-300 tabular-nums">{{ bio().heartRateVariabilityRmssdMs.toFixed(1) }}</span>
            <span class="text-xs text-zinc-400">ms</span>
          </div>
          <span class="text-[10px] text-cyan-400 block">High Parasympathetic</span>
        </div>

        <!-- Metric 3: SpO2 Oxygen -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">SpO₂ Oxygen</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl font-bold font-mono text-teal-300 tabular-nums">{{ bio().oxygenSaturationSpO2Pct.toFixed(1) }}%</span>
          </div>
          <span class="text-[10px] text-teal-400 block">Arterial Baseline</span>
        </div>

        <!-- Metric 4: Vagal Tone Recovery Index -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Vagal Tone</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl font-bold font-mono text-emerald-400 tabular-nums">{{ vagalTone() }}/100</span>
          </div>
          <span class="text-[10px] text-emerald-400 block">Autonomic Resilience</span>
        </div>

      </div>

      <!-- Secondary Metrics: Sleep Architecture & Biophilic Green Minutes -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        <!-- Sleep Card -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div>
            <span class="font-bold text-zinc-200 block">Sleep Architecture</span>
            <span class="text-[11px] text-zinc-400">
              {{ (bio().sleepDurationMinutes / 60).toFixed(1) }} hrs · {{ bio().deepSleepMinutes }}m Deep · {{ bio().sleepEfficiencyPct }}% Eff
            </span>
          </div>
          <span class="text-lg">🌙</span>
        </div>

        <!-- Green Walk Minutes -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div>
            <span class="font-bold text-zinc-200 block">Green Rx Minutes</span>
            <span class="text-[11px] text-emerald-400 font-mono">
              {{ bio().prescribedGreenWalkMinutes }} min prescribed completed
            </span>
          </div>
          <span class="text-lg">🌲</span>
        </div>

        <!-- Daily Steps -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div>
            <span class="font-bold text-zinc-200 block">Step Cadence</span>
            <span class="text-[11px] text-teal-300 font-mono">
              {{ bio().totalDailySteps.toLocaleString() }} steps today
            </span>
          </div>
          <span class="text-lg">👟</span>
        </div>

      </div>

      <!-- Footer Actions & Privacy Policy Notice -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 text-xs">
        <div class="flex items-center gap-1.5 text-zinc-400">
          <span class="text-cyan-400">🛡️</span>
          <span>Google Health API Restricted Scopes · Ephemeral session retention only</span>
        </div>
        <button
          type="button"
          (click)="disconnect()"
          class="min-h-[44px] px-3 py-1.5 rounded-lg border border-red-800/60 bg-red-950/30 hover:bg-red-950/50 text-red-300 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-red-400">
          Disconnect &amp; Erase Data
        </button>
      </div>

    </div>
  `
})
export class GoogleHealthSyncHudComponent {
  private readonly healthService = inject(GoogleHealthApiService);

  readonly status = this.healthService.connectionStatus;
  readonly bio = this.healthService.liveBiometrics;
  readonly isSyncing = this.healthService.isSyncing;
  readonly vagalTone = this.healthService.vagalToneRecoveryIndex;

  syncNow(): void {
    this.healthService.syncBiometrics();
  }

  disconnect(): void {
    this.healthService.disconnectAndEraseData();
  }
}
