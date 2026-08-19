import { Injectable, inject, signal, computed } from '@angular/core';
import { AssessmentType, IAssessmentPayload, ISeverityTier } from './types';
import { 
  PHQ9_QUESTIONS, PHQ9_TIERS, 
  GAD7_QUESTIONS, GAD7_TIERS, 
  ISI_QUESTIONS, ISI_TIERS, 
  CSSRS_QUESTIONS, CSSRS_TIERS,
  ROS14_QUESTIONS, ROS14_TIERS,
  PHQ15_QUESTIONS, PHQ15_TIERS,
  PRAPARE_QUESTIONS, PRAPARE_TIERS,
  AYURVEDA_QUESTIONS, AYURVEDA_TIERS,
  TCM_QUESTIONS, TCM_TIERS,
  GROW_THYSELF_QUESTIONS, GROW_THYSELF_TIERS,
  MOCA_QUESTIONS, MOCA_TIERS,
  AUDITC_QUESTIONS, AUDITC_TIERS,
  SARCF_QUESTIONS, SARCF_TIERS,
  DN4_QUESTIONS, DN4_TIERS,
  SIBI_QUESTIONS, SIBI_TIERS
} from './data';
import { PatientManagementService } from '../patient-management.service';
import { PatientStateService } from '../patient-state.service';
import { StorageService } from '../storage.service';
import { HistoryEntry } from '../patient.types';

@Injectable({
  providedIn: 'root'
})
export class ClinicalAssessmentsService {
  private patientMgmt = inject(PatientManagementService);
  private patientState = inject(PatientStateService);
  private storage = inject(StorageService);

  readonly activeTab = signal<AssessmentType>('phq9');

  readonly phq9Answers = signal<Record<number, number>>({});
  readonly gad7Answers = signal<Record<number, number>>({});
  readonly isiAnswers = signal<Record<number, number>>({});
  readonly cssrsAnswers = signal<Record<number, number>>({});
  readonly ros14Answers = signal<Record<number, number>>({});
  readonly phq15Answers = signal<Record<number, number>>({});
  readonly prapareAnswers = signal<Record<number, number>>({});
  readonly ayurvedaAnswers = signal<Record<number, number>>({});
  readonly tcmAnswers = signal<Record<number, number>>({});
  readonly growThyselfAnswers = signal<Record<number, number>>({});
  readonly mocaAnswers = signal<Record<number, number>>({});
  readonly auditcAnswers = signal<Record<number, number>>({});
  readonly sarcfAnswers = signal<Record<number, number>>({});
  readonly dn4Answers = signal<Record<number, number>>({});
  readonly sibiAnswers = signal<Record<number, number>>({});

  // Computed Scores
  readonly phq9Score = computed(() => Object.values(this.phq9Answers()).reduce((a, b) => a + b, 0));
  readonly gad7Score = computed(() => Object.values(this.gad7Answers()).reduce((a, b) => a + b, 0));
  readonly isiScore = computed(() => Object.values(this.isiAnswers()).reduce((a, b) => a + b, 0));
  readonly cssrsScore = computed(() => Object.values(this.cssrsAnswers()).reduce((a, b) => a + b, 0));
  readonly ros14Score = computed(() => Object.values(this.ros14Answers()).reduce((a, b) => a + b, 0));
  readonly phq15Score = computed(() => Object.values(this.phq15Answers()).reduce((a, b) => a + b, 0));
  readonly prapareScore = computed(() => Object.values(this.prapareAnswers()).reduce((a, b) => a + b, 0));
  readonly ayurvedaScore = computed(() => Object.values(this.ayurvedaAnswers()).reduce((a, b) => a + b, 0));
  readonly tcmScore = computed(() => Object.values(this.tcmAnswers()).reduce((a, b) => a + b, 0));
  readonly growThyselfScore = computed(() => Object.values(this.growThyselfAnswers()).reduce((a, b) => a + b, 0));
  readonly mocaScore = computed(() => Object.values(this.mocaAnswers()).reduce((a, b) => a + b, 0));
  readonly auditcScore = computed(() => Object.values(this.auditcAnswers()).reduce((a, b) => a + b, 0));
  readonly sarcfScore = computed(() => Object.values(this.sarcfAnswers()).reduce((a, b) => a + b, 0));
  readonly dn4Score = computed(() => Object.values(this.dn4Answers()).reduce((a, b) => a + b, 0));
  readonly sibiScore = computed(() => Object.values(this.sibiAnswers()).reduce((a, b) => a + b, 0));

  // Ayurvedic Doshic Breakdown (Vata, Pitta, Kapha)
  readonly doshaBreakdown = computed(() => {
    const ans = this.ayurvedaAnswers();
    let vata = 0, pitta = 0, kapha = 0;
    AYURVEDA_QUESTIONS.forEach(q => {
      const val = ans[q.id] || 0;
      if (q.doshaVector === 'vata') vata += val;
      if (q.doshaVector === 'pitta') pitta += val;
      if (q.doshaVector === 'kapha') kapha += val;
    });
    return { vata, pitta, kapha };
  });

  // TCM Ba Gang Pattern Breakdown (Yin, Yang, Qi, Blood, Heat, Cold)
  readonly tcmBreakdown = computed(() => {
    const ans = this.tcmAnswers();
    let yin = 0, yang = 0, qi = 0, blood = 0, heat = 0, cold = 0;
    TCM_QUESTIONS.forEach(q => {
      const val = ans[q.id] || 0;
      if (q.tcmVector === 'yin') yin += val;
      if (q.tcmVector === 'yang') yang += val;
      if (q.tcmVector === 'qi') qi += val;
      if (q.tcmVector === 'blood') blood += val;
      if (q.tcmVector === 'heat') heat += val;
      if (q.tcmVector === 'cold') cold += val;
    });
    return { yin, yang, qi, blood, heat, cold };
  });

  // Grow-Thyself Domain Breakdown
  readonly growThyselfBreakdown = computed(() => {
    const ans = this.growThyselfAnswers();
    let purpose = 0, somatic = 0, nutrition = 0, emotional = 0, cognitive = 0;
    GROW_THYSELF_QUESTIONS.forEach(q => {
      const val = ans[q.id] || 0;
      if (q.growDomain === 'purpose') purpose += val;
      if (q.growDomain === 'somatic') somatic += val;
      if (q.growDomain === 'nutrition') nutrition += val;
      if (q.growDomain === 'emotional') emotional += val;
      if (q.growDomain === 'cognitive') cognitive += val;
    });
    return { purpose, somatic, nutrition, emotional, cognitive };
  });

  // Computed Tiers
  readonly phq9Tier = computed<ISeverityTier>(() => {
    const s = this.phq9Score();
    return PHQ9_TIERS.find(t => s >= t.min && s <= t.max) || PHQ9_TIERS[0];
  });

  readonly gad7Tier = computed<ISeverityTier>(() => {
    const s = this.gad7Score();
    return GAD7_TIERS.find(t => s >= t.min && s <= t.max) || GAD7_TIERS[0];
  });

  readonly isiTier = computed<ISeverityTier>(() => {
    const s = this.isiScore();
    return ISI_TIERS.find(t => s >= t.min && s <= t.max) || ISI_TIERS[0];
  });

  readonly cssrsTier = computed<ISeverityTier>(() => {
    const s = this.cssrsScore();
    return CSSRS_TIERS.find(t => s >= t.min && s <= t.max) || CSSRS_TIERS[0];
  });

  readonly ros14Tier = computed<ISeverityTier>(() => {
    const s = this.ros14Score();
    return ROS14_TIERS.find(t => s >= t.min && s <= t.max) || ROS14_TIERS[0];
  });

  readonly phq15Tier = computed<ISeverityTier>(() => {
    const s = this.phq15Score();
    return PHQ15_TIERS.find(t => s >= t.min && s <= t.max) || PHQ15_TIERS[0];
  });

  readonly prapareTier = computed<ISeverityTier>(() => {
    const s = this.prapareScore();
    return PRAPARE_TIERS.find(t => s >= t.min && s <= t.max) || PRAPARE_TIERS[0];
  });

  readonly ayurvedaTier = computed<ISeverityTier>(() => {
    const s = this.ayurvedaScore();
    return AYURVEDA_TIERS.find(t => s >= t.min && s <= t.max) || AYURVEDA_TIERS[0];
  });

  readonly tcmTier = computed<ISeverityTier>(() => {
    const s = this.tcmScore();
    return TCM_TIERS.find(t => s >= t.min && s <= t.max) || TCM_TIERS[0];
  });

  readonly growThyselfTier = computed<ISeverityTier>(() => {
    const s = this.growThyselfScore();
    return GROW_THYSELF_TIERS.find(t => s >= t.min && s <= t.max) || GROW_THYSELF_TIERS[0];
  });

  readonly mocaTier = computed<ISeverityTier>(() => {
    const s = this.mocaScore();
    return MOCA_TIERS.find(t => s >= t.min && s <= t.max) || MOCA_TIERS[0];
  });

  readonly auditcTier = computed<ISeverityTier>(() => {
    const s = this.auditcScore();
    return AUDITC_TIERS.find(t => s >= t.min && s <= t.max) || AUDITC_TIERS[0];
  });

  readonly sarcfTier = computed<ISeverityTier>(() => {
    const s = this.sarcfScore();
    return SARCF_TIERS.find(t => s >= t.min && s <= t.max) || SARCF_TIERS[0];
  });

  readonly dn4Tier = computed<ISeverityTier>(() => {
    const s = this.dn4Score();
    return DN4_TIERS.find(t => s >= t.min && s <= t.max) || DN4_TIERS[0];
  });

  readonly sibiTier = computed<ISeverityTier>(() => {
    const s = this.sibiScore();
    return SIBI_TIERS.find(t => s >= t.min && s <= t.max) || SIBI_TIERS[0];
  });

  setAnswer(type: AssessmentType, questionId: number, value: number) {
    if (type === 'phq9') this.phq9Answers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'gad7') this.gad7Answers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'isi') this.isiAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'cssrs') this.cssrsAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'ros14') {
      this.ros14Answers.update(prev => ({ ...prev, [questionId]: value }));
      this.syncRos14ToSkelly(questionId, value);
    }
    else if (type === 'phq15') this.phq15Answers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'prapare') this.prapareAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'ayurveda') {
      this.ayurvedaAnswers.update(prev => ({ ...prev, [questionId]: value }));
      this.syncAyurvedaToSkelly(questionId, value);
    }
    else if (type === 'tcm') {
      this.tcmAnswers.update(prev => ({ ...prev, [questionId]: value }));
      this.syncTcmToSkelly(questionId, value);
    }
    else if (type === 'growthyself') {
      this.growThyselfAnswers.update(prev => ({ ...prev, [questionId]: value }));
      this.syncGrowThyselfToSkelly(questionId, value);
    }
    else if (type === 'moca') this.mocaAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'auditc') this.auditcAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'sarcf') this.sarcfAnswers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'dn4') this.dn4Answers.update(prev => ({ ...prev, [questionId]: value }));
    else if (type === 'sibi') this.sibiAnswers.update(prev => ({ ...prev, [questionId]: value }));
  }

  resetAssessment(type: AssessmentType) {
    if (type === 'phq9') this.phq9Answers.set({});
    if (type === 'gad7') this.gad7Answers.set({});
    if (type === 'isi') this.isiAnswers.set({});
    if (type === 'cssrs') this.cssrsAnswers.set({});
    if (type === 'ros14') this.ros14Answers.set({});
    if (type === 'phq15') this.phq15Answers.set({});
    if (type === 'prapare') this.prapareAnswers.set({});
    if (type === 'ayurveda') this.ayurvedaAnswers.set({});
    if (type === 'tcm') this.tcmAnswers.set({});
    if (type === 'growthyself') this.growThyselfAnswers.set({});
    if (type === 'moca') this.mocaAnswers.set({});
    if (type === 'auditc') this.auditcAnswers.set({});
    if (type === 'sarcf') this.sarcfAnswers.set({});
    if (type === 'dn4') this.dn4Answers.set({});
    if (type === 'sibi') this.sibiAnswers.set({});
  }

  private syncRos14ToSkelly(questionId: number, value: number) {
    if (value !== 1) return;
    const q = ROS14_QUESTIONS.find(item => item.id === questionId);
    if (!q || !q.category) return;

    const categoryToPartId: Record<string, string> = {
      'Constitutional': 'systemic',
      'Eyes': 'head',
      'ENT / Mouth': 'head',
      'Cardiovascular': 'chest',
      'Respiratory': 'lungs',
      'Gastrointestinal': 'abdomen',
      'Genitourinary': 'pelvis',
      'Musculoskeletal': 'spine',
      'Integumentary / Skin': 'skin',
      'Neurological': 'brain',
      'Psychiatric': 'brain',
      'Endocrine': 'thyroid',
      'Hematological / Lymphatic': 'lymph',
      'Allergy / Immunology': 'systemic'
    };

    const targetPart = categoryToPartId[q.category] || 'chest';
    this.patientState.selectPart(targetPart);
  }

  private syncAyurvedaToSkelly(questionId: number, value: number) {
    if (value !== 1) return;
    const q = AYURVEDA_QUESTIONS.find(item => item.id === questionId);
    if (!q || !q.doshaVector) return;

    const vectorToPartId: Record<string, string> = {
      'vata': 'brain',
      'pitta': 'chest',
      'kapha': 'lungs'
    };
    this.patientState.selectPart(vectorToPartId[q.doshaVector] || 'brain');
  }

  private syncTcmToSkelly(questionId: number, value: number) {
    if (value !== 1) return;
    const q = TCM_QUESTIONS.find(item => item.id === questionId);
    if (!q || !q.tcmVector) return;

    const vectorToPartId: Record<string, string> = {
      'yang': 'spine',
      'heat': 'chest',
      'qi': 'lungs',
      'blood': 'heart',
      'yin': 'kidneys',
      'cold': 'abdomen'
    };
    this.patientState.selectPart(vectorToPartId[q.tcmVector] || 'abdomen');
  }

  private syncGrowThyselfToSkelly(questionId: number, value: number) {
    if (value >= 2) return; // Low score indicates area needing growth
    const q = GROW_THYSELF_QUESTIONS.find(item => item.id === questionId);
    if (!q || !q.growDomain) return;

    const domainToPartId: Record<string, string> = {
      'purpose': 'brain',
      'somatic': 'chest',
      'nutrition': 'abdomen',
      'emotional': 'heart',
      'cognitive': 'brain'
    };
    this.patientState.selectPart(domainToPartId[q.growDomain] || 'brain');
  }

  commitToTimeline(type: AssessmentType): IAssessmentPayload | null {
    const patientId = this.patientMgmt.selectedPatientId();
    const patient = this.patientMgmt.selectedPatient();
    if (!patientId || !patient) return null;

    let title = 'PHQ-9 Depression Screener';
    let answers = this.phq9Answers();
    let totalScore = this.phq9Score();
    let maxScore = 27;
    let tier = this.phq9Tier();
    let doshaBreakdown: any = undefined;
    let tcmBreakdown: any = undefined;
    let growThyselfBreakdown: any = undefined;

    if (type === 'gad7') {
      title = 'GAD-7 Generalized Anxiety Screener';
      answers = this.gad7Answers();
      totalScore = this.gad7Score();
      maxScore = 21;
      tier = this.gad7Tier();
    } else if (type === 'isi') {
      title = 'ISI Insomnia Severity Index';
      answers = this.isiAnswers();
      totalScore = this.isiScore();
      maxScore = 28;
      tier = this.isiTier();
    } else if (type === 'cssrs') {
      title = 'C-SSRS Columbia Suicide Safety Sentinel';
      answers = this.cssrsAnswers();
      totalScore = this.cssrsScore();
      maxScore = 16;
      tier = this.cssrsTier();
    } else if (type === 'ros14') {
      title = 'ROS-14 14-System Review of Systems';
      answers = this.ros14Answers();
      totalScore = this.ros14Score();
      maxScore = 14;
      tier = this.ros14Tier();
    } else if (type === 'phq15') {
      title = 'PHQ-15 Somatic Symptom Scale';
      answers = this.phq15Answers();
      totalScore = this.phq15Score();
      maxScore = 30;
      tier = this.phq15Tier();
    } else if (type === 'prapare') {
      title = 'PRAPARE SDOH Risk Assessment';
      answers = this.prapareAnswers();
      totalScore = this.prapareScore();
      maxScore = 11;
      tier = this.prapareTier();
    } else if (type === 'ayurveda') {
      title = 'Ayurvedic Prakriti / Vikriti Tridosha Scale';
      answers = this.ayurvedaAnswers();
      totalScore = this.ayurvedaScore();
      maxScore = 6;
      tier = this.ayurvedaTier();
      doshaBreakdown = this.doshaBreakdown();
    } else if (type === 'tcm') {
      title = 'TCM Shi Wen 10-Questions Ba Gang Profile';
      answers = this.tcmAnswers();
      totalScore = this.tcmScore();
      maxScore = 6;
      tier = this.tcmTier();
      tcmBreakdown = this.tcmBreakdown();
    } else if (type === 'growthyself') {
      title = 'Grow-Thyself Life Sovereignty & Epigenetic Index';
      answers = this.growThyselfAnswers();
      totalScore = this.growThyselfScore();
      maxScore = 15;
      tier = this.growThyselfTier();
      growThyselfBreakdown = this.growThyselfBreakdown();
    } else if (type === 'moca') {
      title = 'MoCA / Mini-Cog Rapid Cognitive Screener';
      answers = this.mocaAnswers();
      totalScore = this.mocaScore();
      maxScore = 12;
      tier = this.mocaTier();
    } else if (type === 'auditc') {
      title = 'AUDIT-C Alcohol Metabolic Screener';
      answers = this.auditcAnswers();
      totalScore = this.auditcScore();
      maxScore = 12;
      tier = this.auditcTier();
    } else if (type === 'sarcf') {
      title = 'SARC-F Sarcopenia & Frailty Index';
      answers = this.sarcfAnswers();
      totalScore = this.sarcfScore();
      maxScore = 10;
      tier = this.sarcfTier();
    } else if (type === 'dn4') {
      title = 'DN4 Neuropathic Pain Screener';
      answers = this.dn4Answers();
      totalScore = this.dn4Score();
      maxScore = 4;
      tier = this.dn4Tier();
    } else if (type === 'sibi') {
      title = 'SIBI Systemic Inflammatory Burden Index';
      answers = this.sibiAnswers();
      totalScore = this.sibiScore();
      maxScore = 8;
      tier = this.sibiTier();
    }

    const payload: IAssessmentPayload = {
      id: `assessment_${type}_${Date.now()}`,
      type,
      title,
      patientId,
      dateCreated: new Date().toISOString(),
      answers,
      totalScore,
      maxScore,
      severityLabel: tier.label,
      recommendation: tier.recommendation,
      doshaBreakdown,
      tcmBreakdown,
      growThyselfBreakdown
    };

    const entryType = `ClinicalAssessment_${type.toUpperCase()}`;
    const cleanedHistory = patient.history.filter((h: any) => h.type !== entryType);
    const newEntry: HistoryEntry = {
      type: entryType as any,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: `${title} Completed (Score: ${totalScore}/${maxScore} — ${tier.label})`,
      report: payload as any
    } as any;

    patient.history = [...cleanedHistory, newEntry];
    this.storage.savePatient(patient);

    return payload;
  }
}
