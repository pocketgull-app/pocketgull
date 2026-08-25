import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { RosettaStoneAnatomyComponent } from './rosetta-stone-anatomy.component';
import { ParadigmArbitrationMatrixComponent } from './paradigm-arbitration-matrix.component';

export type MedicalParadigmMode = 'western' | 'functional' | 'tcm' | 'ayurveda' | 'chronobiology' | 'blend_all' | 'blend_west_tcm' | 'blend_west_ayurveda' | 'blend_tcm_ayurveda';

export interface IParadigmInfo {
  id: MedicalParadigmMode;
  name: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  focusPrinciples: string[];
}

@Component({
  selector: 'app-paradigm-clinical-dashboard',
  standalone: true,
  imports: [CommonModule, RosettaStoneAnatomyComponent, ParadigmArbitrationMatrixComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-8 p-6 sm:p-8 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden font-sans pocket-gull-card">
      
      <!-- Header & Selector (Dieter Rams Braun Aesthetic) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🩺</span>
              <span>Multi-Paradigm Integrative Clinical Dashboard</span>
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#2AA4A0] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
              Multi-Paradigm Engine
            </span>
            <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-orange-600 dark:text-orange-400 border border-zinc-300 dark:border-zinc-800 uppercase">
              Integrative Blend
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 font-sans leading-relaxed">
            View patient health state individually or blend multiple paradigms side-by-side: Western Allopathic, TCM Zang-Fu, and Ayurveda Tridosha.
          </p>
        </div>

        <div class="text-right text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono shrink-0">
          <span>Active Patient: <strong class="text-orange-600 dark:text-orange-400 font-extrabold uppercase">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Multi-Paradigm Blend & Selection Toolbar -->
      <div class="flex items-center gap-2 mb-6 relative z-10 font-mono overflow-x-auto scroll-smooth hide-scrollbar flex-nowrap py-1">
        
        <!-- Multi-Paradigm Blend Presets -->
        <span class="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 shrink-0 mr-1">Integrative Blends:</span>

        <button (click)="selectBlend('blend_all')"
          [class]="activeMode() === 'blend_all'
            ? 'px-4 py-2 rounded-xl bg-purple-600 text-white border-2 border-[#1C1C1C] text-xs sm:text-sm font-mono font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02]'
            : 'px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/40 text-xs font-mono font-extrabold text-purple-900 dark:text-purple-300 transition cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/60 flex items-center gap-1.5'">
          <span>🌐 All 3 (West + TCM + Ayurveda)</span>
        </button>

        <button (click)="selectBlend('blend_west_tcm')"
          [class]="activeMode() === 'blend_west_tcm'
            ? 'px-4 py-2 rounded-xl bg-sky-600 text-white border-2 border-[#1C1C1C] text-xs sm:text-sm font-mono font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02]'
            : 'px-3.5 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-500/40 text-xs font-mono font-extrabold text-sky-900 dark:text-sky-300 transition cursor-pointer hover:bg-sky-200 dark:hover:bg-sky-900/60 flex items-center gap-1.5'">
          <span>🔵 Western + 🟢 TCM</span>
        </button>

        <button (click)="selectBlend('blend_west_ayurveda')"
          [class]="activeMode() === 'blend_west_ayurveda'
            ? 'px-4 py-2 rounded-xl bg-amber-600 text-white border-2 border-[#1C1C1C] text-xs sm:text-sm font-mono font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02]'
            : 'px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-xs font-mono font-extrabold text-amber-900 dark:text-amber-300 transition cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/60 flex items-center gap-1.5'">
          <span>🔵 Western + 🟡 Ayurveda</span>
        </button>

        <button (click)="selectBlend('blend_tcm_ayurveda')"
          [class]="activeMode() === 'blend_tcm_ayurveda'
            ? 'px-4 py-2 rounded-xl bg-emerald-600 text-white border-2 border-[#1C1C1C] text-xs sm:text-sm font-mono font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02]'
            : 'px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-xs font-mono font-extrabold text-emerald-900 dark:text-emerald-300 transition cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/60 flex items-center gap-1.5'">
          <span>🟢 TCM + 🟡 Ayurveda</span>
        </button>

        <!-- Divider -->
        <span class="text-zinc-700 mx-1">|</span>

        <!-- Single Paradigm Selectors -->
        @for (p of paradigms; track p.id) {
          <button (click)="selectBlend(p.id)"
            [class]="activeMode() === p.id
              ? 'px-3.5 py-2 rounded-xl bg-orange-500 text-zinc-950 border border-orange-400/50 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2 shadow-md'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-400 transition cursor-pointer hover:border-zinc-700 hover:text-zinc-200 flex items-center gap-2'">
            <span>{{ p.icon }}</span>
            <span>{{ p.name }}</span>
          </button>
        }
      </div>

      <!-- Impressive Paradigm Bridges Suite -->
      <div class="space-y-6 mb-8 relative z-10 font-sans">
        <app-rosetta-stone-anatomy />
        <app-paradigm-arbitration-matrix />
      </div>

      <!-- MULTI-PARADIGM BLEND VIEW (All 3 or Selected Blends) -->
      @if (isBlendMode()) {
        <div class="space-y-6 relative z-10 font-sans animate-in fade-in duration-300">
          
          <!-- Integrative Clinical Cross-Talk Insight Box -->
          <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔗</span>
              <div>
                <strong class="block font-extrabold uppercase text-purple-300">Integrative Multi-Paradigm Cross-Talk Analysis</strong>
                <span class="text-[11px] text-zinc-300 font-sans">
                  Synthesizing allopathic L4-L5 radiculopathy with TCM Spleen/Kidney Qi deficiency and Ayurvedic Vata aggravation.
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                Triple-Validated Accord
              </span>
            </div>
          </div>

          <!-- Comparative Grid of Enabled Paradigms -->
          <div class="grid grid-cols-1 gap-6" [class.lg:grid-cols-3]="activeMode() === 'blend_all'" [class.lg:grid-cols-2]="activeMode() !== 'blend_all'">
            
            <!-- Column 1: Western Allopathic -->
            @if (showWestern()) {
              <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-sky-300 dark:border-sky-500/40 space-y-4 shadow-xl sub-panel">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🔵</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-sky-800 dark:text-sky-300 uppercase">Western Allopathic</h3>
                  </div>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#F6B12B] text-zinc-950 font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                    Swoop ⚡ Allopathic
                  </span>
                </div>

                <div class="space-y-3 font-sans text-xs sm:text-sm">
                  <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span class="font-extrabold text-sky-700 dark:text-sky-300 block mb-0.5">🫀 Vitals & Labs</span>
                    <span class="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">72 BPM · 118/76 mmHg · Glucose 92 mg/dL</span>
                    <span class="text-zinc-600 dark:text-zinc-400 text-xs block mt-1">Normal sinus rhythm. Mild vascular stiffness index.</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span class="font-extrabold text-rose-700 dark:text-rose-300 block mb-0.5">🦴 Musculoskeletal (ICD-10 M54.16)</span>
                    <span class="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">L4-L5 Disc Radiculopathy · VAS 6/10</span>
                    <span class="text-zinc-600 dark:text-zinc-400 text-xs block mt-1">NSAID anti-inflammatory & McKenzie Physical Therapy protocol.</span>
                  </div>
                </div>
              </div>
            }

            <!-- Column 2: Traditional Chinese Medicine (TCM) -->
            @if (showTcm()) {
              <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-500/40 space-y-4 shadow-xl sub-panel">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🟢</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300 uppercase">TCM Zang-Fu & Meridian</h3>
                  </div>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                    Gulliver 🔭 Zang-Fu
                  </span>
                </div>

                <div class="space-y-3 font-sans text-xs sm:text-sm">
                  <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span class="font-extrabold text-emerald-700 dark:text-emerald-300 block mb-0.5">🌿 Wood & Water Meridian Flow</span>
                    <span class="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">Liver Qi Stagnation · Kidney Jing Deficiency</span>
                    <span class="text-zinc-600 dark:text-zinc-400 text-xs block mt-1">Nourishing Spleen Qi to resolve dampness and clear lumbar channel blockages.</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span class="font-extrabold text-emerald-700 dark:text-emerald-300 block mb-0.5">🍵 Classic Botanical Protocol</span>
                    <span class="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">Jin Gui Shen Qi Wan · Ginger Jujube Elixir</span>
                    <span class="text-zinc-600 dark:text-zinc-400 text-xs block mt-1">Warm botanical teas and acupoints (BL23, GB34) to unblock meridian pathways.</span>
                  </div>
                </div>
              </div>
            }

            <!-- Column 3: Ayurveda Tridosha -->
            @if (showAyurveda()) {
              <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/40 space-y-4 shadow-xl sub-panel">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🟡</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300 uppercase">Ayurveda Tridosha</h3>
                  </div>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#3B82F6] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                    Sentinel 🔦 Dosha
                  </span>
                </div>

                <div class="space-y-3 font-sans text-xs sm:text-sm">
                  <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span class="font-extrabold text-amber-700 dark:text-amber-300 block mb-0.5">🌬️ Vata / Pitta / Kapha Imbalance</span>
                    <span class="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">Vata Aggravated · Vishama Agni</span>
                    <span class="text-zinc-600 dark:text-zinc-400 text-xs block mt-1">Spinal dryness and nerve firing driven by Vata space element. Pitta is balanced.</span>
                  </div>

                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span class="font-bold text-amber-300 block mb-0.5">🪔 Rasayana & Dinacharya Care</span>
                    <span class="text-zinc-200 font-mono">Warm Sesame Abhyanga · Ashwagandha & Triphala</span>
                    <span class="text-zinc-400 text-[11px] block mt-1">Grounding daily routines and six-taste (Shad Rasa) meals to kindle Agni and clear Ama.</span>
                  </div>
                </div>
              </div>
            }

          </div>

        </div>
      }

      <!-- SINGLE PARADIGM PRINCIPLES BANNER -->
      @if (!isBlendMode()) {
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 font-mono">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ currentParadigm().icon }}</span>
            <div>
              <h3 class="text-xs font-bold uppercase tracking-tight text-zinc-100 font-mono">{{ currentParadigm().name }} Paradigm</h3>
              <span class="text-[10.5px] text-zinc-400 block font-sans">{{ currentParadigm().subtitle }}</span>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-1.5">
            @for (principle of currentParadigm().focusPrinciples; track principle) {
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                {{ principle }}
              </span>
            }
          </div>
        </div>
      }

      <!-- SINGLE PARADIGM VIEW 1: WESTERN ALLOPATHIC -->
      @if (activeMode() === 'western') {
        <div class="space-y-6 relative z-10 font-sans">
          <!-- Organ System Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-zinc-900 border border-cyan-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-cyan-300 font-bold uppercase">🫀 Cardiovascular</span>
                <span class="text-emerald-400 font-bold">Stable</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">72 bpm <span class="text-xs font-normal text-zinc-400">/ 118/76 mmHg</span></div>
              <p class="text-[11px] text-zinc-400">Normal sinus rhythm. Mild vascular stiffness index.</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-indigo-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-indigo-300 font-bold uppercase">🧠 Neurological</span>
                <span class="text-amber-400 font-bold">Moderate Strain</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">10Hz Alpha <span class="text-xs font-normal text-zinc-400">/ Prefrontal</span></div>
              <p class="text-[11px] text-zinc-400">L4-L5 radiculopathy pain signals. Mild sleep deprivation.</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-emerald-300 font-bold uppercase">🪵 Metabolic & Liver</span>
                <span class="text-emerald-400 font-bold">Optimal</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">92 mg/dL <span class="text-xs font-normal text-zinc-400">/ Fasting Glucose</span></div>
              <p class="text-[11px] text-zinc-400">ALT/AST normal. Sub-optimal Vitamin D3 (28 ng/mL).</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-rose-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-rose-300 font-bold uppercase">🦴 Musculoskeletal</span>
                <span class="text-rose-400 font-bold">Priority Focus</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">L4-L5 Disc <span class="text-xs font-normal text-zinc-400">/ VAS 6/10</span></div>
              <p class="text-[11px] text-zinc-400">Lumbar radiculopathy. Non-opioid NSAID & McKenzie PT active.</p>
            </div>
          </div>
        </div>
      }

      <!-- SINGLE PARADIGM VIEW 2: FUNCTIONAL SYSTEMS (IFM MATRIX) -->
      @if (activeMode() === 'functional') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-zinc-900 border border-purple-500/30 space-y-3">
              <span class="text-xs font-bold text-purple-300 font-mono uppercase block">⚡ Energy & Mitochondria</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: 68%"></div>
              </div>
              <p class="text-xs text-zinc-300">68% Capacity — Sub-optimal Magnesium & B-vitamins limits ATP electron transport.</p>
            </div>

            <div class="p-5 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3">
              <span class="text-xs font-bold text-amber-300 font-mono uppercase block">🛡️ Defense & Repair</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 82%"></div>
              </div>
              <p class="text-xs text-zinc-300">82% Immune Activation — Elevated systemic IL-6 cytokines due to nerve inflammation.</p>
            </div>

            <div class="p-5 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-3">
              <span class="text-xs font-bold text-emerald-300 font-mono uppercase block">🌱 Assimilation & Gut Microbe</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 75%"></div>
              </div>
              <p class="text-xs text-zinc-300">75% Intestinal Integrity — Responding well to organic polyphenol dietary inputs.</p>
            </div>
          </div>
        </div>
      }

      <!-- SINGLE PARADIGM VIEW 3: TRADITIONAL CHINESE MEDICINE (TCM) -->
      @if (activeMode() === 'tcm') {
        <div class="space-y-6 relative z-10 font-sans">
          <!-- Wu Xing 5-Elements Pentagram Grid -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono">
            <div class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
              <span class="text-xl">🌿</span>
              <h4 class="text-xs font-bold text-emerald-300 uppercase">Wood (Mu)</h4>
              <span class="text-[10px] text-zinc-400 block">Liver / Gallbladder</span>
              <span class="text-[9.5px] font-bold text-amber-300 block">Qi Stagnation</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1">
              <span class="text-xl">🔥</span>
              <h4 class="text-xs font-bold text-rose-300 uppercase">Fire (Huo)</h4>
              <span class="text-[10px] text-zinc-400 block">Heart / Pericardium</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Shen Calm</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
              <span class="text-xl">🌾</span>
              <h4 class="text-xs font-bold text-amber-300 uppercase">Earth (Tu)</h4>
              <span class="text-[10px] text-zinc-400 block">Spleen / Stomach</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Spleen Qi Strong</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-center space-y-1">
              <span class="text-xl">⚔️</span>
              <h4 class="text-xs font-bold text-slate-300 uppercase">Metal (Jin)</h4>
              <span class="text-[10px] text-zinc-400 block">Lung / Large Int.</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Wei Qi Intact</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-center space-y-1">
              <span class="text-xl">🌊</span>
              <h4 class="text-xs font-bold text-cyan-300 uppercase">Water (Shui)</h4>
              <span class="text-[10px] text-zinc-400 block">Kidney / Bladder</span>
              <span class="text-[9.5px] font-bold text-amber-300 block">Jing Nourished</span>
            </div>
          </div>
        </div>
      }

      <!-- SINGLE PARADIGM VIEW 4: AYURVEDA TRIDOSHA -->
      @if (activeMode() === 'ayurveda') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div class="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-blue-300 uppercase">🌬️ Vata (Air/Space)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Aggravated</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Causes spinal joint dryness, nerve firing, and irregular digestion (Vishama Agni).</p>
            </div>

            <div class="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-rose-300 uppercase">🔥 Pitta (Fire/Water)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Balanced</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Metabolic transformation intact. Mild inflammatory heat in lower lumbar.</p>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-300 uppercase">💧 Kapha (Earth/Water)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Stable</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Structural lubrication requires warm sesame oil Abhyanga massage support.</p>
            </div>
          </div>
        </div>
      }

      <!-- SINGLE PARADIGM VIEW 5: CHRONOBIOLOGY & ENVIRONMENTAL -->
      @if (activeMode() === 'chronobiology') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div class="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <span class="text-xs font-bold text-indigo-300 uppercase block">🌙 Circadian Melatonin Phase</span>
              <div class="text-lg font-bold text-zinc-100">Optimal Phase Alignment</div>
              <p class="text-xs text-zinc-300 font-sans">10:30 PM Peak Melatonin onset. Limited screen exposure recommended 1 hr before bed.</p>
            </div>

            <div class="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
              <span class="text-xs font-bold text-cyan-300 uppercase block">🫁 Vagal Tone & HRV Spectrum</span>
              <div class="text-lg font-bold text-cyan-300">62 ms rMSSD</div>
              <p class="text-xs text-zinc-300 font-sans">High vagal resilience. Boosted by 528Hz Solfeggio sound therapy.</p>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <span class="text-xs font-bold text-emerald-300 uppercase block">🌲 Environmental Phytoncide Index</span>
              <div class="text-lg font-bold text-emerald-300">High Coastal Exposure</div>
              <p class="text-xs text-zinc-300 font-sans">Low urban smog exposure. 1.8 miles to Pacific Cove ocean air sanctuary.</p>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ParadigmClinicalDashboardComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeMode = signal<MedicalParadigmMode>('blend_all');

  paradigms: IParadigmInfo[] = [
    {
      id: 'western',
      name: 'Western Allopathic',
      subtitle: 'Organ system ICD-10/SNOMED CT, quantitative biomarkers & standard-of-care guidelines.',
      icon: '🏥',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
      borderColor: 'border-cyan-500/30',
      focusPrinciples: ['ICD-10 Diagnoses', 'Lab Ranges', 'Pharmacology']
    },
    {
      id: 'functional',
      name: 'IFM Functional Systems',
      subtitle: 'Root-cause etiology, 7 fundamental physiological processes & antecedent-trigger timeline.',
      icon: '⚡',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      borderColor: 'border-purple-500/30',
      focusPrinciples: ['7 IFM Nodes', 'Mitochondria', 'Gut-Brain Axis']
    },
    {
      id: 'tcm',
      name: 'Traditional Chinese (TCM)',
      subtitle: 'Wu Xing 5-Element pentagram, Zang-Fu organ pairs, Qi/Blood/Jing & Shen tranquility.',
      icon: '☯️',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      borderColor: 'border-emerald-500/30',
      focusPrinciples: ['Wu Xing Pentagram', 'Zang-Fu Balance', 'Shen Harmony']
    },
    {
      id: 'ayurveda',
      name: 'Ayurveda Tridosha',
      subtitle: 'Vata/Pitta/Kapha equilibrium, Agni digestive fire & Ama metabolic toxicity.',
      icon: '🪔',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      borderColor: 'border-amber-500/30',
      focusPrinciples: ['Tridosha Radar', 'Agni Fire', 'Dinacharya']
    },
    {
      id: 'chronobiology',
      name: 'Chronobiology & Environment',
      subtitle: 'Circadian phase alignment, vagal HRV spectrum & environmental phytoncide exposure.',
      icon: '🌿',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
      borderColor: 'border-indigo-500/30',
      focusPrinciples: ['Circadian Arc', 'Vagal HRV', 'Phytoncide Meter']
    }
  ];

  selectBlend(mode: MedicalParadigmMode) {
    this.activeMode.set(mode);
    if (mode === 'western') {
      this.patientState.activePhilosophy.set('western');
    } else if (mode === 'tcm') {
      this.patientState.activePhilosophy.set('eastern');
    } else if (mode === 'ayurveda') {
      this.patientState.activePhilosophy.set('ayurvedic');
    }
  }

  isBlendMode = computed(() => {
    const m = this.activeMode();
    return m.startsWith('blend_');
  });

  showWestern = computed(() => {
    const m = this.activeMode();
    return m === 'western' || m === 'blend_all' || m === 'blend_west_tcm' || m === 'blend_west_ayurveda';
  });

  showTcm = computed(() => {
    const m = this.activeMode();
    return m === 'tcm' || m === 'blend_all' || m === 'blend_west_tcm' || m === 'blend_tcm_ayurveda';
  });

  showAyurveda = computed(() => {
    const m = this.activeMode();
    return m === 'ayurveda' || m === 'blend_all' || m === 'blend_west_ayurveda' || m === 'blend_tcm_ayurveda';
  });

  currentParadigm = computed(() => {
    const mode = this.activeMode();
    return this.paradigms.find(p => p.id === mode) || this.paradigms[0];
  });

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });
}
