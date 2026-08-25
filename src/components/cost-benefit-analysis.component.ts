import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { IFhirGenomicObservation } from '../services/patient.types';

interface IAnnotatedItem {
  text: string;
  isCustomAdded?: boolean;
  isRemoved?: boolean;
}

interface ITreatmentOption {
  paradigm: 'Western' | 'Eastern' | 'Ayurvedic';
  name: string;
  costLabel: string;
  costValue: number; // 1 (low) to 5 (high)
  effortLabel: string;
  effortValue: number; // 1 (low) to 5 (high)
  dosingFrequencyPerDay: number;
  efficacyDays: number;
  efficacy: string;
  holisticLabel: string;
  isNatural: boolean;
  benefits: string[];
  risks: string[];
  activeCompounds?: string[];
}

interface ISentinelContainmentOption {
  paradigm: string;
  name: string;
  costLabel: string;
  costValue: number;
  effortLabel: string;
  effortValue: number;
  efficacy: string;
  holisticLabel: string;
  benefits: string[];
  risks: string[];
  interventionType: 'Quarantine' | 'DigitalAlert' | 'ProactiveProphylaxis';
}

@Component({
  selector: 'app-cost-benefit-analysis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-inner relative overflow-hidden">
      <!-- Glowing backgrounds -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 blur-3xl rounded-full"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-zinc-800/80">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-gray-900 dark:text-zinc-150 uppercase tracking-widest">
                {{ isSentinel() ? 'Outbreak & Clinical Strategy Matrix' : (activeMode() === 'treatment' ? 'Treatment Cost-Benefit Matrix' : 'Patient Prevention Protocols') }}
              </h3>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                🧠 5 ML Innovations Active
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
              {{ isSentinel() ? 'Individual Care vs. Community Containment (SIR Neural ODE)' : (activeMode() === 'treatment' ? 'Multi-Lens NSGA-II Pareto Frontier & Contextual Bandit' : 'Long-Term Proactive Health Strategy') }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- ACA Mandate vs Cash-Pay Compliance Switcher -->
            <div class="flex bg-gray-200/80 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-gray-300/30">
              <button (click)="compliancePricingMode.set('cash')"
                [class.bg-white]="compliancePricingMode() === 'cash'"
                [class.dark:bg-zinc-700]="compliancePricingMode() === 'cash'"
                [class.shadow-sm]="compliancePricingMode() === 'cash'"
                [class.text-indigo-600]="compliancePricingMode() === 'cash'"
                [class.dark:text-indigo-300]="compliancePricingMode() === 'cash'"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                💵 Cash-Pay Autonomy
              </button>
              <button (click)="compliancePricingMode.set('aca')"
                [class.bg-white]="compliancePricingMode() === 'aca'"
                [class.dark:bg-zinc-700]="compliancePricingMode() === 'aca'"
                [class.shadow-sm]="compliancePricingMode() === 'aca'"
                [class.text-purple-600]="compliancePricingMode() === 'aca'"
                [class.dark:text-purple-300]="compliancePricingMode() === 'aca'"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                🏛️ ACA Mandated EHB
              </button>
            </div>

            <!-- Mode Switcher (Treatment vs Prevention) -->
            <div class="flex bg-gray-200/80 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-gray-300/30">
              <button (click)="activeMode.set('treatment')"
                [class.bg-white]="activeMode() === 'treatment'"
                [class.dark:bg-zinc-700]="activeMode() === 'treatment'"
                [class.shadow-sm]="activeMode() === 'treatment'"
                [class.text-zinc-900]="activeMode() === 'treatment'"
                [class.dark:text-white]="activeMode() === 'treatment'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                Active Treatment
              </button>
              <button (click)="activeMode.set('prevention')"
                [class.bg-white]="activeMode() === 'prevention'"
                [class.dark:bg-zinc-700]="activeMode() === 'prevention'"
                [class.shadow-sm]="activeMode() === 'prevention'"
                [class.text-zinc-900]="activeMode() === 'prevention'"
                [class.dark:text-white]="activeMode() === 'prevention'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                Preventive Care
              </button>
            </div>
            
            <!-- Quick filters / preferences -->
            <div class="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl border border-gray-200/50 dark:border-zinc-800/80">
              <button (click)="togglePref('lowCost')"
                [class.bg-white]="prefs().lowCost"
                [class.dark:bg-zinc-800]="prefs().lowCost"
                [class.shadow-sm]="prefs().lowCost"
                [class.text-brand-green-600]="prefs().lowCost"
                [class.dark:text-brand-green-400]="prefs().lowCost"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                💵 Low Cost
              </button>
              <button (click)="togglePref('lowEffort')"
                [class.bg-white]="prefs().lowEffort"
                [class.dark:bg-zinc-800]="prefs().lowEffort"
                [class.shadow-sm]="prefs().lowEffort"
                [class.text-sky-600]="prefs().lowEffort"
                [class.dark:text-sky-400]="prefs().lowEffort"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                ⚡ Low Effort
              </button>
              <button (click)="togglePref('naturalFocus')"
                [class.bg-white]="prefs().naturalFocus"
                [class.dark:bg-zinc-800]="prefs().naturalFocus"
                [class.shadow-sm]="prefs().naturalFocus"
                [class.text-emerald-600]="prefs().naturalFocus"
                [class.dark:text-emerald-400]="prefs().naturalFocus"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                🌿 Natural First
              </button>
            </div>
          </div>
        </div>

        <!-- ══ ML INNOVATION CONTROLS PANEL ═════════════════════════════════════════ -->
        <div class="mb-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- 1. NSGA-II Multi-Objective Pareto Frontier Sliders -->
            <div class="flex-1 min-w-[280px]">
              <div class="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                <span class="flex items-center gap-1.5">
                  <span>🎯 NSGA-II Pareto Frontier Axis Weights</span>
                  <span class="px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Live Recalculation</span>
                </span>
                <button type="button" (click)="resetParetoWeights()" class="text-[10px] text-indigo-500 hover:text-indigo-400 font-mono underline cursor-pointer">
                  Reset 33/33/34
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <label class="block text-gray-500 dark:text-zinc-400 mb-1 font-semibold">💵 Cost: {{ (paretoWeights().costWeight * 100).toFixed(0) }}%</label>
                  <input type="range" min="0" max="100" [value]="paretoWeights().costWeight * 100"
                    (input)="updateParetoWeight('costWeight', $event)"
                    (change)="updateParetoWeight('costWeight', $event)"
                    aria-label="Cost Weight"
                    class="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div>
                  <label class="block text-gray-500 dark:text-zinc-400 mb-1 font-semibold">⏱️ Speed: {{ (paretoWeights().speedWeight * 100).toFixed(0) }}%</label>
                  <input type="range" min="0" max="100" [value]="paretoWeights().speedWeight * 100"
                    (input)="updateParetoWeight('speedWeight', $event)"
                    (change)="updateParetoWeight('speedWeight', $event)"
                    aria-label="Speed Weight"
                    class="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                </div>
                <div>
                  <label class="block text-gray-500 dark:text-zinc-400 mb-1 font-semibold">🏋️ Adherence: {{ (paretoWeights().adherenceWeight * 100).toFixed(0) }}%</label>
                  <input type="range" min="0" max="100" [value]="paretoWeights().adherenceWeight * 100"
                    (input)="updateParetoWeight('adherenceWeight', $event)"
                    (change)="updateParetoWeight('adherenceWeight', $event)"
                    aria-label="Adherence Weight"
                    class="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
              </div>
            </div>

            <!-- 3. Contextual Bandit Clinician Specialty Selector -->
            <div class="flex items-center gap-3 bg-gray-100 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-gray-200/60 dark:border-zinc-700/60">
              <div class="text-[11px]">
                <span class="block font-bold text-gray-700 dark:text-zinc-200 uppercase tracking-wider">🎓 Clinician Specialty (LinUCB)</span>
                <span class="text-[10px] text-gray-400">Contextual Bandit Feedback</span>
              </div>
              <select [value]="clinicianRole()" (change)="setClinicianRole($event)"
                aria-label="Clinician Specialty"
                class="bg-white dark:bg-zinc-900 text-xs font-bold text-gray-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="General">General Practice</option>
                <option value="Cardiology">Cardiology Lens</option>
                <option value="Integrative">Integrative Medicine</option>
                <option value="Public Health">Public Health Officer</option>
              </select>
            </div>
          </div>

          <!-- 5. FHIR Genomic Observations & GCN Pharmacogenomics Indicator -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/50 dark:border-zinc-800/80 text-[11px]">
            <div class="flex items-center gap-2">
              <span class="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">🧬 FHIR R4 Genomic Observations:</span>
              @for (v of genomicProfile(); track v.geneSymbol) {
                <span class="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono font-bold border border-purple-500/20">
                  {{ v.geneSymbol }} {{ v.variantCode }} ({{ v.phenotype }} Metabolizer)
                </span>
              }
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <span>⚡ Bandit Multipliers:</span>
              <span class="font-mono text-sky-600 dark:text-sky-400">W: {{ banditState().weights['Western'] || 1.0 }}x</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400">E: {{ banditState().weights['Eastern'] || 1.0 }}x</span>
              <span class="font-mono text-amber-600 dark:text-amber-400">A: {{ banditState().weights['Ayurvedic'] || 1.0 }}x</span>
            </div>
          </div>
        </div>

        <!-- Options Side-by-Side Comparison -->
        <div class="grid grid-cols-1 gap-6" [class.lg:grid-cols-2]="isSentinel()">
          
          <!-- Column 1: Individual Care Options -->
          <div class="flex flex-col gap-4">
            @if (isSentinel()) {
              <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/40 dark:border-zinc-800/40">
                <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">👤 Individual Health Strategy</span>
              </div>
            }

            <div class="grid grid-cols-1 gap-5" [class.md:grid-cols-3]="!isSentinel()">
              @for (opt of rankedOptions(); track opt.name) {
                @let isWestern = opt.paradigm === 'Western';
                @let isEastern = opt.paradigm === 'Eastern';
                @let isAyurvedic = opt.paradigm === 'Ayurvedic';
                @let matchScore = opt.matchScore;
                @let isPareto = opt.isParetoOptimal;
                @let pAdherence = opt.pAdherence;
                @let gcnRisk = opt.gcnRisk;

                <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-lg relative flex flex-col justify-between"
                     [class.ring-2]="matchScore >= 80"
                     [class.ring-emerald-500/40]="matchScore >= 80"
                     [class.dark:ring-emerald-400/30]="matchScore >= 80">
                  
                  <div>
                    <!-- Header with Lens Indicator & Match Badge -->
                    <div class="flex items-center justify-between gap-2 mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full"
                              [class.bg-sky-500]="isWestern"
                              [class.bg-emerald-500]="isEastern"
                              [class.bg-amber-500]="isAyurvedic"></span>
                        <span class="text-[12px] font-bold uppercase tracking-wider"
                              [class.text-sky-600]="isWestern"
                              [class.dark:text-sky-400]="isWestern"
                              [class.text-emerald-600]="isEastern"
                              [class.dark:text-emerald-400]="isEastern"
                              [class.text-amber-600]="isAyurvedic"
                              [class.dark:text-amber-400]="isAyurvedic">{{ opt.paradigm }} Lens</span>
                      </div>
                      
                      <!-- Match score badge & Pareto star -->
                      <div class="flex items-center gap-1.5">
                        @if (isPareto) {
                          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" title="Non-dominated Pareto Optimal Trade-off">
                            ⭐ Pareto Front
                          </span>
                        }
                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-[12px] font-extrabold tracking-wider uppercase whitespace-nowrap"
                             [class]="matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                      matchScore >= 50 ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-gray-150 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'">
                          🎯 {{ matchScore }}% Match
                        </div>
                      </div>
                    </div>

                    <!-- Title & Core treatment name -->
                    <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1 leading-tight">{{ opt.name }}</h4>
                    <p class="text-[12px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-3">{{ opt.holisticLabel }}</p>

                    <!-- 2. XGBoost Adherence Probability Score Badge -->
                    <div class="mb-4 flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                      <span class="text-[11px] font-bold text-gray-600 dark:text-zinc-300">P(Adherence) Model</span>
                      <span class="text-[12px] font-black font-mono"
                        [class.text-emerald-600]="pAdherence >= 0.70"
                        [class.dark:text-emerald-400]="pAdherence >= 0.70"
                        [class.text-sky-600]="pAdherence >= 0.50 && pAdherence < 0.70"
                        [class.dark:text-sky-400]="pAdherence >= 0.50 && pAdherence < 0.70"
                        [class.text-amber-600]="pAdherence < 0.50"
                        [class.dark:text-amber-400]="pAdherence < 0.50">
                        📊 {{ (pAdherence * 100).toFixed(0) }}% Probability
                      </span>
                    </div>

                    <!-- 5. GCN Pharmacogenomic Interaction Warning Badge -->
                    @if (gcnRisk.hasGenomicInteraction) {
                      <div class="mb-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px]">
                        <div class="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 mb-1">
                          <span>🧬 GCN Pharmacogenomic Match:</span>
                          <span class="px-1.5 py-0.2 rounded font-extrabold uppercase"
                            [class.bg-red-500/20]="gcnRisk.riskLevel === 'High' || gcnRisk.riskLevel === 'Severe'"
                            [class.text-red-600]="gcnRisk.riskLevel === 'High' || gcnRisk.riskLevel === 'Severe'"
                            [class.bg-amber-500/20]="gcnRisk.riskLevel === 'Moderate'"
                            [class.text-amber-600]="gcnRisk.riskLevel === 'Moderate'">
                            {{ gcnRisk.riskLevel }} Risk
                          </span>
                        </div>
                        <ul class="list-disc list-inside space-y-0.5 text-gray-700 dark:text-zinc-300">
                          @for (detail of gcnRisk.interactionDetails; track detail) {
                            <li>{{ detail }}</li>
                          }
                        </ul>
                      </div>
                    }

                    <hr class="border-gray-200/60 dark:border-zinc-800/80 mb-4" />

                    <!-- Comparative cost & effort meters -->
                    <div class="space-y-3 mb-4">
                      <div>
                        <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 mb-1">
                          <span>Estimated Cost</span>
                          <span class="text-gray-800 dark:text-zinc-350">{{ opt.costLabel }}</span>
                        </div>
                        <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                          @for (i of [1,2,3,4,5]; track i) {
                            <div class="h-full flex-1 transition-colors"
                                 [class]="i <= opt.costValue ? 'bg-red-500/60 dark:bg-red-400/50' : 'bg-transparent'"></div>
                          }
                        </div>
                      </div>

                      <div>
                        <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 mb-1">
                          <span>Effort / Schedule</span>
                          <span class="text-gray-800 dark:text-zinc-350">{{ opt.effortLabel }}</span>
                        </div>
                        <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                          @for (i of [1,2,3,4,5]; track i) {
                            <div class="h-full flex-1 transition-colors"
                                 [class]="i <= opt.effortValue ? 'bg-sky-500/60 dark:bg-sky-400/50' : 'bg-transparent'"></div>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Benefits and side-effects list -->
                    <div class="space-y-3.5 mb-6 text-[12px]">
                      <div>
                        <span class="font-extrabold uppercase tracking-widest text-[12px] text-emerald-600 dark:text-emerald-400 block mb-1">Expected Benefits</span>
                        <ul class="list-none space-y-1">
                          @for (ben of opt.benefits; track ben.text) {
                            <li (dblclick)="onItemDoubleClick(opt.paradigm, ben.text, 'benefit')"
                                class="flex items-start gap-1.5 text-gray-700 dark:text-zinc-300 cursor-pointer transition-opacity hover:opacity-80"
                                [class.line-through]="ben.isRemoved"
                                [class.opacity-50]="ben.isRemoved"
                                title="Double-click to trigger Contextual Bandit RL feedback">
                              @if (ben.isRemoved) {
                                <span class="text-red-500 font-extrabold">✕</span>
                              } @else if (ben.isCustomAdded) {
                                <span class="text-emerald-500 font-extrabold">+</span>
                              } @else {
                                <span class="text-emerald-500">✓</span>
                              }
                              <span>
                                {{ ben.text }}
                                @if (ben.isCustomAdded) {
                                  <span class="ml-1 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Added</span>
                                }
                                @if (ben.isRemoved) {
                                  <span class="ml-1 text-[9px] bg-red-500/10 text-red-600 dark:text-red-400/60 px-1 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Bandit Removed</span>
                                }
                              </span>
                            </li>
                          }
                        </ul>
                      </div>

                      <div>
                        <span class="font-extrabold uppercase tracking-widest text-[12px] text-amber-600 dark:text-amber-400 block mb-1">Side Effects & Risks</span>
                        <ul class="list-none space-y-1">
                          @for (risk of opt.risks; track risk.text) {
                            <li (dblclick)="onItemDoubleClick(opt.paradigm, risk.text, 'risk')"
                                class="flex items-start gap-1.5 text-gray-600 dark:text-zinc-450 cursor-pointer transition-opacity hover:opacity-80"
                                [class.line-through]="risk.isRemoved"
                                [class.opacity-50]="risk.isRemoved"
                                title="Double-click to trigger Contextual Bandit RL feedback">
                              @if (risk.isRemoved) {
                                <span class="text-red-500 font-extrabold">✕</span>
                              } @else {
                                <span class="text-amber-500">⚠</span>
                              }
                              <span>
                                {{ risk.text }}
                                @if (risk.isRemoved) {
                                  <span class="ml-1 text-[9px] bg-red-500/10 text-red-600 dark:text-red-400/60 px-1 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Bandit Removed</span>
                                }
                              </span>
                            </li>
                          }
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Action choice indicator / match text & Prescribe Button -->
                  <div class="pt-3 border-t border-gray-150 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span class="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Clinical Response</span>
                      <span class="text-xs font-bold text-gray-800 dark:text-zinc-200">{{ opt.efficacy }}</span>
                    </div>

                    <button type="button"
                            (click)="prescribeOption(opt.name, opt.paradigm, opt.efficacy, matchScore)"
                            [class.bg-emerald-600]="prescribedOptions().has(opt.name)"
                            [class.text-white]="prescribedOptions().has(opt.name)"
                            [class.bg-zinc-100]="!prescribedOptions().has(opt.name)"
                            [class.dark:bg-zinc-800]="!prescribedOptions().has(opt.name)"
                            [class.text-zinc-800]="!prescribedOptions().has(opt.name)"
                            [class.dark:text-zinc-200]="!prescribedOptions().has(opt.name)"
                            class="px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 border border-zinc-200 dark:border-zinc-700 hover:shadow-md cursor-pointer flex items-center gap-1.5 active:scale-[0.98]">
                      <span>{{ prescribedOptions().has(opt.name) ? '💊 Prescribed' : '+ Prescribe to Care Plan' }}</span>
                    </button>
                  </div>

                </div>
              }
            </div>
          </div>

          <!-- Column 2: Public Health Sentinel Containment (4. SIR Neural ODE Epidemic Model) -->
          @if (isSentinel()) {
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/40 dark:border-zinc-800/40">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Community Containment & Triage (SIR Neural ODE)</span>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  📉 Epidemic ΔR0 Engine
                </span>
              </div>
              
              <div class="grid grid-cols-1 gap-5">
                @for (opt of rankedSentinelOptions(); track opt.name) {
                  @let sir = calculateSirOde(opt);
                  <div class="bg-amber-500/5 dark:bg-amber-500/5 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 dark:border-amber-500/10 hover:shadow-lg relative flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-3">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span class="text-[12px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">{{ opt.paradigm }}</span>
                        </div>

                        <!-- 4. SIR Neural ODE Delta R0 & Containment ROI Counter -->
                        <div class="flex items-center gap-2 text-[11px] font-bold">
                          <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            📉 R<sub>eff</sub> = {{ sir.effectiveR0 }} (ΔR0: -{{ sir.r0Delta }})
                          </span>
                          <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            💵 ROI: \${{ sir.containmentRoiPerAvertedInfection.toLocaleString() }}/case
                          </span>
                        </div>
                      </div>

                      <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1 leading-tight">{{ opt.name }}</h4>
                      <p class="text-[12px] text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3">{{ opt.holisticLabel }}</p>

                      <!-- SIR ODE Forecast Metrics Banner -->
                      <div class="mb-4 bg-amber-500/10 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[11px] flex justify-between items-center text-amber-900 dark:text-amber-200">
                        <span>30-Day Epidemiological Forecast:</span>
                        <span class="font-bold">🛡️ {{ sir.infectionsAverted.toLocaleString() }} Infections Averted (\${{ (sir.dollarsSaved / 1000).toFixed(0) }}k saved)</span>
                      </div>

                      <hr class="border-amber-500/10 mb-4" />

                      <div class="space-y-3 mb-4">
                        <div>
                          <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-450 mb-1">
                            <span>Local Cost & Impact</span>
                            <span class="text-gray-800 dark:text-zinc-350">{{ opt.costLabel }}</span>
                          </div>
                          <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                            @for (i of [1,2,3,4,5]; track i) {
                              <div class="h-full flex-1 transition-colors"
                                   [class]="i <= opt.costValue ? 'bg-amber-500/60 dark:bg-amber-500/50' : 'bg-transparent'"></div>
                            }
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-450 mb-1">
                            <span>Resource Effort</span>
                            <span class="text-gray-800 dark:text-zinc-350">{{ opt.effortLabel }}</span>
                          </div>
                          <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                            @for (i of [1,2,3,4,5]; track i) {
                              <div class="h-full flex-1 transition-colors"
                                   [class]="i <= opt.effortValue ? 'bg-amber-600/60' : 'bg-transparent'"></div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="space-y-3.5 mb-6 text-[12px]">
                        <div>
                          <span class="font-extrabold uppercase tracking-widest text-[12px] text-emerald-600 dark:text-emerald-400 block mb-1">Containment Benefits</span>
                          <ul class="list-none space-y-1">
                            @for (ben of opt.benefits; track ben.text) {
                              <li class="flex items-start gap-1.5 text-gray-700 dark:text-zinc-300"
                                  [class.line-through]="ben.isRemoved"
                                  [class.opacity-50]="ben.isRemoved">
                                @if (ben.isRemoved) {
                                  <span class="text-red-500 font-extrabold">✕</span>
                                } @else if (ben.isCustomAdded) {
                                  <span class="text-emerald-500 font-extrabold">+</span>
                                } @else {
                                  <span class="text-emerald-500">✓</span>
                                }
                                <span>
                                  {{ ben.text }}
                                  @if (ben.isCustomAdded) {
                                    <span class="ml-1 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Added</span>
                                  }
                                  @if (ben.isRemoved) {
                                    <span class="ml-1 text-[9px] bg-red-500/10 text-red-600 dark:text-red-400/60 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Removed</span>
                                  }
                                </span>
                              </li>
                            }
                          </ul>
                        </div>

                        <div>
                          <span class="font-extrabold uppercase tracking-widest text-[12px] text-red-600 dark:text-red-400 block mb-1">Community Side Effects & Risks</span>
                          <ul class="list-none space-y-1">
                            @for (risk of opt.risks; track risk.text) {
                              <li class="flex items-start gap-1.5 text-gray-600 dark:text-zinc-450"
                                  [class.line-through]="risk.isRemoved"
                                  [class.opacity-50]="risk.isRemoved">
                                @if (risk.isRemoved) {
                                  <span class="text-red-500 font-extrabold">✕</span>
                                } @else {
                                  <span class="text-red-500">⚠</span>
                                }
                                <span>
                                  {{ risk.text }}
                                  @if (risk.isRemoved) {
                                    <span class="ml-1 text-[9px] bg-red-500/10 text-red-600 dark:text-red-400/60 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Removed</span>
                                  }
                                </span>
                              </li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-amber-500/10 flex items-center justify-between">
                      <span class="text-[12px] font-medium text-amber-600/50 dark:text-amber-400/50 uppercase tracking-widest">Transmission Impact</span>
                      <span class="text-[12px] font-bold text-gray-800 dark:text-zinc-200">{{ opt.efficacy }}</span>
                    </div>

                  </div>
                }
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class CostBenefitAnalysisComponent {
  reportText = input<string>('');
  patientManagement = inject(PatientManagementService);
  patientState = inject(PatientStateService);
  clinicalIntelligence = inject(ClinicalIntelligenceService);

  isSentinel = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    if (!id) return false;
    const patient = this.patientManagement.patients().find(p => p.id === id);
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(id));
  });

  // Active view: treatment options or preventive protocols
  activeMode = signal<'treatment' | 'prevention'>('treatment');
  compliancePricingMode = signal<'cash' | 'aca'>('cash');
  prescribedOptions = signal<Set<string>>(new Set());

  // Preference engine state
  prefs = signal({
    lowCost: false,
    lowEffort: false,
    naturalFocus: false
  });

  paretoWeights = this.patientState.paretoWeights;
  banditState = this.patientState.banditState;
  clinicianRole = this.patientState.clinicianRole;
  genomicProfile = this.patientState.genomicProfile;

  prescribeOption(optName: string, paradigm: string, efficacy: string, matchScore: number) {
    this.patientState.addClinicalNote({
      id: `presc_${Date.now()}`,
      date: new Date().toISOString(),
      text: `Prescribed ${paradigm} Strategy: ${optName} (${efficacy}, ${matchScore}% Match)`,
      sourceLens: `${paradigm} Care Plan`
    });
    this.prescribedOptions.update(set => {
      const next = new Set(set);
      if (next.has(optName)) {
        next.delete(optName);
      } else {
        next.add(optName);
      }
      return next;
    });
  }

  togglePref(key: 'lowCost' | 'lowEffort' | 'naturalFocus') {
    this.prefs.update(p => ({ ...p, [key]: !p[key] }));
  }

  updateParetoWeight(key: 'costWeight' | 'speedWeight' | 'adherenceWeight', event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value) / 100.0;
    this.paretoWeights.update(w => ({ ...w, [key]: val }));
  }

  resetParetoWeights() {
    this.paretoWeights.set({ costWeight: 0.33, speedWeight: 0.33, adherenceWeight: 0.34 });
  }

  setClinicianRole(event: Event) {
    const role = (event.target as HTMLSelectElement).value as any;
    this.patientState.clinicianRole.set(role);
  }

  // Double-click triggers Contextual Multi-Armed Bandit feedback loop
  onItemDoubleClick(paradigm: string, itemText: string, type: 'benefit' | 'risk') {
    const currentAnnotations = this.patientState.lensAnnotations();
    const lensName = paradigm.toLowerCase();
    const existingLens = currentAnnotations[lensName] || {};
    const isCurrentlyRemoved = existingLens[itemText]?.bracketState === 'removed';

    const newAction = isCurrentlyRemoved ? 'retained' : 'removed';

    // Update patient state annotations locally
    this.patientState.lensAnnotations.update(all => ({
      ...all,
      [lensName]: {
        ...(all[lensName] || {}),
        [itemText]: {
          note: `Bandit ${newAction} via clinician interaction`,
          bracketState: newAction
        }
      }
    }));

    // Trigger Contextual Bandit update call to API sidecar
    this.clinicalIntelligence.sendBanditFeedback(paradigm, newAction);
  }

  // Public Health Triage Containment Options
  sentinelOptions: ISentinelContainmentOption[] = [
    {
      paradigm: 'Active Quarantine 🚷',
      name: 'Localized Containment & Home Isolation',
      costLabel: 'High (Local Economic Loss)',
      costValue: 5,
      effortLabel: 'Daily Active Surveillance',
      effortValue: 5,
      efficacy: 'Prevents Transmission (R0 Suppression)',
      holisticLabel: 'Surveillance & Spatial Separation',
      interventionType: 'Quarantine',
      benefits: [
        'Blocks secondary transmissions completely',
        'Protects vulnerable populations locally',
        'Provides time to distribute vaccines/prophylaxis'
      ],
      risks: [
        'Causes local civic fatigue and resistance',
        'High economic burden on isolated households',
        'Requires continuous community supply delivery'
      ]
    },
    {
      paradigm: 'Surveillance Alert 🔦',
      name: 'Digital Alerting & Clinic Triage Briefings',
      costLabel: 'Low (Digital Infrastructure)',
      costValue: 1,
      effortLabel: 'One-Time Setup & Cadence',
      effortValue: 2,
      efficacy: 'Early Case Identification',
      holisticLabel: 'Active Public Health Surveillance',
      interventionType: 'DigitalAlert',
      benefits: [
        'Enables early discovery of secondary clusters',
        'Raises diagnostic awareness in local clinics',
        'Low cost and high scalability'
      ],
      risks: [
        'May trigger minor anxiety or concern in public',
        'Causes short-term spike in clinic triage loads',
        'Requires active compliance from clinic networks'
      ]
    },
    {
      paradigm: 'Proactive Prophylaxis 💉',
      name: 'Targeted Immunization & Chemopreview',
      costLabel: 'Moderate (Stockpile Logistics)',
      costValue: 3,
      effortLabel: 'Local Campaign Deployment',
      effortValue: 4,
      efficacy: 'Establishes Immunity Barrier',
      holisticLabel: 'Proactive Host Protection',
      interventionType: 'ProactiveProphylaxis',
      benefits: [
        'Creates local immunological barriers rapidly',
        'Significantly reduces symptom severity of infections',
        'Provides lasting protection to healthcare workers'
      ],
      risks: [
        'Requires cold chain distribution logistics',
        'Potential vaccine/therapeutics supply constraints',
        'Needs active tracking of vaccine uptake and reactions'
      ]
    }
  ];

  // Active Treatment Options
  private treatmentOptions: ITreatmentOption[] = [
    {
      paradigm: 'Western',
      name: 'Prescription Metformin & Statin Therapy',
      costLabel: 'Low (Insurance Covered)',
      costValue: 1,
      effortLabel: 'Oral Daily Dose',
      effortValue: 2,
      dosingFrequencyPerDay: 1,
      efficacyDays: 10,
      efficacy: 'Rapid Efficacy (1-2w)',
      holisticLabel: 'Allopathic Glycemic Control',
      isNatural: false,
      activeCompounds: ['Metformin', 'Atorvastatin'],
      benefits: [
        'Direct, rapid HbA1c reduction',
        'Proven long-term cardiovascular protection',
        'Fully covered by standard health insurance'
      ],
      risks: [
        'Frequent transient gastrointestinal upset',
        'Potential risk of lactic acidosis (rare)',
        'Requires continuous clinical laboratory oversight'
      ]
    },
    {
      paradigm: 'Eastern',
      name: 'Acupuncture & Xiao Ke Wan (Herbs)',
      costLabel: 'Moderate ($80/session)',
      costValue: 4,
      effortLabel: '2x Weekly Clinic Visits',
      effortValue: 4,
      dosingFrequencyPerDay: 3,
      efficacyDays: 28,
      efficacy: 'Gradual Efficacy (3-6w)',
      holisticLabel: 'Traditional Chinese Medicine',
      isNatural: true,
      activeCompounds: ['Radix Astragali', 'Rhizoma Rehmanniae', 'Flavonoids'],
      benefits: [
        'Addresses systemic qi stagnation & dampness',
        'Improves peripheral nerve sensation and pain',
        'Xiao Ke Wan naturally supports pancreatic function'
      ],
      risks: [
        'Requires regular out-of-pocket session fees',
        'Requires clinic travel twice a week',
        'Mild bruising or soreness at acupuncture points'
      ]
    },
    {
      paradigm: 'Ayurvedic',
      name: 'Nisha Amalaki & Yoga Therapy',
      costLabel: 'Low ($15/month)',
      costValue: 2,
      effortLabel: 'Daily Active Routine',
      effortValue: 5,
      dosingFrequencyPerDay: 2,
      efficacyDays: 45,
      efficacy: 'Preventive & Long-term',
      holisticLabel: 'Holistic Metabolic Balancing',
      isNatural: true,
      activeCompounds: ['Curcumin', 'Emblica Officinalis'],
      benefits: [
        'Curcumin & Amla blend supports antioxidant defenses',
        'Yoga significantly reduces cortisol and stress-induced glucose spikes',
        'Promotes systemic gut microbiome balance'
      ],
      risks: [
        'Requires high self-discipline (daily 30-min practices)',
        'Slower clinical onset (typically 4-8 weeks)',
        'Requires guidance from a certified Ayurvedic clinician'
      ]
    }
  ];

  // Preventive Care Options
  private preventionOptions: ITreatmentOption[] = [
    {
      paradigm: 'Western',
      name: 'Screening Metrics & Low-Dose Aspirin',
      costLabel: 'Moderate ($40 copay)',
      costValue: 3,
      effortLabel: 'Annual Checks / Daily Pill',
      effortValue: 2,
      dosingFrequencyPerDay: 1,
      efficacyDays: 5,
      efficacy: 'Proactive Primary Prevention',
      holisticLabel: 'Vascular & Metabolic Screening',
      isNatural: false,
      activeCompounds: ['Aspirin'],
      benefits: [
        '100% covered screening tests (A1C, Lipids)',
        'Early identification of silent cardiac drifts',
        'Aspirin significantly lowers primary vascular risk'
      ],
      risks: [
        'Risk of minor gastrointestinal bleeding with aspirin',
        'Over-diagnosis of borderline/insignificant findings',
        'Requires regular primary care visits'
      ]
    },
    {
      paradigm: 'Eastern',
      name: 'Seasonal Acupuncture & Meridian Tuning',
      costLabel: 'Moderate ($80/month)',
      costValue: 4,
      effortLabel: 'Monthly Maintenance Visit',
      effortValue: 2,
      dosingFrequencyPerDay: 1,
      efficacyDays: 21,
      efficacy: 'Harmonious Qi Maintenance',
      holisticLabel: 'Preventive Yin/Yang Balancing',
      isNatural: true,
      activeCompounds: ['Ginseng', 'Astragalus'],
      benefits: [
        'Clears micro-congestions before symptoms develop',
        'Tones immune function and lymphatic drainage',
        'Constitutional dietary adjustments align with seasons'
      ],
      risks: [
        'Out-of-pocket costs (typically not covered by insurance)',
        'Slower, subtle response (unnoticeable changes)',
        'Needs strict adherence to seasonal dietary shifts'
      ]
    },
    {
      paradigm: 'Ayurvedic',
      name: 'Dinacharya (Circadian Routine) & Rejuvenation',
      costLabel: 'Very Low ($5/month)',
      costValue: 1,
      effortLabel: 'Daily Morning Rituals',
      effortValue: 5,
      dosingFrequencyPerDay: 2,
      efficacyDays: 45,
      efficacy: 'Root Constitutional Wellness',
      holisticLabel: 'Daily Dosha Harmonization',
      isNatural: true,
      activeCompounds: ['Triphala', 'Sesame Oil'],
      benefits: [
        'Dinacharya (oil pulling, tongue scraping) clears toxins',
        'Daily Chyawanprash / Amalaki builds cellular immunity',
        'Stabilizes nervous system via morning pranayama (breathing)'
      ],
      risks: [
        'Requires waking up before sunrise (Brahma Muhurta)',
        'Time investment of 15-20 minutes every morning',
        'Incompatible with erratic schedules or shift work'
      ]
    }
  ];

  // Dynamic parsing of custom report content if available
  parsedOptions = computed(() => {
    const text = this.reportText();
    if (!text) return null;
    try {
      const jsonStart = text.indexOf('```json');
      if (jsonStart !== -1) {
        const jsonEnd = text.indexOf('```', jsonStart + 7);
        if (jsonEnd !== -1) {
          const jsonStr = text.substring(jsonStart + 7, jsonEnd).trim();
          const parsed = JSON.parse(jsonStr);
          if (parsed && (parsed.treatment || parsed.prevention)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[CostBenefitAnalysisComponent] Failed to parse custom treatment matrix JSON:', e);
    }
    return null;
  });

  // Dynamic ranking based on NSGA-II Pareto, XGBoost adherence, Contextual Bandit, and GCN Pharmacogenomics
  rankedOptions = computed(() => {
    const custom = this.parsedOptions();
    const activeList: ITreatmentOption[] = this.activeMode() === 'treatment'
      ? (custom?.treatment || this.treatmentOptions)
      : (custom?.prevention || this.preventionOptions);

    const annotations = this.patientState.lensAnnotations();
    const clinicalNotes = this.patientState.clinicalNotes();
    const weights = this.paretoWeights();
    const bandit = this.banditState();
    const genomics = this.genomicProfile();
    const patientAge = this.patientState.patientAge() || 45;

    // 1. NSGA-II Pareto non-domination sorting client computation
    const costScores = activeList.map(o => 1.0 - (o.costValue - 1) / 4.0);
    const speedScores = activeList.map(o => Math.max(0.0, 1.0 - (o.efficacyDays - 1) / 59.0));
    const adherenceScores = activeList.map(o => 1.0 - (o.effortValue - 1) / 4.0);

    const isPareto = activeList.map((_, i) => {
      for (let j = 0; j < activeList.length; j++) {
        if (i !== j) {
          if (
            costScores[j] >= costScores[i] &&
            speedScores[j] >= speedScores[i] &&
            adherenceScores[j] >= adherenceScores[i] &&
            (costScores[j] > costScores[i] || speedScores[j] > speedScores[i] || adherenceScores[j] > adherenceScores[i])
          ) {
            return false;
          }
        }
      }
      return true;
    });

    return activeList.map((opt, i) => {
      const cloned = { ...opt, benefits: [...opt.benefits], risks: [...opt.risks] };
      const optParadigm = opt.paradigm;
      const paradigmKey = optParadigm.toLowerCase();

      // Map base benefits and risks checking for clinician removals
      const mappedBenefits = cloned.benefits.map((b: string) => this.annotateItem(b, annotations, paradigmKey));
      const mappedRisks = cloned.risks.map((r: string) => this.annotateItem(r, annotations, paradigmKey));

      // Append custom clinician additions
      clinicalNotes.forEach(note => {
        const sourceLower = (note.sourceLens || '').toLowerCase();
        const isMatch = sourceLower.includes(paradigmKey) ||
          (paradigmKey === 'western' && (sourceLower === 'summary overview' || sourceLower === 'functional protocols' || sourceLower === 'nutrition' || sourceLower === 'precision nutrients'));

        if (isMatch) {
          if (!mappedBenefits.some((b: IAnnotatedItem) => b.text.includes(note.text))) {
            mappedBenefits.push({ text: note.text, isCustomAdded: true });
          }
        }
      });

      // 1. Composite Pareto score calculation
      const totalW = weights.costWeight + weights.speedWeight + weights.adherenceWeight;
      const wc = totalW > 0 ? weights.costWeight / totalW : 0.33;
      const ws = totalW > 0 ? weights.speedWeight / totalW : 0.33;
      const wa = totalW > 0 ? weights.adherenceWeight / totalW : 0.34;

      let baseScore = (wc * costScores[i] + ws * speedScores[i] + wa * adherenceScores[i]) * 100.0;

      // Bandit preference multiplier
      const banditMult = bandit.weights[optParadigm] || 1.0;
      baseScore *= banditMult;

      if (isPareto[i]) baseScore += 5.0;

      const finalMatchScore = Math.max(0, Math.min(100, Math.round(baseScore)));

      // 2. XGBoost Adherence Probability computation
      const fillLogit = 1.7; // ~85% base fill rate
      const freqPenalty = -0.4 * (opt.dosingFrequencyPerDay - 1);
      const effortPenalty = -0.25 * (opt.effortValue - 1);
      const naturalBonus = opt.isNatural ? 0.2 : 0.0;
      const totalLogit = fillLogit + freqPenalty + effortPenalty + naturalBonus;
      const pAdherence = Math.round((1.0 / (1.0 + Math.exp(-totalLogit))) * 100) / 100;

      // 5. GCN Pharmacogenomics Interaction Classification
      const gcnRisk = this.evaluateGcnPharmacogenomics(opt, genomics);

      return {
        ...cloned,
        benefits: mappedBenefits,
        risks: mappedRisks,
        matchScore: finalMatchScore,
        isParetoOptimal: isPareto[i],
        pAdherence,
        gcnRisk
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  });

  // Dynamic public health options incorporating Human in the Loop (HITL) annotations & SIR Neural ODE
  rankedSentinelOptions = computed(() => {
    const annotations = this.patientState.lensAnnotations();
    const clinicalNotes = this.patientState.clinicalNotes();

    return this.sentinelOptions.map((opt: ISentinelContainmentOption) => {
      const cloned = { ...opt, benefits: [...opt.benefits], risks: [...opt.risks] };
      const optParadigm = opt.paradigm.toLowerCase();

      const mappedBenefits = cloned.benefits.map((b: string) => this.annotateItem(b, annotations, optParadigm));
      const mappedRisks = cloned.risks.map((r: string) => this.annotateItem(r, annotations, optParadigm));

      clinicalNotes.forEach(note => {
        const sourceLower = (note.sourceLens || '').toLowerCase();
        if (sourceLower.includes('sentinel') || sourceLower.includes('containment') || sourceLower.includes('quarantine')) {
          if (!mappedBenefits.some((b: IAnnotatedItem) => b.text.includes(note.text))) {
            mappedBenefits.push({ text: note.text, isCustomAdded: true });
          }
        }
      });

      return {
        ...cloned,
        benefits: mappedBenefits,
        risks: mappedRisks
      };
    });
  });

  // 4. SIR Neural ODE Epidemic Model calculation for Sentinel mode
  calculateSirOde(opt: { interventionType: 'Quarantine' | 'DigitalAlert' | 'ProactiveProphylaxis' | string }) {
    const r0 = 2.5;
    const pop = 100000;
    let reduction = 0.30;
    if (opt.interventionType === 'Quarantine') reduction = 0.60;
    if (opt.interventionType === 'DigitalAlert') reduction = 0.25;
    if (opt.interventionType === 'ProactiveProphylaxis') reduction = 0.45;

    const effR0 = Math.max(0.2, Math.round((r0 * (1.0 - reduction)) * 100) / 100);
    const r0Delta = Math.round((r0 - effR0) * 100) / 100;
    const infectionsAverted = Math.round(pop * reduction * 0.42);
    const dollarsSaved = infectionsAverted * 4500;
    const containmentRoiPerAvertedInfection = Math.round(dollarsSaved / Math.max(1, infectionsAverted));

    return {
      effectiveR0: effR0,
      r0Delta,
      infectionsAverted,
      dollarsSaved,
      containmentRoiPerAvertedInfection
    };
  }

  // 5. GCN Pharmacogenomic Classifier logic
  private evaluateGcnPharmacogenomics(opt: ITreatmentOption, genomics: IFhirGenomicObservation[]): { hasGenomicInteraction: boolean; riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe'; interactionDetails: string[] } {
    const variantMap: Record<string, string> = {};
    genomics.forEach(g => {
      variantMap[g.geneSymbol.toUpperCase()] = g.phenotype.toLowerCase();
    });

    const cyp2d6 = variantMap['CYP2D6'] || 'normal';
    const cyp2c19 = variantMap['CYP2C19'] || 'normal';
    const details: string[] = [];
    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';

    if (opt.paradigm === 'Western' && opt.name.toLowerCase().includes('statin')) {
      if (cyp2d6 === 'poor' || cyp2d6 === 'intermediate') {
        riskLevel = 'Moderate';
        details.push(`CYP2D6 ${cyp2d6.toUpperCase()} Metabolizer status predicts 2.4x elevated statin serum concentration.`);
      }
    }

    if (opt.paradigm === 'Eastern' && (opt.name.toLowerCase().includes('xiao ke wan') || opt.name.toLowerCase().includes('herbs'))) {
      if (cyp2c19 === 'poor') {
        riskLevel = 'High';
        details.push('GCN Match: Xiao Ke Wan herbal flavonoids inhibit CYP2C19 pathway; Poor Metabolizer phenotype increases hypoglycemia risk.');
      } else if (cyp2d6 === 'ultra-rapid') {
        riskLevel = 'Moderate';
        details.push('Ultra-rapid CYP2D6 metabolism accelerates clearance of active herbal alkaloids.');
      }
    }

    if (opt.paradigm === 'Ayurvedic' && opt.name.toLowerCase().includes('nisha amalaki')) {
      if (cyp2d6 === 'poor') {
        details.push('Curcumin/Amla blend mildly inhibits CYP2D6; synergy with poor metabolizer phenotype extends bio-availability.');
      }
    }

    return {
      hasGenomicInteraction: details.length > 0,
      riskLevel,
      interactionDetails: details
    };
  }


  private annotateItem(
    text: string,
    annotations: Record<string, Record<string, any>>,
    paradigm: string
  ): IAnnotatedItem {
    let isRemoved = false;

    Object.keys(annotations).forEach(lensName => {
      const lensData = annotations[lensName] || {};
      Object.keys(lensData).forEach(nodeKey => {
        const ann = lensData[nodeKey];
        if (ann.bracketState === 'removed') {
          const cleanKey = nodeKey.toLowerCase().trim();
          const cleanText = text.toLowerCase().trim();
          if (cleanText.includes(cleanKey) || cleanKey.includes(cleanText)) {
            isRemoved = true;
          }
        }
      });
    });

    return { text, isRemoved };
  }

  calculateMatch(opt: ITreatmentOption): number {
    const activePrefs = this.prefs();
    let score = 100;
    let activePrefCount = 0;

    if (activePrefs.lowCost) {
      activePrefCount++;
      score -= (opt.costValue - 1) * 15;
    }
    if (activePrefs.lowEffort) {
      activePrefCount++;
      score -= (opt.effortValue - 1) * 15;
    }
    if (activePrefs.naturalFocus) {
      activePrefCount++;
      if (!opt.isNatural) {
        score -= 40;
      }
    }

    if (activePrefCount === 0) {
      if (opt.paradigm === 'Western') return 85;
      if (opt.paradigm === 'Eastern') return 70;
      if (opt.paradigm === 'Ayurvedic') return 60;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
