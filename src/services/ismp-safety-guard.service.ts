// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { Injectable } from '@angular/core';

export interface ILasaDrugProfile {
  name: string;
  tallMan: string;
  indication: string;
  pharmacologicalClass: string;
  typicalDose: string;
  route: string;
  boxedWarning?: string;
}

export interface ILasaDrugPair {
  id: string;
  category: 'ONCOLOGY' | 'CARDIOVASCULAR' | 'ENDOCRINE' | 'PSYCHIATRIC' | 'ANALGESIC' | 'ANTIMICROBIAL' | 'HEMATOLOGY_CRITICAL';
  drugA: ILasaDrugProfile;
  drugB: ILasaDrugProfile;
  confusionMechanism: string;
  fatalRiskSummary: string;
}

export interface ILasaTrainingCard {
  id: string;
  category: string;
  promptScenario: string;
  prescribedDrug: string;
  confusableDrug: string;
  tallManA: string;
  tallManB: string;
  indicationA: string;
  indicationB: string;
  clinicalTrapExplanation: string;
  criticalSafetyWarning?: string;
}

export interface IIsmpViolation {
  type: 'TRAILING_ZERO' | 'NAKED_DECIMAL' | 'ERROR_PRONE_ABBREVIATION' | 'LOOK_ALIKE_SOUND_ALIKE';
  original: string;
  corrected: string;
  rule: string;
  severity: 'HIGH_RISK_WARNING' | 'CRITICAL_SAFETY_DEFECT' | 'ADVISORY';
  lasaPair?: ILasaDrugPair;
  confusableWith?: string;
  clinicalDisambiguation?: string;
}

export interface IIsmpSafetyAudit {
  originalText: string;
  sanitizedText: string;
  hasViolations: boolean;
  violations: IIsmpViolation[];
  tallManApplied: string[];
  isSafe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IsmpSafetyGuardService {
  /**
   * FDA / ISMP Official Tall Man Lettering Map for Look-Alike / Sound-Alike (LASA) medications.
   * Key: Lowercase normalized drug name
   * Value: Official ISMP Tall Man formatted name
   */
  private readonly TALL_MAN_MAP: ReadonlyMap<string, string> = new Map([
    // Oncology & Chemotherapy (Highest Mortality Confusion Pairs)
    ['vinblastine', 'vinBLAStine'],
    ['vincristine', 'vinCRIStine'],
    ['vinorelbine', 'vinorELBINE'],
    ['cisplatin', 'CISplatin'],
    ['carboplatin', 'carboPLATIN'],
    ['doxorubicin', 'DOXOrubicin'],
    ['daunorubicin', 'DAUNOrubicin'],
    ['epirubicin', 'epiRUBICIN'],
    ['idarubicin', 'iDARUBICIN'],
    ['paclitaxel', 'PACLitaxel'],
    ['docetaxel', 'DOCEtaxel'],
    ['mitomycin', 'mitoMYCIN'],
    ['mitoxantrone', 'mitoXANTRONE'],
    ['azacitidine', 'azaCITIDine'],
    ['azathioprine', 'azaTHIOprine'],

    // Cardiovascular & Vasodilators
    ['hydralazine', 'hydrALAZINE'],
    ['hydroxyzine', 'hydrOXYzine'],
    ['amiodarone', 'amioDARONE'],
    ['amlodipine', 'amLODIPine'],
    ['nicardipine', 'niCARdipine'],
    ['nifedipine', 'NIFEdipine'],
    ['nimodipine', 'NIMOdipine'],
    ['diltiazem', 'diltiaZEM'],
    ['diazepam', 'diaZEPAM'],
    ['propranolol', 'propraNOLOL'],
    ['atenolol', 'atenOLOL'],
    ['lisinopril', 'lisinOPRIL'],
    ['enalapril', 'enalAPRIL'],
    ['losartan', 'loSARtan'],
    ['valsartan', 'valSARtan'],
    ['dobutamine', 'DOBUTamine'],
    ['dopamine', 'DOPamine'],
    ['ephedrine', 'ePHEDrine'],
    ['epinephrine', 'EPINEPHrine'],

    // Antidiabetic & Metabolic
    ['glipizide', 'glipiZIDE'],
    ['glyburide', 'glyBURIDE'],
    ['acetohexamide', 'acetoHEXAMIDE'],
    ['acetazolamide', 'acetaZOLAMIDE'],
    ['tolbutamide', 'TOLBUTamide'],
    ['tolazamide', 'TOLAZamide'],
    ['metformin', 'metFORMIN'],
    ['metronidazole', 'metroNIDAZOLE'],

    // Psychiatric & Neurological
    ['alprazolam', 'ALPRAZolam'],
    ['lorazepam', 'LORazepam'],
    ['clonazepam', 'clonazePAM'],
    ['clonidine', 'cloNIDine'],
    ['clozapine', 'cloZAPine'],
    ['olanzapine', 'OLANZapine'],
    ['quetiapine', 'queTIAPine'],
    ['risperidone', 'risperiDONE'],
    ['ropinirole', 'ropiniROLE'],
    ['bupropion', 'buPROPrion'],
    ['buspirone', 'busPIRone'],
    ['fluoxetine', 'FLUoxetine'],
    ['duloxetine', 'DULoxetine'],
    ['carbamazepine', 'carBAMazepine'],
    ['oxcarbazepine', 'OXcarbazepine'],
    ['lamotrigine', 'LAMOtrigine'],
    ['lamivudine', 'LAMIvudine'],
    ['chlorpromazine', 'chlorproMAZINE'],
    ['chlordiazepoxide', 'chlorDIAZepOXIDE'],
    ['pentobarbital', 'PENTobarbital'],
    ['phenobarbital', 'PHENobarbital'],
    ['rabeprazole', 'RABEprazole'],
    ['aripiprazole', 'aripiPRAZOLE'],

    // Analgesics & Opioids
    ['morphine', 'morPHINE'],
    ['hydromorphone', 'HYDROmorphone'],
    ['oxycodone', 'OXYcodone'],
    ['oxymorphone', 'OXYmorphone'],
    ['tramadol', 'traMADol'],
    ['trazodone', 'traZODone'],
    ['fentanyl', 'fentaNYL'],
    ['sufentanil', 'SUFentanil'],

    // Anti-Infective & Immunological
    ['celecoxib', 'celeCOXIB'],
    ['cephalexin', 'cefaLEXin'],
    ['cefazolin', 'cefAZOLin'],
    ['cefotaxime', 'cefOTAXime'],
    ['cefoxitin', 'cefOXitin'],
    ['ceftriaxone', 'cefTRIAXone'],
    ['ceftazidime', 'cefTAZidime'],
    ['cyclosporine', 'cycloSPORINE'],
    ['cycloserine', 'cycloSERINE'],
    ['infliximab', 'inFLIXimab'],
    ['rituximab', 'riTUXimab'],
    ['valacyclovir', 'valACYclovir'],
    ['valganciclovir', 'valGANCIClovir'],

    // Hematology & Thrombolysis
    ['alteplase', 'alTEPLASE'],
    ['tenecteplase', 'tenectePLASE'],
    ['heparin', 'HEPArin'],
    ['hespan', 'HESpan'],
    ['quinidine', 'quinIDine'],
    ['quinine', 'quinINE'],

    // Steroids & Hormones
    ['prednisone', 'predniSONE'],
    ['prednisolone', 'prednisoLONE'],
    ['medroxyprogesterone', 'medroxyPROGESTERone'],
    ['methylprednisolone', 'methylPREDNISolone'],
    ['methyltestosterone', 'methylTESTOSTERone'],
    ['dimenhydrinate', 'dimenhyDRINATE'],
    ['diphenhydramine', 'diphenhydrAMINE']
  ]);

  /**
   * Canonical LASA High-Risk Pairs Catalog with In-Depth Clinical Knowledge
   */
  private readonly CANONICAL_LASA_PAIRS: ReadonlyArray<ILasaDrugPair> = [
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

  /**
   * ISMP Dangerous / Error-Prone Abbreviations and replacement definitions
   */
  private readonly DANGEROUS_ABBREVIATIONS: ReadonlyArray<{
    pattern: RegExp;
    replacement: string;
    description: string;
  }> = [
    {
      pattern: /\b(\d+)\s*U\b/gi,
      replacement: '$1 units',
      description: 'Mistaken as zero (0), four (4), or cc. Write "units".'
    },
    {
      pattern: /\b(Q\.?D\.?|QD)\b/gi,
      replacement: 'daily',
      description: 'Mistaken for QOD. Write "daily".'
    },
    {
      pattern: /\b(Q\.?O\.?D\.?|QOD)\b/gi,
      replacement: 'every other day',
      description: 'Mistaken for QD. Write "every other day".'
    },
    {
      pattern: /\bMSO4\b/g,
      replacement: 'morphine sulfate',
      description: 'Confused with MgSO4. Write "morphine sulfate".'
    },
    {
      pattern: /\bMgSO4\b/g,
      replacement: 'magnesium sulfate',
      description: 'Confused with MSO4. Write "magnesium sulfate".'
    },
    {
      pattern: /\b(\d+(?:\.\d+)?)\s*(?:ug|µg)\b/gi,
      replacement: '$1 mcg',
      description: 'Mistaken for mg (1000-fold overdose). Write "mcg".'
    },
    {
      pattern: /\b(TIW|T\.I\.W\.)\b/gi,
      replacement: '3 times weekly',
      description: 'Mistaken for three times daily (TID). Write "3 times weekly".'
    },
    {
      pattern: /\b(D\/C|DC)\b/gi,
      replacement: 'discontinue',
      description: 'Mistaken for "discharge". Write "discontinue".'
    },
    {
      pattern: /\b(SQ|sub q)\b/gi,
      replacement: 'subcutaneously',
      description: 'Mistaken for SL (sublingual) or "5 every". Write "subcutaneously".'
    }
  ];

  /**
   * Sanitizes a clinical dosage string according to ISMP & FDA standards:
   * 1. Strips trailing zeros (5.0 mg -> 5 mg)
   * 2. Prepends leading zero to naked decimals (.5 mg -> 0.5 mg)
   * 3. Replaces error-prone abbreviations with standardized terms
   * 4. Converts known look-alike/sound-alike drug names to FDA Tall Man Lettering
   */
  sanitizeClinicalDosage(text: string): string {
    if (!text) return '';
    let result = text;

    // 1. Strip trailing zeros: 5.0 mg -> 5 mg, 10.00 mL -> 10 mL
    result = result.replace(/(\b\d+)\.0+\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi, '$1 $2');

    // 2. Prepend leading zero to naked decimals: .5 mg -> 0.5 mg
    result = result.replace(/(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi, '$10.$2 $3');

    // 3. Replace dangerous abbreviations
    for (const abbrev of this.DANGEROUS_ABBREVIATIONS) {
      result = result.replace(abbrev.pattern, abbrev.replacement);
    }

    // 4. Apply Tall Man Lettering
    result = this.applyTallManLettering(result);

    return result.trim();
  }

  /**
   * Formats a numeric calculation or laboratory value according to strict ISMP posology rules:
   * 1. Mandatory leading zero: values between -1 and 1 (non-zero) strictly include '0.' (e.g. 0.5, -0.25, never .5)
   * 2. Absolute prohibition of trailing zeros: whole numbers or numbers ending in '.0' have trailing zeros stripped (e.g. 5, not 5.0)
   * 3. Max significant decimals without trailing zeros: (e.g. 1.2500 -> 1.25)
   * 4. Optional metric unit standardization (e.g. 'mL' capitalized, 'mcg' instead of 'ug')
   */
  formatIsmpNumber(value: number | string, unit?: string, maxDecimals: number = 3): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(value.toString().trim());
    if (isNaN(num)) return typeof value === 'string' ? value : '';

    // Fix floating point epsilon (e.g. 0.5000000000000001 -> 0.5)
    const factor = Math.pow(10, maxDecimals);
    const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

    // Convert to string
    let numStr = rounded.toString();

    // Ensure leading zero if between -1 and 1 and non-zero
    if (numStr.startsWith('.')) {
      numStr = '0' + numStr;
    } else if (numStr.startsWith('-.')) {
      numStr = '-0' + numStr.substring(2);
    }

    // Strip trailing zeros if decimal is present
    if (numStr.includes('.')) {
      numStr = numStr.replace(/\.?0+$/, '');
    }

    if (!unit) return numStr;

    // Standardize unit
    let cleanUnit = unit.trim();
    if (/^(ml|milliliters?)$/i.test(cleanUnit)) cleanUnit = 'mL';
    if (/^(ug|µg|micrograms?)$/i.test(cleanUnit)) cleanUnit = 'mcg';
    if (/^(mg|milligrams?)$/i.test(cleanUnit)) cleanUnit = 'mg';
    if (/^(g|grams?)$/i.test(cleanUnit)) cleanUnit = 'g';

    return `${numStr} ${cleanUnit}`;
  }

  /**
   * Formats a mathematical or pharmacokinetic formula string to adhere to ISMP standards:
   * 1. Replaces naked decimals with mandatory leading zero (.5 -> 0.5)
   * 2. Strips trailing zeros from integers (5.0 -> 5)
   * 3. Slashes mathematical zero subscripts (C_0 -> C_{0̸}, k_0 -> k_{0̸}) to disambiguate from O, \theta, \emptyset
   */
  formatIsmpMathFormula(formula: string): string {
    if (!formula) return '';
    let result = formula;

    // 1. Mandatory leading zero for naked decimals in math (e.g., .5 or -.5 or = .5)
    result = result.replace(/(^|[^0-9.])(\.\d+)/g, '$10$2');

    // 2. Strip trailing zero for integers in math expressions (e.g., 5.0 -> 5, 10.00 -> 10)
    result = result.replace(/(\b\d+)\.0+(?!\d)/g, '$1');

    // 3. Slashed zero disambiguation for pharmacokinetics subscripts (C_0 -> C_{0̸}, k_0 -> k_{0̸})
    result = result.replace(/\b([CA-Za-z])_0\b/g, '$1_{0̸}');
    result = result.replace(/\b([CA-Za-z])_\{0\}\b/g, '$1_{0̸}');

    return result;
  }

  /**
   * Formats a drug name using official FDA/ISMP Tall Man casing if present in catalog.
   */
  formatTallMan(drugName: string): string {
    if (!drugName) return '';
    const clean = drugName.trim().toLowerCase();
    return this.TALL_MAN_MAP.get(clean) || drugName;
  }

  /**
   * Finds the canonical LASA drug pair profile for a given medication name.
   */
  getLasaPair(drugName: string): ILasaDrugPair | undefined {
    if (!drugName) return undefined;
    const clean = drugName.trim().toLowerCase();
    return this.CANONICAL_LASA_PAIRS.find(
      p => p.drugA.name.toLowerCase() === clean || p.drugB.name.toLowerCase() === clean
    );
  }

  /**
   * Returns all canonical LASA drug pairs.
   */
  getAllLasaPairs(): ReadonlyArray<ILasaDrugPair> {
    return this.CANONICAL_LASA_PAIRS;
  }

  /**
   * Generates interactive clinical training flashcards for educational drills.
   */
  getLasaTrainingDeck(): ILasaTrainingCard[] {
    return this.CANONICAL_LASA_PAIRS.map(pair => ({
      id: pair.id,
      category: pair.category,
      promptScenario: `A clinician inputs an order for "${pair.drugA.name}". How must this order be optically formatted, and what confusable medication must be guarded against?`,
      prescribedDrug: pair.drugA.name,
      confusableDrug: pair.drugB.name,
      tallManA: pair.drugA.tallMan,
      tallManB: pair.drugB.tallMan,
      indicationA: pair.drugA.indication,
      indicationB: pair.drugB.indication,
      clinicalTrapExplanation: pair.confusionMechanism,
      criticalSafetyWarning: pair.fatalRiskSummary
    }));
  }

  /**
   * Performs an exhaustive ISMP safety audit against a clinical order or note,
   * detecting decimal errors, prohibited abbreviations, and look-alike/sound-alike drugs.
   */
  auditPrescription(text: string): IIsmpSafetyAudit {
    const originalText = text || '';
    const violations: IIsmpViolation[] = [];
    const tallManApplied: string[] = [];

    // Check Trailing Zeros
    const trailingZeroRegex = /(\b\d+)\.0+\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = trailingZeroRegex.exec(originalText)) !== null) {
      violations.push({
        type: 'TRAILING_ZERO',
        original: match[0],
        corrected: `${match[1]} ${match[2]}`,
        rule: 'ISMP Rule: Trailing zeros prohibited (e.g., 5.0 mg mistaken as 50 mg)',
        severity: 'CRITICAL_SAFETY_DEFECT'
      });
    }

    // Check Naked Decimals
    const nakedDecimalRegex = /(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    while ((match = nakedDecimalRegex.exec(originalText)) !== null) {
      violations.push({
        type: 'NAKED_DECIMAL',
        original: match[0].trim(),
        corrected: `0.${match[2]} ${match[3]}`,
        rule: 'ISMP Rule: Leading zero mandatory before decimal point (e.g., .5 mg mistaken as 5 mg)',
        severity: 'CRITICAL_SAFETY_DEFECT'
      });
    }

    // Check Error-Prone Abbreviations
    for (const abbrev of this.DANGEROUS_ABBREVIATIONS) {
      const abbrevRegex = new RegExp(abbrev.pattern.source, abbrev.pattern.flags);
      while ((match = abbrevRegex.exec(originalText)) !== null) {
        violations.push({
          type: 'ERROR_PRONE_ABBREVIATION',
          original: match[0],
          corrected: match[0].replace(abbrev.pattern, abbrev.replacement),
          rule: `ISMP Do Not Use List: ${abbrev.description}`,
          severity: 'HIGH_RISK_WARNING'
        });
      }
    }

    // Check LASA Look-Alike / Sound-Alike Pairs & Apply Tall Man
    const sanitizedText = this.sanitizeClinicalDosage(originalText);
    for (const [lower, tall] of this.TALL_MAN_MAP.entries()) {
      const wordRegex = new RegExp(`\\b${lower}\\b`, 'gi');
      if (wordRegex.test(originalText)) {
        if (!tallManApplied.includes(tall)) {
          tallManApplied.push(tall);
        }

        // Check if this drug is part of a high-risk confusion pair
        const pair = this.getLasaPair(lower);
        if (pair) {
          const isA = pair.drugA.name.toLowerCase() === lower;
          const currentProfile = isA ? pair.drugA : pair.drugB;
          const otherProfile = isA ? pair.drugB : pair.drugA;
          const warningClause = currentProfile.boxedWarning ? ` [BOXED WARNING: ${currentProfile.boxedWarning}]` : '';

          violations.push({
            type: 'LOOK_ALIKE_SOUND_ALIKE',
            original: match ? match[0] : lower,
            corrected: tall,
            rule: `FDA/ISMP LASA Guard: Confusable with ${otherProfile.tallMan}`,
            severity: pair.category === 'ONCOLOGY' || pair.category === 'ANALGESIC'
              ? 'CRITICAL_SAFETY_DEFECT'
              : 'HIGH_RISK_WARNING',
            lasaPair: pair,
            confusableWith: otherProfile.tallMan,
            clinicalDisambiguation: `Prescribed: ${currentProfile.tallMan} (${currentProfile.pharmacologicalClass} — ${currentProfile.indication}) vs Confusable: ${otherProfile.tallMan} (${otherProfile.pharmacologicalClass} — ${otherProfile.indication}).${warningClause} ${pair.fatalRiskSummary}`
          });
        }
      }
    }

    return {
      originalText,
      sanitizedText,
      hasViolations: violations.length > 0,
      violations,
      tallManApplied,
      isSafe: violations.length === 0
    };
  }

  /**
   * Internal helper to scan and replace words with Tall Man equivalents
   */
  private applyTallManLettering(text: string): string {
    let output = text;
    for (const [lower, tall] of this.TALL_MAN_MAP.entries()) {
      const regex = new RegExp(`\\b${lower}\\b`, 'gi');
      output = output.replace(regex, tall);
    }
    return output;
  }
}
