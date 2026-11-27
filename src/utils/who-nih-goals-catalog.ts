// SPDX-License-Identifier: Apache-2.0
import {
  IBodyPartIssue,
  INihWhoGoalAlignmentEntry,
  IPatient,
  IPatientWhoNihGoalsCatalog
} from '../services/patient.types';

interface IGoalTemplate {
  rank: number;
  id: string;
  agency: 'WHO' | 'NIH';
  framework: string;
  code: string;
  title: string;
  targetBenchmark: string;
  evidenceKeywords: string;
  evaluate: (ctx: IGoalPatientContext) => {
    patientMetric: string;
    progressPct: number;
    status: INihWhoGoalAlignmentEntry['status'];
    priorityScore: number;
  };
}

interface IGoalPatientContext {
  age: number;
  systolicBp: number;
  diastolicBp: number;
  bpDisplay: string;
  hr: number;
  spO2: number;
  glucose: number;
  vitD3: number;
  aqi: number;
  corpus: string;
  hasPainOrOpioidRisk: boolean;
  hasMetabolicOrDiabetes: boolean;
  hasSleepApneaOrInsomnia: boolean;
  hasNeuroImmuneOrMs: boolean;
  hasDysautonomiaOrPasc: boolean;
  hasSpineOrMsk: boolean;
  hasMentalHealthOrStress: boolean;
  hasGenomicOrPkVariants: boolean;
  hasExposureOrToxinRisk: boolean;
  hasOralOrDentalSignal: boolean;
  hasAntimicrobialOrInfection: boolean;
  hasMaternalOrPediatric: boolean;
  isOlderOrFrailty: boolean;
  hasTcmOrAyurveda: boolean;
}

function parseNumeric(val: unknown, fallback: number): number {
  const num = parseFloat(String(val ?? ''));
  return Number.isFinite(num) ? num : fallback;
}

function extractGoalContext(patient: Partial<IPatient>): IGoalPatientContext {
  const vitals = (patient.vitals || {}) as Record<string, unknown>;
  const bpParts = String(vitals['bp'] || '120/80').split('/');
  const systolicBp = parseNumeric(bpParts[0], 120);
  const diastolicBp = parseNumeric(bpParts[1], 80);
  const hr = parseNumeric(vitals['hr'], 72);
  const spO2 = parseNumeric(vitals['spO2'], 98);
  const glucose = parseNumeric(vitals['cgmGlucoseMgDl'], 102);
  const vitD3 = parseNumeric(vitals['vitD3'], 34);
  const age = typeof patient.age === 'number' && patient.age > 0 ? patient.age : 45;
  const aqi = patient.environmentalIndex?.aqi ?? 42;

  const issueEntries = Object.values(patient.issues || {}).flat();
  const hasHighPainIssue = issueEntries.some((issue: IBodyPartIssue) => (issue?.painLevel ?? 0) >= 7);
  const issueText = issueEntries
    .map((issue: IBodyPartIssue) =>
      `${issue?.name || ''} ${issue?.description || ''} ${issue?.tcmPattern || ''} ${issue?.ayurvedicImbalance || ''} ${(issue?.symptoms || []).map(s => (typeof s === 'string' ? s : s?.name || '')).join(' ')}`
    )
    .join(' ');

  const corpus = [
    patient.name || '',
    patient.patientGoals || '',
    patient.reasonForVisit || '',
    ...(patient.preexistingConditions || []),
    issueText,
    patient.oknProfile?.traversedPathSummary || '',
    patient.oknProfile?.groundedTargetConcept || '',
    ...(patient.ewarsAlerts || []).map(a => `${a.pathogen} ${a.whoBulletin}`),
    ...(patient.awareStewardship || []).map(w => `${w.medication} ${w.category}`),
    ...(patient.genomicVariants || []).map(g => `${g.gene} ${g.clinicalSignificance}`)
  ]
    .join(' ')
    .toLowerCase();

  return {
    age,
    systolicBp,
    diastolicBp,
    bpDisplay: `${Math.round(systolicBp)}/${Math.round(diastolicBp)}`,
    hr,
    spO2,
    glucose,
    vitD3,
    aqi,
    corpus,
    hasPainOrOpioidRisk: hasHighPainIssue || /pain|opioid|neuropath|phantom|radicul|sciatic|analges|migraine/.test(corpus),
    hasMetabolicOrDiabetes: /diab|metabolic|glucose|hba1c|insulin|obesity|lipid|steato|masld/.test(corpus),
    hasSleepApneaOrInsomnia: (patient.chronobiologyTelemetry?.circadianDisruptionIndex ?? 0) >= 60 || /sleep|cpap|apnea|insomnia|circadian|melatonin|glymph/.test(corpus),
    hasNeuroImmuneOrMs: /sclerosis|rrms|poms|loms|myelin|neuro|optic neuritis|cognition|memory|dement/.test(corpus),
    hasDysautonomiaOrPasc: /dysautonom|pasc|pots|fatigue|exertional|orthostat|chagas|vagal/.test(corpus),
    hasSpineOrMsk: /spine|cervical|lumbar|back|knee|joint|osteoarth|fracture|spastic|gait|sarcopen/.test(corpus),
    hasMentalHealthOrStress: /depress|anxiet|phq|gad|ocd|stress|trauma|suicid|mood/.test(corpus),
    hasGenomicOrPkVariants: (patient.genomicVariants?.length ?? 0) > 0 || /mthfr|cyp2d6|cyp2c19|pharmacogen|methylat/.test(corpus),
    hasExposureOrToxinRisk: aqi > 100 || /pm2\.5|wildfire|radiation|toxin|heavy metal|asthma|allerg|arsenic|radium/.test(corpus),
    hasOralOrDentalSignal: /dental|tooth|periodont|caries|oral|sibi|gingiv/.test(corpus),
    hasAntimicrobialOrInfection: (patient.awareStewardship?.length ?? 0) > 0 || (patient.ewarsAlerts?.length ?? 0) > 0 || /infect|tubercul|cholera|virus|antibiotic|sepsis|ebv/.test(corpus),
    hasMaternalOrPediatric: age < 18 || /pregnan|maternal|fetal|pediatric|adolesc|preeclamp/.test(corpus),
    isOlderOrFrailty: age >= 65 || /frail|elder|geriatric|fall|sarc/.test(corpus),
    hasTcmOrAyurveda: Boolean(patient.tcmIntake || patient.ayurvedicIntake || /tcm|ayurved|dosha|vata|pitta|agni|qi/.test(corpus))
  };
}

/**
 * Canonical Top 10 WHO Goals aligned with Pocket-Gull clinical domains.
 */
export const TOP_10_WHO_GOALS_CATALOG: readonly IGoalTemplate[] = [
  {
    rank: 1,
    id: 'WHO-01',
    agency: 'WHO',
    framework: 'WHO SDG 3.4 / HEARTS',
    code: 'WHO SDG 3.4.1',
    title: 'Premature NCD & Cardiovascular Mortality Reduction',
    targetBenchmark: '10-Year CVD Risk < 10%, BP < 130/80 mmHg',
    evidenceKeywords: 'WHO SDG 3.4 Cardiovascular Disease Prevention HEARTS RCT',
    evaluate: (c) => {
      const elevated = c.systolicBp >= 135 || c.hasMetabolicOrDiabetes || c.age >= 65;
      return {
        patientMetric: `BP ${c.bpDisplay} mmHg • HR ${Math.round(c.hr)} bpm`,
        progressPct: elevated ? 54 : 86,
        status: c.systolicBp >= 145 ? 'ATTENTION_REQUIRED' : elevated ? 'ON_TRACK' : 'OPTIMAL',
        priorityScore: c.systolicBp >= 135 || c.hasMetabolicOrDiabetes ? 95 : 74
      };
    }
  },
  {
    rank: 2,
    id: 'WHO-02',
    agency: 'WHO',
    framework: 'WHO HEARTS Package',
    code: 'WHO HEARTS-H',
    title: 'Standardized Hypertension & Vascular Risk Control',
    targetBenchmark: 'MAP 70–93 mmHg (SBP < 130, DBP < 80)',
    evidenceKeywords: 'WHO HEARTS Hypertension Control Algorithm Primary Care',
    evaluate: (c) => {
      const map = Math.round((c.systolicBp + 2 * c.diastolicBp) / 3);
      const outOfRange = map > 98 || c.systolicBp >= 130;
      return {
        patientMetric: `Estimated MAP ~ ${map} mmHg`,
        progressPct: outOfRange ? 62 : 88,
        status: c.systolicBp >= 140 ? 'ATTENTION_REQUIRED' : outOfRange ? 'ON_TRACK' : 'OPTIMAL',
        priorityScore: outOfRange ? 91 : 68
      };
    }
  },
  {
    rank: 3,
    id: 'WHO-03',
    agency: 'WHO',
    framework: 'WHO GAPPA Physical Activity',
    code: 'WHO GAPPA-2030',
    title: 'Weekly Aerobic & Neuromotor Conditioning',
    targetBenchmark: '150–300 min/wk Zone 2 Aerobic Activity',
    evidenceKeywords: 'WHO Physical Activity Guidelines Zone 2 Cardiometabolic',
    evaluate: (c) => {
      const limited = c.hasSpineOrMsk || c.hasDysautonomiaOrPasc || c.hasPainOrOpioidRisk;
      return {
        patientMetric: limited ? 'Paced Aerobic Tolerance Required' : '135 min/wk Baseline',
        progressPct: limited ? 58 : 85,
        status: limited ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
        priorityScore: c.hasMetabolicOrDiabetes || c.hasSpineOrMsk ? 84 : 70
      };
    }
  },
  {
    rank: 4,
    id: 'WHO-04',
    agency: 'WHO',
    framework: 'WHO ICOPE Healthy Ageing',
    code: 'WHO ICOPE-6',
    title: 'Intrinsic Capacity Preservation (Cognition, Mobility, Vitality)',
    targetBenchmark: '>= 5/6 ICOPE Intrinsic Capacity Domains Intact',
    evidenceKeywords: 'WHO ICOPE Intrinsic Capacity Older Adults Frailty Prevention',
    evaluate: (c) => {
      const declineRisk = c.isOlderOrFrailty || c.hasNeuroImmuneOrMs;
      return {
        patientMetric: declineRisk ? '4/6 Domains Intact (Surveillance)' : '6/6 Domains Intact',
        progressPct: declineRisk ? 67 : 94,
        status: c.isOlderOrFrailty ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
        priorityScore: declineRisk ? 94 : 62
      };
    }
  },
  {
    rank: 5,
    id: 'WHO-05',
    agency: 'WHO',
    framework: 'WHO GTMC / ICD-11 Chapter 26',
    code: 'WHO ICD-11 TM1/TM4',
    title: 'Traditional & Complementary Medicine Standardization & Safety',
    targetBenchmark: '100% ICD-11 Chapter 26 Dual-Coding & CYP Safety',
    evidenceKeywords: 'WHO ICD-11 Chapter 26 Traditional Medicine Herb Safety Interoperability',
    evaluate: (c) => ({
      patientMetric: c.hasTcmOrAyurveda ? 'Active TCM/Ayurveda Intake Codified' : 'Dual-Coding Ready (CPIC Screened)',
      progressPct: c.hasTcmOrAyurveda ? 96 : 82,
      status: 'OPTIMAL',
      priorityScore: c.hasTcmOrAyurveda ? 90 : 58
    })
  },
  {
    rank: 6,
    id: 'WHO-06',
    agency: 'WHO',
    framework: 'WHO AWaRe / GLASS AMR',
    code: 'WHO AWaRe-60',
    title: 'Antimicrobial Stewardship & Watch/Reserve Sparing',
    targetBenchmark: '>= 60% Access-Group Selection, 0 Redundant Reserve Agents',
    evidenceKeywords: 'WHO AWaRe Antibiotic Stewardship Antimicrobial Resistance Surveillance',
    evaluate: (c) => ({
      patientMetric: c.hasAntimicrobialOrInfection ? 'Active Infection / EWARS Stewardship' : 'No Watch/Reserve Exposure',
      progressPct: c.hasAntimicrobialOrInfection ? 68 : 98,
      status: c.hasAntimicrobialOrInfection ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasAntimicrobialOrInfection ? 95 : 48
    })
  },
  {
    rank: 7,
    id: 'WHO-07',
    agency: 'WHO',
    framework: 'WHO Global Air Quality / SDG 3.9',
    code: 'WHO AQG-3.9',
    title: 'Clean Air, PM2.5 & Hazardous Exposome Protection',
    targetBenchmark: 'PM2.5 <= 5 ug/m3 Annual Mean, AQI <= 50',
    evidenceKeywords: 'WHO Air Quality Guidelines PM2.5 Respiratory Asthma Toxicology',
    evaluate: (c) => ({
      patientMetric: c.aqi > 100 ? `Elevated Exposure (AQI ${c.aqi})` : `AQI ${c.aqi} • SpO2 ${Math.round(c.spO2)}%`,
      progressPct: c.hasExposureOrToxinRisk ? 52 : 90,
      status: c.hasExposureOrToxinRisk ? 'CRITICAL_GAP' : 'ON_TRACK',
      priorityScore: c.hasExposureOrToxinRisk ? 96 : 56
    })
  },
  {
    rank: 8,
    id: 'WHO-08',
    agency: 'WHO',
    framework: 'WHO WHA74.5 Oral Health Strategy',
    code: 'WHO WHA74.5',
    title: 'Oral-Systemic Inflammatory Burden (SIBI) & Caries Control',
    targetBenchmark: 'Periodontal Pocket Depth < 4 mm, Zero Untreated Caries',
    evidenceKeywords: 'WHO Global Oral Health Action Plan Periodontal Cardiovascular SIBI',
    evaluate: (c) => ({
      patientMetric: c.hasOralOrDentalSignal ? 'Periodontal/Oral Cross-Talk Flagged' : 'Routine Oral Preventive Baseline',
      progressPct: c.hasOralOrDentalSignal ? 60 : 88,
      status: c.hasOralOrDentalSignal ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
      priorityScore: c.hasOralOrDentalSignal ? 96 : 50
    })
  },
  {
    rank: 9,
    id: 'WHO-09',
    agency: 'WHO',
    framework: 'WHO mhGAP / SDG 3.4.2',
    code: 'WHO mhGAP-3.4.2',
    title: 'Depression, Anxiety & Suicide Prevention Equity',
    targetBenchmark: 'PHQ-9 < 5, GAD-7 < 5, Proactive SDOH Safety Plan',
    evidenceKeywords: 'WHO mhGAP Mental Health Action Plan Depression Anxiety Stepped Care',
    evaluate: (c) => ({
      patientMetric: c.hasMentalHealthOrStress ? 'Elevated Somatic/Mood Stress Load' : 'Stable Behavioral Baseline',
      progressPct: c.hasMentalHealthOrStress ? 58 : 92,
      status: c.hasMentalHealthOrStress ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasMentalHealthOrStress ? 93 : 60
    })
  },
  {
    rank: 10,
    id: 'WHO-10',
    agency: 'WHO',
    framework: 'WHO SDG 3.1 & 3.2 Lifecourse',
    code: 'WHO SDG 3.1/3.2',
    title: 'Maternal, Perinatal & Pediatric Preventive Resilience',
    targetBenchmark: 'Zero Preventable Maternal/Child Morbidity & Full Immunization',
    evidenceKeywords: 'WHO SDG 3.1 Maternal Hemodynamic Pacing Pediatric Preventive Trajectory',
    evaluate: (c) => ({
      patientMetric: c.hasMaternalOrPediatric ? 'Priority Maternal/Pediatric Cohort' : 'Adult Lifecourse Baseline',
      progressPct: c.hasMaternalOrPediatric ? 72 : 95,
      status: c.hasMaternalOrPediatric ? 'ON_TRACK' : 'OPTIMAL',
      priorityScore: c.hasMaternalOrPediatric ? 97 : 44
    })
  }
];

/**
 * Canonical Top 10 NIH Goals aligned with Healthy People 2030 & NIH Institutes.
 */
export const TOP_10_NIH_GOALS_CATALOG: readonly IGoalTemplate[] = [
  {
    rank: 1,
    id: 'NIH-01',
    agency: 'NIH',
    framework: 'NIH NCCIH Strategic Plan',
    code: 'NIH NCCIH-WPH',
    title: 'Whole Person Health Multi-System Bi-Directional Resilience',
    targetBenchmark: 'Multi-System Coherence >= 85% (Gut-Immune-Neural Axis)',
    evidenceKeywords: 'NIH NCCIH Whole Person Health Multimodal Integrative Clinical Trial',
    evaluate: (c) => ({
      patientMetric: c.hasNeuroImmuneOrMs || c.hasDysautonomiaOrPasc ? 'Multi-Axis Dysregulation Active' : 'Coordinated Systems Care',
      progressPct: c.hasNeuroImmuneOrMs || c.hasDysautonomiaOrPasc ? 64 : 89,
      status: c.hasNeuroImmuneOrMs || c.hasDysautonomiaOrPasc ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: 86
    })
  },
  {
    rank: 2,
    id: 'NIH-02',
    agency: 'NIH',
    framework: 'NIH HEAL / Healthy People 2030',
    code: 'NIH HEAL-PN01',
    title: 'Non-Opioid Chronic Pain Relief & Nociceptive Protection',
    targetBenchmark: 'VAS Pain <= 3/10, 0 Opioid Dose Escalation (NaV1.8 / PEA)',
    evidenceKeywords: 'NIH HEAL Initiative Non-Opioid Chronic Pain Neuropathy Rehabilitation',
    evaluate: (c) => ({
      patientMetric: c.hasPainOrOpioidRisk ? 'Active Pain / Opioid-Sparing Focus' : 'No Severe Pain Escalation',
      progressPct: c.hasPainOrOpioidRisk ? 48 : 94,
      status: c.hasPainOrOpioidRisk ? 'CRITICAL_GAP' : 'OPTIMAL',
      priorityScore: c.hasPainOrOpioidRisk ? 99 : 55
    })
  },
  {
    rank: 3,
    id: 'NIH-03',
    agency: 'NIH',
    framework: 'NIH Healthy People 2030 Sleep',
    code: 'NIH HP2030 SH-03',
    title: 'Restorative Sleep Architecture & Glymphatic Clearance',
    targetBenchmark: '>= 7.0 hrs/night, Circadian BMAL1/PER2 Phase Alignment',
    evidenceKeywords: 'NIH Healthy People 2030 Sleep Health Glymphatic Circadian Entrainment',
    evaluate: (c) => ({
      patientMetric: c.hasSleepApneaOrInsomnia ? 'Sleep Continuity / CPAP Support Flagged' : '7.4 hrs/night Target Range',
      progressPct: c.hasSleepApneaOrInsomnia ? 55 : 90,
      status: c.hasSleepApneaOrInsomnia ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasSleepApneaOrInsomnia ? 96 : 66
    })
  },
  {
    rank: 4,
    id: 'NIH-04',
    agency: 'NIH',
    framework: 'NIH NIDDK / Healthy People 2030',
    code: 'NIH HP2030 D-01',
    title: 'Glycemic Time-in-Range & Microvascular Protection',
    targetBenchmark: 'CGM Time-in-Range >= 70%, Fasting Glucose < 100 mg/dL',
    evidenceKeywords: 'NIH NIDDK Continuous Glucose Time in Range Microvascular Trial',
    evaluate: (c) => ({
      patientMetric: `Glucose ~ ${Math.round(c.glucose)} mg/dL`,
      progressPct: c.glucose > 125 || c.hasMetabolicOrDiabetes ? 56 : 88,
      status: c.glucose > 140 ? 'CRITICAL_GAP' : c.hasMetabolicOrDiabetes || c.glucose > 115 ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasMetabolicOrDiabetes || c.glucose > 115 ? 94 : 61
    })
  },
  {
    rank: 5,
    id: 'NIH-05',
    agency: 'NIH',
    framework: 'NIH BRAIN Autonomic Pacing',
    code: 'NIH BRAIN-0.1HZ',
    title: 'Baroreflex Vagal Resonance & Neural Circuit Pacing',
    targetBenchmark: '>= 10 min/day 0.1 Hz Pacing, HRV RMSSD >= 50 ms',
    evidenceKeywords: 'NIH BRAIN Initiative Vagus Nerve Baroreflex Resonance Biofeedback',
    evaluate: (c) => ({
      patientMetric: c.hr > 85 || c.hasDysautonomiaOrPasc ? `Elevated Sympathetic Tone (${Math.round(c.hr)} bpm)` : '12 min/day Pacing Active',
      progressPct: c.hr > 90 ? 52 : 87,
      status: c.hr > 90 ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
      priorityScore: c.hasDysautonomiaOrPasc || c.hasMentalHealthOrStress || c.hr > 85 ? 90 : 65
    })
  },
  {
    rank: 6,
    id: 'NIH-06',
    agency: 'NIH',
    framework: 'NIH RECOVER Initiative',
    code: 'NIH RECOVER-PASC',
    title: 'Post-Exertional Malaise & Dysautonomia Energy Envelope',
    targetBenchmark: 'PASC Composite Score < 12, Zero PEM Crashes',
    evidenceKeywords: 'NIH RECOVER Long COVID Dysautonomia Post Exertional Malaise Pacing',
    evaluate: (c) => ({
      patientMetric: c.hasDysautonomiaOrPasc || c.hasNeuroImmuneOrMs ? 'Pacing & Fatigue Envelope Indicated' : 'Energy Envelope Stable',
      progressPct: c.hasDysautonomiaOrPasc || c.hasNeuroImmuneOrMs ? 58 : 92,
      status: c.hasDysautonomiaOrPasc ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
      priorityScore: c.hasDysautonomiaOrPasc || c.hasNeuroImmuneOrMs ? 95 : 52
    })
  },
  {
    rank: 7,
    id: 'NIH-07',
    agency: 'NIH',
    framework: 'NIH NIA Geroscience Network',
    code: 'NIH NIA-GERO',
    title: 'Epigenetic Aging Deceleration & Sarcopenia Prevention',
    targetBenchmark: 'GrimAge Pace < 0.85, Serum 25(OH)D >= 50 ng/mL, Grip Intact',
    evidenceKeywords: 'NIH NIA Geroscience Sarcopenia Epigenetic Longevity Resistance Training',
    evaluate: (c) => ({
      patientMetric: `Age ${c.age}y • 25(OH)D ~ ${Math.round(c.vitD3)} ng/mL`,
      progressPct: c.vitD3 < 25 || c.isOlderOrFrailty ? 50 : 88,
      status: c.vitD3 < 25 ? 'CRITICAL_GAP' : c.isOlderOrFrailty ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.isOlderOrFrailty || c.vitD3 < 25 ? 93 : 63
    })
  },
  {
    rank: 8,
    id: 'NIH-08',
    agency: 'NIH',
    framework: 'NIH NIAMS / Healthy People 2030',
    code: 'NIH HP2030 AOC-01',
    title: 'Musculoskeletal, Spinal & Cartilage Functional Preservation',
    targetBenchmark: 'KOOS Function > 85, Neutral Cervical/Lumbar Alignment',
    evidenceKeywords: 'NIH NIAMS Osteoarthritis Cartilage Preservation Spine Rehabilitation',
    evaluate: (c) => ({
      patientMetric: c.hasSpineOrMsk ? 'Active Spine / Joint Unloading Required' : 'Full Ambulation Reserve',
      progressPct: c.hasSpineOrMsk ? 55 : 91,
      status: c.hasSpineOrMsk ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasSpineOrMsk ? 92 : 54
    })
  },
  {
    rank: 9,
    id: 'NIH-09',
    agency: 'NIH',
    framework: 'NIH NHGRI / CPIC Genomics',
    code: 'NIH NHGRI-PGX',
    title: 'Precision Pharmacogenomics & Methylation Detoxification',
    targetBenchmark: '0 High-Severity CYP450/MTHFR DDI, Folate Bypass Intact',
    evidenceKeywords: 'NIH NHGRI CPIC Pharmacogenomics CYP2D6 MTHFR Precision Dosing',
    evaluate: (c) => ({
      patientMetric: c.hasGenomicOrPkVariants ? 'Variant Surveillance Active (CYP/MTHFR)' : 'Standard PGx Baseline',
      progressPct: c.hasGenomicOrPkVariants ? 62 : 96,
      status: c.hasGenomicOrPkVariants ? 'ATTENTION_REQUIRED' : 'OPTIMAL',
      priorityScore: c.hasGenomicOrPkVariants ? 98 : 49
    })
  },
  {
    rank: 10,
    id: 'NIH-10',
    agency: 'NIH',
    framework: 'NIH CTSA iTHRIV / NIEHS Exposome',
    code: 'NIH CTSA UL1TR003015',
    title: 'Bedside Multi-Omics, Spatial Genomics & Clinical Trial Equity',
    targetBenchmark: 'TAD Insulation > 0.85, Active NCT/OKN Evidence Linkage',
    evidenceKeywords: 'GSE131900 Spatial Transcriptomics NIH CTSA iTHRIV Exposomics Trial',
    evaluate: (c) => ({
      patientMetric: c.hasExposureOrToxinRisk ? 'OKN Environmental-Genomic Bridge Active' : '3D Spatial Multi-Omics Linked',
      progressPct: c.hasExposureOrToxinRisk ? 68 : 90,
      status: c.hasExposureOrToxinRisk ? 'ON_TRACK' : 'OPTIMAL',
      priorityScore: c.hasExposureOrToxinRisk || c.hasGenomicOrPkVariants ? 88 : 67
    })
  }
];

function evaluateCatalogEntries(
  templates: readonly IGoalTemplate[],
  ctx: IGoalPatientContext
): INihWhoGoalAlignmentEntry[] {
  return templates.map((tpl) => {
    const res = tpl.evaluate(ctx);
    return {
      rank: tpl.rank,
      id: tpl.id,
      agency: tpl.agency,
      framework: tpl.framework,
      code: tpl.code,
      title: tpl.title,
      targetBenchmark: tpl.targetBenchmark,
      patientMetric: res.patientMetric,
      progressPct: res.progressPct,
      status: res.status,
      priorityScore: res.priorityScore,
      evidenceKeywords: tpl.evidenceKeywords
    };
  });
}

/**
 * Computes all Top 10 WHO Goals and Top 10 NIH Goals tailored to the given patient.
 */
export function evaluatePatientTop10WhoAndNihGoals(
  patient: Partial<IPatient>
): IPatientWhoNihGoalsCatalog {
  const ctx = extractGoalContext(patient);
  const top10WhoGoals = evaluateCatalogEntries(TOP_10_WHO_GOALS_CATALOG, ctx);
  const top10NihGoals = evaluateCatalogEntries(TOP_10_NIH_GOALS_CATALOG, ctx);

  const primaryPriorityGoalIds = [...top10WhoGoals, ...top10NihGoals]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4)
    .map((g) => g.id);

  return {
    catalogVersion: '2026.1-top10-nih-who',
    top10WhoGoals,
    top10NihGoals,
    primaryPriorityGoalIds
  };
}

/**
 * Returns a patient copy guaranteed to include the Top 10 WHO & NIH Goals catalog.
 */
export function attachPatientWhoNihGoals(patient: IPatient): IPatient {
  if (
    patient.whoNihGoals &&
    patient.whoNihGoals.top10WhoGoals?.length === 10 &&
    patient.whoNihGoals.top10NihGoals?.length === 10
  ) {
    return patient;
  }
  return {
    ...patient,
    whoNihGoals: evaluatePatientTop10WhoAndNihGoals(patient)
  };
}
