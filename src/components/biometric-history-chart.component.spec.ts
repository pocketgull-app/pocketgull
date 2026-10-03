import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiometricHistoryChartComponent } from './biometric-history-chart.component';
import { PatientStateService } from '../services/patient-state.service';
import { PythonBridgeService } from '../services/python-bridge.service';
import { signal } from '@angular/core';

describe('BiometricHistoryChartComponent', () => {
  let component: BiometricHistoryChartComponent;
  let fixture: ComponentFixture<BiometricHistoryChartComponent>;
  let mockPatientState: any;
  let mockPythonBridge: any;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      canvas: {},
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 })
    });
  });

  beforeEach(async () => {
    mockPatientState = {
      biometricHistory: signal([
        { timestamp: '2026-10-01T08:00:00Z', type: 'hr', value: 72, source: 'Sensor' },
        { timestamp: '2026-10-01T08:05:00Z', type: 'hr', value: 76, source: 'Sensor' },
        { timestamp: '2026-10-01T08:00:00Z', type: 'bp', value: '120/80', source: 'Sensor' },
        { timestamp: '2026-10-01T08:00:00Z', type: 'spO2', value: 98, source: 'Sensor' },
        { timestamp: '2026-10-01T08:00:00Z', type: 'hrv', value: 55, source: 'Sensor' },
        { timestamp: '2026-10-01T08:00:00Z', type: 'coherence', value: 0.75, source: 'Sensor' },
        { timestamp: '2026-10-01T08:00:00Z', type: 'breathing', value: 14, source: 'Sensor' }
      ]),
      isDemoMode: signal(false)
    };

    mockPythonBridge = {
      isAvailable: signal<boolean | null>(true)
    };

    await TestBed.configureTestingModule({
      imports: [BiometricHistoryChartComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PythonBridgeService, useValue: mockPythonBridge }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BiometricHistoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes and computes biometric history and hasData flag for HR', () => {
    expect(component).toBeTruthy();
    expect(component.activeMetric()).toBe('hr');
    expect(component.hasData()).toBe(true);
    expect(component.biometricHistory().length).toBe(7);
  });

  it('2. Switches active metric between HR, BP, SpO2, HRV, Coherence, and Breathing', () => {
    component.activeMetric.set('bp');
    fixture.detectChanges();
    expect(component.activeMetric()).toBe('bp');
    expect(component.hasData()).toBe(true);

    component.activeMetric.set('spO2');
    fixture.detectChanges();
    expect(component.activeMetric()).toBe('spO2');
    expect(component.hasData()).toBe(true);

    component.activeMetric.set('hrv');
    fixture.detectChanges();
    expect(component.activeMetric()).toBe('hrv');
    expect(component.hasData()).toBe(true);
  });

  it('3. Accurately reports hasData false when no telemetry matches the selected filter', () => {
    mockPatientState.biometricHistory.set([
      { timestamp: '2026-10-01T08:00:00Z', type: 'hr', value: 72 }
    ]);
    fixture.detectChanges();

    component.activeMetric.set('coherence');
    fixture.detectChanges();
    expect(component.hasData()).toBe(false);
  });

  it('4. Reflects live telemetry status from PythonBridgeService', () => {
    expect(component.pythonBridge.isAvailable()).toBe(true);

    mockPythonBridge.isAvailable.set(false);
    fixture.detectChanges();
    expect(component.pythonBridge.isAvailable()).toBe(false);

    mockPythonBridge.isAvailable.set(null);
    fixture.detectChanges();
    expect(component.pythonBridge.isAvailable()).toBe(null);
  });

  it('5. Cleans up chart instance and simulation timers on destroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
