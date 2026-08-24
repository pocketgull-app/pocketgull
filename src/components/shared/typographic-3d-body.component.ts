import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  ElementRef, 
  viewChild, 
  effect, 
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type T3dAnatomyLens = 'skeleton' | 'vascular' | 'neural' | 'ascii';

@Component({
  selector: 'app-typographic-3d-body',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-700/60 dark:border-zinc-800 rounded-3xl space-y-6 text-zinc-100 font-sans shadow-2xl backdrop-blur-xl">
      
      <!-- Top Title & Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 dark:border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🫀
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Typographic 3D Anatomy &amp; Experimental Shaders
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                WebGL 3D Calligramme
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Real-time Three.js spatial body viewer rendered via typographic splines, vascular particle flows, and medical halftone shaders.
            </p>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <button
            (click)="activeView.set('3d-body')"
            [class.bg-emerald-500]="activeView() === '3d-body'"
            [class.text-zinc-950]="activeView() === '3d-body'"
            [class.text-zinc-400]="activeView() !== '3d-body'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🫀 3D Body Canvas
          </button>
          <button
            (click)="activeView.set('drawing')"
            [class.bg-emerald-500]="activeView() === 'drawing'"
            [class.text-zinc-950]="activeView() === 'drawing'"
            [class.text-zinc-400]="activeView() !== 'drawing'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            ✍️ Vector Drawing
          </button>
          <button
            (click)="activeView.set('halftone')"
            [class.bg-emerald-500]="activeView() === 'halftone'"
            [class.text-zinc-950]="activeView() === 'halftone'"
            [class.text-zinc-400]="activeView() !== 'halftone'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🏁 Halftone &amp; X-Ray
          </button>
        </div>
      </div>

      <!-- VIEW 1: 3D Typographic Body Canvas (Three.js) -->
      @if (activeView() === '3d-body') {
        <div class="space-y-4 animate-in fade-in duration-300">
          
          <!-- Lens Controls & Auto Rotate Toggle -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="text-zinc-400 font-bold uppercase">Spatial Lens:</span>
              <button
                (click)="switchLens('skeleton')"
                [class.bg-cyan-500/20]="activeLens() === 'skeleton'"
                [class.text-cyan-300]="activeLens() === 'skeleton'"
                [class.border-cyan-500]="activeLens() === 'skeleton'"
                [class.border-slate-800]="activeLens() !== 'skeleton'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                🦴 Skeleton
              </button>
              <button
                (click)="switchLens('vascular')"
                [class.bg-rose-500/20]="activeLens() === 'vascular'"
                [class.text-rose-300]="activeLens() === 'vascular'"
                [class.border-rose-500]="activeLens() === 'vascular'"
                [class.border-slate-800]="activeLens() !== 'vascular'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                🫀 Vascular Flow
              </button>
              <button
                (click)="switchLens('neural')"
                [class.bg-amber-500/20]="activeLens() === 'neural'"
                [class.text-amber-300]="activeLens() === 'neural'"
                [class.border-amber-500]="activeLens() === 'neural'"
                [class.border-slate-800]="activeLens() !== 'neural'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                ⚡ Neural Action
              </button>
              <button
                (click)="switchLens('ascii')"
                [class.bg-emerald-500/20]="activeLens() === 'ascii'"
                [class.text-emerald-300]="activeLens() === 'ascii'"
                [class.border-emerald-500]="activeLens() === 'ascii'"
                [class.border-slate-800]="activeLens() !== 'ascii'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                📟 ASCII Cloud
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button
                (click)="toggleAutoRotate()"
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-zinc-300 transition cursor-pointer"
              >
                {{ autoRotate() ? '⏸ Pause Orbit' : '▶ Auto-Orbit' }}
              </button>
              <button
                (click)="resetCamera()"
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-zinc-300 transition cursor-pointer"
              >
                ↺ Reset View
              </button>
            </div>
          </div>

          <!-- WebGL Three.js Container -->
          <div #canvasContainer class="relative w-full h-[520px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas #threeCanvas class="w-full h-full cursor-grab active:cursor-grabbing block touch-none"></canvas>

            <!-- Real-Time HUD Overlay -->
            <div class="absolute top-4 left-4 p-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] space-y-1 pointer-events-none z-10">
              <div class="text-emerald-400 font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Volumetric Biophysical Substrate & Shaders Active</span>
              </div>
              <div class="text-zinc-400">FPS: 60 • Descending Inhibitory Axis: 40% Gate Reduction</div>
              <div class="text-cyan-400">Lens: {{ activeLens().toUpperCase() }} (Drag / Scroll to Orbit)</div>
            </div>

            <!-- Floating Spatial Telemetry -->
            <div class="absolute bottom-4 right-4 p-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] text-right space-y-0.5 pointer-events-none z-10">
              <div class="text-zinc-400 uppercase text-[9px]">Cardiac Rhythm Sync</div>
              <div class="text-rose-400 font-bold text-sm">72.4 bpm (1.20 Hz)</div>
              <div class="text-zinc-500 text-[10px]">Hemodynamic Spline Flow: 125 mL/s</div>
            </div>
          </div>

          <!-- Integrative Medicine & Cognitive Modulation of Pain Panel (Andrew Weil & Neuroscience Inspired) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <!-- Column 1: Descending Pain Modulatory Pathway -->
            <div class="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-3">
              <div class="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                <span class="text-lg">🧠</span>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-wider text-cyan-400">Descending Pain Modulation</h4>
                  <p class="text-[10px] text-zinc-400">PFC → Periaqueductal Gray (PAG) → Dorsal Horn Gate</p>
                </div>
              </div>
              <div class="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs space-y-1.5">
                <div class="flex justify-between items-baseline font-bold font-mono">
                  <span class="text-cyan-300">Gate Inhibition:</span>
                  <span class="text-emerald-400 text-sm">40% Pain Reduction</span>
                </div>
                <p class="text-[11px] text-zinc-300 leading-relaxed">
                  Endorphinergic descending signals block ascending nociceptive action potentials at the spinal cord substantia gelatinosa.
                </p>
              </div>
            </div>

            <!-- Column 2: Threat vs Agency Cognitive Framing -->
            <div class="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-3">
              <div class="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                <span class="text-lg">⚖️</span>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-wider text-amber-400">Cognitive Threat vs Agency</h4>
                  <p class="text-[10px] text-zinc-400">Catastrophizing vs Structural Literacy</p>
                </div>
              </div>
              <div class="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs space-y-1.5">
                <div class="flex justify-between items-baseline font-bold font-mono">
                  <span class="text-amber-300">Active Framing:</span>
                  <span class="text-amber-400 text-sm">Endogenous Analgesia</span>
                </div>
                <p class="text-[11px] text-zinc-300 leading-relaxed">
                  Knowledge of physiological mechanisms reduces fear-avoidance hyperalgesia and triggers parasympathetic somatovisceral relaxation.
                </p>
              </div>
            </div>

            <!-- Column 3: Quad-Philosophy Integrative Bioenergetics -->
            <div class="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-3">
              <div class="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                <span class="text-lg">🌿</span>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-wider text-emerald-400">Quad-Philosophy Bioenergetics</h4>
                  <p class="text-[10px] text-zinc-400">Mitochondrial Protection &amp; Shen-Qi Free Flow</p>
                </div>
              </div>
              <div class="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs space-y-1.5">
                <div class="flex justify-between items-baseline font-bold font-mono">
                  <span class="text-emerald-300">Botanical Target:</span>
                  <span class="text-emerald-400 text-sm">NF-κB Downregulation</span>
                </div>
                <p class="text-[11px] text-zinc-300 leading-relaxed">
                  Curcumin, Ashwagandha &amp; Medicinal Mushrooms protect mitochondrial cristae and harmonize visceral sympathetic tone.
                </p>
              </div>
            </div>

          </div>
        </div>
      }


      <!-- VIEW 2: Kinetic Vector Drawing (Laser/Felt Draw Animation) -->
      @if (activeView() === 'drawing') {
        <div class="space-y-6 animate-in fade-in duration-300">
          
          <!-- Drawing Controls Header -->
          <div class="p-5 bg-slate-950/85 border border-slate-800 rounded-3xl space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">✍️</span>
                <div>
                  <h3 class="text-sm font-black uppercase text-emerald-400 tracking-wider font-mono">
                    Real-Time Vector Prescription Drawing Engine
                  </h3>
                  <p class="text-xs text-zinc-400 font-sans">
                    Simulates high-precision vector laser etching &amp; physician hand-drawn clinical script.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  (click)="replayDrawing()"
                  class="px-4 py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <span>↺</span> Replay Laser Animation
                </button>
              </div>
            </div>

            <!-- Presets & Ink Selector -->
            <div class="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <!-- Clinical Prescription Presets -->
              <div class="flex items-center gap-2">
                <span class="text-zinc-400 font-bold uppercase text-[10px]">Rx Preset:</span>
                <button
                  (click)="selectRxPreset('thyroid')"
                  [class.bg-cyan-500/20]="activeRxPreset() === 'thyroid'"
                  [class.text-cyan-300]="activeRxPreset() === 'thyroid'"
                  [class.border-cyan-500]="activeRxPreset() === 'thyroid'"
                  [class.border-slate-800]="activeRxPreset() !== 'thyroid'"
                  class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
                >
                  Levothyroxine 50 µg
                </button>
                <button
                  (click)="selectRxPreset('cardiac')"
                  [class.bg-rose-500/20]="activeRxPreset() === 'cardiac'"
                  [class.text-rose-300]="activeRxPreset() === 'cardiac'"
                  [class.border-rose-500]="activeRxPreset() === 'cardiac'"
                  [class.border-slate-800]="activeRxPreset() !== 'cardiac'"
                  class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
                >
                  KCl 20 mEq / 1000 mL
                </button>
                <button
                  (click)="selectRxPreset('botanical')"
                  [class.bg-emerald-500/20]="activeRxPreset() === 'botanical'"
                  [class.text-emerald-300]="activeRxPreset() === 'botanical'"
                  [class.border-emerald-500]="activeRxPreset() === 'botanical'"
                  [class.border-slate-800]="activeRxPreset() !== 'botanical'"
                  class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
                >
                  Curcumin + Ashwagandha
                </button>
              </div>

              <!-- Laser Ink Palette -->
              <div class="flex items-center gap-2">
                <span class="text-zinc-400 font-bold uppercase text-[10px]">Laser Beam:</span>
                <button
                  (click)="vectorInk.set('cyan')"
                  [class.bg-cyan-500/20]="vectorInk() === 'cyan'"
                  [class.border-cyan-500]="vectorInk() === 'cyan'"
                  class="px-2.5 py-1 rounded-lg border text-cyan-400 cursor-pointer"
                >
                  Neon Cyan
                </button>
                <button
                  (click)="vectorInk.set('emerald')"
                  [class.bg-emerald-500/20]="vectorInk() === 'emerald'"
                  [class.border-emerald-500]="vectorInk() === 'emerald'"
                  class="px-2.5 py-1 rounded-lg border text-emerald-400 cursor-pointer"
                >
                  Bio Emerald
                </button>
                <button
                  (click)="vectorInk.set('amber')"
                  [class.bg-amber-500/20]="vectorInk() === 'amber'"
                  [class.border-amber-500]="vectorInk() === 'amber'"
                  class="px-2.5 py-1 rounded-lg border text-amber-400 cursor-pointer"
                >
                  Dieter Amber
                </button>
              </div>
            </div>

            <!-- Animated Vector SVG Canvas -->
            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-6 overflow-hidden min-h-[320px] relative shadow-inner">
              
              <!-- Real-Time Vector Caduceus & Pulse Trace -->
              <div class="w-full max-w-2xl flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono text-[11px]">
                <div class="flex items-center gap-2 text-zinc-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Path Interpolation: <strong class="text-zinc-200">G1 Continuous Spline</strong></span>
                </div>
                <span class="text-zinc-500">Vector Buffer: 100% Vectorized Bezier</span>
              </div>

              @if (isDrawing()) {
                <!-- Primary Vector Calligramme Drawing -->
                <svg
                  [attr.data-draw-key]="drawKey()"
                  viewBox="0 0 900 240"
                  class="w-full max-w-3xl h-auto drop-shadow-2xl"
                >
                  <defs>
                    <linearGradient id="vectorBeamCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#38bdf8" />
                      <stop offset="50%" stop-color="#06b6d4" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                    <linearGradient id="vectorBeamEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#10b981" />
                      <stop offset="50%" stop-color="#34d399" />
                      <stop offset="100%" stop-color="#38bdf8" />
                    </linearGradient>
                    <linearGradient id="vectorBeamAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#f59e0b" />
                      <stop offset="50%" stop-color="#fbbf24" />
                      <stop offset="100%" stop-color="#ef4444" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <!-- 1. EKG Cardiac Waveform Axis -->
                  <path
                    d="M 50 180 L 180 180 L 200 140 L 220 220 L 240 100 L 260 200 L 280 180 L 850 180"
                    fill="none"
                    stroke="#1e293b"
                    stroke-width="2"
                    stroke-dasharray="6,6"
                  />
                  <path
                    d="M 50 180 L 180 180 L 200 140 L 220 220 L 240 100 L 260 200 L 280 180 L 850 180"
                    fill="none"
                    [attr.stroke]="getStrokeGradient()"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    filter="url(#glow)"
                    class="vector-anim-ekg"
                  />

                  <!-- 2. Primary "POCKETGULL VF" Stylized Vector Path -->
                  <!-- P -->
                  <path d="M 80 50 L 80 140 M 80 50 C 130 50, 140 80, 140 95 C 140 115, 125 125, 80 125" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p1" />
                  <!-- O -->
                  <path d="M 185 85 C 155 85, 155 140, 185 140 C 215 140, 215 85, 185 85 Z" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p2" />
                  <!-- C -->
                  <path d="M 270 95 C 240 80, 225 105, 235 125 C 245 142, 275 138, 278 132" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p3" />
                  <!-- K -->
                  <path d="M 300 50 L 300 140 M 300 105 L 345 85 M 315 100 L 350 140" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p4" />
                  <!-- E -->
                  <path d="M 370 110 L 415 110 C 415 90, 390 85, 380 98 C 365 115, 385 140, 415 135" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p5" />
                  <!-- T -->
                  <path d="M 430 65 L 480 65 M 455 65 L 455 140" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p6" />
                  <!-- G -->
                  <path d="M 545 95 C 520 80, 495 105, 505 125 C 515 142, 545 140, 545 120 L 525 120" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p7" />
                  <!-- U -->
                  <path d="M 570 85 L 570 125 C 570 142, 605 142, 605 125 L 605 85" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p8" />
                  <!-- L -->
                  <path d="M 630 50 L 630 140 L 665 140" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p9" />
                  <!-- L -->
                  <path d="M 685 50 L 685 140 L 720 140" fill="none" [attr.stroke]="getStrokeGradient()" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" class="vector-anim-p10" />

                  <!-- 3. Cursive Clinical Rx Script -->
                  <path
                    d="M 80 215 C 95 195, 120 195, 110 225 M 100 210 L 130 230 M 150 220 C 170 210, 190 230, 210 220 C 230 210, 250 230, 280 220 C 310 210, 330 230, 370 220 L 850 220"
                    fill="none"
                    stroke="#0284c7"
                    stroke-width="2"
                    stroke-linecap="round"
                    class="vector-anim-rx"
                  />
                  <text x="80" y="210" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">
                    {{ getRxLabel() }}
                  </text>
                </svg>
              }
            </div>
          </div>
        </div>
      }


      <!-- VIEW 3: Halftone Risograph & X-Ray Wireframe -->
      @if (activeView() === 'halftone') {
        <div class="space-y-6 animate-in fade-in duration-300">
          
          <!-- Halftone Controls -->
          <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="font-bold uppercase text-emerald-400 tracking-wider">
                Ben-Day Halftone Dot Screen &amp; Risograph Controls
              </span>
              <span class="text-zinc-400">Dot Pitch: {{ halftonePitch() }}px • Ink: {{ halftoneInk() }}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div class="space-y-1">
                <div class="flex justify-between text-zinc-300 text-[11px]">
                  <span>Dot Pitch (Screen Grid)</span>
                  <span class="text-emerald-400 font-bold">{{ halftonePitch() }}px</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="16" 
                  step="1" 
                  [value]="halftonePitch()" 
                  (input)="updateHalftonePitch($event)"
                  class="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div class="flex items-center gap-2">
                <span class="text-zinc-300 text-[11px]">Risograph Channel:</span>
                <button 
                  (click)="halftoneInk.set('cyan')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-cyan-500/20]="halftoneInk() === 'cyan'"
                  [class.border-cyan-500]="halftoneInk() === 'cyan'"
                >
                  Bio-Cyan
                </button>
                <button 
                  (click)="halftoneInk.set('crimson')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-rose-500/20]="halftoneInk() === 'crimson'"
                  [class.border-rose-500]="halftoneInk() === 'crimson'"
                >
                  Arterial Red
                </button>
                <button 
                  (click)="halftoneInk.set('amber')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-amber-500/20]="halftoneInk() === 'amber'"
                  [class.border-amber-500]="halftoneInk() === 'amber'"
                >
                  Dieter Amber
                </button>
              </div>
            </div>

            <!-- Halftone Specimen Output -->
            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
              <div 
                class="text-5xl sm:text-7xl font-black uppercase tracking-tight font-pocketgull-sans"
                [style.background-image]="computedHalftonePattern()"
                style="background-color: #09090b; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: contrast(160%);"
              >
                CARDIOLOGY
              </div>
              <p class="text-xs text-zinc-400 font-mono">
                Procedural Ben-Day raster screen simulating vintage medical lithography and physiological risograph printing.
              </p>
            </div>
          </div>

          <!-- X-Ray Wireframe Outlines -->
          <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              X-Ray Fluoroscopy Bone-Density Wireframe Outline
            </span>

            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
              <div class="text-4xl sm:text-6xl font-black uppercase tracking-widest font-pocketgull-sans text-transparent"
                   style="-webkit-text-stroke: 1.5px #38bdf8; text-shadow: 0 0 15px rgba(56, 189, 248, 0.7), 0 0 35px rgba(56, 189, 248, 0.3);">
                ANATOMY 3D
              </div>
              <p class="text-xs text-zinc-400 font-mono">
                Luminous bone-cortex wireframe with sub-pixel chromatic offset and deep X-ray transparency.
              </p>
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes drawStroke {
      0% {
        stroke-dashoffset: 400;
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      100% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }

    .vector-anim-ekg {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: drawStroke 2.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }

    .vector-anim-p1 { stroke-dasharray: 300; stroke-dashoffset: 300; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; }
    .vector-anim-p2 { stroke-dasharray: 260; stroke-dashoffset: 260; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; }
    .vector-anim-p3 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; }
    .vector-anim-p4 { stroke-dasharray: 250; stroke-dashoffset: 250; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards; }
    .vector-anim-p5 { stroke-dasharray: 220; stroke-dashoffset: 220; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards; }
    .vector-anim-p6 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards; }
    .vector-anim-p7 { stroke-dasharray: 240; stroke-dashoffset: 240; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.0s forwards; }
    .vector-anim-p8 { stroke-dasharray: 220; stroke-dashoffset: 220; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.15s forwards; }
    .vector-anim-p9 { stroke-dasharray: 180; stroke-dashoffset: 180; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.3s forwards; }
    .vector-anim-p10 { stroke-dasharray: 180; stroke-dashoffset: 180; animation: drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.45s forwards; }

    .vector-anim-rx {
      stroke-dasharray: 900;
      stroke-dashoffset: 900;
      animation: drawStroke 2.2s cubic-bezier(0.2, 0.8, 0.4, 1) 1.2s forwards;
    }
  `]
})
export class Typographic3dBodyComponent implements OnDestroy {
  private ngZone = inject(NgZone, { optional: true });

  threeCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('threeCanvas');
  canvasContainerRef = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  activeView = signal<'3d-body' | 'drawing' | 'halftone'>('3d-body');
  activeLens = signal<T3dAnatomyLens>('skeleton');
  autoRotate = signal<boolean>(true);
  voxelCount = signal<number>(1840);
  drawKey = signal<number>(0);
  isDrawing = signal<boolean>(true);

  vectorInk = signal<'cyan' | 'emerald' | 'amber'>('cyan');
  activeRxPreset = signal<'thyroid' | 'cardiac' | 'botanical'>('thyroid');

  halftonePitch = signal<number>(6);
  halftoneInk = signal<'cyan' | 'crimson' | 'amber'>('cyan');

  selectRxPreset(preset: 'thyroid' | 'cardiac' | 'botanical'): void {
    this.activeRxPreset.set(preset);
    this.replayDrawing();
  }

  getStrokeGradient(): string {
    const ink = this.vectorInk();
    if (ink === 'emerald') return 'url(#vectorBeamEmerald)';
    if (ink === 'amber') return 'url(#vectorBeamAmber)';
    return 'url(#vectorBeamCyan)';
  }

  getRxLabel(): string {
    const preset = this.activeRxPreset();
    if (preset === 'cardiac') return 'Rx: Potassium Chloride (KCl) 20 mEq / 1000 mL D5W • IV Continuous (Rate: 10 mEq/hr)';
    if (preset === 'botanical') return 'Rx: Curcumin Phytosome 500 mg BID • Ashwagandha Sensoril 250 mg QHS (Mitochondrial Support)';
    return 'Rx: Levothyroxine Sodium 50 µg PO Daily (Ac ante cibum / fasting 30 min before meal)';
  }

  computedHalftonePattern = computed(() => {
    const pitch = this.halftonePitch();
    let color1 = '#ffffff';
    let color2 = '#06b6d4';

    if (this.halftoneInk() === 'crimson') {
      color2 = '#ef4444';
    } else if (this.halftoneInk() === 'amber') {
      color2 = '#f59e0b';
    }

    return `radial-gradient(${color1} 22%, transparent 26%), radial-gradient(${color2} 18%, transparent 22%)`;
  });

  // Three.js instances
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private animationFrameId?: number;
  private bodyGroup?: THREE.Group;
  private heartMesh?: THREE.Mesh;
  private splineParticles?: THREE.Points;
  private neuralParticles?: THREE.Points;
  private asciiPoints?: THREE.Points;
  private resizeObserver?: ResizeObserver;
  private startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;

  constructor() {
    // Reactive effect: initializes Three.js whenever the canvas is attached to the DOM
    effect(() => {
      const canvasRef = this.threeCanvasRef();
      if (canvasRef && typeof window !== 'undefined') {
        const initCb = () => setTimeout(() => this.initThreeJs(canvasRef.nativeElement), 50);
        if (this.ngZone) {
          this.ngZone.runOutsideAngular(initCb);
        } else {
          initCb();
        }
      } else {
        this.cleanupThreeJs();
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupThreeJs();
  }

  private cleanupThreeJs(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    if (this.controls) {
      this.controls.dispose();
      this.controls = undefined;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined;
    }
    this.scene = undefined;
    this.camera = undefined;
    this.bodyGroup = undefined;
  }

  private initThreeJs(canvas: HTMLCanvasElement): void {
    this.cleanupThreeJs();
    if (!canvas) return;

    const container = this.canvasContainerRef()?.nativeElement || canvas.parentElement;
    const width = container?.clientWidth || 700;
    const height = container?.clientHeight || 520;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // slate-950

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.8, 3.6);

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // OrbitControls setup
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0.4, 0);
      this.controls.minDistance = 1.2;
      this.controls.maxDistance = 8.0;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
      dirLight.position.set(2, 4, 3);
      this.scene.add(dirLight);

      const pointLight = new THREE.PointLight(0x10b981, 1.5, 6);
      pointLight.position.set(-2, 1, 2);
      this.scene.add(pointLight);

      // Body Model Group
      this.bodyGroup = new THREE.Group();
      this.scene.add(this.bodyGroup);

      this.buildTypographicSkeleton();
      this.buildVascularSplines();
      this.buildNeuralPathways();
      this.buildAsciiCloud();

      // Setup ResizeObserver
      if (container && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width > 0 && cr.height > 0 && this.renderer && this.camera) {
              this.camera.aspect = cr.width / cr.height;
              this.camera.updateProjectionMatrix();
              this.renderer.setSize(cr.width, cr.height);
            }
          }
        });
        this.resizeObserver.observe(container);
      }

      this.animate();
    } catch (e) {
      console.warn('WebGL init error in Typographic3dBodyComponent:', e);
    }
  }

  private buildTypographicSkeleton(): void {
    if (!this.bodyGroup) return;

    // 1. Translucent Human Body Silhouette Membrane
    const bodyMembraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.82,
      transparent: true,
      opacity: 0.45,
      ior: 1.35,
      thickness: 2.0
    });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.8, 16, 24), bodyMembraneMat);
    torso.position.set(0, 0.8, 0);
    this.bodyGroup.add(torso);

    // 2. Convoluted Cerebral Cortex Hemispheres
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.35,
      transparent: true,
      opacity: 0.95
    });

    const leftHemi = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 3), brainMat);
    leftHemi.position.set(-0.08, 1.55, 0.02);
    leftHemi.scale.set(0.9, 1.1, 1.3);
    this.bodyGroup.add(leftHemi);

    const rightHemi = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 3), brainMat);
    rightHemi.position.set(0.08, 1.55, 0.02);
    rightHemi.scale.set(0.9, 1.1, 1.3);
    this.bodyGroup.add(rightHemi);

    // Brainstem & Periaqueductal Gray (PAG) Descending Inhibitory Center
    const pagMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      roughness: 0.1
    });
    const pagNode = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), pagMat);
    pagNode.position.set(0, 1.42, 0.03);
    this.bodyGroup.add(pagNode);

    // 3. Spinal Column with Dorsal Horn Gate Intervertebral Nodes
    const boneMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xe2e8f0, 
      roughness: 0.35, 
      metalness: 0.05, 
      clearcoat: 0.85, 
      clearcoatRoughness: 0.1, 
      emissive: 0x0284c7, 
      emissiveIntensity: 0.2 
    });

    for (let i = 0; i < 14; i++) {
      const y = 0.2 + i * 0.08;
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.05, 12), boneMaterial);
      vert.position.set(0, y, -0.03);
      this.bodyGroup.add(vert);

      // Spinal Dorsal Horn Gate Node
      const gateNode = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      gateNode.position.set(0, y, 0.015);
      this.bodyGroup.add(gateNode);
    }

    // 4. Bilateral Pleural Lungs
    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });

    const leftLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.24, 12, 16), lungMat);
    leftLung.position.set(-0.15, 1.02, 0.02);
    leftLung.rotation.z = 0.12;
    this.bodyGroup.add(leftLung);

    const rightLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.25, 12, 16), lungMat);
    rightLung.position.set(0.15, 1.02, 0.02);
    rightLung.rotation.z = -0.12;
    this.bodyGroup.add(rightLung);

    // 5. Hepatic Lobe (Liver) & Gastric Plexus (Viscera)
    const liver = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.16, 8, 16),
      new THREE.MeshPhysicalMaterial({ color: 0x92400e, emissive: 0x78350f, emissiveIntensity: 0.35, roughness: 0.3, clearcoat: 0.8 })
    );
    liver.position.set(0.11, 0.72, 0.05);
    liver.rotation.z = Math.PI / 4;
    this.bodyGroup.add(liver);

    const stomach = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.04, 12, 24, Math.PI * 1.3),
      new THREE.MeshPhysicalMaterial({ color: 0xd97706, emissive: 0xb45309, emissiveIntensity: 0.3, roughness: 0.35, clearcoat: 0.7 })
    );
    stomach.position.set(-0.09, 0.7, 0.05);
    stomach.rotation.z = -0.4;
    this.bodyGroup.add(stomach);

    // 6. Pelvis & Limbs
    const pelvis = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.035, 8, 24),
      boneMaterial
    );
    pelvis.rotation.x = Math.PI / 2;
    pelvis.position.y = 0.16;
    this.bodyGroup.add(pelvis);

    const legPositions = [-0.16, 0.16];
    for (const x of legPositions) {
      const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 8), boneMaterial);
      femur.position.set(x, -0.15, 0);
      this.bodyGroup.add(femur);

      const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), boneMaterial);
      tibia.position.set(x, -0.7, 0);
      this.bodyGroup.add(tibia);
    }
  }

  private buildVascularSplines(): void {
    if (!this.bodyGroup) return;

    // Muscular Anatomical Heart with Coronary Vasculature
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    const heartGeo = new THREE.DodecahedronGeometry(0.1, 2);
    this.heartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.heartMesh.position.set(-0.04, 0.98, 0.09);
    this.bodyGroup.add(this.heartMesh);

    // Aortic Arch & Vascular Tree Tube
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 1.0, 0.09),
      new THREE.Vector3(-0.02, 1.15, 0.08),
      new THREE.Vector3(0.03, 1.16, 0.02),
      new THREE.Vector3(0.02, 0.95, -0.02),
      new THREE.Vector3(0.01, 0.6, -0.02),
      new THREE.Vector3(-0.07, 0.2, -0.02),
      new THREE.Vector3(-0.15, -0.15, 0),
      new THREE.Vector3(-0.16, -0.65, 0),
    ]);

    const aortaTube = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 40, 0.018, 8, false),
      new THREE.MeshPhysicalMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.55, roughness: 0.2 })
    );
    this.bodyGroup.add(aortaTube);

    const splinePoints = aortaCurve.getPoints(120);
    const splineGeom = new THREE.BufferGeometry().setFromPoints(splinePoints);
    const splineMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.splineParticles = new THREE.Points(splineGeom, splineMat);
    this.bodyGroup.add(this.splineParticles);
  }

  private buildNeuralPathways(): void {
    if (!this.bodyGroup) return;

    const neuralPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 2.2 - 0.9;
      const r = (1 - (y + 0.9) / 3.1) * 0.35 + 0.05;
      neuralPoints.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }

    const neuralGeom = new THREE.BufferGeometry().setFromPoints(neuralPoints);
    const neuralMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.neuralParticles = new THREE.Points(neuralGeom, neuralMat);
    this.bodyGroup.add(this.neuralParticles);
  }

  private buildAsciiCloud(): void {
    if (!this.bodyGroup) return;

    const asciiPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 200; i++) {
      const u = (Math.random() - 0.5) * 1.2;
      const v = Math.random() * 2.4 - 0.9;
      const w = (Math.random() - 0.5) * 0.8;
      asciiPoints.push(new THREE.Vector3(u, v, w));
    }

    const asciiGeom = new THREE.BufferGeometry().setFromPoints(asciiPoints);
    const asciiMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.025,
      transparent: true,
      opacity: 0.4
    });

    this.asciiPoints = new THREE.Points(asciiGeom, asciiMat);
    this.bodyGroup.add(this.asciiPoints);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
    const elapsedTime = now - this.startTime;

    if (this.controls) {
      this.controls.update();
    }

    if (this.bodyGroup && this.autoRotate()) {
      this.bodyGroup.rotation.y += 0.007;
    }

    // Cardiac Pulse (72 bpm = 1.2 Hz)
    const pulseScale = 1.0 + Math.sin(elapsedTime * Math.PI * 2.4) * 0.12;
    if (this.heartMesh) {
      this.heartMesh.scale.set(pulseScale, pulseScale, pulseScale);
    }

    // Neural Sparking Animation
    if (this.neuralParticles) {
      const neuralMat = this.neuralParticles.material as THREE.PointsMaterial;
      neuralMat.opacity = 0.5 + Math.sin(elapsedTime * 4.0) * 0.3;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  switchLens(lens: T3dAnatomyLens): void {
    this.activeLens.set(lens);
    if (!this.bodyGroup) return;

    if (lens === 'skeleton') {
      if (this.splineParticles) (this.splineParticles.material as THREE.PointsMaterial).opacity = 0.3;
      if (this.neuralParticles) (this.neuralParticles.material as THREE.PointsMaterial).opacity = 0.2;
      if (this.asciiPoints) (this.asciiPoints.material as THREE.PointsMaterial).opacity = 0.1;
    } else if (lens === 'vascular') {
      if (this.splineParticles) (this.splineParticles.material as THREE.PointsMaterial).opacity = 1.0;
      if (this.neuralParticles) (this.neuralParticles.material as THREE.PointsMaterial).opacity = 0.1;
      if (this.asciiPoints) (this.asciiPoints.material as THREE.PointsMaterial).opacity = 0.1;
    } else if (lens === 'neural') {
      if (this.splineParticles) (this.splineParticles.material as THREE.PointsMaterial).opacity = 0.2;
      if (this.neuralParticles) (this.neuralParticles.material as THREE.PointsMaterial).opacity = 1.0;
      if (this.asciiPoints) (this.asciiPoints.material as THREE.PointsMaterial).opacity = 0.2;
    } else if (lens === 'ascii') {
      if (this.splineParticles) (this.splineParticles.material as THREE.PointsMaterial).opacity = 0.2;
      if (this.neuralParticles) (this.neuralParticles.material as THREE.PointsMaterial).opacity = 0.2;
      if (this.asciiPoints) (this.asciiPoints.material as THREE.PointsMaterial).opacity = 0.9;
    }
  }

  toggleAutoRotate(): void {
    this.autoRotate.update(v => !v);
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 0.8, 3.6);
      this.controls.target.set(0, 0.4, 0);
      this.controls.update();
    }
    if (this.bodyGroup) {
      this.bodyGroup.rotation.set(0, 0, 0);
    }
  }

  replayDrawing(): void {
    this.isDrawing.set(false);
    this.drawKey.update(k => k + 2);
    setTimeout(() => this.isDrawing.set(true), 20);
  }

  updateHalftonePitch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.halftonePitch.set(Number(input.value));
  }
}

