// SPDX-License-Identifier: Apache-2.0
export interface SymptomItem {
  id: number;
  text: string;
  examples: string;
  category: string;
  isObsession: boolean; // True for obsessions, false for compulsions
}

export interface SymptomCategory {
  id: string;
  name: string;
  isObsession: boolean;
}

export interface SymptomResponse {
  past: boolean;
  current: boolean;
}

export interface SeverityOption {
  score: number;
  label: string;
  desc: string;
}

export interface SeverityQuestion {
  id: number; // 1 to 11
  title: string;
  subtitle: string;
  options: SeverityOption[];
  isObsessionRelated: boolean; // 1-5 are obsession-related, 6-10 are compulsion-related, 11 is general insight
}

export interface PatientInfo {
  name: string;
  dob: string;
  date: string;
}

export type YbocsOutcomeTier = 'subclinical' | 'mild' | 'moderate' | 'severe' | 'extreme';

export type YbocsActionIntent = 'grounding' | 'visit_brief' | 'voice' | 'save';

export interface YbocsNextStep {
  label: string;
  detail: string;
  intent: YbocsActionIntent;
}

export interface IYbocsOutcomeValidation {
  tier: YbocsOutcomeTier;
  severityName: string;
  badgeColor: string;
  cardBorder: string;
  headline: string;
  validationMessage: string;
  meaningInDailyLife: string;
  patternNote: string | null;
  insightNote: string | null;
  egoDystonicReassurance: string | null;
  showWarmSupportCard: boolean;
  nextSteps: YbocsNextStep[];
}

export interface Assessment {
  id: string;
  patientInfo: PatientInfo;
  checklistAnswers: Record<number, SymptomResponse>;
  upsettingObsessionId: number | null;
  upsettingCompulsionId: number | null;
  severityAnswers: Record<number, number>; // question id -> score (0-4)
  obsessionSubtotal: number;
  compulsiveSubtotal: number;
  totalScore: number;
  insightScore?: number | null;
  severityCategory: string; // Subclinical, Mild OCD, Moderate OCD, Severe OCD, Extreme OCD
  dateCreated: string;
}
