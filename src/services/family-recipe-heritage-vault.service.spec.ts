import { TestBed } from '@angular/core/testing';
import { FamilyRecipeHeritageVaultService } from './family-recipe-heritage-vault.service';
import { PatientStateService } from './patient-state.service';
import { LocalFoodshedOnlineMenuService } from './local-foodshed-online-menu.service';

describe('FamilyRecipeHeritageVaultService', () => {
  let service: FamilyRecipeHeritageVaultService;
  let foodshed: LocalFoodshedOnlineMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FamilyRecipeHeritageVaultService,
        PatientStateService,
        LocalFoodshedOnlineMenuService
      ]
    });

    service = TestBed.inject(FamilyRecipeHeritageVaultService);
    foodshed = TestBed.inject(LocalFoodshedOnlineMenuService);
  });

  it('should initialize with heritage recipes and substrate upgrades', () => {
    expect(service.savedRecipes().length).toBeGreaterThanOrEqual(2);
    const nonna = service.savedRecipes()[0];
    expect(nonna.recommendedSubstrateUpgrades.length).toBeGreaterThan(0);
    expect(nonna.tcmThermalNature).toBe('Warm');
  });

  it('should generate a valid HL7 FHIR R4 document bundle with SHA-256 seal', () => {
    const bundle = service.generateFhirR4NutritionBundle();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.signatureSha256).toBeTruthy();
    expect(bundle.signatureSha256.length).toBe(64);
    expect(bundle.entry.length).toBeGreaterThanOrEqual(3);

    const nutritionOrder = bundle.entry.find(e => e.resource.resourceType === 'NutritionOrder');
    expect(nutritionOrder).toBeTruthy();
    const carePlan = bundle.entry.find(e => e.resource.resourceType === 'CarePlan');
    expect(carePlan).toBeTruthy();
  });

  it('should trigger 3D simulation for a recipe', () => {
    const spy = vi.spyOn(foodshed, 'simulateIn3dAnatomy');
    service.simulateIn3d(service.savedRecipes()[0]);
    expect(spy).toHaveBeenCalled();
  });
});
