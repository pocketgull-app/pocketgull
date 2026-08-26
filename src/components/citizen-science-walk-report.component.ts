import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitizenScienceTelemetryService } from '../services/citizen-science-telemetry.service';

@Component({
  selector: 'app-citizen-science-walk-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 font-sans space-y-4" role="region" aria-label="Citizen Science Environmental Walk Report">
      
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xl font-bold">
            🌍
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100">Citizen Science Environmental Stream</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-teal-950/80 text-teal-300 border border-teal-800/50">
                Open Science &amp; Dividends
              </span>
            </div>
            <p class="text-xs text-zinc-400">Passive, privacy-preserved environmental mapping while you heal</p>
          </div>
        </div>

        <!-- Opt-In Toggle & Wallet -->
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <span class="text-[10px] font-mono text-zinc-400 block uppercase">Research Dividend Wallet</span>
            <span class="text-sm font-mono font-bold text-emerald-400 tabular-nums">
              \${{ totalDividend().toFixed(2) }} USD
            </span>
          </div>
          
          <button
            type="button"
            (click)="toggleOptIn()"
            [class.bg-emerald-600]="isOptedIn()"
            [class.bg-zinc-800]="!isOptedIn()"
            class="min-h-[44px] px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400"
            [attr.aria-pressed]="isOptedIn()">
            <span>{{ isOptedIn() ? '✓ Open Science ON' : '✕ Opted Out' }}</span>
          </button>
        </div>
      </div>

      <!-- Real-Time Passive Environmental HUD -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <!-- Metric 1: Acoustic Noise -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Ambient Acoustic Noise</span>
            <span class="text-base font-bold font-mono text-zinc-100 tabular-nums">{{ liveNoise() }} dBA</span>
            <span class="text-[10px] text-emerald-400 block mt-0.5">Quiet Corridor (< 45 dBA)</span>
          </div>
          <div class="h-9 w-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-300">
            🔇
          </div>
        </div>

        <!-- Metric 2: Tree Canopy -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Canopy Ground Truth</span>
            <span class="text-base font-bold font-mono text-emerald-400 tabular-nums">{{ liveCanopy() }}%</span>
            <span class="text-[10px] text-zinc-400 block mt-0.5">Dense Biophilic Shading</span>
          </div>
          <div class="h-9 w-9 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-300">
            🌲
          </div>
        </div>

        <!-- Metric 3: Pavement Quality -->
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">ADA Sidewalk Index</span>
            <span class="text-base font-bold font-mono text-teal-300 tabular-nums">{{ liveSmoothness() }}/10</span>
            <span class="text-[10px] text-teal-400 block mt-0.5">Smooth Wheelchair Grade</span>
          </div>
          <div class="h-9 w-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-300">
            ♿
          </div>
        </div>

      </div>

      <!-- Open Repositories Contribution Card -->
      <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
            📡 Open Repositories Updated from Your Walk
          </span>
          <span class="text-[10px] font-mono text-emerald-400 font-semibold">
            {{ summary().totalMetersMapped }}m Mapped
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <!-- OpenSenseMap -->
          <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-zinc-200">OpenSenseMap</span>
              <span class="text-[10px] font-mono text-emerald-400">✓ Logged</span>
            </div>
            <p class="text-[11px] text-zinc-400 leading-snug">
              {{ summary().openSenseMapContributionsCount }} noise points contributed to city quiet zone map.
            </p>
          </div>

          <!-- NASA GLOBE -->
          <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-zinc-200">NASA GLOBE Observer</span>
              <span class="text-[10px] font-mono text-emerald-400">✓ Validated</span>
            </div>
            <p class="text-[11px] text-zinc-400 leading-snug">
              Ground-truth validated {{ summary().averageCanopyPct }}% cedar canopy model.
            </p>
          </div>

          <!-- OpenStreetMap -->
          <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-zinc-200">OpenStreetMap / Wheelmap</span>
              <span class="text-[10px] font-mono text-emerald-400">✓ Certified</span>
            </div>
            <p class="text-[11px] text-zinc-400 leading-snug">
              {{ summary().adaRampsVerifiedCount }} smooth ADA ramps certified for community mobility.
            </p>
          </div>
        </div>
      </div>

      <!-- Privacy & Differential Privacy Attestation Seal -->
      <div class="p-3 rounded-xl border border-teal-900/40 bg-teal-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-teal-400 text-base">🛡️</span>
          <div>
            <span class="font-semibold text-zinc-200 block">Cryptographic Privacy Guarantee (HIPAA §164.514)</span>
            <span class="text-[10px] text-zinc-400">
              300m Home Geofence Excluded · 100m Grid Snapped (k-anonymity) · 0-Byte Audio Recording Proof
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/40">
            +{{ summary().earnedCitizenSciencePoints }} Citizen Pts
          </span>
          <span class="text-[11px] font-mono text-teal-300 font-bold bg-teal-950/80 px-2 py-1 rounded border border-teal-800/40">
            +\${{ summary().earnedDividendUsd }} Dividend
          </span>
        </div>
      </div>

    </div>
  `
})
export class CitizenScienceWalkReportComponent {
  private readonly citizenService = inject(CitizenScienceTelemetryService);

  readonly isOptedIn = this.citizenService.isCitizenScienceOptedIn;
  readonly liveNoise = this.citizenService.liveNoiseDba;
  readonly liveCanopy = this.citizenService.liveCanopyPct;
  readonly liveSmoothness = this.citizenService.livePavementSmoothness;
  readonly totalDividend = this.citizenService.totalDividendAccumulatedUsd;
  readonly summary = this.citizenService.latestWalkSummary;

  toggleOptIn(): void {
    this.citizenService.toggleOptIn();
  }
}
