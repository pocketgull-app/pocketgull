import { TestBed } from '@angular/core/testing';
import { EdgeAutonomousVoiceAgentService } from './edge-autonomous-voice-agent.service';
import { NetworkStateService } from '../network-state.service';
import { IsmpSafetyGuardService } from '../ismp-safety-guard.service';
import { EhrWritebackService } from '../fhir/ehr-writeback.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('EdgeAutonomousVoiceAgentService', () => {
  let service: EdgeAutonomousVoiceAgentService;
  let ismpGuard: IsmpSafetyGuardService;
  let ehrWritebackService: EhrWritebackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EdgeAutonomousVoiceAgentService,
        NetworkStateService,
        IsmpSafetyGuardService,
        EhrWritebackService
      ]
    });

    service = TestBed.inject(EdgeAutonomousVoiceAgentService);
    ismpGuard = TestBed.inject(IsmpSafetyGuardService);
    ehrWritebackService = TestBed.inject(EhrWritebackService);
    service.clearOfflineQueue();
    service.clearTranscript();
  });

  afterEach(() => {
    service.stopVoiceSession();
  });

  it('should initialize with default edge engine and listen state', () => {
    expect(service).toBeTruthy();
    expect(service.isListening()).toBe(false);
    expect(service.isProcessing()).toBe(false);
    expect(service.activeEngine()).toBeDefined();
    expect(service.queuedBundles().length).toBe(0);
  });

  it('should start and stop voice scribing sessions and update audio level', async () => {
    await service.startVoiceSession({ language: 'en-US' });
    expect(service.isListening()).toBe(true);

    service.stopVoiceSession();
    expect(service.isListening()).toBe(false);
    expect(service.liveAudioLevel()).toBe(0);
  });

  it('should toggle simulated air-gap / Wi-Fi blackout mode', () => {
    expect(service.simulatedAirGapActive()).toBe(false);
    const state1 = service.toggleAirGapSimulation();
    expect(state1).toBe(true);
    expect(service.isAirGapped()).toBe(true);

    const state2 = service.toggleAirGapSimulation();
    expect(state2).toBe(false);
  });

  it('should append and clear clinical transcripts', () => {
    service.appendTranscript('Patient reports acute headache and elevated blood pressure.');
    expect(service.finalizedTranscript()).toContain('acute headache');

    service.appendTranscript('Currently taking Metoprolol 25 mg twice daily.');
    expect(service.finalizedTranscript()).toContain('Metoprolol');

    service.clearTranscript();
    expect(service.finalizedTranscript()).toBe('');
    expect(service.liveTranscript()).toBe('');
  });

  it('should synthesize SBAR and enforce ISMP medication safety intercept', async () => {
    const rawDialogue = 'Doctor: Patient taking Metformin 500.0 mg and Lisinopril .5 mg. Also reporting occasional fever and shortness of breath.';
    service.appendTranscript(rawDialogue);

    const { sbar, queuedBundle } = await service.synthesizeSbarAndQueue();

    expect(sbar).toBeDefined();
    expect(sbar.situation).toBeDefined();
    expect(sbar.background).toBeDefined();
    expect(sbar.assessment).toBeDefined();
    expect(sbar.recommendation).toBeDefined();

    // Verify ISMP trailing zero and naked decimal correction
    expect(sbar.fullNote).not.toContain('500.0 mg');
    expect(sbar.fullNote).not.toContain(' .5 mg');

    // Verify Queued Offline FHIR Bundle
    expect(queuedBundle).toBeDefined();
    expect(queuedBundle.status).toBe('QUEUED_FOR_EHR_RECONNECT');
    expect(queuedBundle.sha256AttestationSeal).toContain('sha256_edge_');
    expect(queuedBundle.bundle.entry.length).toBe(3);
    expect(queuedBundle.bundle.entry.some(e => e.resource.resourceType === 'DocumentReference')).toBe(true);
    expect(queuedBundle.bundle.entry.some(e => e.resource.resourceType === 'CarePlan')).toBe(true);
    expect(queuedBundle.bundle.entry.some(e => e.resource.resourceType === 'Observation')).toBe(true);

    expect(service.pendingSyncCount()).toBe(1);
  });

  it('should flush and synchronize queued offline bundles to EHR when reconnected', async () => {
    service.appendTranscript('Routine checkup with hypertension management.');
    await service.synthesizeSbarAndQueue();
    expect(service.pendingSyncCount()).toBe(1);

    const result = await service.flushQueueToEhr();
    expect(result.syncedCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(service.pendingSyncCount()).toBe(0);

    const bundle = service.queuedBundles()[0];
    expect(bundle.status).toBe('SYNCED_TO_EHR');
  });

  it('should remove specific queued bundle or clear queue', async () => {
    service.appendTranscript('First patient consultation');
    const { queuedBundle: b1 } = await service.synthesizeSbarAndQueue();

    service.appendTranscript('Second patient consultation');
    const { queuedBundle: b2 } = await service.synthesizeSbarAndQueue();

    expect(service.queuedBundles().length).toBe(2);

    service.removeQueuedBundle(b1.id);
    expect(service.queuedBundles().length).toBe(1);
    expect(service.queuedBundles()[0].id).toBe(b2.id);

    service.clearOfflineQueue();
    expect(service.queuedBundles().length).toBe(0);
  });
});
