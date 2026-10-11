import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalFoodshedOnlineMenuComponent } from './local-foodshed-online-menu.component';
import { LocalFoodshedOnlineMenuService } from '../services/local-foodshed-online-menu.service';
import { PatientStateService } from '../services/patient-state.service';

describe('LocalFoodshedOnlineMenuComponent', () => {
  let component: LocalFoodshedOnlineMenuComponent;
  let fixture: ComponentFixture<LocalFoodshedOnlineMenuComponent>;
  let service: LocalFoodshedOnlineMenuService;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalFoodshedOnlineMenuComponent],
      providers: [
        LocalFoodshedOnlineMenuService,
        PatientStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocalFoodshedOnlineMenuComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LocalFoodshedOnlineMenuService);
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('should create the component with initial shelves tab active', () => {
    expect(component).toBeTruthy();
    expect(service.activeViewTab()).toBe('shelves');
  });

  it('should switch across all 5 clinical foodshed tabs', () => {
    service.activeViewTab.set('farm_csa');
    fixture.detectChanges();
    expect(service.activeViewTab()).toBe('farm_csa');

    service.activeViewTab.set('online_delivery');
    fixture.detectChanges();
    expect(service.activeViewTab()).toBe('online_delivery');

    service.activeViewTab.set('restaurant_auditor');
    fixture.detectChanges();
    expect(service.activeViewTab()).toBe('restaurant_auditor');

    service.activeViewTab.set('ancestral_kitchen');
    fixture.detectChanges();
    expect(service.activeViewTab()).toBe('ancestral_kitchen');
  });

  it('should trigger 3D anatomy simulation when simulate button is pressed', () => {
    const firstShelfItem = service.shelfInventory[0];
    service.simulateIn3dAnatomy(firstShelfItem.nutrigenomicLigand, firstShelfItem.primaryOrganTarget);

    expect(patientState.selectedNutrigenomicLigand()).toBe(firstShelfItem.nutrigenomicLigand);
    expect(patientState.anatomyViewMode()).toBe('nutrigenomics');
  });

  it('should filter shelf items on store change', () => {
    const fakeEvent = { target: { value: 'Aldi' } } as unknown as Event;
    component.onStoreChange(fakeEvent);
    expect(service.selectedStoreFilter()).toBe('Aldi');
  });

  it('should filter cuisines and paradigms on change events', () => {
    const cuisineEvent = { target: { value: 'Thai & Vietnamese' } } as unknown as Event;
    component.onCuisineChange(cuisineEvent);
    expect(service.selectedCuisineFilter()).toBe('Thai & Vietnamese');

    const paradigmEvent = { target: { value: 'Ayurveda (Āhāra)' } } as unknown as Event;
    component.onParadigmChange(paradigmEvent);
    expect(service.selectedParadigmFilter()).toBe('Ayurveda (Āhāra)');
  });
});
