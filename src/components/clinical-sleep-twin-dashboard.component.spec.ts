import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalSleepTwinDashboardComponent } from './clinical-sleep-twin-dashboard.component';

describe('ClinicalSleepTwinDashboardComponent', () => {
  let component: ClinicalSleepTwinDashboardComponent;
  let fixture: ComponentFixture<ClinicalSleepTwinDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalSleepTwinDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalSleepTwinDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default clinical sleep parameters and computes baseline riskScore', () => {
    expect(component).toBeTruthy();
    expect(component.age()).toBe(65);
    expect(component.ahi()).toBe(18);
    expect(component.n3Sws()).toBe(12);
    expect(component.thetaAlphaRatio()).toBe(1.5);

    // raw = (65 * 0.4) + (18 * 0.8) - (12 * 1.2) + (1.5 * 10) = 26 + 14.4 - 14.4 + 15 = 41
    expect(component.riskScore()).toBe(41);
    expect(component.riskStatusText()).toContain('Moderate Risk');
  });

  it('2. Modulates parameters and categorizes risk status text across tiers', () => {
    // Elevate risk: high age, severe AHI, minimal N3 SWS, high theta/alpha
    component.age.set(80);
    component.ahi.set(45);
    component.n3Sws.set(2);
    component.thetaAlphaRatio.set(2.8);
    fixture.detectChanges();

    expect(component.riskScore()).toBeGreaterThan(60);
    expect(component.riskStatusText()).toContain('Elevated Risk');
    expect(component.riskScoreColorClass()).toContain('text-rose-600');
    expect(component.riskBadgeClass()).toContain('text-rose-700');

    // Lower risk: young, zero AHI, high N3 SWS, low theta/alpha
    component.age.set(25);
    component.ahi.set(2);
    component.n3Sws.set(30);
    component.thetaAlphaRatio.set(0.6);
    fixture.detectChanges();

    expect(component.riskScore()).toBeLessThanOrEqual(30);
    expect(component.riskStatusText()).toContain('Low Risk');
    expect(component.riskScoreColorClass()).toContain('text-emerald-600');
  });

  it('3. Computes conformal prediction bounds and interval width correctly', () => {
    const uncertainty = component.conformalUncertainty();
    expect(uncertainty).toBeGreaterThan(0);

    const lower = component.conformalLower();
    const upper = component.conformalUpper();
    expect(upper).toBeGreaterThanOrEqual(lower);

    const width = parseFloat(component.intervalWidth());
    expect(width).toBeGreaterThan(0);
    expect(component.isTtaActive()).toBe(width > 0.20);
  });

  it('4. Generates valid SVG hypnogram path string based on sleep architecture', () => {
    const path = component.hypnogramPathD();
    expect(path).toBeTruthy();
    expect(path.startsWith('M 0,0')).toBe(true);
    expect(path).toContain('L ');
  });

  it('5. Handles slider input events through change methods', () => {
    const fakeAgeEvent = { target: { value: '72' } } as unknown as Event;
    component.onAgeChange(fakeAgeEvent);
    expect(component.age()).toBe(72);

    const fakeAhiEvent = { target: { value: '28' } } as unknown as Event;
    component.onAhiChange(fakeAhiEvent);
    expect(component.ahi()).toBe(28);

    const fakeN3Event = { target: { value: '18' } } as unknown as Event;
    component.onN3Change(fakeN3Event);
    expect(component.n3Sws()).toBe(18);

    const fakeThetaEvent = { target: { value: '2.2' } } as unknown as Event;
    component.onThetaChange(fakeThetaEvent);
    expect(component.thetaAlphaRatio()).toBe(2.2);
  });
});
