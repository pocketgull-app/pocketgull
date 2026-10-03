import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OfflineEdgeAiService } from './offline-edge-ai.service';
import { PatientStateService } from './patient-state.service';
import { IsmpSafetyGuardService } from './ismp-safety-guard.service';

describe('OfflineEdgeAiService', () => {
  let service: OfflineEdgeAiService;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '74', bp: '118/76', spO2: '99%' }),
      issues: signal({
        spine: [{ id: 'iss-1', name: 'Lumbar facet arthropathy' }]
      })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        IsmpSafetyGuardService,
        OfflineEdgeAiService
      ]
    });

    service = runInInjectionContext(injector, () => injector.get(OfflineEdgeAiService));
  });

  afterEach(() => {
    delete (globalThis as any).ai;
  });

  it('1. Initializes with available edge models including Gemma 4 Built-in AI', () => {
    expect(service).toBeTruthy();
    expect(service.availableModels().length).toBeGreaterThan(0);
    const gemma4 = service.availableModels().find(m => m.id === 'gemma-4-builtin-ai');
    expect(gemma4).toBeDefined();
    expect(gemma4?.type).toBe('window-ai-nano');
  });

  it('2. Prefetches model weights and updates isCached state', async () => {
    const res = await service.prefetchModelWeights('gemma-2-2b-it-q4f16');
    expect(res).toBe(true);
    const model = service.availableModels().find(m => m.id === 'gemma-2-2b-it-q4f16');
    expect(model?.isCached).toBe(true);
    expect(service.downloadProgressPct()).toBe(100);
  });

  it('3. Synthesizes offline SBAR clinical care plan report with zero network transit', async () => {
    const report = await service.synthesizeOfflineClinicalReport('Assess patient lumbar pain');
    expect(report).toContain('LOCAL WEBGPU / WASM EDGE INFERENCE');
    expect(report).toContain('HR 74 bpm');
    expect(report).toContain('BP 118/76 mmHg');
    expect(service.lastInferenceLatencyMs()).toBeGreaterThan(0);
  });

  it('4. Classifies acute clinical narrative (STAT_EMERGENCY, URGENT, ROUTINE) deterministically', async () => {
    // STAT emergency
    const statResult = await service.classifyAcuity('Patient in trauma bay with crushing chest pain and unresponsive');
    expect(statResult.category).toBe('STAT_EMERGENCY');
    expect(statResult.confidence).toBeGreaterThanOrEqual(0.95);
    expect(statResult.modelEngine).toBe('deterministic-clinical-matcher');

    // Urgent
    const urgentResult = await service.classifyAcuity('Acute ankle fracture with severe pain and high fever');
    expect(urgentResult.category).toBe('URGENT');

    // Routine
    const routineResult = await service.classifyAcuity('Routine follow-up for mild seasonal dermatitis');
    expect(routineResult.category).toBe('ROUTINE');
  });

  it('5. Structures voice dictation note into SOAP format and sanitizes ISMP dosages', async () => {
    const dictation = 'Patient reports mild lumbar ache. Give lisinopril 5.0 mg and .5 mg clonazepam daily.';
    const result = await service.structureVoiceNoteOffline(dictation);

    expect(result.soapNote.subjective).toBeTruthy();
    expect(result.soapNote.plan).toBeTruthy();
    expect(result.formattedNote).toContain('[SOAP CLINICAL PROGRESS NOTE - OFFLINE EDGE AI]');

    // ISMP safety audit verifies trailing zero (5.0 mg) and naked decimal (.5 mg)
    expect(result.ismpSafetyAudit.violations.length).toBeGreaterThan(0);
    const trailingZeroViolation = result.ismpSafetyAudit.violations.find(v => v.type === 'TRAILING_ZERO');
    expect(trailingZeroViolation).toBeDefined();
    expect(trailingZeroViolation?.corrected).toBe('5 mg');

    const nakedDecimalViolation = result.ismpSafetyAudit.violations.find(v => v.type === 'NAKED_DECIMAL');
    expect(nakedDecimalViolation).toBeDefined();
    expect(nakedDecimalViolation?.corrected).toBe('0.5 mg');
  });

  it('6. Uses Chrome Built-in AI Classifier when window.ai is available', async () => {
    (globalThis as any).ai = {
      classifier: {
        create: vi.fn().mockResolvedValue({
          classify: vi.fn().mockResolvedValue({ topCategory: 'STAT_EMERGENCY', confidence: 0.98 })
        })
      }
    };

    const res = await service.classifyAcuity('Severe respiratory distress');
    expect(res.category).toBe('STAT_EMERGENCY');
    expect(res.modelEngine).toBe('chrome-builtin-ai-classifier');
    expect(res.confidence).toBe(0.98);
  });
});
