import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BleWearablesHudComponent } from './ble-wearables-hud.component';
import { BleWearablesService } from '../services/hardware/ble-wearables.service';

describe('BleWearablesHudComponent', () => {
  let component: BleWearablesHudComponent;
  let fixture: ComponentFixture<BleWearablesHudComponent>;
  let mockBleService: {
    isConnected: ReturnType<typeof signal<boolean>>;
    deviceName: ReturnType<typeof signal<string | null>>;
    heartRate: ReturnType<typeof signal<number | null>>;
    spO2: ReturnType<typeof signal<number | null>>;
    hrvRmssd: ReturnType<typeof signal<number>>;
    temperature: ReturnType<typeof signal<string | null>>;
    statusMessage: ReturnType<typeof signal<string>>;
    ppgWaveform: ReturnType<typeof signal<Array<{ t: number; amplitude: number }>>>;
    ecgWaveform: ReturnType<typeof signal<Array<{ t: number; uV: number }>>>;
    isSimulationActive: ReturnType<typeof signal<boolean>>;
    connectMultiVitalsSensor: ReturnType<typeof vi.fn>;
    startSyntheticStream: ReturnType<typeof vi.fn>;
    stopSyntheticStream: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockBleService = {
      isConnected: signal(false),
      deviceName: signal<string | null>(null),
      heartRate: signal<number | null>(72),
      spO2: signal<number | null>(98),
      hrvRmssd: signal<number>(48),
      temperature: signal<string | null>('98.4°F'),
      statusMessage: signal<string>('Ready to pair wearable device'),
      ppgWaveform: signal<Array<{ t: number; amplitude: number }>>([]),
      ecgWaveform: signal<Array<{ t: number; uV: number }>>([]),
      isSimulationActive: signal(false),
      connectMultiVitalsSensor: vi.fn(),
      startSyntheticStream: vi.fn(),
      stopSyntheticStream: vi.fn(),
      disconnect: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BleWearablesHudComponent],
      providers: [
        { provide: BleWearablesService, useValue: mockBleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BleWearablesHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component with initial disconnected status', () => {
    expect(component).toBeTruthy();
    expect(mockBleService.isConnected()).toBe(false);
  });

  it('should render header with title and Dual PPG / ECG Oscilloscope badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('BLE Wearable Waveform Sensor Fusion HUD');
    expect(compiled.textContent).toContain('Dual PPG + 1-Lead ECG Oscilloscope');
  });

  it('should render Pair BLE Device and Synthetic Stream buttons when disconnected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pair BLE Device');
    expect(compiled.textContent).toContain('Synthetic Stream');
    expect(compiled.textContent).not.toContain('Disconnect');

    component.connectBleDevice();
    expect(mockBleService.connectMultiVitalsSensor).toHaveBeenCalled();

    component.startSyntheticStream();
    expect(mockBleService.startSyntheticStream).toHaveBeenCalled();
  });

  it('should render Disconnect button when device is connected and trigger disconnect', () => {
    mockBleService.isConnected.set(true);
    mockBleService.deviceName.set('Polar H10 Heart Sensor');
    mockBleService.isSimulationActive.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Disconnect');
    expect(compiled.textContent).toContain('Polar H10 Heart Sensor');

    component.disconnectBleDevice();
    expect(mockBleService.disconnect).toHaveBeenCalled();
    expect(mockBleService.stopSyntheticStream).toHaveBeenCalled();
  });

  it('should display real-time live telemetry chips for HR, SpO2, HRV, and Autonomic Tone', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Heart Rate');
    expect(compiled.textContent).toContain('72');
    expect(compiled.textContent).toContain('SpO2 Saturation');
    expect(compiled.textContent).toContain('98%');
    expect(compiled.textContent).toContain('HRV RMSSD');
    expect(compiled.textContent).toContain('48');
    expect(compiled.textContent).toContain('Autonomic Tone');
    expect(compiled.textContent).toContain('Parasympathetic');

    // Test sympathetic state when HRV is low
    mockBleService.hrvRmssd.set(22);
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Sympathetic');
  });

  it('should render dual-trace canvas oscilloscope element and trace badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
    expect(compiled.textContent).toContain('Trace A: PPG Optical Pulse (50Hz)');
    expect(compiled.textContent).toContain('Trace B: Lead-I ECG P-QRS-T (125Hz)');
  });

  it('should clean up on destroy and stop active simulation stream', () => {
    mockBleService.isSimulationActive.set(true);
    component.ngOnDestroy();
    expect(mockBleService.stopSyntheticStream).toHaveBeenCalled();
  });
});
