import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacogenomicsService, CypGene } from '../services/pharmacogenomics.service';

@Component({
  selector: 'app-pharmacogenomics-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/90 border border-purple-500/30 text-zinc-100 shadow-xl font-mono backdrop-blur-xl space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🧬</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-purple-400">
              Pharmacogenomics & Cytochrome P450 Metabolizer Engine (Model P4)
            </h3>
            <p class="text-[11px] text-zinc-400">
              CPIC Level 1A Allele Calling, Prodrug Bioactivation Risk, & Herb-Drug Metabolic Guard
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (pgx.hasHighRiskInteractions()) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
              ⚠️ 1A High-Risk Interactions Active
            </span>
          }
          <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Toxicity Risk: {{ pgx.activeProfile()?.overallToxicityRisk || 0 }}/100
          </span>
        </div>
      </div>

      @if (pgx.activeProfile(); as profile) {
        <!-- CYP450 Variant & Diplotype Matrix -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Genomic CYP450 / Metabolizer Diplotypes
            </span>
            <span class="text-[10px] text-zinc-500">
              Interactive CPIC Allele Calling
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            @for (v of profile.variants; track v.gene) {
              <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-purple-300">{{ v.gene }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {{ v.diplotype }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold" [ngClass]="{
                    'text-red-400': v.phenotype === 'Poor Metabolizer',
                    'text-amber-400': v.phenotype === 'Ultra-Rapid Metabolizer',
                    'text-emerald-400': v.phenotype === 'Normal Metabolizer',
                    'text-sky-400': v.phenotype === 'Intermediate Metabolizer'
                  }">
                    {{ v.phenotype }}
                  </span>
                  <span class="text-[10px] text-zinc-500 font-mono">
                    Score: {{ v.activityScore }}
                  </span>
                </div>
                <span class="text-[10px] text-zinc-400 block truncate font-sans">
                  {{ v.affectedDrugClasses.join(', ') }}
                </span>

                @if (v.gene === 'CYP2D6') {
                  <div class="pt-2 border-t border-zinc-800 flex gap-1 text-[9px]">
                    <button (click)="switchAlleles('CYP2D6', '*4', '*4')"
                            class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-red-300 border border-zinc-700 cursor-pointer">
                      *4/*4 (PM)
                    </button>
                    <button (click)="switchAlleles('CYP2D6', '*1xN', '*1')"
                            class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 cursor-pointer">
                      *1xN/*1 (UM)
                    </button>
                  </div>
                } @else if (v.gene === 'CYP2C19') {
                  <div class="pt-2 border-t border-zinc-800 flex gap-1 text-[9px]">
                    <button (click)="switchAlleles('CYP2C19', '*2', '*2')"
                            class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-red-300 border border-zinc-700 cursor-pointer">
                      *2/*2 (PM)
                    </button>
                    <button (click)="switchAlleles('CYP2C19', '*17', '*17')"
                            class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 cursor-pointer">
                      *17/*17 (UM)
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Prodrug Activation & Hyper-Activation Risk Engine -->
        @if (profile.prodrugRisks && profile.prodrugRisks.length > 0) {
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>⚡</span> Prodrug Activation & Conversion Failure Guard
              </span>
              <span class="text-[10px] text-zinc-500">
                CYP2D6, CYP2C19 &amp; CYP3A4 Substrates
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              @for (item of profile.prodrugRisks; track item.drugName) {
                <div class="p-3.5 rounded-2xl bg-zinc-900 border space-y-2"
                     [ngClass]="{
                       'border-red-500/50 bg-red-950/20': item.activationRiskScore >= 80,
                       'border-amber-500/40 bg-amber-950/20': item.activationRiskScore >= 50 && item.activationRiskScore < 80,
                       'border-zinc-800': item.activationRiskScore < 50
                     }">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-white">{{ item.drugName }}</span>
                      <span class="text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono"
                            [ngClass]="item.drugType === 'prodrug' ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-cyan-950 text-cyan-300 border-cyan-700'">
                        {{ item.drugType }}
                      </span>
                      @if (item.fdaBlackBoxWarning) {
                        <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">
                          BLACK BOX
                        </span>
                      }
                    </div>
                    <span class="text-[10px] font-mono font-bold"
                          [ngClass]="item.activationRiskScore >= 80 ? 'text-red-400' : (item.activationRiskScore >= 50 ? 'text-amber-400' : 'text-emerald-400')">
                      Risk: {{ item.activationRiskScore }}/100
                    </span>
                  </div>

                  <div class="text-[11px] font-sans flex items-center justify-between text-zinc-400">
                    <span>Enzyme: <strong class="text-purple-300 font-mono">{{ item.primaryEnzyme }}</strong> ({{ item.patientPhenotype }})</span>
                    @if (item.activeMetabolite) {
                      <span class="text-emerald-400">→ {{ item.activeMetabolite }}</span>
                    }
                  </div>

                  <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    {{ item.clinicalRecommendation }}
                  </p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Herb-Drug & Drug-Drug Metabolic Interaction Guard -->
        @if (profile.herbDrugInteractions && profile.herbDrugInteractions.length > 0) {
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
              <span>🌿</span> Herb-Drug &amp; Metabolic Enzyme Interaction Guard
            </span>
            <div class="space-y-3 text-xs">
              @for (inter of profile.herbDrugInteractions; track inter.agentA + inter.agentB) {
                <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-white text-xs">{{ inter.agentA }} + {{ inter.agentB }}</span>
                      <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                            [ngClass]="{
                              'bg-red-500/20 text-red-300 border border-red-500/40': inter.clinicalSeverity === 'contraindicated',
                              'bg-amber-500/20 text-amber-300 border border-amber-500/40': inter.clinicalSeverity === 'high_risk'
                            }">
                        {{ inter.clinicalSeverity }}
                      </span>
                    </div>
                    <span class="text-[10px] text-purple-400 font-mono">
                      {{ inter.affectedEnzyme }} ({{ inter.mechanism }})
                    </span>
                  </div>
                  <p class="text-[11px] text-zinc-300 font-sans font-medium leading-relaxed">
                    {{ inter.riskSummary }}
                  </p>
                  <p class="text-[10px] text-teal-400 font-sans">
                    <strong>Action:</strong> {{ inter.alternativeSuggestion }}
                  </p>
                </div>
              }
            </div>
          </div>
        }

        <!-- CPIC Level 1A / 1B Clinical Drug-Gene Warnings -->
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            CPIC Level 1A / 1B Clinical Drug-Gene Warnings
          </span>
          <div class="space-y-3 text-xs">
            @for (item of profile.interactions; track item.drugName) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/90 border space-y-1.5" [ngClass]="{
                'border-red-500/40 bg-red-950/20': item.severity === 'contraindicated',
                'border-amber-500/40 bg-amber-950/20': item.severity === 'warning',
                'border-sky-500/40 bg-sky-950/20': item.severity === 'dosage_adjust'
              }">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-white text-xs">{{ item.drugName }}</span>
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" [ngClass]="{
                      'bg-red-500/20 text-red-300 border border-red-500/40': item.severity === 'contraindicated',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40': item.severity === 'warning',
                      'bg-sky-500/20 text-sky-300 border border-sky-500/40': item.severity === 'dosage_adjust'
                    }">
                      {{ item.severity }}
                    </span>
                  </div>
                  <span class="text-[10px] text-purple-400 font-bold">
                    {{ item.gene }} · Level {{ item.evidenceLevel }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-300 font-sans font-medium leading-relaxed">
                  {{ item.clinicalSummary }}
                </p>
                <a [href]="item.cpicGuidelineUrl" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-[10px] text-purple-400 font-bold hover:underline">
                  <span>View CPIC Guideline</span> →
                </a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PharmacogenomicsCardComponent {
  readonly pgx = inject(PharmacogenomicsService);

  switchAlleles(gene: CypGene, mat: string, pat: string) {
    this.pgx.setDiplotype(gene, mat, pat);
  }
}
