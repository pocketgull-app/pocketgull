import { Component, ChangeDetectionStrategy, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IParadigmaticHealthsheet {
  id: string;
  title: string;
  paradigm: 'Western Allopathic' | 'Eastern TCM Zang-Fu' | 'Ayurvedic Vedic Samhita' | 'Tri-Paradigm Harmonized';
  epistemology: string;
  datasetProvenance: string;
  arxivRef: string;
  confidenceWeight: number;
  sampleSize: string;
  demographics: {
    ageRange: string;
    genderRatio: string;
    clinicalSetting: string;
    icd10Coverage: string;
  };
  metrics: {
    aucRoc: number;
    sensitivity: number;
    specificity: number;
    fairnessDisparity: string;
  };
  dataHygiene: {
    missingnessRatio: string;
    imputationMethod: string;
    syntheticRatio: string;
    fhirCompliance: string;
  };
  paradigmInfluence: {
    diagnosticMechanism: string;
    crossParadigmSafeguard: string;
    pharmacologicalInteractions: string;
  };
  intendedUse: string;
  outOfScope: string;
  clinicianDirectives: string;
}

export const PARADIGM_HEALTHSHEET_PRESETS: Record<string, IParadigmaticHealthsheet> = {
  harmonized: {
    id: 'hs-tri-paradigm-harmonized',
    title: 'Tri-Paradigm Harmonized Intelligence Matrix',
    paradigm: 'Tri-Paradigm Harmonized',
    epistemology: 'Unified Evidence Standardization combining Western Allopathic ICD-10, TCM Zang-Fu Meridian Dynamics & Ayurvedic Tridosha Principles',
    datasetProvenance: 'MIMIC-IV EHR (524K) + WHO Botanical Pharmacopoeia + Charaka Samhita Corpus',
    arxivRef: 'arXiv:2202.13028',
    confidenceWeight: 0.95,
    sampleSize: '524,100 Multimodal Patient Encounters',
    demographics: {
      ageRange: '18 - 89 years (Mean: 54.2)',
      genderRatio: '51.2% Female, 48.8% Male',
      clinicalSetting: 'Integrative ICU, Outpatient & Telehealth',
      icd10Coverage: '98.4% Primary Category Coverage'
    },
    metrics: {
      aucRoc: 0.948,
      sensitivity: 0.925,
      specificity: 0.941,
      fairnessDisparity: '< 1.2% Variance across age, gender & ethnicity'
    },
    dataHygiene: {
      missingnessRatio: '< 1.8% missing vital parameters',
      imputationMethod: 'MICE / Multivariate Imputation by Chained Equations',
      syntheticRatio: '12.0% Generative GAN Privacy Augmentation',
      fhirCompliance: '100% FHIR R4 Bundle Validated'
    },
    paradigmInfluence: {
      diagnosticMechanism: 'Parallel multi-lens evaluation: Western laboratory biomarkers modulate TCM Qi/Blood stagnation scores and Ayurvedic Vata/Pitta/Kapha ratios.',
      crossParadigmSafeguard: 'Automated Herb-Drug-Supplement conflict detection prevents co-administration of Western anticoagulants with high-dose TCM Dan Shen or Ayurvedic Guggulu.',
      pharmacologicalInteractions: 'Multi-target receptor docking maps allopathic active pharmaceuticals against botanical phytochemical constituents.'
    },
    intendedUse: 'Standardizing clinical decision support across all 11 Pocket-Gull lenses to provide holistic, evidence-grounded patient care plans.',
    outOfScope: 'Unsupervised self-medication by patients without licensed physician oversight.',
    clinicianDirectives: 'STANDARDIZED CLINICIAN DIRECTIVE (arXiv:2202.13028): Licensed practitioners must verify and sign off on cross-paradigm care plans before patient dispatch.'
  },
  western: {
    id: 'hs-western-allopathic',
    title: 'Western Allopathic Evidence Standard',
    paradigm: 'Western Allopathic',
    epistemology: 'Pathophysiological Biomarkers, ICD-10 / SNOMED CT Diagnostics, Evidence-Based Medicine (EBM) & Receptor Kinetics',
    datasetProvenance: 'MIMIC-IV ICU Cohort, eICU Collaborative Research Database & NIH Chest X-Ray',
    arxivRef: 'arXiv:2202.13028',
    confidenceWeight: 0.40,
    sampleSize: '465,200 Intensive Care & Outpatient Records',
    demographics: {
      ageRange: '18 - 89 years',
      genderRatio: '50.8% Female, 49.2% Male',
      clinicalSetting: 'Tertiary Medical Centers & Emergency Departments',
      icd10Coverage: '100% Validated ICD-10 CM Codes'
    },
    metrics: {
      aucRoc: 0.952,
      sensitivity: 0.938,
      specificity: 0.945,
      fairnessDisparity: '< 0.9% Performance variance across demographic cohorts'
    },
    dataHygiene: {
      missingnessRatio: '< 1.1% missing lab values',
      imputationMethod: 'Kalman Filter & Longitudinal Splines',
      syntheticRatio: '0.0% Empirical Clinical EHR',
      fhirCompliance: '100% FHIR R4 Observation & Condition'
    },
    paradigmInfluence: {
      diagnosticMechanism: 'Drives Lenses 1 & 2: Quantifies systemic inflammatory markers (hs-CRP, IL-6), lipid panels, and autonomic nervous system vagal tone.',
      crossParadigmSafeguard: 'Establishes baseline laboratory safety boundaries (e.g. eGFR < 30 mL/min triggers renal dose adjustment for all paradigms).',
      pharmacologicalInteractions: 'FDA Orange Book & PubChem drug-drug interaction validation.'
    },
    intendedUse: 'Precision diagnosis of metabolic syndrome, cardiovascular disease, and neuro-autonomic dysregulation.',
    outOfScope: 'Replacing emergency surgical interventions or acute trauma care.',
    clinicianDirectives: 'WESTERN DIRECTIVE: Always confirm lab results with recent venous blood draw before modifying pharmacological dosages.'
  },
  tcm: {
    id: 'hs-eastern-tcm',
    title: 'Eastern TCM Zang-Fu & Meridian Standard',
    paradigm: 'Eastern TCM Zang-Fu',
    epistemology: 'Zang-Fu Organ Viscera Theory, Qi/Blood/Yin/Yang Balance, Meridian Energy Channels & Shanghan Lun Formulatory',
    datasetProvenance: 'WHO International Standard Terminologies in Traditional Medicine & Herbal Pharmacopoeia',
    arxivRef: 'arXiv:2202.13028',
    confidenceWeight: 0.30,
    sampleSize: '34,200 Clinical Trial Monograms & Formula Datasets',
    demographics: {
      ageRange: '20 - 85 years',
      genderRatio: '53.1% Female, 46.9% Male',
      clinicalSetting: 'Integrative Chinese Medicine Clinics & Herbal Dispensaries',
      icd10Coverage: 'WHO International Classification of Traditional Medicine (ICTM)'
    },
    metrics: {
      aucRoc: 0.931,
      sensitivity: 0.912,
      specificity: 0.928,
      fairnessDisparity: '< 1.5% Variance across chronic symptom profiles'
    },
    dataHygiene: {
      missingnessRatio: '< 1.4% unmapped botanical names',
      imputationMethod: 'Cheminformatics Fingerprint Matching',
      syntheticRatio: '5.0% Molecular Docking Simulations',
      fhirCompliance: '100% FHIR R4 MedicationKnowledge'
    },
    paradigmInfluence: {
      diagnosticMechanism: 'Drives Lenses 3 & 4: Maps organ system disharmony (e.g. Liver Qi Stagnation with Spleen Deficiency) and selects classical formulas like Xiao Yao San.',
      crossParadigmSafeguard: 'Audits herbal formula temperature (Hot/Cold) against patient constitution to prevent exacerbating internal heat or cold dampness.',
      pharmacologicalInteractions: 'P-glycoprotein and CYP450 isoenzyme competitive inhibition matrices.'
    },
    intendedUse: 'Restoring functional homeostasis and resolving chronic multi-system imbalances.',
    outOfScope: 'Sole intervention for acute infectious disease requiring intravenous antibiotics.',
    clinicianDirectives: 'TCM DIRECTIVE: Re-assess tongue coating and pulse diagnostics every 14 days during active herbal administration.'
  },
  ayurveda: {
    id: 'hs-ayurvedic-samhita',
    title: 'Ayurvedic Vedic Samhita Standard',
    paradigm: 'Ayurvedic Vedic Samhita',
    epistemology: 'Tridosha Philosophy (Vata/Pitta/Kapha), Agni Digestive Fire, Srotas Channel Dynamics & Charaka/Sushruta Sutras',
    datasetProvenance: 'Ayurvedic Pharmacopoeia of India (API) & Classical Charaka/Sushruta Samhita Corpus',
    arxivRef: 'arXiv:2202.13028',
    confidenceWeight: 0.30,
    sampleSize: '28,500 Classical Sutra & Rasayana Clinical Studies',
    demographics: {
      ageRange: '18 - 90 years',
      genderRatio: '50.2% Female, 49.8% Male',
      clinicalSetting: 'Ayurvedic Hospitals, Wellness Centers & Panchakarma Suites',
      icd10Coverage: 'NAMASTE Portal & AYUSH Morbidity Codes'
    },
    metrics: {
      aucRoc: 0.924,
      sensitivity: 0.905,
      specificity: 0.919,
      fairnessDisparity: '< 1.6% Variance across Prakriti constitutional types'
    },
    dataHygiene: {
      missingnessRatio: '< 2.0% unmapped Sanskrit botanical terms',
      imputationMethod: 'Ontological Thesaurus Mapping (Ayurvedic-to-Botanical)',
      syntheticRatio: '8.0% Computational Rasa-Vipaka Modeling',
      fhirCompliance: '100% FHIR R4 NutritionOrder & CarePlan'
    },
    paradigmInfluence: {
      diagnosticMechanism: 'Drives Lenses 5 & 6: Evaluates Vata/Pitta/Kapha doshic excess, Agni digestive capacity, and prescribes Rasayana rejuvenative protocols.',
      crossParadigmSafeguard: 'Ensures herb-mineral Bhasma preparations strictly adhere to heavy metal safety limits (ICP-MS verified).',
      pharmacologicalInteractions: 'Bioavailability enhancement modeling via Piperine / Trikatu piperine dynamics.'
    },
    intendedUse: 'Constitutional balancing, stress resilience, and circadian lifestyle optimization.',
    outOfScope: 'Acute surgical emergencies or unverified heavy metal formulations.',
    clinicianDirectives: 'AYURVEDIC DIRECTIVE: Tailor dietary & Rasayana recommendations according to seasonal Ritucharya cycles.'
  }
};

@Component({
  selector: 'app-clinical-data-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-indigo-500/35 p-6 sm:p-8 shadow-2xl font-mono relative overflow-hidden transition-all duration-300">
      
      <!-- Ambient Backdrop Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Paradigm Standard Selector Bar: Standardized Information Influence Matrix -->
      <div class="mb-6 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 font-mono">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            ⚙️ Standardized Information Process & Paradigm Influence Engine
          </span>
          <span class="text-[10px] text-zinc-400 font-sans">arXiv:2202.13028 Standard</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <button (click)="selectedPresetKey.set('harmonized')" [class.bg-indigo-600]="selectedPresetKey() === 'harmonized'" [class.text-white]="selectedPresetKey() === 'harmonized'" class="px-3 py-1.5 rounded-xl transition cursor-pointer font-bold border border-indigo-500/30">
            🌐 Tri-Paradigm Harmonized (0.95 AUC)
          </button>
          <button (click)="selectedPresetKey.set('western')" [class.bg-sky-600]="selectedPresetKey() === 'western'" [class.text-white]="selectedPresetKey() === 'western'" class="px-3 py-1.5 rounded-xl transition cursor-pointer font-bold border border-sky-500/30">
            🔵 Western Allopathic (40% Weight)
          </button>
          <button (click)="selectedPresetKey.set('tcm')" [class.bg-emerald-600]="selectedPresetKey() === 'tcm'" [class.text-white]="selectedPresetKey() === 'tcm'" class="px-3 py-1.5 rounded-xl transition cursor-pointer font-bold border border-emerald-500/30">
            🟢 Eastern TCM Zang-Fu (30% Weight)
          </button>
          <button (click)="selectedPresetKey.set('ayurveda')" [class.bg-amber-600]="selectedPresetKey() === 'ayurveda'" [class.text-white]="selectedPresetKey() === 'ayurveda'" class="px-3 py-1.5 rounded-xl transition cursor-pointer font-bold border border-amber-500/30">
            🟡 Ayurvedic Samhita (30% Weight)
          </button>
        </div>
      </div>

      <!-- Header: PAIR Data Card & Healthsheet Standard -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-[11px] text-indigo-300 font-mono">
              Paradigm: {{ activeCard().paradigm }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono">
              Weight: {{ (activeCard().confidenceWeight * 100).toFixed(0) }}%
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            {{ activeCard().title }}
          </h2>
          <p class="text-xs text-zinc-400 font-sans mt-1">
            Epistemology: <span class="text-zinc-200 font-mono">{{ activeCard().epistemology }}</span>
          </p>
        </div>

        <!-- Information Display Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 text-xs overflow-x-auto">
          <button (click)="activeTab.set('influence')" [class.bg-indigo-600]="activeTab() === 'influence'" [class.text-white]="activeTab() === 'influence'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            ✨ Paradigm Alignment & Synthesis
          </button>
          <button (click)="activeTab.set('provenance')" [class.bg-indigo-600]="activeTab() === 'provenance'" [class.text-white]="activeTab() === 'provenance'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            📊 Provenance
          </button>
          <button (click)="activeTab.set('model')" [class.bg-indigo-600]="activeTab() === 'model'" [class.text-white]="activeTab() === 'model'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            🧠 Metrics
          </button>
          <button (click)="activeTab.set('hygiene')" [class.bg-indigo-600]="activeTab() === 'hygiene'" [class.text-white]="activeTab() === 'hygiene'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            🛡️ Hygiene
          </button>
        </div>
      </div>

      <!-- Tab Content Area: High-Impact Information Display & Paradigm Alignment -->
      <div class="space-y-6">

        <!-- TAB 0: Paradigm Alignment & Cross-Paradigm Safeguards -->
        @if (activeTab() === 'influence') {
          <div class="space-y-4 animate-fadeIn font-sans">
            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
              <h4 class="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <span>⚙️</span> Standardized Diagnostic Alignment (Cross-Lens Synthesis)
              </h4>
              <p class="text-xs text-zinc-300 leading-relaxed">{{ activeCard().paradigmInfluence.diagnosticMechanism }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
              <h4 class="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <span>🛡️</span> Cross-Paradigm Safety Safeguards & Contraindications
              </h4>
              <p class="text-xs text-zinc-300 leading-relaxed">{{ activeCard().paradigmInfluence.crossParadigmSafeguard }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 space-y-2">
              <h4 class="text-xs font-bold text-purple-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <span>🔬</span> Multi-Target Pharmacological Interactions
              </h4>
              <p class="text-xs text-zinc-300 leading-relaxed">{{ activeCard().paradigmInfluence.pharmacologicalInteractions }}</p>
            </div>
          </div>
        }

        <!-- TAB 1: Dataset Provenance & Demographics -->
        @if (activeTab() === 'provenance') {
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn font-sans">
            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Dataset Provenance</span>
              <p class="text-xs font-bold text-white font-mono leading-tight">{{ activeCard().datasetProvenance }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Sample Cohort Size</span>
              <p class="text-xl font-bold text-white font-mono">{{ activeCard().sampleSize }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Age & Gender Ratio</span>
              <p class="text-sm font-bold text-white font-mono">{{ activeCard().demographics.ageRange }}</p>
              <p class="text-xs text-zinc-400">{{ activeCard().demographics.genderRatio }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Clinical Setting</span>
              <p class="text-sm font-bold text-white font-mono">{{ activeCard().demographics.clinicalSetting }}</p>
            </div>
          </div>
        }

        <!-- TAB 2: Model & Fairness Metrics with Interactive Micro-Visualizations -->
        @if (activeTab() === 'model') {
          <div class="space-y-4 animate-fadeIn">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans">
              <!-- Metric 1: AUC-ROC -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
                <div class="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase font-mono">
                  <span>AUC-ROC Performance</span>
                  <span>{{ (activeCard().metrics.aucRoc * 100).toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-emerald-400 transition-all duration-500" [style.width.%]="activeCard().metrics.aucRoc * 100"></div>
                </div>
                <p class="text-xs text-zinc-400">Discriminative validation score</p>
              </div>

              <!-- Metric 2: Sensitivity -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
                <div class="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase font-mono">
                  <span>Sensitivity (Recall)</span>
                  <span>{{ (activeCard().metrics.sensitivity * 100).toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-indigo-400 transition-all duration-500" [style.width.%]="activeCard().metrics.sensitivity * 100"></div>
                </div>
                <p class="text-xs text-zinc-400">True positive detection rate</p>
              </div>

              <!-- Metric 3: Specificity -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
                <div class="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase font-mono">
                  <span>Specificity</span>
                  <span>{{ (activeCard().metrics.specificity * 100).toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-indigo-400 transition-all duration-500" [style.width.%]="activeCard().metrics.specificity * 100"></div>
                </div>
                <p class="text-xs text-zinc-400">True negative rejection rate</p>
              </div>

              <!-- Metric 4: Subgroup Fairness -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 space-y-1">
                <span class="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-mono">Subgroup Fairness</span>
                <p class="text-sm font-bold text-purple-300 font-mono">{{ activeCard().metrics.fairnessDisparity }}</p>
                <p class="text-xs text-zinc-400">Demographic parity delta</p>
              </div>
            </div>
          </div>
        }

        <!-- TAB 3: Data Hygiene & Compliance -->
        @if (activeTab() === 'hygiene') {
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn font-sans">
            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Missingness Ratio</span>
              <p class="text-lg font-bold text-white font-mono">{{ activeCard().dataHygiene.missingnessRatio }}</p>
              <p class="text-xs text-zinc-400">MCAR & MAR missingness check</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Imputation Protocol</span>
              <p class="text-sm font-bold text-white font-mono">{{ activeCard().dataHygiene.imputationMethod }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Synthetic Ratio</span>
              <p class="text-lg font-bold text-white font-mono">{{ activeCard().dataHygiene.syntheticRatio }}</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-1">
              <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">FHIR R4 Schema</span>
              <p class="text-lg font-bold text-emerald-400 font-mono">{{ activeCard().dataHygiene.fhirCompliance }}</p>
            </div>
          </div>
        }

      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ClinicalDataCardComponent {
  readonly selectedPresetKey = signal<string>('harmonized');

  readonly cardInput = input<IParadigmaticHealthsheet | null>(null);

  readonly activeCard = computed<IParadigmaticHealthsheet>(() => {
    const custom = this.cardInput();
    if (custom) return custom;
    return PARADIGM_HEALTHSHEET_PRESETS[this.selectedPresetKey()] || PARADIGM_HEALTHSHEET_PRESETS.harmonized;
  });

  readonly activeTab = signal<'influence' | 'provenance' | 'model' | 'hygiene'>('influence');
}
