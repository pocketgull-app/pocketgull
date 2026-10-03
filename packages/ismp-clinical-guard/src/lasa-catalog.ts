// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { ILasaDrugPair } from './types.js';

/**
 * Canonical LASA High-Risk Pairs Catalog with In-Depth Clinical Knowledge
 */
export const CANONICAL_LASA_PAIRS: ReadonlyArray<ILasaDrugPair> = [
  {
    id: 'lasa-vinblastine-vincristine',
    category: 'ONCOLOGY',
    drugA: {
      name: 'vinblastine',
      tallMan: 'vinBLAStine',
      indication: 'Hodgkin lymphoma, advanced testicular cancer, Kaposi sarcoma',
      pharmacologicalClass: 'Vinca alkaloid microtubule inhibitor',
      typicalDose: '3.7 to 7.4 mg/m² IV weekly (Dosed by body surface area)',
      route: 'Intravenous (IV) infusion ONLY',
      boxedWarning: 'Severe dose-limiting myelosuppression / leukopenia. Fatal if extravasated.'
    },
    drugB: {
      name: 'vincristine',
      tallMan: 'vinCRIStine',
      indication: 'Acute lymphoblastic leukemia (ALL), non-Hodgkin lymphoma, pediatric Wilms tumor',
      pharmacologicalClass: 'Vinca alkaloid microtubule inhibitor',
      typicalDose: '1.4 to 2.0 mg/m² IV weekly (STRICT 2.0 mg single-dose cap to prevent fatal neurotoxicity)',
      route: 'Intravenous (IV) infusion ONLY',
      boxedWarning: 'FATAL IF GIVEN INTRATHECALLY. For intravenous use only. Severe sensorimotor peripheral neuropathy and paralytic ileus.'
    },
    confusionMechanism: 'Identical prefix "vin-", same chemical family, but completely different dosing ranges, toxicities, and dose caps.',
    fatalRiskSummary: 'Intrathecal administration of vincristine or substituting vincristine for vinblastine leads to ascending chemical encephalomyeloradiculopathy, irreversible neurological paralysis, and patient demise.'
  },
  {
    id: 'lasa-hydralazine-hydroxyzine',
    category: 'CARDIOVASCULAR',
    drugA: {
      name: 'hydralazine',
      tallMan: 'hydrALAZINE',
      indication: 'Severe essential hypertension, hypertensive crisis, congestive heart failure adjunct',
      pharmacologicalClass: 'Direct arteriolar vasodilator / Antihypertensive',
      typicalDose: '10 to 50 mg PO QID; 10 to 40 mg IV/IM in emergency',
      route: 'Oral / IV / IM',
      boxedWarning: 'Drug-induced systemic lupus erythematosus (SLE)-like syndrome with high cumulative doses.'
    },
    drugB: {
      name: 'hydroxyzine',
      tallMan: 'hydrOXYzine',
      indication: 'Anxiety, tension, psychomotor agitation, histamine-mediated pruritus, pre-op sedation',
      pharmacologicalClass: 'First-generation H1-receptor inverse agonist / anxiolytic',
      typicalDose: '25 to 100 mg PO TID or QID',
      route: 'Oral / IM (NEVER IV/subQ — risk of severe tissue necrosis)',
      boxedWarning: 'Severe drowsiness, QT prolongation / Torsades de Pointes risk.'
    },
    confusionMechanism: 'Phonetic similarity of prefixes and suffixes. Administering hydralazine for anxiety causes acute, life-threatening hypotension and syncope.',
    fatalRiskSummary: 'Administering hydralazine instead of hydroxyzine triggers profound hemodynamic collapse and reflex tachycardia. Administering hydroxyzine during a hypertensive emergency results in untreated cerebral hemorrhage.'
  },
  {
    id: 'lasa-cisplatin-carboplatin',
    category: 'ONCOLOGY',
    drugA: {
      name: 'cisplatin',
      tallMan: 'CISplatin',
      indication: 'Bladder, testicular, ovarian, non-small cell lung cancer',
      pharmacologicalClass: 'Platinum-based DNA cross-linking alkylating-like agent',
      typicalDose: '50 to 100 mg/m² IV every 3 to 4 weeks (Requires vigorous pre/post-hydration)',
      route: 'Intravenous (IV)',
      boxedWarning: 'Severe cumulative nephrotoxicity, ototoxicity, and profound emetogenicity.'
    },
    drugB: {
      name: 'carboplatin',
      tallMan: 'carboPLATIN',
      indication: 'Ovarian carcinoma, small cell lung cancer, head and neck carcinoma',
      pharmacologicalClass: 'Second-generation platinum analog',
      typicalDose: 'Dosed by Calvert formula: Target AUC (mg/mL·min) × (GFR + 25)',
      route: 'Intravenous (IV)',
      boxedWarning: 'Severe dose-limiting bone marrow suppression (thrombocytopenia).'
    },
    confusionMechanism: 'Platinum chemotherapy naming similarity. Calvert formula dosing cannot be applied to cisplatin without causing fatal acute renal tubular necrosis.',
    fatalRiskSummary: 'Administering carboplatin doses (hundreds of mg) with cisplatin leads to irreversible multi-organ failure, deafness, and lethal renal cortical necrosis.'
  },
  {
    id: 'lasa-doxorubicin-daunorubicin',
    category: 'ONCOLOGY',
    drugA: {
      name: 'doxorubicin',
      tallMan: 'DOXOrubicin',
      indication: 'Breast cancer, sarcomas, Hodgkin/non-Hodgkin lymphoma, solid tumors',
      pharmacologicalClass: 'Anthracycline topoisomerase II inhibitor',
      typicalDose: '60 to 75 mg/m² IV every 21 days (Cumulative lifetime cap: 550 mg/m²)',
      route: 'Intravenous (IV)',
      boxedWarning: 'Irreversible dose-dependent cardiomyopathy, heart failure, and severe tissue vesicant necrosis.'
    },
    drugB: {
      name: 'daunorubicin',
      tallMan: 'DAUNOrubicin',
      indication: 'Acute myeloid leukemia (AML) and acute lymphocytic leukemia (ALL)',
      pharmacologicalClass: 'Anthracycline topoisomerase II inhibitor',
      typicalDose: '45 to 60 mg/m² IV daily for 3 days (remission induction)',
      route: 'Intravenous (IV)',
      boxedWarning: 'Severe myelosuppression and cumulative cardiotoxicity.'
    },
    confusionMechanism: 'Anthracycline suffix "-rubicin" and "red devil" coloration leads to interchangeable dispensing errors.',
    fatalRiskSummary: 'Exceeding lifetime cumulative anthracycline limits causes refractory dilated cardiomyopathy and cardiac mortality.'
  },
  {
    id: 'lasa-glipizide-glyburide',
    category: 'ENDOCRINE',
    drugA: {
      name: 'glipizide',
      tallMan: 'glipiZIDE',
      indication: 'Type 2 Diabetes Mellitus',
      pharmacologicalClass: 'Second-generation sulfonylurea',
      typicalDose: '2.5 to 20 mg PO daily or BID (Preferred in mild-to-moderate CKD)',
      route: 'Oral (PO)',
      boxedWarning: 'Hypoglycemia risk.'
    },
    drugB: {
      name: 'glyburide',
      tallMan: 'glyBURIDE',
      indication: 'Type 2 Diabetes Mellitus',
      pharmacologicalClass: 'Second-generation sulfonylurea with active renally cleared metabolites',
      typicalDose: '1.25 to 20 mg PO daily (Contraindicated in elderly/CKD due to prolonged half-life)',
      route: 'Oral (PO)',
      boxedWarning: 'Prolonged, refractory hypoglycemia requiring multi-day dextrose infusions.'
    },
    confusionMechanism: 'First syllable "gl-", same drug class, but glyburide accumulates dangerously in elderly patients with reduced GFR.',
    fatalRiskSummary: 'Inadvertently dispensing glyburide to a frail elderly patient triggers protracted hypoglycemia resulting in anoxic brain injury or death.'
  },
  {
    id: 'lasa-clonidine-clozapine',
    category: 'PSYCHIATRIC',
    drugA: {
      name: 'clonidine',
      tallMan: 'cloNIDine',
      indication: 'Hypertension, ADHD, opioid withdrawal, Tourette syndrome',
      pharmacologicalClass: 'Central alpha-2 adrenergic agonist',
      typicalDose: '0.1 to 0.3 mg PO BID/TID or transdermal patch',
      route: 'Oral / Transdermal',
      boxedWarning: 'Severe rebound hypertensive crisis if stopped abruptly.'
    },
    drugB: {
      name: 'clozapine',
      tallMan: 'cloZAPine',
      indication: 'Treatment-resistant schizophrenia, suicidal behavior reduction',
      pharmacologicalClass: 'Second-generation atypical antipsychotic',
      typicalDose: '12.5 to 450 mg PO daily (Mandatory REMS absolute neutrophil count tracking)',
      route: 'Oral (PO)',
      boxedWarning: 'Fatal agranulocytosis, myocarditis, orthostatic collapse, and seizures.'
    },
    confusionMechanism: 'Shared prefix "clo-" and suffix "-ine". Dosing differs by a factor of 1,000 (milligrams vs fractions of a milligram).',
    fatalRiskSummary: 'Dosing clonidine at clozapine doses causes catastrophic bradycardia, coma, and hemodynamic collapse. Dosing clozapine at clonidine doses causes psychotic decompensation.'
  },
  {
    id: 'lasa-bupropion-buspirone',
    category: 'PSYCHIATRIC',
    drugA: {
      name: 'bupropion',
      tallMan: 'buPROPrion',
      indication: 'Major depressive disorder, seasonal affective disorder, smoking cessation (Zyban)',
      pharmacologicalClass: 'Norepinephrine-dopamine reuptake inhibitor (NDRI)',
      typicalDose: '150 to 300 mg PO daily (Max 450 mg/day)',
      route: 'Oral (PO)',
      boxedWarning: 'Dose-dependent grand mal seizures; contraindicated in bulimia/anorexia.'
    },
    drugB: {
      name: 'buspirone',
      tallMan: 'busPIRone',
      indication: 'Generalized anxiety disorder (GAD)',
      pharmacologicalClass: '5-HT1A receptor partial agonist',
      typicalDose: '7.5 to 30 mg PO BID (Max 60 mg/day)',
      route: 'Oral (PO)',
      boxedWarning: 'No abuse potential; 2-4 weeks required for therapeutic onset.'
    },
    confusionMechanism: 'Starting with "bu-" and ending with "-one". Dosing ranges overlap partially (15-30 mg vs 150-300 mg).',
    fatalRiskSummary: 'Prescribing bupropion at excessive frequency or for anxiety without seizure screening can precipitate status epilepticus.'
  },
  {
    id: 'lasa-hydromorphone-morphine',
    category: 'ANALGESIC',
    drugA: {
      name: 'hydromorphone',
      tallMan: 'HYDROmorphone',
      indication: 'Moderate to severe acute pain (Dilaudid)',
      pharmacologicalClass: 'Potent semisynthetic pure mu-opioid agonist',
      typicalDose: '0.2 to 1 mg IV every 2 to 3 hours (7x more potent than morphine)',
      route: 'IV / PO / IM',
      boxedWarning: 'High risk of fatal respiratory depression when administered at morphine doses.'
    },
    drugB: {
      name: 'morphine',
      tallMan: 'morPHINE',
      indication: 'Severe acute and chronic pain, myocardial infarction analgesia, dyspnea in palliative care',
      pharmacologicalClass: 'Phenanthrene alkaloid mu-opioid agonist',
      typicalDose: '2 to 5 mg IV every 3 to 4 hours',
      route: 'IV / PO / IM',
      boxedWarning: 'Respiratory depression, hypotension, histamine release.'
    },
    confusionMechanism: 'Shared root word "morphine". Hydromorphone is roughly 5 to 7 times more potent milligram-for-milligram than morphine.',
    fatalRiskSummary: 'Accidentally administering 4 mg of hydromorphone assuming it is 4 mg of morphine is equivalent to ~28 mg of morphine, causing immediate apnea, cyanosis, and cardiac arrest.'
  },
  {
    id: 'lasa-tramadol-trazodone',
    category: 'ANALGESIC',
    drugA: {
      name: 'tramadol',
      tallMan: 'traMADol',
      indication: 'Moderate to moderately severe pain',
      pharmacologicalClass: 'Dual-action: weak mu-opioid agonist and SNRI',
      typicalDose: '50 to 100 mg PO every 4 to 6 hours (Max 400 mg/day)',
      route: 'Oral (PO)',
      boxedWarning: 'Serotonin syndrome, seizure induction, addiction potential.'
    },
    drugB: {
      name: 'trazodone',
      tallMan: 'traZODone',
      indication: 'Major depressive disorder, refractory insomnia (off-label)',
      pharmacologicalClass: 'Serotonin antagonist and reuptake inhibitor (SARI)',
      typicalDose: '25 to 100 mg PO at bedtime for sleep; 150 to 400 mg for depression',
      route: 'Oral (PO)',
      boxedWarning: 'Severe orthostatic hypotension, sedation, and priapism.'
    },
    confusionMechanism: 'Starting with "tra-" and ending with "-one/-ol". Both frequently dosed at 50 mg.',
    fatalRiskSummary: 'Dispensing tramadol for insomnia risks opioid dependence and daytime sedation; dispensing trazodone for surgical pain leaves post-op trauma unmanaged.'
  },
  {
    id: 'lasa-nicardipine-nifedipine',
    category: 'CARDIOVASCULAR',
    drugA: {
      name: 'nicardipine',
      tallMan: 'niCARdipine',
      indication: 'Acute hypertensive emergency, acute ischemic stroke BP reduction, subarachnoid hemorrhage',
      pharmacologicalClass: 'Short-acting intravenous dihydropyridine calcium channel blocker',
      typicalDose: '5 mg/hr continuous IV infusion, titrated by 2.5 mg/hr (Cardene)',
      route: 'Intravenous (IV) infusion ONLY',
      boxedWarning: 'Phlebitis with peripheral lines; requires central or dedicated large vein.'
    },
    drugB: {
      name: 'nifedipine',
      tallMan: 'NIFEdipine',
      indication: 'Chronic stable angina, vasospastic angina, chronic hypertension',
      pharmacologicalClass: 'Oral dihydropyridine calcium channel blocker (Procardia XL)',
      typicalDose: '30 to 90 mg PO daily (Extended-release)',
      route: 'Oral (PO)',
      boxedWarning: 'Immediate-release sublingual nifedipine is STRICTLY BANNED in acute HTN (causes stroke/MI).'
    },
    confusionMechanism: 'Identical dihydropyridine suffix "-dipine" with single-syllable root variance.',
    fatalRiskSummary: 'Confusion between IV titration protocols and oral extended-release forms results in either uncontrolled cerebral ischemia or refractory shock.'
  },
  {
    id: 'lasa-lamivudine-lamotrigine',
    category: 'PSYCHIATRIC',
    drugA: {
      name: 'lamivudine',
      tallMan: 'LAMIvudine',
      indication: 'HIV-1 infection, chronic hepatitis B virus (HBV)',
      pharmacologicalClass: 'Nucleoside reverse transcriptase inhibitor (NRTI / Epivir)',
      typicalDose: '150 to 300 mg PO daily',
      route: 'Oral (PO)',
      boxedWarning: 'Lactic acidosis, severe hepatomegaly with steatosis, post-treatment HBV flare.'
    },
    drugB: {
      name: 'lamotrigine',
      tallMan: 'LAMOtrigine',
      indication: 'Epilepsy (partial/tonic-clonic seizures), Bipolar I disorder maintenance',
      pharmacologicalClass: 'Voltage-gated sodium channel inhibitor / glutamate release reducer (Lamictal)',
      typicalDose: '25 mg daily initial titration, escalating slowly to 100-200 mg daily',
      route: 'Oral (PO)',
      boxedWarning: 'Toxic epidermal necrolysis (TEN) and Stevens-Johnson syndrome (SJS) if titrated too rapidly.'
    },
    confusionMechanism: 'Starting with "lam-" and ending with "-ine". Dispensing lamotrigine without gradual step-up triggers dermatologic mortality.',
    fatalRiskSummary: 'Prescribing lamotrigine at target HIV doses (150-300 mg) without 6-week slow titration precipitates fatal Stevens-Johnson syndrome.'
  }
];
