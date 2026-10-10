import { TestBed } from '@angular/core/testing';
import { DrugNutrientInteractionGuardService } from './drug-nutrient-interaction-guard.service';
import { PatientStateService } from './patient-state.service';

describe('DrugNutrientInteractionGuardService', () => {
  let service: DrugNutrientInteractionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DrugNutrientInteractionGuardService,
        PatientStateService
      ]
    });

    service = TestBed.inject(DrugNutrientInteractionGuardService);
  });

  it('should initialize with knowledge base of drug-nutrient interactions', () => {
    expect(service.interactionCatalog.length).toBeGreaterThanOrEqual(5);
    expect(service.activeMedications().length).toBeGreaterThan(0);
  });

  it('should detect CYP3A4 interaction with statin and grapefruit', () => {
    const statinInteraction = service.interactionCatalog.find(i => i.id === 'inter-statin-grapefruit');
    expect(statinInteraction).toBeTruthy();
    expect(statinInteraction?.severity).toBe('Contraindicated / Severe Hazard');
    expect(statinInteraction?.safeCulinaryAlternative).toContain('Tangerines');
  });

  it('should identify active interactions based on patient medications', () => {
    const active = service.identifiedInteractions();
    expect(active.length).toBeGreaterThan(0);
    expect(service.highestSeverity()).toBeTruthy();
  });
});
