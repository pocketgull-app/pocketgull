import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export type TTraditionKey =
  | 'allopathic'
  | 'osteopathic'
  | 'naturopathic'
  | 'functional'
  | 'tcm'
  | 'ayurvedic'
  | 'unani'
  | 'chronobiology';

export interface ILifeCourseScreeningItem {
  name: string;
  frequency: string;
  targetAge: string;
  goldStandard: string;
  rationale: string;
  ismpSafetyNote?: string;
}

export interface IGrandTraditionsPillar {
  allopathic: {
    title: string;
    mechanism: string;
    keyMetrics: string[];
  };
  osteopathic: {
    title: string;
    somaticFocus: string;
    biomechanicalMechanism: string;
    omtSelfCare: string;
  };
  naturopathic: {
    title: string;
    therapeuticOrderFocus: string;
    botanicalPhytotherapy: string;
    lifestyleGuidance: string;
  };
  functional: {
    title: string;
    networkBiologyFocus: string;
    keyBiomarkers: string[];
    systemsIntervention: string;
  };
  tcm: {
    title: string;
    organMeridian: string;
    pathology: string;
    lifestyleGuidance: string;
  };
  ayurvedic: {
    title: string;
    doshaEpoch: string;
    dhatuFocus: string;
    lifestyleGuidance: string;
  };
  unani: {
    title: string;
    humoralFocus: string;
    mizajMechanism: string;
    regimenalGuidance: string;
  };
  chronobiology: {
    title: string;
    circadianFocus: string;
    photobiologyMechanism: string;
    zeitgeberAction: string;
  };
}

export interface IScanxietyBiasGuard {
  title: string;
  overdiagnosisCaution: string;
  goldenRule: string;
  naturalFrequencyStatistic: string;
}

export interface IRespectfulPricingShield {
  title: string;
  standardRetailBenchmark: string;
  genericPharmacyBenchmark: string;
  cashNavigationAdvice: string;
}

export interface ILifeCourseHorizon {
  id: string;
  decade: string;
  minAge: number;
  maxAge: number;
  title: string;
  subtitle: string;
  epochQuote: string;
  quilledArtUrl: string;
  quilledArtAlt: string;
  artConceptNote: string;
  screenings: ILifeCourseScreeningItem[];
  grandTraditions: IGrandTraditionsPillar;
  scanxiety: IScanxietyBiasGuard;
  pricing: IRespectfulPricingShield;
  physicianQuestions: string[];
}

export const LIFE_COURSE_HORIZONS: ILifeCourseHorizon[] = [
  {
    id: 'horizon-1',
    decade: 'Age 20–25',
    minAge: 18,
    maxAge: 29,
    title: 'Vascular Genesis & Biomarker Calibration',
    subtitle: 'Establishing the lifelong atherogenic exposure curve, organ baseline, and cellular vitality',
    epochQuote: 'Atherosclerosis is an insidious process beginning in youth; cumulative ApoB particle exposure across decades dictates midlife cardiovascular risk.',
    quilledArtUrl: '/assets/art/vascular-genesis-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of delicate vascular arborization, capillary loops, and cellular vitality on dark obsidian',
    artConceptNote: 'Micro-sculpted paper strips forming youthful microcirculation, capillary beds, and biological resilience.',
    screenings: [
      {
        name: 'Blood Pressure Assessment',
        frequency: 'Every 1–2 years (annual if elevated)',
        targetAge: 'Age 18+',
        goldStandard: 'Calibrated automated oscillometric cuff (seated, 5 min rest)',
        rationale: 'Establishes baseline normotensive vascular shear stress to preserve endothelial glycocalyx integrity.'
      },
      {
        name: 'Fasting Lipid Panel + Apolipoprotein B (ApoB)',
        frequency: 'Baseline at age 20; repeat every 5 years if optimal',
        targetAge: 'Age 20',
        goldStandard: 'Automated immunoassay for ApoB + standard enzymatic lipid profile',
        rationale: 'Measures total atherogenic particle number rather than surrogate cholesterol volume (area under ApoB curve).'
      },
      {
        name: 'Fasting Glucose & HbA1c Baseline',
        frequency: 'Every 3 years (annual if risk factors present)',
        targetAge: 'Age 20+',
        goldStandard: 'NGSP-certified HPLC glycated hemoglobin assay',
        rationale: 'Identifies early subclinical glycemic variability and peripheral insulin receptor sensitivity.'
      },
      {
        name: 'Cervical Cytology (Pap Smear)',
        frequency: 'Every 3 years',
        targetAge: 'Ages 21–29 (individuals with a cervix)',
        goldStandard: 'Liquid-based thin-layer cytology without HPV co-testing under 30',
        rationale: 'Detects high-grade cervical intraepithelial neoplasia (CIN 2/3) while avoiding HPV overdiagnosis in youth.'
      },
      {
        name: 'PHQ-9 & GAD-7 Mood/Anxiety Screening',
        frequency: 'Annual routine primary care encounter',
        targetAge: 'All young adults',
        goldStandard: 'Standardized 9-question and 7-question clinical inventories',
        rationale: 'Early detection of autonomic and affective distress, reducing chronic hypothalamic-pituitary-adrenal axis wear.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Endothelial Integrity & Cumulative Particle-Years',
        mechanism: 'Atherosclerosis is governed by cumulative lifetime particle-exposure ("ApoB-years"). Establishing early baseline normotension and optimal particle clearance prevents initial subendothelial lipid retention.',
        keyMetrics: ['ApoB < 80 mg/dL', 'BP < 120/80 mmHg', 'HbA1c < 5.4%']
      },
      osteopathic: {
        title: 'Cervicothoracic Postural Alignment & Thoracic Inlet Patency',
        somaticFocus: 'C1–C2 (OA joint), T1–T4 thoracic spine, 1st Rib & Clavicle',
        biomechanicalMechanism: 'Forward head carriage ("tech neck") and slumped seated posture compress the thoracic inlet, where the thoracic duct empties into the left subclavian vein. This restricts cranial venous drainage and upper-body lymphatic return, contributing to autonomic strain and tension headaches.',
        omtSelfCare: 'Perform suboccipital chin-tucks and doorway pectoral stretches; practice diaphragmatic breathing with bilateral rib expansion to keep the thoracic inlet open.'
      },
      naturopathic: {
        title: 'Therapeutic Order & Foundational Mucosal Grounding',
        therapeuticOrderFocus: 'Order 1: Establish conditions for health (whole-food nutrition, clean water, adequate sleep)',
        botanicalPhytotherapy: 'Gentle bitter tonics (Taraxacum officinale / Dandelion root, Gentiana lutea) taken before meals to stimulate endogenous bile acid flow and gastric secretion.',
        lifestyleGuidance: 'Grounding daily dietary rhythm: Eliminate ultra-processed emulsifiers that strip the intestinal mucosal glycocalyx, hydrate with clean remineralized water, and incorporate fermented prebiotic foods.'
      },
      functional: {
        title: 'Network Biology & Area Under the ApoB Curve',
        networkBiologyFocus: 'Atherogenic particle kinetics and cellular membrane fatty acid architecture',
        keyBiomarkers: ['ApoB < 80 mg/dL', 'hs-CRP < 0.5 mg/L', 'Omega-3 Index > 8%'],
        systemsIntervention: 'Optimize cellular phospholipid membrane flexibility via cold-water wild fatty fish and polyphenol-rich olive oil; verify baseline intracellular nutrient stores before inflammatory cascades initiate.'
      },
      tcm: {
        title: 'Kidney Jing Conservation & Circadian Balance',
        organMeridian: 'Kidney (Shen) & Bladder (Pangguang)',
        pathology: 'The 20s mark the biological blossoming of Jing (Congenital Essence). Chronic sleep restriction, excessive stimulants, and burnout drain Kidney Yin, leading to early adrenal and metabolic exhaustion.',
        lifestyleGuidance: 'Protect Kidney Jing by sleeping before 23:00, staying hydrated with warm fluids, and avoiding chronic sympathetic overstimulation.'
      },
      ayurvedic: {
        title: 'Kapha-to-Pitta Transition & Structural Dhatu Building',
        doshaEpoch: 'Late Kapha transitioning to active Pitta',
        dhatuFocus: 'Rasa (plasma/lymph), Rakta (blood), and Mamsa (muscle)',
        lifestyleGuidance: 'Formative decade for building robust structural tissue without toxic Ama accumulation. Eat freshly prepared meals with warming digestive spices (ginger, cumin) to keep Agni vibrant.'
      },
      unani: {
        title: 'Preserving Hararat-e-Ghariziyyah (Innate Metabolic Warmth)',
        humoralFocus: 'Dam (Blood — hot and moist temperament of youth)',
        mizajMechanism: 'Youth represents the zenith of innate moisture and natural biological heat. Overindulgence in cold, dry, or chemically adulterated food extinguishes the body\'s innate digestive warmth (Hararat-e-Ghariziyyah).',
        regimenalGuidance: 'Adopt Asbab-e-Sittah Zarooriyyah (the 6 essential factors of life): brisk daily exercise (Riyazat) to clear redundant humors and regular moderate sleep to preserve vital spirit (Ruh).'
      },
      chronobiology: {
        title: 'Master Oscillator Entrainment & Melanopic Alignment',
        circadianFocus: 'Suprachiasmatic nucleus (SCN) central clock synchronization',
        photobiologyMechanism: 'Retinal ganglion cells (ipRGCs) require 10,000+ lux morning blue/cyan photon flux to synchronize peripheral tissue clock genes (BMAL1, CLOCK) and suppress daytime melatonin.',
        zeitgeberAction: 'Step outdoors for 10–15 minutes of natural sunlight within 30 minutes of waking; install blue-light blocking software after dusk to maintain nocturnal melatonin amplitude.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'Routine unselected whole-body CT or MRI imaging in asymptomatic 20-year-olds creates catastrophic health anxiety from incidental benign cysts and false-positive nodules.',
      goldenRule: 'Early biomarker elevation (such as borderline LDL) in a young adult is an invitation for lifelong aerobic and nutritional habituation, never immediate panic or premature high-dose statin monotherapy unless familial hypercholesterolemia is identified.',
      naturalFrequencyStatistic: 'Out of 1,000 screened adults in their 20s, fewer than 3 have an urgent genetic condition; 997 benefit primarily from lifestyle habituation and establishing a clean medical baseline.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$420–$850 for hospital-based young-adult outpatient laboratory panels.',
      genericPharmacyBenchmark: '$14–$22 for cash ApoB immunoassay; $12–$18 for lipid panel; $0 blood pressure checks at public community kiosks.',
      cashNavigationAdvice: 'Request standard generic lab codes (CPT 80061 for lipid, CPT 82172 for ApoB) and compare direct-to-consumer laboratory cash portals if your high-deductible plan has not been satisfied.'
    },
    physicianQuestions: [
      'Could we order an Apolipoprotein B (ApoB) test alongside my routine lipid panel to benchmark my lifelong vascular particle exposure?',
      'What is my estimated lifetime cardiovascular and metabolic trajectory based on my family history and current baseline vitals?',
      'What evidence-based nutritional, sleep, and physical activity habits will best safeguard my metabolic health over the next decade?'
    ]
  },
  {
    id: 'horizon-2',
    decade: 'Age 30–35',
    minAge: 30,
    maxAge: 39,
    title: 'Metabolic Hearth & Hepatic Balance',
    subtitle: 'Intercepting hyperinsulinemia, visceral steatosis, and mitochondrial strain 10–15 years before microvascular stiffening',
    epochQuote: 'Fasting insulin rises a full decade before blood sugar becomes abnormal. Intercepting metabolic strain at age 30 preserves pancreatic beta-cell reserve.',
    quilledArtUrl: '/assets/art/metabolic-hearth-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of hepatic lobules, pancreatic acini, and golden metabolic currents',
    artConceptNote: 'Hand-rolled quilled filigree depicting cellular energy furnaces, hepatic portal vein flow, and metabolic harmony.',
    screenings: [
      {
        name: 'Fasting Insulin & HOMA-IR Calculation',
        frequency: 'Baseline at age 30; repeat biennial if BMI > 25 or family history',
        targetAge: 'Age 30–39',
        goldStandard: 'Fasting insulin immuno-chemiluminescence paired with simultaneous fasting glucose',
        rationale: 'Uncovers peripheral insulin resistance and hyperinsulinemia up to 15 years before clinical type 2 diabetes diagnosis.'
      },
      {
        name: 'Liver Function Panel & FIB-4 Index',
        frequency: 'Every 2–3 years',
        targetAge: 'Age 30+',
        goldStandard: 'Automated ALT, AST, Platelets with FIB-4 algorithmic calculation',
        rationale: 'Non-invasive screening for Metabolic Dysfunction-Associated Steatohepatitis (MASH) and hepatic fibrosis.'
      },
      {
        name: 'One-Time Lipoprotein(a) [Lp(a)] Assessment',
        frequency: 'Once in a lifetime baseline',
        targetAge: 'Age 30+',
        goldStandard: 'Isoform-insensitive particle-calibrated immunoassay (nmol/L)',
        rationale: 'Identifies genetically determined pro-thrombotic and pro-atherogenic risk uncoupled from standard lifestyle factors.'
      },
      {
        name: 'Comprehensive Metabolic Panel (CMP)',
        frequency: 'Every 2 years',
        targetAge: 'Age 30+',
        goldStandard: 'Standardized serum chemistry (eGFR, Creatinine, Electrolytes, Albumin)',
        rationale: 'Evaluates baseline renal filtration rate and electrolyte homeostasis during peak career productivity.'
      },
      {
        name: 'Targeted Endocrine & Thyroid Panel',
        frequency: 'Every 3–5 years (or preconception / unexplained fatigue)',
        targetAge: 'Age 30–35',
        goldStandard: 'Serum TSH with reflex free T4 and ferritin',
        rationale: 'Ensures optimal cellular metabolic rate, neurocognitive energy, and reproductive endocrine health.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Visceral Adiposity & Pancreatic Beta-Cell Preservation',
        mechanism: 'Ectopic hepatic and visceral fat accumulation impairs insulin signaling and accelerates vascular endothelial stiffness. Early lifestyle interventions reverse steatosis before irreversible fibrotic remodeling occurs.',
        keyMetrics: ['HOMA-IR < 1.5', 'FIB-4 < 1.30', 'Lp(a) < 75 nmol/L']
      },
      osteopathic: {
        title: 'T5–T9 Viscerosomatic Tone & Respiratory Diaphragm Doming',
        somaticFocus: 'T5–T9 paraspinal musculature, Celiac Ganglion, Thoracoabdominal Diaphragm',
        biomechanicalMechanism: 'Prolonged sedentary desk work causes visceral stagnation and restriction of the thoracoabdominal diaphragm. Hyperactivity of the T5–T9 sympathetic outflow (greater splanchnic nerve) constricts hepatic arterial blood flow and impairs biliary and pancreatic secretion.',
        omtSelfCare: 'Perform seated thoracic spine extension and rotation stretches, rib raising over a foam roller, and diaphragmatic "piston" breathing before meals to normalize visceral perfusion.'
      },
      naturopathic: {
        title: 'Hepatocyte Protection & Phase I/II Detoxification',
        therapeuticOrderFocus: 'Order 3: Support weakened organs and enhance natural metabolic elimination channels',
        botanicalPhytotherapy: 'Silybum marianum (Milk Thistle / silymarin) to upregulate hepatocyte glutathione synthesis; Cynara scolymus (Artichoke leaf) for healthy choleresis and lipid clearance.',
        lifestyleGuidance: 'High-sulfur Brassica vegetables (broccoli sprouts, kale) to supply sulforaphane for Nrf2 antioxidant gene transcription; eliminate late-night alcohol and high-fructose syrups.'
      },
      functional: {
        title: 'Cellular Bioenergetics & Hepatic De Novo Lipogenesis Interception',
        networkBiologyFocus: 'Mitochondrial fatty acid beta-oxidation vs. fructose-driven hepatic lipogenesis',
        keyBiomarkers: ['Fasting Insulin < 6 uIU/mL', 'Triglyceride/HDL Ratio < 1.5', 'Uric Acid < 5.5 mg/dL'],
        systemsIntervention: 'Daily 10-minute post-prandial walks to recruit GLUT4 glucose transporters independent of insulin; progressive resistance training twice weekly to expand glycogen sink capacity.'
      },
      tcm: {
        title: 'Spleen Qi & Liver Qi Stagnation Resolution',
        organMeridian: 'Spleen (Pi) & Liver (Gan)',
        pathology: 'Sedentary desk work, emotional rumination (Si), and rushed meals compromise Spleen transportation and transformation (Yun Hua), generating internal Dampness and Liver Qi constraint.',
        lifestyleGuidance: 'Eat meals away from work screens, engage in brisk 10-minute post-meal walks, and consume warm aromatic teas (mandarin peel, ginger) to harmonize Qi and dispel dampness.'
      },
      ayurvedic: {
        title: 'Pitta Stage Apex & Agni Regulation',
        doshaEpoch: 'Full Pitta Epoch (Ambition, Drive, Transformation)',
        dhatuFocus: 'Meda (adipose tissue) and Asthi (bone support)',
        lifestyleGuidance: 'High career ambition stokes Pitta heat, risking hyperacidity, metabolic burnout, and inflammation. Cool the system with leafy greens, regular meal intervals, and cooling pranayama (Sheetali).'
      },
      unani: {
        title: 'Resolving Hepatic Sudda (Obstruction) & Humoral Heat',
        humoralFocus: 'Safra (Yellow Bile — hot and dry temperament imbalance)',
        mizajMechanism: 'Intense mental work and greasy rushed foods generate combustion of Safra, producing burning bile and sluggish hepatic portal flow (Sudda-e-Kabid).',
        regimenalGuidance: 'Prescribe cooling, resolving oxymels (Sikanjabeen — honey and vinegar elixir) with mint; gentle dry cupping (Hijamah-bila-Shart) over the liver reflex zone if indicated.'
      },
      chronobiology: {
        title: 'Time-Restricted Feeding & Peripheral Liver Clock Synchronization',
        circadianFocus: 'Hepatic clock gene orchestration via meal timing',
        photobiologyMechanism: 'Peripheral liver clocks are synchronized primarily by food intake rather than light. Consuming carbohydrates late in the evening desynchronizes liver enzymes from central SCN rhythm, driving visceral steatosis.',
        zeitgeberAction: 'Adopt a consistent 10-hour daytime eating window (e.g., 08:30 to 18:30); avoid all caloric intake at least 3 hours before bedtime to allow nocturnal autophagy.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'An incidental diagnosis of "fatty liver" on routine imaging can trigger catastrophic health panic. In 30-year-olds, mild steatosis is a reversible metabolic wake-up call, not terminal cirrhosis.',
      goldenRule: 'Reversible metabolic strain is corrected through daily 10-minute post-meal walks, dietary fiber, and progressive resistance training—never through dangerous, unregulated commercial "liver detox cleanses".',
      naturalFrequencyStatistic: 'Among 1,000 screened 30-year-olds with mild transaminase elevation, 985 have benign reversible lifestyle-related steatosis; 0 benefit from unregulated detox herbal cocktails.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$650–$1,200 for commercial hospital outpatient metabolic and liver panels.',
      genericPharmacyBenchmark: '$12–$20 for fasting insulin cash test; $8–$14 for hepatic panel; $4.00/month for generic Metformin if clinically indicated.',
      cashNavigationAdvice: 'Compute your FIB-4 fibrosis score for $0 using routine CBC and liver panel values before agreeing to high-cost proprietary FibroScan imaging.'
    },
    physicianQuestions: [
      'Can we measure fasting insulin along with fasting glucose so we can calculate my HOMA-IR index for early metabolic insight?',
      'Could we check a one-time Lipoprotein(a) test to rule out inherited genetic cardiovascular risk factors?',
      'Based on my routine liver enzymes and platelet count, what is my non-invasive FIB-4 score for liver health?'
    ]
  },
  {
    id: 'horizon-3',
    decade: 'Age 40',
    minAge: 40,
    maxAge: 44,
    title: 'The 40-Year Vascular Window & Structural Defense',
    subtitle: 'Coronary artery calcium, retinal microvascular fundus, breast screening, and arterial compliance',
    epochQuote: 'At age 40, the window of preventive intervention transitions from mathematical risk estimation to direct anatomical observation.',
    quilledArtUrl: '/assets/art/coronary-retinal-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of coronary arterial tree and glowing golden retinal microvascular fundus',
    artConceptNote: 'Intricate coiled paper forming the branching left anterior descending artery alongside optical retinal fundus vessels.',
    screenings: [
      {
        name: 'Coronary Artery Calcium (CAC) Low-Dose CT',
        frequency: 'One-time baseline at age 40; repeat at 5-year intervals if score is 0',
        targetAge: 'Age 40+',
        goldStandard: 'Non-contrast ECG-gated low-dose cardiac CT (Agatston scoring)',
        rationale: 'Directly visualizes subclinical calcified atherosclerotic plaque in coronary arteries, reclassifying cardiovascular risk.',
        ismpSafetyNote: 'ISMP Golden Rule: An isolated CAC score > 0 in an asymptomatic patient is NEVER an indication for catheterization or stenting.'
      },
      {
        name: 'AHA PREVENT Cardiovascular Risk Assessment',
        frequency: 'Every 3–5 years',
        targetAge: 'Age 40–79',
        goldStandard: 'AHA PREVENT equation (incorporates eGFR and urine albumin-creatinine ratio)',
        rationale: 'Estimates 10-year and 30-year total cardiovascular event risk, replacing legacy 2013 Pooled Cohort Equations.'
      },
      {
        name: 'Comprehensive Dilated Eye & Retinal Fundus Exam',
        frequency: 'Every 1–2 years',
        targetAge: 'Age 40+',
        goldStandard: 'Dilated biomicroscopy, fundus photography, tonometry for intraocular pressure',
        rationale: 'Direct non-invasive visual window into cerebral and systemic microvasculature; early glaucoma and retinopathy detection.'
      },
      {
        name: 'Screening Mammography',
        frequency: 'Biennial (every 2 years)',
        targetAge: 'Ages 40–74 (women at average risk; USPSTF 2024 update)',
        goldStandard: 'Digital breast tomosynthesis (3D mammography)',
        rationale: 'Early detection of invasive breast carcinomas at localized stage, reducing breast cancer mortality by 19–22%.'
      },
      {
        name: 'Clinical Full-Body Dermatological Examination',
        frequency: 'Annual clinical exam + monthly self-surveillance',
        targetAge: 'Age 40+',
        goldStandard: 'Polarized dermoscopy by trained clinician',
        rationale: 'Early detection of cutaneous melanoma and basal/squamous cell carcinomas during midlife cumulative UV exposure.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Direct Anatomical Plaque Quantification & Microvascular Perfusion',
        mechanism: 'Directly observes calcified coronary plaque and retinal arteriolar narrowing (A/V ratio). Quantifies subclinical organ strain prior to ischemic symptom onset.',
        keyMetrics: ['CAC Score = 0 Agatston', 'IOP < 21 mmHg', 'PREVENT 10-Year Risk < 5%']
      },
      osteopathic: {
        title: 'T1–T5 Cardiac Autonomic Tone & Arterial Compliance',
        somaticFocus: 'T1–T5 vertebral segments, Costovertebral joints 2–5, OA Joint (Vagus Nerve)',
        biomechanicalMechanism: 'Sympathetic innervation to the coronary arteries and myocardium originates from T1–T5. Chronic paraspinal hypertonicity and somatic dysfunction at these levels drive vasoconstriction and elevate systemic vascular resistance. Concurrently, suboccipital restriction impairs vagal parasympathetic cardioprotective tone.',
        omtSelfCare: 'Gentle suboccipital release (resting base of skull on two taped tennis balls for 5 minutes), pectoral doorway mobilization, and thoracic extension to balance autonomic cardiac output.'
      },
      naturopathic: {
        title: 'Endothelial Nitric Oxide & Microvascular Resiliency',
        therapeuticOrderFocus: 'Order 4: Correct structural and vascular integrity via targeted phytotherapy',
        botanicalPhytotherapy: 'Crataegus oxyacantha (Hawthorn berry and leaf) for coronary microvascular perfusion; inorganic dietary nitrate sources (Beta vulgaris / Beetroot, Eruca vesicaria / Arugula) to boost eNOS-independent nitric oxide.',
        lifestyleGuidance: 'High-flavonoid foods (wild blueberries, raw cacao, green tea EGCG) to protect vascular endothelial glycocalyx from oxidative peroxynitrite damage.'
      },
      functional: {
        title: 'Vascular Biology, hs-CRP & Direct Plaque Visualization',
        networkBiologyFocus: 'Endothelial shear stress, vascular calcification kinetics, and microvascular permeability',
        keyBiomarkers: ['Agatston CAC = 0', 'hs-CRP < 0.5 mg/L', 'Urine Albumin-Creatinine Ratio < 10 mg/g'],
        systemsIntervention: 'If subclinical plaque is visualized, initiate comprehensive low-dose generic statin therapy + aggressive Mediterranean dietary pattern; avoid invasive angiography in asymptomatic individuals.'
      },
      tcm: {
        title: 'Liver-Kidney Yin Depletion & Vascular Flexibility',
        organMeridian: 'Liver (Gan) & Kidney (Shen)',
        pathology: 'The eyes are the sensory orifice of the Liver ("Liver opens to the eyes"). Retinal vascular changes reflect declining Liver Blood and Yin failing to anchor vascular Yang, leading to arterial stiffness.',
        lifestyleGuidance: 'Nourish Liver Blood and Kidney Yin with dark berries (goji/lycium), steamed leafy greens, restorative evening meditation, and avoiding ocular screen fatigue.'
      },
      ayurvedic: {
        title: 'Pitta-to-Vata Inflection & Snehana (Oleation)',
        doshaEpoch: 'Pitta transitioning into early Vata (Dryness onset)',
        dhatuFocus: 'Majja (nervous system/marrow) and Asthi (skeletal matrix)',
        lifestyleGuidance: 'Beginning of systemic moisture loss. Emphasize Snehana (internal lubricating healthy fats like ghee or virgin olive oil) to maintain flexible, supple arterial walls and prevent tissue brittleness.'
      },
      unani: {
        title: 'Preserving Rutoobat-e-Ghariziyyah (Innate Vital Moisture)',
        humoralFocus: 'Incipient Sauda (Black Bile / Dry-Cold accumulation)',
        mizajMechanism: 'At age 40, the temperament begins its natural shift from warm/moist youth to cool/dry maturity. Loss of Rutoobat-e-Ghariziyyah causes vascular inelasticity and ocular dryness.',
        regimenalGuidance: 'Prescribe unctuous head massage (Roghan-e-Badam / sweet almond oil), warm herbal baths (Hammam), and soothing mucilaginous seeds (Ispaghol / Psyllium).'
      },
      chronobiology: {
        title: 'Circadian Blood Pressure Dipping & Glymphatic Cleansing',
        circadianFocus: 'Preserving the nocturnal 10–20% physiological blood pressure dip',
        photobiologyMechanism: 'Loss of nocturnal blood pressure dipping accelerates cerebral small vessel disease and left ventricular hypertrophy. Deep sleep activates brain glymphatic flow via astrocytic aquaporin-4 (AQP4) channels.',
        zeitgeberAction: 'Sleep in pitch-black darkness (< 1 lux) at 65°F (18°C); avoid alcohol within 4 hours of bed to prevent sympathetic nighttime autonomic spikes.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'Discovering a non-zero CAC score (e.g. CAC 20) frequently causes panic and demands for invasive cardiac catheterization.',
      goldenRule: 'NON-INVASIVE GOLDEN RULE: In an asymptomatic adult, a positive CAC score is NEVER an indication for cardiac catheterization, angioplasty, or stenting (ISCHEMIA/COURAGE trial parity). It is exclusively an indication for lifestyle optimization and generic statin therapy.',
      naturalFrequencyStatistic: 'In 1,000 asymptomatic 40-year-olds with low-positive CAC scores, stenting saves zero lives compared to optimal medical therapy; 15 would suffer invasive procedural complications if catheterized unnecessarily.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$600–$1,100 for hospital-billed coronary calcium CT scans; $250 for retail optometrist visits.',
      genericPharmacyBenchmark: '$50–$100 self-pay cash price for coronary calcium CT scan at independent imaging centers; $9.00 for 90-day generic Atorvastatin 20mg.',
      cashNavigationAdvice: 'Never bill a CAC scan to commercial insurance without checking the out-of-pocket cash rate; most imaging centers offer a $50–$75 self-pay rate that is significantly lower than insurance copays.'
    },
    physicianQuestions: [
      'Would a low-dose Coronary Artery Calcium (CAC) scan help refine my cardiovascular risk before deciding on long-term preventive therapy?',
      'If my CAC scan shows subclinical calcification, will we treat it medically with lifestyle and generic statins rather than ordering invasive catheterization?',
      'Can we ensure my comprehensive eye exam includes a dilated retinal evaluation to examine microvascular endothelial integrity?'
    ]
  },
  {
    id: 'horizon-4',
    decade: 'Age 45–50',
    minAge: 45,
    maxAge: 59,
    title: 'Mucosal Sanctuary & Adenoma Interception',
    subtitle: 'Colorectal cancer interception, mucosal immunity, pelvic tensegrity, and hormonal transition',
    epochQuote: 'Colorectal cancer screening is uniquely powerful because polypectomy eradicates the precursor adenoma before malignancy can ever manifest.',
    quilledArtUrl: '/assets/art/mucosal-sanctuary-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of intestinal mucosal crypts, microflora sanctuary, and protective cellular borders',
    artConceptNote: 'Concentric coiled spirals illustrating mucosal crypts of Lieberkühn, epithelial goblet cells, and microfloral harmony.',
    screenings: [
      {
        name: 'Colorectal Cancer Screening',
        frequency: 'Colonoscopy every 10 years OR Annual Fecal Immunochemical Test (FIT)',
        targetAge: 'Ages 45–75 (USPSTF Grade A)',
        goldStandard: 'High-definition optical colonoscopy or high-sensitivity quantitative FIT',
        rationale: 'Eradicates precancerous adenomatous polyps, reducing colorectal cancer incidence by up to 70% and mortality by 88%.'
      },
      {
        name: 'Cervical Cancer Screening (HPV Co-Testing)',
        frequency: 'Every 5 years (high-risk HPV alone or HPV + cytology)',
        targetAge: 'Ages 30–65',
        goldStandard: 'FDA-approved high-risk HPV DNA/RNA molecular assay',
        rationale: 'Sustained surveillance for persistent high-risk oncogenic HPV serotypes, intercepting cervical dysplasia.'
      },
      {
        name: 'Prostate Cancer Shared Decision-Making (PSA)',
        frequency: 'Every 2–4 years based on baseline PSA and risk',
        targetAge: 'Ages 45–69 (age 40 for African-American men or positive family history)',
        goldStandard: 'Total serum PSA with reflex free PSA if 4.0–10.0 ng/mL',
        rationale: 'Shared decision-making weighing early detection of aggressive localized prostate adenocarcinoma against indolent overdiagnosis.'
      },
      {
        name: 'Perimenopause / Andropause Endocrine & Bone Check',
        frequency: 'Every 2–3 years or upon vasomotor symptom onset',
        targetAge: 'Ages 45–55',
        goldStandard: 'Clinical assessment, lipid restaging, bone risk FRAX calculation',
        rationale: 'Navigates sex steroid transition, preserves bone mineral density, and prevents sudden acceleration of atherogenic lipids.'
      },
      {
        name: 'Periodic Fasting Lipid & ApoB Follow-Up',
        frequency: 'Every 3–5 years (annual if on lipid-lowering therapy)',
        targetAge: 'Age 45+',
        goldStandard: 'Automated ApoB immunoassay',
        rationale: 'Titrates generic statin or ezetimibe therapy to maintain atherogenic particles below personalized thresholds.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Adenoma-to-Carcinoma Interception & Mucosal Barrier',
        mechanism: 'Most colorectal malignancies arise from slow-growing adenomatous polyps over 10–15 years. Polypectomy interrupts the oncogenic cascade before invasion occurs.',
        keyMetrics: ['Adenoma Detection Rate > 25%', 'FIT = Negative (< 100 ng Hb/mL)', 'PSA < 2.5 ng/mL']
      },
      osteopathic: {
        title: 'Pelvic Diaphragm Tensegrity & Mesenteric Lymphatic Flow',
        somaticFocus: 'L1–L2 sympathetic chain, Sacrum (S2–S4 parasympathetic), Pelvic Diaphragm',
        biomechanicalMechanism: 'The large intestine and pelvic organs receive parasympathetic supply via the pelvic splanchnic nerves (S2–S4). Sacral torsion or pelvic floor hypertonicity impairs colonic peristalsis, venous return, and mesenteric lymphatic drainage, promoting chronic pelvic congestion and mucosal stasis.',
        omtSelfCare: 'Perform sacral rocking exercises (glute bridge with pelvic tilts), deep supported squats to release the pelvic floor, and gentle clockwise abdominal massage to stimulate colonic transit.'
      },
      naturopathic: {
        title: 'Colonic Epithelial Integrity & Microbiome Protection',
        therapeuticOrderFocus: 'Order 2: Stimulate the body\'s natural defenses and repair mucosal architecture',
        botanicalPhytotherapy: 'Ulmus rubra (Slippery Elm bark) and Althaea officinalis (Marshmallow root) for mucilaginous barrier protection; high-fiber prebiotic inulin to boost short-chain fatty acid (butyrate) synthesis.',
        lifestyleGuidance: 'Achieve 35+ grams of diverse plant dietary fiber daily from 30+ unique plant species per week to suppress opportunistic microbial beta-glucuronidase.'
      },
      functional: {
        title: 'Mucosal Barrier Permeability & Sex Steroid Kinetics',
        networkBiologyFocus: 'Epithelial tight junctions, zonulin kinetics, and estrogen/androgen receptor density',
        keyBiomarkers: ['Quantitative FIT = Negative', 'Fecal Calprotectin < 50 ug/g', 'Free Testosterone / Estradiol Balance'],
        systemsIntervention: 'Assess and address intestinal hyperpermeability ("leaky gut") and dysbiosis; support perimenopausal and andropause transitions with bioidentical hormone stewardship if clinically warranted.'
      },
      tcm: {
        title: 'Large Intestine & Lung Qi Harmony',
        organMeridian: 'Large Intestine (Dachang) & Lung (Fei)',
        pathology: 'The Large Intestine is the paired Yang organ of the Lung, governing fluid absorption and elimination. Stagnant Heat, emotional grief, and Qi stagnation generate damp-heat accumulation in the bowel.',
        lifestyleGuidance: 'Ensure daily complete morning bowel elimination, hydrate with warm water, practice deep abdominal diaphragm breathing, and consume prebiotic fibers to dispel stagnant heat.'
      },
      ayurvedic: {
        title: 'Apana Vayu & Purisha Vaha Srotas Regulation',
        doshaEpoch: 'Pitta-Vata Interface (Metabolic change and hormonal transition)',
        dhatuFocus: 'Asthi (bone) and Shukra/Artava (reproductive vitality)',
        lifestyleGuidance: 'Apana Vayu governs pelvic elimination and lower digestive integrity. Consume warm, unctuous, fiber-rich cooked foods (Triphala, stewed apples, flax) to prevent mucosal drying.'
      },
      unani: {
        title: 'Istifragh (Evacuation of Morbid Matter) & Pelvic Decongestion',
        humoralFocus: 'Sauda (Black Bile) sedimentation prevention',
        mizajMechanism: 'Midlife hormonal shift triggers cold-dry Black Bile accumulation. Failure of daily evacuation allows toxic vapours (Bukharat-e-Raddiya) to ascend to the heart and brain.',
        regimenalGuidance: 'Promote gentle natural evacuation via soaked figs, prune compotes, and gentle abdominal oil rubbing (Tadhleek) before morning tea.'
      },
      chronobiology: {
        title: 'Gastrointestinal Melatonin & Epithelial Regeneration Cycles',
        circadianFocus: 'Colonic epithelial turnover rhythm (governed by gut circadian clocks)',
        photobiologyMechanism: 'The gastrointestinal tract synthesizes 400x more melatonin than the pineal gland. Disrupted sleep architecture blunts nocturnal colonic mucosal repair and accelerates polyp dysplasia.',
        zeitgeberAction: 'Maintain strict dinner cutoffs at least 3.5 hours before bedtime; prioritize 7.5 to 8.5 hours of uninterrupted sleep to permit nocturnal intestinal stem cell renewal.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'Invasive screening colonoscopy carries a documented adverse complication risk (perforation, hemorrhage) of approximately 1.5 per 1,000 procedures. Patients fearful of anesthesia often skip screening entirely.',
      goldenRule: 'Annual at-home Fecal Immunochemical Testing (FIT) is non-invasive, has a 0% procedure complication rate, costs under $25, and provides equivalent 10-year programmatic survival to colonoscopy when positive tests are followed up promptly.',
      naturalFrequencyStatistic: 'In 1,000 adults screened annually with FIT over 10 years, colorectal cancer deaths are reduced by 8–10 lives (identical to colonoscopy), while avoiding invasive bowel preps unless blood is detected.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$2,800–$6,500 total hospital facility fee, gastroenterologist fee, and anesthesia charge for screening colonoscopy.',
      genericPharmacyBenchmark: '$15–$25 cash price for annual at-home FIT kit; $0 out-of-pocket for in-network screening colonoscopy under ACA preventive mandate.',
      cashNavigationAdvice: 'If paying cash or facing high deductible, request an evidence-based lab-grade FIT kit ($15–$20) rather than high-cost stool-DNA multi-target kits ($600).'
    },
    physicianQuestions: [
      'Between an annual at-home FIT test and a 10-year colonoscopy, which screening modality is best aligned with my risk profile and preferences?',
      'If we schedule a screening colonoscopy, can we confirm in advance that the facility, gastroenterologist, and anesthesiologist are all covered under 100% preventive care?',
      'What is our shared decision-making plan for baseline prostate (PSA) or perimenopausal/bone density health at my current age?'
    ]
  },
  {
    id: 'horizon-5',
    decade: 'Age 60–65',
    minAge: 60,
    maxAge: 74,
    title: 'Sensory Firewall & Osteo-Metabolic Armor',
    subtitle: 'Preserving auditory neural bandwidth, bone mineral density, thoracic cage compliance, and sensory integrity',
    epochQuote: 'Midlife hearing loss is the single largest modifiable risk factor for dementia; treating it restores neural bandwidth and preserves hippocampal volume.',
    quilledArtUrl: '/assets/art/cochlear-spiral-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of cochlear spiral, auditory nerve pathways, and radiating brain wave harmonics',
    artConceptNote: 'Graceful paper filigree depicting the spiral cochlear labyrinth, hair cell stereocilia, and temporal lobe synaptogenesis.',
    screenings: [
      {
        name: 'Formal Audiogram Hearing Screening',
        frequency: 'Baseline at age 60; repeat every 2–3 years',
        targetAge: 'Age 60+',
        goldStandard: 'Pure-tone air and bone conduction audiometry with speech discrimination',
        rationale: 'Preserves auditory cognitive bandwidth, preventing compensatory prefrontal cognitive reallocation and social isolation.'
      },
      {
        name: 'Dual-Energy X-Ray Absorptiometry (DEXA)',
        frequency: 'Baseline at age 65 (women) / 70 (men); age 60 if clinical risk factors present',
        targetAge: 'Ages 60–65+',
        goldStandard: 'Central dual-energy X-ray absorptiometry of lumbar spine and femoral neck',
        rationale: 'Detects osteopenia and osteoporosis prior to catastrophic fragility fractures, allowing timely anti-resorptive therapy.'
      },
      {
        name: 'Low-Dose CT (LDCT) Lung Cancer Screening',
        frequency: 'Annual for eligible adults',
        targetAge: 'Ages 50–80 with 20+ pack-year smoking history who currently smoke or quit within 15 years',
        goldStandard: 'Low-dose helical computed tomography without contrast',
        rationale: 'Reduces lung cancer mortality by 20% by detecting early asymptomatic resectable pulmonary nodules.'
      },
      {
        name: 'Abdominal Aortic Aneurysm (AAA) Ultrasound',
        frequency: 'One-time screening',
        targetAge: 'Men ages 65–75 who have ever smoked (USPSTF Grade B)',
        goldStandard: 'Duplex B-mode ultrasonography of the abdominal aorta',
        rationale: 'Detects asymptomatic aortic enlargement (diameter >= 3.0 cm), preventing fatal rupture.'
      },
      {
        name: 'Immunization & Infectious Shield Review',
        frequency: 'As indicated by age milestone',
        targetAge: 'Age 60–65+',
        goldStandard: 'Shingrix recombinant zoster (2 doses at 50+), PCV20 pneumococcal (at 65)',
        rationale: 'Prevents postherpetic neuralgia and invasive pneumococcal pneumonia during immune senescence.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Sensory Reserve Preservation & Fracture Prevention',
        mechanism: 'Auditory deprivation forces the brain to divert executive cognitive resources to decode degraded speech signals, accelerating hippocampal atrophy. Correcting hearing reduces 3-year cognitive decline by 48% in at-risk older adults.',
        keyMetrics: ['Pure-tone average < 25 dB HL', 'DEXA T-score > -1.0', 'Aortic diameter < 3.0 cm']
      },
      osteopathic: {
        title: 'Thoracic Cage Compliance & Temporal Bone Craniosacral Mobility',
        somaticFocus: 'Costochondral junctions, Ribs 1–12, Temporal Bones & Eustachian Tube',
        biomechanicalMechanism: 'Age-related stiffening and calcification of the costochondral junctions restrict rib cage compliance, decreasing functional residual capacity and lymphatic pump effectiveness. Temporal bone somatic restriction can impair middle ear pressure regulation and microvascular cochlear perfusion.',
        omtSelfCare: 'Engage in thoracic cage expansion drills with resistance bands, active eustachian tube opening exercises (yawning/swallowing with gentle jaw lateralization), and low-impact walking to maintain fascial spring and bone density.'
      },
      naturopathic: {
        title: 'Cerebral Microvascular Perfusion & Bone Matrix Mineralization',
        therapeuticOrderFocus: 'Order 3 & 4: Support microcirculation and rebuild bone mineral scaffolding',
        botanicalPhytotherapy: 'Ginkgo biloba standardized extract (EGb 761 / bilobalide) for microvascular perfusion of the stria vascularis in the inner ear; Bacopa monnieri for synaptic cholinergic density.',
        lifestyleGuidance: 'Bone matrix support formula: Vitamin D3 (2000 IU) + K2 (MK-7 100 mcg) + magnesium glycinate + dietary silica (horsetail tea) to guide calcium into bone rather than vascular walls.'
      },
      functional: {
        title: 'Neuro-Cognitive Bandwidth & Sensorimotor Integrity',
        networkBiologyFocus: 'Lancet Commission #1 modifiable dementia factor: Auditory neural stimulation and temporal lobe cortical volume',
        keyBiomarkers: ['Audiogram PTA < 25 dB', 'Serum Homocysteine < 9 umol/L', 'Serum Vitamin B12 > 500 pg/mL'],
        systemsIntervention: 'Prescribe prompt Over-the-Counter (OTC) or prescription hearing amplification upon discovering mild hearing loss; treat elevated homocysteine with methylated folate (5-MTHF) and methylcobalamin.'
      },
      tcm: {
        title: 'Kidney Opens into the Ears & Bone Nourishment',
        organMeridian: 'Kidney (Shen)',
        pathology: 'The Kidney stores Jing and governs bones and marrow. In TCM, "the Kidney opens into the ears." Progressive presbycusis and bone mineral loss reflect declining Kidney Jing and diminished "Sea of Marrow".',
        lifestyleGuidance: 'Support Kidney Jing with black sesame seeds, walnuts, bone broths, daily foot reflexology, and warm ear massage (rubbing the helix 36 times daily).'
      },
      ayurvedic: {
        title: 'Vata Epoch Dominance & Asthi Dhatu Protection',
        doshaEpoch: 'Vata Epoch (Catabolism, Dryness, Lightness)',
        dhatuFocus: 'Asthi (bone mineral matrix) and Majja (bone marrow and nerves)',
        lifestyleGuidance: 'Vata drying causes joint stiffness and brittle bones. Counteract with daily warm sesame oil body massage (Abhyanga), warm grounding soups, and gentle weight-bearing movement.'
      },
      unani: {
        title: 'Preserving Quwwat-e-Hissiyyah (Sensory Faculty) & Bone Moisture',
        humoralFocus: 'Counteracting Buroodat (Coldness) and Yaboosat (Dryness)',
        mizajMechanism: 'Decline in sensory acuity reflects drying of the cerebral nerve pathways (Aasab) and cooling of the vital spirit. Bone fragility stems from loss of natural cementing moisture (Rutoobat-e-Asliyyah).',
        regimenalGuidance: 'Gentle warm oil inunctions over the spine and joints (Roghan-e-Babbuna / chamomile oil); consuming warm almond milk infused with saffron and cardamom to fortify the brain.'
      },
      chronobiology: {
        title: 'Phase Advance Correction & Photopic Retinal Ganglion Support',
        circadianFocus: 'Preventing age-related circadian amplitude flattening',
        photobiologyMechanism: 'Yellowing of the ocular crystalline lens filters out blue photons, depriving ipRGCs of circadian signals and causing early evening sleepiness with 03:00 awakenings.',
        zeitgeberAction: 'Expose eyes to bright outdoor afternoon light (or a 10,000 lux lightbox) between 16:00 and 17:30 to delay circadian phase; use bedroom red nightlights to preserve nocturnal melatonin.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'Hearing impairment is frequently neglected due to perceived vanity or social stigma, allowing 10–15 years of social disengagement and cognitive isolation to take root.',
      goldenRule: 'Hearing amplification is a neurocognitive preservation strategy, not a sign of decrepitude. Modern discreet FDA-approved Over-the-Counter (OTC) devices cost hundreds instead of thousands of dollars.',
      naturalFrequencyStatistic: 'In 1,000 older adults with mild-to-moderate hearing loss, early amplification preserves speech comprehension and cognitive processing in approximately 480 individuals compared to uncorrected decline.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$4,500–$7,500 per pair at private boutique hearing aid dispensaries; $450–$900 for hospital-billed DEXA scans.',
      genericPharmacyBenchmark: '$299–$799 for FDA-cleared Over-the-Counter (OTC) hearing aids (Sony, Jabra, Lexie); $75–$125 cash price for independent outpatient DEXA scans.',
      cashNavigationAdvice: 'Obtain an independent diagnostic audiogram ($45–$75) and take your hearing test results to purchase direct OTC devices instead of financing expensive bundled dispensary packages.'
    },
    physicianQuestions: [
      'Can we order a formal pure-tone audiogram to establish my baseline hearing acuity and protect my cognitive reserve?',
      'Should we schedule my baseline DEXA bone mineral density scan now to assess T-scores and fracture risk?',
      'Are all my age-appropriate immunizations—specifically Shingrix and pneumococcal vaccines—up to date?'
    ]
  },
  {
    id: 'horizon-6',
    decade: 'Age 75+',
    minAge: 75,
    maxAge: 120,
    title: 'The Deprescribing Sanctuary & Functional Autonomy',
    subtitle: 'Pruning polypharmacy, protecting mobility, gentle lymphatic mobilization, and nurturing Ojas and vital spirit',
    epochQuote: 'At age 75 and beyond, clinical excellence is measured not by how many interventions are added, but by how skillfully unnecessary burdens are lifted.',
    quilledArtUrl: '/assets/art/ancient-ojas-quilling-art.jpg',
    quilledArtAlt: '3D Paper Quilling of ancient resilient tree roots, protective golden halo of Ojas, and peaceful balance',
    artConceptNote: 'Deep earthy coiled roots and radiant golden paper ribbons celebrating biological endurance, Ojas vitality, and serenity.',
    screenings: [
      {
        name: 'Beers Criteria & STOPP/START Polypharmacy Audit',
        frequency: 'Every 6 months (or after any hospital discharge / medication change)',
        targetAge: 'Age 75+',
        goldStandard: 'Structured geriatric pharmacist or clinician reconciliation using 2023 AGS Beers Criteria',
        rationale: 'Systematically deprescribes redundant antihypertensives, anticholinergics, and sedatives, preventing falls and cognitive delirium.',
        ismpSafetyNote: 'ISMP High-Alert: Deprescribe high-risk sedatives, anticholinergics, and non-indicated proton-pump inhibitors.'
      },
      {
        name: 'Annual Fall Risk & Mobility Assessment',
        frequency: 'Annual primary care visit',
        targetAge: 'Age 75+',
        goldStandard: 'Timed Up and Go (TUG) test (< 12 sec), 4-Stage Balance Test, Orthostatic BP',
        rationale: 'Identifies postural instability, orthostatic hypotension, and musculoskeletal weakness before injurious falls occur.'
      },
      {
        name: 'Sarcopenia & Functional Reserve Screening',
        frequency: 'Annual checkup',
        targetAge: 'Age 75+',
        goldStandard: 'Calibrated hydraulic handgrip dynamometry + 4-meter gait speed',
        rationale: 'Quantifies muscle strength and reserve, guiding personalized resistance exercise and adequate dietary protein intake.'
      },
      {
        name: 'Annual Cognitive Health Trajectory (Mini-Cog / MoCA)',
        frequency: 'Annual Medicare Wellness Visit (CPT G0438)',
        targetAge: 'Age 75+',
        goldStandard: 'Standardized 3-word recall + clock drawing (Mini-Cog) or Montreal Cognitive Assessment',
        rationale: 'Establishes baseline cognitive stability, differentiating reversible metabolic causes (B12 deficiency, thyroid) from neurodegeneration.'
      },
      {
        name: 'Advance Care Planning & POLST Harmonization',
        frequency: 'Annual review or significant health status change',
        targetAge: 'Age 75+',
        goldStandard: 'Facilitated values-clarification interview and statutory Advance Directive / POLST execution',
        rationale: 'Honors personal autonomy and treatment preferences, eliminating unwanted non-beneficial emergency interventions.'
      }
    ],
    grandTraditions: {
      allopathic: {
        title: 'Deprescribing Science & Iatrogenic Harm Prevention',
        mechanism: 'Adverse drug reactions cause over 100,000 emergency hospitalizations annually in older adults. Deprescribing non-beneficial medications restores renal clearance, cognitive clarity, and autonomic blood pressure stability.',
        keyMetrics: ['Medication Count <= 5', 'TUG Test < 12 seconds', 'MoCA Score >= 26/30']
      },
      osteopathic: {
        title: 'Proprioceptive Sacral Base Balancing & Gentle Lymphatic Mobilization',
        somaticFocus: 'Sacroiliac joints, Ankle mortise joints, Cranial base (OA / Jugular Foramen)',
        biomechanicalMechanism: 'Pelvic asymmetry and ankle joint restriction degrade sensory proprioceptive feedback, increasing fall risk. Osteopenic bone contraindicates high-velocity thrusts (HVLA). Low-force myofascial release and pedal lymphatic pumps enhance peripheral fluid reabsorption without joint strain.',
        omtSelfCare: 'Daily seated ankle alphabets, gentle seated cat-cow spinal mobilization, calf raises holding a countertop for balance, and gentle passive pedal lymphatic drainage.'
      },
      naturopathic: {
        title: 'Gentle Adaptogenic Vitality & Digestive Enzyme Support',
        therapeuticOrderFocus: 'Order 1 & 2: Gently support vital force without metabolic overload',
        botanicalPhytotherapy: 'Eleutherococcus senticosus (Siberian ginseng) for adaptogenic resilience; Ganoderma lucidum (Reishi mushroom) for gentle immune surveillance; gentle digestive bitters to aid age-related hypochlorhydria.',
        lifestyleGuidance: 'Home environmental safety audit: Remove throw rugs, install high-contrast bathroom grab bars, maintain warm ambient room temperatures (70°F+), and ensure adequate protein intake (1.2g/kg).'
      },
      functional: {
        title: 'Anticholinergic Burden Pruning & Sarcopenia Reversal',
        networkBiologyFocus: 'Central cholinergic transmission and mTOR-mediated myofibrillar protein synthesis',
        keyBiomarkers: ['Anticholinergic Cognitive Burden Score = 0', 'eGFR > 45 mL/min/1.73m²', 'Handgrip Strength > 20 kg (F) / 30 kg (M)'],
        systemsIntervention: 'Eliminate over-the-counter PM diphenhydramine sedatives and bladder antispasmodics; prescribe essential amino acids or whey protein isolate post-exercise to stimulate muscle protein synthesis.'
      },
      tcm: {
        title: 'Conserving Yuan Qi & Nourishing Shen (Spirit)',
        organMeridian: 'Heart (Xin) & Kidney (Shen)',
        pathology: 'The elder years represent the quiet conservation of Yuan Qi (Original Qi). Overmedication, aggressive treatments, and agitation scatter the Shen (Spirit) and drain the remaining constitutional foundation.',
        lifestyleGuidance: 'Cultivate serenity, practice gentle Tai Chi or Qigong for balance, enjoy warm easily-digested congees with ginger, and maintain joyful social companionship.'
      },
      ayurvedic: {
        title: 'Rasayana Rejuvenation & Ojas Preservation',
        doshaEpoch: 'Full Vata Epoch (Deep Wisdom, Catabolic Transition)',
        dhatuFocus: 'Ojas (Supreme Vital Essence of Immunity and Longevity)',
        lifestyleGuidance: 'Vata reaches its peak. Strictly avoid harsh fasts or cleanses. Nourish Ojas with warm spiced golden milk (turmeric, nutmeg, dates), warm sesame oil foot massage before sleep, and gentle restorative herbs (Ashwagandha).'
      },
      unani: {
        title: 'Hifzan-e-Sehat (Preservation of Health in Old Age) & Ruh Fortification',
        humoralFocus: 'Conserving Hararat-e-Ghariziyyah (Remaining Innate Heat)',
        mizajMechanism: 'Geriatric physiology is cool and dry (Barid-Yabis). Aggressive drug therapy or intense purgation rapidly extinguishes the remaining flicker of vital heat.',
        regimenalGuidance: 'Lateef Ghiza (light, easily absorbed, highly nourishing soups and broths); gentle dry friction rubbing of limbs to stimulate circulation; keeping the heart joyful with fragrant floral waters (Rose/Arq-e-Gulab).'
      },
      chronobiology: {
        title: 'Circadian Consolidation & Sundowning Prevention',
        circadianFocus: 'Consolidating fragmented elder sleep-wake cycles',
        photobiologyMechanism: 'Age-related loss of VIPergic SCN neurons weakens circadian rhythm amplitude, leading to daytime somnolence and nighttime insomnia or cognitive agitation ("sundowning").',
        zeitgeberAction: 'Anchor the day with rigid social zeitgebers: morning daylight by a window, scheduled meal hours, afternoon social interaction, and an absolute bedtime routine.'
      }
    },
    scanxiety: {
      title: 'Overdiagnosis & Scanxiety Neutralization',
      overdiagnosisCaution: 'Aggressive routine cancer screening (e.g. screening colonoscopy after 75 or mammography after 80) frequently causes more procedural harm and biopsy complications than survival benefit.',
      goldenRule: 'Deprescribing is not "giving up"—it is the pinnacle of compassionate clinical wisdom. Pruning 3 unnecessary medications often resolves dizziness, cognitive fatigue, and appetite loss within 14 days.',
      naturalFrequencyStatistic: 'Among 1,000 adults aged 75+ who undergo structured medication deprescribing, over 300 experience improved alertness and reduced fall risk, with zero decrease in life expectancy.'
    },
    pricing: {
      title: 'Respectful Pricing Shield',
      standardRetailBenchmark: '$350–$900/month out-of-pocket for 8–12 concurrent commercial prescriptions.',
      genericPharmacyBenchmark: '$0 copay for Medicare Annual Wellness Visit deprescribing consultation (CPT G0438); $15–$30/month for a streamlined generic regimen of 3–4 essential medications.',
      cashNavigationAdvice: 'Bring all prescription and OTC bottles in a brown bag to your primary care clinician or clinical pharmacist for a dedicated "Brown Bag Deprescribing Review" covered by Medicare.'
    },
    physicianQuestions: [
      'Can we conduct a Beers Criteria / STOPP review of all my prescription and OTC medications to see if any can be safely tapered or discontinued?',
      'Could we perform a quick Timed Up and Go (TUG) balance test today to evaluate my fall risk and mobility stability?',
      'What are the most meaningful steps we can take to keep me living independently, comfortably, and actively in my own home?'
    ]
  }
];

export interface ITraditionMetadata {
  key: TTraditionKey;
  label: string;
  shortLabel: string;
  icon: string;
  badgeClass: string;
  borderClass: string;
  category: 'licensed' | 'ancient' | 'systems';
}

export const TRADITIONS_METADATA: ITraditionMetadata[] = [
  {
    key: 'allopathic',
    label: 'Allopathic (MD)',
    shortLabel: 'Allopathic',
    icon: '🔵',
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    borderClass: 'border-sky-500/30',
    category: 'licensed'
  },
  {
    key: 'osteopathic',
    label: 'Osteopathic (DO)',
    shortLabel: 'Osteopathic',
    icon: '🟣',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    borderClass: 'border-indigo-500/30',
    category: 'licensed'
  },
  {
    key: 'naturopathic',
    label: 'Naturopathic (ND)',
    shortLabel: 'Naturopathic',
    icon: '🟢',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    category: 'licensed'
  },
  {
    key: 'functional',
    label: 'Functional & Systems',
    shortLabel: 'Systems Bio',
    icon: '🔬',
    badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    borderClass: 'border-teal-500/30',
    category: 'systems'
  },
  {
    key: 'tcm',
    label: 'TCM Zang-Fu',
    shortLabel: 'TCM',
    icon: '🌿',
    badgeClass: 'bg-green-500/10 text-green-300 border-green-500/20',
    borderClass: 'border-green-500/30',
    category: 'ancient'
  },
  {
    key: 'ayurvedic',
    label: 'Ayurvedic Tridosha',
    shortLabel: 'Ayurveda',
    icon: '🟡',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    borderClass: 'border-amber-500/30',
    category: 'ancient'
  },
  {
    key: 'unani',
    label: 'Unani-Tibb (Greco-Arabic)',
    shortLabel: 'Unani-Tibb',
    icon: '🏺',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    borderClass: 'border-rose-500/30',
    category: 'ancient'
  },
  {
    key: 'chronobiology',
    label: 'Chronobiology & Exposome',
    shortLabel: 'Circadian Arc',
    icon: '☀️',
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    borderClass: 'border-orange-500/30',
    category: 'systems'
  }
];

@Component({
  selector: 'app-life-course-screening-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      <!-- ══ Header & Patient Age Synchronizer ═══════════════════════════════ -->
      <div class="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border-b border-slate-800">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Preventive Health Engine
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Grand Octet (8 Traditions)
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ISMP &amp; Gigerenzer Bias Guard
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>🧭</span>
              <span>Life-Course Screening &amp; Longevity Navigator</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Decade-by-decade clinical screening roadmap harmonizing Allopathic (MD), Osteopathic (DO), Naturopathic (ND), Functional Systems Biology, TCM, Ayurveda, Unani-Tibb, and Circadian Chronobiology.
            </p>
          </div>

          <!-- Patient Age & Active Horizon Badge -->
          <div class="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
              🎂
            </div>
            <div>
              <div class="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Patient Age</div>
              <div class="text-base font-extrabold text-white font-mono flex items-center gap-2">
                <span>{{ patientAgeDisplay() }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-semibold">
                  {{ activeHorizon().decade }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ 6 Horizon Timeline Tabs ══════════════════════════════════════════ -->
        <div class="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth hide-scrollbar">
          @for (h of horizons; track h.id) {
            <button
              (click)="selectHorizon(h.id)"
              [class.bg-emerald-600]="selectedHorizonId() === h.id"
              [class.text-white]="selectedHorizonId() === h.id"
              [class.border-emerald-400]="selectedHorizonId() === h.id"
              [class.shadow-lg]="selectedHorizonId() === h.id"
              [class.shadow-emerald-950/50]="selectedHorizonId() === h.id"
              [class.bg-slate-900]="selectedHorizonId() !== h.id"
              [class.text-slate-400]="selectedHorizonId() !== h.id"
              [class.border-slate-800]="selectedHorizonId() !== h.id"
              [class.hover:border-slate-700]="selectedHorizonId() !== h.id"
              [class.hover:text-slate-200]="selectedHorizonId() !== h.id"
              class="px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0">
              <span class="w-2 h-2 rounded-full" [class.bg-emerald-300]="selectedHorizonId() === h.id" [class.bg-slate-600]="selectedHorizonId() !== h.id"></span>
              <span>{{ h.decade }}</span>
              @if (isPatientCurrentDecade(h)) {
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono uppercase font-bold">You</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- ══ Horizon Hero & Edge-Blended Quilled Artwork Plate ═════════════════ -->
      <div class="p-6 sm:p-8 space-y-6">
        <div class="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-xl">
          <!-- Edge-Blended Quilled Artwork Container -->
          <div class="relative h-56 sm:h-72 w-full overflow-hidden">
            <img
              [src]="activeHorizon().quilledArtUrl"
              [alt]="activeHorizon().quilledArtAlt"
              class="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-95" />
            <!-- Seamless Vignette Overlays Melting Image into Obsidian Background -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80"></div>
          </div>

          <!-- Quilled Plate Content Overlay -->
          <div class="absolute bottom-0 inset-x-0 p-6 sm:p-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {{ activeHorizon().decade }} Epoch
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
                3D Paper Quilling Botanical Plate
              </span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              {{ activeHorizon().title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              {{ activeHorizon().subtitle }}
            </p>
            <p class="text-xs text-emerald-400/90 italic mt-2 font-serif">
              "{{ activeHorizon().epochQuote }}"
            </p>
          </div>
        </div>

        <!-- ══ Navigation View Selector Within Horizon ═════════════════════════ -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              (click)="activeView.set('all')"
              [class.bg-emerald-600]="activeView() === 'all'"
              [class.text-white]="activeView() === 'all'"
              [class.text-slate-400]="activeView() !== 'all'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
              Comprehensive
            </button>
            <button
              (click)="activeView.set('screenings')"
              [class.bg-emerald-600]="activeView() === 'screenings'"
              [class.text-white]="activeView() === 'screenings'"
              [class.text-slate-400]="activeView() !== 'screenings'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
              Clinical Screenings
            </button>
            <button
              (click)="activeView.set('grand-traditions')"
              [class.bg-emerald-600]="activeView() === 'grand-traditions'"
              [class.text-white]="activeView() === 'grand-traditions'"
              [class.text-slate-400]="activeView() !== 'grand-traditions'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
              8 Grand Traditions
            </button>
            <button
              (click)="activeView.set('scanxiety-pricing')"
              [class.bg-emerald-600]="activeView() === 'scanxiety-pricing'"
              [class.text-white]="activeView() === 'scanxiety-pricing'"
              [class.text-slate-400]="activeView() !== 'scanxiety-pricing'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
              Bias Guard &amp; Pricing
            </button>
          </div>

          <!-- 1-Page Prep Sheet Export Action -->
          <div class="flex items-center gap-2">
            <button
              (click)="togglePrepSheetModal(true)"
              class="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
              <span>📄</span>
              <span>1-Page Multi-Disciplinary Prep Sheet</span>
            </button>
          </div>
        </div>

        <!-- ══ View 1: Core Clinical Screenings ═════════════════════════════════ -->
        @if (activeView() === 'all' || activeView() === 'screenings') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>📋</span>
                <span>Guideline-Adherent Screening Actions ({{ activeHorizon().decade }})</span>
              </h4>
              <span class="text-xs text-slate-500 font-mono">Evidence-Grounded Recommendations</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (item of activeHorizon().screenings; track item.name) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                  <div class="flex items-start justify-between gap-3">
                    <h5 class="text-sm font-bold text-white leading-tight">
                      {{ item.name }}
                    </h5>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {{ item.frequency }}
                    </span>
                  </div>

                  <div class="text-xs text-slate-300 space-y-1.5">
                    <div>
                      <span class="text-slate-400 font-medium">Gold Standard: </span>
                      <span class="text-slate-200">{{ item.goldStandard }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 font-medium">Clinical Rationale: </span>
                      <span class="text-slate-300">{{ item.rationale }}</span>
                    </div>
                  </div>

                  @if (item.ismpSafetyNote) {
                    <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                      <span class="text-sm shrink-0">⚠️</span>
                      <span class="leading-relaxed">{{ item.ismpSafetyNote }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- ══ View 2: The 8 Grand Traditions Synthesis ═════════════════════════ -->
        @if (activeView() === 'all' || activeView() === 'grand-traditions') {
          <div class="space-y-5 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span>🌐</span>
                  <span>The Grand Octet: 8 Integrative Healing Traditions</span>
                </h4>
                <p class="text-xs text-slate-400 mt-0.5">
                  Comparative biophysical and energetic analysis tailored to {{ activeHorizon().decade }}.
                </p>
              </div>

              <!-- Category Filter Pills -->
              <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  (click)="traditionFilter.set('all')"
                  [class.bg-emerald-600]="traditionFilter() === 'all'"
                  [class.text-white]="traditionFilter() === 'all'"
                  [class.text-slate-400]="traditionFilter() !== 'all'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer">
                  All 8
                </button>
                <button
                  (click)="traditionFilter.set('licensed')"
                  [class.bg-emerald-600]="traditionFilter() === 'licensed'"
                  [class.text-white]="traditionFilter() === 'licensed'"
                  [class.text-slate-400]="traditionFilter() !== 'licensed'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer">
                  Licensed (MD/DO/ND)
                </button>
                <button
                  (click)="traditionFilter.set('ancient')"
                  [class.bg-emerald-600]="traditionFilter() === 'ancient'"
                  [class.text-white]="traditionFilter() === 'ancient'"
                  [class.text-slate-400]="traditionFilter() !== 'ancient'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer">
                  Ancient Global
                </button>
                <button
                  (click)="traditionFilter.set('systems')"
                  [class.bg-emerald-600]="traditionFilter() === 'systems'"
                  [class.text-white]="traditionFilter() === 'systems'"
                  [class.text-slate-400]="traditionFilter() !== 'systems'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer">
                  Systems &amp; Circadian
                </button>
              </div>
            </div>

            <!-- 8 Traditions Responsive Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <!-- 1. Allopathic (MD) -->
              @if (shouldShowTradition('allopathic')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">1. Allopathic (MD)</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.allopathic.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.allopathic.mechanism }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800">
                    <span class="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">Target Biomarkers:</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (m of activeHorizon().grandTraditions.allopathic.keyMetrics; track m) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/60 text-sky-300 border border-sky-800/60">
                          {{ m }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- 2. Osteopathic (DO) -->
              @if (shouldShowTradition('osteopathic')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">2. Osteopathic (DO)</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.osteopathic.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.osteopathic.biomechanicalMechanism }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-indigo-400/80">
                      Somatic Segment: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.osteopathic.somaticFocus }}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      <strong class="text-slate-300">OMT / Self-Care:</strong> {{ activeHorizon().grandTraditions.osteopathic.omtSelfCare }}
                    </p>
                  </div>
                </div>
              }

              <!-- 3. Naturopathic (ND) -->
              @if (shouldShowTradition('naturopathic')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">3. Naturopathic (ND)</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.naturopathic.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.naturopathic.therapeuticOrderFocus }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-emerald-400/80">
                      Botanicals: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.naturopathic.botanicalPhytotherapy }}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      <strong class="text-slate-300">Action:</strong> {{ activeHorizon().grandTraditions.naturopathic.lifestyleGuidance }}
                    </p>
                  </div>
                </div>
              }

              <!-- 4. Functional & Systems Biology -->
              @if (shouldShowTradition('functional')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400">4. Functional Systems</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.functional.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.functional.systemsIntervention }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800">
                    <span class="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">Network Biomarkers:</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (m of activeHorizon().grandTraditions.functional.keyBiomarkers; track m) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/60 text-teal-300 border border-teal-800/60">
                          {{ m }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- 5. Traditional Chinese Medicine (TCM) -->
              @if (shouldShowTradition('tcm')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-green-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-green-400">5. TCM Zang-Fu</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.tcm.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.tcm.pathology }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-green-400/80">
                      Channel: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.tcm.organMeridian }}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      <strong class="text-slate-300">Action:</strong> {{ activeHorizon().grandTraditions.tcm.lifestyleGuidance }}
                    </p>
                  </div>
                </div>
              }

              <!-- 6. Ayurvedic Medicine -->
              @if (shouldShowTradition('ayurvedic')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">6. Ayurvedic Tridosha</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.ayurvedic.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.ayurvedic.lifestyleGuidance }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-amber-400/80">
                      Dosha Epoch: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.ayurvedic.doshaEpoch }}</span>
                    </div>
                    <div class="text-[10px] uppercase font-mono tracking-wider text-amber-400/80">
                      Dhatu Focus: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.ayurvedic.dhatuFocus }}</span>
                    </div>
                  </div>
                </div>
              }

              <!-- 7. Unani-Tibb (Greco-Arabic) -->
              @if (shouldShowTradition('unani')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">7. Unani-Tibb</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.unani.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.unani.mizajMechanism }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-rose-400/80">
                      Humoral Focus: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.unani.humoralFocus }}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      <strong class="text-slate-300">Regimen:</strong> {{ activeHorizon().grandTraditions.unani.regimenalGuidance }}
                    </p>
                  </div>
                </div>
              }

              <!-- 8. Chronobiology & Exposome -->
              @if (shouldShowTradition('chronobiology')) {
                <div class="p-5 rounded-2xl bg-slate-900 border border-orange-500/30 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div class="space-y-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                      <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">8. Circadian &amp; Exposome</span>
                    </div>
                    <h5 class="text-sm font-bold text-white leading-snug">
                      {{ activeHorizon().grandTraditions.chronobiology.title }}
                    </h5>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ activeHorizon().grandTraditions.chronobiology.photobiologyMechanism }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-800 space-y-1">
                    <div class="text-[10px] uppercase font-mono tracking-wider text-orange-400/80">
                      Clock System: <span class="text-slate-300 normal-case">{{ activeHorizon().grandTraditions.chronobiology.circadianFocus }}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      <strong class="text-slate-300">Zeitgeber:</strong> {{ activeHorizon().grandTraditions.chronobiology.zeitgeberAction }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- ══ View 3: Scanxiety Guard & Respectful Pricing ══════════════════════ -->
        @if (activeView() === 'all' || activeView() === 'scanxiety-pricing') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Scanxiety & Gerd Gigerenzer Natural Frequency Guard -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-4 relative overflow-hidden">
              <div class="flex items-center gap-2">
                <span class="text-base">🛡️</span>
                <h5 class="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono">
                  {{ activeHorizon().scanxiety.title }}
                </h5>
              </div>

              <div class="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200 leading-relaxed">
                <strong class="text-purple-100">Overdiagnosis Warning:</strong> {{ activeHorizon().scanxiety.overdiagnosisCaution }}
              </div>

              <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong class="text-amber-100">The Golden Rule:</strong> {{ activeHorizon().scanxiety.goldenRule }}
              </div>

              <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>📊</span>
                  <span>Gerd Gigerenzer Natural Frequency Framing (Per 1,000 Adults)</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  {{ activeHorizon().scanxiety.naturalFrequencyStatistic }}
                </p>
              </div>
            </div>

            <!-- Respectful Healthcare Pricing Shield -->
            <div class="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 relative overflow-hidden">
              <div class="flex items-center gap-2">
                <span class="text-base">🏷️</span>
                <h5 class="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  {{ activeHorizon().pricing.title }}
                </h5>
              </div>

              <div class="space-y-3 text-xs">
                <div class="p-3 rounded-xl bg-red-950/20 border border-red-900/30 space-y-1">
                  <div class="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">Standard Retail / Hospital Chargemaster Benchmark:</div>
                  <div class="text-slate-300">{{ activeHorizon().pricing.standardRetailBenchmark }}</div>
                </div>

                <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                  <div class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Transparent Generic / Cash Pharmacy Benchmark:</div>
                  <div class="text-slate-200 font-semibold">{{ activeHorizon().pricing.genericPharmacyBenchmark }}</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Actionable Cash Navigation Advice:</div>
                  <div class="text-slate-300 leading-relaxed">{{ activeHorizon().pricing.cashNavigationAdvice }}</div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ══ 1-Page Physician Visit Prep Sheet Modal ════════════════════════════ -->
      @if (showPrepSheetModal()) {
        <div class="fixed inset-0 z-[9995] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-100 font-sans">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                  📋
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">1-Page Multi-Disciplinary Visit Prep Sheet</h3>
                  <p class="text-xs text-slate-400">Structured clinical agenda for your next medical encounter (MD, DO, ND, or Integrative Clinic)</p>
                </div>
              </div>
              <button
                (click)="togglePrepSheetModal(false)"
                class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Prep Sheet Content Card -->
            <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span class="text-slate-400">Patient Demographic: </span>
                  <strong class="text-slate-200">{{ patientAgeDisplay() }}</strong>
                </div>
                <div>
                  <span class="text-slate-400">Epoch: </span>
                  <strong class="text-emerald-400">{{ activeHorizon().decade }} ({{ activeHorizon().title }})</strong>
                </div>
              </div>

              <!-- High-Yield Structured Questions -->
              <div class="space-y-2">
                <div class="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <span>❓</span>
                  <span>3 High-Yield Questions to Ask Your Clinician:</span>
                </div>
                <div class="space-y-2">
                  @for (q of activeHorizon().physicianQuestions; track q; let idx = $index) {
                    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {{ idx + 1 }}
                      </span>
                      <p class="text-slate-200 leading-relaxed font-medium">{{ q }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Priority Screenings Checklist -->
              <div class="space-y-2 pt-2 border-t border-slate-800">
                <div class="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <span>✅</span>
                  <span>Priority Screenings for this Epoch:</span>
                </div>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (s of activeHorizon().screenings; track s.name) {
                    <li class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                      <span class="text-emerald-400">▪</span>
                      <span class="truncate">{{ s.name }}</span>
                    </li>
                  }
                </ul>
              </div>

              <!-- Multi-Tradition Alignment Notes -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div class="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-800/30 text-indigo-200 space-y-0.5">
                  <div class="font-bold font-mono uppercase text-indigo-300 text-[10px]">Osteopathic (DO):</div>
                  <div>Segment: {{ activeHorizon().grandTraditions.osteopathic.somaticFocus }}</div>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-200 space-y-0.5">
                  <div class="font-bold font-mono uppercase text-emerald-300 text-[10px]">Naturopathic (ND):</div>
                  <div>Phyto: {{ activeHorizon().grandTraditions.naturopathic.botanicalPhytotherapy }}</div>
                </div>
              </div>

              <!-- Pricing & Safety Reminder -->
              <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-200/90 leading-relaxed">
                <strong>Respectful Pricing Benchmark:</strong> {{ activeHorizon().pricing.genericPharmacyBenchmark }}
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                (click)="copyPrepSheetText()"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
                <span>{{ copiedText() ? '✓ Copied to Clipboard!' : '📋 Copy Text' }}</span>
              </button>
              <button
                (click)="printPrepSheet()"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md">
                <span>🖨️ Print Dossier</span>
              </button>
              <button
                (click)="togglePrepSheetModal(false)"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LifeCourseScreeningNavigatorComponent {
  private patientState = inject(PatientStateService);

  readonly horizons = LIFE_COURSE_HORIZONS;
  readonly traditionsMetadata = TRADITIONS_METADATA;

  // Selected decade horizon ID ('horizon-1' through 'horizon-6')
  readonly selectedHorizonId = signal<string>('horizon-1');

  // Active view tab ('all' | 'screenings' | 'grand-traditions' | 'scanxiety-pricing')
  readonly activeView = signal<'all' | 'screenings' | 'grand-traditions' | 'scanxiety-pricing'>('all');

  // Tradition category filter ('all' | 'licensed' | 'ancient' | 'systems')
  readonly traditionFilter = signal<'all' | 'licensed' | 'ancient' | 'systems'>('all');

  // Modal state
  readonly showPrepSheetModal = signal<boolean>(false);
  readonly copiedText = signal<boolean>(false);

  // Patient age from centralized service
  readonly patientAge = computed(() => this.patientState.patientAge() || 38);

  readonly patientAgeDisplay = computed(() => {
    const age = this.patientAge();
    return age > 0 ? `${age} years old` : 'Age 38 (Simulated Baseline)';
  });

  // Automatically computed recommended horizon based on patient age
  readonly autoRecommendedHorizonId = computed(() => {
    const age = this.patientAge();
    if (age <= 29) return 'horizon-1';
    if (age <= 39) return 'horizon-2';
    if (age <= 44) return 'horizon-3';
    if (age <= 59) return 'horizon-4';
    if (age <= 74) return 'horizon-5';
    return 'horizon-6';
  });

  // Active horizon data object
  readonly activeHorizon = computed(() => {
    const currentId = this.selectedHorizonId();
    return this.horizons.find(h => h.id === currentId) || this.horizons[0];
  });

  // Backward compatibility accessors
  readonly quadParadigm = computed(() => this.activeHorizon().grandTraditions);
  readonly triParadigm = computed(() => this.activeHorizon().grandTraditions);

  constructor() {
    // Initialize selected horizon based on patient's current age
    const recId = this.autoRecommendedHorizonId();
    this.selectedHorizonId.set(recId);
  }

  selectHorizon(id: string): void {
    this.selectedHorizonId.set(id);
  }

  isPatientCurrentDecade(horizon: ILifeCourseHorizon): boolean {
    const age = this.patientAge();
    return age >= horizon.minAge && age <= horizon.maxAge;
  }

  shouldShowTradition(key: TTraditionKey): boolean {
    const filter = this.traditionFilter();
    if (filter === 'all') return true;

    const meta = this.traditionsMetadata.find(m => m.key === key);
    if (!meta) return true;

    return meta.category === filter;
  }

  togglePrepSheetModal(open: boolean): void {
    this.showPrepSheetModal.set(open);
    if (!open) {
      this.copiedText.set(false);
    }
  }

  copyPrepSheetText(): void {
    const horizon = this.activeHorizon();
    const ageText = this.patientAgeDisplay();

    const questionsFormatted = horizon.physicianQuestions
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join('\n');

    const screeningsFormatted = horizon.screenings
      .map(s => `- ${s.name} (${s.frequency})`)
      .join('\n');

    const textToCopy = `=== POCKETGULL LIFE-COURSE MULTI-TRADITION PREP SHEET ===
Patient Demographic: ${ageText}
Target Epoch: ${horizon.decade} (${horizon.title})

[THREE HIGH-YIELD CLINICIAN QUESTIONS]
${questionsFormatted}

[EVIDENCE-BASED SCREENING PRIORITIES]
${screeningsFormatted}

[MULTI-TRADITION CLINICAL ALIGNMENT]
- Allopathic (MD): ${horizon.grandTraditions.allopathic.title}
- Osteopathic (DO): Somatic Segment: ${horizon.grandTraditions.osteopathic.somaticFocus} | OMT: ${horizon.grandTraditions.osteopathic.omtSelfCare}
- Naturopathic (ND): Phyto: ${horizon.grandTraditions.naturopathic.botanicalPhytotherapy}
- Functional Systems: Focus: ${horizon.grandTraditions.functional.networkBiologyFocus}
- TCM Zang-Fu: Channel: ${horizon.grandTraditions.tcm.organMeridian}
- Ayurvedic: Dosha: ${horizon.grandTraditions.ayurvedic.doshaEpoch} | Dhatu: ${horizon.grandTraditions.ayurvedic.dhatuFocus}
- Unani-Tibb: Humor: ${horizon.grandTraditions.unani.humoralFocus} | Regimen: ${horizon.grandTraditions.unani.regimenalGuidance}
- Chronobiology: Zeitgeber: ${horizon.grandTraditions.chronobiology.zeitgeberAction}

[RESPECTFUL PRICING BENCHMARK]
Generic Benchmark: ${horizon.pricing.genericPharmacyBenchmark}
Cash Advice: ${horizon.pricing.cashNavigationAdvice}

[SAFETY & BIAS GUARD]
${horizon.scanxiety.goldenRule}
==========================================================`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.copiedText.set(true);
        setTimeout(() => this.copiedText.set(false), 3000);
      });
    }
  }

  printPrepSheet(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
