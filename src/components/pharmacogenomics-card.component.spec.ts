import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { PharmacogenomicsCardComponent } from './pharmacogenomics-card.component';
import { PharmacogenomicsService } from '../services/pharmacogenomics.service';

describe('PharmacogenomicsCardComponent', () => {
  const createComponent = () => {
    const mockPgxService = {
      activeProfile: signal({
        patientId: 'P1',
        timestamp: new Date().toISOString(),
        variants: [
          { gene: 'CYP2D6', phenotype: 'Poor Metabolizer', diplotype: '*4/*4', activityScore: 0, affectedDrugClasses: ['SSRI'] }
        ],
        interactions: [
          { drugName: 'Codeine', gene: 'CYP2D6', severity: 'contraindicated', clinicalSummary: 'No morphine bioactivation.', cpicGuidelineUrl: 'https://cpicpgx.org', evidenceLevel: '1A' }
        ],
        overallToxicityRisk: 72
      }),
      hasHighRiskInteractions: signal(true)
    };

    const injector = Injector.create({
      providers: [
        { provide: PharmacogenomicsService, useValue: mockPgxService }
      ]
    });

    const comp = runInInjectionContext(injector, () => new PharmacogenomicsCardComponent());
    return { comp, mockPgxService };
  };

  it('1. Creates component and resolves pharmacogenomic profile signals', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.pgx.hasHighRiskInteractions()).toBe(true);
  });
});
