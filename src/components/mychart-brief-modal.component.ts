import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { ExportService } from '../services/export.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

export interface ILabOption {
  id: string;
  name: string;
  category: string;
  rationale: string;
  selected: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-mychart-brief-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      
      <!-- Modal Container -->
      <div class="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold">
              🏥
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-zinc-100">Epic MyChart Physician Visit Brief & Lab Navigator</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Empower your PCP visit with 3-paradigm pre-briefs and targeted longevity lab requests</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-6 flex-1 overflow-y-auto space-y-6">
          
          <!-- 1. Patient Consultation Brief Card -->
          <div class="p-5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700/60 pb-3">
              <span class="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">1-Page PCP Consultation Brief</span>
              <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Patient: {{ state.patientName() || 'Patient' }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-slate-400">Current Vitals</span>
                <p class="font-medium text-slate-800 dark:text-zinc-200">
                  BP: {{ state.vitals().bp || '120/80' }} | HR: {{ state.vitals().hr || '72' }} bpm | SpO2: {{ state.vitals().spO2 || '98%' }}
                </p>
              </div>

              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-slate-400">Actuarial Longevity Delta</span>
                <p class="font-medium text-emerald-600 dark:text-emerald-400">
                  Biological Age: {{ actuarialProfile().biologicalAge }} ({{ actuarialProfile().biologicalAgeDelta < 0 ? '' : '+' }}{{ actuarialProfile().biologicalAgeDelta }} yrs) | +{{ actuarialProfile().projectedQalyGain }} QALYs
                </p>
              </div>

              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-slate-400">Vagal Tone Resonant Status</span>
                <p class="font-medium text-indigo-600 dark:text-indigo-400">
                  HRV 6.0 bpm Vagal Tone Active
                </p>
              </div>
            </div>

            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Top Clinical Priorities for PCP Discussion</span>
              <ul class="list-disc list-inside text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                <li><strong>Western Clinical</strong>: Comprehensive metabolic panel & cardiometabolic risk screening.</li>
                <li><strong>Eastern TCM Meridian</strong>: Harmonize Liver Qi & calm Shen to reduce stress-induced cortisol.</li>
                <li><strong>Ayurvedic Constitution</strong>: Pacify Vata/Pitta, kindle Agni, and eliminate cellular Ama.</li>
              </ul>
            </div>
          </div>

          <!-- 2. Targeted Longevity Lab Request Checklist -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-zinc-100">Targeted Longevity Lab Request Checklist</h3>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Select non-standard labs to request from your doctor at your next physical</p>
              </div>
              <span class="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">
                {{ selectedCount() }} Selected
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div *ngFor="let lab of labs()" 
                (click)="toggleLab(lab.id)"
                [class.border-teal-500]="lab.selected"
                [class.bg-teal-500\/5]="lab.selected"
                class="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-start gap-3">
                <input type="checkbox" [checked]="lab.selected" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer" (click)="$event.stopPropagation(); toggleLab(lab.id)">
                <div class="space-y-0.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 dark:text-zinc-200">{{ lab.name }}</span>
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{{ lab.category }}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">{{ lab.rationale }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 bg-slate-50 dark:bg-zinc-850 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-zinc-400">Ready to attach directly to MyChart message</span>
          <div class="flex items-center gap-3">
            <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
              Close
            </pocket-gull-button>

            <pocket-gull-button (click)="exportForMyChart()" variant="primary" size="sm" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4">
              Export Brief PDF for MyChart
            </pocket-gull-button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class MyChartBriefModalComponent {
  closeModal = output<void>();

  state = inject(PatientStateService);
  intelligence = inject(ClinicalIntelligenceService);
  actuarialService = inject(ActuarialLongevityService);
  exportService = inject(ExportService);

  actuarialProfile = signal(
    this.actuarialService.calculateActuarialProfile(this.state.vitals(), 80, 45)
  );

  labs = signal<ILabOption[]>([
    {
      id: 'apob',
      name: 'ApoB (Apolipoprotein B)',
      category: 'Cardiovascular',
      rationale: 'Direct measurement of total atherogenic particle count, superior to standard LDL-C.',
      selected: true
    },
    {
      id: 'fasting_insulin',
      name: 'Fasting Insulin',
      category: 'Metabolic',
      rationale: 'Detects early insulin resistance and metabolic dysfunction years before elevated glucose.',
      selected: true
    },
    {
      id: 'hscrp',
      name: 'High-Sensitivity CRP (hs-CRP)',
      category: 'Inflammation',
      rationale: 'Quantifies systemic vascular inflammation and inflammaging risk.',
      selected: true
    },
    {
      id: 'homocysteine',
      name: 'Homocysteine',
      category: 'Methylation',
      rationale: 'Assesses methylation pathway efficiency, vascular health, and cognitive longevity.',
      selected: true
    },
    {
      id: 'vit_d3',
      name: 'Serum 25-OH Vitamin D3',
      category: 'Epigenetic',
      rationale: 'Optimizes immune function, bone density, and epigenetic gene expression.',
      selected: true
    },
    {
      id: 'rbc_magnesium',
      name: 'RBC Magnesium',
      category: 'Cellular',
      rationale: 'Evaluates intracellular magnesium levels critical for ATP synthesis and NMDA regulation.',
      selected: false
    }
  ]);

  toggleLab(id: string) {
    this.labs.update(list => list.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  }

  selectedCount() {
    return this.labs().filter(l => l.selected).length;
  }

  exportForMyChart() {
    const selectedLabs = this.labs().filter(l => l.selected).map(l => `- **${l.name}**: ${l.rationale}`).join('\n');
    const patientName = this.state.patientName() || 'Patient';
    
    const content = `# Epic MyChart Physician Consultation Brief
**Patient Name**: ${patientName}
**Generated Date**: ${new Date().toLocaleDateString()}

## 1. Clinical Vitals & Actuarial Summary
- **Vitals**: BP ${this.state.vitals().bp || '120/80'} | HR ${this.state.vitals().hr || '72'} bpm | SpO2 ${this.state.vitals().spO2 || '98%'}
- **Biological Age Delta**: ${this.actuarialProfile().biologicalAge} (Biological) vs 45 (Chronological)
- **Projected QALY Gain**: +${this.actuarialProfile().projectedQalyGain} Quality-Adjusted Life Years

## 2. Multi-Paradigm Priorities for Physician Review
- **Western**: Cardiometabolic & metabolic health optimization.
- **Eastern TCM**: Liver Qi & Shen harmonization to reduce cortisol.
- **Ayurvedic**: Agni normalization & Ama clearing.

## 3. Requested Longevity Lab Panel Additions
${selectedLabs}
`;

    this.exportService.exportPdfReport(content, `${patientName}_MyChart_Brief`);
  }
}
