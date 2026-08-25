import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

export type ParadigmLens = 'allopathic' | 'tcm' | 'ayurveda' | 'arborist' | 'mechanic' | 'unified';

export interface IAnatomicalTarget {
  id: string;
  name: string;
  coords: [number, number, number]; // [x, y, z] normalized
  allopathic: {
    system: string;
    nerveChain: string;
    snomedCode: string;
    loincCode: string;
    metric: string;
    metricValue: string;
  };
  tcm: {
    meridian: string;
    element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
    acupoint: string;
    organClockPeak: string;
    pattern: string;
  };
  ayurveda: {
    marmaPoint: string;
    chakra: string;
    solfeggioHz: number;
    dosha: 'Vata' | 'Pitta' | 'Kapha';
    element: string;
  };
  arborist: {
    treePart: string;
    sapDynamics: string;
    soilNutrient: string;
  };
  mechanic: {
    vehicleComponent: string;
    fluidPressure: string;
    dtcCode: string;
  };
}

@Component({
  selector: 'app-rosetta-stone-anatomy',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-8 p-6 sm:p-8 bg-zinc-950/75 dark:bg-zinc-950/75 backdrop-blur-xl text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden font-sans pocket-gull-card thematic-3d-container">
      
      <!-- Component Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>🗿</span>
              <span>Rosetta Stone Tri-Paradigm Spatial Anatomy</span>
            </h2>
            <span class="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-extrabold uppercase">
              3D Spatial Lens
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1.5 font-sans leading-relaxed">
            Target anatomical nodes to observe real-time cross-projection between Allopathic Neuroscience, TCM Wu Xing, and Ayurvedic Prana dynamics.
          </p>
        </div>

        <!-- Paradigm Lens Selector Controls -->
        <div class="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 shrink-0 font-mono">
          <button (click)="setLens('unified')"
            [class]="activeLens() === 'unified'
              ? 'px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md scale-[1.02] transition'
              : 'px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-bold hover:text-white hover:bg-zinc-800 transition'">
            ✨ Unified Lens
          </button>
          <button (click)="setLens('allopathic')"
            [class]="activeLens() === 'allopathic'
              ? 'px-3 py-1.5 rounded-xl bg-cyan-500 text-zinc-950 font-extrabold text-xs shadow-md transition'
              : 'px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-bold hover:text-cyan-300 hover:bg-zinc-800 transition'">
            🔵 Allopathic
          </button>
          <button (click)="setLens('tcm')"
            [class]="activeLens() === 'tcm'
              ? 'px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs shadow-md transition'
              : 'px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-bold hover:text-emerald-300 hover:bg-zinc-800 transition'">
            🟢 TCM
          </button>
          <button (click)="setLens('ayurveda')"
            [class]="activeLens() === 'ayurveda'
              ? 'px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs shadow-md transition'
              : 'px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-bold hover:text-amber-300 hover:bg-zinc-800 transition'">
            🟡 Ayurveda
          </button>
        </div>
      </div>

      <!-- Main Visual Workspace: Canvas + Interactive Target Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Canvas Spatial Visualization -->
        <div class="lg:col-span-7 relative bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 p-4 min-h-[380px] flex flex-col justify-between overflow-hidden">
          
          <!-- Background Grid & Shader Glow -->
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-zinc-950/80 to-zinc-950 pointer-events-none"></div>
          
          <!-- Target Target Nodes Bar -->
          <div class="relative z-10 flex flex-wrap gap-2 mb-3">
            @for (target of targets; track target.id) {
              <button (click)="selectTarget(target.id)"
                [class]="selectedTargetId() === target.id
                  ? 'px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-950 font-mono font-black text-xs border border-white shadow-lg transition scale-[1.02]'
                  : 'px-3 py-1.5 rounded-xl bg-zinc-900/90 text-zinc-400 font-mono font-bold text-xs border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition'">
                <span>📍 {{ target.name }}</span>
              </button>
            }
          </div>

          <!-- Interactive Hologram Canvas -->
          <div class="relative w-full h-[260px] flex items-center justify-center">
            <canvas #spatialCanvas class="w-full h-full rounded-xl cursor-crosshair"></canvas>
            
            <!-- Canvas Overlay Badge -->
            <div class="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Spatial Coords: [{{ activeTarget().coords.join(', ') }}]</span>
            </div>
          </div>

          <!-- Solfeggio & Frequency Entrainment Bar -->
          <div class="relative z-10 mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div class="flex items-center gap-2">
              <span>🎧 Solfeggio Carrier:</span>
              <strong class="text-amber-400 font-bold">{{ activeTarget().ayurveda.solfeggioHz }} Hz</strong>
            </div>
            <div class="flex items-center gap-2">
              <span>SNOMED Code:</span>
              <code class="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300">{{ activeTarget().allopathic.snomedCode }}</code>
            </div>
          </div>
        </div>

        <!-- Right Column: Tri-Paradigm Cross-Projection Detail Cards -->
        <div class="lg:col-span-5 flex flex-col gap-4 font-mono">
          
          <!-- 1. Allopathic Neuroscience Card -->
          @if (activeLens() === 'unified' || activeLens() === 'allopathic') {
            <div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 relative overflow-hidden transition-all hover:border-cyan-500/50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>🔵 Allopathic Neuroscience</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  {{ activeTarget().allopathic.system }}
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex justify-between border-b border-cyan-900/30 pb-1">
                  <span class="text-zinc-500">Nerve Pathway:</span>
                  <span class="font-bold text-cyan-200">{{ activeTarget().allopathic.nerveChain }}</span>
                </div>
                <div class="flex justify-between border-b border-cyan-900/30 pb-1">
                  <span class="text-zinc-500">Telemetry Metric:</span>
                  <span class="font-bold text-white">{{ activeTarget().allopathic.metric }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">LOINC Code:</span>
                  <code class="text-cyan-400">{{ activeTarget().allopathic.loincCode }}</code>
                </div>
              </div>
            </div>
          }

          <!-- 2. TCM Wu Xing Card -->
          @if (activeLens() === 'unified' || activeLens() === 'tcm') {
            <div class="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 relative overflow-hidden transition-all hover:border-emerald-500/50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>🟢 TCM Wu Xing Five Elements</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Element: {{ activeTarget().tcm.element }}
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex justify-between border-b border-emerald-900/30 pb-1">
                  <span class="text-zinc-500">Meridian Path:</span>
                  <span class="font-bold text-emerald-200">{{ activeTarget().tcm.meridian }}</span>
                </div>
                <div class="flex justify-between border-b border-emerald-900/30 pb-1">
                  <span class="text-zinc-500">Primary Acupoint:</span>
                  <span class="font-bold text-white">{{ activeTarget().tcm.acupoint }}</span>
                </div>
                <div class="flex justify-between border-b border-emerald-900/30 pb-1">
                  <span class="text-zinc-500">Zang-Fu Peak:</span>
                  <span class="text-emerald-300">{{ activeTarget().tcm.organClockPeak }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">Pattern Stagnation:</span>
                  <span class="text-amber-300 font-medium">{{ activeTarget().tcm.pattern }}</span>
                </div>
              </div>
            </div>
          }

          <!-- 3. Ayurvedic Prana / Tridosha Card -->
          @if (activeLens() === 'unified' || activeLens() === 'ayurveda') {
            <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 relative overflow-hidden transition-all hover:border-amber-500/50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>🟡 Ayurvedic Prana & Tridosha</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  Dosha: {{ activeTarget().ayurveda.dosha }}
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex justify-between border-b border-amber-900/30 pb-1">
                  <span class="text-zinc-500">Marma Point:</span>
                  <span class="font-bold text-amber-200">{{ activeTarget().ayurveda.marmaPoint }}</span>
                </div>
                <div class="flex justify-between border-b border-amber-900/30 pb-1">
                  <span class="text-zinc-500">Chakra Vortex:</span>
                  <span class="font-bold text-white">{{ activeTarget().ayurveda.chakra }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">Mahabhuta Element:</span>
                  <span class="text-amber-300">{{ activeTarget().ayurveda.element }}</span>
                </div>
              </div>
            </div>
          }

          <!-- 4. Arborist Botanical Tree Card -->
          @if (activeLens() === 'unified' || activeLens() === 'arborist') {
            <div class="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 relative overflow-hidden transition-all hover:border-emerald-400/60">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span>🌳 Arborist Botanical Analogy</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600/50 font-mono">
                  Tree System
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span class="text-zinc-500">Botanical Part:</span>
                  <span class="font-bold text-emerald-200">{{ activeTarget().arborist.treePart }}</span>
                </div>
                <div class="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span class="text-zinc-500">Xylem Sap Pressure:</span>
                  <span class="font-mono text-emerald-400 font-bold">{{ activeTarget().arborist.sapDynamics }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">Root Soil Nutrition:</span>
                  <span class="text-emerald-300">{{ activeTarget().arborist.soilNutrient }}</span>
                </div>
              </div>
            </div>
          }

          <!-- 5. Mechanic Automotive Chassis Card -->
          @if (activeLens() === 'unified' || activeLens() === 'mechanic') {
            <div class="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-700/50 relative overflow-hidden transition-all hover:border-cyan-400/60">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span>🚗 Mechanic Automotive Analogy</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-600/50 font-mono">
                  Vehicle Powertrain
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-zinc-300">
                <div class="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span class="text-zinc-500">Vehicle Component:</span>
                  <span class="font-bold text-cyan-200">{{ activeTarget().mechanic.vehicleComponent }}</span>
                </div>
                <div class="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span class="text-zinc-500">Hydraulic Pressure:</span>
                  <span class="font-mono text-cyan-400 font-bold">{{ activeTarget().mechanic.fluidPressure }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">OBD-II DTC Code:</span>
                  <span class="text-rose-400 font-mono font-bold">{{ activeTarget().mechanic.dtcCode }}</span>
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class RosettaStoneAnatomyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('spatialCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  activeLens = signal<ParadigmLens>('unified');
  selectedTargetId = signal<string>('liver');

  readonly targets: IAnatomicalTarget[] = [
    {
      id: 'liver',
      name: 'Liver & Gallbladder (Right Rib)',
      coords: [0.65, 0.45, 0.2],
      allopathic: {
        system: 'Autonomic & Hepatic Vascular',
        nerveChain: 'Splanchnic Nerves & Vagus Right Branch',
        snomedCode: '41829006',
        loincCode: '80404-7',
        metric: 'HRV Low Frequency Power',
        metricValue: '420 ms²'
      },
      tcm: {
        meridian: 'Foot Jueyin Liver Meridian',
        element: 'Wood',
        acupoint: 'LV-3 (Taichong)',
        organClockPeak: '1:00 AM – 3:00 AM',
        pattern: 'Liver Qi Stagnation with Rising Fire'
      },
      ayurveda: {
        marmaPoint: 'Yakrit Marma',
        chakra: 'Manipura (Solar Plexus)',
        solfeggioHz: 528,
        dosha: 'Pitta',
        element: 'Tejas (Fire) & Agni'
      },
      arborist: {
        treePart: 'Main Redwood Trunk Bough',
        sapDynamics: 'High Xylem Sap Pressure (140/90 hPa)',
        soilNutrient: 'Soil Mineralization & Nitrogen Absorption'
      },
      mechanic: {
        vehicleComponent: 'V8 Engine Hydraulic Line & Oil Pump',
        fluidPressure: '46 PSI (Elevated Oil Pressure)',
        dtcCode: 'DTC P0520 (Oil Pressure Circuit Fault)'
      }
    },
    {
      id: 'heart',
      name: 'Cardiac & Solar Center',
      coords: [0.5, 0.35, 0.1],
      allopathic: {
        system: 'Cardiovascular Autonomic',
        nerveChain: 'Cardiac Plexus & Left Vagus Node',
        snomedCode: '197480006',
        loincCode: '8867-4',
        metric: 'HRV RMSSD',
        metricValue: '28.4 ms'
      },
      tcm: {
        meridian: 'Hand Shaoyin Heart Meridian',
        element: 'Fire',
        acupoint: 'HT-7 (Shenmen)',
        organClockPeak: '11:00 AM – 1:00 PM',
        pattern: 'Heart Blood & Shen Restlessness'
      },
      ayurveda: {
        marmaPoint: 'Hridaya Marma',
        chakra: 'Anahata (Heart)',
        solfeggioHz: 639,
        dosha: 'Vata',
        element: 'Vayu (Air) & Prana'
      },
      arborist: {
        treePart: 'Central Sap Pump & Bark Core',
        sapDynamics: 'Rhythmic Pulsating Sap Flow (72 BPM)',
        soilNutrient: 'Organic Carbon & Canopy Shade Synthesis'
      },
      mechanic: {
        vehicleComponent: 'V8 Combustion Block & Fuel Injectors',
        fluidPressure: 'Fuel Line Pressure 65 PSI (72 RPM Idle)',
        dtcCode: 'DTC P0000 (Powertrain Nominal)'
      }
    },
    {
      id: 'kidney',
      name: 'Kidney & Adrenal Region',
      coords: [0.35, 0.6, 0.3],
      allopathic: {
        system: 'Renal & HPA Axis',
        nerveChain: 'Renal Plexus & Sympathetic Trunk T10-L1',
        snomedCode: '236435004',
        loincCode: '2143-6',
        metric: 'Cortisol Awakening Response',
        metricValue: '18.2 mcg/dL'
      },
      tcm: {
        meridian: 'Foot Shaoyin Kidney Meridian',
        element: 'Water',
        acupoint: 'KI-3 (Taixi)',
        organClockPeak: '5:00 PM – 7:00 PM',
        pattern: 'Kidney Essence & Yin Deficiency'
      },
      ayurveda: {
        marmaPoint: 'Vasti Marma',
        chakra: 'Svadhishthana (Sacral)',
        solfeggioHz: 417,
        dosha: 'Kapha',
        element: 'Jala (Water)'
      },
      arborist: {
        treePart: 'Subterranean Taproot Filtration',
        sapDynamics: 'Aquifer Water Absorption & Electrolyte Balance',
        soilNutrient: 'Potassium & Humic Acid Layer'
      },
      mechanic: {
        vehicleComponent: 'Radiator Coolant Reservoir & Oil Filter',
        fluidPressure: 'Coolant Line Pressure 16 PSI',
        dtcCode: 'DTC P0128 (Coolant Temp Below Thermostat)'
      }
    }
  ];

  activeTarget = computed(() => {
    return this.targets.find(t => t.id === this.selectedTargetId()) || this.targets[0];
  });

  private themeService = inject(ThemeService);
  private animFrameId: number | null = null;
  private rotAngle = 0;

  private crossProjectionHandler: any = null;

  ngAfterViewInit(): void {
    this.renderHologramCanvas();

    if (typeof window !== 'undefined') {
      this.crossProjectionHandler = (e: CustomEvent) => {
        const detail = e.detail;
        if (!detail || !detail.nodeId) return;

        const nodeMap: Record<string, string> = {
          'head': 'brain',
          'chest': 'heart',
          'heart': 'heart',
          'lungs': 'heart',
          'spine_lumbar': 'spine',
          'r_shin': 'kidney',
          'l_shin': 'kidney'
        };

        const targetId = nodeMap[detail.nodeId] || detail.nodeId;
        if (this.targets.some(t => t.id === targetId)) {
          this.selectedTargetId.set(targetId);
        }
      };

      window.addEventListener('rosetta-cross-projection', this.crossProjectionHandler as EventListener);
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (typeof window !== 'undefined' && this.crossProjectionHandler) {
      window.removeEventListener('rosetta-cross-projection', this.crossProjectionHandler as EventListener);
    }
  }

  setLens(lens: ParadigmLens): void {
    this.activeLens.set(lens);
    const paradigmMap: Record<ParadigmLens, 'western' | 'tcm' | 'ayurveda' | 'unified'> = {
      allopathic: 'western',
      tcm: 'tcm',
      ayurveda: 'ayurveda',
      arborist: 'western',
      mechanic: 'western',
      unified: 'unified'
    };
    this.themeService.setParadigm(paradigmMap[lens]);
  }

  selectTarget(id: string): void {
    this.selectedTargetId.set(id);
  }

  private renderHologramCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 260;
    };
    resize();

    const draw = () => {
      this.rotAngle += 0.015;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Anatomical Wireframe Torso Silhouette
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      // Head
      ctx.arc(centerX, centerY - 80, 22, 0, Math.PI * 2);
      // Torso outline
      ctx.moveTo(centerX - 35, centerY - 50);
      ctx.lineTo(centerX + 35, centerY - 50);
      ctx.lineTo(centerX + 28, centerY + 65);
      ctx.lineTo(centerX - 28, centerY + 65);
      ctx.closePath();
      ctx.stroke();

      // Draw Active Target Node Pulse
      const target = this.activeTarget();
      const nodeX = centerX + (target.coords[0] - 0.5) * 160;
      const nodeY = centerY + (target.coords[1] - 0.5) * 160;

      // Color selection based on lens
      let pulseColor = '#22d3ee'; // cyan for allopathic
      if (target.tcm.element === 'Wood') pulseColor = '#10b981';
      if (target.tcm.element === 'Fire') pulseColor = '#ef4444';
      if (target.tcm.element === 'Water') pulseColor = '#3b82f6';
      if (this.activeLens() === 'ayurveda') pulseColor = '#f59e0b';

      // Concentric Pulsing Rings
      const ringRadius = 12 + Math.sin(this.rotAngle * 3) * 6;
      ctx.strokeStyle = pulseColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = pulseColor;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Connector line to Target Label
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(nodeX, nodeY);
      ctx.lineTo(nodeX + 40, nodeY - 30);
      ctx.lineTo(nodeX + 110, nodeY - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(target.name, nodeX + 42, nodeY - 34);

      this.animFrameId = requestAnimationFrame(draw);
    };

    draw();
  }
}
