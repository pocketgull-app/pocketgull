import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChronobiologyMatrixComponent } from './chronobiology-matrix.component';
import { PatientStateService } from '../services/patient-state.service';
import { signal } from '@angular/core';

describe('ChronobiologyMatrixComponent', () => {
  let component: ChronobiologyMatrixComponent;
  let fixture: ComponentFixture<ChronobiologyMatrixComponent>;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {
      circadianDisruptionIndex: signal(32),
      cortisolDiurnalSlope: signal('Physiological Steep'),
      remSleepArchitectureScore: signal(84)
    };

    await TestBed.configureTestingModule({
      imports: [ChronobiologyMatrixComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChronobiologyMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default telemetry values and optimal circadian phase', () => {
    expect(component).toBeTruthy();
    expect(component.disruptionIndex()).toBe(32);
    expect(component.cortisol()).toBe('Physiological Steep');
    expect(component.sleepArchitecture()).toBe(84);
    expect(component.simulatedWakeHour()).toBe(7.0);
    expect(component.targetWakeTime()).toBe('07:00 AM');
    expect(component.circadianPhaseName()).toBe('Optimal Circadian Entrainment');
  });

  it('2. Flips card on toggleCardFlip and checks flip status with debounce protection', () => {
    expect(component.isCardFlipped('cdi')).toBe(false);

    component.toggleCardFlip('cdi');
    expect(component.isCardFlipped('cdi')).toBe(true);

    // Immediate second click within 200ms is debounced
    component.toggleCardFlip('cdi');
    expect(component.isCardFlipped('cdi')).toBe(true);

    // After debounce interval, toggles back
    vi.setSystemTime(Date.now() + 300);
    component.toggleCardFlip('cdi');
    expect(component.isCardFlipped('cdi')).toBe(false);
  });

  it('3. Updates simulated wake hour and recomputes target wake time and phase name', () => {
    const fakeEventEarly = {
      target: { value: '5.0' }
    } as unknown as Event;

    component.updateSimulatedWake(fakeEventEarly);
    expect(component.simulatedWakeHour()).toBe(5.0);
    expect(component.targetWakeTime()).toBe('05:00 AM');
    expect(component.circadianPhaseName()).toBe('Larks Phase (Early Peak Melatonin Clearance)');

    const fakeEventLate = {
      target: { value: '9.5' }
    } as unknown as Event;

    component.updateSimulatedWake(fakeEventLate);
    expect(component.simulatedWakeHour()).toBe(9.5);
    expect(component.targetWakeTime()).toBe('09:30 AM');
    expect(component.circadianPhaseName()).toBe('Delayed Sleep-Phase Shift (DSPS Risk)');
  });

  it('4. Handles elevated disruption index with suppressed melatonin', () => {
    mockPatientState.circadianDisruptionIndex.set(78);
    fixture.detectChanges();

    expect(component.disruptionIndex()).toBe(78);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('78');
  });
});
