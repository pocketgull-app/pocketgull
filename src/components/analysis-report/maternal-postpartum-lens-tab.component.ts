import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaternalPostpartumService, ILactMedEntry } from '../../services/maternal-postpartum.service';
import { ReproductiveAutonomyService, IContraceptiveMethod, IEmergencyContraceptionOption } from '../../services/reproductive-autonomy.service';
import { SovereigntyHealthModelsService } from '../../services/sovereignty-health-models.service';

@Component({
  selector: 'app-maternal-postpartum-lens-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6 text-slate-100 font-sans">
      <!-- Discreet Mode Decoy Screen (Triggered by privacy toggle or panic scrub) -->
      @if (repro.enclaveState().discreetDecoyActive) {
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">🩺</span>
              <div>
                <h3 class="text-base font-semibold text-white">General Reference: Adult Daily Micronutrient Guidelines</h3>
                <p class="text-xs text-slate-400">Dietary Reference Intakes (DRI) & Tolerable Upper Intake Levels</p>
              </div>
            </div>
            <button
              type="button"
              (click)="repro.toggleDiscreetDecoy()"
              class="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
              Exit Reference View
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th class="p-2.5">Micronutrient</th>
                  <th class="p-2.5">Adult RDA (Male)</th>
                  <th class="p-2.5">Adult RDA (Female)</th>
                  <th class="p-2.5">Upper Limit (UL)</th>
                  <th class="p-2.5">Key Dietary Sources</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr>
                  <td class="p-2.5 font-bold text-white">Vitamin D3 (Cholecalciferol)</td>
                  <td class="p-2.5">600 - 800 IU</td>
                  <td class="p-2.5">600 - 800 IU</td>
                  <td class="p-2.5">4,000 IU</td>
                  <td class="p-2.5 text-slate-400">Fatty fish, UV-irradiated fungi, fortified foods</td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">Magnesium (Glycinate/Malate)</td>
                  <td class="p-2.5">400 - 420 mg</td>
                  <td class="p-2.5">310 - 320 mg</td>
                  <td class="p-2.5">350 mg (suppl.)</td>
                  <td class="p-2.5 text-slate-400">Pumpkin seeds, spinach, black beans, cacao</td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">Zinc (Picolinate/Bisglycinate)</td>
                  <td class="p-2.5">11 mg</td>
                  <td class="p-2.5">8 mg</td>
                  <td class="p-2.5">40 mg</td>
                  <td class="p-2.5 text-slate-400">Oysters, pumpkin seeds, lentils, grass-fed beef</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- Main Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-zinc-900 to-purple-950/40 border border-purple-500/30 shadow-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🌸</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold text-white tracking-tight">Women's Health, Reproductive Autonomy & Perinatal Continuum</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
                    Patient-Centered Bodily Sovereignty
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">
                  Private, non-judgmental decision support: Contraceptive CDC MEC, Emergency Contraception, Pregnancy Options, and 4th-Trimester recovery.
                </p>
              </div>
            </div>

            <!-- Action Controls & Privacy Protection -->
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                (click)="repro.toggleDiscreetDecoy()"
                title="Instantly display an innocuous reference table"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition">
                <span>🛡️</span> Discreet Mode
              </button>
              <button
                type="button"
                (click)="repro.executeEmergencyScrub()"
                title="Wipes session data and engages decoy view immediately"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/70 hover:bg-rose-900/90 border border-rose-700/80 rounded-xl transition">
                <span>⚡</span> Rapid Scrub
              </button>
              <button
                type="button"
                (click)="exportRestrictedBundle()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-950 hover:bg-purple-900 border border-purple-700/60 rounded-xl transition">
                <span>🔒</span> Export FHIR (Restricted 'R')
              </button>
            </div>
          </div>

          <!-- Section Sub-Navigation Tabs -->
          <div class="mt-6 flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              (click)="activeSection.set('autonomy')"
              [class.text-purple-300]="activeSection() === 'autonomy'"
              [class.border-purple-500]="activeSection() === 'autonomy'"
              [class.border-transparent]="activeSection() !== 'autonomy'"
              [class.text-slate-400]="activeSection() !== 'autonomy'"
              class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5">
              <span>⚖️</span> Reproductive Autonomy & Right to Choose
            </button>
            <button
              type="button"
              (click)="activeSection.set('postpartum')"
              [class.text-purple-300]="activeSection() === 'postpartum'"
              [class.border-purple-500]="activeSection() === 'postpartum'"
              [class.border-transparent]="activeSection() !== 'postpartum'"
              [class.text-slate-400]="activeSection() !== 'postpartum'"
              class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5">
              <span>🤰</span> 4th-Trimester Postpartum & LactMed
            </button>
          </div>
        </div>

        <!-- SECTION 1: REPRODUCTIVE AUTONOMY & THE RIGHT TO CHOOSE -->
        @if (activeSection() === 'autonomy') {
          <div class="space-y-6">
            <!-- Autonomy Sub-Menu (Contraception vs Emergency vs Options vs Privacy) -->
            <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                (click)="repro.setCounselingTopic('contraception')"
                [class.bg-purple-600]="repro.activeCounselingTopic() === 'contraception'"
                [class.text-white]="repro.activeCounselingTopic() === 'contraception'"
                [class.text-slate-400]="repro.activeCounselingTopic() !== 'contraception'"
                class="px-3.5 py-1.5 rounded-lg transition font-medium">
                Contraceptive Options (CDC MEC)
              </button>
              <button
                type="button"
                (click)="repro.setCounselingTopic('emergency')"
                [class.bg-purple-600]="repro.activeCounselingTopic() === 'emergency'"
                [class.text-white]="repro.activeCounselingTopic() === 'emergency'"
                [class.text-slate-400]="repro.activeCounselingTopic() !== 'emergency'"
                class="px-3.5 py-1.5 rounded-lg transition font-medium">
                Emergency Contraception & Timelines
              </button>
              <button
                type="button"
                (click)="repro.setCounselingTopic('options')"
                [class.bg-purple-600]="repro.activeCounselingTopic() === 'options'"
                [class.text-white]="repro.activeCounselingTopic() === 'options'"
                [class.text-slate-400]="repro.activeCounselingTopic() !== 'options'"
                class="px-3.5 py-1.5 rounded-lg transition font-medium">
                Pregnancy Options & Abortion Care
              </button>
              <button
                type="button"
                (click)="repro.setCounselingTopic('models')"
                [class.bg-purple-600]="repro.activeCounselingTopic() === 'models'"
                [class.text-white]="repro.activeCounselingTopic() === 'models'"
                [class.text-slate-400]="repro.activeCounselingTopic() !== 'models'"
                class="px-3.5 py-1.5 rounded-lg transition font-medium">
                PCOS & Endometriosis Calculators
              </button>
              <button
                type="button"
                (click)="repro.setCounselingTopic('privacy')"
                [class.bg-purple-600]="repro.activeCounselingTopic() === 'privacy'"
                [class.text-white]="repro.activeCounselingTopic() === 'privacy'"
                [class.text-slate-400]="repro.activeCounselingTopic() !== 'privacy'"
                class="px-3.5 py-1.5 rounded-lg transition font-medium">
                Zero-Knowledge Privacy Architecture
              </button>
            </div>

            <!-- TAB A: CONTRACEPTIVE COUNSELING & CDC MEC -->
            @if (repro.activeCounselingTopic() === 'contraception') {
              <div class="space-y-4">
                <!-- Patient Risk Factor Toggles -->
                <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Clinical Risk Factors (Evaluates CDC Medical Eligibility Criteria 1-4)</span>
                    <span class="text-[11px] text-slate-400">Toggle to dynamically recalculate contraindications</span>
                  </div>
                  <div class="flex flex-wrap gap-2 text-xs">
                    @for (risk of riskFactorOptions; track risk) {
                      <button
                        type="button"
                        (click)="toggleRisk(risk)"
                        [class.bg-purple-900]="repro.patientMedicalRiskFactors().includes(risk)"
                        [class.text-purple-200]="repro.patientMedicalRiskFactors().includes(risk)"
                        [class.border-purple-600]="repro.patientMedicalRiskFactors().includes(risk)"
                        [class.bg-slate-950]="!repro.patientMedicalRiskFactors().includes(risk)"
                        [class.text-slate-400]="!repro.patientMedicalRiskFactors().includes(risk)"
                        class="px-3 py-1 rounded-lg border border-slate-700/80 transition">
                        {{ risk }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Contraceptive Methods Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (method of repro.evaluatedContraceptives(); track method.id) {
                    <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition">
                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-800/40">
                            {{ method.category }}
                          </span>
                          <span
                            class="px-2 py-0.5 rounded text-[11px] font-bold border"
                            [ngClass]="getMecBadgeClass(method.mecScore)">
                            CDC MEC Cat {{ method.mecScore }}
                          </span>
                        </div>
                        <h4 class="text-sm font-bold text-white">{{ method.name }}</h4>
                        <p class="text-xs text-slate-400">{{ method.mechanismOfAction }}</p>
                      </div>

                      <div class="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div class="flex items-center justify-between text-slate-300">
                          <span>Typical Failure Rate:</span>
                          <span class="font-mono font-bold text-emerald-300">{{ method.typicalFailureRatePercent }}%</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-300">
                          <span>Duration / Usage:</span>
                          <span class="text-slate-400 text-[11px]">{{ method.durationOrFrequency }}</span>
                        </div>
                        <div class="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                          <strong class="text-slate-200">MEC Assessment:</strong> {{ method.mecRationale }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- TAB B: EMERGENCY CONTRACEPTION & TIMELINES -->
            @if (repro.activeCounselingTopic() === 'emergency') {
              <div class="space-y-6">
                <!-- Elapsed Time & BMI Calculator HUD -->
                <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <h4 class="text-sm font-bold text-white">Emergency Contraception Efficacy Estimator</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Hours Slider -->
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-300 font-medium">Hours Elapsed Since Unprotected Coitus:</span>
                        <span class="font-mono font-bold text-purple-300">{{ repro.elapsedHoursPostUnprotected() }} hours</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="144"
                        [ngModel]="repro.elapsedHoursPostUnprotected()"
                        (ngModelChange)="repro.setElapsedHours($event)"
                        class="w-full accent-purple-500 cursor-pointer" />
                      <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0h (Immediate)</span>
                        <span>72h (Plan B window)</span>
                        <span>120h (ella & IUD cutoff)</span>
                      </div>
                    </div>

                    <!-- BMI Slider -->
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-300 font-medium">Patient BMI (Body Mass Index):</span>
                        <span class="font-mono font-bold" [class.text-amber-300]="repro.patientBmi() >= 26">
                          {{ repro.patientBmi() }} kg/m²
                        </span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="45"
                        step="0.5"
                        [ngModel]="repro.patientBmi()"
                        (ngModelChange)="repro.setBmi($event)"
                        class="w-full accent-purple-500 cursor-pointer" />
                      <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>18.5 (Normal)</span>
                        <span>25 (Overweight)</span>
                        <span>30+ (Obese)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Emergency Options Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (ec of repro.dynamicEmergencyGuidance(); track ec.methodName) {
                    <div
                      class="p-4 bg-slate-900 border rounded-xl flex flex-col justify-between space-y-3"
                      [ngClass]="ec.isWithinWindow ? 'border-slate-800' : 'border-rose-900/50 opacity-70'">
                      <div class="space-y-2">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                            {{ ec.type }}
                          </span>
                          <span
                            class="px-2 py-0.5 rounded text-[11px] font-bold"
                            [ngClass]="ec.isWithinWindow ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'">
                            {{ ec.efficacyRating }}
                          </span>
                        </div>
                        <h4 class="text-sm font-bold text-white">{{ ec.methodName }}</h4>
                        <p class="text-xs text-slate-400">{{ ec.mechanism }}</p>
                      </div>

                      <div class="space-y-2 pt-2 border-t border-slate-800 text-xs">
                        <div class="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-medium"
                             [ngClass]="ec.clinicalNote.includes('WARNING') ? 'text-amber-300' : (ec.clinicalNote.includes('GOLD') ? 'text-emerald-300' : 'text-slate-300')">
                          {{ ec.clinicalNote }}
                        </div>
                        <div class="text-[11px] text-slate-400">
                          <strong class="text-slate-300">Access:</strong> {{ ec.otcAvailability }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- TAB C: PREGNANCY OPTIONS & ABORTION CARE INFORMATION -->
            @if (repro.activeCounselingTopic() === 'options') {
              <div class="space-y-6">
                <!-- 3 Equal Pathways Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  @for (pw of repro.pregnancyPathways; track pw.pathway) {
                    <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <span class="text-lg">
                            {{ pw.pathway.includes('Abortion') ? '⚖️' : (pw.pathway.includes('Parenting') ? '🌱' : '🤝') }}
                          </span>
                          <h4 class="text-base font-bold text-white">{{ pw.pathway }}</h4>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed">{{ pw.summary }}</p>

                        <div class="pt-2 space-y-1.5">
                          <span class="text-[11px] font-bold uppercase text-purple-400">Clinical Milestones & Evidence:</span>
                          <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            @for (m of pw.clinicalMilestones; track m) {
                              <li class="text-[11px] leading-tight text-slate-300">{{ m }}</li>
                            }
                          </ul>
                        </div>
                      </div>

                      <div class="pt-3 border-t border-slate-800 space-y-2">
                        <span class="text-[11px] font-bold uppercase text-slate-400">Confidential Resources:</span>
                        <div class="space-y-1.5">
                          @for (res of pw.supportDirectory; track res.name) {
                            <div class="p-2 rounded bg-slate-950 border border-slate-800 text-xs space-y-0.5">
                              <div class="flex justify-between items-center">
                                <span class="font-bold text-white">{{ res.name }}</span>
                                <span class="text-[10px] text-purple-300 font-mono">{{ res.contactUrlOrPhone }}</span>
                              </div>
                              <p class="text-[11px] text-slate-400">{{ res.description }}</p>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Evidence-Based Medication Abortion Fact Sheet & Red Flags -->
                <div class="p-6 bg-slate-950 border border-purple-900/40 rounded-2xl space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 class="text-base font-bold text-white">Medication Abortion: Evidence-Based Clinical Fact Sheet (ACOG & WHO)</h4>
                      <p class="text-xs text-slate-400">Mifepristone 200mg + Misoprostol 800mcg Protocol up to 70–77 days gestation</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      98%+ Success Rate
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <!-- Red Flag Warning Signs -->
                    <div class="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
                      <span class="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🚨</span> Red Flag Emergency Complications (Requires Immediate Care)
                      </span>
                      <ul class="text-rose-200/90 space-y-1.5 list-disc list-inside text-[11px]">
                        @for (rf of repro.medicationAbortionProtocol.redFlagEmergencySigns; track rf) {
                          <li>{{ rf }}</li>
                        }
                      </ul>
                      <p class="text-[10px] text-rose-300/80 pt-1 font-mono">
                        Note: Ectopic pregnancy must be excluded if severe unyielding unilateral pelvic pain occurs.
                      </p>
                    </div>

                    <!-- Clinical Myths vs Scientific Facts -->
                    <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <span class="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🔬</span> Scientific Consensus (Debunking Disinformation)
                      </span>
                      <div class="space-y-2 text-[11px]">
                        @for (myth of repro.medicationAbortionProtocol.falsifiedMythsDebunked; track myth) {
                          <div class="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
                            {{ myth }}
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- TAB: PCOS & ENDOMETRIOSIS CALCULATORS -->
            @if (repro.activeCounselingTopic() === 'models') {
              <div class="space-y-6">
                <!-- 1. PCOS Rotterdam Phenotyper & HOMA-IR Card -->
                <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 class="text-base font-bold text-white">PCOS Rotterdam Phenotyper & HOMA-IR Engine</h4>
                      <p class="text-xs text-slate-400">Classifies individual Rotterdam phenotypes (A-D) and computes insulin resistance (HOMA-IR cutoff &ge; 2.0).</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800">
                      {{ sovereignty.pcosEvaluation().phenotype }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span class="text-slate-400 block text-[10px]">Fasting Glucose (mg/dL)</span>
                      <input
                        type="number"
                        [ngModel]="sovereignty.fastingGlucoseMgDl()"
                        (ngModelChange)="sovereignty.fastingGlucoseMgDl.set($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                    </div>

                    <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span class="text-slate-400 block text-[10px]">Fasting Insulin (µU/mL)</span>
                      <input
                        type="number"
                        [ngModel]="sovereignty.fastingInsulinUuMl()"
                        (ngModelChange)="sovereignty.fastingInsulinUuMl.set($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                    </div>

                    <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span class="text-slate-400 block text-[10px]">Total Testosterone (ng/dL)</span>
                      <input
                        type="number"
                        [ngModel]="sovereignty.totalTestosteroneNgDl()"
                        (ngModelChange)="sovereignty.totalTestosteroneNgDl.set($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                    </div>

                    <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span class="text-slate-400 block text-[10px]">SHBG (nmol/L)</span>
                      <input
                        type="number"
                        [ngModel]="sovereignty.shbgNmolL()"
                        (ngModelChange)="sovereignty.shbgNmolL.set($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                    </div>
                  </div>

                  <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-400 text-[10px] uppercase font-bold">HOMA-IR Score:</span>
                      <span class="font-mono font-bold" [class.text-amber-400]="sovereignty.pcosEvaluation().insulinResistanceDetected" [class.text-emerald-400]="!sovereignty.pcosEvaluation().insulinResistanceDetected">
                        {{ sovereignty.pcosEvaluation().homaIrScore }} ({{ sovereignty.pcosEvaluation().insulinResistanceDetected ? 'Insulin Resistance Present' : 'Normal Insulin Sensitivity' }})
                      </span>
                    </div>
                    <p class="text-slate-300 text-[11px] leading-relaxed">{{ sovereignty.pcosEvaluation().clinicalRationale }}</p>

                    <div class="pt-1 space-y-1">
                      <span class="text-purple-300 uppercase text-[10px] font-bold">Targeted Therapeutics & Inositol Guidance:</span>
                      <ul class="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        @for (reg of sovereignty.pcosEvaluation().recommendedNutraceuticalRegimen; track reg) {
                          <li>{{ reg }}</li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- 2. Endometriosis Pelvic Pain Index (EPI) Card -->
                <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 class="text-base font-bold text-white">Endometriosis Pelvic Pain Index (EPI)</h4>
                      <p class="text-xs text-slate-400">Bayesian diagnostic probability model combating the 7-10 year diagnostic delay for deep endometriosis.</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg text-xs font-mono border"
                          [ngClass]="sovereignty.endometriosisEvaluation().probabilityScorePercent >= 70 ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'">
                      Probability: {{ sovereignty.endometriosisEvaluation().probabilityScorePercent }}%
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div class="space-y-3">
                      <div>
                        <div class="flex justify-between mb-1">
                          <span class="text-slate-300">Menstrual Pain Severity (0-10):</span>
                          <span class="font-mono text-purple-300 font-bold">{{ sovereignty.dysmenorrheaSeverity() }} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          [ngModel]="sovereignty.dysmenorrheaSeverity()"
                          (ngModelChange)="sovereignty.dysmenorrheaSeverity.set($event)"
                          class="w-full accent-purple-500 cursor-pointer" />
                      </div>

                      <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                        <span class="text-slate-300">Deep Dyspareunia (Pain during intercourse)</span>
                        <input
                          type="checkbox"
                          [ngModel]="sovereignty.deepDyspareunia()"
                          (ngModelChange)="sovereignty.deepDyspareunia.set($event)"
                          class="w-4 h-4 accent-purple-500 rounded" />
                      </label>

                      <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                        <span class="text-slate-300">Catamenial Dyschezia (Painful bowel movements during menses)</span>
                        <input
                          type="checkbox"
                          [ngModel]="sovereignty.dyschezia()"
                          (ngModelChange)="sovereignty.dyschezia.set($event)"
                          class="w-4 h-4 accent-purple-500 rounded" />
                      </label>
                    </div>

                    <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <span class="text-purple-300 uppercase text-[10px] font-bold block">Clinical Triage Recommendation:</span>
                      <div class="font-bold text-white">{{ sovereignty.endometriosisEvaluation().riskTier }}</div>
                      <p class="text-slate-300 text-[11px] leading-relaxed">{{ sovereignty.endometriosisEvaluation().recommendedClinicalAction }}</p>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- TAB D: ZERO-KNOWLEDGE PRIVACY -->
            @if (repro.activeCounselingTopic() === 'privacy') {
              <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">🔐</span>
                  <div>
                    <h4 class="text-base font-bold text-white">Client-Side Zero-Knowledge Cryptographic Enclave</h4>
                    <p class="text-xs text-slate-400">Protecting digital footprints and reproductive data against post-Dobbs surveillance</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span class="text-purple-400 font-bold uppercase text-[10px]">Zero Cloud Egress</span>
                    <p class="text-slate-300 text-[11px]">
                      No cycle data, pregnancy queries, or contraceptive logs ever touch external cloud servers. All evaluation occurs in local browser WASM memory.
                    </p>
                  </div>
                  <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span class="text-purple-400 font-bold uppercase text-[10px]">Zero Ad Trackers / Pixels</span>
                    <p class="text-slate-300 text-[11px]">
                      PocketGull strictly prohibits Google Analytics, Meta Pixels, or third-party ad networks that harvest reproductive intent or location telemetry.
                    </p>
                  </div>
                  <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span class="text-purple-400 font-bold uppercase text-[10px]">FHIR R4 Restricted ('R')</span>
                    <p class="text-slate-300 text-[11px]">
                      All generated clinical bundles tag confidentiality as 'Restricted' or 'Very Restricted', preventing automated EHR data sharing without express consent.
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- SECTION 2: 4TH-TRIMESTER POSTPARTUM & LACTMED -->
        @if (activeSection() === 'postpartum') {
          <div class="space-y-6">
            <!-- Telemetry HUD Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Lactation Safety</span>
                <div class="text-lg font-bold text-emerald-400">L1 — Safest</div>
                <span class="text-[11px] text-slate-400 font-sans">LactMed verified compatibility</span>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1" [class.border-rose-700]="maternal.isHighRiskEpds()">
                <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">EPDS Mood Screener</span>
                <div class="text-lg font-bold" [ngClass]="maternal.isHighRiskEpds() ? 'text-rose-400' : 'text-emerald-400'">
                  {{ maternal.epdsScore().totalScore }} / 30
                </div>
                <span class="text-[11px] text-slate-400 font-sans">{{ maternal.epdsScore().severity }}</span>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Resting HR Recovery</span>
                <div class="text-lg font-bold text-purple-300">{{ maternal.maternalVitals().restingHeartRateBpm }} bpm</div>
                <span class="text-[11px] text-slate-400 font-sans">BP: {{ maternal.maternalVitals().systolicBp }}/{{ maternal.maternalVitals().diastolicBp }} mmHg</span>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Sleep Fragmentation</span>
                <div class="text-lg font-bold text-amber-300">{{ maternal.maternalVitals().sleepDurationHours }}h ({{ maternal.maternalVitals().sleepFragmentationAwakenings }}x waking)</div>
                <span class="text-[11px] text-slate-400 font-sans">Hydration: {{ maternal.maternalVitals().hydrationLiters }} L/day</span>
              </div>
            </div>

            <!-- EPDS & LactMed Columns -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- EPDS Assessment Card (6 cols) -->
              <div class="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 class="text-base font-bold text-white">Edinburgh Postnatal Depression Scale (EPDS)</h4>
                    <p class="text-xs text-slate-400">LOINC: 71354-5 &bull; Validated 10-Item Perinatal Instrument</p>
                  </div>
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg border"
                    [ngClass]="maternal.isHighRiskEpds() ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'">
                    Score: {{ maternal.epdsScore().totalScore }}
                  </span>
                </div>

                @if (maternal.epdsScore().criticalAlert) {
                  <div class="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200">
                    <strong>CRITICAL SAFETY ALERT:</strong> Item 10 endorsed positive for self-harm thoughts. Immediate doula/midwifery support and clinical safety plan activated.
                  </div>
                }

                <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  @for (q of epdsQuestionLabels; track $index) {
                    <div class="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                      <div class="text-xs font-medium text-slate-300">
                        <span class="font-bold text-purple-400">{{ $index + 1 }}.</span> {{ q }}
                      </div>
                      <div class="grid grid-cols-4 gap-1.5 text-xs font-mono">
                        @for (opt of [0, 1, 2, 3]; track opt) {
                          <button
                            type="button"
                            (click)="maternal.setEpdsAnswer($index, opt)"
                            [class.bg-purple-600]="maternal.epdsAnswers()[$index] === opt"
                            [class.text-white]="maternal.epdsAnswers()[$index] === opt"
                            [class.bg-slate-900]="maternal.epdsAnswers()[$index] !== opt"
                            [class.text-slate-400]="maternal.epdsAnswers()[$index] !== opt"
                            class="py-1.5 rounded-lg border border-slate-700/60 hover:bg-purple-900/40 transition">
                            {{ opt }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- LactMed Medication Safety Checker (6 cols) -->
              <div class="lg:col-span-6 space-y-6">
                <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 class="text-base font-bold text-white">LactMed &copy; Medication Safety Index</h4>
                      <p class="text-xs text-slate-400">Relative Infant Dose (RID%) & Milk-to-Plasma Partitioning</p>
                    </div>
                    <span class="text-xs font-mono text-emerald-400 font-semibold">NCBI Bookshelf</span>
                  </div>

                  <div class="relative">
                    <input
                      type="text"
                      [(ngModel)]="searchMedName"
                      placeholder="Search drug (e.g. Sertraline, Ibuprofen, Codeine)..."
                      class="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>

                  @if (activeLactMed(); as med) {
                    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-bold text-white">{{ med.drugName }}</span>
                        <span class="px-2.5 py-0.5 rounded text-xs font-semibold border" [ngClass]="getLactMedBadgeClass(med.riskTier)">
                          {{ med.riskTier }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-300 leading-relaxed">{{ med.clinicalSummary }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      }

      <!-- Export Notification Toast -->
      @if (exportSuccessMessage()) {
        <div class="p-3 bg-emerald-950 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportSuccessMessage() }}</span>
          <button (click)="exportSuccessMessage.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class MaternalPostpartumLensTabComponent {
  public maternal = inject(MaternalPostpartumService);
  public repro = inject(ReproductiveAutonomyService);
  public sovereignty = inject(SovereigntyHealthModelsService);

  public activeSection = signal<'autonomy' | 'postpartum'>('autonomy');
  public searchMedName = signal<string>('Sertraline');
  public exportSuccessMessage = signal<string | null>(null);

  readonly riskFactorOptions = [
    'None',
    'Migraine with Aura',
    'Smoking Age > 35',
    'Severe Hypertension',
    'Immediate Postpartum (< 3 weeks)'
  ];

  readonly epdsQuestionLabels = [
    'I have been able to laugh and see the bright side of things',
    'I have looked forward with enjoyment to things',
    'I have blamed myself unnecessarily when things went wrong',
    'I have been anxious or worried for no good reason',
    'I have felt scared or panicky without much reason',
    'Things have been getting on top of me',
    'I have been so unhappy that I have had difficulty sleeping',
    'I have felt sad or miserable',
    'I have been so unhappy that I have been crying',
    'The thought of harming myself has occurred to me'
  ];

  toggleRisk(risk: string): void {
    const isCurrentlyActive = this.repro.patientMedicalRiskFactors().includes(risk);
    this.repro.setRiskFactor(risk, !isCurrentlyActive);
  }

  activeLactMed(): ILactMedEntry | null {
    const q = this.searchMedName() || 'Sertraline';
    return this.maternal.lookupLactMedSafety(q);
  }

  getLactMedBadgeClass(tier: string): string {
    if (tier.startsWith('L1') || tier.startsWith('L2')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    } else if (tier.startsWith('L3')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    } else {
      return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    }
  }

  getMecBadgeClass(score: number): string {
    switch (score) {
      case 1:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 2:
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case 3:
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 4:
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  }

  exportRestrictedBundle(): void {
    const bundle = this.repro.exportRestrictedFhirR4Bundle('homo-sapiens-34y');
    this.exportSuccessMessage.set(
      `Generated FHIR R4 Bundle with Confidentiality Code '${bundle['meta']?.security?.[0]?.code}' (Restricted Zero-Egress Tag).`
    );
  }
}
