import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacogenomicsService, ICypVariant, IDrugGeneInteraction } from '../services/pharmacogenomics.service';

@Component({
  selector: 'app-pharmacogenomics-optimizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto"
         (click)="close.emit()">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">🧬</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                  Pharmacogenomics (PGx) &amp; CPIC Safety Optimizer
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  CPIC Level A • Drug-Gene Safety Guard
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                CYP450 Star-Allele Matching • Phenoconversion Modeling • Toxic Drug Interception
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Scrollable Content Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          <!-- High-Level Alert Banner -->
          <div class="p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
               [class.bg-rose-50]="pgxService.contraindicatedCount() > 0"
               [class.dark:bg-rose-950/20]="pgxService.contraindicatedCount() > 0"
               [class.border-rose-200]="pgxService.contraindicatedCount() > 0"
               [class.dark:border-rose-900/40]="pgxService.contraindicatedCount() > 0"
               [class.bg-emerald-50]="pgxService.contraindicatedCount() === 0"
               [class.dark:bg-emerald-950/20]="pgxService.contraindicatedCount() === 0"
               [class.border-emerald-200]="pgxService.contraindicatedCount() === 0"
               [class.dark:border-emerald-900/40]="pgxService.contraindicatedCount() === 0">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg">
                  {{ pgxService.contraindicatedCount() > 0 ? '⚠️' : '✓' }}
                </span>
                <h3 class="text-sm font-bold font-mono uppercase tracking-wider"
                    [class.text-rose-800]="pgxService.contraindicatedCount() > 0"
                    [class.dark:text-rose-300]="pgxService.contraindicatedCount() > 0"
                    [class.text-emerald-800]="pgxService.contraindicatedCount() === 0"
                    [class.dark:text-emerald-300]="pgxService.contraindicatedCount() === 0">
                  {{ pgxService.contraindicatedCount() }} Strict CPIC Contraindications Detected
                </h3>
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
                {{ pgxService.contraindicatedCount() > 0 
                  ? 'High risk of adverse drug reactions or therapeutic failure identified. See recommended alternatives below.' 
                  : 'All analyzed drug-gene pairs conform to standard dosing safety thresholds.' }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <span class="text-[10px] font-mono uppercase text-zinc-400 block">Overall Toxicity Risk</span>
              <span class="text-2xl font-bold font-mono"
                    [class.text-rose-600]="(pgxService.activeProfile()?.overallToxicityRisk || 0) > 50"
                    [class.text-emerald-600]="(pgxService.activeProfile()?.overallToxicityRisk || 0) <= 50">
                {{ pgxService.activeProfile()?.overallToxicityRisk || 0 }}%
              </span>
            </div>
          </div>

          <!-- Interactive Gene Diplotype Matrix -->
          <div class="space-y-3">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>🧬 Patient Diplotypes &amp; Metabolizer Status</span>
              <span class="text-[10px] text-zinc-400">Click to switch allele &amp; re-evaluate</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              @for (variant of pgxService.activeProfile()?.variants; track variant.gene) {
                <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {{ variant.gene }}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          [class.bg-rose-100]="variant.phenotype.includes('Poor') || variant.phenotype.includes('Positive')"
                          [class.text-rose-800]="variant.phenotype.includes('Poor') || variant.phenotype.includes('Positive')"
                          [class.bg-amber-100]="variant.phenotype.includes('Intermediate') || variant.phenotype.includes('Ultra')"
                          [class.text-amber-800]="variant.phenotype.includes('Intermediate') || variant.phenotype.includes('Ultra')"
                          [class.bg-emerald-100]="variant.phenotype.includes('Normal') || variant.phenotype.includes('Negative')"
                          [class.text-emerald-800]="variant.phenotype.includes('Normal') || variant.phenotype.includes('Negative')">
                      {{ variant.phenotype }}
                    </span>
                  </div>

                  <div class="text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>Diplotype: <strong class="text-zinc-800 dark:text-zinc-200">{{ variant.diplotype }}</strong></span>
                    <span>Act: {{ variant.activityScore }}</span>
                  </div>

                  <!-- Quick Allele Toggle Buttons -->
                  <div class="flex gap-1 pt-1">
                    @if (variant.gene === 'CYP2D6') {
                      <button (click)="pgxService.updateGeneDiplotype('CYP2D6', '*4/*4')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Poor (*4/*4)</button>
                      <button (click)="pgxService.updateGeneDiplotype('CYP2D6', '*1/*1')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Normal (*1/*1)</button>
                      <button (click)="pgxService.updateGeneDiplotype('CYP2D6', '*1xN')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Ultra (*1xN)</button>
                    } @else if (variant.gene === 'CYP2C19') {
                      <button (click)="pgxService.updateGeneDiplotype('CYP2C19', '*2/*2')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Poor (*2/*2)</button>
                      <button (click)="pgxService.updateGeneDiplotype('CYP2C19', '*1/*1')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Normal (*1/*1)</button>
                    } @else if (variant.gene === 'SLCO1B1') {
                      <button (click)="pgxService.updateGeneDiplotype('SLCO1B1', '*5/*5')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Risk (*5/*5)</button>
                      <button (click)="pgxService.updateGeneDiplotype('SLCO1B1', '*1/*1')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Normal (*1/*1)</button>
                    } @else if (variant.gene === 'HLA-B*57:01') {
                      <button (click)="pgxService.updateGeneDiplotype('HLA-B*57:01', 'Pos')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Positive</button>
                      <button (click)="pgxService.updateGeneDiplotype('HLA-B*57:01', 'Neg')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Negative</button>
                    } @else {
                      <button (click)="pgxService.updateGeneDiplotype(variant.gene, '*1/*1')" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono hover:bg-zinc-300">Reset Normal</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Phenoconversion Simulation Strip -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>⚡ Drug-Induced Phenoconversion (Concomitant Inhibitors)</span>
              <span class="text-[10px] text-zinc-400">Converts normal genotypic metabolizers into phenotypic poor metabolizers</span>
            </h4>
            <div class="flex flex-wrap gap-2 pt-1">
              <button (click)="pgxService.toggleInhibitor('Fluoxetine')"
                class="px-3 py-1 rounded-xl text-xs font-mono transition cursor-pointer border"
                [class.bg-amber-600]="pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')"
                [class.text-white]="pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')"
                [class.bg-white]="!pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')"
                [class.dark:bg-zinc-950]="!pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')"
                [class.text-zinc-700]="!pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')"
                [class.dark:text-zinc-300]="!pgxService.selectedConcomitantInhibitors().includes('Fluoxetine')">
                {{ pgxService.selectedConcomitantInhibitors().includes('Fluoxetine') ? '✓ Fluoxetine (Active 2D6 Inhibitor)' : '+ Add Fluoxetine (Prozac)' }}
              </button>

              <button (click)="pgxService.toggleInhibitor('Bupropion')"
                class="px-3 py-1 rounded-xl text-xs font-mono transition cursor-pointer border"
                [class.bg-amber-600]="pgxService.selectedConcomitantInhibitors().includes('Bupropion')"
                [class.text-white]="pgxService.selectedConcomitantInhibitors().includes('Bupropion')"
                [class.bg-white]="!pgxService.selectedConcomitantInhibitors().includes('Bupropion')"
                [class.dark:bg-zinc-950]="!pgxService.selectedConcomitantInhibitors().includes('Bupropion')"
                [class.text-zinc-700]="!pgxService.selectedConcomitantInhibitors().includes('Bupropion')"
                [class.dark:text-zinc-300]="!pgxService.selectedConcomitantInhibitors().includes('Bupropion')">
                {{ pgxService.selectedConcomitantInhibitors().includes('Bupropion') ? '✓ Bupropion (Active 2D6 Inhibitor)' : '+ Add Bupropion (Wellbutrin)' }}
              </button>
            </div>
          </div>

          <!-- Active CPIC Drug Interactions List -->
          <div class="space-y-3">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              📋 Identified CPIC Drug-Gene Interactions &amp; Prescribing Actions
            </h3>

            <div class="space-y-3">
              @for (item of pgxService.activeProfile()?.interactions; track item.drugName) {
                <div class="p-5 rounded-2xl border space-y-3"
                     [class.bg-rose-50/40]="item.severity === 'contraindicated'"
                     [class.dark:bg-rose-950/10]="item.severity === 'contraindicated'"
                     [class.border-rose-200]="item.severity === 'contraindicated'"
                     [class.dark:border-rose-900/40]="item.severity === 'contraindicated'"
                     [class.bg-amber-50/40]="item.severity === 'warning'"
                     [class.dark:bg-amber-950/10]="item.severity === 'warning'"
                     [class.border-amber-200]="item.severity === 'warning'"
                     [class.dark:border-amber-900/40]="item.severity === 'warning'"
                     [class.bg-zinc-50]="item.severity === 'dosage_adjust'"
                     [class.dark:bg-zinc-900]="item.severity === 'dosage_adjust'"
                     [class.border-zinc-200]="item.severity === 'dosage_adjust'"
                     [class.dark:border-zinc-800]="item.severity === 'dosage_adjust'">
                  
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                        {{ item.drugName }}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            [class.bg-rose-100]="item.severity === 'contraindicated'"
                            [class.text-rose-800]="item.severity === 'contraindicated'"
                            [class.bg-amber-100]="item.severity === 'warning'"
                            [class.text-amber-800]="item.severity === 'warning'"
                            [class.bg-blue-100]="item.severity === 'dosage_adjust'"
                            [class.text-blue-800]="item.severity === 'dosage_adjust'">
                        {{ item.severity | uppercase }}
                      </span>
                      <span class="text-[11px] font-mono text-zinc-400">
                        Target: {{ item.gene }}
                      </span>
                    </div>

                    <span class="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                      {{ item.evidenceLevel }}
                    </span>
                  </div>

                  <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {{ item.clinicalSummary }}
                  </p>

                  @if (item.phenoconversionRisk) {
                    <div class="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-[11px] font-mono text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      ⚡ {{ item.phenoconversionRisk }}
                    </div>
                  }

                  <!-- Recommended Alternative Box -->
                  <div class="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span class="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                      🛡️ Recommended Safe Alternative / Action:
                    </span>
                    <p class="text-xs font-sans text-zinc-800 dark:text-zinc-200">
                      {{ item.recommendedAlternative }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <span class="text-[11px] font-mono text-zinc-500">
            CPIC Level A Verified • Adverse Drug Reaction Prevention
          </span>
          <button (click)="close.emit()"
            class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
            Close Optimizer
          </button>
        </div>

      </div>

    </div>
  `
})
export class PharmacogenomicsOptimizerComponent {
  pgxService = inject(PharmacogenomicsService);
  close = output<void>();
}
