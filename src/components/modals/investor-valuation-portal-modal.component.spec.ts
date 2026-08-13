import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestorValuationPortalModalComponent } from './investor-valuation-portal-modal.component';

describe('InvestorValuationPortalModalComponent', () => {
  let component: InvestorValuationPortalModalComponent;
  let fixture: ComponentFixture<InvestorValuationPortalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorValuationPortalModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestorValuationPortalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the investor valuation portal modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to deck view mode with slide 1 active', () => {
    expect(component.viewMode()).toBe('deck');
    expect(component.activeSlideId()).toBe(1);
    expect(component.currentSlide()?.title).toContain('Problem');
  });

  it('should calculate live COCOMO II, COSYSMO, and COCOTS replication costs', () => {
    expect(component.sloc()).toBe(338582);
    expect(component.cocomoCost()).toBeGreaterThan(10000000);
    expect(component.totalReplicationCost()).toBeGreaterThan(15000000);
    expect(component.discountToReplicate()).toBeGreaterThan(50);
  });

  it('should switch view modes between pitch deck and multi-model simulator', () => {
    component.viewMode.set('simulator');
    fixture.detectChanges();
    expect(component.viewMode()).toBe('simulator');
  });

  it('should update hourly rate and recalculate cost metrics dynamically', () => {
    const initialCost = component.totalReplicationCost();
    component.hourlyRate.set(200);
    fixture.detectChanges();
    expect(component.totalReplicationCost()).toBeGreaterThan(initialCost);
  });
});
