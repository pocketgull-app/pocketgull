import { Injectable, signal } from '@angular/core';

export interface ITermDefinition {
  term: string;
  definition: string;
  clinicalDefinition?: string;
  category: 'western' | 'genetics' | 'tcm' | 'ayurveda' | 'actuarial' | 'vitals';
}

@Injectable({
  providedIn: 'root'
})
export class MedicalDecoderService {
  /** Reading level mode: 'patient' (plain layperson) vs 'clinical' (rigorous medical nomenclature) */
  readonly readingLevel = signal<'patient' | 'clinical'>('patient');

  private readonly dictionary: Record<string, ITermDefinition> = {
    'rppg': {
      term: 'rPPG',
      definition: 'Camera Pulse Measurement: Detecting blood flow pulses by analyzing skin micro-color changes.',
      clinicalDefinition: 'Remote Photoplethysmography: Non-contact optical sensing of cardiovascular blood volume pulse (BVP) via 530nm dermal reflectance.',
      category: 'vitals'
    },
    'spo2': {
      term: 'SpO2',
      definition: 'Blood Oxygen Level: The percentage of oxygen your red blood cells are carrying.',
      clinicalDefinition: 'Peripheral Capillary Oxygen Saturation: Spectrophotometric ratio of oxygenated to total hemoglobin.',
      category: 'vitals'
    },
    'sofa': {
      term: 'SOFA Score',
      definition: 'Organ Function Score: An ICU score assessing how well major organs are performing.',
      clinicalDefinition: 'Sequential Organ Failure Assessment: Multi-system score evaluating respiratory, coagulation, hepatic, cardiovascular, and renal status.',
      category: 'western'
    },
    'lace': {
      term: 'LACE Index',
      definition: 'Hospital Readmission Risk: A score calculating likelihood of needing hospital care after discharge.',
      clinicalDefinition: 'LACE Readmission Score: Actuarial model combining Length of stay, Admission acuity, Comorbidities, and ED visits.',
      category: 'actuarial'
    },
    'apob': {
      term: 'ApoB',
      definition: 'Apolipoprotein B: A direct count of all cholesterol particles that can cause arterial plaque.',
      clinicalDefinition: 'Apolipoprotein B-100: Structural apolipoprotein for atherogenic lipoprotein particles (VLDL, IDL, LDL).',
      category: 'western'
    },
    'hs-crp': {
      term: 'hs-CRP',
      definition: 'High-Sensitivity C-Reactive Protein: A blood marker measuring general vascular inflammation.',
      clinicalDefinition: 'High-Sensitivity C-Reactive Protein: Acute-phase reactant synthesizing hepatic inflammatory response.',
      category: 'western'
    },
    'homocysteine': {
      term: 'Homocysteine',
      definition: 'An amino acid marker indicating methylation efficiency and cardiovascular/brain health.',
      clinicalDefinition: 'Homocysteine: Non-proteinogenic amino acid homologue of cysteine involved in methionine transsulfuration.',
      category: 'western'
    },
    'qrs': {
      term: 'QRS Duration',
      definition: 'The electrical measurement (in milliseconds) of how fast your heart ventricles pump.',
      clinicalDefinition: 'QRS Interval: Electrocardiographic duration of ventricular depolarization.',
      category: 'western'
    },
    'qtc': {
      term: 'QTc Interval',
      definition: 'The heart rate-corrected duration of heart muscle electrical recharge.',
      clinicalDefinition: 'Corrected QT Interval: Rate-adjusted duration of ventricular repolarization (Bazett/Fridericia formula).',
      category: 'western'
    },
    'sdnn': {
      term: 'SDNN',
      definition: 'Standard deviation of heartbeats: The primary measure of overall Heart Rate Variability (HRV).',
      clinicalDefinition: 'SDNN: Standard deviation of normal-to-normal RR intervals evaluating autonomic nervous system balance.',
      category: 'western'
    },
    'vagal tone': {
      term: 'Vagal Tone',
      definition: 'The strength of your vagus nerve in calming your heart rate and lowering stress.',
      clinicalDefinition: 'Parasympathetic Vagal Tone: Efferent vagal nerve activity modulating sinoatrial node pacemaker rate.',
      category: 'western'
    },
    'mthfr': {
      term: 'MTHFR',
      definition: 'A key gene controlling how your body converts folate into active B12 for DNA repair.',
      clinicalDefinition: 'Methylenetetrahydrofolate Reductase: Enzyme catalyzing reduction of 5,10-methylenetetrahydrofolate to 5-methyltetrahydrofolate.',
      category: 'genetics'
    },
    'l-5-mthf': {
      term: 'L-5-MTHF',
      definition: 'The active, bioavailable form of folate that bypasses MTHFR gene mutations.',
      clinicalDefinition: 'L-5-Methyltetrahydrofolate: Primary circulating folate metabolite required for homocysteine remethylation.',
      category: 'genetics'
    },
    'ubiquinol': {
      term: 'Ubiquinol',
      definition: 'The active antioxidant form of CoQ10 that fuels cellular mitochondria energy.',
      clinicalDefinition: 'Ubiquinol: Reduced electron-rich lipid-soluble antioxidant form of Coenzyme Q10 in mitochondrial electron transport.',
      category: 'genetics'
    },
    'sirtuins': {
      term: 'Sirtuins',
      definition: 'Longevity proteins that regulate cellular repair, inflammation, and aging pace.',
      clinicalDefinition: 'SIRT1-7: NAD+-dependent class III histone deacetylases regulating metabolic homeostasis and chromatin stability.',
      category: 'genetics'
    },
    'qi': {
      term: 'Qi',
      definition: 'In Chinese Medicine, the vital life force energy flowing through your body meridians.',
      clinicalDefinition: 'Qi: Bio-energetic functional capacity and tissue perfusion vector in Traditional Chinese Medicine.',
      category: 'tcm'
    },
    'shen': {
      term: 'Shen',
      definition: 'In Chinese Medicine, your mind, spirit, and emotional clarity housed in the Heart.',
      clinicalDefinition: 'Shen: Neuro-cognitive and affective coherence domain housed in the Cardiac Zang-Fu organ system.',
      category: 'tcm'
    },
    'ren mai': {
      term: 'Ren Mai',
      definition: 'The Conception Vessel meridian regulating reproductive health and Yin energy.',
      clinicalDefinition: 'Conception Vessel (Ren Mai): Extraordinary meridian governing neuro-endocrine reproductive axes.',
      category: 'tcm'
    },
    'jing': {
      term: 'Jing',
      definition: 'In Chinese Medicine, your foundational kidney essence and cellular longevity reserve.',
      clinicalDefinition: 'Kidney Jing: Endogenous genetic and constitutional physiological reserve capacity.',
      category: 'tcm'
    },
    'ama': {
      term: 'Ama',
      definition: 'In Ayurveda, metabolic toxins and un-digested waste accumulated in tissues.',
      clinicalDefinition: 'Ama: Pro-inflammatory metabolic auto-antigens and endotoxins resulting from incomplete digestion (Mandagni).',
      category: 'ayurveda'
    },
    'agni': {
      term: 'Agni',
      definition: 'In Ayurveda, your metabolic digestive fire responsible for nutrient absorption.',
      clinicalDefinition: 'Agni: Enzymatic and metabolic oxidative capacity across gastrointestinal and cellular (Dhatu) tissue levels.',
      category: 'ayurveda'
    },
    'vata': {
      term: 'Vata',
      definition: 'The Ayurvedic energy governing movement, nervous system, and circulation.',
      clinicalDefinition: 'Vata Dosha: Biological principle governing neuromuscular activity, transport, and autonomic impulse flow.',
      category: 'ayurveda'
    },
    'pitta': {
      term: 'Pitta',
      definition: 'The Ayurvedic energy governing digestion, metabolism, and body temperature.',
      clinicalDefinition: 'Pitta Dosha: Biological principle governing thermogenesis, enzymatic digestion, and metabolic transformation.',
      category: 'ayurveda'
    },
    'kapha': {
      term: 'Kapha',
      definition: 'The Ayurvedic energy governing bodily structure, lubrication, and stability.',
      clinicalDefinition: 'Kapha Dosha: Biological principle governing structural homeostasis, extracellular matrix integrity, and fluid lubrication.',
      category: 'ayurveda'
    },
    'rasayana': {
      term: 'Rasayana',
      definition: 'Traditional Ayurvedic rejuvenation protocols promoting cellular longevity.',
      clinicalDefinition: 'Rasayana: Adaptogenic and senolytic pharmacological protocols promoting tissue longevity and immune resilience.',
      category: 'ayurveda'
    },
    'gompertz': {
      term: 'Gompertz-Makeham',
      definition: 'An actuarial mathematical law modeling mortality risk and aging rates over time.',
      clinicalDefinition: 'Gompertz-Makeham Hazard Function: Parametric demographic mortality model combining age-dependent exponential hazard and age-independent baseline risk.',
      category: 'actuarial'
    },
    'qaly': {
      term: 'QALY',
      definition: 'Quality-Adjusted Life Year: A standard measure combining length and quality of life.',
      clinicalDefinition: 'Quality-Adjusted Life Year (QALY): Health economics utility metric weighting survival time by health state utility preference (0 to 1).',
      category: 'actuarial'
    }
  };

  /** Active Web Speech narration status signal */
  readonly isSpeaking = signal<boolean>(false);

  public toggleReadingLevel(): void {
    this.readingLevel.update(mode => mode === 'patient' ? 'clinical' : 'patient');
  }

  public getDefinition(term: string): ITermDefinition | null {
    const key = term.toLowerCase().trim();
    return this.dictionary[key] || null;
  }

  public speakTermDefinition(term: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const def = this.getDefinition(term);
    if (!def) return;

    window.speechSynthesis.cancel();
    const isClinical = this.readingLevel() === 'clinical';
    const textToSpeak = isClinical && def.clinicalDefinition
      ? `Clinical Specification for ${def.term}: ${def.clinicalDefinition}`
      : `Plain Summary for ${def.term}: ${def.definition}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
    }
  }

  public annotateText(html: string): string {
    if (!html) return '';
    let annotated = html;
    const isClinical = this.readingLevel() === 'clinical';

    Object.keys(this.dictionary).forEach(key => {
      const def = this.dictionary[key];
      const tooltipText = isClinical && def.clinicalDefinition 
        ? `🔬 Clinical Spec: ${def.clinicalDefinition}`
        : `💡 Plain Summary: ${def.definition}`;

      const regex = new RegExp(`\\b(${def.term})\\b`, 'gi');
      annotated = annotated.replace(regex, `<mark class="medical-term cursor-help bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold px-1 rounded hover:bg-teal-500/20 transition" title="${tooltipText}">$1</mark>`);
    });

    return annotated;
  }
}
