// SPDX-License-Identifier: Apache-2.0
import { Component, ElementRef, viewChild, input, model, effect, AfterViewInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface IKneeAbnormalityLocus {
  id: string;
  name: string;
  category: 'ligament' | 'meniscus' | 'cartilage' | 'fluid' | 'bone';
  position: [number, number, number];
  likelihood: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Normal';
  plane: 'Sagittal' | 'Coronal' | 'Axial';
  clinicalNote: string;
}

export interface IAnatomicalCallout {
  id: string;
  label: string;
  subtitle: string;
  tissueType: 'muscle' | 'tendon' | 'bone' | 'cartilage' | 'ligament';
  viewPreset: 'Coronal' | 'Sagittal' | 'Axial';
  position: [number, number, number];
  snomedCode: string;
}

@Component({
  selector: 'app-knee-hologram-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Header HUD Controls -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-lg font-bold shadow-inner">
            🩻
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                3D Holographic Joint & Tri-Plane Slicer HUD
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WebGL Procedural PBR
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              RSNA Multi-Plane Abnormality Detection, Extensor/Flexor Myotendinous Complex & Tibiofibular Kinematics
            </p>
          </div>
        </div>

        <!-- Controls: Active Plane, Soft-Tissue Layer, Callouts & Stress Heatmap -->
        <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1" role="group" aria-label="Anatomical Slice Plane Selector">
            <button 
              (click)="setSlicePlane('Sagittal')"
              [attr.aria-pressed]="activePlane() === 'Sagittal'"
              [class.bg-cyan-500]="activePlane() === 'Sagittal'"
              [class.text-zinc-950]="activePlane() === 'Sagittal'"
              [class.text-cyan-400]="activePlane() !== 'Sagittal'"
              class="px-3 py-2 rounded-lg font-bold transition text-[11px] min-h-[44px] touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
              Sagittal (Lateral Knee)
            </button>
            <button 
              (click)="setSlicePlane('Coronal')"
              [attr.aria-pressed]="activePlane() === 'Coronal'"
              [class.bg-teal-500]="activePlane() === 'Coronal'"
              [class.text-zinc-950]="activePlane() === 'Coronal'"
              [class.text-teal-400]="activePlane() !== 'Coronal'"
              class="px-3 py-2 rounded-lg font-bold transition text-[11px] min-h-[44px] touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none">
              Coronal (Anterior Kneecap)
            </button>
            <button 
              (click)="setSlicePlane('Axial')"
              [attr.aria-pressed]="activePlane() === 'Axial'"
              [class.bg-amber-400]="activePlane() === 'Axial'"
              [class.text-zinc-950]="activePlane() === 'Axial'"
              [class.text-amber-300]="activePlane() !== 'Axial'"
              class="px-3 py-2 rounded-lg font-bold transition text-[11px] min-h-[44px] touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none">
              Axial (Patella/Baker's)
            </button>
          </div>

          <button 
            (click)="toggleSoftTissueLayer()"
            [attr.aria-pressed]="showSoftTissueLayer()"
            [class.bg-violet-500]="showSoftTissueLayer()"
            [class.text-white]="showSoftTissueLayer()"
            [class.bg-zinc-900]="!showSoftTissueLayer()"
            [class.text-zinc-400]="!showSoftTissueLayer()"
            class="px-3 py-2 rounded-xl border border-zinc-800 transition text-[11px] min-h-[44px] font-mono font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none">
            <span>💪</span>
            <span>{{ showSoftTissueLayer() ? 'Muscles & Tendons ON' : 'Osteology Only' }}</span>
          </button>

          <button 
            (click)="toggleAnatomicalLabels()"
            [attr.aria-pressed]="showAnatomicalLabels()"
            [class.bg-emerald-500]="showAnatomicalLabels()"
            [class.text-zinc-950]="showAnatomicalLabels()"
            [class.bg-zinc-900]="!showAnatomicalLabels()"
            [class.text-zinc-400]="!showAnatomicalLabels()"
            class="px-3 py-2 rounded-xl border border-zinc-800 transition text-[11px] min-h-[44px] font-mono font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none">
            <span>🏷️</span>
            <span>{{ showAnatomicalLabels() ? 'Callouts ON' : 'Callouts OFF' }}</span>
          </button>

          <button 
            (click)="toggleStressHeatmap()"
            [attr.aria-pressed]="showStressHeatmap()"
            [class.bg-rose-500]="showStressHeatmap()"
            [class.text-white]="showStressHeatmap()"
            [class.bg-zinc-900]="!showStressHeatmap()"
            [class.text-zinc-400]="!showStressHeatmap()"
            class="px-3 py-2 rounded-xl border border-zinc-800 transition text-[11px] min-h-[44px] font-mono font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none">
            <span>🔥</span>
            <span>{{ showStressHeatmap() ? 'FEA Stress ON' : 'FEA Stress OFF' }}</span>
          </button>

          <button 
            (click)="toggleGaitSimulation()"
            [attr.aria-pressed]="isGaitSimulating()"
            [class.bg-cyan-500]="isGaitSimulating()"
            [class.text-zinc-950]="isGaitSimulating()"
            [class.bg-zinc-900]="!isGaitSimulating()"
            [class.text-zinc-300]="!isGaitSimulating()"
            class="px-3 py-2 rounded-xl border border-zinc-800 transition text-[11px] min-h-[44px] font-mono font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            <span>🚶</span>
            <span>{{ isGaitSimulating() ? 'Gait ON (' + gaitPhaseLabel() + ')' : 'OpenSim Gait' }}</span>
          </button>

          <button 
            (click)="toggleAutoRotate()"
            class="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-cyan-300 transition text-[11px] min-h-[44px] cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            {{ isAutoRotating() ? '⏸ Pause Spin' : '▶ 360° Spin' }}
          </button>
        </div>
      </div>

      <!-- Main Dual View: 3D Hologram Canvas (Left 8 Cols) + Loci Inspector & Slicer (Right 4 Cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- 3D Hologram WebGL Viewport -->
        <div class="lg:col-span-8 relative min-h-[460px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
          <div #rendererContainer class="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing"></div>
          
          <!-- Top-Left Hologram Viewport Telemetry Overlay -->
          <div class="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono bg-zinc-950/85 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-zinc-400 z-10">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="text-zinc-200">Joint Flexion: <span class="tabular-nums font-bold">{{ flexionAngle() }}°</span></span>
            </div>
            <span>Patellar Glide: <span class="text-violet-300 font-bold tabular-nums">{{ patellarGlideMm() }} mm inf.</span></span>
            <span>Slice Plane: <span class="text-cyan-300 font-bold">{{ activePlane() }}</span></span>
            <span>Target Loci: <span class="text-amber-300">12 RSNA Markers</span></span>
            @if (selectedLocus(); as locus) {
              <span class="text-emerald-400 text-[10px]">🎯 Slicing: {{ locus.name }}</span>
            }
            @if (activeCallout(); as callout) {
              <span class="text-violet-300 text-[10px]">🏷️ Structure: {{ callout.label }} (SNOMED {{ callout.snomedCode }})</span>
            }
            @if (showStressHeatmap()) {
              <div class="mt-1 pt-1.5 border-t border-zinc-800/80 flex flex-col gap-0.5 text-[10px]">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-zinc-400">Medial Bias:</span>
                  <span class="text-rose-400 font-bold font-mono tabular-nums">{{ medialContactBias() }}% load</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-zinc-400">Peak Shear:</span>
                  <span class="text-amber-300 font-bold font-mono tabular-nums">{{ peakVonMisesMpa() }} MPa</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-zinc-400">WORMS Defect:</span>
                  <span class="text-teal-300 font-mono tabular-nums">Grade {{ wormsGrade() }}</span>
                </div>
                <div class="mt-1 flex items-center gap-1.5 text-[9px] font-mono">
                  <span class="text-cyan-400 tabular-nums">1.5M</span>
                  <div class="w-16 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500"></div>
                  <span class="text-rose-400 tabular-nums">7.5M</span>
                </div>
              </div>
            }
          </div>

          <!-- Top-Right Full-Leg Locator Inset (Mirrors Reference Diagram 1 Lower-Extremity Framing Box) -->
          <div class="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md p-2 rounded-xl border border-zinc-800 flex flex-col items-center gap-1 z-10 pointer-events-none"
               aria-label="Lower extremity anatomical locator inset">
            <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-400">Limb Locator (Q={{ qAngle() }}°)</span>
            <svg viewBox="0 0 68 148" class="w-14 h-28 overflow-visible" role="img" aria-label="Full leg anatomical diagram with knee bounding box">
              <!-- Soft Tissue Silhouette -->
              <path d="M22,8 C18,32 20,56 23,74 C21,94 22,118 25,134 L41,134 C44,118 46,94 43,74 C47,56 49,32 45,8 Z"
                    fill="rgba(225, 29, 72, 0.14)" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1" />
              <!-- Quadriceps Muscle Bellies -->
              <path d="M24,14 C22,32 24,50 28,62 L40,62 C44,50 45,32 43,14 Z"
                    fill="rgba(225, 29, 72, 0.45)" />
              <!-- Femur (Thigh Bone) with Physiological Q-Angle -->
              <line x1="29" y1="10" x2="34" y2="68" stroke="#e2e8f0" stroke-width="4.5" stroke-linecap="round" />
              <!-- Distal Femoral Condyles -->
              <ellipse cx="34" cy="70" rx="8" ry="4.5" fill="#e2e8f0" />
              <!-- Quadriceps & Patellar Tendon Sheath -->
              <path d="M31,56 L37,56 L36,88 L32,88 Z" fill="rgba(196, 181, 253, 0.65)" />
              <!-- Patella (Kneecap) -->
              <ellipse cx="34" cy="70" rx="4.2" ry="4.8" fill="#fde68a" stroke="#c4b5fd" stroke-width="1" />
              <!-- Meniscus Cartilage Disc -->
              <line x1="26" y1="75" x2="42" y2="75" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" />
              <!-- Tibia (Medial/Central Calf Bone) -->
              <line x1="33" y1="77" x2="33" y2="132" stroke="#e2e8f0" stroke-width="4.2" stroke-linecap="round" />
              <!-- Fibula (Lateral Calf Bone & Head) -->
              <circle cx="42" cy="80" r="2.6" fill="#cbd5e1" />
              <line x1="42" y1="80" x2="39" y2="131" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
              <!-- Foot / Ankle Base -->
              <ellipse cx="34" cy="137" rx="9" ry="3.5" fill="#94a3b8" />
              <!-- Active Framing Box over Knee Region -->
              <rect x="17" y="54" width="34" height="36" rx="3"
                    fill="rgba(6, 182, 212, 0.08)" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="3,1.5" />
            </svg>
            <span class="text-[9px] font-mono text-cyan-300 font-semibold">
              {{ activePlane() === 'Coronal' ? 'Anterior View' : (activePlane() === 'Sagittal' ? 'Lateral View' : 'Axial View') }}
            </span>
          </div>

          <!-- Interactive Anatomical Diagram Callout Bar (Mirrors Labels in Reference Images 1 & 2) -->
          @if (showAnatomicalLabels()) {
            <div class="absolute bottom-16 left-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-2 rounded-xl border border-zinc-800/90 flex flex-wrap items-center gap-1.5 z-10"
                 role="region" aria-label="Anatomical diagram structure callouts">
              <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mr-1">Diagram Callouts:</span>
              @for (callout of anatomicalCallouts; track callout.id) {
                <button
                  type="button"
                  (click)="focusAnatomicalCallout(callout)"
                  [class.border-cyan-400]="activeCallout()?.id === callout.id"
                  [class.bg-cyan-950/60]="activeCallout()?.id === callout.id"
                  class="px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 transition text-[10px] font-mono flex items-center gap-1.5 cursor-pointer touch-manipulation">
                  <span class="w-2 h-2 rounded-full"
                    [class.bg-rose-500]="callout.tissueType === 'muscle'"
                    [class.bg-violet-300]="callout.tissueType === 'tendon'"
                    [class.bg-amber-400]="callout.tissueType === 'ligament'"
                    [class.bg-sky-400]="callout.tissueType === 'cartilage'"
                    [class.bg-slate-200]="callout.tissueType === 'bone'">
                  </span>
                  <span class="text-zinc-100 font-semibold">{{ callout.label }}</span>
                  <span class="text-zinc-400 text-[9px] hidden sm:inline">({{ callout.subtitle }})</span>
                </button>
              }
            </div>
          }

          <!-- Flexion Angle Slider in Canvas Footer -->
          <div class="absolute bottom-3 left-3 right-3 bg-zinc-950/85 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 flex items-center gap-4 text-xs font-mono z-10">
            <span class="text-zinc-400 shrink-0">Biomechanical Flexion:</span>
            <input 
              type="range" 
              min="0" 
              max="90" 
              [value]="flexionAngle()" 
              (input)="onFlexionChange($event)"
              aria-label="Joint flexion angle in degrees"
              class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
            <span class="text-cyan-300 font-bold tabular-nums shrink-0">{{ flexionAngle() }}°</span>
          </div>
        </div>

        <!-- Right Side: RSNA 12 Loci Telemetry Inspector -->
        <div class="lg:col-span-4 flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
            <span class="font-semibold text-zinc-200">RSNA Abnormality Heatmap</span>
            <span class="text-[10px] text-cyan-400">{{ lociList.length }} Targets</span>
          </div>

          <!-- Selected Locus Card -->
          @if (selectedLocus(); as locus) {
            <div class="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-cyan-300 font-mono">{{ locus.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                  [class.bg-rose-500/20]="locus.severity === 'Severe'"
                  [class.text-rose-400]="locus.severity === 'Severe'"
                  [class.bg-amber-500/20]="locus.severity === 'Moderate'"
                  [class.text-amber-300]="locus.severity === 'Moderate'"
                  [class.bg-teal-500/20]="locus.severity === 'Mild'"
                  [class.text-teal-400]="locus.severity === 'Mild'">
                  {{ locus.severity }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-300 leading-snug">
                {{ locus.clinicalNote }}
              </p>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                <span>Plane: <strong class="text-zinc-200">{{ locus.plane }}</strong></span>
                <span class="text-cyan-300 font-bold">Likelihood: {{ (locus.likelihood * 100).toFixed(0) }}%</span>
              </div>
            </div>
          }

          <!-- Loci List -->
          <div class="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            @for (locus of lociList; track locus.id) {
              <button 
                (click)="selectLocus(locus)"
                class="w-full text-left p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/40 transition flex items-center justify-between text-xs font-mono min-h-[44px] touch-manipulation cursor-pointer"
                [class.border-cyan-500]="selectedLocus()?.id === locus.id">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full"
                    [class.bg-rose-400]="locus.severity === 'Severe'"
                    [class.bg-amber-400]="locus.severity === 'Moderate'"
                    [class.bg-teal-400]="locus.severity === 'Mild'">
                  </span>
                  <span class="text-zinc-200 truncate max-w-[140px]">{{ locus.name }}</span>
                </div>
                <span class="text-cyan-300 font-bold tabular-nums text-[11px]">
                  {{ (locus.likelihood * 100).toFixed(0) }}%
                </span>
              </button>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class KneeHologramHudComponent implements AfterViewInit, OnDestroy {
  readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');

  // Input from parent lens or standalone HUD
  readonly selectedTargetKey = input<string | null>(null);
  readonly qAngle = model<number>(12.2);
  readonly wormsGrade = input<number>(2);
  readonly jointSpaceNarrowingMm = input<number>(1.8);

  readonly showStressHeatmap = signal<boolean>(true);
  readonly showSoftTissueLayer = signal<boolean>(true);
  readonly showAnatomicalLabels = signal<boolean>(true);
  readonly isGaitSimulating = signal<boolean>(false);
  readonly gaitCycleProgress = signal<number>(0);
  readonly activePlane = signal<'Sagittal' | 'Coronal' | 'Axial'>('Sagittal');
  readonly isAutoRotating = signal<boolean>(true);
  readonly flexionAngle = signal<number>(15);

  readonly gaitPhaseLabel = computed(() => {
    return this.gaitCycleProgress() < 0.6 ? 'Stance' : 'Swing';
  });

  // Dynamic patellar inferior glide distance (in mm) along trochlear groove during flexion
  readonly patellarGlideMm = computed(() => {
    const rad = THREE.MathUtils.degToRad(this.flexionAngle());
    return Number((Math.sin(rad) * 48.0).toFixed(1));
  });

  readonly medialContactBias = computed(() => {
    // Normal Q-angle is ~14-15 deg (equal 50/50 distribution)
    // Decreased Q-angle (<13.5 deg = Genu Varum) shifts load to medial compartment (up to 88%)
    // Increased Q-angle (>15.5 deg = Genu Valgum) shifts load to lateral compartment (medial bias < 50%, down to 15%)
    const q = this.qAngle();
    const bias = Math.min(88, Math.max(15, 50 + (14.5 - q) * 6.5));
    return Math.round(bias);
  });

  readonly peakVonMisesMpa = computed(() => {
    const base = 2.4;
    const wormsImpact = this.wormsGrade() * 0.9;
    const jsnImpact = this.jointSpaceNarrowingMm() * 0.8;
    return Number((base + wormsImpact + jsnImpact).toFixed(1));
  });

  // Canonical anatomical callouts synthesized from Anterior (Kneecap) & Lateral (Knee) reference diagrams
  readonly anatomicalCallouts: IAnatomicalCallout[] = [
    {
      id: 'quadriceps',
      label: 'Quadriceps',
      subtitle: 'Extensor Muscle',
      tissueType: 'muscle',
      viewPreset: 'Coronal',
      position: [0, 1.05, 0.25],
      snomedCode: '20686009'
    },
    {
      id: 'hamstrings',
      label: 'Hamstrings',
      subtitle: 'Posterior Flexor',
      tissueType: 'muscle',
      viewPreset: 'Sagittal',
      position: [0.32, 0.72, -0.35],
      snomedCode: '181690002'
    },
    {
      id: 'femur',
      label: 'Femur',
      subtitle: 'Thigh Bone',
      tissueType: 'bone',
      viewPreset: 'Sagittal',
      position: [0.35, 0.42, 0],
      snomedCode: '71341001'
    },
    {
      id: 'patella',
      label: 'Patella',
      subtitle: 'Kneecap',
      tissueType: 'bone',
      viewPreset: 'Coronal',
      position: [0, 0.4, 0.46],
      snomedCode: '64234005'
    },
    {
      id: 'patellar_tendon',
      label: 'Patellar Tendon',
      subtitle: 'Extensor Ligament',
      tissueType: 'tendon',
      viewPreset: 'Coronal',
      position: [0, -0.04, 0.42],
      snomedCode: '63029009'
    },
    {
      id: 'ligaments',
      label: 'Ligaments',
      subtitle: 'LCL / MCL / ACL / PCL',
      tissueType: 'ligament',
      viewPreset: 'Sagittal',
      position: [0.53, 0.0, -0.08],
      snomedCode: '30024005'
    },
    {
      id: 'meniscus',
      label: 'Meniscus',
      subtitle: 'Fibrocartilage',
      tissueType: 'cartilage',
      viewPreset: 'Coronal',
      position: [0.28, -0.18, 0.12],
      snomedCode: '71956002'
    },
    {
      id: 'fibula',
      label: 'Fibula',
      subtitle: 'Lateral Calf Bone',
      tissueType: 'bone',
      viewPreset: 'Coronal',
      position: [0.52, -0.38, -0.10],
      snomedCode: '87342007'
    },
    {
      id: 'tibia',
      label: 'Tibia',
      subtitle: 'Medial Calf Bone',
      tissueType: 'bone',
      viewPreset: 'Coronal',
      position: [0, -0.65, 0.15],
      snomedCode: '12611008'
    }
  ];

  readonly activeCallout = signal<IAnatomicalCallout | null>(null);

  readonly lociList: IKneeAbnormalityLocus[] = [
    {
      id: 'acl',
      name: 'Anterior Cruciate Ligament (ACL)',
      category: 'ligament',
      position: [0, 0.2, 0.1],
      likelihood: 0.78,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Complete mid-substance disruption with hyperintense fluid signal on Sagittal T2.'
    },
    {
      id: 'mcl',
      name: 'Medial Collateral Ligament (MCL)',
      category: 'ligament',
      position: [-0.65, 0, 0],
      likelihood: 0.42,
      severity: 'Moderate',
      plane: 'Coronal',
      clinicalNote: 'Grade II sprain with periligamentous edema along proximal femoral attachment.'
    },
    {
      id: 'medial_meniscus',
      name: 'Medial Meniscus Posterior Horn',
      category: 'meniscus',
      position: [-0.45, -0.2, -0.2],
      likelihood: 0.84,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Complex radial tear extending to superior and inferior articular surfaces.'
    },
    {
      id: 'lateral_meniscus',
      name: 'Lateral Meniscus Body',
      category: 'meniscus',
      position: [0.45, -0.2, 0],
      likelihood: 0.22,
      severity: 'Mild',
      plane: 'Coronal',
      clinicalNote: 'Intact contour with minimal intrasubstance degeneration.'
    },
    {
      id: 'medial_oa',
      name: 'Medial Compartment Cartilage Loss',
      category: 'cartilage',
      position: [-0.4, 0.1, 0],
      likelihood: 0.65,
      severity: 'Moderate',
      plane: 'Coronal',
      clinicalNote: 'Focal 50% cartilage thinning with adjacent subchondral marrow edema.'
    },
    {
      id: 'lateral_oa',
      name: 'Lateral Compartment Cartilage Loss',
      category: 'cartilage',
      position: [0.4, 0.1, 0],
      likelihood: 0.20,
      severity: 'Mild',
      plane: 'Coronal',
      clinicalNote: 'Normal lateral joint space without full-thickness chondral erosion.'
    },
    {
      id: 'pf_oa',
      name: 'Patellofemoral Articular Cartilage',
      category: 'cartilage',
      position: [0, 0.45, 0.4],
      likelihood: 0.76,
      severity: 'Severe',
      plane: 'Axial',
      clinicalNote: 'High-grade trochlear cartilage thinning and lateral facet fissuring on Axial PD.'
    },
    {
      id: 'effusion',
      name: 'Suprapatellar Joint Effusion',
      category: 'fluid',
      position: [0, 0.7, 0.4],
      likelihood: 0.91,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Marked fluid distension of suprapatellar bursa (>15mm depth).'
    },
    {
      id: 'synovitis',
      name: 'Infrapatellar Synovitis',
      category: 'fluid',
      position: [0, 0.1, 0.35],
      likelihood: 0.82,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Extensive synovial frond proliferation and hyperemia in Hoffa fat pad.'
    },
    {
      id: 'bakers_cyst',
      name: 'Popliteal (Baker) Cyst',
      category: 'fluid',
      position: [-0.3, -0.4, -0.6],
      likelihood: 0.38,
      severity: 'Moderate',
      plane: 'Axial',
      clinicalNote: 'Well-defined fluid collection between semimembranosus and medial gastrocnemius.'
    },
    {
      id: 'contusion',
      name: 'Lateral Femoral Condyle Contusion',
      category: 'bone',
      position: [0.4, 0.3, -0.2],
      likelihood: 0.72,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Pivot-shift impaction edema pattern classic for acute ACL deceleration tear.'
    },
    {
      id: 'fracture',
      name: 'Tibial Plateau Cortical Margin',
      category: 'bone',
      position: [0.45, -0.3, 0],
      likelihood: 0.12,
      severity: 'Mild',
      plane: 'Coronal',
      clinicalNote: 'Intact subchondral bone plate without acute cortical break or depression.'
    }
  ];

  readonly selectedLocus = signal<IKneeAbnormalityLocus | null>(this.lociList[0]);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animFrameId: number | null = null;
  private jointGroup!: THREE.Group;
  private tibiaGroup!: THREE.Group;
  private fibulaGroup!: THREE.Group;
  private patellaRig!: THREE.Group;
  private softTissueGroup!: THREE.Group;
  private patellarTendonMesh?: THREE.Mesh;
  private quadTendonMesh?: THREE.Mesh;
  private hotSpotMeshes: THREE.Mesh[] = [];

  // Tri-plane slicer meshes & target focus reticle
  private slicerGroup!: THREE.Group;
  private sagittalPlane!: THREE.Mesh;
  private coronalPlane!: THREE.Mesh;
  private axialPlane!: THREE.Mesh;
  private targetReticle!: THREE.Mesh;

  // Stress heatmap geometries
  private medCondyleGeo?: THREE.SphereGeometry;
  private latCondyleGeo?: THREE.SphereGeometry;
  private plateauGeo?: THREE.CylinderGeometry;

  private targetCameraPos = new THREE.Vector3(0, 0.5, 3.5);
  private targetControlsTarget = new THREE.Vector3(0, 0, 0);

  constructor() {
    effect(() => {
      const key = this.selectedTargetKey();
      if (key) {
        this.focusOnTargetKey(key);
      }
    });

    effect(() => {
      this.qAngle();
      this.wormsGrade();
      this.jointSpaceNarrowingMm();
      this.showStressHeatmap();
      this.updateStressHeatmap();
    });
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.buildProceduralKnee();
    this.updateJointKinematics(this.flexionAngle());
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  toggleStressHeatmap(): void {
    this.showStressHeatmap.update(v => !v);
    this.updateStressHeatmap();
  }

  toggleSoftTissueLayer(): void {
    this.showSoftTissueLayer.update(v => !v);
    if (this.softTissueGroup) {
      this.softTissueGroup.visible = this.showSoftTissueLayer();
    }
  }

  toggleAnatomicalLabels(): void {
    this.showAnatomicalLabels.update(v => !v);
  }

  focusAnatomicalCallout(callout: IAnatomicalCallout): void {
    this.activeCallout.set(callout);
    this.activePlane.set(callout.viewPreset);
    this.updatePlanePositions(callout.position);
    this.updateSlicerVisibility();
    if (this.targetReticle) {
      this.targetReticle.position.set(...callout.position);
      this.targetReticle.visible = true;
    }
    this.orientCameraToPlane(callout.viewPreset, callout.position);
    this.isAutoRotating.set(false);
  }

  setSlicePlane(plane: 'Sagittal' | 'Coronal' | 'Axial'): void {
    this.activePlane.set(plane);
    this.updateSlicerVisibility();
    const locus = this.selectedLocus();
    this.orientCameraToPlane(plane, locus ? locus.position : undefined);
    this.isAutoRotating.set(false);
  }

  toggleAutoRotate(): void {
    this.isAutoRotating.update(v => !v);
  }

  toggleGaitSimulation(): void {
    this.isGaitSimulating.update(v => !v);
    if (this.isGaitSimulating()) {
      this.gaitCycleProgress.set(0);
    }
  }

  computeOpenSimKneeFlexion(tNormalized: number): number {
    const t = ((tNormalized % 1.0) + 1.0) % 1.0;
    if (t < 0.6) {
      // Stance phase: 0 to 18 deg shock-absorption wave
      return Math.round(18.0 * Math.sin(Math.PI * (t / 0.6)));
    }
    // Swing phase: 0 to 60 deg foot-clearance wave
    return Math.round(60.0 * Math.sin(Math.PI * ((t - 0.6) / 0.4)));
  }

  onFlexionChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.isGaitSimulating.set(false);
    this.flexionAngle.set(val);
    this.updateJointKinematics(val);
  }

  private updateJointKinematics(angleDeg: number): void {
    const rad = THREE.MathUtils.degToRad(angleDeg);
    if (this.tibiaGroup) {
      // Flexion rotates tibia + fibula + menisci backwards around the condylar axis
      this.tibiaGroup.rotation.x = -rad;
    }
    if (this.patellaRig) {
      // Kinematic patellofemoral tracking: patella glides inferiorly and posteriorly along trochlear groove
      const glideY = 0.40 - Math.sin(rad) * 0.22;
      const glideZ = 0.45 - (1 - Math.cos(rad)) * 0.16;
      this.patellaRig.position.set(0, glideY, glideZ);
      this.patellaRig.rotation.x = -rad * 0.55;
    }
    if (this.patellarTendonMesh) {
      // Patellar tendon bridges inferior pole of patella to rotating tibial tuberosity
      const tendonY = -0.02 - Math.sin(rad) * 0.14;
      const tendonZ = 0.40 - Math.sin(rad) * 0.12;
      this.patellarTendonMesh.position.set(0, tendonY, tendonZ);
      this.patellarTendonMesh.rotation.x = -0.16 - rad * 0.62;
    }
    if (this.quadTendonMesh) {
      this.quadTendonMesh.position.y = 0.68 - Math.sin(rad) * 0.08;
      this.quadTendonMesh.rotation.x = 0.10 - rad * 0.18;
    }
  }

  focusOnTargetKey(key: string): void {
    const locus = this.lociList.find(l => l.id.toLowerCase() === key.toLowerCase());
    if (locus) {
      this.selectLocus(locus);
    }
  }

  selectLocus(locus: IKneeAbnormalityLocus): void {
    this.selectedLocus.set(locus);
    this.activePlane.set(locus.plane);
    this.updatePlanePositions(locus.position);
    this.updateSlicerVisibility();
    if (this.targetReticle) {
      this.targetReticle.position.set(...locus.position);
      this.targetReticle.visible = true;
    }
    this.orientCameraToPlane(locus.plane, locus.position);
    this.isAutoRotating.set(false);
  }

  orientCameraToPlane(plane: 'Sagittal' | 'Coronal' | 'Axial', pos?: [number, number, number]): void {
    const targetX = pos ? pos[0] : 0;
    const targetY = pos ? pos[1] : 0.1;
    const targetZ = pos ? pos[2] : 0;
    this.targetControlsTarget.set(targetX, targetY, targetZ);

    if (plane === 'Sagittal') {
      // Lateral profile view looking across sagittal slice
      this.targetCameraPos.set(targetX + 2.8, targetY + 0.2, targetZ);
    } else if (plane === 'Coronal') {
      // Anterior/frontal view looking into coronal slice
      this.targetCameraPos.set(targetX, targetY + 0.2, targetZ + 2.8);
    } else if (plane === 'Axial') {
      // Top-down / transverse view looking along axial slice
      this.targetCameraPos.set(targetX, targetY + 2.8, targetZ + 0.6);
    }
  }

  private initThree(): void {
    const container = this.rendererContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x05080c);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 0.5, 3.5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 6.0;
      this.controls.minDistance = 1.5;

      // Holographic Lighting Setup
      const ambLight = new THREE.AmbientLight(0x0a2540, 2.0);
      this.scene.add(ambLight);

      const dirLight1 = new THREE.DirectionalLight(0x14b8a6, 2.5);
      dirLight1.position.set(3, 5, 4);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.8);
      dirLight2.position.set(-3, -2, -3);
      this.scene.add(dirLight2);

      const grid = new THREE.GridHelper(10, 20, 0x14b8a6, 0x0f3443);
      grid.position.y = -1.5;
      this.scene.add(grid);
    } catch {
      // Headless / non-WebGL fallback (e.g. unit tests or SSR)
    }
  }

  private buildProceduralKnee(): void {
    if (!this.scene) return;
    this.jointGroup = new THREE.Group();

    // 1. Anatomically Grounded PBR Materials (Osteology, Cartilage, Ligaments, Myotendinous Complex)
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8dec8, // Warm cortical bone ivory matching reference diagrams
      roughness: 0.45,
      metalness: 0.12,
      wireframe: false
    });

    const sesamoidBoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5deb3, // Highlighted patellar sesamoid bone visible inside tendon sheath
      roughness: 0.35,
      metalness: 0.15
    });

    const stressBoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.15,
      vertexColors: true
    });

    const cartilageMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Hyaline / fibrocartilage cyan-blue
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });

    const ligamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xc4b5fd, // Silvery-lavender fibrous ligament tone from reference diagrams
      roughness: 0.3,
      metalness: 0.25
    });

    const cruciateMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // High-contrast amber for deep intra-articular ACL/PCL visibility
      roughness: 0.3,
      metalness: 0.25
    });

    const tendonSheathMaterial = new THREE.MeshStandardMaterial({
      color: 0xa78bfa, // Translucent lavender patellar/quadriceps tendon sheath
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });

    const muscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Striated terracotta-crimson skeletal muscle belly (Quadriceps & Hamstrings)
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.86
    });

    const aponeurosisMaterial = new THREE.MeshStandardMaterial({
      color: 0xddd6fe, // Myotendinous junction transition cuff
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.72
    });

    // 2. Distal Femur (Shaft, Medial/Lateral Condyles with J-Curvature, & Anterior Trochlear Groove)
    const femurShaftGeo = new THREE.CylinderGeometry(0.29, 0.36, 1.25, 20);
    const femurShaft = new THREE.Mesh(femurShaftGeo, boneMaterial);
    femurShaft.position.y = 0.92;
    femurShaft.rotation.z = THREE.MathUtils.degToRad(-4.5); // Physiological femoral valgus / Q-angle
    this.jointGroup.add(femurShaft);

    // Medial & Lateral Femoral Condyles with FEA vertex stress mapping
    const medCondyleGeo = new THREE.SphereGeometry(0.32, 20, 20);
    this.medCondyleGeo = medCondyleGeo;
    const medCondyle = new THREE.Mesh(medCondyleGeo, stressBoneMaterial);
    medCondyle.position.set(-0.34, 0.35, -0.03);
    medCondyle.scale.set(1.02, 1.22, 1.48);
    this.jointGroup.add(medCondyle);

    const latCondyleGeo = new THREE.SphereGeometry(0.32, 20, 20);
    this.latCondyleGeo = latCondyleGeo;
    const latCondyle = new THREE.Mesh(latCondyleGeo, stressBoneMaterial);
    latCondyle.position.set(0.34, 0.35, -0.03);
    latCondyle.scale.set(1.0, 1.22, 1.46);
    this.jointGroup.add(latCondyle);

    // Anterior Femoral Trochlear Groove Saddle
    const trochleaGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.42, 16);
    trochleaGeo.rotateZ(Math.PI / 2);
    const trochlea = new THREE.Mesh(trochleaGeo, boneMaterial);
    trochlea.position.set(0, 0.38, 0.18);
    trochlea.scale.set(1.0, 0.75, 0.85);
    this.jointGroup.add(trochlea);

    // 3. Patellofemoral Rig (Sesamoid Patella + Translucent Tendon Retinaculum Envelope)
    this.patellaRig = new THREE.Group();
    this.patellaRig.position.set(0, 0.40, 0.45);

    const patellaGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const patella = new THREE.Mesh(patellaGeo, sesamoidBoneMaterial);
    patella.scale.set(1.12, 1.26, 0.58);
    this.patellaRig.add(patella);

    // Inferior Patellar Apex (Nose of Kneecap)
    const patellaApexGeo = new THREE.ConeGeometry(0.16, 0.18, 16);
    patellaApexGeo.rotateX(Math.PI);
    const patellaApex = new THREE.Mesh(patellaApexGeo, sesamoidBoneMaterial);
    patellaApex.position.set(0, -0.22, 0);
    patellaApex.scale.set(1.0, 1.0, 0.55);
    this.patellaRig.add(patellaApex);

    // Translucent Retinacular Tendon Sheath Draping Over Patella (Image 1 Cutaway Effect)
    const patellaSheathGeo = new THREE.SphereGeometry(0.245, 20, 20);
    const patellaSheath = new THREE.Mesh(patellaSheathGeo, tendonSheathMaterial);
    patellaSheath.scale.set(1.18, 1.38, 0.66);
    this.patellaRig.add(patellaSheath);

    this.jointGroup.add(this.patellaRig);

    // 4. Tibia & Fibula Group (Articulating Lower-Leg Complex)
    this.tibiaGroup = new THREE.Group();
    this.tibiaGroup.position.set(0, 0.2, 0);

    // Tibial Plateau with FEA vertex stress mapping
    const plateauGeo = new THREE.CylinderGeometry(0.56, 0.44, 0.26, 20);
    this.plateauGeo = plateauGeo;
    const plateau = new THREE.Mesh(plateauGeo, stressBoneMaterial);
    plateau.position.y = -0.3;
    this.tibiaGroup.add(plateau);

    // Intercondylar Eminence (Medial & Lateral Tibial Spines)
    const spineGeo = new THREE.ConeGeometry(0.06, 0.12, 10);
    const medSpine = new THREE.Mesh(spineGeo, boneMaterial);
    medSpine.position.set(-0.07, -0.14, -0.02);
    this.tibiaGroup.add(medSpine);

    const latSpine = new THREE.Mesh(spineGeo, boneMaterial);
    latSpine.position.set(0.07, -0.14, -0.02);
    this.tibiaGroup.add(latSpine);

    // Tibial Tuberosity (Prominent Anterior Insertion Bump for Patellar Tendon)
    const tuberosityGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const tuberosity = new THREE.Mesh(tuberosityGeo, boneMaterial);
    tuberosity.position.set(0, -0.52, 0.34);
    tuberosity.scale.set(1.15, 1.35, 0.78);
    this.tibiaGroup.add(tuberosity);

    // Tibial Shaft
    const tibiaShaftGeo = new THREE.CylinderGeometry(0.35, 0.24, 1.32, 20);
    const tibiaShaft = new THREE.Mesh(tibiaShaftGeo, boneMaterial);
    tibiaShaft.position.y = -1.0;
    this.tibiaGroup.add(tibiaShaft);

    // Fibula Group (Proximal Tibiofibular Joint: Lateral Fibular Head, Styloid Apex & Shaft)
    this.fibulaGroup = new THREE.Group();
    const fibularHeadGeo = new THREE.SphereGeometry(0.145, 16, 16);
    const fibularHead = new THREE.Mesh(fibularHeadGeo, boneMaterial);
    fibularHead.position.set(0.52, -0.44, -0.10);
    fibularHead.scale.set(0.95, 1.18, 0.95);
    this.fibulaGroup.add(fibularHead);

    const fibulaShaftGeo = new THREE.CylinderGeometry(0.085, 0.065, 1.15, 14);
    const fibulaShaft = new THREE.Mesh(fibulaShaftGeo, boneMaterial);
    fibulaShaft.position.set(0.50, -1.05, -0.10);
    fibulaShaft.rotation.z = THREE.MathUtils.degToRad(-2.0);
    this.fibulaGroup.add(fibulaShaft);

    this.tibiaGroup.add(this.fibulaGroup);

    // 5. Menisci (Medial C-Shaped & Lateral O-Shaped Fibrocartilage Wedges)
    const medMeniscusGeo = new THREE.TorusGeometry(0.23, 0.062, 10, 20, Math.PI * 1.35);
    const medMeniscus = new THREE.Mesh(medMeniscusGeo, cartilageMaterial);
    medMeniscus.rotation.x = Math.PI / 2;
    medMeniscus.position.set(-0.26, -0.17, 0);
    this.tibiaGroup.add(medMeniscus);

    const latMeniscusGeo = new THREE.TorusGeometry(0.22, 0.064, 10, 20, Math.PI * 1.45);
    const latMeniscus = new THREE.Mesh(latMeniscusGeo, cartilageMaterial);
    latMeniscus.rotation.x = Math.PI / 2;
    latMeniscus.rotation.z = Math.PI;
    latMeniscus.position.set(0.26, -0.17, 0);
    this.tibiaGroup.add(latMeniscus);

    // Transverse Intermeniscal Ligament Bridging Anterior Horns
    const transLigGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.48, 8);
    transLigGeo.rotateZ(Math.PI / 2);
    const transLig = new THREE.Mesh(transLigGeo, ligamentMaterial);
    transLig.position.set(0, -0.17, 0.21);
    this.tibiaGroup.add(transLig);

    // 6. Complete 4-Ligament Complex (ACL, PCL, MCL, LCL)
    // Anterior Cruciate Ligament (ACL)
    const aclGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.64, 10);
    const acl = new THREE.Mesh(aclGeo, cruciateMaterial);
    acl.position.set(0.06, 0.06, 0.05);
    acl.rotation.z = 0.34;
    acl.rotation.x = -0.46;
    this.jointGroup.add(acl);

    // Posterior Cruciate Ligament (PCL - Crossing Posteriorly in Intercondylar Notch)
    const pclGeo = new THREE.CylinderGeometry(0.044, 0.048, 0.62, 10);
    const pcl = new THREE.Mesh(pclGeo, cruciateMaterial);
    pcl.position.set(-0.06, 0.05, -0.08);
    pcl.rotation.z = -0.32;
    pcl.rotation.x = 0.44;
    this.jointGroup.add(pcl);

    // Medial Collateral Ligament (MCL - Broad Flat Band on Medial Aspect)
    const mclGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.96, 10);
    const mcl = new THREE.Mesh(mclGeo, ligamentMaterial);
    mcl.position.set(-0.56, 0.04, -0.02);
    mcl.scale.set(0.65, 1.0, 1.45);
    this.jointGroup.add(mcl);

    // Lateral Collateral Ligament (LCL - Cord-Like Ligament from Lateral Epicondyle to Fibular Head)
    const lclGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.78, 10);
    const lcl = new THREE.Mesh(lclGeo, ligamentMaterial);
    lcl.position.set(0.53, 0.02, -0.08);
    lcl.rotation.z = THREE.MathUtils.degToRad(-4.0);
    lcl.rotation.x = THREE.MathUtils.degToRad(8.0);
    this.jointGroup.add(lcl);

    this.jointGroup.add(this.tibiaGroup);

    // 7. Myotendinous Extensor & Flexor Layer (Quadriceps, Tendon Sheath, Patellar Tendon, Hamstrings)
    this.softTissueGroup = new THREE.Group();

    // Central Quadriceps Tendon (Rectus Femoris / Vastus Intermedius Insertion into Patellar Base)
    const quadTendonGeo = new THREE.CylinderGeometry(0.16, 0.21, 0.62, 16);
    this.quadTendonMesh = new THREE.Mesh(quadTendonGeo, tendonSheathMaterial);
    this.quadTendonMesh.position.set(0, 0.68, 0.36);
    this.quadTendonMesh.scale.set(1.15, 1.0, 0.38);
    this.quadTendonMesh.rotation.x = 0.10;
    this.softTissueGroup.add(this.quadTendonMesh);

    // Patellar Tendon (Ligamentum Patellae - Patellar Apex to Tibial Tuberosity)
    const patellarTendonGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.62, 16);
    this.patellarTendonMesh = new THREE.Mesh(patellarTendonGeo, tendonSheathMaterial);
    this.patellarTendonMesh.position.set(0, -0.04, 0.39);
    this.patellarTendonMesh.scale.set(1.1, 1.0, 0.35);
    this.patellarTendonMesh.rotation.x = -0.18;
    this.softTissueGroup.add(this.patellarTendonMesh);

    // Vastus Medialis Obliquus (VMO - Medial Quadriceps Belly + Aponeurotic Cuff)
    const vmoBellyGeo = new THREE.CapsuleGeometry(0.18, 0.62, 8, 16);
    const vmoBelly = new THREE.Mesh(vmoBellyGeo, muscleMaterial);
    vmoBelly.position.set(-0.30, 1.05, 0.22);
    vmoBelly.rotation.z = THREE.MathUtils.degToRad(16);
    vmoBelly.scale.set(1.0, 1.0, 0.72);
    this.softTissueGroup.add(vmoBelly);

    const vmoCuffGeo = new THREE.CylinderGeometry(0.14, 0.08, 0.28, 12);
    const vmoCuff = new THREE.Mesh(vmoCuffGeo, aponeurosisMaterial);
    vmoCuff.position.set(-0.18, 0.68, 0.34);
    vmoCuff.rotation.z = THREE.MathUtils.degToRad(28);
    vmoCuff.scale.set(1.0, 1.0, 0.5);
    this.softTissueGroup.add(vmoCuff);

    // Vastus Lateralis (Lateral Quadriceps Belly + Aponeurotic Cuff)
    const vlBellyGeo = new THREE.CapsuleGeometry(0.19, 0.68, 8, 16);
    const vlBelly = new THREE.Mesh(vlBellyGeo, muscleMaterial);
    vlBelly.position.set(0.32, 1.08, 0.20);
    vlBelly.rotation.z = THREE.MathUtils.degToRad(-14);
    vlBelly.scale.set(1.0, 1.0, 0.74);
    this.softTissueGroup.add(vlBelly);

    const vlCuffGeo = new THREE.CylinderGeometry(0.15, 0.08, 0.30, 12);
    const vlCuff = new THREE.Mesh(vlCuffGeo, aponeurosisMaterial);
    vlCuff.position.set(0.19, 0.70, 0.34);
    vlCuff.rotation.z = THREE.MathUtils.degToRad(-26);
    vlCuff.scale.set(1.0, 1.0, 0.5);
    this.softTissueGroup.add(vlCuff);

    // Rectus Femoris (Central Anterior Thigh Belly)
    const rfBellyGeo = new THREE.CapsuleGeometry(0.15, 0.58, 8, 16);
    const rfBelly = new THREE.Mesh(rfBellyGeo, muscleMaterial);
    rfBelly.position.set(0, 1.22, 0.32);
    rfBelly.scale.set(1.05, 1.0, 0.62);
    this.softTissueGroup.add(rfBelly);

    // Posterior Hamstrings (Biceps Femoris Descending Laterally to Fibular Head - Image 2)
    const bicepsFemorisGeo = new THREE.CapsuleGeometry(0.16, 0.75, 8, 16);
    const bicepsFemoris = new THREE.Mesh(bicepsFemorisGeo, muscleMaterial);
    bicepsFemoris.position.set(0.32, 0.86, -0.34);
    bicepsFemoris.rotation.z = THREE.MathUtils.degToRad(-6);
    bicepsFemoris.rotation.x = THREE.MathUtils.degToRad(8);
    this.softTissueGroup.add(bicepsFemoris);

    // Distal Biceps Femoris Tendon Inserting into Fibular Head (Image 2 Lateral Tendon/Ligament)
    const bfTendonGeo = new THREE.CylinderGeometry(0.065, 0.042, 0.62, 12);
    const bfTendon = new THREE.Mesh(bfTendonGeo, aponeurosisMaterial);
    bfTendon.position.set(0.45, 0.14, -0.22);
    bfTendon.rotation.z = THREE.MathUtils.degToRad(-10);
    bfTendon.rotation.x = THREE.MathUtils.degToRad(-16);
    this.softTissueGroup.add(bfTendon);

    // Medial Hamstrings (Semitendinosus / Semimembranosus)
    const medHamstringGeo = new THREE.CapsuleGeometry(0.16, 0.74, 8, 16);
    const medHamstring = new THREE.Mesh(medHamstringGeo, muscleMaterial);
    medHamstring.position.set(-0.30, 0.86, -0.34);
    medHamstring.rotation.z = THREE.MathUtils.degToRad(6);
    medHamstring.rotation.x = THREE.MathUtils.degToRad(8);
    this.softTissueGroup.add(medHamstring);

    this.jointGroup.add(this.softTissueGroup);

    // 8. Add Hotspot Markers for the 12 RSNA Loci
    for (const locus of this.lociList) {
      const hotspotGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const hotspotMat = new THREE.MeshBasicMaterial({
        color: locus.severity === 'Severe' ? 0xf43f5e : (locus.severity === 'Moderate' ? 0xf59e0b : 0x14b8a6)
      });
      const hotspot = new THREE.Mesh(hotspotGeo, hotspotMat);
      hotspot.position.set(...locus.position);
      this.jointGroup.add(hotspot);
      this.hotSpotMeshes.push(hotspot);
    }

    // 9. Create Tri-Plane Slicers and Reticle
    this.createSlicerPlanes();

    this.scene.add(this.jointGroup);
  }

  private createSlicerPlanes(): void {
    this.slicerGroup = new THREE.Group();

    // Sagittal Plane (YZ plane, normal = X)
    const sagGeo = new THREE.PlaneGeometry(2.4, 2.4);
    sagGeo.rotateY(Math.PI / 2);
    const sagMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.sagittalPlane = new THREE.Mesh(sagGeo, sagMat);
    const sagEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(sagGeo),
      new THREE.LineBasicMaterial({ color: 0x22d3ee })
    );
    this.sagittalPlane.add(sagEdges);
    this.slicerGroup.add(this.sagittalPlane);

    // Coronal Plane (XY plane, normal = Z)
    const corGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const corMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.coronalPlane = new THREE.Mesh(corGeo, corMat);
    const corEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(corGeo),
      new THREE.LineBasicMaterial({ color: 0x2dd4bf })
    );
    this.coronalPlane.add(corEdges);
    this.slicerGroup.add(this.coronalPlane);

    // Axial Plane (XZ plane, normal = Y)
    const axGeo = new THREE.PlaneGeometry(2.4, 2.4);
    axGeo.rotateX(Math.PI / 2);
    const axMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.axialPlane = new THREE.Mesh(axGeo, axMat);
    const axEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(axGeo),
      new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    );
    this.axialPlane.add(axEdges);
    this.slicerGroup.add(this.axialPlane);

    // Target reticle indicator (Torus ring)
    const reticleGeo = new THREE.TorusGeometry(0.12, 0.015, 12, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true
    });
    this.targetReticle = new THREE.Mesh(reticleGeo, reticleMat);
    const locus = this.selectedLocus();
    if (locus) {
      this.targetReticle.position.set(...locus.position);
      this.updatePlanePositions(locus.position);
    }
    this.jointGroup.add(this.targetReticle);

    this.jointGroup.add(this.slicerGroup);
    this.updateSlicerVisibility();
  }

  private updatePlanePositions(pos: [number, number, number]): void {
    if (this.sagittalPlane) this.sagittalPlane.position.x = pos[0];
    if (this.coronalPlane) this.coronalPlane.position.z = pos[2];
    if (this.axialPlane) this.axialPlane.position.y = pos[1];
  }

  private updateSlicerVisibility(): void {
    if (!this.sagittalPlane || !this.coronalPlane || !this.axialPlane) return;
    const active = this.activePlane();

    // Sagittal
    const isSag = active === 'Sagittal';
    (this.sagittalPlane.material as THREE.MeshBasicMaterial).opacity = isSag ? 0.35 : 0.08;
    this.sagittalPlane.visible = true;

    // Coronal
    const isCor = active === 'Coronal';
    (this.coronalPlane.material as THREE.MeshBasicMaterial).opacity = isCor ? 0.35 : 0.08;
    this.coronalPlane.visible = true;

    // Axial
    const isAx = active === 'Axial';
    (this.axialPlane.material as THREE.MeshBasicMaterial).opacity = isAx ? 0.35 : 0.08;
    this.axialPlane.visible = true;
  }

  private updateStressHeatmap(): void {
    const active = this.showStressHeatmap();
    if (this.medCondyleGeo) this.applyCartilageStressVertexColors(this.medCondyleGeo, true, false, active);
    if (this.latCondyleGeo) this.applyCartilageStressVertexColors(this.latCondyleGeo, false, false, active);
    if (this.plateauGeo) this.applyCartilageStressVertexColors(this.plateauGeo, false, true, active);
  }

  private applyCartilageStressVertexColors(
    geometry: THREE.BufferGeometry,
    isMedial: boolean,
    isTibialPlateau = false,
    active = true
  ): void {
    const posAttr = geometry.getAttribute('position');
    if (!posAttr) return;

    const count = posAttr.count;
    const colors = new Float32Array(count * 3);

    // If disabled, render neutral ivory bone
    if (!active) {
      for (let i = 0; i < count; i++) {
        colors[i * 3] = 0.91;     // R
        colors[i * 3 + 1] = 0.87; // G
        colors[i * 3 + 2] = 0.78; // B
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      if (geometry.attributes['color']) geometry.attributes['color'].needsUpdate = true;
      return;
    }

    const bias = this.medialContactBias() / 100; // e.g. 0.78 for Genu Varum
    const worms = this.wormsGrade();             // e.g. 2
    const jsn = this.jointSpaceNarrowingMm();     // e.g. 1.8

    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      let stress = 0.15; // baseline physiological load (1.5 MPa)

      if (isTibialPlateau) {
        // On plateau, medial is vx < 0, lateral is vx > 0
        const isVertexMedial = vx < 0;
        const distFromCenter = Math.sqrt(vx * vx + vz * vz);
        const contactZone = Math.max(0, 1.0 - distFromCenter / 0.55);
        if (isVertexMedial) {
          stress = (bias * 0.7 + (worms / 4) * 0.3 + (jsn / 3) * 0.2) * contactZone;
        } else {
          stress = ((1.0 - bias) * 0.5) * contactZone;
        }
      } else if (isMedial) {
        // Medial femoral condyle: contact zone at distal inferior aspect (vy < 0)
        const distalWeight = Math.max(0, -vy / 0.32);
        stress = (bias * 0.75 + (worms / 4) * 0.35 + (jsn / 3) * 0.2) * distalWeight;
      } else {
        // Lateral femoral condyle
        const distalWeight = Math.max(0, -vy / 0.32);
        stress = ((1.0 - bias) * 0.45) * distalWeight;
      }

      stress = Math.min(1.0, Math.max(0.0, stress));

      // Color ramp:
      // stress < 0.35 -> Cyan (0.22, 0.74, 0.97)
      // stress 0.35..0.65 -> Amber (0.96, 0.62, 0.04)
      // stress >= 0.65 -> Crimson (0.95, 0.25, 0.37)
      let r = 0.22, g = 0.74, b = 0.97;
      if (stress > 0.65) {
        const t = (stress - 0.65) / 0.35;
        r = 0.96 + t * (0.95 - 0.96);
        g = 0.62 + t * (0.25 - 0.62);
        b = 0.04 + t * (0.37 - 0.04);
      } else if (stress > 0.35) {
        const t = (stress - 0.35) / 0.30;
        r = 0.22 + t * (0.96 - 0.22);
        g = 0.74 + t * (0.62 - 0.74);
        b = 0.97 + t * (0.04 - 0.97);
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (geometry.attributes['color']) geometry.attributes['color'].needsUpdate = true;
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    if (!this.scene) return;

    if (this.controls) {
      if (this.targetControlsTarget) {
        this.controls.target.lerp(this.targetControlsTarget, 0.06);
      }
      this.controls.update();
    }

    if (this.camera && this.targetCameraPos) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
    }

    if (this.isAutoRotating() && this.jointGroup) {
      this.jointGroup.rotation.y += 0.006;
    }

    if (this.isGaitSimulating()) {
      const nextProgress = (this.gaitCycleProgress() + 0.004) % 1.0;
      this.gaitCycleProgress.set(nextProgress);
      const gaitAngle = this.computeOpenSimKneeFlexion(nextProgress);
      if (this.flexionAngle() !== gaitAngle) {
        this.flexionAngle.set(gaitAngle);
        this.updateJointKinematics(gaitAngle);
      }
    }

    // Pulse hotspot sizes
    const time = performance.now() * 0.003;
    for (const mesh of this.hotSpotMeshes) {
      const scale = 1.0 + Math.sin(time * 2.0) * 0.25;
      mesh.scale.set(scale, scale, scale);
    }

    // Spin targeting reticle
    if (this.targetReticle) {
      this.targetReticle.rotation.z += 0.03;
      this.targetReticle.rotation.x += 0.02;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}

