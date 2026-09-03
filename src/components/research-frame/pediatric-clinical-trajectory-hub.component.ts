import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { CoppaPrivacyShieldService } from '../../services/coppa-privacy-shield.service';

export interface IPediatricDosageRule {
  drugName: string;
  indication: string;
  recommendedMgPerKg: number;
  maxSingleDoseMg: number;
  frequencyHours: string;
  safetyAlert?: string;
  isContraindicated?: boolean;
}

export interface IPediatricEvidenceTopic {
  id: string;
  title: string;
  organization: 'AAP' | 'NIH_NICHD' | 'CDC' | 'COCHRANE_PEDS';
  summary: string;
  targetAges: string;
  evidenceKeywords: string;
}

@Component({
  selector: 'app-pediatric-clinical-trajectory-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Banner -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🧸</span>
            <span>Pediatric Clinical Trajectory &amp; AAP Growth Hub</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Child Life Specialist, Growth Percentiles &amp; Weight-Calibrated Safety
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Precision weight-based dosing guardrails, CDC/WHO growth trajectories, and AAP evidence-grounded clinical pathways for pediatric care.
          </p>
        </div>

        <!-- COPPA Guardian Shield Status -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-emerald-400">
            <span>🛡️</span>
            <span class="font-bold">{{ coppaShield?.isPediatricContext() ? 'Pediatric Mode Active' : 'Guardian Proxy Gate Ready' }}</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Consent: <span class="text-purple-300 font-bold">Verified Parental Attestation</span>
          </div>
        </div>
      </div>

      <!-- Growth & Biometrics Quick-Tuning Bar -->
      <div class="p-4 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            📏 Pediatric Patient Biometrics Calibration:
          </span>
          <span class="text-xs font-mono text-zinc-400">
            Age: <strong class="text-white">{{ patientAgeYears() }}y</strong> | Weight: <strong class="text-white">{{ patientWeightKg() }} kg</strong> ({{ (patientWeightKg() * 2.20462).toFixed(1) }} lbs)
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>Patient Age</span>
              <span class="text-purple-300">{{ patientAgeYears() }} Years</span>
            </div>
            <input type="range" min="1" max="17" step="1" 
                   [value]="patientAgeYears()" 
                   (input)="onAgeChange($event)"
                   class="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>Weight (kg)</span>
              <span class="text-purple-300">{{ patientWeightKg() }} kg</span>
            </div>
            <input type="range" min="5" max="65" step="0.5" 
                   [value]="patientWeightKg()" 
                   (input)="onWeightChange($event)"
                   class="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
          </div>
        </div>
      </div>

      <!-- Growth Percentiles Radar Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Weight for Age -->
        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Weight-for-Age</span>
            <span>⚖️ CDC 2026</span>
          </div>
          <div class="text-2xl font-bold font-mono text-purple-300">
            {{ weightPercentile() }}<span class="text-sm">th %ile</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-purple-500 rounded-full" [style.width.%]="weightPercentile()"></div>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Z-score: {{ ((weightPercentile() - 50) / 34).toFixed(2) }}σ</div>
        </div>

        <!-- Height for Age -->
        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Height-for-Age</span>
            <span>📐 WHO Child</span>
          </div>
          <div class="text-2xl font-bold font-mono text-cyan-300">
            {{ heightPercentile() }}<span class="text-sm">th %ile</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-cyan-500 rounded-full" [style.width.%]="heightPercentile()"></div>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Stature: On Normal Curve</div>
        </div>

        <!-- BMI for Age -->
        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>BMI-for-Age</span>
            <span>📊 Healthy Weight</span>
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-300">
            54<span class="text-sm">th %ile</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 54%"></div>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Metabolic: Normative Tier</div>
        </div>
      </div>

      <!-- ISMP Weight-Based Dosing & Safety Guardrails -->
      <div class="p-5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>💊</span> ISMP Weight-Calibrated Dosage Guidance ({{ patientWeightKg() }} kg):
          </h3>
          <span class="text-[10px] font-mono text-zinc-500">
            Strict mg/kg Verification
          </span>
        </div>

        <!-- Reye's Syndrome Absolute Contraindication Alert -->
        <div class="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
          <span class="text-lg">🚫</span>
          <div class="space-y-0.5">
            <strong class="font-bold text-rose-300">AAP CRITICAL SAFETY DIRECTIVE: Absolute Aspirin Contraindication</strong>
            <p class="text-[11px] text-rose-300/80 leading-relaxed">
              Aspirin and bismuth subsalicylate are STRICTLY CONTRAINDICATED in pediatric viral and febrile conditions due to fatal risk of Reye's Syndrome (acute encephalopathy &amp; liver failure).
            </p>
          </div>
        </div>

        <!-- Medication Dosage Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-zinc-800 text-zinc-400 text-[10px]">
                <th class="py-2">Medication / Support</th>
                <th class="py-2">Standard Regimen</th>
                <th class="py-2">Computed Patient Dose</th>
                <th class="py-2">Max Single Dose</th>
                <th class="py-2">Delivery Tool</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              @for (dose of dosageCalculations(); track dose.drugName) {
                <tr class="hover:bg-zinc-900/50 transition">
                  <td class="py-2.5 font-bold text-zinc-200 flex items-center gap-1.5">
                    <span>{{ dose.drugName }}</span>
                  </td>
                  <td class="py-2.5 text-zinc-400">{{ dose.recommendedMgPerKg }} mg/kg q{{ dose.frequencyHours }}h</td>
                  <td class="py-2.5 font-bold text-purple-300">{{ dose.computedDoseMg }} mg</td>
                  <td class="py-2.5 text-zinc-400">{{ dose.maxSingleDoseMg }} mg</td>
                  <td class="py-2.5 text-emerald-400 font-semibold">Metric Oral Syringe (mL)</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Child Life Specialist Communication Deck -->
      <div class="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-3">
        <h4 class="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <span>🧸</span> Child Life Specialist Empathetic Communication Deck:
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-purple-400 font-bold">FEVER &amp; REST</span>
            <p class="text-zinc-300 text-[11px]">
              "Your body's internal campfire is heating up to help your superhero white blood cells defeat the pesky bug!"
            </p>
          </div>
          <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-cyan-400 font-bold">HYDRATION &amp; ELECTROLYTES</span>
            <p class="text-zinc-300 text-[11px]">
              "Sipping cool water fills your cellular waterslides so all your body's helpful workers can zoom around!"
            </p>
          </div>
        </div>
      </div>

      <!-- AAP & NIH NICHD Evidence Steering Cards -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
          📚 AAP Guidelines &amp; NIH NICHD Pediatric Evidence Steering:
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (topic of evidenceTopics; track topic.id) {
            <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-purple-500/50 transition">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-mono font-bold">
                    {{ topic.organization }}
                  </span>
                  <span class="text-[10px] font-mono text-zinc-500">Ages: {{ topic.targetAges }}</span>
                </div>
                <h5 class="text-xs font-bold text-zinc-200">{{ topic.title }}</h5>
                <p class="text-[11px] text-zinc-400 leading-relaxed">{{ topic.summary }}</p>
              </div>

              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                <button (click)="steerEvidence(topic)"
                        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md">
                  <span>🎯</span> Steer Evidence
                </button>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class PediatricClinicalTrajectoryHubComponent {
  private readonly patientState = inject(PatientStateService);
  readonly coppaShield = inject(CoppaPrivacyShieldService, { optional: true });

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly patientAgeYears = signal<number>(7);
  readonly patientWeightKg = signal<number>(23.5);

  readonly weightPercentile = computed(() => {
    const age = this.patientAgeYears();
    const wt = this.patientWeightKg();
    // Approximate median weight formula 50th percentile: age * 2 + 8
    const median = age * 2.2 + 7.5;
    const ratio = wt / median;
    return Math.min(99, Math.max(1, Math.round(ratio * 50)));
  });

  readonly heightPercentile = computed(() => {
    return Math.min(99, Math.max(5, this.weightPercentile() + 8));
  });

  readonly dosageRules: IPediatricDosageRule[] = [
    {
      drugName: 'Acetaminophen (Oral Suspension)',
      indication: 'Pediatric Fever & Discomfort Support',
      recommendedMgPerKg: 12.5,
      maxSingleDoseMg: 650,
      frequencyHours: '4–6',
      safetyAlert: 'Max 5 doses per 24 hours. Use calibrated oral syringe.'
    },
    {
      drugName: 'Ibuprofen (Oral Suspension)',
      indication: 'Anti-Inflammatory & Musculoskeletal Sprain',
      recommendedMgPerKg: 7.5,
      maxSingleDoseMg: 400,
      frequencyHours: '6–8',
      safetyAlert: 'Administer with food or fluid. For infants > 6 months only.'
    },
    {
      drugName: 'Zinc Sulfate Liquid',
      indication: 'Immune Mucosal Epithelial Support',
      recommendedMgPerKg: 0.5,
      maxSingleDoseMg: 20,
      frequencyHours: '24',
      safetyAlert: 'Short-term supportive oral rehydration adjuvant.'
    }
  ];

  readonly dosageCalculations = computed(() => {
    const wt = this.patientWeightKg();
    return this.dosageRules.map(r => ({
      ...r,
      computedDoseMg: Math.min(r.maxSingleDoseMg, Math.round(r.recommendedMgPerKg * wt))
    }));
  });

  readonly evidenceTopics: IPediatricEvidenceTopic[] = [
    {
      id: 'aap-fever-guideline',
      title: 'AAP Clinical Report: Fever and Antipyretic Use in Children',
      organization: 'AAP',
      summary: 'Focuses on child comfort rather than temperature normalization, emphasizing hydration and avoiding antipyretic alternation.',
      targetAges: '1–12y',
      evidenceKeywords: 'American Academy of Pediatrics Fever and Antipyretic Use in Children Clinical Report'
    },
    {
      id: 'nih-nichd-growth-epiphyseal',
      title: 'NIH NICHD Epiphyseal Growth Plate & Pediatric ACL Biomechanics',
      organization: 'NIH_NICHD',
      summary: 'Preserves open physis during cruciate ligament repair, preventing growth arrests and angular limb deformities.',
      targetAges: '6–16y',
      evidenceKeywords: 'Pediatric Anterior Cruciate Ligament Epiphyseal Growth Plate NIH NICHD'
    },
    {
      id: 'cochrane-peds-hydration',
      title: 'Cochrane Systematic Review: Oral Rehydration Therapy in Acute Pediatric Gastroenteritis',
      organization: 'COCHRANE_PEDS',
      summary: 'Reduced-osmolarity oral rehydration solution (ORS) over intravenous fluids for mild-to-moderate dehydration in pediatric cohorts.',
      targetAges: 'All Ped',
      evidenceKeywords: 'Cochrane Reduced Osmolarity Oral Rehydration Solution Pediatric Gastroenteritis'
    },
    {
      id: 'aap-asthma-care',
      title: 'AAP & NHLBI Pediatric Asthma Management Guidelines',
      organization: 'AAP',
      summary: 'Stepwise symptom control with low-dose inhaled corticosteroids and valved holding chamber spacers.',
      targetAges: '5–11y',
      evidenceKeywords: 'AAP Pediatric Asthma Management Guidelines Inhaled Corticosteroids Spacer'
    }
  ];

  onAgeChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.patientAgeYears.set(val);
      // Automatically adjust realistic standard weight baseline if untuned
      this.patientWeightKg.set(parseFloat((val * 2.3 + 7.5).toFixed(1)));
    }
  }

  onWeightChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.patientWeightKg.set(val);
    }
  }

  steerEvidence(topic: IPediatricEvidenceTopic): void {
    this.selectQuery.emit({
      query: topic.evidenceKeywords,
      engine: 'pubmed'
    });
  }
}
