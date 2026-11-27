import { Injectable, inject, signal, computed, Injector } from '@angular/core';
import { AssessmentType, IAssessmentPayload, ISeverityTier, IAssessmentDefinition } from './types';
import { getAssessment } from './assessment-registry';
import { hasPhq9Item9SuicidalIdeation, PHQ9_ITEM_9_ID, resolvePhq9SeverityTier } from './instruments/phq9.assessment';
import { EmergencyRedFlagGuard, IEmergencyRedFlagEvaluation } from '../emergency-red-flag.guard';
import { PatientManagementService } from '../patient-management.service';
import { PatientStateService } from '../patient-state.service';
import { StorageService } from '../storage.service';
import { HistoryEntry } from '../patient.types';

export interface IStatSuicideEscalation {
  isActive: boolean;
  acuity: 'STAT_EMERGENCY' | 'ROUTINE';
  triggerSource: 'PHQ9_ITEM_9' | 'CSSRS' | 'PHQ9_ITEM_9_AND_CSSRS' | null;
  phq9Item9Score: number;
  cssrsScore: number;
  crisisNumber: string;
  crisisServiceName: string;
  emergencyNumber: string;
  jurisdictionId: string;
  protocolMarkdown: string;
  evaluation: IEmergencyRedFlagEvaluation | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalAssessmentsService {
  private injector = inject(Injector);
  private patientState = inject(PatientStateService);
  private storage = inject(StorageService);
  private emergencyGuard = inject(EmergencyRedFlagGuard, { optional: true }) || new EmergencyRedFlagGuard();

  readonly activeTab = signal<AssessmentType>('phq9');

  // Modular answers store per assessment type
  readonly answersMap = signal<Record<AssessmentType, Record<number, number>>>({
    growthyself: {},
    phq9: {},
    gad7: {},
    isi: {},
    cvsq: {},
    mbi: {},
    cssrs: {},
    ros14: {},
    phq15: {},
    prapare: {},
    ayurveda: {},
    tcm: {},
    moca: {},
    auditc: {},
    sarcf: {},
    dn4: {},
    sibi: {}
  });

  // Active Assessment Definition
  readonly currentAssessment = computed<IAssessmentDefinition>(() => getAssessment(this.activeTab()));

  // Active Tab Score & Tier
  readonly currentScore = computed(() => {
    const type = this.activeTab();
    const def = getAssessment(type);
    const answers = this.answersMap()[type] || {};
    return def.calculateScore(answers);
  });

  readonly currentTier = computed<ISeverityTier>(() => {
    const type = this.activeTab();
    const score = this.currentScore();
    return this.calcTier(type, score, this.answersMap()[type] || {});
  });

  // Backward-compatible individual signal accessors
  readonly phq9Answers = computed(() => this.answersMap().phq9);
  readonly gad7Answers = computed(() => this.answersMap().gad7);
  readonly isiAnswers = computed(() => this.answersMap().isi);
  readonly cssrsAnswers = computed(() => this.answersMap().cssrs);
  readonly cvsqAnswers = computed(() => this.answersMap().cvsq);
  readonly mbiAnswers = computed(() => this.answersMap().mbi);
  readonly ros14Answers = computed(() => this.answersMap().ros14);
  readonly phq15Answers = computed(() => this.answersMap().phq15);
  readonly prapareAnswers = computed(() => this.answersMap().prapare);
  readonly ayurvedaAnswers = computed(() => this.answersMap().ayurveda);
  readonly tcmAnswers = computed(() => this.answersMap().tcm);
  readonly growThyselfAnswers = computed(() => this.answersMap().growthyself);
  readonly mocaAnswers = computed(() => this.answersMap().moca);
  readonly auditcAnswers = computed(() => this.answersMap().auditc);
  readonly sarcfAnswers = computed(() => this.answersMap().sarcf);
  readonly dn4Answers = computed(() => this.answersMap().dn4);
  readonly sibiAnswers = computed(() => this.answersMap().sibi);

  // Backward-compatible computed scores
  readonly phq9Score = computed(() => getAssessment('phq9').calculateScore(this.answersMap().phq9));
  readonly gad7Score = computed(() => getAssessment('gad7').calculateScore(this.answersMap().gad7));
  readonly isiScore = computed(() => getAssessment('isi').calculateScore(this.answersMap().isi));
  readonly cssrsScore = computed(() => getAssessment('cssrs').calculateScore(this.answersMap().cssrs));
  readonly cvsqScore = computed(() => getAssessment('cvsq').calculateScore(this.answersMap().cvsq));
  readonly mbiScore = computed(() => getAssessment('mbi').calculateScore(this.answersMap().mbi));
  readonly ros14Score = computed(() => getAssessment('ros14').calculateScore(this.answersMap().ros14));
  readonly phq15Score = computed(() => getAssessment('phq15').calculateScore(this.answersMap().phq15));
  readonly prapareScore = computed(() => getAssessment('prapare').calculateScore(this.answersMap().prapare));
  readonly ayurvedaScore = computed(() => getAssessment('ayurveda').calculateScore(this.answersMap().ayurveda));
  readonly tcmScore = computed(() => getAssessment('tcm').calculateScore(this.answersMap().tcm));
  readonly growThyselfScore = computed(() => getAssessment('growthyself').calculateScore(this.answersMap().growthyself));
  readonly mocaScore = computed(() => getAssessment('moca').calculateScore(this.answersMap().moca));
  readonly auditcScore = computed(() => getAssessment('auditc').calculateScore(this.answersMap().auditc));
  readonly sarcfScore = computed(() => getAssessment('sarcf').calculateScore(this.answersMap().sarcf));
  readonly dn4Score = computed(() => getAssessment('dn4').calculateScore(this.answersMap().dn4));
  readonly sibiScore = computed(() => getAssessment('sibi').calculateScore(this.answersMap().sibi));

  // STAT Suicide Safety & Crisis Escalation (PHQ-9 Item 9 >= 1 or positive C-SSRS)
  readonly phq9Item9Score = computed(() => Number(this.answersMap().phq9[PHQ9_ITEM_9_ID]) || 0);
  readonly phq9SuicidalIdeationTriggered = computed(() => hasPhq9Item9SuicidalIdeation(this.answersMap().phq9));
  readonly statSuicideEscalation = computed<IStatSuicideEscalation>(() => {
    const phq9Item9 = this.phq9Item9Score();
    const cssrs = this.cssrsScore();
    const dispatch = this.emergencyGuard.resolveDispatchGuidance();
    const triggeredByPhq9 = phq9Item9 >= 1;
    const triggeredByCssrs = cssrs >= 1;
    const isActive = triggeredByPhq9 || triggeredByCssrs;
    const triggerSource =
      triggeredByPhq9 && triggeredByCssrs
        ? 'PHQ9_ITEM_9_AND_CSSRS'
        : triggeredByPhq9
          ? 'PHQ9_ITEM_9'
          : triggeredByCssrs
            ? 'CSSRS'
            : null;
    const evaluation = isActive
      ? this.emergencyGuard.evaluate(
          {
            phq9Item9Score: phq9Item9,
            cssrsScore: cssrs
          },
          { recordState: false }
        )
      : null;

    return {
      isActive,
      acuity: isActive ? 'STAT_EMERGENCY' : 'ROUTINE',
      triggerSource,
      phq9Item9Score: phq9Item9,
      cssrsScore: cssrs,
      crisisNumber: dispatch.crisisNumber,
      crisisServiceName: dispatch.crisisServiceName,
      emergencyNumber: dispatch.emergencyNumber,
      jurisdictionId: dispatch.jurisdictionId,
      protocolMarkdown: evaluation?.deterministicProtocolMarkdown || '',
      evaluation
    };
  });

  // Backward-compatible computed tiers
  readonly phq9Tier = computed(() => this.calcTier('phq9', this.phq9Score(), this.answersMap().phq9));
  readonly gad7Tier = computed(() => this.calcTier('gad7', this.gad7Score()));
  readonly isiTier = computed(() => this.calcTier('isi', this.isiScore()));
  readonly cssrsTier = computed(() => this.calcTier('cssrs', this.cssrsScore()));
  readonly cvsqTier = computed(() => this.calcTier('cvsq', this.cvsqScore()));
  readonly mbiTier = computed(() => this.calcTier('mbi', this.mbiScore()));
  readonly ros14Tier = computed(() => this.calcTier('ros14', this.ros14Score()));
  readonly phq15Tier = computed(() => this.calcTier('phq15', this.phq15Score()));
  readonly prapareTier = computed(() => this.calcTier('prapare', this.prapareScore()));
  readonly ayurvedaTier = computed(() => this.calcTier('ayurveda', this.ayurvedaScore()));
  readonly tcmTier = computed(() => this.calcTier('tcm', this.tcmScore()));
  readonly growThyselfTier = computed(() => this.calcTier('growthyself', this.growThyselfScore()));
  readonly mocaTier = computed(() => this.calcTier('moca', this.mocaScore()));
  readonly auditcTier = computed(() => this.calcTier('auditc', this.auditcScore()));
  readonly sarcfTier = computed(() => this.calcTier('sarcf', this.sarcfScore()));
  readonly dn4Tier = computed(() => this.calcTier('dn4', this.dn4Score()));
  readonly sibiTier = computed(() => this.calcTier('sibi', this.sibiScore()));

  // Subscale Breakdowns
  readonly doshaBreakdown = computed(() => getAssessment('ayurveda').calculateBreakdown?.(this.answersMap().ayurveda) || { vata: 0, pitta: 0, kapha: 0 });
  readonly tcmBreakdown = computed(() => getAssessment('tcm').calculateBreakdown?.(this.answersMap().tcm) || { yin: 0, yang: 0, qi: 0, blood: 0, heat: 0, cold: 0 });
  readonly growThyselfBreakdown = computed(() => getAssessment('growthyself').calculateBreakdown?.(this.answersMap().growthyself) || { purpose: 0, somatic: 0, nutrition: 0, emotional: 0, cognitive: 0 });
  readonly mbiBreakdown = computed(() => getAssessment('mbi').calculateBreakdown?.(this.answersMap().mbi) || { ee: 0, dp: 0, pa: 0 });

  private calcTier(type: AssessmentType, score: number, answers?: Record<number, number>): ISeverityTier {
    if (type === 'phq9') {
      const phq9Answers = answers ?? this.answersMap().phq9;
      if (hasPhq9Item9SuicidalIdeation(phq9Answers)) {
        const dispatch = this.emergencyGuard.resolveDispatchGuidance();
        return resolvePhq9SeverityTier(phq9Answers, score, dispatch);
      }
    }
    const def = getAssessment(type);
    return def.tiers.find(t => score >= t.min && score <= t.max) || def.tiers[0];
  }

  setAnswer(type: AssessmentType, questionId: number, value: number) {
    this.answersMap.update(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [questionId]: value
      }
    }));

    // Auto sync to 3D anatomy if mapper exists
    const def = getAssessment(type);
    const targetPart = def.mapToAnatomyPart?.(questionId, value);
    if (targetPart && typeof this.patientState?.selectPart === 'function') {
      this.patientState.selectPart(targetPart);
    }

  }

  resetAssessment(type: AssessmentType) {
    this.answersMap.update(prev => ({
      ...prev,
      [type]: {}
    }));
  }

  recordToTimeline(type: AssessmentType): IAssessmentPayload | null {
    const patientMgmt = this.injector.get(PatientManagementService);
    const patientId = patientMgmt.selectedPatientId();
    const patient = patientMgmt.selectedPatient();
    if (!patientId || !patient) return null;

    const def = getAssessment(type);
    const answers = this.answersMap()[type] || {};
    const totalScore = def.calculateScore(answers);
    const maxScore = def.maxScore;
    const tier = this.calcTier(type, totalScore, answers);
    const breakdown = def.calculateBreakdown?.(answers);

    const payload: IAssessmentPayload = {
      id: `assessment_${type}_${Date.now()}`,
      type,
      title: def.title,
      patientId,
      dateCreated: new Date().toISOString(),
      answers,
      totalScore,
      maxScore,
      severityLabel: tier.label,
      recommendation: tier.recommendation,
      doshaBreakdown: type === 'ayurveda' ? breakdown : undefined,
      tcmBreakdown: type === 'tcm' ? breakdown : undefined,
      growThyselfBreakdown: type === 'growthyself' ? breakdown : undefined,
      mbiBreakdown: type === 'mbi' ? breakdown : undefined
    };

    const entryType = `ClinicalAssessment_${type.toUpperCase()}`;
    const cleanedHistory = patient.history.filter((h: any) => h.type !== entryType);
    const newEntry: HistoryEntry = {
      type: entryType as any,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: `${def.title} Completed (Score: ${totalScore}/${maxScore} — ${tier.label})`,
      report: payload as any
    } as any;

    patient.history = [...cleanedHistory, newEntry];
    this.storage.savePatient(patient);

    return payload;
  }

  /** Backwards-compatible alias for recordToTimeline */
  commitToTimeline(type: AssessmentType): IAssessmentPayload | null {
    return this.recordToTimeline(type);
  }
}