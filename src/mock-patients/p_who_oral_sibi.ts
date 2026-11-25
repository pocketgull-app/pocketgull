// SPDX-License-Identifier: Apache-2.0
import { IPatient } from '../services/patient.types';
import { attachPatientWhoNihGoals } from '../utils/who-nih-goals-catalog';

const rawOralSibiPatient: IPatient = {
  id: 'p_who_oral_sibi',
  name: 'Homo Sapiens (Male, Periodontal-Cardiometabolic SIBI, 54y)',
  age: 54,
  gender: 'Male',
  lastVisit: '2026.10.14',
  preexistingConditions: [
    'Stage III Periodontitis (PPD >= 6mm)',
    'Essential Hypertension',
    'Prediabetes & Endothelial Dysfunction',
    'Elevated Systemic Inflammatory Burden Index (SIBI)'
  ],
  patientGoals:
    'Resolve chronic periodontal bleeding and jaw tenderness, stabilize blood glucose time-in-range, and lower vascular inflammation under WHO WHA74.5 and WHO SDG 3.4.',
  occupation: 'Public Transit Operator',
  reasonForVisit: 'Periodontal-cardiovascular systemic risk reconciliation and glycemic stabilization',
  dietaryProtocol: 'Anti-inflammatory low-glycemic whole-foods pattern with polyphenol green tea and omega-3 SPM support',
  vitals: {
    bp: '142/88',
    hr: '82',
    temp: '98.4°F',
    spO2: '97%',
    weight: '198 lbs',
    height: '5\'10"',
    cgmGlucoseMgDl: '148',
    vitD3: '26 ng/mL',
    vitC: '0.6 mg/dL (Sub-optimal)',
    magnesium: '1.7 mg/dL',
    zinc: '68 mcg/dL'
  },
  oxidativeStressMarkers: [
    { id: '1', name: 'hsCRP', value: '4.9 mg/L (Elevated Vascular Risk)' },
    { id: '2', name: 'HbA1c', value: '6.8%' },
    { id: '3', name: 'Salivary MMP-8', value: 'Elevated Active Collagenolysis' }
  ],
  antioxidantSources: [
    { id: '1', name: 'CoQ10 (Ubiquinol)', value: '200mg Daily (Gingival Bioenergetics)' },
    { id: '2', name: 'Vitamin C + Bioflavonoids', value: '500mg BID (Collagen Cross-Linking)' },
    { id: '3', name: 'Omega-3 EPA/DHA', value: '2000mg Daily (Periodontal SPM Resolution)' }
  ],
  medications: [
    { id: '1', name: 'Lisinopril', value: '20mg Daily (BP Control)' },
    { id: '2', name: 'Metformin XR', value: '1000mg QPM' },
    { id: '3', name: '0.12% Chlorhexidine Short-Course Rinse', value: '14-Day Periodontal Debridement Adjunct' }
  ],
  oknProfile: {
    isVerified: true,
    badgeLabel: '[🏛️ NSF OKN Verified]',
    participatingAgencies: ['NIH', 'WHO'],
    traversedPathSummary:
      'P. gingivalis Endotoxin (NIH) <-> Toll-Like Receptor 4 Endothelial Activation <-> Arterial Intima-Media Thickening <-> WHO WHA74.5 Oral-Systemic Intervention (WHO)',
    groundedTargetConcept: 'WHO WHA74.5 Periodontal-Cardiometabolic SIBI Axis',
    auditTrailHash: 'sha256:synthetic-okn-who-oral-sibi-v1',
    cochraneEvidenceTier: 'Level A (Replicated RCTs)',
    pmidCitation: 'PMID:32191304'
  },
  issues: {
    head: [
      {
        id: 'head',
        noteId: 'oral_sibi_01',
        name: 'Stage III Generalized Periodontitis & Gingival Pocket Depth',
        painLevel: 4,
        description:
          'Deep periodontal pockets (6 mm on molars 16 and 36), bleeding on probing, and elevated salivary MMP-8 contributing to Systemic Inflammatory Burden Index (SIBI).',
        symptoms: [
          { name: 'Periodontal bleeding on brushing', type: 'Oral-Systemic', verified: true, timeline: 'Chronic' },
          { name: 'Mastication tenderness (Tooth #16 / #36)', type: 'Dental', verified: true, timeline: 'Subacute' }
        ]
      }
    ],
    chest: [
      {
        id: 'chest',
        noteId: 'oral_sibi_02',
        name: 'Endothelial Stiffness & Cardiometabolic Risk',
        painLevel: 2,
        description:
          'Elevated systolic blood pressure (142/88 mmHg) and postprandial glycemic drift co-modulated by chronic oral inflammatory bacteremia.',
        symptoms: [
          { name: 'Borderline exertional fatigue', type: 'Cardiometabolic', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  bookmarks: [],
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.10.14',
      summary: 'WHO WHA74.5 Oral-Systemic & WHO SDG 3.4 Cardiometabolic Reconciliation',
      report: {
        'Summary Overview':
          '### Clinical Assessment\nPatient exhibits classic bidirectional periodontal-cardiometabolic coupling linking Stage III periodontitis (PPD 6 mm, WHO WHA74.5 priority) to elevated hsCRP, systolic hypertension (`142/88 mmHg`), and dysglycemia (`CGM 148 mg/dL`).\n\n### Priority List\n- **WHO-08 (Oral Health / SIBI):** Coordinate non-surgical scaling & root planing within 14 days.\n- **WHO-01 / WHO-02 (SDG 3.4 & HEARTS):** Lower systolic pressure below 130 mmHg via sodium restriction and ACE-i adherence.\n- **NIH-04 (HP2030 D-01):** Achieve CGM Time-in-Range >= 70%.',
        'Functional Protocols':
          '### Oral-Vascular Inflammation Resolution\n- Schedule phased nonsurgical periodontal debridement (avoiding unnecessary systemic broad-spectrum antibiotics).\n- Initiate CoQ10 ubiquinol 200mg + Vitamin C 500mg BID for gingival microcirculation.\n- Pair 15-minute postprandial walking with 10-hour daytime time-restricted feeding.',
        'Monitoring & Follow-up':
          '- Re-evaluate PPD probing depth, bleeding index, hsCRP, and 14-day home BP log at Week 6.',
        'Patient Education':
          '### Oral-Heart Connection\nReducing gum pocket inflammation lowers circulating inflammatory signals that stiffen blood vessels and elevate blood sugar.'
      }
    }
  ]
};

export const p_who_oral_sibi: IPatient = attachPatientWhoNihGoals(rawOralSibiPatient);
