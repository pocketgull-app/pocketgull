import { Component, signal, computed, ChangeDetectionStrategy, output, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { kachinkaAudio } from '../../utils/kachinka-audio.service';

export type TEarthBiophysicsLens = 'bioelectric' | 'photobiology' | 'mycelial' | 'interoception';

export interface IMineralDepletionBenchmark {
  mineral: string;
  chemicalSymbol: string;
  ancestralTarget: string;
  modernDepletionPercent: number;
  cellularRole: string;
}

export interface ISensationDeEscalation {
  id: string;
  sensationTitle: string;
  colloquialFear: string;
  physiologicalMechanism: string;
  salutogenicAction: string;
  priorPredictionError: number;
  posteriorCalibratedError: number;
}

@Component({
  selector: 'app-earth-biophysics-somatic-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="asModal() ? 'fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto' : 'w-full'"
      role="region"
      aria-label="Earth Biophysics and Somatic Hub"
    >
      <div class="relative w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        <!-- Header Banner -->
        <header class="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-emerald-950/40 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xl font-bold shadow-inner">
              🌍
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base sm:text-lg font-bold text-zinc-100 font-mono tracking-wide">
                  Earth Biophysics &amp; Somatic Frontiers Hub
                </h2>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-md font-bold">
                  Salutogenic Paradigm
                </span>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-md font-bold">
                  Exploratory In Silico Model • Non-Diagnostic
                </span>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-md font-bold">
                  Zero In Silico Biohazard
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Grounding clinical care in cellular bioelectricity, mitochondrial photobiology, mycelial minerals, and interoceptive predictive coding.
              </p>
            </div>
          </div>

          @if (asModal()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="closeModal.emit()"
                class="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 flex items-center justify-center text-sm font-bold transition shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Close Earth Biophysics Hub"
              >
                ✕
              </button>
            </div>
          }
        </header>

        <!-- 4-Lens Navigation Ribbon -->
        <nav class="bg-zinc-900/90 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin" aria-label="Biophysics Lenses">
          <button
            type="button"
            (click)="setLens('bioelectric')"
            [class.bg-emerald-600]="activeLens() === 'bioelectric'"
            [class.text-white]="activeLens() === 'bioelectric'"
            [class.border-emerald-400]="activeLens() === 'bioelectric'"
            [class.text-zinc-400]="activeLens() !== 'bioelectric'"
            [class.bg-zinc-950]="activeLens() !== 'bioelectric'"
            [class.border-zinc-800]="activeLens() !== 'bioelectric'"
            class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>⚡</span>
            <span>1. Bioelectric V_mem (Levin)</span>
          </button>

          <button
            type="button"
            (click)="setLens('photobiology')"
            [class.bg-amber-600]="activeLens() === 'photobiology'"
            [class.text-white]="activeLens() === 'photobiology'"
            [class.border-amber-400]="activeLens() === 'photobiology'"
            [class.text-zinc-400]="activeLens() !== 'photobiology'"
            [class.bg-zinc-950]="activeLens() !== 'photobiology'"
            [class.border-zinc-800]="activeLens() !== 'photobiology'"
            class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>☀️</span>
            <span>2. Photobiology &amp; Mitochondrial NIR</span>
          </button>

          <button
            type="button"
            (click)="setLens('mycelial')"
            [class.bg-teal-600]="activeLens() === 'mycelial'"
            [class.text-white]="activeLens() === 'mycelial'"
            [class.border-teal-400]="activeLens() === 'mycelial'"
            [class.text-zinc-400]="activeLens() !== 'mycelial'"
            [class.bg-zinc-950]="activeLens() !== 'mycelial'"
            [class.border-zinc-800]="activeLens() !== 'mycelial'"
            class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>🍄</span>
            <span>3. Soil Mycelium &amp; Ergothioneine</span>
          </button>

          <button
            type="button"
            (click)="setLens('interoception')"
            [class.bg-indigo-600]="activeLens() === 'interoception'"
            [class.text-white]="activeLens() === 'interoception'"
            [class.border-indigo-400]="activeLens() === 'interoception'"
            [class.text-zinc-400]="activeLens() !== 'interoception'"
            [class.bg-zinc-950]="activeLens() !== 'interoception'"
            [class.border-zinc-800]="activeLens() !== 'interoception'"
            class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>🫁</span>
            <span>4. Interoception &amp; Free Energy (0.1 Hz)</span>
          </button>
        </nav>

        <!-- Main Workspace -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          <!-- ==================== LENS 1: BIOELECTRIC MEMBRANE MAP ==================== -->
          @if (activeLens() === 'bioelectric') {
            <section class="space-y-4" aria-label="Bioelectric Membrane Potential Explorer">
              
              <!-- Description Card -->
              <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full status-dot bg-emerald-400"></span>
                    Michael Levin Morphogenetic Bioelectricity Engine
                  </h3>
                  <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Somatic tissues communicate via resting membrane voltage gradients (<span class="font-math">V_mem</span>). Depolarization (<span class="font-math">&gt; -30 mV</span>) triggers embryonic plasticity or oncogenesis; healthy polarized cells maintain resting potentials (<span class="font-math">&le; -70 mV</span>).
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-black/50 border border-zinc-800 font-mono text-xs shrink-0">
                  <span class="text-[10px] text-zinc-500 block uppercase">Goldman-Hodgkin-Katz Result:</span>
                  <span class="text-base font-bold font-math" [ngClass]="ghkVoltageMv() <= -65 ? 'text-emerald-400' : (ghkVoltageMv() <= -40 ? 'text-amber-400' : 'text-rose-400')">
                    V_mem = {{ ghkVoltageMv() | number:'1.1-1' }} mV
                  </span>
                </div>
              </div>

              <!-- Interactive Voltage Slider & Controls -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                <!-- Voltage Dial & State Classification -->
                <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <label for="voltage-dial" class="text-xs font-bold text-zinc-200 uppercase font-mono">
                      Cell Membrane Voltage Dial:
                    </label>
                    <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-zinc-800 text-teal-300">
                      {{ membraneVoltageMv() }} mV
                    </span>
                  </div>

                  <input
                    id="voltage-dial"
                    type="range"
                    min="-90"
                    max="-15"
                    step="1"
                    [value]="membraneVoltageMv()"
                    (input)="onVoltageChange($event)"
                    class="w-full accent-emerald-500 cursor-pointer"
                    aria-label="Resting membrane voltage slider"
                  />

                  <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>-90 mV (Quiescent)</span>
                    <span>-50 mV (Plastic)</span>
                    <span>-15 mV (Depolarized)</span>
                  </div>

                  <div class="p-3 rounded-xl border transition-all"
                       [ngClass]="cellStateClassification().alertClass">
                    <span class="text-[10px] uppercase font-bold tracking-wider font-mono block">Physiological Phenotype:</span>
                    <h4 class="text-xs font-bold mt-0.5">{{ cellStateClassification().title }}</h4>
                    <p class="text-[11px] mt-1 leading-snug font-sans opacity-90">
                      {{ cellStateClassification().description }}
                    </p>
                  </div>
                </div>

                <!-- Live Direct Curve SVG Cell Membrane Diagram -->
                <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between lg:col-span-2 space-y-3">
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span class="text-xs font-bold font-mono text-zinc-300">
                      Membrane Ion Flux &amp; Kir Channel Architecture
                    </span>
                    <span class="text-[10px] font-mono text-zinc-400">
                      Na+/K+-ATPase Ratio 3:2
                    </span>
                  </div>

                  <!-- SVG Membrane Visualizer -->
                  <div class="w-full h-44 bg-zinc-900/40 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <svg class="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                      <!-- Extracellular Fluid Area -->
                      <rect x="0" y="0" width="500" height="50" fill="#064e3b" fill-opacity="0.15" />
                      <text x="10" y="25" fill="#34d399" font-size="10" font-family="monospace">EXTRACELLULAR: [Na+]o = 142 mM • [K+]o = {{ extracellularK() }} mM</text>

                      <!-- Lipid Bilayer Direct Curves -->
                      <path d="M 0 55 C 100 52, 200 58, 300 54 C 400 50, 500 56, 500 55 L 500 95 C 400 98, 300 92, 200 96 C 100 100, 0 94, 0 95 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
                      
                      <!-- Ion Channel Pore 1: Kir Inward Rectifier -->
                      <rect x="140" y="48" width="28" height="54" rx="4" fill="#0d9488" stroke="#14b8a6" stroke-width="1.5" />
                      <text x="144" y="80" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">Kir</text>

                      <!-- Ion Channel Pore 2: Na+/K+-ATPase Pump -->
                      <rect x="310" y="46" width="34" height="58" rx="4" fill="#6366f1" stroke="#818cf8" stroke-width="1.5" />
                      <text x="314" y="80" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">Na/K</text>

                      <!-- Intracellular Cytosol Area -->
                      <rect x="0" y="100" width="500" height="60" fill="#1e1b4b" fill-opacity="0.2" />
                      <text x="10" y="145" fill="#a5b4fc" font-size="10" font-family="monospace">CYTOSOL: [K+]i = {{ intracellularK() }} mM • [Na+]i = 14 mM (V_mem = {{ membraneVoltageMv() }} mV)</text>
                    </svg>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span class="text-[9px] text-zinc-500 block">Gap Junction (Gj):</span>
                      <span class="font-bold text-teal-300 font-algo">{{ membraneVoltageMv() <= -60 ? 'Coupled (1.2 nS)' : 'Uncoupled (0.1 nS)' }}</span>
                    </div>
                    <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span class="text-[9px] text-zinc-500 block">Resting State:</span>
                      <span class="font-bold text-emerald-300 font-algo">{{ membraneVoltageMv() <= -65 ? 'Polarized' : 'Depolarized' }}</span>
                    </div>
                    <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span class="text-[9px] text-zinc-500 block">Morphogenesis:</span>
                      <span class="font-bold text-amber-300 font-algo">{{ membraneVoltageMv() > -45 ? 'De-differentiating' : 'Form Stable' }}</span>
                    </div>
                    <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span class="text-[9px] text-zinc-500 block">Mineral Trigger:</span>
                      <span class="font-bold text-indigo-300 font-chem">Mg2+ Dependent</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          }

          <!-- ==================== LENS 2: PHOTOBIOLOGY & MITOCHONDRIAL NIR ==================== -->
          @if (activeLens() === 'photobiology') {
            <section class="space-y-4" aria-label="Planetary Photobiology and NIR Simulator">
              
              <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full status-dot bg-amber-400"></span>
                    Mitochondrial Photobiology &amp; Subcellular Melatonin
                  </h3>
                  <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Over 50% of solar irradiance is invisible Near-Infrared (<span class="font-math">NIR 670–850 nm</span>), which penetrates deep tissue to stimulate <strong class="text-amber-300">Cytochrome c Oxidase (Complex IV)</strong>. This powers the synthesis of 95% of the body's melatonin <em class="text-emerald-300">inside the mitochondria</em>, protecting cells from oxidative stress.
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-black/50 border border-zinc-800 font-mono text-xs shrink-0 text-right">
                  <span class="text-[10px] text-zinc-500 block uppercase">Subcellular Melatonin Yield:</span>
                  <span class="text-base font-bold text-amber-400 font-math">
                    {{ photobiologyMetrics().mitochondrialMelatoninYieldPercent }}% of Max
                  </span>
                </div>
              </div>

              <!-- Solar Environment Selector -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                @for (c of solarProfiles; track c.id) {
                  <button
                    type="button"
                    (click)="selectedSolarCondition.set(c.id)"
                    [class.bg-amber-600]="selectedSolarCondition() === c.id"
                    [class.text-white]="selectedSolarCondition() === c.id"
                    [class.border-amber-400]="selectedSolarCondition() === c.id"
                    [class.text-zinc-400]="selectedSolarCondition() !== c.id"
                    [class.bg-zinc-900]="selectedSolarCondition() !== c.id"
                    [class.border-zinc-800]="selectedSolarCondition() !== c.id"
                    class="p-2.5 rounded-xl border transition text-left cursor-pointer hover:bg-zinc-800 flex flex-col justify-between min-h-[56px] focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span class="font-bold flex items-center gap-1.5">
                      <span>{{ c.icon }}</span>
                      <span>{{ c.label }}</span>
                    </span>
                    <span class="text-[10px] opacity-80 mt-1">NIR: {{ c.nirPercent }}%</span>
                  </button>
                }
              </div>

              <!-- Spectrum Comparison Matrix -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                  <h4 class="text-xs font-bold font-mono uppercase text-zinc-300">
                    Spectral Irradiance Distribution
                  </h4>
                  <div class="space-y-2 text-xs font-mono">
                    <div>
                      <div class="flex justify-between text-[11px] mb-1">
                        <span class="text-red-400">Near-Infrared (670–850 nm):</span>
                        <span class="font-bold text-red-300 font-math">{{ photobiologyMetrics().nirPercent }}%</span>
                      </div>
                      <div class="w-full h-2 rounded-xs bg-zinc-800 overflow-hidden">
                        <div class="h-full bg-red-500 transition-all duration-300" [style.width.%]="photobiologyMetrics().nirPercent"></div>
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-[11px] mb-1">
                        <span class="text-amber-400">Visible Warm (500–650 nm):</span>
                        <span class="font-bold text-amber-300 font-math">{{ photobiologyMetrics().visiblePercent }}%</span>
                      </div>
                      <div class="w-full h-2 rounded-xs bg-zinc-800 overflow-hidden">
                        <div class="h-full bg-amber-400 transition-all duration-300" [style.width.%]="photobiologyMetrics().visiblePercent"></div>
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-[11px] mb-1">
                        <span class="text-blue-400">Melanopic Blue (450–480 nm):</span>
                        <span class="font-bold text-blue-300 font-math">{{ photobiologyMetrics().bluePercent }}%</span>
                      </div>
                      <div class="w-full h-2 rounded-xs bg-zinc-800 overflow-hidden">
                        <div class="h-full bg-blue-500 transition-all duration-300" [style.width.%]="photobiologyMetrics().bluePercent"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                  <h4 class="text-xs font-bold font-mono uppercase text-zinc-300">
                    Complex IV CCO &amp; ATP Dynamics
                  </h4>
                  <div class="p-3 rounded-xl bg-black/40 border border-zinc-800 text-xs font-mono space-y-1.5">
                    <div class="flex justify-between">
                      <span class="text-zinc-500">CCO Activation:</span>
                      <span class="font-bold text-amber-300">{{ photobiologyMetrics().ccoActivationLevel }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">ROS Dissipation:</span>
                      <span class="font-bold text-emerald-400">{{ photobiologyMetrics().rosDissipation }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Melanopic EDI:</span>
                      <span class="font-bold font-math" [ngClass]="photobiologyMetrics().melanopicEdiLux > 100 ? 'text-amber-400' : 'text-emerald-400'">
                        {{ photobiologyMetrics().melanopicEdiLux }} lx
                      </span>
                    </div>
                  </div>
                  <p class="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {{ photobiologyMetrics().guidanceText }}
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 class="text-xs font-bold font-mono uppercase text-zinc-300">
                      Circadian &amp; Scotopic Defense
                    </h4>
                    <p class="text-xs text-zinc-400 mt-1">
                      CIE S 026:2018 requires nocturnal <span class="font-math">mEDI &lt; 10 lx</span> to prevent melatonin suppression.
                    </p>
                  </div>
                  <div class="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200">
                    <span class="font-bold font-mono block">⚠️ Screen Spectrum Alert:</span>
                    Modern 4000K screens omit NIR entirely while peaking in blue. Switch to PocketGull Scotopic 650nm Red Mode after sunset.
                  </div>
                </div>

              </div>
            </section>
          }

          <!-- ==================== LENS 3: SOIL MYCELIUM & ERGOTHIONEINE ==================== -->
          @if (activeLens() === 'mycelial') {
            <section class="space-y-4" aria-label="Soil Mycelium and Mineral Axis Explorer">
              
              <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full status-dot bg-teal-400"></span>
                    The Soil-to-Gut Axis: Fungi, Minerals &amp; Ergothioneine
                  </h3>
                  <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Humans cannot synthesize <strong class="text-teal-300 font-chem">Ergothioneine (C9H15N3O2S)</strong>, yet possess a dedicated, highly conserved transporter (<strong class="text-amber-300">OCTN1 / SLC22A4</strong>) to concentrate it into mitochondria. Ergothioneine is produced exclusively by soil fungi and cyanobacteria.
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-black/50 border border-zinc-800 font-mono text-xs shrink-0 text-right">
                  <span class="text-[10px] text-zinc-500 block uppercase">OCTN1 Saturation:</span>
                  <span class="text-base font-bold text-teal-400 font-math">
                    {{ octn1SaturationPercent() | number:'1.0-0' }}% Saturated
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                <!-- Ergothioneine Intake Slider & Michaelis-Menten Curve -->
                <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <label for="ergo-dial" class="text-xs font-bold text-zinc-200 uppercase font-mono">
                      Daily Ergothioneine Intake:
                    </label>
                    <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-zinc-800 text-teal-300 font-math">
                      {{ ergoIntakeMg() }} mg/day
                    </span>
                  </div>

                  <input
                    id="ergo-dial"
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    [value]="ergoIntakeMg()"
                    (input)="onErgoChange($event)"
                    class="w-full accent-teal-500 cursor-pointer"
                    aria-label="Ergothioneine daily dosage slider"
                  />

                  <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>0 mg (Depleted)</span>
                    <span>5 mg (Dietary)</span>
                    <span>20 mg (Optimal)</span>
                  </div>

                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                    <span class="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Food Sources:</span>
                    <ul class="text-[11px] text-zinc-300 space-y-1 font-sans">
                      <li>🍄 <strong>Golden Oyster:</strong> ~7.0 mg / 100g</li>
                      <li>🍄 <strong>Porcini:</strong> ~5.2 mg / 100g</li>
                      <li>🍄 <strong>Shiitake:</strong> ~2.1 mg / 100g</li>
                      <li>🌾 <strong>Pastured Oats (Fungal soil):</strong> ~0.4 mg</li>
                    </ul>
                  </div>
                </div>

                <!-- Industrialized Soil Mineral Depletion Matrix -->
                <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 lg:col-span-2 space-y-3">
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 class="text-xs font-bold font-mono text-zinc-300 uppercase">
                      Topsoil Mineral Depletion Audit (1950 vs Present)
                    </h4>
                    <span class="text-[10px] font-mono text-rose-400">
                      Ancestral Mineral Deficit
                    </span>
                  </div>

                  <div class="space-y-2.5">
                    @for (m of mineralBenchmarks; track m.mineral) {
                      <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                        <div class="flex items-center gap-2">
                          <span class="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-mono font-bold text-xs font-chem">
                            {{ m.chemicalSymbol }}
                          </span>
                          <div>
                            <span class="font-bold text-zinc-200">{{ m.mineral }}</span>
                            <span class="text-[10px] text-zinc-500 block">{{ m.cellularRole }}</span>
                          </div>
                        </div>

                        <div class="text-right font-mono">
                          <span class="text-rose-400 font-bold block text-xs">
                            -{{ m.modernDepletionPercent }}% Depleted
                          </span>
                          <span class="text-[10px] text-zinc-500">
                            Target: {{ m.ancestralTarget }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

              </div>
            </section>
          }

          <!-- ==================== LENS 4: INTEROCEPTION & FREE ENERGY ==================== -->
          @if (activeLens() === 'interoception') {
            <section class="space-y-4" aria-label="Interoceptive Predictive Coding and 0.1 Hz Pacer">
              
              <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full status-dot bg-indigo-400"></span>
                    Karl Friston Free Energy &amp; Interoceptive Calibration
                  </h3>
                  <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                    The brain is a predictive engine. In chronic illness, predictive miscalibration in the insular cortex mistakes benign somatic sensations for emergencies. Parasympathetic <strong class="text-indigo-300">0.1 Hz Mayer wave pacing</strong> recalibrates prediction errors (<span class="font-math">&epsilon; = y - &mu;</span>).
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-black/50 border border-zinc-800 font-mono text-xs shrink-0 text-right">
                  <span class="text-[10px] text-zinc-500 block uppercase">Calibrated Error Gap:</span>
                  <span class="text-base font-bold text-indigo-400 font-math">
                    &epsilon; = {{ currentSensation().posteriorCalibratedError }}% (Low Surprise)
                  </span>
                </div>
              </div>

              <!-- Sensation De-Escalation Selector -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                @for (s of sensations; track s.id) {
                  <button
                    type="button"
                    (click)="selectedSensationId.set(s.id)"
                    [class.bg-indigo-600]="selectedSensationId() === s.id"
                    [class.text-white]="selectedSensationId() === s.id"
                    [class.border-indigo-400]="selectedSensationId() === s.id"
                    [class.text-zinc-400]="selectedSensationId() !== s.id"
                    [class.bg-zinc-900]="selectedSensationId() !== s.id"
                    [class.border-zinc-800]="selectedSensationId() !== s.id"
                    class="p-2.5 rounded-xl border transition text-left cursor-pointer hover:bg-zinc-800 min-h-[50px] focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <span class="font-bold block">{{ s.sensationTitle }}</span>
                    <span class="text-[10px] opacity-75 truncate block mt-0.5">{{ s.colloquialFear }}</span>
                  </button>
                }
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                <!-- Physiological De-Escalation Breakdown -->
                <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3 font-sans">
                  <h4 class="text-xs font-bold font-mono uppercase text-indigo-300 flex items-center gap-2">
                    <span>💡</span> Physiological Reality (Zero Medical Gaslighting)
                  </h4>
                  
                  <div class="p-3 rounded-xl bg-black/40 border border-zinc-800 text-xs space-y-1.5">
                    <span class="text-[10px] font-mono text-rose-400 uppercase font-bold block">Patient Fear:</span>
                    <p class="text-zinc-300 italic">"{{ currentSensation().colloquialFear }}"</p>
                  </div>

                  <div class="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-1.5">
                    <span class="text-[10px] font-mono text-indigo-300 uppercase font-bold block">True Somatic Mechanism:</span>
                    <p class="text-zinc-200 leading-relaxed">{{ currentSensation().physiologicalMechanism }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1.5">
                    <span class="text-[10px] font-mono text-emerald-300 uppercase font-bold block">Salutogenic Pacing Action:</span>
                    <p class="text-emerald-100 leading-relaxed">{{ currentSensation().salutogenicAction }}</p>
                  </div>
                </div>

                <!-- 0.1 Hz Mayer Wave Parasympathetic Breathing Pacer -->
                <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-between text-center space-y-4">
                  <div class="w-full flex items-center justify-between border-b border-zinc-800 pb-2 font-mono text-xs">
                    <span class="text-zinc-300 font-bold">0.1 Hz Mayer Wave Pacer (6 breaths/min)</span>
                    <span class="text-teal-400 font-music">Vagal Entrainment</span>
                  </div>

                  <!-- Animated Breathing Ring (Direct Bezier Expansion) -->
                  <div class="relative w-36 h-36 flex items-center justify-center my-2">
                    <div
                      class="absolute rounded-2xl border-2 transition-all duration-1000 ease-out"
                      [ngClass]="pacerPhase() === 'inhale' ? 'border-teal-400 bg-teal-500/10 scale-110 shadow-lg shadow-teal-500/20' : 'border-indigo-400 bg-indigo-500/10 scale-90'"
                      style="width: 120px; height: 120px;"
                    ></div>
                    <div class="z-10 font-mono">
                      <span class="text-xs uppercase font-bold block" [ngClass]="pacerPhase() === 'inhale' ? 'text-teal-300' : 'text-indigo-300'">
                        {{ pacerPhase() === 'inhale' ? 'Inhale (4s)' : 'Exhale (6s)' }}
                      </span>
                      <span class="text-xl font-bold text-zinc-100 mt-1 block font-math">
                        {{ pacerSecond() }}s
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      (click)="togglePacer()"
                      class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]"
                      [ngClass]="isPacerRunning() ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'"
                    >
                      <span>{{ isPacerRunning() ? '⏹ Pause Pacer' : '▶ Start 0.1 Hz Pacer' }}</span>
                    </button>
                  </div>
                  <p class="text-[10px] text-zinc-500 font-mono">
                    10-second respiratory cycle stimulates acetylcholine release at the sinoatrial node.
                  </p>
                </div>

              </div>
            </section>
          }

        </main>

        <!-- Footer Bar -->
        <footer class="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full status-dot bg-emerald-400"></span>
            <span>PocketShoal Direct Curves • CIE S 026:2018 Scotopic Compliant</span>
          </div>
          <div class="flex items-center gap-3">
            <span>Michael Levin Bioelectricity</span>
            <span>•</span>
            <span>Karl Friston Active Inference</span>
          </div>
        </footer>

      </div>
    </div>
  `
})
export class EarthBiophysicsSomaticHubComponent implements OnDestroy {
  public closeModal = output<void>();
  public asModal = input<boolean>(false);

  public activeLens = signal<TEarthBiophysicsLens>('bioelectric');

  // Lens 1: Bioelectricity
  public membraneVoltageMv = signal<number>(-70);
  public extracellularK = signal<number>(4.5);
  public intracellularK = signal<number>(140);

  // Lens 2: Photobiology
  public selectedSolarCondition = signal<'noon' | 'golden_hour' | 'sunrise' | 'indoor_led' | 'night'>('golden_hour');

  // Lens 3: Mycelial
  public ergoIntakeMg = signal<number>(5);

  // Lens 4: Interoception
  public selectedSensationId = signal<string>('palpitations');
  public isPacerRunning = signal<boolean>(false);
  public pacerSecond = signal<number>(0);
  private pacerIntervalId: ReturnType<typeof setInterval> | null = null;

  public setLens(lens: TEarthBiophysicsLens): void {
    this.activeLens.set(lens);
    kachinkaAudio.playWoodBeadClick(1.0);
  }

  public onVoltageChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.membraneVoltageMv.set(val);
  }

  public onErgoChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.ergoIntakeMg.set(val);
  }

  // GHK Calculation
  public ghkVoltageMv = computed(() => {
    const ko = this.extracellularK();
    const ki = this.intracellularK();
    const nao = 142;
    const nai = 14;
    const pk = 1.0;
    const pna = 0.04;
    const num = pk * ko + pna * nao;
    const den = pk * ki + pna * nai;
    return 61.5 * Math.log10(num / den);
  });

  public cellStateClassification = computed(() => {
    const v = this.membraneVoltageMv();
    if (v <= -65) {
      return {
        title: 'Differentiated & Polarized (Quiescent Homeostasis)',
        description: 'Optimal mature cell state. Kir channels open, intracellular K+ high, DNA repair and metabolic efficiency intact.',
        alertClass: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
      };
    } else if (v <= -45) {
      return {
        title: 'Plastic & Regenerative (Morphogenetic Repair Mode)',
        description: 'Transient regenerative potential. Gap junctions open, directing patterned tissue regeneration and wound closure.',
        alertClass: 'bg-amber-950/40 border-amber-800/60 text-amber-200'
      };
    } else {
      return {
        title: 'Depolarized & Proliferative (Senescence / Epigenetic Risk)',
        description: 'Persistent depolarization uncouples gap junctions. Associated with chronic inflammation, stem cell exhaustion, or loss of morphological pattern memory.',
        alertClass: 'bg-rose-950/40 border-rose-800/60 text-rose-200'
      };
    }
  });

  // Solar Profiles
  public readonly solarProfiles = [
    { id: 'noon' as const, label: 'Midday Solar', icon: '☀️', nirPercent: 52 },
    { id: 'golden_hour' as const, label: 'Golden Hour', icon: '🌅', nirPercent: 58 },
    { id: 'sunrise' as const, label: 'Dawn Horizon', icon: '🌄', nirPercent: 48 },
    { id: 'indoor_led' as const, label: 'Indoor 4000K LED', icon: '💡', nirPercent: 2 },
    { id: 'night' as const, label: 'Nocturnal Scotopic', icon: '🌙', nirPercent: 0 }
  ];

  public photobiologyMetrics = computed(() => {
    const cond = this.selectedSolarCondition();
    switch (cond) {
      case 'noon':
        return {
          nirPercent: 52,
          visiblePercent: 30,
          bluePercent: 18,
          ccoActivationLevel: 'Peak (100%)',
          rosDissipation: 'High Endogenous Shield',
          melanopicEdiLux: 850,
          mitochondrialMelatoninYieldPercent: 92,
          guidanceText: 'High ambient brightness entrains central SCN master clock; deep NIR balances UV exposure.'
        };
      case 'golden_hour':
        return {
          nirPercent: 58,
          visiblePercent: 36,
          bluePercent: 6,
          ccoActivationLevel: 'Therapeutic High (95%)',
          rosDissipation: 'Maximum Subcellular Melatonin',
          melanopicEdiLux: 65,
          mitochondrialMelatoninYieldPercent: 98,
          guidanceText: 'Optimal wavelength balance: maximal near-infrared penetrance with low melanopic disruption.'
        };
      case 'sunrise':
        return {
          nirPercent: 48,
          visiblePercent: 42,
          bluePercent: 10,
          ccoActivationLevel: 'Moderate (70%)',
          rosDissipation: 'Circadian Awakening Signal',
          melanopicEdiLux: 120,
          mitochondrialMelatoninYieldPercent: 78,
          guidanceText: 'Sets the cortisol awakening response and synchronizes peripheral organ clocks.'
        };
      case 'indoor_led':
        return {
          nirPercent: 2,
          visiblePercent: 40,
          bluePercent: 58,
          ccoActivationLevel: 'Near-Zero (Mitochondrial Starvation)',
          rosDissipation: 'Compromised (Oxidative Stress)',
          melanopicEdiLux: 210,
          mitochondrialMelatoninYieldPercent: 8,
          guidanceText: 'Severe NIR deficit. Peak 450nm blue light causes retinal strain without mitochondrial antioxidant protection.'
        };
      case 'night':
        return {
          nirPercent: 0,
          visiblePercent: 0,
          bluePercent: 0,
          ccoActivationLevel: 'Resting (Pineal Active)',
          rosDissipation: 'Nighttime Autophagy & Glymphatic',
          melanopicEdiLux: 1,
          mitochondrialMelatoninYieldPercent: 100,
          guidanceText: 'Total melanopic suppression allows deep NREM slow-wave sleep and glymphatic brain clearance.'
        };
    }
  });

  // Ergothioneine OCTN1 Saturation (Michaelis-Menten: Km ~ 4.2 mg)
  public octn1SaturationPercent = computed(() => {
    const s = this.ergoIntakeMg();
    const km = 4.2;
    return (s / (km + s)) * 100;
  });

  public readonly mineralBenchmarks: IMineralDepletionBenchmark[] = [
    {
      mineral: 'Magnesium',
      chemicalSymbol: 'Mg2+',
      ancestralTarget: '400–500 mg/day',
      modernDepletionPercent: 48,
      cellularRole: 'ATP-chelation, DNA repair, Kir channel voltage stabilization'
    },
    {
      mineral: 'Zinc',
      chemicalSymbol: 'Zn2+',
      ancestralTarget: '15–20 mg/day',
      modernDepletionPercent: 56,
      cellularRole: 'Superoxide dismutase, thymic peptide synthesis'
    },
    {
      mineral: 'Boron',
      chemicalSymbol: 'B',
      ancestralTarget: '3–6 mg/day',
      modernDepletionPercent: 62,
      cellularRole: 'Cell wall stabilization, steroid hormone modulation'
    },
    {
      mineral: 'Lithium',
      chemicalSymbol: 'Li+',
      ancestralTarget: '1–2 mg/day',
      modernDepletionPercent: 71,
      cellularRole: 'GSK-3beta regulation, BDNF neurogenesis support'
    },
    {
      mineral: 'Silica',
      chemicalSymbol: 'SiO2',
      ancestralTarget: '20–30 mg/day',
      modernDepletionPercent: 39,
      cellularRole: 'Collagen cross-linking, glycosaminoglycan matrix'
    }
  ];

  // Interoception Sensations
  public readonly sensations: ISensationDeEscalation[] = [
    {
      id: 'palpitations',
      sensationTitle: 'Post-Meal Fluttering',
      colloquialFear: 'My heart is failing or having dangerous arrhythmias.',
      physiologicalMechanism: 'Post-prandial splanchnic vasodilation pools blood in the gut, eliciting a natural, compensatory sinus tachycardia to maintain cerebral perfusion.',
      salutogenicAction: 'Sit upright, sip room-temperature water with electrolytes, and practice 0.1 Hz breathing for 3 minutes.',
      priorPredictionError: 85,
      posteriorCalibratedError: 12
    },
    {
      id: 'lightheadedness',
      sensationTitle: 'Orthostatic Dizziness',
      colloquialFear: 'I am going to faint or my brain is losing oxygen.',
      physiologicalMechanism: 'Transient 3-to-5 second baroreflex adjustment latency when gravity pulls venous blood into the lower limbs.',
      salutogenicAction: 'Engage calf-muscle pump contractions before standing, and maintain hydration with ancestral salt ratios.',
      priorPredictionError: 78,
      posteriorCalibratedError: 15
    },
    {
      id: 'air_hunger',
      sensationTitle: 'Air Hunger / Deep Sighing',
      colloquialFear: 'My lungs cannot get enough oxygen.',
      physiologicalMechanism: 'Mild acute over-breathing reduces arterial CO2 (hypocapnia), causing the Bohr effect to temporarily tighten oxygen binding to hemoglobin.',
      salutogenicAction: 'Extend the exhalation to 6 seconds to gently restore arterial pCO2 and tissue oxygen unloading.',
      priorPredictionError: 92,
      posteriorCalibratedError: 8
    },
    {
      id: 'fasciculations',
      sensationTitle: 'Muscle Twitching',
      colloquialFear: 'I have a progressive motor neuron disorder.',
      physiologicalMechanism: 'Benign motor unit membrane excitability triggered by transient intracellular magnesium/potassium gradient shift or physical fatigue.',
      salutogenicAction: 'Replenish bioavailable magnesium glycinate and allow muscular restitution without catastrophizing.',
      priorPredictionError: 90,
      posteriorCalibratedError: 10
    }
  ];

  public currentSensation = computed(() => {
    const id = this.selectedSensationId();
    return this.sensations.find(s => s.id === id) || this.sensations[0];
  });

  public pacerPhase = computed(() => {
    return this.pacerSecond() < 4 ? 'inhale' : 'exhale';
  });

  public togglePacer(): void {
    if (this.isPacerRunning()) {
      this.stopPacer();
    } else {
      this.startPacer();
    }
  }

  private startPacer(): void {
    this.isPacerRunning.set(true);
    this.pacerSecond.set(0);
    this.pacerIntervalId = setInterval(() => {
      const next = (this.pacerSecond() + 1) % 10;
      this.pacerSecond.set(next);
      if (next === 0 || next === 4) {
        kachinkaAudio.playWoodBeadClick(next === 0 ? 1.2 : 0.8);
      }
    }, 1000);
  }

  private stopPacer(): void {
    this.isPacerRunning.set(false);
    if (this.pacerIntervalId) {
      clearInterval(this.pacerIntervalId);
      this.pacerIntervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPacer();
  }
}
