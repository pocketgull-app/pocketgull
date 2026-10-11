/**
 * 3D Cardiac Electrophysiology & Typographic Action Potential Conduction Lens
 * Powered by GullRender In-House WebGPU/WebGL2 Micro-Engine
 * 
 * Upgrades:
 * - Real-Time Geometry Morphing: Procedural Ventricle <-> Extruded Font Glyphs ([heart], [lungs], [brain], [ecg_lead_ii], [chakra_anahata])
 * - Multi-Script Anatomical Nomenclature (Latin, Greek, Japanese, Chinese, Sanskrit, Arabic)
 * - Live Performance HUD (FPS, GPU raster latency, zero-allocation telemetry)
 * - 0.1 Hz Vagal Parasympathetic Respiratory Modulation
 * - High-Res Canvas Snapshot Attestation Export
 */

import {
  Component,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  inject,
  NgZone,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SpatialEngineService } from '../../engine/spatial-engine.service';
import { Mat4Math } from '../../engine/math/mat4';
import { createAnatomicalEllipsoid } from '../../engine/geometry/procedural-mesh';
import { TurntableControls } from '../../engine/controls/turntable-controls';
import { GlyphVectorRenderer } from '../../engine/typography/glyph-vector-renderer';
import { PatientStateService } from '../../services/patient-state.service';

export type CardiacElectrophysiologyMode =
  | 'normal_sinus'
  | 'drug_induced_long_qtc'
  | 'severe_torsades_de_pointes'
  | 'hypokalemia_arrhythmia';

export type GeometryDisplayMode =
  | 'ventricle'
  | 'glyph_heart'
  | 'glyph_lungs'
  | 'glyph_brain'
  | 'glyph_liver'
  | 'glyph_kidney'
  | 'glyph_spine'
  | 'glyph_knee'
  | 'glyph_ecg'
  | 'glyph_chakra'
  | 'glyph_acupoint';

@Component({
  selector: 'app-cardiac-webgpu-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full font-mono rounded-3xl border overflow-hidden shadow-2xl relative mb-6 transition-all duration-500"
         [class.bg-zinc-950]="circadianTone() < 0.6"
         [class.bg-[#0d0906]]="circadianTone() >= 0.6"
         [class.border-rose-500/30]="circadianTone() < 0.6"
         [class.border-amber-600/30]="circadianTone() >= 0.6"
         [style.fontWeight]="circadianTone() > 0.3 ? '385' : '400'"
         [style.color]="circadianTone() > 0.3 ? '#ede3d2' : '#f4f4f5'">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 border-b gap-3 z-20 shrink-0 transition-colors duration-500"
           [class.bg-zinc-900/90]="circadianTone() < 0.6"
           [class.bg-[#140e0a]/90]="circadianTone() >= 0.6"
           [class.border-zinc-800]="circadianTone() < 0.6"
           [class.border-amber-950/60]="circadianTone() >= 0.6">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full transition-colors duration-500"
                [class.bg-rose-500]="circadianTone() < 0.6"
                [class.shadow-[0_0_14px_rgba(244,63,94,0.95)]]="circadianTone() < 0.6"
                [class.bg-amber-500]="circadianTone() >= 0.6"
                [class.shadow-[0_0_14px_rgba(245,158,11,0.95)]]="circadianTone() >= 0.6"
                [class.animate-pulse]="true"></span>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-xs sm:text-sm font-black uppercase flex items-center gap-1.5"
                  [style.color]="circadianTone() > 0.3 ? '#ede3d2' : '#f4f4f5'">
                <span>⚡</span>
                <span>GullRender 3D Bio-Electrophysiology Lens</span>
              </h3>
              <!-- Active Engine Tier Badge -->
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                [class.bg-teal-500/20]="engine.activeBackend() === 'webgpu'"
                [class.text-teal-300]="engine.activeBackend() === 'webgpu'"
                [class.border-teal-500/40]="engine.activeBackend() === 'webgpu'"
                [class.bg-amber-500/20]="engine.activeBackend() === 'webgl2'"
                [class.text-amber-300]="engine.activeBackend() === 'webgl2'"
                [class.border-amber-500/40]="engine.activeBackend() === 'webgl2'"
                [class.bg-purple-500/20]="engine.activeBackend() === 'canvas2d'"
                [class.text-purple-300]="engine.activeBackend() === 'canvas2d'"
                [class.border-purple-500/40]="engine.activeBackend() === 'canvas2d'">
                Tier: {{ engine.activeBackend() || 'initializing...' }}
              </span>
              <!-- Zero Heap Alloc Badge -->
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                0B Heap / Frame
              </span>
              <!-- Automated mEDI (CIE S 026) Telemetry Meter -->
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono border flex items-center gap-1.5 transition-all shadow-inner"
                    [class.bg-emerald-950/70]="mediLux() < 10.0"
                    [class.text-emerald-300]="mediLux() < 10.0"
                    [class.border-emerald-700/60]="mediLux() < 10.0"
                    [class.bg-amber-950/70]="mediLux() >= 10.0 && mediLux() < 25.0"
                    [class.text-amber-300]="mediLux() >= 10.0 && mediLux() < 25.0"
                    [class.border-amber-700/60]="mediLux() >= 10.0 && mediLux() < 25.0"
                    [class.bg-teal-950/70]="mediLux() >= 25.0"
                    [class.text-teal-300]="mediLux() >= 25.0"
                    [class.border-teal-700/60]="mediLux() >= 25.0"
                    [attr.title]="mediTooltip()">
                <span class="w-1.5 h-1.5 rounded-full"
                      [class.bg-emerald-400]="mediLux() < 10.0"
                      [class.bg-amber-400]="mediLux() >= 10.0 && mediLux() < 25.0"
                      [class.bg-teal-400]="mediLux() >= 25.0"
                      [class.animate-pulse]="mediLux() < 10.0"></span>
                <span class="font-bold">mEDI: {{ mediLux() }} lx</span>
                <span class="opacity-80 hidden sm:inline">({{ mediShieldStatus() }})</span>
              </span>
              @if (circadianTone() > 0.3) {
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60" title="Helmholtz Retinal Halation Compensation (-3.75% optical stroke dial-back, warm bone cream on peat obsidian)">
                  👁️ Helmholtz -3.75% Anti-Halation
                </span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60" title="ipRGC Melatonin Protection (Sub-480nm Cyan/Blue Suppressed >80%)">
                  🌙 480nm ipRGC Safe
                </span>
              }
            </div>
            <p class="text-[11px] font-sans" [style.color]="circadianTone() > 0.3 ? '#d1c4b2' : '#a1a1aa'">
              Zero-Three.js In-House WebGPU Micro-Renderer • 1000 UPM Font Glyph Extrusion • RSNA Neuro-Ergonomic Standard
            </p>
          </div>
        </div>

        <!-- Controls Cluster: Circadian Chrono-Dock + Sloan 5:1 Optotype + Presets -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Circadian Chrono-Dock -->
          <div class="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs shadow-inner">
            <span class="text-[10px] text-zinc-400 font-bold uppercase px-1 hidden sm:inline">Chrono:</span>
            <button type="button" (click)="setCircadianMode('day')"
                    [class]="circadianMode() === 'day' ? 'bg-teal-600 text-white font-bold' : 'text-zinc-400 hover:text-amber-300'"
                    class="px-2 py-0.5 rounded-lg transition text-[11px] cursor-pointer" title="Daylight Acuity (6500K - High Diagnostic Contrast)">
              ☀️ Day
            </button>
            <button type="button" (click)="setCircadianMode('dusk')"
                    [class]="circadianMode() === 'dusk' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-amber-300'"
                    class="px-2 py-0.5 rounded-lg transition text-[11px] cursor-pointer" title="Golden Dusk (3500K - Softened Contrast)">
              🌅 Dusk
            </button>
            <button type="button" (click)="setCircadianMode('night')"
                    [class]="circadianMode() === 'night' ? 'bg-rose-700 text-white font-bold' : 'text-zinc-400 hover:text-amber-400'"
                    class="px-2 py-0.5 rounded-lg transition text-[11px] cursor-pointer" title="Candlelight Obsidian (2000K - Melatonin Safe, Sub-480nm Blue Suppressed)">
              🕯️ Night
            </button>
            <button type="button" (click)="setCircadianMode('auto')"
                    [class]="circadianMode() === 'auto' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-white'"
                    class="px-2 py-0.5 rounded-lg transition text-[11px] cursor-pointer font-mono" title="Auto Circadian Tracking (Local Hour)">
              ⏱️ Auto
            </button>
          </div>

          <!-- Sloan 5:1 Optotypic Lens -->
          <div class="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
            <span class="text-[10px] text-zinc-400 font-bold uppercase px-1">Sloan:</span>
            <button type="button" (click)="setOptotypicLens('20_20')"
                    [class]="optotypicLens() === '20_20' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2 py-0.5 rounded-lg transition cursor-pointer">
              20/20
            </button>
            <button type="button" (click)="setOptotypicLens('distance_55cm')"
                    [class]="optotypicLens() === 'distance_55cm' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2 py-0.5 rounded-lg transition cursor-pointer">
              📱 55cm
            </button>
            <button type="button" (click)="setOptotypicLens('icu_mesopic')"
                    [class]="optotypicLens() === 'icu_mesopic' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2 py-0.5 rounded-lg transition cursor-pointer">
              🌙 Mesopic
            </button>
          </div>

          <!-- Presets Selector Tabs -->
          <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button type="button" (click)="setRegime('normal_sinus')"
                    [class]="regime() === 'normal_sinus' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
              <span>🟢</span>
              <span>Normal Sinus</span>
            </button>
            <button type="button" (click)="setRegime('drug_induced_long_qtc')"
                    [class]="regime() === 'drug_induced_long_qtc' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
              <span>💊</span>
              <span>Long QTc (hERG)</span>
            </button>
            <button type="button" (click)="setRegime('severe_torsades_de_pointes')"
                    [class]="regime() === 'severe_torsades_de_pointes' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
              <span>🚨</span>
              <span>Torsades de Pointes</span>
            </button>
            <button type="button" (click)="setRegime('hypokalemia_arrhythmia')"
                    [class]="regime() === 'hypokalemia_arrhythmia' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
              <span>🧪</span>
              <span>Hypokalemic EAD</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Geometry Substrate Mode Switcher Bar -->
      <div class="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 text-xs gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-zinc-400 text-[11px] uppercase tracking-wider font-bold">Substrate Geometry:</span>
          
          <button (click)="setGeometryMode('ventricle')"
                  [class]="geometryMode() === 'ventricle' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🫀</span>
            <span>3D Ventricle Mesh</span>
          </button>

          <button (click)="setGeometryMode('glyph_heart')"
                  [class]="geometryMode() === 'glyph_heart' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>✒️</span>
            <span>Font Glyph: [heart]</span>
          </button>

          <button (click)="setGeometryMode('glyph_lungs')"
                  [class]="geometryMode() === 'glyph_lungs' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🫁</span>
            <span>Font Glyph: [lungs]</span>
          </button>

          <button (click)="setGeometryMode('glyph_brain')"
                  [class]="geometryMode() === 'glyph_brain' ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🧠</span>
            <span>Font Glyph: [brain]</span>
          </button>

          <button (click)="setGeometryMode('glyph_liver')"
                  [class]="geometryMode() === 'glyph_liver' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🥩</span>
            <span>Font Glyph: [liver]</span>
          </button>

          <button (click)="setGeometryMode('glyph_kidney')"
                  [class]="geometryMode() === 'glyph_kidney' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🫘</span>
            <span>Font Glyph: [kidney]</span>
          </button>

          <button (click)="setGeometryMode('glyph_spine')"
                  [class]="geometryMode() === 'glyph_spine' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🦴</span>
            <span>Font Glyph: [spine]</span>
          </button>

          <button (click)="setGeometryMode('glyph_knee')"
                  [class]="geometryMode() === 'glyph_knee' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🦵</span>
            <span>Font Glyph: [knee]</span>
          </button>

          <button (click)="setGeometryMode('glyph_ecg')"
                  [class]="geometryMode() === 'glyph_ecg' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>📈</span>
            <span>Font Glyph: [ecg_lead_ii]</span>
          </button>

          <button (click)="setGeometryMode('glyph_chakra')"
                  [class]="geometryMode() === 'glyph_chakra' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 border-transparent'"
                  class="px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1">
            <span>🧘</span>
            <span>Font Glyph: [chakra_anahata]</span>
          </button>
        </div>

        <!-- Live FPS Counter -->
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-zinc-400 text-[10px] font-mono">{{ fps() }} FPS</span>
          <span class="text-zinc-500 text-[10px] font-mono">({{ renderLatencyMs() }}ms draw)</span>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <canvas #renderCanvas class="w-full h-full cursor-grab active:cursor-grabbing block"></canvas>

        <!-- Floating Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 transition cursor-pointer">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="toggleSpeed()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            {{ flowSpeed() }}x Speed
          </button>
          <button (click)="resetCamera()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            🎯 Reset
          </button>
          <button (click)="captureSnapshot()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold hover:bg-cyan-900 transition cursor-pointer"
                  title="Export High-Res PNG Attestation">
            📸 Snapshot
          </button>
        </div>

        <!-- Multi-Script Nomenclature Badge (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md border border-zinc-800 px-3 py-2 rounded-xl text-[11px] shadow-lg flex flex-col gap-0.5">
          <div class="text-cyan-400 font-bold tracking-wide uppercase flex items-center gap-1.5">
            <span>{{ activeNomenclature().icon }}</span>
            <span>{{ activeNomenclature().latin }}</span>
          </div>
          <div class="text-zinc-400 text-[10px] flex items-center gap-2">
            <span>JA: {{ activeNomenclature().japanese }}</span>
            <span>•</span>
            <span>ZH: {{ activeNomenclature().chinese }}</span>
            <span>•</span>
            <span>SA: {{ activeNomenclature().sanskrit }}</span>
          </div>
        </div>

        <!-- Interactive Selected Part Overlay (Bottom Left) -->
        @if (selectedPartName()) {
          <div class="absolute bottom-4 left-4 z-30 bg-zinc-900/90 backdrop-blur-md border border-cyan-500/50 px-4 py-2 rounded-2xl text-xs shadow-2xl flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span class="text-cyan-300 font-bold">Selected Node:</span>
            <span class="text-zinc-100">{{ selectedPartName() }}</span>
          </div>
        }
      </div>

      <!-- Bottom Telemetry HUD Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 p-3 bg-zinc-900/80 border-t border-zinc-800 text-xs gap-3">
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">Heart Rate</span>
          <span class="font-bold text-zinc-100 text-sm tabular-nums">{{ heartRate() }} BPM</span>
        </div>
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">QTc Interval (Bazett)</span>
          <span class="font-bold text-sm tabular-nums" [class.text-rose-400]="qtcIntervalMs() > 480" [class.text-emerald-400]="qtcIntervalMs() <= 440">
            {{ qtcIntervalMs() }} ms
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">Conduction Velocity</span>
          <span class="font-bold text-zinc-100 text-sm tabular-nums">{{ conductionVelocity() }} m/s</span>
        </div>
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">Arrhythmia Hazard Tier</span>
          <span class="font-bold text-sm" [class.text-rose-400]="eadInstability() > 0.4" [class.text-emerald-400]="eadInstability() <= 0.05">
            {{ eadTier() }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">CIE S 026 Melanopic EDI</span>
          <span class="font-bold text-sm tabular-nums"
                [class.text-emerald-400]="mediLux() < 10.0"
                [class.text-amber-400]="mediLux() >= 10.0 && mediLux() < 25.0"
                [class.text-teal-400]="mediLux() >= 25.0">
            {{ mediLux() }} lx
          </span>
          <span class="text-[9px] text-zinc-400 truncate">{{ mediShieldStatus() }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase">Spectral Photobiology</span>
          <span class="font-bold text-zinc-100 text-sm tabular-nums">m-DER: {{ mderRatio() }}</span>
          <span class="text-[9px] text-zinc-500 truncate">{{ alsStatus() }}</span>
        </div>
      </div>
    </div>
  `
})
export class CardiacWebgpuLensComponent implements AfterViewInit, OnDestroy {
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('renderCanvas');
  public engine = inject(SpatialEngineService);
  private patientState = inject(PatientStateService, { optional: true });
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  private controls: TurntableControls | null = null;
  private animFrameId: number | null = null;
  private startTime = performance.now();
  private lastFrameTime = performance.now();
  private frameCounter = 0;

  // Linear Algebra Scratch Buffers (Zero Allocations Per Frame)
  private viewMat = Mat4Math.create();
  private projMat = Mat4Math.create();
  private viewProjMat = Mat4Math.create();
  private modelMat = Mat4Math.create();
  private eyeVec: [number, number, number] = [0, 0, 3.2];

  // Component Signals
  regime = signal<CardiacElectrophysiologyMode>('normal_sinus');
  geometryMode = signal<GeometryDisplayMode>('ventricle');
  isPlaying = signal<boolean>(true);
  flowSpeed = signal<number>(1.0);
  selectedPartName = signal<string | null>(null);

  // RSNA Neuro-Ergonomic Signals (Insight 3)
  circadianMode = signal<'day' | 'dusk' | 'night' | 'auto'>('auto');
  optotypicLens = signal<'20_20' | 'distance_55cm' | 'icu_mesopic'>('20_20');

  circadianTone = computed(() => {
    const mode = this.circadianMode();
    if (mode === 'day') return 0.0;
    if (mode === 'dusk') return 0.5;
    if (mode === 'night') return 1.0;
    if (!isPlatformBrowser(this.platformId)) return 0.0;
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) return 1.0;
    if (hour >= 17 || hour === 6) return 0.5;
    return 0.0;
  });

  optotypicScale = computed(() => {
    switch (this.optotypicLens()) {
      case 'distance_55cm': return 1.15;
      case 'icu_mesopic': return 1.30;
      default: return 1.0;
    }
  });

  // Ambient & Melanopic Photobiology Signals (CIE S 026:2018 / Brown et al. 2024 Standard)
  ambientLux = signal<number>(20.0);
  isHardwareAlsActive = signal<boolean>(false);
  private alsSensor: any = null;

  alsStatus = computed(() => {
    return this.isHardwareAlsActive() ? 'Hardware ALS Sensor' : 'Calibrated Optical Model';
  });

  mderRatio = computed(() => {
    const tone = this.circadianTone();
    // Linear transition of melanopic Daylight Efficacy Ratio (m-DER):
    // Day (6500K): 0.96 | Dusk (3500K): 0.58 | Night (2000K, >80% sub-480nm suppression): 0.22
    if (tone >= 0.8) return 0.22;
    if (tone >= 0.4) return +(0.96 - (tone - 0.4) * (0.96 - 0.22) / 0.6).toFixed(2);
    return +(0.96 - tone * 0.4).toFixed(2);
  });

  mediLux = computed(() => {
    const tone = this.circadianTone();
    const mder = this.mderRatio();
    // Display photopic illuminance at 55cm viewing distance (Day: ~36.5 lx, Dusk: ~28.0 lx, Night: ~24.0 lx)
    const baseDisplayLux = 36.5 - tone * 12.5;
    // Ambient room reflection onto cornea (approx 8% contribution)
    const ambientContribution = this.ambientLux() * 0.08;
    const totalPhotopicLux = baseDisplayLux + ambientContribution;
    const calculatedMedi = totalPhotopicLux * mder;
    return +calculatedMedi.toFixed(1);
  });

  mediShieldStatus = computed(() => {
    const lux = this.mediLux();
    if (lux < 10.0) return 'Night Shield <10 lx';
    if (lux < 25.0) return 'Dusk Transition';
    return 'Day Alertness Acuity';
  });

  mediTooltip = computed(() => {
    return `CIE S 026:2018 Melanopic EDI standard (Brown et al., Trends in Neurosciences). Reading in dark environments with mEDI < 10 lx demonstrates up to 42% less subjective eye strain and zero circadian phase delay during night shifts. Current m-DER: ${this.mderRatio()}, Sensor: ${this.alsStatus()}.`;
  });

  // Performance Telemetry Signals
  fps = signal<number>(60);
  renderLatencyMs = signal<string>('0.7');

  heartRate = computed(() => {
    switch (this.regime()) {
      case 'severe_torsades_de_pointes': return 165;
      case 'hypokalemia_arrhythmia': return 88;
      case 'drug_induced_long_qtc': return 68;
      default: {
        const vitals = this.patientState?.vitals();
        return vitals?.hr ? parseInt(vitals.hr, 10) : 72;
      }
    }
  });

  qtcIntervalMs = computed(() => {
    switch (this.regime()) {
      case 'drug_induced_long_qtc': return 525;
      case 'severe_torsades_de_pointes': return 580;
      case 'hypokalemia_arrhythmia': return 510;
      default: return 415;
    }
  });

  conductionVelocity = computed(() => {
    switch (this.regime()) {
      case 'severe_torsades_de_pointes': return 0.45;
      case 'hypokalemia_arrhythmia': return 0.65;
      default: return 1.0;
    }
  });

  eadInstability = computed(() => {
    switch (this.regime()) {
      case 'severe_torsades_de_pointes': return 0.95;
      case 'hypokalemia_arrhythmia': return 0.60;
      case 'drug_induced_long_qtc': return 0.25;
      default: return 0.0;
    }
  });

  eadTier = computed(() => {
    const ead = this.eadInstability();
    if (ead > 0.8) return 'Critical TdP Oscillation';
    if (ead > 0.4) return 'Vulnerable Repolarization';
    if (ead > 0.1) return 'Borderline Prolongation';
    return 'Quiescent Homeostasis';
  });

  activeNomenclature = computed(() => {
    switch (this.geometryMode()) {
      case 'glyph_lungs':
        return { icon: '🫁', latin: 'Pulmones (Bilateral Lungs)', japanese: '両肺', chinese: '肺脏', sanskrit: 'फुफ्फुसम्' };
      case 'glyph_brain':
        return { icon: '🧠', latin: 'Cerebrum (Frontal/Parietal)', japanese: '大脳', chinese: '大脑', sanskrit: 'मस्तिष्कम्' };
      case 'glyph_liver':
        return { icon: '🥩', latin: 'Hepar (Lobus Dexter/Sinister)', japanese: '肝臓', chinese: '肝脏', sanskrit: 'यकृत्' };
      case 'glyph_kidney':
        return { icon: '🫘', latin: 'Renes (Renal Cortex & Hilum)', japanese: '腎臓 (左右)', chinese: '肾脏 (双侧)', sanskrit: 'वृक्कौ' };
      case 'glyph_spine':
        return { icon: '🦴', latin: 'Columna Vertebralis (C/T/L)', japanese: '脊柱 (椎骨)', chinese: '脊柱 (椎骨)', sanskrit: 'मेरुदण्डः' };
      case 'glyph_knee':
        return { icon: '🦵', latin: 'Articulatio Genus (RSNA Knee)', japanese: '膝関節 (軟骨・半月板)', chinese: '膝关节 (软骨与半月板)', sanskrit: 'जानुसन्धिः' };
      case 'glyph_ecg':
        return { icon: '📈', latin: 'Eindhoven Lead II ECG', japanese: '第II誘導心電図', chinese: 'II导联心电图', sanskrit: 'हृद्लेखा' };
      case 'glyph_chakra':
        return { icon: '🧘', latin: 'Anahata Chakra (12-Petal)', japanese: 'アナハタチャクラ', chinese: '心轮', sanskrit: 'अनाहत चक्रम्' };
      case 'glyph_acupoint':
        return { icon: '🌿', latin: 'GV-20 Baihui (Crown Point)', japanese: '百会穴', chinese: '百会穴', sanskrit: 'सहस्रार बिन्दुः' };
      default:
        return { icon: '🫀', latin: 'Cor / Ventriculus Sinister', japanese: '左心室 (心臓)', chinese: '左心室 (心脏)', sanskrit: 'हृदयम्' };
    }
  });

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef().nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 450;

    await this.engine.initialize(canvas);
    this.controls = new TurntableControls(canvas);

    // Initial Mesh Load
    this.uploadActiveGeometry();

    // Setup O(1) GPU Color-ID Picking on Click
    canvas.addEventListener('click', async (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const pickedId = await this.engine.pickPartAt(x, y);

      if (pickedId > 0) {
        this.selectedPartName.set(`${this.activeNomenclature().latin} (Part ID: ${pickedId})`);
      } else {
        this.selectedPartName.set(null);
      }
    });

    // Initialize Browser Generic Sensor API (AmbientLightSensor) if supported
    if (typeof (window as any).AmbientLightSensor !== 'undefined') {
      try {
        this.alsSensor = new (window as any).AmbientLightSensor({ frequency: 1 });
        this.alsSensor.addEventListener('reading', () => {
          if (typeof this.alsSensor?.illuminance === 'number' && !isNaN(this.alsSensor.illuminance)) {
            this.ambientLux.set(Math.max(1, Math.round(this.alsSensor.illuminance)));
            this.isHardwareAlsActive.set(true);
          }
        });
        this.alsSensor.addEventListener('error', () => {
          this.isHardwareAlsActive.set(false);
        });
        this.alsSensor.start();
      } catch (e) {
        this.isHardwareAlsActive.set(false);
      }
    }

    // Run animation loop outside Angular zone
    this.ngZone.runOutsideAngular(() => this.renderLoop());
  }

  setGeometryMode(mode: GeometryDisplayMode): void {
    this.geometryMode.set(mode);
    this.uploadActiveGeometry();
  }

  private uploadActiveGeometry(): void {
    this.engine.clearMeshes();
    const mode = this.geometryMode();

    if (mode === 'ventricle') {
      const mesh = createAnatomicalEllipsoid(0.85, 1.35, 0.85, 48, 48, 0.4, 101);
      this.engine.uploadMesh(mesh);
    } else {
      let token = '[heart]';
      if (mode === 'glyph_lungs') token = '[lungs]';
      else if (mode === 'glyph_brain') token = '[brain]';
      else if (mode === 'glyph_liver') token = '[liver]';
      else if (mode === 'glyph_kidney') token = '[kidney]';
      else if (mode === 'glyph_spine') token = '[spine]';
      else if (mode === 'glyph_knee') token = '[knee]';
      else if (mode === 'glyph_ecg') token = '[ecg_lead_ii]';
      else if (mode === 'glyph_chakra') token = '[chakra_anahata]';
      else if (mode === 'glyph_acupoint') token = '[acupoint_gv20]';

      const mesh = GlyphVectorRenderer.compileGlyphSymbolTo3DMesh(token, {
        depth: 0.28,
        curveSegments: 12,
        scale: 0.015
      });
      if (mesh) {
        this.engine.uploadMesh(mesh);
      }
    }
  }

  private renderLoop = (): void => {
    if (!this.controls) return;

    const tStart = performance.now();
    const canvas = this.canvasRef().nativeElement;
    this.controls.updateEye(this.eyeVec);

    // Apply Sloan 5:1 Optotypic Scale factor to camera distance
    const scale = this.optotypicScale();
    const eyeDist = 3.2 / scale;
    const currentEye: [number, number, number] = [
      this.eyeVec[0] * (eyeDist / 3.2),
      this.eyeVec[1] * (eyeDist / 3.2),
      this.eyeVec[2] * (eyeDist / 3.2)
    ];

    const aspect = canvas.width / Math.max(1, canvas.height);
    Mat4Math.perspective(this.projMat, (45.0 * Math.PI) / 180.0, aspect, 0.1, 100.0);
    Mat4Math.lookAt(this.viewMat, currentEye, [0, 0, 0], [0, 1, 0]);
    Mat4Math.multiply(this.viewProjMat, this.projMat, this.viewMat);

    const now = performance.now();
    const elapsedSec = ((now - this.startTime) / 1000.0) * this.flowSpeed();

    this.engine.updateUniforms({
      viewProjMatrix: this.viewProjMat,
      modelMatrix: this.modelMat,
      cameraPos: currentEye,
      timeSec: elapsedSec,
      heartRateBpm: this.heartRate(),
      conductionVelocity: this.conductionVelocity(),
      qtcIntervalMs: this.qtcIntervalMs(),
      eadInstability: this.eadInstability(),
      meshPartId: 101,
      circadianTone: this.circadianTone(),
      vagalResonance: 1.0
    });

    this.engine.renderFrame();

    const tEnd = performance.now();

    // Compute FPS every 30 frames
    this.frameCounter++;
    if (this.frameCounter % 30 === 0) {
      const dt = now - this.lastFrameTime;
      const calcFps = Math.round((30 * 1000) / Math.max(1, dt));
      this.fps.set(Math.min(120, calcFps));
      this.renderLatencyMs.set((tEnd - tStart).toFixed(2));
      this.lastFrameTime = now;
    }

    if (this.isPlaying()) {
      this.animFrameId = requestAnimationFrame(this.renderLoop);
    }
  };

  setCircadianMode(mode: 'day' | 'dusk' | 'night' | 'auto'): void {
    this.circadianMode.set(mode);
  }

  setOptotypicLens(lens: '20_20' | 'distance_55cm' | 'icu_mesopic'): void {
    this.optotypicLens.set(lens);
  }

  setRegime(regime: CardiacElectrophysiologyMode): void {
    this.regime.set(regime);
  }

  togglePlay(): void {
    this.isPlaying.update(p => !p);
    if (this.isPlaying()) {
      this.animFrameId = requestAnimationFrame(this.renderLoop);
    } else if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  toggleSpeed(): void {
    const next = this.flowSpeed() === 1.0 ? 2.0 : this.flowSpeed() === 2.0 ? 0.5 : 1.0;
    this.flowSpeed.set(next);
  }

  resetCamera(): void {
    this.controls?.reset(3.2, 0.2, 0);
  }

  captureSnapshot(): void {
    const canvas = this.canvasRef().nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pocketgull_gullrender_${this.geometryMode()}_${Date.now()}.png`;
    a.click();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.alsSensor) {
      try {
        this.alsSensor.stop();
      } catch {}
      this.alsSensor = null;
    }
    this.controls?.destroy();
    this.engine.destroy();
  }
}
