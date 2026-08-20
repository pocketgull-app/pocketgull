import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { IBodyPartIssue } from '../../services/patient.types';
import { PatientManagementService } from '../../services/patient-management.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';
import { GenesisBiophysicalSubstrateComponent } from './genesis-biophysical-substrate.component';
import { ThemeService } from '../../services/theme.service';
import { TypographicAnatomyService } from '../../services/typographic-anatomy.service';
import { CellularBiophysicsViewerComponent } from '../shared/cellular-biophysics-viewer.component';
import { QuadPhilosophyMatrixComponent } from '../shared/quad-philosophy-matrix.component';
import { ImmunoOncologyTmeViewerComponent } from '../shared/immuno-oncology-tme-viewer.component';
import { AwcimIntegrativePrescriberComponent } from '../shared/awcim-integrative-prescriber.component';

@Component({
  selector: 'app-body-viewer',
  standalone: true,
  imports: [
    CommonModule, 
    Body3DViewerComponent, 
    GenesisBiophysicalSubstrateComponent,
    CellularBiophysicsViewerComponent,
    QuadPhilosophyMatrixComponent,
    ImmunoOncologyTmeViewerComponent,
    AwcimIntegrativePrescriberComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `    
    <div class="flex flex-col h-full w-full bg-white/70 dark:bg-zinc-900 backdrop-blur-[12px] text-gray-900 dark:text-zinc-100 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-xl font-sans relative pocket-gull-card">
      
      <!-- Tooltip -->
      @if (tooltipVisible()) {
        <div class="absolute bg-[#1C1C1C] text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl pointer-events-none shadow-lg z-50 border border-white/20"
             [style.left.px]="tooltipX()"
             [style.top.px]="tooltipY()"
             [style.transform]="'translate(-50%, 0)'">
          {{ tooltipText() }}
        </div>
      }

      <!-- 1. Top Dedicated Header Bar (Standardized with Medical Analysis Pocket-Gull Cards) -->
      <div class="px-4 py-3 sm:px-6 sm:py-3.5 bg-gray-50/80 dark:bg-zinc-900/90 border-b border-gray-200 dark:border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 no-print z-20">
        
        <div class="flex items-center gap-2">
          <span class="text-lg">👤</span>
          <div>
            <h3 class="text-sm font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wide">Interactive Body Twin &amp; Multi-Scale Suite</h3>
            <p class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">Macro Anatomy • Cellular Biophysics • Quad-Tradition Crosswalk • Immuno-Oncology</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Multi-Scale Viewport Mode Switcher (Tap-Target Friendly min 44px) -->
          <div class="flex items-center gap-1 bg-gray-200/80 dark:bg-zinc-950 p-1.5 rounded-xl border border-gray-300/80 dark:border-zinc-800 text-xs font-mono flex-wrap">
            <button (click)="state.bodyViewerMode.set('3d')" 
                    [class.bg-teal-600]="state.bodyViewerMode() === '3d'" 
                    [class.text-white]="state.bodyViewerMode() === '3d'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== '3d'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== '3d'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🧊</span> 3D Whole-Body
            </button>
            <button (click)="state.bodyViewerMode.set('2d')" 
                    [class.bg-sky-600]="state.bodyViewerMode() === '2d'" 
                    [class.text-white]="state.bodyViewerMode() === '2d'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== '2d'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== '2d'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🗺️</span> 2D Atlas
            </button>
            <button (click)="state.bodyViewerMode.set('cellular')" 
                    [class.bg-cyan-600]="state.bodyViewerMode() === 'cellular'" 
                    [class.text-white]="state.bodyViewerMode() === 'cellular'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'cellular'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'cellular'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🔬</span> Cellular 3D
            </button>
            <button (click)="state.bodyViewerMode.set('quad')" 
                    [class.bg-purple-600]="state.bodyViewerMode() === 'quad'" 
                    [class.text-white]="state.bodyViewerMode() === 'quad'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'quad'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'quad'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🏛️</span> 4-Way Matrix
            </button>
            <button (click)="state.bodyViewerMode.set('tme')" 
                    [class.bg-rose-600]="state.bodyViewerMode() === 'tme'" 
                    [class.text-white]="state.bodyViewerMode() === 'tme'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'tme'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'tme'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🎯</span> Immuno-Oncology
            </button>
            <button (click)="state.bodyViewerMode.set('awcim')" 
                    [class.bg-emerald-600]="state.bodyViewerMode() === 'awcim'" 
                    [class.text-white]="state.bodyViewerMode() === 'awcim'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'awcim'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'awcim'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🌿</span> AWCIM Lab
            </button>
            <button (click)="state.bodyViewerMode.set('genesis')" 
                    [class.bg-amber-600]="state.bodyViewerMode() === 'genesis'" 
                    [class.text-white]="state.bodyViewerMode() === 'genesis'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'genesis'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'genesis'" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🧬</span> Genesis Substrate
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative flex items-center bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-xl px-3 py-1.5 w-full sm:w-56 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 dark:text-zinc-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              [value]="searchQuery()" 
              (input)="onSearchInput($event)" 
              placeholder="Search organ, acupoint..." 
              class="w-full bg-transparent text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none font-medium" />
            @if (searchQuery()) {
              <button (click)="clearSearch()" class="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            }
          </div>

          <!-- Paradigm Lens Selector Bar (Tap-Target Friendly & Dual Light/Dark Theme) -->
          <div class="flex items-center gap-1.5 bg-gray-200/80 dark:bg-zinc-950 p-1.5 rounded-lg border border-gray-300/80 dark:border-zinc-800 text-xs font-mono">
            <button (click)="state.selectPhilosophy('western')" [class.bg-sky-600]="state.activePhilosophy() === 'western'" [class.text-white]="state.activePhilosophy() === 'western'" [class.text-gray-700]="state.activePhilosophy() !== 'western'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'western'" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🩺 Western
            </button>
            <button (click)="state.selectPhilosophy('eastern')" [class.bg-emerald-700]="state.activePhilosophy() === 'eastern'" [class.text-white]="state.activePhilosophy() === 'eastern'" [class.text-gray-700]="state.activePhilosophy() !== 'eastern'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'eastern'" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🌿 TCM
            </button>
            <button (click)="state.selectPhilosophy('ayurvedic')" [class.bg-amber-600]="state.activePhilosophy() === 'ayurvedic'" [class.text-white]="state.activePhilosophy() === 'ayurvedic'" [class.text-gray-700]="state.activePhilosophy() !== 'ayurvedic'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'ayurvedic'" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🪷 Ayurvedic
            </button>
            <button (click)="state.selectPhilosophy('osteopathic')" [class.bg-purple-600]="state.activePhilosophy() === 'osteopathic'" [class.text-white]="state.activePhilosophy() === 'osteopathic'" [class.text-gray-700]="state.activePhilosophy() !== 'osteopathic'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'osteopathic'" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🦴 Osteopathic
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Center 3D Viewport Window -->

      <!-- Live Search Dropdown (Dual Light/Dark Theme) -->
      @if (isSearchOpen() || filteredParts().length > 0 && searchQuery().trim()) {
        <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 p-2 max-h-[220px] overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 z-30 shadow-lg">
          @for (part of filteredParts(); track part.id) {
            <button (click)="onPartSearchResultClick(part)" 
                    class="w-full text-left px-4 py-3 min-h-[44px] text-xs flex items-center justify-between hover:bg-emerald-500/10 transition-colors group rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-lg">{{ part.icon }}</span>
                <div>
                  <div class="font-bold text-gray-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{{ part.name }}</div>
                  <div class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono uppercase tracking-wider">{{ part.system }}</div>
                </div>
              </div>
            </button>
          }
        </div>
      }

      <!-- 2. Center 3D Viewport Window (Holographic Diagnostic Twin - Luminous Papyrus/Light Canvas) -->
      <div class="flex-1 w-full relative min-h-[540px] sm:min-h-[640px] overflow-hidden bg-transparent border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl thematic-3d-container flex flex-col">
        @if (state.bodyViewerMode() === '3d') {
          @defer {
            <app-body-3d-viewer 
              class="w-full h-full flex-1 flex flex-col min-h-[540px]"
              [anatomyViewMode]="state.anatomyViewMode()"
              [customModelUrl]="null"
              (partSelected)="onPartSelected($event)">
            </app-body-3d-viewer>
          } @placeholder {
            <div class="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <div class="w-8 h-8 rounded-sm border-2 border-zinc-700 border-t-teal-500 animate-spin"></div>
              <p class="text-sm font-medium uppercase tracking-widest text-zinc-400">Loading 3D Engine...</p>
            </div>
          }
        } @else if (state.bodyViewerMode() === 'cellular') {
          <div class="w-full h-full flex-1 overflow-y-auto p-4 bg-slate-950/60">
            <app-cellular-biophysics-viewer class="w-full block"></app-cellular-biophysics-viewer>
          </div>
        } @else if (state.bodyViewerMode() === 'quad') {
          <div class="w-full h-full flex-1 overflow-y-auto p-4 bg-slate-950/60">
            <app-quad-philosophy-matrix class="w-full block"></app-quad-philosophy-matrix>
          </div>
        } @else if (state.bodyViewerMode() === 'tme') {
          <div class="w-full h-full flex-1 overflow-y-auto p-4 bg-slate-950/60">
            <app-immuno-oncology-tme-viewer class="w-full block"></app-immuno-oncology-tme-viewer>
          </div>
        } @else if (state.bodyViewerMode() === 'awcim') {
          <div class="w-full h-full flex-1 overflow-y-auto p-4 bg-slate-950/60">
            <app-awcim-integrative-prescriber class="w-full block"></app-awcim-integrative-prescriber>
          </div>
        } @else if (state.bodyViewerMode() === 'genesis') {
          <div class="w-full h-full flex-1 flex flex-col min-h-[540px]">
            <div class="p-3 bg-amber-950/40 border-b border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between gap-2 shrink-0">
              <div class="flex items-center gap-2">
                <span>🧬</span>
                <span><strong>Genesis Biophysical Substrate Lens:</strong> PBR Optical Physics &amp; Microscopic Tissue Simulation (Bone Trabeculae $\\Delta$BMD, Endothelial Shear Stress, Dental SIBI).</span>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">Edwin Smith Codex</span>
            </div>
            <app-genesis-biophysical-substrate class="w-full h-full flex-1 flex flex-col"></app-genesis-biophysical-substrate>
          </div>
        } @else {
          <!-- 2D SVG Schematic (Redrawn Holographic Medical Vector Twin) -->
          <div class="h-full w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-slate-900/50 via-zinc-900/40 to-slate-950/60 rounded-xl">
            <!-- Background Radial Glow -->
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none"></div>

            <svg viewBox="0 0 200 450" class="h-full w-auto relative z-10 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <defs>
                <!-- Skin Gradient -->
                <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
                  <stop offset="50%" stop-color="#0284c7" stop-opacity="0.15" />
                  <stop offset="100%" stop-color="#0369a1" stop-opacity="0.30" />
                </linearGradient>

                <!-- Muscle Gradient -->
                <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#0d9488" stop-opacity="0.6" />
                  <stop offset="100%" stop-color="#115e59" stop-opacity="0.8" />
                </linearGradient>

                <!-- Organ Gradients -->
                <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.9" />
                  <stop offset="70%" stop-color="#e11d48" stop-opacity="0.6" />
                  <stop offset="100%" stop-color="#881337" stop-opacity="0.2" />
                </radialGradient>

                <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.7" />
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0.2" />
                </radialGradient>

                <!-- Chakra Glow Filter -->
                <filter id="chakraGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <!-- 🔤 Typographic Anatomy Text Paths -->
                @for (part of typographicAnatomy.parts; track part.id) {
                  <path [attr.id]="'typo-path-' + part.id" [attr.d]="part.pathD" fill="none" />
                }
              </defs>

              <g [attr.transform]="bodyTransform()">
                @if (view() === 'front') {
                  <g id="static-anatomy-front">
                    <!-- 1. SKIN BASE CONTOUR (Anatomically Proportional Body Outline) -->
                    <path class="skin-base fill-[url(#skinGradient)] stroke-sky-400/40 stroke-[1.5] transition-all duration-500" 
                          [attr.d]="fullBodySkinPathFront()" 
                          [class.opacity-20]="state.anatomyViewMode() !== 'skin' && state.anatomyViewMode() !== 'typographic'"
                          [class.opacity-10]="state.anatomyViewMode() === 'typographic'" />

                    <!-- 2. MUSCLE LAYER (Pectoralis, Abdominals, Quadriceps, Deltoids) -->
                    <g class="muscle-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'muscle'" 
                       [class.opacity-0]="state.anatomyViewMode() !== 'muscle'">
                      <!-- Deltoids -->
                      <path d="M 68 70 Q 55 90 62 110 Q 75 105 78 85 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <path d="M 132 70 Q 145 90 138 110 Q 125 105 122 85 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <!-- Pectoralis Major -->
                      <path d="M 78 80 Q 100 85 100 110 Q 82 115 78 95 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <path d="M 122 80 Q 100 85 100 110 Q 118 115 122 95 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <!-- Rectus Abdominis Six-Pack -->
                      <path d="M 88 115 H 112 V 130 H 88 Z M 88 133 H 112 V 148 H 88 Z M 88 151 H 112 V 166 H 88 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <!-- Biceps -->
                      <path d="M 62 112 Q 52 135 60 155 Q 70 150 72 125 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <path d="M 138 112 Q 148 135 140 155 Q 130 150 128 125 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <!-- Quadriceps Femoris -->
                      <path d="M 82 215 Q 75 255 88 290 Q 98 285 96 230 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                      <path d="M 118 215 Q 125 255 112 290 Q 102 285 104 230 Z" fill="url(#muscleGradient)" stroke="#14b8a6" stroke-width="0.75" />
                    </g>

                    <!-- 3. SKELETON LAYER (Cranium, Rib Cage, Spine, Pelvis, Limbs) -->
                    <g class="skeleton-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'skeleton'" 
                       [class.opacity-20]="state.anatomyViewMode() !== 'skeleton'">
                      <!-- Cranium & Jaw -->
                      <path class="skeleton-path" d="M 100 18 C 88 18 84 26 84 38 C 84 46 88 52 92 56 C 96 60 104 60 108 56 C 112 52 116 46 116 38 C 116 26 112 18 100 18 Z" stroke="#e2e8f0" stroke-width="1.5" fill="none" />
                      <path class="skeleton-path" d="M 94 56 L 96 64 H 104 L 106 56" stroke="#cbd5e1" stroke-width="1" fill="none" />
                      <!-- Cervical & Thoracic Spine -->
                      <path class="skeleton-path" d="M 100 65 V 205" stroke="#e2e8f0" stroke-dasharray="2,2" stroke-width="2" />
                      <!-- Clavicles -->
                      <path class="skeleton-path" d="M 100 70 Q 82 68 70 72 M 100 70 Q 118 68 130 72" stroke="#e2e8f0" stroke-width="1.8" fill="none" />
                      <!-- Sternum & Rib Cage -->
                      <path class="skeleton-path" d="M 100 75 V 125" stroke="#f8fafc" stroke-width="3" />
                      <path class="skeleton-path" d="M 80 82 Q 95 86 100 86 Q 105 86 120 82 M 78 92 Q 95 97 100 97 Q 105 97 122 92 M 77 102 Q 95 107 100 107 Q 105 107 123 102 M 78 112 Q 95 117 100 117 Q 105 117 122 112 M 80 122 Q 95 125 100 125 Q 105 125 120 122" stroke="#cbd5e1" stroke-width="1.2" fill="none" />
                      <!-- Pelvic Girdle -->
                      <path class="skeleton-path" d="M 82 170 Q 75 190 85 205 Q 100 210 100 195 Q 100 210 115 205 Q 125 190 118 170 Z" stroke="#e2e8f0" stroke-width="1.5" fill="none" />
                      <!-- Femurs -->
                      <path class="skeleton-path" d="M 86 205 L 82 290 M 114 205 L 118 290" stroke="#f1f5f9" stroke-width="2.5" />
                      <!-- Tibia / Fibula -->
                      <path class="skeleton-path" d="M 82 295 L 75 390 M 118 295 L 125 390" stroke="#cbd5e1" stroke-width="2" />
                    </g>

                    <!-- 4. VISCERAL ORGAN LAYER (Lungs, Heart, Stomach, Liver, Kidneys) -->
                    <g class="organ-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'organs'" 
                       [class.opacity-30]="state.anatomyViewMode() !== 'organs'">
                      <!-- Right & Left Lungs -->
                      <path d="M 76 80 C 72 95 72 120 88 122 C 94 122 96 100 96 82 C 90 78 80 78 76 80 Z" fill="url(#lungGlow)" stroke="#38bdf8" stroke-width="1" class="cursor-pointer hover:opacity-100 transition-opacity" (click)="select('lungs', 'Pulmonary Lungs')" />
                      <path d="M 124 80 C 128 95 128 120 112 122 C 106 122 104 100 104 82 C 110 78 120 78 124 80 Z" fill="url(#lungGlow)" stroke="#38bdf8" stroke-width="1" class="cursor-pointer hover:opacity-100 transition-opacity" (click)="select('lungs', 'Pulmonary Lungs')" />
                      <!-- Cardiac Heart (Tilted Left) -->
                      <path d="M 94 92 C 90 85 100 80 106 90 C 112 80 120 85 116 95 C 112 108 102 116 100 118 C 98 116 92 104 94 92 Z" fill="url(#heartGlow)" stroke="#f43f5e" stroke-width="1.2" class="cursor-pointer animate-pulse" (click)="select('heart', 'Cardiac / Heart')" />
                      <!-- Liver (Right Upper Abdomen) -->
                      <path d="M 76 126 C 74 135 78 148 98 148 C 102 148 104 135 102 126 C 94 124 82 124 76 126 Z" fill="#b45309" fill-opacity="0.7" stroke="#f59e0b" stroke-width="1" class="cursor-pointer hover:opacity-100 transition-opacity" (click)="select('liver', 'Hepatic / Liver')" />
                      <!-- Stomach (Left Upper Abdomen) -->
                      <path d="M 104 126 C 104 136 110 148 122 144 C 126 138 124 128 118 126 Z" fill="#d97706" fill-opacity="0.65" stroke="#fbbf24" stroke-width="1" class="cursor-pointer hover:opacity-100 transition-opacity" (click)="select('stomach', 'Gastric / Stomach')" />
                      <!-- Bilateral Kidneys -->
                      <ellipse cx="86" cy="155" rx="5" ry="8" fill="#9f1239" fill-opacity="0.8" stroke="#f43f5e" stroke-width="0.8" class="cursor-pointer" (click)="select('kidneys', 'Renal Kidneys')" />
                      <ellipse cx="114" cy="155" rx="5" ry="8" fill="#9f1239" fill-opacity="0.8" stroke="#f43f5e" stroke-width="0.8" class="cursor-pointer" (click)="select('kidneys', 'Renal Kidneys')" />
                    </g>

                    <!-- 5. EASTERN TCM MERIDIANS & ACUPOINTS OVERLAY -->
                    <g class="tcm-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'eastern'" 
                       [class.opacity-0]="state.anatomyViewMode() !== 'eastern'">
                      <!-- Ren Mai (Conception Vessel - Central Front Meridian) -->
                      <path d="M 100 25 V 200" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,2" />
                      <!-- ST-36 Zusanli (Bilateral Leg Acupoints) -->
                      <circle cx="78" cy="305" r="4" fill="#34d399" class="cursor-pointer animate-ping" />
                      <circle cx="78" cy="305" r="3" fill="#059669" class="cursor-pointer" (click)="select('acupoint_st36', 'ST-36 Zusanli (Leg Three Miles)')" />
                      <circle cx="122" cy="305" r="4" fill="#34d399" class="cursor-pointer animate-ping" />
                      <circle cx="122" cy="305" r="3" fill="#059669" class="cursor-pointer" (click)="select('acupoint_st36', 'ST-36 Zusanli (Leg Three Miles)')" />
                      <!-- CV-12 Zhongwan (Stomach Alarm Point) -->
                      <circle cx="100" cy="135" r="3.5" fill="#10b981" class="cursor-pointer" (click)="select('acupoint_cv12', 'CV-12 Zhongwan (Middle Cavity)')" />
                      <!-- PC-6 Neiguan (Inner Pass) -->
                      <circle cx="56" cy="165" r="3" fill="#059669" class="cursor-pointer" (click)="select('acupoint_pc6', 'PC-6 Neiguan (Inner Pass)')" />
                      <circle cx="144" cy="165" r="3" fill="#059669" class="cursor-pointer" (click)="select('acupoint_pc6', 'PC-6 Neiguan (Inner Pass)')" />
                    </g>

                    <!-- 6. AYURVEDIC CHAKRA & NADIS OVERLAY -->
                    <g class="ayurvedic-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'ayurvedic'" 
                       [class.opacity-0]="state.anatomyViewMode() !== 'ayurvedic'">
                      <!-- Sushumna Nadi Core Energy Channel -->
                      <path d="M 100 20 V 205" stroke="#f59e0b" stroke-width="2" filter="url(#chakraGlow)" />
                      <!-- 7 Chakra Energy Nodes -->
                      <circle cx="100" cy="22" r="5" fill="#8b5cf6" class="cursor-pointer" (click)="select('chakra_7', 'Crown Chakra (Sahasrara)')" />
                      <circle cx="100" cy="38" r="4.5" fill="#6366f1" class="cursor-pointer" (click)="select('chakra_6', 'Third Eye Chakra (Ajna)')" />
                      <circle cx="100" cy="65" r="4.5" fill="#0ea5e9" class="cursor-pointer" (click)="select('chakra_5', 'Throat Chakra (Vishuddha)')" />
                      <circle cx="100" cy="100" r="5" fill="#10b981" class="cursor-pointer" (click)="select('chakra_4', 'Heart Chakra (Anahata)')" />
                      <circle cx="100" cy="135" r="4.5" fill="#eab308" class="cursor-pointer" (click)="select('chakra_3', 'Solar Plexus (Manipura)')" />
                      <circle cx="100" cy="165" r="4.5" fill="#f97316" class="cursor-pointer" (click)="select('chakra_2', 'Sacral Chakra (Svadhisthana)')" />
                      <circle cx="100" cy="195" r="5" fill="#ef4444" class="cursor-pointer" (click)="select('chakra_1', 'Root Chakra (Muladhara)')" />
                    </g>

                    <!-- 7. INTERACTIVE TAP REGIONS FOR ALL ANATOMICAL BODY PARTS -->
                    <g id="regions-2d-front">
                      <!-- Head & Brain -->
                      <path d="M100 18 C 88 18, 84 26, 84 38 C 84 46, 88 52, 92 56 L 94 64 H 106 L 108 56 C 112 52, 116 46, 116 38 C 116 26, 112 18, 100 18 Z" 
                            [class]="getPartClass('head')" 
                            (click)="select('head', 'Head & Brain (Cranial)')"
                            (mousemove)="showTooltip($event, 'Head & Brain (Cranial)')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Cervical Spine & Neck -->
                      <path d="M 86 58 H 114 V 72 H 86 Z" 
                            [class]="getPartClass('neck')" 
                            (click)="select('neck', 'Neck & Cervical Spine')"
                            (mousemove)="showTooltip($event, 'Neck & Cervical Spine')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Chest & Thorax -->
                      <path d="M 72 72 H 128 V 120 H 72 Z" 
                            [class]="getPartClass('chest')" 
                            (click)="select('chest', 'Chest & Thorax')"
                            (mousemove)="showTooltip($event, 'Chest & Thorax')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Abdomen & Viscera -->
                      <path d="M 76 120 H 124 V 170 H 76 Z" 
                            [class]="getPartClass('abdomen')" 
                            (click)="select('abdomen', 'Abdomen & Digestive')"
                            (mousemove)="showTooltip($event, 'Abdomen & Digestive')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Pelvis & Lumbar -->
                      <path d="M 78 170 H 122 V 205 H 78 Z" 
                            [class]="getPartClass('pelvis')" 
                            (click)="select('pelvis', 'Pelvis & Hip Girdle')"
                            (mousemove)="showTooltip($event, 'Pelvis & Hip Girdle')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Left Shoulder & Upper Arm -->
                      <path d="M 45 72 L 72 72 L 65 140 L 40 140 Z" 
                            [class]="getPartClass('shoulder_left')" 
                            (click)="select('shoulder_left', 'Left Shoulder & Biceps')"
                            (mousemove)="showTooltip($event, 'Left Shoulder & Biceps')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Right Shoulder & Upper Arm -->
                      <path d="M 128 72 L 155 72 L 160 140 L 135 140 Z" 
                            [class]="getPartClass('shoulder_right')" 
                            (click)="select('shoulder_right', 'Right Shoulder & Biceps')"
                            (mousemove)="showTooltip($event, 'Right Shoulder & Biceps')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Left Forearm & Hand -->
                      <path d="M 40 140 L 65 140 L 55 195 L 30 195 Z" 
                            [class]="getPartClass('hand_left')" 
                            (click)="select('hand_left', 'Left Forearm & Hand')"
                            (mousemove)="showTooltip($event, 'Left Forearm & Hand')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Right Forearm & Hand -->
                      <path d="M 135 140 L 160 140 L 170 195 L 145 195 Z" 
                            [class]="getPartClass('hand_right')" 
                            (click)="select('hand_right', 'Right Forearm & Hand')"
                            (mousemove)="showTooltip($event, 'Right Forearm & Hand')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Left Thigh & Leg -->
                      <path d="M 78 205 L 100 205 L 94 395 L 70 395 Z" 
                            [class]="getPartClass('leg_left')" 
                            (click)="select('leg_left', 'Left Leg & Knee')"
                            (mousemove)="showTooltip($event, 'Left Leg & Knee')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Right Thigh & Leg -->
                      <path d="M 100 205 L 122 205 L 130 395 L 106 395 Z" 
                            [class]="getPartClass('leg_right')" 
                            (click)="select('leg_right', 'Right Leg & Knee')"
                            (mousemove)="showTooltip($event, 'Right Leg & Knee')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Left Foot & Ankle -->
                      <path d="M 70 395 H 94 V 435 H 60 Z" 
                            [class]="getPartClass('foot_left')" 
                            (click)="select('foot_left', 'Left Foot & Ankle')"
                            (mousemove)="showTooltip($event, 'Left Foot & Ankle')" 
                            (mouseleave)="hideTooltip()"/>
                      <!-- Right Foot & Ankle -->
                      <path d="M 106 395 H 130 V 435 H 140 Z" 
                            [class]="getPartClass('foot_right')" 
                            (click)="select('foot_right', 'Right Foot & Ankle')"
                            (mousemove)="showTooltip($event, 'Right Foot & Ankle')" 
                            (mouseleave)="hideTooltip()"/>
                    </g>

                    <!-- 8. TYPOGRAPHIC CALLIGRAMME ANATOMY LAYER (Every Human Body Part in Vector Type) -->
                    <g class="typographic-layer transition-opacity duration-500" 
                       [class.opacity-100]="state.anatomyViewMode() === 'typographic'" 
                       [class.opacity-0]="state.anatomyViewMode() !== 'typographic'">
                      @for (part of typographicAnatomy.parts; track part.id) {
                        <text 
                          [attr.font-size]="part.fontSize"
                          [attr.font-weight]="part.weight"
                          [attr.fill]="typographicAnatomy.isPartAlerted(part) ? part.alertColor : part.defaultColor"
                          class="font-pocketgull-sans cursor-pointer hover:opacity-100 transition-all select-none drop-shadow-sm"
                          [class.animate-pulse]="typographicAnatomy.isPartAlerted(part)"
                          (click)="select(part.id, typographicAnatomy.getLabelForPart(part))"
                          (mousemove)="showTooltip($event, typographicAnatomy.getLabelForPart(part) + ' • ' + part.clinicalDescription)"
                          (mouseleave)="hideTooltip()">
                          <textPath 
                            [attr.href]="'#typo-path-' + part.id"
                            [attr.startOffset]="part.startOffset || '50%'"
                            [attr.text-anchor]="part.textAnchor || 'middle'">
                            {{ typographicAnatomy.getLabelForPart(part) }}
                          </textPath>
                        </text>
                      }
                    </g>
                  </g>
                }
              </g>
            </svg>

            <!-- Floating Typographic Language Switcher Overlay -->
            @if (state.anatomyViewMode() === 'typographic') {
              <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
                <button 
                  (click)="typographicAnatomy.cycleLanguage()"
                  class="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono font-bold shadow-xl transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md">
                  <span>🌐 Nomina: {{ typographicAnatomy.languageMode().toUpperCase() }}</span>
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- 3. Bottom Dedicated Anatomical & Biometric Control Bar (OUTSIDE 3D Canvas Window) -->
      <div class="p-3 bg-zinc-900/90 border-t border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 font-mono text-xs no-print z-20">
        <!-- Viewport & Layer Switcher -->
        <div class="flex items-center gap-2 overflow-x-auto py-1">
          <div class="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button (click)="state.bodyViewerMode.set('3d')" [class.bg-indigo-600]="state.bodyViewerMode() === '3d'" [class.text-white]="state.bodyViewerMode() === '3d'" [class.text-zinc-400]="state.bodyViewerMode() !== '3d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🧊 3D</button>
            <button (click)="state.bodyViewerMode.set('2d')" [class.bg-indigo-600]="state.bodyViewerMode() === '2d'" [class.text-white]="state.bodyViewerMode() === '2d'" [class.text-zinc-400]="state.bodyViewerMode() !== '2d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🗺️ 2D</button>
            <button (click)="state.bodyViewerMode.set('genesis')" [class.bg-amber-600]="state.bodyViewerMode() === 'genesis'" [class.text-white]="state.bodyViewerMode() === 'genesis'" [class.text-zinc-400]="state.bodyViewerMode() !== 'genesis'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🧬 Genesis</button>
          </div>

          <!-- Layers Strip -->
          <div class="flex items-center gap-1">
            <button (click)="state.anatomyViewMode.set('skin')" [class.bg-amber-500]="state.anatomyViewMode() === 'skin'" [class.text-zinc-950]="state.anatomyViewMode() === 'skin'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skin'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skin'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">📄 Skin</button>
            <button (click)="state.anatomyViewMode.set('muscle')" [class.bg-teal-600]="state.anatomyViewMode() === 'muscle'" [class.text-white]="state.anatomyViewMode() === 'muscle'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'muscle'" [class.text-zinc-300]="state.anatomyViewMode() !== 'muscle'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦾 Muscle</button>
            <button (click)="state.anatomyViewMode.set('skeleton')" [class.bg-rose-600]="state.anatomyViewMode() === 'skeleton'" [class.text-white]="state.anatomyViewMode() === 'skeleton'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skeleton'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skeleton'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦴 Skeleton</button>
            <button (click)="state.anatomyViewMode.set('organs')" [class.bg-purple-600]="state.anatomyViewMode() === 'organs'" [class.text-white]="state.anatomyViewMode() === 'organs'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'organs'" [class.text-zinc-300]="state.anatomyViewMode() !== 'organs'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🫀 Organ</button>
            <button (click)="state.anatomyViewMode.set('typographic')" [class.bg-cyan-600]="state.anatomyViewMode() === 'typographic'" [class.text-white]="state.anatomyViewMode() === 'typographic'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'typographic'" [class.text-zinc-300]="state.anatomyViewMode() !== 'typographic'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🔤 Typo</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .body-part { fill: transparent; stroke: transparent; cursor: pointer; transition: all 0.3s ease; outline: none; }
    .body-part:hover { fill: rgba(104, 159, 56, 0.1); stroke: rgba(104, 159, 56, 0.3); stroke-width: 1; }
    .body-part.selected { fill: rgba(104, 159, 56, 0.2); stroke: #689F38; stroke-width: 2; }
    .body-part.has-issue { fill: rgba(239, 68, 68, 0.1); stroke: rgba(239, 68, 68, 0.4); stroke-width: 1.5; stroke-dasharray: 4 2; }
    .body-part.has-issue.selected { fill: rgba(239, 68, 68, 0.2); stroke: #EF4444; stroke-width: 2.5; stroke-dasharray: none; }
    .skin-base { fill: #FDFDFD; stroke: #E0E0E0; stroke-width: 1; transition: opacity 0.5s ease; pointer-events: none; }
    .skeleton-layer { pointer-events: none; transition: opacity 0.5s ease; }
    .skeleton-path { fill: none; stroke: #EEEEEE; stroke-width: 1.5; stroke-linecap: round; }
    .skeleton-joint { fill: #EEEEEE; }
    .highlight-anim { animation: highlight-pulse 0.5s ease-out; }
  `]
})
export class BodyViewerComponent implements OnDestroy {
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  themeService = inject(ThemeService);
  typographicAnatomy = inject(TypographicAnatomyService);

  view = signal<'front' | 'back' | 'side_right' | 'side_left'>('front');

  tempSelectedId = signal<string | null>(null);
  tooltipText = signal<string>('');
  tooltipVisible = signal<boolean>(false);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  manualZoom = signal(1);

  searchQuery = signal<string>('');
  isSearchOpen = signal<boolean>(false);
  activeSystemFilter = signal<string>('all');

  constructor() {
    effect(() => {
      const philosophy = this.state.activePhilosophy();
      if (philosophy === 'eastern') {
        this.state.anatomyViewMode.set('eastern');
      } else if (philosophy === 'ayurvedic') {
        this.state.anatomyViewMode.set('ayurvedic');
      } else {
        this.state.anatomyViewMode.set('skin');
      }
    });
  }

  readonly allParts = [
    { id: 'head', name: 'Head & Brain (Cranial)', system: 'neuro', icon: '🧠' },
    { id: 'neck', name: 'Neck & Cervical Spine', system: 'skeletal', icon: '🦴' },
    { id: 'chest', name: 'Chest & Thorax', system: 'organ', icon: '🫁' },
    { id: 'heart', name: 'Cardiac / Heart', system: 'organ', icon: '🫀' },
    { id: 'lungs', name: 'Pulmonary / Lungs', system: 'organ', icon: '🫁' },
    { id: 'abdomen', name: 'Abdomen & Digestive', system: 'organ', icon: '🟡' },
    { id: 'stomach', name: 'Gastric / Stomach', system: 'organ', icon: '🟡' },
    { id: 'liver', name: 'Hepatic / Liver', system: 'organ', icon: '🟤' },
    { id: 'kidneys', name: 'Renal / Kidneys', system: 'organ', icon: '🔴' },
    { id: 'pelvis', name: 'Pelvis & Hip Girdle', system: 'skeletal', icon: '🦴' },
    { id: 'spine', name: 'Spine & Lumbar Column', system: 'skeletal', icon: '🦴' },
    { id: 'shoulder_left', name: 'Left Shoulder', system: 'skeletal', icon: '💪' },
    { id: 'shoulder_right', name: 'Right Shoulder', system: 'skeletal', icon: '💪' },
    { id: 'arm_left', name: 'Left Arm & Biceps', system: 'skeletal', icon: '💪' },
    { id: 'arm_right', name: 'Right Arm & Biceps', system: 'skeletal', icon: '💪' },
    { id: 'hand_left', name: 'Left Hand & Wrist', system: 'skeletal', icon: '✋' },
    { id: 'hand_right', name: 'Right Hand & Wrist', system: 'skeletal', icon: '✋' },
    { id: 'leg_left', name: 'Left Leg & Knee', system: 'skeletal', icon: '🦵' },
    { id: 'leg_right', name: 'Right Leg & Knee', system: 'skeletal', icon: '🦵' },
    { id: 'foot_left', name: 'Left Foot & Ankle', system: 'skeletal', icon: '🦶' },
    { id: 'foot_right', name: 'Right Foot & Ankle', system: 'skeletal', icon: '🦶' }
  ];

  filteredParts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const system = this.activeSystemFilter();
    return this.allParts.filter(p => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.system.toLowerCase().includes(q);
      const matchesSystem = system === 'all' || p.system === system;
      return matchesQuery && matchesSystem;
    });
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.isSearchOpen.set(true);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
  }

  onPartSearchResultClick(part: { id: string, name: string }) {
    this.select(part.id, part.name);
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
  }



  selectedPatient = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    if (!id) return null;
    return this.patientManagement.patients().find(p => p.id === id);
  });

  ngOnDestroy() { }

  private parseHeightInInches(heightStr: string): number | null {
    if (!heightStr) return null;
    const match = heightStr.match(/(\d+)'(\d+)/);
    if (match) {
      const feet = parseInt(match[1], 10) || 0;
      const inches = parseInt(match[2], 10) || 0;
      const total = feet * 12 + inches;
      return total > 0 ? total : null;
    }
    return null;
  }

  bodyTransform = computed(() => {
    const patient = this.selectedPatient();
    const vitals = this.state.vitals();
    let scaleX = 1;
    let scaleY = 1;
    if (patient && vitals.height && vitals.weight) {
      const heightInInches = this.parseHeightInInches(vitals.height);
      const weightInLbs = parseInt(vitals.weight, 10);
      if (heightInInches && !isNaN(weightInLbs)) {
        const baseHeightInches = 68;
        const baseBmi = 22;
        const bmi = (weightInLbs / (heightInInches * heightInInches)) * 703;
        scaleY = heightInInches / baseHeightInches;
        scaleX = 1 + ((bmi - baseBmi) / baseBmi) * 0.4;
        scaleY = Math.max(0.85, Math.min(scaleY, 1.15));
        scaleX = Math.max(0.8, Math.min(scaleX, 1.2));
      }
    }
    const finalScaleX = scaleX * this.manualZoom();
    const finalScaleY = scaleY * this.manualZoom();
    const cx = 100;
    const cy = 225;
    return `translate(${cx}, ${cy}) scale(${finalScaleX}, ${finalScaleY}) translate(${- cx}, ${- cy})`;
  });

  fullBodySkinPathFront = computed(() => "M 100 18 C 88 18 84 26 84 38 C 84 48 88 56 86 64 C 84 68 70 72 65 78 C 58 88 48 135 38 185 C 36 195 46 198 52 190 C 60 145 68 115 72 105 C 72 120 74 170 78 205 C 74 245 72 290 70 395 C 68 410 60 425 60 435 H 94 V 395 L 100 205 L 106 395 V 435 H 140 C 140 425 132 410 130 395 C 128 290 126 245 122 205 C 126 170 128 120 128 105 C 132 115 140 145 148 190 C 154 198 164 195 162 185 C 152 135 142 88 135 78 C 130 72 116 68 114 64 C 112 56 116 48 116 38 C 116 26 112 18 100 18 Z");
  fullBodySkinPathBack = computed(() => "M 100 18 C 88 18 84 26 84 38 C 84 48 88 56 86 64 C 84 68 70 72 65 78 C 58 88 48 135 38 185 C 36 195 46 198 52 190 C 60 145 68 115 72 105 C 72 120 74 170 78 205 C 74 245 72 290 70 395 C 68 410 60 425 60 435 H 94 V 395 L 100 205 L 106 395 V 435 H 140 C 140 425 132 410 130 395 C 128 290 126 245 122 205 C 126 170 128 120 128 105 C 132 115 140 145 148 190 C 154 198 164 195 162 185 C 152 135 142 88 135 78 C 130 72 116 68 114 64 C 112 56 116 48 116 38 C 116 26 112 18 100 18 Z");

  select(id: string, name: string) {
    this.tempSelectedId.set(id);

    // 1. Auto-align active philosophy paradigm & intake fields on touch target tap
    if (id.startsWith('acupoint_')) {
      this.state.selectPhilosophy('eastern');
      const current = this.state.tcmIntake();
      this.state.updateTcmIntake({
        ...current,
        tcmPattern: `Selected Acupoint: ${name} (Jing-Luo Channel)`
      });
    } else if (id.startsWith('chakra_')) {
      this.state.selectPhilosophy('ayurvedic');
      const current = this.state.ayurvedicIntake();
      this.state.updateAyurvedicIntake({
        ...current,
        ayurvedicImbalance: `Selected Chakra Node: ${name} (Sushumna Nadi)`
      });
    }

    // 2. Select part and update issue notes
    this.state.selectPart(id);
    const issuesForPart = this.state.issues()[id];

    if (issuesForPart && issuesForPart.length > 0) {
      this.state.selectNote(issuesForPart[0].noteId);
    } else if (!this.state.viewingPastVisit()) {
      const newNoteId = `note_${Date.now()}`;
      const newNote: IBodyPartIssue = {
        id,
        noteId: newNoteId,
        name,
        painLevel: 3,
        description: `Focused via ${this.state.activePhilosophy().toUpperCase()} 3D Mannequin`,
        symptoms: [name]
      };
      this.state.updateIssue(id, newNote);
      this.state.selectNote(newNoteId);
    }

    // 3. Smoothly scroll to Intake Form container to load intake protocol immediately
    if (typeof document !== 'undefined') {
      const intakeElement = document.querySelector('#patient-intake-section, #intake-form-container, app-intake-form');
      if (intakeElement) {
        intakeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Temporary highlight flash effect
    setTimeout(() => {
      this.tempSelectedId.set(null);
    }, 500);
  }

  getPartClass(id: string): string {
    const isSelected = this.state.selectedPartId() === id;
    const isAnimating = this.tempSelectedId() === id;
    const hasIssue = this.state.hasPainfulIssue(id);
    let classes = 'body-part';
    if (isAnimating) { classes += ' highlight-anim'; }
    else if (isSelected) { classes += ' selected'; }
    if (hasIssue) { classes += ' has-issue'; }
    return classes;
  }

  showTooltip(event: MouseEvent, name: string) {
    const hostRect = (event.currentTarget as SVGElement).closest('div')!.getBoundingClientRect();
    this.tooltipText.set(name);
    this.tooltipVisible.set(true);
    this.tooltipX.set(event.clientX - hostRect.left);
    this.tooltipY.set(event.clientY - hostRect.top + 20);
  }

  hideTooltip() {
    this.tooltipVisible.set(false);
  }

  zoomIn() { this.manualZoom.update(z => parseFloat((z + 0.1).toFixed(2))); }
  zoomOut() { this.manualZoom.update(z => parseFloat(Math.max(z - 0.1, 0.5).toFixed(2))); }
  resetControls() { this.manualZoom.set(1); }

  onPartSelected(event: { id: string, name: string }) {
    this.select(event.id, event.name);
  }
}
