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
  patientGoals: 'Maintain cognitive autonomy and daily executive memory, reduce nocturnal motor freezing and resting tremor, prevent orthostatic syncope during morning transitions, and optimize dual Carbidopa/Levodopa & Donepezil neuro-pharmacotherapy.',
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
  oxidativeStressMarkers: [
    { id: '1', name: 'CSF Amyloid-Beta 42/40 Ratio', value: '0.048 (Abnormal, Amyloid Plaque Deposition)' },
    { id: '2', name: 'CSF Phosphorylated Tau (p-Tau 181)', value: '68.4 pg/mL (Elevated Neurofibrillary Tangles)' },
    { id: '3', name: 'Alpha-Synuclein Seed Amplification (SAA)', value: 'Positive (Lewy Body Misfolding Aggregate)' },
    { id: '4', name: 'Serum Neurofilament Light (NfL)', value: '28.4 pg/mL (Axonal Neurodegeneration Marker)' }
  ],
  antioxidantSources: [
    { id: '1', name: 'Coenzyme Q10 (Ubiquinol Bio-Active)', value: '200mg QAM (Mitochondrial Electron Transport)' },
    { id: '2', name: 'Curcuminoid Phytosome Cross-BBB Formula', value: '500mg BID (Microglial Anti-Inflammatory)' }
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
      text: "Comprehensive Movement Disorder & Memory Clinic Evaluation:\n- Cognitive Status: MMSE 19/30 (Mild-to-Moderate impairment). Short-term recall 1/3 at 5 minutes. Clock drawing test shows right-sided spatial crowding.\n- Motor Evaluation: UPDRS Part III Motor Score 24. Asymmetric resting tremor in right upper extremity (3 Hz). Mild bilateral pill-rolling tremor, stooped posture, and decreased arm swing during gait.\n- Orthostatic Telemetry: Supine BP 128/78 -> Standing BP 102/64 at 3 mins (-26 mmHg SBP drop). Fludrocortisone dose maintained.\n- Neuro-Care Plan: Continue Sinemet 25/100mg TID 30 mins before high-protein meals (prevent amino acid competition across BBB). Maintain Donepezil 10mg QHS.",
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
      summary: "Alzheimer's & Parkinson's Dual Overlap Neuro-Pathology Assessment",
      report: {
        'Summary Overview': "### 🧠 Dual Neurodegenerative Pathology Assessment\nPatient presents with concurrent Alzheimer's Disease and Parkinson's Disease (Hoehn & Yahr Stage II). Primary clinical imperatives: manage cholinergic executive cognitive loss, optimize dopaminergic motor control while preventing L-DOPA-induced dyskinesias, stabilize orthostatic pressure drops, and provide caregiver assistance for activities of daily living.",
        'Functional Protocols': '### Dual Neuro-Pharmacotherapy & Timing Strategy\n- **Carbidopa/Levodopa Timing**: Administer Sinemet 25/100mg 30 minutes before high-protein meals to prevent large neutral amino acids from competing across the Blood-Brain Barrier (BBB).\n- **Cholinesterase Protection**: Maintain Donepezil (10mg QHS) and Memantine XR (28mg QAM) to stabilize cortical acetylcholine and modulate NMDA glutamate excitotoxicity.\n- **Orthostatic Syncope Prevention**: Compression stockings, hydration, and Fludrocortisone 0.1mg QAM.',
        'Nutrition': '### Neuro-Protective & Brain Energy Nutrition\n- **Medium-Chain Triglyceride (MCT) Ketone Support**: 15ml MCT C8 oil daily to provide alternative microglial ATP substrate.\n- **Protein Redistribution Diet**: Consume 70% of daily protein during evening meals to maximize daylight L-DOPA motor absorption.',
        'Precision Nutrients': '### Mitochondrial & Microglial Support\n- **Ubiquinol (CoQ10)**: 200mg QAM (Mitochondrial Complex I bioenergetics).\n- **Curcuminoid Phytosome**: 500mg BID (Cross-BBB microglial anti-inflammatory modulation).\n- **Magnesium L-Threonate**: 2,000mg QHS (Synaptic density and sleep continuity).'
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
    activeSpecialists: ['Cognitive Neurologist', 'Movement Disorder Specialist', 'Neuro-Pharmacologist', 'Physical Therapist'],
    confidenceScore: 0.96,
    reasoning: 'Patient exhibits dual-pathology overlap of Alzheimer-type cholinergic memory loss and Parkinsonian nigrostriatal dopaminergic deficit.'
  }
};
