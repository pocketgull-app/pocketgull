import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DirectIomtWearablesService,
  DirectIomtProvider,
  IIomtBiometrics,
  IIomtDeviceMetadata,
  IIomtCircularBatteryState,
  IIomtTippssStatus,
  IIomtDataCompactionSummary
} from '../../services/hardware/direct-iomt-wearables.service';

@Component({
  selector: 'app-direct-iomt-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden"
         role="region"
         aria-label="Direct IoMT Wearables Console">
      <!-- Ambient Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl shadow-xs">
            ⌚
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                Direct IoMT Wearable Ecosystem
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                Direct On-Device IPC
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Apple HealthKit &amp; Google Health Connect ingestion • Zero Vendor Cloud Taxes • IEEE P2933™ TIPPSS
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Provider Switcher -->
          <label for="select-iomt-provider" class="sr-only">Select IoMT Ingestion Provider</label>
          <select [ngModel]="iomtService.activeProvider()"
                  (ngModelChange)="onProviderChange($event)"
                  id="select-iomt-provider"
                  class="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500 cursor-pointer font-sans min-h-[44px]">
            <option value="APPLE_HEALTHKIT">Apple Watch (HealthKit CoreMotion)</option>
            <option value="GOOGLE_HEALTH_CONNECT">Google Pixel Watch (Android 15 IPC)</option>
            <option value="BLE_DIRECT_MESH">Polar H10 (Direct Web Bluetooth)</option>
          </select>

          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Direct IoMT Console"
                  id="btn-close-iomt-console"
                  class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer min-h-[44px] min-w-[44px]">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10 font-sans">
        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Root of Trust</span>
          <span class="text-xs font-mono font-bold text-rose-400 mt-1 block truncate">
            {{ activeDevice().hardwareRootOfTrust }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">Hardware Attested</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Heart Rate &amp; SpO2</span>
          <span class="text-xl font-mono font-black text-emerald-400 mt-1 block tabular-nums">
            {{ liveBiometrics().heartRateBpm }} <span class="text-xs font-normal text-zinc-400">bpm</span>
            <span class="text-sm font-normal text-teal-400 ml-1.5">{{ liveBiometrics().spo2Pct }}%</span>
          </span>
          <span class="text-[10px] font-mono text-zinc-500">Live Ingested Telemetry</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Data Compaction</span>
          <span class="text-xl font-mono font-black text-amber-400 mt-1 block tabular-nums">
            {{ compactionMetrics().compactionRatioPercent }}%
          </span>
          <span class="text-[10px] font-mono text-zinc-500">{{ compactionMetrics().dataLandfillKBSaved }} KB Landfill Saved</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Circular Battery</span>
          <span class="text-xl font-mono font-black mt-1 block tabular-nums"
                [class.text-emerald-400]="!batteryState().swellingRiskDetected"
                [class.text-red-400]="batteryState().swellingRiskDetected">
            {{ batteryState().levelPercent }}%
            <span class="text-xs font-normal text-zinc-400">{{ batteryState().isCharging ? '⚡ Charging' : '🔋 Active' }}</span>
          </span>
          <span class="text-[10px] font-mono text-zinc-500">+{{ batteryState().lifespanExtensionYears }}y Life Extension</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-zinc-800/80 mb-5 relative z-10" role="tablist">
        <button type="button"
                (click)="activeTab.set('telemetry')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'telemetry'"
                id="tab-iomt-telemetry"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-rose-950]="activeTab() === 'telemetry'"
                [class.text-rose-300]="activeTab() === 'telemetry'"
                [class.border-b-2]="activeTab() === 'telemetry'"
                [class.border-rose-400]="activeTab() === 'telemetry'"
                [class.text-zinc-400]="activeTab() !== 'telemetry'"
                [class.hover:text-zinc-200]="activeTab() !== 'telemetry'">
          Live Telemetry &amp; Sync
        </button>

        <button type="button"
                (click)="activeTab.set('tippss')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'tippss'"
                id="tab-iomt-tippss"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-rose-950]="activeTab() === 'tippss'"
                [class.text-rose-300]="activeTab() === 'tippss'"
                [class.border-b-2]="activeTab() === 'tippss'"
                [class.border-rose-400]="activeTab() === 'tippss'"
                [class.text-zinc-400]="activeTab() !== 'tippss'"
                [class.hover:text-zinc-200]="activeTab() !== 'tippss'">
          IEEE P2933™ TIPPSS Trust
        </button>

        <button type="button"
                (click)="activeTab.set('compaction')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'compaction'"
                id="tab-iomt-compaction"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-rose-950]="activeTab() === 'compaction'"
                [class.text-rose-300]="activeTab() === 'compaction'"
                [class.border-b-2]="activeTab() === 'compaction'"
                [class.border-rose-400]="activeTab() === 'compaction'"
                [class.text-zinc-400]="activeTab() !== 'compaction'"
                [class.hover:text-zinc-200]="activeTab() !== 'compaction'">
          Anti-Landfill Ring Buffer
        </button>

        <button type="button"
                (click)="activeTab.set('battery')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'battery'"
                id="tab-iomt-battery"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-rose-950]="activeTab() === 'battery'"
                [class.text-rose-300]="activeTab() === 'battery'"
                [class.border-b-2]="activeTab() === 'battery'"
                [class.border-rose-400]="activeTab() === 'battery'"
                [class.text-zinc-400]="activeTab() !== 'battery'"
                [class.hover:text-zinc-200]="activeTab() !== 'battery'">
          Circular Battery Lifecycle
        </button>
      </div>

      <!-- Tab 1: Live Telemetry & Direct Sync -->
      @if (activeTab() === 'telemetry') {
        <div class="space-y-5 font-sans relative z-10">
          <!-- Ingestion Controls & Bypassed Middlemen Banner -->
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span class="text-xs font-bold text-zinc-200 block">Bypassed Cloud Middlemen &amp; Subscription Tolls</span>
                <span class="text-[11px] text-zinc-400">Direct on-device IPC eliminates recurring third-party API licensing &amp; vendor lock-in</span>
              </div>

              <div class="flex items-center gap-2">
                @if (activeDevice().isBackgroundSyncActive) {
                  <button type="button"
                          (click)="onToggleBackgroundSync(false)"
                          id="btn-stop-sync"
                          class="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer min-h-[44px]">
                    ⏸ Pause Sync
                  </button>
                } @else {
                  <button type="button"
                          (click)="onToggleBackgroundSync(true)"
                          id="btn-start-sync"
                          class="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer min-h-[44px]">
                    ▶ Start Background Sync (5s)
                  </button>
                }

                <button type="button"
                        (click)="onTriggerManualSync()"
                        id="btn-manual-sync"
                        class="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition cursor-pointer min-h-[44px]">
                  ⚡ Sync Now
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 mt-2">
              @for (middleman of activeDevice().bypassedVendorMiddlemen; track middleman) {
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                  🚫 {{ middleman }}
                </span>
              }
            </div>
          </div>

          <!-- Vitals Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Heart Rate</span>
              <span class="text-2xl font-mono font-bold text-rose-400 tabular-nums">{{ liveBiometrics().heartRateBpm }}</span>
              <span class="text-[10px] text-zinc-500 block">bpm</span>
            </div>

            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">HRV RMSSD</span>
              <span class="text-2xl font-mono font-bold text-teal-400 tabular-nums">{{ liveBiometrics().hrvRmssdMs }}</span>
              <span class="text-[10px] text-zinc-500 block">ms (Vagal Tone)</span>
            </div>

            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Oxygen (SpO2)</span>
              <span class="text-2xl font-mono font-bold text-emerald-400 tabular-nums">{{ liveBiometrics().spo2Pct }}</span>
              <span class="text-[10px] text-zinc-500 block">%</span>
            </div>

            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Respiratory Rate</span>
              <span class="text-2xl font-mono font-bold text-indigo-400 tabular-nums">{{ liveBiometrics().respiratoryRateBpm }}</span>
              <span class="text-[10px] text-zinc-500 block">br/min</span>
            </div>

            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Wrist Skin Temp</span>
              <span class="text-2xl font-mono font-bold text-amber-400 tabular-nums">{{ liveBiometrics().wristSkinTemperatureC }}</span>
              <span class="text-[10px] text-zinc-500 block">°C (Circadian)</span>
            </div>

            <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Daily Steps</span>
              <span class="text-2xl font-mono font-bold text-purple-400 tabular-nums">{{ liveBiometrics().activeStepsDaily }}</span>
              <span class="text-[10px] text-zinc-500 block">steps</span>
            </div>
          </div>

          <!-- Sleep Architecture -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <span class="text-xs font-bold text-zinc-200 block mb-2">Sleep Architecture &amp; Glymphatic Clearance</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-[10px] text-zinc-400 block">Total Duration</span>
                <span class="font-mono font-bold text-zinc-200">7h 40m ({{ liveBiometrics().sleepDurationMinutes }}m)</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">Deep Sleep (Slow-Wave)</span>
                <span class="font-mono font-bold text-indigo-300">{{ liveBiometrics().deepSleepMinutes }}m</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">REM Sleep</span>
                <span class="font-mono font-bold text-purple-300">{{ liveBiometrics().remSleepMinutes }}m</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">Sleep Efficiency</span>
                <span class="font-mono font-bold text-emerald-400">{{ liveBiometrics().sleepEfficiencyPct }}%</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: IEEE P2933™ TIPPSS Trust Framework -->
      @if (activeTab() === 'tippss') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div>
                <span class="text-xs font-bold text-zinc-200 block">IEEE P2933™ 6-Pillar Statutory Trust Verification</span>
                <span class="text-[11px] text-zinc-400">Trust • Identity • Privacy • Protection • Safety • Security</span>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                100% Attested
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>TRUST</span>
                </div>
                <span class="text-[11px] text-zinc-400 block">Root: {{ tippssStatus().hardwareRootOfTrust }}</span>
                <span class="text-[10px] text-zinc-500">IEEE ICAP Certified</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>IDENTITY</span>
                </div>
                <span class="text-[11px] text-zinc-400 block">Patient: {{ activeDevice().assignedPatientId }}</span>
                <span class="text-[10px] text-zinc-500">Non-spoofable Token Binding</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>PRIVACY</span>
                </div>
                <span class="text-[11px] text-zinc-400 block">Modality Micro-Consents</span>
                <span class="text-[10px] text-zinc-500">Zero Raw Egress by Default</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>PROTECTION</span>
                </div>
                <span class="text-[11px] text-zinc-400 block">RSSI Gate: ≥ -85 dBm</span>
                <span class="text-[10px] text-zinc-500">Anti-Replay Counter Monotonic</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>SAFETY</span>
                </div>
                <span class="text-[11px] text-zinc-400 block">Lead-off Detachment Safe</span>
                <span class="text-[10px] text-zinc-500">Biophysical Boundaries Guarded</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span>✓</span> <span>SECURITY</span>
                </div>
                <span class="text-[11px] text-zinc-400 block truncate font-mono">{{ tippssStatus().sha256AuditDigest.slice(0, 16) }}...</span>
                <span class="text-[10px] text-zinc-500">FDA 21 CFR Part 11 Digest</span>
              </div>
            </div>
          </div>

          <!-- Electronic Audit Receipt Export -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold text-zinc-200 block">FDA 21 CFR Part 11 Verifiable Electronic Records Seal</span>
              <span class="text-[11px] text-zinc-400">Cryptographic audit snapshot of active biometrics, root of trust, and compliance gates</span>
            </div>
            <button type="button"
                    (click)="onExportAuditReceipt()"
                    id="btn-export-audit-receipt"
                    class="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold hover:bg-zinc-700 transition cursor-pointer min-h-[44px]">
              📋 Export JSON Receipt
            </button>
          </div>
        </div>
      }

      <!-- Tab 3: Anti-Landfill Ring Buffer -->
      @if (activeTab() === 'compaction') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span class="text-xs font-bold text-zinc-200 block">Circular Ring Buffer &amp; Data Landfill Decimation</span>
                <span class="text-[11px] text-zinc-400">Buffers 50–125Hz waveforms in ephemeral RAM (30s); drops flatlines at the edge without saving</span>
              </div>

              <!-- Anomaly Trigger for Pre/Post Event Ring Buffer Freezing -->
              <button type="button"
                      (click)="onSimulateAnomaly()"
                      id="btn-simulate-anomaly"
                      class="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 transition cursor-pointer min-h-[44px]">
                🚨 Simulate SVT Anomaly (-15s/+15s Freeze)
              </button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Total Edge Ingested</span>
                <span class="text-lg font-mono font-bold text-zinc-200 tabular-nums">{{ compactionMetrics().totalWaveformSamplesIngested }}</span>
                <span class="text-[10px] text-zinc-500">samples</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Edge Decimated &amp; Dropped</span>
                <span class="text-lg font-mono font-bold text-emerald-400 tabular-nums">{{ compactionMetrics().totalSamplesDiscardedAtEdge }}</span>
                <span class="text-[10px] text-zinc-500">99.5% Landfill Eliminated</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Nuisance Alarms Filtered</span>
                <span class="text-lg font-mono font-bold text-indigo-400 tabular-nums">{{ compactionMetrics().nuisanceAlarmsSuppressed }}</span>
                <span class="text-[10px] text-zinc-500">AACN Fatigue Benchmark</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Clinician Time Preserved</span>
                <span class="text-lg font-mono font-bold text-amber-400 tabular-nums">{{ compactionMetrics().clinicianMinutesSaved }}m</span>
                <span class="text-[10px] text-zinc-500">Saved Cognition</span>
              </div>
            </div>

            <div class="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
              <span class="font-bold text-zinc-300 block mb-1">Pre-Event &amp; Post-Event Incident Capture Rule</span>
              <p class="text-zinc-400 text-[11px] leading-relaxed">
                When a physiological event (e.g. SVT &gt; 150 bpm or SpO2 &lt; 90%) triggers, the ephemeral ring buffer instantly captures 15 seconds pre-event plus 15 seconds post-event. Flatline baseline waveforms are continuously discarded, preserving clinical signal without database bloat.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: Circular Battery Lifecycle -->
      @if (activeTab() === 'battery') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div>
                <span class="text-xs font-bold text-zinc-200 block">Web Battery API &amp; Anti-Pouch Swelling Sentry</span>
                <span class="text-[11px] text-zinc-400">Protects lithium-ion pouch cells from continuous-charge swelling and premature landfill</span>
              </div>

              <span class="text-xs font-bold px-2.5 py-1 rounded-full border"
                    [class.bg-emerald-500-10]="!batteryState().swellingRiskDetected"
                    [class.text-emerald-300]="!batteryState().swellingRiskDetected"
                    [class.border-emerald-500-30]="!batteryState().swellingRiskDetected"
                    [class.bg-red-500-10]="batteryState().swellingRiskDetected"
                    [class.text-red-300]="batteryState().swellingRiskDetected"
                    [class.border-red-500-30]="batteryState().swellingRiskDetected">
                {{ batteryState().optimalCyclingBand }}
              </span>
            </div>

            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-4">
              <span class="text-xs font-bold text-zinc-300 block mb-1">Active Lifecycle Guidance</span>
              <p class="text-xs text-zinc-300 leading-relaxed font-mono">
                {{ batteryState().chargeGuidance }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Preservation Band</span>
                <span class="font-bold text-emerald-400 mt-1 block">20% – 80% State of Charge</span>
                <span class="text-[10px] text-zinc-500">Prevents Anode Lithium Plating</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Wall-Tether Overcharge Sentry</span>
                <span class="font-bold text-amber-400 mt-1 block">Active Guard</span>
                <span class="text-[10px] text-zinc-500">Alerts before pouch swelling occurs</span>
              </div>

              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Hardware Lifespan Extension</span>
                <span class="font-bold text-teal-400 mt-1 block">+{{ batteryState().lifespanExtensionYears }} Years</span>
                <span class="text-[10px] text-zinc-500">Decoupled Transducer Replacement</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Status Toast / Receipt Modal -->
      @if (receiptModalContent()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 max-w-xl w-full shadow-2xl font-mono text-xs">
            <div class="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <span class="font-bold text-zinc-200">21 CFR Part 11 Electronic Receipt</span>
              <button type="button"
                      (click)="receiptModalContent.set(null)"
                      class="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <pre class="bg-zinc-950 p-3 rounded-lg overflow-x-auto text-[11px] text-emerald-400 max-h-80">{{ receiptModalContent() }}</pre>
            <div class="mt-4 flex justify-end">
              <button type="button"
                      (click)="receiptModalContent.set(null)"
                      class="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-500 min-h-[44px]">
                Done
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DirectIomtConsoleComponent {
  readonly iomtService = inject(DirectIomtWearablesService);
  readonly close = output<void>();

  readonly activeTab = signal<'telemetry' | 'tippss' | 'compaction' | 'battery'>('telemetry');
  readonly receiptModalContent = signal<string | null>(null);

  readonly activeDevice = computed<IIomtDeviceMetadata>(() => {
    const provider = this.iomtService.activeProvider();
    return this.iomtService.deviceMetadata()[provider];
  });

  readonly liveBiometrics = computed<IIomtBiometrics>(() => {
    return this.iomtService.liveBiometrics();
  });

  readonly batteryState = computed<IIomtCircularBatteryState>(() => {
    return this.iomtService.batteryState();
  });

  readonly tippssStatus = computed<IIomtTippssStatus>(() => {
    return this.iomtService.getTrustStatus();
  });

  readonly compactionMetrics = computed<IIomtDataCompactionSummary>(() => {
    return this.iomtService.getCompactionMetrics();
  });

  onProviderChange(provider: DirectIomtProvider): void {
    this.iomtService.selectProvider(provider);
  }

  onToggleBackgroundSync(start: boolean): void {
    if (start) {
      this.iomtService.startBackgroundSync(5);
    } else {
      this.iomtService.stopBackgroundSync();
    }
  }

  async onTriggerManualSync(): Promise<void> {
    await this.iomtService.triggerManualSync();
  }

  async onSimulateAnomaly(): Promise<void> {
    await this.iomtService.triggerTestCardiacAnomaly('tachycardia');
  }

  onExportAuditReceipt(): void {
    const receipt = this.iomtService.exportWearableAuditReceipt();
    this.receiptModalContent.set(receipt);
  }
}
