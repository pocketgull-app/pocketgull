import { IPatient } from '../services/patient.types';

export const p011: IPatient = {
  id: 'p011',
  name: 'Homo Sapiens (Female, Spinocerebellar & Sensory Ataxia, SARA 14.5, 62y)',
  age: 62,
  gender: 'Female',
  lastVisit: '2026.09.29',
  preexistingConditions: [
    'Spinocerebellar Degeneration (SCA Pattern with Kinetic Intention Tremor 3–5 Hz)',
    'Dorsal Column Sensory Ataxia (Loss of Large-Fiber Aα/Aβ Joint Proprioception)',
    'Positive Romberg Sign (Severe Visual Compensation Dependency)',
    'Pharyngeal Dysphagia (Phase II Laryngeal Penetration Vulnerability)',
    'High Fall Risk (Timed Up and Go 14.8s; SARA Baseline 14.5/40)',
    'Post-Benzodiazepine Deprescribing Recovery (Successful Ashton Ashton Hyperbolic Taper)'
  ],
  patientGoals: 'Preserve independent upright ambulation without falls, eliminate choking anxiety through cohesive culinary medicine, maintain manual dexterity via seated ceramic clay hand-building, and stabilize SARA motor trajectory through closed-loop Frenkel visual stepping.',
  vitals: {
    bp: '122/74 (Supine) / 118/72 (Standing)',
    hr: '64',
    temp: '98.2°F',
    spO2: '98%',
    weight: '138 lbs',
    height: "5'6\"",
    vitD3: '44 ng/mL',
    magnesium: '2.3 mg/dL',
    b12: '780 pg/mL',
    zinc: '88 mcg/dL'
  },
  tcmIntake: {
    tongueColor: 'pale',
    tongueCoating: 'thin-white',
    pulseQuality: 'deep-thready',
    thermalPreference: 'aversion-cold',
    sweatPattern: 'normal',
    tasteInMouth: 'bland',
    tcmPattern: 'Kidney Essence (Jing) Vacuity & Spleen Qi Deficiency with Internal Liver Wind Agitation (*Gan Feng*)'
  },
  ayurvedicIntake: {
    prakritiVata: 8,
    prakritiPitta: 3,
    prakritiKapha: 3,
    vikritiVata: 10,
    vikritiPitta: 4,
    vikritiKapha: 2,
    agniType: 'vishamagni',
    amaScore: 4.8,
    nadiPulseType: 'snake-vata',
    ashtavidhaStatus: 'Nadi (Vata-dominant erratic), Jihva (Pale scalloped), Sparsha (Cool extremities)',
    ayurvedicImbalance: 'Severe Majja Dhatu Kshaya (Nervous Marrow Depletion) with Vyana Vata Incoordination & Udana Vata Dysphagia'
  },
  oxidativeStressMarkers: [
    { id: '1', name: 'Serum Neurofilament Light (NfL)', value: '31.2 pg/mL (Active Axonal Neurodegeneration)' },
    { id: '2', name: 'Mitochondrial Complex I Activity', value: '62% of Control (Bioenergetic Deficit)' },
    { id: '3', name: 'Plasma Malondialdehyde (MDA)', value: '3.4 nmol/mL (Purkinje Lipid Peroxidation)' },
    { id: '4', name: '8-OHdG (Oxidative DNA Marker)', value: '14.2 ng/mg Creatinine (Mitochondrial DNA Stress)' }
  ],
  antioxidantSources: [
    { id: '1', name: 'Ubiquinol CoQ10 (Bio-Enhanced Vesicular)', value: '600mg QAM (Purkinje Electron Transport Chain Support)' },
    { id: '2', name: 'Benfotiamine (Lipophilic Thiamine B1)', value: '300mg QAM (Cerebellar Pyruvate Dehydrogenase Cofactor)' },
    { id: '3', name: 'R-Alpha Lipoic Acid (Stabilized Sodium Salt)', value: '600mg QAM (Mitochondrial Glutathione Regeneration)' },
    { id: '4', name: 'Carnosic Acid (Rosemary Whole-Extract)', value: '250mg BID (Nrf2 Phase-II Antioxidant Cascade)' },
    { id: '5', name: 'Caprylic Acid C8 MCT Oil', value: '15mL with Breakfast (Astrocyte-Purkinje Ketone Fuel)' }
  ],
  medications: [
    { id: '1', name: 'Buspirone HCl 5mg', value: '1 tablet BID (Non-sedating 5-HT1A agonist for GAD; Zero motor ataxia risk)' },
    { id: '2', name: 'Melatonin Prolonged-Release 2mg', value: '1 tablet QHS (Physiological circadian reset; Zero hangover ataxia)' },
    { id: '3', name: 'Sublingual Methylcobalamin / Adenosyl B12 2000mcg', value: '1 tablet QAM (Dorsal column remyelination support)' },
    { id: '4', name: 'Famotidine 10mg PRN', value: '1 tablet as needed (Replaced long-term Omeprazole; Non-B12 blunting)' },
    { id: '5', name: 'AGS Beers Criteria® Deprescribing Complete', value: 'Clonazepam & Diphenhydramine eliminated via Ashton hyperbolic taper' }
  ],
  biometricHistory: [
    { timestamp: '2026-09-01T08:00:00Z', type: 'hr', value: '66' },
    { timestamp: '2026-09-01T08:00:00Z', type: 'bp', value: '120/72' },
    { timestamp: '2026-09-15T08:00:00Z', type: 'bp', value: '122/74' },
    { timestamp: '2026-09-29T08:00:00Z', type: 'hr', value: '64' }
  ],
  clinicalNotes: [
    {
      id: 'note_p011_1',
      date: '2026.09.29',
      text: "Comprehensive Cerebellar & Sensory Ataxia Evaluation (PocketGull Systems Biology Colloquium):\n- SARA Staging: Total Score 14.5/40 (Gait: 3/8 wide-based staggered; Stance: 3/6 requires light single-point touch; Sitting: 1/4; Speech: 1/6 scanning dysarthria; Finger Chase: 2/4 dysmetria; Nose-Finger: 2/4 kinetic intention tremor 3-5 Hz; Rapid Alternating Hand Movements: 1.5/4 dysdiadochokinesia; Heel-Shin Slide: 2/4).\n- Proprioceptive & Romberg Telemetry: Static eyes-open sway velocity is stable (1.2 deg/s). Eye closure triggers violent anterior-posterior oscillations with rapid fall latency at 3.1s (+ Romberg). Vibratory perception threshold reduced to 3.8s at great toes.\n- AGS Beers Criteria Review: Completed 6-month hyperbolic Ashton taper off chronic bedtime Clonazepam and OTC PM diphenhydramine. Daytime alertness, vestibular righting reflexes, and nocturnal balance have markedly cleared.\n- Neuromuscular Scaffolding Plan:\n  1. Act I (Mitochondrial Bridge): High-dose Ubiquinol 600mg/d, Benfotiamine 300mg/d, C8 MCT fuel.\n  2. Act II (Sensory Substitution): Daily Frenkel closed-loop stepping over high-contrast floor grids; 15 mins daily 10-hole diatonic harmonica for soft palate/pharyngeal constrictor tone.\n  3. Act III (Salutogenic Flow): Twice-weekly Flight Sanctuary ceramic wheel and hand-building with 0.10 Hz parasympathetic turntable pacing; warm-water Ai Chi hydrotherapy (buoyant unloading).",
      sourceLens: 'Cerebellar Neurobiology & Restorative Salutogenesis'
    }
  ],
  issues: {
    head: [
      {
        id: 'head',
        noteId: 'note_p011_1',
        name: 'Spinocerebellar Degeneration & Sensory Proprioceptive Ataxia',
        painLevel: 2,
        description: 'Combined Purkinje bioenergetic exhaustion and dorsal column large-fiber sensory de-afferentation resulting in kinetic intention tremor (3-5 Hz), positive Romberg sign, and pharyngeal swallowing caution.',
        symptoms: [
          { name: 'Kinetic intention tremor approaching targets (3–5 Hz)', type: 'Neurological', verified: true, timeline: 'Chronic' },
          { name: 'Positive Romberg sign (swaying/fall upon eye closure)', type: 'Sensory Proprioceptive', verified: true, timeline: 'Chronic' },
          { name: 'Wide-based staggering gait (TUG 14.8s)', type: 'Motor Coordination', verified: true, timeline: 'Chronic' },
          { name: 'Mild pharyngeal dysphagia with thin liquids', type: 'Bulbar / Pharyngeal', verified: true, timeline: 'Subacute' },
          { name: 'Scanning dysarthria with irregular syllable emphasis', type: 'Speech / Motor', verified: true, timeline: 'Chronic' }
        ]
      }
    ]
  },
  history: [
    {
      type: 'AnalysisRun',
      date: '2026.09.29',
      summary: 'Spinocerebellar & Sensory Ataxia Comprehensive Systems Biology & Restorative Tri-Paradigm Assessment',
      report: {
        'Summary Overview': '### ⚖️ Cerebellar & Sensory Ataxia Multiscale Assessment\nPatient presents with mixed cerebellar motor ataxia (Purkinje planar arborization bioenergetic deficit) and dorsal column sensory ataxia (Aα/Aβ large-fiber proprioceptive loss). Baseline SARA staging is 14.5/40. Romberg sign is strongly positive, confirming heavy reliance on visual cortex substitution. Patient has successfully discontinued all Beers Criteria PIM sedatives (Clonazepam), eliminating iatrogenic righting reflex blunting.',
        'Functional Protocols': '### The Three Acts of Ataxia Stabilization\n- **Act I: Metabolic Bridge (Days 0–30)**: Ubiquinol (600mg QAM), Benfotiamine (300mg QAM), R-Alpha Lipoic Acid (600mg QAM), and C8 MCT ketone fuel to supply alternative high-efficiency ATP to vulnerable Purkinje neurons.\n- **Act II: Frenkel Visual Stepping & Bulbar Resistance (Weeks 2–12)**: Daily 20-minute closed-loop visual stepping over high-contrast floor grids (recruiting intact prefrontal-striatal motor loops); 15 minutes of 10-hole diatonic harmonica playing to strengthen pharyngeal constrictor muscles and enhance vagal tone.\n- **Act III: Somatosensory Grounding & Salutogenic Flow (Months 3+)**: Seated Flight Sanctuary pottery wheel with viscous stoneware tremor damping (D=0.88) and 0.10 Hz turntable rhythm; 2% body-weight axial torso vest during ambulation.',
        'Nutrition': '### Cohesive Mediterranean & MIND-Diet Dysphagia Protection\n- **Naturally Cohesive Bolus Architecture**: Transition from thin liquids to naturally high-surface-tension, nutrient-dense emulsions (Roasted Kabocha Squash & Ginger Velouté, Wild Salmon & Avocado Rillettes).\n- **Zero Thin-Liquid Laryngeal Penetration**: Eliminate gray industrial starch powders in favor of cold-pressed EVOO and chia mucilage natural glides.\n- **Mitochondrial Anthocyanins**: Daily warmed organic wild blueberry puree (Whole Foods 365) providing concentrated anthocyanins to quench lipid peroxidation.',
        'Precision Nutrients': '### Cellular Bioenergetics & Neuro-Protection\n- **Ubiquinol CoQ10**: 600mg QAM (Bypasses ETC Complex I bottleneck).\n- **Benfotiamine (B1)**: 300mg QAM (Cerebellar transketolase/pyruvate dehydrogenase cofactor).\n- **Carnosic Acid (Rosemary)**: 250mg BID (Nrf2 endogenous antioxidant induction).\n- **Sublingual Adenosyl/Methyl B12**: 2000mcg QAM (Posterior column myelin sheath support).'
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: 'scan_p011_1',
      date: '2026.09.20',
      title: '3T Brain & Cervical Spine High-Resolution Volumetric MRI',
      type: 'MRI',
      bodyPartId: 'head',
      description: 'Axial and sagittal T1/T2-weighted volumetric imaging reveals selective bilateral cerebellar cortical atrophy and folial widening, prominent along the superior vermis. Sparing of basal ganglia and brainstem. Cervical cord demonstrates mild dorsal column T2 hyperintensity consistent with large-fiber primary afferent axonopathy.',
      status: 'Abnormal'
    }
  ],
  anatomicalTarget: 'head',
  clinicalMoERoute: {
    primaryDomain: 'Cerebellar Neurobiology & Movement Disorders',
    activeSpecialists: [
      'Movement Disorder Neurologist',
      'Neuro-Rehabilitation Specialist',
      'Clinical Pharmacologist (AGS Beers Deprescribing)',
      'Culinary Medicine Dysphagia Specialist',
      'Salutogenic Ceramic & Art Therapist'
    ],
    confidenceScore: 0.98,
    reasoning: 'Patient demonstrates classic mixed spinocerebellar dysmetria and sensory proprioceptive ataxia requiring high-bandwidth visual substitution, mitochondrial bioenergetics, and dignified kitchen/hobby ergonomics.'
  },
  environmentalIndex: {
    aqi: 38,
    pm25: '8.4 µg/m³',
    ozone: '26 ppb',
    pollenDensity: 'Low',
    heatIndex: '66°F',
    vulnerabilityWarning: 'Low ambient illumination and slippery floor transitions pose high fall risks. Nighttime amber motion-path illumination installed.'
  },
  oknProfile: {
    isVerified: true,
    badgeLabel: '[🏛️ NSF OKN & SARA Verified]',
    participatingAgencies: ['NSF', 'NIH', 'WHO', 'AGS'],
    traversedPathSummary: 'NSF Brain Multiscale Topology Schemas (NSF) <-> NIH MeSH D001259 Cerebellar Degenerations & SARA Staging (NIH) <-> AGS 2023 Beers Criteria Fall Defense (AGS) <-> Lancet Neurology Coordinative Physical Therapy Registry (WHO)',
    groundedTargetConcept: 'Purkinje Bioenergetics, Frenkel Closed-Loop Visual Scaffolding & 2023 AGS Beers Fall Defense',
    auditTrailHash: 'sha256:7f4a9b2c81d03e5891462a7b3c4d5e6f8a9b0c1d',
    cochraneEvidenceTier: 'Level A (Replicated RCTs)',
    pmidCitation: 'PMID:19900877'
  }
};
