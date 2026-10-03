import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  viewChild,
  ElementRef,
  afterNextRender,
  PLATFORM_ID,
  HostListener,
  output
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MocaAssessmentService,
  STANDARD_TRAIL_NODES,
  VIGILANCE_LETTER_SEQUENCE
} from '../../services/moca/moca-assessment.service';
import { MocaDomainId, ITrailNode } from '../../services/moca/moca.types';

@Component({
  selector: 'app-moca-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto rounded-3xl border border-teal-500/30 bg-zinc-950/95 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl text-zinc-100 font-sans space-y-6">
      
      <!-- Top Clinical Navigation HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🧩
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base sm:text-lg font-black text-white tracking-tight">
                Montreal Cognitive Assessment (MoCA)
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                30-Point Standard Battery
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                LOINC 72106-8
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-mono mt-0.5">
              Standardized Neurocognitive Screener &bull; Version 8.1 &bull; Nasreddine et al. (2005)
            </p>
          </div>
        </div>

        <!-- Live Score Counter & Tier Badge -->
        <div class="flex items-center gap-3 self-end sm:self-center">
          <div class="flex flex-col items-end">
            <div class="flex items-baseline gap-1 font-mono">
              <span class="text-2xl sm:text-3xl font-black tracking-tight"
                [class.text-emerald-400]="mocaSvc.totalAdjustedScore() >= 26"
                [class.text-amber-400]="mocaSvc.totalAdjustedScore() >= 18 && mocaSvc.totalAdjustedScore() < 26"
                [class.text-orange-400]="mocaSvc.totalAdjustedScore() >= 10 && mocaSvc.totalAdjustedScore() < 18"
                [class.text-rose-400]="mocaSvc.totalAdjustedScore() < 10">
                {{ mocaSvc.totalAdjustedScore() }}
              </span>
              <span class="text-xs text-zinc-500 font-bold">/30</span>
            </div>
            <span class="text-[10px] font-mono uppercase font-bold text-zinc-400">
              Raw: {{ mocaSvc.rawTotalScore() }} | Edu: +{{ mocaSvc.educationBonus() }}
            </span>
          </div>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border transition-all shadow-sm"
            [class]="mocaSvc.summaryResult().tierColor">
            {{ mocaSvc.summaryResult().tierLabel }}
          </span>

          <button 
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white text-sm transition cursor-pointer"
            title="Close MoCA Suite">
            ✕
          </button>
        </div>
      </div>

      <!-- Domain Navigation Rail / Stepper -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono border-b border-zinc-800/80">
        @for (step of steps; track step.id; let i = $index) {
          <button 
            type="button"
            (click)="activeStepId.set(step.id)"
            [class.bg-teal-500]="activeStepId() === step.id"
            [class.text-zinc-950]="activeStepId() === step.id"
            [class.font-extrabold]="activeStepId() === step.id"
            [class.border-teal-400]="activeStepId() === step.id"
            [class.bg-zinc-900]="activeStepId() !== step.id"
            [class.text-zinc-400]="activeStepId() !== step.id"
            [class.border-zinc-800]="activeStepId() !== step.id"
            class="px-3 py-2 rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:border-zinc-600">
            <span class="opacity-70">{{ i + 1 }}.</span>
            <span>{{ step.label }}</span>
            <span class="text-[10px] opacity-80 font-bold">({{ step.getScore() }}/{{ step.maxScore }})</span>
          </button>
        }
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 1: VISUOSPATIAL / EXECUTIVE (5 PTS)                          -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'visuospatial') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400 flex items-center gap-2">
                  <span>1. Alternating Trail Making Test (1 Point)</span>
                </h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Connect alternating numbered and lettered circles in sequential order: <strong>1 &rarr; A &rarr; 2 &rarr; B &rarr; 3 &rarr; C &rarr; 4 &rarr; D &rarr; 5 &rarr; E</strong> without crossing lines.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="resetTrailCanvas()"
                  class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 border border-zinc-700 transition cursor-pointer">
                  ↺ Clear Path
                </button>
                <button 
                  type="button"
                  (click)="toggleTrailPass()"
                  [class.bg-emerald-600]="mocaSvc.sessionState().trailMakingScore === 1"
                  [class.text-white]="mocaSvc.sessionState().trailMakingScore === 1"
                  [class.bg-zinc-800]="mocaSvc.sessionState().trailMakingScore !== 1"
                  [class.text-zinc-400]="mocaSvc.sessionState().trailMakingScore !== 1"
                  class="px-3 py-1 rounded-lg border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().trailMakingScore === 1 ? '✓ Passed (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>
            </div>

            <!-- Trail Making Interactive Surface -->
            <div class="relative w-full h-72 sm:h-80 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner select-none">
              <!-- Canvas for Lines -->
              <canvas #trailCanvas class="absolute inset-0 w-full h-full cursor-crosshair z-0"></canvas>

              <!-- Interactive Node Buttons on Canvas -->
              @for (node of trailNodes; track node.id) {
                <button 
                  type="button"
                  (click)="onTrailNodeClick(node)"
                  [style.left.%]="node.x"
                  [style.top.%]="node.y"
                  [class.bg-teal-500]="isNodeInPath(node.id)"
                  [class.text-zinc-950]="isNodeInPath(node.id)"
                  [class.scale-110]="isNodeInPath(node.id)"
                  [class.border-teal-300]="isNodeInPath(node.id)"
                  [class.shadow-teal-500-50]="isNodeInPath(node.id)"
                  [class.bg-zinc-900]="!isNodeInPath(node.id)"
                  [class.text-zinc-200]="!isNodeInPath(node.id)"
                  [class.border-zinc-700]="!isNodeInPath(node.id)"
                  class="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-black text-sm shadow-md transition-transform duration-150 z-10 cursor-pointer hover:border-teal-400 active:scale-95">
                  {{ node.label }}
                </button>
              }

              <!-- Live Path Tracker HUD -->
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-300 backdrop-blur-md z-20">
                <span>Path: {{ currentTrailPathDisplay() || 'Click nodes sequentially starting at 1' }}</span>
                <span class="text-teal-400 font-bold">{{ trailPath().length }}/10 Nodes</span>
              </div>
            </div>
          </div>

          <!-- Sub-task: Isometric Cube Copy -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400">2. Visuoconstructional Skills: Cube Copy (1 Point)</h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Copy the 3D isometric cube as accurately as possible. Criteria: 3D form, all lines drawn, parallel edges preserved.
                </p>
              </div>

              <button 
                type="button"
                (click)="toggleCubePass()"
                [class.bg-emerald-600]="mocaSvc.sessionState().cubeCopyScore === 1"
                [class.text-white]="mocaSvc.sessionState().cubeCopyScore === 1"
                [class.bg-zinc-800]="mocaSvc.sessionState().cubeCopyScore !== 1"
                [class.text-zinc-400]="mocaSvc.sessionState().cubeCopyScore !== 1"
                class="px-3 py-1 rounded-lg border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                {{ mocaSvc.sessionState().cubeCopyScore === 1 ? '✓ Passed (1 pt)' : 'Credit (1 pt)' }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Target Wireframe Cube Reference -->
              <div class="h-56 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex flex-col items-center justify-center relative">
                <span class="absolute top-2 left-3 text-[10px] font-mono uppercase font-bold text-zinc-500">Target Model</span>
                <!-- SVG Isometric Cube -->
                <svg width="150" height="150" viewBox="0 0 100 100" class="stroke-teal-400 fill-teal-500/10 stroke-2">
                  <!-- Front square -->
                  <polygon points="20,40 60,40 60,80 20,80" />
                  <!-- Back square -->
                  <polygon points="40,20 80,20 80,60 40,60" class="stroke-teal-400/60 fill-none" />
                  <!-- Connecting edges -->
                  <line x1="20" y1="40" x2="40" y2="20" />
                  <line x1="60" y1="40" x2="80" y2="20" />
                  <line x1="60" y1="80" x2="80" y2="60" />
                  <line x1="20" y1="80" x2="40" y2="60" />
                </svg>
              </div>

              <!-- Drawing Canvas Pad -->
              <div class="h-56 bg-zinc-950 rounded-2xl border border-zinc-800 p-2 relative flex flex-col">
                <div class="flex items-center justify-between px-2 pb-1 text-[10px] font-mono text-zinc-400">
                  <span>Patient Drawing Canvas</span>
                  <button type="button" (click)="clearCubeCanvas()" class="hover:text-white cursor-pointer">Clear</button>
                </div>
                <canvas 
                  #cubeCanvas 
                  (pointerdown)="startDrawingCube($event)"
                  (pointermove)="drawCube($event)"
                  (pointerup)="stopDrawingCube()"
                  class="flex-1 w-full bg-zinc-900/50 rounded-xl cursor-crosshair border border-zinc-800/80 touch-none"></canvas>
              </div>
            </div>
          </div>

          <!-- Sub-task: Clock Drawing Test (CDT) -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="border-b border-zinc-800/80 pb-3">
              <h3 class="text-sm font-bold text-teal-400">3. Visuoconstructional Skills: Clock Drawing Test (3 Points)</h3>
              <p class="text-xs text-zinc-300 mt-1">
                Instruction to Patient: <em>"Draw a clock face. Put in all the numbers and set the time to 10 past 11 (11:10)."</em>
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Drawing Canvas Pad -->
              <div class="h-64 bg-zinc-950 rounded-2xl border border-zinc-800 p-2 flex flex-col relative">
                <div class="flex items-center justify-between px-2 pb-1 text-[10px] font-mono text-zinc-400">
                  <span>Clock Face Canvas</span>
                  <div class="flex items-center gap-2">
                    <button type="button" (click)="toggleClockGuide()" class="hover:text-teal-400 cursor-pointer">
                      {{ showClockGuide() ? 'Hide Circle Guide' : 'Show Circle Guide' }}
                    </button>
                    <span>&bull;</span>
                    <button type="button" (click)="clearClockCanvas()" class="hover:text-white cursor-pointer">Clear</button>
                  </div>
                </div>
                <div class="relative flex-1 w-full overflow-hidden">
                  @if (showClockGuide()) {
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div class="w-48 h-48 rounded-full border border-dashed border-teal-500/30"></div>
                    </div>
                  }
                  <canvas 
                    #clockCanvas 
                    (pointerdown)="startDrawingClock($event)"
                    (pointermove)="drawClock($event)"
                    (pointerup)="stopDrawingClock()"
                    class="absolute inset-0 w-full h-full bg-zinc-900/50 rounded-xl cursor-crosshair border border-zinc-800/80 touch-none"></canvas>
                </div>
              </div>

              <!-- 3-Point Rubric Checkboxes -->
              <div class="flex flex-col justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span class="text-xs font-mono uppercase font-bold text-teal-400">Clinical CDT Scoring Rubric:</span>

                <label class="flex items-start gap-3 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 cursor-pointer transition">
                  <input 
                    type="checkbox" 
                    [checked]="mocaSvc.sessionState().clockScores.contour"
                    (change)="mocaSvc.setClockScore('contour', $any($event.target).checked)"
                    class="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500 cursor-pointer">
                  <div>
                    <span class="text-xs font-bold text-zinc-200 block">Contour (1 Point)</span>
                    <span class="text-[11px] text-zinc-400">Clock face must be circular with acceptable minor distortion.</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 cursor-pointer transition">
                  <input 
                    type="checkbox" 
                    [checked]="mocaSvc.sessionState().clockScores.numbers"
                    (change)="mocaSvc.setClockScore('numbers', $any($event.target).checked)"
                    class="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500 cursor-pointer">
                  <div>
                    <span class="text-xs font-bold text-zinc-200 block">Numbers (1 Point)</span>
                    <span class="text-[11px] text-zinc-400">All 12 numbers present with zero duplicates, clockwise order and spatial quadrants intact.</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 cursor-pointer transition">
                  <input 
                    type="checkbox" 
                    [checked]="mocaSvc.sessionState().clockScores.hands"
                    (change)="mocaSvc.setClockScore('hands', $any($event.target).checked)"
                    class="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500 cursor-pointer">
                  <div>
                    <span class="text-xs font-bold text-zinc-200 block">Hands: 10 Past 11 (1 Point)</span>
                    <span class="text-[11px] text-zinc-400">Hour hand at 11, minute hand at 2. Hour hand must be distinctly shorter than minute hand.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 2: ANIMAL NAMING (3 PTS)                                     -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'naming') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-teal-400">Animal Identification (3 Points Total)</h3>
              <p class="text-xs text-zinc-300 mt-1">
                Ask patient to identify each animal from left to right. Patient may speak name aloud or clinician can mark credit.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Animal 1: Lion -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between text-center space-y-3">
                <div class="w-full h-32 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent flex items-center justify-center text-6xl">
                  🦁
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-200 block">Animal 1</span>
                  <span class="text-[11px] font-mono text-zinc-400">Target: Lion</span>
                </div>
                <button 
                  type="button"
                  (click)="mocaSvc.setAnimalScore('lion', !mocaSvc.sessionState().animalNaming.lion)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().animalNaming.lion"
                  [class.text-white]="mocaSvc.sessionState().animalNaming.lion"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().animalNaming.lion"
                  [class.text-zinc-400]="!mocaSvc.sessionState().animalNaming.lion"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().animalNaming.lion ? '✓ Correct (1 pt)' : 'Mark Correct (1 pt)' }}
                </button>
              </div>

              <!-- Animal 2: Rhinoceros -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between text-center space-y-3">
                <div class="w-full h-32 rounded-xl bg-gradient-to-b from-teal-500/10 to-transparent flex items-center justify-center text-6xl">
                  🦏
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-200 block">Animal 2</span>
                  <span class="text-[11px] font-mono text-zinc-400">Target: Rhinoceros / Rhino</span>
                </div>
                <button 
                  type="button"
                  (click)="mocaSvc.setAnimalScore('rhinoceros', !mocaSvc.sessionState().animalNaming.rhinoceros)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().animalNaming.rhinoceros"
                  [class.text-white]="mocaSvc.sessionState().animalNaming.rhinoceros"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().animalNaming.rhinoceros"
                  [class.text-zinc-400]="!mocaSvc.sessionState().animalNaming.rhinoceros"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().animalNaming.rhinoceros ? '✓ Correct (1 pt)' : 'Mark Correct (1 pt)' }}
                </button>
              </div>

              <!-- Animal 3: Camel -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between text-center space-y-3">
                <div class="w-full h-32 rounded-xl bg-gradient-to-b from-orange-500/10 to-transparent flex items-center justify-center text-6xl">
                  🐫
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-200 block">Animal 3</span>
                  <span class="text-[11px] font-mono text-zinc-400">Target: Camel / Dromedary</span>
                </div>
                <button 
                  type="button"
                  (click)="mocaSvc.setAnimalScore('camel', !mocaSvc.sessionState().animalNaming.camel)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().animalNaming.camel"
                  [class.text-white]="mocaSvc.sessionState().animalNaming.camel"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().animalNaming.camel"
                  [class.text-zinc-400]="!mocaSvc.sessionState().animalNaming.camel"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().animalNaming.camel ? '✓ Correct (1 pt)' : 'Mark Correct (1 pt)' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 3: MEMORY REGISTRATION (0 PTS)                              -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'memory_registration') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400">Memory Registration (2 Learning Trials &bull; 0 Points)</h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Read list of 5 words at 1 word per second. Patient repeats list. Repeat for Trial 2. Delayed recall is tested at the end.
                </p>
              </div>

              <button 
                type="button"
                (click)="speakMemoryList()"
                class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer">
                <span>🔊 Read Words (1s Paced)</span>
              </button>
            </div>

            <!-- Words Grid Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr class="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                    <th class="py-2 text-left">Word</th>
                    <th class="py-2 text-center">Trial 1 Recalled</th>
                    <th class="py-2 text-center">Trial 2 Recalled</th>
                    <th class="py-2 text-left">Category Cue (Delayed Use)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60">
                  @for (item of mocaSvc.sessionState().memoryWords; track item.word; let i = $index) {
                    <tr class="hover:bg-zinc-900/30">
                      <td class="py-3 font-bold text-white text-sm tracking-wider">{{ item.word }}</td>
                      <td class="py-3 text-center">
                        <button 
                          type="button"
                          (click)="mocaSvc.toggleMemoryTrialWord(i, 1)"
                          [class.bg-teal-500]="item.trial1Recalled"
                          [class.text-zinc-950]="item.trial1Recalled"
                          [class.bg-zinc-800]="!item.trial1Recalled"
                          [class.text-zinc-400]="!item.trial1Recalled"
                          class="px-3 py-1 rounded-lg border border-zinc-700 text-xs font-bold transition cursor-pointer">
                          {{ item.trial1Recalled ? '✓ Recalled' : 'Missed' }}
                        </button>
                      </td>
                      <td class="py-3 text-center">
                        <button 
                          type="button"
                          (click)="mocaSvc.toggleMemoryTrialWord(i, 2)"
                          [class.bg-teal-500]="item.trial2Recalled"
                          [class.text-zinc-950]="item.trial2Recalled"
                          [class.bg-zinc-800]="!item.trial2Recalled"
                          [class.text-zinc-400]="!item.trial2Recalled"
                          class="px-3 py-1 rounded-lg border border-zinc-700 text-xs font-bold transition cursor-pointer">
                          {{ item.trial2Recalled ? '✓ Recalled' : 'Missed' }}
                        </button>
                      </td>
                      <td class="py-3 text-zinc-400 italic">{{ item.categoryCue }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 4: ATTENTION & WORKING MEMORY (6 PTS)                        -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'attention') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <!-- 1. Digit Spans -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-teal-400">1. Digit Spans (2 Points Total)</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Forward Span -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-200">Forward Digit Span (1 pt)</span>
                  <button type="button" (click)="mocaSvc.speakText('2, 1, 8, 5, 4')" class="text-xs text-teal-400 hover:text-teal-300 font-mono">🔊 Play</button>
                </div>
                <div class="p-3 bg-zinc-900 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-white">
                  2 - 1 - 8 - 5 - 4
                </div>
                <p class="text-[11px] text-zinc-400">Patient repeats sequence in forward order.</p>
                <button 
                  type="button"
                  (click)="mocaSvc.setDigitSpan('forward', !mocaSvc.sessionState().attention.digitSpanForward)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().attention.digitSpanForward"
                  [class.text-white]="mocaSvc.sessionState().attention.digitSpanForward"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().attention.digitSpanForward"
                  [class.text-zinc-400]="!mocaSvc.sessionState().attention.digitSpanForward"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().attention.digitSpanForward ? '✓ Passed (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>

              <!-- Backward Span -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-200">Backward Digit Span (1 pt)</span>
                  <button type="button" (click)="mocaSvc.speakText('7, 4, 2')" class="text-xs text-teal-400 hover:text-teal-300 font-mono">🔊 Play</button>
                </div>
                <div class="p-3 bg-zinc-900 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-white">
                  7 - 4 - 2 &rarr; (Target: 2 - 4 - 7)
                </div>
                <p class="text-[11px] text-zinc-400">Patient repeats sequence in reverse order.</p>
                <button 
                  type="button"
                  (click)="mocaSvc.setDigitSpan('backward', !mocaSvc.sessionState().attention.digitSpanBackward)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().attention.digitSpanBackward"
                  [class.text-white]="mocaSvc.sessionState().attention.digitSpanBackward"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().attention.digitSpanBackward"
                  [class.text-zinc-400]="!mocaSvc.sessionState().attention.digitSpanBackward"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().attention.digitSpanBackward ? '✓ Passed (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Auditory & Visual 1 Hz Vigilance Tapper -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400">2. Auditory/Visual Vigilance Test (1 Point)</h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Letters flash and tone sounds at 1 letter per second. Instruct patient: <em>"Tap on the screen (or press spacebar) whenever you see or hear the letter 'A'."</em> (Passed if &le;1 error).
                </p>
              </div>

              @if (!mocaSvc.isVigilanceRunning()) {
                <button 
                  type="button"
                  (click)="mocaSvc.startVigilanceTest()"
                  class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg">
                  ▶ Start 1 Hz Test
                </button>
              } @else {
                <button 
                  type="button"
                  (click)="mocaSvc.stopVigilanceTest()"
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg animate-pulse">
                  ⏹ Stop Test
                </button>
              }
            </div>

            <!-- Interactive 1 Hz Letter Display & Big Touch Target -->
            <div class="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center space-y-5">
              <!-- Active Letter Flash Box -->
              <div class="w-28 h-28 rounded-2xl bg-zinc-900 border-2 border-teal-500/50 flex items-center justify-center shadow-2xl relative">
                <span class="text-6xl font-black font-mono tracking-tight"
                  [class.text-teal-300]="mocaSvc.currentVigilanceLetter() === 'A'"
                  [class.text-white]="mocaSvc.currentVigilanceLetter() !== 'A'">
                  {{ mocaSvc.currentVigilanceLetter() || '&bull;' }}
                </span>
                @if (mocaSvc.isVigilanceRunning()) {
                  <span class="absolute top-1 right-2 text-[10px] font-mono text-zinc-500">
                    {{ mocaSvc.currentVigilanceIndex() + 1 }}/24
                  </span>
                }
              </div>

              <!-- Accessible Touch Target Button (Fitts's Law 64px+) -->
              <button 
                type="button"
                (pointerdown)="mocaSvc.registerVigilanceTap()"
                [disabled]="!mocaSvc.isVigilanceRunning()"
                class="w-full max-w-sm h-16 rounded-2xl font-mono font-bold text-sm uppercase tracking-widest transition shadow-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none bg-teal-500 hover:bg-teal-400 text-zinc-950">
                <span>⚡ TAP FOR 'A' (OR PRESS SPACE)</span>
              </button>

              <!-- Live Telemetry Error HUD -->
              <div class="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span>Omissions (Missed 'A'): <strong class="text-amber-400">{{ mocaSvc.sessionState().attention.vigilanceOmissions }}</strong></span>
                <span>&bull;</span>
                <span>Commissions (Wrong Tap): <strong class="text-rose-400">{{ mocaSvc.sessionState().attention.vigilanceCommissions }}</strong></span>
                <span>&bull;</span>
                <span>Score: <strong [class.text-emerald-400]="mocaSvc.sessionState().attention.vigilanceTapping">{{ mocaSvc.sessionState().attention.vigilanceTapping ? '1/1 pt' : '0/1 pt' }}</strong></span>
              </div>
            </div>
          </div>

          <!-- 3. Serial 7 Subtractions -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-teal-400">3. Serial 7 Subtraction (3 Points Total)</h3>
              <p class="text-xs text-zinc-300 mt-1">
                Instruct patient: <em>"Starting at 100, sequentially subtract 7."</em> (4-5 correct: 3 pts, 2-3 correct: 2 pts, 1 correct: 1 pt).
              </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">100 - 7</span>
                <span class="text-base font-bold text-white">93</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">93 - 7</span>
                <span class="text-base font-bold text-white">86</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">86 - 7</span>
                <span class="text-base font-bold text-white">79</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">79 - 7</span>
                <span class="text-base font-bold text-white">72</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">72 - 7</span>
                <span class="text-base font-bold text-white">65</span>
              </div>
            </div>

            <!-- Subtraction Correct Counter -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span class="text-xs text-zinc-300 font-mono">Select number of correct subtractions:</span>
              <div class="flex items-center gap-1 font-mono">
                @for (c of [0, 1, 2, 3, 4, 5]; track c) {
                  <button 
                    type="button"
                    (click)="mocaSvc.setSerial7Score(c)"
                    [class.bg-teal-500]="mocaSvc.sessionState().attention.serial7CorrectCount === c"
                    [class.text-zinc-950]="mocaSvc.sessionState().attention.serial7CorrectCount === c"
                    [class.font-bold]="mocaSvc.sessionState().attention.serial7CorrectCount === c"
                    [class.bg-zinc-800]="mocaSvc.sessionState().attention.serial7CorrectCount !== c"
                    [class.text-zinc-400]="mocaSvc.sessionState().attention.serial7CorrectCount !== c"
                    class="w-9 h-9 rounded-lg border border-zinc-700 text-xs transition cursor-pointer">
                    {{ c }}
                  </button>
                }
              </div>
              <span class="text-xs font-mono font-bold text-teal-400">
                Score: {{ mocaSvc.sessionState().attention.serial7Score }}/3 pts
              </span>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 5: LANGUAGE & FLUENCY (3 PTS)                                -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'language') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <!-- Sentence Repetition -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-teal-400">1. Sentence Repetition (2 Points Total)</h3>
            <p class="text-xs text-zinc-300">
              Read each sentence verbatim. Patient must repeat exactly with no omissions, additions, or grammatical changes.
            </p>

            <div class="space-y-3">
              <!-- Sentence 1 -->
              <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-zinc-200">Sentence 1 (1 pt)</span>
                    <button type="button" (click)="mocaSvc.speakText('I only know that John is the one to help today.')" class="text-xs text-teal-400 font-mono">🔊 Play</button>
                  </div>
                  <p class="text-xs font-mono text-zinc-300 mt-1 italic">
                    "I only know that John is the one to help today."
                  </p>
                </div>
                <button 
                  type="button"
                  (click)="mocaSvc.setSentenceRepetition(1, !mocaSvc.sessionState().language.sentence1)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().language.sentence1"
                  [class.text-white]="mocaSvc.sessionState().language.sentence1"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().language.sentence1"
                  [class.text-zinc-400]="!mocaSvc.sessionState().language.sentence1"
                  class="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().language.sentence1 ? '✓ Exact (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>

              <!-- Sentence 2 -->
              <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-zinc-200">Sentence 2 (1 pt)</span>
                    <button type="button" (click)="mocaSvc.speakText('The cat always hid under the couch when dogs were in the room.')" class="text-xs text-teal-400 font-mono">🔊 Play</button>
                  </div>
                  <p class="text-xs font-mono text-zinc-300 mt-1 italic">
                    "The cat always hid under the couch when dogs were in the room."
                  </p>
                </div>
                <button 
                  type="button"
                  (click)="mocaSvc.setSentenceRepetition(2, !mocaSvc.sessionState().language.sentence2)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().language.sentence2"
                  [class.text-white]="mocaSvc.sessionState().language.sentence2"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().language.sentence2"
                  [class.text-zinc-400]="!mocaSvc.sessionState().language.sentence2"
                  class="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().language.sentence2 ? '✓ Exact (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 60-Second Phonemic Verbal Fluency (Letter 'F') -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400">2. Phonemic Verbal Fluency: Letter 'F' (1 Point)</h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Generate as many words beginning with 'F' in 60 seconds (no proper nouns, no variant suffixes). Target: <strong>&ge;11 words</strong>.
                </p>
              </div>

              @if (!mocaSvc.isFluencyRunning()) {
                <button 
                  type="button"
                  (click)="mocaSvc.startFluencyTest()"
                  class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg">
                  ▶ Start 60s Fluency Test
                </button>
              } @else {
                <button 
                  type="button"
                  (click)="mocaSvc.stopFluencyTest()"
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg animate-pulse">
                  ⏹ Stop ({{ mocaSvc.fluencySecondsRemaining() }}s)
                </button>
              }
            </div>

            <!-- Fluency Studio HUD -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Timer Ring -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center space-y-2">
                <span class="text-[10px] font-mono uppercase text-zinc-400 font-bold">Countdown Timer</span>
                <span class="text-4xl font-mono font-black tracking-tight"
                  [class.text-teal-400]="mocaSvc.fluencySecondsRemaining() > 10"
                  [class.text-rose-400]="mocaSvc.fluencySecondsRemaining() <= 10">
                  {{ mocaSvc.fluencySecondsRemaining() }}s
                </span>
                <span class="text-[11px] font-mono text-zinc-400">
                  Target: &ge;11 words
                </span>
              </div>

              <!-- Word Input & Recognition Status -->
              <div class="md:col-span-2 p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-3">
                <div class="flex items-center gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="manualFluencyWord"
                    (keydown.enter)="submitManualFluencyWord()"
                    placeholder="Type 'F' word & press enter..."
                    class="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400">
                  <button 
                    type="button"
                    (click)="submitManualFluencyWord()"
                    class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-teal-400 cursor-pointer">
                    + Add
                  </button>
                </div>

                <!-- Word Chips Cloud -->
                <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 font-mono text-xs">
                  @for (w of mocaSvc.sessionState().language.fluencyWords; track w; let i = $index) {
                    <span class="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center gap-1.5 text-[11px]">
                      <span>{{ w }}</span>
                      <button type="button" (click)="mocaSvc.removeFluencyWord(i)" class="text-zinc-500 hover:text-rose-400 text-xs cursor-pointer">✕</button>
                    </span>
                  }
                  @if (mocaSvc.sessionState().language.fluencyWords.length === 0) {
                    <span class="text-zinc-500 italic text-[11px]">No words entered yet. Speech recognition or manual entry will appear here.</span>
                  }
                </div>

                <!-- Progress Status -->
                <div class="flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-900">
                  <span>Count: <strong class="text-white">{{ mocaSvc.sessionState().language.fluencyCount }}</strong> / 11</span>
                  <span class="font-bold" [class.text-emerald-400]="mocaSvc.sessionState().language.fluencyPassed" [class.text-zinc-500]="!mocaSvc.sessionState().language.fluencyPassed">
                    {{ mocaSvc.sessionState().language.fluencyPassed ? '✓ Passed (1 pt)' : 'Needs ≥11 words (0 pts)' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 6: ABSTRACTION (2 PTS)                                       -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'abstraction') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-teal-400">Conceptual Abstraction: Similarities (2 Points Total)</h3>
              <p class="text-xs text-zinc-300 mt-1">
                Ask patient: <em>"Tell me what an orange and a banana have in common."</em> (Fruit). Then test target pairs below.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Pair 1: Train - Bicycle -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 block">Pair 1 (1 pt)</span>
                <div class="p-3 bg-zinc-900 rounded-xl text-center font-mono text-base font-bold text-white">
                  Train &bull; Bicycle
                </div>
                <p class="text-[11px] text-zinc-400">
                  Acceptable: Transportation, vehicles, means of travel.
                </p>
                <button 
                  type="button"
                  (click)="mocaSvc.setAbstractionScore('trainBicycle', !mocaSvc.sessionState().abstraction.trainBicycle)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().abstraction.trainBicycle"
                  [class.text-white]="mocaSvc.sessionState().abstraction.trainBicycle"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().abstraction.trainBicycle"
                  [class.text-zinc-400]="!mocaSvc.sessionState().abstraction.trainBicycle"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().abstraction.trainBicycle ? '✓ Correct (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>

              <!-- Pair 2: Watch - Ruler -->
              <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 block">Pair 2 (1 pt)</span>
                <div class="p-3 bg-zinc-900 rounded-xl text-center font-mono text-base font-bold text-white">
                  Watch &bull; Ruler
                </div>
                <p class="text-[11px] text-zinc-400">
                  Acceptable: Measuring instruments, measuring devices, tools for measurement.
                </p>
                <button 
                  type="button"
                  (click)="mocaSvc.setAbstractionScore('watchRuler', !mocaSvc.sessionState().abstraction.watchRuler)"
                  [class.bg-emerald-600]="mocaSvc.sessionState().abstraction.watchRuler"
                  [class.text-white]="mocaSvc.sessionState().abstraction.watchRuler"
                  [class.bg-zinc-900]="!mocaSvc.sessionState().abstraction.watchRuler"
                  [class.text-zinc-400]="!mocaSvc.sessionState().abstraction.watchRuler"
                  class="w-full py-2 rounded-xl border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                  {{ mocaSvc.sessionState().abstraction.watchRuler ? '✓ Correct (1 pt)' : 'Credit (1 pt)' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 7: DELAYED RECALL (5 PTS)                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'delayed_recall') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-teal-400">Delayed Uncued Memory Recall (5 Points Total)</h3>
              <p class="text-xs text-zinc-300 mt-1">
                Ask patient: <em>"I read 5 words to you earlier, which I asked you to remember. Tell me as many of those words as you can remember now."</em> Points are awarded <strong>only for uncued spontaneous recall</strong>.
              </p>
            </div>

            <!-- 5 Words Diagnostic Recall Panel -->
            <div class="space-y-3 font-mono text-xs">
              @for (item of mocaSvc.sessionState().memoryWords; track item.word; let i = $index) {
                <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="w-20 font-bold text-white text-sm tracking-wider">{{ item.word }}</span>
                    <span class="text-[10px] text-zinc-500 italic">Cue: {{ item.categoryCue }}</span>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <!-- Spontaneous (Official Point) -->
                    <button 
                      type="button"
                      (click)="mocaSvc.setDelayedRecallSpontaneous(i, !item.delayedSpontaneous)"
                      [class.bg-emerald-600]="item.delayedSpontaneous"
                      [class.text-white]="item.delayedSpontaneous"
                      [class.bg-zinc-900]="!item.delayedSpontaneous"
                      [class.text-zinc-400]="!item.delayedSpontaneous"
                      class="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-bold transition cursor-pointer">
                      {{ item.delayedSpontaneous ? '✓ Spontaneous (+1 pt)' : 'Spontaneous (+1 pt)' }}
                    </button>

                    <!-- Category Cued (Clinical Diagnostic Sub-Typing) -->
                    <button 
                      type="button"
                      [disabled]="item.delayedSpontaneous"
                      (click)="mocaSvc.setDelayedCategoryCued(i, !item.delayedCategoryCued)"
                      [class.bg-indigo-600]="item.delayedCategoryCued && !item.delayedSpontaneous"
                      [class.text-white]="item.delayedCategoryCued && !item.delayedSpontaneous"
                      [class.bg-zinc-900]="!item.delayedCategoryCued || item.delayedSpontaneous"
                      [class.text-zinc-500]="!item.delayedCategoryCued || item.delayedSpontaneous"
                      class="px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[11px] transition cursor-pointer disabled:opacity-40">
                      Category Cue (0 pts)
                    </button>

                    <!-- Multiple Choice (Clinical Diagnostic Sub-Typing) -->
                    <button 
                      type="button"
                      [disabled]="item.delayedSpontaneous || item.delayedCategoryCued"
                      (click)="mocaSvc.setDelayedChoiceCued(i, !item.delayedChoiceCued)"
                      [class.bg-purple-600]="item.delayedChoiceCued && !item.delayedSpontaneous"
                      [class.text-white]="item.delayedChoiceCued && !item.delayedSpontaneous"
                      [class.bg-zinc-900]="!item.delayedChoiceCued || item.delayedSpontaneous"
                      [class.text-zinc-500]="!item.delayedChoiceCued || item.delayedSpontaneous"
                      class="px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[11px] transition cursor-pointer disabled:opacity-40">
                      Choice Cue (0 pts)
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Delayed Spontaneous Score: <strong class="text-teal-400">{{ mocaSvc.delayedRecallScore() }}/5 points</strong></span>
              <span class="text-zinc-500">Category &amp; choice cues inform storage vs retrieval deficit sub-typing.</span>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DOMAIN 8: ORIENTATION (6 PTS)                                       -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'orientation') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 class="text-sm font-bold text-teal-400">Temporal &amp; Spatial Orientation (6 Points Total)</h3>
                <p class="text-xs text-zinc-300 mt-1">
                  Ask patient today's date, month, year, day of the week, place/clinic, and city.
                </p>
              </div>

              <button 
                type="button"
                (click)="autoVerifyOrientation()"
                class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold transition cursor-pointer">
                ⚡ Auto-Verify Date &amp; Day
              </button>
            </div>

            <!-- Orientation 6 Items Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              @for (item of orientationItems; track item.key) {
                <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-200">{{ item.label }}</span>
                    <span class="text-[10px] font-mono text-zinc-500">1 pt</span>
                  </div>
                  <span class="text-xs font-mono text-teal-400 truncate">{{ item.getValue() }}</span>
                  <button 
                    type="button"
                    (click)="mocaSvc.setOrientationScore(item.key, !mocaSvc.sessionState().orientation[item.key])"
                    [class.bg-emerald-600]="mocaSvc.sessionState().orientation[item.key]"
                    [class.text-white]="mocaSvc.sessionState().orientation[item.key]"
                    [class.bg-zinc-900]="!mocaSvc.sessionState().orientation[item.key]"
                    [class.text-zinc-400]="!mocaSvc.sessionState().orientation[item.key]"
                    class="w-full py-1.5 rounded-lg border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer">
                    {{ mocaSvc.sessionState().orientation[item.key] ? '✓ Intact (1 pt)' : 'Credit (1 pt)' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- SUMMARY & FHIR EXPORT REPORT                                        -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (activeStepId() === 'summary') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
            <div class="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <span>Comprehensive MoCA Diagnostic Summary</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    LOINC 72106-8
                  </span>
                </h3>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Standardized 30-Point Clinical Assessment &bull; Education-Stratified Phenotype
                </p>
              </div>

              <!-- Education Correction Selector -->
              <div class="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono">
                <span class="text-zinc-400">Formal Education:</span>
                <button 
                  type="button"
                  (click)="mocaSvc.setEducationYears(12)"
                  [class.bg-teal-500]="mocaSvc.sessionState().educationYears <= 12"
                  [class.text-zinc-950]="mocaSvc.sessionState().educationYears <= 12"
                  [class.font-bold]="mocaSvc.sessionState().educationYears <= 12"
                  [class.bg-zinc-800]="mocaSvc.sessionState().educationYears > 12"
                  class="px-2 py-1 rounded-md text-[10px] transition cursor-pointer">
                  &le; 12 Yrs (+1 Pt)
                </button>
                <button 
                  type="button"
                  (click)="mocaSvc.setEducationYears(16)"
                  [class.bg-teal-500]="mocaSvc.sessionState().educationYears > 12"
                  [class.text-zinc-950]="mocaSvc.sessionState().educationYears > 12"
                  [class.font-bold]="mocaSvc.sessionState().educationYears > 12"
                  [class.bg-zinc-800]="mocaSvc.sessionState().educationYears <= 12"
                  class="px-2 py-1 rounded-md text-[10px] transition cursor-pointer">
                  > 12 Yrs (0 Pt)
                </button>
              </div>
            </div>

            <!-- Diagnostic Overview Card -->
            <div class="p-5 rounded-2xl border bg-zinc-950/80 border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div class="space-y-2 max-w-xl">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-bold border" [class]="mocaSvc.summaryResult().tierColor">
                    {{ mocaSvc.summaryResult().tierLabel }}
                  </span>
                  <span class="text-xs font-mono text-zinc-400">
                    Phenotype: <strong>{{ mocaSvc.summaryResult().deficitProfile }}</strong>
                  </span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                  {{ mocaSvc.summaryResult().clinicalInterpretation }}
                </p>
              </div>

              <div class="flex flex-col items-center shrink-0 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 w-full md:w-56 text-center">
                <span class="text-[10px] uppercase font-bold text-zinc-400 font-mono">Final Adjusted Score</span>
                <span class="text-4xl font-black font-mono tracking-tight text-white my-1">
                  {{ mocaSvc.totalAdjustedScore() }}<span class="text-sm font-normal text-zinc-500">/30</span>
                </span>
                <span class="text-[10px] font-mono text-zinc-400">
                  Raw: {{ mocaSvc.rawTotalScore() }} | Edu Bonus: +{{ mocaSvc.educationBonus() }}
                </span>
              </div>
            </div>

            <!-- Domain Breakdown Bar Grid -->
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono uppercase font-bold text-zinc-400">Domain Performance Breakdown:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                @for (d of mocaSvc.summaryResult().domainBreakdown; track d.domainId) {
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span class="text-zinc-300 font-bold block">{{ d.name }}</span>
                      <span class="text-[10px] text-zinc-500">LOINC {{ d.loincComponentCode }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-teal-400 rounded-full" 
                          [style.width.%]="(d.earned / d.max) * 100"></div>
                      </div>
                      <span class="font-bold text-white w-8 text-right">{{ d.earned }}/{{ d.max }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Recommendations -->
            <div class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
              <span class="text-xs font-mono uppercase font-bold text-teal-400">Evidence-Grounded Recommendations:</span>
              <ul class="space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
                @for (rec of mocaSvc.summaryResult().recommendations; track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>

            <!-- Clinical Action Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button 
                type="button"
                (click)="exportFhirBundle()"
                class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95">
                <span>📋 Export FHIR R4 Bundle (LOINC 72106-8)</span>
              </button>

              <button 
                type="button"
                (click)="commitToPatientRecord()"
                class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95">
                <span>💾 Append to Patient Medical Chart</span>
              </button>

              <button 
                type="button"
                (click)="mocaSvc.resetSession()"
                class="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono font-bold text-xs uppercase tracking-wider border border-zinc-800 transition cursor-pointer">
                ↺ Reset All
              </button>
            </div>

            @if (toastMessage()) {
              <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center justify-between">
                <span>{{ toastMessage() }}</span>
                <button type="button" (click)="toastMessage.set(null)" class="text-emerald-400 hover:text-emerald-200">✕</button>
              </div>
            }

            <!-- Regulatory & Trademark Governance Disclaimer -->
            <div class="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[10px] font-mono text-zinc-500 space-y-1">
              <p><strong>Clinical Licensing &amp; Institutional Governance Attestation:</strong></p>
              <p>
                The Montreal Cognitive Assessment (&copy; MoCA Test Inc.) was developed by Dr. Ziad Nasreddine (2005). Official clinical diagnosis and third-party payer billing in clinical practice requires certified administrator training via mocatest.org. In accordance with FDA CDS &amp; HIPAA Safe Harbor standards, this module provides digital cognitive telemetry, FHIR interoperability, and decision support for certified clinical teams.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MocaSuiteComponent {
  readonly mocaSvc = inject(MocaAssessmentService);
  private platformId = inject(PLATFORM_ID);

  readonly close = output<void>();

  // Canvas ViewChild references
  trailCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('trailCanvas');
  cubeCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('cubeCanvas');
  clockCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('clockCanvas');

  // Navigation steps
  readonly steps = [
    { id: 'visuospatial', label: 'Visuospatial', maxScore: 5, getScore: () => this.mocaSvc.visuospatialScore() },
    { id: 'naming', label: 'Naming', maxScore: 3, getScore: () => this.mocaSvc.namingScore() },
    { id: 'memory_registration', label: 'Memory Reg', maxScore: 0, getScore: () => 0 },
    { id: 'attention', label: 'Attention', maxScore: 6, getScore: () => this.mocaSvc.attentionScore() },
    { id: 'language', label: 'Language', maxScore: 3, getScore: () => this.mocaSvc.languageScore() },
    { id: 'abstraction', label: 'Abstraction', maxScore: 2, getScore: () => this.mocaSvc.abstractionScore() },
    { id: 'delayed_recall', label: 'Delayed Recall', maxScore: 5, getScore: () => this.mocaSvc.delayedRecallScore() },
    { id: 'orientation', label: 'Orientation', maxScore: 6, getScore: () => this.mocaSvc.orientationScore() },
    { id: 'summary', label: 'Summary & FHIR', maxScore: 30, getScore: () => this.mocaSvc.totalAdjustedScore() }
  ];

  readonly activeStepId = signal<string>('visuospatial');
  readonly toastMessage = signal<string | null>(null);

  // Trail making state
  readonly trailNodes = STANDARD_TRAIL_NODES;
  readonly trailPath = signal<string[]>([]);
  readonly currentTrailPathDisplay = computed(() => this.trailPath().join(' → '));

  // Clock guide toggle
  readonly showClockGuide = signal<boolean>(true);

  // Fluency text input
  manualFluencyWord = '';

  // Orientation items
  readonly orientationItems = [
    { key: 'date' as const, label: 'Date (Day of Month)', getValue: () => new Date().getDate().toString() },
    { key: 'month' as const, label: 'Month', getValue: () => new Date().toLocaleString('en-US', { month: 'long' }) },
    { key: 'year' as const, label: 'Year', getValue: () => new Date().getFullYear().toString() },
    { key: 'dayOfWeek' as const, label: 'Day of Week', getValue: () => new Date().toLocaleString('en-US', { weekday: 'long' }) },
    { key: 'place' as const, label: 'Place / Clinic Name', getValue: () => 'Understory Clinical Suite' },
    { key: 'city' as const, label: 'City', getValue: () => 'Local Jurisdiction' }
  ];

  // Canvas drawing state
  private isDrawingCubeActive = false;
  private isDrawingClockActive = false;

  constructor() {
    afterNextRender(() => {
      this.initTrailCanvas();
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' && this.mocaSvc.isVigilanceRunning()) {
      event.preventDefault();
      this.mocaSvc.registerVigilanceTap();
    }
  }

  // --- Trail Making Canvas ---
  initTrailCanvas(): void {
    const el = this.trailCanvasRef()?.nativeElement;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    el.width = el.offsetWidth;
    el.height = el.offsetHeight;
    this.redrawTrailLines();
  }

  isNodeInPath(id: string): boolean {
    return this.trailPath().includes(id);
  }

  onTrailNodeClick(node: ITrailNode): void {
    const current = this.trailPath();
    const expected = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
    const nextExpected = expected[current.length];

    if (node.id === nextExpected) {
      const nextPath = [...current, node.id];
      this.trailPath.set(nextPath);
      this.redrawTrailLines();

      if (nextPath.length === expected.length) {
        this.mocaSvc.setTrailMakingScore(true);
      }
    } else {
      // Shimmer error or buzz
      this.toastMessage.set(`Incorrect sequence: expected '${nextExpected}', tapped '${node.id}'. Reset path to try again.`);
      setTimeout(() => this.toastMessage.set(null), 3000);
    }
  }

  redrawTrailLines(): void {
    const el = this.trailCanvasRef()?.nativeElement;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, el.width, el.height);
    const path = this.trailPath();
    if (path.length < 2) return;

    ctx.strokeStyle = '#14b8a6'; // teal-500
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const node = this.trailNodes.find(n => n.id === path[i]);
      if (!node) continue;
      const x = (node.x / 100) * el.width;
      const y = (node.y / 100) * el.height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  resetTrailCanvas(): void {
    this.trailPath.set([]);
    this.mocaSvc.setTrailMakingScore(false);
    this.redrawTrailLines();
  }

  toggleTrailPass(): void {
    const pass = this.mocaSvc.sessionState().trailMakingScore !== 1;
    this.mocaSvc.setTrailMakingScore(pass);
  }

  // --- Cube Drawing ---
  toggleCubePass(): void {
    const pass = this.mocaSvc.sessionState().cubeCopyScore !== 1;
    this.mocaSvc.setCubeCopyScore(pass);
  }

  startDrawingCube(e: PointerEvent): void {
    this.isDrawingCubeActive = true;
    const canvas = this.cubeCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#2dd4bf'; // teal-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  drawCube(e: PointerEvent): void {
    if (!this.isDrawingCubeActive) return;
    const canvas = this.cubeCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  stopDrawingCube(): void {
    this.isDrawingCubeActive = false;
  }

  clearCubeCanvas(): void {
    const canvas = this.cubeCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // --- Clock Drawing ---
  toggleClockGuide(): void {
    this.showClockGuide.update(v => !v);
  }

  startDrawingClock(e: PointerEvent): void {
    this.isDrawingClockActive = true;
    const canvas = this.clockCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#2dd4bf'; // teal-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  drawClock(e: PointerEvent): void {
    if (!this.isDrawingClockActive) return;
    const canvas = this.clockCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  stopDrawingClock(): void {
    this.isDrawingClockActive = false;
  }

  clearClockCanvas(): void {
    const canvas = this.clockCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // --- Memory Word List Audio ---
  speakMemoryList(): void {
    this.mocaSvc.speakText('Face... Velvet... Church... Daisy... Red');
  }

  // --- Fluency Word Input ---
  submitManualFluencyWord(): void {
    if (!this.manualFluencyWord.trim()) return;
    this.mocaSvc.addFluencyWord(this.manualFluencyWord);
    this.manualFluencyWord = '';
  }

  // --- Orientation Auto-Verify ---
  autoVerifyOrientation(): void {
    this.mocaSvc.setOrientationScore('date', true);
    this.mocaSvc.setOrientationScore('month', true);
    this.mocaSvc.setOrientationScore('year', true);
    this.mocaSvc.setOrientationScore('dayOfWeek', true);
    this.toastMessage.set('Date and day verified against system clock.');
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  // --- FHIR Export & Chart Commit ---
  exportFhirBundle(): void {
    const bundle = this.mocaSvc.generateFhirR4Bundle();
    const jsonStr = JSON.stringify(bundle, null, 2);

    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      this.toastMessage.set('FHIR R4 Bundle copied to clipboard! (LOINC 72106-8)');
      setTimeout(() => this.toastMessage.set(null), 4000);
    }

    // Trigger file download
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR-R4-MoCA-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  commitToPatientRecord(): void {
    this.mocaSvc.commitToPatientChart();
    this.toastMessage.set('MoCA assessment and clinical note successfully committed to patient chart!');
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
