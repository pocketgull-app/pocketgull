// SPDX-License-Identifier: Apache-2.0
import { IPatient } from '../services/patient.types';
import { attachPatientWhoNihGoals } from '../utils/who-nih-goals-catalog';

const rawRecoverHealPatient: IPatient = {
  id: 'p_nih_recover_heal',
  name: 'Homo Sapiens (Non-binary, Post-Viral PASC Dysautonomia & Small-Fiber Pain, 36y)',
  age: 36,
  gender: 'Non-binary',
  lastVisit: '2026.10.22',
  preexistingConditions: [
    'Post-Acute Sequelae of SARS-CoV-2 (PASC) — NIH RECOVER Criteria Met',
    'Postural Orthostatic Tachycardia Syndrome (POTS / Dysautonomia)',
    'Small-Fiber Neuropathy with Distal Burning Allodynia',
    'Post-Exertional Malaise (PEM)'
  ],
  patientGoals:
    'Control severe burning foot neuropathic pain without opioid medications (NIH HEAL), stabilize orthostatic heart rate via 0.1 Hz vagal pacing (NIH BRAIN), and avoid PEM crashes (NIH RECOVER).',
  occupation: 'Technical Illustrator (Remote Adaptive Workstation)',
  reasonForVisit: 'Non-opioid neuropathic pain relief and energy-envelope dysautonomia pacing',
  dietaryProtocol: 'Mast-cell-stabilizing low-histamine whole foods with targeted electrolyte/sodium hydration (3–4 g/day)',
  vitals: {
    bp: '104/68',
    hr: '106',
    temp: '97.9°F',
    spO2: '97%',
    weight: '142 lbs',
    height: '5\'7"',
    cgmGlucoseMgDl: '96',
    vitD3: '21 ng/mL (Low)',
    magnesium: '1.6 mg/dL',
    b12: '340 pg/mL'
  },
  oxidativeStressMarkers: [
    { id: '1', name: 'Orthostatic HR Delta (NASA 10-Min Lean Test)', value: '+36 bpm on standing' },
    { id: '2', name: 'DN4 Neuropathic Pain Score', value: '7 / 10 (Positive Neuropathic Component)' },
    { id: '3', name: 'NIH RECOVER PASC Composite Score', value: '18 / 27 (Threshold >= 12)' }
  ],
  antioxidantSources: [
    { id: '1', name: 'Palmitoylethanolamide (PEA) Micronized', value: '600mg BID (Mast-Cell & Glial Pain Modulation)' },
    { id: '2', name: 'R-Alpha Lipoic Acid', value: '600mg QAM (Small-Fiber Nerve Protection)' },
    { id: '3', name: 'Benfotiamine (Vitamin B1)', value: '300mg Daily (Peripheral Axonal Bioenergetics)' }
  ],
  medications: [
    { id: '1', name: 'Low-Dose Naltrexone (LDN)', value: '3.0mg QHS (Non-opioid TLR4 neuro-glial modulator)' },
    { id: '2', name: 'Buffered Electrolyte Solution', value: '1000mL Morning Prior to Upright Activity' }
  ],
  oknProfile: {
    isVerified: true,
    badgeLabel: '[🏛️ NSF OKN Verified]',
    participatingAgencies: ['NIH'],
    traversedPathSummary:
      'Microglial TLR4 Sensitization (NIH) <-> Small-Fiber Nociceptive Firing <-> Vagal Baroreflex Uncoupling <-> NIH HEAL PEA / LDN + NIH RECOVER Pacing',
    groundedTargetConcept: 'Non-Opioid Small-Fiber Analgesia & Dysautonomia Energy Envelope',
    auditTrailHash: 'sha256:synthetic-okn-nih-recover-heal-v1',
    cochraneEvidenceTier: 'Level B (Cohort / Preliminary)',
    pmidCitation: 'PMID:37429428'
  },
  issues: {
    r_foot: [
      {
        id: 'r_foot',
        noteId: 'recover_heal_01',
        name: 'Right Plantar Small-Fiber Neuropathic Allodynia',
        painLevel: 8,
        description:
          'Severe nocturnal burning pain and sock-line thermal hypersensitivity rated 8/10; strictly managing with non-opioid NaV/TLR4-targeted modalities.',
        symptoms: [
          { name: 'Burning paresthesia and allodynia', type: 'Neuropathic Pain', verified: true, timeline: 'Chronic' }
        ]
      }
    ],
    l_foot: [
      {
        id: 'l_foot',
        noteId: 'recover_heal_02',
        name: 'Left Plantar Small-Fiber Neuropathic Allodynia',
        painLevel: 8,
        description:
          'Symmetric bilateral small-fiber burning dysesthesia aggravated by prolonged standing.',
        symptoms: [
          { name: 'Symmetric lancinating pain', type: 'Neuropathic Pain', verified: true, timeline: 'Chronic' }
        ]
      }
    ],
    chest: [
      {
        id: 'chest',
        noteId: 'recover_heal_03',
        name: 'Orthostatic Tachycardia & PEM Crash Susceptibility',
        painLevel: 4,
        description:
          'Heart rate surges to 106–128 bpm upright alongside post-exertional crashes lasting 48 hours after overpacing.',
        symptoms: [
          { name: 'Orthostatic palpitations', type: 'Autonomic', verified: true, timeline: 'Chronic' },
          { name: 'Post-exertional malaise', type: 'PASC', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  bookmarks: [],
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.10.22',
      summary: 'NIH HEAL Non-Opioid Pain & NIH RECOVER / BRAIN Pacing Trajectory',
      report: {
        'Summary Overview':
          '### Clinical Assessment\nPatient meets NIH RECOVER criteria (`PASC 18/27`) with disabling bilateral small-fiber burning pain (`8/10`) and POTS (`HR 106 bpm`).\n\n### Priority List\n- **NIH-02 (HEAL):** Non-opioid regimen via Micronized PEA 600mg BID, R-ALA 600mg, and LDN 3mg QHS.\n- **NIH-06 (RECOVER):** Strict anaerobic threshold HR pacing ceiling (`< 60% HRmax`).\n- **NIH-05 (BRAIN):** Supine 0.1 Hz resonant breathing (`4s in / 6s out`, 12 min/day).',
        'Functional Protocols':
          '### Act I Pacing & Repletion\n- Morning horizontal recumbent ankle pumps + 1L electrolyte bolus before rising.\n- Vitamin D3 repletion (target 50–70 ng/mL given `21 ng/mL`) and zero high-intensity aerobic interval testing during PEM flare.',
        'Monitoring & Follow-up':
          '- Weekly DN4 neuropathic visual analog scale, supine-to-standing HR delta, and PEM crash-free day streak.',
        'Patient Education':
          '### Energy Envelope Safety\nStaying below your aerobic crash ceiling protects damaged mitochondria and calms small-fiber pain signaling over Weeks 2–8.'
      }
    }
  ]
};

export const p_nih_recover_heal: IPatient = attachPatientWhoNihGoals(rawRecoverHealPatient);
