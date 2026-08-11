import { TestBed } from '@angular/core/testing';
import { IbmWatsonxClinicalService } from './ibm-watsonx-clinical.service';

describe('IbmWatsonxClinicalService', () => {
  let service: IbmWatsonxClinicalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IbmWatsonxClinicalService);
  });

  it('1. Initializes IBM watsonx.ai Granite Clinical model & governance state', () => {
    const state = service.watsonxAnalysis();
    expect(state.modelName).toContain('IBM watsonx');
    expect(state.governanceBiasScore).toBeGreaterThan(0.95);
  });

  it('2. Runs IBM watsonx.governance bias audit and returns explainability chain', async () => {
    const analysis = await service.runWatsonxGovernanceAudit();
    expect(analysis.explainabilityChain.length).toBe(3);
    expect(analysis.status).toBe('COMPLETED');
  });
});
