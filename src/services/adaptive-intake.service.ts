import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

export type SocraticCategory =
  | 'FIFE_Feelings'
  | 'FIFE_Ideas'
  | 'FIFE_Function'
  | 'FIFE_Expectations'
  | 'OLDCARTS_Temporal'
  | 'Ergonomic_Screen'
  | 'TriParadigm_TCM'
  | 'TriParadigm_Ayurveda'
  | 'SDOH_Social'
  | 'Safety_RedFlag';

export interface ISocraticQuestion {
  id: string;
  category: SocraticCategory;
  questionPatient: string;
  questionClinician: string;
  rationale: string;
  quickOptions?: string[];
  importance: 'critical' | 'high' | 'medium';
  answeredValue?: string;
}

export interface IDoctorConsultQuestion {
  id: string;
  question: string;
  contextWhy: string;
  recommendedAction: string;
}

export interface IExtractedClinicalEntity {
  text: string;
  category: 'symptom' | 'trigger' | 'relieving_factor' | 'ergonomic' | 'vital_cue' | 'red_flag' | 'tcm_pattern' | 'ayurvedic_dosha' | 'sdoh_barrier';
  snomedCode?: string;
  snomedDisplay?: string;
  icd10Code?: string;
}

export interface IAdaptiveIntakeContext {
  patientAge?: number;
  occupation?: string;
  activePhilosophy?: 'western' | 'eastern' | 'ayurvedic' | 'integrative';
  existingConditions?: string[];
  vitals?: {
    bp?: string;
    hr?: string;
    spO2?: string;
    glucose?: string;
  };
}

export interface IIntakeAnalysisResult {
  narrative: string;
  chiefConcern: string;
  duration: string;
  extractedEntities: IExtractedClinicalEntity[];
  socraticQuestions: ISocraticQuestion[];
  doctorQuestions: IDoctorConsultQuestion[];
  redFlagAlerts: string[];
  recommendedAssessments: string[];
  fhirObservationSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdaptiveIntakeService {
  private patientState = inject(PatientStateService, { optional: true });
  private snomedCrosswalk = inject(SnomedIcdCrosswalkService, { optional: true });

  /**
   * Parses an unstructured patient narrative (voice transcript or text note),
   * extracts clinical entities with SNOMED-CT / ICD-10 crosswalks, screens for red flags,
   * and generates Calgary-Cambridge FIFE Socratic inquiries & doctor consult questions.
   */
  public parseNarrative(story: string, context?: IAdaptiveIntakeContext): IIntakeAnalysisResult {
    const cleanStory = (story || '').trim();
    if (!cleanStory) {
      return this.getEmptyAnalysisResult();
    }

    const redFlags = this.checkRedFlags(cleanStory);
    const extractedEntities = this.extractEntities(cleanStory);
    const chiefConcern = this.deduceChiefConcern(cleanStory, extractedEntities);
    const duration = this.extractDuration(cleanStory);
    const socraticQuestions = this.generateSocraticQuestions(cleanStory, context, extractedEntities, redFlags);
    const doctorQuestions = this.generateDoctorQuestions(cleanStory, context, extractedEntities);
    const recommendedAssessments = this.deduceRecommendedAssessments(cleanStory, extractedEntities, redFlags);
    const fhirObservationSummary = this.generateFhirObservationSummary(chiefConcern, duration, extractedEntities);

    return {
      narrative: cleanStory,
      chiefConcern,
      duration,
      extractedEntities,
      socraticQuestions,
      doctorQuestions,
      redFlagAlerts: redFlags,
      recommendedAssessments,
      fhirObservationSummary
    };
  }

  /**
   * Screens narrative for emergency/critical red flags (chest pain, hypoxia, suicidal ideation, sudden neurological deficit).
   */
  public checkRedFlags(text: string): string[] {
    const flags: string[] = [];
    const lower = text.toLowerCase();

    if (
      lower.includes('chest pain') ||
      lower.includes('chest pressure') ||
      lower.includes('crushing chest') ||
      lower.includes('pain radiating to jaw') ||
      lower.includes('pain radiating to left arm')
    ) {
      flags.push('🚨 Immediate Cardiac Red Flag: Crushing/radiating chest pain requires emergency medical evaluation.');
    }

    if (
      lower.includes('suicide') ||
      lower.includes('kill myself') ||
      lower.includes('want to die') ||
      lower.includes('better off dead') ||
      lower.includes('end my life')
    ) {
      flags.push('🛑 Critical Psychiatric Safety Alert: Positive suicide ideation screen. Immediate safety protocol & 988 Lifeline support activated.');
    }

    if (
      lower.includes('cannot breathe') ||
      lower.includes('severe shortness of breath') ||
      lower.includes('lips turning blue') ||
      lower.includes('gasping for air')
    ) {
      flags.push('🚨 Respiratory Emergency Alert: Acute respiratory distress or cyanosis requires immediate clinical stabilization.');
    }

    if (
      lower.includes('sudden numbness on one side') ||
      lower.includes('slurred speech') ||
      lower.includes('facial droop') ||
      lower.includes('worst headache of life')
    ) {
      flags.push('🚨 Neurological Red Flag: FAST stroke symptoms or thunderclap headache require emergency neurovascular triage.');
    }

    return flags;
  }

  /**
   * Extracts clinical entities (symptoms, triggers, ergonomic factors, multi-paradigm vectors)
   * with SNOMED-CT / ICD-10 crosswalk metadata.
   */
  public extractEntities(text: string): IExtractedClinicalEntity[] {
    const entities: IExtractedClinicalEntity[] = [];
    const lower = text.toLowerCase();

    // 1. Cervicalgia / Upper Crossed Strain
    if (lower.includes('neck') || lower.includes('cervical') || lower.includes('stiff neck') || lower.includes('trapezius')) {
      entities.push({
        text: 'Cervicalgia / Forward Head Strain',
        category: 'ergonomic',
        snomedCode: '81680005',
        snomedDisplay: 'Neck pain (Cervicalgia)',
        icd10Code: 'M54.2'
      });
    }

    // 2. Carpal Tunnel / Repetitive Wrist Strain
    if (lower.includes('wrist') || lower.includes('carpal') || lower.includes('hand tingling') || lower.includes('numb fingers') || lower.includes('typing pain')) {
      entities.push({
        text: 'Carpal Tunnel Syndrome / Repetitive Strain',
        category: 'ergonomic',
        snomedCode: '4384001',
        snomedDisplay: 'Carpal tunnel syndrome',
        icd10Code: 'G56.00'
      });
    }

    // 3. Digital Eye Strain (Asthenopia / CVS)
    if (lower.includes('eye strain') || lower.includes('screen') || lower.includes('blurred vision') || lower.includes('dry eyes') || lower.includes('monitor fatigue')) {
      entities.push({
        text: 'Asthenopia (Digital Eye Strain / Computer Vision Syndrome)',
        category: 'ergonomic',
        snomedCode: '33776007',
        snomedDisplay: 'Asthenopia (Digital Eye Strain)',
        icd10Code: 'H53.149'
      });
    }

    // 4. Occupational Burnout & Cognitive Fatigue
    if (lower.includes('burnout') || lower.includes('exhausted') || lower.includes('brain fog') || lower.includes('overworked') || lower.includes('drained') || lower.includes('deadline stress')) {
      entities.push({
        text: 'Occupational Burnout & Vital Exhaustion',
        category: 'symptom',
        snomedCode: '225444004',
        snomedDisplay: 'State of exhaustion (Burnout)',
        icd10Code: 'Z73.0'
      });
    }

    // 5. Insomnia / Circadian Disruption
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('waking up') || lower.includes('cannot fall asleep') || lower.includes('restless')) {
      entities.push({
        text: 'Circadian Sleep Disruption / Insomnia',
        category: 'symptom',
        snomedCode: '193462001',
        snomedDisplay: 'Insomnia (disorder)',
        icd10Code: 'G47.00'
      });
    }

    // 6. Gastrointestinal Distress / Post-Prandial Bloating
    if (lower.includes('bloating') || lower.includes('stomach') || lower.includes('gut') || lower.includes('reflux') || lower.includes('indigestion') || lower.includes('after eating')) {
      entities.push({
        text: 'Gastrointestinal Dysbiosis / Post-Prandial Distress',
        category: 'symptom',
        snomedCode: '249497008',
        snomedDisplay: 'Abdominal bloating (finding)',
        icd10Code: 'R14.0'
      });
    }

    // 7. TCM Ba Gang Pattern Indicators
    if (lower.includes('cold hands') || lower.includes('chills') || lower.includes('pale tongue') || lower.includes('sluggish')) {
      entities.push({
        text: 'TCM Yang Deficiency / Cold Pattern',
        category: 'tcm_pattern'
      });
    }
    if (lower.includes('night sweats') || lower.includes('hot flashes') || lower.includes('five palm heat') || lower.includes('restless heat')) {
      entities.push({
        text: 'TCM Yin Deficiency / Heat Pattern',
        category: 'tcm_pattern'
      });
    }

    // 8. Ayurvedic Vikriti Imbalances
    if (lower.includes('racing thoughts') || lower.includes('dry skin') || lower.includes('anxious jittery') || lower.includes('irregular digestion')) {
      entities.push({
        text: 'Ayurvedic Vata Aggravation (Air/Ether Vector)',
        category: 'ayurvedic_dosha'
      });
    }
    if (lower.includes('acid reflux') || lower.includes('irritability') || lower.includes('inflammation') || lower.includes('overheating')) {
      entities.push({
        text: 'Ayurvedic Pitta Aggravation (Fire/Water Vector)',
        category: 'ayurvedic_dosha'
      });
    }

    // 9. SDOH / Material Hardships
    if (lower.includes('rent') || lower.includes('housing') || lower.includes('food') || lower.includes('cannot afford bills') || lower.includes('isolated')) {
      entities.push({
        text: 'Social Determinants of Health Barrier (PRAPARE Z-Code)',
        category: 'sdoh_barrier',
        icd10Code: 'Z59.8'
      });
    }

    return entities;
  }

  /**
   * Generates dynamic Calgary-Cambridge (FIFE) and Socratic clarifying questions.
   */
  public generateSocraticQuestions(
    story: string,
    context?: IAdaptiveIntakeContext,
    entities: IExtractedClinicalEntity[] = [],
    redFlags: string[] = []
  ): ISocraticQuestion[] {
    const questions: ISocraticQuestion[] = [];
    const lower = story.toLowerCase();

    // If critical red flags exist, add immediate safety clarification
    if (redFlags.length > 0) {
      questions.push({
        id: 'q_safety_1',
        category: 'Safety_RedFlag',
        questionPatient: 'Are you currently in a safe space where immediate help or a support person is available to you right now?',
        questionClinician: 'Evaluate immediate acuity, support network proximity, and necessity for emergency EMS dispatch.',
        rationale: 'Mandatory clinical safety triaging upon detecting acute red flags.',
        quickOptions: ['Yes, I am in a safe space', 'I am alone and need immediate support', 'I have contacted emergency services'],
        importance: 'critical'
      });
    }

    // 1. Calgary-Cambridge: FUNCTION (How does this impact daily joy & workflow?)
    questions.push({
      id: 'q_fife_function',
      category: 'FIFE_Function',
      questionPatient: 'When this symptom flares up during your week, what is the #1 activity or hobby it makes hardest to enjoy?',
      questionClinician: 'Assess functional impairment, occupational disability, and patient-centered activity limitation.',
      rationale: 'Establishes the patient’s primary value anchor and quality-of-life baseline.',
      quickOptions: ['Deep work & coding focus', 'Physical exercise & workouts', 'Family time & social life', 'Restful sleep & recovery'],
      importance: 'high'
    });

    // 2. Calgary-Cambridge: IDEAS & HYPOTHESES (What does the patient suspect?)
    questions.push({
      id: 'q_fife_ideas',
      category: 'FIFE_Ideas',
      questionPatient: 'In your own gut feeling or observations, what have you noticed seems to trigger or worsen this?',
      questionClinician: 'Elicit patient illness model, causal attribution, and unrecognized environmental/dietary triggers.',
      rationale: 'Uncovers hidden triggers and unvoiced medical anxieties (FIFE Ideas).',
      quickOptions: ['Long screen hours without breaks', 'Stress & high-pressure deadlines', 'Certain meals or caffeine', 'Poor sleep & late nights'],
      importance: 'high'
    });

    // 3. Ergonomic & Occupational Deep-Dive (If tech strain or postural issues detected)
    const hasErgo = entities.some(e => e.category === 'ergonomic');
    if (hasErgo || lower.includes('computer') || lower.includes('desk') || lower.includes('code') || lower.includes('screen')) {
      questions.push({
        id: 'q_ergo_screen',
        category: 'Ergonomic_Screen',
        questionPatient: 'On a typical weekday, how many total hours are you looking at screens, and do you use an ergonomic stand/monitor at eye level?',
        questionClinician: 'Quantify daily screen exposure duration, display viewing angle, and keyboard/wrist biomechanics.',
        rationale: 'Assesses risk factors for Computer Vision Syndrome (CVS-Q) and Upper Crossed Syndrome.',
        quickOptions: ['4–6 hours (Ergonomic setup)', '7–10 hours (Laptop on desk)', '10+ hours (Mixed monitors)', '12+ hours intense coding'],
        importance: 'high'
      });
    }

    // 4. Calgary-Cambridge: EXPECTATIONS (What would ideal success look like?)
    questions.push({
      id: 'q_fife_expectations',
      category: 'FIFE_Expectations',
      questionPatient: 'Looking ahead 4 weeks from today, what would a successful, great outcome look like for your daily energy and comfort?',
      questionClinician: 'Identify realistic therapeutic goals, patient expectations, and outcome metrics (e.g. NDI or MBI reduction).',
      rationale: 'Aligns the care plan strategy with the patient’s explicit desired horizon.',
      quickOptions: ['Zero neck/wrist stiffness', 'Consistent all-day mental clarity', 'Restorative 8-hour sleep', 'Balanced digestion after meals'],
      importance: 'medium'
    });

    // 5. Multi-Paradigm Temporal / Rhythm inquiry
    if (context?.activePhilosophy === 'eastern' || entities.some(e => e.category === 'tcm_pattern')) {
      questions.push({
        id: 'q_tcm_temporal',
        category: 'TriParadigm_TCM',
        questionPatient: 'Do your symptoms noticeably shift depending on the time of day, room temperature, or after warm vs. cold drinks?',
        questionClinician: 'Differentiate TCM Ba Gang Heat/Cold and meridian circadian clock aggravation patterns.',
        rationale: 'Assesses circadian organ meridian energy and thermal sensitivities in Eastern medicine.',
        quickOptions: ['Worse with cold / Better with warmth', 'Worse in afternoon / heat', 'Worse in early morning upon waking', 'No temperature sensitivity'],
        importance: 'medium'
      });
    }

    return questions;
  }

  /**
   * Generates empowering questions for the patient to ask their doctor during their next consult.
   */
  public generateDoctorQuestions(
    story: string,
    context?: IAdaptiveIntakeContext,
    entities: IExtractedClinicalEntity[] = []
  ): IDoctorConsultQuestion[] {
    const questions: IDoctorConsultQuestion[] = [];

    // General diagnostic grounding
    questions.push({
      id: 'doc_q_1',
      question: 'What do you think is the underlying root cause of these symptoms, rather than just treating the surface discomfort?',
      contextWhy: 'Helps steer the consultation toward functional root causes rather than quick symptom suppression.',
      recommendedAction: 'Ask early in the visit after sharing your chief narrative.'
    });

    // Ergonomic & occupational strain question
    if (entities.some(e => e.category === 'ergonomic')) {
      questions.push({
        id: 'doc_q_ergo',
        question: 'Could my workstation ergonomics or screen time be contributing to nerve compression or neck/eye strain, and would physical therapy or an NDI assessment be beneficial?',
        contextWhy: 'Encourages your provider to evaluate kinetic chain biomechanics (CPT 97110/97530).',
        recommendedAction: 'Mention specific daily desk hours (e.g. 8–10 hours) when asking.'
      });
    }

    // Medication / interaction / biomarker question
    questions.push({
      id: 'doc_q_biomarker',
      question: 'Are there specific blood markers (like hs-CRP, Vitamin D3, or Ferritin) or non-pharmacological lifestyle protocols that we should monitor over the next 60 days?',
      contextWhy: 'Opens the door for objective biomarker tracking and lifestyle adjunct strategies.',
      recommendedAction: 'Review during the follow-up planning portion of your visit.'
    });

    // Holistic / integrative option
    questions.push({
      id: 'doc_q_integrative',
      question: 'How can we combine standard medical treatment with supportive nutrition, stress biofeedback, and sleep hygiene for the best outcome?',
      contextWhy: 'Promotes multidisciplinary care integration.',
      recommendedAction: 'Discuss when reviewing the final care plan.'
    });

    return questions;
  }

  /**
   * Applies the parsed intake findings directly into the centralized PatientStateService.
   */
  public applyIntakeToPatientState(analysis: IIntakeAnalysisResult): void {
    if (!this.patientState) return;

    // 1. Add a rich clinical note to the patient chart
    this.patientState.addClinicalNote({
      id: `intake_${Date.now()}`,
      date: new Date().toISOString(),
      text: `Adaptive Socratic Intake: ${analysis.chiefConcern} (${analysis.duration}). Entities identified: ${analysis.extractedEntities.map(e => e.text).join(', ')}.`,
      sourceLens: 'Socratic Intake Engine'
    });

    // 2. If ergonomic neck or carpal strain was identified, add issues to body parts
    this.patientState.issues.update(curr => {
      const next = { ...curr };

      for (const entity of analysis.extractedEntities) {
        if (entity.snomedCode === '81680005') { // Cervicalgia
          const headIssues = next['head'] ? [...next['head']] : [];
          headIssues.push({
            id: 'head',
            noteId: `intake_head_${Date.now()}`,
            name: 'Head & Neck',
            painLevel: 5,
            description: 'Identified via Adaptive Socratic Intake. ICD-10: M54.2, SNOMED: 81680005. Patient reports desk/screen-related fatigue.',
            symptoms: ['Cervicalgia & Upper Crossed Postural Strain', 'Neck Stiffness'],
            recommendation: 'Physical therapy ergonomic assessment & kinetic retraining'
          });
          next['head'] = headIssues;
        } else if (entity.snomedCode === '4384001') { // Carpal tunnel
          const handIssues = next['r_hand'] ? [...next['r_hand']] : [];
          handIssues.push({
            id: 'r_hand',
            noteId: `intake_r_hand_${Date.now()}`,
            name: 'Right Hand & Wrist',
            painLevel: 4,
            description: 'Identified via Adaptive Socratic Intake. ICD-10: G56.00, SNOMED: 4384001. Repetitive keyboard/mouse strain.',
            symptoms: ['Carpal Tunnel Strain / Repetitive Stress', 'Hand Tingling'],
            recommendation: 'Ergonomic keyboard/mouse positioning & nerve gliding exercises'
          });
          next['r_hand'] = handIssues;
        }
      }

      return next;
    });
  }

  // --- Private Helpers ---

  private deduceChiefConcern(text: string, entities: IExtractedClinicalEntity[]): string {
    if (entities.length > 0) {
      return entities[0].text;
    }
    const firstSentence = text.split(/[.!?\n]/)[0].trim();
    return firstSentence.length > 60 ? firstSentence.slice(0, 57) + '...' : firstSentence || 'General Wellness Review';
  }

  private extractDuration(text: string): string {
    // Prioritize explicit multi-day/week/month/year durations (e.g., "for 3 weeks", "past 6 months")
    const explicitDurationMatch = text.match(/(?:for|past|last|since)\s+(\d+\s*(?:weeks?|months?|years?|days?))/i);
    if (explicitDurationMatch) {
      return explicitDurationMatch[1];
    }

    const weekMonthMatch = text.match(/(\d+\s*(?:weeks?|months?|years?))/i);
    if (weekMonthMatch) {
      return weekMonthMatch[1];
    }

    const generalMatch = text.match(/(\d+\s*(?:days?|hours?))/i);
    return generalMatch ? generalMatch[1] : 'Recent / Ongoing';
  }

  private deduceRecommendedAssessments(text: string, entities: IExtractedClinicalEntity[], redFlags: string[]): string[] {
    const assessments = new Set<string>();

    if (redFlags.some(f => f.includes('Psychiatric'))) {
      assessments.add('C-SSRS (Columbia Suicide Severity Screen)');
    }
    if (entities.some(e => e.snomedCode === '81680005')) {
      assessments.add('NDI (Neck Disability Index)');
    }
    if (entities.some(e => e.snomedCode === '4384001')) {
      assessments.add('BCTQ (Boston Carpal Tunnel Questionnaire)');
    }
    if (entities.some(e => e.snomedCode === '33776007')) {
      assessments.add('CVS-Q (Computer Vision Syndrome Questionnaire)');
    }
    if (entities.some(e => e.snomedCode === '225444004')) {
      assessments.add('MBI (Maslach Burnout Inventory)');
      assessments.add('PHQ-9 (Patient Health Questionnaire)');
    }
    if (entities.some(e => e.snomedCode === '193462001')) {
      assessments.add('ISI (Insomnia Severity Index)');
    }
    if (entities.some(e => e.category === 'sdoh_barrier')) {
      assessments.add('PRAPARE (Social Determinants of Health)');
    }

    if (assessments.size === 0) {
      assessments.add('ROS-14 (14-System Review of Systems)');
    }

    return Array.from(assessments);
  }

  private generateFhirObservationSummary(concern: string, duration: string, entities: IExtractedClinicalEntity[]): string {
    const codes = entities
      .filter(e => e.snomedCode)
      .map(e => `SNOMED:${e.snomedCode} (${e.snomedDisplay})`)
      .join(', ');

    return `FHIR R4 Subjective Observation: Chief concern "${concern}" (${duration}). Mapped clinical terminology: [${codes || 'Clinical narrative recorded'}].`;
  }

  private getEmptyAnalysisResult(): IIntakeAnalysisResult {
    return {
      narrative: '',
      chiefConcern: 'No narrative provided',
      duration: 'N/A',
      extractedEntities: [],
      socraticQuestions: [],
      doctorQuestions: [],
      redFlagAlerts: [],
      recommendedAssessments: ['ROS-14 (14-System Review of Systems)'],
      fhirObservationSummary: 'No observations recorded.'
    };
  }
}
