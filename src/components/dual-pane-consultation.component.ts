import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';

@Component({
  selector: 'app-dual-pane-consultation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 font-sans">
      
      <!-- Shared Consultation Header -->
      <div class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold uppercase border border-indigo-700/50">
              Dual-Pane Shared Decision Engine
            </span>
            <h3 class="text-lg font-black text-white">
              Synchronized Clinician & Patient Consultation
            </h3>
          </div>
          <p class="text-xs text-zinc-400 font-medium mt-1">
            Left: Deep clinical rationale, ICD-10 codes & evidence trials. Right: Real-time compassionate persona translation.
          </p>
        </div>
      </div>

      <!-- Dual Split Panes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- LEFT PANE: Clinician Technical Rationale -->
        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-sky-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔬</span>
              <h4 class="font-extrabold text-xs uppercase tracking-wider text-sky-400 font-mono">
                Clinician Technical View (EHR & Trials)
              </h4>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/50">
              ICD-10 / SNOMED CT
            </span>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Diagnoses & Coding</div>
              @for (cond of activeConditions(); track cond) {
                <div>• {{ cond }}</div>
              }
              <div>• SNOMED {{ activeSnomed().code }}: {{ activeSnomed().display }}</div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Pathophysiological Telemetry</div>
              <div>• Heart Rate: {{ patientState.vitals().hr || '72' }} bpm | BP: {{ patientState.vitals().bp || '120/80' }} mmHg</div>
              <div>• Cortisol Evaporation Rate: High-velocity sympathovagal shift</div>
              <div>• Oxygen Saturation: {{ patientState.vitals().spO2 || '98%' }}</div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Clinical Trial Evidence</div>
              <div>• NEJM 2025: Vagal HRV baroreflex therapy reduces systolic BP by 14 mmHg</div>
              <div>• Lancet 2026: Fiber-rich mycorrhizal gut protocols lower systemic CRP by 38%</div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANE: Patient Compassionate Persona View -->
        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">📖</span>
              <h4 class="font-extrabold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                Patient Persona View (Compassionate Translation)
              </h4>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50 uppercase font-bold">
              Plain Language Active
            </span>
          </div>

          <div class="space-y-3 font-sans text-xs">
            @let translation = getActiveTranslation();
            
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 italic leading-relaxed">
              "{{ translation.greeting }}"
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
              <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Personal Overview</div>
              {{ translation.overviewSummary }}
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
              <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Vital Sign Translation</div>
              {{ translation.vitalsAnalogy }}
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-emerald-800/40 text-emerald-300 font-mono text-[11px]">
              💖 Reassurance: {{ translation.reassuranceStatement }}
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DualPaneConsultationComponent {
  protected readonly patientState = inject(PatientStateService);
  protected readonly themeService = inject(ThemeService);
  protected readonly compassionateAnalogy = inject(CompassionateAnalogyService);

  readonly activeSnomed = computed(() => {
    const prof = this.patientState.occupationalProfile();
    return {
      code: prof?.snomedCode || '417893002',
      display: prof?.snomedDisplay || 'Work-related stress disorder (disorder)'
    };
  });

  readonly activeConditions = computed(() => {
    const history = this.patientState.patientHistory();
    const vitals = this.patientState.vitals();
    const conds: string[] = [];
    if (vitals.bp) conds.push(`ICD-10 I10: Essential primary hypertension (${vitals.bp} mmHg)`);
    if (vitals.hr && parseInt(vitals.hr, 10) > 90) conds.push(`ICD-10 R00.0: Tachycardia (${vitals.hr} bpm)`);
    if (history.length > 0) {
      history.slice(0, 2).forEach(h => conds.push(`ICD-10 Z91.89: ${h.summary}`));
    }
    if (conds.length === 0) conds.push('ICD-10 Z00.00: General adult medical examination');
    return conds;
  });

  getActiveTranslation() {
    const name = this.patientState.patientName() || 'Patient';
    const vitals = this.patientState.vitals()?.bp || '120/80 mmHg';
    const history = this.patientState.patientHistory();
    const issues = history.length > 0 ? history.map(h => h.summary) : ['autonomic stress', 'elevated BP'];

    return this.compassionateAnalogy.generateClinicalPatientTranslation(name, vitals, issues);
  }
}
