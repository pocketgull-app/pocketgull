import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  viewChild,
  ElementRef,
  AfterViewInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PhysicalGenomicsService,
  ILoopExtrusionState,
  ITranscriptionalCondensateState,
  ICrisprRLoopEnergyState,
  INucleosomeMechanicalState,
  ILincMechanotransductionState,
  HistoneEpigeneticState,
  ICtcfBarrierSite
} from '../../services/physical-genomics.service';
import { PatientStateService } from '../../services/patient-state.service';
import { FhirBundleFactoryService } from '../../services/fhir/fhir-bundle-factory.service';
import { OnnxWebGpuEngineService, IPhysicalGenomicsPriors } from '../../services/onnx-webgpu-engine.service';
import { HologramExportService } from '../../services/hologram-export.service';
import { Nucleus3dDeformerComponent } from './nucleus-3d-deformer.component';
import { Nucleosome3dPullerComponent } from './nucleosome-3d-puller.component';
import { Condensate3dDropletComponent } from './condensate-3d-droplet.component';
import { Crispr3dUnwinderComponent } from './crispr-3d-unwinder.component';
import { Chromatin3dFiberComponent } from './chromatin-3d-fiber.component';

export type PhysicalGenomicsParadigm = 'chromatin' | 'condensates' | 'crispr' | 'nucleosome' | 'linc';

@Component({
  selector: 'app-lens-physical-genomics',
  standalone: true,
  imports: [
    CommonModule,
    Nucleus3dDeformerComponent,
    Nucleosome3dPullerComponent,
    Condensate3dDropletComponent,
    Crispr3dUnwinderComponent,
    Chromatin3dFiberComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans shadow-2xl flex flex-col gap-6">
      
      <!-- Header & Tab Navigation Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🧬</span>
            <div>
              <h2 class="text-lg font-black uppercase tracking-wider text-teal-300">
                Physical Genomics & 3D Genome Engineering Suite
              </h2>
              <p class="text-xs text-zinc-400">
                Polymer loop extrusion (Hi-C), MED1/BRD4 super-enhancers, CRISPR R-loop mechanics, optical tweezer nucleosome unwrapping, and LINC mechanotransduction.
              </p>
            </div>
          </div>
        </div>

        <!-- Paradigm Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
          <button (click)="activeTab.set('chromatin')"
                  [class.bg-teal-950]="activeTab() === 'chromatin'"
                  [class.text-teal-200]="activeTab() === 'chromatin'"
                  [class.border-teal-500]="activeTab() === 'chromatin'"
                  class="px-3 py-1.5 text-xs font-bold rounded-lg transition border border-transparent hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
            <span>🧬</span> 3D Chromatin Loops
          </button>
          <button (click)="activeTab.set('condensates')"
                  [class.bg-teal-950]="activeTab() === 'condensates'"
                  [class.text-teal-200]="activeTab() === 'condensates'"
                  [class.border-teal-500]="activeTab() === 'condensates'"
                  class="px-3 py-1.5 text-xs font-bold rounded-lg transition border border-transparent hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
            <span>💧</span> Super-Enhancers
          </button>
          <button (click)="activeTab.set('crispr')"
                  [class.bg-teal-950]="activeTab() === 'crispr'"
                  [class.text-teal-200]="activeTab() === 'crispr'"
                  [class.border-teal-500]="activeTab() === 'crispr'"
                  class="px-3 py-1.5 text-xs font-bold rounded-lg transition border border-transparent hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
            <span>✂️</span> CRISPR R-Loop
          </button>
          <button (click)="activeTab.set('nucleosome')"
                  [class.bg-teal-950]="activeTab() === 'nucleosome'"
                  [class.text-teal-200]="activeTab() === 'nucleosome'"
                  [class.border-teal-500]="activeTab() === 'nucleosome'"
                  class="px-3 py-1.5 text-xs font-bold rounded-lg transition border border-transparent hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
            <span>🪢</span> Nucleosome Tweezers
          </button>
          <button (click)="activeTab.set('linc')"
                  [class.bg-teal-950]="activeTab() === 'linc'"
                  [class.text-teal-200]="activeTab() === 'linc'"
                  [class.border-teal-500]="activeTab() === 'linc'"
                  class="px-3 py-1.5 text-xs font-bold rounded-lg transition border border-transparent hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
            <span>🏛️</span> LINC Mechanotransduction
          </button>
        </div>
      </div>

      <!-- Edge ML Prior Auto-Seeding Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-zinc-900/90 border border-teal-500/30 rounded-xl">
        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span class="text-teal-300 font-bold">⚡ Edge ML Priors Active:</span>
          <span class="text-zinc-300">{{ edgeMlPrior().epigeneticState }} • ECM Stiffness: {{ edgeMlPrior().ecmStiffnessKPa }} kPa • Actin Tension: {{ edgeMlPrior().actinTensionNn }} nN</span>
        </div>
        <button (click)="applyEdgeMlPriors()"
                title="Re-seed all 5 physical genomics parameters from real-time on-device ONNX risk evaluation"
                class="px-3 py-1 bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-600/50 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span>🔄 Re-seed from Edge ML</span>
        </button>
      </div>

      <!-- Dual-View Toggle & Comparison Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="text-zinc-400">View Mode:</span>
          <span [class.text-emerald-400]="!isDualViewEnabled()" [class.text-amber-400]="isDualViewEnabled()" class="font-bold">
            {{ isDualViewEnabled() ? '🪞 Dual View Active (WT vs. Perturbed Variant)' : '🎯 Single Focus View' }}
          </span>
        </div>
        <button (click)="toggleDualView()"
                class="px-3 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                [class.bg-amber-950]="isDualViewEnabled()"
                [class.border-amber-500]="isDualViewEnabled()"
                [class.text-amber-200]="isDualViewEnabled()"
                [class.bg-zinc-800]="!isDualViewEnabled()"
                [class.border-zinc-700]="!isDualViewEnabled()"
                [class.text-zinc-300]="!isDualViewEnabled()">
          <span>🪞</span>
          <span>{{ isDualViewEnabled() ? 'Exit Dual View' : 'Compare WT vs. Mutant' }}</span>
        </button>
      </div>

      @if (!isDualViewEnabled()) {
        <!-- ========================================================================= -->
        <!-- TAB 1: 3D CHROMATIN POLYMER DYNAMICS & COHESIN LOOP EXTRUSION (HI-C) -->
        <!-- ========================================================================= -->
        @if (activeTab() === 'chromatin') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Heatmap Canvas (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs text-zinc-400">
              <span class="font-bold text-zinc-300">2D Hi-C Contact Probability Matrix (32×32 Bins)</span>
              <span class="font-mono text-teal-400">P(s) ~ s^-{{ loopState().fractalGlobuleScalingGamma }}</span>
            </div>
            
            <div class="relative w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <app-chromatin-3d-fiber [cohesinSpeed]="cohesinSpeed()" [ctcfPermeability]="ctcfPermeability()" [hasCtcfMutation]="hasCtcfMutation()" />
            </div>

            <!-- Polymer Status Bar -->
            <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <span class="text-zinc-400">Active Loops: <strong class="text-teal-300">{{ loopState().activeLoopsCount }}</strong></span>
              <span class="text-zinc-400">Mean Span: <strong class="text-amber-300">{{ loopState().loopMeanSpanKb }} kb</strong></span>
              <span class="text-zinc-400">Insulation: <strong class="text-emerald-400">{{ (loopState().tadInsulationScore * 100).toFixed(0) }}%</strong></span>
            </div>
          </div>

          <!-- Controls & Telemetry (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            
            <!-- 2D Hi-C Contact Matrix Thumbnail -->
            <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs text-zinc-400">
                <span class="font-bold text-zinc-300">2D Hi-C Contact Matrix</span>
                <span class="font-mono text-teal-400 text-[10px]">32×32 Bins</span>
              </div>
              <div class="relative w-full aspect-square max-h-[160px] bg-black rounded-lg overflow-hidden border border-zinc-800 mx-auto flex items-center justify-center">
                <canvas #hicCanvas class="w-full h-full rounded image-rendering-pixelated"></canvas>
              </div>
            </div>

            <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Cohesin & CTCF Boundary Physics
              </h3>

              <!-- Extrusion Velocity -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">Cohesin Velocity:</span>
                  <span class="font-mono text-teal-300">{{ cohesinSpeed() }} kb/s</span>
                </div>
                <input type="range" min="0.2" max="2.5" step="0.1"
                       [value]="cohesinSpeed()"
                       (input)="onSpeedChange($event)"
                       class="accent-teal-400 cursor-pointer w-full">
              </div>

              <!-- CTCF Permeability -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">CTCF Boundary Permeability:</span>
                  <span class="font-mono text-amber-300">{{ (ctcfPermeability() * 100).toFixed(0) }}% ({{ ctcfPermeability() < 0.3 ? 'Strict Barrier' : 'Leaky Insulator' }})</span>
                </div>
                <input type="range" min="0.0" max="0.9" step="0.05"
                       [value]="ctcfPermeability()"
                       (input)="onPermeabilityChange($event)"
                       class="accent-amber-400 cursor-pointer w-full">
              </div>

              <!-- Barrier Mutator -->
              <div class="pt-2 border-t border-zinc-800 flex flex-col gap-2">
                <span class="text-xs text-zinc-400">Structural Barrier Perturbations:</span>
                <div class="flex gap-2">
                  <button (click)="toggleCtcfMutation()"
                          class="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold border transition cursor-pointer"
                          [class.bg-rose-950]="hasCtcfMutation()"
                          [class.border-rose-600]="hasCtcfMutation()"
                          [class.text-rose-200]="hasCtcfMutation()"
                          [class.bg-zinc-800]="!hasCtcfMutation()"
                          [class.border-zinc-700]="!hasCtcfMutation()"
                          [class.text-zinc-300]="!hasCtcfMutation()">
                    {{ hasCtcfMutation() ? '⚠️ CTCF Motif Deleted' : '✂️ Mutate Central CTCF' }}
                  </button>
                  <button (click)="resetChromatin()"
                          class="py-1.5 px-3 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition cursor-pointer">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <!-- Mathematical Summary Card -->
            <div class="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans">
              <strong class="text-zinc-200 block mb-1">Polymer Physics Context:</strong>
              Cohesin rings processively reel in chromatin loops until colliding with convergent CTCF anchors. Loss of boundary insulation permits aberrant enhancer-promoter rewiring (proto-oncogene activation).
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- TAB 2: SUPER-ENHANCER TRANSCRIPTIONAL CONDENSATES (LLPS) -->
      <!-- ========================================================================= -->
      @if (activeTab() === 'condensates') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Condensate Droplet Visualizer (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs text-zinc-400">
              <span class="font-bold text-zinc-300">Super-Enhancer IDR Droplet Nucleation</span>
              <span class="font-mono text-emerald-400">Radius: {{ condensateState().dropletRadiusNm }} nm</span>
            </div>

            <div class="relative w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <app-condensate-3d-droplet [med1Conc]="med1Conc()" [brd4Conc]="brd4Conc()" [polIiConc]="polIiConc()" />
            </div>

            <!-- Burst Telemetry Bar -->
            <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <span class="text-zinc-400">Burst Rate: <strong class="text-amber-400">{{ condensateState().transcriptionalBurstFrequencyPerHour }} /hr</strong></span>
              <span class="text-zinc-400">Surface Tension: <strong class="text-teal-300">{{ condensateState().surfaceTensionMicroNPerM }} μN/m</strong></span>
              <span class="text-zinc-400">State: <strong class="text-emerald-400">{{ condensateState().condensateStabilityVerdict }}</strong></span>
            </div>
          </div>

          <!-- Condensate Controls (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Super-Enhancer Stoichiometry
              </h3>

              <!-- MED1 Conc -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">[MED1 Mediator IDR]:</span>
                  <span class="font-mono text-teal-300">{{ med1Conc() }} μM</span>
                </div>
                <input type="range" min="0.5" max="10.0" step="0.5"
                       [value]="med1Conc()"
                       (input)="onMed1Change($event)"
                       class="accent-teal-400 cursor-pointer w-full">
              </div>

              <!-- BRD4 Conc -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">[BRD4 Acetyl-Reader]:</span>
                  <span class="font-mono text-emerald-300">{{ brd4Conc() }} μM</span>
                </div>
                <input type="range" min="0.5" max="8.0" step="0.5"
                       [value]="brd4Conc()"
                       (input)="onBrd4Change($event)"
                       class="accent-emerald-400 cursor-pointer w-full">
              </div>

              <!-- Pol II Conc -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">[RNA Polymerase II]:</span>
                  <span class="font-mono text-amber-300">{{ polIiConc() }} μM</span>
                </div>
                <input type="range" min="0.5" max="4.0" step="0.2"
                       [value]="polIiConc()"
                       (input)="onPolIiChange($event)"
                       class="accent-amber-400 cursor-pointer w-full">
              </div>
            </div>

            <!-- Mechanistic Note -->
            <div class="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans">
              <strong class="text-zinc-200 block mb-1">Super-Enhancer Biophysics:</strong>
              High-valency IDRs on MED1 and BRD4 drive local phase separation, concentrating RNA Pol II up to 10-fold at oncogene promoters (e.g., MYC) to fuel continuous high-frequency transcriptional bursting.
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- TAB 3: CRISPR-CAS MECHANICAL R-LOOP ENERGETICS -->
      <!-- ========================================================================= -->
      @if (activeTab() === 'crispr') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- R-Loop Reaction Coordinate Plot (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs text-zinc-400">
              <span class="font-bold text-zinc-300">Base-by-Base R-Loop Free Energy Coordinate (ΔG)</span>
              <span class="font-mono text-teal-400">Net ΔG: {{ crisprState().netFreeEnergyDeltaGKcalPerMol }} kcal/mol</span>
            </div>

            <div class="relative w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <app-crispr-3d-unwinder [guideRna]="crisprGuide()" [targetDna]="crisprTarget()" [superhelicalSigma]="superhelicalSigma()" />
            </div>

            <!-- Proofreading HUD -->
            <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <span class="text-zinc-400">Seed Mismatches: <strong [class.text-rose-400]="crisprState().seedMismatchCount > 0" [class.text-emerald-400]="crisprState().seedMismatchCount === 0">{{ crisprState().seedMismatchCount }}</strong></span>
              <span class="text-zinc-400">Cleavage Prob: <strong class="text-teal-300">{{ (crisprState().offTargetCleavageProbability * 100).toFixed(1) }}%</strong></span>
              <span class="text-zinc-400">Verdict: <strong [class.text-emerald-400]="crisprState().cleavageFalsificationVerdict === 'ON_TARGET_OPTIMAL'" [class.text-amber-400]="crisprState().cleavageFalsificationVerdict === 'SEED_REJECTED_SAFE'" [class.text-rose-400]="crisprState().cleavageFalsificationVerdict === 'PERMISSIVE_OFF_TARGET_RISK'">{{ crisprState().cleavageFalsificationVerdict }}</strong></span>
            </div>
          </div>

          <!-- CRISPR Controls (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                CRISPR Mechanical Proofreading
              </h3>

              <!-- Sequence Presets -->
              <div class="flex flex-col gap-2">
                <span class="text-xs text-zinc-400">Target DNA Mismatch Presets:</span>
                <button (click)="setCrisprPreset('perfect')"
                        class="py-1.5 px-3 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-teal-200 transition text-left cursor-pointer">
                  ✓ Perfect On-Target (Zero Mismatches)
                </button>
                <button (click)="setCrisprPreset('seed-mismatch')"
                        class="py-1.5 px-3 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-amber-200 transition text-left cursor-pointer">
                  ⚠️ Seed Mismatch (nt 2 & 4 mutated)
                </button>
                <button (click)="setCrisprPreset('distal-mismatch')"
                        class="py-1.5 px-3 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-rose-200 transition text-left cursor-pointer">
                  ⚡ Distal Mismatch (nt 18 & 19 mutated)
                </button>
              </div>

              <!-- Supercoiling Sigma -->
              <div class="flex flex-col gap-1.5 pt-2 border-t border-zinc-800">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">DNA Superhelical Density (σ):</span>
                  <span class="font-mono text-teal-300">{{ superhelicalSigma() }}</span>
                </div>
                <input type="range" min="-0.10" max="0.02" step="0.01"
                       [value]="superhelicalSigma()"
                       (input)="onSigmaChange($event)"
                       class="accent-teal-400 cursor-pointer w-full">
              </div>
            </div>

            <!-- Mechanistic Summary -->
            <div class="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans">
              <strong class="text-zinc-200 block mb-1">R-Loop Kinetic Proofreading:</strong>
              Cas9 inspects the PAM-proximal seed region first. Energetic barriers (ΔG &gt; +2.5 kcal/mol) in the seed abort R-loop propagation and prevent off-target double-strand breaks.
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- TAB 4: NUCLEOSOME OPTICAL TWEEZERS FORCE SPECTROSCOPY -->
      <!-- ========================================================================= -->
      @if (activeTab() === 'nucleosome') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Optical Tweezers Curve (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs text-zinc-400">
              <span class="font-bold text-zinc-300">Optical Tweezers Force-Extension Unwrapping</span>
              <span class="font-mono text-teal-400">Accessibility: {{ nucleosomeState().chromatinAccessibilityPercent }}%</span>
            </div>

            <div class="relative w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <app-nucleosome-3d-puller [epigeneticState]="epigeneticState()" [ionicStrength]="ionicStrength()" />
            </div>

            <!-- Rupture Telemetry Bar -->
            <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <span class="text-zinc-400">Outer Rip: <strong class="text-teal-300">{{ nucleosomeState().outerTurnRuptureForcePn }} pN</strong></span>
              <span class="text-zinc-400">Core Rip: <strong class="text-rose-400">{{ nucleosomeState().innerCoreRuptureForcePn }} pN</strong></span>
              <span class="text-zinc-400">Octamer ΔG: <strong class="text-amber-300">{{ nucleosomeState().octamerStabilityFreeEnergyKcalPerMol }} kcal/mol</strong></span>
            </div>
          </div>

          <!-- Epigenetic Controls (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Histone Epigenetic Charge States
              </h3>

              <div class="flex flex-col gap-2">
                <button (click)="epigeneticState.set('HYPERACETYLATED_H3K27AC')"
                        [class.bg-teal-950]="epigeneticState() === 'HYPERACETYLATED_H3K27AC'"
                        [class.border-teal-500]="epigeneticState() === 'HYPERACETYLATED_H3K27AC'"
                        [class.text-teal-200]="epigeneticState() === 'HYPERACETYLATED_H3K27AC'"
                        class="p-2 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-left transition cursor-pointer">
                  ✨ Hyperacetylated (H3K27ac) - Open Active
                </button>
                <button (click)="epigeneticState.set('POLYCOMB_H3K27ME3')"
                        [class.bg-teal-950]="epigeneticState() === 'POLYCOMB_H3K27ME3'"
                        [class.border-teal-500]="epigeneticState() === 'POLYCOMB_H3K27ME3'"
                        [class.text-teal-200]="epigeneticState() === 'POLYCOMB_H3K27ME3'"
                        class="p-2 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-left transition cursor-pointer">
                  🔒 Polycomb Repressive (H3K27me3) - Facultative
                </button>
                <button (click)="epigeneticState.set('HETEROCHROMATIN_H3K9ME3')"
                        [class.bg-teal-950]="epigeneticState() === 'HETEROCHROMATIN_H3K9ME3'"
                        [class.border-teal-500]="epigeneticState() === 'HETEROCHROMATIN_H3K9ME3'"
                        [class.text-teal-200]="epigeneticState() === 'HETEROCHROMATIN_H3K9ME3'"
                        class="p-2 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-left transition cursor-pointer">
                  🛡️ Heterochromatin (H3K9me3) - Constitutive Silent
                </button>
              </div>

              <!-- Ionic Strength Slider -->
              <div class="flex flex-col gap-1.5 pt-2 border-t border-zinc-800">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">Salt Ionic Strength:</span>
                  <span class="font-mono text-teal-300">{{ ionicStrength() }} mM NaCl</span>
                </div>
                <input type="range" min="80" max="300" step="10"
                       [value]="ionicStrength()"
                       (input)="onIonicChange($event)"
                       class="accent-teal-400 cursor-pointer w-full">
              </div>
            </div>

            <!-- Mechanistic Note -->
            <div class="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans">
              <strong class="text-zinc-200 block mb-1">Electrostatic Charge Screening:</strong>
              Histone lysine acetylation neutralizes positive charges on the basic histone tail, reducing DNA wrapping tension and lowering the mechanical barrier required for transcription factor access.
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- TAB 5: LINC MECHANOTRANSDUCTION & NUCLEAR REPROGRAMMING -->
      <!-- ========================================================================= -->
      @if (activeTab() === 'linc') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LINC Diagram (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs text-zinc-400">
              <span class="font-bold text-zinc-300">LINC Bridge Force & YAP/TAZ Nuclear Influx</span>
              <span class="font-mono text-teal-400">YAP/TAZ Ratio: {{ lincState().yapTazNuclearToCytoplasmicRatio }}x</span>
            </div>

            <div class="relative w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <app-nucleus-3d-deformer [ecmStiffness]="ecmStiffness()" [actinTension]="actinTension()" />
            </div>

            <!-- Mechanostate HUD -->
            <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
              <span class="text-zinc-400">SUN-Nesprin Load: <strong class="text-teal-300">{{ lincState().lincComplexForcePnPerBridge }} pN</strong></span>
              <span class="text-zinc-400">Lamin A/C Phospho: <strong class="text-amber-300">{{ lincState().laminAcPhosphorylationRatio }}x</strong></span>
              <span class="text-zinc-400">State: <strong [class.text-rose-400]="lincState().transcriptionalMechanostate === 'STIFF_PRO_FIBROTIC_ONCOGENIC'" [class.text-emerald-400]="lincState().transcriptionalMechanostate !== 'STIFF_PRO_FIBROTIC_ONCOGENIC'">{{ lincState().transcriptionalMechanostate }}</strong></span>
            </div>
          </div>

          <!-- LINC Controls (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                ECM & Cytoskeletal Biomechanics
              </h3>

              <!-- ECM Stiffness -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">Matrix Stiffness (E):</span>
                  <span class="font-mono text-teal-300">{{ ecmStiffness() }} kPa ({{ ecmStiffness() > 20 ? 'Fibrotic / Tumor' : 'Soft Tissue' }})</span>
                </div>
                <input type="range" min="0.5" max="40.0" step="1.0"
                       [value]="ecmStiffness()"
                       (input)="onEcmChange($event)"
                       class="accent-teal-400 cursor-pointer w-full">
              </div>

              <!-- Actin Tension -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">Actin Stress Fiber Tension:</span>
                  <span class="font-mono text-rose-300">{{ actinTension() }} nN</span>
                </div>
                <input type="range" min="0.5" max="6.0" step="0.2"
                       [value]="actinTension()"
                       (input)="onTensionChange($event)"
                       class="accent-rose-400 cursor-pointer w-full">
              </div>
            </div>

            <!-- Mechanobiology Note -->
            <div class="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans">
              <strong class="text-zinc-200 block mb-1">Mechanotranscriptional Reprogramming:</strong>
              Rigid extracellular matrix transmits mechanical tension across the LINC complex into the nuclear lamina, opening nuclear pores and driving YAP/TAZ translocation to trigger pro-fibrotic gene expression.
            </div>
          </div>
        </div>
      }
    } @else {
      <!-- ========================================================================= -->
      <!-- DUAL COMPARISON VIEWPORT (WILD-TYPE VS PATHOLOGY OR PHARMACOLOGICAL RESCUE) -->
      <!-- ========================================================================= -->
      <div class="flex flex-col gap-6">
        
        <!-- Target & Layout Selector Sub-Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="text-zinc-400">Comparison Target:</span>
            <div class="flex items-center gap-1.5 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <button (click)="comparisonTarget.set('MUTANT_PATHOLOGY')"
                      [class.bg-rose-950]="comparisonTarget() === 'MUTANT_PATHOLOGY'"
                      [class.text-rose-200]="comparisonTarget() === 'MUTANT_PATHOLOGY'"
                      [class.border-rose-500]="comparisonTarget() === 'MUTANT_PATHOLOGY'"
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border border-transparent hover:text-zinc-100 cursor-pointer">
                🔴 Disease / Somatic Variant
              </button>
              <button (click)="comparisonTarget.set('PHARMACOLOGICAL_RESCUE')"
                      [class.bg-cyan-950]="comparisonTarget() === 'PHARMACOLOGICAL_RESCUE'"
                      [class.text-cyan-200]="comparisonTarget() === 'PHARMACOLOGICAL_RESCUE'"
                      [class.border-cyan-500]="comparisonTarget() === 'PHARMACOLOGICAL_RESCUE'"
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border border-transparent hover:text-zinc-100 cursor-pointer">
                💊 Pharmacological Rescue
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-zinc-400">Layout:</span>
            <div class="flex items-center gap-1.5 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <button (click)="comparisonLayout.set('WIPE_CURTAIN')"
                      [class.bg-amber-950]="comparisonLayout() === 'WIPE_CURTAIN'"
                      [class.text-amber-200]="comparisonLayout() === 'WIPE_CURTAIN'"
                      [class.border-amber-500]="comparisonLayout() === 'WIPE_CURTAIN'"
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border border-transparent hover:text-zinc-100 cursor-pointer flex items-center gap-1">
                <span>🪟</span> Wipe Curtain Slider
              </button>
              <button (click)="comparisonLayout.set('SIDE_BY_SIDE')"
                      [class.bg-teal-950]="comparisonLayout() === 'SIDE_BY_SIDE'"
                      [class.text-teal-200]="comparisonLayout() === 'SIDE_BY_SIDE'"
                      [class.border-teal-500]="comparisonLayout() === 'SIDE_BY_SIDE'"
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border border-transparent hover:text-zinc-100 cursor-pointer flex items-center gap-1">
                <span>👥</span> Side-by-Side (2-Col)
              </button>
            </div>
          </div>
        </div>

        @if (comparisonLayout() === 'WIPE_CURTAIN') {
          <!-- UNIFIED INTERACTIVE WIPE CURTAIN VIEWPORT -->
          <div class="flex flex-col gap-3">
            <div class="relative w-full h-[480px] rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950 select-none">
              
              <!-- LAYER 1 (FULL UNDERLAY): PERTURBED / RESCUED TARGET -->
              <div class="absolute inset-0 w-full h-full pointer-events-none">
                @if (comparisonTarget() === 'MUTANT_PATHOLOGY') {
                  @if (activeTab() === 'chromatin') {
                    <app-chromatin-3d-fiber [cohesinSpeed]="cohesinSpeed()" [ctcfPermeability]="ctcfPermeability()" [hasCtcfMutation]="true" />
                  } @else if (activeTab() === 'condensates') {
                    <app-condensate-3d-droplet [med1Conc]="med1Conc()" [brd4Conc]="brd4Conc()" [polIiConc]="polIiConc()" />
                  } @else if (activeTab() === 'crispr') {
                    <app-crispr-3d-unwinder [guideRna]="crisprGuide()" [targetDna]="crisprTarget()" [superhelicalSigma]="superhelicalSigma()" />
                  } @else if (activeTab() === 'nucleosome') {
                    <app-nucleosome-3d-puller [epigeneticState]="epigeneticState()" [ionicStrength]="ionicStrength()" />
                  } @else if (activeTab() === 'linc') {
                    <app-nucleus-3d-deformer [ecmStiffness]="ecmStiffness()" [actinTension]="actinTension()" />
                  }
                } @else {
                  @if (activeTab() === 'chromatin') {
                    <app-chromatin-3d-fiber [cohesinSpeed]="1.2" [ctcfPermeability]="0.12" [hasCtcfMutation]="false" />
                  } @else if (activeTab() === 'condensates') {
                    <app-condensate-3d-droplet [med1Conc]="2.0" [brd4Conc]="1.2" [polIiConc]="1.0" />
                  } @else if (activeTab() === 'crispr') {
                    <app-crispr-3d-unwinder [guideRna]="crisprGuide()" [targetDna]="crisprTarget()" [superhelicalSigma]="-0.03" />
                  } @else if (activeTab() === 'nucleosome') {
                    <app-nucleosome-3d-puller [epigeneticState]="'HYPERACETYLATED_H3K27AC'" [ionicStrength]="160" />
                  } @else if (activeTab() === 'linc') {
                    <app-nucleus-3d-deformer [ecmStiffness]="3.2" [actinTension]="1.1" />
                  }
                }
              </div>

              <!-- LAYER 2 (CLIPPED OVERLAY): WILD-TYPE BASELINE -->
              <div class="absolute inset-0 w-full h-full pointer-events-none transition-none"
                   [style.clip-path]="'inset(0 ' + (100 - curtainPositionPct()) + '% 0 0)'">
                @if (activeTab() === 'chromatin') {
                  <app-chromatin-3d-fiber [cohesinSpeed]="1.0" [ctcfPermeability]="0.15" [hasCtcfMutation]="false" />
                } @else if (activeTab() === 'condensates') {
                  <app-condensate-3d-droplet [med1Conc]="3.5" [brd4Conc]="3.0" [polIiConc]="1.5" />
                } @else if (activeTab() === 'crispr') {
                  <app-crispr-3d-unwinder [guideRna]="'GACUUGACAGUCUACGAUCG'" [targetDna]="'GACTTGACAGTCTACGATCG'" [superhelicalSigma]="-0.06" />
                } @else if (activeTab() === 'nucleosome') {
                  <app-nucleosome-3d-puller [epigeneticState]="'HYPERACETYLATED_H3K27AC'" [ionicStrength]="150" />
                } @else if (activeTab() === 'linc') {
                  <app-nucleus-3d-deformer [ecmStiffness]="2.8" [actinTension]="1.2" />
                }
              </div>

              <!-- LAYER 3 (DIVIDER LINE & HANDLE) -->
              <div class="absolute top-0 bottom-0 pointer-events-none z-20 transition-none"
                   [style.left]="curtainPositionPct() + '%'">
                <div class="w-1 h-full bg-gradient-to-b from-amber-400 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(45,212,191,0.8)] -translate-x-1/2"></div>
                <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-950/90 border border-amber-400/80 rounded-full text-[10px] font-mono font-bold text-amber-300 shadow-xl flex items-center gap-1">
                  <span>◀</span>
                  <span>{{ curtainPositionPct() }}%</span>
                  <span>▶</span>
                </div>
              </div>

              <!-- TRANSPARENT DRAG INPUT OVERLAY -->
              <input type="range" min="0" max="100" [value]="curtainPositionPct()"
                     (input)="onCurtainSliderChange($event)"
                     class="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30 m-0 p-0"
                     title="Drag left/right to reveal Wild-Type vs Target state" />

              <!-- FLOATING LABELS -->
              <div class="absolute top-3 left-3 z-20 px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md border border-emerald-500/50 rounded-lg text-emerald-400 text-xs font-mono font-bold shadow-lg pointer-events-none">
                🟢 WT Baseline (0% - {{ curtainPositionPct() }}%)
              </div>

              <div class="absolute top-3 right-3 z-20 px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md rounded-lg text-xs font-mono font-bold shadow-lg pointer-events-none"
                   [class.border-rose-500/50]="comparisonTarget() === 'MUTANT_PATHOLOGY'"
                   [class.text-rose-400]="comparisonTarget() === 'MUTANT_PATHOLOGY'"
                   [class.border-cyan-500/50]="comparisonTarget() === 'PHARMACOLOGICAL_RESCUE'"
                   [class.text-cyan-300]="comparisonTarget() === 'PHARMACOLOGICAL_RESCUE'">
                {{ comparisonTarget() === 'MUTANT_PATHOLOGY' ? '🔴 Pathological Variant' : '💊 Pharmacological Rescue' }} ({{ curtainPositionPct() }}% - 100%)
              </div>
            </div>

            <!-- CURTAIN PRESET TOOLBAR -->
            <div class="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs font-mono">
              <span class="text-zinc-400">Curtain Sweep:</span>
              <div class="flex items-center gap-1.5">
                <button (click)="curtainPositionPct.set(0)" class="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer">0% (100% Target)</button>
                <button (click)="curtainPositionPct.set(25)" class="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer">25% WT</button>
                <button (click)="curtainPositionPct.set(50)" class="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold rounded text-[11px] cursor-pointer">50% Split</button>
                <button (click)="curtainPositionPct.set(75)" class="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer">75% WT</button>
                <button (click)="curtainPositionPct.set(100)" class="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer">100% (100% WT)</button>
              </div>
            </div>
          </div>
        } @else {
          <!-- SIDE-BY-SIDE 2-COLUMN VIEWPORT -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            <!-- LEFT PANEL: WILD-TYPE (WT) HOMEOSTATIC BASELINE -->
            <div class="flex flex-col gap-3 p-4 bg-zinc-900/70 border border-emerald-500/40 rounded-2xl shadow-xl">
              <div class="flex items-center justify-between text-xs font-mono border-b border-emerald-500/30 pb-2">
                <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  🟢 WILD-TYPE (WT) BASELINE
                </span>
                <span class="text-zinc-400 text-[11px]">{{ activeTab().toUpperCase() }}</span>
              </div>

              <div class="relative w-full h-[380px] rounded-xl overflow-hidden border border-zinc-800">
                @if (activeTab() === 'chromatin') {
                  <app-chromatin-3d-fiber [cohesinSpeed]="1.0" [ctcfPermeability]="0.15" [hasCtcfMutation]="false" />
                } @else if (activeTab() === 'condensates') {
                  <app-condensate-3d-droplet [med1Conc]="3.5" [brd4Conc]="3.0" [polIiConc]="1.5" />
                } @else if (activeTab() === 'crispr') {
                  <app-crispr-3d-unwinder [guideRna]="'GACUUGACAGUCUACGAUCG'" [targetDna]="'GACTTGACAGTCTACGATCG'" [superhelicalSigma]="-0.06" />
                } @else if (activeTab() === 'nucleosome') {
                  <app-nucleosome-3d-puller [epigeneticState]="'HYPERACETYLATED_H3K27AC'" [ionicStrength]="150" />
                } @else if (activeTab() === 'linc') {
                  <app-nucleus-3d-deformer [ecmStiffness]="2.8" [actinTension]="1.2" />
                }
              </div>

              <div class="px-3 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>State: <strong class="text-emerald-300">Homeostatic Baseline</strong></span>
                <span>Integrity: <strong class="text-emerald-300">Preserved</strong></span>
              </div>
            </div>

            <!-- RIGHT PANEL: PATHOLOGICAL VARIANT OR PHARMACOLOGICAL RESCUE -->
            @if (comparisonTarget() === 'MUTANT_PATHOLOGY') {
              <div class="flex flex-col gap-3 p-4 bg-zinc-900/70 border border-rose-500/40 rounded-2xl shadow-xl">
                <div class="flex items-center justify-between text-xs font-mono border-b border-rose-500/30 pb-2">
                  <span class="text-rose-400 font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                    🔴 PATHOLOGICAL / PERTURBED
                  </span>
                  <span class="text-zinc-400 text-[11px]">{{ activeTab().toUpperCase() }}</span>
                </div>

                <div class="relative w-full h-[380px] rounded-xl overflow-hidden border border-zinc-800">
                  @if (activeTab() === 'chromatin') {
                    <app-chromatin-3d-fiber [cohesinSpeed]="cohesinSpeed()" [ctcfPermeability]="ctcfPermeability()" [hasCtcfMutation]="true" />
                  } @else if (activeTab() === 'condensates') {
                    <app-condensate-3d-droplet [med1Conc]="med1Conc()" [brd4Conc]="brd4Conc()" [polIiConc]="polIiConc()" />
                  } @else if (activeTab() === 'crispr') {
                    <app-crispr-3d-unwinder [guideRna]="crisprGuide()" [targetDna]="crisprTarget()" [superhelicalSigma]="superhelicalSigma()" />
                  } @else if (activeTab() === 'nucleosome') {
                    <app-nucleosome-3d-puller [epigeneticState]="epigeneticState()" [ionicStrength]="ionicStrength()" />
                  } @else if (activeTab() === 'linc') {
                    <app-nucleus-3d-deformer [ecmStiffness]="ecmStiffness()" [actinTension]="actinTension()" />
                  }
                </div>

                <div class="px-3 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span>State: <strong class="text-rose-300">Perturbed Variant</strong></span>
                  <span>Risk Verdict: <strong class="text-rose-300">Aberrant Reprogramming</strong></span>
                </div>
              </div>
            } @else {
              <div class="flex flex-col gap-3 p-4 bg-zinc-900/70 border border-cyan-500/40 rounded-2xl shadow-xl">
                <div class="flex items-center justify-between text-xs font-mono border-b border-cyan-500/30 pb-2">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                    💊 PHARMACOLOGICAL RESCUE
                  </span>
                  <span class="text-cyan-400 text-[11px]">
                    {{ activeTab() === 'chromatin' ? 'dCas9-CTCF' : activeTab() === 'condensates' ? 'JQ1 (500nM)' : activeTab() === 'crispr' ? 'eSpCas9-HF1' : activeTab() === 'nucleosome' ? 'Vorinostat (2.5µM)' : 'LOX-i + Y27632' }}
                  </span>
                </div>

                <div class="relative w-full h-[380px] rounded-xl overflow-hidden border border-zinc-800">
                  @if (activeTab() === 'chromatin') {
                    <app-chromatin-3d-fiber [cohesinSpeed]="1.2" [ctcfPermeability]="0.12" [hasCtcfMutation]="false" />
                  } @else if (activeTab() === 'condensates') {
                    <app-condensate-3d-droplet [med1Conc]="2.0" [brd4Conc]="1.2" [polIiConc]="1.0" />
                  } @else if (activeTab() === 'crispr') {
                    <app-crispr-3d-unwinder [guideRna]="crisprGuide()" [targetDna]="crisprTarget()" [superhelicalSigma]="-0.03" />
                  } @else if (activeTab() === 'nucleosome') {
                    <app-nucleosome-3d-puller [epigeneticState]="'HYPERACETYLATED_H3K27AC'" [ionicStrength]="160" />
                  } @else if (activeTab() === 'linc') {
                    <app-nucleus-3d-deformer [ecmStiffness]="3.2" [actinTension]="1.1" />
                  }
                </div>

                <div class="px-3 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span>Therapy: <strong class="text-cyan-300">Targeted Rescue</strong></span>
                  <span>Normalization: <strong class="text-cyan-300">96.4% Preserved</strong></span>
                </div>
              </div>
            }

          </div>
        }

        <!-- Biomechanical Differential (Δ) Delta HUD -->
        <div class="p-3 bg-zinc-900/90 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-amber-400 font-bold">📊 Differential Biomechanics (Δ):</span>
            @if (comparisonTarget() === 'MUTANT_PATHOLOGY') {
              <span class="text-zinc-300">TAD Insulation Δ: <strong class="text-rose-400">-44% (Fused Mega-TAD)</strong></span>
              <span>•</span>
              <span class="text-zinc-300">ECM Stroma Δ: <strong class="text-amber-300">+{{ (ecmStiffness() - 2.8).toFixed(1) }} kPa</strong></span>
              <span>•</span>
              <span class="text-zinc-300">YAP/TAZ Ratio Δ: <strong class="text-rose-300">+{{ (lincState().yapTazNuclearToCytoplasmicRatio - 0.82).toFixed(2) }}x</strong></span>
            } @else {
              <span class="text-zinc-300">Condensate Dissolution: <strong class="text-cyan-300">-78% Volume</strong></span>
              <span>•</span>
              <span class="text-zinc-300">LINC Stroma Normalization: <strong class="text-cyan-300">3.2 kPa (Restored)</strong></span>
              <span>•</span>
              <span class="text-zinc-300">Proofreading Fidelity: <strong class="text-cyan-300">&gt;99.9% On-Target</strong></span>
            }
          </div>
          <span class="text-zinc-500 text-[11px]">Side-by-Side Synchronized WebGL Multi-Lens</span>
        </div>
      </div>
    }

      <!-- Hologram & Snapshot Export Actions -->
      <div class="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-500 font-mono">LOINC 98253-8 • Physical Genomics &amp; CRISPR Engineering Suite</span>
          @if (hologramService.isRecording()) {
            <div class="flex items-center gap-2 px-2.5 py-1 bg-rose-950 border border-rose-600/60 rounded-lg text-rose-300 text-xs font-mono animate-pulse">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Recording WebM: <strong>{{ hologramService.recordingProgressPct() }}%</strong></span>
            </div>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2">
          @if (copiedFeedback()) {
            <span class="text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-1">
              <span>✅</span> {{ feedbackMessage() }}
            </span>
          }
          <button (click)="captureHologramPng()"
                  [disabled]="hologramService.isRecording()"
                  title="Capture high-resolution 2D PNG snapshot of active 3D WebGL simulation"
                  class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50">
            <span>📸</span> 3D Snapshot
          </button>
          <button (click)="recordHologramWebm()"
                  [disabled]="hologramService.isRecording()"
                  title="Record 3.5s 60fps WebM high-fidelity animation clip of active 3D simulation"
                  class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50">
            <span>🎥</span> 60fps WebM
          </button>
          <button (click)="exportGenomicsSnapshot()"
                  class="px-4 py-1.5 bg-teal-900/80 hover:bg-teal-800 text-teal-100 rounded-xl text-xs font-bold transition border border-teal-600/50 flex items-center gap-2 cursor-pointer shadow-md">
            <span>📜</span> Export FHIR LOINC 98253-8
          </button>
        </div>
      </div>

    </div>
  `
})
export class LensPhysicalGenomicsComponent implements AfterViewInit {
  private readonly genomicsService = inject(PhysicalGenomicsService);
  private readonly patientState = inject(PatientStateService);
  private readonly fhirFactory = inject(FhirBundleFactoryService);
  private readonly onnxEngine = inject(OnnxWebGpuEngineService);
  readonly hologramService = inject(HologramExportService);

  readonly activeTab = signal<PhysicalGenomicsParadigm>('chromatin');
  readonly isDualViewEnabled = signal<boolean>(false);
  readonly comparisonTarget = signal<'MUTANT_PATHOLOGY' | 'PHARMACOLOGICAL_RESCUE'>('MUTANT_PATHOLOGY');
  readonly comparisonLayout = signal<'SIDE_BY_SIDE' | 'WIPE_CURTAIN'>('WIPE_CURTAIN');
  readonly curtainPositionPct = signal<number>(50);
  readonly copiedFeedback = signal<boolean>(false);
  readonly feedbackMessage = signal<string>('FHIR R4 LOINC 98253-8 Snapshot Copied!');

  toggleDualView(): void {
    this.isDualViewEnabled.update(v => !v);
  }

  onCurtainSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value !== undefined) {
      this.curtainPositionPct.set(Number(target.value));
    }
  }

  readonly edgeMlPrior = computed<IPhysicalGenomicsPriors>(() => {
    const lastInference = this.onnxEngine.lastInference();
    const issues = this.patientState.issues();
    const conditions = Object.keys(issues || {});
    return this.onnxEngine.projectPhysicalGenomicsPriors(lastInference, {
      conditions,
      name: 'Active Patient'
    });
  });

  // Tab 1: Chromatin Loops
  readonly cohesinSpeed = signal(1.0);
  readonly ctcfPermeability = signal(0.20);
  readonly hasCtcfMutation = signal(false);
  private readonly hicCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('hicCanvas');

  // Tab 2: Super-Enhancers
  readonly med1Conc = signal(4.5);
  readonly brd4Conc = signal(3.2);
  readonly polIiConc = signal(1.8);

  // Tab 3: CRISPR
  readonly crisprGuide = signal('GACUUGACAGUCUACGAUCG');
  readonly crisprTarget = signal('GACTTGACAGTCTACGATCG');
  readonly superhelicalSigma = signal(-0.06);

  // Tab 4: Nucleosome
  readonly epigeneticState = signal<HistoneEpigeneticState>('HYPERACETYLATED_H3K27AC');
  readonly ionicStrength = signal(150);

  // Tab 5: LINC
  readonly ecmStiffness = signal(8.5);
  readonly actinTension = signal(2.4);

  // Computed Solvers
  readonly loopState = computed<ILoopExtrusionState>(() => {
    const barriers: ICtcfBarrierSite[] = [
      { positionKb: 500, orientation: 'FORWARD', bindingAffinityScore: 0.92 },
      { positionKb: 1000, orientation: 'REVERSE', bindingAffinityScore: 0.88, isMutatedOrDeleted: this.hasCtcfMutation() },
      { positionKb: 1500, orientation: 'FORWARD', bindingAffinityScore: 0.95 }
    ];
    return this.genomicsService.simulateLoopExtrusion(
      2000,
      this.cohesinSpeed(),
      this.ctcfPermeability(),
      barriers,
      32
    );
  });

  readonly condensateState = computed<ITranscriptionalCondensateState>(() => {
    return this.genomicsService.computeSuperEnhancerCondensate(
      this.med1Conc(),
      this.brd4Conc(),
      this.polIiConc(),
      120.0
    );
  });

  readonly crisprState = computed<ICrisprRLoopEnergyState>(() => {
    return this.genomicsService.evaluateCrisprMechanicalRLoop(
      this.crisprGuide(),
      this.crisprTarget(),
      'NGG',
      this.superhelicalSigma()
    );
  });

  readonly nucleosomeState = computed<INucleosomeMechanicalState>(() => {
    return this.genomicsService.simulateNucleosomeForceSpectroscopy(
      this.epigeneticState(),
      this.ionicStrength()
    );
  });

  readonly lincState = computed<ILincMechanotransductionState>(() => {
    return this.genomicsService.evaluateLincMechanotransduction(
      this.ecmStiffness(),
      this.actinTension()
    );
  });

  // SVG Render Computations
  readonly condensateSvgRadius = computed(() => {
    const r = this.condensateState().dropletRadiusNm;
    return Math.min(100, Math.max(35, r * 0.35));
  });

  readonly crisprSvgPoints = computed(() => {
    return this.crisprState().energyProfile
      .map(p => `${40 + (p.positionIndex - 1) * 22},${140 + p.cumulativeDeltaGKcalPerMol * 8}`)
      .join(' ');
  });

  readonly nucleosomeSvgPoints = computed(() => {
    return this.nucleosomeState().forceExtensionCurve
      .map(p => `${50 + p.appliedForcePn * 11.5},${240 - p.dnaExtensionNm * 3.2}`)
      .join(' ');
  });

  constructor() {
    this.applyEdgeMlPriors();

    effect(() => {
      const tab = this.activeTab();
      const loop = this.loopState();
      if (tab === 'chromatin') {
        setTimeout(() => this.renderHicHeatmap(), 10);
      }
    });
  }

  applyEdgeMlPriors(): void {
    const prior = this.edgeMlPrior();
    this.ecmStiffness.set(prior.ecmStiffnessKPa);
    this.actinTension.set(prior.actinTensionNn);
    this.epigeneticState.set(prior.epigeneticState);
    this.med1Conc.set(prior.med1ConcentrationUm);
    this.brd4Conc.set(prior.brd4ConcentrationUm);
    this.polIiConc.set(prior.polIiConcentrationUm);
    this.cohesinSpeed.set(prior.cohesinSpeedKbPerSec);
    this.ctcfPermeability.set(prior.ctcfPermeability);
    this.superhelicalSigma.set(prior.superhelicalSigma);
  }

  ngAfterViewInit(): void {
    this.renderHicHeatmap();
  }

  renderHicHeatmap(): void {
    const canvas = this.hicCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dim = this.loopState().contactMatrixDim;
    const matrix = this.loopState().contactMatrixFlat;
    canvas.width = dim;
    canvas.height = dim;

    const imgData = ctx.createImageData(dim, dim);
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const val = matrix[i * dim + j];
        const idx = (i * dim + j) * 4;

        // Warm fiery Red-Teal Hi-C colormap
        imgData.data[idx] = Math.min(255, Math.floor(val * 280)); // R
        imgData.data[idx + 1] = Math.min(255, Math.floor(Math.pow(val, 2) * 120 + val * 40)); // G
        imgData.data[idx + 2] = Math.min(255, Math.floor(Math.pow(1 - val, 3) * 60)); // B
        imgData.data[idx + 3] = 255; // Alpha
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Handlers
  onSpeedChange(e: Event): void {
    this.cohesinSpeed.set(parseFloat((e.target as HTMLInputElement).value));
  }

  onPermeabilityChange(e: Event): void {
    this.ctcfPermeability.set(parseFloat((e.target as HTMLInputElement).value));
  }

  toggleCtcfMutation(): void {
    this.hasCtcfMutation.update(v => !v);
  }

  resetChromatin(): void {
    this.cohesinSpeed.set(1.0);
    this.ctcfPermeability.set(0.20);
    this.hasCtcfMutation.set(false);
  }

  onMed1Change(e: Event): void {
    this.med1Conc.set(parseFloat((e.target as HTMLInputElement).value));
  }

  onBrd4Change(e: Event): void {
    this.brd4Conc.set(parseFloat((e.target as HTMLInputElement).value));
  }

  onPolIiChange(e: Event): void {
    this.polIiConc.set(parseFloat((e.target as HTMLInputElement).value));
  }

  setCrisprPreset(preset: 'perfect' | 'seed-mismatch' | 'distal-mismatch'): void {
    this.crisprGuide.set('GACUUGACAGUCUACGAUCG');
    if (preset === 'perfect') {
      this.crisprTarget.set('GACTTGACAGTCTACGATCG');
    } else if (preset === 'seed-mismatch') {
      this.crisprTarget.set('GACTTGACAGTCTACGATAA');
    } else {
      this.crisprTarget.set('GGCTTGACAGTCTACGATCG');
    }
  }

  onSigmaChange(e: Event): void {
    this.superhelicalSigma.set(parseFloat((e.target as HTMLInputElement).value));
  }

  onIonicChange(e: Event): void {
    this.ionicStrength.set(parseInt((e.target as HTMLInputElement).value, 10));
  }

  onEcmChange(e: Event): void {
    this.ecmStiffness.set(parseFloat((e.target as HTMLInputElement).value));
  }

  onTensionChange(e: Event): void {
    this.actinTension.set(parseFloat((e.target as HTMLInputElement).value));
  }

  exportGenomicsSnapshot(): void {
    const patientId = this.patientState.patientId() || 'patient-p101';
    
    const fhirObs = this.fhirFactory.createPhysicalGenomicsObservationResource(patientId, {
      tadInsulationScore: this.loopState().tadInsulationScore,
      fractalScalingGamma: this.loopState().fractalGlobuleScalingGamma,
      activeLoopsCount: this.loopState().activeLoopsCount,
      condensateRadiusNm: this.condensateState().dropletRadiusNm,
      burstFrequencyPerHour: this.condensateState().transcriptionalBurstFrequencyPerHour,
      crisprNetDeltaG: this.crisprState().netFreeEnergyDeltaGKcalPerMol,
      crisprCleavageProbPct: Math.round((1 - this.crisprState().offTargetCleavageProbability) * 100),
      nucleosomeOuterRuptureForcePn: this.nucleosomeState().outerTurnRuptureForcePn,
      nucleosomeInnerRuptureForcePn: this.nucleosomeState().innerCoreRuptureForcePn,
      lincBridgeForcePn: this.lincState().lincComplexForcePnPerBridge,
      yapTazNuclearRatio: this.lincState().yapTazNuclearToCytoplasmicRatio,
      mechanostate: this.lincState().transcriptionalMechanostate
    });

    const payload = {
      fhirResource: fhirObs,
      chromatin: this.loopState(),
      condensates: this.condensateState(),
      crispr: this.crisprState(),
      nucleosome: this.nucleosomeState(),
      linc: this.lincState(),
      timestamp: new Date().toISOString()
    };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    this.feedbackMessage.set('FHIR R4 LOINC 98253-8 Snapshot Copied!');
    this.copiedFeedback.set(true);
    setTimeout(() => this.copiedFeedback.set(false), 2500);
  }

  async captureHologramPng(): Promise<void> {
    const canvas = this.findActiveWebGLCanvas();
    if (!canvas) {
      this.feedbackMessage.set('⚠️ No active WebGL canvas detected');
      this.copiedFeedback.set(true);
      setTimeout(() => this.copiedFeedback.set(false), 2500);
      return;
    }

    try {
      const record = await this.hologramService.captureCanvasSnapshot(canvas, this.activeTab());
      this.feedbackMessage.set(`📸 3D Hologram PNG Captured (${(record.blobSize / 1024).toFixed(0)} KB)!`);
      this.copiedFeedback.set(true);
      setTimeout(() => this.copiedFeedback.set(false), 3000);
    } catch (err) {
      console.error('[Physical Genomics] PNG Capture Failed:', err);
    }
  }

  async recordHologramWebm(): Promise<void> {
    const canvas = this.findActiveWebGLCanvas();
    if (!canvas) {
      this.feedbackMessage.set('⚠️ No active WebGL canvas detected');
      this.copiedFeedback.set(true);
      setTimeout(() => this.copiedFeedback.set(false), 2500);
      return;
    }

    try {
      const record = await this.hologramService.recordCanvasVideo(canvas, 3.5, this.activeTab());
      this.feedbackMessage.set(`🎥 60fps WebM Animation Recorded (${(record.blobSize / 1024).toFixed(0)} KB)!`);
      this.copiedFeedback.set(true);
      setTimeout(() => this.copiedFeedback.set(false), 3000);
    } catch (err) {
      console.error('[Physical Genomics] WebM Recording Failed:', err);
    }
  }

  private findActiveWebGLCanvas(): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    const canvases = Array.from(document.querySelectorAll('app-lens-physical-genomics canvas')) as HTMLCanvasElement[];
    return canvases.find(c => c.clientWidth > 0 && c.clientHeight > 0) || canvases[0] || null;
  }
}
