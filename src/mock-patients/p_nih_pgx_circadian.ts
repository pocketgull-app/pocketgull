// SPDX-License-Identifier: Apache-2.0
import { IPatient } from '../services/patient.types';
import { attachPatientWhoNihGoals } from '../utils/who-nih-goals-catalog';

const rawPgxCircadianPatient: IPatient = {
  id: 'p_nih_pgx_circadian',
  name: 'Homo Sapiens (Female, CYP2C19/CYP2D6 Poor Metabolizer & Circadian Mood Shift, 39y)',
  age: 39,
  gender: 'Female',
  lastVisit: '2026.10.25',
  preexistingConditions: [
    'CYP2C19 & CYP2D6 Dual Poor Metabolizer (CPIC High-Risk Actionable)',
    'Delayed Sleep-Wake Phase Disorder & Glymphatic Drift',
    'Moderate Major Depressive & Generalized Anxiety Symptoms (WHO mhGAP Priority)',
    'MTHFR C677T Heterozygous Methylation Variant'
  ],
  patientGoals:
    'Select CPIC-safe non-CYP2D6/2C19 therapy (NIH NHGRI), restore >= 7.5 hours circadian sleep without daytime hangover (NIH HP2030 SH-03), and stabilize mood (WHO mhGAP).',
  occupation: 'Emergency Dispatch Coordinator (Rotating Night Shifts)',
  reasonForVisit: 'Pharmacogenomic medication reconciliation, insomnia reset, and depressive symptom relief',
  dietaryProtocol: 'Timed circadian feeding (09:00–19:00 TRF) with natural folate methyl donors and zero evening caffeine',
  vitals: {
    bp: '116/72',
    hr: '74',
    temp: '98.2°F',
    spO2: '99%',
    weight: '150 lbs',
    height: '5\'6"',
    cgmGlucoseMgDl: '94',
    vitD3: '29 ng/mL',
    magnesium: '1.8 mg/dL',
    b12: '410 pg/mL'
  },
  genomicVariants: [
    {
      rsId: 'rs4244285',
      gene: 'CYP2C19',
      chromosome: '10',
      position: '94781859',
      genotype: '*2/*2 (Poor Metabolizer)',
      clinicalSignificance: 'High plasma exposure & QT/adverse reaction risk with standard-dose Citalopram/Escitalopram/Sertraline',
      pathogenicity: 'Pathogenic'
    },
    {
      rsId: 'rs3892097',
      gene: 'CYP2D6',
      chromosome: '22',
      position: '42128945',
      genotype: '*4/*4 (Poor Metabolizer)',
      clinicalSignificance: 'Zero prodrug activation for Codeine/Tramadol; severe toxicity risk with Fluoxetine, Paroxetine, and TCAs',
      pathogenicity: 'Pathogenic'
    },
    {
      rsId: 'rs1801133',
      gene: 'MTHFR',
      chromosome: '1',
      position: '11796321',
      genotype: 'C/T (Heterozygous)',
      clinicalSignificance: '~35% lower methylfolate synthesis supporting neurotransmitter cofactor formation',
      pathogenicity: 'Likely Pathogenic'
    }
  ],
  pkInteractions: [
    {
      agent: 'Escitalopram (via CYP2C19 *2/*2)',
      target: 'CYP2C19 Hepatic Clearance',
      affinity: 'Severe Accumulation',
      effect: 'CPIC guideline advises 50% dose reduction or selecting non-CYP2C19 pathway',
      riskLevel: 'High'
    },
    {
      agent: 'Codeine / Tramadol (via CYP2D6 *4/*4)',
      target: 'CYP2D6 O-Demethylation',
      affinity: 'Zero Prodrug Conversion',
      effect: 'Ineffective analgesia with elevated adverse event burden; contraindicated per CPIC',
      riskLevel: 'Severe'
    }
  ],
  chronobiologyTelemetry: {
    circadianDisruptionIndex: 74,
    scnPhase: 'Melatonin Onset',
    bmal1ExpressionPct: 58,
    per2DiurnalSlope: 'Flattened (-0.18 ug/dL/hr)',
    melatoninAmplitude: 'Blunted',
    trfWindowHours: '09:00 - 19:00 (10h TRF)'
  },
  oknProfile: {
    isVerified: true,
    badgeLabel: '[🏛️ NSF OKN Verified]',
    participatingAgencies: ['NIH', 'WHO'],
    traversedPathSummary:
      'CYP2C19 *2/*2 & CYP2D6 *4/*4 (NIH NHGRI CPIC) <-> Serotonergic Accumulation Avoidance + BMAL1 Circadian Phototherapy (NIH HP2030) <-> WHO mhGAP Stepped Behavioral Plan (WHO)',
    groundedTargetConcept: 'CPIC Pharmacogenomic Psychiatry & Circadian Glymphatic Alignment',
    auditTrailHash: 'sha256:synthetic-okn-nih-pgx-circadian-v1',
    cochraneEvidenceTier: 'Level A (Replicated RCTs)',
    pmidCitation: 'PMID:37032427'
  },
  issues: {
    head: [
      {
        id: 'head',
        noteId: 'pgx_circ_01',
        name: 'Circadian Phase Delay, Sleep Fragmentation & Mood Dysphoria',
        painLevel: 3,
        description:
          'Blunted melatonin amplitude (`Circadian Disruption Index 74`) from night-shift light exposure compounded by prior SSRI intolerance explained by dual CYP2C19/CYP2D6 poor-metabolizer status.',
        symptoms: [
          { name: 'Delayed sleep onset (> 3 AM)', type: 'Circadian', verified: true, timeline: 'Chronic' },
          { name: 'Morning cognitive fog & anxious fatigue', type: 'Mood / Cognitive', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  bookmarks: [],
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.10.25',
      summary: 'NIH NHGRI CPIC Pharmacogenomics, NIH SH-03 Sleep & WHO mhGAP Mood Alignment',
      report: {
        'Summary Overview':
          '### Clinical Assessment\nDual `CYP2C19 *2/*2` and `CYP2D6 *4/*4` poor-metabolizer alleles explain prior adverse SSRI intolerance while night-shift rotation drives severe circadian blunting (`CDI 74`).\n\n### Priority List\n- **NIH-09 (NHGRI / CPIC):** Lock CPIC alerts blocking Codeine, Tramadol, Fluoxetine, and full-dose Citalopram.\n- **NIH-03 (HP2030 SH-03):** Anchor wake-up melanopic exposure (10,000 lx within 30 min of waking) and scotopic evening dimming (< 10 mEDI lx).\n- **WHO-09 (mhGAP):** CBT-i + Socratic mood pacing with MTHFR L-methylfolate cofactor support.',
        'Functional Protocols':
          '### Circadian & Neurotransmitter Stabilization\n- L-Methylfolate 7.5mg AM + Magnesium L-Threonate 300mg QHS.\n- Consistent 10-hour daytime TRF (`09:00–19:00`) to re-entrain peripheral `PER2`/`BMAL1` oscillators.',
        'Monitoring & Follow-up':
          '- Track PHQ-9 / GAD-7 biweekly alongside sleep onset consistency and zero CYP-contraindicated prescriptions.',
        'Patient Education':
          '### Why Medications Felt Too Strong\nYour genetic CYP2C19 and CYP2D6 variants clear certain common antidepressants and pain medicines very slowly—avoiding those pathways prevents side effects while resetting your biological clock.'
      }
    }
  ]
};

export const p_nih_pgx_circadian: IPatient = attachPatientWhoNihGoals(rawPgxCircadianPatient);
