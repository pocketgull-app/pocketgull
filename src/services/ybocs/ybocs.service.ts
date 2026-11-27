// SPDX-License-Identifier: Apache-2.0
import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { SymptomResponse, Assessment, IYbocsOutcomeValidation } from './types';
import {
  symptomItems,
  getSeverityCategory,
  getOutcomeValidation,
  EGO_DYSTONIC_INTRUSIVE_IDS,
  HARM_CONCERN_IDS
} from './data';
import { PatientManagementService } from '../patient-management.service';
import { PatientStateService } from '../patient-state.service';
import { StorageService } from '../storage.service';
import { SecureStorageService } from '../secure-storage.service';
import { HistoryEntry, IYbocsHistoryEntry } from '../patient.types';

const GUEST_YBOCS_STORAGE_KEY = 'ybocs_guest_assessment_v1';

export interface IYbocsSaveResult {
  persistedTo: 'patient_timeline' | 'local_guest';
  totalScore: number;
  severityName: string;
  assessmentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class YbocsService {
  private patientMgmt = inject(PatientManagementService);
  private patientState = inject(PatientStateService, { optional: true });
  private storage = inject(StorageService);
  private secureStorage = inject(SecureStorageService, { optional: true });

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

  /** Q11 Insight is clinically tracked as a separate specifier and excluded from the /40 total. */
  readonly insightScore = computed<number | null>(() => {
    const val = this.severityAnswers()[11];
    return typeof val === 'number' ? val : null;
  });

  readonly answeredCoreCount = computed(() => {
    const answers = this.severityAnswers();
    let count = 0;
    for (let id = 1; id <= 10; id++) {
      if (typeof answers[id] === 'number') count++;
    }
    return count;
  });

  readonly severityDetails = computed(() => {
    return getSeverityCategory(this.totalScore());
  });

  readonly hasEgoDystonicChecked = computed(() => {
    const answers = this.checklistAnswers();
    for (const id of EGO_DYSTONIC_INTRUSIVE_IDS) {
      if (answers[id]?.current || answers[id]?.past) {
        return true;
      }
    }
    return false;
  });

  readonly hasHarmConcernCurrent = computed(() => {
    const answers = this.checklistAnswers();
    for (const id of HARM_CONCERN_IDS) {
      if (answers[id]?.current) {
        return true;
      }
    }
    return false;
  });

  readonly currentSymptomSummary = computed(() => {
    const answers = this.checklistAnswers();
    const obsessions = symptomItems.filter((i) => i.isObsession && answers[i.id]?.current);
    const compulsions = symptomItems.filter((i) => !i.isObsession && answers[i.id]?.current);
    return { obsessions, compulsions };
  });

  /** Prior recorded Y-BOCS score from an earlier date/session for longitudinal progress feedback. */
  readonly previousRecordedScore = computed<{ score: number; date: string } | null>(() => {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient?.history?.length) return null;
    const currentId = this.getCurrentAssessmentId(patient.id);
    const priorEntries = patient.history.filter((h): h is IYbocsHistoryEntry => {
      if (h?.type !== 'Y-BOCsAssessment') return false;
      const payload = (h as IYbocsHistoryEntry).assessment || (h as unknown as { report?: Assessment }).report;
      return !!payload && payload.id !== currentId && typeof payload.totalScore === 'number';
    });
    if (priorEntries.length === 0) return null;
    const prev = priorEntries[priorEntries.length - 1];
    const payload = prev.assessment || (prev as unknown as { report?: Assessment }).report;
    return payload ? { score: payload.totalScore, date: prev.date } : null;
  });

  readonly scoreDelta = computed<number | null>(() => {
    const prev = this.previousRecordedScore();
    if (!prev || this.answeredCoreCount() === 0) return null;
    return this.totalScore() - prev.score;
  });

  readonly outcomeValidation = computed<IYbocsOutcomeValidation>(() => {
    return getOutcomeValidation({
      totalScore: this.totalScore(),
      obsessionSubtotal: this.obsessionSubtotal(),
      compulsiveSubtotal: this.compulsiveSubtotal(),
      insightScore: this.insightScore(),
      hasEgoDystonicChecked: this.hasEgoDystonicChecked(),
      hasHarmConcernCurrent: this.hasHarmConcernCurrent(),
      answeredCoreCount: this.answeredCoreCount()
    });
  });

  constructor() {
    // Automatically load existing Y-BOCs assessment when the active patient changes
    effect(() => {
      const patient = this.patientMgmt.selectedPatient();
      untracked(() => {
        if (patient) {
          const latestYDocs = (patient.history || []).filter(
            (h): h is IYbocsHistoryEntry => h?.type === 'Y-BOCsAssessment'
          );
          if (latestYDocs.length > 0) {
            const entry = latestYDocs[latestYDocs.length - 1];
            const latest = entry.assessment || (entry as unknown as { report?: Assessment }).report;
            if (latest) {
              this.loadAssessment(latest as Assessment);
              return;
            }
          }
          this.clearFormStateOnly();
        } else {
          this.loadGuestAssessmentOrClear();
        }
      });
    });
  }

  private getCurrentAssessmentId(patientId?: string | null): string {
    return `ybocs_${patientId || 'guest'}_${new Date(this.dateCreated()).getTime()}`;
  }

  private clearFormStateOnly(): void {
    this.checklistAnswers.set({});
    this.upsettingObsessionId.set(null);
    this.upsettingCompulsionId.set(null);
    this.severityAnswers.set({});
    this.dateCreated.set(new Date().toISOString());
  }

  private loadGuestAssessmentOrClear(): void {
    const raw = this.secureStorage?.getItem(GUEST_YBOCS_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Assessment;
        if (parsed && typeof parsed === 'object') {
          this.loadAssessment(parsed);
          return;
        }
      } catch {
        // Fall through to clean state if guest cache is malformed
      }
    }
    this.clearFormStateOnly();
  }

  toggleChecklist(symptomId: number, type: 'past' | 'current'): void {
    this.checklistAnswers.update((prev) => {
      const currentVal = prev[symptomId] || { past: false, current: false };
      const updated = { ...currentVal, [type]: !currentVal[type] };
      return { ...prev, [symptomId]: updated };
    });
    this.autoSaveToPatientHistory();
  }

  setSeverityScore(questionId: number, score: number): void {
    const bounded = Math.max(0, Math.min(4, Math.round(score)));
    this.severityAnswers.update((prev) => ({
      ...prev,
      [questionId]: bounded
    }));
    this.autoSaveToPatientHistory();
  }

  setUpsettingObsession(id: number | null): void {
    this.upsettingObsessionId.set(this.upsettingObsessionId() === id ? null : id);
    this.autoSaveToPatientHistory();
  }

  setUpsettingCompulsion(id: number | null): void {
    this.upsettingCompulsionId.set(this.upsettingCompulsionId() === id ? null : id);
    this.autoSaveToPatientHistory();
  }

  /**
   * Resets active form answers safely while returning a restorable snapshot for Undo.
   * Preserves historical patient timeline entries unless `clearHistory` is explicitly true.
   */
  resetAssessment(clearHistory: boolean = false): Assessment {
    const snapshot = this.getAssessmentPayload();
    this.clearFormStateOnly();

    if (!clearHistory) {
      const patientId = this.patientMgmt.selectedPatientId();
      if (!patientId) {
        this.secureStorage?.removeItem(GUEST_YBOCS_STORAGE_KEY);
      }
      return snapshot;
    }

    const patientId = this.patientMgmt.selectedPatientId();
    if (patientId) {
      let updatedPatientRef: import('../patient.types').IPatient | null = null;
      this.patientMgmt.patients.update((patients) =>
        patients.map((p) => {
          if (p.id !== patientId) return p;
          const filteredHistory = (p.history || []).filter((h) => h.type !== 'Y-BOCsAssessment');
          const next = { ...p, history: filteredHistory, ybocsScore: undefined };
          updatedPatientRef = next;
          return next;
        })
      );
      if (updatedPatientRef) {
        this.patientState?.patientHistory.set((updatedPatientRef as import('../patient.types').IPatient).history);
        this.storage.savePatient(updatedPatientRef);
      }
    } else {
      this.secureStorage?.removeItem(GUEST_YBOCS_STORAGE_KEY);
    }

    return snapshot;
  }

  /** Restores a previously captured assessment snapshot (Undo Reset safety net). */
  restoreAssessment(snapshot: Assessment): void {
    if (!snapshot) return;
    this.loadAssessment(snapshot);
    this.autoSaveToPatientHistory();
  }

  loadAssessment(assessment: Assessment): void {
    if (!assessment) {
      this.clearFormStateOnly();
      return;
    }
    this.checklistAnswers.set(assessment.checklistAnswers || {});
    this.upsettingObsessionId.set(assessment.upsettingObsessionId ?? null);
    this.upsettingCompulsionId.set(assessment.upsettingCompulsionId ?? null);
    this.severityAnswers.set(assessment.severityAnswers || {});
    this.dateCreated.set(assessment.dateCreated || new Date().toISOString());
  }

  getAssessmentPayload(): Assessment {
    const patient = this.patientMgmt.selectedPatient();
    return {
      id: this.getCurrentAssessmentId(patient?.id),
      patientInfo: {
        // HIPAA Safe Harbor: never embed direct personal identifiers inside exportable payload
        name: patient?.id ? `Subject ${patient.id}` : 'Guest Subject',
        dob: '',
        date: new Date(this.dateCreated()).toISOString().split('T')[0]
      },
      checklistAnswers: this.checklistAnswers(),
      upsettingObsessionId: this.upsettingObsessionId(),
      upsettingCompulsionId: this.upsettingCompulsionId(),
      severityAnswers: this.severityAnswers(),
      obsessionSubtotal: this.obsessionSubtotal(),
      compulsiveSubtotal: this.compulsiveSubtotal(),
      totalScore: this.totalScore(),
      insightScore: this.insightScore(),
      severityCategory: this.severityDetails().name,
      dateCreated: this.dateCreated()
    };
  }

  saveCurrentAssessment(): IYbocsSaveResult {
    return this.autoSaveToPatientHistory();
  }

  /**
   * Builds a calm, HIPAA-Safe-Harbor 30-second Visit Prep Brief the patient can share with
   * a clinician or therapist without having to explain every intrusive thought from scratch.
   */
  buildClinicianVisitBrief(): string {
    const payload = this.getAssessmentPayload();
    const validation = this.outcomeValidation();
    const { obsessions, compulsions } = this.currentSymptomSummary();
    const focusObs = symptomItems.find((i) => i.id === payload.upsettingObsessionId);
    const focusComp = symptomItems.find((i) => i.id === payload.upsettingCompulsionId);
    const prev = this.previousRecordedScore();
    const delta = this.scoreDelta();

    const lines: string[] = [
      'POCKET-GULL — Y-BOCS VISIT PREP BRIEF [EXPLORATORY • NON-DIAGNOSTIC]',
      `Date: ${payload.patientInfo.date} | Core Questions Rated: ${this.answeredCoreCount()}/10`,
      `Total Score: ${payload.totalScore}/40 (${validation.severityName}) — Obsessions ${payload.obsessionSubtotal}/20 | Compulsions ${payload.compulsiveSubtotal}/20`
    ];

    if (prev && delta !== null) {
      const dir = delta === 0 ? 'unchanged' : delta < 0 ? `down ${Math.abs(delta)} pts` : `up ${delta} pts`;
      lines.push(`Longitudinal Change: ${dir} compared to ${prev.score}/40 on ${prev.date}`);
    }

    if (validation.insightNote) {
      lines.push(`Insight Specifier (Q11): ${validation.insightNote}`);
    }

    if (focusObs) {
      lines.push(`Primary Focus Obsession: ${focusObs.text}`);
    }
    if (focusComp) {
      lines.push(`Primary Focus Compulsion: ${focusComp.text}`);
    }

    if (obsessions.length > 0) {
      lines.push(`Current Obsession Themes (${obsessions.length}): ${obsessions.slice(0, 6).map((o) => o.text).join('; ')}`);
    }
    if (compulsions.length > 0) {
      lines.push(`Current Compulsion Themes (${compulsions.length}): ${compulsions.slice(0, 6).map((c) => c.text).join('; ')}`);
    }

    if (this.hasEgoDystonicChecked()) {
      lines.push('Clinical Context Note: Ego-dystonic intrusive thought themes endorsed; please discuss ERP-informed framing.');
    }

    lines.push('Questions for My Clinician:');
    lines.push('1. Based on this severity band and pattern, would Exposure & Response Prevention (ERP) or medication review help?');
    lines.push('2. What is one realistic, low-overwhelm first step we can practice between visits?');
    lines.push('Notice: Self-rated screening brief for conversation prep only; formal diagnosis requires a licensed clinician.');

    return lines.join('\n');
  }

  private autoSaveToPatientHistory(): IYbocsSaveResult {
    const payload = this.getAssessmentPayload();
    const patientId = this.patientMgmt.selectedPatientId();

    if (!patientId) {
      this.secureStorage?.setItem(GUEST_YBOCS_STORAGE_KEY, JSON.stringify(payload));
      return {
        persistedTo: 'local_guest',
        totalScore: payload.totalScore,
        severityName: payload.severityCategory,
        assessmentId: payload.id
      };
    }

    const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const newEntry: IYbocsHistoryEntry & { report?: Assessment } = {
      type: 'Y-BOCsAssessment',
      date: formattedDate,
      summary: `Y-BOCS Assessment (${payload.totalScore}/40 — ${payload.severityCategory})`,
      assessment: payload,
      // Sankofa backward-compatible alias for legacy readers
      report: payload
    };

    let updatedPatient: import('../patient.types').IPatient | null = null;
    this.patientMgmt.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;
        const existingHistory = p.history || [];
        // Replace only the current session's record (same id or same date); preserve prior longitudinal dates
        const preservedHistory = existingHistory.filter((h) => {
          if (h.type !== 'Y-BOCsAssessment') return true;
          const existingPayload =
            (h as IYbocsHistoryEntry).assessment || (h as unknown as { report?: Assessment }).report;
          if (existingPayload?.id && existingPayload.id === payload.id) return false;
          if (h.date === formattedDate) return false;
          return true;
        });

        const nextHistory: HistoryEntry[] = [...preservedHistory, newEntry];
        const nextPatient: import('../patient.types').IPatient = {
          ...p,
          ybocsScore: payload.totalScore,
          history: nextHistory
        };
        updatedPatient = nextPatient;
        return nextPatient;
      })
    );

    if (updatedPatient) {
      this.patientState?.patientHistory.set((updatedPatient as import('../patient.types').IPatient).history);
      this.storage.savePatient(updatedPatient);
      return {
        persistedTo: 'patient_timeline',
        totalScore: payload.totalScore,
        severityName: payload.severityCategory,
        assessmentId: payload.id
      };
    }

    this.secureStorage?.setItem(GUEST_YBOCS_STORAGE_KEY, JSON.stringify(payload));
    return {
      persistedTo: 'local_guest',
      totalScore: payload.totalScore,
      severityName: payload.severityCategory,
      assessmentId: payload.id
    };
  }
}

export { YbocsService as YbocsStateService };
