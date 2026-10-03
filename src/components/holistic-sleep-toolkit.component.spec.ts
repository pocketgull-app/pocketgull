import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HolisticSleepToolkitComponent } from './holistic-sleep-toolkit.component';
import { PatientStateService } from '../services/patient-state.service';

describe('HolisticSleepToolkitComponent', () => {
  let component: HolisticSleepToolkitComponent;
  let fixture: ComponentFixture<HolisticSleepToolkitComponent>;
  let mockPatientService: any;

  beforeEach(async () => {
    mockPatientService = {};

    await TestBed.configureTestingModule({
      imports: [HolisticSleepToolkitComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HolisticSleepToolkitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default sleep fluidity index, conformal risk scores, and ambient metrics', () => {
    expect(component).toBeTruthy();
    expect(component.sleepFluidityIndex()).toBe(88.4);
    expect(component.riskScore()).toBe(0.184);
    expect(component.conformalLower()).toBe(0.124);
    expect(component.conformalUpper()).toBe(0.244);
    expect(component.n3Percentage()).toBe(21.5);
    expect(component.ahi()).toBe(3.8);
    expect(component.roomTempCelsius()).toBe(18.5);
  });

  it('2. Computes conformalWidth accurately from upper and lower confidence bounds', () => {
    expect(component.conformalWidth()).toBe((0.244 - 0.124).toFixed(3));

    component.conformalLower.set(0.100);
    component.conformalUpper.set(0.300);
    fixture.detectChanges();

    expect(component.conformalWidth()).toBe('0.200');
  });

  it('3. Exposes 8 structured sleep micro-actions across clinical categories', () => {
    const actions = component.microActions();
    expect(actions.length).toBe(8);

    const categories = actions.map(a => a.category);
    expect(categories).toContain('Clinical PSG');
    expect(categories).toContain('Ambient');
    expect(categories).toContain('Digital Detox');
    expect(categories).toContain('Circadian');
    expect(categories).toContain('Nutrition');
    expect(categories).toContain('Mind-Body');
  });

  it('4. Renders 4-phase sleep health resilience milestones with completion states', () => {
    const milestones = component.milestones();
    expect(milestones.length).toBe(4);
    expect(milestones[0].completed).toBe(true);
    expect(milestones[1].completed).toBe(true);
    expect(milestones[2].completed).toBe(false);
    expect(milestones[3].completed).toBe(false);
  });

  it('5. Reflects dynamic updates to sleep fluidity index and updates template view', () => {
    component.sleepFluidityIndex.set(94.2);
    fixture.detectChanges();

    expect(component.sleepFluidityIndex()).toBe(94.2);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('94.2%');
  });
});
