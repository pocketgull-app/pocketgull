import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MoodConsciousnessMatrixComponent } from './mood-consciousness-matrix.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ActuarialGleeAudioService } from '../services/actuarial-glee-audio.service';

describe('MoodConsciousnessMatrixComponent Unit Suite', () => {
  let component: MoodConsciousnessMatrixComponent;

  beforeEach(async () => {
    const mockPatientManager = {
      selectedPatientId: signal('p001'),
      patients: signal([{ id: 'p001', name: 'Charles Darwin' }])
    };

    const mockAudio = {
      playTone: vi.fn(),
      stop: vi.fn(),
      isPlaying: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [MoodConsciousnessMatrixComponent],
      providers: [
        { provide: PatientStateService, useValue: { patientId: signal('p001') } },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: ActuarialGleeAudioService, useValue: mockAudio }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MoodConsciousnessMatrixComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with states catalog and initial focus state', () => {
    expect(component).toBeTruthy();
    expect(component.states.length).toBeGreaterThan(0);
    expect(component.selectedState().id).toBe('focus');
    expect(component.activePatientName()).toBe('Charles Darwin');
  });

  it('2. Computes SVG EEG wave path based on active target frequency', () => {
    const path = component.eegWavePath();
    expect(path).toBeDefined();
    expect(typeof path).toBe('string');
    expect(path.startsWith('M 0')).toBe(true);
  });

  it('3. Selects different consciousness state and updates prescription', () => {
    const calmState = component.states.find(s => s.id === 'calm');
    expect(calmState).toBeDefined();
    component.selectedState.set(calmState!);
    expect(component.selectedState().name).toBe('Meditative Calm');
    expect(component.selectedState().avsTarget.frequencyHz).toBe(10);
  });

  it('4. Provides state styling theme computed tokens', () => {
    const theme = component.stateTheme();
    expect(theme).toBeDefined();
    expect(theme.strokeColor).toBe('#f97316');
  });
});
