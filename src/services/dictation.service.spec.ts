import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { DictationService } from './dictation.service';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { PetAuditoryService } from './pet-auditory.service';
import { AmbientLightingService } from './ambient-lighting.service';

describe('DictationService & Voice Simulation Suite', () => {

  const createService = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PatientStateService, useValue: {} },
        { provide: PatientManagementService, useValue: {} },
        { provide: PetAuditoryService, useValue: {} },
        { provide: AmbientLightingService, useValue: {} }
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
});
