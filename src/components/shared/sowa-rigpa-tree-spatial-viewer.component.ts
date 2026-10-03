import { Component, signal, computed, inject, ChangeDetectionStrategy, ElementRef, viewChild, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../../services/patient-state.service';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';

export interface ISowaRigpaNode {
  id: string;
  name: string;
  tibetanName: string;
  humor: 'rlung' | 'mkhrispa' | 'badkan' | 'trihumoral' | 'neutral';
  category: 'root' | 'trunk' | 'branch' | 'leaf';
  treeType: 'physiology' | 'diagnosis' | 'therapeutics';
  x: number; // 0 to 100 on canvas
  y: number; // 0 to 100 on canvas
  depthZ: number; // 3D depth layer -50 to 50
  allopathicCorrelate: string;
  ictmChapter26Code: string;
  clinicalDescription: string;
  activePatientCorrelation?: string;
  recommendedInterventions?: string[];
}

@Component({
  selector: 'app-sowa-rigpa-tree-spatial-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/90 backdrop-blur-xl border border-teal-500/30 rounded-2xl shadow-2xl text-zinc-100 font-sans relative overflow-hidden">
      <!-- Ambient Background Glow -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800 relative z-10">
        <div class="space-y-1">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🌲</span>
            <h2 class="text-lg font-bold tracking-wide bg-gradient-to-r from-teal-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
              Sowa-Rigpa: The 3 Living Trees & 3D Spatial Diagnostic Map
            </h2>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              gSo-ba Rig-pa • Four Tantras (Gyushi)
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-mono">
            Himalayan Medical Mandala: 3 Root Systems • 9 Trunks • 47 Branches • 224+ Diagnostic & Therapeutic Leaves
          </p>
        </div>

        <!-- 3D Perspective Controls & View Switcher -->
        <div class="flex items-center gap-2">
          <!-- Tree Selector -->
          <div class="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              (click)="selectedTree.set('physiology')"
              [ngClass]="selectedTree() === 'physiology' ? 'bg-teal-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <span>🌱</span> Tree I: Physiology
            </button>
            <button
              (click)="selectedTree.set('diagnosis')"
              [ngClass]="selectedTree() === 'diagnosis' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <span>👁️</span> Tree II: Diagnosis
            </button>
            <button
              (click)="selectedTree.set('therapeutics')"
              [ngClass]="selectedTree() === 'therapeutics' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <span>💊</span> Tree III: Therapeutics
            </button>
          </div>

          <!-- 3D Spatial Tilt Toggle -->
          <button
            (click)="is3dPerspective.set(!is3dPerspective())"
            [ngClass]="is3dPerspective() ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'"
            class="px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle 3D Holographic Parallax Tilt"
          >
            <span>🧊</span> {{ is3dPerspective() ? '3D Hologram [ON]' : '2D Schematic' }}
          </button>
        </div>
      </div>

      <!-- Main Interactive Viewport: 3D Spatial Canvas + Side Inspection HUD -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
        
        <!-- Left: 3D Botanical Mandala Tree Canvas (8 Cols) -->
        <div class="lg:col-span-8 flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 relative overflow-hidden min-h-[520px]">
          
          <!-- 3D Perspective Container with CSS 3D Transform -->
          <div 
            class="w-full h-full min-h-[480px] relative transition-transform duration-700 ease-out flex items-center justify-center"
            [style.perspective]="is3dPerspective() ? '1000px' : 'none'"
          >
            <div 
              class="w-full h-full max-w-[620px] max-h-[480px] relative transition-all duration-700 ease-out"
              [style.transform]="is3dPerspective() ? 'rotateX(' + tiltX() + 'deg) rotateY(' + tiltY() + 'deg) scale3d(0.95, 0.95, 0.95)' : 'none'"
              (mousemove)="onCanvasMouseMove($event)"
              (mouseleave)="onCanvasMouseLeave()"
            >
              <!-- SVG Procedural Tree Trunk & Branches -->
              <svg viewBox="0 0 100 100" class="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                <defs>
                  <!-- Root Gradient -->
                  <linearGradient id="rootGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#3f3f46" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.8" />
                  </linearGradient>
                  <!-- Branch Glow -->
                  <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.8" />
                    <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.8" />
                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8" />
                  </linearGradient>
                </defs>

                <!-- Roots (Grounding) -->
                <path d="M 50 95 C 45 88, 30 92, 20 98 M 50 95 C 55 88, 70 92, 80 98 M 50 95 L 50 82" stroke="url(#rootGrad)" stroke-width="3.5" stroke-linecap="round" fill="none" />
                
                <!-- Main Central Trunk -->
                <path d="M 50 82 C 49 70, 51 55, 50 40" stroke="#71717a" stroke-width="3" stroke-linecap="round" fill="none" />
                
                <!-- Left Primary Branch (rLung / Wind) -->
                <path d="M 50 65 C 38 60, 25 50, 18 35" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85" />
                <path d="M 32 52 C 24 45, 16 46, 12 30" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />

                <!-- Center Primary Branch (mKhris-pa / Bile) -->
                <path d="M 50 50 C 50 40, 50 30, 50 18" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85" />
                <path d="M 50 32 C 44 26, 42 20, 38 12" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />
                <path d="M 50 32 C 56 26, 58 20, 62 12" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />

                <!-- Right Primary Branch (Bad-kan / Phlegm) -->
                <path d="M 50 65 C 62 60, 75 50, 82 35" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85" />
                <path d="M 68 52 C 76 45, 84 46, 88 30" stroke="#e2e8f0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />
              </svg>

              <!-- Interactive 3D Tree Nodes / Leaves -->
              @for (node of activeTreeNodes(); track node.id) {
                <div
                  (click)="selectedNode.set(node)"
                  [style.left.%]="node.x"
                  [style.top.%]="node.y"
                  [style.transform]="'translate(-50%, -50%) translateZ(' + (is3dPerspective() ? node.depthZ : 0) + 'px)'"
                  [ngClass]="getNodeClasses(node)"
                  class="absolute cursor-pointer transition-all duration-300 hover:scale-125 z-20 group"
                  [attr.aria-label]="node.name"
                >
                  <!-- Pulsing Node Circle -->
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border relative">
                    <span class="relative z-10">{{ getNodeEmoji(node) }}</span>
                    @if (selectedNode()?.id === node.id) {
                      <span class="absolute inset-0 rounded-full animate-ping opacity-75 bg-teal-400"></span>
                    }
                  </div>

                  <!-- Mini Tooltip on Hover -->
                  <div class="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900/95 border border-zinc-700 text-[10px] font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
                    <span class="font-bold text-zinc-200">{{ node.name }}</span>
                    <span class="text-zinc-400 text-[9px] block">({{ node.tibetanName }})</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Legend: 3 Humors (Nyepa Sum) -->
          <div class="w-full flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto border-t border-zinc-800/80 text-xs font-mono">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
                <span class="text-sky-300 font-bold">rLung (Wind/Prana)</span>
                <span class="text-[10px] text-zinc-500">• Vagus / Neuro</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
                <span class="text-amber-300 font-bold">mKhris-pa (Bile/Agni)</span>
                <span class="text-[10px] text-zinc-500">• Metabolic / Hepatic</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-slate-200 shadow-[0_0_8px_#e2e8f0]"></span>
                <span class="text-slate-200 font-bold">Bad-kan (Phlegm/Kapha)</span>
                <span class="text-[10px] text-zinc-500">• Lymph / Structure</span>
              </div>
            </div>

            <div class="text-[11px] text-zinc-400">
              Selected: <strong class="text-teal-300">{{ selectedNode()?.name || 'Click a node to inspect' }}</strong>
            </div>
          </div>
        </div>

        <!-- Right: Diagnostic & Therapeutic Leaf Telemetry Inspector (4 Cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          
          @if (selectedNode(); as node) {
            <!-- Selected Node Detailed Card -->
            <div class="p-4 rounded-xl bg-zinc-900/90 border border-teal-500/30 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                    {{ node.category }} • {{ node.treeType | uppercase }}
                  </div>
                  <h3 class="text-base font-bold text-zinc-100 mt-0.5">{{ node.name }}</h3>
                  <div class="text-xs font-mono text-amber-300 italic">{{ node.tibetanName }}</div>
                </div>
                <span [ngClass]="getHumorBadgeClass(node.humor)" class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border">
                  {{ node.humor | uppercase }}
                </span>
              </div>

              <p class="text-xs text-zinc-300 leading-relaxed">
                {{ node.clinicalDescription }}
              </p>

              <!-- Allopathic & ICD-11 ICTM Crosswalk -->
              <div class="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div class="flex items-center justify-between">
                  <span class="text-zinc-400">ICD-11 ICTM Code:</span>
                  <span class="text-teal-300 font-bold">{{ node.ictmChapter26Code }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-zinc-400 shrink-0">Biomedical Correlate:</span>
                  <span class="text-sky-300 text-right font-medium">{{ node.allopathicCorrelate }}</span>
                </div>
              </div>

              <!-- Recommended Sowa-Rigpa Stepped Interventions -->
              @if (node.recommendedInterventions && node.recommendedInterventions.length > 0) {
                <div class="space-y-1.5 pt-2 border-t border-zinc-800">
                  <div class="text-[10px] font-mono font-bold text-amber-400 uppercase">Stepped Care Interventions:</div>
                  <ul class="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                    @for (intervention of node.recommendedInterventions; track intervention) {
                      <li class="leading-tight">{{ intervention }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          } @else {
            <!-- Empty State / Guide -->
            <div class="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center text-center text-zinc-400 space-y-3">
              <span class="text-3xl">🧭</span>
              <div class="text-xs font-bold text-zinc-200">Interactive Mandala Navigation</div>
              <p class="text-[11px] leading-relaxed">
                Rotate the 3D canvas or click any branch node (Roots, Vessels, Pulse points, Therapeutics) to reveal the biophysical crosswalk and ICD-11 ICTM coding.
              </p>
            </div>
          }

          <!-- Real-Time Sowa-Rigpa 3D Humoral Pulse Waveform Shader HUD (Gyushi Four Tantras Spec) -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-teal-500/30 space-y-3 text-xs">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div class="flex items-center gap-2 font-bold font-mono text-zinc-200">
                <span class="text-base">🫀</span>
                <span>Sowa-Rigpa 3D Humoral Pulse Waveform Engine</span>
              </div>
              <div class="flex items-center gap-1.5 font-mono text-[10px] text-teal-300">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>HRV Synced: {{ heartRate() }} bpm • {{ hrv() }} ms</span>
              </div>
            </div>

            <!-- Humor Mode Filter Tabs -->
            <div class="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] font-mono">
              <button
                type="button"
                (click)="activeHumorPulse.set('all')"
                [class.bg-teal-600]="activeHumorPulse() === 'all'"
                [class.text-white]="activeHumorPulse() === 'all'"
                [class.text-zinc-400]="activeHumorPulse() !== 'all'"
                class="px-2 py-1 rounded transition cursor-pointer font-bold"
              >
                🌊 Trihumoral
              </button>
              <button
                type="button"
                (click)="activeHumorPulse.set('rlung')"
                [class.bg-sky-600]="activeHumorPulse() === 'rlung'"
                [class.text-white]="activeHumorPulse() === 'rlung'"
                [class.text-zinc-400]="activeHumorPulse() !== 'rlung'"
                class="px-2 py-1 rounded transition cursor-pointer font-bold"
              >
                💨 rLung (Wind)
              </button>
              <button
                type="button"
                (click)="activeHumorPulse.set('mkhrispa')"
                [class.bg-amber-600]="activeHumorPulse() === 'mkhrispa'"
                [class.text-white]="activeHumorPulse() === 'mkhrispa'"
                [class.text-zinc-400]="activeHumorPulse() !== 'mkhrispa'"
                class="px-2 py-1 rounded transition cursor-pointer font-bold"
              >
                🔥 mKhris-pa (Bile)
              </button>
              <button
                type="button"
                (click)="activeHumorPulse.set('badkan')"
                [class.bg-slate-600]="activeHumorPulse() === 'badkan'"
                [class.text-white]="activeHumorPulse() === 'badkan'"
                [class.text-zinc-400]="activeHumorPulse() !== 'badkan'"
                class="px-2 py-1 rounded transition cursor-pointer font-bold"
              >
                💧 Bad-kan (Phlegm)
              </button>
            </div>

            <!-- Waveform Canvas Display -->
            <div class="relative w-full h-28 rounded-xl bg-zinc-950 border border-teal-500/30 overflow-hidden shadow-inner flex items-center justify-center">
              <canvas #pulseShaderCanvas width="400" height="112" class="w-full h-full block"></canvas>
              
              <!-- Telemetry Grid Overlay Labels -->
              <div class="absolute top-1 left-2 pointer-events-none text-[9px] font-mono text-zinc-500 flex gap-4">
                <span>V_arterial: {{ (1.2 + (heartRate() / 100)).toFixed(2) }} m/s</span>
                <span>Modulation: {{ (hrv() / 60).toFixed(2) }}</span>
                <span>Dicrotic Notch: {{ (0.35 + (hrv() * 0.005)).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Classical Gyushi Tactile Descriptor -->
            <div class="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10.5px] font-mono space-y-1">
              <div class="text-teal-400 font-bold flex items-center justify-between">
                <span>Tactile Radial Descriptor (Gyushi Spec):</span>
                <span class="text-[9px] text-zinc-500 font-normal">Gyushi Four Tantras</span>
              </div>
              <p class="text-zinc-300 italic leading-snug">
                "{{ currentPulseDescriptor() }}"
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div class="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                <span class="text-sky-400 font-bold block">Left Wrist Radial:</span>
                <span class="text-zinc-400">Heart (Index), Spleen (Middle), Kidney (Ring)</span>
              </div>
              <div class="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                <span class="text-amber-400 font-bold block">Right Wrist Radial:</span>
                <span class="text-zinc-400">Lungs (Index), Liver (Middle), Kidney (Ring)</span>
              </div>
            </div>

            <div class="p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[10px] font-mono">
              <span class="text-teal-300 font-bold">Urine Diagnosis (Dri-chu):</span>
              <span class="text-zinc-400 block mt-0.5">Stage 1: Vapor/Color • Stage 2: Bubble Dynamics • Stage 3: Sediment</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SowaRigpaTreeSpatialViewerComponent implements AfterViewInit, OnDestroy {
  readonly patientState = inject(PatientStateService);
  readonly paradigms = inject(GlobalHealingParadigmsService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly selectedTree = signal<'physiology' | 'diagnosis' | 'therapeutics'>('physiology');
  readonly is3dPerspective = signal<boolean>(true);
  readonly tiltX = signal<number>(12);
  readonly tiltY = signal<number>(-8);
  readonly selectedNode = signal<ISowaRigpaNode | null>(null);

  readonly pulseShaderCanvas = viewChild<ElementRef<HTMLCanvasElement>>('pulseShaderCanvas');
  readonly activeHumorPulse = signal<'all' | 'rlung' | 'mkhrispa' | 'badkan'>('all');
  private animFrameId: number | null = null;
  private animTime = 0;

  readonly heartRate = computed(() => {
    const v = this.patientState.vitals();
    return v?.heartRate || 72;
  });

  readonly hrv = computed(() => {
    const v = this.patientState.vitals();
    return v?.hrv || 45;
  });

  readonly currentPulseDescriptor = computed(() => {
    const humor = this.activeHumorPulse();
    switch (humor) {
      case 'rlung':
        return 'Floating, rapid, hollow like a dry feather swept along water — indicating Wind agitation and sympathetic autonomic elevation.';
      case 'mkhrispa':
        return 'Overflowing, rapid, taut like a tight bowstring — reflecting metabolic heat, hepatic drive, and bile pressure.';
      case 'badkan':
        return 'Sunken, sluggish, soft and broad like a wave under ice — denoting phlegmatic viscosity, lymphatic congestion, and cold stagnation.';
      case 'all':
      default:
        return 'Harmonic trihumoral radial confluence: rLung tremolo superficial, mKhris-pa intermediate tension, and Bad-kan basal glide.';
    }
  });

  /** Curated Sowa-Rigpa Medical Tree Nodes across Physiology, Diagnosis & Therapeutics */
  readonly allTreeNodes = signal<ISowaRigpaNode[]>([
    // === TREE I: PHYSIOLOGY & PATHOLOGY ===
    {
      id: 'phys_root_health',
      name: 'Root of Healthy Physiology',
      tibetanName: 'Lus kyi rTsa-ba',
      humor: 'trihumoral',
      category: 'root',
      treeType: 'physiology',
      x: 50,
      y: 86,
      depthZ: -20,
      allopathicCorrelate: 'Homeostatic Physiological Equilibrum (Autonomic & Endocrine Balance)',
      ictmChapter26Code: 'TM1-PHY-01',
      clinicalDescription: 'The foundational root of health comprising the balanced coordination of 3 Humors (Nyepa Sum), 7 Bodily Constituents (Lus-zungs bdun), and 3 Excretions (Dri-ma gsum).',
      recommendedInterventions: ['Balanced diurnal rhythm', 'Wholesome four-season nutrition']
    },
    {
      id: 'phys_rlung_trunk',
      name: 'rLung (Wind / Vagus / Neural Axis)',
      tibetanName: 'Srog-dzin rLung',
      humor: 'rlung',
      category: 'trunk',
      treeType: 'physiology',
      x: 24,
      y: 54,
      depthZ: 15,
      allopathicCorrelate: 'Central & Autonomic Nervous System, Vagal Parasympathetic Tone, Neurotransmission',
      ictmChapter26Code: 'TM1-RLU-01',
      clinicalDescription: 'Governs respiration, cardiac pulsation, sensory perception, and motor coordination. Exacerbated by excessive intellectual strain, sorrow, and erratic fasting.',
      recommendedInterventions: ['Nutmeg (Dza-ti) warm broth', 'Gentle Sesame oil Ku-Nye massage', 'Slowing respiration rate']
    },
    {
      id: 'phys_mkhrispa_trunk',
      name: 'mKhris-pa (Bile / Thermogenesis)',
      tibetanName: "'Khris-pa Me-mnyam",
      humor: 'mkhrispa',
      category: 'trunk',
      treeType: 'physiology',
      x: 50,
      y: 38,
      depthZ: 25,
      allopathicCorrelate: 'Hepatic-Biliary Metabolism, Mitochondrial Thermogenesis, Gastric Acid Secretion',
      ictmChapter26Code: 'TM1-MKH-01',
      clinicalDescription: 'Governs metabolic digestion, bodily heat, liver detoxification, visual acuity, and courage. Exacerbated by pungent, oily, hot foods and acute anger.',
      recommendedInterventions: ['Saffron (Gurgum) cooling teas', 'Swertia chirayita bitters', 'Shaded restorative pacing']
    },
    {
      id: 'phys_badkan_trunk',
      name: 'Bad-kan (Phlegm / Fluid Immunity)',
      tibetanName: 'Rten-byed Bad-kan',
      humor: 'badkan',
      category: 'trunk',
      treeType: 'physiology',
      x: 76,
      y: 54,
      depthZ: 15,
      allopathicCorrelate: 'Lymphatic Drainage, Synovial Joint Fluid, Mucosal Immunity & Connective Tissue',
      ictmChapter26Code: 'TM1-BAD-01',
      clinicalDescription: 'Provides structural stability, joint lubrication, mucosal barrier protection, and psychological equanimity. Exacerbated by heavy, sweet, chilled foods and prolonged lethargy.',
      recommendedInterventions: ['Pomegranate & ginger decoction', 'Active aerobic heat generation', 'Warm dry climate exposure']
    },
    {
      id: 'phys_seven_dhatus',
      name: '7 Bodily Constituents (Lus-zungs bdun)',
      tibetanName: 'Dangs-ma la sogs Lus-zungs',
      humor: 'trihumoral',
      category: 'leaf',
      treeType: 'physiology',
      x: 14,
      y: 32,
      depthZ: 30,
      allopathicCorrelate: 'Chyme (Nutrient Plasma), Blood (RBCs), Muscle Tissue, Adipose Lipids, Bone Matrix, Marrow/Neuroglia, Regenerative Essence',
      ictmChapter26Code: 'TM1-DHT-07',
      clinicalDescription: 'The seven progressive metabolic substrates: Chyme (Dangs-ma) transforms into Blood, Muscle, Fat, Bone, Marrow, and Ojas/Essence (Khu-ba).',
      recommendedInterventions: ['Nutrient-dense bone broths', 'Bioavailable zinc & iron intake']
    },
    {
      id: 'phys_entry_doors',
      name: 'Etiological Entry Doors & Senses',
      tibetanName: 'sGo drug Dang dBang-po',
      humor: 'neutral',
      category: 'leaf',
      treeType: 'physiology',
      x: 86,
      y: 32,
      depthZ: 30,
      allopathicCorrelate: 'Sensory Organ Perfusion, Skin Transdermal Barrier & Respiratory Epithelium',
      ictmChapter26Code: 'TM1-ETI-03',
      clinicalDescription: 'Pathology penetrates through skin pores, flesh, vessels, bones, and solid/hollow viscera depending on environmental triggers.',
      recommendedInterventions: ['Skin barrier emollient protection', 'Nasal saline rinse']
    },

    // === TREE II: DIAGNOSIS ===
    {
      id: 'diag_root',
      name: 'Root of Diagnosis',
      tibetanName: 'bTag-pa rTsa-ba',
      humor: 'neutral',
      category: 'root',
      treeType: 'diagnosis',
      x: 50,
      y: 86,
      depthZ: -20,
      allopathicCorrelate: 'Multi-Modal Clinical Triage & Tri-Focal Diagnostic Assessment',
      ictmChapter26Code: 'TM1-DIA-00',
      clinicalDescription: 'The comprehensive diagnostic tripod: Visual Inspection (Tongue & Urine), Palpation (Radial Pulse Reading), and Clinical Socratic Interrogation.',
      recommendedInterventions: ['Fastidious pre-dawn urine collection', 'Quiet morning pulse reading']
    },
    {
      id: 'diag_visual_urine',
      name: 'Urine & Tongue Inspection (lTa-ba)',
      tibetanName: 'Dri-chu dang lCe la bTag-pa',
      humor: 'mkhrispa',
      category: 'trunk',
      treeType: 'diagnosis',
      x: 24,
      y: 50,
      depthZ: 10,
      allopathicCorrelate: 'Urinalysis (Specific Gravity, Ketones, Urobilinogen) & Lingual Microvascular Inspection',
      ictmChapter26Code: 'TM1-DIA-01',
      clinicalDescription: 'Inspection of urine steam, color, odor, bubble dynamics, and sediment alongside tongue coat (thin blue = rLung, thick yellow = mKhris-pa, white greasy = Bad-kan).',
      recommendedInterventions: ['Hydration calibration', 'Avoiding coloring foods prior to exam']
    },
    {
      id: 'diag_palpation_pulse',
      name: '12-Vector Radial Pulse (Reg-pa)',
      tibetanName: 'rTsa la bTag-pa',
      humor: 'rlung',
      category: 'trunk',
      treeType: 'diagnosis',
      x: 50,
      y: 34,
      depthZ: 25,
      allopathicCorrelate: 'Hemodynamic Arterial Waveform Analysis & Autonomic Pulse Wave Velocity (PWV)',
      ictmChapter26Code: 'TM1-DIA-02',
      clinicalDescription: 'Reading the 6 pressure points on both radial arteries to interrogate the functional resonance of all 12 major visceral organs.',
      recommendedInterventions: ['Morning calm pulse check', 'Digital photoplethysmography (PPG) correlation']
    },
    {
      id: 'diag_inquiry_socratic',
      name: 'Interrogation & History (sDri-ba)',
      tibetanName: 'Dri-ba la bTag-pa',
      humor: 'badkan',
      category: 'trunk',
      treeType: 'diagnosis',
      x: 76,
      y: 50,
      depthZ: 10,
      allopathicCorrelate: 'Comprehensive Clinical History, Dietary Recall, Chronobiological & Exposomics Review',
      ictmChapter26Code: 'TM1-DIA-03',
      clinicalDescription: 'Inquiring into emotional stressors, sleep onset latency, dietary habits, work ergonomics, and weather sensitivity.',
      recommendedInterventions: ['Patient functional symptom timeline', 'Food-mood diary tracking']
    },

    // === TREE III: THERAPEUTICS ===
    {
      id: 'tx_root',
      name: 'Root of Therapeutics',
      tibetanName: 'gSo-ba rTsa-ba',
      humor: 'neutral',
      category: 'root',
      treeType: 'therapeutics',
      x: 50,
      y: 86,
      depthZ: -20,
      allopathicCorrelate: 'Stepped Integrative Therapeutics & Multi-Modal Rehabilitation Plan',
      ictmChapter26Code: 'TM1-TX-00',
      clinicalDescription: 'The four-trunk therapeutic tree: 1. Diet, 2. Lifestyle Conduct, 3. Pharmacology/Herbal Decoctions, and 4. External Interventions (Moxa/Ku-Nye).',
      recommendedInterventions: ['Graduated stepped-care implementation', 'Patient shared decision-making']
    },
    {
      id: 'tx_diet',
      name: 'Trunk I: Wholesome Diet (Zas)',
      tibetanName: 'Zas kyi gSo-ba',
      humor: 'badkan',
      category: 'trunk',
      treeType: 'therapeutics',
      x: 20,
      y: 48,
      depthZ: 10,
      allopathicCorrelate: 'Clinical Medical Nutrition Therapy & Metabolic Bio-energetics',
      ictmChapter26Code: 'TM1-TX-01',
      clinicalDescription: 'Calibrating thermal potency and taste: Warming foods for rLung/Bad-kan; cooling anti-inflammatory whole foods for mKhris-pa.',
      recommendedInterventions: ['Warm boiled water (Chong-khol)', 'Barley (Tsampa) whole grains', 'Pomegranate digestion elixir']
    },
    {
      id: 'tx_conduct',
      name: 'Trunk II: Lifestyle & Conduct (sPyod-lam)',
      tibetanName: 'sPyod-lam gSo-ba',
      humor: 'rlung',
      category: 'trunk',
      treeType: 'therapeutics',
      x: 40,
      y: 30,
      depthZ: 20,
      allopathicCorrelate: 'Sleep Hygiene, Autonomic Vagal Pacing, Somatic Movement & Stress Inoculation',
      ictmChapter26Code: 'TM1-TX-02',
      clinicalDescription: 'Harmonizing daily work, emotional equilibrium, physical movement, and seasonal adjustments to pacify mental rumination.',
      recommendedInterventions: ['Circadian sun exposure at dawn', 'Mindfulness breath regulation', 'Evening warm foot bath']
    },
    {
      id: 'tx_pharmacology',
      name: 'Trunk III: Herbal Formulations (sMan)',
      tibetanName: 'sMan gyi gSo-ba',
      humor: 'mkhrispa',
      category: 'trunk',
      treeType: 'therapeutics',
      x: 60,
      y: 30,
      depthZ: 20,
      allopathicCorrelate: 'Polyherbal Phytotherapy, Adaptogenic Botanicals & Bioactive Terpenoids',
      ictmChapter26Code: 'TM1-TX-03',
      clinicalDescription: 'Utilizing 6 tastes and 8 potencies in balanced compounds (e.g. Agar-35, Semde, Gurgum-13, Bimala) to target complex poly-pathologies.',
      recommendedInterventions: ['Agarwood (Aquilaria agallocha) calming blend', 'Terminalia chebula (Arura) master botanical']
    },
    {
      id: 'tx_external',
      name: 'Trunk IV: External Interventions (dPyad)',
      tibetanName: 'dPyad kyi gSo-ba',
      humor: 'trihumoral',
      category: 'trunk',
      treeType: 'therapeutics',
      x: 80,
      y: 48,
      depthZ: 10,
      allopathicCorrelate: 'Physical Medicine, Thermal Therapy, Neuromuscular Myofascial Release & Moxibustion',
      ictmChapter26Code: 'TM1-TX-04',
      clinicalDescription: 'Moxibustion (Metsa) over specific acupoints, Ku-Nye medicinal oil massage, herbal steam baths (Lum), and warm compress applications.',
      recommendedInterventions: ['Moxa at Srog-rtsa (C7/T1 point)', 'Sesame oil gentle cranial Ku-Nye', 'Medicinal herbal steam soak']
    }
  ]);

  /** Active nodes filtered by selected Tree */
  readonly activeTreeNodes = computed(() => {
    const tree = this.selectedTree();
    return this.allTreeNodes().filter(n => n.treeType === tree);
  });

  onCanvasMouseMove(e: MouseEvent): void {
    if (!this.is3dPerspective()) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    this.tiltX.set(-y * 0.08 + 10);
    this.tiltY.set(x * 0.08);
  }

  onCanvasMouseLeave(): void {
    this.tiltX.set(12);
    this.tiltY.set(-8);
  }

  getNodeClasses(node: ISowaRigpaNode): string {
    const isSelected = this.selectedNode()?.id === node.id;
    let base = isSelected ? 'ring-2 ring-teal-400 scale-115 ' : '';

    if (node.humor === 'rlung') {
      return base + 'bg-sky-950 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]';
    } else if (node.humor === 'mkhrispa') {
      return base + 'bg-amber-950 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]';
    } else if (node.humor === 'badkan') {
      return base + 'bg-slate-900 border-slate-300 text-slate-100 shadow-[0_0_12px_rgba(226,232,240,0.5)]';
    } else {
      return base + 'bg-teal-950 border-teal-400 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.5)]';
    }
  }

  getNodeEmoji(node: ISowaRigpaNode): string {
    if (node.category === 'root') return '🌱';
    if (node.humor === 'rlung') return '💨';
    if (node.humor === 'mkhrispa') return '🔥';
    if (node.humor === 'badkan') return '💧';
    return '🌿';
  }

  getHumorBadgeClass(humor: string): string {
    if (humor === 'rlung') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (humor === 'mkhrispa') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (humor === 'badkan') return 'bg-slate-500/20 text-slate-200 border-slate-500/40';
    return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startPulseAnimation();
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  startPulseAnimation(): void {
    const loop = () => {
      this.drawPulseFrame();
      if (typeof requestAnimationFrame !== 'undefined') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(loop);
    }
  }

  drawPulseFrame(): void {
    const canvasRef = this.pulseShaderCanvas();
    if (!canvasRef || !canvasRef.nativeElement) return;
    const canvas = canvasRef.nativeElement;
    if (typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 400;
    const height = canvas.height || 112;

    this.animTime += 0.04;
    const time = this.animTime;
    const hr = this.heartRate();
    const hrv = this.hrv();
    const mode = this.activeHumorPulse();

    // Clear background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline center
    const midY = height / 2;
    const hrFreq = (hr / 60) * 2.5;
    const hrvMod = (hrv / 100);

    // Waveform simulation (Gyushi Four Tantras Spec)
    // 1. rLung (Wind): Cyan #38bdf8 - rapid fluttering ripples + high-frequency tremolo
    if (mode === 'all' || mode === 'rlung') {
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = mode === 'rlung' ? 2.5 : 1.5;
      for (let x = 0; x < width; x++) {
        const t = (x / 50) * hrFreq - time * 3;
        const flutter = Math.sin(t * 4.5) * (8 * (1 + hrvMod * 0.3));
        const wave = Math.sin(t) * 16 + flutter;
        const y = midY - wave * (mode === 'rlung' ? 1.4 : 0.8);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 2. mKhris-pa (Bile): Amber #fbbf24 - sharp high systolic spike, taut bowstring
    if (mode === 'all' || mode === 'mkhrispa') {
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = mode === 'mkhrispa' ? 2.5 : 1.5;
      for (let x = 0; x < width; x++) {
        const t = (x / 50) * hrFreq - time * 3;
        const rawSine = Math.sin(t);
        const peaked = Math.sign(rawSine) * Math.pow(Math.abs(rawSine), 0.6) * 28;
        const y = midY - peaked * (mode === 'mkhrispa' ? 1.3 : 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. Bad-kan (Phlegm): Slate #e2e8f0 - slow, rounded, heavy viscous wave
    if (mode === 'all' || mode === 'badkan') {
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = mode === 'badkan' ? 2.5 : 1.5;
      for (let x = 0; x < width; x++) {
        const t = (x / 75) * (hrFreq * 0.7) - time * 1.5;
        const smooth = Math.sin(t) * 22;
        const y = midY + 4 - smooth * (mode === 'badkan' ? 1.3 : 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

