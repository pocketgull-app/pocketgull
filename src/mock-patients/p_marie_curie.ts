import { IPatient } from '../services/patient.types';

export const p_marie_curie: IPatient = {
  id: 'p_marie_curie',
  name: 'Madame Marie Curie',
  age: 66,
  gender: 'Female',
  lastVisit: '1934.07.04',
  preexistingConditions: [
    'Radiologic Aplastic Anemia',
    'Radiologic Dermatitis',
    'Bone Marrow Hematopoietic Suppression',
    'Mitochondrial Oxidative Stress'
  ],
  patientGoals: 'Regenerate bone marrow hematopoietic stem cells, upregulate Phase II antioxidant Nrf2, and repair radiologic cutaneous burns.',
  vitals: {
    bp: '108/68',
    hr: '64',
    spO2: '97%',
    temp: '97.8°F',
    weight: '123 lbs',
    height: '5\'3"'
  },
  customFields: [
    { key: 'Atomic Lab Aesthetic', value: '⚛️ 1950s Gilbert U-238 Atomic Energy Lab (Brushed Lead & Steel Plate)' },
    { key: 'Isotope Activity', value: '☢️ Radium-226 (2.5 μCi / 1,600 yr Half-Life)' },
    { key: 'Geiger Counter Telemetry', value: '🎛️ 420 CPM (Alpha / Beta Particle Flux)' },
    { key: 'Lead Shielding Enclosure', value: '🛡️ 4.5 cm Solid Lead Crucible (Purity 99.8%)' },
    { key: 'Grow Thyself Radioprotection', value: '🌿 Ashwagandha, Ginkgo biloba, Centella asiatica' }
  ],
  tcmIntake: {
    tongueColor: 'pale',
    tongueCoating: 'thin-white',
    pulseQuality: 'deep-thready',
    thermalPreference: 'aversion-cold',
    sweatPattern: 'spontaneous-day',
    tasteInMouth: 'bland',
    tcmPattern: 'Bone Marrow Jing Depletion & Blood Qi Deficiency'
  },
  ayurvedicIntake: {
    prakritiVata: 7,
    prakritiPitta: 5,
    prakritiKapha: 3,
    vikritiVata: 9,
    vikritiPitta: 7,
    vikritiKapha: 2,
    agniType: 'mandagni',
    amaScore: 6.2,
    nadiPulseType: 'snake-vata',
    ayurvedicImbalance: 'Severe Vata Aggravation in Majja Dhatu (Bone Marrow) & Ojas Depletion'
  },
  medications: [
    { id: '1', name: 'N-Acetylcysteine (NAC)', value: '1,200mg BID (Glutathione Precursor)' },
    { id: '2', name: 'Sulforaphane Extract', value: '50mg daily (Nrf2 Activation)' },
    { id: '3', name: 'CoQ10 (Ubiquinol)', value: '300mg daily (Mitochondrial Protection)' },
    { id: '4', name: 'Specialized Pro-Resolving Mediators (SPMs)', value: '1,000mg BID' }
  ],
  oxidativeStressMarkers: [
    { id: '1', name: '8-hydroxy-2\'-deoxyguanosine (8-OHdG)', value: '18.4 ng/mg Cr (DNA Oxidative Damage)' },
    { id: '2', name: 'Radium-226 Serum Isotope Activity', value: 'Elevated Internal Alpha Emitter' }
  ],
  issues: {
    chest: [
      {
        id: 'chest',
        noteId: 'note_curie_marrow_1',
        name: 'Bone Marrow Hematopoietic Suppression',
        painLevel: 6,
        description: 'Severe radiologic aplastic anemia from chronic unshielded radium-226 and polonium-210 exposure.',
        symptoms: [
          { name: 'Hematopoietic stem cell fatigue', type: 'Systemic', verified: true, timeline: 'Chronic' }
        ]
      }
    ],
    skin: [
      {
        id: 'skin',
        noteId: 'note_curie_dermatitis_1',
        name: 'Radiologic Cutaneous Dermatitis',
        painLevel: 5,
        description: 'Bilateral palmar and forearm radiologic erythema, desquamation, and superficial tissue ulceration.',
        symptoms: [
          { name: 'Palmar desquamation', type: 'Dermatologic', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  history: [
    {
      type: 'AnalysisRun',
      date: '1934.07.04',
      summary: 'Nobel Radiologic & Gilbert U-238 Atomic Energy Lab Regeneration Analysis',
      report: {
        'Summary Overview': '### ⚛️ Gilbert U-238 Atomic Energy Lab Clinical Summary\nMadame Marie Curie presents with severe radiologic aplastic anemia and chronic radium dermatitis resulting from decades of unshielded laboratory research with radium and polonium isotopes. Primary clinical imperatives: stimulate bone marrow hematopoietic stem cell niche regeneration, upregulate Nrf2 phase II cellular detoxification pathways, and arrest double-strand DNA oxidative breakdown inside our lead-shielded Gilbert U-238 Atomic Chamber.',
        'Functional Protocols': '### Radioprotection & Hematopoietic Regeneration\n- **Nrf2 Phase II Gene Activation**: High-dose Sulforaphane (50mg) + N-Acetylcysteine (1,200mg BID) to restore cellular Glutathione pools.\n- **Autophagy Clearing**: Fasting autophagic clearance of damaged radiologic subcellular debris (Ohsumi Autophagy Protocol).\n- **$\\\\Psi$-Modified mRNA Repair**: Pseudouridine-substituted cellular repair transcripts to bypass endosomal TLR7/8 immune activation.',
        'Nutrition': '### Radioprotective & DNA-Repair Nutrition\n- **Glutathione-Rich Crucifers**: Steamed broccoli sprouts, bok choy, and watercress.\n- **Anthocyanin Berries**: Wild blueberries, dark pomegranates, and aronia berries for vascular endothelial repair.\n- **Avoid**: Pro-inflammatory omega-6 industrial oils and refined simple sugars that accelerate DNA methyltransferase breakdown.',
        'Precision Nutrients': '### Orthomolecular & Botanical Grow Thyself Protocols\n- **Ashwagandha (Withania somnifera)**: 500mg BID (Bone marrow radioprotection & adaptogenic GABAergic support).\n- **Ginkgo biloba Extract**: 120mg BID (Microvascular cutaneous and cerebral perfusion).\n- **Centella asiatica (Gotu Kola)**: 400mg daily (Collagen type I/III synthesis for radiologic skin remodeling).'
      }
    }
  ],
  bookmarks: []
};
