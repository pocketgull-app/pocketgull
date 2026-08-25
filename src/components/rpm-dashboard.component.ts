import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RpmAuditService } from '../services/rpm-audit.service';

@Component({
  selector: 'app-rpm-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-900 border border-emerald-500/30 text-zinc-100 space-y-6 font-sans shadow-2xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <h3 class="text-base font-extrabold uppercase tracking-wider text-white">CMS Remote Patient Monitoring (RPM) Dashboard</h3>
            <span class="text-xs text-emerald-400 font-mono">Value-Based Care Reimbursement Audit & CPT Compliance</span>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider"
                [class]="metrics().status === 'compliant' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-amber-950 text-amber-400 border-amber-500/40'">
            {{ metrics().status === 'compliant' ? '✅ Medicare Claims Ready' : '⏳ 16-Day Pending' }}
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-sky-400 font-bold">
            Est. Payout: \${{ metrics().estimatedReimbursementUsd }} USD
          </span>
        </div>
      </div>

      <!-- Main Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- CPT 99454: 16-Day Transmission Meter -->
        <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold uppercase tracking-wider text-zinc-400 font-mono">CPT 99454 (16-Day Meter)</span>
            <span class="font-mono text-emerald-400 font-extrabold">{{ metrics().transmissionDays30Count }} / 30 Days</span>
          </div>
          
          <div class="w-full h-3 rounded-full bg-zinc-800 overflow-hidden relative">
            <div class="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                 [style.width.%]="(metrics().transmissionDays30Count / 30) * 100"></div>
            <!-- 16-day marker line -->
            <div class="absolute top-0 bottom-0 left-[53.3%] w-0.5 bg-amber-400 z-10" title="16-Day Threshold Target"></div>
          </div>

          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Threshold: 16 Days</span>
            <button type="button" (click)="incrementDays()" class="text-xs text-sky-400 hover:underline cursor-pointer">
              + Simulate Day
            </button>
          </div>
        </div>

        <!-- CPT 99457: Care Management Minutes -->
        <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold uppercase tracking-wider text-zinc-400 font-mono">CPT 99457 / 99458 (Time Log)</span>
            <span class="font-mono text-indigo-400 font-extrabold">{{ metrics().careManagementMinutes }} Mins</span>
          </div>

          <div class="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                 [style.width.%]="Math.min(100, (metrics().careManagementMinutes / 40) * 100)"></div>
          </div>

          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Target: 20m (CPT 99457)</span>
            <span>+20m units: {{ metrics().cpt99458Units }}</span>
          </div>
        </div>

        <!-- CPT 99453: Device Setup & Education -->
        <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold uppercase tracking-wider text-zinc-400 font-mono">CPT 99453 (Setup & Ed)</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  [class]="metrics().cpt99453Eligible ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-500'">
              {{ metrics().cpt99453Eligible ? 'Completed' : 'Pending' }}
            </span>
          </div>
          <p class="text-[11px] text-zinc-400 leading-normal">
            Initial patient education & biometric telemetry setup completed.
          </p>
        </div>

      </div>

      <!-- Quick Action Time Logger -->
      <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 block font-mono">Log Clinical Interaction Time</span>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" (click)="addTime(5, 'Telemetry trend review')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer transition">
            +5 Mins Review
          </button>
          <button type="button" (click)="addTime(15, 'Interactive patient telehealth consultation')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer transition">
            +15 Mins Consult
          </button>
          <button type="button" (click)="addTime(20, 'Multidisciplinary care plan optimization')"
                  class="px-3 py-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 text-xs font-bold cursor-pointer transition border border-indigo-500/40">
            +20 Mins Care Plan
          </button>

          <button type="button" (click)="exportClaimJson()"
                  class="ml-auto px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer transition">
            📥 Export CMS 837P Payload
          </button>
        </div>
      </div>

      <!-- Recent Audit Logs -->
      <div class="space-y-2 text-xs">
        <span class="font-bold uppercase tracking-wider text-zinc-400 font-mono block">Audit Log Trail</span>
        <div class="space-y-2 max-h-36 overflow-y-auto pr-1 font-mono">
          @for (log of metrics().timeLogs; track log.id) {
            <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px]">
              <div>
                <span class="text-indigo-400 font-bold">+{{ log.minutes }} mins</span> — 
                <span class="text-zinc-300">{{ log.notes }}</span>
              </div>
              <span class="text-zinc-500 text-[10px]">{{ log.timestamp | date:'shortTime' }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class RpmDashboardComponent {
  private rpmService = inject(RpmAuditService);
  protected readonly metrics = this.rpmService.rpmMetrics;
  protected readonly Math = Math;

  addTime(minutes: number, notes: string): void {
    this.rpmService.logClinicalTime(minutes, notes);
  }

  incrementDays(): void {
    this.rpmService.incrementTransmissionDays(1);
  }

  exportClaimJson(): void {
    const claim = this.rpmService.generateCmsClaimPayload();
    const jsonStr = JSON.stringify(claim, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_rpm_837p_claim_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
