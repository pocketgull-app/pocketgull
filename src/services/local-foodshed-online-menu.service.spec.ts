import { TestBed } from '@angular/core/testing';
import { LocalFoodshedOnlineMenuService } from './local-foodshed-online-menu.service';
import { PatientStateService } from './patient-state.service';

describe('LocalFoodshedOnlineMenuService', () => {
  let service: LocalFoodshedOnlineMenuService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalFoodshedOnlineMenuService,
        PatientStateService
      ]
    });

    service = TestBed.inject(LocalFoodshedOnlineMenuService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('should initialize with full catalogs across all 5 clinical dimensions', () => {
    expect(service.shelfInventory.length).toBeGreaterThanOrEqual(5);
    expect(service.farmCsaDirectory.length).toBeGreaterThanOrEqual(4);
    expect(service.onlineBaskets.length).toBeGreaterThanOrEqual(3);
    expect(service.restaurantDishes.length).toBeGreaterThanOrEqual(5);
    expect(service.ancestralRecipes.length).toBeGreaterThanOrEqual(5);
  });

  it('should filter shelf items by store chain', () => {
    service.selectedStoreFilter.set('Trader Joe’s');
    const tjItems = service.filteredShelfItems();
    expect(tjItems.length).toBeGreaterThan(0);
    expect(tjItems.every(i => i.storeChain === 'Trader Joe’s')).toBe(true);

    service.selectedStoreFilter.set('ALL');
    expect(service.filteredShelfItems().length).toBe(service.shelfInventory.length);
  });

  it('should filter farm CSAs by season', () => {
    service.selectedSeasonFilter.set('Autumn');
    const autumnCsa = service.filteredFarmCsa();
    expect(autumnCsa.length).toBeGreaterThan(0);
    expect(autumnCsa.every(c => c.season === 'Autumn')).toBe(true);
  });

  it('should filter restaurant dishes by cuisine', () => {
    service.selectedCuisineFilter.set('Mediterranean');
    const medDishes = service.filteredRestaurantDishes();
    expect(medDishes.length).toBeGreaterThan(0);
    expect(medDishes.every(d => d.cuisineCategory === 'Mediterranean')).toBe(true);
  });

  it('should filter ancestral recipes by paradigm', () => {
    service.selectedParadigmFilter.set('TCM (食疗)');
    const tcmRecipes = service.filteredAncestralRecipes();
    expect(tcmRecipes.length).toBeGreaterThan(0);
    expect(tcmRecipes.every(r => r.paradigm === 'TCM (食疗)')).toBe(true);
  });

  it('should simulate nutrigenomic ligand in 3D anatomy and patient state', () => {
    service.simulateIn3dAnatomy('sulforaphane', 'Liver');
    expect(patientState.selectedNutrigenomicLigand()).toBe('sulforaphane');
    expect(patientState.anatomyViewMode()).toBe('nutrigenomics');

    service.simulateIn3dAnatomy('butyrate', 'Colon');
    expect(patientState.selectedNutrigenomicLigand()).toBe('butyrate');
  });
});
