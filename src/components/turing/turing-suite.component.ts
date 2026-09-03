import { Component, ChangeDetectionStrategy, inject, computed, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellularAutomataViewerComponent } from './cellular-automata-viewer.component';
import { PetriNetViewerComponent } from './petri-net-viewer.component';
import { NavierStokesViewerComponent } from './navier-stokes-viewer.component';
import { LensBiomolecularPhysicsComponent } from './lens-biomolecular-physics.component';
import { CernLhc3dVisualizerComponent } from '../anatomy-3d/cern-lhc-3d-visualizer.component';
import { SocraticRoundsHudComponent } from '../socratic-rounds-hud.component';
import { InfoCern1991ThemeShowcaseComponent } from '../info-cern-1991-theme-showcase.component';
import { NanobotSwarm3dComponent } from './nanobot-swarm-3d.component';
import { WhispySwarmBioreactor3dComponent } from './whispy-swarm-bioreactor-3d.component';
import { InsightGridComponent } from '../synthesis/insight-grid.component';
import { PatientStateService } from '../../services/patient-state.service';

@Component({
  selector: 'app-turing-suite',
  standalone: true,
  imports: [
    CommonModule,
    CellularAutomataViewerComponent,
    PetriNetViewerComponent,
    NavierStokesViewerComponent,
    LensBiomolecularPhysicsComponent,
    NanobotSwarm3dComponent,
    WhispySwarmBioreactor3dComponent,
    CernLhc3dVisualizerComponent,
    SocraticRoundsHudComponent,
    InfoCern1991ThemeShowcaseComponent,
    InsightGridComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner & Global Perturbation Control Center -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-800/40 shadow-xl flex flex-col items-start justify-between gap-4">
        <div class="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🧮</span>
              <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-purple-200">
                Turing-Complete Computational Diagnostic Suite
              </h2>
            </div>
            <p class="text-xs text-purple-300/80 mt-1 max-w-3xl">
              Formal Turing-complete state machines modeling cellular automata tissue morphogenesis, concurrent Petri Net metabolic fluxes, Navier-Stokes glymphatic fluid dynamics, and quantum biophysics.
            </p>
            @if (patientVitals()) {
              <div class="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                <span class="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  ⚡ Active Vitals: BP {{ patientVitals()?.bp || '118/76' }} | HR {{ patientVitals()?.hr || 72 }} bpm
                </span>
                <span class="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  Glucose: {{ patientVitals()?.cgmGlucoseMgDl || 110 }} mg/dL
                </span>
                <span class="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Live State Machine Linked
                </span>
              </div>
            }
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-purple-900/60 border border-purple-500/50 text-purple-200 shrink-0">
            Formal Logic Engine
          </span>
        </div>

        <!-- Global Multi-Paradigm Perturbation Matrix Bar -->
        <div class="w-full pt-3 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10.5px] uppercase font-bold text-purple-300/90 flex items-center gap-1">
              <span>🎯</span> Global Cross-Paradigm Stress Protocols:
            </span>
            <button (click)="triggerSympatheticShock()"
                    class="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm">
              🔥 Simulate Sympathetic Shock
            </button>
            <button (click)="triggerVagalRestoration()"
                    class="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm">
              🌿 Simulate Vagal Restoration & Deep Sleep
            </button>
            <button (click)="syncAllEngines()"
                    class="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm">
              ⚡ Sync All Engines with Patient
            </button>
          </div>

          <button (click)="exportTuringSnapshot()"
                  class="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400/50 text-purple-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ml-auto">
            📥 Export Turing State JSON
          </button>
        </div>

        @if (lastActionStatus()) {
          <div class="w-full text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
            {{ lastActionStatus() }}
          </div>
        }
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[520px]">
          <app-cellular-automata-viewer #caViewer />
        </div>
        <div class="h-[520px]">
          <app-petri-net-viewer #petriViewer />
        </div>
      </div>

      <!-- Fluid Dynamics Section -->
      <div class="h-[460px]">
        <app-navier-stokes-viewer #nsViewer />
      </div>

      <!-- Frontier Molecular Biophysics Suite (LLPS, PROTAC, Quantum, MOF) -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-lens-biomolecular-physics #biophysViewer />
      </div>

      <!-- Nanobot Swarm Biomechanics & Telescope-Inspired Physics Engine -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-nanobot-swarm-3d />
      </div>

      <!-- Whispy Healing Swarm Acoustic Holographic Bioreactor Tank -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-whispy-swarm-bioreactor-3d />
      </div>

      <!-- CERN LHC 3D Biophysical Visualizer -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-cern-lhc-3d-visualizer />
      </div>

      <!-- Autonomous Socratic Clinical Rounds HUD -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-socratic-rounds-hud />
      </div>

      <!-- NeXTSTEP WorldWideWeb v0.9 (CERN 1991) Theme Showcase -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-info-cern-1991-theme-showcase />
      </div>

      <!-- Synthesized Cross-Paradigm Intelligence Grid -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-insight-grid />
      </div>
    </div>
  `
})
export class TuringSuiteComponent {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly caViewer = viewChild<CellularAutomataViewerComponent>('caViewer');
  readonly petriViewer = viewChild<PetriNetViewerComponent>('petriViewer');
  readonly nsViewer = viewChild<NavierStokesViewerComponent>('nsViewer');
  readonly biophysViewer = viewChild<LensBiomolecularPhysicsComponent>('biophysViewer');

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);
  readonly lastActionStatus = signal<string>('');

  triggerSympatheticShock() {
    this.caViewer()?.injectCytokineStorm();
    this.petriViewer()?.injectEndotoxinSurge();
    this.nsViewer()?.pulseHypertension();
    this.nsViewer()?.setSleepStage('wake');
    this.lastActionStatus.set('🔥 Sympathetic Shock Protocol active: Cytokines surged in CA, Endotoxemia simulated in Petri Net, Vasoconstriction in Glymphatic Flow.');
  }

  triggerVagalRestoration() {
    this.caViewer()?.administerAntioxidantPulse();
    this.petriViewer()?.injectVagusNerveStimulation();
    this.petriViewer()?.injectMitochondrialCofactor();
    this.nsViewer()?.induceSlowWaveDeepSleep();
    this.lastActionStatus.set('🌿 Vagal Restoration Protocol active: Antioxidant pulse cleared tissue, VNS tokens injected, N3 Deep Sleep +600% Glymphatic surge engaged.');
  }

  syncAllEngines() {
    this.caViewer()?.syncWithPatientTelemetry();
    this.petriViewer()?.syncPatientMetabolism();
    this.nsViewer()?.syncWithCircadianTelemetry();
    this.lastActionStatus.set('⚡ All Turing state machines synchronized with real-time patient biometrics & circadian profile.');
  }

  exportTuringSnapshot() {
    const snapshot = {
      resourceType: 'Observation',
      id: 'turing-diagnostic-snapshot-' + Date.now(),
      status: 'final',
      code: {
        coding: [{ system: 'https://pocketgull.com/turing', code: 'TURING_COMPUTATIONAL_DIAGNOSTIC_STATE', display: 'Turing Diagnostic State' }]
      },
      effectiveDateTime: new Date().toISOString(),
      component: [
        {
          code: { text: 'Cellular Automata Active Cells' },
          valueInteger: this.caViewer()?.activeCellCount() || 0
        },
        {
          code: { text: 'Petri Net Total Tokens' },
          valueInteger: this.petriViewer()?.totalTokens() || 0
        },
        {
          code: { text: 'Petri Net Deadlock Status' },
          valueString: this.petriViewer()?.isDeadlocked() ? 'DEADLOCK' : 'LIVE'
        },
        {
          code: { text: 'Navier-Stokes Glymphatic Velocity mm/s' },
          valueString: this.nsViewer()?.csfVelocity() || '0.0'
        }
      ]
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turing_diagnostic_snapshot_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.lastActionStatus.set('📥 Exported Turing Diagnostic Snapshot JSON successfully.');
  }
}
