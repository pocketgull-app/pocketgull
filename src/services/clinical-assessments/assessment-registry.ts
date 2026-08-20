import { AssessmentType, IAssessmentDefinition } from './types';
import {
  Phq9Assessment,
  Gad7Assessment,
  IsiAssessment,
  CssrsAssessment,
  CvsqAssessment,
  MbiAssessment,
  Ros14Assessment,
  Phq15Assessment,
  PrapareAssessment,
  AyurvedaAssessment,
  TcmAssessment,
  GrowThyselfAssessment,
  MocaAssessment,
  AuditcAssessment,
  SarcfAssessment,
  Dn4Assessment,
  SibiAssessment
} from './instruments';

export const ASSESSMENT_REGISTRY: Record<AssessmentType, IAssessmentDefinition> = {
  growthyself: GrowThyselfAssessment,
  phq9: Phq9Assessment,
  gad7: Gad7Assessment,
  isi: IsiAssessment,
  cvsq: CvsqAssessment,
  mbi: MbiAssessment,
  cssrs: CssrsAssessment,
  ros14: Ros14Assessment,
  phq15: Phq15Assessment,
  prapare: PrapareAssessment,
  ayurveda: AyurvedaAssessment,
  tcm: TcmAssessment,
  moca: MocaAssessment,
  auditc: AuditcAssessment,
  sarcf: SarcfAssessment,
  dn4: Dn4Assessment,
  sibi: SibiAssessment
};

export const ALL_ASSESSMENTS: IAssessmentDefinition[] = Object.values(ASSESSMENT_REGISTRY);

export function getAssessment(type: AssessmentType): IAssessmentDefinition {
  return ASSESSMENT_REGISTRY[type] || ASSESSMENT_REGISTRY.phq9;
}