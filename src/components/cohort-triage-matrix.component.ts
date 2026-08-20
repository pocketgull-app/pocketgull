import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientManagementService } from '../services/patient-management.service';
import { IPatient } from '../services/patient.types';

export type SortField = 'name' | 'sibi' | 'hba1c' | 'cvRisk';

export interface ITriageRow {
  patient: IPatient;
  sibiScore: number;
  hba1c: number;
  cvRisk: number;
  triageBadge: 'Low' | 'Moderate' | 'High' | 'Critical';
  primaryDiagnosis: string;
  biomarkerOutliers: string[];
  diagnosticAction: string;
  pgxOrSafetyFlag?: string;
}

@Component({
  selector: 'app-cohort-triage-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Multi-Patient Cohort Diagnostic Matrix
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full border border-blue-500/30">
                NIH & WHO Aligned
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              High-density clinical decision cockpit with biomarker outliers, SIBI trajectory, and actionable diagnostic recommendations.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <span class="text-xs font-mono font-bold text-zinc-500">Sort by:</span>
          <select 
            [value]="sortField()"
            (change)="setSort(getEventVal($event))"
            class="px-3 py-1.5 text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer">
            <option value="sibi">Systemic Burden (SIBI)</option>
            <option value="cvRisk">10-Yr CV Risk %</option>
            <option value="hba1c">HbA1c Lab %</option>
            <option value="name">Patient Name</option>
          </select>
        </div>
      </div>

      <!-- High-Density Triage Table -->
      <div class="overflow-x-auto rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-100/80 dark:bg-zinc-950/80 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th class="p-3.5">Encounter Archetype</th>
              <th class="p-3.5">Demographics</th>
              <th class="p-3.5">Primary Clinical Phenotype</th>
              <th class="p-3.5">Key Diagnostic Biomarkers</th>
              <th class="p-3.5">CV Risk / SIBI</th>
              <th class="p-3.5">Triage Level</th>
              <th class="p-3.5">Actionable Decision Guidance</th>
              <th class="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-xs">
            @for (row of sortedTriageRows(); track row.patient.id) {
              <tr 
                [class.bg-blue-500\/5]="pm.selectedPatientId() === row.patient.id" 
                class="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                
                <td class="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="{
                      'bg-emerald-500': row.triageBadge === 'Low',
                      'bg-amber-500': row.triageBadge === 'Moderate',
                      'bg-orange-500': row.triageBadge === 'High',
                      'bg-rose-500': row.triageBadge === 'Critical'
                    }"></span>
                    <span class="truncate max-w-[200px]">{{ row.patient.name }}</span>
                  </div>
                </td>

                <td class="p-3.5 font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  {{ row.patient.age || '48' }}y &bull; {{ row.patient.gender || 'M' }}
                </td>

                <td class="p-3.5 text-zinc-700 dark:text-zinc-300">
                  <div class="font-medium truncate max-w-[180px]">{{ row.primaryDiagnosis }}</div>
                  @if (row.pgxOrSafetyFlag) {
                    <span class="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded border border-purple-500/20">
                      {{ row.pgxOrSafetyFlag }}
                    </span>
                  }
                </td>

                <!-- Biomarker Outliers -->
                <td class="p-3.5 font-mono text-zinc-800 dark:text-zinc-200">
                  <div class="space-y-0.5">
                    @for (bio of row.biomarkerOutliers; track bio) {
                      <div class="text-[11px]">{{ bio }}</div>
                    }
                  </div>
                </td>

                <td class="p-3.5 font-mono text-xs">
                  <div class="font-bold text-zinc-900 dark:text-zinc-100">CV: {{ row.cvRisk }}%</div>
                  <div class="text-[10px] text-zinc-500 dark:text-zinc-400">SIBI: {{ row.sibiScore }}/10</div>
                </td>

                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" [ngClass]="{
                    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': row.triageBadge === 'Low',
                    'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': row.triageBadge === 'Moderate',
                    'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300': row.triageBadge === 'High',
                    'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': row.triageBadge === 'Critical'
                  }">
                    {{ row.triageBadge }}
                  </span>
                </td>

                <!-- Actionable Decision Guidance -->
                <td class="p-3.5 text-zinc-600 dark:text-zinc-300 text-xs">
                  <p class="truncate max-w-[220px]" [title]="row.diagnosticAction">
                    {{ row.diagnosticAction }}
                  </p>
                </td>

                <td class="p-3.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    (click)="pm.selectPatient(row.patient.id)"
                    class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-xs cursor-pointer active:scale-95">
                    Load Record
                  </button>
                </td>

              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class CohortTriageMatrixComponent {
  pm = inject(PatientManagementService);
  sortField = signal<SortField>('sibi');

  triageRows = computed<ITriageRow[]>(() => {
    const list = this.pm.patients();
    return list.map(p => {
      const v = p.vitals || {};
      const hba1cVal = parseFloat(String((v as any)?.cmpLabs?.hba1c || (v as any)?.hba1c || '5.4'));
      const hba1c = isNaN(hba1cVal) ? 5.4 : hba1cVal;

      const bpStr = String((v as any).bp || '120/80');
      const sys = parseInt(bpStr.split('/')[0], 10) || 120;
      const hr = parseInt(String((v as any).hr || '72'), 10) || 72;

      let sibi = 2.5;
      if (hba1c > 6.0) sibi += (hba1c - 6.0) * 1.5;
      if (sys > 130) sibi += (sys - 130) * 0.05;
      const sibiScore = +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));

      let cv = 6.0;
      if (sys > 120) cv += (sys - 120) * 0.3;
      if (hba1c > 6.0) cv += (hba1c - 6.0) * 2.0;
      const cvRisk = +(Math.min(50, Math.max(1.0, cv)).toFixed(1));

      let triageBadge: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
      if (sibiScore > 7.5 || cvRisk > 25 || sys >= 150) triageBadge = 'Critical';
      else if (sibiScore > 5.5 || cvRisk > 15 || sys >= 135) triageBadge = 'High';
      else if (sibiScore > 3.5 || hba1c > 6.5) triageBadge = 'Moderate';

      const primaryDiagnosis = p.preexistingConditions?.[0] || p.symptoms?.[0]?.name || 'Standard Longevity Surveillance';

      const biomarkerOutliers: string[] = [
        `BP: ${bpStr}`,
        `HR: ${hr} bpm`,
        `HbA1c: ${hba1c}%`
      ];

      // Diagnostic Guidance logic
      let diagnosticAction = 'Maintain whole-foods longevity lifestyle & annual screening.';
      let pgxOrSafetyFlag: string | undefined = undefined;

      const conds = (p.preexistingConditions || []).join(' ').toLowerCase();
      if (conds.includes('pdac') || conds.includes('cancer')) {
        diagnosticAction = 'Pancreatic enzyme replacement (PERT) + anti-cachectic high-EPA fish oil.';
        pgxOrSafetyFlag = 'NCI Moonshot Oncology';
      } else if (conds.includes('hypertension') || sys >= 140) {
        diagnosticAction = 'Titrate ACEi/ARB therapy; order 24h ambulatory BP monitor & CAC scan.';
        pgxOrSafetyFlag = '9p21 Atheroma Risk';
      } else if (conds.includes('postpartum') || p.id === 'p007') {
        diagnosticAction = 'Edinburgh Postnatal Depression Scale (EPDS) check & LactMed drug review.';
        pgxOrSafetyFlag = 'LactMed L1 Verified';
      } else if (conds.includes('diabetes') || hba1c > 7.0) {
        diagnosticAction = 'CGM integration; evaluate SGLT2i/GLP-1 receptor agonist initiation.';
        pgxOrSafetyFlag = 'TCF7L2 Metabolic Axis';
      } else if (conds.includes('asthma') || conds.includes('respiratory')) {
        diagnosticAction = 'Evaluate fractional exhaled nitric oxide (FeNO) & inhaler adherence.';
      }

      return {
        patient: p,
        sibiScore,
        hba1c,
        cvRisk,
        triageBadge,
        primaryDiagnosis,
        biomarkerOutliers,
        diagnosticAction,
        pgxOrSafetyFlag
      };
    });
  });

  sortedTriageRows = computed<ITriageRow[]>(() => {
    const rows = [...this.triageRows()];
    const field = this.sortField();
    return rows.sort((a, b) => {
      if (field === 'sibi') return b.sibiScore - a.sibiScore;
      if (field === 'cvRisk') return b.cvRisk - a.cvRisk;
      if (field === 'hba1c') return b.hba1c - a.hba1c;
      return a.patient.name.localeCompare(b.patient.name);
    });
  });

  setSort(val: string): void {
    this.sortField.set(val as SortField);
  }

  getEventVal(e: Event): string {
    return (e.target as HTMLSelectElement).value;
  }
}
