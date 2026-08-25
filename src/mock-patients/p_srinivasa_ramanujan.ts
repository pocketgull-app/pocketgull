import { IPatient } from '../services/patient.types';

export const p_srinivasa_ramanujan: IPatient = {
  id: 'p_srinivasa_ramanujan',
  name: 'Srinivasa Ramanujan',
  age: 32,
  gender: 'Male',
  lastVisit: '1920.04.26',
  preexistingConditions: [
    'Hepatic Amoebiasis',
    'Gastric Malabsorption & Dyspepsia',
    'Vishamagni (Irregular Metabolic Fire)',
    'Vata-Pitta Irregularity'
  ],
  patientGoals: 'Restore gastric Agni metabolic fire, pacify Vata motility irregularity, heal intestinal mucosal barrier, and restore physical energy for mathematical research.',
  vitals: {
    bp: '112/72',
    hr: '76',
    spO2: '98%',
    temp: '98.2°F',
    weight: '115 lbs',
    height: '5\'6"'
  },
  tcmIntake: {
    tongueColor: 'pale',
    tongueCoating: 'yellow-greasy',
    pulseQuality: 'wiry',
    thermalPreference: 'aversion-cold',
    sweatPattern: 'spontaneous-day',
    tasteInMouth: 'bitter',
    tcmPattern: 'Spleen Qi Deficiency with Damp-Heat in Liver & Gallbladder'
  },
  ayurvedicIntake: {
    prakritiVata: 7,
    prakritiPitta: 6,
    prakritiKapha: 2,
    vikritiVata: 9,
    vikritiPitta: 8,
    vikritiKapha: 2,
    agniType: 'vishamagni',
    amaScore: 7.8,
    nadiPulseType: 'snake-vata',
    ayurvedicImbalance: 'Severe Vata-Pitta Spasm in Annavaha Srotas & Vishamagni'
  },
  medications: [
    { id: '1', name: 'Deglycyrrhizinated Licorice (DGL)', value: '400mg chewed 20 min before meals' },
    { id: '2', name: 'L-Glutamine Powder', value: '5g morning on empty stomach' },
    { id: '3', name: 'Zinc Carnosine (PepZin GI)', value: '75mg BID' },
    { id: '4', name: 'Tinospora cordifolia (Guduchi)', value: '500mg BID' }
  ],
  oxidativeStressMarkers: [
    { id: '1', name: 'Fecal Calprotectin', value: '185 mcg/g (Gut Mucosal Inflammation)' },
    { id: '2', name: 'Intestinal Permeability (Zonulin)', value: '64 ng/mL (Elevated Leaky Gut)' }
  ],
  issues: {
    abdomen: [
      {
        id: 'abdomen',
        noteId: 'note_ramanujan_hepatic_1',
        name: 'Hepatic Amoebic Inflammation & Agni Debility',
        painLevel: 7,
        description: 'Right upper quadrant hepatic tender distress, chronic dysentery history (Cambridge 1917–1919), and severe gastric malabsorption.',
        symptoms: [
          { name: 'Gastric spasm & malabsorption', type: 'Gastrointestinal', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  history: [
    {
      type: 'AnalysisRun',
      date: '1920.04.26',
      summary: 'Ayurvedic & TCM Gastric Agni Restoration Analysis',
      report: {
        'Summary Overview': '### Mathematical Prodigy Clinical Summary\nSrinivasa Ramanujan presents with severe hepatic amoebiasis, intestinal malabsorption, and acute Vishamagni (irregular digestive fire). Primary clinical imperatives: pacify severe Vata motility spasms, heal the intestinal epithelial barrier with mucosal emollients, and kindle Agni using warm, easily digestible Kitchari and carminative herbs.',
        'Functional Protocols': '### Warm Agni Kindling & Intestinal Barrier Repair\n- **Agni Activation**: Warm ginger decoction + Ajwain seed infusion 15 minutes prior to meals.\n- **Mucosal Layer Defense**: Deglycyrrhizinated Licorice (DGL) + Zinc Carnosine to soothe gastric mucosal lining.\n- **Enterocyte Regeneration**: L-Glutamine 5g morning on empty stomach to tight-junction enterocytes.',
        'Nutrition': '### Vata-Pacifying Restorative Kitchari Protocol\n- **Split Yellow Mung Bean & Basmati Rice Kitchari**: Prepared with Ghee, Cumin, Turmeric, Coriander, and Asafoetida (Hing).\n- **Avoid**: Raw cold salads, ice water, coarse raw bran, and high-histamine fermented foods during active flare.',
        'Precision Nutrients': '### Botanical Grow Thyself Protocols\n- **Tulsi (Ocimum sanctum / Holy Basil)**: 400mg BID (Vata-Kapha balancing adaptogen & antimicrobial defense).\n- **Zingiber officinale (Ginger)**: 500mg BID (Kindles Agni metabolic fire & disperses TCM Dampness).\n- **Phyllanthus emblica (Amalaki)**: 500mg daily (Pitta-soothing Rasayana for mucosal tissue regeneration).'
      }
    }
  ],
  bookmarks: []
};
