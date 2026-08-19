import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlphaStemService } from '../../services/alpha-stem.service';

@Component({
  selector: 'app-alpha-stem-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-slate-800 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl font-sans">
      
      <!-- Top Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
            🧬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                AlphaStem: Regenerative Stem Cell Biophysics &amp; AI Suite
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                Pluripotency &amp; Mechanobiology
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Yamanaka Epigenetic Reprogramming • MSC Exosome Paracrine Bio-Reactor • Mechanotransduction Substrate • Quad-Paradigm Longevity
            </p>
          </div>
        </div>

        <!-- Regenerative Potency Score Badge -->
        <div class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <div class="text-right font-mono">
            <div class="text-[10px] text-zinc-400 font-bold uppercase">Regenerative Potency</div>
            <div class="text-lg font-black text-cyan-400">{{ stem.regenerativePotencyScore() }} / 100</div>
          </div>
          <div class="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
        </div>
      </div>

      <!-- 4 Core AlphaStem Modules Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Module 1: Yamanaka Epigenetic Clock Rejuvenation -->
        <div class="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-cyan-500/40 transition shadow-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🧪</span>
              <h3 class="text-sm font-black uppercase tracking-wide text-cyan-300">
                1. Yamanaka Epigenetic Clock &amp; Demethylation
              </h3>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              OSK: Oct4 • Sox2 • Klf4
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono text-xs">
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] text-zinc-400 uppercase">Chronological Age:</span>
              <div class="text-base font-bold text-zinc-200 mt-0.5">{{ stem.chronologicalAgeYears() }} Years</div>
            </div>
            <div class="p-3 bg-slate-950 rounded-xl border" [class.border-emerald-500]="stem.yamanakaFactorsActive()" [class.border-slate-800]="!stem.yamanakaFactorsActive()">
              <span class="text-[10px] text-zinc-400 uppercase">Biological Age:</span>
              <div class="text-base font-bold text-emerald-400 mt-0.5">{{ stem.biologicalAgeYears() }} Years</div>
            </div>
          </div>

          <div class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between text-[11px]">
              <span class="text-zinc-400">CpG DNA Methylation Burden:</span>
              <span class="text-amber-400 font-bold">{{ stem.dnaMethylationPercentage() }}%</span>
            </div>
            <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-700" [style.width.%]="stem.dnaMethylationPercentage()"></div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            @if (!stem.yamanakaFactorsActive()) {
              <button (click)="stem.triggerYamanakaReprogramming(30)"
                      class="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md">
                ⚡ Trigger OSK Epigenetic Reset (30y)
              </button>
            } @else {
              <button (click)="stem.resetReprogramming()"
                      class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700">
                ↺ Restore Baseline Age
              </button>
            }
          </div>
        </div>

        <!-- Module 2: MSC Exosome Paracrine Bio-Reactor -->
        <div class="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-indigo-500/40 transition shadow-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🧫</span>
              <h3 class="text-sm font-black uppercase tracking-wide text-indigo-300">
                2. MSC Exosome Paracrine Bio-Reactor
              </h3>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Extracellular Vesicles
            </span>
          </div>

          <!-- Kinetic SVG Paracrine Vesicle Stream -->
          <div class="h-28 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-between px-6">
            <div class="flex flex-col items-center z-10">
              <div class="w-10 h-10 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-sm animate-pulse">
                🧫
              </div>
              <span class="text-[9px] font-mono text-indigo-300 mt-1 uppercase font-bold">Mesenchymal MSC</span>
            </div>

            <!-- Flowing Exosomes -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
              <circle cx="35%" cy="50%" r="4" fill="#818cf8" class="animate-ping" style="animation-duration: 2s;" />
              <circle cx="50%" cy="40%" r="5" fill="#a855f7" class="animate-pulse" />
              <circle cx="65%" cy="60%" r="3.5" fill="#38bdf8" class="animate-ping" style="animation-duration: 1.5s;" />
            </svg>

            <div class="flex flex-col items-center z-10">
              <div class="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-sm">
                🫀
              </div>
              <span class="text-[9px] font-mono text-emerald-300 mt-1 uppercase font-bold">Tissue Repair</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
            <div class="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <div class="text-zinc-400">Vesicles / &mu;L</div>
              <div class="text-xs font-bold text-indigo-300 mt-0.5">{{ stem.exosomeProfile().vesicleCountPerMicroLiter | number }}</div>
            </div>
            <div class="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <div class="text-zinc-400">miRNA-21 (nM)</div>
              <div class="text-xs font-bold text-cyan-300 mt-0.5">{{ stem.exosomeProfile().mirna21ConcentrationNm }}</div>
            </div>
            <div class="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <div class="text-zinc-400">Anti-Fibrotic Score</div>
              <div class="text-xs font-bold text-emerald-400 mt-0.5">{{ stem.exosomeProfile().antiFibroticScore }} / 100</div>
            </div>
          </div>
        </div>

        <!-- Module 3: Mechanotransduction Substrate Stiffness Niche -->
        <div class="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-amber-500/40 transition shadow-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🕸️</span>
              <h3 class="text-sm font-black uppercase tracking-wide text-amber-300">
                3. Mechanotransduction Niche Substrate Stiffness
              </h3>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Engler Matrix Physics
            </span>
          </div>

          <!-- Interactive Stiffness Slider -->
          <div class="space-y-2 font-mono text-xs">
            <div class="flex justify-between items-center">
              <span class="text-zinc-400">ECM Substrate Elasticity ($E$):</span>
              <span class="text-amber-400 font-bold text-sm">{{ stem.substrateStiffnessKpa() }} kPa</span>
            </div>
            <input 
              type="range" min="0.1" max="40" step="0.5" 
              [value]="stem.substrateStiffnessKpa()" 
              (input)="onStiffnessChange($event)"
              class="w-full accent-amber-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div class="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>0.1 kPa (Brain/Soft)</span>
              <span>12 kPa (Muscle)</span>
              <span>40 kPa (Rigid Bone)</span>
            </div>
          </div>

          <!-- Dynamic Lineage Probabilities -->
          <div class="space-y-2 font-mono text-xs">
            <div class="text-[11px] text-zinc-300 font-bold">Lineage Differentiation Probability:</div>
            
            <div class="space-y-1">
              <div class="flex justify-between text-[10px]">
                <span class="text-cyan-400 font-bold">🧠 Neurogenic (Brain/Neurons):</span>
                <span>{{ stem.lineageProbability().neurogenic }}%</span>
              </div>
              <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-cyan-400 transition-all duration-300" [style.width.%]="stem.lineageProbability().neurogenic"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[10px]">
                <span class="text-fuchsia-400 font-bold">💪 Myogenic (Muscle/Cardiomyocyte):</span>
                <span>{{ stem.lineageProbability().myogenic }}%</span>
              </div>
              <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-fuchsia-400 transition-all duration-300" [style.width.%]="stem.lineageProbability().myogenic"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[10px]">
                <span class="text-amber-400 font-bold">🦴 Osteogenic (Cortical Bone):</span>
                <span>{{ stem.lineageProbability().osteogenic }}%</span>
              </div>
              <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 transition-all duration-300" [style.width.%]="stem.lineageProbability().osteogenic"></div>
              </div>
            </div>
          </div>

          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-zinc-300">
            <span class="text-zinc-500 uppercase font-bold">Dominant Fate:</span>
            <span class="text-amber-400 font-bold ml-1.5">{{ stem.lineageProbability().dominantLineage }}</span>
          </div>
        </div>

        <!-- Module 4: Quad-Paradigm Longevity & Stem Cell Reservoir -->
        <div class="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-emerald-500/40 transition shadow-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏛️</span>
              <h3 class="text-sm font-black uppercase tracking-wide text-emerald-300">
                4. Quad-Paradigm Regenerative Reservoir
              </h3>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Cross-Tradition Synthesis
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono text-xs">
            <!-- Allopathic Telomeres -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div class="flex justify-between items-center text-[10px] text-zinc-400">
                <span>🩺 Allopathic</span>
                <span class="text-cyan-400 font-bold">{{ stem.telomereLengthKilobases() }} kb</span>
              </div>
              <div class="text-[11px] font-bold text-zinc-200 mt-1">Telomere Lifespan</div>
            </div>

            <!-- Ayurvedic Shukra / Ojas -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div class="flex justify-between items-center text-[10px] text-zinc-400">
                <span>🪷 Ayurvedic</span>
                <span class="text-amber-400 font-bold">{{ stem.ayurvedicShukraDhatuOjas() }}%</span>
              </div>
              <div class="text-[11px] font-bold text-amber-200 mt-1">Shukra &amp; Param Ojas</div>
            </div>

            <!-- TCM Yuan Jing -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div class="flex justify-between items-center text-[10px] text-zinc-400">
                <span>🌿 TCM Essence</span>
                <span class="text-emerald-400 font-bold">{{ stem.tcmPreHeavenYuanJing() }}%</span>
              </div>
              <div class="text-[11px] font-bold text-emerald-200 mt-1">Pre-Heaven Yuan Jing</div>
            </div>

            <!-- Osteopathic Piezoelectricity -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div class="flex justify-between items-center text-[10px] text-zinc-400">
                <span>🦴 Osteopathic</span>
                <span class="text-purple-400 font-bold">{{ stem.osteopathicPiezoElectricChargeMicrovolts() }} &mu;V</span>
              </div>
              <div class="text-[11px] font-bold text-purple-200 mt-1">Fascial Piezoelectric</div>
            </div>
          </div>

          <button (click)="stem.nourishRasayanaJing(8)"
                  class="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md">
            🌿 Nourish via Rasayanas &amp; Kidney Jing Tonics
          </button>
        </div>

      </div>

    </div>
  `
})
export class AlphaStemViewerComponent {
  stem = inject(AlphaStemService);

  onStiffnessChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.stem.setSubstrateStiffness(val);
  }
}
