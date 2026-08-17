import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, viewChild, ElementRef, OnDestroy, AfterViewInit, output, input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ThemeService } from '../../services/theme.service';
import { EnvironmentalTelemetryService } from '../../services/environmental-telemetry.service';
import { AdobeFireflyTextureService } from '../../services/adobe-firefly-texture.service';
import { BodyMeshFactoryService } from '../../services/body-mesh-factory.service';
import { RaycastSelectionService } from '../../services/raycast-selection.service';
import { SeverityParticleService } from '../../services/severity-particle.service';
import { IBodyPartIssue } from '../../services/patient.types';

const PART_NAMES: Record<string, string> = {
    'head': 'Head & Neck',
    'brain': 'Brain & Nervous System',
    'thyroid': 'Thyroid & Endocrine',
    'chest': 'Chest & Thorax',
    'heart': 'Heart & Cardiovascular System',
    'lungs': 'Lungs & Respiratory System',
    'abdomen': 'Abdomen & Digestive Tract',
    'liver': 'Liver & Hepatic System',
    'stomach': 'Stomach & Gastric Pouch',
    'kidneys': 'Kidneys & Renal System',
    'pelvis': 'Pelvis & Hips',
    'r_shoulder': 'Right Shoulder',
    'r_arm': 'Right Arm',
    'r_hand': 'Right Hand & Wrist',
    'l_shoulder': 'Left Shoulder',
    'l_arm': 'Left Arm',
    'l_hand': 'Left Hand & Wrist',
    'r_thigh': 'Right Thigh',
    'r_shin': 'Right Lower Leg',
    'r_foot': 'Right Foot',
    'l_thigh': 'Left Thigh',
    'l_shin': 'Left Lower Leg',
    'l_foot': 'Left Foot',
    'spine_cervical': 'Cervical Spine (C1-C8)',
    'spine_thoracic': 'Thoracic Spine (T1-T12)',
    'spine_lumbar': 'Lumbar Spine (L1-L5)',
    'spine_sacral': 'Sacral Spine (S1-S5)',
    'dermatome_c6_c8': 'C6-C8 Radial & Ulnar Dermatome',
    'dermatome_l4_l5': 'L4-L5 Sciatic Nerve Dermatome',
    // 🌿 Eastern TCM 12 Jing-Luo Acupoint Touch Targets
    'acupoint_gv20': 'GV-20 Baihui (Crown Hundred Convergences)',
    'acupoint_cv17': 'CV-17 Danzhong (Sea of Qi Heart Center)',
    'acupoint_cv12': 'CV-12 Zhongwan (Stomach Qi Front-Mu)',
    'acupoint_st36_r': 'ST-36 Zusanli (Right Leg Three Miles Earth Point)',
    'acupoint_st36_l': 'ST-36 Zusanli (Left Leg Three Miles Earth Point)',
    'acupoint_li4_r': 'LI-4 Hegu (Right Hand Joining Valley Yuan-Source)',
    'acupoint_li4_l': 'LI-4 Hegu (Left Hand Joining Valley Yuan-Source)',
    'acupoint_sp6_r': 'SP-6 Sanyinjiao (Right Three Yin Intersection)',
    'acupoint_sp6_l': 'SP-6 Sanyinjiao (Left Three Yin Intersection)',
    // 🧘 Ayurvedic 7 Sushumna Chakra Touch Nodes
    'chakra_sahasrara': 'Sahasrara (Crown 1000-Petal Lotus Chakra)',
    'chakra_ajna': 'Ajna (Third Eye Command Center Chakra)',
    'chakra_vishuddha': 'Throat & Oral FDI Odontogram Spatial Lens',
    'chakra_anahata': 'Anahata (Heart & Acoustic Respiratory Airway Lens)',
    'oral_fdi_teeth': 'Teledentistry FDI 32-Tooth Matrix & Smith-Knight TWI Lens',
    'respiratory_airway': 'Micro-Acoustic Wheeze & Stridor Spectrum Lens',
    'chakra_manipura': 'Manipura (Solar Plexus Agni Fire City)',
    'chakra_svadhisthana': 'Svadhisthana (Sacral Water Dwell Chakra)',
    'chakra_muladhara': 'Muladhara (Root Earth Base Support Chakra)'
};

export type AnatomyViewMode = 'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular' | 'eastern' | 'ayurvedic' | 'osteopathic' | 'orch_or';

@Component({
    selector: 'app-body-3d-viewer',
    standalone: true,
    host: {
        'ngSkipHydration': 'true'
    },
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="flex flex-col flex-1 h-full w-full min-h-[540px] bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl overflow-hidden font-sans thematic-3d-container">

      <!-- 1. Dedicated Top Unobstructed HUD Ribbon -->
      <div *ngIf="webglSupported()" class="px-3 py-2 bg-slate-100/90 dark:bg-zinc-950/90 border-b border-slate-300 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20 font-mono text-xs">
        <!-- Camera Angle Presets -->
        <div class="flex items-center gap-1">
          <span class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mr-1 hidden sm:inline">Camera:</span>
          <button (click)="setCameraPreset('cranial')" class="min-h-[36px] px-2.5 py-1 rounded-md bg-white hover:bg-sky-100 dark:bg-zinc-900 dark:hover:bg-cyan-950 text-sky-900 dark:text-cyan-300 font-bold transition cursor-pointer border border-slate-300 dark:border-zinc-800 flex items-center gap-1" title="Focus Head & Brain">
            <span>🧠</span><span class="text-[10px] uppercase font-bold">Cranial</span>
          </button>
          <button (click)="setCameraPreset('visceral')" class="min-h-[36px] px-2.5 py-1 rounded-md bg-white hover:bg-teal-100 dark:bg-zinc-900 dark:hover:bg-teal-950 text-teal-900 dark:text-teal-300 font-bold transition cursor-pointer border border-slate-300 dark:border-zinc-800 flex items-center gap-1" title="Focus Thorax & Organs">
            <span>🫀</span><span class="text-[10px] uppercase font-bold">Visceral</span>
          </button>
          <button (click)="setCameraPreset('spinal')" class="min-h-[36px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-100 dark:bg-zinc-900 dark:hover:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-bold transition cursor-pointer border border-slate-300 dark:border-zinc-800 flex items-center gap-1" title="Focus Spine & Posterior">
            <span>🦴</span><span class="text-[10px] uppercase font-bold">Spine</span>
          </button>
          <button (click)="setCameraPreset('peripheral')" class="min-h-[36px] px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 dark:bg-zinc-900 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold transition cursor-pointer border border-slate-300 dark:border-zinc-800 flex items-center gap-1" title="Focus Legs & Feet">
            <span>🦵</span><span class="text-[10px] uppercase font-bold">Extremities</span>
          </button>
        </div>

        <!-- 🧬 Species & Demographic Archetype Selector -->
        <div class="flex items-center gap-1">
          <span class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mr-1 hidden lg:inline">Archetype:</span>
          <select [value]="activeArchetype()" 
                  (change)="onArchetypeChange($event)"
                  aria-label="3D Species and Demographic Archetype Selector"
                  class="min-h-[36px] px-2 py-1 rounded-md bg-white dark:bg-zinc-900 text-teal-800 dark:text-cyan-300 font-bold border border-slate-300 dark:border-zinc-800 text-[10.5px] cursor-pointer outline-none">
            <option value="homo_sapiens_female">👩 Homo Sapiens (Female)</option>
            <option value="homo_sapiens_male">👨 Homo Sapiens (Male)</option>
            <option value="homo_sapiens_senior">👵 Homo Sapiens (Senior)</option>
            <option value="homo_sapiens_pediatric">👶 Homo Sapiens (Paediatric)</option>
            <option value="pongo_pygmaeus">🦧 Pongo Pygmaeus (Orangutan)</option>
          </select>
        </div>

        <!-- Occupational Hazard & Strain Telemetry Badge -->
        <div *ngIf="occupationalStrainInfo() as info" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 dark:bg-cyan-950/50 border border-amber-500/30 dark:border-cyan-700/40 text-amber-900 dark:text-cyan-200">
          <span>{{ info.icon }}</span>
          <span class="text-[10.5px] font-bold tracking-wide hidden md:inline">{{ info.focusLabel }}</span>
          <button (click)="setCameraPreset(info.cameraPreset)" class="px-1.5 py-0.5 rounded bg-amber-500/20 dark:bg-cyan-800/40 hover:bg-amber-500/30 text-[9.5px] uppercase font-extrabold cursor-pointer border border-amber-500/40 dark:border-cyan-600/50 transition" title="Focus Ergonomic Strain Region">
            Focus Strain 🎯
          </button>
        </div>

        <!-- Viewport Spin, Reset & Vision Accessibility Controls -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button (click)="isHighContrastVision.set(!isHighContrastVision())" 
            [class.bg-amber-400]="isHighContrastVision()"
            [class.text-black]="isHighContrastVision()"
            [class.bg-white]="!isHighContrastVision()"
            [class.dark:bg-zinc-900]="!isHighContrastVision()"
            [class.dark:text-amber-300]="!isHighContrastVision()"
            class="min-h-[36px] px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 border border-slate-300 dark:border-zinc-800"
            title="Toggle Non-Glare High-Contrast Vision Mode for Low Vision">
            <span>👁️</span>
            <span class="text-[10px] uppercase font-bold">{{ isHighContrastVision() ? 'High Contrast ON' : 'High Contrast' }}</span>
          </button>

          <button (click)="isReducedMotion.set(!isReducedMotion())" 
            [class.bg-emerald-600]="isReducedMotion()"
            [class.text-white]="isReducedMotion()"
            [class.bg-white]="!isReducedMotion()"
            [class.dark:bg-zinc-900]="!isReducedMotion()"
            [class.dark:text-emerald-400]="!isReducedMotion()"
            class="min-h-[36px] px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 border border-slate-300 dark:border-zinc-800"
            title="Freeze Animations for Photosensitive Safety & Motion Sensitivity">
            <span>⚡</span>
            <span class="text-[10px] uppercase font-bold">{{ isReducedMotion() ? 'Motion FREEZE' : 'Motion' }}</span>
          </button>

          <button (click)="toggleAutoSpin()" 
            [class.bg-sky-600]="isAutoSpinning()"
            [class.text-white]="isAutoSpinning()"
            [class.bg-white]="!isAutoSpinning()"
            [class.dark:bg-zinc-900]="!isAutoSpinning()"
            [class.text-gray-800]="!isAutoSpinning()"
            [class.dark:text-cyan-300]="!isAutoSpinning()"
            class="min-h-[36px] px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 border border-slate-300 dark:border-zinc-800"
            title="Toggle 360° Auto-Spin">
            <span [class.animate-spin]="isAutoSpinning()">🔄</span>
            <span class="text-[10px] uppercase font-bold">{{ isAutoSpinning() ? 'Spin ON' : '360°' }}</span>
          </button>

          <button (click)="resetCameraView()" 
            class="min-h-[36px] px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-300 font-bold transition cursor-pointer flex items-center gap-1 border border-slate-300 dark:border-zinc-800"
            title="Reset Camera View">
            <span>🎯</span>
            <span class="text-[10px] uppercase font-bold">Reset</span>
          </button>
        </div>
      </div>

      <!-- 2. Central Unobstructed 3D Viewport Canvas -->
      <div #canvasContainer class="w-full flex-1 min-h-[460px] relative bg-transparent overflow-hidden" [class.cursor-grab]="webglSupported()" [class.active:cursor-grabbing]="webglSupported()">
        <!-- Dynamic Translucent Radial Grid Backdrop (Allows Background Textures to Shine Through) -->
        <div class="absolute inset-0 pointer-events-none transition-all duration-500 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent dark:from-cyan-500/10 dark:via-transparent dark:to-transparent"></div>
        
        <canvas *ngIf="!webglSupported()" class="absolute opacity-0 pointer-events-none w-[1px] h-[1px]" aria-label="3D Anatomical Mannequin Canvas"></canvas>
        <div *ngIf="!webglSupported()" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#FAF8F0] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-lg border border-amber-200 dark:border-zinc-800">
          <svg class="w-10 h-10 text-teal-600 dark:text-cyan-400 mb-2 opacity-60 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-xs font-bold text-gray-800 dark:text-zinc-300">3D Holographic Engine Initializing...</span>
          <span *ngIf="webglError()" class="text-[11px] text-rose-500 dark:text-rose-400 mt-2 max-w-xs break-words font-mono">{{ webglError() }}</span>
        </div>

        <!-- Sleek Dynamic Hover Tooltip -->
        <div *ngIf="showHoverTooltip()" 
             class="absolute pointer-events-none z-50 bg-white/95 dark:bg-zinc-950/95 border border-teal-500/40 backdrop-blur-md rounded-lg p-3 shadow-xl text-xs max-w-xs transition-all duration-75 text-gray-900 dark:text-zinc-100 font-mono"
             [style.left.px]="tooltipX()"
             [style.top.px]="tooltipY()"
             [style.transform]="'translate(12px, 12px)'">
          <div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-1">
            <span class="text-base">{{ getPartIcon(hoveredPartId()) }}</span>
            <span class="text-teal-700 dark:text-cyan-200 font-bold text-xs">{{ hoveredPartName() }}</span>
          </div>
          <div class="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-cyan-950 text-teal-900 dark:text-cyan-300 w-fit mb-1.5 border border-teal-300 dark:border-cyan-800/60">
            {{ hoveredPartSystem() }}
          </div>
          <div *ngIf="hoveredPartPain() > 0" class="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
            <span>⚠️ Pain Level: {{ hoveredPartPain() }}/10</span>
          </div>
          <div *ngIf="hoveredPartNotes()" class="text-[11px] text-gray-600 dark:text-zinc-300 italic mb-1 max-w-[200px] truncate font-sans">
            "{{ hoveredPartNotes() }}"
          </div>
          <div class="text-[9px] text-gray-500 dark:text-zinc-500 font-mono tracking-tight mt-1.5 border-t border-gray-200 dark:border-zinc-800 pt-1 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-cyan-400 animate-ping"></span>
            <span>Click 3D node to select region</span>
          </div>
        </div>

        <!-- Selected Anatomical Node Overlay Card with 3D Double-Click Flip State Machine -->
        @if (state.selectedPartId(); as partId) {
          @let isFlipped = isSelectedPartFlipped();
          <div (dblclick)="toggleSelectedPartFlip($event)"
               class="absolute bottom-4 right-4 z-40 max-w-xs sm:max-w-sm w-full perspective-1000 group cursor-pointer h-52 font-mono select-none"
               title="Double-click to flip over for Somatic Innervation & Vagus Nerve Rationale">
            
            <div [class.rotate-y-180]="isFlipped"
                 class="relative w-full h-full transition-transform duration-500 transform-style-3d">

              <!-- FRONT FACE: Anatomical Telemetry -->
              <div class="p-4 rounded-2xl bg-zinc-950/90 text-white border border-teal-500/40 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden">
                <div>
                  <div class="flex items-center justify-between border-b border-teal-800/80 pb-1.5 mb-2 font-mono text-xs">
                    <span class="text-teal-300 font-bold uppercase flex items-center gap-1.5 truncate">
                      <span>{{ getPartIcon(partId) }}</span>
                      <span class="truncate">{{ state.selectedPartName() || partId }}</span>
                    </span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase shrink-0">
                      dblclick 🔄
                    </span>
                  </div>

                  <div class="space-y-1.5 text-xs text-zinc-300">
                    <div class="flex justify-between items-center text-[11px]">
                      <span>Spatial Lens:</span>
                      <span class="font-bold text-teal-400 uppercase">{{ anatomyViewMode() }} Paradigm</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px]">
                      <span>Acute Pain Rating:</span>
                      <span class="font-bold text-rose-400 font-mono">{{ getPartPainLevel(partId) }}/10</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px]">
                      <span>Reported Issues:</span>
                      <span class="font-bold text-amber-300">{{ (state.issues()[partId] || []).length }} Note(s)</span>
                    </div>
                  </div>
                </div>

                <div class="pt-1.5 border-t border-zinc-800 flex items-center justify-between font-mono text-[9px] text-zinc-400">
                  <span>3D Node: {{ partId }}</span>
                  <span class="text-teal-400 font-bold">Double-click flip</span>
                </div>
              </div>

              <!-- BACK FACE: Somatic Innervation & Vagal Shield -->
              <div class="p-4 rounded-2xl bg-teal-950 text-white border border-teal-400/50 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                <div>
                  <div class="flex items-center justify-between border-b border-teal-800 pb-1.5 mb-2 font-mono text-xs">
                    <span class="text-teal-200 font-bold uppercase flex items-center gap-1">
                      <span>🧠</span> Somatic & Nerve Innervation
                    </span>
                    <span class="text-teal-400 font-mono text-[9px]">dblclick flip</span>
                  </div>
                  <div class="space-y-1.5 text-teal-100 font-mono text-[11px]">
                    <p><strong>Nerve Root:</strong> {{ getPartNerveInnervation(partId) }}</p>
                    <p><strong>Vagal Co-Regulation:</strong> {{ getPartVagalTip(partId) }}</p>
                  </div>
                </div>

                <div class="pt-1.5 border-t border-teal-900 font-mono text-[9px] text-teal-300 flex justify-between">
                  <span>Somatic Innervation Shield</span>
                  <span>Double-click to return</span>
                </div>
              </div>

            </div>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    :host { display: flex; flex-direction: column; flex: 1 1 0%; height: 100%; min-height: 540px; width: 100%; }
    canvas { outline: none; display: block; width: 100% !important; height: 100% !important; }
  `]
})
export class Body3DViewerComponent implements AfterViewInit, OnDestroy {
    protected readonly state = inject(PatientStateService);
    private readonly patientManagement = inject(PatientManagementService);
    protected readonly themeService = inject(ThemeService);
    protected readonly envTelemetry = inject(EnvironmentalTelemetryService);
    protected readonly fireflyTexture = inject(AdobeFireflyTextureService);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

    private ambientLight?: THREE.AmbientLight;
    private directionalLight?: THREE.DirectionalLight;
    private backLight?: THREE.DirectionalLight;
    private molecularScienceGroup?: THREE.Group;

    partSelected = output<{ id: string, name: string }>();

    // Inputs for external control
    rotation = input<number>(0);
    zoom = input<number>(1);
    anatomyViewMode = input<AnatomyViewMode>('skin');
    customModelUrl = input<string | null>(null);

    readonly webglSupported = signal<boolean>(true);
    readonly webglError = signal<string>('');
    readonly showDermatomeLayer = signal<boolean>(false);
    readonly activeCameraPreset = signal<'front' | 'back' | 'left' | 'right' | 'cranial' | 'spinal' | 'visceral' | 'peripheral' | 'systemic'>('front');
    readonly activeArchetype = signal<'homo_sapiens_female' | 'homo_sapiens_male' | 'homo_sapiens_senior' | 'homo_sapiens_pediatric' | 'pongo_pygmaeus'>('homo_sapiens_male');

    onArchetypeChange(event: Event): void {
      const val = (event.target as HTMLSelectElement).value as any;
      this.activeArchetype.set(val);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([20, 30, 20]);
      }
    }
    readonly activeCameraPresetLabel = computed(() => {
      switch (this.activeCameraPreset()) {
        case 'cranial': return '🧠 Cranial';
        case 'spinal': return '🦴 Spine/Nerve';
        case 'visceral': return '🫀 Visceral';
        case 'peripheral': return '🦵 Peripheral';
        case 'systemic': return '🛡️ Systemic';
        default: return '🌐 Full Body';
      }
    });
    readonly isAutoSpinning = signal<boolean>(false);

    readonly occupationalProfile = computed(() => this.state.occupationalProfile());
    readonly occupationalStrainInfo = computed(() => {
      const prof = this.occupationalProfile();
      if (!prof) return null;

      const code = prof.socCode;
      if (code.includes('SWIM')) {
        return { cameraPreset: 'visceral' as const, focusLabel: '🫁 Pulmonary & Shoulder Rotator Cuff Strain', targetPartIds: ['r_shoulder', 'l_shoulder', 'lungs'], icon: '🏊‍♂️' };
      }
      if (code.includes('BIKE')) {
        return { cameraPreset: 'spinal' as const, focusLabel: '🦴 Pudendal Nerve & Cervical Spine Strain', targetPartIds: ['spine_cervical', 'spine_lumbar', 'pelvis'], icon: '🚴‍♂️' };
      }
      if (code.includes('RUN')) {
        return { cameraPreset: 'peripheral' as const, focusLabel: '🦵 Plantar Fascia & Tibial Stress Strain', targetPartIds: ['r_shin', 'l_shin', 'r_foot', 'l_foot'], icon: '🏃‍♂️' };
      }
      if (code === '27-2031') {
        return { cameraPreset: 'peripheral' as const, focusLabel: '🩰 Metatarsal & Ankle Flexor Strain', targetPartIds: ['r_foot', 'l_foot', 'r_shin', 'l_shin'], icon: '💃' };
      }
      if (code === '11-1011-ROYAL') {
        return { cameraPreset: 'cranial' as const, focusLabel: '👑 C1-C7 Crown Compression & Cervical Posture', targetPartIds: ['spine_cervical', 'head'], icon: '👑' };
      }
      if (code === '21-2011') {
        return { cameraPreset: 'peripheral' as const, focusLabel: '✝️ Genuflection Knee & Pastoral Grief Heart', targetPartIds: ['r_shin', 'l_shin', 'heart'], icon: '✝️' };
      }
      if (code === '11-1021-POLY') {
        return { cameraPreset: 'cranial' as const, focusLabel: '🌐 Interdisciplinary Brain & Hyper-Synthesis Matrix', targetPartIds: ['brain', 'head'], icon: '🌐' };
      }
      if (code === '37-3011') {
        return { cameraPreset: 'peripheral' as const, focusLabel: '🌿 Hand Vibrational Raynaud & Lumbar Back Strain', targetPartIds: ['r_hand', 'l_hand', 'spine_lumbar', 'lungs'], icon: '🌿' };
      }
      if (code === '37-2011') {
        return { cameraPreset: 'spinal' as const, focusLabel: '🧹 Maintenance Lumbar Disc & Knee Joint Strain', targetPartIds: ['spine_lumbar', 'r_shin', 'l_shin'], icon: '🧹' };
      }
      if (code === '55-1011-ASTRO') {
        return { cameraPreset: 'cranial' as const, focusLabel: '🚀 Cephalad Fluid Shift & Spaceflight SANS Ocular', targetPartIds: ['head', 'spine_cervical', 'spine_lumbar'], icon: '👨‍🚀' };
      }
      if (code === '55-1011-AQUA') {
        return { cameraPreset: 'spinal' as const, focusLabel: '🤿 Hyperbaric Decompression & HPNS Neuromuscular', targetPartIds: ['spine_lumbar', 'r_shin', 'l_shin'], icon: '🤿' };
      }
      if (code === '27-2021-ALPINE') {
        return { cameraPreset: 'visceral' as const, focusLabel: '🏔️ High-Altitude Hypobaric Hypoxia & Pulmonary HAPE', targetPartIds: ['lungs', 'brain', 'r_foot', 'l_foot'], icon: '🏔️' };
      }
      if (code === '51-8011') {
        return { cameraPreset: 'cranial' as const, focusLabel: '⚛️ SCADA Attentional Vigilance & Thyroid Shield', targetPartIds: ['head', 'thyroid', 'spine_cervical'], icon: '⚛️' };
      }
      if (code === '17-1011' || code === '17-2051') {
        return { cameraPreset: 'cranial' as const, focusLabel: '📐 Drafting Cervical Flexion & FEA Screen Asthenopia', targetPartIds: ['spine_cervical', 'head'], icon: '📐' };
      }
      return { cameraPreset: 'spinal' as const, focusLabel: `${prof.professionTitle} Ergonomic Strain`, targetPartIds: ['spine_lumbar'], icon: '🛡️' };
    });

    readonly hoveredPartId = signal<string | null>(null);
    readonly hoveredPartName = signal<string>('');
    readonly hoveredPartSystem = signal<string>('');
    readonly hoveredPartPain = signal<number>(0);
    readonly hoveredPartNotes = signal<string>('');
    readonly tooltipX = signal<number>(0);
    readonly tooltipY = signal<number>(0);
    readonly showHoverTooltip = signal<boolean>(false);
    readonly quickPainLevel = signal<number>(3);
    readonly quickSymptomText = signal<string>('');

    readonly isSelectedPartFlipped = signal<boolean>(false);
    private lastPartFlipTime = 0;

    toggleSelectedPartFlip(event?: Event) {
      if (event) event.stopPropagation();
      const now = Date.now();
      if (now - this.lastPartFlipTime < 200) return;
      this.lastPartFlipTime = now;
      this.isSelectedPartFlipped.update(v => !v);
    }
    readonly isHighContrastVision = signal<boolean>(false);
    readonly isReducedMotion = signal<boolean>(false);

    getPartIcon(partId: string | null): string {
      if (!partId) return '📍';
      const id = partId.toLowerCase();
      if (id.includes('head') || id.includes('brain') || id.includes('cranial')) return '🧠';
      if (id.includes('heart') || id.includes('cardio')) return '🫀';
      if (id.includes('lung') || id.includes('resp')) return '🫁';
      if (id.includes('stomach') || id.includes('digest') || id.includes('abdo') || id.includes('liver')) return '🫄';
      if (id.includes('spine') || id.includes('cervical') || id.includes('lumbar') || id.includes('dermatome')) return '🦴';
      if (id.includes('arm') || id.includes('hand') || id.includes('shoulder')) return '🦾';
      if (id.includes('leg') || id.includes('thigh') || id.includes('foot') || id.includes('shin')) return '🦵';
      if (id.includes('acupoint')) return '☯️';
      if (id.includes('chakra')) return '🧘';
      return '📍';
    }

    getPartPainLevel(partId: string): number {
      const issues = this.state.issues()[partId] || [];
      if (issues.length === 0) return 0;
      return Math.max(...issues.map(i => i.painLevel || 0));
    }

    getPartNerveInnervation(partId: string): string {
      const id = partId.toLowerCase();
      if (id.includes('head') || id.includes('brain')) return 'Cranial Nerves I-XII & Vagus (CN X)';
      if (id.includes('heart') || id.includes('chest')) return 'T1-T5 Sympathetic Cardiac Accelerators & Vagus';
      if (id.includes('lung')) return 'T2-T6 Intercostal Nerves & Phrenic (C3-C5)';
      if (id.includes('abdo') || id.includes('stomach') || id.includes('liver')) return 'T5-T12 Splanchnic Nerves & Enteric Nervous System (ENS)';
      if (id.includes('spine_cervical')) return 'C1-C8 Cervical Plexus & Suboccipital Nerve';
      if (id.includes('spine_lumbar') || id.includes('dermatome_l4')) return 'L1-L5 Lumbar Plexus & Sciatic Nerve Root';
      if (id.includes('arm') || id.includes('hand') || id.includes('shoulder')) return 'C5-T1 Brachial Plexus & Median/Radial/Ulnar Nerves';
      if (id.includes('leg') || id.includes('thigh') || id.includes('foot')) return 'L4-S3 Sacral Plexus & Femoral/Tibial Nerves';
      return 'Autonomic Nervous System & Somosensory Dermatome';
    }

    getPartVagalTip(partId: string): string {
      const id = partId.toLowerCase();
      if (id.includes('heart') || id.includes('chest')) return 'Practice 0.1 Hz RSA diaphragmatic breathing (4s in, 6s out) to increase vagal baroreflex power.';
      if (id.includes('head') || id.includes('brain')) return 'Apply gentle pressure to suboccipital release points and practice vocal humming (Om/Shen) to stimulate auricular vagus branch.';
      if (id.includes('abdo') || id.includes('stomach')) return 'Warm castor oil pack over epigastrium to ease splanchnic vasoconstriction and activate parasympathetic digestion.';
      if (id.includes('spine') || id.includes('dermatome')) return 'Postural decompression and gentle spinal cat-cow rotations to relieve intervertebral nerve root compression.';
      return 'Perform 5 minutes of physiological sighing (double inhale through nose, long exhale through mouth) for autonomic reset.';
    }

    private isSlidingPatient = false;

    triggerPatientSlideTransition() {
      if (!this.mannequinGroup) return;
      this.isSlidingPatient = true;
      this.mannequinGroup.position.x = -3.5;
      if (this.customModelGroup) this.customModelGroup.position.x = -3.5;
    }

    resetCameraView() {
      if (this.camera && this.controls) {
        this.camera.position.set(0, 1.2, 3.2);
        this.controls.target.set(0, 1.0, 0);
        this.controls.update();
      }
    }

    readonly sentinelTriageLevel = computed(() => {
      const issues = this.state.issues();
      let maxPain = 0;
      let criticalSystem = 'Baseline Baseline';

      Object.entries(issues).forEach(([part, list]) => {
        list.forEach(i => {
          if (i.painLevel > maxPain) {
            maxPain = i.painLevel;
            criticalSystem = PART_NAMES[part] || part;
          }
        });
      });

      if (maxPain >= 8) return { level: 'Level 1 - Emergency Resuscitation', code: 'L1-RED', color: 'text-rose-400', bg: 'bg-rose-950/80 border-rose-500/50', system: criticalSystem, pain: maxPain };
      if (maxPain >= 6) return { level: 'Level 2 - Emergent Triage', code: 'L2-ORANGE', color: 'text-orange-400', bg: 'bg-orange-950/80 border-orange-500/50', system: criticalSystem, pain: maxPain };
      if (maxPain >= 4) return { level: 'Level 3 - Urgent Assessment', code: 'L3-YELLOW', color: 'text-amber-300', bg: 'bg-amber-950/80 border-amber-500/50', system: criticalSystem, pain: maxPain };
      return { level: 'Level 4/5 - Stable Routine Care', code: 'L4-GREEN', color: 'text-emerald-400', bg: 'bg-emerald-950/80 border-emerald-500/50', system: criticalSystem, pain: maxPain };
    });

    toggleDermatomeLayer(): void {
      this.showDermatomeLayer.set(!this.showDermatomeLayer());
      this.updateTransparency(this.anatomyViewMode());
    }

    setCameraPreset(preset: 'front' | 'back' | 'left' | 'right' | 'cranial' | 'spinal' | 'visceral' | 'peripheral' | 'systemic'): void {
      this.activeCameraPreset.set(preset);
      this.isAutoSpinning.set(false);
      if (!this.camera || !this.controls) return;

      if (preset === 'front') {
        this.camera.position.set(0, 1.2, 5);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'back') {
        this.camera.position.set(0, 1.2, -5); // Directly view posterior spinal column & dermatomes!
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'left') {
        this.camera.position.set(-5, 1.2, 0);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'right') {
        this.camera.position.set(5, 1.2, 0);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'cranial') {
        // Cranial Neuro Sentinel View (Head / Brain & Cervical Spine C1-C8)
        this.camera.position.set(0, 1.75, 2.2);
        this.controls.target.set(0, 1.7, 0);
      } else if (preset === 'spinal') {
        // Spinal & Dermatomal Sentinel View (Posterior Thoracic/Lumbar Spine & Sciatic Nerve)
        this.camera.position.set(0, 1.15, -3.8);
        this.controls.target.set(0, 1.1, 0);
        this.showDermatomeLayer.set(true);
      } else if (preset === 'visceral') {
        // Visceral & Cardiopulmonary Sentinel View (Heart, Lungs, Liver, Kidneys)
        this.camera.position.set(-1.2, 1.25, 2.8);
        this.controls.target.set(0, 1.1, 0);
      } else if (preset === 'peripheral') {
        // Peripheral Dermatome Sentinel View (Bilateral limbs & Nerve pathways)
        this.camera.position.set(1.5, 0.4, 3.2);
        this.controls.target.set(0, 0.4, 0);
        this.showDermatomeLayer.set(true);
      } else if (preset === 'systemic') {
        // Systemic Whole-Body Sentinel Orbit View
        this.camera.position.set(0, 1.2, 5);
        this.controls.target.set(0, 1, 0);
        this.isAutoSpinning.set(true);
      }

      this.controls.update();
      this.updateTransparency(this.anatomyViewMode());
    }

    private setupInteractions() {
        const container = this.canvasContainer()?.nativeElement;
        if (!container) return;

        const onPointerMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const mouse = this.raycastService.getNormalizedMouse(e.clientX, e.clientY, rect);

            this.tooltipX.set(e.clientX - rect.left);
            this.tooltipY.set(e.clientY - rect.top);

            const hit = this.raycastService.pickObject(mouse, this.camera, this.mannequinGroup);
            if (hit) {
                container.style.cursor = 'pointer';
                const issues = this.state.issues()[hit.hitPartId] || [];
                const maxPain = issues.reduce((m, i) => Math.max(m, i.painLevel), 0);
                const desc = issues[0]?.description || '';

                this.hoveredPartId.set(hit.hitPartId);
                this.hoveredPartName.set(hit.partName);
                this.hoveredPartSystem.set(hit.systemLabel);
                this.hoveredPartPain.set(maxPain);
                this.hoveredPartNotes.set(desc);
                this.showHoverTooltip.set(true);
                return;
            }

            container.style.cursor = 'grab';
            this.showHoverTooltip.set(false);
        };

        const onPointerDown = (e: MouseEvent) => {
            if (e.button !== 0) return; // Primary click
            const rect = container.getBoundingClientRect();
            const mouse = this.raycastService.getNormalizedMouse(e.clientX, e.clientY, rect);

            const hit = this.raycastService.pickObject(mouse, this.camera, this.mannequinGroup);
            if (hit) {
                const hitPartId = hit.hitPartId;
                const name = hit.partName;
                this.state.selectPart(hitPartId);
                this.partSelected.emit({ id: hitPartId, name });

                const existingIssue = (this.state.issues()[hitPartId] || [])[0];
                if (existingIssue) {
                    this.quickPainLevel.set(existingIssue.painLevel);
                    this.quickSymptomText.set(existingIssue.description || '');
                } else {
                    this.quickPainLevel.set(3);
                    this.quickSymptomText.set('');
                }
            }
        };

        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerdown', onPointerDown);
    }

    getSelectedPartName(): string {
        const id = this.state.selectedPartId();
        if (!id) return '';
        return PART_NAMES[id] || id;
    }

    deselectPart(): void {
        this.state.selectPart('');
    }

    onPainSliderChange(event: Event): void {
        const val = parseInt((event.target as HTMLInputElement).value, 10);
        this.quickPainLevel.set(val);
        this.saveQuickIssueNote();
    }

    onQuickSymptomInput(event: Event): void {
        const text = (event.target as HTMLTextAreaElement).value;
        this.quickSymptomText.set(text);
    }

    saveQuickIssueNote(): void {
        const id = this.state.selectedPartId();
        if (!id) return;
        const name = this.getSelectedPartName();
        const painLevel = this.quickPainLevel();
        const description = this.quickSymptomText().trim() || `3D Map Target: ${name}`;

        const noteId = `note_3d_${Date.now()}`;
        const newIssue: IBodyPartIssue = {
            id,
            noteId,
            name,
            painLevel,
            description,
            symptoms: [name]
        };

        const issues = { ...this.state.issues() };
        issues[id] = [newIssue];
        this.state.issues.set(issues);
        this.state.selectNote(noteId);
        this.updatePartColors();
    }

    scrollToIntakeForm(): void {
        const el = document.getElementById('patient-intake-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleAutoSpin(): void {
      this.isAutoSpinning.set(!this.isAutoSpinning());
    }

    shufflePainLevels(): void {
      const partIds = [
        'spine_cervical', 'spine_thoracic', 'spine_lumbar', 'spine_sacral',
        'dermatome_c6_c8', 'dermatome_l4_l5', 'head', 'chest', 'heart', 'lungs',
        'abdomen', 'r_shoulder', 'l_shoulder', 'r_arm', 'l_arm'
      ];
      const currentIssues = { ...this.state.issues() };
      partIds.forEach(id => {
        const randomPain = Math.floor(Math.random() * 10);
        if (randomPain > 2) {
          currentIssues[id] = [{
            id,
            noteId: `shuffled-${id}-${Date.now()}`,
            name: `Shuffled Pain Signal (${randomPain}/10)`,
            painLevel: randomPain,
            description: `Pain level ${randomPain}/10 registered during Sentinel Triage scan.`,
            symptoms: []
          }];
        } else {
          delete currentIssues[id];
        }
      });
      this.state.issues.set(currentIssues);
      this.updatePartColors();
    }

    private meshFactory = inject(BodyMeshFactoryService);
    private raycastService = inject(RaycastSelectionService);
    private particleService = inject(SeverityParticleService);

    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private mannequinGroup!: THREE.Group;
    private customModelGroup: THREE.Group | null = null;
    private arborealTreeGroup: THREE.Group | null = null;
    private automotiveChassisGroup: THREE.Group | null = null;
    private parts: Map<string, THREE.Group | THREE.Mesh> = new Map();
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private animationFrameId?: number;
    private composer!: EffectComposer;
    private bloomPass!: UnrealBloomPass;
    private timer = new THREE.Timer();
    private resizeObserver: ResizeObserver | null = null;

    private handleResize = () => {
        const container = this.canvasContainer()?.nativeElement;
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0 || h < 480) {
            const parentRect = container.parentElement?.getBoundingClientRect();
            w = parentRect?.width || container.offsetWidth || 350;
            h = Math.max(parentRect?.height || container.offsetHeight || 0, 480);
        }
        h = Math.max(h, 480);
        w = Math.max(w, 300);
        if (this.camera) {
            this.camera.aspect = w / (h || 1);
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize(w, h);
        }
        if (this.composer) {
            this.composer.setSize(w, h);
        }
    };

    constructor() {
        // React to patient selection changes -> Trigger 3D Slide-to-Right Transition!
        effect(() => {
            const patientId = this.patientManagement.selectedPatientId();
            if (patientId && this.mannequinGroup) {
                this.triggerPatientSlideTransition();
            }
        });

        // React to selection changes in the state
        effect(() => {
            const selectedId = this.state.selectedPartId();
            this.updatePartColors();
            this.focusOnPart(selectedId);
        });

        // React to issue changes (pain levels)
        effect(() => {
            const issues = this.state.issues();
            this.updatePartColors();
        });

        // React to internal/external view toggle
        effect(() => {
            const mode = this.anatomyViewMode();
            this.updateTransparency(mode);
            if (this.bloomPass) {
                this.bloomPass.strength = (mode === 'organs' || mode === 'molecular') ? 0.3 : 0.15;
            }
        });

        // React to active philosophy (Western vs Eastern TCM vs Ayurvedic) for 3D Meridian/Organ Heatmap Sync
        effect(() => {
            const philosophy = this.state.activePhilosophy();
            this.updatePartColors();
            this.updateTransparency(this.anatomyViewMode());
        });

        // React to AVS session activation to toggle neural globe visibility instantly
        effect(() => {
            const avsActive = this.state.isAvsSessionActive();
            const mode = this.anatomyViewMode();
            this.updateTransparency(mode);
        });

        // React to zoom changes to avoid updating projection matrix every frame
        effect(() => {
            const currentZoom = this.zoom();
            if (this.camera) {
                this.camera.zoom = currentZoom;
                this.camera.updateProjectionMatrix();
            }
        });

        // React to Theme changes to dynamically tune Three.js scene background & studio lighting
        effect(() => {
            const theme = this.themeService.currentTheme();
            const active = this.themeService.activeTheme();
            this.updateThemeLightingAndMaterials();
        });

        // React to custom model URL changes
        effect(() => {
            const url = this.customModelUrl();
            if (this.scene) {
                this.loadCustomModel(url);
            }
        });
    }

    private updateThemeLightingAndMaterials() {
        if (!this.scene || !this.renderer) return;

        const theme = this.themeService.currentTheme();
        const active = this.themeService.activeTheme();
        const isDarkTheme = active === 'dark' || theme === 'dark' || theme === 'spark';

        // Clear alpha set to 0.0 (fully transparent) so background textures/images show through underneath!
        this.renderer.setClearColor(0x000000, 0.0);

        if (theme === 'spark') {
            // Ember Spark Mode studio lights
            if (this.ambientLight) { this.ambientLight.color.setHex(0xfb923c); this.ambientLight.intensity = 2.2; }
            if (this.directionalLight) { this.directionalLight.color.setHex(0xf97316); this.directionalLight.intensity = 2.0; }
            if (this.backLight) { this.backLight.color.setHex(0xe11d48); this.backLight.intensity = 1.2; }
            if (this.bloomPass) this.bloomPass.strength = 0.25;
        } else if (isDarkTheme) {
            // Dark obsidian spatial canvas
            if (this.ambientLight) { this.ambientLight.color.setHex(0xffffff); this.ambientLight.intensity = 1.8; }
            if (this.directionalLight) { this.directionalLight.color.setHex(0x38bdf8); this.directionalLight.intensity = 2.0; }
            if (this.backLight) { this.backLight.color.setHex(0x818cf8); this.backLight.intensity = 1.2; }
            if (this.bloomPass) this.bloomPass.strength = 0.15;
        } else {
            // Light Parchment studio lighting
            if (this.ambientLight) { this.ambientLight.color.setHex(0xfff8ee); this.ambientLight.intensity = 2.4; }
            if (this.directionalLight) { this.directionalLight.color.setHex(0xfff5e6); this.directionalLight.intensity = 2.0; }
            if (this.backLight) { this.backLight.color.setHex(0x38bdf8); this.backLight.intensity = 0.8; }
            if (this.bloomPass) this.bloomPass.strength = 0.05;
        }
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            this.webglSupported.set(false);
            return;
        }

        try {
            this.initScene();
            const mannequinData = this.meshFactory.createMannequinGroup();
            this.mannequinGroup = mannequinData.group;
            this.parts = mannequinData.parts;
            this.scene.add(this.mannequinGroup);

            this.startAnimation();
            this.setupInteractions();

            // Bind window and container ResizeObserver to handle tab changes and dynamic layout resizes
            const container = this.canvasContainer()?.nativeElement;
            if (typeof ResizeObserver !== 'undefined' && container) {
                this.resizeObserver = new ResizeObserver(() => this.handleResize());
                this.resizeObserver.observe(container);
            }
            window.addEventListener('resize', this.handleResize);

            requestAnimationFrame(() => this.handleResize());
            setTimeout(() => {
                this.handleResize();
                if (this.controls) {
                    this.controls.update();
                }
            }, 50);
            setTimeout(() => this.handleResize(), 300);
            setTimeout(() => this.handleResize(), 800);
        } catch (e: any) {
            console.warn("3D Viewer disabled: WebGL not supported on this device.", e);
            this.webglSupported.set(false);
            this.webglError.set(e?.message || String(e));
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('resize', this.handleResize);
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.mannequinGroup) {
            this.disposeHierarchy(this.mannequinGroup);
        }
        if (this.customModelGroup) {
            this.disposeHierarchy(this.customModelGroup);
        }
        if (this.arborealTreeGroup) {
            this.disposeHierarchy(this.arborealTreeGroup);
        }
        if (this.automotiveChassisGroup) {
            this.disposeHierarchy(this.automotiveChassisGroup);
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement?.remove();
        }
    }

    private disposeHierarchy(obj: THREE.Object3D) {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }

    private loadCustomModel(url: string | null) {
        if (this.customModelGroup) {
            this.scene.remove(this.customModelGroup);
            this.disposeHierarchy(this.customModelGroup);
            this.customModelGroup = null;
        }

        if (!url) {
            if (this.mannequinGroup) {
                this.mannequinGroup.visible = true;
                this.restoreMannequinParts();
                this.updatePartColors();
                this.updateTransparency(this.anatomyViewMode());
            }
            return;
        }

        if (this.mannequinGroup) {
            this.mannequinGroup.visible = false;
        }

        const isUSDZ = url.toLowerCase().endsWith('.usdz');
        
        if (isUSDZ) {
            const loader = new USDZLoader();
            loader.load(
                url,
                (usdz: any) => {
                    this.processLoadedModel(usdz);
                },
                undefined,
                (error: any) => {
                    console.error('Failed to load USDZ model, falling back to mannequin:', error);
                    if (this.mannequinGroup) {
                        this.mannequinGroup.visible = true;
                        this.restoreMannequinParts();
                        this.updatePartColors();
                        this.updateTransparency(this.anatomyViewMode());
                    }
                }
            );
        } else {
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf) => {
                    this.processLoadedModel(gltf.scene);
                },
                undefined,
                (error) => {
                    console.error('Failed to load GLTF model, falling back to mannequin:', error);
                    if (this.mannequinGroup) {
                        this.mannequinGroup.visible = true;
                        this.restoreMannequinParts();
                        this.updatePartColors();
                        this.updateTransparency(this.anatomyViewMode());
                    }
                }
            );
        }
    }

    private processLoadedModel(loadedObject: THREE.Object3D) {
        this.customModelGroup = new THREE.Group();
        this.customModelGroup.add(loadedObject);
        this.scene.add(this.customModelGroup);

        this.parts.clear();
        const meshesToMap: Array<{ mesh: THREE.Mesh; mappedId: string; layer: string }> = [];

        loadedObject.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const nameLower = child.name.toLowerCase();
                let mappedId = '';
                
                if (nameLower.includes('head') || nameLower.includes('skull') || nameLower.includes('brain') || nameLower.includes('neck')) mappedId = 'head';
                else if (nameLower.includes('chest') || nameLower.includes('torso') || nameLower.includes('lung') || nameLower.includes('heart') || nameLower.includes('ribs')) mappedId = 'chest';
                else if (nameLower.includes('abdomen') || nameLower.includes('stomach') || nameLower.includes('liver') || nameLower.includes('kidney') || nameLower.includes('intestine')) mappedId = 'abdomen';
                else if (nameLower.includes('pelvis') || nameLower.includes('hip') || nameLower.includes('spine') || nameLower.includes('back')) mappedId = 'pelvis';
                else if (nameLower.includes('r_shoulder') || (nameLower.includes('shoulder') && nameLower.includes('right'))) mappedId = 'r_shoulder';
                else if (nameLower.includes('l_shoulder') || (nameLower.includes('shoulder') && nameLower.includes('left'))) mappedId = 'l_shoulder';
                else if (nameLower.includes('r_arm') || (nameLower.includes('arm') && nameLower.includes('right'))) mappedId = 'r_arm';
                else if (nameLower.includes('l_arm') || (nameLower.includes('arm') && nameLower.includes('left'))) mappedId = 'l_arm';
                else if (nameLower.includes('r_hand') || (nameLower.includes('hand') && nameLower.includes('right'))) mappedId = 'r_hand';
                else if (nameLower.includes('l_hand') || (nameLower.includes('hand') && nameLower.includes('left'))) mappedId = 'l_hand';
                else if (nameLower.includes('r_thigh') || (nameLower.includes('thigh') && nameLower.includes('right')) || (nameLower.includes('femur') && nameLower.includes('right'))) mappedId = 'r_thigh';
                else if (nameLower.includes('l_thigh') || (nameLower.includes('thigh') && nameLower.includes('left')) || (nameLower.includes('femur') && nameLower.includes('left'))) mappedId = 'l_thigh';
                else if (nameLower.includes('r_shin') || (nameLower.includes('shin') && nameLower.includes('right')) || (nameLower.includes('tibia') && nameLower.includes('right'))) mappedId = 'r_shin';
                else if (nameLower.includes('l_shin') || (nameLower.includes('shin') && nameLower.includes('left')) || (nameLower.includes('tibia') && nameLower.includes('left'))) mappedId = 'l_shin';
                else if (nameLower.includes('r_foot') || (nameLower.includes('foot') && nameLower.includes('right'))) mappedId = 'r_foot';
                else if (nameLower.includes('l_foot') || (nameLower.includes('foot') && nameLower.includes('left'))) mappedId = 'l_foot';

                if (mappedId) {
                    let layer = 'skin';
                    if (nameLower.includes('bone') || nameLower.includes('skeleton')) layer = 'bone';
                    else if (nameLower.includes('muscle')) layer = 'muscle';
                    meshesToMap.push({ mesh: child, mappedId, layer });
                }
            }
        });

        meshesToMap.forEach(({ mesh, mappedId, layer }) => {
            if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
                const oldMat = mesh.material as any;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: oldMat.color || 0xfdfdfd,
                    roughness: oldMat.roughness || 0.4,
                    metalness: oldMat.metalness || 0.1,
                    transparent: true,
                    opacity: 0.9,
                    depthWrite: true
                });
            }

            mesh.userData['id'] = mappedId;
            mesh.userData['layer'] = layer;

            let partGroup = this.parts.get(mappedId) as THREE.Group;
            if (!partGroup) {
                partGroup = new THREE.Group();
                partGroup.userData['id'] = mappedId;
                this.parts.set(mappedId, partGroup);
                this.customModelGroup!.add(partGroup);
            }
            partGroup.add(mesh);
        });

        this.updatePartColors();
        this.updateTransparency(this.anatomyViewMode());
    }

    private restoreMannequinParts() {
        this.parts.clear();
        this.mannequinGroup.traverse((child) => {
            if (child instanceof THREE.Group && child.userData['id']) {
                this.parts.set(child.userData['id'], child);
            }
        });
    }

    private isWebGLAvailable(): boolean {
        try {
            // Guard against SSR / non-browser environments
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                return false;
            }
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }

    private initScene() {
        const container = this.canvasContainer()!.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.2, 5);

        // Check for WebGL support before attempting to create the renderer
        if (!this.isWebGLAvailable()) {
            throw new Error('WebGL is not supported in this environment.');
        }

        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        } catch (e) {
            throw new Error('WebGL is not supported in this environment.');
        }
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Setup Post-processing (Bloom)
        const renderScene = new RenderPass(this.scene, this.camera);
        // Resolution, strength, radius, threshold
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.2, 0.5, 0.3);
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.directionalLight.position.set(5, 10, 7);
        this.scene.add(this.directionalLight);

        this.backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.backLight.position.set(-5, 5, -5);
        this.scene.add(this.backLight);

        this.updateThemeLightingAndMaterials();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.target.set(0, 1, 0);
        this.controls.mouseButtons = {
            LEFT: null as any,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
    }

    private createMannequin() {
        this.mannequinGroup = new THREE.Group();
        this.scene.add(this.mannequinGroup);

        // Adobe Firefly AI Procedural PBR Textures
        const skinTexture = this.fireflyTexture.getFireflyTexture('skin');
        const muscleTexture = this.fireflyTexture.getFireflyTexture('muscle');
        const boneTexture = this.fireflyTexture.getFireflyTexture('skeleton');
        const organTexture = this.fireflyTexture.getFireflyTexture('organs');

        // Base Layer Materials wrapped with Adobe Firefly Generative Textures
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, bumpMap: skinTexture, bumpScale: 0.04, roughness: 0.35, metalness: 0.15, emissive: 0x0369a1, emissiveIntensity: 0.15, transparent: true, opacity: 0.92, depthWrite: true
        });
        const muscleMaterial = new THREE.MeshStandardMaterial({
            color: 0xbe123c, bumpMap: muscleTexture, bumpScale: 0.08, roughness: 0.65, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });
        const boneMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f4, bumpMap: boneTexture, bumpScale: 0.03, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });

        // Organ Layer Materials with Distinct Anatomical Colors & Emissive Highlights
        const brainMaterial = new THREE.MeshStandardMaterial({
            color: 0x9333ea, roughness: 0.3, metalness: 0.2, emissive: 0x6b21a8, emissiveIntensity: 0.2, transparent: true, opacity: 0.0, depthWrite: false
        });
        const thyroidMaterial = new THREE.MeshStandardMaterial({
            color: 0xc084fc, roughness: 0.4, metalness: 0.1, emissive: 0x9333ea, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const heartMaterial = new THREE.MeshStandardMaterial({
            color: 0xef4444, roughness: 0.3, metalness: 0.2, emissive: 0x991b1b, emissiveIntensity: 0.3, transparent: true, opacity: 0.0, depthWrite: false
        });
        const lungMaterial = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, roughness: 0.5, metalness: 0.1, emissive: 0x0284c7, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const liverMaterial = new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.4, metalness: 0.1, emissive: 0x92400e, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const stomachMaterial = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, roughness: 0.4, metalness: 0.1, emissive: 0xb45309, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const kidneyMaterial = new THREE.MeshStandardMaterial({
            color: 0xe11d48, roughness: 0.4, metalness: 0.1, emissive: 0x9f1239, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const vascularMaterial = new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.2, metalness: 0.4, emissive: 0xd97706, emissiveIntensity: 0.4, transparent: true, opacity: 0.0, depthWrite: false
        });

        // Enhanced Procedural GLSL Shader Material with Myocardial Ischemia & Cerebral Perfusion Lenses
        const molecularMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uPainLevel: { value: 0.0 },
                uTime: { value: 0.0 },
                uColor: { value: new THREE.Color(0x00ffff) },
                uHeatColor: { value: new THREE.Color(0xff0066) },
                uVascularColor: { value: new THREE.Color(0x38bdf8) },
                uNerveSignalColor: { value: new THREE.Color(0xfacc15) },
                uIschemiaColor: { value: new THREE.Color(0xd97706) },
                uCerebralPerfusionColor: { value: new THREE.Color(0xa855f7) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                uniform float uTime;
                uniform float uPainLevel;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    vec3 pos = position;
                    // Dynamic arterial/venous vessel wall expansion
                    float vascularPulse = sin(uTime * 7.5 + pos.y * 12.0) * 0.015;
                    pos += normal * vascularPulse;

                    if (uPainLevel > 0.0) {
                        float pulse = sin(uTime * 6.0) * 0.5 + 0.5;
                        pos += normal * pulse * uPainLevel * 0.05;
                    }
                    
                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPosition = worldPos.xyz;
                    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
                    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uPainLevel;
                uniform float uTime;
                uniform vec3 uColor;
                uniform vec3 uHeatColor;
                uniform vec3 uVascularColor;
                uniform vec3 uNerveSignalColor;
                uniform vec3 uIschemiaColor;
                uniform vec3 uCerebralPerfusionColor;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                void main() {
                    float pulse = (sin(uTime * 6.0) * 0.5 + 0.5) * uPainLevel;
                    vec3 viewDir = normalize(-vPosition);
                    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
                    rim = smoothstep(0.4, 1.0, rim);
                    
                    // ⚡ High-speed nerve action potential impulse wave
                    float nerveWave = sin(vWorldPosition.y * 35.0 - uTime * 14.0);
                    float nerveImpulse = smoothstep(0.85, 1.0, nerveWave);
                    
                    // 🫀 Arterial systolic pressure wave cycle & Myocardial Ischemia pulse
                    float vascularWave = sin(uTime * 8.0 - vWorldPosition.y * 8.0) * 0.5 + 0.5;
                    float ischemiaPulse = sin(uTime * 10.0) * 0.5 + 0.5;

                    // 🧠 Cerebral Perfusion Flow Wave (Cranial region)
                    float cerebralWave = sin(vWorldPosition.y * 20.0 + uTime * 5.0) * 0.5 + 0.5;

                    vec3 baseColor = mix(uColor, uHeatColor, uPainLevel);
                    vec3 vascularTone = mix(baseColor, uVascularColor, vascularWave * 0.5);
                    vec3 ischemiaTone = mix(vascularTone, uIschemiaColor, ischemiaPulse * 0.35);
                    vec3 cerebralTone = mix(ischemiaTone, uCerebralPerfusionColor, cerebralWave * 0.3);
                    vec3 nerveGlow = mix(cerebralTone, uNerveSignalColor, nerveImpulse * 0.85);

                    vec3 finalColor = mix(nerveGlow, vec3(1.0, 1.0, 1.0), pulse * 0.7 + rim * uPainLevel);
                    
                    gl_FragColor = vec4(finalColor, mix(0.2, 0.95, max(uPainLevel, nerveImpulse * 0.6)));
                }
            `,
            transparent: true,
            depthWrite: false,
            wireframe: true
        });

        // Procedural Primitive Helpers
        const rSkin = (w: number, h: number, d: number) => new THREE.CapsuleGeometry(Math.min(w, d), h, 4, 16);
        const rBone = (l: number, thickness: number = 0.03) => new THREE.CylinderGeometry(thickness, thickness, l, 8);
        const rJoint = (r: number = 0.05) => new THREE.SphereGeometry(r, 16, 16);
        const rBox = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
        const rSphere = (r: number) => new THREE.SphereGeometry(r, 32, 32);

        // 1. Head & Neck Complex (Head, Skull, Brain, Thyroid)
        this.addPartComplex('head',
            rSphere(0.25), skinMaterial, { y: 1.75 },
            rSphere(0.24), muscleMaterial, { y: 1.75 },
            rSphere(0.22), boneMaterial, { y: 1.75 },
            rSphere(0.18), brainMaterial, { y: 1.77, z: 0.01 }, // Brain Cerebrum
            rSphere(0.26), molecularMaterial, { y: 1.75 }
        );
        this.addPartComplex('brain',
            rSphere(0.01), skinMaterial, { y: 1.77 },
            rSphere(0.01), muscleMaterial, { y: 1.77 },
            rSphere(0.01), boneMaterial, { y: 1.77 },
            rSphere(0.18), brainMaterial, { y: 1.77, z: 0.01 },
            rSphere(0.19), molecularMaterial, { y: 1.77 }
        );
        this.addPartComplex('neck',
            rSkin(0.12, 0.15, 0.12), skinMaterial, { y: 1.55 },
            rSkin(0.11, 0.14, 0.11), muscleMaterial, { y: 1.55 },
            rBone(0.15, 0.04), boneMaterial, { y: 1.55 },
            undefined, undefined, undefined,
            rSkin(0.13, 0.16, 0.13), molecularMaterial, { y: 1.55 }
        );
        this.addPartComplex('thyroid',
            rSphere(0.01), skinMaterial, { y: 1.54, z: 0.05 },
            rSphere(0.01), muscleMaterial, { y: 1.54, z: 0.05 },
            rSphere(0.01), boneMaterial, { y: 1.54, z: 0.05 },
            rBox(0.08, 0.04, 0.03), thyroidMaterial, { y: 1.54, z: 0.05 },
            rBox(0.09, 0.05, 0.04), molecularMaterial, { y: 1.54, z: 0.05 }
        );

        // 2. Chest / Thorax Complex (Chest, Ribcage, Heart, Lungs, Aorta)
        this.addPartComplex('chest',
            rBox(0.5, 0.45, 0.3), skinMaterial, { y: 1.3 },
            rBox(0.48, 0.43, 0.28), muscleMaterial, { y: 1.3 },
            rBox(0.45, 0.4, 0.25), boneMaterial, { y: 1.3 },
            undefined, undefined, undefined,
            rBox(0.52, 0.47, 0.32), molecularMaterial, { y: 1.3 }
        );

        // Heart Organ Group
        const heartGroup = new THREE.Group();
        const cardiacMesh = new THREE.Mesh(rSphere(0.09), heartMaterial.clone());
        cardiacMesh.scale.set(1, 1.2, 1);
        cardiacMesh.position.set(-0.06, 1.34, 0.04);
        cardiacMesh.userData['layer'] = 'organ';
        cardiacMesh.userData['organ'] = 'heart';
        cardiacMesh.userData['id'] = 'heart';
        heartGroup.add(cardiacMesh);

        // Ascending Aorta Trunk
        const aortaMesh = new THREE.Mesh(rBone(0.2, 0.025), vascularMaterial.clone());
        aortaMesh.position.set(-0.04, 1.42, 0.02);
        aortaMesh.rotation.z = -0.2;
        aortaMesh.userData['layer'] = 'organ';
        aortaMesh.userData['organ'] = 'heart';
        aortaMesh.userData['id'] = 'heart';
        heartGroup.add(aortaMesh);
        
        heartGroup.userData['id'] = 'heart';
        this.mannequinGroup.add(heartGroup);
        this.parts.set('heart', heartGroup);

        // Lungs Organ Group (Left & Right)
        const lungsGroup = new THREE.Group();
        const leftLung = new THREE.Mesh(rSkin(0.1, 0.25, 0.12), lungMaterial.clone());
        leftLung.position.set(0.14, 1.32, 0.02);
        leftLung.userData['layer'] = 'organ';
        leftLung.userData['organ'] = 'lungs';
        leftLung.userData['id'] = 'lungs';
        lungsGroup.add(leftLung);

        const rightLung = new THREE.Mesh(rSkin(0.1, 0.25, 0.12), lungMaterial.clone());
        rightLung.position.set(-0.14, 1.32, 0.02);
        rightLung.userData['layer'] = 'organ';
        rightLung.userData['organ'] = 'lungs';
        rightLung.userData['id'] = 'lungs';
        lungsGroup.add(rightLung);

        lungsGroup.userData['id'] = 'lungs';
        this.mannequinGroup.add(lungsGroup);
        this.parts.set('lungs', lungsGroup);

        // 3. Abdomen Complex (Abdomen, Liver, Stomach, Kidneys)
        this.addPartComplex('abdomen',
            rBox(0.45, 0.3, 0.28), skinMaterial, { y: 0.95 },
            rBox(0.43, 0.28, 0.26), muscleMaterial, { y: 0.95 },
            rBone(0.3, 0.05), boneMaterial, { y: 0.95 },
            undefined, undefined, undefined,
            rBox(0.47, 0.32, 0.30), molecularMaterial, { y: 0.95 }
        );

        // Liver Organ
        const liverGroup = new THREE.Group();
        const liverMesh = new THREE.Mesh(rBox(0.18, 0.12, 0.14), liverMaterial.clone());
        liverMesh.position.set(-0.12, 1.04, 0.03);
        liverMesh.userData['layer'] = 'organ';
        liverMesh.userData['organ'] = 'liver';
        liverMesh.userData['id'] = 'liver';
        liverGroup.add(liverMesh);
        liverGroup.userData['id'] = 'liver';
        this.mannequinGroup.add(liverGroup);
        this.parts.set('liver', liverGroup);

        // Stomach Organ
        const stomachGroup = new THREE.Group();
        const stomachMesh = new THREE.Mesh(rSphere(0.09), stomachMaterial.clone());
        stomachMesh.scale.set(1.2, 0.8, 1);
        stomachMesh.position.set(0.10, 1.02, 0.03);
        stomachMesh.userData['layer'] = 'organ';
        stomachMesh.userData['organ'] = 'stomach';
        stomachMesh.userData['id'] = 'stomach';
        stomachGroup.add(stomachMesh);
        stomachGroup.userData['id'] = 'stomach';
        this.mannequinGroup.add(stomachGroup);
        this.parts.set('stomach', stomachGroup);

        // Kidneys Organ (Bilateral Renal)
        const kidneysGroup = new THREE.Group();
        const leftKidney = new THREE.Mesh(rSphere(0.05), kidneyMaterial.clone());
        leftKidney.scale.set(0.8, 1.3, 0.8);
        leftKidney.position.set(0.12, 0.92, -0.07);
        leftKidney.userData['layer'] = 'organ';
        leftKidney.userData['organ'] = 'kidneys';
        leftKidney.userData['id'] = 'kidneys';
        kidneysGroup.add(leftKidney);

        const rightKidney = new THREE.Mesh(rSphere(0.05), kidneyMaterial.clone());
        rightKidney.scale.set(0.8, 1.3, 0.8);
        rightKidney.position.set(-0.12, 0.90, -0.07);
        rightKidney.userData['layer'] = 'organ';
        rightKidney.userData['organ'] = 'kidneys';
        rightKidney.userData['id'] = 'kidneys';
        kidneysGroup.add(rightKidney);
        kidneysGroup.userData['id'] = 'kidneys';
        this.mannequinGroup.add(kidneysGroup);
        this.parts.set('kidneys', kidneysGroup);

        // 4. Pelvis & Spine Complex
        this.addPartComplex('pelvis',
            rBox(0.48, 0.25, 0.3), skinMaterial, { y: 0.7 },
            rBox(0.46, 0.23, 0.28), muscleMaterial, { y: 0.7 },
            rBox(0.4, 0.2, 0.2), boneMaterial, { y: 0.7 },
            undefined, undefined, undefined,
            rBox(0.50, 0.27, 0.32), molecularMaterial, { y: 0.7 }
        );

        // 4b. Posterior Spinal Column Segments (Cervical C1-C8, Thoracic T1-T12, Lumbar L1-L5, Sacral S1-S5)
        this.addPartComplex('spine_cervical',
            rSkin(0.06, 0.15, 0.06), skinMaterial, { y: 1.55, z: -0.10 },
            rSkin(0.05, 0.14, 0.05), muscleMaterial, { y: 1.55, z: -0.10 },
            rBone(0.15, 0.035), boneMaterial, { y: 1.55, z: -0.10 },
            undefined, undefined, undefined,
            rSkin(0.07, 0.16, 0.07), molecularMaterial, { y: 1.55, z: -0.10 }
        );
        this.addPartComplex('spine_thoracic',
            rSkin(0.08, 0.38, 0.08), skinMaterial, { y: 1.28, z: -0.14 },
            rSkin(0.07, 0.36, 0.07), muscleMaterial, { y: 1.28, z: -0.14 },
            rBone(0.38, 0.045), boneMaterial, { y: 1.28, z: -0.14 },
            undefined, undefined, undefined,
            rSkin(0.09, 0.40, 0.09), molecularMaterial, { y: 1.28, z: -0.14 }
        );
        this.addPartComplex('spine_lumbar',
            rSkin(0.10, 0.28, 0.10), skinMaterial, { y: 0.95, z: -0.15 },
            rSkin(0.09, 0.26, 0.09), muscleMaterial, { y: 0.95, z: -0.15 },
            rBone(0.28, 0.055), boneMaterial, { y: 0.95, z: -0.15 },
            undefined, undefined, undefined,
            rSkin(0.11, 0.30, 0.11), molecularMaterial, { y: 0.95, z: -0.15 }
        );
        this.addPartComplex('spine_sacral',
            rSkin(0.11, 0.18, 0.08), skinMaterial, { y: 0.70, z: -0.14 },
            rSkin(0.10, 0.16, 0.07), muscleMaterial, { y: 0.70, z: -0.14 },
            rBox(0.12, 0.16, 0.06), boneMaterial, { y: 0.70, z: -0.14 },
            undefined, undefined, undefined,
            rSkin(0.12, 0.20, 0.09), molecularMaterial, { y: 0.70, z: -0.14 }
        );

        // 4c. Neural Dermatome Layer Overlays (C6-C8 Radial/Ulnar & L4-L5 Sciatic Nerve)
        const dermatomeMaterialC6C8 = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6, transparent: true, opacity: 0.85, depthWrite: true, wireframe: true
        });
        const dermatomeMaterialL4L5 = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6, transparent: true, opacity: 0.85, depthWrite: true, wireframe: true
        });

        // C6-C8 Dermatome Mesh Group
        const dermC6C8Group = new THREE.Group();
        const meshC6 = new THREE.Mesh(rSkin(0.10, 0.42, 0.10), dermatomeMaterialC6C8.clone());
        meshC6.position.set(-0.42, 1.15, 0.05);
        meshC6.userData['layer'] = 'dermatome';
        meshC6.userData['id'] = 'dermatome_c6_c8';
        dermC6C8Group.add(meshC6);
        const meshC8 = new THREE.Mesh(rSkin(0.10, 0.42, 0.10), dermatomeMaterialC6C8.clone());
        meshC8.position.set(0.42, 1.15, 0.05);
        meshC8.userData['layer'] = 'dermatome';
        meshC8.userData['id'] = 'dermatome_c6_c8';
        dermC6C8Group.add(meshC8);
        dermC6C8Group.userData['id'] = 'dermatome_c6_c8';
        this.mannequinGroup.add(dermC6C8Group);
        this.parts.set('dermatome_c6_c8', dermC6C8Group);

        // L4-L5 Sciatic Dermatome Mesh Group
        const dermL4L5Group = new THREE.Group();
        const meshL4 = new THREE.Mesh(rSkin(0.14, 0.9, 0.14), dermatomeMaterialL4L5.clone());
        meshL4.position.set(-0.18, 0.05, 0.02);
        meshL4.userData['layer'] = 'dermatome';
        meshL4.userData['id'] = 'dermatome_l4_l5';
        dermL4L5Group.add(meshL4);
        const meshL5 = new THREE.Mesh(rSkin(0.14, 0.9, 0.14), dermatomeMaterialL4L5.clone());
        meshL5.position.set(0.18, 0.05, 0.02);
        meshL5.userData['layer'] = 'dermatome';
        meshL5.userData['id'] = 'dermatome_l4_l5';
        dermL4L5Group.add(meshL5);
        dermL4L5Group.userData['id'] = 'dermatome_l4_l5';
        this.mannequinGroup.add(dermL4L5Group);
        this.parts.set('dermatome_l4_l5', dermL4L5Group);

        // 5. Appendages (Arms & Legs)
        this.addPartComplex('r_shoulder', rJoint(0.12), skinMaterial, { x: -0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: -0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: -0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: -0.32, y: 1.45 });
        this.addPartComplex('r_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('r_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: -0.5, y: 0.82, rx: 0.2 });

        this.addPartComplex('l_shoulder', rJoint(0.12), skinMaterial, { x: 0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: 0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: 0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: 0.32, y: 1.45 });
        this.addPartComplex('l_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('l_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: 0.5, y: 0.82, rx: 0.2 });

        this.addPartComplex('r_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: -0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: -0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: -0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: -0.18, y: 0.35 });
        this.addPartComplex('r_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: -0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: -0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: -0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: -0.18, y: -0.25 });
        this.addPartComplex('r_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: -0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: -0.18, y: -0.58, z: 0.05 });

        this.addPartComplex('l_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: 0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: 0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: 0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: 0.18, y: 0.35 });
        this.addPartComplex('l_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: 0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: 0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: 0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: 0.18, y: -0.25 });
        this.addPartComplex('l_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: 0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: 0.18, y: -0.58, z: 0.05 });

        // Add subtle procedural "breathing" and idle mind core
        const mindGeo = new THREE.IcosahedronGeometry(0.5, 2);
        const mindMesh = new THREE.Mesh(mindGeo, new THREE.MeshStandardMaterial({
            color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.5, wireframe: true, transparent: true, opacity: 0.0, visible: false
        }));
        mindMesh.position.set(0, 1.7, 0);
        mindMesh.userData['isMindCore'] = true;
        this.mannequinGroup.add(mindMesh);

        // Instantiate procedural 3D TCM Meridians, Ayurvedic Aura Fields, and Curie Radium Isotope Nodes
        this.createTcmMeridians();
        this.createAyurvedicAura();
        this.createCurieIsotopeNodes();

        this.updatePartColors();
        this.updateTransparency(this.anatomyViewMode());
    }

    private addPartComplex(id: string,
        skinGeo: THREE.BufferGeometry, skinMat: THREE.Material, skinPos: any,
        muscleGeo: THREE.BufferGeometry, muscleMat: THREE.Material, musclePos: any,
        boneGeo: THREE.BufferGeometry, boneMat: THREE.Material, bonePos: any,
        mindGeo?: THREE.BufferGeometry, mindMat?: THREE.Material, mindPos?: any,
        molecularGeo?: THREE.BufferGeometry, molecularMat?: THREE.Material, molecularPos?: any) {

        const group = new THREE.Group();
        group.userData['id'] = id;

        // 1. Skin Layer
        const meshSkin = new THREE.Mesh(skinGeo, skinMat.clone());
        this.applyPos(meshSkin, skinPos);
        meshSkin.userData['layer'] = 'skin';
        meshSkin.userData['id'] = id;
        group.add(meshSkin);

        // 2. Muscle Layer
        const meshMuscle = new THREE.Mesh(muscleGeo, muscleMat.clone());
        this.applyPos(meshMuscle, musclePos);
        meshMuscle.userData['layer'] = 'muscle';
        meshMuscle.userData['id'] = id;
        group.add(meshMuscle);

        // 3. Bone Layer
        const meshBone = new THREE.Mesh(boneGeo, boneMat.clone());
        this.applyPos(meshBone, bonePos);
        meshBone.userData['layer'] = 'bone';
        meshBone.userData['id'] = id;
        group.add(meshBone);

        // 4. Organ Layer (Optional)
        if (mindGeo && mindMat && mindPos) {
            const meshMind = new THREE.Mesh(mindGeo, mindMat.clone());
            this.applyPos(meshMind, mindPos);
            meshMind.userData['layer'] = 'organ';
            meshMind.userData['id'] = id;
            group.add(meshMind);
        }

        // 5. Molecular Layer (Optional)
        if (molecularGeo && molecularMat && molecularPos) {
            const meshMolecular = new THREE.Mesh(molecularGeo, molecularMat.clone());
            this.applyPos(meshMolecular, molecularPos);
            meshMolecular.userData['layer'] = 'molecular';
            meshMolecular.userData['id'] = id;
            group.add(meshMolecular);
        }

        this.mannequinGroup.add(group);
        this.parts.set(id, group);
    }

    private tcmMeridianGroup: THREE.Group | null = null;
    private ayurvedicAuraGroup: THREE.Group | null = null;

    private createTcmMeridians() {
        this.tcmMeridianGroup = new THREE.Group();
        this.mannequinGroup.add(this.tcmMeridianGroup);

        const meridianPaths = [
            [new THREE.Vector3(0, 0.4, 0.15), new THREE.Vector3(0, 0.9, 0.17), new THREE.Vector3(0, 1.3, 0.18), new THREE.Vector3(0, 1.55, 0.12), new THREE.Vector3(0, 1.75, 0.25)],
            [new THREE.Vector3(0, 0.4, -0.15), new THREE.Vector3(0, 0.9, -0.17), new THREE.Vector3(0, 1.3, -0.18), new THREE.Vector3(0, 1.55, -0.12), new THREE.Vector3(0, 1.85, -0.1)],
            [new THREE.Vector3(0.18, 1.4, 0.08), new THREE.Vector3(0.35, 1.35, 0.0), new THREE.Vector3(0.48, 1.1, 0.0), new THREE.Vector3(0.65, 0.85, 0.0)],
            [new THREE.Vector3(-0.18, 1.4, 0.08), new THREE.Vector3(-0.35, 1.35, 0.0), new THREE.Vector3(-0.48, 1.1, 0.0), new THREE.Vector3(-0.65, 0.85, 0.0)],
            [new THREE.Vector3(0.12, 1.32, 0.04), new THREE.Vector3(0.32, 1.3, -0.02), new THREE.Vector3(0.46, 1.05, -0.02), new THREE.Vector3(0.64, 0.8, -0.02)],
            [new THREE.Vector3(-0.12, 1.32, 0.04), new THREE.Vector3(-0.32, 1.3, -0.02), new THREE.Vector3(-0.46, 1.05, -0.02), new THREE.Vector3(-0.64, 0.8, -0.02)]
        ];

        meridianPaths.forEach((pathPoints, idx) => {
            const curve = new THREE.CatmullRomCurve3(pathPoints);
            const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.006, 8, false);
            const color = idx < 2 ? 0x38bdf8 : (idx < 4 ? 0x10b981 : 0xef4444);
            const mat = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.8
            });
            const tubeMesh = new THREE.Mesh(tubeGeo, mat);
            tubeMesh.userData['isMeridian'] = true;
            this.tcmMeridianGroup!.add(tubeMesh);
        });

        // 🌿 3D Acupoint Sphere Touch Target Nodes (Fast Tap Targets)
        const acupoints = [
            { id: 'acupoint_gv20', pos: [0, 1.86, 0.0], color: 0x8b5cf6 },
            { id: 'acupoint_cv17', pos: [0, 1.30, 0.18], color: 0xef4444 },
            { id: 'acupoint_cv12', pos: [0, 1.05, 0.16], color: 0xf59e0b },
            { id: 'acupoint_st36_r', pos: [-0.18, -0.15, 0.12], color: 0x38bdf8 },
            { id: 'acupoint_st36_l', pos: [0.18, -0.15, 0.12], color: 0x38bdf8 },
            { id: 'acupoint_li4_r', pos: [-0.52, 0.80, 0.05], color: 0x10b981 },
            { id: 'acupoint_li4_l', pos: [0.52, 0.80, 0.05], color: 0x10b981 },
            { id: 'acupoint_sp6_r', pos: [-0.16, -0.45, 0.05], color: 0x10b981 },
            { id: 'acupoint_sp6_l', pos: [0.16, -0.45, 0.05], color: 0x10b981 }
        ];

        acupoints.forEach(pt => {
            const geo = new THREE.SphereGeometry(0.035, 16, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: pt.color,
                emissive: pt.color,
                emissiveIntensity: 0.8,
                roughness: 0.2
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(pt.pos[0], pt.pos[1], pt.pos[2]);
            mesh.userData['id'] = pt.id;
            mesh.userData['layer'] = 'acupoint';
            mesh.userData['paradigm'] = 'eastern';
            this.tcmMeridianGroup!.add(mesh);
            this.parts.set(pt.id, new THREE.Group().add(mesh));
        });
    }

    private createAyurvedicAura() {
        this.ayurvedicAuraGroup = new THREE.Group();
        this.mannequinGroup.add(this.ayurvedicAuraGroup);

        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorVata = new THREE.Color(0x38bdf8);
        const colorPitta = new THREE.Color(0xf59e0b);
        const colorKapha = new THREE.Color(0x10b981);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const radius = 0.5 + Math.random() * 0.8;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = 1.1 + radius * Math.cos(phi) * 0.7;
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            const c = i % 3 === 0 ? colorVata : (i % 3 === 1 ? colorPitta : colorKapha);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const auraGeo = new THREE.BufferGeometry();
        auraGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        auraGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const auraMat = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(auraGeo, auraMat);
        particleSystem.userData['isAura'] = true;
        this.ayurvedicAuraGroup.add(particleSystem);

        // 🧘 3D Ayurvedic Sushumna Chakra Touch Nodes
        const chakras = [
            { id: 'chakra_sahasrara', pos: [0, 1.88, 0.0], color: 0xa855f7 },
            { id: 'chakra_ajna', pos: [0, 1.70, 0.12], color: 0x6366f1 },
            { id: 'chakra_vishuddha', pos: [0, 1.50, 0.10], color: 0x0284c7 },
            { id: 'chakra_anahata', pos: [0, 1.30, 0.14], color: 0x10b981 },
            { id: 'chakra_manipura', pos: [0, 1.05, 0.14], color: 0xf59e0b },
            { id: 'chakra_svadhisthana', pos: [0, 0.82, 0.12], color: 0xf97316 },
            { id: 'chakra_muladhara', pos: [0, 0.62, 0.08], color: 0xef4444 }
        ];

        chakras.forEach(c => {
            const geo = new THREE.TorusGeometry(0.045, 0.015, 12, 24);
            const mat = new THREE.MeshStandardMaterial({
                color: c.color,
                emissive: c.color,
                emissiveIntensity: 0.9,
                roughness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
            mesh.userData['id'] = c.id;
            mesh.userData['layer'] = 'chakra';
            mesh.userData['paradigm'] = 'ayurvedic';
            this.ayurvedicAuraGroup!.add(mesh);
            this.parts.set(c.id, new THREE.Group().add(mesh));
        });
    }

    private curieIsotopeGroup: THREE.Group | null = null;

    private createCurieIsotopeNodes() {
        this.curieIsotopeGroup = new THREE.Group();
        this.mannequinGroup.add(this.curieIsotopeGroup);

        // ⚛️ 1950s Gilbert U-238 Radium-226 Isotope Alpha Emission Nodes
        const isotopes = [
            { id: 'chest', pos: [0, 1.30, 0.18], color: 0x00ff66, label: 'Radium-226 Hematopoietic Bone Marrow Stem Node' },
            { id: 'r_hand', pos: [-0.52, 0.80, 0.05], color: 0xfbbf24, label: 'Radium Palmar Desquamation Lesion Node' },
            { id: 'l_hand', pos: [0.52, 0.80, 0.05], color: 0xfbbf24, label: 'Polonium-210 Dermal Erythema Node' }
        ];

        isotopes.forEach(iso => {
            const haloGeo = new THREE.RingGeometry(0.04, 0.065, 24);
            const haloMat = new THREE.MeshBasicMaterial({
                color: iso.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });
            const haloMesh = new THREE.Mesh(haloGeo, haloMat);
            haloMesh.position.set(iso.pos[0], iso.pos[1], iso.pos[2]);
            haloMesh.userData['id'] = iso.id;
            haloMesh.userData['isCurieNode'] = true;
            this.curieIsotopeGroup!.add(haloMesh);

            const innerGeo = new THREE.SphereGeometry(0.025, 16, 16);
            const innerMat = new THREE.MeshStandardMaterial({
                color: iso.color,
                emissive: iso.color,
                emissiveIntensity: 1.0,
                roughness: 0.1
            });
            const innerMesh = new THREE.Mesh(innerGeo, innerMat);
            innerMesh.position.set(iso.pos[0], iso.pos[1], iso.pos[2]);
            innerMesh.userData['id'] = iso.id;
            innerMesh.userData['isCurieNode'] = true;
            this.curieIsotopeGroup!.add(innerMesh);
        });

        // Alpha / Beta Decay Particle Emission Cloud
        const pCount = 120;
        const pPos = new Float32Array(pCount * 3);
        const pColors = new Float32Array(pCount * 3);
        const cGreen = new THREE.Color(0x00ff66);
        const cAmber = new THREE.Color(0xfbbf24);

        for (let i = 0; i < pCount; i++) {
            const rad = 0.3 + Math.random() * 0.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            pPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            pPos[i * 3 + 1] = 1.3 + rad * Math.cos(phi) * 0.6;
            pPos[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

            const col = i % 2 === 0 ? cGreen : cAmber;
            pColors[i * 3] = col.r;
            pColors[i * 3 + 1] = col.g;
            pColors[i * 3 + 2] = col.b;
        }

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

        const pMat = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleCloud = new THREE.Points(pGeo, pMat);
        particleCloud.userData['isCurieCloud'] = true;
        this.curieIsotopeGroup.add(particleCloud);
    }

    private createArborealTreeModel() {
        this.arborealTreeGroup = new THREE.Group();
        this.scene.add(this.arborealTreeGroup);
        this.arborealTreeGroup.visible = false;

        const rootMat = new THREE.MeshStandardMaterial({
            color: 0x78350f, roughness: 0.85, metalness: 0.1
        });
        const rootSapMat = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6, roughness: 0.2
        });

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const rootGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.9, 12);
            const rootMesh = new THREE.Mesh(rootGeo, rootMat);
            rootMesh.position.set(Math.cos(angle) * 0.4, -0.3, Math.sin(angle) * 0.4);
            rootMesh.rotation.z = Math.cos(angle) * 0.5;
            rootMesh.rotation.x = Math.sin(angle) * 0.5;
            rootMesh.userData['id'] = 'pelvis';
            rootMesh.userData['layer'] = 'organ';
            this.arborealTreeGroup.add(rootMesh);

            const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
            const nodeMesh = new THREE.Mesh(nodeGeo, rootSapMat);
            nodeMesh.position.set(Math.cos(angle) * 0.65, -0.6, Math.sin(angle) * 0.65);
            this.arborealTreeGroup.add(nodeMesh);
        }

        const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 1.6, 24);
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x5b21b6, roughness: 0.8, metalness: 0.1, emissive: 0x3b0764, emissiveIntensity: 0.2
        });
        const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.set(0, 0.8, 0);
        trunkMesh.userData['id'] = 'chest';
        trunkMesh.userData['layer'] = 'organ';
        this.arborealTreeGroup.add(trunkMesh);

        const sapCoreGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.65, 16);
        const sapCoreMat = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8, transparent: true, opacity: 0.85
        });
        const sapCoreMesh = new THREE.Mesh(sapCoreGeo, sapCoreMat);
        sapCoreMesh.position.set(0, 0.8, 0);
        sapCoreMesh.userData['isSapCore'] = true;
        this.arborealTreeGroup.add(sapCoreMesh);

        const boughCoords = [
            { pos: [-0.45, 1.4, 0], rotZ: -0.6, id: 'l_shoulder' },
            { pos: [0.45, 1.4, 0], rotZ: 0.6, id: 'r_shoulder' },
            { pos: [-0.75, 1.2, 0.2], rotZ: -0.9, id: 'l_arm' },
            { pos: [0.75, 1.2, 0.2], rotZ: 0.9, id: 'r_arm' },
            { pos: [0, 1.7, 0], rotZ: 0, id: 'head' }
        ];

        boughCoords.forEach(b => {
            const boughGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.7, 16);
            const boughMesh = new THREE.Mesh(boughGeo, trunkMat);
            boughMesh.position.set(b.pos[0], b.pos[1], b.pos[2]);
            boughMesh.rotation.z = b.rotZ;
            boughMesh.userData['id'] = b.id;
            boughMesh.userData['layer'] = 'organ';
            this.arborealTreeGroup!.add(boughMesh);
        });

        const foliageCount = 120;
        const leafGeo = new THREE.DodecahedronGeometry(0.08, 1);
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5, roughness: 0.3
        });

        for (let i = 0; i < foliageCount; i++) {
            const leafMesh = new THREE.Mesh(leafGeo, leafMat);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 0.4 + Math.random() * 0.7;

            leafMesh.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                1.9 + r * Math.cos(phi) * 0.6,
                r * Math.sin(phi) * Math.sin(theta)
            );
            leafMesh.userData['isLeafNode'] = true;
            this.arborealTreeGroup.add(leafMesh);
        }
    }

    private createAutomotiveChassisModel() {
        this.automotiveChassisGroup = new THREE.Group();
        this.scene.add(this.automotiveChassisGroup);
        this.automotiveChassisGroup.visible = false;

        const steelMat = new THREE.MeshStandardMaterial({
            color: 0x64748b, roughness: 0.25, metalness: 0.85
        });
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0, roughness: 0.1, metalness: 0.95
        });
        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.7
        });
        const redStressMat = new THREE.MeshStandardMaterial({
            color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.7, roughness: 0.2
        });

        [-0.22, 0.22].forEach(x => {
            const railGeo = new THREE.BoxGeometry(0.08, 2.2, 0.08);
            const railMesh = new THREE.Mesh(railGeo, steelMat);
            railMesh.position.set(x, 0.6, 0);
            railMesh.userData['id'] = 'chest';
            railMesh.userData['layer'] = 'bone';
            this.automotiveChassisGroup!.add(railMesh);
        });

        const engineBlockGeo = new THREE.BoxGeometry(0.55, 0.5, 0.45);
        const engineBlockMesh = new THREE.Mesh(engineBlockGeo, engineMat);
        engineBlockMesh.position.set(0, 1.3, 0);
        engineBlockMesh.userData['id'] = 'heart';
        engineBlockMesh.userData['layer'] = 'organ';
        engineBlockMesh.userData['isEngineBlock'] = true;
        this.automotiveChassisGroup.add(engineBlockMesh);

        [-0.2, 0.2].forEach(x => {
            const valveGeo = new THREE.BoxGeometry(0.18, 0.1, 0.42);
            const valveMesh = new THREE.Mesh(valveGeo, chromeMat);
            valveMesh.position.set(x, 1.58, 0);
            valveMesh.rotation.z = x > 0 ? -0.2 : 0.2;
            this.automotiveChassisGroup!.add(valveMesh);
        });

        const exhaustGeo = new THREE.TorusGeometry(0.2, 0.04, 12, 24, Math.PI);
        const exhaustMeshR = new THREE.Mesh(exhaustGeo, chromeMat);
        exhaustMeshR.position.set(0.28, 1.25, 0);
        exhaustMeshR.rotation.y = Math.PI / 2;
        this.automotiveChassisGroup.add(exhaustMeshR);

        const exhaustMeshL = new THREE.Mesh(exhaustGeo, chromeMat);
        exhaustMeshL.position.set(-0.28, 1.25, 0);
        exhaustMeshL.rotation.y = -Math.PI / 2;
        this.automotiveChassisGroup.add(exhaustMeshL);

        const receiverGeo = new THREE.BoxGeometry(0.22, 0.22, 0.35);
        const receiverMesh = new THREE.Mesh(receiverGeo, steelMat);
        receiverMesh.position.set(0, 0.45, -0.15);
        receiverMesh.userData['id'] = 'spine_lumbar';
        receiverMesh.userData['layer'] = 'bone';
        this.automotiveChassisGroup.add(receiverMesh);

        const ballGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const ballMesh = new THREE.Mesh(ballGeo, chromeMat);
        ballMesh.position.set(0, 0.52, -0.32);
        this.automotiveChassisGroup.add(ballMesh);

        const tongueLoadGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12);
        const tongueLoadMesh = new THREE.Mesh(tongueLoadGeo, redStressMat);
        tongueLoadMesh.position.set(0, 0.35, -0.55);
        tongueLoadMesh.rotation.x = Math.PI / 3;
        this.automotiveChassisGroup.add(tongueLoadMesh);

        const strutPositions = [
            { x: -0.18, y: 0.35, z: 0, id: 'r_thigh' },
            { x: 0.18, y: 0.35, z: 0, id: 'l_thigh' },
            { x: -0.18, y: -0.25, z: 0, id: 'r_shin' },
            { x: 0.18, y: -0.25, z: 0, id: 'l_shin' },
            { x: -0.32, y: 1.45, z: 0, id: 'r_shoulder' },
            { x: 0.32, y: 1.45, z: 0, id: 'l_shoulder' }
        ];

        strutPositions.forEach(s => {
            const coilGeo = new THREE.TorusGeometry(0.1, 0.03, 12, 24);
            const coilMesh = new THREE.Mesh(coilGeo, chromeMat);
            coilMesh.position.set(s.x, s.y, s.z);
            coilMesh.rotation.x = Math.PI / 2;
            coilMesh.userData['id'] = s.id;
            coilMesh.userData['layer'] = 'bone';
            this.automotiveChassisGroup!.add(coilMesh);
        });
    }

    private createMolecularScienceModel() {
        this.molecularScienceGroup = new THREE.Group();
        this.scene.add(this.molecularScienceGroup);
        this.molecularScienceGroup.visible = false;

        const helixRadius = 0.55;
        const height = 2.4;
        const turns = 3;
        const numPoints = 80;
        
        const matA = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.9, roughness: 0.2 }); // Cyan
        const matT = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.9, roughness: 0.2 }); // Rose
        const matG = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, roughness: 0.2 }); // Emerald
        const matC = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.9, roughness: 0.2 }); // Amber
        const backboneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcbd5e1, emissiveIntensity: 0.4, transparent: true, opacity: 0.8, roughness: 0.1 });

        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            const angle = t * turns * Math.PI * 2;
            const y = (t * height) - (height / 2) + 1.0;

            const x1 = Math.cos(angle) * helixRadius;
            const z1 = Math.sin(angle) * helixRadius;
            const p1 = new THREE.Vector3(x1, y, z1);

            const x2 = Math.cos(angle + Math.PI) * helixRadius;
            const z2 = Math.sin(angle + Math.PI) * helixRadius;
            const p2 = new THREE.Vector3(x2, y, z2);

            const sphereGeo = new THREE.SphereGeometry(0.035, 12, 12);
            const s1 = new THREE.Mesh(sphereGeo, backboneMat);
            s1.position.copy(p1);
            this.molecularScienceGroup.add(s1);

            const s2 = new THREE.Mesh(sphereGeo, backboneMat);
            s2.position.copy(p2);
            this.molecularScienceGroup.add(s2);

            if (i % 3 === 0) {
                const rungCurve = new THREE.LineCurve3(p1, p2);
                const rungGeo = new THREE.TubeGeometry(rungCurve, 4, 0.012, 8, false);
                
                let mat = matA;
                if (i % 12 === 0) mat = matA;
                else if (i % 12 === 3) mat = matT;
                else if (i % 12 === 6) mat = matG;
                else mat = matC;

                const rungMesh = new THREE.Mesh(rungGeo, mat);
                this.molecularScienceGroup.add(rungMesh);

                const centerGeo = new THREE.SphereGeometry(0.045, 12, 12);
                const centerMesh = new THREE.Mesh(centerGeo, new THREE.MeshStandardMaterial({
                    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2
                }));
                centerMesh.position.lerpVectors(p1, p2, 0.5);
                this.molecularScienceGroup.add(centerMesh);
            }
        }
    }

    private applyPos(mesh: THREE.Mesh, pos: any) {
        mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
        if (pos.rx) mesh.rotation.x = pos.rx;
        if (pos.ry) mesh.rotation.y = pos.ry;
        if (pos.rz) mesh.rotation.z = pos.rz;
    }

    private updatePartColors() {
        const selectedId = this.state.selectedPartId();
        const issues = this.state.issues();

        this.parts.forEach((group, id) => {
            const isSelected = selectedId === id;
            const issuesForPart = issues[id] || [];
            const maxPain = issuesForPart.reduce((max, issue) => Math.max(max, issue.painLevel), 0);

            group.children.forEach(child => {
                if (!(child instanceof THREE.Mesh)) return;
                const material = child.material as THREE.MeshStandardMaterial;
                const layer = child.userData['layer'];

                if (maxPain > 0) {
                    const intensity = maxPain / 10;
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setRGB(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.2 - intensity * 0.2, 0.2 - intensity * 0.2);
                    if (layer === 'bone') {
                        (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.7 - intensity * 0.5, 0.7 - intensity * 0.5);
                        child.scale.setScalar(1.0 + intensity * 0.15);
                        child.userData['painIntensity'] = intensity;
                    }
                    if (layer === 'organ') (material as THREE.MeshStandardMaterial).color.setRGB(0.95, 0.2, 0.4);
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = intensity;
                    }
                } else {
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setHex(0xbe123c);
                    if (layer === 'bone') {
                        (material as THREE.MeshStandardMaterial).color.setHex(0xf5f5f4);
                        child.scale.setScalar(1.0);
                        child.userData['painIntensity'] = 0;
                    }
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = 0.0;
                    }
                }

                if (isSelected) {
                    const philosophy = this.state.activePhilosophy();
                    const paradigmEmissive = philosophy === 'western' ? 0x0284c7 : (philosophy === 'eastern' ? 0x059669 : 0xd97706);
                    if (layer === 'skin') {
                        (material as THREE.MeshStandardMaterial).color.setHex(0x1C1C1C);
                        (material as THREE.MeshStandardMaterial).emissive.setHex(paradigmEmissive);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
                    } else if (layer !== 'molecular') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(paradigmEmissive);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
                    }
                } else {
                    const philosophy = this.state.activePhilosophy();
                    const paradigmEmissive = philosophy === 'western' ? 0x0284c7 : (philosophy === 'eastern' ? 0x059669 : 0xd97706);
                    if (layer === 'organ') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(paradigmEmissive);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25;
                    } else if (layer === 'bone' && maxPain > 0) {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0xff3333);
                    } else if (layer !== 'molecular') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
                    }
                }
            });
        });
    }

    private focusOnPart(id: string | null) {
        if (!id || !this.controls || !this.camera) return;
        const group = this.parts.get(id);
        if (!group) return;

        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Smoothly adjust OrbitControls target to anatomical center
        this.controls.target.copy(center);
        this.controls.update();
    }

    private updateTransparency(mode: AnatomyViewMode) {
        if (this.mannequinGroup) this.mannequinGroup.visible = true;
        if (this.molecularScienceGroup) this.molecularScienceGroup.visible = false;

        this.parts.forEach((group) => {
            const isSelected = this.state.selectedPartId() === group.userData['id'];
            group.children.forEach(child => {
                if (!(child instanceof THREE.Mesh)) return;
                const material = child.material as THREE.MeshStandardMaterial;
                const layer = child.userData['layer'];

                if (mode === 'skin') {
                    if (layer === 'skin') { material.opacity = isSelected ? 0.98 : 0.92; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'muscle') {
                    if (layer === 'skin') { material.opacity = 0.35; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.92; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'skeleton') {
                    if (layer === 'skin') { material.opacity = 0.25; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.0; material.depthWrite = false; }
                    else if (layer === 'bone') { material.opacity = 1.0; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'organs') {
                    if (layer === 'skin') { material.opacity = 0.40; material.depthWrite = false; }
                    else if (layer === 'organ') { material.opacity = 0.95; material.depthWrite = true; }
                    else if (layer === 'bone') { material.opacity = 0.20; material.depthWrite = false; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'molecular') {
                    if (layer === 'skin') { material.opacity = 0.10; material.depthWrite = false; }
                    else if (layer === 'molecular') { material.opacity = 0.85; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'eastern') {
                    if (layer === 'skin') { material.opacity = 0.65; material.depthWrite = true; }
                    else if (layer === 'acupoint' || layer === 'meridian') { material.opacity = 1.0; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'ayurvedic') {
                    if (layer === 'skin') { material.opacity = 0.65; material.depthWrite = true; }
                    else if (layer === 'chakra' || layer === 'aura') { material.opacity = 1.0; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
            });
        });

        // Update the neural field / brainwave entrainment globe (mindMesh)
        if (this.mannequinGroup) {
            const mindMesh = this.mannequinGroup.children.find(child => child.userData['isMindCore']);
            if (mindMesh && mindMesh instanceof THREE.Mesh) {
                const avsActive = this.state.isAvsSessionActive();
                const showGlobe = avsActive || mode === 'organs' || mode === 'molecular';
                
                mindMesh.visible = showGlobe;
                if (mindMesh.material instanceof THREE.MeshStandardMaterial) {
                    mindMesh.material.opacity = showGlobe ? (avsActive ? 0.25 : 0.08) : 0.0;
                    mindMesh.material.depthWrite = showGlobe;
                }
            }
        }

        // Update TCM Meridian & Ayurvedic Aura Visibilities based on Philosophy/View Mode
        if (this.tcmMeridianGroup) {
            const philosophy = this.state.activePhilosophy();
            const isEastern = philosophy === 'eastern' || mode === 'molecular';
            this.tcmMeridianGroup.visible = isEastern;
            this.tcmMeridianGroup.children.forEach(child => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.opacity = isEastern ? 0.85 : 0.0;
                }
            });
        }

        if (this.ayurvedicAuraGroup) {
            const philosophy = this.state.activePhilosophy();
            const isAyurvedic = philosophy === 'ayurvedic' || mode === 'organs';
            this.ayurvedicAuraGroup.visible = isAyurvedic;
        }
    }

    private startAnimation() {
        if (!isPlatformBrowser(this.platformId)) return;
        
        const animate = () => {
            if (!this.renderer || !this.scene || !this.camera) return;
            this.animationFrameId = requestAnimationFrame(animate);

            if (this.controls) this.controls.update();
            
            if (this.molecularScienceGroup && this.molecularScienceGroup.visible) {
                this.molecularScienceGroup.rotation.y += 0.012;
            }

            this.timer.update();
            const time = this.timer.getElapsed();
            const motionFreeze = this.isReducedMotion();
            
            // Idle & Biometric AVS breathing and mind wave entrainment animations
            if (this.mannequinGroup && !motionFreeze) {
                const avsActive = this.state.isAvsSessionActive();
                
                // 1. Respiratory & Organ Coherence Entrainment
                const chestPart = this.parts.get('chest');
                if (chestPart) {
                    if (avsActive) {
                        const pacingFrequency = (this.state.avsBreathingRate() / 60) * 2 * Math.PI;
                        chestPart.scale.set(
                            1 + Math.sin(time * pacingFrequency) * 0.035, 
                            1 + Math.sin(time * pacingFrequency) * 0.015, 
                            1 + Math.sin(time * pacingFrequency) * 0.045
                        );
                    } else {
                        chestPart.scale.set(
                            1 + Math.sin(time * 2) * 0.02, 
                            1 + Math.sin(time * 2) * 0.01, 
                            1 + Math.sin(time * 2) * 0.03
                        );
                    }
                }

                // SIGGRAPH-grade Real-Time Cardiac Double-Bump & Pulmonary Respiration (Synced to patient vitals)
                const heartPart = this.parts.get('heart');
                if (heartPart) {
                    const rawHr = this.state.vitals()?.hr;
                    const hrVal = rawHr ? (parseInt(String(rawHr), 10) || 72) : 72;
                    const bps = (hrVal / 60.0);
                    const cardiacCycle = (time * bps * 2 * Math.PI) % (2 * Math.PI);
                    const heartDoubleBump = Math.pow(Math.sin(cardiacCycle), 8) * 0.12 + Math.pow(Math.sin(cardiacCycle * 2 + 0.5), 12) * 0.06;
                    heartPart.scale.set(1 + heartDoubleBump, (1 + heartDoubleBump) * 1.1, 1 + heartDoubleBump);
                    heartPart.children.forEach(c => {
                        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                            c.material.emissiveIntensity = 0.3 + heartDoubleBump * 1.5;
                        }
                    });
                }

                const lungPart = this.parts.get('lungs');
                if (lungPart) {
                    const breathCycle = Math.sin(time * 1.2) * 0.05;
                    lungPart.scale.set(1 + breathCycle, 1 + breathCycle * 1.5, 1 + breathCycle);
                }

                // 1. Brain Neural Oscillations
                const brainPart = this.parts.get('brain');
                if (brainPart) {
                    const neuralGlow = 0.25 + Math.sin(time * 5) * 0.15 + Math.sin(time * 12) * 0.05;
                    brainPart.children.forEach(c => {
                        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                            c.material.emissiveIntensity = neuralGlow;
                        }
                    });
                }
                
                // 2. Gentle floating animation
                this.mannequinGroup.position.y = Math.sin(time * 1.5) * 0.02;
                if (this.customModelGroup) {
                    this.customModelGroup.position.y = Math.sin(time * 1.5) * 0.02;
                }
                
                // 3. Update Shader Uniforms for Heatmaps
                this.parts.forEach((group) => {
                    group.children.forEach(child => {
                        if (child instanceof THREE.Mesh && child.userData['layer'] === 'molecular') {
                            if (child.material instanceof THREE.ShaderMaterial) {
                                child.material.uniforms['uTime'].value = time;
                            }
                        }
                    });
                });
                
                // 4. Update pulsing for inflamed bones
                this.parts.forEach((group) => {
                    group.children.forEach(child => {
                        if (child instanceof THREE.Mesh && child.userData['layer'] === 'bone') {
                            const pain = child.userData['painIntensity'] || 0;
                            if (pain > 0) {
                                // Subtle throbbing for acute inflammation
                                const pulse = Math.sin(time * 4) * 0.5 + 0.5;
                                if (child.material instanceof THREE.MeshStandardMaterial) {
                                    child.material.emissiveIntensity = pain * 0.5 * pulse;
                                }
                            }
                        }
                    });
                });
                
                // 5. Mind Core & Neural Pathway Entrainment
                this.mannequinGroup.children.forEach(child => {
                    if (child.userData['isMindCore']) {
                        child.rotation.y += 0.01;
                        child.rotation.x += 0.005;
                        
                        if (avsActive) {
                            const wave = this.state.avsBrainwaveFrequency();
                            let waveFreq = 6.0; // default theta
                            if (wave === 'delta') waveFreq = 2.5;
                            else if (wave === 'theta') waveFreq = 6.0;
                            else if (wave === 'alpha') waveFreq = 10.0;
                            else if (wave === 'beta') waveFreq = 18.0;
                            
                            const wavePulsation = Math.sin(time * waveFreq * 2 * Math.PI);
                            child.scale.set(1 + wavePulsation * 0.06, 1 + wavePulsation * 0.06, 1 + wavePulsation * 0.06);
                            
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                child.material.emissiveIntensity = 0.3 + wavePulsation * 0.2;
                            }
                        } else {
                            child.scale.set(1, 1, 1);
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                child.material.emissiveIntensity = 0.2;
                            }
                        }
                    }
                });

                // 6. 3D TCM Meridian Pulse & Ayurvedic Aura Particle Animations
                if (this.tcmMeridianGroup && this.tcmMeridianGroup.visible) {
                    const meridianPulse = 0.4 + Math.sin(time * 4) * 0.3;
                    this.tcmMeridianGroup.children.forEach(child => {
                        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                            child.material.emissiveIntensity = meridianPulse;
                        }
                    });
                }

                if (this.ayurvedicAuraGroup && this.ayurvedicAuraGroup.visible) {
                    this.ayurvedicAuraGroup.rotation.y += 0.005;
                    this.ayurvedicAuraGroup.children.forEach(child => {
                        if (child instanceof THREE.Points) {
                            child.rotation.y -= 0.003;
                        }
                        if (child instanceof THREE.Mesh && child.userData['layer'] === 'chakra') {
                            const timeShift = Number(child.userData['id']?.charCodeAt(7) || 0);
                            const auraPulse = 0.5 + Math.sin(time * 3 + timeShift) * 0.4;
                            child.material.opacity = auraPulse;
                        }
                    });
                }

                // 7. Arboreal Tree & Automotive Chassis Model Animation Cycles
                if (this.arborealTreeGroup && this.arborealTreeGroup.visible) {
                    this.arborealTreeGroup.position.y = Math.sin(time * 1.5) * 0.02;
                    this.arborealTreeGroup.children.forEach(child => {
                        if (child.userData['isSapCore'] && child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                            child.material.emissiveIntensity = 0.5 + Math.sin(time * 6) * 0.4;
                        }
                        if (child.userData['isLeafNode'] && child instanceof THREE.Mesh) {
                            child.rotation.y += 0.01;
                        }
                    });
                }

                if (this.automotiveChassisGroup && this.automotiveChassisGroup.visible) {
                    this.automotiveChassisGroup.position.y = Math.sin(time * 1.5) * 0.02;
                    this.automotiveChassisGroup.children.forEach(child => {
                        if (child.userData['isEngineBlock'] && child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                            const engineRpmPulse = 1 + Math.sin(time * 12) * 0.04;
                            child.scale.set(engineRpmPulse, engineRpmPulse, engineRpmPulse);
                            child.material.emissiveIntensity = 0.3 + Math.sin(time * 12) * 0.2;
                        }
                    });
                }

                // 8. Ambient Aura / Bloom entrainment
                if (this.bloomPass) {
                    if (avsActive) {
                        const pacingFrequency = (this.state.avsBreathingRate() / 60) * 2 * Math.PI;
                        this.bloomPass.strength = 0.4 + Math.sin(time * pacingFrequency) * 0.15;
                    } else {
                        const mode = this.anatomyViewMode();
                        this.bloomPass.strength = (mode === 'organs' || mode === 'molecular') ? 0.3 : 0.15;
                    }
                }
            }

            // High-speed interpolation for Patient 3D Slide-to-Right Transition
            if (this.isSlidingPatient) {
                if (this.mannequinGroup) {
                    this.mannequinGroup.position.x += (0 - this.mannequinGroup.position.x) * 0.22;
                    if (Math.abs(this.mannequinGroup.position.x) < 0.01) {
                        this.mannequinGroup.position.x = 0;
                        this.isSlidingPatient = false;
                    }
                }
                if (this.customModelGroup) {
                    this.customModelGroup.position.x += (0 - this.customModelGroup.position.x) * 0.22;
                }
            }

            // Sync external rotation or 360 Auto-Spinning Sentinel Orbit
            if (this.isAutoSpinning()) {
                if (this.mannequinGroup) this.mannequinGroup.rotation.y += 0.008;
                if (this.customModelGroup) this.customModelGroup.rotation.y += 0.008;
            } else {
                if (this.mannequinGroup) {
                    this.mannequinGroup.rotation.y = this.rotation();
                }
                if (this.customModelGroup) {
                    this.customModelGroup.rotation.y = this.rotation();
                }
            }

            if (this.composer) {
                this.composer.render();
            } else if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }
}
