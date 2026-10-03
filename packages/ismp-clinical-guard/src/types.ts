// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

export interface ILasaDrugProfile {
  name: string;
  tallMan: string;
  indication: string;
  pharmacologicalClass: string;
  typicalDose: string;
  route: string;
  boxedWarning?: string;
}

export type LasaCategory =
  | 'ONCOLOGY'
  | 'CARDIOVASCULAR'
  | 'ENDOCRINE'
  | 'PSYCHIATRIC'
  | 'ANALGESIC'
  | 'ANTIMICROBIAL'
  | 'HEMATOLOGY_CRITICAL';

export interface ILasaDrugPair {
  id: string;
  category: LasaCategory;
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

export type IsmpViolationType =
  | 'TRAILING_ZERO'
  | 'NAKED_DECIMAL'
  | 'ERROR_PRONE_ABBREVIATION'
  | 'LOOK_ALIKE_SOUND_ALIKE';

export type IsmpSeverity =
  | 'CRITICAL_SAFETY_DEFECT'
  | 'HIGH_RISK_WARNING'
  | 'ADVISORY';

export interface IIsmpViolation {
  type: IsmpViolationType;
  original: string;
  corrected: string;
  rule: string;
  severity: IsmpSeverity;
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

export interface IDangerousAbbreviation {
  pattern: RegExp;
  replacement: string;
  description: string;
}
