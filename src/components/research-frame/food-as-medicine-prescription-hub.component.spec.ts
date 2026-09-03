import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodAsMedicinePrescriptionHubComponent } from './food-as-medicine-prescription-hub.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('FoodAsMedicinePrescriptionHubComponent Suite', () => {
  let component: FoodAsMedicinePrescriptionHubComponent;
  let fixture: ComponentFixture<FoodAsMedicinePrescriptionHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodAsMedicinePrescriptionHubComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(FoodAsMedicinePrescriptionHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes FoodAsMedicinePrescriptionHubComponent with default MIND diet pattern', () => {
    expect(component).toBeTruthy();
    expect(component.selectedPatternId()).toBe('PATTERN-MIND');
    expect(component.dietaryPatterns.length).toBeGreaterThanOrEqual(5);

    const active = component.activePattern();
    expect(active.name).toContain('MIND');
    expect(active.keyBioactives).toContain('Anthocyanins');
  });

  it('2. Switches dietary patterns and updates macronutrient distribution', () => {
    component.selectedPatternId.set('PATTERN-BLUE-ZONES');
    fixture.detectChanges();

    const active = component.activePattern();
    expect(active.name).toContain('Blue Zones');
    expect(active.macroSplit.carbsPct).toBe(60);
  });

  it('3. Provides produce prescriptions with USDA FoodData and culinary bioavailability tips', () => {
    const rx = component.producePrescriptions;
    expect(rx.length).toBeGreaterThanOrEqual(4);

    const sprouts = rx.find(r => r.foodName.includes('Broccoli Sprouts'));
    expect(sprouts).toBeDefined();
    expect(sprouts?.targetBioactive).toContain('Sulforaphane');
  });

  it('4. Emits selectQuery output when steering nutrition research', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    component.selectedPatternId.set('PATTERN-MED-DASH');
    component.steerNutritionResearch();

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('pubmed');
    expect(emitted?.query).toContain('Mediterranean DASH Diet');
  });
});
