import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalSteeringCommitteeDossierService, ISteeringCommitteeDossier } from '../services/clinical-steering-committee-dossier.service';

@Component({
  selector: 'app-steering-committee-dossier',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">🏛️</span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                Clinical AI Steering Committee Governance Dossier
              </h2>
              <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase">
                IRB &amp; FDA §520(o) Certified
              </span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              Institutional AI Safety Oversight • Algorithmic Equity Audits • Cochrane Level-A Evidence Distribution
            </p>
          </div>
        </div>

        <button (click)="triggerPrintDossier()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2 self-start sm:self-auto font-mono">
          <span>🖨️</span>
          <span>Export Governance PDF</span>
        </button>
      </div>

      <!-- Main Dossier Content -->
      @if (dossier(); as d) {
        <div class="space-y-6">
          
          <!-- Key Metric Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div class="text-[10px] font-mono font-bold text-zinc-500 uppercase">FDA §520(o) Non-Device CDS</div>
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {{ d.fdaSection520oComplianceScore }}%
              </div>
              <div class="text-[11px] text-zinc-400 mt-0.5 font-sans">Full Clinical Transparency</div>
            </div>

            <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div class="text-[10px] font-mono font-bold text-zinc-500 uppercase">Tier-A Cochrane RCTs</div>
              <div class="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 font-mono">
                {{ d.cochraneEvidenceTiers.tierA_RCTsPercent }}%
              </div>
              <div class="text-[11px] text-zinc-400 mt-0.5 font-sans">Highest Clinical Rigor</div>
            </div>

            <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div class="text-[10px] font-mono font-bold text-zinc-500 uppercase">Physician Time Reclaimed</div>
              <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {{ d.workforceBurnoutReductionHoursPerShift }} hrs
              </div>
              <div class="text-[11px] text-zinc-400 mt-0.5 font-sans">Saved per Clinical Shift</div>
            </div>

            <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div class="text-[10px] font-mono font-bold text-zinc-500 uppercase">Zero-Audio Retention</div>
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 font-mono">
                100%
              </div>
              <div class="text-[11px] text-zinc-400 mt-0.5 font-sans">Ephemeral Audio RAM</div>
            </div>
          </div>

          <!-- Regulatory Compliance Checklist -->
          <div class="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 font-sans text-xs">
            <h4 class="font-bold font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <span>📋</span> Institutional Regulatory Compliance Matrix (Quarter {{ d.reportingQuarter }})
            </h4>
            <div class="space-y-2">
              @for (item of d.regulatoryComplianceMatrix; track item.standardName) {
                <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{{ item.standardName }}</span>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {{ item.auditResult }} ({{ item.evidenceScorePercent }}%)
                      </span>
                    </div>
                    <div class="text-[11px] text-zinc-500 font-mono mt-0.5">{{ item.regulatoryCode }}</div>
                    <p class="text-zinc-600 dark:text-zinc-300 mt-1 leading-snug">{{ item.clinicalRationale }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- SDoH Algorithmic Health Equity Audit -->
          <div class="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 font-sans text-xs">
            <h4 class="font-bold font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <span>⚖️</span> SDoH &amp; Algorithmic Demographic Parity Audit
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (eq of d.sdohEquityAudits; track eq.cohortName) {
                <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ eq.cohortName }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      Parity: {{ eq.parityRatio }}
                    </span>
                  </div>
                  <div class="text-zinc-500 text-[11px] font-mono">Sample Size: {{ eq.sampleSize.toLocaleString() }} consults</div>
                  <div class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <span>✓</span> <span>{{ eq.status }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Signoff & Immutable Digest -->
          <div class="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <div class="space-y-0.5 text-center sm:text-left">
              <div><strong>CMO Signoff:</strong> {{ d.chiefMedicalOfficerSignoff }}</div>
              <div><strong>CNIO Signoff:</strong> {{ d.chiefInformaticsOfficerSignoff }}</div>
            </div>
            <div class="text-right text-[10px] space-y-0.5">
              <div><strong>Audit Digest:</strong> {{ d.cryptographicGovernanceDigest }}</div>
              <div>Generated: {{ d.generatedDate }} • Confidential CSC Record</div>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class SteeringCommitteeDossierComponent {
  cscService = inject(ClinicalSteeringCommitteeDossierService);

  dossier = computed(() => {
    return this.cscService.generateGovernanceDossier();
  });

  triggerPrintDossier() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
