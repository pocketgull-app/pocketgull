import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsRpmSuperbillService, ICmsRpmSuperbill } from '../../services/cms-rpm-superbill.service';

@Component({
  selector: 'app-cms-rpm-superbill-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="superbill-title">
      <div class="relative bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-teal-500/40 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-400 text-xl font-mono">
              🏥
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 id="superbill-title" class="text-base font-bold text-zinc-100 tracking-tight">CMS Remote Patient Monitoring (RPM) Superbill</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-teal-950/80 text-teal-400 border border-teal-500/40 uppercase">
                  CMS CPT 99453 / 99454
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">30-Day Telemetric Attestation &amp; Clinical Reimbursement Claim</p>
            </div>
          </div>
          <button (click)="close.emit()" class="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center cursor-pointer" aria-label="Close modal">
            ✕
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          <!-- Claim & Patient Meta Bar -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Claim ID</span>
              <span class="font-mono font-bold text-teal-300 text-sm">{{ superbill().claimId }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Patient / Subject</span>
              <span class="font-semibold text-zinc-200 truncate block">{{ superbill().patientName }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Billing Period</span>
              <span class="font-mono text-zinc-300">{{ superbill().billingPeriodStart }} → {{ superbill().billingPeriodEnd }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Est. Payout</span>
              <span class="font-mono font-black text-green-400 text-base">\${{ superbill().totalEstimatedReimbursementUsd }}</span>
            </div>
          </div>

          <!-- 16-Day Statutory Compliance Bar -->
          <div class="p-4 rounded-xl border" [ngClass]="superbill().isCompliant16DayRule ? 'bg-teal-950/20 border-teal-500/40 text-teal-200' : 'bg-rose-950/20 border-rose-500/40 text-rose-200'">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 font-bold text-sm">
                <span>{{ superbill().isCompliant16DayRule ? '✅' : '⚠️' }}</span>
                <span>{{ superbill().isCompliant16DayRule ? 'CMS 16-Day Transmission Statutory Rule Satisfied' : 'Insufficient Transmission Days for CPT 99454' }}</span>
              </div>
              <span class="font-mono font-bold text-xs">{{ superbill().qualifyingDaysCount }} / 30 Active Days (16 req)</span>
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Per CMS Medicare Remote Physiologic Monitoring guidelines, CPT 99454 requires at least 16 days of verified digital device biometric transmissions per 30-day billing cycle.
            </p>
          </div>

          <!-- ICD-10 Diagnosis Cross-Mapping -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
              <span>🏷️</span> ICD-10-CM Primary &amp; Secondary Diagnosis Mappings
            </h3>
            <div class="border border-zinc-800/80 rounded-xl overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <th class="p-2.5">ICD-10</th>
                    <th class="p-2.5">Clinical Description</th>
                    <th class="p-2.5">Mapped Finding</th>
                    <th class="p-2.5 text-right">Priority</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/50">
                  <tr *ngFor="let diag of superbill().icd10Diagnoses" class="hover:bg-zinc-900/30">
                    <td class="p-2.5 font-mono font-bold text-teal-400">{{ diag.code }}</td>
                    <td class="p-2.5 text-zinc-200">{{ diag.description }}</td>
                    <td class="p-2.5 text-zinc-400">{{ diag.sourceCondition }}</td>
                    <td class="p-2.5 text-right">
                      <span *ngIf="diag.isPrimary" class="px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-mono text-[9px] font-bold border border-teal-500/40 uppercase">Primary</span>
                      <span *ngIf="!diag.isPrimary" class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px]">Secondary</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- CPT Coding & Financial Schedule -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
              <span>💳</span> Remote Physiologic Monitoring (RPM) CPT Codes
            </h3>
            <div class="border border-zinc-800/80 rounded-xl overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-zinc-900/80 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <th class="p-2.5">CPT Code</th>
                    <th class="p-2.5">Service Description</th>
                    <th class="p-2.5">Units</th>
                    <th class="p-2.5 text-right">Rate</th>
                    <th class="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/50">
                  <tr *ngFor="let item of superbill().claimCodes" class="hover:bg-zinc-900/30" [ngClass]="{'opacity-40': !item.isEligible}">
                    <td class="p-2.5 font-mono font-bold text-cyan-400">{{ item.cptCode }}</td>
                    <td class="p-2.5">
                      <div class="font-medium text-zinc-200">{{ item.description }}</div>
                      <div class="text-[10px] text-zinc-400 font-mono mt-0.5">{{ item.complianceRule }}</div>
                    </td>
                    <td class="p-2.5 font-mono text-zinc-300">{{ item.units }}</td>
                    <td class="p-2.5 text-right font-mono text-zinc-400">\${{ item.rateUsd }}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-zinc-100">\${{ item.totalUsd }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-zinc-900/90 border-t border-zinc-700 font-bold">
                    <td colspan="4" class="p-3 text-right uppercase font-mono text-zinc-300">Total Estimated Claim Payout:</td>
                    <td class="p-3 text-right font-mono text-green-400 text-sm font-black">\${{ superbill().totalEstimatedReimbursementUsd }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Cryptographic Attestation Digest -->
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-[10px] text-zinc-400 flex items-center justify-between">
            <div>
              <span class="text-zinc-500 uppercase block text-[9px]">FDA 21 CFR Part 11 &amp; NIST SP 800-90A Electronic Attestation Digest</span>
              <span class="text-teal-400 truncate block max-w-lg">{{ superbill().integritySealSha256 }}</span>
            </div>
            <div class="text-right text-zinc-500">
              <span>{{ superbill().clinicianAttestationTimestamp | date:'yyyy-MM-dd HH:mm:ss' }} UTC</span>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="text-zinc-500 text-[11px]">
            Ready for CMS-1500 EDI 837P transmission or clearinghouse ingestion.
          </div>
          <div class="flex items-center gap-2">
            <button (click)="exportFhirClaim()" class="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-zinc-700">
              <span>📦</span> Export FHIR R4 Claim JSON
            </button>
            <button (click)="printSuperbill()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90 text-zinc-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20">
              <span>🖨️</span> Print CMS-1500 Superbill
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CmsRpmSuperbillModalComponent {
  private superbillService: CmsRpmSuperbillService;

  constructor(superbillService?: CmsRpmSuperbillService) {
    if (superbillService) {
      this.superbillService = superbillService;
    } else {
      try {
        this.superbillService = inject(CmsRpmSuperbillService);
      } catch {
        this.superbillService = new CmsRpmSuperbillService();
      }
    }
  }

  @Output() readonly close = new EventEmitter<void>();
  readonly superbill = computed<ICmsRpmSuperbill>(() => this.superbillService.generateSuperbill());

  printSuperbill() {
    window.print();
  }

  exportFhirClaim() {
    const claim = this.superbillService.exportFhirR4Claim(this.superbill());
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(claim, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${this.superbill().claimId}_FHIR_R4_Claim.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
