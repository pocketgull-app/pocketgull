import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HepaticClearanceService, IHepaticDosingGuideline, AscitesGrade, EncephalopathyGrade } from '../../services/hepatic-clearance.service';

@Component({
  selector: 'app-hepatic-clearance-titration-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/95 border border-amber-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6 mb-6">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
            🩺
          </div>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <span>Hepatic Child-Pugh & MELD-Na Cirrhosis Score Engine (Model P6)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Child-Pugh (A/B/C) • UNOS 2016 MELD-Na • Phase-I/II Hepatic Drug Titration Audit
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (hepatic.decompensatedFlag()) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse flex items-center gap-1.5">
              <span>🚨</span>
              <span>DECOMPENSATED CIRRHOSIS</span>
            </span>
          } @else {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Compensated Liver Function</span>
            </span>
          }

          @if (hepatic.hepatorenalSyndromeRisk()) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/50 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>HRS-AKI Hazard</span>
            </span>
          }

          <span class="text-xs px-3 py-1 rounded-full font-extrabold"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': hepatic.childPughClass() === 'Class A',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40': hepatic.childPughClass() === 'Class B',
                  'bg-red-500/20 text-red-300 border border-red-500/40': hepatic.childPughClass() === 'Class C'
                }">
            Child-Pugh {{ hepatic.childPughClass() }} ({{ hepatic.childPughScore() }} pts)
          </span>

          <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            MELD-Na: {{ hepatic.meldNaScore() }}
          </span>
        </div>
      </div>

      <!-- Core Hepatology Telemetry Dials -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <!-- Child-Pugh Score & Class -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Child-Pugh Cirrhosis Tier</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="{
                    'text-emerald-400': hepatic.childPughClass() === 'Class A',
                    'text-amber-400': hepatic.childPughClass() === 'Class B',
                    'text-red-400': hepatic.childPughClass() === 'Class C'
                  }">
              {{ hepatic.childPughClass() }}
            </span>
            <span class="text-[10px] text-zinc-400">({{ hepatic.childPughScore() }} / 15 pts)</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            1-Yr Survival: {{ hepatic.childPugh().oneYearSurvivalPercent }}% • Peri-Op Risk: {{ hepatic.childPugh().perioperativeMortalityPercent }}%
          </span>
        </div>

        <!-- MELD-Na 2016 -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">UNOS MELD-Na Score</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="{
                    'text-emerald-400': hepatic.meldNaScore() < 15,
                    'text-amber-400': hepatic.meldNaScore() >= 15 && hepatic.meldNaScore() < 25,
                    'text-red-400': hepatic.meldNaScore() >= 25
                  }">
              {{ hepatic.meldNaScore() }}
            </span>
            <span class="text-[10px] text-zinc-400">/ 40 max</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            90-Day Mortality: {{ hepatic.meldNa().estimated90DayMortalityPercent }}% • {{ hepatic.meldNa().transplantListingPriority }}
          </span>
        </div>

        <!-- Total Bilirubin & Albumin -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Bilirubin & Albumin</span>
            <span class="text-[10px] text-zinc-400 font-mono">INR: {{ hepatic.inr() }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <div>
              <span class="text-xl font-black font-sans"
                    [ngClass]="hepatic.totalBilirubin() > 3.0 ? 'text-red-400' : (hepatic.totalBilirubin() >= 2.0 ? 'text-amber-400' : 'text-zinc-100')">
                {{ hepatic.totalBilirubin() }}
              </span>
              <span class="text-[10px] text-zinc-400 ml-1">mg/dL Bili</span>
            </div>
            <div>
              <span class="text-xl font-black font-sans"
                    [ngClass]="hepatic.serumAlbumin() < 2.8 ? 'text-red-400' : (hepatic.serumAlbumin() <= 3.5 ? 'text-amber-400' : 'text-zinc-100')">
                {{ hepatic.serumAlbumin() }}
              </span>
              <span class="text-[10px] text-zinc-400 ml-1">g/dL Alb</span>
            </div>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            Synthetic Hepatic Function Index
          </span>
        </div>

        <!-- Hepatorenal & Serum Sodium Index -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Creatinine & Sodium</span>
            <span class="text-[10px] text-zinc-400 font-mono">{{ hepatic.dialysisInPastWeek() ? 'Dialysis 7d' : 'Non-HD' }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <div>
              <span class="text-xl font-black font-sans"
                    [ngClass]="hepatic.serumCreatinine() >= 1.5 ? 'text-amber-400' : 'text-zinc-100'">
                {{ hepatic.serumCreatinine() }}
              </span>
              <span class="text-[10px] text-zinc-400 ml-1">mg/dL Cr</span>
            </div>
            <div>
              <span class="text-xl font-black font-sans"
                    [ngClass]="hepatic.serumSodium() < 130 ? 'text-red-400' : 'text-zinc-100'">
                {{ hepatic.serumSodium() }}
              </span>
              <span class="text-[10px] text-zinc-400 ml-1">mEq/L Na</span>
            </div>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            Ascites: {{ formatAscites(hepatic.ascites()) }} • Enceph: {{ formatEncephalopathy(hepatic.encephalopathy()) }}
          </span>
        </div>
      </div>

      <!-- Interactive Scenario Simulation Controller -->
      <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <span>⚡</span>
            <span>Clinical Simulation Scenarios</span>
          </span>
          <span class="text-[11px] text-zinc-500 font-sans">
            Test immediate Child-Pugh, MELD-Na, and drug posology recalibrations
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button (click)="simulateScenario('compensated_class_a')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer">
            Compensated Cirrhosis (Class A)
          </button>
          <button (click)="simulateScenario('decompensated_class_c')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-red-300 border border-red-500/30 transition-all cursor-pointer">
            Decompensated Cirrhosis (Class C)
          </button>
          <button (click)="simulateScenario('hepatorenal_syndrome')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-purple-300 border border-purple-500/30 transition-all cursor-pointer">
            Hepatorenal Syndrome (HRS Risk)
          </button>
          <button (click)="simulateScenario('opioid_encephalopathy_risk')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-300 border border-amber-500/30 transition-all cursor-pointer">
            Opioid Encephalopathy Alert
          </button>
          <button (click)="resetBaseline()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 border border-zinc-700 transition-all cursor-pointer ml-auto">
            Reset Labs
          </button>
        </div>
      </div>

      <!-- Hepatic Medication Posology & Dosing Titrations -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>💊</span>
            <span>Hepatically Cleared Medication Safety Audit</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {{ hepatic.highRiskMedicationsCount() }} High-Risk Actions
            </span>
          </h4>
          <span class="text-[11px] text-zinc-400 font-sans">
            Auditing Phase-I oxidation, Phase-II glucuronidation, and portosystemic shunts
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          @for (med of hepatic.dosingTitrations(); track med.drugName) {
            <div class="p-3.5 rounded-2xl bg-zinc-900 border space-y-2.5 transition-all"
                 [ngClass]="{
                   'border-red-500/60 bg-red-950/20': med.actionRequired === 'contraindicated',
                   'border-amber-500/50 bg-amber-950/10': med.actionRequired === 'dose_reduction',
                   'border-purple-500/50 bg-purple-950/10': med.actionRequired === 'interval_extension',
                   'border-zinc-800': med.actionRequired === 'standard'
                 }">
              
              <!-- Medication Header & Action Badge -->
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm text-zinc-100">{{ med.drugName }}</span>
                    @if (med.fdaBlackBoxWarning) {
                      <span class="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-red-600 text-white animate-pulse">
                        BLACK BOX
                      </span>
                    }
                  </div>
                  <span class="text-[10px] text-zinc-400 font-sans block">{{ med.drugClass }}</span>
                </div>

                <!-- Action Badge -->
                <span class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border whitespace-nowrap"
                      [ngClass]="{
                        'bg-red-500/20 text-red-300 border-red-500/50': med.actionRequired === 'contraindicated',
                        'bg-amber-500/20 text-amber-300 border-amber-500/50': med.actionRequired === 'dose_reduction',
                        'bg-purple-500/20 text-purple-300 border-purple-500/50': med.actionRequired === 'interval_extension',
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/50': med.actionRequired === 'standard'
                      }">
                  {{ formatActionBadge(med.actionRequired) }}
                </span>
              </div>

              <!-- Recommended Dosage -->
              <div class="p-2 rounded-xl bg-black/40 border border-zinc-800 text-[11px] font-sans">
                <span class="text-zinc-500 font-mono text-[9px] uppercase font-bold block mb-0.5">Clinical Order Recommendation</span>
                <span class="font-semibold text-zinc-200">{{ med.recommendedDosage }}</span>
              </div>

              <!-- Metabolism & Extraction Ratio -->
              <div class="text-[10px] text-zinc-400 space-y-1 font-sans">
                <p class="leading-relaxed"><strong class="text-zinc-300 font-mono">Metabolism:</strong> {{ med.primaryMetabolismPathway }}</p>
                <p class="leading-relaxed"><strong class="text-zinc-300 font-mono">Extraction Ratio:</strong> {{ med.hepaticExtractionRatio | uppercase }}</p>
                <p class="leading-relaxed text-zinc-300"><strong class="text-zinc-400 font-mono">Rationale:</strong> {{ med.clinicalRationale }}</p>
                @if (med.safeAnalgesicAlternative) {
                  <p class="leading-relaxed text-cyan-300"><strong class="text-cyan-400 font-mono">Alternative:</strong> {{ med.safeAnalgesicAlternative }}</p>
                }
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class HepaticClearanceTitrationCardComponent {
  readonly hepatic = inject(HepaticClearanceService);

  public formatActionBadge(action: IHepaticDosingGuideline['actionRequired']): string {
    switch (action) {
      case 'contraindicated': return 'CONTRAINDICATED';
      case 'dose_reduction': return 'DOSE REDUCTION';
      case 'interval_extension': return 'INTERVAL EXTENSION';
      case 'standard': return 'STANDARD DOSE';
      default: return action;
    }
  }

  public formatAscites(ascites: AscitesGrade): string {
    switch (ascites) {
      case 'none': return 'None';
      case 'mild': return 'Mild (Diuretic-responsive)';
      case 'moderate_severe': return 'Severe / Refractory';
    }
  }

  public formatEncephalopathy(grade: EncephalopathyGrade): string {
    switch (grade) {
      case 'none': return 'None';
      case 'grade_1_2': return 'Grade 1-2 (Mild confusion)';
      case 'grade_3_4': return 'Grade 3-4 (Stupor / Coma)';
    }
  }

  public simulateScenario(
    scenario: 'compensated_class_a' | 'decompensated_class_c' | 'hepatorenal_syndrome' | 'opioid_encephalopathy_risk'
  ) {
    this.hepatic.simulateScenario(scenario);
  }

  public resetBaseline() {
    this.hepatic.setLabs(1.2, 3.8, 1.1, 1.0, 138, false);
    this.hepatic.setClinicalSigns('none', 'none');
  }
}
