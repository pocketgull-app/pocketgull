import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { SymptomItem, SymptomCategory, SymptomResponse, SeverityQuestion, Assessment } from './types';
import { symptomItems, severityQuestions, getSeverityCategory } from './data';
import { PatientManagementService } from '../patient-management.service';
import { StorageService } from '../storage.service';
import { HistoryEntry } from '../patient.types';

@Injectable({
  providedIn: 'root'
})
export class YbocsService {
  private patientMgmt = inject(PatientManagementService);
  private storage = inject(StorageService);

  // --- Assessment State Signals ---
  readonly checklistAnswers = signal<Record<number, SymptomResponse>>({});
  readonly upsettingObsessionId = signal<number | null>(null);
  readonly upsettingCompulsionId = signal<number | null>(null);
  readonly severityAnswers = signal<Record<number, number>>({});
  readonly dateCreated = signal<string>(new Date().toISOString());

  // --- Computed Scores ---
  readonly obsessionSubtotal = computed(() => {
    let sum = 0;
    const answers = this.severityAnswers();
    // Q1-5 are obsession-related
    for (let id = 1; id <= 5; id++) {
      sum += answers[id] || 0;
    }
    return sum;
  });

  readonly compulsiveSubtotal = computed(() => {
    let sum = 0;
    const answers = this.severityAnswers();
    // Q6-10 are compulsion-related
    for (let id = 6; id <= 10; id++) {
      sum += answers[id] || 0;
    }
    return sum;
  });

  readonly totalScore = computed(() => {
    return this.obsessionSubtotal() + this.compulsiveSubtotal();
  });

  readonly severityDetails = computed(() => {
    return getSeverityCategory(this.totalScore());
  });

  constructor() {
    // Automatically load existing Y-BOCs assessment when the active patient changes
    effect(() => {
      const patient = this.patientMgmt.selectedPatient();
      untracked(() => {
        if (patient) {
          const latestYDocs = patient.history.filter((h: any) => h.type === 'Y-BOCsAssessment') as any[];
          if (latestYDocs.length > 0) {
            // Sort by date/timestamp and load latest
            const entry = latestYDocs[latestYDocs.length - 1];
            const latest = entry.assessment || entry.report;
            if (latest) {
              this.loadAssessment(latest);
            } else {
              this.resetAssessment();
            }
          } else {
            this.resetAssessment();
          }
        } else {
          this.resetAssessment();
        }
      });
    });
  }

  toggleChecklist(symptomId: number, type: 'past' | 'current') {
    this.checklistAnswers.update(prev => {
      const currentVal = prev[symptomId] || { past: false, current: false };
      const updated = { ...currentVal, [type]: !currentVal[type] };
      return { ...prev, [symptomId]: updated };
    });
    this.autoSaveToPatientHistory();
  }

  setSeverityScore(questionId: number, score: number) {
    this.severityAnswers.update(prev => ({
      ...prev,
      [questionId]: score
    }));
    this.autoSaveToPatientHistory();
  }

  setUpsettingObsession(id: number | null) {
    this.upsettingObsessionId.set(id);
    this.autoSaveToPatientHistory();
  }

  setUpsettingCompulsion(id: number | null) {
    this.upsettingCompulsionId.set(id);
    this.autoSaveToPatientHistory();
  }

  resetAssessment() {
    this.checklistAnswers.set({});
    this.upsettingObsessionId.set(null);
    this.upsettingCompulsionId.set(null);
    this.severityAnswers.set({});
    this.dateCreated.set(new Date().toISOString());

    const patientId = this.patientMgmt.selectedPatientId();
    if (patientId) {
      const patient = this.patientMgmt.patients().find(p => p.id === patientId);
      if (patient) {
        patient.history = patient.history.filter((h: any) => h.type !== 'Y-BOCsAssessment');
        this.storage.savePatient(patient);
      }
    }
  }

  loadAssessment(assessment: Assessment) {
    if (!assessment) {
      this.resetAssessment();
      return;
    }
    this.checklistAnswers.set(assessment.checklistAnswers || {});
    this.upsettingObsessionId.set(assessment.upsettingObsessionId);
    this.upsettingCompulsionId.set(assessment.upsettingCompulsionId);
    this.severityAnswers.set(assessment.severityAnswers || {});
    this.dateCreated.set(assessment.dateCreated || new Date().toISOString());
  }

  getAssessmentPayload(): Assessment {
    const patient = this.patientMgmt.selectedPatient();
    return {
      id: `ybocs_${patient?.id || 'guest'}_${new Date(this.dateCreated()).getTime()}`,
      patientInfo: {
        name: patient?.name || 'Guest Patient',
        dob: (patient as any)?.dob || '',
        date: new Date(this.dateCreated()).toLocaleDateString()
      },
      checklistAnswers: this.checklistAnswers(),
      upsettingObsessionId: this.upsettingObsessionId(),
      upsettingCompulsionId: this.upsettingCompulsionId(),
      severityAnswers: this.severityAnswers(),
      obsessionSubtotal: this.obsessionSubtotal(),
      compulsiveSubtotal: this.compulsiveSubtotal(),
      totalScore: this.totalScore(),
      severityCategory: this.severityDetails().name,
      dateCreated: this.dateCreated()
    };
  }

  saveCurrentAssessment() {
    this.autoSaveToPatientHistory();
  }

  private autoSaveToPatientHistory() {
    const patientId = this.patientMgmt.selectedPatientId();
    if (!patientId) return;

    const payload = this.getAssessmentPayload();
    const patient = this.patientMgmt.patients().find(p => p.id === patientId);
    if (!patient) return;

    // Filter out existing Y-BOCs assessments and replace/append the latest
    const cleanedHistory = patient.history.filter((h: any) => h.type !== 'Y-BOCsAssessment');
    const newEntry: HistoryEntry = {
      type: 'Y-BOCsAssessment' as any,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: `Y-BOCs Neuropsychiatric Assessment completed (Score: ${payload.totalScore} - ${payload.severityCategory})`,
      report: payload as any
    } as any;

    // Direct mutation of history for state sync
    patient.history = [...cleanedHistory, newEntry];
    this.storage.savePatient(patient);
  }
}

export { YbocsService as YbocsStateService };
