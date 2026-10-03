import { IPatient } from '../services/patient.types';

export const p_ada_lovelace: IPatient = {
  id: 'p_ada_lovelace',
  name: 'Countess Ada Lovelace',
  age: 36,
  gender: 'Female',
  lastVisit: '1852.11.27',
  preexistingConditions: [
    'Cholera Sequelae',
    'Chronic Pelvic Pain Syndrome (Endometrial)',
    'Neurological Executive Hyper-Activation',
    'Phlebotomy-Induced Anemia'
  ],
  patientGoals: 'Maintain analytical engine cognitive lucidity, mitigate cholera-induced dysautonomia, and resolve chronic pelvic neuro-inflammation.',
  vitals: {
    bp: '90/60',
    hr: '92',
    spO2: '96%',
    temp: '99.1°F',
    weight: '105 lbs',
    height: '5\'4\"',
    crp: '4.2 mg/L',
    hba1c: '4.8%'
  },
  customFields: [
    { key: 'Cognitive Engine', value: '⚙️ Analytical Engine Architecture (First Programmer)' },
    { key: 'Mathematical Poetics', value: '📜 Poetical Science & Bernoulli Numbers' },
    { key: 'Opioid Sparing', value: '🌿 Laudanum-Resistant (Requires Non-Opiate Pain Management)' }
  ],
  tcmIntake: {
    tongueColor: 'purple',
    tongueCoating: 'thin-white',
    pulseQuality: 'floating-rapid',
    thermalPreference: 'aversion-cold',
    sweatPattern: 'night-sweats',
    tasteInMouth: 'bitter',
    tcmPattern: 'Heart Yin Deficiency with Spleen Qi Depletion (Excessive Mental Fire)'
  },
  ayurvedicIntake: {
    prakritiVata: 7,
    prakritiPitta: 6,
    prakritiKapha: 2,
    vikritiVata: 9,
    vikritiPitta: 8,
    vikritiKapha: 1,
    agniType: 'vishamagni',
    amaScore: 5.4,
    nadiPulseType: 'snake-vata',
    ayurvedicImbalance: 'Vata-Pitta Aggravation in Majja Dhatu (Nervous System) & Apana Vata (Pelvic Region)'
  },
  medications: [
    { id: '1', name: 'Cannabidiol (CBD)', value: '100mg BID (Laudanum alternative for pelvic pain)' },
    { id: '2', name: 'L-Theanine', value: '200mg BID (Neurological pacing)' },
    { id: '3', name: 'N-Acetylcysteine (NAC)', value: '1,200mg BID (Phase II Detoxification)' }
  ],
  environmentalIndex: {
    aqi: 120,
    pm25: '45.0 µg/m³',
    ozone: '50 ppb',
    pollenDensity: 'Moderate',
    heatIndex: '55°F',
    vulnerabilityWarning: 'High ambient Victorian London coal smog.'
  },
  issues: {
    abdomen: [
      {
        id: 'abdomen',
        noteId: 'note_ada_pelvic_1',
        name: 'Chronic Pelvic Neuro-Inflammation',
        painLevel: 8,
        description: 'Severe, unremitting pelvic neuralgia and suspected endometrial inflammation.',
        symptoms: [
          { name: 'Pelvic hyperalgesia', type: 'Neurological', verified: true, timeline: 'Chronic' }
        ]
      }
    ],
    head: [
      {
        id: 'head',
        noteId: 'note_ada_neuro_1',
        name: 'Executive Hyper-Activation Fatigue',
        painLevel: 3,
        description: 'Neurological fatigue stemming from intense, sustained mathematical computation and abstraction.',
        symptoms: [
          { name: 'Cognitive pacing dysfunction', type: 'Neurological', verified: true, timeline: 'Intermittent' }
        ]
      }
    ]
  },
  history: [],
  bookmarks: []
};
