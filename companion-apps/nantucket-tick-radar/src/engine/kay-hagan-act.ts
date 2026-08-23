/**
 * 🏛️ Kay Hagan Tick Act (Public Law 116-94) & CDC Regional Center Governance
 * Grounded in federal vector-borne disease legislation and Powassan virus transmission science.
 */

export interface ITickActPillar {
  id: string;
  pillarNumber: number;
  title: string;
  statutoryAuthority: string;
  federalFundingAllocation: string;
  focusPathogens: string[];
  platformExecution: string;
}

export const KAY_HAGAN_TICK_ACT_PILLARS: ITickActPillar[] = [
  {
    id: 'pillar_1_national_strategy',
    pillarNumber: 1,
    title: 'National Strategy for Vector-Borne Disease Prevention & Control',
    statutoryAuthority: 'Section 401 of PL 116-94 / HHS & CDC Mandate',
    federalFundingAllocation: '$20M annually across federal agencies',
    focusPathogens: ['Powassan Virus (Deer Tick Virus)', 'Borrelia burgdorferi', 'Babesia microti'],
    platformExecution: '15-minute attachment transmission velocity curve, acute neurological triage alerts, and Popperian H0 antibiotic stewardship.'
  },
  {
    id: 'pillar_2_centers_of_excellence',
    pillarNumber: 2,
    title: 'CDC Regional Centers of Excellence in Vector-Borne Diseases',
    statutoryAuthority: 'Section 402 of PL 116-94 (NEVBD, MAVERC, GCVBD, WVBTC, PACVEC)',
    federalFundingAllocation: '$10M annually to academic research consortia',
    focusPathogens: ['Ixodes scapularis vector microbiome', 'Borrelia miyamotoi', 'Anaplasma phagocytophilum'],
    platformExecution: 'De-identified HL7 FHIR R4 standardized Observation bundles exported locally to federate with NEVBD (Cornell/UMass) surveillance pipelines.'
  },
  {
    id: 'pillar_3_municipal_cooperative_grants',
    pillarNumber: 3,
    title: 'Cooperative Grants to State, Tribal & Local Health Departments',
    statutoryAuthority: 'Section 403 of PL 116-94 / Title II CDC Cooperative Agreements',
    federalFundingAllocation: '$20M annually for local municipal health units',
    focusPathogens: ['All regional tick-borne pathogens & Lone Star alpha-gal vectors'],
    platformExecution: 'Turnkey, zero-cloud-cost digital triage & spatial radar kiosk for Nantucket Department of Health & Human Services (ACK Board of Health).'
  }
];

export interface IPowassanClinicalProfile {
  name: string;
  lineage: string;
  incubationPeriodDays: string;
  transmissionThresholdMinutes: number;
  caseFatalityRate: string;
  longTermNeurologicalSequelaePercent: string;
  keyPresentations: string[];
  emergencyActionSteps: string[];
  memorialDedication: string;
}

export const POWASSAN_VIRUS_PROFILE: IPowassanClinicalProfile = {
  name: 'Powassan Virus (Deer Tick Virus / DTV)',
  lineage: 'Flaviviridae (Lineage II transmitted by Ixodes scapularis)',
  incubationPeriodDays: '1 to 4 weeks (typical 7–14 days)',
  transmissionThresholdMinutes: 15, // Direct transmission from tick salivary glands occurs in 15 mins
  caseFatalityRate: '~10% of neuroinvasive cases',
  longTermNeurologicalSequelaePercent: '~50% of survivors suffer permanent hemiplegia, memory loss, or muscle wasting',
  keyPresentations: [
    'Acute onset high fever (103°F+) with confusion and altered mental status',
    'Severe frontal headache, vomiting, and meningismus (nuchal rigidity)',
    'Intractable tremors, ataxia, aphasia, and cranial nerve palsies',
    'Rapid progression to encephalitis, seizures, or respiratory failure'
  ],
  emergencyActionSteps: [
    '1. STAT Emergency Department Evaluation at Nantucket Cottage Hospital (NCH ED) or Call 911.',
    '2. Request Lumbar Puncture (CSF analysis: lymphocytic pleocytosis) and Serum/CSF Powassan IgM antibody capture ELISA (MAC-ELISA).',
    '3. Immediate ICU supportive airway & cerebral edema management (no specific FDA antiviral currently approved).'
  ],
  memorialDedication: 'Dedicated in honor of U.S. Senator Kay Hagan (1953–2019), who championed bipartisan federal vector-borne disease legislation after contracting Powassan virus.'
};
