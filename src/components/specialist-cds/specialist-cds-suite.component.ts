import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type SpecialistDiscipline =
  | 'cardiology'
  | 'oncology'
  | 'nephrology'
  | 'emergency'
  | 'psychiatry'
  | 'obgyn'
  | 'endocrinology'
  | 'infectious_disease'
  | 'neurology'
  | 'rheumatology';

export interface ISpecialistTool {
  id: SpecialistDiscipline;
  name: string;
  icon: string;
  subspecialty: string;
  guidelineBody: string;
  summary: string;
}

@Component({
  selector: 'app-specialist-cds-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="specialist-cds-container bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-100 shadow-2xl space-y-6">
      <!-- Header with Clinical Telemetry -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏥</span>
            <h2 class="text-lg font-bold tracking-tight text-white font-pocketgull-inter">
              Specialist Clinical Decision Support (CDS) Suite
            </h2>
            <span class="px-2 py-0.5 text-xs font-mono font-bold bg-teal-950/80 text-teal-300 border border-teal-700/50 rounded-full">
              10 Sub-Specialties
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Guideline-grounded precision clinical adapters conforming to FDA 21 CFR §520(o) Non-Device CDS & AHA/NCCN/KDIGO standards.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300">
            Active Adapter: <strong class="text-teal-400">{{ activeTool().name }}</strong>
          </span>
        </div>
      </div>

      <!-- Discipline Selector Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2" role="tablist" aria-label="Specialist Disciplines">
        @for (tool of specialistTools; track tool.id) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="selectedDiscipline() === tool.id"
            (click)="selectedDiscipline.set(tool.id)"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left"
            [ngClass]="{
              'bg-teal-950/60 border-teal-500/80 text-teal-200 shadow-sm shadow-teal-950': selectedDiscipline() === tool.id,
              'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700': selectedDiscipline() !== tool.id
            }">
            <span class="text-base">{{ tool.icon }}</span>
            <div class="truncate">
              <div class="font-bold truncate">{{ tool.name }}</div>
              <div class="text-[10px] text-zinc-500 truncate">{{ tool.subspecialty }}</div>
            </div>
          </button>
        }
      </div>

      <!-- Active Discipline Workspace -->
      <div class="workspace-card bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-6">
        <!-- Sub-Specialty Banner -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ activeTool().icon }}</span>
              <h3 class="font-bold text-sm text-zinc-200">{{ activeTool().name }} — {{ activeTool().subspecialty }}</h3>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">{{ activeTool().summary }}</p>
          </div>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-amber-800/40 shrink-0">
            📜 {{ activeTool().guidelineBody }}
          </span>
        </div>

        <!-- 1. CARDIOLOGY: 4-Pillar GDMT -->
        @if (selectedDiscipline() === 'cardiology') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">LVEF (%):</label>
                <input type="number" [(ngModel)]="cardioLvef" min="10" max="75" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Systolic BP (mmHg):</label>
                <input type="number" [(ngModel)]="cardioSbp" min="70" max="220" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Serum K+ (mEq/L):</label>
                <input type="number" [(ngModel)]="cardioK" step="0.1" min="2.5" max="7.0" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
            </div>

            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-teal-400">AHA/ACC 4-Pillar GDMT Evaluation:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded" [ngClass]="cardioLvef() <= 40 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-green-950 text-green-300 border border-green-800'">
                  {{ cardioLvef() <= 40 ? 'HFrEF (LVEF ≤ 40%) - Full 4-Pillars Indicated' : 'HFpEF / Preserved Ejection Fraction' }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="font-semibold text-teal-300">1. ARNI (Sacubitril/Valsartan)</div>
                  <div class="text-zinc-400 text-[11px] mt-0.5">
                    {{ cardioSbp() >= 100 ? '✅ 24/26 mg PO BID standard initiation' : '⚠️ SBP < 100 mmHg: Initiate with caution or low-dose ACEi' }}
                  </div>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="font-semibold text-teal-300">2. Beta-Blocker (Metoprolol Succinate / Carvedilol)</div>
                  <div class="text-zinc-400 text-[11px] mt-0.5">✅ Class 1A mortality reduction; titrate q2w to HR 60-70 bpm</div>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="font-semibold text-teal-300">3. MRA (Spironolactone 12.5-25mg QD)</div>
                  <div class="text-zinc-400 text-[11px] mt-0.5">
                    {{ cardioK() < 5.0 ? '✅ Serum K+ < 5.0 mEq/L (Safe to initiate)' : '❌ HOLD: Serum K+ ≥ 5.0 mEq/L (Hyperkalemia Risk)' }}
                  </div>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="font-semibold text-teal-300">4. SGLT2i (Dapagliflozin 10mg / Empagliflozin 10mg)</div>
                  <div class="text-zinc-400 text-[11px] mt-0.5">✅ Cardiorenal unburdening regardless of diabetes status</div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 2. ONCOLOGY: NGS Kinase Variant Matcher -->
        @if (selectedDiscipline() === 'oncology') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Target Gene & Driver Mutation:</label>
                <select [(ngModel)]="oncoGene" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white">
                  <option value="EGFR_EX19DEL">EGFR Exon 19 Deletion (Sensitizing)</option>
                  <option value="EGFR_L858R">EGFR L858R Point Mutation</option>
                  <option value="KRAS_G12C">KRAS G12C Mutation</option>
                  <option value="ALK_FUSION">EML4-ALK Translocation / Fusion</option>
                  <option value="BRAF_V600E">BRAF V600E Mutation</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">PD-L1 Expression (TPS %):</label>
                <input type="number" [(ngModel)]="oncoPdl1" min="0" max="100" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
            </div>

            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>🎯 NCCN Category 1 Targeted Protocol:</span>
              </div>
              <div class="text-xs text-zinc-300">
                @if (oncoGene() === 'EGFR_EX19DEL' || oncoGene() === 'EGFR_L858R') {
                  <p><strong class="text-teal-300">Osimertinib 80 mg PO QD:</strong> Third-generation CNS-penetrant EGFR TKI. Superior PFS/OS vs 1st gen agents.</p>
                  <p class="text-amber-300 text-[11px] mt-1">⚠️ <strong>Immunotherapy Warning:</strong> Withhold single-agent anti-PD-1/PD-L1 despite TPS {{ oncoPdl1() }}% due to lack of efficacy in driver mutations and severe pneumonitis risk.</p>
                } @else if (oncoGene() === 'KRAS_G12C') {
                  <p><strong class="text-teal-300">Sotorasib 960 mg PO QD / Adagrasib 600 mg PO BID:</strong> Irreversible covalent switch-II pocket KRAS(G12C) inhibitor.</p>
                } @else if (oncoGene() === 'ALK_FUSION') {
                  <p><strong class="text-teal-300">Alectinib 600 mg PO BID / Brigatinib 180 mg PO QD:</strong> Highly potent Next-Gen ALK inhibitors with robust CNS intracranial response.</p>
                } @else if (oncoGene() === 'BRAF_V600E') {
                  <p><strong class="text-teal-300">Dabrafenib 150 mg PO BID + Trametinib 2 mg PO QD:</strong> Dual BRAF/MEK kinase cascade inhibition.</p>
                }
              </div>
            </div>
          </div>
        }

        <!-- 3. NEPHROLOGY: 3-Phase Hyperkalemia Sequencer -->
        @if (selectedDiscipline() === 'nephrology') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Serum Potassium (mEq/L):</label>
                <input type="number" [(ngModel)]="nephroK" step="0.1" min="3.0" max="9.0" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">eGFR (mL/min/1.73m²):</label>
                <input type="number" [(ngModel)]="nephroEgfr" min="5" max="120" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
            </div>

            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-red-400">STAT 3-Phase Hyperkalemia Resuscitation Sequence:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  {{ nephroK() >= 6.5 ? 'CRITICAL EMERGENCY (K ≥ 6.5)' : (nephroK() >= 5.5 ? 'MODERATE HYPERKALEMIA' : 'MILD / STABLE') }}
                </span>
              </div>
              <ol class="text-xs space-y-2 text-zinc-300 list-decimal list-inside">
                <li><strong class="text-amber-300">Phase 1 (Cardiomyocyte Membrane Stabilization):</strong> Calcium Gluconate 10% 1,000 mg (10 mL) IV over 2-3 min. Repeats in 5-10 min if peaked T-waves persist.</li>
                <li><strong class="text-teal-300">Phase 2 (Intracellular Shifting):</strong> Regular Insulin 10 Units IV bolus + 50 mL D50W (25g Dextrose) + Albuterol 10-20 mg nebulized.</li>
                <li><strong class="text-blue-300">Phase 3 (Total Body Excretion):</strong> Sodium Zirconium Cyclosilicate (Lokelma 10g PO TID) or IV Furosemide; prepare emergent hemodialysis if refractory.</li>
              </ol>
            </div>
          </div>
        }

        <!-- 4. EMERGENCY: Shock Index & Trauma MTP -->
        @if (selectedDiscipline() === 'emergency') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Heart Rate (bpm):</label>
                <input type="number" [(ngModel)]="emHr" min="30" max="220" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Systolic BP (mmHg):</label>
                <input type="number" [(ngModel)]="emSbp" min="40" max="220" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
              </div>
            </div>

            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400">Shock Index (HR / SBP):</span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded" [ngClass]="shockIndex() > 0.9 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-green-950 text-green-300 border border-green-800'">
                  {{ shockIndex() | number:'1.2-2' }} (Normal: 0.5 - 0.7)
                </span>
              </div>
              <div class="text-xs text-zinc-300">
                @if (shockIndex() >= 0.9) {
                  <p class="text-red-300 font-bold">🚨 HIGH RISK OF OCCULT HEMORRHAGIC SHOCK (SI ≥ 0.9)</p>
                  <ul class="list-disc list-inside text-[11px] space-y-1 text-zinc-300 mt-1">
                    <li>Activate Massive Transfusion Protocol (MTP) with 1:1:1 ratio (PRBC : FFP : Platelets).</li>
                    <li>Administer Tranexamic Acid (TXA) 1g IV over 10 min (within 3h window) $\to$ 1g IV over 8h.</li>
                    <li>Permissive hypotension target (MAP 55-65 mmHg / SBP ~90 mmHg) until surgical hemostasis.</li>
                  </ul>
                } @else {
                  <p class="text-green-300 font-medium">✅ Hemodynamically compensated (Low probability of massive transfusion requirement).</p>
                }
              </div>
            </div>
          </div>
        }

        <!-- 5. PSYCHIATRY: 5-Week Washout & Serotonin Shield -->
        @if (selectedDiscipline() === 'psychiatry') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center gap-2 text-xs font-bold text-purple-400">
                <span>🛡️ Pharmacogenomic Washout & Serotonin Syndrome Protection:</span>
              </div>
              <div class="text-xs text-zinc-300 space-y-2">
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span class="font-bold text-red-300">Fluoxetine $\to$ MAOI (Phenelzine) Transition:</span>
                  <p class="text-zinc-400 text-[11px] mt-1">
                    Mandates a strict <strong>5-WEEK (35-DAY) complete washout period</strong> due to prolonged norfluoxetine metabolite half-life ($\sim 16$ days).
                  </p>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span class="font-bold text-amber-300">C-SSRS Crisis Containment:</span>
                  <p class="text-zinc-400 text-[11px] mt-1">
                    Daily suicide safety checks during medication transition + lethal means counseling + 988 Lifeline integration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 6. OB/GYN: Severe Preeclampsia Protocol -->
        @if (selectedDiscipline() === 'obgyn') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-pink-400">ACOG Severe Preeclampsia Neuroprotection Protocol:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800">
                  ACOG Clinical Standard
                </span>
              </div>
              <div class="text-xs text-zinc-300 space-y-2">
                <p><strong>1. Seizure Prophylaxis:</strong> Magnesium Sulfate 4-6g IV loading dose over 15-20 min $\to$ 1-2g/hr continuous maintenance infusion. (Keep Calcium Gluconate at bedside as antidote).</p>
                <p><strong>2. Emergent Antihypertensive:</strong> IV Labetalol 20mg bolus (repeat with 40mg, 80mg) or IV Hydralazine 5-10mg. Goal BP 140-150 / 90-100 mmHg.</p>
                <p><strong>3. Fetal Lung Maturity:</strong> Betamethasone 12mg IM q24h x 2 doses if &lt; 37 weeks.</p>
              </div>
            </div>
          </div>
        }

        <!-- 7. ENDOCRINOLOGY: CGM AGP & Basal Adjustment -->
        @if (selectedDiscipline() === 'endocrinology') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-blue-400">Ambulatory Glucose Profile (AGP) Targets:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  ADA Standards of Care
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-400">Time-In-Range (70-180 mg/dL):</div>
                  <div class="font-bold text-green-400 text-sm mt-0.5">Target &gt; 70%</div>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-400">Time-Below-Range (&lt; 70 mg/dL):</div>
                  <div class="font-bold text-red-400 text-sm mt-0.5">Target &lt; 4%</div>
                </div>
                <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <div class="text-zinc-400">Glycemic Variability (CV):</div>
                  <div class="font-bold text-amber-400 text-sm mt-0.5">Target ≤ 36%</div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 8. INFECTIOUS DISEASE: CAP Step-Down Engine -->
        @if (selectedDiscipline() === 'infectious_disease') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-400">IDSA Antimicrobial Stewardship CAP Step-Down:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  5-Day Course Optimization
                </span>
              </div>
              <div class="text-xs text-zinc-300 space-y-2">
                <p><strong>De-escalation Criteria:</strong> Afebrile &gt; 24h, stable vitals (HR &lt; 100, RR &lt; 24, SBP &gt; 90), tolerating PO, negative MRSA nasal swab.</p>
                <p><strong>Step-Down Regimen:</strong> Transition from IV Vancomycin/Cefepime to oral Amoxicillin 1,000mg PO TID for pan-susceptible S. pneumoniae.</p>
                <p class="text-emerald-300 font-bold">Total Duration: 5 days total (prohibit arbitrary 10-14 day courses).</p>
              </div>
            </div>
          </div>
        }

        <!-- 9. NEUROLOGY: Acute Stroke Tenecteplase Checklist -->
        @if (selectedDiscipline() === 'neurology') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-400">AHA/ASA Acute Ischemic Stroke Thrombolysis:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  4.5-Hour Golden Window
                </span>
              </div>
              <div class="text-xs text-zinc-300 space-y-2">
                <p><strong>Tenecteplase (TNK-tPA):</strong> 0.25 mg/kg IV single bolus over 5 seconds (max 25 mg).</p>
                <p><strong>Safety Gates:</strong> Non-contrast CT head negative for hemorrhage, BP &lt; 185/110 mmHg, INR ≤ 1.7, Platelets &ge; 100k.</p>
                <p><strong>LVO Screening:</strong> STAT CTA head/neck for Endovascular Thrombectomy (EVT) candidate within 24 hours.</p>
              </div>
            </div>
          </div>
        }

        <!-- 10. RHEUMATOLOGY: 2019 EULAR/ACR SLE Classifier -->
        @if (selectedDiscipline() === 'rheumatology') {
          <div class="space-y-4">
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-rose-400">2019 EULAR/ACR SLE Classification Criteria:</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Entry: ANA ≥ 1:80
                </span>
              </div>
              <div class="text-xs text-zinc-300 space-y-2">
                <p><strong>Clinical Pillars:</strong> Symmetric polyarthritis, malar rash sparing nasolabial folds, mucosal ulcers, active sediment nephritis.</p>
                <p><strong>Immunologic Serology:</strong> Anti-dsDNA, Anti-Smith, Hypocomplementemia (low C3/C4).</p>
                <p><strong>First-Line Standard:</strong> Hydroxychloroquine 5 mg/kg actual body weight PO QD + baseline retinal OCT.</p>
              </div>
            </div>
          </div>
        }

        <!-- Action Bar: Dispatch Steered Literature Search -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-zinc-800">
          <div class="text-[11px] text-zinc-500 font-mono">
            ⚡ One-Click Evidence Steering dispatched to Research Frame
          </div>
          <button
            type="button"
            (click)="steerEvidence()"
            class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-950 flex items-center justify-center gap-2">
            <span>🎯 Steer Research Frame ({{ activeTool().name }})</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class SpecialistCdsSuiteComponent {
  steeredQuery = output<string>();

  selectedDiscipline = signal<SpecialistDiscipline>('cardiology');

  // Cardiology signals
  cardioLvef = signal<number>(32);
  cardioSbp = signal<number>(118);
  cardioK = signal<number>(4.4);

  // Oncology signals
  oncoGene = signal<string>('EGFR_EX19DEL');
  oncoPdl1 = signal<number>(15);

  // Nephrology signals
  nephroK = signal<number>(6.8);
  nephroEgfr = signal<number>(22);

  // Emergency signals
  emHr = signal<number>(134);
  emSbp = signal<number>(78);

  shockIndex = computed(() => {
    const sbp = this.emSbp();
    return sbp > 0 ? this.emHr() / sbp : 0;
  });

  specialistTools: ISpecialistTool[] = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      icon: '🫀',
      subspecialty: '4-Pillar GDMT & Hemodynamics',
      guidelineBody: 'AHA / ACC / HFSA 2022',
      summary: 'Automated 4-pillar GDMT titration (ARNI, Beta-blocker, MRA, SGLT2i) and renal/potassium safety thresholds.'
    },
    {
      id: 'oncology',
      name: 'Oncology',
      icon: '🔬',
      subspecialty: 'Molecular Tumor Board',
      guidelineBody: 'NCCN Category 1 / ASCO',
      summary: 'Actionable NGS kinase driver matching (EGFR, KRAS, ALK) and checkpoint immunotherapy contraindication warnings.'
    },
    {
      id: 'nephrology',
      name: 'Nephrology',
      icon: '🧪',
      subspecialty: 'Electrolyte Crises & Renal Dosing',
      guidelineBody: 'KDIGO 2024 / CKD-EPI',
      summary: 'STAT 3-phase hyperkalemia resuscitation sequence and 2021 race-free eGFR staging.'
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: '⚡',
      subspecialty: 'Shock Index & Trauma MTP',
      guidelineBody: 'ACLS / ATLS / CRASH-2',
      summary: 'Real-time Shock Index calculation, balanced 1:1:1 Massive Transfusion Protocol, and early TXA delivery.'
    },
    {
      id: 'psychiatry',
      name: 'Psychiatry',
      icon: '🧠',
      subspecialty: 'Washout & Serotonin Shield',
      guidelineBody: 'APA Guidelines / C-SSRS',
      summary: 'Mandatory 5-week Fluoxetine-to-MAOI washout, suicide safety checks, and Tyramine counseling.'
    },
    {
      id: 'obgyn',
      name: 'OB / GYN',
      icon: '🤰',
      subspecialty: 'Severe Preeclampsia & Teratology',
      guidelineBody: 'ACOG Practice Bulletin 222',
      summary: 'Magnesium Sulfate seizure prophylaxis, emergent IV Labetalol BP reduction, and fetal lung maturity.'
    },
    {
      id: 'endocrinology',
      name: 'Endocrinology',
      icon: '🩸',
      subspecialty: 'CGM AGP & AID Optimization',
      guidelineBody: 'ADA Standards of Care 2026',
      summary: 'Time-in-Range targets (> 70%), elimination of nocturnal hypoglycemia (TBR < 4%), and CV variability bounds.'
    },
    {
      id: 'infectious_disease',
      name: 'Infectious Dis',
      icon: '🦠',
      subspecialty: 'Antimicrobial Stewardship',
      guidelineBody: 'IDSA / ATS CAP Guidelines',
      summary: 'MRSA nasal swab guided de-escalation from Vancomycin/Cefepime to oral Amoxicillin bounded to 5 days.'
    },
    {
      id: 'neurology',
      name: 'Neurology',
      icon: '🧠',
      subspecialty: 'Acute Stroke & Thrombolysis',
      guidelineBody: 'AHA / ASA Stroke Guidelines',
      summary: 'Tenecteplase (TNK-tPA) 0.25 mg/kg 4.5h checklist, CTA LVO candidate triage, and post-TNK BP limits.'
    },
    {
      id: 'rheumatology',
      name: 'Rheumatology',
      icon: '🦴',
      subspecialty: 'Autoimmune Serology & SLE',
      guidelineBody: '2019 EULAR / ACR Classification',
      summary: 'Multiplex autoantibody triangulation, safe 5 mg/kg Hydroxychloroquine dosing, and STAT renal biopsy.'
    }
  ];

  activeTool = computed(() => {
    const disc = this.selectedDiscipline();
    return this.specialistTools.find(t => t.id === disc) || this.specialistTools[0];
  });

  steerEvidence(): void {
    const tool = this.activeTool();
    const queryMap: Record<SpecialistDiscipline, string> = {
      cardiology: 'AHA ACC guideline directed medical therapy HFrEF sacubitril valsartan SGLT2i',
      oncology: 'Osimertinib EGFR exon 19 deletion non small cell lung cancer NCCN trial',
      nephrology: 'Acute hyperkalemia calcium gluconate insulin shifting KDIGO clinical protocol',
      emergency: 'Trauma shock index massive transfusion protocol tranexamic acid CRASH-2',
      psychiatry: 'Fluoxetine monoamine oxidase inhibitor washout serotonin syndrome APA',
      obgyn: 'ACOG severe preeclampsia magnesium sulfate labetalol betamethasone',
      endocrinology: 'Continuous glucose monitoring ambulatory glucose profile time in range ADA',
      infectious_disease: 'Community acquired pneumonia antimicrobial stewardship step down amoxicillin 5 days IDSA',
      neurology: 'Tenecteplase acute ischemic stroke 4.5 hours large vessel occlusion AHA ASA',
      rheumatology: 'EULAR ACR systemic lupus erythematosus classification hydroxychloroquine lupus nephritis'
    };
    this.steeredQuery.emit(queryMap[tool.id]);
  }
}
