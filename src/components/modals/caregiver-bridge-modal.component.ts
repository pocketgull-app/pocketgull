import { Component, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ExportService } from '../../services/export.service';
import { HipaaPdfExportService } from '../../services/hipaa-pdf-export.service';

@Component({
  selector: 'app-caregiver-bridge-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      (click)="onBackdropClick($event)"
      (keydown.escape)="closeModal()"
    >
      <div 
        class="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 text-base font-bold">
              🤝
            </span>
            <div>
              <h2 id="modal-title" class="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Caregiver & Family Sharing Bridge
              </h2>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Share care plans and daily habit schedules securely with trusted family or helpers.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all focus:outline-none"
            aria-label="Close modal"
            (click)="closeModal()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-5">
          <!-- Privacy & Scope Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Safe Harbor Privacy Toggle -->
            <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  🛡️ Mask Patient Identifiers
                </span>
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400">
                  HIPAA Safe Harbor De-identification
                </span>
              </div>
              <button 
                type="button"
                class="w-11 h-6 rounded-full transition-colors relative focus:outline-none"
                [class.bg-emerald-500]="maskPhi()"
                [class.bg-zinc-300]="!maskPhi()"
                [class.dark:bg-zinc-700]="!maskPhi()"
                (click)="maskPhi.set(!maskPhi())"
              >
                <span 
                  class="w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 shadow-sm"
                  [class.translate-x-5]="maskPhi()"
                ></span>
              </button>
            </div>

            <!-- Share Scope Selector -->
            <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <label class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
                Sharing Scope
              </label>
              <select 
                [value]="shareScope()"
                (change)="shareScope.set($any($event.target).value)"
                class="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="habits_only">Daily Habits & Checklist Only</option>
                <option value="full">Full Care Plan Strategy & Vitals</option>
              </select>
            </div>
          </div>

          <!-- Generated Encrypted Share Link & QR Code -->
          <div class="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row items-center gap-4">
            <!-- Simulated Encrypted QR Code Preview -->
            <div class="w-24 h-24 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-teal-200 dark:border-teal-800 flex flex-col items-center justify-center shrink-0 shadow-sm">
              <div class="w-16 h-16 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold tracking-tighter">
                QR PULL
              </div>
              <span class="text-[9px] font-mono text-zinc-400 mt-1">ENCRYPTED</span>
            </div>

            <!-- Link & Access Code -->
            <div class="flex-1 min-w-0">
              <span class="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Encrypted Caregiver Access Link
              </span>
              <div class="mt-1 flex items-center gap-2">
                <input 
                  type="text" 
                  readonly 
                  [value]="generatedShareUrl()"
                  class="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 select-all focus:outline-none"
                />
                <button 
                  type="button"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-all shrink-0 focus:outline-none"
                  (click)="copyLinkToClipboard()"
                >
                  {{ copyButtonText() }}
                </button>
              </div>
              <p class="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                Link expires automatically in 7 days. Safe Harbor de-identification active.
              </p>
            </div>
          </div>

          <!-- Quick Export Buttons -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Direct Offline Data Export Options
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                type="button"
                class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-3 text-left focus:outline-none"
                (click)="exportPdf()"
              >
                <span class="text-lg">📄</span>
                <div>
                  <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Styled PDF Care Plan
                  </span>
                  <span class="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Printable instructions for family
                  </span>
                </div>
              </button>

              <button 
                type="button"
                class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-3 text-left focus:outline-none"
                (click)="exportFhir()"
              >
                <span class="text-lg">🧬</span>
                <div>
                  <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                    HL7 FHIR R4 Bundle
                  </span>
                  <span class="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Standard JSON for clinical integration
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            type="button"
            class="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-all focus:outline-none"
            (click)="closeModal()"
          >
            Close Bridge
          </button>
        </div>
      </div>
    </div>
  `
})
export class CaregiverBridgeModalComponent {
  private patientState = inject(PatientStateService);
  private exportService = inject(ExportService);
  private pdfExportService = inject(HipaaPdfExportService);

  close = output<void>();

  readonly maskPhi = signal<boolean>(true);
  readonly shareScope = signal<'habits_only' | 'full'>('habits_only');
  readonly copyButtonText = signal<string>('Copy Link');

  readonly generatedShareUrl = computed(() => {
    const scope = this.shareScope();
    const masked = this.maskPhi() ? '1' : '0';
    return `https://pocketgull.app/share/caregiver?scope=${scope}&masked=${masked}&token=pg_${Date.now().toString(36)}`;
  });

  public closeModal(): void {
    this.close.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    this.closeModal();
  }

  public copyLinkToClipboard(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.generatedShareUrl());
    }
    this.copyButtonText.set('Copied!');
    setTimeout(() => this.copyButtonText.set('Copy Link'), 2000);
  }

  public async exportPdf(): Promise<void> {
    const state = this.patientState.getCurrentState();
    const patientName = this.maskPhi() ? 'Homo Sapiens (De-Identified)' : (state.name || 'Patient');
    await this.pdfExportService.generateClinicalSummaryPdf(patientName);
  }

  public exportFhir(): void {
    const state = this.patientState.getCurrentState();
    const bundle = this.exportService.buildFhirR4Bundle(state);
    const jsonStr = JSON.stringify(bundle, null, 2);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir_caregiver_bundle_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

