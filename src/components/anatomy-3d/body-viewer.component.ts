import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, effect, viewChild, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { IBodyPartIssue } from '../../services/patient.types';
import { PatientManagementService } from '../../services/patient-management.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';
import { ThemeService } from '../../services/theme.service';
import { TypographicAnatomyService } from '../../services/typographic-anatomy.service';
import { QuadPhilosophyMatrixComponent } from '../shared/quad-philosophy-matrix.component';
import { InstantBodyCarePlanSheetComponent } from './instant-body-care-plan-sheet.component';

@Component({
  selector: 'app-body-viewer',
  standalone: true,
  imports: [
    CommonModule, 
    Body3DViewerComponent, 
    QuadPhilosophyMatrixComponent,
    InstantBodyCarePlanSheetComponent
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

        <div class="flex items-center gap-2 flex-wrap font-mono">
          <!-- Multi-Scale Viewport Mode Switcher (Precision Instrument Rail) -->
          <div class="flex items-center gap-1 bg-gray-200/80 dark:bg-zinc-950 p-1 rounded-xs border border-gray-300/80 dark:border-zinc-800 text-xs flex-wrap">
            <button (click)="state.bodyViewerMode.set('3d')" 
                    [class.bg-[#08665e]]="state.bodyViewerMode() === '3d'" 
                    [class.text-white]="state.bodyViewerMode() === '3d'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== '3d'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== '3d'" 
                    class="min-h-[36px] px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🧊</span> 3D Whole-Body
            </button>
            <button (click)="state.bodyViewerMode.set('2d')" 
                    [class.bg-sky-800]="state.bodyViewerMode() === '2d'" 
                    [class.text-white]="state.bodyViewerMode() === '2d'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== '2d'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== '2d'" 
                    class="min-h-[36px] px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🗺️</span> 2D Atlas
            </button>
            <button (click)="state.bodyViewerMode.set('quad')" 
                    [class.bg-purple-800]="state.bodyViewerMode() === 'quad'" 
                    [class.text-white]="state.bodyViewerMode() === 'quad'" 
                    [class.text-gray-700]="state.bodyViewerMode() !== 'quad'" 
                    [class.dark:text-zinc-300]="state.bodyViewerMode() !== 'quad'" 
                    class="min-h-[36px] px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center gap-1">
              <span>🏛️</span> 4-Way Matrix
            </button>
          </div>

          <!-- ⚡ 1-Tap Instant 4-Lens Care Plan Launch Button -->
          <button (click)="openInstantCarePlan()" 
                  title="Tap or speak to generate instant Quad-Philosophy care plan"
                  class="min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer bg-teal-800 hover:bg-teal-700 text-white border border-teal-500/50 shadow-xs flex items-center justify-center gap-1.5 shrink-0">
            <span>⚡</span> Instant 4-Lens Plan
          </button>

          <!-- Search Bar with Keyboard & Autocomplete -->
          <div class="relative flex items-center bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-xs px-2.5 py-1 w-full sm:w-64 shadow-xs focus-within:border-emerald-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              [value]="searchQuery()" 
              (input)="onSearchInput($event)" 
              (keydown)="onSearchKeyDown($event)"
              (focus)="isSearchOpen.set(true)"
              aria-label="Search organ, acupoint, or symptom"
              placeholder="Search organ, acupoint, symptom..." 
              class="w-full bg-transparent text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none font-medium" />
            @if (searchQuery()) {
              <button (click)="clearSearch()" aria-label="Clear Search Query" class="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xs text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            }
          </div>

          @if (focusedHotzoneFeedback()) {
            <div class="px-2.5 py-1 rounded-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold animate-pulse flex items-center gap-1.5 shrink-0">
              <span>{{ focusedHotzoneFeedback() }}</span>
            </div>
          }

          <!-- 🫲 Dual-Handed / Left-Handed Clinical Ergonomics Button -->
          <button (click)="toggleHandedness()" 
                  [class.bg-purple-800]="handednessMode() === 'left'"
                  [class.text-white]="handednessMode() === 'left'"
                  [class.border-purple-400]="handednessMode() === 'left'"
                  class="min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-xs transition-all cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow-xs flex items-center gap-1.5 shrink-0"
                  title="Toggle Left-Handed / Right-Handed Ergonomic Layout (Mirror Floating Controls & Stylus Palette)">
            <span>{{ handednessMode() === 'left' ? '🫲 Left-Handed' : '🫱 Right-Handed' }}</span>
          </button>

          <!-- Paradigm Lens Selector Bar (Precision Segmented Rail) -->
          <div class="flex items-center gap-1 bg-gray-200/80 dark:bg-zinc-950 p-1 rounded-xs border border-gray-300/80 dark:border-zinc-800 text-xs">
            <button (click)="state.selectPhilosophy('western')" [class.bg-sky-800]="state.activePhilosophy() === 'western'" [class.text-white]="state.activePhilosophy() === 'western'" [class.text-gray-700]="state.activePhilosophy() !== 'western'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'western'" class="min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🩺 Western
            </button>
            <button (click)="state.selectPhilosophy('eastern')" [class.bg-emerald-800]="state.activePhilosophy() === 'eastern'" [class.text-white]="state.activePhilosophy() === 'eastern'" [class.text-gray-700]="state.activePhilosophy() !== 'eastern'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'eastern'" class="min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🌿 TCM
            </button>
            <button (click)="state.selectPhilosophy('ayurvedic')" [class.bg-amber-800]="state.activePhilosophy() === 'ayurvedic'" [class.text-white]="state.activePhilosophy() === 'ayurvedic'" [class.text-gray-700]="state.activePhilosophy() !== 'ayurvedic'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'ayurvedic'" class="min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🪷 Ayurvedic
            </button>
            <button (click)="state.selectPhilosophy('osteopathic')" [class.bg-purple-800]="state.activePhilosophy() === 'osteopathic'" [class.text-white]="state.activePhilosophy() === 'osteopathic'" [class.text-gray-700]="state.activePhilosophy() !== 'osteopathic'" [class.dark:text-zinc-300]="state.activePhilosophy() !== 'osteopathic'" class="min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer border-0 shadow-xs flex items-center justify-center">
              🦴 Osteopathic
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Center 3D Viewport Window -->

      <!-- Rich Multi-Paradigm Live Autocomplete Dropdown -->
      @if (isSearchOpen()) {
        <div class="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 p-3 max-h-[340px] overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-900 z-30 shadow-2xl space-y-2">
          
          <!-- Paradigm Sub-Filter Pills -->
          <div class="flex items-center justify-between gap-2 pb-2 text-[10px] font-mono overflow-x-auto">
            <div class="flex items-center gap-1">
              <button 
                type="button"
                (click)="activeSystemFilter.set('all')"
                [class.bg-emerald-500]="activeSystemFilter() === 'all'"
                [class.text-zinc-950]="activeSystemFilter() === 'all'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'all'"
                [class.text-zinc-300]="activeSystemFilter() !== 'all'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                All ({{ allParts.length }})
              </button>
              <button 
                type="button"
                (click)="activeSystemFilter.set('western')"
                [class.bg-sky-500]="activeSystemFilter() === 'western'"
                [class.text-white]="activeSystemFilter() === 'western'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'western'"
                [class.text-zinc-300]="activeSystemFilter() !== 'western'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                🩺 Western
              </button>
              <button 
                type="button"
                (click)="activeSystemFilter.set('eastern')"
                [class.bg-emerald-600]="activeSystemFilter() === 'eastern'"
                [class.text-white]="activeSystemFilter() === 'eastern'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'eastern'"
                [class.text-zinc-300]="activeSystemFilter() !== 'eastern'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                🌿 TCM Acupoints
              </button>
              <button 
                type="button"
                (click)="activeSystemFilter.set('ayurvedic')"
                [class.bg-amber-600]="activeSystemFilter() === 'ayurvedic'"
                [class.text-white]="activeSystemFilter() === 'ayurvedic'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'ayurvedic'"
                [class.text-zinc-300]="activeSystemFilter() !== 'ayurvedic'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                🪷 Marmas
              </button>
              <button 
                type="button"
                (click)="activeSystemFilter.set('cellular')"
                [class.bg-cyan-600]="activeSystemFilter() === 'cellular'"
                [class.text-white]="activeSystemFilter() === 'cellular'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'cellular'"
                [class.text-zinc-300]="activeSystemFilter() !== 'cellular'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                🔬 Cellular
              </button>
              <button 
                type="button"
                (click)="activeSystemFilter.set('osteopathic')"
                [class.bg-purple-600]="activeSystemFilter() === 'osteopathic'"
                [class.text-white]="activeSystemFilter() === 'osteopathic'"
                [class.bg-zinc-800]="activeSystemFilter() !== 'osteopathic'"
                [class.text-zinc-300]="activeSystemFilter() !== 'osteopathic'"
                class="px-2 py-0.5 rounded-md font-bold transition">
                🦴 Osteopathic
              </button>
            </div>
            <button (click)="clearSearch()" class="text-zinc-400 hover:text-zinc-200 text-[10px]">Close ✕</button>
          </div>

          <!-- Autocomplete Results List -->
          <div class="divide-y divide-gray-100 dark:divide-zinc-800/60 pt-1">
            @for (part of filteredParts(); track part.id; let idx = $index) {
              <button (click)="onPartSearchResultClick(part)" 
                      [class.bg-emerald-500/15]="selectedAutocompleteIndex() === idx"
                      class="w-full text-left px-3 py-2.5 min-h-[44px] text-xs flex items-center justify-between hover:bg-emerald-500/10 transition-colors group rounded-xl cursor-pointer">
                <div class="flex items-center gap-3">
                  <span class="text-lg shrink-0">{{ part.icon }}</span>
                  <div>
                    <div class="font-bold text-gray-900 dark:text-zinc-100 group-hover:text-emerald-500 flex items-center gap-2">
                      <span>{{ part.name }}</span>
                      @if (part.secondaryName) {
                        <span class="text-[10px] font-normal text-zinc-400 font-sans">({{ part.secondaryName }})</span>
                      }
                    </div>
                    <div class="text-[10px] text-zinc-500 font-sans line-clamp-1">
                      {{ part.clinicalFocus }}
                    </div>
                  </div>
                </div>

                <div class="text-right shrink-0 flex flex-col items-end gap-1">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                        [class.bg-sky-500/20]="part.paradigm === 'western'"
                        [class.text-sky-400]="part.paradigm === 'western'"
                        [class.bg-emerald-500/20]="part.paradigm === 'eastern'"
                        [class.text-emerald-400]="part.paradigm === 'eastern'"
                        [class.bg-amber-500/20]="part.paradigm === 'ayurvedic'"
                        [class.text-amber-400]="part.paradigm === 'ayurvedic'"
                        [class.bg-cyan-500/20]="part.paradigm === 'cellular'"
                        [class.text-cyan-400]="part.paradigm === 'cellular'"
                        [class.bg-purple-500/20]="part.paradigm === 'osteopathic'"
                        [class.text-purple-400]="part.paradigm === 'osteopathic'">
                    {{ part.paradigm }}
                  </span>
                  @if (part.symptoms.length > 0) {
                    <span class="text-[8px] text-zinc-500 font-mono">
                      {{ part.symptoms.slice(0, 2).join(', ') }}
                    </span>
                  }
                </div>
              </button>
            } @empty {
              <div class="p-4 text-center text-xs text-zinc-400 font-mono">
                No matching anatomical structure or symptom found for "{{ searchQuery() }}".
              </div>
            }
          </div>

        </div>
      }

      <!-- 2. Center 3D Viewport Window (Holographic Diagnostic Twin - Luminous Papyrus/Light Canvas) -->
      <div class="flex-1 w-full relative min-h-[540px] sm:min-h-[640px] overflow-hidden bg-transparent border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl thematic-3d-container flex flex-col">
        @if (state.bodyViewerMode() === '3d') {
          <app-body-3d-viewer 
            class="w-full h-full flex-1 flex flex-col min-h-[540px]"
            [anatomyViewMode]="state.anatomyViewMode()"
            [customModelUrl]="null"
            (partSelected)="onPartSelected($event)">
          </app-body-3d-viewer>
        } @else if (state.bodyViewerMode() === 'quad') {
          <div class="w-full h-full flex-1 overflow-y-auto p-4 bg-slate-950/60">
            <app-quad-philosophy-matrix class="w-full block"></app-quad-philosophy-matrix>
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
            <button (click)="state.bodyViewerMode.set('3d')" [class.bg-indigo-800]="state.bodyViewerMode() === '3d'" [class.text-white]="state.bodyViewerMode() === '3d'" [class.text-zinc-400]="state.bodyViewerMode() !== '3d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🧊 3D</button>
            <button (click)="state.bodyViewerMode.set('2d')" [class.bg-indigo-800]="state.bodyViewerMode() === '2d'" [class.text-white]="state.bodyViewerMode() === '2d'" [class.text-zinc-400]="state.bodyViewerMode() !== '2d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🗺️ 2D</button>
          </div>

          <!-- Layers Strip -->
          <div class="flex items-center gap-1">
            <button (click)="state.anatomyViewMode.set('skin')" [class.bg-amber-500]="state.anatomyViewMode() === 'skin'" [class.text-zinc-950]="state.anatomyViewMode() === 'skin'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skin'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skin'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">📄 Skin</button>
            <button (click)="state.anatomyViewMode.set('muscle')" [class.bg-teal-800]="state.anatomyViewMode() === 'muscle'" [class.text-white]="state.anatomyViewMode() === 'muscle'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'muscle'" [class.text-zinc-300]="state.anatomyViewMode() !== 'muscle'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦾 Muscle</button>
            <button (click)="state.anatomyViewMode.set('skeleton')" [class.bg-rose-800]="state.anatomyViewMode() === 'skeleton'" [class.text-white]="state.anatomyViewMode() === 'skeleton'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skeleton'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skeleton'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦴 Skeleton</button>
            <button (click)="state.anatomyViewMode.set('organs')" [class.bg-purple-800]="state.anatomyViewMode() === 'organs'" [class.text-white]="state.anatomyViewMode() === 'organs'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'organs'" [class.text-zinc-300]="state.anatomyViewMode() !== 'organs'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🫀 Organ</button>
            <button (click)="state.anatomyViewMode.set('typographic')" [class.bg-cyan-800]="state.anatomyViewMode() === 'typographic'" [class.text-white]="state.anatomyViewMode() === 'typographic'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'typographic'" [class.text-zinc-300]="state.anatomyViewMode() !== 'typographic'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🔤 Typo</button>
          </div>
        </div>
      </div>

      <!-- ⚡ Instant 4-Lens Care Plan Bottom Sheet -->
      <app-instant-body-care-plan-sheet #instantSheet />
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
  @ViewChild('instantSheet') instantSheet?: InstantBodyCarePlanSheetComponent;

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
  selectedAutocompleteIndex = signal<number>(-1);
  handednessMode = signal<'right' | 'left'>('right');

  toggleHandedness(): void {
    this.handednessMode.update(h => h === 'right' ? 'left' : 'right');
  }

  openInstantCarePlan(bodyPartName?: string) {
    const selectedId = this.state.selectedPartId();
    const part = bodyPartName || (selectedId ? this.allParts.find(p => p.id === selectedId)?.name : null) || 'Full Body';
    this.instantSheet?.openForBodyPart(part);
  }

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

  readonly allParts: Array<{
    id: string;
    name: string;
    secondaryName?: string;
    paradigm: 'western' | 'eastern' | 'ayurvedic' | 'osteopathic' | 'cellular';
    system: 'neuro' | 'cardio' | 'pulmo' | 'visceral' | 'skeletal' | 'tcm' | 'ayurveda' | 'cellular' | 'osteopathic';
    icon: string;
    symptoms: string[];
    clinicalFocus: string;
  }> = [
    // 🩺 1. Western Organs, Neuro & Skeletal Systems
    { id: 'head', name: 'Head & Cranial Vault', secondaryName: 'Neuro-Cortex & Cranial Nerves', paradigm: 'western', system: 'neuro', icon: '🧠', symptoms: ['headache', 'migraine', 'concussion', 'dizziness', 'vertigo', 'tinnitus', 'mental fog'], clinicalFocus: 'Cranial nerve distribution, meningeal tension & cerebral perfusion' },
    { id: 'brain', name: 'Brain & Nervous System', secondaryName: 'Cerebrum, Cerebellum & Limbic System', paradigm: 'western', system: 'neuro', icon: '🧠', symptoms: ['insomnia', 'anxiety', 'depression', 'memory loss', 'neuropathy', 'tremor', 'cognitive fatigue'], clinicalFocus: 'Neuroplasticity, autonomic regulation & neurotransmitter balance' },
    { id: 'thyroid', name: 'Thyroid & Endocrine Gland', secondaryName: 'Follicular Cells (T3/T4 Regulation)', paradigm: 'western', system: 'visceral', icon: '🦋', symptoms: ['hypothyroid', 'hashimotos', 'fatigue', 'cold intolerance', 'weight gain', 'tsh imbalance'], clinicalFocus: 'Basal metabolic rate, HPA axis balance & iodine metabolism' },
    { id: 'chest', name: 'Chest & Thoracic Cavity', secondaryName: 'Thorax, Mediastinum & Ribcage', paradigm: 'western', system: 'pulmo', icon: '🫁', symptoms: ['chest tightness', 'pleuritic pain', 'intercostal neuralgia', 'costochondritis'], clinicalFocus: 'Rib mobility, thoracic compliance & respiratory dynamics' },
    { id: 'heart', name: 'Heart & Cardiovascular System', secondaryName: 'Myocardium & Coronary Arteries', paradigm: 'western', system: 'cardio', icon: '🫀', symptoms: ['chest pain', 'palpitations', 'hypertension', 'angina', 'shortness of breath', 'arrhythmia'], clinicalFocus: 'Cardiac output, ejection fraction & vascular endothelial tone' },
    { id: 'lungs', name: 'Lungs & Respiratory System', secondaryName: 'Pulmonary Bronchi & Alveoli', paradigm: 'western', system: 'pulmo', icon: '🫁', symptoms: ['cough', 'dyspnea', 'asthma', 'wheezing', 'pneumonia', 'sob', 'shallow breathing'], clinicalFocus: 'Gas exchange, vital capacity & bronchial airway reactivity' },
    { id: 'abdomen', name: 'Abdomen & Digestive Tract', secondaryName: 'Enteric Nervous System & Peritoneum', paradigm: 'western', system: 'visceral', icon: '🟡', symptoms: ['abdominal pain', 'cramping', 'sibo', 'ibs', 'constipation', 'diarrhea', 'gut inflammation'], clinicalFocus: 'Microbiome diversity, gut barrier permeability & enteric motility' },
    { id: 'stomach', name: 'Stomach & Gastric Pouch', secondaryName: 'Gastric Fundus & Parietal Cells', paradigm: 'western', system: 'visceral', icon: '🟡', symptoms: ['gerd', 'acid reflux', 'heartburn', 'nausea', 'gastritis', 'indigestion', 'bloating'], clinicalFocus: 'Hydrochloric acid secretion, pepsinogen activation & mucosal barrier' },
    { id: 'liver', name: 'Liver & Hepatic System', secondaryName: 'Hepatic Lobules & Cytochrome P450', paradigm: 'western', system: 'visceral', icon: '🟤', symptoms: ['elevated alt', 'fatty liver', 'detoxification', 'jaundice', 'cirrhosis', 'metabolic sluggishness'], clinicalFocus: 'Phase I/II hepatic biotransformation & bile acid synthesis' },
    { id: 'kidneys', name: 'Kidneys & Renal System', secondaryName: 'Renal Cortex, Nephrons & Glomeruli', paradigm: 'western', system: 'visceral', icon: '🔴', symptoms: ['flank pain', 'kidney stones', 'hypertension', 'edema', 'gout', 'elevated creatinine'], clinicalFocus: 'Glomerular filtration rate (eGFR), electrolyte homeostasis & renin cascade' },
    { id: 'pelvis', name: 'Pelvis & Hip Girdle', secondaryName: 'Acetabulum, SI Joint & Pelvic Floor', paradigm: 'western', system: 'skeletal', icon: '🦴', symptoms: ['hip pain', 'sacroiliitis', 'pelvic floor tension', 'sciatica', 'groin strain'], clinicalFocus: 'Pelvic ring stability, levator ani tone & load transfer' },
    { id: 'spine_cervical', name: 'Cervical Spine (C1-C7)', secondaryName: 'Neck & Cervical Vertebrae', paradigm: 'western', system: 'skeletal', icon: '🦴', symptoms: ['neck pain', 'cervical radiculopathy', 'whiplash', 'stiff neck', 'occipital neuralgia'], clinicalFocus: 'Lordotic curvature, facet joint arthropathy & nerve root exit' },
    { id: 'spine_thoracic', name: 'Thoracic Spine (T1-T12)', secondaryName: 'Mid-Back & Costovertebral Joints', paradigm: 'western', system: 'skeletal', icon: '🦴', symptoms: ['mid back pain', 'rib subluxation', 'kyphosis', 'thoracic stiffness'], clinicalFocus: 'Viscerosomatic sympathetic chain ganglion reflexes & ribcage rotation' },
    { id: 'spine_lumbar', name: 'Lumbar Spine (L1-L5)', secondaryName: 'Low Back & Intervertebral Discs', paradigm: 'western', system: 'skeletal', icon: '🦴', symptoms: ['low back pain', 'lumbago', 'disc herniation', 'sciatica', 'lumbar stenosis'], clinicalFocus: 'L4/L5 & L5/S1 disc decompression, multifidus recruitment & core stability' },
    { id: 'dermatome_l4_l5', name: 'L4-L5 Sciatic Nerve Dermatome', secondaryName: 'Sciatic Pathway & Lateral Sural Path', paradigm: 'western', system: 'neuro', icon: '⚡', symptoms: ['sciatica', 'shooting leg pain', 'foot numbness', 'tingling in toes', 'piriformis syndrome'], clinicalFocus: 'Neurodynamic sciatic flossing & dermatomal sensory distribution' },
    { id: 'shoulder_left', name: 'Left Shoulder & Rotator Cuff', secondaryName: 'Glenohumeral & Subacromial Space', paradigm: 'western', system: 'skeletal', icon: '💪', symptoms: ['shoulder impingement', 'rotator cuff tear', 'frozen shoulder', 'bursitis'], clinicalFocus: 'Scapulohumeral rhythm & supraspinatus tendon glide' },
    { id: 'shoulder_right', name: 'Right Shoulder & Rotator Cuff', secondaryName: 'Glenohumeral & Subacromial Space', paradigm: 'western', system: 'skeletal', icon: '💪', symptoms: ['shoulder impingement', 'rotator cuff pain', 'calcific tendonitis', 'arm weakness'], clinicalFocus: 'Subacromial space clearance & rotator cuff balance' },
    { id: 'hand_left', name: 'Left Hand & Wrist', secondaryName: 'Carpal Tunnel & Median Nerve', paradigm: 'western', system: 'skeletal', icon: '✋', symptoms: ['carpal tunnel', 'wrist pain', 'finger numbness', 'arthritis', 'tendonitis'], clinicalFocus: 'Median/ulnar nerve mobility & flexor retinaculum tension' },
    { id: 'hand_right', name: 'Right Hand & Wrist', secondaryName: 'Carpal Tunnel & Median Nerve', paradigm: 'western', system: 'skeletal', icon: '✋', symptoms: ['carpal tunnel syndrome', 'wrist strain', 'trigger finger', 'repetitive strain'], clinicalFocus: 'Grip strength ergonomics & carpal alignment' },
    { id: 'leg_left', name: 'Left Knee & Leg', secondaryName: 'Patellofemoral Joint & Meniscus', paradigm: 'western', system: 'skeletal', icon: '🦵', symptoms: ['knee pain', 'meniscus tear', 'runner knee', 'patellar tendonitis', 'swelling'], clinicalFocus: 'Q-angle biomechanics, VMO activation & joint space preservation' },
    { id: 'leg_right', name: 'Right Knee & Leg', secondaryName: 'Patellofemoral Joint & Meniscus', paradigm: 'western', system: 'skeletal', icon: '🦵', symptoms: ['knee pain', 'acl strain', 'osteoarthritis', 'patellar tracking', 'calf tightness'], clinicalFocus: 'Tibiofemoral articulation & kinetic chain alignment' },
    { id: 'foot_left', name: 'Left Foot & Ankle', secondaryName: 'Plantar Fascia & Talocrural Joint', paradigm: 'western', system: 'skeletal', icon: '🦶', symptoms: ['plantar fasciitis', 'ankle sprain', 'achilles tendonitis', 'heel spur'], clinicalFocus: 'Medial longitudinal arch resilience & subtalar joint mobility' },
    { id: 'foot_right', name: 'Right Foot & Ankle', secondaryName: 'Plantar Fascia & Talocrural Joint', paradigm: 'western', system: 'skeletal', icon: '🦶', symptoms: ['plantar fasciitis', 'heel pain', 'ankle instability', 'pronation'], clinicalFocus: 'Proprioceptive ground reaction force attenuation' },

    // 🌿 2. Traditional Chinese Medicine (TCM) Jing-Luo Acupoint Touch Targets
    { id: 'acupoint_gv20', name: 'GV-20 Baihui (Hundred Convergences)', secondaryName: '百会 (Crown Master Yang Meeting Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['migraine', 'headache', 'dizziness', 'hypertension', 'insomnia', 'depression', 'brain fog', 'prolapse'], clinicalFocus: 'Clears sensory orifices, lifts sunken Yang Qi & pacifies internal wind' },
    { id: 'acupoint_cv17', name: 'CV-17 Danzhong (Sea of Qi)', secondaryName: '膻中 (Chest Center / Pericardium Mu Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['chest tightness', 'anxiety', 'panic attacks', 'palpitations', 'cough', 'grief', 'intercostal tension'], clinicalFocus: 'Regulates thoracic Qi circulation, unbinds the chest & calms Shen' },
    { id: 'acupoint_cv12', name: 'CV-12 Zhongwan (Middle Cavity)', secondaryName: '中脘 (Stomach Front-Mu & Middle Jiao Center)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['stomach ache', 'acid reflux', 'gerd', 'nausea', 'vomiting', 'poor digestion', 'abdominal bloating'], clinicalFocus: 'Harmonizes Stomach Qi, fortifies Spleen transformation & dispels dampness' },
    { id: 'acupoint_st36_r', name: 'ST-36 Zusanli (Right Leg Three Miles)', secondaryName: '足三里 (He-Sea Earth Master Energy Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['fatigue', 'chronic exhaustion', 'weak immunity', 'gastritis', 'poor appetite', 'longevity tonic'], clinicalFocus: 'Major systemic tonification point for Post-Natal Qi, blood generation & vitality' },
    { id: 'acupoint_st36_l', name: 'ST-36 Zusanli (Left Leg Three Miles)', secondaryName: '足三里 (He-Sea Earth Master Energy Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['fatigue', 'low vitality', 'indigestion', 'immune deficiency', 'leg weakness'], clinicalFocus: 'Replenishes vital Qi, balances digestive motility & supports recovery' },
    { id: 'acupoint_li4_r', name: 'LI-4 Hegu (Right Joining Valley)', secondaryName: '合谷 (Yuan-Source Master Head/Face Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['headache', 'toothache', 'sinus congestion', 'facial pain', 'constipation', 'stress tension'], clinicalFocus: 'Master point for sensory organs of head & face; releases exterior wind' },
    { id: 'acupoint_li4_l', name: 'LI-4 Hegu (Left Joining Valley)', secondaryName: '合谷 (Yuan-Source Master Head/Face Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['headache', 'migraine', 'jaw tension', 'tmj', 'nasal allergy', 'constipation'], clinicalFocus: 'Potent analgesic and Qi regulator; pairs with LR-3 (Four Gates)' },
    { id: 'acupoint_sp6_r', name: 'SP-6 Sanyinjiao (Right Three Yin Crossing)', secondaryName: '三阴交 (Spleen, Liver & Kidney Intersection)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['pms', 'menstrual cramps', 'insomnia', 'water retention', 'pelvic congestion', 'digestive weakness'], clinicalFocus: 'Nourishes Yin & blood, resolves pelvic blood stasis & calms the mind' },
    { id: 'acupoint_sp6_l', name: 'SP-6 Sanyinjiao (Left Three Yin Crossing)', secondaryName: '三阴交 (Spleen, Liver & Kidney Intersection)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['cramps', 'hormonal imbalance', 'sleep disturbance', 'edema', 'heavy legs'], clinicalFocus: 'Regulates lower Jiao urogenital functions & harmonizes three Yin channels' },
    { id: 'acupoint_pc6_r', name: 'PC-6 Neiguan (Right Inner Pass)', secondaryName: '内关 (Luo-Connecting Master Cardiac Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['nausea', 'motion sickness', 'morning sickness', 'palpitations', 'anxiety', 'chest oppression', 'insomnia'], clinicalFocus: 'Opens the chest, regulates Heart rate variability & subdues rebellious Stomach Qi' },
    { id: 'acupoint_pc6_l', name: 'PC-6 Neiguan (Left Inner Pass)', secondaryName: '内关 (Luo-Connecting Master Cardiac Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['nausea', 'vomiting', 'cardiac arrhythmia', 'panic', 'emotional stress'], clinicalFocus: 'Vagal neuromodulation corridor & Shen stabilizer' },
    { id: 'acupoint_lr3_r', name: 'LR-3 Taichong (Right Great Surge)', secondaryName: '太冲 (Liver Shu-Stream & Yuan-Source Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['irritability', 'stress', 'high blood pressure', 'eye strain', 'headache', 'anger', 'menstrual pain'], clinicalFocus: 'Smooths Liver Qi stagnation, clears liver fire & alleviates somatic spasms' },
    { id: 'acupoint_lr3_l', name: 'LR-3 Taichong (Left Great Surge)', secondaryName: '太冲 (Liver Shu-Stream & Yuan-Source Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['hypertension', 'frustration', 'muscle cramps', 'migraine aura', 'liver stagnation'], clinicalFocus: 'Subdues rising Liver Yang and regulates systemic circulation' },
    { id: 'acupoint_ki1_r', name: 'KI-1 Yongquan (Right Gushing Spring)', secondaryName: '涌泉 (Jing-Well Wood / Root Grounding Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['insomnia', 'night sweats', 'grounding deficit', 'hot flashes', 'hypertension', 'foot heat', 'panic'], clinicalFocus: 'Draws excess fire downward, anchors Kidney Yin & stabilizes floating Yang' },
    { id: 'acupoint_gb20_r', name: 'GB-20 Fengchi (Right Wind Pool)', secondaryName: '风池 (Suboccipital Wind Gate & Cranial Bridge)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['stiff neck', 'occipital headache', 'cold/flu onset', 'tinnitus', 'vertigo', 'eye pain'], clinicalFocus: 'Eliminates internal/external wind, relieves suboccipital spasms & benefits eyes' },
    { id: 'acupoint_bl23_r', name: 'BL-23 Shenshu (Right Kidney Back-Shu)', secondaryName: '肾俞 (Vital Kidney Essence Back-Shu Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['chronic low back pain', 'tinnitus', 'adrenal exhaustion', 'frequent urination', 'cold lumbar'], clinicalFocus: 'Directly tonifies Kidney Yin/Yang, strengthens bone marrow & nourishes lower back' },
    { id: 'acupoint_bl40_r', name: 'BL-40 Weizhong (Right Bend Middle)', secondaryName: '委中 (Popliteal Fossa Lumbar Command Point)', paradigm: 'eastern', system: 'tcm', icon: '🌿', symptoms: ['acute back spasm', 'sciatica', 'knee pain', 'hamstring strain', 'lumbar stiffness'], clinicalFocus: 'Master command point for the back; clears heat from blood & releases lumbar tension' },

    // 🪷 3. Ayurvedic Marmas & Chakras
    { id: 'marma_adhipati', name: 'Adhipati Marma (Crown Supreme)', secondaryName: 'अधिपति (Sahasrara Crown Chakra Center)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['headache', 'mental stress', 'spiritual disconnect', 'insomnia', 'ojas depletion', 'neurological strain'], clinicalFocus: 'Master junction point controlling Prana Vayu, consciousness & higher cognitive ojas' },
    { id: 'marma_sthapani', name: 'Sthapani Marma (Third Eye Point)', secondaryName: 'स्थापनी (Ajna Chakra / Glabella Center)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['sinusitis', 'lack of focus', 'tension headache', 'eye fatigue', 'mental agitation'], clinicalFocus: 'Regulates Sadhaka Pitta, pituitary-hypothalamic synchrony & deep mental serenity' },
    { id: 'marma_hridaya', name: 'Hridaya Marma (Sacred Heart Seat)', secondaryName: 'हृदय (Anahata Chakra / Center of Prana)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['emotional grief', 'cardiac palpitation', 'chest constriction', 'loneliness', 'vyana vayu imbalance'], clinicalFocus: 'Core seat of Ojas, Avalambaka Kapha and unconditional compassion' },
    { id: 'marma_nabhi', name: 'Nabhi Marma (Solar Navel Center)', secondaryName: 'नाभि (Manipura Chakra / Seat of Agni)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['weak digestion', 'ama toxicity', 'metabolic slowdown', 'gut distension', 'samana vayu stagnation'], clinicalFocus: 'Governs Pachaka Pitta, metabolic digestion (Agni) and root digestive fire' },
    { id: 'marma_basti', name: 'Basti Marma (Bladder & Pelvic Reservoir)', secondaryName: 'बस्ति (Svadhisthana Chakra / Water Center)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['urinary hesitation', 'apana vayu vitiation', 'pelvic tension', 'lower back ache'], clinicalFocus: 'Regulates Apana Vayu elimination, fluid balance and reproductive longevity' },
    { id: 'marma_kshipra', name: 'Kshipra Marma (Quick Action Point)', secondaryName: 'क्षिप्र (Web Space of Hand & Foot)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['acute spasm', 'lymphatic sluggishness', 'bronchial constriction', 'prana blockage'], clinicalFocus: 'Rapid pranic accelerator balancing respiratory and cardiac vitality' },
    { id: 'marma_talahridaya', name: 'Talahridaya Marma (Center of Palm/Sole)', secondaryName: 'तलहृदय (Heart of the Hand & Foot)', paradigm: 'ayurvedic', system: 'ayurveda', icon: '🪷', symptoms: ['cold extremities', 'poor peripheral circulation', 'anxiety', 'grounding deficit'], clinicalFocus: 'Balances somatic thermoregulation and circulating Vyana Vayu' },

    // 🔬 4. Cellular Organelles & Molecular Targets
    { id: 'cellular_mitochondria', name: 'Mitochondrial Matrix & ATP Synthase', secondaryName: 'OXPHOS & Reactive Oxygen Species (ROS)', paradigm: 'cellular', system: 'cellular', icon: '🔬', symptoms: ['chronic fatigue', 'mitochondrial dysfunction', 'low atp', 'brain fog', 'exercise intolerance', 'long covid'], clinicalFocus: 'Electron transport chain efficiency, coq10 phosphorylation & NAD+/NADH redox ratio' },
    { id: 'cellular_nucleolus', name: 'Nucleus & Epigenetic Chromatin', secondaryName: 'DNA Repair & Telomere Biology', paradigm: 'cellular', system: 'cellular', icon: '🔬', symptoms: ['cellular aging', 'accelerated senescence', 'dna methylation changes', 'oncology risk'], clinicalFocus: 'Sirtuin histone deacetylation, telomerase preservation & DNA integrity' },
    { id: 'cellular_endoplasmic_reticulum', name: 'Endoplasmic Reticulum & UPR', secondaryName: 'Protein Folding & Calcium Homeostasis', paradigm: 'cellular', system: 'cellular', icon: '🔬', symptoms: ['er stress', 'misfolded protein buildup', 'neurodegeneration', 'metabolic overload'], clinicalFocus: 'Unfolded protein response (UPR), chaperone protein dynamics & proteostasis' },

    // 🦴 5. Osteopathic Somatic Points & Junctions
    { id: 'osteopathic_cranium', name: 'Cranio-Sacral Sphenobasilar Junction', secondaryName: 'SBS Strain & Primary Respiration', paradigm: 'osteopathic', system: 'osteopathic', icon: '🦴', symptoms: ['cranial compression', 'tmj dysfunction', 'post-concussion syndrome', 'dural strain', 'migraine'], clinicalFocus: 'Sphenobasilar synchondrosis flexion/extension & cranial rhythm balancing' },
    { id: 'osteopathic_thoracic_inlet', name: 'Thoracic Inlet & Sibson Fascia', secondaryName: 'Cervicothoracic Junction (C7-T1)', paradigm: 'osteopathic', system: 'osteopathic', icon: '🦴', symptoms: ['thoracic outlet syndrome', 'lymphatic congestion', 'arm numbness', 'clavicle restriction'], clinicalFocus: 'Decompresses neurovascular bundle and maximizes central thoracic duct drainage' },
    { id: 'osteopathic_respiratory_diaphragm', name: 'Thoraco-Abdominal Diaphragm', secondaryName: 'Crural Attachments (L1-L3) & Vagus Nerve Hiatus', paradigm: 'osteopathic', system: 'osteopathic', icon: '🫁', symptoms: ['shallow breathing', 'hiatal hernia', 'vagus nerve compression', 'anxiety', 'diaphragm spasm'], clinicalFocus: 'Harmonizes pressure differential between thoracic and abdominal cavities' },
    { id: 'osteopathic_pelvic_diaphragm', name: 'Pelvic Diaphragm & Levator Ani', secondaryName: 'Sacrotuberous Ligament & Pudendal Canal', paradigm: 'osteopathic', system: 'osteopathic', icon: '🦴', symptoms: ['pelvic floor dysfunction', 'sacral shear', 'pudendal nerve irritation', 'tailbone pain'], clinicalFocus: 'Restores reciprocity between thoracic and pelvic diaphragmatic pumps' }
  ];

  focusedHotzoneFeedback = signal<string | null>(null);

  /**
   * Fast Levenshtein distance for medical term and symptom typo tolerance.
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  private readonly clinicalAliases: Record<string, string[]> = {
    'migraine': ['head', 'brain', 'acupoint_gv20', 'acupoint_li4_r', 'acupoint_li4_l', 'osteopathic_cranium'],
    'headache': ['head', 'brain', 'acupoint_gv20', 'acupoint_li4_r', 'acupoint_li4_l', 'osteopathic_cranium'],
    'htn': ['heart', 'kidneys', 'acupoint_lr3_r', 'acupoint_lr3_l', 'acupoint_gv20'],
    'hypertension': ['heart', 'kidneys', 'acupoint_lr3_r', 'acupoint_lr3_l'],
    'gerd': ['stomach', 'abdomen', 'acupoint_cv12', 'osteopathic_respiratory_diaphragm'],
    'acid reflux': ['stomach', 'acupoint_cv12', 'abdomen'],
    'sciatica': ['spine_lumbar', 'dermatome_l4_l5', 'acupoint_bl40_r', 'pelvis'],
    'lumbago': ['spine_lumbar', 'acupoint_bl23_r', 'acupoint_bl40_r'],
    'sibo': ['abdomen', 'stomach', 'marma_nabhi'],
    'ibs': ['abdomen', 'stomach', 'marma_nabhi'],
    'pots': ['brain', 'heart', 'cellular_mitochondria'],
    'dysautonomia': ['brain', 'heart', 'osteopathic_respiratory_diaphragm'],
    'tmj': ['head', 'osteopathic_cranium', 'acupoint_li4_r', 'acupoint_li4_l'],
    'tinnitus': ['head', 'brain', 'acupoint_gb20_r', 'acupoint_bl23_r'],
    'atp': ['cellular_mitochondria'],
    'mitochondria': ['cellular_mitochondria'],
    'fatigue': ['cellular_mitochondria', 'acupoint_st36_r', 'acupoint_st36_l', 'thyroid', 'brain'],
    'omt': ['osteopathic_cranium', 'osteopathic_thoracic_inlet', 'osteopathic_respiratory_diaphragm', 'osteopathic_pelvic_diaphragm'],
    'tcm': ['acupoint_gv20', 'acupoint_cv17', 'acupoint_cv12', 'acupoint_st36_r', 'acupoint_li4_r', 'acupoint_sp6_r', 'acupoint_pc6_r', 'acupoint_lr3_r', 'acupoint_ki1_r', 'acupoint_gb20_r', 'acupoint_bl23_r', 'acupoint_bl40_r'],
    'marma': ['marma_adhipati', 'marma_sthapani', 'marma_hridaya', 'marma_nabhi', 'marma_basti', 'marma_kshipra', 'marma_talahridaya'],
    'chakra': ['marma_adhipati', 'marma_sthapani', 'marma_hridaya', 'marma_nabhi', 'marma_basti', 'marma_kshipra', 'marma_talahridaya'],
    'knee': ['leg_left', 'leg_right', 'acupoint_st36_r', 'acupoint_st36_l', 'acupoint_bl40_r'],
    'back pain': ['spine_lumbar', 'spine_thoracic', 'spine_cervical', 'acupoint_bl23_r', 'acupoint_bl40_r'],
    'neck': ['spine_cervical', 'osteopathic_thoracic_inlet', 'acupoint_gb20_r', 'head']
  };

  private calculateFuzzyMatchScore(query: string, part: (typeof this.allParts)[number]): number {
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    let score = 0;
    const nameLower = part.name.toLowerCase();
    const secNameLower = (part.secondaryName || '').toLowerCase();
    const idLower = part.id.toLowerCase();
    const focusLower = part.clinicalFocus.toLowerCase();
    const symptomsLower = part.symptoms.map(s => s.toLowerCase());

    // 1. Clinical acronym / alias exact match
    if (this.clinicalAliases[q]?.includes(part.id)) {
      score += 450;
    }

    // 2. Exact match on ID, Name, or Secondary Name
    if (idLower === q || nameLower === q || secNameLower === q) {
      score += 500;
    } else if (nameLower.startsWith(q) || idLower.startsWith(q)) {
      score += 350;
    } else if (nameLower.includes(q)) {
      score += 250;
    } else if (secNameLower.includes(q)) {
      score += 200;
    }

    // 3. Exact or substring match in symptoms
    if (symptomsLower.includes(q)) {
      score += 300;
    } else if (symptomsLower.some(s => s.includes(q))) {
      score += 180;
    }

    // 4. Clinical focus or system match
    if (focusLower.includes(q)) {
      score += 120;
    }
    if (part.system.toLowerCase().includes(q) || part.paradigm.toLowerCase().includes(q)) {
      score += 140;
    }

    // 5. Multi-token and fuzzy typo tolerance
    const tokens = q.split(/\s+/).filter(t => t.length > 0);
    const searchableWords = [
      ...nameLower.split(/[\s,()•-]+/),
      ...secNameLower.split(/[\s,()•-]+/),
      ...symptomsLower.flatMap(s => s.split(/[\s,()•-]+/))
    ].filter(w => w.length > 2);

    for (const token of tokens) {
      if (searchableWords.some(w => w === token)) {
        score += 120;
      } else if (searchableWords.some(w => w.startsWith(token))) {
        score += 80;
      } else if (token.length >= 4) {
        // Fuzzy distance comparison for typos
        for (const word of searchableWords) {
          const dist = this.levenshteinDistance(token, word);
          if (dist === 1) {
            score += 100;
            break;
          } else if (dist === 2 && token.length >= 6) {
            score += 50;
            break;
          }
        }
      }
    }

    return score;
  }

  getHotzoneCameraPreset(partId: string): 'cranial' | 'visceral' | 'spinal' | 'peripheral' | 'front' {
    const id = partId.toLowerCase();
    if (
      id.includes('head') || id.includes('brain') || id.includes('cranial') ||
      id.includes('thyroid') || id.includes('cervical') || id.includes('gv20') ||
      id.includes('adhipati') || id.includes('sthapani') || id.includes('sahasrara') ||
      id.includes('ajna') || id.includes('vishuddha') || id.includes('oral_fdi')
    ) {
      return 'cranial';
    }
    if (
      id.includes('heart') || id.includes('lung') || id.includes('chest') ||
      id.includes('stomach') || id.includes('liver') || id.includes('kidney') ||
      id.includes('abdo') || id.includes('cv17') || id.includes('cv12') ||
      id.includes('hridaya') || id.includes('nabhi') || id.includes('anahata') ||
      id.includes('manipura') || id.includes('respiratory') || id.includes('mitochondria') ||
      id.includes('cellular')
    ) {
      return 'visceral';
    }
    if (
      id.includes('thoracic') || id.includes('lumbar') || id.includes('sacral') ||
      id.includes('spine') || id.includes('pelvis') || id.includes('dermatome_l4') ||
      id.includes('bl23') || id.includes('bl40') || id.includes('basti') ||
      id.includes('svadhisthana') || id.includes('muladhara') || id.includes('diaphragm')
    ) {
      return 'spinal';
    }
    if (
      id.includes('shoulder') || id.includes('arm') || id.includes('hand') ||
      id.includes('leg') || id.includes('thigh') || id.includes('shin') ||
      id.includes('foot') || id.includes('dermatome_c6') || id.includes('st36') ||
      id.includes('li4') || id.includes('sp6') || id.includes('pc6') ||
      id.includes('lr3') || id.includes('ki1') || id.includes('gb20') ||
      id.includes('kshipra') || id.includes('talahridaya')
    ) {
      return 'peripheral';
    }
    return 'front';
  }

  filteredParts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const system = this.activeSystemFilter();

    if (!q) {
      return this.allParts.filter(p => system === 'all' || p.paradigm === system || p.system === system);
    }

    return this.allParts
      .map(part => {
        const matchesSystem = system === 'all' || part.paradigm === system || part.system === system;
        if (!matchesSystem) return { part, score: 0 };
        const score = this.calculateFuzzyMatchScore(q, part);
        return { part, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.part);
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.isSearchOpen.set(true);
    this.selectedAutocompleteIndex.set(-1);
  }

  onSearchKeyDown(event: KeyboardEvent) {
    const parts = this.filteredParts();
    if (!parts.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (this.selectedAutocompleteIndex() + 1) % parts.length;
      this.selectedAutocompleteIndex.set(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (this.selectedAutocompleteIndex() - 1 + parts.length) % parts.length;
      this.selectedAutocompleteIndex.set(prev);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.selectedAutocompleteIndex();
      const targetPart = idx >= 0 && idx < parts.length ? parts[idx] : parts[0];
      if (targetPart) {
        this.onPartSearchResultClick(targetPart);
      }
    } else if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
    this.selectedAutocompleteIndex.set(-1);
  }

  onPartSearchResultClick(part: { id: string, name: string, paradigm?: string }) {
    // 1. Activate matching paradigm mode if needed
    if (part.paradigm === 'eastern') {
      this.state.selectPhilosophy('eastern');
      this.state.bodyViewerMode.set('3d');
    } else if (part.paradigm === 'ayurvedic') {
      this.state.selectPhilosophy('ayurvedic');
      this.state.bodyViewerMode.set('3d');
    } else if (part.paradigm === 'osteopathic') {
      this.state.selectPhilosophy('osteopathic');
      this.state.bodyViewerMode.set('3d');
    } else if (part.paradigm === 'cellular') {
      this.state.bodyViewerMode.set('cellular');
    } else {
      this.state.selectPhilosophy('western');
      this.state.bodyViewerMode.set('3d');
    }

    // 2. Select the anatomical target in the shared state & trigger hotzone auto-focus
    this.select(part.id, part.name);
    
    const preset = this.getHotzoneCameraPreset(part.id);
    this.focusedHotzoneFeedback.set(`🎯 Auto-Focused ${part.name} (${preset.toUpperCase()} Sentinel View)`);
    setTimeout(() => {
      this.focusedHotzoneFeedback.set(null);
    }, 4000);

    this.searchQuery.set('');
    this.isSearchOpen.set(false);
    this.selectedAutocompleteIndex.set(-1);
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
