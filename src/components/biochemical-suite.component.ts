import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { IGeneticVariant, IBiochemicalPathway, IPharmacokineticInteraction } from '../services/patient.types';

@Component({
  selector: 'app-biochemical-suite',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl space-y-6">
      
      <!-- Component Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <span class="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase">System Precision Layer</span>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🧬 Physical Sciences & Biochemical Suite
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-semibold text-teal-300 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            GENOMIC SYNCED
          </div>
        </div>
      </div>

      <!-- Main Layout: Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Side: Genomic Profile & PK Matrix (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Section 1: Genomic Variant Profile -->
          <div class="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🧬</span> Genomic Variant Profile (ClinVar / dbSNP)
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">{{ variants().length }} loci detected</span>
            </div>

            @if (variants().length === 0) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No genomic variants loaded for this patient profile.
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                      <th class="py-2.5">Gene</th>
                      <th class="py-2.5">rsID (dbSNP)</th>
                      <th class="py-2.5">Genotype</th>
                      <th class="py-2.5">Pathogenicity</th>
                      <th class="py-2.5">Clinical Significance</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-800/40 text-zinc-300">
                    @for (v of variants(); track v.rsId) {
                      <tr class="hover:bg-zinc-800/20 transition-colors">
                        <td class="py-3 font-bold text-white">{{ v.gene }}</td>
                        <td class="py-3">
                          <a 
                            [href]="'https://www.ncbi.nlm.nih.gov/snp/' + v.rsId" 
                            target="_blank" 
                            class="text-teal-400 hover:text-teal-300 font-mono underline decoration-teal-900/40">
                            {{ v.rsId }}
                          </a>
                        </td>
                        <td class="py-3 font-mono text-[11px]">{{ v.genotype }}</td>
                        <td class="py-3">
                          <span 
                            [class]="pathogenicityBadgeClass(v.pathogenicity)"
                            class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                            {{ v.pathogenicity }}
                          </span>
                        </td>
                        <td class="py-3 text-zinc-400 leading-normal">{{ v.clinicalSignificance }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Section 2: Pharmacokinetic (PK) Interaction Matrix -->
          <div class="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60">
            <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <span>💊</span> Pharmacokinetic (PK) Interaction Matrix
            </h3>

            @if (pkInteractions().length === 0) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No pharmacokinetic interactions recorded.
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (pk of pkInteractions(); track pk.agent) {
                  <div class="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800/60 hover:border-zinc-700/60 transition-all flex flex-col justify-between">
                    <div>
                      <div class="flex items-start justify-between gap-2 mb-2">
                        <h4 class="font-bold text-zinc-100 text-xs tracking-tight">{{ pk.agent }}</h4>
                        <span 
                          [class]="riskLevelBadgeClass(pk.riskLevel)"
                          class="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase">
                          {{ pk.riskLevel }} RISK
                        </span>
                      </div>
                      <p class="text-[11px] text-zinc-400 mb-1"><span class="text-zinc-600 font-mono">Target:</span> {{ pk.target }}</p>
                      <p class="text-[11px] text-zinc-400"><span class="text-zinc-600 font-mono">Effect:</span> {{ pk.effect }}</p>
                    </div>
                    <div class="mt-3 pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>Affinity Profile</span>
                      <span class="text-teal-400 font-semibold">{{ pk.affinity }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

        </div>

        <!-- Right Side: Biochemical Pathways & Status (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          
          <div class="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60 h-full flex flex-col">
            <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <span>🔄</span> Metabolic Pathway Tracker
            </h3>
            
            <div class="space-y-4 flex-1">
              @if (pathways().length === 0) {
                <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                  No metabolic pathway tracking active.
                </div>
              } @else {
                @for (path of pathways(); track path.id) {
                  <div class="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50 hover:border-zinc-800 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-bold text-white text-xs">{{ path.name }}</h4>
                      <span 
                        [class]="pathwayStatusClass(path.status)"
                        class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono">
                        {{ path.status }}
                      </span>
                    </div>
                    
                    <div class="space-y-1.5 text-[11px]">
                      <div class="flex flex-wrap gap-1 text-zinc-400">
                        <span class="text-zinc-600 font-mono text-[10px]">Enzymes:</span>
                        @for (enz of path.activeEnzymes; track enz) {
                          <span class="px-1 py-0.5 bg-zinc-900 text-zinc-300 rounded text-[9px] font-mono border border-zinc-800/40">
                            {{ enz }}
                          </span>
                        }
                      </div>
                      <div class="text-zinc-400">
                        <span class="text-zinc-600 font-mono text-[10px] block">Pathway Status / Blocks:</span>
                        <ul class="list-disc pl-4 space-y-1 text-zinc-400 mt-1 leading-snug">
                          @for (bl of path.blocks; track bl) {
                            <li>{{ bl }}</li>
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Reactome External Reference -->
            <div class="mt-4 pt-4 border-t border-zinc-800/60 text-center">
              <a 
                href="https://reactome.org" 
                target="_blank" 
                class="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold font-mono">
                Launch Reactome Analyzer ↗
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  styles: []
})
export class BiochemicalSuiteComponent {
  private patientState = inject(PatientStateService);

  variants = computed<IGeneticVariant[]>(() => this.patientState.genomicVariants() || []);
  pathways = computed<IBiochemicalPathway[]>(() => this.patientState.biochemicalPathways() || []);
  pkInteractions = computed<IPharmacokineticInteraction[]>(() => this.patientState.pkInteractions() || []);

  pathogenicityBadgeClass(pathogenicity: IGeneticVariant['pathogenicity']): string {
    switch (pathogenicity) {
      case 'Pathogenic':
      case 'Likely Pathogenic':
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
      case 'VUS':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
      case 'Likely Benign':
      case 'Benign':
      default:
        return 'bg-green-500/10 border border-green-500/20 text-green-400';
    }
  }

  riskLevelBadgeClass(risk: IPharmacokineticInteraction['riskLevel']): string {
    switch (risk) {
      case 'Severe':
        return 'bg-rose-600 text-white';
      case 'High':
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
      case 'Moderate':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
      case 'Low':
      default:
        return 'bg-green-500/10 border border-green-500/20 text-green-400';
    }
  }

  pathwayStatusClass(status: IBiochemicalPathway['status']): string {
    switch (status) {
      case 'Blocked':
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
      case 'Sub-optimal':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
      case 'Optimal':
      default:
        return 'bg-teal-500/10 border border-teal-500/20 text-teal-400';
    }
  }
}
