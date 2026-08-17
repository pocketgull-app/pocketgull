import { IPatient } from '../services/patient.types';

export const p010: IPatient = {
  id: 'p010',
  name: "Homo Sapiens (Female, Alzheimer's & Parkinson's Dual Overlap, 76y)",
  age: 76,
  gender: 'Female',
  lastVisit: '2026.08.13',
  preexistingConditions: [
    "Alzheimer's Disease (Early-to-Moderate Stage, MMSE 19/30)",
    "Parkinson's Disease (Hoehn & Yahr Stage II)",
    'Dual Neuropathology Overlap (Amyloid-Tau + Alpha-Synuclein Lewy Pathology)',
    'Neurogenic Orthostatic Hypotension (nOH)',
    'REM Sleep Behavior Disorder (RBD)'
  ],
  patientGoals: 'Maintain cognitive autonomy and daily executive memory, reduce nocturnal motor freezing and resting tremor, prevent orthostatic syncope during morning transitions, and optimize dual Carbidopa/Levodopa & Donepezil neuro-pharmacotherapy with integrative TCM and Ayurvedic Medhya Rasayanas.',
  vitals: {
    bp: '128/78 (Supine) / 102/64 (Standing)',
    hr: '68',
    temp: '98.1°F',
    spO2: '97%',
    weight: '134 lbs',
    height: "5'5\"",
    vitD3: '28 ng/mL',
    magnesium: '1.9 mg/dL',
    b12: '540 pg/mL',
    zinc: '72 mcg/dL'
  },
  tcmIntake: {
    tongueColor: 'pale',
    tongueCoating: 'thin-white',
    pulseQuality: 'deep-thready',
    thermalPreference: 'aversion-cold',
    sweatPattern: 'spontaneous-day',
    tasteInMouth: 'bland',
    tcmPattern: 'Kidney Essence (Jing) Deficiency & Liver Wind Agitation with Phlegm-Damp Stagnation'
  },
  ayurvedicIntake: {
    prakritiVata: 7,
    prakritiPitta: 3,
    prakritiKapha: 2,
    vikritiVata: 10,
    vikritiPitta: 5,
    vikritiKapha: 2,
    agniType: 'vishamagni',
    amaScore: 6.4,
    nadiPulseType: 'snake-vata',
    ashtavidhaStatus: 'Nadi (Vata-dominant), Jihva (Pale-coated), Mutra (Clear)',
    ayurvedicImbalance: 'Severe Kampavata (Vata Tremor/Parkinsonism) with Majja Dhatu Kshaya (Nervous Marrow Wasting)'
  },
  oxidativeStressMarkers: [
    { id: '1', name: 'CSF Amyloid-Beta 42/40 Ratio', value: '0.048 (Abnormal, Amyloid Plaque Deposition)' },
    { id: '2', name: 'CSF Phosphorylated Tau (p-Tau 181)', value: '68.4 pg/mL (Elevated Neurofibrillary Tangles)' },
    { id: '3', name: 'Alpha-Synuclein Seed Amplification (SAA)', value: 'Positive (Lewy Body Misfolding Aggregate)' },
    { id: '4', name: 'Serum Neurofilament Light (NfL)', value: '28.4 pg/mL (Axonal Neurodegeneration Marker)' }
  ],
  antioxidantSources: [
    { id: '1', name: 'Coenzyme Q10 (Ubiquinol Bio-Active)', value: '200mg QAM (Mitochondrial Electron Transport)' },
    { id: '2', name: 'Curcuminoid Phytosome Cross-BBB Formula', value: '500mg BID (Microglial Anti-Inflammatory)' },
    { id: '3', name: 'Brahmi (Bacopa Monnieri 50% Bacosides)', value: '450mg QAM (Medhya Rasayana Synaptic Plasticity)' },
    { id: '4', name: 'Kapikacchu (Mucuna Pruriens 15% L-DOPA)', value: '250mg BID (Natural Dopaminergic Seed Extract)' }
  ],
  medications: [
    { id: '1', name: 'Carbidopa / Levodopa (Sinemet 25/100mg)', value: '1 tablet TID (30 mins before meals - Dopamine Precursor)' },
    { id: '2', name: 'Donepezil HCl (Aricept 10mg)', value: '1 tablet QHS (Acetylcholinesterase Inhibitor)' },
    { id: '3', name: 'Memantine HCl (Namenda XR 28mg)', value: '1 capsule QAM (NMDA Receptor Antagonist)' },
    { id: '4', name: 'Rasagiline (Azilect 1mg)', value: '1 tablet QAM (MAO-B Dopaminergic Sparing)' },
    { id: '5', name: 'Fludrocortisone Acetate 0.1mg', value: '1 tablet QAM (Neurogenic Orthostatic Pressure Volume)' }
  ],
  biometricHistory: [
    { timestamp: '2026-08-01T08:00:00Z', type: 'hr', value: '68' },
    { timestamp: '2026-08-01T08:00:00Z', type: 'bp', value: '128/78' },
    { timestamp: '2026-08-10T08:00:00Z', type: 'bp', value: '102/64' },
    { timestamp: '2026-08-13T08:00:00Z', type: 'hr', value: '70' }
  ],
  clinicalNotes: [
    {
      id: 'note_p010_1',
      date: '2026.08.13',
      text: "Comprehensive Movement Disorder & Memory Clinic Evaluation:\n- Cognitive Status: MMSE 19/30 (Mild-to-Moderate impairment). Short-term recall 1/3 at 5 minutes. Clock drawing test shows right-sided spatial crowding.\n- Motor Evaluation: UPDRS Part III Motor Score 24. Asymmetric resting tremor in right upper extremity (3 Hz). Mild bilateral pill-rolling tremor, stooped posture, and decreased arm swing during gait.\n- Orthostatic Telemetry: Supine BP 128/78 -> Standing BP 102/64 at 3 mins (-26 mmHg SBP drop). Fludrocortisone dose maintained.\n- TCM & Ayurvedic Evaluation: Kidney Essence (Jing) Deficiency with Liver Wind Agitation (Tremor). Kampavata Vata imbalance. Integrate Bacopa (Brahmi) & Gastrodia (Tian Ma) adjuncts.\n- Neuro-Care Plan: Continue Sinemet 25/100mg TID 30 mins before high-protein meals (prevent amino acid competition across BBB). Maintain Donepezil 10mg QHS.",
      sourceLens: 'Neurology & Neurodegenerative Pathology'
    }
  ],
  issues: {
    head: [
      {
        id: 'head',
        noteId: 'note_p010_1',
        name: "Alzheimer's & Parkinson's Dual Neurodegenerative Overlap",
        painLevel: 3,
        description: 'Dual beta-amyloid/tau plaque and alpha-synuclein Lewy pathology presenting with cognitive memory impairment (MMSE 19/30) and resting tremor/bradykinesia (UPDRS III 24).',
        symptoms: [
          { name: 'Short-term memory recall impairment', type: 'Cognitive', verified: true, timeline: 'Chronic' },
          { name: 'Right upper extremity resting tremor (3 Hz)', type: 'Neurological', verified: true, timeline: 'Chronic' },
          { name: 'Neurogenic orthostatic lightheadedness', type: 'Autonomic', verified: true, timeline: 'Subacute' },
          { name: 'REM sleep behavior disorder (dream enactment)', type: 'Sleep', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.08.13',
      summary: "Alzheimer's & Parkinson's Dual Overlap Integrative Assessment (Western + TCM + Ayurvedic)",
      report: {
        'Summary Overview': "### 🧠 Dual Neurodegenerative Pathology Integrative Assessment\nPatient presents with concurrent Alzheimer's Disease and Parkinson's Disease (Hoehn & Yahr Stage II). Western neuro-pathology indicates dual amyloid-tau plaques and alpha-synuclein Lewy bodies. TCM pattern shows Kidney Essence (Jing) Deficiency & Liver Wind Agitation (*Shen Jing Kiu / Gan Feng*). Ayurvedic diagnosis reveals severe Kampavata (Vata Tremor) with Majja Dhatu Kshaya (Nervous Marrow Wasting).",
        'Functional Protocols': '### Tri-Paradigm Neuro-Pharmacotherapy & Timing Strategy\n- **Western L-DOPA Protocol**: Carbidopa/Levodopa 25/100mg TID 30 minutes before meals to avoid neutral amino acid BBB transport competition.\n- **TCM Wind-Extinguishing Protocol**: Gastrodia Elata (*Tian Ma*) & Uncaria Rhynchophylla (*Gou Teng*) to pacify internal Liver Wind tremor.\n- **Ayurvedic Medhya Rasayana Protocol**: Bacopa Monnieri (*Brahmi* 450mg QAM) to enhance cholinergic synaptic plasticity, paired with *Kapikacchu* (Mucuna Pruriens 15% natural L-DOPA) co-administration.\n- **Cholinesterase Protection**: Donepezil (10mg QHS) & Memantine XR (28mg QAM).',
        'Nutrition': '### Neuro-Protective & Vata-Pacifying Nutrition\n- **MCT Ketone Energy Substrate**: 15ml MCT C8 oil daily to provide microglial ATP bypass substrate.\n- **Ayurvedic Warm Vata Diet**: Warm, cooked foods with ghee, sesame oil, and ground spices (cinnamon, nutmeg, turmeric) to calm hyperactive Vata.\n- **Daylight Protein Redistribution**: Consume 70% of protein during evening meals to optimize daytime L-DOPA absorption.',
        'Precision Nutrients': '### Mitochondrial & Microglial Support\n- **Ubiquinol (CoQ10)**: 200mg QAM (Mitochondrial Complex I electron transport).\n- **Ashwagandha (Withania Somnifera)**: 600mg QHS (Vata-pacifying adaptogen, inhibits alpha-synuclein toxicity).\n- **Curcuminoid Phytosome**: 500mg BID (Cross-BBB microglial anti-inflammatory modulation).'
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: 'scan_p010_1',
      title: '18F-FDG Brain PET/CT Scan & Dopamine Transporter (DaTscan)',
      type: 'CT Scan',
      date: '2026.08.05',
      bodyPartId: 'head',
      description: 'FDG-PET demonstrates bilateral temporoparietal hypometabolism characteristic of Alzheimer pathology. DaTscan shows bilateral striatal loss of dopamine transporter binding, predominant in left putamen.',
      status: 'Abnormal'
    }
  ],
  anatomicalTarget: 'head',
  clinicalMoERoute: {
    primaryDomain: 'Neurology & Neurodegenerative Pathology',
    activeSpecialists: ['Cognitive Neurologist', 'Movement Disorder Specialist', 'Neuro-Pharmacologist', 'TCM Botanical Specialist', 'Ayurvedic Vaidya'],
    confidenceScore: 0.97,
    reasoning: 'Patient exhibits dual-pathology overlap of Alzheimer-type cholinergic memory loss and Parkinsonian nigrostriatal dopaminergic deficit.'
  }
};
