import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { MicrosoftIbmClinicalBridgeService } from './microsoft-ibm-clinical-bridge.service';

describe('MicrosoftIbmClinicalBridgeService', () => {
  let service: MicrosoftIbmClinicalBridgeService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [MicrosoftIbmClinicalBridgeService]
    });
    service = runInInjectionContext(injector, () => injector.get(MicrosoftIbmClinicalBridgeService));
  });

  it('1. Initializes Microsoft Nuance DAX ambient clinical listening session', () => {
    const nuance = service.nuanceSession();
    expect(nuance.providerName).toContain('Nuance DAX');
    expect(nuance.extractedSymptomEntities.length).toBeGreaterThan(0);
    expect(nuance.suggestedICD10Codes.length).toBeGreaterThan(0);
  });

  it('2. Triggers ambient listening and returns analyzed transcript summary', async () => {
    const session = await service.triggerNuanceAmbientListening();
    expect(session.status).toBe('SUMMARY_READY');
  });

  it('3. Runs IBM watsonx.governance bias audit and clinical explainability chain', async () => {
    const analysis = await service.runWatsonxGovernanceAudit();
    expect(analysis.modelName).toContain('IBM watsonx');
    expect(analysis.governanceBiasScore).toBeGreaterThan(0.95);
    expect(analysis.explainabilityChain.length).toBe(3);
  });
});
