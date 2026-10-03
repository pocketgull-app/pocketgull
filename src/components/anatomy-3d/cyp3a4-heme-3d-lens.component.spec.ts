import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Cyp3a4Heme3dLensComponent } from './cyp3a4-heme-3d-lens.component';

describe('Cyp3a4Heme3dLensComponent', () => {
  let component: Cyp3a4Heme3dLensComponent;
  let fixture: ComponentFixture<Cyp3a4Heme3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cyp3a4Heme3dLensComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Cyp3a4Heme3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should default to compound_i_ferryl catalytic stage', () => {
    expect(component.activeStage()).toBe('compound_i_ferryl');
    expect(component.telemetry().soretPeakNm).toBe(365);
    expect(component.telemetry().ironState).toContain('Fe4+=O');
  });

  it('should update stage cleanly upon user selection', () => {
    component.setStage('resting_ferric');
    expect(component.activeStage()).toBe('resting_ferric');
    expect(component.telemetry().soretPeakNm).toBe(417);
    expect(component.telemetry().coordinationNumber).toBe(6);
  });

  it('should apply azole competitive inhibitor correctly', () => {
    component.setInhibitor('competitive_azole');
    expect(component.activeInhibitor()).toBe('competitive_azole');
    expect(component.telemetry().soretPeakNm).toBe(424);
    expect(component.telemetry().inhibitorName).toBe('Ketoconazole');
    expect(component.telemetry().clinicalImpact).toContain('rhabdomyolysis');
  });

  it('should apply suicide MBI inactivation correctly', () => {
    component.setInhibitor('suicide_inactivation');
    expect(component.activeInhibitor()).toBe('suicide_inactivation');
    expect(component.telemetry().soretPeakNm).toBe(446);
    expect(component.telemetry().inhibitorName).toBe('Clarithromycin');
    expect(component.telemetry().clinicalImpact).toContain('De novo enzyme synthesis');
  });

  it('should adjust substrate and thiolate push parameters', () => {
    const fakeSubstrateEvent = { target: { value: '0.65' } } as unknown as Event;
    component.onSubstrateChange(fakeSubstrateEvent);
    expect(component.substrateRatio()).toBe(0.65);

    const fakeThiolateEvent = { target: { value: '1.40' } } as unknown as Event;
    component.onThiolateChange(fakeThiolateEvent);
    expect(component.thiolatePush()).toBe(1.40);
  });
});
