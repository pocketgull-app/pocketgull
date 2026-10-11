import { Component, ChangeDetectionStrategy, inject, computed, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellularAutomataViewerComponent } from './cellular-automata-viewer.component';
import { PetriNetViewerComponent } from './petri-net-viewer.component';
import { NavierStokesViewerComponent, ISoluteMolecule } from './navier-stokes-viewer.component';
import { LensBiomolecularPhysicsComponent } from './lens-biomolecular-physics.component';
import { CernLhc3dVisualizerComponent } from '../anatomy-3d/cern-lhc-3d-visualizer.component';
import { SocraticRoundsHudComponent } from '../socratic-rounds-hud.component';
import { NanobotSwarm3dComponent } from './nanobot-swarm-3d.component';
import { WhispySwarmBioreactor3dComponent } from './whispy-swarm-bioreactor-3d.component';
import { InsightGridComponent } from '../synthesis/insight-grid.component';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianChronoNutritionService } from '../../services/circadian-chrono-nutrition.service';

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

          <div class="flex items-center gap-2 ml-auto">
            <button (click)="exportAct2CarePlan()"
                    class="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm">
              📋 Export Act II Glymphatic Plan
            </button>
            <button (click)="exportTuringSnapshot()"
                    class="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400/50 text-purple-200 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
              📥 Export Turing State JSON
            </button>
          </div>
        </div>

        @if (lastActionStatus()) {
          <div class="w-full text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
            {{ lastActionStatus() }}
          </div>
        }

        <!-- Live Glymphatic Clearance Index (GCI) & SIBI Oral-Brain Telemetry -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full p-3 rounded-xl bg-slate-900/70 border border-sky-800/40 text-xs shadow-md">
          <!-- GCI Meter -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono border shrink-0"
                 [class.bg-emerald-950]="gciTelemetry().score >= 75" [class.border-emerald-500]="gciTelemetry().score >= 75" [class.text-emerald-300]="gciTelemetry().score >= 75"
                 [class.bg-amber-950]="gciTelemetry().score >= 45 && gciTelemetry().score < 75" [class.border-amber-500]="gciTelemetry().score >= 45 && gciTelemetry().score < 75" [class.text-amber-300]="gciTelemetry().score >= 45 && gciTelemetry().score < 75"
                 [class.bg-rose-950]="gciTelemetry().score < 45" [class.border-rose-500]="gciTelemetry().score < 45" [class.text-rose-300]="gciTelemetry().score < 45">
              <span class="text-sm leading-none">{{ gciTelemetry().score }}%</span>
              <span class="text-[8px] uppercase tracking-tighter opacity-80">GCI</span>
            </div>
            <div>
              <div class="font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Glymphatic Clearance</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                      [class.bg-emerald-950]="gciTelemetry().score >= 75" [class.text-emerald-300]="gciTelemetry().score >= 75"
                      [class.bg-amber-950]="gciTelemetry().score >= 45 && gciTelemetry().score < 75" [class.text-amber-300]="gciTelemetry().score >= 45 && gciTelemetry().score < 75"
                      [class.bg-rose-950]="gciTelemetry().score < 45" [class.text-rose-300]="gciTelemetry().score < 45">
                  {{ gciTelemetry().status }}
                </span>
              </div>
              <div class="text-[10px] text-zinc-400 mt-0.5">
                Velocity: <strong class="text-sky-300">{{ gciTelemetry().clearanceVelocityMmS }} mm/s</strong> · AQP4: <strong class="text-sky-300">{{ gciTelemetry().aqp4PolarityEstimate.split(' ')[0] }}</strong>
              </div>
            </div>
          </div>

          <!-- Chrono-Posology Directive -->
          <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-2 md:pt-0 md:pl-3">
            <span class="text-base shrink-0">⏰</span>
            <div class="text-[10.5px]">
              <div class="font-bold text-amber-300">Chrono-Posology: {{ activeChronoRec().moleculeName }}</div>
              <div class="text-zinc-300 text-[10px] leading-tight">
                {{ activeChronoRec().recommendedIngestionTime }} · {{ activeChronoRec().targetMechanism }}
              </div>
            </div>
          </div>

          <!-- Oral-Brain SIBI Bridge -->
          <div class="flex items-center justify-between gap-2 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-2 md:pt-0 md:pl-3">
            <div>
              <div class="font-bold text-zinc-200 flex items-center gap-1">
                <span>🦷 Oral SIBI Index:</span>
                <strong [class.text-rose-400]="periodontalSibiScore() > 40" [class.text-emerald-400]="periodontalSibiScore() <= 40">
                  {{ periodontalSibiScore() }}
                </strong>
              </div>
              <div class="text-[9.5px] text-zinc-400">
                {{ periodontalSibiScore() > 40 ? '⚠️ Oral LPS Translocation Penalty' : 'Subgingival Microflora Balanced' }}
              </div>
            </div>
            <button (click)="simulatePeriodontalDebridement()"
                    class="px-2 py-1 rounded bg-teal-950/70 hover:bg-teal-900 border border-teal-500/50 text-teal-300 text-[9.5px] font-bold uppercase transition cursor-pointer shrink-0">
              Scaling & Rinse
            </button>
          </div>
        </div>
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
        <app-navier-stokes-viewer #nsViewer
                                  (moleculeSelected)="onMoleculeSelected($event)"
                                  (glymphaticStateChange)="onGlymphaticStateChange($event)" />
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

      <!-- Synthesized Cross-Paradigm Intelligence Grid -->
      <div class="pt-4 border-t border-purple-900/40">
        <app-insight-grid />
      </div>
    </div>
  `
})
export class TuringSuiteComponent {
  private readonly patientState = inject(PatientStateService, { optional: true });
  private readonly chronoService = inject(CircadianChronoNutritionService, { optional: true });

  readonly caViewer = viewChild<CellularAutomataViewerComponent>('caViewer');
  readonly petriViewer = viewChild<PetriNetViewerComponent>('petriViewer');
  readonly nsViewer = viewChild<NavierStokesViewerComponent>('nsViewer');
  readonly biophysViewer = viewChild<LensBiomolecularPhysicsComponent>('biophysViewer');

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);
  readonly lastActionStatus = signal<string>('');

  /** Oral-Systemic Inflammatory Burden Index (SIBI) score (Normal < 25, Periodontal Disease > 40) */
  readonly periodontalSibiScore = signal<number>(18);

  /** Live Glymphatic Clearance Index (GCI) computed telemetry with oral-systemic penalty */
  readonly gciTelemetry = computed(() => {
    const rawGci = (typeof this.patientState?.glymphaticClearanceIndex === 'function'
      ? this.patientState.glymphaticClearanceIndex()
      : null) || {
      score: 78,
      status: 'Optimal Proteopathy Washout',
      deepSleepMinutes: 81,
      aqp4PolarityEstimate: 'Polarized (90% Endfoot Targeting)',
      clearanceVelocityMmS: '4.8',
      stasisRiskDetected: false
    };

    // If oral SIBI is elevated (>40), apply an additional -18% penalty to GCI for astrocytic endotoxemia
    if (this.periodontalSibiScore() > 40) {
      const penalizedScore = Math.max(15, rawGci.score - 18);
      return {
        ...rawGci,
        score: penalizedScore,
        status: penalizedScore >= 75 ? 'Optimal Proteopathy Washout' : penalizedScore >= 45 ? 'Moderate Convective Flow' : 'CAA Stasis Risk (Impaired Drainage)',
        aqp4PolarityEstimate: 'Depolarized (Oral LPS Endotoxemia)',
        clearanceVelocityMmS: penalizedScore >= 75 ? '4.8' : penalizedScore >= 45 ? '2.1' : '0.6'
      };
    }
    return rawGci;
  });

  /** Active Chrono-Posology recommendation for selected solute */
  readonly activeChronoRec = computed(() => {
    const activeMol = this.nsViewer()?.selectedMolecule() || { id: 'spermidine', name: 'Spermidine' };
    return (typeof this.chronoService?.getChronoPosologyRecommendation === 'function'
      ? this.chronoService.getChronoPosologyRecommendation(activeMol.id)
      : null) || {
      moleculeId: activeMol.id,
      moleculeName: activeMol.name,
      recommendedIngestionTime: '21:15 (75 min pre-sleep)',
      targetMechanism: 'Autophagy & Mitophagy Induction'
    };
  });

  simulatePeriodontalDebridement() {
    this.periodontalSibiScore.set(12);
    this.petriViewer()?.injectVagusNerveStimulation();
    this.nsViewer()?.setAqp4Polarization(true);
    this.lastActionStatus.set('🦷 Periodontal debridement & antimicrobial irrigation complete: SIBI normalized to 12, systemic bacteremic endotoxin purged, astrocytic AQP4 polarity restored.');
  }

  simulateOralPeriodontalFlare() {
    this.periodontalSibiScore.set(65);
    this.petriViewer()?.injectEndotoxinSurge();
    this.nsViewer()?.setAqp4Polarization(false);
    this.lastActionStatus.set('⚠️ Periodontal bacteremic flare simulated: SIBI elevated to 65, systemic LPS translocated to cerebral vessels, AQP4 depolarized.');
  }

  triggerSympatheticShock() {
    this.caViewer()?.injectCytokineStorm();
    this.petriViewer()?.injectEndotoxinSurge();
    this.nsViewer()?.pulseHypertension();
    this.nsViewer()?.setSleepStage('wake');
    this.nsViewer()?.setAqp4Polarization(false);
    this.lastActionStatus.set('🔥 Sympathetic Shock Protocol active: Cytokines surged in CA, Endotoxemia simulated in Petri Net, Vasoconstriction & AQP4 Depolarization in Glymphatic Flow.');
  }

  triggerVagalRestoration() {
    this.caViewer()?.administerAntioxidantPulse();
    this.petriViewer()?.injectVagusNerveStimulation();
    this.petriViewer()?.injectMitochondrialCofactor();
    this.nsViewer()?.induceSlowWaveDeepSleep();
    this.nsViewer()?.setAqp4Polarization(true);
    this.lastActionStatus.set('🌿 Vagal Restoration Protocol active: Antioxidant pulse cleared tissue, VNS tokens injected, N3 Deep Sleep +600% Glymphatic surge & AQP4 Repolarization engaged.');
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
        },
        {
          code: { text: 'Aquaporin-4 Astrocytic Polarization' },
          valueString: this.nsViewer()?.aqp4Polarized() ? 'POLARIZED_90%' : 'DEPOLARIZED_25%'
        },
        {
          code: { text: 'Glymphatic Active Solute Molecule' },
          valueString: this.nsViewer()?.selectedMolecule()?.name || 'Amyloid-beta (Aβ 1-42)'
        },
        {
          code: { text: 'Solute Molecular Weight Da' },
          valueInteger: this.nsViewer()?.selectedMolecule()?.molecularWeightDa || 4514
        },
        {
          code: { text: 'Solute Hydrodynamic Radius nm' },
          valueString: (this.nsViewer()?.selectedMolecule()?.hydrodynamicRadiusNm ?? 1.10).toFixed(2)
        },
        {
          code: { text: 'Solute Péclet Number' },
          valueString: (this.nsViewer()?.pecletNumber() ?? 18.2).toFixed(1)
        },
        {
          code: { text: 'Solute Transport Regime' },
          valueString: (this.nsViewer()?.selectedMolecule()?.molecularWeightDa || 4514) > 3000
            ? 'Convective (High Bulk Flow Dependency)'
            : 'Diffusive-Permissive Interstitial'
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

  exportAct2CarePlan() {
    const gci = (typeof this.patientState?.glymphaticClearanceIndex === 'function'
      ? this.patientState.glymphaticClearanceIndex()
      : null) || {
      score: 78,
      status: 'Optimal Proteopathy Washout',
      deepSleepMinutes: 81,
      aqp4PolarityEstimate: 'Polarized (90% Endfoot Targeting)',
      clearanceVelocityMmS: '4.8',
      stasisRiskDetected: false
    };

    const activeMol = this.nsViewer()?.selectedMolecule() || {
      id: 'amyloid_beta_42',
      name: 'Amyloid-β 1-42',
      molecularWeightDa: 4514,
      hydrodynamicRadiusNm: 1.09,
      basePeclet: 62.4
    };

    const chronoRec = (typeof this.chronoService?.getChronoPosologyRecommendation === 'function'
      ? this.chronoService.getChronoPosologyRecommendation(activeMol.id)
      : null) || {
      moleculeId: activeMol.id,
      moleculeName: activeMol.name,
      recommendedIngestionTime: '21:15 (75 min pre-sleep)',
      targetCircadianPhase: 'Dusk_Tapering / Early Melatonin Surge',
      targetMechanism: 'Autophagy Induction & Convective Flush',
      rationale: 'Aligns peak plasma concentration with N3 slow-wave sleep and astrocytic AQP4 bulk flow.',
      dietaryCoFactor: 'Water or light herbal tea; avoid protein-rich foods to prevent mTORC1 competition.'
    };

    const carePlan = {
      resourceType: 'CarePlan',
      id: 'act-2-glymphatic-sleep-plan-' + Date.now(),
      status: 'active',
      intent: 'plan',
      title: 'Act II: Sleep Architecture, Glymphatic Protection & Autonomic Pacing',
      description: 'Quantitative in silico glymphatic clearance optimization, chronotherapy timing, and non-pharmacologic restorative sleep architecture protocol.',
      period: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      category: [
        {
          coding: [
            { system: 'https://pocketgull.com/care-plans', code: 'ACT_2_GLYMPHATIC_OPTIMIZATION', display: 'Act II Glymphatic & Autonomic Protocol' }
          ]
        }
      ],
      addresses: [
        { display: 'Proteopathy Accumulation & Interstitial Clearance Stasis Risk' },
        { display: 'Circadian Phase Misalignment & Sympathetic Dominance' }
      ],
      supportingInfo: [
        { display: `Glymphatic Clearance Index (GCI): ${gci.score}% (${gci.status})` },
        { display: `Astrocytic AQP4 Status: ${gci.aqp4PolarityEstimate}` },
        { display: `CSF Convective Bulk Velocity: ${gci.clearanceVelocityMmS} mm/s` },
        { display: `Active Solute: ${activeMol.name} (${activeMol.molecularWeightDa} Da, RH=${activeMol.hydrodynamicRadiusNm} nm)` }
      ],
      activity: [
        {
          detail: {
            kind: 'CommunicationRequest',
            code: { text: '0.10 Hz Resonance Vagal Breathing Pacing' },
            status: 'in-progress',
            description: '10–15 minutes of slow diaphragmatic breathing (4s inhale, 6s exhale) 30 min before bed to activate the cholinergic anti-inflammatory pathway and prime AQP4 water channels.'
          }
        },
        {
          detail: {
            kind: 'NutritionOrder',
            code: { text: `Targeted Chrono-Posology: ${chronoRec.moleculeName}` },
            status: 'scheduled',
            scheduledTiming: { event: [chronoRec.recommendedIngestionTime] },
            description: `${chronoRec.targetMechanism}. ${chronoRec.rationale} Dietary Co-factor: ${chronoRec.dietaryCoFactor}`
          }
        },
        {
          detail: {
            kind: 'ServiceRequest',
            code: { text: 'Lateral Decubitus Sleep Posture Ergonomics' },
            status: 'in-progress',
            description: 'Encourage lateral (side) sleeping over supine/prone; clinical studies demonstrate ~24% greater convective CSF perivascular drainage volume in lateral recumbency.'
          }
        },
        {
          detail: {
            kind: 'DeviceUseStatement',
            code: { text: 'Bedroom Thermal & Photonic Nadir' },
            status: 'completed',
            description: 'Maintain bedroom ambient temperature between 65–68°F (18–20°C) and reduce melanopic EDI (<10 lx) 2 hours before bed to facilitate core temperature drop and uninhibited pineal melatonin release.'
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(carePlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `act2_glymphatic_care_plan_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.lastActionStatus.set(`📋 Exported Act II Glymphatic Care Plan JSON (GCI: ${gci.score}%, Solute: ${activeMol.name}) successfully.`);
  }

  onMoleculeSelected(molecule: ISoluteMolecule) {
    if (molecule.id === 'spermidine') {
      // 1. Petri Net: Inject AMPK activation & Mitophagy flux
      this.petriViewer()?.injectAmpkActivation();
      // 2. Cellular Automata: Administer antioxidant cytoprotection
      this.caViewer()?.administerAntioxidantPulse();
      // 3. LLPS: Reset lattice to sub-spinodal clearance state (chi < 2.0)
      this.biophysViewer()?.resetLlpsGrid();
      this.lastActionStatus.set(`✨ [PK/PD Coupling] Spermidine (145 Da): Stimulated AMPK/Mitophagy flux in Petri Net, antioxidant survival in CA, and rapid interstitial diffusion.`);
    } else if (molecule.id === 'curcumin' || molecule.id === 'akba') {
      // 1. Petri Net: Anti-inflammatory T-Reg restraint
      this.petriViewer()?.injectVagusNerveStimulation();
      // 2. Cellular Automata: Administer antioxidant pulse
      this.caViewer()?.administerAntioxidantPulse();
      // 3. LLPS: Keep chi sub-spinodal
      this.biophysViewer()?.resetLlpsGrid();
      this.lastActionStatus.set(`🌿 [PK/PD Coupling] ${molecule.name}: Engaged T-Reg anti-inflammatory restraint in Petri Net and antioxidant cytoprotection in CA.`);
    } else if (molecule.id === 'amyloid_beta_42') {
      // 1. Petri Net: Influx of endotoxin/damage priming
      this.petriViewer()?.injectEndotoxinSurge();
      // 2. Cellular Automata: Stress lesion nucleation
      this.caViewer()?.injectCytokineStorm();
      // 3. LLPS: Stress granule & amyloid phase separation nucleation
      this.biophysViewer()?.triggerStressGranulePulse();
      this.lastActionStatus.set(`⚠️ [PK/PD Coupling] Amyloid-β 1-42 (4.5 kDa): Injected cytokine/endothelial damage in Petri Net & CA; triggered LLPS amyloid nucleation.`);
    } else if (molecule.id === 'tau_protein') {
      // 1. Petri Net: Influx of inflammatory cascade & endothelial lesions
      this.petriViewer()?.injectEndotoxinSurge();
      // 2. Cellular Automata: Apoptosis stress cascade
      this.caViewer()?.injectCytokineStorm();
      // 3. LLPS: Elevate chi to 3.2 (Tau hyperphosphorylation & fibrillar gelation risk)
      this.biophysViewer()?.triggerTauHyperphosphorylation();
      this.lastActionStatus.set(`🚨 [PK/PD Coupling] p-Tau 181 (48 kDa): Driven into LLPS gelation risk (χ=3.2); induced endothelial stress in Petri Net & CA.`);
    }
  }

  onGlymphaticStateChange(state: { sleepStage: 'wake' | 'n2' | 'n3'; aqp4Polarized: boolean; clearanceRate: number }) {
    const activeMol = this.nsViewer()?.selectedMolecule();
    if (!activeMol) return;

    if (activeMol.category === 'Pathological Proteopathy') {
      if (!state.aqp4Polarized || state.sleepStage === 'wake') {
        // Glymphatic clearance stalled -> trigger LLPS Tau hyperphosphorylation / amyloid gelation
        this.biophysViewer()?.triggerTauHyperphosphorylation();
        this.lastActionStatus.set(`⚠️ [Glymphatic Stagnation] Impaired convective wash (clearance: ${Math.round(state.clearanceRate * 100)}%) drove ${activeMol.name} into LLPS gelation risk (χ=3.2).`);
      } else if (state.sleepStage === 'n3' && state.aqp4Polarized) {
        // Active N3 slow-wave sleep + polarized AQP4 -> restorative clearance
        this.biophysViewer()?.resetLlpsGrid();
        this.lastActionStatus.set(`💤 [Convective Clearance] N3 Slow-Wave Sleep + Polarized AQP4 restored ${activeMol.name} convective flush; LLPS fibrillization prevented.`);
      }
    }
  }
}
