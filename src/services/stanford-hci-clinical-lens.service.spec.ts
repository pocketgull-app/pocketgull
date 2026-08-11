import { TestBed } from '@angular/core/testing';
import { StanfordHciClinicalLensService } from './stanford-hci-clinical-lens.service';

describe('StanfordHciClinicalLensService', () => {
  let service: StanfordHciClinicalLensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StanfordHciClinicalLensService);
  });

  it('1. Initializes Stanford HCI principles list', () => {
    const principles = service.hciPrinciples();
    expect(principles.length).toBe(3);
    expect(principles[0].stanfordLab).toContain('Stanford HCI Lab');
  });

  it('2. Selects active HCI principle and computes current state', () => {
    service.selectPrinciple(1);
    expect(service.currentPrinciple().name).toContain('Mixed-Initiative');
    expect(service.currentPrinciple().cognitiveLoadReductionPct).toBe(65);
  });
});
