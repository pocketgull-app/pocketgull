import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TippssIngestionGuardService, ITelemetryMicroConsents } from '../../services/hardware/tippss-ingestion-guard.service';
import { BleWearablesService } from '../../services/hardware/ble-wearables.service';
import { HardwareLifecycleSentinelService } from '../../services/hardware/hardware-lifecycle-sentinel.service';
import { WaveformEventBufferService } from '../../services/hardware/waveform-event-buffer.service';
import { LocalSovereignVaultService } from '../../services/storage/local-sovereign-vault.service';

@Component({
  selector: 'app-tippss-compliance-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950/90 dark:bg-zinc-950 border border-teal-500/30 rounded-2xl shadow-xl backdrop-blur-md text-zinc-100 font-sans">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xl font-bold">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-zinc-100 tracking-tight">IEEE P2933™ TIPPSS Compliance Cockpit</h3>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ICAP Certified
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Trust &bull; Identity &bull; Privacy &bull; Protection &bull; Safety &bull; Security for Clinical IoT
            </p>
          </div>
        </div>

        <!-- Quick Status Badge -->
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full"
                [ngClass]="guardService.safeHarborState().isActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'"></span>
          <span class="text-xs font-mono font-medium"
                [ngClass]="guardService.safeHarborState().isActive ? 'text-amber-400' : 'text-emerald-400'">
            {{ guardService.safeHarborState().isActive ? 'SAFE-HARBOR DEGRADED' : 'TIPPSS OPTIMAL' }}
          </span>
        </div>
      </div>

      <!-- Safe-Harbor Alert Banner (If triggered) -->
      @if (guardService.safeHarborState().isActive) {
        <div class="mt-4 p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <p class="text-sm font-bold text-amber-200">Autonomous Safe-Harbor Interlock Active</p>
              <p class="text-xs text-amber-300/80 mt-0.5">
                {{ guardService.safeHarborState().reason }}
              </p>
            </div>
          </div>
          <button (click)="guardService.resetSafeHarborMode()"
                  class="px-3 py-1.5 min-h-[44px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-semibold transition-all">
            Acknowledge &amp; Reset Gate
          </button>
        </div>
      }

      <!-- 6-Pillar Metric Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        
        <!-- Pillar 1: Trust -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>1. Trust</span>
            <span class="text-teal-400">IEEE ICAP</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">Verified</span>
            <p class="text-[11px] text-zinc-400 mt-0.5 truncate">{{ guardService.enrolledDevices().length }} Enrolled Hardware</p>
          </div>
        </div>

        <!-- Pillar 2: Identity -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>2. Identity</span>
            <span class="text-indigo-400">Binding</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">Bound</span>
            <p class="text-[11px] text-zinc-400 mt-0.5 truncate">Patient ⇄ Hardware Token</p>
          </div>
        </div>

        <!-- Pillar 3: Privacy -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>3. Privacy</span>
            <span class="text-purple-400">Micro-Consent</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">
              {{ guardService.tippssSummary().activePrivacyShieldCount }} Modalities
            </span>
            <p class="text-[11px] text-zinc-400 mt-0.5">Ingress Gated</p>
          </div>
        </div>

        <!-- Pillar 4: Protection -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>4. Protection</span>
            <span class="text-blue-400">Part 11</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">SHA-256 HMAC</span>
            <p class="text-[11px] text-zinc-400 mt-0.5">Anti-Replay Enforced</p>
          </div>
        </div>

        <!-- Pillar 5: Safety -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>5. Safety</span>
            <span class="text-emerald-400">Biophysical</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">SQI 98%</span>
            <p class="text-[11px] text-zinc-400 mt-0.5">Lead-Off Guard Active</p>
          </div>
        </div>

        <!-- Pillar 6: Security -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>6. Security</span>
            <span class="text-amber-400">Lifecycle</span>
          </div>
          <div class="mt-2">
            <span class="text-sm font-bold text-zinc-100 font-mono">Zero CVE</span>
            <p class="text-[11px] text-zinc-400 mt-0.5">Zeroization Ready</p>
          </div>
        </div>

      </div>

      <!-- Hardware Fast-Enrollment Controls -->
      <div class="mt-5 pt-4 border-t border-zinc-800/80">
        <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
          Hardware Attestation &amp; Fast-Enrollment
        </span>
        <div class="flex flex-wrap gap-2.5">
          <button (click)="enrollPixel()"
                  class="px-3.5 py-2 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 border border-teal-500/30 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
            <span>⌚</span>
            <span>Enroll Google Pixel Watch 2 (Titan M2)</span>
          </button>

          <button (click)="enrollApple()"
                  class="px-3.5 py-2 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
            <span>🍏</span>
            <span>Enroll Apple Watch (Secure Enclave)</span>
          </button>

          <button (click)="enrollGarmin()"
                  class="px-3.5 py-2 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
            <span>🏃</span>
            <span>Enroll Garmin Watch (ARM TrustZone)</span>
          </button>

          <button (click)="zeroizeCurrentSession()"
                  class="px-3.5 py-2 min-h-[44px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ml-auto">
            <span>🔐</span>
            <span>Zeroize Session</span>
          </button>
        </div>
      </div>

      <!-- Advanced TIPPSS Ingress Guards: Proximity, Titan M2 Passkey, and On-Device Triage -->
      <div class="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- 1. Proximity RSSI Ingress Gatekeeper -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>📡</span> RSSI Proximity Gate
              </span>
              <span class="px-1.5 py-0.5 text-[10px] font-mono rounded"
                    [ngClass]="bleService.currentRssiDbm() >= guardService.rssiProximityThresholdDbm() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                {{ bleService.currentRssiDbm() >= guardService.rssiProximityThresholdDbm() ? 'IN-RANGE' : 'RELAY BLOCKED' }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">
              Threshold: <span class="font-mono text-zinc-200">&ge; {{ guardService.rssiProximityThresholdDbm() }} dBm</span> &bull; Current: <span class="font-mono text-zinc-200">{{ bleService.currentRssiDbm() }} dBm</span>
            </p>
          </div>
          <div class="flex gap-2 mt-3">
            <button (click)="setNearProximity()"
                    class="flex-1 py-1.5 px-2 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium transition-all">
              Near (-68 dBm)
            </button>
            <button (click)="simulateRelayAttack()"
                    class="flex-1 py-1.5 px-2 min-h-[44px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition-all">
              Relay (-92 dBm)
            </button>
          </div>
        </div>

        <!-- 2. Titan M2 WebAuthn / FIDO2 Passkey Step-Up -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>🔑</span> Titan M2 Passkey Step-Up
              </span>
              @if (guardService.lastMedicationPasskeyReceipt(); as receipt) {
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {{ receipt.aalLevel }}
                </span>
              } @else {
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                  STANDBY
                </span>
              }
            </div>
            <p class="text-[11px] text-zinc-400 mt-1 truncate">
              @if (guardService.lastMedicationPasskeyReceipt(); as receipt) {
                {{ receipt.c2paProvenanceSeal }}
              } @else {
                Requires hardware passkey for Rx titration
              }
            </p>
          </div>
          <button (click)="triggerPasskeyStepUp()"
                  [disabled]="guardService.isPasskeyStepUpPending()"
                  class="mt-3 w-full py-1.5 px-2 min-h-[44px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-all">
            {{ guardService.isPasskeyStepUpPending() ? 'Verifying Passkey...' : 'Test Titan M2 Step-Up' }}
          </button>
        </div>

        <!-- 3. On-Device Local Edge Triage -->
        <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>⚙️</span> On-Device Edge Triage
              </span>
              @if (guardService.lastEdgeTriageResult(); as triage) {
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded"
                      [ngClass]="triage.acuity === 'STAT_EMERGENCY' ? 'bg-rose-500/20 text-rose-300' : triage.acuity === 'URGENT' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'">
                  {{ triage.acuity }}
                </span>
              } @else {
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400">
                  IDLE
                </span>
              }
            </div>
            <p class="text-[11px] text-zinc-400 mt-1 truncate">
              @if (guardService.lastEdgeTriageResult(); as triage) {
                Anomaly: {{ (triage.anomalyScore * 100).toFixed(0) }}% &bull; {{ triage.rationale }}
              } @else {
                Chrome Built-in AI / Biophysical Invariants
              }
            </p>
          </div>
          <div class="flex gap-2 mt-3">
            <button (click)="runEdgeTriageDemo('routine')"
                    class="flex-1 py-1.5 px-2 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all">
              Normal
            </button>
            <button (click)="runEdgeTriageDemo('emergency')"
                    class="flex-1 py-1.5 px-2 min-h-[44px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition-all">
              Anomaly (180)
            </button>
          </div>
        </div>

      </div>

      <!-- Non-Landfill Circularity & Anti-Data Bloat Engine -->
      <div class="mt-5 pt-4 border-t border-zinc-800/80">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌱</span> Circular Hardware &amp; Anti-Data Landfill Engine
            </span>
            <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Zero E-Waste
            </span>
          </div>
          <span class="text-[11px] font-mono text-zinc-400">
            Lifespan Ext: <span class="text-emerald-300 font-bold">+{{ sentinelService.estimatedHardwareLifespanExtensionYears() }} Yrs</span>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- 1. Lithium Pouch Cell Swelling Sentry -->
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>🔋</span> Pouch Battery Sentry
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded"
                      [ngClass]="sentinelService.batteryTelemetry().swellingRiskDetected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300'">
                  {{ sentinelService.batteryTelemetry().levelPercent }}% {{ sentinelService.batteryTelemetry().isCharging ? '⚡ CHG' : 'DISCHG' }}
                </span>
              </div>
              <p class="text-[11px] mt-1 text-zinc-400"
                 [ngClass]="sentinelService.batteryTelemetry().swellingRiskDetected ? 'text-amber-300' : 'text-zinc-400'">
                {{ sentinelService.batteryTelemetry().recommendation }}
              </p>
            </div>
            <div class="mt-3 flex flex-col gap-2">
              <div class="flex gap-2">
                <button (click)="simulateSwellingOvercharge()"
                        class="flex-1 py-1 px-1.5 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-all">
                  Sim Overcharge
                </button>
                <button (click)="simulatePreservationCycle()"
                        class="flex-1 py-1 px-1.5 min-h-[44px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all">
                  20-80% Cycle
                </button>
              </div>
              <button (click)="toggleBedsideSentinel()"
                      [ngClass]="sentinelService.bedsideSentinelConfig().isEnabled ? 'bg-teal-500/20 text-teal-200 border-teal-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'"
                      class="w-full py-1.5 px-2 min-h-[44px] border rounded-lg text-xs font-semibold transition-all">
                {{ sentinelService.bedsideSentinelConfig().isEnabled ? 'Bedside Sentinel Kiosk: ON' : 'Enable Bedside Sentinel Kiosk' }}
              </button>
            </div>
          </div>

          <!-- 2. Anti-Data Landfill Ring Buffer -->
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>🌊</span> Waveform Ring Buffer
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {{ waveformBuffer.dataCompactionRatioPercent() }}% SAVED
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-1">
                Egress Avoided: <span class="font-mono text-emerald-400 font-semibold">{{ waveformBuffer.dataLandfillKBSaved() }} KB</span> (drops flatline noise at edge, freezing only anomalies).
              </p>
              <div class="mt-2 p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-zinc-400 flex items-center gap-1.5"><span>🔕</span> Alarm Fatigue Shield:</span>
                  <span class="text-emerald-400 font-mono font-semibold">{{ waveformBuffer.nuisanceAlarmsSuppressed() }} false alarms</span>
                </div>
                <p class="text-[10px] text-zinc-400 mt-0.5">
                  Clinician Attention Saved: <span class="font-mono text-teal-300 font-medium">{{ waveformBuffer.clinicianMinutesSaved() }} min</span> (~{{ waveformBuffer.clinicianHoursSaved() }} hrs)
                </p>
              </div>
            </div>
            <div class="mt-3 flex flex-col gap-2">
              <div class="flex gap-2">
                <button (click)="triggerAnomalySnapshot()"
                        class="flex-1 py-1.5 px-2 min-h-[44px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-all">
                  Freeze Anomaly
                </button>
                <button (click)="simulateNuisanceAlarmFilter()"
                        class="flex-1 py-1.5 px-2 min-h-[44px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all">
                  Filter Nuisance (+5)
                </button>
              </div>
              <div class="text-[10px] font-mono text-zinc-400 flex justify-between items-center px-1">
                <span>Frozen Incidents: {{ waveformBuffer.frozenIncidentSnapshots().length }}</span>
                <span>FIFO: 30s in RAM</span>
              </div>
            </div>
          </div>

          <!-- 3. Local-First Encrypted Local Storage (Anti-Bricking) -->
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>🏛️</span> Sovereign Local Vault
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  OFFLINE
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-1">
                Headroom: <span class="font-mono text-zinc-200">{{ vaultService.storageEstimate().availableMb }} MB</span> &bull; Records: <span class="font-mono text-zinc-200">{{ vaultService.localRecordCount() }}</span>. Operates 100% offline if cloud servers vanish.
              </p>
            </div>
            <div class="mt-3 flex flex-col gap-2">
              <button (click)="exportPatientBundle()"
                      class="w-full py-1.5 px-2 min-h-[44px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-semibold transition-all">
                Export Sovereign Bundle
              </button>
              <button (click)="hotSwapSensor()"
                      class="w-full py-1 px-2 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-medium transition-all">
                Hot-Swap Degraded BLE Sensor
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Dynamic Modality Micro-Consents -->
      <div class="mt-5 pt-4 border-t border-zinc-800/80">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Patient Modality Micro-Consent Shields
          </span>
          <span class="text-[11px] text-zinc-500">Unconsented streams are dropped at the ingress boundary</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button (click)="toggleConsent('allowHeartRate')"
                  [ngClass]="guardService.microConsents().allowHeartRate ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500'"
                  class="px-3 py-1.5 min-h-[44px] border rounded-lg text-xs font-medium transition-all">
            Heart Rate: {{ guardService.microConsents().allowHeartRate ? 'ALLOW' : 'DROP' }}
          </button>

          <button (click)="toggleConsent('allowSpO2')"
                  [ngClass]="guardService.microConsents().allowSpO2 ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500'"
                  class="px-3 py-1.5 min-h-[44px] border rounded-lg text-xs font-medium transition-all">
            SpO2: {{ guardService.microConsents().allowSpO2 ? 'ALLOW' : 'DROP' }}
          </button>

          <button (click)="toggleConsent('allowTemperature')"
                  [ngClass]="guardService.microConsents().allowTemperature ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500'"
                  class="px-3 py-1.5 min-h-[44px] border rounded-lg text-xs font-medium transition-all">
            Temperature: {{ guardService.microConsents().allowTemperature ? 'ALLOW' : 'DROP' }}
          </button>

          <button (click)="toggleConsent('allowRawPpgWaveforms')"
                  [ngClass]="guardService.microConsents().allowRawPpgWaveforms ? 'bg-purple-500/20 border-purple-400 text-purple-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500'"
                  class="px-3 py-1.5 min-h-[44px] border rounded-lg text-xs font-medium transition-all">
            Raw PPG Waveforms: {{ guardService.microConsents().allowRawPpgWaveforms ? 'ALLOW (High-Bandwidth)' : 'REVOKED (Private)' }}
          </button>

          <button (click)="toggleConsent('allowMotionSensors')"
                  [ngClass]="guardService.microConsents().allowMotionSensors ? 'bg-purple-500/20 border-purple-400 text-purple-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500'"
                  class="px-3 py-1.5 min-h-[44px] border rounded-lg text-xs font-medium transition-all">
            Motion / IMU: {{ guardService.microConsents().allowMotionSensors ? 'ALLOW' : 'BLOCKED (Private)' }}
          </button>
        </div>
      </div>

      <!-- Live Cryptographic Ingestion Audit Trail -->
      <div class="mt-5 pt-4 border-t border-zinc-800/80">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Live TIPPSS Ingestion Receipts (FDA 21 CFR Part 11)
          </span>
          <span class="text-[11px] font-mono text-zinc-500">
            Total Ingested: {{ guardService.tippssSummary().totalIngested }} &bull; Rejected: {{ guardService.tippssSummary().totalRejected }}
          </span>
        </div>

        <div class="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          @for (entry of guardService.auditLog().slice(0, 4); track entry.auditId) {
            <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 font-mono">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="entry.action === 'INGESTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'">
                  {{ entry.action }}
                </span>
                <span class="text-zinc-300">{{ entry.modality }}</span>
              </div>
              <span class="text-zinc-500 text-[11px] truncate max-w-[200px]">{{ entry.integritySeal }}</span>
            </div>
          } @empty {
            <div class="text-xs text-zinc-500 italic p-2 text-center">
              Awaiting first telemetry frame for cryptographic sealing...
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class TippssComplianceCardComponent {
  readonly guardService = inject(TippssIngestionGuardService);
  readonly bleService = inject(BleWearablesService);
  readonly sentinelService = inject(HardwareLifecycleSentinelService);
  readonly waveformBuffer = inject(WaveformEventBufferService);
  readonly vaultService = inject(LocalSovereignVaultService);
  readonly lastExportedBundle = signal<string | null>(null);

  enrollPixel(): void {
    this.bleService.enrollPixelWatch2('PATIENT-SELF-01');
  }

  enrollApple(): void {
    this.bleService.enrollAppleWatch('PATIENT-SELF-01');
  }

  enrollGarmin(): void {
    this.bleService.enrollGarminWatch('PATIENT-SELF-01');
  }

  zeroizeCurrentSession(): void {
    this.bleService.disconnect();
  }

  toggleConsent(key: keyof ITelemetryMicroConsents): void {
    const current = this.guardService.microConsents()[key];
    this.guardService.updateMicroConsents({ [key]: !current });
  }

  setNearProximity(): void {
    this.bleService.setSimulatedRssiDbm(-68);
  }

  simulateRelayAttack(): void {
    this.bleService.setSimulatedRssiDbm(-92);
  }

  async triggerPasskeyStepUp(): Promise<void> {
    await this.guardService.verifyMedicationOrderStepUp({
      drugName: 'Morphine Sulfate',
      dose: '5 mg IV STAT',
      clinicianId: 'DR-PGEAR-MD',
      patientId: 'PATIENT-SELF-01'
    });
  }

  async runEdgeTriageDemo(acuity: 'routine' | 'emergency' = 'routine'): Promise<void> {
    const frameVal = acuity === 'emergency' ? 180 : 72;
    await this.guardService.triageTelemetryEdgeAnomaly({
      deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
      patientId: 'PATIENT-SELF-01',
      timestampMs: Date.now(),
      sequenceNumber: 9999,
      modality: 'heart_rate',
      value: frameVal,
      signalQualityIndex: 96,
      leadOffDetected: false,
      rssiDbm: this.bleService.currentRssiDbm()
    });
  }

  toggleBedsideSentinel(): void {
    this.sentinelService.toggleBedsideSentinelMode();
  }

  simulateSwellingOvercharge(): void {
    this.sentinelService.simulateBatteryParameters({ levelPercent: 100, isCharging: true, swellingRisk: true });
  }

  simulatePreservationCycle(): void {
    this.sentinelService.simulateBatteryParameters({ levelPercent: 65, isCharging: false, swellingRisk: false });
  }

  hotSwapSensor(): void {
    this.sentinelService.registerDecoupledSensorSwap('Polar H10 Replacement Chest Strap', 'Worn Optical Sensor Strap');
  }

  triggerAnomalySnapshot(): void {
    this.waveformBuffer.freezeIncidentSnapshot({
      triggerReason: 'Manual Clinician Diagnostic Trigger',
      acuity: 'STAT_EMERGENCY',
      modality: 'ppg'
    });
  }

  simulateNuisanceAlarmFilter(): void {
    this.waveformBuffer.recordNuisanceAlarmSuppressed(5);
  }

  async exportPatientBundle(): Promise<void> {
    const bundleStr = await this.vaultService.exportSovereignPatientBundle('PATIENT-SELF-01');
    this.lastExportedBundle.set(bundleStr);
  }
}
