import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellularAutomataViewerComponent } from './cellular-automata-viewer.component';
import { PetriNetViewerComponent } from './petri-net-viewer.component';
import { NavierStokesViewerComponent } from './navier-stokes-viewer.component';
import { CernLhc3dVisualizerComponent } from '../anatomy-3d/cern-lhc-3d-visualizer.component';
import { SocraticRoundsHudComponent } from '../socratic-rounds-hud.component';
import { InfoCern1991ThemeShowcaseComponent } from '../info-cern-1991-theme-showcase.component';
import { InsightGridComponent } from '../synthesis/insight-grid.component';

@Component({
  selector: 'app-turing-suite',
  standalone: true,
  imports: [
    CommonModule,
    CellularAutomataViewerComponent,
    PetriNetViewerComponent,
    NavierStokesViewerComponent,
    CernLhc3dVisualizerComponent,
    SocraticRoundsHudComponent,
    InfoCern1991ThemeShowcaseComponent,
    InsightGridComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🧮</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-purple-200">
              Turing-Complete Computational Diagnostic Suite
            </h2>
          </div>
          <p class="text-xs text-purple-300/80 mt-1 max-w-2xl">
            Modeling cellular morphogenesis, epigenetic state transitions, concurrent biochemical pathways, and quantum biophysics as formal Turing-complete state machines.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-purple-900/60 border border-purple-500/50 text-purple-200 shrink-0">
          Formal Logic Engine
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[440px]">
          <app-cellular-automata-viewer />
        </div>
        <div class="h-[440px]">
          <app-petri-net-viewer />
        </div>
      </div>

      <!-- Fluid Dynamics Section -->
      <div class="h-[420px]">
        <app-navier-stokes-viewer />
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
export class TuringSuiteComponent {}
