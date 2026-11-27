// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, signal, computed } from '@angular/core';
import { YbocsService } from '../services/ybocs/ybocs.service';
import { YbocsScreenerComponent } from './ybocs-screener.component';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { StorageService } from '../services/storage.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { FhirExportStrategyService } from '../services/export/fhir-export-strategy.service';
import { VoiceAssistantComponent } from './voice-assistant.component';
import { IPatient } from '../services/patient.types';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@angular/core')>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('Y-BOCS End-to-End Clicks, I/O Integrity & Outcome-Driven Patient Validation', () => {
  let ybocs: YbocsService;
  let component: YbocsScreenerComponent;
  let patientsSignal: ReturnType<typeof signal<IPatient[]>>;
  let selectedPatientIdSignal: ReturnType<typeof signal<string | null>>;
  let patientHistorySignal: ReturnType<typeof signal<any[]>>;
  let mockPatientState: {
    patientHistory: ReturnType<typeof signal<any[]>>;
    toggleLiveAgent: ReturnType<typeof vi.fn>;
    setLiveAgentWindowMode: ReturnType<typeof vi.fn>;
  };
  let mockStorage: { savePatient: ReturnType<typeof vi.fn> };
  let secureStoreMap: Map<string, string>;
  let mockSecureStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    const initialPatient: IPatient = {
      id: 'p_test_01',
      name: 'Alex Morgan',
      age: 34,
      gender: 'Female',
      lastVisit: '2026.05.19',
      preexistingConditions: [],
      patientGoals: 'Steady autonomic calm and ERP progress',
      issues: {},
      vitals: { bp: '118/76', hr: '68', temp: '98.4°F', spO2: '99%', weight: '140 lbs', height: '65 in' },
      history: [
        {
          type: 'Y-BOCsAssessment',
          date: '2026.05.19',
          summary: 'Prior baseline',
          assessment: {
            id: 'ybocs_p_test_01_1747665000000',
            patientInfo: { name: 'Subject p_test_01', dob: '', date: '2026-05-19' },
            checklistAnswers: {},
            upsettingObsessionId: null,
            upsettingCompulsionId: null,
            severityAnswers: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 2, 9: 2, 10: 1 },
            obsessionSubtotal: 15,
            compulsiveSubtotal: 11,
            totalScore: 26,
            severityCategory: 'Severe OCD',
            dateCreated: '2026-05-19T14:30:00.000Z'
          }
        }
      ],
      bookmarks: [],
      scans: []
    };

    patientsSignal = signal<IPatient[]>([initialPatient]);
    selectedPatientIdSignal = signal<string | null>('p_test_01');
    patientHistorySignal = signal<any[]>(initialPatient.history);

    const mockPatientMgmt = {
      patients: patientsSignal,
      selectedPatientId: selectedPatientIdSignal,
      selectedPatient: computed(() =>
        patientsSignal().find((p) => p.id === selectedPatientIdSignal()) || null
      )
    };

    mockPatientState = {
      patientHistory: patientHistorySignal,
      toggleLiveAgent: vi.fn(),
      setLiveAgentWindowMode: vi.fn()
    };

    mockStorage = {
      savePatient: vi.fn().mockResolvedValue(undefined)
    };

    secureStoreMap = new Map<string, string>();
    mockSecureStorage = {
      getItem: vi.fn((k: string) => secureStoreMap.get(k) ?? null),
      setItem: vi.fn((k: string, v: string) => { secureStoreMap.set(k, v); }),
      removeItem: vi.fn((k: string) => { secureStoreMap.delete(k); })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: StorageService, useValue: mockStorage },
        { provide: SecureStorageService, useValue: mockSecureStorage },
        YbocsService
      ]
    });

    ybocs = injector.get(YbocsService);
    component = runInInjectionContext(injector, () => new YbocsScreenerComponent());
  });

  it('1. Computes Q1-Q10 totals while keeping Q11 Insight separate and generates outcome validation across all 5 bands', () => {
    // Subclinical (0)
    expect(ybocs.totalScore()).toBe(0);
    expect(ybocs.outcomeValidation().tier).toBe('subclinical');

    // Mild (10)
    for (let q = 1; q <= 10; q++) ybocs.setSeverityScore(q, 1);
    expect(ybocs.totalScore()).toBe(10);
    expect(ybocs.outcomeValidation().tier).toBe('mild');
    expect(ybocs.outcomeValidation().validationMessage).toContain('not a personal flaw');

    // Q11 Insight must NOT alter the /40 score
    ybocs.setSeverityScore(11, 4);
    expect(ybocs.totalScore()).toBe(10);
    expect(ybocs.insightScore()).toBe(4);
    expect(ybocs.outcomeValidation().insightNote).toContain('Fixed Conviction');

    // Moderate (20)
    for (let q = 1; q <= 10; q++) ybocs.setSeverityScore(q, 2);
    expect(ybocs.totalScore()).toBe(20);
    expect(ybocs.outcomeValidation().tier).toBe('moderate');
    expect(ybocs.outcomeValidation().validationMessage).toContain('Exposure & Response Prevention');

    // Severe (28) -> triggers warm non-alarmist human support card
    for (let q = 1; q <= 8; q++) ybocs.setSeverityScore(q, 3);
    ybocs.setSeverityScore(9, 2);
    ybocs.setSeverityScore(10, 2);
    expect(ybocs.totalScore()).toBe(28);
    expect(ybocs.outcomeValidation().tier).toBe('severe');
    expect(ybocs.outcomeValidation().showWarmSupportCard).toBe(true);

    // Extreme (36)
    for (let q = 1; q <= 10; q++) ybocs.setSeverityScore(q, q <= 6 ? 4 : 3);
    expect(ybocs.totalScore()).toBe(36);
    expect(ybocs.outcomeValidation().tier).toBe('extreme');
    expect(ybocs.outcomeValidation().showWarmSupportCard).toBe(true);
  });

  it('2. Shows ego-dystonic reassurance when harm/taboo obsessions are checked without pathologizing intent', () => {
    expect(ybocs.outcomeValidation().egoDystonicReassurance).toBeNull();
    ybocs.toggleChecklist(1, 'current'); // "I fear I might harm myself"
    expect(ybocs.hasEgoDystonicChecked()).toBe(true);
    expect(ybocs.hasHarmConcernCurrent()).toBe(true);
    expect(ybocs.outcomeValidation().egoDystonicReassurance).toContain('ego-dystonic');
    expect(ybocs.outcomeValidation().showWarmSupportCard).toBe(true);
  });

  it('3. Persists reactively under canonical .assessment key, preserves longitudinal history, sets ybocsScore, and exports to FHIR R4', () => {
    for (let q = 1; q <= 10; q++) ybocs.setSeverityScore(q, 2); // 20/40 (down 6 from 26/40 on 2026.05.19)
    ybocs.setSeverityScore(11, 1);
    const saveRes = ybocs.saveCurrentAssessment();

    expect(saveRes.persistedTo).toBe('patient_timeline');
    expect(saveRes.totalScore).toBe(20);

    const updatedPatient = patientsSignal()[0];
    expect(updatedPatient.ybocsScore).toBe(20);
    // Longitudinal history preserved: prior 2026.05.19 entry + today's new entry
    const yEntries = updatedPatient.history.filter((h) => h.type === 'Y-BOCsAssessment');
    expect(yEntries.length).toBe(2);
    expect(ybocs.previousRecordedScore()?.score).toBe(26);
    expect(ybocs.scoreDelta()).toBe(-6);

    const latestEntry = yEntries[yEntries.length - 1] as any;
    expect(latestEntry.assessment).toBeDefined();
    expect(latestEntry.assessment.totalScore).toBe(20);
    expect(latestEntry.assessment.insightScore).toBe(1);
    expect(latestEntry.assessment.patientInfo.name).not.toContain('Alex Morgan'); // HIPAA Safe Harbor

    // Verify FhirExportStrategyService serializes Y-BOCS Observation (LOINC 82290-8)
    const fhirStrategy = new FhirExportStrategyService();
    const bundle = fhirStrategy.generateFhirBundle(updatedPatient);
    const ybocsObs = bundle.entry.filter(
      (e) => e.resource.resourceType === 'Observation' && (e.resource.id || '').startsWith('obs-ybocs-')
    );
    expect(ybocsObs.length).toBe(2);
    expect(JSON.stringify(bundle)).not.toContain('Alex Morgan');
  });

  it('4. Reports honest local guest storage in Guest Mode instead of claiming FHIR Timeline persistence', () => {
    selectedPatientIdSignal.set(null);
    ybocs.setSeverityScore(1, 2);
    component.saveAssessmentToTimeline();

    expect(component.saveSuccessMessage()).toContain('local Guest storage');
    expect(secureStoreMap.has('ybocs_guest_assessment_v1')).toBe(true);
  });

  it('5. Protects against accidental reset with 2-step confirmation, Undo restoration, and preserved timeline history', () => {
    ybocs.toggleChecklist(11, 'current');
    ybocs.setSeverityScore(1, 3);
    ybocs.setUpsettingObsession(11);
    expect(ybocs.totalScore()).toBe(3);

    // Step 1: Requesting reset does NOT clear immediately
    component.requestReset();
    expect(component.pendingResetConfirm()).toBe(true);
    expect(ybocs.totalScore()).toBe(3);

    // Step 2: Confirming clears active form ONLY and exposes Undo snapshot
    component.confirmReset();
    expect(ybocs.totalScore()).toBe(0);
    expect(component.undoResetSnapshot()).not.toBeNull();
    // Historical patient timeline entry remains intact
    expect(patientsSignal()[0].history.some((h) => h.date === '2026.05.19')).toBe(true);

    // Step 3: Undo restores answers cleanly
    component.undoReset();
    expect(ybocs.totalScore()).toBe(3);
    expect(ybocs.upsettingObsessionId()).toBe(11);
    expect(component.undoResetSnapshot()).toBeNull();
  });

  it('6. Builds a HIPAA Safe Harbor 30-second Visit Prep Brief with focus items and longitudinal delta', async () => {
    for (let q = 1; q <= 10; q++) ybocs.setSeverityScore(q, 2);
    ybocs.toggleChecklist(11, 'current');
    ybocs.setUpsettingObsession(11);
    ybocs.toggleChecklist(38, 'current');
    ybocs.setUpsettingCompulsion(38);

    await component.copyVisitPrepBrief();
    const preview = component.visitBriefPreview() || '';
    expect(preview).toContain('Total Score: 20/40 (Moderate OCD)');
    expect(preview).toContain('down 6 pts');
    expect(preview).toContain('Primary Focus Obsession: I am concerned with dirt or germs');
    expect(preview).toContain('Primary Focus Compulsion: I wash my hands excessively');
    expect(preview).toContain('NON-DIAGNOSTIC');
    expect(preview).not.toContain('Alex Morgan');
  });

  it('7. Activates Voice-First Interview via PatientStateService signal and dispatches voice-mode-change', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    component.triggerMindfulMacawVoiceInterview();

    expect(mockSecureStorage.setItem).toHaveBeenCalledWith('voice_assistant_mode', 'ybocs');
    expect(mockPatientState.toggleLiveAgent).toHaveBeenCalledWith(true);
    expect(mockPatientState.setLiveAgentWindowMode).toHaveBeenCalledWith('compact');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'voice-mode-change' }));
  });

  it('8. Parses natural patient phrasing accurately in VoiceAssistantComponent.parseYbocsScore', () => {
    const parse = VoiceAssistantComponent.prototype.parseYbocsScore;
    expect(parse('1 to 3 hours a day')).toBe(2);
    expect(parse('3-8 hours')).toBe(3);
    expect(parse('more than 8 hours')).toBe(4);
    expect(parse('less than 1 hour')).toBe(1);
    expect(parse('not severe, just mild')).toBe(1);
    expect(parse('No, I do not have four hours of this')).toBe(0);
    expect(parse('completely yielded')).toBe(4);
    expect(parse('none at all')).toBe(0);
  });
});
