import { Injectable, signal, computed } from '@angular/core';

export interface IAcronymDefinition {
  shortForm: string;
  fullTitle: string;
  plainEnglishExplanation: string;
  category: 'Cardiology' | 'Pulmonology' | 'Endocrinology' | 'Nephrology' | 'Neurology' | 'Lab/Biomarker';
}

export const MEDICAL_ACRONYM_DICTIONARY: Record<string, IAcronymDefinition> = {
  'OSA': {
    shortForm: 'OSA',
    fullTitle: 'Obstructive Sleep Apnea',
    plainEnglishExplanation: 'Repeated breathing pauses during sleep due to upper airway collapse.',
    category: 'Pulmonology'
  },
  'COPD': {
    shortForm: 'COPD',
    fullTitle: 'Chronic Obstructive Pulmonary Disease',
    plainEnglishExplanation: 'Progressive lung condition causing obstructed airflow and breathing difficulty.',
    category: 'Pulmonology'
  },
  'T2DM': {
    shortForm: 'T2DM',
    fullTitle: 'Type 2 Diabetes Mellitus',
    plainEnglishExplanation: 'Metabolic disorder characterized by high blood sugar and insulin resistance.',
    category: 'Endocrinology'
  },
  'CKD': {
    shortForm: 'CKD',
    fullTitle: 'Chronic Kidney Disease',
    plainEnglishExplanation: 'Gradual loss of kidney filtering function over time.',
    category: 'Nephrology'
  },
  'HRV': {
    shortForm: 'HRV',
    fullTitle: 'Heart Rate Variability',
    plainEnglishExplanation: 'Variation in time intervals between heartbeats; key indicator of autonomic nervous system tone.',
    category: 'Cardiology'
  },
  'MDA': {
    shortForm: 'MDA',
    fullTitle: 'Malondialdehyde',
    plainEnglishExplanation: 'Biomarker indicating lipid oxidation and cellular membrane oxidative damage.',
    category: 'Lab/Biomarker'
  },
  'eGFR': {
    shortForm: 'eGFR',
    fullTitle: 'Estimated Glomerular Filtration Rate',
    plainEnglishExplanation: 'Blood test measuring how efficiently the kidneys filter waste.',
    category: 'Nephrology'
  },
  'uACR': {
    shortForm: 'uACR',
    fullTitle: 'Urine Albumin-to-Creatinine Ratio',
    plainEnglishExplanation: 'Urine check measuring small amounts of protein to screen for kidney damage.',
    category: 'Nephrology'
  },
  'NT-proBNP': {
    shortForm: 'NT-proBNP',
    fullTitle: 'N-Terminal Pro-B-Type Natriuretic Peptide',
    plainEnglishExplanation: 'Cardiac protein released when heart muscle ventricles are stretched or under pressure.',
    category: 'Cardiology'
  },
  'MCI': {
    shortForm: 'MCI',
    fullTitle: 'Mild Cognitive Impairment',
    plainEnglishExplanation: 'Slight but noticeable decline in memory and thinking skills beyond normal aging.',
    category: 'Neurology'
  },
  'RRMS': {
    shortForm: 'RRMS',
    fullTitle: 'Relapsing-Remitting Multiple Sclerosis',
    plainEnglishExplanation: 'Autoimmune nerve condition characterized by symptom flare-ups followed by recovery periods.',
    category: 'Neurology'
  },
  'Lp(a)': {
    shortForm: 'Lp(a)',
    fullTitle: 'Lipoprotein(a)',
    plainEnglishExplanation: 'Genetic sticky LDL-like particle associated with cardiovascular risk.',
    category: 'Cardiology'
  },
  'GSH': {
    shortForm: 'GSH',
    fullTitle: 'Reduced Glutathione',
    plainEnglishExplanation: 'Master intracellular antioxidant protecting cells from free radicals.',
    category: 'Lab/Biomarker'
  },
  'CoQ10': {
    shortForm: 'CoQ10',
    fullTitle: 'Coenzyme Q10 (Ubiquinol)',
    plainEnglishExplanation: 'Essential nutrient required by cell mitochondria for energy (ATP) production.',
    category: 'Lab/Biomarker'
  },
  'QRS': {
    shortForm: 'QRS',
    fullTitle: 'QRS Complex (Ventricular Depolarization)',
    plainEnglishExplanation: 'ECG waveform representing contraction of the heart ventricles.',
    category: 'Cardiology'
  },
  'ST': {
    shortForm: 'ST',
    fullTitle: 'ST Segment (Ventricular Repolarization)',
    plainEnglishExplanation: 'ECG segment between heart contraction and recovery; monitored for cardiac ischemia.',
    category: 'Cardiology'
  },
  'NfL': {
    shortForm: 'NfL',
    fullTitle: 'Neurofilament Light Chain',
    plainEnglishExplanation: 'Biomarker released into blood/CSF during nerve cell structural degeneration.',
    category: 'Neurology'
  },
  'hsCRP': {
    shortForm: 'hsCRP',
    fullTitle: 'High-Sensitivity C-Reactive Protein',
    plainEnglishExplanation: 'Liver-produced protein measuring systemic vascular inflammation.',
    category: 'Lab/Biomarker'
  },
  'ORS': {
    shortForm: 'ORS',
    fullTitle: 'Oral Rehydration Solution',
    plainEnglishExplanation: 'Balanced electrolyte and glucose liquid for pediatric and acute rehydration.',
    category: 'Lab/Biomarker'
  },
  'IHD': {
    shortForm: 'IHD',
    fullTitle: 'Ischemic Heart Disease',
    plainEnglishExplanation: 'Reduced blood supply to heart muscle due to narrowed coronary arteries.',
    category: 'Cardiology'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AcronymExpanderService {
  readonly currentKssScore = signal<number>(3); // Default Alert KSS 3
  readonly autoExpandEnabled = signal<boolean>(true);

  // Expand acronyms automatically when KSS >= 5 (fatigue mode) or when explicitly enabled
  readonly shouldExpand = computed(() => {
    return this.autoExpandEnabled() && this.currentKssScore() >= 5;
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('kss-score-change', (e: any) => {
        if (e.detail && typeof e.detail === 'number') {
          this.currentKssScore.set(e.detail);
        }
      });
    }
  }

  /**
   * Expands medical acronyms in plain text into full English titles and explanations.
   */
  expandText(text: string, forceExpand: boolean = false): string {
    if (!text) return text;
    if (!this.shouldExpand() && !forceExpand) return text;

    let expanded = text;
    for (const [key, def] of Object.entries(MEDICAL_ACRONYM_DICTIONARY)) {
      // Regex targeting whole-word acronym matches not already followed by full text
      const regex = new RegExp(`\\b${key}\\b(?!\\s*\\([a-zA-Z\\s]+\\))`, 'g');
      expanded = expanded.replace(regex, `${def.fullTitle} (${def.shortForm})`);
    }
    return expanded;
  }

  /**
   * Generates HTML with interactive <abbr> tooltips for acronyms.
   */
  enhanceHtmlWithTooltips(text: string): string {
    if (!text) return text;
    let result = text;
    for (const [key, def] of Object.entries(MEDICAL_ACRONYM_DICTIONARY)) {
      const regex = new RegExp(`\\b${key}\\b(?![^<]*>)`, 'g');
      result = result.replace(
        regex,
        `<abbr title="${def.fullTitle}: ${def.plainEnglishExplanation}" class="underline decoration-dotted decoration-emerald-500 cursor-help font-semibold text-emerald-700 dark:text-emerald-300">${def.shortForm}</abbr>`
      );
    }
    return result;
  }
}
