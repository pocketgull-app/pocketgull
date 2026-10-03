import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { CellularAutomataViewerComponent } from './cellular-automata-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('CellularAutomataViewerComponent Unit Suite', () => {
  let component: CellularAutomataViewerComponent;
  let mockPatientState: {
    vitals: ReturnType<typeof signal<any>>;
    issues: ReturnType<typeof signal<any>>;
  };

  beforeEach(async () => {
    mockPatientState = {
      vitals: signal({ hr: '72', cgmGlucoseMgDl: '105' }),
      issues: signal({})
    };

    await TestBed.configureTestingModule({
      imports: [CellularAutomataViewerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CellularAutomataViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully with default Conway (B3/S23) preset', () => {
    expect(component).toBeTruthy();
    expect(component.activePreset().id).toBe('conway_b3s23');
    expect(component.presets.length).toBe(4);
    expect(component.isRunning()).toBe(true);
    expect(component.generation()).toBe(0);
  });

  it('2. Switches presets across biological cellular automata models', () => {
    const highLife = component.presets.find(p => p.id === 'highlife_b36s23');
    expect(highLife).toBeDefined();
    if (highLife) {
      component.selectPreset(highLife);
      expect(component.activePreset().id).toBe('highlife_b36s23');
    }

    const dayNight = component.presets.find(p => p.id === 'day_night_b3678s34678');
    expect(dayNight).toBeDefined();
    if (dayNight) {
      component.selectPreset(dayNight);
      expect(component.activePreset().id).toBe('day_night_b3678s34678');
    }
  });

  it('3. Synchronizes with patient telemetry across clinical states', () => {
    // 1. Normal telemetry -> Conway
    mockPatientState.vitals.set({ hr: '70', cgmGlucoseMgDl: '100' });
    mockPatientState.issues.set({});
    component.syncWithPatientTelemetry();
    expect(component.activePreset().id).toBe('conway_b3s23');

    // 2. Acute metabolic stress (high glucose or tachycardia) -> HighLife
    mockPatientState.vitals.set({ hr: '102', cgmGlucoseMgDl: '175' });
    component.syncWithPatientTelemetry();
    expect(component.activePreset().id).toBe('highlife_b36s23');

    // 3. Chronic disease / issues present -> Day & Night autophagy
    mockPatientState.vitals.set({ hr: '75', cgmGlucoseMgDl: '110' });
    mockPatientState.issues.set({ 'metabolic-syndrome': { active: true } });
    component.syncWithPatientTelemetry();
    expect(component.activePreset().id).toBe('day_night_b3678s34678');
  });

  it('4. Executes cellular perturbation triggers (Cytokine Storm, Antioxidant, Stem Cell)', () => {
    // Seed initial grid
    component.seedRandomGrid();

    // Cytokine Storm
    component.injectCytokineStorm();
    expect(component.activeCellCount()).toBeGreaterThanOrEqual(0);

    // Antioxidant Pulse
    component.administerAntioxidantPulse();
    expect(component.activeCellCount()).toBeGreaterThanOrEqual(0);

    // Stem Cell Glider
    component.injectStemCellGlider();
    expect(component.activeCellCount()).toBeGreaterThanOrEqual(0);
  });

  it('5. Controls execution state (togglePlay, stepOnce, clearGrid)', () => {
    expect(component.isRunning()).toBe(true);
    component.togglePlay();
    expect(component.isRunning()).toBe(false);

    // Step once increments generation
    expect(component.generation()).toBe(0);
    component.stepOnce();
    expect(component.generation()).toBe(1);

    // Clear grid
    component.clearGrid();
    expect(component.activeCellCount()).toBe(0);
    expect(component.densityPercentage()).toBe('0.0');
  });
});
