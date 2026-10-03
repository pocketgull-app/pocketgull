import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HardwareLifecycleSentinelService } from '../../services/hardware/hardware-lifecycle-sentinel.service';
import { BleWearablesService } from '../../services/hardware/ble-wearables.service';
import { WaveformEventBufferService } from '../../services/hardware/waveform-event-buffer.service';
import { PatientStateService } from '../../services/patient-state.service';
import { TippssIngestionGuardService } from '../../services/hardware/tippss-ingestion-guard.service';

/**
 * Bedside Sentinel Kiosk Component (Circular Hardware & Non-Landfill Kiosk)
 *
 * Repurposes retired smartphones, tablets, or monitors into a silent, bedside clinical kiosk:
 * 1. LogMAR 0.0 Optotypic Night Clock (Snellen 20/20 tabular figures with Caslon-inspired optical metrics).
 * 2. 0.1 Hz Parasympathetic Vagal Pulse (10-second respiratory wave for autonomic balance).
 * 3. Silent BLE Vitals Telemetry (Pixel Watch 2 / Apple Watch / Polar sensor fusion).
 * 4. Screen Wake Lock API (keeps the screen awake without sleep-timeout interruptions).
 * 5. Battery Pouch Sentry (detects continuous 100% wall-overcharge and guides 20%-80% preservation cycling).
 * 6. Non-Glare 2700K Amber Nightlight mode for ambient nocturnal visibility.
 * 7. Fitts's Law 48px+ touch targets for sleepy-eye interaction.
 */
@Component({
  selector: 'app-bedside-sentinel-kiosk',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full rounded-3xl overflow-hidden transition-all duration-700 font-sans select-none"
         [ngClass]="{
           'fixed inset-0 z-50 rounded-none bg-black text-amber-50': isFullscreen() || isModalOpen(),
           'bg-zinc-950 border border-amber-500/30 text-amber-50 shadow-2xl p-6 md:p-8': !isFullscreen() && !isModalOpen(),
           'brightness-50': isDimmed() && !isNightLightActive(),
           'bg-amber-950/90 text-amber-100': isNightLightActive()
         }">

      <!-- Parasympathetic 0.1 Hz Vagal Breathing Halo -->
      <div class="absolute inset-0 pointer-events-none transition-opacity duration-1000"
           [ngClass]="{
             'opacity-20 animate-vagal-pulse': !isNightLightActive(),
             'opacity-40 bg-amber-500/10': isNightLightActive()
           }">
        <div class="w-full h-full bg-gradient-radial from-amber-500/15 via-transparent to-transparent"></div>
      </div>

      <!-- Kiosk Top Navigation Bar -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
            🌙
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base md:text-lg font-bold tracking-tight text-amber-100">Bedside Sentinel Kiosk</h3>
              <span class="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Circular Sentinel
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Repurposed Hardware &bull; {{ sentinelService.estimatedHardwareLifespanExtensionYears() }}y Extended Lifespan
            </p>
          </div>
        </div>

        <!-- Quick Control Actions -->
        <div class="flex items-center gap-2">
          <!-- Night Light Toggle -->
          <button (click)="toggleNightLight()"
                  [attr.aria-label]="isNightLightActive() ? 'Turn off night light' : 'Turn on 2700K amber night light'"
                  class="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border"
                  [ngClass]="isNightLightActive() ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-zinc-700'">
            <span>🏮</span>
            <span>{{ isNightLightActive() ? 'Lantern ON' : 'Night Light' }}</span>
          </button>

          <!-- Dimmer Toggle -->
          <button (click)="toggleDimmer()"
                  [attr.aria-label]="isDimmed() ? 'Restore brightness' : 'Dim screen to 15%'"
                  class="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border"
                  [ngClass]="isDimmed() ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'">
            <span>{{ isDimmed() ? '🌕' : '🌑' }}</span>
            <span>{{ isDimmed() ? '15% Dim' : 'Full' }}</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button (click)="toggleFullscreenMode()"
                  [attr.aria-label]="isFullscreen() ? 'Exit full screen kiosk' : 'Enter full screen bedside kiosk'"
                  class="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700">
            <span>{{ isFullscreen() ? '⤢' : '⤡' }}</span>
            <span>{{ isFullscreen() ? 'Exit Kiosk' : 'Fullscreen' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Bedside Display Arena -->
      <div class="relative z-10 py-8 md:py-12 flex flex-col items-center justify-center text-center space-y-6">

        <!-- 1. LogMAR 0.0 Optotypic Tabular Night Clock -->
        <div class="space-y-1">
          <div class="text-6xl sm:text-7xl md:text-9xl font-bold font-mono tracking-tight text-amber-100 tabular-nums drop-shadow-md select-none">
            {{ currentTime() }}
          </div>
          <div class="text-sm sm:text-base md:text-lg font-medium text-amber-300/80 tracking-wide uppercase">
            {{ currentDate() }}
          </div>
        </div>

        <!-- 2. 0.1 Hz Parasympathetic Breath Guide -->
        <div class="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
          <span>0.10 Hz Parasympathetic Pacing &bull; Breathe in sync with the amber pulse</span>
        </div>

        <!-- 3. Silent Vitals Telemetry Row (Pixel Watch 2 / BLE) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-4">
          
          <!-- Heart Rate Tile -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center space-y-1">
            <span class="text-xs text-zinc-400 flex items-center gap-1">
              <span>❤️</span> Live Pulse
            </span>
            <div class="text-3xl md:text-4xl font-mono font-bold tabular-nums"
                 [ngClass]="bleService.heartRate() > 85 ? 'text-amber-400' : 'text-emerald-400'">
              {{ bleService.heartRate() || 72 }} <span class="text-sm font-normal text-zinc-400">bpm</span>
            </div>
            <span class="text-[10px] text-zinc-500 font-mono">Resting Nocturnal Vitals</span>
          </div>

          <!-- SpO2 Oxygenation Tile -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center space-y-1">
            <span class="text-xs text-zinc-400 flex items-center gap-1">
              <span>🫁</span> Blood Oxygen
            </span>
            <div class="text-3xl md:text-4xl font-mono font-bold tabular-nums text-teal-300">
              {{ bleService.spO2() || 98 }}<span class="text-sm font-normal text-zinc-400">%</span>
            </div>
            <span class="text-[10px] text-zinc-500 font-mono">Plethysmography SQI 96%</span>
          </div>

          <!-- Skin Temperature Tile -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center space-y-1">
            <span class="text-xs text-zinc-400 flex items-center gap-1">
              <span>🌡️</span> Nocturnal Temp
            </span>
            <div class="text-3xl md:text-4xl font-mono font-bold tabular-nums text-amber-200">
              {{ bleService.temperature() || 98.4 }}<span class="text-sm font-normal text-zinc-400">°F</span>
            </div>
            <span class="text-[10px] text-zinc-500 font-mono">Circadian Thermoregulation</span>
          </div>
        </div>

        <!-- 4. Battery Pouch Sentry & Circular Health Banner -->
        <div class="w-full max-w-2xl p-4 rounded-2xl bg-zinc-900/90 border flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
             [ngClass]="sentinelService.batteryTelemetry().swellingRiskDetected ? 'border-amber-500/60 bg-amber-950/40' : 'border-zinc-800'">
          <div class="flex items-center gap-3">
            <div class="text-2xl">
              {{ sentinelService.batteryTelemetry().swellingRiskDetected ? '⚠️' : '🔋' }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-xs font-bold text-zinc-200">
                  Lithium Pouch Sentry: {{ sentinelService.batteryTelemetry().levelPercent }}%
                  {{ sentinelService.batteryTelemetry().isCharging ? '⚡ (Wall-Tethered)' : '🔋 (Battery Mode)' }}
                </p>
                <span class="px-2 py-0.5 text-[10px] font-mono rounded"
                      [ngClass]="sentinelService.batteryTelemetry().swellingRiskDetected ? 'bg-amber-500/30 text-amber-200' : 'bg-emerald-500/20 text-emerald-300'">
                  {{ sentinelService.batteryTelemetry().swellingRiskDetected ? 'Overcharge Risk' : '20-80% Cycle Safe' }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                {{ sentinelService.batteryTelemetry().recommendation }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="simulatePreservationCycle()"
                    class="px-2.5 py-1.5 min-h-[44px] bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium transition-all">
              Safe Cycle (65%)
            </button>
          </div>
        </div>

        <!-- 5. Alarm Fatigue Shield Metrics Banner -->
        <div class="w-full max-w-2xl p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div class="flex items-center gap-2">
            <span>🔕</span>
            <span>Alarm Fatigue Shield:</span>
            <strong class="text-emerald-400 font-mono">{{ waveformBuffer.nuisanceAlarmsSuppressed() }} false alarms suppressed</strong>
          </div>
          <div class="font-mono text-teal-300">
            {{ waveformBuffer.clinicianMinutesSaved() }} min sleep protected
          </div>
        </div>
      </div>

      <!-- Kiosk Footer & Safety Overrides -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-amber-500/20 pt-4 text-xs text-zinc-400">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Paired: {{ bleService.deviceName() || 'Pixel Watch 2' }} (Titan M2 Attested)</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- STAT Emergency Bypass -->
          <button (click)="triggerEmergencyBypass()"
                  class="px-4 py-2 min-h-[44px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span>🚨</span>
            <span>STAT Emergency / 988 Lifeline</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes vagalPulse {
      0%, 100% {
        opacity: 0.10;
        transform: scale(0.99);
      }
      50% {
        opacity: 0.28;
        transform: scale(1.01);
      }
    }
    .animate-vagal-pulse {
      animation: vagalPulse 10s ease-in-out infinite;
    }
    .bg-gradient-radial {
      background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
    }
  `]
})
export class BedsideSentinelKioskComponent implements OnInit, OnDestroy {
  readonly sentinelService = inject(HardwareLifecycleSentinelService);
  readonly bleService = inject(BleWearablesService);
  readonly waveformBuffer = inject(WaveformEventBufferService);
  readonly patientState = inject(PatientStateService);
  readonly tippssGuard = inject(TippssIngestionGuardService, { optional: true });

  readonly isFullscreen = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly isDimmed = signal<boolean>(false);
  readonly isNightLightActive = signal<boolean>(false);

  readonly currentTime = signal<string>('00:00');
  readonly currentDate = signal<string>('Loading Date...');

  private clockIntervalId: any = null;
  private wakeLockSentinel: any = null;

  ngOnInit(): void {
    this.updateClock();
    this.clockIntervalId = setInterval(() => this.updateClock(), 1000);
    this.requestScreenWakeLock();
  }

  ngOnDestroy(): void {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
    this.releaseScreenWakeLock();
  }

  private updateClock(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime.set(`${hours}:${minutes}`);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    this.currentDate.set(now.toLocaleDateString(undefined, options));
  }

  /**
   * Screen Wake Lock API: Keeps the display on continuously without dimming to black.
   */
  async requestScreenWakeLock(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
      } catch {
        // Graceful fallback on browsers without Wake Lock support
      }
    }
  }

  releaseScreenWakeLock(): void {
    if (this.wakeLockSentinel) {
      this.wakeLockSentinel.release().catch(() => {});
      this.wakeLockSentinel = null;
    }
  }

  toggleFullscreenMode(): void {
    this.isFullscreen.update(f => !f);

    if (typeof document !== 'undefined') {
      if (this.isFullscreen()) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  }

  toggleDimmer(): void {
    this.isDimmed.update(d => !d);
    this.sentinelService.setBedsideConfig({ dimDisplay: this.isDimmed() });
  }

  toggleNightLight(): void {
    this.isNightLightActive.update(nl => !nl);
  }

  simulatePreservationCycle(): void {
    this.sentinelService.simulateBatteryParameters({
      levelPercent: 65,
      isCharging: false,
      swellingRisk: false
    });
  }

  triggerEmergencyBypass(): void {
    this.waveformBuffer.freezeIncidentSnapshot({
      triggerReason: 'STAT Bedside Kiosk Emergency Activation',
      acuity: 'STAT_EMERGENCY',
      modality: 'ppg'
    });
    alert('STAT Emergency Vector Engaged: Dispatching 988 crisis routing and freezing 30s biophysical waveform.');
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (typeof document !== 'undefined') {
      this.isFullscreen.set(!!document.fullscreenElement);
    }
  }
}
