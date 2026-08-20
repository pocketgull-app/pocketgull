import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PracticeRoiService, TPocketGullTier } from '../../services/practice-roi.service';

@Component({
  selector: 'app-practice-roi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-slate-800 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl font-sans">
      
      <!-- Top Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            💰
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Practice ROI &amp; CMS CPT Reimbursement Calculator
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                CMS RPM &amp; CCM Schedule
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Calculate billable remote patient monitoring revenue (CPT 99453, 99454, 99457, 99458, 99490) and time-savings ROI.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="exportCsv()" 
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-700 text-xs font-mono transition cursor-pointer flex items-center gap-1.5">
            <span>📥</span> Export CSV Model
          </button>
        </div>
      </div>

      <!-- Main 2-Column Workstation Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left Column: Practice Configuration Inputs (6 Cols) -->
        <div class="lg:col-span-6 space-y-5">
          
          <!-- 1. Patient Cohort Slider -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <div class="flex justify-between items-center font-mono">
              <label class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <span>👥</span> Active Monitored Patient Cohort
              </label>
              <span class="text-base font-black text-emerald-400">
                {{ roi.patientCohortCount() }} Patients
              </span>
            </div>

            <input type="range" min="10" max="1000" step="10" 
                   [value]="roi.patientCohortCount()" 
                   (input)="onPatientSliderChange($event)"
                   class="w-full accent-emerald-400 h-2 bg-slate-950 rounded-lg cursor-pointer" />

            <!-- Preset Buttons -->
            <div class="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
              <span class="text-zinc-500 mr-1">Presets:</span>
              <button (click)="roi.setPatients(50)" class="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition cursor-pointer">50</button>
              <button (click)="roi.setPatients(100)" class="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition cursor-pointer">100</button>
              <button (click)="roi.setPatients(200)" class="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition cursor-pointer">200 (Standard)</button>
              <button (click)="roi.setPatients(500)" class="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition cursor-pointer">500</button>
              <button (click)="roi.setPatients(1000)" class="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition cursor-pointer">1,000</button>
            </div>
          </div>

          <!-- 2. Clinician Seats Counter & Tier Selection -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
            <div class="flex justify-between items-center font-mono">
              <label class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <span>🩺</span> Clinician Seats &amp; Care Coordinators
              </label>
              <div class="flex items-center gap-2">
                <button (click)="roi.setSeats(roi.clinicianSeats() - 1)" 
                        class="w-6 h-6 rounded bg-slate-950 border border-slate-700 text-zinc-300 font-bold flex items-center justify-center hover:bg-slate-800 cursor-pointer">-</button>
                <span class="text-sm font-black text-cyan-400 font-mono w-6 text-center">{{ roi.clinicianSeats() }}</span>
                <button (click)="roi.setSeats(roi.clinicianSeats() + 1)" 
                        class="w-6 h-6 rounded bg-slate-950 border border-slate-700 text-zinc-300 font-bold flex items-center justify-center hover:bg-slate-800 cursor-pointer">+</button>
              </div>
            </div>

            <!-- Tier Cards -->
            <div class="grid grid-cols-3 gap-2 font-mono text-xs">
              <div (click)="roi.setTier('solo')"
                   class="p-2.5 rounded-xl border transition cursor-pointer text-center"
                   [class.border-cyan-500]="roi.selectedTier() === 'solo'"
                   [class.bg-cyan-500/10]="roi.selectedTier() === 'solo'"
                   [class.border-slate-800]="roi.selectedTier() !== 'solo'"
                   [class.bg-slate-950]="roi.selectedTier() !== 'solo'">
                <div class="text-[10px] text-zinc-400 uppercase">Solo</div>
                <div class="text-sm font-black text-zinc-100 mt-0.5">$149<span class="text-[9px] text-zinc-400 font-normal">/mo</span></div>
              </div>

              <div (click)="roi.setTier('clinic')"
                   class="p-2.5 rounded-xl border transition cursor-pointer text-center"
                   [class.border-emerald-500]="roi.selectedTier() === 'clinic'"
                   [class.bg-emerald-500/10]="roi.selectedTier() === 'clinic'"
                   [class.border-slate-800]="roi.selectedTier() !== 'clinic'"
                   [class.bg-slate-950]="roi.selectedTier() !== 'clinic'">
                <div class="text-[10px] text-emerald-400 uppercase font-bold">Clinic ★</div>
                <div class="text-sm font-black text-zinc-100 mt-0.5">$199<span class="text-[9px] text-zinc-400 font-normal">/mo</span></div>
              </div>

              <div (click)="roi.setTier('enterprise')"
                   class="p-2.5 rounded-xl border transition cursor-pointer text-center"
                   [class.border-purple-500]="roi.selectedTier() === 'enterprise'"
                   [class.bg-purple-500/10]="roi.selectedTier() === 'enterprise'"
                   [class.border-slate-800]="roi.selectedTier() !== 'enterprise'"
                   [class.bg-slate-950]="roi.selectedTier() !== 'enterprise'">
                <div class="text-[10px] text-zinc-400 uppercase">Enterprise</div>
                <div class="text-sm font-black text-zinc-100 mt-0.5">$299<span class="text-[9px] text-zinc-400 font-normal">/mo</span></div>
              </div>
            </div>
          </div>

          <!-- 3. CPT Program Toggles -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5 shadow-lg font-mono text-xs">
            <div class="text-xs font-bold text-zinc-300 uppercase mb-2">Program Selection</div>
            
            <label class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div class="flex items-center gap-2">
                <input type="checkbox" [checked]="roi.enableRpm()" (change)="roi.toggleRpm()" class="accent-emerald-400" />
                <span class="text-zinc-200">Remote Physiologic Monitoring (RPM)</span>
              </div>
              <span class="text-[10px] text-emerald-400 font-bold">CPT 99454 + 99457 + 99458</span>
            </label>

            <label class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div class="flex items-center gap-2">
                <input type="checkbox" [checked]="roi.enableCcm()" (change)="roi.toggleCcm()" class="accent-cyan-400" />
                <span class="text-zinc-200">Chronic Care Management (CCM)</span>
              </div>
              <span class="text-[10px] text-cyan-400 font-bold">CPT 99490 ($62/mo)</span>
            </label>

            <label class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div class="flex items-center gap-2">
                <input type="checkbox" [checked]="roi.enableInitialSetup()" (change)="roi.toggleSetup()" class="accent-amber-400" />
                <span class="text-zinc-200">Include Initial Onboarding Reimbursement</span>
              </div>
              <span class="text-[10px] text-amber-400 font-bold">CPT 99453 ($19 one-time)</span>
            </label>
          </div>

        </div>

        <!-- Right Column: Financial Results HUD & Itemized Breakdown (6 Cols) -->
        <div class="lg:col-span-6 space-y-5">

          <!-- 4. Key Financial Output Metrics Cards -->
          <div class="grid grid-cols-2 gap-3 font-mono">
            <!-- Gross Annual Revenue -->
            <div class="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1 shadow-lg">
              <div class="text-[10px] text-zinc-400 uppercase">Gross Annual Reimbursement</div>
              <div class="text-2xl font-black text-emerald-400">
                \${{ roi.financialSummary().annualGrossReimbursement | number }}
              </div>
              <div class="text-[10px] text-emerald-500/80">
                ~\${{ roi.financialSummary().monthlyGrossReimbursement | number }}/month
              </div>
            </div>

            <!-- Net Practice Profit -->
            <div class="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-1 shadow-lg">
              <div class="text-[10px] text-zinc-400 uppercase">Net Practice Profit Boost</div>
              <div class="text-2xl font-black text-cyan-300">
                +\${{ roi.financialSummary().netAnnualPracticeProfit | number }}
              </div>
              <div class="text-[10px] text-cyan-400/80 flex items-center gap-1">
                <span>ROI Multiple:</span>
                <span class="font-bold text-amber-300">{{ roi.financialSummary().roiMultiple }}&times;</span>
              </div>
            </div>
          </div>

          <!-- 5. Charting Time Savings & Clinical Hours -->
          <div class="p-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl flex items-center justify-between font-mono">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-zinc-200">⏱️ 42% Charting Overhead Reduction</div>
              <div class="text-[10px] text-zinc-400">Saves {{ roi.financialSummary().hoursSavedMonthly }} clinical hours/month across {{ roi.clinicianSeats() }} clinician(s)</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-black text-indigo-300">+\${{ roi.financialSummary().clinicalTimeValueMonthly | number }}/mo</div>
              <div class="text-[9px] text-zinc-500">Clinical Time Recaptured</div>
            </div>
          </div>

          <!-- 6. Itemized CPT Reimbursement Schedule Table -->
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg font-mono text-xs">
            <div class="flex justify-between items-center text-xs font-bold text-zinc-300 uppercase border-b border-slate-800 pb-2">
              <span>CPT Code &amp; Service</span>
              <span>Annual Potential</span>
            </div>

            <div class="space-y-2">
              @for (item of roi.financialSummary().itemizedBreakdown; track item.code) {
                <div class="flex justify-between items-center py-1 border-b border-slate-950/60" [class.opacity-40]="!item.isEnabled">
                  <div>
                    <div class="font-bold text-zinc-200">{{ item.code }} — {{ item.name }}</div>
                    <div class="text-[10px] text-zinc-400 font-sans truncate max-w-xs">{{ item.description }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-emerald-400">\${{ item.annualTotal | number }}</div>
                    <div class="text-[9px] text-zinc-500">
                      {{ item.isOneTime ? 'One-time' : '\$' + item.ratePerPatientMonthly + '/pt/mo' }}
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- SaaS Subscription Expense Row -->
            <div class="flex justify-between items-center pt-2 text-[11px] text-zinc-400 border-t border-slate-800">
              <div>PocketGull {{ roi.financialSummary().tierDetails.name }} ({{ roi.clinicianSeats() }} seats)</div>
              <div class="text-amber-400 font-bold">-\${{ roi.financialSummary().annualSaaSExpense | number }}/yr</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class PracticeRoiCalculatorComponent {
  roi = inject(PracticeRoiService);

  onPatientSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.roi.setPatients(val);
  }

  exportCsv(): void {
    const summary = this.roi.financialSummary();
    let csv = `PocketGull Practice ROI & CMS CPT Reimbursement Model\n`;
    csv += `Patient Cohort,${summary.patients}\n`;
    csv += `Clinician Seats,${summary.seats}\n`;
    csv += `SaaS Tier,${summary.tierDetails.name}\n`;
    csv += `Monthly Gross Reimbursement,$${summary.monthlyGrossReimbursement}\n`;
    csv += `Annual Gross Reimbursement,$${summary.annualGrossReimbursement}\n`;
    csv += `Annual SaaS Expense,$${summary.annualSaaSExpense}\n`;
    csv += `Net Annual Practice Profit Boost,$${summary.netAnnualPracticeProfit}\n`;
    csv += `ROI Multiple,${summary.roiMultiple}x\n\n`;
    csv += `CPT Code,Service Name,Rate / Patient / Mo,Status,Annual Total\n`;
    summary.itemizedBreakdown.forEach(item => {
      csv += `${item.code},"${item.name}",$${item.ratePerPatientMonthly},${item.isEnabled ? 'Active' : 'Disabled'},$${item.annualTotal}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PocketGull_Practice_ROI_${summary.patients}_Patients.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
