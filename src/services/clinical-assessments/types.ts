export type AssessmentType = 
  | 'phq9' 
  | 'gad7' 
  | 'isi' 
  | 'cssrs' 
  | 'cvsq'
  | 'mbi'
  | 'ros14' 
  | 'phq15' 
  | 'prapare' 
  | 'ayurveda' 
  | 'tcm' 
  | 'growthyself'
  | 'moca'
  | 'auditc'
  | 'sarcf'
  | 'dn4'
  | 'sibi';

export interface IQuestionItem {
  id: number;
  question: string;
  subtext?: string;
  category?: string;
  zCode?: string;
  doshaVector?: 'vata' | 'pitta' | 'kapha';
  tcmVector?: 'yin' | 'yang' | 'qi' | 'blood' | 'heat' | 'cold';
  growDomain?: 'purpose' | 'somatic' | 'nutrition' | 'emotional' | 'cognitive';
  mbiVector?: 'ee' | 'dp' | 'pa';
  options: { label: string; value: number }[];
}

export interface ISeverityTier {
  min: number;
  max: number;
  label: string;
  colorClass: string;
  recommendation: string;
}

export interface IAssessmentPayload {
  id: string;
  type: AssessmentType;
  title: string;
  patientId: string;
  dateCreated: string;
  answers: Record<number, number>;
  totalScore: number;
  maxScore: number;
  severityLabel: string;
  recommendation: string;
  positiveSymptoms?: string[];
  doshaBreakdown?: { vata: number; pitta: number; kapha: number };
  tcmBreakdown?: { yin: number; yang: number; qi: number; heat: number; cold: number };
  growThyselfBreakdown?: { purpose: number; somatic: number; nutrition: number; emotional: number; cognitive: number };
  mbiBreakdown?: { ee: number; dp: number; pa: number };
}
export interface IAssessmentDefinition<TBreakdown = any> {
  id: AssessmentType;
  title: string;
  shortName: string;
  badge: string;
  icon?: string;
  category?: string;
  patientEducation: string;
  citation?: string;
  loincCode?: string;
  maxScore: number;
  questions: IQuestionItem[];
  tiers: ISeverityTier[];
  calculateScore: (answers: Record<number, number>) => number;
  calculateBreakdown?: (answers: Record<number, number>) => TBreakdown;
  mapToAnatomyPart?: (questionId: number, value: number) => string | null;
  motivationalPrompt?: (score: number, tier: ISeverityTier) => string;
}


