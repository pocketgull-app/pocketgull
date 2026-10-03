import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, signal } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { DictationService } from './dictation.service';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { PetAuditoryService } from './pet-auditory.service';
import { AmbientLightingService } from './ambient-lighting.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';

describe('DictationService & Voice Simulation Suite', () => {

  const createService = (overrides?: {
    patientState?: any;
    patientMgmt?: any;
    petAuditory?: any;
    lighting?: any;
    moeRouter?: any;
  }) => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PatientStateService, useValue: overrides?.patientState || {} },
        { provide: PatientManagementService, useValue: overrides?.patientMgmt || {} },
        { provide: PetAuditoryService, useValue: overrides?.petAuditory || {} },
        { provide: AmbientLightingService, useValue: overrides?.lighting || {} },
        { provide: ClinicalMoERouterService, useValue: overrides?.moeRouter || {} }
      ]
    });
    return runInInjectionContext(injector, () => new DictationService());
  };

  it('defines DictationService and default signals', () => {
    expect(DictationService).toBeDefined();
  });

  it('verifies supported voice dictation languages list', () => {
    const service = createService();
    expect(service.supportedLanguages.length).toBeGreaterThan(30);
    const en = service.supportedLanguages.find(l => l.code === 'en-US');
    expect(en).toBeDefined();
    expect(en?.name).toBe('English (US)');
  });

  it('handles language switching reactively', () => {
    const service = createService();
    service.setLanguage('es-ES');
    expect(service.selectedLanguage()).toBe('es-ES');
  });

  it('handles modal dictation opening, cancellation, and acceptance', () => {
    const service = createService();
    let acceptedText = '';
    
    expect(service.isModalOpen()).toBe(false);
    service.openDictationModal('Patient has dyspnea', (text) => {
      acceptedText = text;
    });

    expect(service.isModalOpen()).toBe(true);
    expect(service.initialText()).toBe('Patient has dyspnea');

    service.accept('Patient has acute dyspnea on exertion');
    expect(service.isModalOpen()).toBe(false);
    expect(acceptedText).toBe('Patient has acute dyspnea on exertion');
  });

  it('handles modal dictation cancellation cleanly', () => {
    const service = createService();
    service.openDictationModal('Test text', () => {});
    expect(service.isModalOpen()).toBe(true);

    service.cancel();
    expect(service.isModalOpen()).toBe(false);
  });

  it('provides speakResponse method for Web Speech text-to-speech fallback', () => {
    const service = createService();
    expect(service.speakResponse).toBeDefined();
    const result = service.speakResponse('Care plan strategy initialized');
    expect(typeof result).toBe('boolean');
  });

  it('exposes isSidechainDuckingActive and sidechainDuckingDepth for audio ducking', () => {
    const service = createService();
    expect(service.isSidechainDuckingActive()).toBe(false);
    expect(service.sidechainDuckingDepth()).toBe(0.85);

    service.isListening.set(true);
    expect(service.isSidechainDuckingActive()).toBe(true);

    service.isListening.set(false);
    expect(service.isSidechainDuckingActive()).toBe(false);
  });

  describe('processVoiceCommand - Hands-free Clinical Command Router', () => {
    it('returns false for empty input or non-command conversational text', () => {
      const service = createService();
      expect(service.processVoiceCommand('')).toBe(false);
      expect(service.processVoiceCommand('patient reports mild intermittent headache')).toBe(false);
    });

    it('triggers emergency AVS override and safety stops without requiring a wake word', () => {
      const isAvsActive = signal(true);
      const emergencyLighting = vi.fn();
      const petAuditoryStop = vi.fn();

      const service = createService({
        patientState: { isAvsSessionActive: isAvsActive },
        lighting: { setEmergencyOverride: emergencyLighting },
        petAuditory: { stop: petAuditoryStop }
      });

      const handled = service.processVoiceCommand('Emergency Stop!');
      expect(handled).toBe(true);
      expect(service.lastCommand()).toBe('EMERGENCY AVS STOPPED');
      expect(isAvsActive()).toBe(false);
      expect(emergencyLighting).toHaveBeenCalledWith(false);
      expect(petAuditoryStop).toHaveBeenCalled();
    });

    it('recognizes distinct persona wake words (Gulliver, Sentinel, Swoop, Scribes)', () => {
      const service = createService();
      
      service.processVoiceCommand('Hey Gulliver');
      expect(service.wakeWordDetected()).toBe('gulliver');

      service.processVoiceCommand('Hey Sentinel');
      expect(service.wakeWordDetected()).toBe('sentinel');

      service.processVoiceCommand('Hey Swoop');
      expect(service.wakeWordDetected()).toBe('swoop');

      service.processVoiceCommand('Hey Scribes');
      expect(service.wakeWordDetected()).toBe('scribes');
    });

    it('routes triage command center navigation', () => {
      const selectedId = signal<string | null>('p001');
      const service = createService({
        patientMgmt: { selectedPatientId: selectedId }
      });

      const handled = service.processVoiceCommand('Gull triage');
      expect(handled).toBe(true);
      expect(service.lastCommand()).toBe('Opening Triage Command Center');
      expect(selectedId()).toBeNull();
    });

    it('routes Synoptic Canvas view switching', () => {
      const viewMode = signal<'canvas' | 'lenses' | 'suites'>('lenses');
      const service = createService({
        moeRouter: { analysisViewMode: viewMode }
      });

      const handled = service.processVoiceCommand('Gull synoptic');
      expect(handled).toBe(true);
      expect(service.lastCommand()).toBe('Switching to Synoptic Canvas');
      expect(viewMode()).toBe('canvas');
    });

    it('routes decision flow explainability to live conversational AI agent', () => {
      const liveInput = signal('');
      const isLiveActive = signal(false);
      const activeShiftPatient = signal('p002');

      const service = createService({
        patientState: { liveAgentInput: liveInput, isLiveAgentActive: isLiveActive },
        moeRouter: { activeShiftPatientId: activeShiftPatient }
      });

      const handled = service.processVoiceCommand('Gull decision flow');
      expect(handled).toBe(true);
      expect(service.lastCommand()).toBe('Explaining Decision Flow');
      expect(liveInput()).toContain('p002');
      expect(isLiveActive()).toBe(true);
    });

    it('pins first-class clinical expert hubs upon spoken intent', () => {
      const pinExpertMock = vi.fn();
      const service = createService({
        moeRouter: { pinExpert: pinExpertMock }
      });

      service.processVoiceCommand('Gull specialist referral');
      expect(pinExpertMock).toHaveBeenCalledWith('specialist-referral');

      service.processVoiceCommand('Gull clinical trials');
      expect(pinExpertMock).toHaveBeenCalledWith('clinical-trials-matcher');

      service.processVoiceCommand('Gull SDOH nutrition');
      expect(pinExpertMock).toHaveBeenCalledWith('sdoh-navigator');

      service.processVoiceCommand('Gull air quality exposome');
      expect(pinExpertMock).toHaveBeenCalledWith('environmental-exposomics');
    });

    it('routes hands-free patient chart switching for historical and shift cohorts', () => {
      const loadShiftPatientMock = vi.fn();
      const selectPatientMock = vi.fn();
      const service = createService({
        moeRouter: { loadShiftPatient: loadShiftPatientMock },
        patientMgmt: { selectPatient: selectPatientMock }
      });

      const handledDarwin = service.processVoiceCommand('Gull switch patient Charles Darwin');
      expect(handledDarwin).toBe(true);
      expect(loadShiftPatientMock).toHaveBeenCalledWith('p_charles_darwin');
      expect(selectPatientMock).toHaveBeenCalledWith('p_charles_darwin');

      const handledCurie = service.processVoiceCommand('Gull switch patient Marie Curie');
      expect(handledCurie).toBe(true);
      expect(loadShiftPatientMock).toHaveBeenCalledWith('p_marie_curie');

      const handledP001 = service.processVoiceCommand('Gull switch chart p001');
      expect(handledP001).toBe(true);
      expect(loadShiftPatientMock).toHaveBeenCalledWith('p001');
    });

    it('triggers cloud data sync upon voice command', () => {
      const syncMock = vi.fn();
      const service = createService({
        patientMgmt: { syncToCloud: syncMock }
      });

      const handled = service.processVoiceCommand('Gull sync');
      expect(handled).toBe(true);
      expect(service.lastCommand()).toBe('Data Synced');
      expect(syncMock).toHaveBeenCalled();
    });

    it('highlights 3D anatomical structure upon spoken selection', () => {
      const selectPartMock = vi.fn();
      const service = createService({
        patientState: { selectPart: selectPartMock }
      });

      const handled = service.processVoiceCommand('Gull highlight heart');
      expect(handled).toBe(true);
      expect(selectPartMock).toHaveBeenCalled();
    });
  });
});
