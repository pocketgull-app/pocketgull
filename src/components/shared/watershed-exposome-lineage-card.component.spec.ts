import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatershedExposomeLineageCardComponent } from './watershed-exposome-lineage-card.component';

describe('WatershedExposomeLineageCardComponent', () => {
  let component: WatershedExposomeLineageCardComponent;
  let fixture: ComponentFixture<WatershedExposomeLineageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatershedExposomeLineageCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WatershedExposomeLineageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate successfully with default tab as watershed', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('watershed');
    expect(component.selectedBasinId()).toBe('17110019');
    expect(component.selectedBasin().name).toContain('Puget Sound');
  });

  it('should update selected basin and biophysical metrics when changed', () => {
    component.selectedBasinId.set('07010206');
    fixture.detectChanges();

    const basin = component.selectedBasin();
    expect(basin.name).toContain('Upper Mississippi');
    expect(basin.hardnessCaCO3).toBe(268.0);
    expect(basin.tier).toBe('HIGH');
  });

  it('should compute Decision Curve Analysis (DCA) metrics reactively', () => {
    component.decisionThreshold.set(0.20);
    fixture.detectChanges();

    const dca = component.currentDca();
    expect(dca.netBenefitModel).toBeGreaterThan(0);
    expect(dca.netBenefitModel).toBeGreaterThan(dca.netBenefitTreatAll);
    expect(dca.interventionsAvoided).toBeGreaterThan(0);
  });

  it('should switch between tabs cleanly', () => {
    component.activeTab.set('gametes');
    expect(component.activeTab()).toBe('gametes');

    component.activeTab.set('dca');
    expect(component.activeTab()).toBe('dca');

    component.activeTab.set('manageability');
    expect(component.activeTab()).toBe('manageability');
  });

  it('should export FHIR R4 7-Gen Lineage Bundle successfully', () => {
    const spy = vi.spyOn(component.fhirFactory, 'buildFhirR4CarePlanBundle');
    component.exportFhirBundle();

    expect(spy).toHaveBeenCalled();
    expect(component.exportSuccess()).toBe(true);
  });
});
