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
}

@Component({
  selector: 'app-cohort-triage-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-4 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">
            📊
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Multi-Patient Cohort Triage Matrix
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full border border-blue-500/30">Panel-Wide Roster</span>
            </h3>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              High-density clinical risk matrix & SIBI trajectory panel across active encounters.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
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
      <div class="overflow-x-auto rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-100/80 dark:bg-zinc-950/80 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th class="p-3">Patient Encounter</th>
              <th class="p-3">Age / Sex</th>
              <th class="p-3">Primary Diagnosis</th>
              <th class="p-3">HbA1c</th>
              <th class="p-3">10-Yr CV Risk</th>
              <th class="p-3">SIBI Score</th>
              <th class="p-3">Triage Level</th>
              <th class="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-xs">
            @for (row of sortedTriageRows(); track row.patient.id) {
              <tr [class.bg-blue-500\/5]="pm.selectedPatientId() === row.patient.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                
                <td class="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [ngClass]="{
                      'bg-emerald-500': row.triageBadge === 'Low',
                      'bg-amber-500': row.triageBadge === 'Moderate',
                      'bg-orange-500': row.triageBadge === 'High',
                      'bg-rose-500': row.triageBadge === 'Critical'
                    }"></span>
                    <span>{{ row.patient.name }}</span>
                  </div>
                </td>

                <td class="p-3 font-mono text-zinc-500 dark:text-zinc-400">
                  {{ row.patient.age || '48' }} / {{ row.patient.gender || 'M' }}
                </td>

                <td class="p-3 text-zinc-600 dark:text-zinc-300">
                  {{ row.patient.preexistingConditions?.[0] || 'Type 2 Diabetes Mellitus' }}
                </td>

                <td class="p-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {{ row.hba1c }}%
                </td>

                <td class="p-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {{ row.cvRisk }}%
                </td>

                <td class="p-3 font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {{ row.sibiScore }} <span class="text-[10px] text-zinc-400">/ 10</span>
                </td>

                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border" [ngClass]="{
                    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': row.triageBadge === 'Low',
                    'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': row.triageBadge === 'Moderate',
                    'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300': row.triageBadge === 'High',
                    'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': row.triageBadge === 'Critical'
                  }">
                    {{ row.triageBadge }}
                  </span>
                </td>

                <td class="p-3 text-right">
                  <button
                    type="button"
                    (click)="pm.selectPatient(row.patient.id)"
                    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-xs cursor-pointer active:scale-[0.98]">
                    Load Encounter
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
      const hba1cVal = parseFloat(String((v as any)?.cmpLabs?.hba1c || (v as any)?.hba1c || '6.5'));
      const hba1c = isNaN(hba1cVal) ? 6.5 : hba1cVal;

      const bpStr = String((v as any).bp || '128/82');
      const sys = parseInt(bpStr.split('/')[0], 10) || 128;

      let sibi = 3.0;
      if (hba1c > 6.5) sibi += (hba1c - 6.5) * 1.5;
      if (sys > 130) sibi += (sys - 130) * 0.05;
      const sibiScore = +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));

      let cv = 8.0;
      if (sys > 120) cv += (sys - 120) * 0.3;
      if (hba1c > 6.0) cv += (hba1c - 6.0) * 2.0;
      const cvRisk = +(Math.min(50, Math.max(1.0, cv)).toFixed(1));

      let triageBadge: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
      if (sibiScore > 7.5 || cvRisk > 25) triageBadge = 'Critical';
      else if (sibiScore > 5.5 || cvRisk > 15) triageBadge = 'High';
      else if (sibiScore > 3.5) triageBadge = 'Moderate';

      return {
        patient: p,
        sibiScore,
        hba1c,
        cvRisk,
        triageBadge
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

  setSort(val: string) {
    this.sortField.set(val as SortField);
  }

  getEventVal(e: Event): string {
    return (e.target as HTMLSelectElement).value;
  }
}
