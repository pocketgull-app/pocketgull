import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MattMightPrecisionEngineService, IPrecisionCaseStudy, IRepurposingCandidate } from '../services/precision-medicine-might.service';
import { NOfOneBayesianSimulatorService, INOfOneSimulationResult } from '../services/n-of-one-bayesian-simulator.service';
import { MatchmakerExchangeService, IMatchResult } from '../services/matchmaker-exchange.service';
import { PrecisionRegulatoryDossierService } from '../services/precision-regulatory-dossier.service';
import { ModelOrganism3DViewerComponent } from './anatomy-3d/model-organism-3d-viewer.component';
import { ExportService } from '../services/export.service';

@Component({
  selector: 'app-matt-might-precision-medicine',
  standalone: true,
  imports: [CommonModule, ModelOrganism3DViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="mightPrecisionTitle" class="my-8 font-mono text-zinc-100 rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <!-- Ambient Background Glow -->
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header & Scientific Framework Ribbon -->
      <header class="relative z-10 border-b border-zinc-800 pb-6 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider">
                Dr. Matthew Might • Precision Medicine Algorithm
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700">
                mediKanren & N-of-1 Engine
              </span>
            </div>
            <h2 id="mightPrecisionTitle" class="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🧬</span> The Algorithm for Precision Medicine
            </h2>
            <p class="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl font-sans leading-relaxed">
              When standard care runs out: Translating patient whole exome/genome sequencing into functional knowledge graphs, automated FDA drug repurposing hypotheses, and rapid N-of-1 clinical trials.
            </p>
          </div>

          <!-- Regulatory & Diagnostic Export Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button (click)="exportTrialProtocol()"
                    type="button"
                    class="min-h-[48px] px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold text-xs uppercase tracking-wider transition border border-amber-500/40 cursor-pointer active:scale-95 shadow-md"
                    aria-label="Export N-of-1 Protocol as FHIR R4 Bundle">
              <span>📄</span>
              <span>N-of-1 FHIR</span>
            </button>

            <button (click)="exportUdnGatewayBundle()"
                    type="button"
                    class="min-h-[48px] px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-cyan-300 font-bold text-xs uppercase tracking-wider transition border border-cyan-500/40 cursor-pointer active:scale-95 shadow-md"
                    aria-label="Export Harvard UDN Gateway Submission Bundle">
              <span>🏛️</span>
              <span>Harvard UDN</span>
            </button>

            <button (click)="exportNihGrantNarrative()"
                    type="button"
                    class="min-h-[48px] px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider transition border border-blue-400/40 cursor-pointer active:scale-95 shadow-md"
                    aria-label="Export NIH U54 Grant Application Narrative">
              <span>📜</span>
              <span>NIH U54 Grant</span>
            </button>

            <button (click)="exportFdaIndDossier()"
                    type="button"
                    class="min-h-[48px] px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider transition border border-emerald-400/40 cursor-pointer active:scale-95 shadow-md"
                    aria-label="Export FDA 21 CFR 312.310 Expanded Access IND Dossier">
              <span>🇺🇸</span>
              <span>FDA IND Dossier</span>
            </button>
          </div>
        </div>

        <!-- Case Selection Tabs -->
        <nav aria-label="Precision Medicine Landmark Cases" class="flex flex-wrap items-center gap-2 mt-6">
          <span class="text-[11px] font-bold text-zinc-400 uppercase mr-1">Landmark Cases:</span>
          @for (c of precisionEngine.landmarkCases; track c.id) {
            <button (click)="selectCase(c.id)"
                    type="button"
                    [class.bg-amber-500]="activeCase().id === c.id"
                    [class.text-zinc-950]="activeCase().id === c.id"
                    [class.font-black]="activeCase().id === c.id"
                    [class.border-amber-400]="activeCase().id === c.id"
                    [class.bg-zinc-900]="activeCase().id !== c.id"
                    [class.text-zinc-300]="activeCase().id !== c.id"
                    [class.border-zinc-800]="activeCase().id !== c.id"
                    class="min-h-[48px] px-4 py-2 rounded-xl text-xs transition cursor-pointer border flex items-center gap-2 shadow-sm"
                    [attr.aria-current]="activeCase().id === c.id ? 'true' : null">
              <span>{{ c.primaryGene === 'NGLY1' ? '💧' : c.primaryGene === 'ADCY5' ? '☕' : '⚡' }}</span>
              <span><strong>{{ c.primaryGene }}</strong> ({{ c.patientName.split(' ')[0] }})</span>
            </button>
          }
        </nav>
      </header>

      <!-- 5-Step Pipeline Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        <!-- Step 1 & 2: Genomic Variant & Functional Knowledge Graph (Left 7 Cols) -->
        <div class="lg:col-span-7 flex flex-col gap-6">

          <!-- Card 1: Diagnostic Sequencing & Variant Profile -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 shadow-inner">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span>1️⃣</span> Step 1: Genetic Exome Sequencing & Deficit Profile
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {{ activeCase().variant.omimId || 'OMIM Catalog' }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-[10px] text-zinc-400 uppercase">Primary Gene / Target:</span>
                <p class="font-bold text-white text-sm">{{ activeCase().primaryGene }} ({{ activeCase().diseaseName }})</p>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 uppercase">Mutation (HGVS):</span>
                <p class="font-bold text-amber-300">{{ activeCase().variant.hgvs }}</p>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 uppercase">Zygosity & Location:</span>
                <p class="text-zinc-200">{{ activeCase().variant.zygosity }} • Chr {{ activeCase().variant.chromosome }}</p>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 uppercase">ClinVar Classification:</span>
                <p class="font-bold text-rose-400">{{ activeCase().variant.clinVarSignificance }}</p>
              </div>
            </div>

            <!-- Hallmark Phenotypes -->
            <div class="mt-4 pt-3 border-t border-zinc-800/60">
              <span class="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5">Hallmark Clinical Endophenotypes:</span>
              <div class="flex flex-wrap gap-1.5">
                @for (pheno of activeCase().hallmarkPhenotype; track pheno) {
                  <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 text-[11px] border border-zinc-700/60 font-sans">
                    • {{ pheno }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Card 2: Functional Knowledge Graph & Proteostasis Network -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 shadow-inner">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span>2️⃣</span> Step 2: mediKanren Biomedical Knowledge Graph Traversal
              </span>
              <span class="text-[10px] text-zinc-400 font-mono">
                {{ activeCase().nodes.length }} Nodes • {{ activeCase().edges.length }} Causal Edges
              </span>
            </div>

            <!-- Knowledge Graph Interactive Node Display -->
            <div class="space-y-2.5">
              @for (node of activeCase().nodes; track node.id) {
                <div class="p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition"
                     [ngClass]="{
                       'bg-rose-950/30 border-rose-500/40 text-rose-200': node.status === 'deficient',
                       'bg-orange-950/30 border-orange-500/40 text-orange-200': node.status === 'toxic_accumulation' || node.status === 'hyperactive',
                       'bg-emerald-950/30 border-emerald-500/40 text-emerald-200': node.status === 'therapeutic_agent' || node.status === 'restored'
                     }">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs uppercase font-extrabold px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                        {{ node.category }}
                      </span>
                      <strong class="text-white">{{ node.name }}</strong>
                    </div>
                    <p class="text-[11px] text-zinc-300 mt-1 font-sans">{{ node.description }}</p>
                  </div>
                  <span class="text-[10px] font-bold uppercase px-2 py-1 rounded bg-black/50 tracking-wider shrink-0">
                    {{ node.status.replace('_', ' ') }}
                  </span>
                </div>
              }
            </div>

            <!-- Dr. Might Epistemological Quote -->
            <blockquote class="mt-4 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-xs italic text-amber-200 font-serif leading-relaxed">
              {{ activeCase().mightQuote }}
              <span class="block text-[10px] font-mono text-zinc-400 not-italic mt-1">— Dr. Matt Might, Ph.D.</span>
            </blockquote>
          </div>

        </div>

        <!-- Step 3 & 4: Drug Repurposing Candidates & N-of-1 Trial (Right 5 Cols) -->
        <div class="lg:col-span-5 flex flex-col gap-6">

          <!-- Card 3: Automated Drug Repurposing Hypotheses -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 shadow-inner">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>3️⃣</span> Step 3: Repurposed Therapeutic Hypotheses
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                FDA & Nutraceutical
              </span>
            </div>

            <div class="space-y-4">
              @for (cand of activeCase().repurposingCandidates; track cand.id) {
                <div class="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs">
                  <div class="flex items-center justify-between mb-1.5">
                    <h4 class="font-black text-white text-sm text-emerald-400">{{ cand.compoundName }}</h4>
                    <span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-700/50">
                      {{ cand.fdaStatus }}
                    </span>
                  </div>

                  <p class="text-[11px] text-zinc-300 font-sans leading-relaxed mb-2.5">
                    <strong>Mechanism:</strong> {{ cand.repurposedMechanism }}
                  </p>

                  <div class="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1 text-[11px]">
                    <div class="flex justify-between">
                      <span class="text-zinc-400">Target Protein:</span>
                      <span class="text-zinc-200 font-semibold">{{ cand.targetProtein }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-400">Dosing Regimen:</span>
                      <span class="text-amber-300 font-semibold">{{ cand.recommendedInitialDose }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-400">Graph Confidence:</span>
                      <span class="text-emerald-400 font-bold">{{ (cand.confidenceScore * 100).toFixed(0) }}% Match</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Card 4: N-of-1 Single-Subject Crossover Trial Protocol -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 shadow-inner">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span>4️⃣</span> Step 4: N-of-1 Trial Protocol & Quantitative Biomarkers
              </span>
              <span class="text-[10px] font-mono text-zinc-400">
                {{ activeCase().trialProtocol.protocolId }}
              </span>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex justify-between items-center text-[11px]">
                <span class="text-zinc-400">Trial Architecture:</span>
                <span class="font-bold text-white px-2 py-0.5 rounded bg-zinc-800">{{ activeCase().trialProtocol.design }}</span>
              </div>
              <div class="flex justify-between items-center text-[11px]">
                <span class="text-zinc-400">Washout Period:</span>
                <span class="font-bold text-amber-300">{{ activeCase().trialProtocol.washoutPeriodDays }} Days</span>
              </div>

              <!-- Biomarker Endpoints Table -->
              <div class="mt-3">
                <span class="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Primary Clinical Endpoints:</span>
                <div class="space-y-2">
                  @for (ep of activeCase().trialProtocol.primaryEndpoints; track ep.name) {
                    <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px]">
                      <div>
                        <strong class="text-zinc-100 block">{{ ep.name }}</strong>
                        <span class="text-[10px] text-zinc-400 font-sans">{{ ep.measurementTool }}</span>
                      </div>
                      <div class="text-right font-mono">
                        <span class="text-rose-400">{{ ep.baselineValue }} {{ ep.unit }}</span>
                        <span class="text-zinc-500 mx-1">→</span>
                        <span class="text-emerald-400 font-bold">{{ ep.targetValue }} {{ ep.unit }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Real World Published Outcome -->
              <div class="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px]">
                <span class="text-[10px] font-bold uppercase text-emerald-400 block mb-1">Empirical Published Result:</span>
                <p class="text-zinc-200 font-sans leading-relaxed">
                  {{ activeCase().publishedOutcome }}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Section: Harvard Medical School Undiagnosed Diseases Network (UDN) & MOSC Protocol -->
      <div class="mt-8 pt-6 border-t border-zinc-800 relative z-10">
        <div class="bg-zinc-900/95 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xl font-bold">
                🏛️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-white">Harvard Medical School Undiagnosed Diseases Network (UDN)</h3>
                  <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 uppercase">
                    NIH MOSC Phase II
                  </span>
                </div>
                <p class="text-xs text-zinc-400 font-sans">
                  Model Organisms Screening Center: In vivo functional genomics rescue in Fruit Fly (<em>Drosophila</em>), Worm (<em>C. elegans</em>), and Zebrafish (<em>Danio rerio</em>).
                </p>
              </div>
            </div>

            <a href="https://undiagnosed.hms.harvard.edu/" 
               target="_blank" 
               rel="noopener noreferrer"
               class="min-h-[48px] px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-2 transition"
               aria-label="Visit Harvard UDN Portal">
              <span>🌐</span>
              <span>undiagnosed.hms.harvard.edu ↗</span>
            </a>
          </div>

          <!-- UDN Triangulation & MOSC Readout Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            <!-- MOSC Model Organism Box -->
            <div class="p-4 rounded-xl bg-zinc-950 border border-cyan-500/20 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔬</span> {{ currentUdnTriage().modelOrganismScreening.organismCommonName }} (<em>{{ currentUdnTriage().modelOrganismScreening.species }}</em>)
                </span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {{ (currentUdnTriage().modelOrganismScreening.rescueScore * 100).toFixed(0) }}% Rescue
                </span>
              </div>
              <p class="text-[11px] text-zinc-300 font-sans">
                <strong>Assay:</strong> {{ currentUdnTriage().modelOrganismScreening.assayType }}
              </p>
              <div class="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 font-mono">
                ✓ {{ currentUdnTriage().modelOrganismScreening.quantitativeReadout }}
              </div>
            </div>

            <!-- Deep HPO & Multi-Omic Box -->
            <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span class="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🧬</span> Multi-Omic & HPO Phenotype
              </span>
              <ul class="text-[11px] text-zinc-300 space-y-1 font-sans">
                @for (hpo of currentUdnTriage().hpoTerms; track hpo.id) {
                  <li class="flex items-center gap-1.5">
                    <span class="text-amber-400 font-mono text-[10px]">[{{ hpo.id }}]</span>
                    <span>{{ hpo.term }}</span>
                  </li>
                }
              </ul>
              <div class="text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-1 font-mono">
                Match: {{ currentUdnTriage().multiOmicProfile.modelOrganismMatch }}
              </div>
            </div>

            <!-- UDN Clinical Recommendation Box -->
            <div class="p-4 rounded-xl bg-zinc-950 border border-emerald-500/20 space-y-2 flex flex-col justify-between">
              <div>
                <span class="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡</span> UDN Clinical Directive
                </span>
                <p class="text-[11px] text-zinc-200 font-sans leading-relaxed mt-1">
                  {{ currentUdnTriage().udnClinicalRecommendation }}
                </p>
              </div>
              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Site: {{ currentUdnTriage().hmsClinicalLead.split('/')[0] }}</span>
                <span class="text-cyan-400">ID: {{ currentUdnTriage().udnId }}</span>
              </div>
            </div>

          </div>

          <!-- Interactive 3D Model Organism Viewer -->
          <div class="mb-6">
            <app-model-organism-3d-viewer [organismType]="currentOrganismType()" />
          </div>

          <!-- Section: N-of-1 Bayesian Adaptive Trial Simulator -->
          <div class="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-4">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">🎲</span>
                <div>
                  <h4 class="text-sm font-black text-amber-300 uppercase tracking-wider">
                    N-of-1 Adaptive Trial Simulator (ABAB Sequential Bayesian Updating)
                  </h4>
                  <p class="text-[11px] text-zinc-400 font-sans">
                    Simulate daily biomarker trajectories, pharmacokinetic washout reversion, and Turing Decibans of evidence (10 &times; log10(Bayes Factor)).
                  </p>
                </div>
              </div>

              <button (click)="runBayesianSimulation()"
                      type="button"
                      class="min-h-[48px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md flex items-center gap-2 border border-amber-400/40"
                      aria-label="Run N-of-1 Monte Carlo Simulation">
                <span>⚡</span>
                <span>Run 16-Week ABAB Simulation</span>
              </button>
            </div>

            @if (simulationResult()) {
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 font-mono">
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-400 uppercase block">Baseline Mean:</span>
                  <span class="text-base font-bold text-rose-400">{{ simulationResult()!.summaryMetrics.baselineMean }} %</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-400 uppercase block">Intervention Mean:</span>
                  <span class="text-base font-bold text-emerald-400">{{ simulationResult()!.summaryMetrics.interventionMean }} %</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-400 uppercase block">Turing Evidence:</span>
                  <span class="text-base font-bold text-cyan-400">{{ simulationResult()!.summaryMetrics.finalDecibans }} dB</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-400 uppercase block">Posterior P(Rescue):</span>
                  <span class="text-base font-bold text-amber-300">{{ (simulationResult()!.summaryMetrics.finalProbabilityEfficacy * 100).toFixed(1) }}%</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-sans flex items-center justify-between gap-2">
                <span class="font-bold text-emerald-300">Verdict: {{ simulationResult()!.summaryMetrics.clinicalVerdict }}</span>
                <span class="text-[11px] text-zinc-400 font-mono">Protocol: {{ simulationResult()!.protocolId }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class MattMightPrecisionMedicineComponent {
  precisionEngine = inject(MattMightPrecisionEngineService);
  bayesianSimulator = inject(NOfOneBayesianSimulatorService);
  matchmakerService = inject(MatchmakerExchangeService);
  dossierService = inject(PrecisionRegulatoryDossierService);
  private exportService = inject(ExportService, { optional: true });

  readonly activeCase = computed(() => this.precisionEngine.activeCase());
  readonly currentUdnTriage = computed(() => {
    const active = this.activeCase();
    return this.precisionEngine.evaluateUdnDiagnosticOdyssey(active.primaryGene, active.hallmarkPhenotype);
  });

  readonly currentOrganismType = computed<'drosophila' | 'celegans' | 'danio_rerio'>(() => {
    const species = this.currentUdnTriage().modelOrganismScreening.species;
    if (species === 'Drosophila melanogaster') return 'drosophila';
    if (species === 'Caenorhabditis elegans') return 'celegans';
    return 'danio_rerio';
  });

  readonly simulationResult = signal<INOfOneSimulationResult | null>(null);
  readonly matchmakerHits = signal<IMatchResult[]>([]);

  constructor() {
    this.runBayesianSimulation();
    this.queryMatchmaker();
  }

  runBayesianSimulation(): void {
    const active = this.activeCase();
    const candidateName = active.repurposingCandidates[0]?.compoundName || 'Candidate Agent';
    const res = this.bayesianSimulator.runSimulation(candidateName, active.primaryGene, 0.75, 0.08, 4.0);
    this.simulationResult.set(res);
  }

  queryMatchmaker(): void {
    const active = this.activeCase();
    const matches = this.matchmakerService.queryMatchmaker(active.primaryGene, active.hallmarkPhenotype);
    this.matchmakerHits.set(matches);
  }

  selectCase(caseId: string): void {
    this.precisionEngine.selectCase(caseId);
    this.runBayesianSimulation();
    this.queryMatchmaker();
  }

  exportTrialProtocol(): void {
    const study = this.activeCase();
    const bundle = this.precisionEngine.exportFhirR4TrialBundle(study);
    this.downloadJson(bundle, `FHIR_R4_Precision_Trial_${study.primaryGene}_${study.trialProtocol.protocolId}.json`);
  }

  exportUdnGatewayBundle(): void {
    const study = this.activeCase();
    const triage = this.currentUdnTriage();
    const bundle = this.precisionEngine.exportUdnGatewaySubmissionBundle(study, triage);
    this.downloadJson(bundle, `FHIR_R4_Harvard_UDN_Gateway_${triage.udnId}.json`);
  }

  exportNihGrantNarrative(): void {
    const study = this.activeCase();
    const grant = this.dossierService.generateNihGrantNarrative(study, this.simulationResult());
    this.downloadJson(grant, `NIH_U54_Grant_Application_${study.primaryGene}.json`);
  }

  exportFdaIndDossier(): void {
    const study = this.activeCase();
    const ind = this.dossierService.generateFdaExpandedAccessIndDossier(study, this.simulationResult());
    this.downloadJson(ind, `FDA_IND_Expanded_Access_21CFR312_${study.primaryGene}.json`);
  }

  private downloadJson(data: any, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
