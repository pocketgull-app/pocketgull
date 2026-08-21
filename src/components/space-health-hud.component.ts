import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceBiophysicsService, ISpaceCrewTelemetry } from '../services/space-biophysics.service';

@Component({
  selector: 'app-space-health-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-cyan-900/50 shadow-2xl space-y-6">
      <!-- HUD Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-950 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-lg">🚀</span>
            <div>
              <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                NASA TRISH Space Health & SANS Telemetry HUD
                <span class="text-xs uppercase px-2.5 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {{ telemetry().missionPhase }}
                </span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans">
                Crew ID: <span class="font-mono text-cyan-300 font-bold">{{ telemetry().crewId }}</span> | 
                Role: <span class="text-zinc-200">{{ telemetry().crewRole }}</span> | 
                Mission Elapsed Day: <span class="font-mono text-cyan-300 font-bold">T+{{ telemetry().missionDay }}d</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Flight Readiness Badge -->
        <div class="flex items-center gap-3">
          <div 
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border"
            [ngClass]="{
              'bg-emerald-950/80 text-emerald-300 border-emerald-500/40': plan().overallCrewFlightReadiness === 'FLIGHT_READY',
              'bg-amber-950/80 text-amber-300 border-amber-500/40': plan().overallCrewFlightReadiness === 'MONITOR_ELEVATED_SANS',
              'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse': plan().overallCrewFlightReadiness === 'STAT_COUNTERMEASURE_REQUIRED'
            }"
          >
            ● {{ plan().overallCrewFlightReadiness.replace('_', ' ') }}
          </div>

          <button
            type="button"
            (click)="copyFhirJson()"
            class="px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            📋 FHIR R4 Export
          </button>
        </div>
      </div>

      <!-- Telemetry Matrix Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Cephalad Fluid Shift -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cephalad Fluid Shift</span>
            <span class="text-xs font-mono text-cyan-400">Jugular CSA</span>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold font-mono text-white">
              {{ telemetry().jugularCrossSectionalAreaMm2 }} <span class="text-sm font-normal text-zinc-400">mm²</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">
              Flow: <span class="font-mono text-zinc-200">{{ telemetry().internalJugularFlowState }}</span>
            </p>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-cyan-500 rounded-full" 
              [style.width.%]="(telemetry().jugularCrossSectionalAreaMm2 / 300) * 100"
            ></div>
          </div>
        </div>

        <!-- 2. SANS Optic Disc Edema -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">SANS Neuro-Ocular</span>
            <span 
              class="text-xs font-mono px-1.5 py-0.5 rounded"
              [ngClass]="{
                'bg-emerald-950 text-emerald-300': sansRisk() === 'NORMAL',
                'bg-amber-950 text-amber-300': sansRisk() === 'MILD_SANS' || sansRisk() === 'MODERATE_SANS',
                'bg-rose-950 text-rose-300': sansRisk() === 'SEVERE_SANS'
              }"
            >
              Frisén {{ telemetry().frisenGrade }}
            </span>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold font-mono text-white">
              {{ telemetry().octTotalRetinalThicknessUm }} <span class="text-sm font-normal text-zinc-400">µm RNFL</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">
              Refraction: <span class="font-mono text-zinc-200">+{{ telemetry().hyperopicShiftDiopters }} D</span> (Globe Flattening)
            </p>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-500 rounded-full" 
              [style.width.%]="(telemetry().octTotalRetinalThicknessUm / 500) * 100"
            ></div>
          </div>
        </div>

        <!-- 3. Bone Mineral Density (BMD) -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">BMD Trabecular Decay</span>
            <span class="text-xs font-mono text-purple-400">NTx Marker</span>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold font-mono text-white">
              -{{ telemetry().monthlyBmdLossRatePercent }}% <span class="text-sm font-normal text-zinc-400">/ mo</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">
              ARED Workload: <span class="font-mono text-zinc-200">{{ telemetry().aredResistanceWorkloadKjDay }} kJ/d</span>
            </p>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-purple-500 rounded-full" 
              [style.width.%]="(telemetry().monthlyBmdLossRatePercent / 2.0) * 100"
            ></div>
          </div>
        </div>

        <!-- 4. Cosmic Radiation Dosimetry -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deep Space Radiation</span>
            <span class="text-xs font-mono text-rose-400">{{ pelUsed() }}% PEL</span>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold font-mono text-white">
              {{ telemetry().cumulativeDoseMsv }} <span class="text-sm font-normal text-zinc-400">mSv</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">
              GCR Rate: <span class="font-mono text-zinc-200">{{ telemetry().dailyGcrDoseRateUSvDay }} µSv/d</span>
            </p>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-rose-500 rounded-full" 
              [style.width.%]="pelUsed()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Prescribed NASA Countermeasure Strategy Deck -->
      <div class="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          🛡️ Prescribed NASA / TRISH Countermeasure Protocol
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Fluid & SANS Protocol -->
          <div class="p-3.5 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-2">
            <div class="font-semibold text-cyan-400">Fluid Shift & SANS Ocular Defense</div>
            <ul class="space-y-1.5 text-zinc-300 list-disc list-inside">
              <li>{{ plan().sansMitigation.lowerBodyNegativePressureLBNP }}</li>
              <li>{{ plan().sansMitigation.recommendedHeadDownBedrestInversion }}</li>
              <li *ngFor="let nutr of plan().sansMitigation.nutritionalOcularAdjuncts">
                {{ nutr }}
              </li>
            </ul>
          </div>

          <!-- ARED Musculoskeletal Regimen -->
          <div class="p-3.5 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-2">
            <div class="font-semibold text-purple-400">Musculoskeletal & ARED Resistance</div>
            <ul class="space-y-1.5 text-zinc-300 list-disc list-inside">
              <li>ARED Load: <strong class="text-white">{{ plan().musculoskeletalRegimen.aredPrescribedLoadKn }} kN</strong> daily resistance</li>
              <li>T2 Treadmill: <strong class="text-white">{{ plan().musculoskeletalRegimen.t2TreadmillDurationMinutes }} mins</strong> interval aerobic</li>
              <li>
                Bisphosphonate Antiresorptive: 
                <span [class.text-amber-400]="plan().musculoskeletalRegimen.bisphosphonateAntiresorptiveIndicated">
                  {{ plan().musculoskeletalRegimen.bisphosphonateAntiresorptiveIndicated ? 'INDICATED' : 'NOT INDICATED' }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Radiation & SPE Protocol -->
          <div class="p-3.5 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-2">
            <div class="font-semibold text-rose-400">GCR & Solar Particle Defense</div>
            <p class="text-zinc-300 font-mono text-[11px]">{{ plan().radiationProtection.stormShelterProtocol }}</p>
            <div class="pt-1 text-zinc-400">Radioprotective Antioxidant Deck:</div>
            <ul class="space-y-1 text-zinc-300 list-disc list-inside text-[11px]">
              <li *ngFor="let drug of plan().radiationProtection.antioxidantRadioprotectiveDeck">
                {{ drug }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Quick Interactive Simulation Controls -->
      <div class="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span class="text-zinc-400 font-semibold uppercase tracking-wider">Mission Simulation Scenarios:</span>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            (click)="simulateScenario('NOMINAL_LEO')"
            class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Nominal LEO (Day 30)
          </button>
          <button
            type="button"
            (click)="simulateScenario('MARS_SANS_MODERATE')"
            class="px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
          >
            Mars Transit + SANS Edema
          </button>
          <button
            type="button"
            (click)="simulateScenario('SOLAR_STORM_SPE')"
            class="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors"
          >
            🚨 Solar Storm Event (SPE)
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SpaceHealthHudComponent {
  spaceService: SpaceBiophysicsService;

  telemetry: any;
  sansRisk: any;
  pelUsed: any;
  plan: any;

  constructor() {
    try {
      this.spaceService = inject(SpaceBiophysicsService, { optional: true }) || new SpaceBiophysicsService();
    } catch {
      this.spaceService = new SpaceBiophysicsService();
    }
    this.telemetry = this.spaceService.activeCrewTelemetry;
    this.sansRisk = this.spaceService.sansRiskLevel;
    this.pelUsed = this.spaceService.radiationPelUsagePercent;
    this.plan = this.spaceService.countermeasurePlan;
  }

  simulateScenario(scenario: 'NOMINAL_LEO' | 'MARS_SANS_MODERATE' | 'SOLAR_STORM_SPE'): void {
    if (scenario === 'NOMINAL_LEO') {
      this.spaceService.updateTelemetry({
        missionPhase: 'LEO_ORBIT_ISS',
        missionDay: 30,
        jugularCrossSectionalAreaMm2: 180,
        internalJugularFlowState: 'NORMAL_ANTEROGRADE',
        octTotalRetinalThicknessUm: 305,
        frisenGrade: 0,
        choroidalFoldsDetected: false,
        hyperopicShiftDiopters: 0.25,
        monthlyBmdLossRatePercent: 0.9,
        cumulativeDoseMsv: 15.2,
        speAlertActive: false,
      });
    } else if (scenario === 'MARS_SANS_MODERATE') {
      this.spaceService.updateTelemetry({
        missionPhase: 'MARS_TRANSIT_AIRGAPPED',
        missionDay: 120,
        jugularCrossSectionalAreaMm2: 260,
        internalJugularFlowState: 'STAGNANT_LOW_VELOCITY',
        octTotalRetinalThicknessUm: 380,
        frisenGrade: 3,
        choroidalFoldsDetected: true,
        hyperopicShiftDiopters: 1.75,
        monthlyBmdLossRatePercent: 1.35,
        cumulativeDoseMsv: 210.0,
        speAlertActive: false,
      });
    } else if (scenario === 'SOLAR_STORM_SPE') {
      this.spaceService.updateTelemetry({
        speAlertActive: true,
        dailyGcrDoseRateUSvDay: 8500,
      });
    }
  }

  copyFhirJson(): void {
    const fhir = this.spaceService.exportTrishFhirBundle();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(fhir, null, 2));
    }
  }
}
