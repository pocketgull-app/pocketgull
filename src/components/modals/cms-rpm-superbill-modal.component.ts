import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsRpmSuperbillService, ICmsRpmSuperbill } from '../../services/cms-rpm-superbill.service';

@Component({
  selector: 'app-cms-rpm-superbill-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="superbill-title">
      <div class="relative bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-teal-500/40 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/70 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-400 text-xl font-mono shrink-0">
              🏥
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="superbill-title" class="text-base font-bold text-zinc-100 tracking-tight">CMS Remote Patient Monitoring (RPM) Superbill</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-teal-950/80 text-teal-400 border border-teal-500/40 uppercase">
                  CMS CPT 99453 / 99454 / 99457
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">30-Day Telemetric Attestation &amp; Medicare Clinical Reimbursement Claim</p>
            </div>
          </div>
          <button (click)="close.emit()" class="w-9 h-9 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px]" aria-label="Close modal">
            ✕
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          <!-- Claim & Patient Meta Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Claim Reference</span>
              <span class="font-mono font-bold text-teal-300 text-sm truncate block">{{ superbill().claimId }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Patient / Subject</span>
              <span class="font-semibold text-zinc-200 truncate block">{{ superbill().patientName }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Billing Period</span>
              <span class="font-mono text-zinc-300 text-[11px] block">{{ superbill().billingPeriodStart }} → {{ superbill().billingPeriodEnd }}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Est. Reimbursement</span>
              <span class="font-mono font-black text-green-400 text-base tabular-nums">\${{ superbill().totalEstimatedReimbursementUsd | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- 16-Day Statutory Compliance Bar -->
          <div class="p-4 rounded-xl border transition-all" [ngClass]="superbill().isCompliant16DayRule ? 'bg-teal-950/20 border-teal-500/40 text-teal-200' : 'bg-amber-950/20 border-amber-500/40 text-amber-200'">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2 font-bold text-sm">
                <span>{{ superbill().isCompliant16DayRule ? '✅' : '⚠️' }}</span>
                <span>{{ superbill().isCompliant16DayRule ? 'CMS 16-Day Transmission Statutory Rule Satisfied' : 'Insufficient Transmissions for CPT 99454' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-xs tabular-nums px-2.5 py-1 rounded-md" [ngClass]="superbill().isCompliant16DayRule ? 'bg-teal-900/60 text-teal-300 border border-teal-500/30' : 'bg-amber-900/60 text-amber-300 border border-amber-500/30'">
                  {{ superbill().qualifyingDaysCount }} / 30 Days Transmitted (16 req)
                </span>
              </div>
            </div>

            <!-- Visual Progress Meter -->
            <div class="w-full bg-zinc-800 rounded-full h-2.5 my-2 overflow-hidden flex">
              <div 
                class="h-full transition-all duration-500" 
                [ngClass]="superbill().isCompliant16DayRule ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'"
                [style.width.%]="(superbill().qualifyingDaysCount / 30) * 100">
              </div>
            </div>

            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Under CMS Medicare Remote Physiologic Monitoring regulations (42 CFR § 410.78), CPT 99454 requires at least <strong>16 distinct days</strong> of verified digital physiologic recordings per 30-day calendar billing period.
              @if (!superbill().isCompliant16DayRule) {
                <span class="text-amber-400 font-semibold block mt-1">
                  Notice: {{ 16 - superbill().qualifyingDaysCount }} additional transmission day{{ (16 - superbill().qualifyingDaysCount) === 1 ? '' : 's' }} required to unlock CPT 99454 ($48.56). Click any day below to record verified manual device transmission.
                </span>
              }
            </p>
          </div>

          <!-- Interactive 30-Day Transmission Calendar Tile Matrix -->
          <div class="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2 font-bold uppercase tracking-wider text-zinc-300 font-mono text-[11px]">
                <span>📅</span>
                <span>30-Day Telemetric Transmission Matrix</span>
                <span class="text-zinc-500 font-normal lowercase tracking-normal">(click tile to toggle transmission)</span>
              </div>
              <div class="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span> Transmitted ({{ superbill().qualifyingDaysCount }})</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span> Inactive ({{ 30 - superbill().qualifyingDaysCount }})</span>
              </div>
            </div>

            <!-- Calendar Days Grid (30 Tiles) -->
            <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-1.5 pt-1">
              @for (day of superbill().complianceCalendar; track day.date) {
                <button
                  type="button"
                  (click)="toggleDay(day.date)"
                  [attr.aria-label]="day.date + ': ' + (day.hasReading ? 'Transmitted' : 'Inactive')"
                  class="p-2 rounded-lg border text-center transition-all cursor-pointer select-none min-h-[44px] flex flex-col items-center justify-center group"
                  [ngClass]="day.hasReading ? 'bg-teal-950/40 border-teal-500/50 hover:bg-teal-900/50 text-teal-200' : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/60 text-zinc-500'">
                  <div class="flex items-center justify-between w-full text-[9px] font-mono">
                    <span>{{ day.date | date:'MM/dd' }}</span>
                    <span class="text-[10px]">{{ day.hasReading ? '🟢' : '⚪' }}</span>
                  </div>
                  <div class="text-[9px] font-mono mt-0.5 font-bold truncate w-full" [ngClass]="day.hasReading ? 'text-teal-300' : 'text-zinc-600'">
                    @if (day.hasReading) {
                      {{ day.restingHeartRateBpm ? day.restingHeartRateBpm + ' bpm' : (day.spO2Pct ? day.spO2Pct + '%' : 'Logged') }}
                    } @else {
                      None
                    }
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Interactive Clinical Care Management Minutes Dial (CPT 99457 & 99458) -->
          <div class="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2 font-bold uppercase tracking-wider text-zinc-300 font-mono text-[11px]">
                <span>⏱️</span>
                <span>Clinical Care Coordination &amp; Review Time</span>
              </div>
              <div class="text-teal-400 font-mono font-bold text-xs">
                Log: {{ superbillService.clinicalMinutesSpent() }} Minutes
              </div>
            </div>

            <p class="text-zinc-400 text-[11px]">
              CPT 99457 requires $\ge 20$ minutes of interactive communication and trajectory titration ($50.18). Each additional 20-minute increment qualifies for CPT 99458 ($39.86).
            </p>

            <!-- Stepper and Quick Presets -->
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <div class="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-950">
                <button 
                  type="button" 
                  (click)="addMinutes(-5)" 
                  class="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono font-bold text-xs cursor-pointer min-w-[44px] min-h-[44px]">
                  -5m
                </button>
                <div class="px-4 py-2 font-mono font-bold text-sm text-teal-300 tabular-nums min-w-[70px] text-center">
                  {{ superbillService.clinicalMinutesSpent() }}m
                </div>
                <button 
                  type="button" 
                  (click)="addMinutes(5)" 
                  class="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono font-bold text-xs cursor-pointer min-w-[44px] min-h-[44px]">
                  +5m
                </button>
              </div>

              <!-- Quick Presets -->
              <button 
                type="button" 
                (click)="setMinutes(0)" 
                [class.ring-2]="superbillService.clinicalMinutesSpent() === 0"
                class="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-mono font-semibold cursor-pointer min-h-[44px] transition">
                0 min
              </button>
              <button 
                type="button" 
                (click)="setMinutes(20)" 
                [class.ring-2]="superbillService.clinicalMinutesSpent() === 20"
                class="px-3 py-2 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-700/60 text-xs font-mono font-semibold cursor-pointer min-h-[44px] transition">
                20 min (+$50.18)
              </button>
              <button 
                type="button" 
                (click)="setMinutes(40)" 
                [class.ring-2]="superbillService.clinicalMinutesSpent() === 40"
                class="px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 text-xs font-mono font-semibold cursor-pointer min-h-[44px] transition">
                40 min (+$90.04)
              </button>
              <button 
                type="button" 
                (click)="setMinutes(60)" 
                [class.ring-2]="superbillService.clinicalMinutesSpent() === 60"
                class="px-3 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 text-xs font-mono font-semibold cursor-pointer min-h-[44px] transition">
                60 min (+$129.90)
              </button>
            </div>

            <!-- Documented Polypharmacy Deprescribing Interventions -->
            @if (superbill().deprescribingLogs && superbill().deprescribingLogs!.length > 0) {
              <div class="pt-3 border-t border-zinc-800/80 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold uppercase text-teal-300 flex items-center gap-1.5">
                    <span>💊</span> Documented Deprescribing Interventions ({{ superbill().deprescribingLogs!.length }})
                  </span>
                  <span class="text-[10px] font-mono text-zinc-400">Qualifies for CPT 99457/99458</span>
                </div>
                <div class="space-y-1.5">
                  @for (log of superbill().deprescribingLogs; track log.id) {
                    <div class="p-2.5 rounded-lg bg-zinc-950/70 border border-teal-500/30 flex items-center justify-between gap-2 text-xs">
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-teal-300 font-mono">{{ log.medication }}</span>
                          <span class="text-[10px] font-mono text-zinc-400 truncate">({{ log.originalDose }} → {{ log.targetDose }})</span>
                          <span class="px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 text-[9px] font-mono border border-teal-500/30 font-bold shrink-0">+{{ log.minutesAttributed }}m</span>
                        </div>
                        <p class="text-[11px] text-zinc-400 mt-0.5 truncate">{{ log.clinicalRationale }}</p>
                      </div>
                      <button 
                        type="button"
                        (click)="removeDeprescribing(log.id)"
                        class="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/80 transition cursor-pointer shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label="Remove deprescribing protocol">
                        ✕
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
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
                  @for (diag of superbill().icd10Diagnoses; track diag.code) {
                    <tr class="hover:bg-zinc-900/30">
                      <td class="p-2.5 font-mono font-bold text-teal-400">{{ diag.code }}</td>
                      <td class="p-2.5 text-zinc-200">{{ diag.description }}</td>
                      <td class="p-2.5 text-zinc-400">{{ diag.sourceCondition }}</td>
                      <td class="p-2.5 text-right">
                        @if (diag.isPrimary) {
                          <span class="px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-mono text-[9px] font-bold border border-teal-500/40 uppercase">Primary</span>
                        } @else {
                          <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px]">Secondary</span>
                        }
                      </td>
                    </tr>
                  }
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
                  @for (item of superbill().claimCodes; track item.cptCode) {
                    <tr class="hover:bg-zinc-900/30" [ngClass]="{'opacity-40': !item.isEligible}">
                      <td class="p-2.5 font-mono font-bold text-cyan-400">{{ item.cptCode }}</td>
                      <td class="p-2.5">
                        <div class="font-medium text-zinc-200">{{ item.description }}</div>
                        <div class="text-[10px] text-zinc-400 font-mono mt-0.5">{{ item.complianceRule }}</div>
                      </td>
                      <td class="p-2.5 font-mono text-zinc-300">{{ item.units }}</td>
                      <td class="p-2.5 text-right font-mono text-zinc-400 tabular-nums">\${{ item.rateUsd | number:'1.2-2' }}</td>
                      <td class="p-2.5 text-right font-mono font-bold text-zinc-100 tabular-nums">\${{ item.totalUsd | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="bg-zinc-900/90 border-t border-zinc-700 font-bold">
                    <td colspan="4" class="p-3 text-right uppercase font-mono text-zinc-300">Total Estimated Claim Reimbursement:</td>
                    <td class="p-3 text-right font-mono text-green-400 text-sm font-black tabular-nums">\${{ superbill().totalEstimatedReimbursementUsd | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Cryptographic Attestation Digest -->
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-[10px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span class="text-zinc-500 uppercase block text-[9px]">FDA 21 CFR Part 11 &amp; NIST SP 800-90A Electronic Attestation Digest</span>
              <span class="text-teal-400 truncate block max-w-lg">{{ superbill().integritySealSha256 }}</span>
            </div>
            <div class="text-right text-zinc-500">
              <span>{{ superbill().clinicianAttestationTimestamp | date:'yyyy-MM-dd HH:mm:ss' }} UTC</span>
            </div>
          </div>

          <!-- Copied Feedback Banner -->
          @if (copiedNotice()) {
            <div class="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div class="flex items-center gap-2">
                <span>✓</span>
                <span>Clinical RPM Attestation Note copied to clipboard! Ready for direct paste into Epic, Cerner, or AthenaHealth.</span>
              </div>
              <button (click)="copiedNotice.set(false)" class="text-emerald-400 hover:text-white ml-2 text-xs">✕</button>
            </div>
          }

        </div>

        <!-- Footer Actions -->
        <div class="px-5 sm:px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="text-zinc-500 text-[11px] hidden sm:block">
            Ready for CMS-1500 EDI 837P transmission or EHR attestation.
          </div>
          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button"
              (click)="copyEhrNote()" 
              class="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-zinc-700 min-h-[44px]">
              <span>📋</span> Copy EHR Note
            </button>
            <button 
              type="button"
              (click)="exportFhirClaim()" 
              class="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-zinc-700 min-h-[44px]">
              <span>📦</span> Export FHIR R4 Claim
            </button>
            <button 
              type="button"
              (click)="printSuperbill()" 
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90 text-zinc-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 min-h-[44px]">
              <span>🖨️</span> Print CMS-1500
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CmsRpmSuperbillModalComponent {
  readonly superbillService: CmsRpmSuperbillService;
  readonly copiedNotice = signal(false);

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

  toggleDay(dateStr: string): void {
    this.superbillService.toggleDayTransmission(dateStr);
  }

  setMinutes(minutes: number): void {
    this.superbillService.setClinicalMinutes(minutes);
  }

  addMinutes(delta: number): void {
    const current = this.superbillService.clinicalMinutesSpent();
    this.superbillService.setClinicalMinutes(current + delta);
  }

  removeDeprescribing(logId: string): void {
    this.superbillService.removeDeprescribingLog(logId);
  }

  copyEhrNote(): void {
    const note = this.superbillService.generateEhrClinicalNote(this.superbill());
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(note).catch(() => {});
    }
    this.copiedNotice.set(true);
    setTimeout(() => this.copiedNotice.set(false), 2500);
  }

  printSuperbill(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  exportFhirClaim(): void {
    if (typeof document === 'undefined') return;
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

