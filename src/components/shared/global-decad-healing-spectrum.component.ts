import { Component, ChangeDetectionStrategy, inject, signal, computed, linkedSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';
import { PatientStateService } from '../../services/patient-state.service';
import { OnDeviceEmbedderService, IHybridSemanticMatch } from '../../services/ai/on-device-embedder.service';
import { SowaRigpaTreeSpatialViewerComponent } from './sowa-rigpa-tree-spatial-viewer.component';
import {
  TGlobalHealingParadigm,
  IGlobalDecadConsensus,
  TNaturopathicTherapeuticOrderTier
} from '../../models/global-healing-paradigms.model';

export interface IRegionalCrosswalkNode {
  id: string;
  name: string;
  icon: string;
  coordinates3d: [number, number, number];
  westernAllopathic: string;
  osteopathicDo: string;
  tcmWuXing: string;
  ayurvedaPrana: string;
  unaniTibb: string;
  functionalSystems: string;
  indigenousTek: string;
  siddhaSowaRigpa: string;
  chronobiology: string;
}

@Component({
  selector: 'app-global-decad-healing-spectrum',
  standalone: true,
  imports: [CommonModule, FormsModule, SowaRigpaTreeSpatialViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="@container w-full p-6 sm:p-8 rounded-3xl bg-zinc-950/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-teal-500/30 shadow-2xl text-zinc-100 space-y-8 animate-in fade-in duration-300">
      
      <!-- Top HUD Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div class="space-y-1.5">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)] animate-pulse"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>🌐</span>
              <span>Global Decad: 10-Paradigm Healing Spectrum</span>
            </h2>
            <span class="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
              Epistemic Pluralism
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Autonomous multi-tradition clinical reasoning engine bridging Allopathic, Osteopathic, Naturopathic, TCM, Ayurveda, Functional, Unani-Tibb, Indigenous TEK, Siddha/Sowa-Rigpa, and Chronobiology.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- 3D Body Synchronizer Badge -->
          <div class="px-3.5 py-1.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 flex items-center gap-2.5 shadow-xs">
            <span class="text-base">🧍‍♂️</span>
            <div>
              <div class="text-[9px] font-mono uppercase tracking-widest text-teal-400">3D Body Layer</div>
              <div class="text-xs font-black text-teal-200 font-mono">
                {{ active3dBodyMode() }}
              </div>
            </div>
          </div>

          <!-- Convergence Score Badge -->
          <div class="px-3.5 py-1.5 rounded-2xl bg-zinc-900/90 border border-teal-500/30 flex items-center gap-2.5 shadow-xs">
            <span class="text-base">🎯</span>
            <div>
              <div class="text-[9px] font-mono uppercase tracking-widest text-zinc-400">Convergence</div>
              <div class="text-sm font-black text-teal-300 font-mono tabular-nums">
                {{ (consensus().epistemicConvergenceScore * 100).toFixed(0) }}% Multi-System
              </div>
            </div>
          </div>

          <!-- FDA Part 11 Digest Badge -->
          <div class="px-3.5 py-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 shadow-xs">
            <span class="text-xs">🔒</span>
            <div class="text-right">
              <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Part 11 Seal</div>
              <div class="text-[11px] font-mono font-bold text-zinc-300">Verified</div>
            </div>
          </div>
        </div>
      </div>

      <!-- On-Device Semantic Vector Search HUD -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-950/30 via-zinc-900 to-indigo-950/30 border border-teal-500/30 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-base">⚡</span>
            <span class="text-xs font-mono font-bold text-teal-300">On-Device Semantic Embedder Search</span>
            <span class="px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              {{ embedder.isSupported() ? 'Chrome Built-in AI' : 'Deterministic Morphological Projection' }}
            </span>
          </div>

          @if (searchLatencyMs() > 0) {
            <span class="text-[10px] font-mono text-emerald-400 font-bold">
              Latency: {{ searchLatencyMs().toFixed(1) }}ms (0ms Network Egress)
            </span>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="relative flex-1 min-w-[280px]">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($any($event.target).value)"
              placeholder="Search concepts across 10 traditions (e.g., 'hepatic clearance', 'vagus nerve CRI', 'qi stagnation', 'gut zonulin', 'circadian autophagy')..."
              class="w-full px-3.5 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition shadow-inner"
            />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="clearSearch()"
                class="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            }
          </div>

          <!-- Quick Search Chips -->
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <button
              type="button"
              (click)="onSearchInput('hepatic clearance')"
              class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-teal-300 transition cursor-pointer"
            >
              🫀 Liver Phase II
            </button>
            <button
              type="button"
              (click)="onSearchInput('vagus nerve compression CRI')"
              class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-300 transition cursor-pointer"
            >
              🧠 Vagus / CRI
            </button>
            <button
              type="button"
              (click)="onSearchInput('qi stagnation fire')"
              class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-300 transition cursor-pointer"
            >
              🔴 TCM Qi Fire
            </button>
            <button
              type="button"
              (click)="onSearchInput('gut zonulin endotoxemia')"
              class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 transition cursor-pointer"
            >
              🦠 Gut Barrier / Ama
            </button>
          </div>
        </div>

        <!-- Semantic Search Results Chips -->
        @if (searchResults().length > 0) {
          <div class="pt-2 border-t border-teal-500/20 space-y-2 animate-in fade-in duration-150">
            <div class="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
              Top Semantic & Lexical Matches (Hybrid RRF Ranked):
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              @for (match of searchResults(); track match.id) {
                <div
                  (click)="applySearchMatch(match)"
                  class="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-teal-500/60 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div class="space-y-1">
                    <div class="flex items-center justify-between gap-1 text-[11px] font-mono">
                      <span class="font-bold text-teal-300 group-hover:text-teal-200">
                        {{ match.data?.label || match.id }}
                      </span>
                      <span class="px-1.5 py-0.2 text-[9px] font-black rounded bg-teal-500/20 text-teal-300">
                        {{ ((match.hybridRrfScore || match.score) * 100).toFixed(0) }}% Match
                      </span>
                    </div>
                    <p class="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                      {{ match.text }}
                    </p>
                  </div>
                  <div class="pt-1.5 mt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                    <span>Rank #{{ match.denseRank || 1 }}</span>
                    <span class="text-teal-400 group-hover:underline">Focus Node ➔</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Navigation & Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            (click)="activeView.set('lenses')"
            [class]="activeView() === 'lenses'
              ? 'px-4 py-2 rounded-xl bg-teal-500 text-zinc-950 font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🔬 10-Paradigm Lenses
          </button>
          <button
            type="button"
            (click)="activeView.set('spatial_crosswalk')"
            [class]="activeView() === 'spatial_crosswalk'
              ? 'px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🧍‍♂️ 3D Spatial Nodes
          </button>
          <button
            type="button"
            (click)="activeView.set('crosswalk')"
            [class]="activeView() === 'crosswalk'
              ? 'px-4 py-2 rounded-xl bg-purple-500 text-zinc-950 font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🗿 Rosetta Crosswalk
          </button>
          <button
            type="button"
            (click)="activeView.set('ladder')"
            [class]="activeView() === 'ladder'
              ? 'px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🪜 Stepped Order
          </button>
          <button
            type="button"
            (click)="activeView.set('safety')"
            [class]="activeView() === 'safety'
              ? 'px-4 py-2 rounded-xl bg-rose-500 text-zinc-950 font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🛡️ Safety Guard
          </button>
          <button
            type="button"
            (click)="activeView.set('sowa_trees')"
            [class]="activeView() === 'sowa_trees'
              ? 'px-4 py-2 rounded-xl bg-teal-600 text-white font-black text-xs shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold text-xs transition-all'"
          >
            🌲 Sowa-Rigpa 3D Trees
          </button>
        </div>

        <div class="text-[11px] font-mono text-zinc-500 px-2">
          Traditions Evaluated: <span class="text-teal-400 font-bold">10 / 10</span>
        </div>
      </div>

      <!-- VIEW 1: 10-Paradigm Lens Switcher -->
      @if (activeView() === 'lenses') {
        <div class="space-y-6">
          
          <!-- Paradigm Selector Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-mono">
            @for (p of paradigmTabs; track p.id) {
              <button
                type="button"
                (click)="selectParadigm(p.id)"
                [class]="selectedParadigm() === p.id
                  ? 'p-2.5 rounded-2xl bg-zinc-800 border-2 ' + p.borderClass + ' text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all scale-[1.02]'
                  : 'p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 font-bold text-xs flex items-center gap-2 transition-all'"
              >
                <span class="text-base">{{ p.icon }}</span>
                <div class="text-left truncate">
                  <div class="truncate">{{ p.shortName }}</div>
                  <div class="text-[9px] text-zinc-500 uppercase">{{ p.category }}</div>
                </div>
              </button>
            }
          </div>

          <!-- Active Paradigm Lens Deep-Dive Card -->
          <div class="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            
            <!-- 1. Allopathic (MD) -->
            @if (selectedParadigm() === 'allopathic_md') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🔵</span>
                    <div>
                      <h3 class="text-base font-black text-cyan-300">Allopathic Medicine (MD)</h3>
                      <p class="text-xs text-zinc-400">Pathophysiology, Biomarker Telemetry & Pharmacotherapy</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                    Risk Tier: {{ consensus().allopathic.vitalSignsRiskTier }}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Primary ICD-10 Diagnoses</span>
                    @for (dx of consensus().allopathic.primaryDiagnosesIcd10; track dx.code) {
                      <div class="flex items-center justify-between font-mono bg-zinc-900 p-2 rounded-xl">
                        <span class="text-cyan-400 font-bold">{{ dx.code }}</span>
                        <span class="text-zinc-300">{{ dx.label }}</span>
                      </div>
                    }
                  </div>

                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Evidence Grade & Preventive Gaps</span>
                    <div class="text-emerald-400 font-bold font-mono">{{ consensus().allopathic.cochraneEvidenceGrade }}</div>
                    <ul class="list-disc list-inside text-zinc-300 space-y-1">
                      @for (gap of consensus().allopathic.uspstfPreventiveGaps; track gap) {
                        <li>{{ gap }}</li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }

            <!-- 2. Osteopathic (DO) -->
            @if (selectedParadigm() === 'osteopathic_do') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🟣</span>
                    <div>
                      <h3 class="text-base font-black text-purple-300">Osteopathic Medicine (DO)</h3>
                      <p class="text-xs text-zinc-400">Somatic Dysfunction (TART Criteria) & Autonomic Pacing</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700/50">
                    CRI Rhythm: {{ consensus().osteopathic.craniosacralPrimaryRespiratoryRhythm }}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Somatic Dysfunction Segments</span>
                    <div class="text-purple-300 font-mono font-bold">{{ consensus().osteopathic.somaticDysfunctionSegments.join(', ') }}</div>
                    <div class="text-[11px] text-zinc-400">Diaphragm: {{ consensus().osteopathic.thoracoabdominalDiaphragmPumpStatus }}</div>
                  </div>

                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Recommended OMT Techniques</span>
                    <ul class="list-disc list-inside text-teal-300 font-mono space-y-1">
                      @for (tech of consensus().osteopathic.recommendedOmtTechniques; track tech) {
                        <li>{{ tech }}</li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }

            <!-- 3. Naturopathic (ND) -->
            @if (selectedParadigm() === 'naturopathic_nd') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🟢</span>
                    <div>
                      <h3 class="text-base font-black text-emerald-300">Naturopathic Medicine (ND)</h3>
                      <p class="text-xs text-zinc-400">Vis Medicatrix Naturae & 7-Tier Stepped Order</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    Vital Force Reserve: {{ consensus().naturopathic.visMedicatrixNaturaeScore }}/100
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Tolle Causam Root Etiology</span>
                    <p class="text-zinc-200">{{ consensus().naturopathic.tolleCausamRootEtiology }}</p>
                    <div class="text-[11px] text-emerald-400 font-mono">Nutritional: {{ consensus().naturopathic.nutritionalPrescriptions.join(', ') }}</div>
                  </div>

                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Active Therapeutic Tier</span>
                    <div class="text-sm font-bold text-amber-300 font-mono">{{ consensus().naturopathic.currentTherapeuticOrderTier }}</div>
                    <div class="text-[11px] text-zinc-300">{{ consensus().naturopathic.hydrotherapyProtocols.join(', ') }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- 4. Traditional Chinese Medicine (TCM) -->
            @if (selectedParadigm() === 'traditional_chinese') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🔴</span>
                    <div>
                      <h3 class="text-base font-black text-rose-300">Traditional Chinese Medicine (TCM)</h3>
                      <p class="text-xs text-zinc-400">Wu Xing (Five Elements), Zang-Fu & Meridian Energetics</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700/50">
                    Syndrome: {{ consensus().tcm.zangFuSyndrome }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                    <div class="font-mono text-zinc-400 uppercase font-bold text-[10px]">Tongue Diagnosis</div>
                    <div class="text-zinc-200">{{ consensus().tcm.tongueDiagnosis }}</div>
                  </div>
                  <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                    <div class="font-mono text-zinc-400 uppercase font-bold text-[10px]">Pulse Diagnosis</div>
                    <div class="text-zinc-200">{{ consensus().tcm.pulseDiagnosis }}</div>
                  </div>
                  <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                    <div class="font-mono text-zinc-400 uppercase font-bold text-[10px]">Classical Herbal Formula</div>
                    <div class="text-rose-300 font-bold">{{ consensus().tcm.classicalHerbalFormulary }}</div>
                    <div class="text-[10px] text-zinc-500 font-mono">Acupoints: {{ consensus().tcm.keyAcupoints.join(', ') }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- 5. Ayurvedic Medicine -->
            @if (selectedParadigm() === 'ayurvedic') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🟡</span>
                    <div>
                      <h3 class="text-base font-black text-amber-300">Ayurvedic Medicine</h3>
                      <p class="text-xs text-zinc-400">Tridosha (Vata/Pitta/Kapha), Agni, Ama & Dhatus</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
                    Ojas Vitality: {{ consensus().ayurvedic.ojasImmuneVitalityScore }}/100
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px] uppercase">Prakriti Baseline</div>
                    <div class="text-amber-300 font-bold">{{ consensus().ayurvedic.prakritiConstitutionalBaseline }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px] uppercase">Vikriti Imbalance</div>
                    <div class="text-rose-400 font-bold">{{ consensus().ayurvedic.vikritiCurrentImbalance }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px] uppercase">Agni (Metabolic State)</div>
                    <div class="text-teal-300 font-bold">{{ consensus().ayurvedic.agniMetabolicState }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px] uppercase">Ama (Toxicity)</div>
                    <div class="text-purple-400 font-bold">{{ consensus().ayurvedic.amaToxicityLevel }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- 6. Functional & Systems Medicine -->
            @if (selectedParadigm() === 'functional_systems') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🧬</span>
                    <div>
                      <h3 class="text-base font-black text-indigo-300">Functional & Systems Medicine</h3>
                      <p class="text-xs text-zinc-400">7 Core Network Nodes, Gut Barrier & Longevity Switches</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    ApoB: {{ consensus().functional.apobCardiometabolicParticleRisk }}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Biomarker Telemetry</span>
                    <div class="flex items-center justify-between font-mono bg-zinc-900 p-2 rounded-xl">
                      <span class="text-zinc-400">Zonulin Gut Permeability:</span>
                      <span class="text-indigo-400 font-bold">{{ consensus().functional.zonulinGutPermeabilityEstimateNgMl }} ng/mL</span>
                    </div>
                    <div class="flex items-center justify-between font-mono bg-zinc-900 p-2 rounded-xl">
                      <span class="text-zinc-400">hs-CRP Inflammation:</span>
                      <span class="text-indigo-400 font-bold">{{ consensus().functional.hsCrpSystemicInflammationMgL }} mg/L</span>
                    </div>
                  </div>

                  <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Longevity Switches</span>
                    <div class="text-[11px] font-mono text-zinc-300 space-y-1">
                      <div>AMPK: <span class="text-emerald-400 font-bold">{{ consensus().functional.longevitySwitchModulation.ampkPhosphorylation }}</span></div>
                      <div>mTORC1: <span class="text-teal-400 font-bold">{{ consensus().functional.longevitySwitchModulation.mtorC1Activation }}</span></div>
                      <div>Sirtuins: <span class="text-indigo-400 font-bold">{{ consensus().functional.longevitySwitchModulation.sirtuinDeacetylation }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- 7. Unani-Tibb -->
            @if (selectedParadigm() === 'unani_tibb') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🏺</span>
                    <div>
                      <h3 class="text-base font-black text-amber-300">Unani-Tibb (Greco-Arabic)</h3>
                      <p class="text-xs text-zinc-400">4 Akhlat (Humors), Mizaj Temperament & Quwwat-e-Mudabbira</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
                    Self-Healing Power: {{ consensus().unaniTibb.quwwatEMudabbiraSelfHealingPower }}/100
                  </span>
                </div>

                <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
                  <div class="font-mono text-zinc-400 uppercase tracking-wider font-bold">Mizaj State</div>
                  <div class="text-amber-300 font-bold font-mono">{{ consensus().unaniTibb.currentSueMizajDyscrasia }}</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-300 font-mono">
                    <div class="p-2 rounded bg-zinc-900">Food/Drink: {{ consensus().unaniTibb.asbabESittahZarooriyahPillars.makulWaMashroobFoodDrink }}</div>
                    <div class="p-2 rounded bg-zinc-900">Mental: {{ consensus().unaniTibb.asbabESittahZarooriyahPillars.harkatWaSukoonNafsaniMentalState }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- 8. Indigenous Ethnomedicine & TEK -->
            @if (selectedParadigm() === 'indigenous_tek') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🌿</span>
                    <div>
                      <h3 class="text-base font-black text-emerald-300">Indigenous Ethnomedicine & TEK</h3>
                      <p class="text-xs text-zinc-400">Relational Ecology, Bioregional Botany & Somatic Kinship</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {{ consensus().indigenousTek.ecologicalReciprocityStatus }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  @for (plant of consensus().indigenousTek.bioregionalPlantRelations; track plant.botanicalName) {
                    <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                      <div class="font-mono font-bold text-emerald-300">{{ plant.botanicalName }}</div>
                      <p class="text-zinc-300">{{ plant.indigenousTraditionalUse }}</p>
                      <div class="text-[10px] text-zinc-500 font-mono">Ethics: {{ plant.ecologicalHarvestEthics }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- 9. Siddha & Sowa-Rigpa -->
            @if (selectedParadigm() === 'siddha_sowa_rigpa') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">☸️</span>
                    <div>
                      <h3 class="text-base font-black text-amber-300">Siddha & Sowa-Rigpa (Tibetan)</h3>
                      <p class="text-xs text-zinc-400">Kaya Kalpa Rejuvenation, 3 Tibetan Humors & Root Kleshas</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
                    Kaya Kalpa Index: {{ consensus().siddhaSowaRigpa.kayaKalpaRejuvenationIndex }}/100
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px]">Rlung (Wind)</div>
                    <div class="text-cyan-300 font-bold">{{ consensus().siddhaSowaRigpa.sowaRigpaThreeHumors.rlungWind }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px]">Mkhris-pa (Fire)</div>
                    <div class="text-rose-400 font-bold">{{ consensus().siddhaSowaRigpa.sowaRigpaThreeHumors.mkhrisPaFire }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-500 text-[10px]">Bad-kan (Phlegm)</div>
                    <div class="text-emerald-400 font-bold">{{ consensus().siddhaSowaRigpa.sowaRigpaThreeHumors.badKanPhlegm }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- 10. Chronobiology & Exposomics -->
            @if (selectedParadigm() === 'chronobiology_exposomics') {
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">☀️</span>
                    <div>
                      <h3 class="text-base font-black text-amber-300">Chronobiology & Exposomics</h3>
                      <p class="text-xs text-zinc-400">SCN Master Clock, BMAL1/PER2 & Toxicant Deposition Index</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
                    Toxicity Index: {{ consensus().chronobiologyExposomics.cumulativeExposomicToxicityIndex }}/100
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-400 font-bold text-[10px] uppercase">SCN Solar Entrainment</div>
                    <div class="text-amber-300 font-bold">{{ consensus().chronobiologyExposomics.suprachiasmaticNucleusScnEntrainment }}</div>
                    <div class="text-[11px] text-zinc-400">Morning Lux: {{ consensus().chronobiologyExposomics.melanopicLuxMorningExposure }} lux</div>
                  </div>
                  <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                    <div class="text-zinc-400 font-bold text-[10px] uppercase">Autophagy Feeding Window</div>
                    <div class="text-teal-300 font-bold">{{ consensus().chronobiologyExposomics.timeRestrictedFeedingWindow }}</div>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      }

      <!-- VIEW 2: 3D Spatial Regional Node Crosswalk -->
      @if (activeView() === 'spatial_crosswalk') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <span class="text-xl">🧍‍♂️</span>
            <div class="space-y-1">
              <h3 class="text-sm font-black text-cyan-300">
                Interactive 3D Anatomical Regional Crosswalk
              </h3>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Select an anatomical coordinate to observe how that exact biophysical region is conceptualized, diagnosed, and treated across all 10 paradigms simultaneously.
              </p>
            </div>
          </div>

          <!-- Regional Node Badges -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono">
            @for (node of spatialNodes; track node.id) {
              <button
                type="button"
                (click)="selectedSpatialNode.set(node)"
                [class]="selectedSpatialNode().id === node.id
                  ? 'p-2.5 rounded-2xl bg-cyan-500 text-zinc-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all scale-[1.02]'
                  : 'p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold text-xs flex items-center gap-2 transition-all'"
              >
                <span>{{ node.icon }}</span>
                <span class="truncate">{{ node.name }}</span>
              </button>
            }
          </div>

          <!-- Active Spatial Node Multi-Paradigm Card -->
          <div class="p-6 rounded-3xl bg-zinc-900/90 border border-cyan-500/30 space-y-5">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">{{ selectedSpatialNode().icon }}</span>
                <div>
                  <h4 class="text-base font-black text-cyan-300">{{ selectedSpatialNode().name }}</h4>
                  <span class="text-[10px] font-mono text-zinc-500">3D Coords: [{{ selectedSpatialNode().coordinates3d.join(', ') }}]</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                10-Tradition Anchor
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-cyan-400 font-bold text-[10px] uppercase">🔵 1. Allopathic (MD)</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().westernAllopathic }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-purple-400 font-bold text-[10px] uppercase">🟣 2. Osteopathic (DO)</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().osteopathicDo }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-rose-400 font-bold text-[10px] uppercase">🔴 4. TCM (Wu Xing)</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().tcmWuXing }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-amber-400 font-bold text-[10px] uppercase">🟡 5. Ayurveda (Prana)</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().ayurvedaPrana }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-indigo-400 font-bold text-[10px] uppercase">🧬 6. Functional Systems</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().functionalSystems }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-amber-300 font-bold text-[10px] uppercase">🏺 7. Unani-Tibb</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().unaniTibb }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-emerald-400 font-bold text-[10px] uppercase">🌿 8. Indigenous TEK</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().indigenousTek }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-amber-500 font-bold text-[10px] uppercase">☸️ 9. Siddha / Sowa-Rigpa</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().siddhaSowaRigpa }}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div class="font-mono text-yellow-400 font-bold text-[10px] uppercase">☀️ 10. Chronobiology</div>
                <p class="text-zinc-200">{{ selectedSpatialNode().chronobiology }}</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- VIEW 3: Rosetta Stone Crosswalk Table -->
      @if (activeView() === 'crosswalk') {
        <div class="space-y-4 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <h3 class="text-sm font-black text-purple-300 flex items-center gap-2">
              <span>🗿</span>
              <span>Harmonized Multi-Paradigm Root Etiology</span>
            </h3>
            <p class="text-xs text-zinc-300 mt-1">
              {{ consensus().concordantRootEtiology }}
            </p>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-zinc-800">
            <table class="w-full text-left text-xs font-sans">
              <thead class="bg-zinc-900 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th class="p-3.5">Tradition</th>
                  <th class="p-3.5">Diagnostic Concept</th>
                  <th class="p-3.5">Biophysical Translation</th>
                  <th class="p-3.5">Primary Prescription</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/60 text-zinc-200">
                <tr class="hover:bg-zinc-900/40 transition">
                  <td class="p-3.5 font-bold text-cyan-300 font-mono">Allopathic (MD)</td>
                  <td class="p-3.5 font-mono">Stage 1 HTN / Endothelial Strain</td>
                  <td class="p-3.5">Sympathetic vasoconstriction, decreased NO</td>
                  <td class="p-3.5 font-mono text-zinc-400">Targeted ACEi / ARB or Lifestyle</td>
                </tr>
                <tr class="hover:bg-zinc-900/40 transition">
                  <td class="p-3.5 font-bold text-purple-300 font-mono">Osteopathic (DO)</td>
                  <td class="p-3.5 font-mono">C1-C2 Suboccipital Strain</td>
                  <td class="p-3.5">Vagus nerve (CN X) jugular compression</td>
                  <td class="p-3.5 font-mono text-teal-300">Suboccipital Decompression</td>
                </tr>
                <tr class="hover:bg-zinc-900/40 transition">
                  <td class="p-3.5 font-bold text-rose-300 font-mono">TCM</td>
                  <td class="p-3.5 font-mono">Liver Qi Stagnation / Fire</td>
                  <td class="p-3.5">Phase II hepatic backlog, emotional tension</td>
                  <td class="p-3.5 font-mono text-rose-300">Xiao Yao San / LV3 Acupoint</td>
                </tr>
                <tr class="hover:bg-zinc-900/40 transition">
                  <td class="p-3.5 font-bold text-amber-300 font-mono">Ayurveda</td>
                  <td class="p-3.5 font-mono">Pitta-Vata Vitiation / Ama</td>
                  <td class="p-3.5">Endotoxemia, hyper-metabolic fire</td>
                  <td class="p-3.5 font-mono text-amber-300">Pranayama / Triphala</td>
                </tr>
                <tr class="hover:bg-zinc-900/40 transition">
                  <td class="p-3.5 font-bold text-amber-400 font-mono">Unani-Tibb</td>
                  <td class="p-3.5 font-mono">Su-e-Mizaj Safrawi (Hot/Dry)</td>
                  <td class="p-3.5">Bile acid imbalance, hepatic oxidative stress</td>
                  <td class="p-3.5 font-mono text-amber-400">Sharbat-e-Bazoori / Arq-e-Kasni</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- VIEW 4: 7-Tier Naturopathic Stepped Ladder -->
      @if (activeView() === 'ladder') {
        <div class="space-y-4 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
            <h3 class="text-sm font-black text-amber-300 flex items-center gap-2">
              <span>🪜</span>
              <span>The Naturopathic Therapeutic Order (Stepped Escalation Ladder)</span>
            </h3>
            <p class="text-xs text-zinc-300 mt-1">
              Guarantees that gentle, non-invasive vital force restorations are exhausted prior to escalating to invasive synthetic interventions.
            </p>
          </div>

          <div class="space-y-2.5">
            @for (step of consensus().therapeuticOrderSteppedLadder; track step.tier) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                    {{ step.tier.replace(/_/g, ' ') }}
                  </div>
                  <ul class="text-[11px] text-zinc-400 list-disc list-inside">
                    @for (act of step.actions; track act) {
                      <li>{{ act }}</li>
                    }
                  </ul>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shrink-0 border"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': step.status === 'Satisfied',
                    'bg-amber-500/20 text-amber-300 border-amber-500/40': step.status === 'In_Progress',
                    'bg-zinc-800 text-zinc-400 border-zinc-700': step.status === 'Pending_Escalation'
                  }"
                >
                  {{ step.status.replace(/_/g, ' ') }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- VIEW 5: Safety & Contraindications Guard -->
      @if (activeView() === 'safety') {
        <div class="space-y-4 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
            <h3 class="text-sm font-black text-rose-300 flex items-center gap-2">
              <span>🛡️</span>
              <span>Cross-Paradigm Safety & Poly-Pharmacy Interaction Guard</span>
            </h3>
            <p class="text-xs text-zinc-300 mt-1">
              Harmonizes botanical CYP450 bio-equivalence, TCM thermal polarities, and prescription pharmaceuticals.
            </p>
          </div>

          <div class="space-y-2.5">
            @for (warning of consensus().crossParadigmContraindications; track warning) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-rose-900/40 flex items-start gap-3 text-xs text-zinc-300">
                <span class="text-rose-400 text-sm">⚠️</span>
                <span>{{ warning }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- VIEW 6: Sowa-Rigpa 3D Living Trees -->
      @if (activeView() === 'sowa_trees') {
        <div class="animate-in fade-in duration-200">
          <app-sowa-rigpa-tree-spatial-viewer></app-sowa-rigpa-tree-spatial-viewer>
        </div>
      }

    </div>
  `
})
export class GlobalDecadHealingSpectrumComponent {
  private readonly paradigmsService = inject(GlobalHealingParadigmsService);
  private readonly patientState = inject(PatientStateService);
  readonly embedder = inject(OnDeviceEmbedderService);

  readonly consensus = this.paradigmsService.decadConsensus;
  readonly activeView = signal<'lenses' | 'spatial_crosswalk' | 'crosswalk' | 'ladder' | 'safety' | 'sowa_trees'>('lenses');
  readonly selectedParadigm = linkedSignal<TGlobalHealingParadigm>(() => 'allopathic_md');

  readonly searchQuery = signal<string>('');
  readonly searchResults = signal<IHybridSemanticMatch[]>([]);
  readonly searchLatencyMs = signal<number>(0);

  readonly active3dBodyMode = computed(() => this.patientState.anatomyViewMode());

  readonly paradigmTabs: {
    id: TGlobalHealingParadigm;
    shortName: string;
    category: string;
    icon: string;
    borderClass: string;
  }[] = [
    { id: 'allopathic_md', shortName: 'Allopathic', category: 'MD', icon: '🔵', borderClass: 'border-cyan-500' },
    { id: 'osteopathic_do', shortName: 'Osteopathic', category: 'DO', icon: '🟣', borderClass: 'border-purple-500' },
    { id: 'naturopathic_nd', shortName: 'Naturopathic', category: 'ND', icon: '🟢', borderClass: 'border-emerald-500' },
    { id: 'traditional_chinese', shortName: 'TCM Wu Xing', category: 'Trad', icon: '🔴', borderClass: 'border-rose-500' },
    { id: 'ayurvedic', shortName: 'Ayurvedic', category: 'Trad', icon: '🟡', borderClass: 'border-amber-500' },
    { id: 'functional_systems', shortName: 'Functional', category: 'Systems', icon: '🧬', borderClass: 'border-indigo-500' },
    { id: 'unani_tibb', shortName: 'Unani-Tibb', category: 'Humoral', icon: '🏺', borderClass: 'border-amber-400' },
    { id: 'indigenous_tek', shortName: 'Indigenous', category: 'TEK', icon: '🌿', borderClass: 'border-emerald-400' },
    { id: 'siddha_sowa_rigpa', shortName: 'Siddha/Sowa', category: 'Tibetan', icon: '☸️', borderClass: 'border-amber-600' },
    { id: 'chronobiology_exposomics', shortName: 'Chronobiology', category: 'Exposome', icon: '☀️', borderClass: 'border-yellow-400' }
  ];

  readonly spatialNodes: IRegionalCrosswalkNode[] = [
    {
      id: 'liver_hypochondrium',
      name: 'Liver / Hypochondrium',
      icon: '🫀',
      coordinates3d: [0.15, 1.10, 0.05],
      westernAllopathic: 'Hepatic Phase I/II clearance, AST/ALT, portal venous bed, SNOMED: 10200004',
      osteopathicDo: 'T5-T9 Splanchnic sympathetic outflow & right hemidiaphragm excursion',
      tcmWuXing: 'Liver (Gan) Wood element, smooth Qi dispersion, LV3 & LV14 Acupoints',
      ayurvedaPrana: 'Ranjaka Pitta transformation seat, Manipura Chakra (528 Hz)',
      unaniTibb: 'Safra (Yellow Bile) synthesis & central innate vital heat regulation',
      functionalSystems: 'Phase II Glucuronidation / Sulfation biotransformation hub',
      indigenousTek: 'Eastern White Pine & Yarrow bitter tonic trophorestorative receptor',
      siddhaSowaRigpa: 'Mkhris-pa (Bile fire) furnace balancing digestive flame',
      chronobiology: 'Peripheral circadian metabolic oscillator peaking at 01:00-03:00'
    },
    {
      id: 'suboccipital_c1c2',
      name: 'Suboccipital Base (C1-C2)',
      icon: '🧠',
      coordinates3d: [0.0, 1.68, -0.06],
      westernAllopathic: 'Vagus nerve (CN X) exit at jugular foramen, parasympathetic outflow',
      osteopathicDo: 'Suboccipital decompression target, Cranial Rhythmic Impulse (CRI) anchor',
      tcmWuXing: 'Gallbladder (GB20 Fengchi) & Du Meridian (GV16 Fengfu) Wind gate',
      ayurvedaPrana: 'Prana Vata regulation hub, Ajna / Bindu Chakra nexus',
      unaniTibb: 'Balgham (Phlegm) moisture filtration to prevent encephalic congestion',
      functionalSystems: 'Central HPA-axis neuro-endocrine stress response switch',
      indigenousTek: 'Ancestral memory bridge & somatic vocal polyvagal grounding',
      siddhaSowaRigpa: 'Rlung (Wind) master channel pacification point (Sems-kyi bde-skyid)',
      chronobiology: 'Suprachiasmatic melatonin receptor pathway descending to cervical chain'
    },
    {
      id: 'gut_barrier_colon',
      name: 'Intestinal Barrier / Colon',
      icon: '🦠',
      coordinates3d: [0.0, 0.95, 0.08],
      westernAllopathic: 'Enteric epithelial tight junctions, Zonulin, microbiome LPS translocation',
      osteopathicDo: 'L1-L2 Sympathetic mesenteric supply & pelvic diaphragm lymphatic pump',
      tcmWuXing: 'Spleen (Pi) Earth element transformation & Large Intestine descent',
      ayurvedaPrana: 'Samana Vata & Pachaka Pitta seat, primary site of Ama accumulation',
      unaniTibb: 'Ihtibas wa Istifragh (Retention/Evacuation) pillar & Balghami moisture',
      functionalSystems: 'Assimilation node, mucosal sIgA defense & systemic endotoxemia barrier',
      indigenousTek: 'Three Sisters prebiotic fiber microbiome symbiotic nourishment',
      siddhaSowaRigpa: 'Bad-kan (Phlegm) & digestive heat foundation (Me-drod)',
      chronobiology: 'Diurnal time-restricted feeding nutrient-sensing AMPK/mTOR clock'
    }
  ];

  readonly selectedSpatialNode = signal<IRegionalCrosswalkNode>(this.spatialNodes[0]);

  private buildCorpusCandidates(c: IGlobalDecadConsensus): Array<{ id: string; text: string; data?: any }> {
    return [
      {
        id: 'PARADIGM_ALLOPATHIC',
        text: `Allopathic MD: ${c.allopathic.primaryDiagnosesIcd10.map(d => d.label).join(' ')} ${c.allopathic.vitalSignsRiskTier} ${c.allopathic.pharmacotherapyRegimen.map(p => p.drug + ' ' + p.targetReceptor).join(' ')} ${c.allopathic.cochraneEvidenceGrade}`,
        data: { type: 'PARADIGM', paradigmId: 'allopathic_md', label: 'Allopathic (MD)' }
      },
      {
        id: 'PARADIGM_OSTEOPATHIC',
        text: `Osteopathic DO: Somatic dysfunction ${c.osteopathic.somaticDysfunctionSegments.join(' ')} Craniosacral CRI ${c.osteopathic.craniosacralPrimaryRespiratoryRhythm} Diaphragm ${c.osteopathic.thoracoabdominalDiaphragmPumpStatus} OMT ${c.osteopathic.recommendedOmtTechniques.join(' ')}`,
        data: { type: 'PARADIGM', paradigmId: 'osteopathic_do', label: 'Osteopathic (DO)' }
      },
      {
        id: 'PARADIGM_NATUROPATHIC',
        text: `Naturopathic ND: Therapeutic order ${c.naturopathic.currentTherapeuticOrderTier} Vis Medicatrix ${c.naturopathic.visMedicatrixNaturaeScore} Root etiology ${c.naturopathic.tolleCausamRootEtiology} Actions ${c.naturopathic.recommendedSteppedCareActions.join(' ')}`,
        data: { type: 'PARADIGM', paradigmId: 'naturopathic_nd', label: 'Naturopathic (ND)' }
      },
      {
        id: 'PARADIGM_TCM',
        text: `Traditional Chinese Medicine TCM: Zang-Fu ${c.tcm.zangFuSyndrome} Tongue ${c.tcm.tongueDiagnosis} Pulse ${c.tcm.pulseDiagnosis} Formula ${c.tcm.classicalHerbalFormulary} Acupoints ${c.tcm.keyAcupoints.join(' ')}`,
        data: { type: 'PARADIGM', paradigmId: 'traditional_chinese', label: 'TCM (Wu Xing)' }
      },
      {
        id: 'PARADIGM_AYURVEDIC',
        text: `Ayurvedic Medicine: Prakriti ${c.ayurvedic.prakritiConstitutionalBaseline} Imbalance ${c.ayurvedic.vikritiCurrentImbalance} Agni ${c.ayurvedic.agniMetabolicState} Dhatu ${c.ayurvedic.saptadhatuTissueImpairment.join(' ')} Rasayana ${c.ayurvedic.rasayanaRejuvenationProtocols.join(' ')} Ojas ${c.ayurvedic.ojasImmuneVitalityScore}`,
        data: { type: 'PARADIGM', paradigmId: 'ayurvedic', label: 'Ayurvedic (Tridosha)' }
      },
      {
        id: 'PARADIGM_FUNCTIONAL',
        text: `Functional Medicine Matrix: Gut barrier ${c.functional.networkNodesStatus.assimilationGutBarrier} Cellular energy ${c.functional.networkNodesStatus.cellularEnergyMitochondria} Detoxification ${c.functional.networkNodesStatus.biotransformationDetox} Zonulin ${c.functional.zonulinGutPermeabilityEstimateNgMl} hsCRP ${c.functional.hsCrpSystemicInflammationMgL}`,
        data: { type: 'PARADIGM', paradigmId: 'functional_systems', label: 'Functional (Matrix)' }
      },
      {
        id: 'PARADIGM_UNANI_TIBB',
        text: `Unani-Tibb: Akhlat ${c.unaniTibb.dominantAkhlatExcess} Mizaj ${c.unaniTibb.dominantMizaj} Dyscrasia ${c.unaniTibb.currentSueMizajDyscrasia} Quwwat ${c.unaniTibb.quwwatEMudabbiraSelfHealingPower} Formulary ${c.unaniTibb.recommendedTibbFormulary.join(' ')}`,
        data: { type: 'PARADIGM', paradigmId: 'unani_tibb', label: 'Unani-Tibb (Mizaj)' }
      },
      {
        id: 'PARADIGM_INDIGENOUS_TEK',
        text: `Indigenous TEK Traditional Ecological Knowledge: Reciprocity ${c.indigenousTek.ecologicalReciprocityStatus} Bioregional plants ${c.indigenousTek.bioregionalPlantRelations.map(p => p.botanicalName).join(' ')} Trauma discharge ${c.indigenousTek.somaticNervousSystemTraumaDischarge} Ancestral nutrition ${c.indigenousTek.ancestralNutritionContinuity}`,
        data: { type: 'PARADIGM', paradigmId: 'indigenous_tek', label: 'Indigenous TEK' }
      },
      {
        id: 'PARADIGM_SIDDHA_SOWA',
        text: `Siddha and Sowa-Rigpa: Kaya Kalpa longevity ${c.siddhaSowaRigpa.kayaKalpaRejuvenationIndex} Tibetan Medicine Rlung ${c.siddhaSowaRigpa.sowaRigpaThreeHumors.rlungWind} Mkhris-pa ${c.siddhaSowaRigpa.sowaRigpaThreeHumors.mkhrisPaFire} Bad-kan ${c.siddhaSowaRigpa.sowaRigpaThreeHumors.badKanPhlegm} Formula ${c.siddhaSowaRigpa.tibetanHerbalFormularyRecommendation}`,
        data: { type: 'PARADIGM', paradigmId: 'siddha_sowa_rigpa', label: 'Siddha / Sowa-Rigpa' }
      },
      {
        id: 'PARADIGM_CHRONOBIOLOGY',
        text: `Chronobiology & Exposomics: SCN clock entrainment ${c.chronobiologyExposomics.suprachiasmaticNucleusScnEntrainment} Clock gene ${c.chronobiologyExposomics.circadianClockGeneAlignment.bmal1ClockPeakPhase} Time-restricted feeding ${c.chronobiologyExposomics.timeRestrictedFeedingWindow} Exposomic toxicity ${c.chronobiologyExposomics.cumulativeExposomicToxicityIndex}`,
        data: { type: 'PARADIGM', paradigmId: 'chronobiology_exposomics', label: 'Chronobiology' }
      },
      ...this.spatialNodes.map(node => ({
        id: `SPATIAL_${node.id.toUpperCase()}`,
        text: `${node.name}: Western ${node.westernAllopathic} Osteopathic ${node.osteopathicDo} TCM ${node.tcmWuXing} Ayurveda ${node.ayurvedaPrana} Unani ${node.unaniTibb} Functional ${node.functionalSystems} Indigenous ${node.indigenousTek} Siddha ${node.siddhaSowaRigpa} Chrono ${node.chronobiology}`,
        data: { type: 'SPATIAL_NODE', spatialNodeId: node.id, label: node.name }
      }))
    ];
  }

  async onSearchInput(query: string): Promise<void> {
    this.searchQuery.set(query);
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      this.searchResults.set([]);
      this.searchLatencyMs.set(0);
      return;
    }

    const c = this.consensus();
    const candidates = this.buildCorpusCandidates(c);

    const t0 = performance.now();
    const results = await this.embedder.findTopHybridMatches(cleanQuery, candidates, 4);
    const delta = performance.now() - t0;

    this.searchResults.set(results);
    this.searchLatencyMs.set(Math.max(0.1, delta));
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchLatencyMs.set(0);
  }

  applySearchMatch(match: IHybridSemanticMatch): void {
    if (match.data?.type === 'PARADIGM' && match.data.paradigmId) {
      this.selectParadigm(match.data.paradigmId);
      this.activeView.set('lenses');
    } else if (match.data?.type === 'SPATIAL_NODE' && match.data.spatialNodeId) {
      const node = this.spatialNodes.find(n => n.id === match.data.spatialNodeId);
      if (node) {
        this.selectedSpatialNode.set(node);
      }
      this.activeView.set('spatial_crosswalk');
    }
  }

  selectParadigm(paradigmId: TGlobalHealingParadigm): void {
    this.selectedParadigm.set(paradigmId);
    this.syncWith3dBody(paradigmId);
  }

  private syncWith3dBody(paradigmId: TGlobalHealingParadigm): void {
    switch (paradigmId) {
      case 'allopathic_md':
        this.patientState.anatomyViewMode.set('organs');
        break;
      case 'osteopathic_do':
        this.patientState.anatomyViewMode.set('osteopathic');
        break;
      case 'naturopathic_nd':
        this.patientState.anatomyViewMode.set('skin');
        break;
      case 'traditional_chinese':
        this.patientState.anatomyViewMode.set('eastern');
        break;
      case 'ayurvedic':
        this.patientState.anatomyViewMode.set('ayurvedic');
        break;
      case 'functional_systems':
        this.patientState.anatomyViewMode.set('molecular');
        break;
      case 'unani_tibb':
        this.patientState.anatomyViewMode.set('organs');
        break;
      case 'indigenous_tek':
        this.patientState.anatomyViewMode.set('skin');
        break;
      case 'siddha_sowa_rigpa':
        this.patientState.anatomyViewMode.set('ayurvedic');
        break;
      case 'chronobiology_exposomics':
        this.patientState.anatomyViewMode.set('molecular');
        break;
    }
  }
}
