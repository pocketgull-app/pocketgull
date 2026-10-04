import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EdgeAudioPrimacyService } from './edge-audio-primacy.service';
import { IsmpSafetyGuardService } from './ismp-safety-guard.service';

describe('EdgeAudioPrimacyService', () => {
  let service: EdgeAudioPrimacyService;
  let ismpGuard: IsmpSafetyGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EdgeAudioPrimacyService,
        IsmpSafetyGuardService
      ]
    });

    service = TestBed.inject(EdgeAudioPrimacyService);
    ismpGuard = TestBed.inject(IsmpSafetyGuardService);
  });

  afterEach(() => {
    delete (globalThis as any).ai;
  });

  it('1. Initializes with EDGE_GEMMA4 routing and zero FinOps counters', () => {
    expect(service.activeRoutingEngine()).toBe('EDGE_GEMMA4');
    expect(service.totalTranscriptionsCount()).toBe(0);
    expect(service.totalTokensSaved()).toBe(0);
    expect(service.totalCostSavedUsd()).toBe(0);
    expect(service.finOpsSummary().grossMarginPreservationRate).toBe(100);
  });

  it('2. Evaluates capabilities and reports fallback in absence of experimental flags', async () => {
    const caps = await service.checkCapabilities();
    expect(caps.available).toBe('no');
    expect(caps.model).toBe('deterministic_client_fallback');
  });

  it('3. Formats spoken transcript into structured SOAP note via deterministic fallback', async () => {
    const raw = 'patient reports mild headache and fatigue blood pressure is 120 over 80 plan lisinopril 10 mg daily';
    const result = await service.polishDictationWithEdge(raw, { targetFormat: 'SOAP' });

    expect(result).toBeDefined();
    expect(result.targetFormat).toBe('SOAP');
    expect(result.polishedText).toContain('SUBJECTIVE:');
    expect(result.polishedText).toContain('BP');
    expect(result.engineUsed).toBe('LOCAL_DETERMINISTIC_FALLBACK');
    expect(result.estimatedTokensSaved).toBeGreaterThan(0);
    expect(result.estimatedCostSavedUsd).toBeGreaterThan(0);
    expect(service.totalTranscriptionsCount()).toBe(1);
  });

  it('4. Enforces ISMP medication safety rules by stripping trailing zeroes and naked decimals', async () => {
    const raw = 'prescribe lisinopril 10.0 mg and clonazepam .5 mg at bedtime';
    const result = await service.polishDictationWithEdge(raw, { targetFormat: 'PUNCTUATED' });

    expect(result.ismpSafetyAudit.hasViolations).toBe(true);
    // Trailing zero 10.0 mg -> 10 mg
    expect(result.polishedText).toContain('10 mg');
    expect(result.polishedText).not.toContain('10.0 mg');
    // Naked decimal .5 mg -> 0.5 mg
    expect(result.polishedText).toContain('0.5 mg');
  });

  it('5. Accurately classifies encounter acuity using clinical heuristics', async () => {
    const statResult = await service.polishDictationWithEdge('patient in severe chest pain and facial droop', { targetFormat: 'PUNCTUATED' });
    expect(statResult.acuity).toBe('STAT_EMERGENCY');

    const urgentResult = await service.polishDictationWithEdge('patient has high fever and severe pain in right arm', { targetFormat: 'PUNCTUATED' });
    expect(urgentResult.acuity).toBe('URGENT');

    const routineResult = await service.polishDictationWithEdge('routine blood pressure check and medication renewal', { targetFormat: 'PUNCTUATED' });
    expect(routineResult.acuity).toBe('ROUTINE');
  });

  it('6. Accumulates FinOps token savings and tracks latency across multiple dictations', async () => {
    await service.polishDictationWithEdge('first quick dictation notes', { targetFormat: 'PUNCTUATED' });
    await service.polishDictationWithEdge('second longer dictation with vital signs and follow up instructions', { targetFormat: 'SOAP' });

    const summary = service.finOpsSummary();
    expect(summary.totalTranscriptions).toBe(2);
    expect(summary.totalEstimatedTokensSaved).toBeGreaterThan(15);
    expect(summary.totalCostSavedUsd).toBeGreaterThan(0);
    expect(summary.averageLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('7. Dynamically escalates to CLOUD_GEMINI_LIVE and restores EDGE_GEMMA4 primacy', () => {
    const escalation = service.escalateToCloudLiveConsult('Live multi-turn diagnostic consult');
    expect(escalation.escalated).toBe(true);
    expect(service.activeRoutingEngine()).toBe('CLOUD_GEMINI_LIVE');
    expect(service.cloudEscalationsCount()).toBe(1);

    service.returnToEdgePrimacy();
    expect(service.activeRoutingEngine()).toBe('EDGE_GEMMA4');
  });

  it('8. Utilizes Chrome Built-in AI Prompt API when window.ai.languageModel is readily available', async () => {
    const mockPrompt = vi.fn().mockResolvedValue('SUBJECTIVE: Formatted by on-device Gemma 4.\nOBJECTIVE: Stable.');
    const mockDestroy = vi.fn();
    (globalThis as any).ai = {
      languageModel: {
        capabilities: vi.fn().mockResolvedValue({ available: 'readily' }),
        create: vi.fn().mockResolvedValue({
          prompt: mockPrompt,
          destroy: mockDestroy
        })
      }
    };

    const result = await service.polishDictationWithEdge('patient is doing well', { targetFormat: 'SOAP' });
    expect(result.engineUsed).toBe('CHROME_BUILTIN_GEMMA4');
    expect(result.polishedText).toContain('Formatted by on-device Gemma 4');
    expect(mockPrompt).toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
