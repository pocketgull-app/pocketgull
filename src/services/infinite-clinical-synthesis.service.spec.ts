import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { InfiniteClinicalSynthesisService } from './infinite-clinical-synthesis.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ClinicalIconGeneratorService } from './clinical-icon-generator.service';
import { PatientStateService } from './patient-state.service';

describe('InfiniteClinicalSynthesisService', () => {
  let service: InfiniteClinicalSynthesisService;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [
      { provide: ClinicalIntelligenceService, useValue: {} },
      { provide: ClinicalIconGeneratorService, useValue: { getIconSpec: () => ({ svgPath: '', viewBox: '' }) } },
      { provide: PatientStateService, useValue: {} }
    ] });
    runInInjectionContext(injector, () => {
      service = new InfiniteClinicalSynthesisService();
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should procedurally generate tri-paradigm clinical strategy with Amazon affiliate URLs', async () => {
    const result = await service.synthesizeInfiniteStrategy({
      symptomQuery: 'Ashwagandha for Sleep & Cortisol',
      paradigmFocus: 'ayurvedic'
    });

    expect(result).toBeTruthy();
    expect(result.title).toContain('Ashwagandha for Sleep & Cortisol');
    expect(result.amazonStoreUrl).toContain('tag=pgdpo-20');
    expect(result.moeFlopSavingsPercent).toBeGreaterThanOrEqual(0);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.nodes[0]?.items?.length).toBe(3);
  });
});
