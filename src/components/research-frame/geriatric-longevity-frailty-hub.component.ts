import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

export interface IBeersMedicationWarning {
  drugClass: string;
  medicationName: string;
  rationale: string;
  riskCategory: 'HIGH_ANTICHOLINERGIC' | 'FALL_RISK' | 'RENAL_CLEARANCE' | 'GASTRIC_BLEED';
  recommendation: string;
  saferAlternatives: string[];
}

export interface IGeriatricEvidenceTopic {
  id: string;
  title: string;
  organization: 'AGS' | 'NIH_NIA' | 'COCHRANE_GERIATRICS';
  summary: string;
  evidenceKeywords: string;
}

@Component({
  selector: 'app-geriatric-longevity-frailty-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Banner -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🧓</span>
            <span>Geriatric 5Ms &amp; Longevity Strategy Hub</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Comprehensive Geriatric Assessment, AGS Beers Criteria &amp; Frailty Defense
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Multimodal evaluation of Mind, Mobility, Medications, Multi-complexity, and Matters Most to optimize functional independence and longevity.
          </p>
        </div>

        <!-- Clinical Frailty Scale Indicator -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-amber-400">
            <span>📊</span>
            <span class="font-bold">Rockwood CFS: Level {{ frailtyScore() }} ({{ frailtyTier() }})</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Guideline: <span class="text-amber-300 font-bold">2023 AGS Beers Criteria®</span>
          </div>
        </div>
      </div>

      <!-- Geriatric 5Ms Navigation Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        @for (m of fiveMs; track m.key) {
          <button (click)="activeM.set(m.key)"
                  [class.bg-amber-600]="activeM() === m.key"
                  [class.text-white]="activeM() === m.key"
                  [class.border-amber-400]="activeM() === m.key"
                  [class.bg-zinc-950]="activeM() !== m.key"
                  [class.text-zinc-400]="activeM() !== m.key"
                  [class.border-zinc-800]="activeM() !== m.key"
                  class="p-3 rounded-xl text-left border transition-all hover:border-amber-500/60 cursor-pointer space-y-1">
            <div class="text-xs font-bold truncate leading-tight flex items-center gap-1.5">
              <span>{{ m.icon }}</span>
              <span>{{ m.title }}</span>
            </div>
            <div class="text-[10px] font-mono opacity-80 truncate">{{ m.subtitle }}</div>
          </button>
        }
      </div>

      <!-- Tab 1: MIND (Cognition, MoCA, Circadian Sleep) -->
      @if (activeM() === 'MIND') {
        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
          <h3 class="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>🧠</span> Cognitive Reserve &amp; Neuro-Autonomic Integrity
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">MoCA Cognitive Screen</div>
              <div class="text-xl font-bold font-mono text-emerald-400">26 / 30</div>
              <div class="text-[10px] text-zinc-500">Normal Cognitive Function</div>
            </div>
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">GDS-15 Depression Scale</div>
              <div class="text-xl font-bold font-mono text-teal-300">2 / 15</div>
              <div class="text-[10px] text-zinc-500">Low Risk of Geriatric Depression</div>
            </div>
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">Sleep Architecture</div>
              <div class="text-xl font-bold font-mono text-indigo-300">7.2h (82% Eff)</div>
              <div class="text-[10px] text-zinc-500">Circadian Photic Alignment</div>
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: MOBILITY (Sarcopenia, TUG, Gait Speed) -->
      @if (activeM() === 'MOBILITY') {
        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
          <h3 class="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <span>🚶</span> Functional Mobility, Sarcopenia &amp; Fall Risk Stratification
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">Timed Up &amp; Go (TUG)</div>
              <div class="text-xl font-bold font-mono text-emerald-400">9.4 seconds</div>
              <div class="text-[10px] text-zinc-500">&lt; 10s: Independent Mobility</div>
            </div>
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">Gait Velocity</div>
              <div class="text-xl font-bold font-mono text-teal-300">1.05 m/s</div>
              <div class="text-[10px] text-zinc-500">&gt; 0.8 m/s: Low Sarcopenia Risk</div>
            </div>
            <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div class="text-[10px] font-mono text-zinc-400">Handgrip Strength</div>
              <div class="text-xl font-bold font-mono text-purple-300">32 kg</div>
              <div class="text-[10px] text-zinc-500">Normal Muscular Tone</div>
            </div>
          </div>
        </div>
      }

      <!-- Tab 3: MEDICATIONS (AGS Beers Criteria 2023) -->
      @if (activeM() === 'MEDICATIONS') {
        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <span>💊</span> 2023 AGS Beers Criteria® Potentially Inappropriate Medication Alerts:
            </h3>
            <span class="text-[10px] font-mono text-zinc-400">Polypharmacy Review</span>
          </div>

          <div class="space-y-3">
            @for (warning of beersWarnings; track warning.medicationName) {
              <div class="p-4 bg-zinc-900 border border-rose-900/40 rounded-xl space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <span>⚠️</span> {{ warning.medicationName }} ({{ warning.drugClass }})
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono font-bold">
                    {{ warning.riskCategory.replace('_', ' ') }}
                  </span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">{{ warning.rationale }}</p>
                <div class="pt-2 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span>💡 Safer Alternatives:</span>
                  <span class="text-zinc-200">{{ warning.saferAlternatives.join(', ') }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 4: MULTI-COMPLEXITY (Rockwood CFS & Renal eGFR) -->
      @if (activeM() === 'COMPLEXITY') {
        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
          <h3 class="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>🩺</span> Multi-Morbidity &amp; Organ Clearance Reserve
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <div class="text-xs font-bold text-zinc-200">Renal Clearance (CKD-EPI eGFR)</div>
              <div class="text-2xl font-bold font-mono text-emerald-400">74 mL/min/1.73m²</div>
              <p class="text-xs text-zinc-400">Adequate clearance for hydrophilic medications. No dose adjustments required.</p>
            </div>
            <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <div class="text-xs font-bold text-zinc-200">Hepatic CYP450 Reserve</div>
              <div class="text-2xl font-bold font-mono text-teal-300">Preserved (Phase II)</div>
              <p class="text-xs text-zinc-400">Glucuronidation pathways intact. Monitor Phase I oxidation drug-drug interactions.</p>
            </div>
          </div>
        </div>
      }

      <!-- Tab 5: MATTERS MOST (Advance Directives & Goal Alignment) -->
      @if (activeM() === 'MATTERS_MOST') {
        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <h3 class="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <span>💖</span> Patient Personal Goals &amp; Advance Care Directives
          </h3>
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs text-zinc-300 leading-relaxed">
            <div class="font-bold text-zinc-100">Core Care Goal: Preserve Functional Cognitive &amp; Walking Independence</div>
            <p>
              Patient prioritizes remaining ambulatory, gardening outdoors, and maintaining sharp conversational acuity without medication-induced brain fog or sedation.
            </p>
          </div>
        </div>
      }

      <!-- AGS & NIH NIA Evidence Steering -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
          📚 American Geriatrics Society (AGS) &amp; NIH NIA Clinical Evidence:
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (topic of evidenceTopics; track topic.id) {
            <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-mono font-bold">
                    {{ topic.organization }}
                  </span>
                </div>
                <h5 class="text-xs font-bold text-zinc-200">{{ topic.title }}</h5>
                <p class="text-[11px] text-zinc-400 leading-relaxed">{{ topic.summary }}</p>
              </div>

              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                <button (click)="steerEvidence(topic)"
                        class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md">
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
export class GeriatricLongevityFrailtyHubComponent {
  private readonly patientState = inject(PatientStateService);

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly activeM = signal<'MIND' | 'MOBILITY' | 'MEDICATIONS' | 'COMPLEXITY' | 'MATTERS_MOST'>('MEDICATIONS');
  readonly frailtyScore = signal<number>(2); // 1 = Very Fit, 2 = Well, 3 = Managing Well, 4 = Vulnerable

  readonly frailtyTier = computed(() => {
    const score = this.frailtyScore();
    if (score <= 2) return 'Fit & Resilient';
    if (score === 3) return 'Managing Well';
    if (score === 4) return 'Vulnerable / Pre-Frail';
    return 'Frail Multi-Morbidity';
  });

  readonly fiveMs = [
    { key: 'MIND' as const, title: 'Mind', subtitle: 'MoCA & Sleep', icon: '🧠' },
    { key: 'MOBILITY' as const, title: 'Mobility', subtitle: 'TUG & Sarcopenia', icon: '🚶' },
    { key: 'MEDICATIONS' as const, title: 'Medications', subtitle: 'Beers Criteria 2023', icon: '💊' },
    { key: 'COMPLEXITY' as const, title: 'Complexity', subtitle: 'eGFR & Clearance', icon: '🩺' },
    { key: 'MATTERS_MOST' as const, title: 'Matters Most', subtitle: 'Advance Directives', icon: '💖' }
  ];

  readonly beersWarnings: IBeersMedicationWarning[] = [
    {
      drugClass: 'First-Generation Antihistamines',
      medicationName: 'Diphenhydramine / Hydroxyzine',
      rationale: 'Highly anticholinergic; risk of confusion, dry mouth, urinary retention, and heightened fall risk.',
      riskCategory: 'HIGH_ANTICHOLINERGIC',
      recommendation: 'Avoid for insomnia or routine allergy. De-prescribe or substitute non-sedating 2nd generation.',
      saferAlternatives: ['Cetirizine', 'Loratadine', 'Fexofenadine', 'Sleep Hygiene / Photic Entrainment']
    },
    {
      drugClass: 'Long-Acting Benzodiazepines',
      medicationName: 'Diazepam / Flurazepam / Clonazepam',
      rationale: 'Prolonged elimination half-life; causes ataxia, cognitive slowing, motor vehicle collisions, and hip fractures.',
      riskCategory: 'FALL_RISK',
      recommendation: 'Taper gradually. Avoid for insomnia or anxiety maintenance.',
      saferAlternatives: ['Melatonin PR', 'CBT-I (Cognitive Behavioral Therapy for Insomnia)', 'Buspirone']
    },
    {
      drugClass: 'Chronic Proton Pump Inhibitors (PPIs)',
      medicationName: 'Omeprazole / Pantoprazole (>8 weeks)',
      rationale: 'Risk of Clostridioides difficile infection, bone mineral density loss, and hypomagnesemia.',
      riskCategory: 'GASTRIC_BLEED',
      recommendation: 'Re-evaluate indication; step down to H2RA or de-prescribe if uncomplicated GERD.',
      saferAlternatives: ['Famotidine as-needed', 'Dietary acid reflux protocol', 'Elevated head of bed']
    }
  ];

  readonly evidenceTopics: IGeriatricEvidenceTopic[] = [
    {
      id: 'ags-beers-2023',
      title: 'American Geriatrics Society 2023 Updated Beers Criteria®',
      organization: 'AGS',
      summary: 'Evidence-based guidelines on medications that are potentially inappropriate in older adults across all care settings.',
      evidenceKeywords: 'American Geriatrics Society 2023 Updated Beers Criteria Potentially Inappropriate Medication'
    },
    {
      id: 'nih-nia-sarcopenia-exercise',
      title: 'NIH NIA Progressive Resistance Training & Sarcopenia Mitigation',
      organization: 'NIH_NIA',
      summary: 'Randomized trials demonstrating hypertrophy and neuromuscular power recovery in adults aged 75+ through protein pacing and resistance loading.',
      evidenceKeywords: 'NIH NIA Sarcopenia Resistance Exercise Protein Pacing Older Adults RCT'
    },
    {
      id: 'cochrane-fall-prevention',
      title: 'Cochrane Review: Interventions for Preventing Falls in Older People',
      organization: 'COCHRANE_GERIATRICS',
      summary: 'Multifactorial fall prevention combining medication rationalization, environmental hazard audits, and balance retraining (Tai Chi / Vagal tone).',
      evidenceKeywords: 'Cochrane Interventions for Preventing Falls in Older People in the Community'
    },
    {
      id: 'nih-nia-deprescribing-trials',
      title: 'NIH NIA Polypharmacy De-Prescribing & Functional Resilience',
      organization: 'NIH_NIA',
      summary: 'Structured de-prescribing protocols reducing adverse drug events, emergency room admissions, and hospitalization rates.',
      evidenceKeywords: 'NIH NIA Polypharmacy Deprescribing Clinical Trials Older Adults Hospitalization'
    }
  ];

  steerEvidence(topic: IGeriatricEvidenceTopic): void {
    this.selectQuery.emit({
      query: topic.evidenceKeywords,
      engine: 'pubmed'
    });
  }
}
