import { IPatient } from '../services/patient.types';

export const p009: IPatient = {
  id: 'p009',
  name: 'Homo Sapiens (Male, Pancreatic Oncology & Cachexia, 62y)',
  age: 62,
  gender: 'Male',
  lastVisit: '2026.08.12',
  preexistingConditions: [
    'Pancreatic Ductal Adenocarcinoma (PDAC, Stage III)',
    'Exocrine Pancreatic Insufficiency (EPI)',
    'Cancer-Related Cachexia & Muscle Wasting',
    'New-Onset Pancreatogenic Diabetes (Type 3c)'
  ],
  patientGoals: 'Manage postprandial epigastric pain radiating to mid-back, optimize nutrient absorption with PERT enzymes, suppress pro-inflammatory cytokine muscle wasting, and stabilize glycemic variability.',
  vitals: {
    bp: '118/74',
    hr: '78',
    temp: '98.2°F',
    spO2: '96%',
    weight: '142 lbs',
    height: "5'10\"",
    vitD3: '22 ng/mL',
    magnesium: '1.6 mg/dL',
    b12: '380 pg/mL',
    zinc: '58 mcg/dL'
  },
  oxidativeStressMarkers: [
    { id: '1', name: 'CA 19-9 (Carbohydrate Antigen 19-9)', value: '1,420 U/mL (Elevated)' },
    { id: '2', name: 'Serum Lipase & Amylase', value: '38 U/L (Low Exocrine Secretion)' },
    { id: '3', name: 'hs-CRP (C-Reactive Protein)', value: '14.2 mg/L (High Systemic Inflammation)' }
  ],
  antioxidantSources: [
    { id: '1', name: 'Pancrelipase PERT Enzymatic Activity', value: '72,000 USP units Lipase/meal' },
    { id: '2', name: 'Curcuminoid Phytosome Bio-Availability', value: '1,000mg BID' }
  ],
  medications: [
    { id: '1', name: 'Pancrelipase (Creon)', value: '24,000 USP units (PERT) with meals & snacks' },
    { id: '2', name: 'Gemcitabine + nab-Paclitaxel', value: 'Infusion Cycle 2, Day 1' },
    { id: '3', name: 'Metformin HCl', value: '500mg BID (AMPK Activation & Glycemic Modulation)' },
    { id: '4', name: 'Omega-3 EPA/DHA Ethyl Esters', value: '3,000mg Daily (Anti-Cachectic SPM Support)' },
    { id: '5', name: 'N-Acetylcysteine (NAC)', value: '1,200mg BID (Glutathione & Mucosal Protection)' }
  ],
  biometricHistory: [
    { timestamp: '2026-08-01T08:00:00Z', type: 'weight', value: 148 },
    { timestamp: '2026-08-06T08:00:00Z', type: 'weight', value: 145 },
    { timestamp: '2026-08-12T08:00:00Z', type: 'weight', value: 142 },
    { timestamp: '2026-08-12T08:00:00Z', type: 'hr', value: '78' },
    { timestamp: '2026-08-12T08:00:00Z', type: 'bp', value: '118/74' }
  ],
  tcmIntake: {
    tongueColor: 'pale',
    tongueCoating: 'yellow-greasy',
    pulseQuality: 'wiry',
    thermalPreference: 'afternoon-tidal-heat',
    sweatPattern: 'night-sweats',
    tasteInMouth: 'bitter',
    tcmPattern: 'Spleen Qi Deficiency with Damp-Heat Stagnation & Epigastric Blood Stasis'
  },
  ayurvedicIntake: {
    prakritiVata: 6,
    prakritiPitta: 8,
    prakritiKapha: 2,
    vikritiVata: 9,
    vikritiPitta: 8,
    vikritiKapha: 1,
    agniType: 'mandagni',
    amaScore: 7.8,
    nadiPulseType: 'frog-pitta',
    ayurvedicImbalance: 'Severe Pitta-Vata Aggravation in Grahani (Pancreas/Duodenum) & Dhatu Kshaya (Tissue Wasting)'
  },
  issues: {
    abdomen: [
      {
        id: 'abdomen',
        noteId: 'note_p009_pancreas_1',
        name: 'Pancreatic Head Mass & Exocrine Insufficiency',
        painLevel: 7,
        description: '3.4 cm hypodense pancreatic head lesion impinging on the common bile duct, causing postprandial epigastric pain radiating to mid-back and malabsorptive steatorrhea.',
        symptoms: [
          { name: 'Postprandial epigastric pain radiating to mid-back', type: 'Oncologic', verified: true, timeline: 'Chronic' },
          { name: 'Malabsorptive steatorrhea & early satiety', type: 'Gastrointestinal', verified: true, timeline: 'Chronic' },
          { name: 'Jaundice & elevated serum bilirubin', type: 'Hepatic', verified: true, timeline: 'Intermittent' }
        ]
      }
    ],
    full_body: [
      {
        id: 'full_body',
        noteId: 'note_p009_cachexia_1',
        name: 'Cancer-Related Cachexia & Muscle Wasting',
        painLevel: 5,
        description: 'Experiencing progressive weight loss (18 lbs over 3 months) driven by pro-inflammatory IL-6 and TNF-alpha cytokine elevation and reduced exocrine pancreatic enzyme output.',
        symptoms: [
          { name: 'Progressive involuntary weight loss & sarcopenia', type: 'Metabolic', verified: true, timeline: 'Chronic' },
          { name: 'Cancer-related fatigue', type: 'Systemic', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.08.12',
      summary: 'Pancreatic Oncology & Exocrine Insufficiency Comprehensive Assessment',
      report: {
        'Summary Overview': '### 🧬 Pancreatic Oncology & Metabolic Assessment\nPatient presents with Stage III Pancreatic Ductal Adenocarcinoma (PDAC), Exocrine Pancreatic Insufficiency (EPI), pancreatogenic diabetes (Type 3c), and cancer-related cachexia. Primary clinical imperatives: optimize digestive enzyme replacement therapy (PERT) to restore nutrient assimilation, mitigate pro-inflammatory cytokine-driven muscle wasting (IL-6/TNF-alpha), stabilize postprandial glycemic excursions, and manage epigastric pain radiating to the mid-back.',
        'Functional Protocols': '### Exocrine Replacement & Anti-Cachectic Strategy\n- **PERT Enzyme Protocol**: Pancrelipase (Creon 24,000–48,000 USP units Lipase) with first bite of all meals and snacks.\n- **Cytokine-Driven Cachexia Suppression**: High-dose EPA/DHA ethyl esters (3,000mg/day) to downregulate NF-kB & STAT3 muscle degradation signaling.\n- **Glycemic Stabilization**: Metformin (500mg BID) paired with low-glycemic load dietary pattern to maintain HbA1c < 7.0%.',
        'Nutrition': '### Pancreatic-Sparing & Anti-Cachectic Nutrition\n- **Medium-Chain Triglycerides (MCT)**: 15ml MCT oil daily for direct portal venous absorption bypassing pancreatic lipase.\n- **Hydrolyzed Protein Substrates**: Whey/pea protein isolate (30g/serving) for muscle protein synthesis.\n- **Avoid**: Refined simple sugars, fried high-fat meals, industrial seed oils, and alcohol.',
        'Precision Nutrients': '### Orthomolecular & Botanical Protocols\n- **Curcumin Phytosome (Meriva)**: 1,000mg BID (STAT3 & NF-kB anti-inflammatory modulation).\n- **Vitamin D3 + K2**: 5,000 IU daily (Immune homeostasis & bone mineral retention).\n- **Zinc Carnosine**: 75mg BID (Gastric & intestinal mucosal integrity).\n- **N-Acetylcysteine (NAC)**: 1,200mg BID (Glutathione pool replenishment).'
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: 'scan_p009_1',
      title: 'Contrast-Enhanced Abdominal CT (Pancreatic Protocol)',
      type: 'CT Scan',
      date: '2026.08.01',
      bodyPartId: 'abdomen',
      description: '3.4 x 2.8 cm hypoattenuating mass in the pancreatic head causing main pancreatic duct dilation (6mm) and common bile duct cutoff (11mm). No hepatic metastases.',
      status: 'Abnormal'
    }
  ]
};
