import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgronomicSoilProcurementCardComponent } from './agronomic-soil-procurement-card.component';
import { AgronomicSoilProcurementService } from '../../services/agronomic-soil-procurement.service';

describe('AgronomicSoilProcurementCardComponent', () => {
  let component: AgronomicSoilProcurementCardComponent;
  let fixture: ComponentFixture<AgronomicSoilProcurementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgronomicSoilProcurementCardComponent],
      providers: [AgronomicSoilProcurementService]
    }).compileComponents();

    fixture = TestBed.createComponent(AgronomicSoilProcurementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default soil tab, baseline inputs, and computed regenerative score', () => {
    expect(component).toBeTruthy();
    expect(component.activeSubTab()).toBe('soil');
    expect(component.soilOrganicMatter).toBe(4.5);
    expect(component.soilPh).toBe(6.5);
    expect(component.tillageIntensity).toBe('NO_TILL');

    const result = component.soilResult();
    expect(result).toBeTruthy();
    expect(result.regenerativeSoilScore).toBeGreaterThan(0);
    expect(result.mycorrhizalGlomalinStabilityTier).toBeDefined();
  });

  it('2. Switches tabs between soil, farm, and grocery', () => {
    component.activeSubTab.set('farm');
    fixture.detectChanges();
    expect(component.activeSubTab()).toBe('farm');

    component.activeSubTab.set('grocery');
    fixture.detectChanges();
    expect(component.activeSubTab()).toBe('grocery');

    component.activeSubTab.set('soil');
    fixture.detectChanges();
    expect(component.activeSubTab()).toBe('soil');
  });

  it('3. Recomputes soilResult when soil parameters change', () => {
    const initialScore = component.soilResult().regenerativeSoilScore;

    component.soilOrganicMatter = 1.0;
    component.tillageIntensity = 'CONVENTIONAL_DEEP_TILL';
    component.fungalToBacterialRatio = 0.2;
    component.coverCropYears = 0;
    fixture.detectChanges();

    const degradedScore = component.soilResult().regenerativeSoilScore;
    expect(degradedScore).toBeLessThan(initialScore);
  });

  it('4. Computes farmResult when switching health priority and tillable acres', () => {
    component.healthPriority = 'GUT_BARRIER_HEALTH';
    component.tillableAcres = 40.0;
    fixture.detectChanges();

    const farmPlan = component.farmResult();
    expect(farmPlan).toBeTruthy();
    expect(farmPlan.recommendedCrops.length).toBeGreaterThan(0);
    expect(farmPlan.polycultureGuildRecommendation).toContain('Three Sisters');
  });

  it('5. Computes groceryResult when configuring grocery store parameters', () => {
    component.storeType = 'NEIGHBORHOOD_BODEGA';
    component.weeklyShoppers = 500;
    fixture.detectChanges();

    const groceryPlan = component.groceryResult();
    expect(groceryPlan).toBeTruthy();
    expect(groceryPlan.recommendedProducePortfolio.length).toBeGreaterThan(0);
    expect(groceryPlan.projectedSpoilageReductionPct).toBeGreaterThan(0);
  });
});
