/**
 * @pocketgull/open-scribe
 * Type definitions for zero-dependency on-device ambient scribe and Socratic demystifier.
 */

export interface IScribeTranscriptChunk {
  text: string;
  isFinal: boolean;
  timestamp: number;
  confidence?: number;
}

export interface ISoapSection {
  title: string;
  western: string[];
  eastern?: string[];
  ayurvedic?: string[];
  osteopathic?: string[];
}

export interface IClinicalSoapNote {
  id: string;
  createdAt: string;
  rawTranscript: string;
  subjective: ISoapSection;
  objective: ISoapSection;
  assessment: ISoapSection;
  plan: ISoapSection;
  icd10Codes: Array<{ code: string; label: string }>;
  ismpSafetyIssues: IIsmpSafetyViolation[];
}

export interface IDemystifiedExplanation {
  term: string;
  category: 'CLINICAL' | 'BIOMARKER' | 'FINANCIAL' | 'MEDICATION';
  plainEnglish: string;
  teaspoonAnalogy: string;
  empoweringAction: string;
}

export interface IThreeActTrajectory {
  act1WhereYouveBeen: {
    title: string;
    summary: string;
    historicalContext: string;
  };
  act2WhereYouStandToday: {
    title: string;
    summary: string;
    activeBiometrics: string[];
  };
  act3WhereYoureGoing: {
    title: string;
    roadmap30Day: string;
    roadmap60Day: string;
    roadmap90Day: string;
  };
}

export interface IPatientTeaspoonNote {
  id: string;
  createdAt: string;
  friendlyTitle: string;
  reassuringSummary: string;
  demystifiedJargon: IDemystifiedExplanation[];
  trajectory: IThreeActTrajectory;
  dailyCareChecklist: string[];
}

export interface IIsmpSafetyViolation {
  originalText: string;
  suggestedCorrection: string;
  ruleCode: 'TRAILING_ZERO' | 'NAKED_DECIMAL' | 'PROHIBITED_ABBREVIATION' | 'UNITLESS_DOSAGE';
  description: string;
  severity: 'HIGH' | 'MEDIUM';
}

export interface IIsmpAuditResult {
  isSafe: boolean;
  violations: IIsmpSafetyViolation[];
  sanitizedText: string;
}
