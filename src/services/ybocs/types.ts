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
  severityCategory: string; // Subclinical, Mild, Moderate, Severe, Extreme
  dateCreated: string;
}
