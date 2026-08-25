import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HipaaPdfExportService } from '../services/hipaa-pdf-export.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

@Component({
  selector: 'app-hipaa-pdf-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border border-amber-500/30 shadow-2xl space-y-4 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">
            📄
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              1-Click HIPAA Audit & FHIR R4 Bundle PDF Export
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full border border-amber-500/30">§ 164.312(b) Compliant</span>
            </h3>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Generate papercraft-styled clinical summary PDFs with DOMPurify audit logging.
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="exportPdf()"
          class="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download HIPAA Clinical PDF</span>
        </button>
      </div>

      <!-- Audit Log Trail Section -->
      <div class="space-y-2">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
          <span>🛡️</span> Active HIPAA Compliance Audit Trail (§ 164.312)
        </h4>
        
        <div class="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-2 max-h-[160px] overflow-y-auto">
          @if (pdfService.auditLogs().length === 0) {
            <p class="text-zinc-500 italic text-[11px]">No PDF exports logged in this session yet.</p>
          } @else {
            @for (log of pdfService.auditLogs(); track log.timestamp) {
              <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span class="text-emerald-400 font-bold">[{{ log.hipaaStandard }}]</span>
                  <span class="text-zinc-300 ml-2">{{ log.action }} — {{ log.patientName }}</span>
                </div>
                <span class="text-[10px] text-zinc-500">{{ formatTime(log.timestamp) }}</span>
              </div>
            }
          }
        </div>
      </div>

    </div>
  `
})
export class HipaaPdfExportComponent {
  pdfService = inject(HipaaPdfExportService);
  pm = inject(PatientManagementService);

  exportPdf(): void {
    const p = this.pm.selectedPatient();
    const name = p?.name || 'Alexander Vance';
    this.pdfService.generateClinicalSummaryPdf(name);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString();
  }
}
