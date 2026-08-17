import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebBluetoothTelemetryService } from '../services/hardware/web-bluetooth-telemetry.service';
import { BiometricImportService } from '../services/hardware/biometric-import.service';

@Component({
  selector: 'app-biometric-bluetooth-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto"
         (click)="close.emit()">
      
      <!-- Modal Container -->
      <div class="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">📡</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                  Biometric Telemetry &amp; Hardware Hub
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700">
                  W3C Web Bluetooth GATT • Apple HealthKit XML
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                Direct Wireless BLE Chest Straps • Pulse Oximeters • Apple Health Native Export Streamer
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Content Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          <!-- BLE Connectivity Banner / Live Gauges -->
          <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full"
                    [class.bg-emerald-500]="bleService.isConnected()"
                    [class.animate-ping]="bleService.isConnected()"
                    [class.bg-zinc-400]="!bleService.isConnected()">
                  </div>
                  <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    {{ bleService.deviceName() }}
                  </span>
                  @if (bleService.isSimulated()) {
                    <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono">
                      SIMULATED HARDWARE
                    </span>
                  }
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  GATT Services: 0x180D (Heart Rate) • 0x1822 (Pulse Oximeter) • 0x180F (Battery)
                </p>
              </div>

              <!-- Action Controls -->
              <div class="flex flex-wrap items-center gap-2">
                @if (!bleService.isConnected()) {
                  <button (click)="connectBle()"
                    [disabled]="bleService.isScanning()"
                    class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                    <span>📡</span>
                    <span>{{ bleService.isScanning() ? 'Scanning...' : 'Pair BLE Monitor' }}</span>
                  </button>

                  <button (click)="toggleSimulation()"
                    class="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer">
                    ⚡ Test Simulation
                  </button>
                } @else {
                  <button (click)="bleService.disconnect()"
                    class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer">
                    Disconnect Device
                  </button>
                }
              </div>
            </div>

            <!-- Live Telemetry Meters -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <!-- Heart Rate Gauge -->
              <div class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono uppercase text-zinc-400 block">Live Heart Rate</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span class="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                      {{ bleService.liveHeartRate() || '--' }}
                    </span>
                    <span class="text-xs text-zinc-400 font-mono">BPM</span>
                  </div>
                </div>
                <span class="text-2xl" [class.animate-pulse]="bleService.isConnected()">❤️</span>
              </div>

              <!-- HRV RMSSD Gauge -->
              <div class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono uppercase text-zinc-400 block">Vagal Tone / HRV (RMSSD)</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span class="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {{ bleService.liveHrvRmssd() || '--' }}
                    </span>
                    <span class="text-xs text-zinc-400 font-mono">ms</span>
                  </div>
                </div>
                <span class="text-2xl">⚡</span>
              </div>

              <!-- SpO2 / Battery Gauge -->
              <div class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono uppercase text-zinc-400 block">Pulse Ox &amp; Battery</span>
                  <div class="flex items-baseline gap-2 mt-1">
                    <span class="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      {{ bleService.liveSpO2() || 98 }}%
                    </span>
                    <span class="text-xs text-zinc-400 font-mono">
                      (Bat: {{ bleService.batteryLevel() ? bleService.batteryLevel() + '%' : 'N/A' }})
                    </span>
                  </div>
                </div>
                <span class="text-2xl">🫁</span>
              </div>

            </div>

            @if (bleService.error()) {
              <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs font-mono text-red-700 dark:text-red-300">
                ⚠️ {{ bleService.error() }}
              </div>
            }
          </div>

          <!-- Apple Health XML & Biometric File Ingestion Zone -->
          <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>🍎 Apple Health &amp; Wearable File Streamer</span>
              <span class="text-[10px] text-zinc-400">Supports: export.xml • .csv • .json</span>
            </h3>

            <div class="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-cyan-500 transition cursor-pointer"
                 (click)="fileInput.click()">
              <input #fileInput type="file" (change)="handleFileUpload($event)" accept=".xml,.csv,.json" class="hidden" />
              <div class="space-y-2">
                <span class="text-3xl block">📂</span>
                <p class="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Click or Drag &amp; Drop Apple Health <code class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[11px]">export.xml</code> or CSV Files Here
                </p>
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Automatically parses HeartRate, HRV SDNN, SpO2, and Blood Glucose into local FHIR R4 Observations
                </p>
              </div>
            </div>

            @if (uploadStatus()) {
              <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                ✓ {{ uploadStatus() }}
              </div>
            }
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <span class="text-[11px] font-mono text-zinc-500">
            W3C Web Bluetooth 0x180D • Zero-Cloud Local Ingestion
          </span>
          <button (click)="close.emit()"
            class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
            Close Hub
          </button>
        </div>

      </div>

    </div>
  `
})
export class BiometricBluetoothHubComponent {
  bleService = inject(WebBluetoothTelemetryService);
  importService = inject(BiometricImportService);
  close = output<void>();

  uploadStatus = signal<string | null>(null);

  async connectBle(): Promise<void> {
    await this.bleService.requestAndConnectDevice();
  }

  toggleSimulation(): void {
    if (this.bleService.isSimulated()) {
      this.bleService.stopSimulatedTelemetry();
    } else {
      this.bleService.startSimulatedTelemetry();
    }
  }

  async handleFileUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        await this.importService.importFile(file);
        this.uploadStatus.set(`Successfully ingested ${file.name} into patient record.`);
      } catch (err: any) {
        this.uploadStatus.set(`Error importing ${file.name}: ${err.message}`);
      }
    }
  }
}
