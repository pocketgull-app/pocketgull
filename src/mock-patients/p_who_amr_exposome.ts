// SPDX-License-Identifier: Apache-2.0
import { IPatient } from '../services/patient.types';
import { attachPatientWhoNihGoals } from '../utils/who-nih-goals-catalog';

const rawAmrExposomePatient: IPatient = {
  id: 'p_who_amr_exposome',
  name: 'Homo Sapiens (Female, Bronchiectasis & Wildfire PM2.5 Exposome, 47y)',
  age: 47,
  gender: 'Female',
  lastVisit: '2026.10.18',
  preexistingConditions: [
    'Non-Cystic Fibrosis Bronchiectasis',
    'Wildfire Smoke & PM2.5 Airway Hyperreactivity',
    'Recurrent Bacterial Exacerbations (Antimicrobial Stewardship Watch)',
    'Mild Resting Hypoxemia During High AQI Events'
  ],
  patientGoals:
    'Prevent unnecessary Watch/Reserve fluoroquinolone exposure (WHO AWaRe), shield lungs from wildfire PM2.5 (WHO SDG 3.9), and preserve SpO2 >= 95%.',
  occupation: 'Outdoor Agricultural Extension Specialist',
  reasonForVisit: 'High AQI respiratory flare evaluation & WHO AWaRe antibiotic de-escalation',
  dietaryProtocol: 'Sulforaphane-rich cruciferous phase-II detoxification and NAC glutathione precursor hydration',
  vitals: {
    bp: '118/74',
    hr: '88',
    temp: '99.1°F',
    spO2: '93%',
    weight: '144 lbs',
    height: '5\'5"',
    cgmGlucoseMgDl: '98',
    vitD3: '28 ng/mL',
    vitC: '0.8 mg/dL',
    magnesium: '1.8 mg/dL',
    zinc: '78 mcg/dL'
  },
  awareStewardship: [
    {
      medication: 'Amoxicillin / Clavulanate',
      category: 'Access',
      resistanceRisk: 'Low',
      stewardshipNote: 'Preferred WHO AWaRe Access first-line agent when sputum culture confirms susceptible H. influenzae'
    },
    {
      medication: 'Azithromycin',
      category: 'Watch',
      resistanceRisk: 'Moderate',
      stewardshipNote: 'Restrict strictly to refractory exacerbation protocols; monitor QTc and macrolide resistance'
    },
    {
      medication: 'Ciprofloxacin',
      category: 'Watch',
      resistanceRisk: 'High',
      stewardshipNote: 'Avoid empiric outpatient prescribing unless culture-confirmed Pseudomonas aeruginosa'
    }
  ],
  ewarsAlerts: [
    {
      id: 'ewars_amr_01',
      pathogen: 'Community Respiratory Syncytial & Pertussis Sentinel',
      viralCopyCount: '2.1x10^5 copies/mL (Wastewater Surge)',
      surgeStatus: 'Active Surge',
      whoBulletin: 'WHO-DON-2026-RESP-09',
      riskToPatient: 'High'
    }
  ],
  environmentalIndex: {
    aqi: 168,
    pm25: '78.4 µg/m³',
    ozone: '72 ppb',
    pollenDensity: 'Severe',
    heatIndex: '96°F',
    vulnerabilityWarning:
      'CRITICAL EXPOSOME ALERT (WHO AQG-3.9): PM2.5 exceeds 15x WHO annual threshold (78.4 ug/m3); enforce N95/HEPA shielding immediately.'
  },
  oknProfile: {
    isVerified: true,
    badgeLabel: '[🏛️ NSF OKN Verified]',
    participatingAgencies: ['EPA', 'NIH', 'WHO'],
    traversedPathSummary:
      'Wildfire PM2.5 Aerosol (EPA) <-> Nrf2 Airway Oxidative Stress (NIH) <-> Bronchial Mucociliary Clearance <-> WHO AWaRe Stewardship & SDG 3.9 Protocol (WHO)',
    groundedTargetConcept: 'Wildfire Exposome & WHO AWaRe Antimicrobial Preservation',
    auditTrailHash: 'sha256:synthetic-okn-who-amr-exposome-v1',
    cochraneEvidenceTier: 'Level A (Replicated RCTs)',
    pmidCitation: 'PMID:34112008'
  },
  issues: {
    chest: [
      {
        id: 'chest',
        noteId: 'amr_expo_01',
        name: 'PM2.5 Airway Hyperreactivity & Mucopurulent Cough',
        painLevel: 3,
        description:
          'Worsening morning productive cough and borderline resting desaturation (SpO2 93%) coinciding with regional wildfire smoke plume (AQI 168).',
        symptoms: [
          { name: 'Productive cough during AQI > 150', type: 'Respiratory', verified: true, timeline: 'Subacute' },
          { name: 'Mild exertional dyspnea', type: 'Pulmonary', verified: true, timeline: 'Acute' }
        ]
      }
    ]
  },
  bookmarks: [],
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.10.18',
      summary: 'WHO AWaRe Stewardship, WHO SDG 3.9 Exposomics & NIEHS Translational Plan',
      report: {
        'Summary Overview':
          '### Clinical Assessment\nPatient presents with smoke-triggered bronchiectasis flare (AQI `168`, `PM2.5 78.4 ug/m3`, `SpO2 93%`) alongside recurrent prior Watch-group fluoroquinolone exposure.\n\n### Priority List\n- **WHO-07 (AQG / SDG 3.9):** Immediate indoor HEPA H13 filtration and NIOSH N95 masking during outdoor field work.\n- **WHO-06 (WHO AWaRe / AMR):** Obtain sputum culture before antibiotic initiation; prioritize Access-tier coverage when bacterial.\n- **NIH-10 (CTSA / NIEHS):** Track PM2.5-driven oxidative lung burden.',
        'Functional Protocols':
          '### Exposome & Mucociliary Clearance\n- Twice-daily hypertonic saline (3%) airway clearance + oscillatory PEP therapy.\n- N-Acetylcysteine 600mg BID for glutathione replenishment and mucus viscosity reduction.',
        'Monitoring & Follow-up':
          '- Daily resting pulse oximetry (`alert if SpO2 < 92%`), sputum culture review at 48 hours, and local AQI tracking.',
        'Patient Education':
          '### Clean Air & Antibiotic Protection\nNot every cough flare from wildfire smoke is bacterial; testing sputum first prevents resistant infections while indoor HEPA filtration rapidly calms airway swelling.'
      }
    }
  ]
};

export const p_who_amr_exposome: IPatient = attachPatientWhoNihGoals(rawAmrExposomePatient);
