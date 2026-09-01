import { Component, ChangeDetectionStrategy, signal, computed, inject, OnDestroy, PLATFORM_ID, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

export interface IPetriPlace {
  id: string;
  name: string;
  tokens: number;
  maxCapacity: number;
  color: string;
  x: number;
  y: number;
}

export interface IPetriTransition {
  id: string;
  name: string;
  shortName: string;
  inputs: { placeId: string; weight: number }[];
  outputs: { placeId: string; weight: number }[];
  x: number;
  y: number;
}

export type PetriModelType = 'immunometabolic' | 'mitochondrial' | 'cardiometabolic';

export interface IPetriModelConfig {
  id: PetriModelType;
  title: string;
  badge: string;
  description: string;
  places: IPetriPlace[];
  transitions: IPetriTransition[];
}

const PETRI_MODELS: Record<PetriModelType, IPetriModelConfig> = {
  immunometabolic: {
    id: 'immunometabolic',
    title: 'Immunometabolic & Cytokine Storm',
    badge: 'Inflammation & T-Reg',
    description: 'Models cytokine cascade kinetics, endothelial inflammation, and T-Reg / autophagy resolution.',
    places: [
      { id: 'proinflammatory_cytokines', name: 'Cytokines (IL-6/TNF)', tokens: 4, maxCapacity: 10, color: '#f43f5e', x: 70, y: 55 },
      { id: 'endothelial_damage', name: 'Endothelial Lesion', tokens: 2, maxCapacity: 10, color: '#fb923c', x: 250, y: 55 },
      { id: 'anti_inflammatory_treg', name: 'T-Reg Restraint (IL-10)', tokens: 3, maxCapacity: 10, color: '#10b981', x: 70, y: 155 },
      { id: 'autophagy_flux', name: 'Autophagy / Mitophagy Flux', tokens: 2, maxCapacity: 10, color: '#06b6d4', x: 250, y: 155 }
    ],
    transitions: [
      {
        id: 't_cascade',
        name: 'Trigger Inflammatory Cascade',
        shortName: 'Inflammatory Cascade',
        inputs: [{ placeId: 'proinflammatory_cytokines', weight: 1 }],
        outputs: [{ placeId: 'endothelial_damage', weight: 1 }],
        x: 160,
        y: 45
      },
      {
        id: 't_autophagy',
        name: 'Activate Autophagy Clearance',
        shortName: 'Autophagic Repair',
        inputs: [{ placeId: 'endothelial_damage', weight: 1 }, { placeId: 'autophagy_flux', weight: 1 }],
        outputs: [{ placeId: 'anti_inflammatory_treg', weight: 1 }],
        x: 250,
        y: 105
      },
      {
        id: 't_suppress',
        name: 'T-Reg Immune Resolution',
        shortName: 'T-Reg Resolution',
        inputs: [{ placeId: 'anti_inflammatory_treg', weight: 1 }],
        outputs: [{ placeId: 'autophagy_flux', weight: 1 }],
        x: 70,
        y: 105
      },
      {
        id: 't_priming',
        name: 'Endotoxin / LPS Priming',
        shortName: 'LPS Priming',
        inputs: [{ placeId: 'endothelial_damage', weight: 1 }],
        outputs: [{ placeId: 'proinflammatory_cytokines', weight: 2 }],
        x: 160,
        y: 155
      }
    ]
  },
  mitochondrial: {
    id: 'mitochondrial',
    title: 'Mitochondrial Bioenergetics & ROS Flux',
    badge: 'OXPHOS & ATP',
    description: 'Models electron transport chain leak, membrane potential uncoupling, and PINK1 mitophagy flux.',
    places: [
      { id: 'complex_ros', name: 'Complex I/III ROS Leak', tokens: 3, maxCapacity: 10, color: '#e11d48', x: 70, y: 55 },
      { id: 'membrane_potential', name: 'Membrane Potential (ΔΨm)', tokens: 5, maxCapacity: 10, color: '#a855f7', x: 250, y: 55 },
      { id: 'atp_pool', name: 'Cellular ATP Pool', tokens: 6, maxCapacity: 10, color: '#22c55e', x: 250, y: 155 },
      { id: 'mitophagy_pink1', name: 'PINK1-Parkin Flux', tokens: 2, maxCapacity: 10, color: '#38bdf8', x: 70, y: 155 }
    ],
    transitions: [
      {
        id: 't_oxphos',
        name: 'OXPHOS ATP Synthesis',
        shortName: 'OXPHOS ATP',
        inputs: [{ placeId: 'membrane_potential', weight: 1 }],
        outputs: [{ placeId: 'atp_pool', weight: 2 }],
        x: 250,
        y: 105
      },
      {
        id: 't_ros_uncouple',
        name: 'Superoxide Membrane Uncoupling',
        shortName: 'ROS Uncoupling',
        inputs: [{ placeId: 'complex_ros', weight: 1 }, { placeId: 'membrane_potential', weight: 1 }],
        outputs: [{ placeId: 'complex_ros', weight: 2 }],
        x: 160,
        y: 45
      },
      {
        id: 't_mitophagy_clear',
        name: 'Mitophagic ROS Clearance',
        shortName: 'Mitophagy Clearance',
        inputs: [{ placeId: 'mitophagy_pink1', weight: 1 }, { placeId: 'complex_ros', weight: 1 }],
        outputs: [{ placeId: 'membrane_potential', weight: 1 }],
        x: 70,
        y: 105
      },
      {
        id: 't_nad_repletion',
        name: 'Sirtuin / NAD+ Activation',
        shortName: 'NAD+ Activation',
        inputs: [{ placeId: 'atp_pool', weight: 1 }],
        outputs: [{ placeId: 'mitophagy_pink1', weight: 1 }, { placeId: 'membrane_potential', weight: 1 }],
        x: 160,
        y: 155
      }
    ]
  },
  cardiometabolic: {
    id: 'cardiometabolic',
    title: 'Cardiometabolic & Insulin Sensitivity',
    badge: 'GLUT4 & Glycemia',
    description: 'Models insulin receptor substrate IRS-1 phosphorylation, lipotoxicity DAG accumulation, and GLUT4 uptake.',
    places: [
      { id: 'serum_glucose', name: 'Postprandial Glucose Pool', tokens: 5, maxCapacity: 10, color: '#f59e0b', x: 70, y: 55 },
      { id: 'glut4_translocation', name: 'Membrane GLUT4 Channels', tokens: 4, maxCapacity: 10, color: '#06b6d4', x: 250, y: 55 },
      { id: 'cellular_glycogen', name: 'Myocellular Glycogen', tokens: 4, maxCapacity: 10, color: '#10b981', x: 250, y: 155 },
      { id: 'dag_lipotoxicity', name: 'Diacylglycerol (DAG) Stress', tokens: 2, maxCapacity: 10, color: '#ef4444', x: 70, y: 155 }
    ],
    transitions: [
      {
        id: 't_glucose_uptake',
        name: 'GLUT4 Glucose Uptake',
        shortName: 'Glucose Uptake',
        inputs: [{ placeId: 'serum_glucose', weight: 1 }, { placeId: 'glut4_translocation', weight: 1 }],
        outputs: [{ placeId: 'cellular_glycogen', weight: 1 }, { placeId: 'glut4_translocation', weight: 1 }],
        x: 160,
        y: 45
      },
      {
        id: 't_irs1_block',
        name: 'Lipotoxic IRS-1 Serine Block',
        shortName: 'IRS-1 Block',
        inputs: [{ placeId: 'dag_lipotoxicity', weight: 1 }, { placeId: 'glut4_translocation', weight: 1 }],
        outputs: [{ placeId: 'dag_lipotoxicity', weight: 1 }],
        x: 160,
        y: 105
      },
      {
        id: 't_ampk_burn',
        name: 'AMPK Lipid Oxidation',
        shortName: 'AMPK Clearance',
        inputs: [{ placeId: 'dag_lipotoxicity', weight: 1 }],
        outputs: [{ placeId: 'glut4_translocation', weight: 1 }],
        x: 70,
        y: 105
      },
      {
        id: 't_glycogen_deplete',
        name: 'Fasting Glycogenolysis',
        shortName: 'Glycogenolysis',
        inputs: [{ placeId: 'cellular_glycogen', weight: 1 }],
        outputs: [{ placeId: 'serum_glucose', weight: 1 }],
        x: 160,
        y: 155
      }
    ]
  }
};

@Component({
  selector: 'app-petri-net-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-cyan-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-cyan-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🕸️</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              Petri Net Concurrent Pathway Analyzer
              @if (patientVitals()) {
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Glucose: {{ patientVitals()?.cgmGlucoseMgDl || 110 }} mg/dL | HR: {{ patientVitals()?.hr || 72 }}
                </span>
              }
            </h3>
            <p class="text-[10px] text-cyan-400/80">
              Token Flow, Metabolic Concurrency & Invariant Liveness Analysis
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
                [class.bg-emerald-950]="!isDeadlocked()" [class.text-emerald-400]="!isDeadlocked()"
                [class.bg-rose-950]="isDeadlocked()" [class.text-rose-400]="isDeadlocked()">
            {{ isDeadlocked() ? '⚠️ DEADLOCK DETECTED' : '✅ SYSTEM OK (LIVE)' }}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-cyan-950 border border-cyan-600/40 text-cyan-300 tabular-nums">
            Step: {{ stepCount() }}
          </span>
        </div>
      </div>

      <!-- Model Preset Selection Tabs -->
      <div class="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-2 hide-scrollbar">
        <div class="flex items-center gap-1.5">
          <button (click)="selectModel('immunometabolic')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-cyan-600]="activeModelId() === 'immunometabolic'"
                  [class.text-white]="activeModelId() === 'immunometabolic'"
                  [class.border-cyan-400]="activeModelId() === 'immunometabolic'"
                  [class.bg-zinc-900]="activeModelId() !== 'immunometabolic'"
                  [class.text-zinc-400]="activeModelId() !== 'immunometabolic'"
                  [class.border-zinc-800]="activeModelId() !== 'immunometabolic'">
            🛡️ Immunometabolic
          </button>
          <button (click)="selectModel('mitochondrial')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-cyan-600]="activeModelId() === 'mitochondrial'"
                  [class.text-white]="activeModelId() === 'mitochondrial'"
                  [class.border-cyan-400]="activeModelId() === 'mitochondrial'"
                  [class.bg-zinc-900]="activeModelId() !== 'mitochondrial'"
                  [class.text-zinc-400]="activeModelId() !== 'mitochondrial'"
                  [class.border-zinc-800]="activeModelId() !== 'mitochondrial'">
            ⚡ Mitochondrial ROS
          </button>
          <button (click)="selectModel('cardiometabolic')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-cyan-600]="activeModelId() === 'cardiometabolic'"
                  [class.text-white]="activeModelId() === 'cardiometabolic'"
                  [class.border-cyan-400]="activeModelId() === 'cardiometabolic'"
                  [class.bg-zinc-900]="activeModelId() !== 'cardiometabolic'"
                  [class.text-zinc-400]="activeModelId() !== 'cardiometabolic'"
                  [class.border-zinc-800]="activeModelId() !== 'cardiometabolic'">
            🩸 Cardiometabolic GLUT4
          </button>
        </div>
        <button (click)="syncPatientMetabolism()"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 transition cursor-pointer whitespace-nowrap shrink-0">
          ⚡ Sync Patient Telemetry
        </button>
      </div>

      <!-- Main Visual Workspace: SVG Bipartite Graph + Trajectory Sparklines -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <!-- SVG Bipartite Graph (Places & Transitions) -->
        <div class="lg:col-span-2 bg-slate-900/90 rounded-xl border border-cyan-900/40 p-2 relative h-[210px] flex items-center justify-center overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 320 210" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
              </marker>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Transition Input/Output Directed Arcs -->
            @for (trans of transitions(); track trans.id) {
              <!-- Input Arcs (Place -> Transition) -->
              @for (inp of trans.inputs; track inp.placeId) {
                @if (getPlaceById(inp.placeId); as p) {
                  <path [attr.d]="getArcPath(p.x, p.y, trans.x, trans.y)"
                        stroke="#0e7490"
                        stroke-width="1.5"
                        fill="none"
                        marker-end="url(#arrow)"
                        [class.stroke-cyan-400]="canFire(trans)"
                        [class.stroke-dasharray]="canFire(trans) ? '4 2' : 'none'"
                        class="transition-all duration-300" />
                }
              }
              <!-- Output Arcs (Transition -> Place) -->
              @for (out of trans.outputs; track out.placeId) {
                @if (getPlaceById(out.placeId); as p) {
                  <path [attr.d]="getArcPath(trans.x, trans.y, p.x, p.y)"
                        stroke="#0891b2"
                        stroke-width="1.5"
                        fill="none"
                        marker-end="url(#arrow)"
                        [class.stroke-cyan-300]="canFire(trans)"
                        class="transition-all duration-300" />
                }
              }
            }

            <!-- Places (Circles with Token Badges) -->
            @for (place of places(); track place.id) {
              <g class="cursor-pointer" (click)="togglePlaceToken(place)">
                <!-- Halo Ring -->
                <circle [attr.cx]="place.x" [attr.cy]="place.y" r="24"
                        fill="#030712"
                        [attr.stroke]="place.color"
                        stroke-width="2"
                        filter="url(#glow)"
                        opacity="0.85" />
                
                <!-- Place Token Badge Center -->
                <circle [attr.cx]="place.x" [attr.cy]="place.y" r="14"
                        [attr.fill]="place.color"
                        opacity="0.25" />
                
                <text [attr.x]="place.x" [attr.y]="place.y + 4"
                      text-anchor="middle"
                      fill="#f8fafc"
                      font-size="12"
                      font-weight="bold"
                      font-family="monospace">
                  {{ place.tokens }}
                </text>

                <!-- Place Name Label -->
                <text [attr.x]="place.x" [attr.y]="place.y > 100 ? place.y + 36 : place.y - 30"
                      text-anchor="middle"
                      [attr.fill]="place.color"
                      font-size="8.5"
                      font-weight="bold"
                      font-family="monospace">
                  {{ place.name }}
                </text>
              </g>
            }

            <!-- Transitions (Rectangular Firing Gates) -->
            @for (trans of transitions(); track trans.id) {
              <g class="cursor-pointer" (click)="fireTransition(trans)">
                <rect [attr.x]="trans.x - 12" [attr.y]="trans.y - 12"
                      width="24" height="24"
                      rx="4"
                      [attr.fill]="canFire(trans) ? '#0284c7' : '#1e293b'"
                      [attr.stroke]="canFire(trans) ? '#38bdf8' : '#475569'"
                      stroke-width="1.5"
                      class="transition-all duration-200 hover:scale-110" />
                
                <text [attr.x]="trans.x" [attr.y]="trans.y + 3.5"
                      text-anchor="middle"
                      [attr.fill]="canFire(trans) ? '#ffffff' : '#64748b'"
                      font-size="9"
                      font-weight="bold"
                      font-family="monospace">
                  ⚡
                </text>
              </g>
            }
          </svg>
        </div>

        <!-- Token Trajectory Sparklines & Mathematical Invariants -->
        <div class="bg-slate-900/90 rounded-xl border border-cyan-900/40 p-2.5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[10px] font-bold uppercase text-cyan-300 border-b border-cyan-900/40 pb-1 mb-2">
              <span>Token Trajectory Sparklines</span>
              <span class="text-zinc-400">t-10 → t0</span>
            </div>

            <div class="space-y-1.5">
              @for (place of places(); track place.id) {
                <div class="flex items-center justify-between gap-2 text-[9.5px]">
                  <span class="truncate max-w-[90px] font-mono" [style.color]="place.color">{{ place.name }}</span>
                  <div class="flex items-center gap-0.5">
                    @for (hist of getPlaceHistory(place.id); track $index) {
                      <div class="w-1.5 rounded-xs"
                           [style.height.px]="Math.max(2, hist * 2.2)"
                           [style.background-color]="place.color"
                           [title]="hist + ' tokens'"></div>
                    }
                  </div>
                  <span class="font-bold tabular-nums" [style.color]="place.color">{{ place.tokens }}/{{ place.maxCapacity }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Mathematical Invariants HUD -->
          <div class="mt-2 pt-2 border-t border-cyan-900/40 grid grid-cols-2 gap-1 text-[9px] text-zinc-400">
            <div>Total Tokens (M): <strong class="text-cyan-300 tabular-nums">{{ totalTokens() }}</strong></div>
            <div>k-Boundedness: <strong class="text-emerald-400">k ≤ 10</strong></div>
            <div>Invariants: <strong class="text-cyan-300">P-Invariant OK</strong></div>
            <div>Mode: <strong class="text-purple-300">{{ isAutoSimulating() ? 'Continuous Loop' : 'Discrete Step' }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Real-Time Perturbation Stress-Testing Protocol Bar -->
      <div class="mb-3 flex items-center gap-2 overflow-x-auto py-1 border-y border-cyan-900/30 hide-scrollbar">
        <span class="text-[10px] uppercase font-bold text-cyan-400/90 shrink-0">Perturbation Challenge:</span>
        <button (click)="injectEndotoxinSurge()"
                class="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🔥 LPS / Endotoxin Surge
        </button>
        <button (click)="injectHypoxicStress()"
                class="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          ⚡ Hypoxic Ischemia
        </button>
        <button (click)="injectVagusNerveStimulation()"
                class="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🌿 Vagus Nerve (VNS) Rescue
        </button>
        <button (click)="injectMitochondrialCofactor()"
                class="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🧪 NAD+ / CoQ10 Repletion
        </button>
        <button (click)="injectAmpkActivation()"
                class="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          💊 Metformin / AMPK Trigger
        </button>
      </div>

      <!-- Executable Transitions Action Controls -->
      <div class="space-y-1.5 mb-3">
        <h4 class="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
          Available Transitions (Click to Fire)
        </h4>
        <div class="flex flex-wrap gap-2">
          @for (trans of transitions(); track trans.id) {
            <button (click)="fireTransition(trans)"
                    [disabled]="!canFire(trans)"
                    class="px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer border flex items-center gap-1.5"
                    [class.bg-cyan-600]="canFire(trans)"
                    [class.hover:bg-cyan-500]="canFire(trans)"
                    [class.text-white]="canFire(trans)"
                    [class.border-cyan-400]="canFire(trans)"
                    [class.bg-zinc-900]="!canFire(trans)"
                    [class.text-zinc-600]="!canFire(trans)"
                    [class.border-zinc-800]="!canFire(trans)"
                    [class.cursor-not-allowed]="!canFire(trans)">
              ⚡ {{ trans.name }}
            </button>
          }
        </div>
      </div>

      <!-- Controls Footer -->
      <div class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-900/30 text-xs">
        <div class="flex items-center gap-2">
          <button (click)="toggleAutoSimulation()"
                  class="px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                  [class.bg-purple-600]="isAutoSimulating()"
                  [class.hover:bg-purple-500]="isAutoSimulating()"
                  [class.text-white]="isAutoSimulating()"
                  [class.bg-zinc-800]="!isAutoSimulating()"
                  [class.text-cyan-300]="!isAutoSimulating()">
            {{ isAutoSimulating() ? '⏸ Pause Auto-Loop' : '▶ Continuous Sim' }}
          </button>
          <button (click)="stepStochasticTransition()"
                  class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
            ⏭ Step Stochastic
          </button>
          <button (click)="resetNet()"
                  class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
            🔄 Reset Model
          </button>
        </div>
        <span class="text-[10px] text-zinc-500 font-mono">Turing-Complete Bipartite Petri Net</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class PetriNetViewerComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly Math = Math;
  readonly activeModelId = signal<PetriModelType>('immunometabolic');
  readonly stepCount = signal<number>(0);
  readonly isAutoSimulating = signal<boolean>(false);

  readonly places = signal<IPetriPlace[]>(PETRI_MODELS.immunometabolic.places);
  readonly transitions = computed(() => PETRI_MODELS[this.activeModelId()].transitions);

  // History buffer for sparklines: Map placeId -> number[] (last 10 values)
  readonly tokenHistory = signal<Record<string, number[]>>({
    proinflammatory_cytokines: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    endothelial_damage: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    anti_inflammatory_treg: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    autophagy_flux: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  });

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);
  readonly patientIssues = computed(() => this.patientState?.issues() || {});

  readonly totalTokens = computed(() => {
    return this.places().reduce((acc, p) => acc + p.tokens, 0);
  });

  readonly isDeadlocked = computed(() => {
    return !this.transitions().some(t => this.canFire(t));
  });

  private simInterval?: ReturnType<typeof setInterval>;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.recordHistory();
  }

  selectModel(modelId: PetriModelType) {
    this.activeModelId.set(modelId);
    const config = PETRI_MODELS[modelId];
    this.places.set(JSON.parse(JSON.stringify(config.places)));
    this.stepCount.set(0);
    this.initHistoryForModel(config.places);
  }

  private initHistoryForModel(places: IPetriPlace[]) {
    const hist: Record<string, number[]> = {};
    for (const p of places) {
      hist[p.id] = Array(10).fill(p.tokens);
    }
    this.tokenHistory.set(hist);
  }

  getPlaceById(id: string): IPetriPlace | undefined {
    return this.places().find(p => p.id === id);
  }

  getPlaceHistory(id: string): number[] {
    return this.tokenHistory()[id] || [0];
  }

  getArcPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = (x1 + x2) / 2 - dy * 0.15;
    const cy = (y1 + y2) / 2 + dx * 0.15;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }

  canFire(t: IPetriTransition): boolean {
    const list = this.places();
    return t.inputs.every(inp => {
      const p = list.find(x => x.id === inp.placeId);
      return p ? p.tokens >= inp.weight : false;
    });
  }

  fireTransition(t: IPetriTransition) {
    if (!this.canFire(t)) return;

    const list = this.places().map(p => {
      let tokens = p.tokens;
      const inp = t.inputs.find(x => x.placeId === p.id);
      if (inp) tokens -= inp.weight;

      const out = t.outputs.find(x => x.placeId === p.id);
      if (out) tokens += out.weight;

      tokens = Math.max(0, Math.min(p.maxCapacity, tokens));
      return { ...p, tokens };
    });

    this.places.set(list);
    this.stepCount.update(c => c + 1);
    this.recordHistory();
  }

  stepStochasticTransition() {
    const fireable = this.transitions().filter(t => this.canFire(t));
    if (fireable.length === 0) return;
    const chosen = fireable[Math.floor(Math.random() * fireable.length)];
    this.fireTransition(chosen);
  }

  toggleAutoSimulation() {
    if (this.isAutoSimulating()) {
      this.stopAutoSimulation();
    } else {
      this.startAutoSimulation();
    }
  }

  private startAutoSimulation() {
    this.isAutoSimulating.set(true);
    if (this.simInterval) clearInterval(this.simInterval);
    this.simInterval = setInterval(() => {
      this.stepStochasticTransition();
    }, 750);
  }

  private stopAutoSimulation() {
    this.isAutoSimulating.set(false);
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = undefined;
    }
  }

  togglePlaceToken(place: IPetriPlace) {
    this.places.update(list => list.map(p => {
      if (p.id === place.id) {
        const next = (p.tokens + 1) % (p.maxCapacity + 1);
        return { ...p, tokens: next };
      }
      return p;
    }));
    this.recordHistory();
  }

  // --- Real-time Perturbation Stress-Testing Challenges ---

  injectEndotoxinSurge() {
    this.places.update(list => list.map(p => {
      if (p.id === 'proinflammatory_cytokines' || p.id === 'complex_ros' || p.id === 'dag_lipotoxicity') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 3) };
      }
      if (p.id === 'anti_inflammatory_treg' || p.id === 'atp_pool') {
        return { ...p, tokens: Math.max(0, p.tokens - 2) };
      }
      return p;
    }));
    this.recordHistory();
  }

  injectHypoxicStress() {
    this.places.update(list => list.map(p => {
      if (p.id === 'atp_pool' || p.id === 'membrane_potential') {
        return { ...p, tokens: Math.max(0, p.tokens - 3) };
      }
      if (p.id === 'complex_ros' || p.id === 'endothelial_damage') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 2) };
      }
      return p;
    }));
    this.recordHistory();
  }

  injectVagusNerveStimulation() {
    this.places.update(list => list.map(p => {
      if (p.id === 'anti_inflammatory_treg' || p.id === 'autophagy_flux' || p.id === 'mitophagy_pink1') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 3) };
      }
      if (p.id === 'proinflammatory_cytokines' || p.id === 'complex_ros') {
        return { ...p, tokens: Math.max(0, p.tokens - 2) };
      }
      return p;
    }));
    this.recordHistory();
  }

  injectMitochondrialCofactor() {
    this.places.update(list => list.map(p => {
      if (p.id === 'membrane_potential' || p.id === 'atp_pool') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 2) };
      }
      if (p.id === 'complex_ros') {
        return { ...p, tokens: Math.max(0, p.tokens - 1) };
      }
      if (p.id === 'autophagy_flux' || p.id === 'anti_inflammatory_treg') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 1) };
      }
      return p;
    }));
    this.recordHistory();
  }

  injectAmpkActivation() {
    this.places.update(list => list.map(p => {
      if (p.id === 'glut4_translocation' || p.id === 'autophagy_flux' || p.id === 'mitophagy_pink1') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 3) };
      }
      if (p.id === 'dag_lipotoxicity' || p.id === 'serum_glucose') {
        return { ...p, tokens: Math.max(0, p.tokens - 2) };
      }
      return p;
    }));
    this.recordHistory();
  }

  // Legacy Helpers for backward compatibility
  injectNadTokens() {
    this.injectMitochondrialCofactor();
  }

  injectGlutathione() {
    this.injectVagusNerveStimulation();
  }

  syncPatientMetabolism() {
    const vitals = this.patientVitals();
    const cgm = parseFloat(String(vitals?.cgmGlucoseMgDl || '110'));
    const hr = parseFloat(String(vitals?.hr || '72'));
    const hasIssues = Object.keys(this.patientIssues()).length > 0;

    if (cgm > 150) {
      this.selectModel('cardiometabolic');
      this.places.update(list => list.map(p => {
        if (p.id === 'serum_glucose') return { ...p, tokens: 7 };
        if (p.id === 'dag_lipotoxicity') return { ...p, tokens: 4 };
        return p;
      }));
    } else if (hr > 90 || hasIssues) {
      this.selectModel('immunometabolic');
      this.places.update(list => list.map(p => {
        if (p.id === 'proinflammatory_cytokines') return { ...p, tokens: 6 };
        if (p.id === 'endothelial_damage') return { ...p, tokens: 4 };
        return p;
      }));
    } else {
      this.selectModel('immunometabolic');
    }
    this.recordHistory();
  }

  resetNet() {
    this.selectModel(this.activeModelId());
  }

  private recordHistory() {
    const curr = this.places();
    this.tokenHistory.update(prev => {
      const next: Record<string, number[]> = { ...prev };
      for (const p of curr) {
        const arr = next[p.id] ? [...next[p.id]] : [];
        arr.push(p.tokens);
        if (arr.length > 10) arr.shift();
        next[p.id] = arr;
      }
      return next;
    });
  }

  ngOnDestroy() {
    this.stopAutoSimulation();
  }
}
