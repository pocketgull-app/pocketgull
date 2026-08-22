import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartFhirSyncService, ISmartFhirConfig } from '../../services/smart-fhir-sync.service';

@Component({
  selector: 'app-smart-fhir-sync-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl font-sans relative max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🏥</span>
              <div>
                <h3 class="text-base font-bold text-zinc-100">SMART on FHIR EHR Bridge</h3>
                <p class="text-[11px] text-zinc-400 font-mono">Bi-directional FHIR R4 Multi-Paradigm Synchronizer</p>
              </div>
            </div>
            <button type="button" (click)="close()" class="text-zinc-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
          </div>

          <!-- Preset Switcher -->
          <div class="mb-5">
            <label class="block text-xs font-medium text-zinc-300 mb-2">EHR Target Endpoint:</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                (click)="selectPreset('epic_sandbox')"
                [class.bg-sky-600]="config().preset === 'epic_sandbox'"
                [class.text-white]="config().preset === 'epic_sandbox'"
                [class.bg-zinc-900]="config().preset !== 'epic_sandbox'"
                [class.text-zinc-400]="config().preset !== 'epic_sandbox'"
                class="p-2.5 rounded-xl border border-zinc-800 text-xs font-bold transition-all cursor-pointer text-left"
              >
                <div>🏥 Epic Sandbox</div>
                <div class="text-[9.5px] font-normal opacity-75 mt-0.5">Epic on FHIR R4</div>
              </button>

              <button
                type="button"
                (click)="selectPreset('cerner_sandbox')"
                [class.bg-amber-600]="config().preset === 'cerner_sandbox'"
                [class.text-white]="config().preset === 'cerner_sandbox'"
                [class.bg-zinc-900]="config().preset !== 'cerner_sandbox'"
                [class.text-zinc-400]="config().preset !== 'cerner_sandbox'"
                class="p-2.5 rounded-xl border border-zinc-800 text-xs font-bold transition-all cursor-pointer text-left"
              >
                <div>🏛️ Cerner Ignite</div>
                <div class="text-[9.5px] font-normal opacity-75 mt-0.5">Oracle Cerner R4</div>
              </button>

              <button
                type="button"
                (click)="selectPreset('hapi_r4')"
                [class.bg-emerald-600]="config().preset === 'hapi_r4'"
                [class.text-white]="config().preset === 'hapi_r4'"
                [class.bg-zinc-900]="config().preset !== 'hapi_r4'"
                [class.text-zinc-400]="config().preset !== 'hapi_r4'"
                class="p-2.5 rounded-xl border border-zinc-800 text-xs font-bold transition-all cursor-pointer text-left"
              >
                <div>🌐 HAPI FHIR</div>
                <div class="text-[9.5px] font-normal opacity-75 mt-0.5">Public Open R4</div>
              </button>

              <button
                type="button"
                (click)="selectPreset('local_mock')"
                [class.bg-purple-600]="config().preset === 'local_mock'"
                [class.text-white]="config().preset === 'local_mock'"
                [class.bg-zinc-900]="config().preset !== 'local_mock'"
                [class.text-zinc-400]="config().preset !== 'local_mock'"
                class="p-2.5 rounded-xl border border-zinc-800 text-xs font-bold transition-all cursor-pointer text-left"
              >
                <div>💻 Local Mock</div>
                <div class="text-[9.5px] font-normal opacity-75 mt-0.5">Port 8080 Testbed</div>
              </button>
            </div>
          </div>

          <!-- Connection Details Card -->
          <div class="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-xs font-mono space-y-2 mb-5">
            <div class="flex items-center justify-between">
              <span class="text-zinc-400">Endpoint URL:</span>
              <span class="text-zinc-200 truncate max-w-[280px] sm:max-w-md">{{ config().fhirBaseUrl }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-zinc-400">SMART Client ID:</span>
              <span class="text-emerald-400">{{ config().clientId }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-zinc-400">OAuth2 Scopes:</span>
              <span class="text-cyan-300 text-[10.5px] truncate max-w-[280px] sm:max-w-md">{{ config().scope }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 mb-5">
            <button
              type="button"
              (click)="handleSyncPush()"
              [disabled]="stats().status === 'syncing'"
              class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              @if (stats().status === 'syncing') {
                <span>⏳ Synchronizing Bundle...</span>
              } @else {
                <span>📤 Push Local Record to EHR</span>
              }
            </button>

            <button
              type="button"
              (click)="toggleBundlePreview()"
              class="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {{ isPreviewOpen() ? '👁️ Hide FHIR JSON' : '🔍 Inspect FHIR Bundle' }}
            </button>
          </div>

          <!-- Sync Stats Banner -->
          @if (stats().status === 'success') {
            <div class="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs text-emerald-300 space-y-1 mb-4">
              <div class="font-bold flex items-center gap-1.5">
                <span>✅</span>
                <span>Synchronization Completed Successfully</span>
              </div>
              <div class="text-[11px] opacity-90">
                • Patients: {{ stats().patientsSynced }} | Conditions: {{ stats().conditionsSynced }} | Observations: {{ stats().observationsSynced }}
              </div>
              <div class="text-[10px] text-emerald-400/80">Timestamp: {{ stats().lastSyncedAt }}</div>
            </div>
          }

          <!-- JSON Bundle Inspector -->
          @if (isPreviewOpen()) {
            <div class="p-3 bg-black/90 border border-zinc-800 rounded-xl overflow-x-auto max-h-60 text-[10.5px] font-mono text-zinc-300">
              <pre>{{ previewJson() }}</pre>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class SmartFhirSyncModalComponent {
  private fhirService?: SmartFhirSyncService | null;

  constructor() {
    try {
      this.fhirService = inject(SmartFhirSyncService, { optional: true });
    } catch {
      this.fhirService = null;
    }
  }

  isOpen = signal<boolean>(false);
  isPreviewOpen = signal<boolean>(false);
  previewJson = signal<string>('');

  config = this.fhirService ? this.fhirService.config : signal<ISmartFhirConfig>({
    fhirBaseUrl: 'https://hapi.fhir.org/baseR4',
    clientId: 'pocketgull-mock',
    scope: 'patient/*.*',
    preset: 'hapi_r4'
  });

  stats = this.fhirService ? this.fhirService.syncStats : signal({
    patientsSynced: 0,
    conditionsSynced: 0,
    observationsSynced: 0,
    diagnosticReportsSynced: 0,
    lastSyncedAt: null,
    status: 'idle' as const,
    errorMessage: null
  });

  open(): void {
    this.isOpen.set(true);
    this.updatePreview();
  }

  close(): void {
    this.isOpen.set(false);
    this.isPreviewOpen.set(false);
  }

  selectPreset(preset: ISmartFhirConfig['preset']): void {
    this.fhirService?.setPreset(preset);
    this.updatePreview();
  }

  async handleSyncPush(): Promise<void> {
    if (this.fhirService) {
      await this.fhirService.syncToRemoteFhir();
    }
  }

  toggleBundlePreview(): void {
    this.isPreviewOpen.update(v => !v);
    if (this.isPreviewOpen()) {
      this.updatePreview();
    }
  }

  updatePreview(): void {
    if (this.fhirService) {
      const bundle = this.fhirService.generateFhirR4Bundle();
      this.previewJson.set(JSON.stringify(bundle, null, 2));
    }
  }
}
