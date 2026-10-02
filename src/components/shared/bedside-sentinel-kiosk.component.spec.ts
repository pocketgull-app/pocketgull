import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedsideSentinelKioskComponent } from './bedside-sentinel-kiosk.component';
import { HardwareLifecycleSentinelService } from '../../services/hardware/hardware-lifecycle-sentinel.service';
import { BleWearablesService } from '../../services/hardware/ble-wearables.service';
import { WaveformEventBufferService } from '../../services/hardware/waveform-event-buffer.service';
import { PatientStateService } from '../../services/patient-state.service';
import { TippssIngestionGuardService } from '../../services/hardware/tippss-ingestion-guard.service';

describe('BedsideSentinelKioskComponent', () => {
  let component: BedsideSentinelKioskComponent;
  let fixture: ComponentFixture<BedsideSentinelKioskComponent>;
  let sentinelService: HardwareLifecycleSentinelService;
  let bleService: BleWearablesService;
  let waveformBuffer: WaveformEventBufferService;

  beforeEach(async () => {
    // Stub alert to prevent modal hangs during tests
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [BedsideSentinelKioskComponent],
      providers: [
        HardwareLifecycleSentinelService,
        BleWearablesService,
        WaveformEventBufferService,
        TippssIngestionGuardService,
        { provide: PatientStateService, useValue: { updateVital: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BedsideSentinelKioskComponent);
    component = fixture.componentInstance;
    sentinelService = TestBed.inject(HardwareLifecycleSentinelService);
    bleService = TestBed.inject(BleWearablesService);
    waveformBuffer = TestBed.inject(WaveformEventBufferService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Initializes and renders Bedside Sentinel Kiosk header and clock', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bedside Sentinel Kiosk');
    expect(compiled.textContent).toContain('Circular Sentinel');
    expect(component.currentTime()).toMatch(/^\d{2}:\d{2}$/);
  });

  it('2. Toggles 2700K amber night light lantern mode', () => {
    expect(component.isNightLightActive()).toBe(false);
    component.toggleNightLight();
    expect(component.isNightLightActive()).toBe(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lantern ON');

    component.toggleNightLight();
    expect(component.isNightLightActive()).toBe(false);
  });

  it('3. Toggles 15% display dimmer and updates sentinel service config', () => {
    expect(component.isDimmed()).toBe(false);
    component.toggleDimmer();
    expect(component.isDimmed()).toBe(true);
    expect(sentinelService.bedsideSentinelConfig().dimDisplay).toBe(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('15% Dim');

    component.toggleDimmer();
    expect(component.isDimmed()).toBe(false);
    expect(sentinelService.bedsideSentinelConfig().dimDisplay).toBe(false);
  });

  it('4. Toggles fullscreen mode state', () => {
    expect(component.isFullscreen()).toBe(false);
    component.toggleFullscreenMode();
    expect(component.isFullscreen()).toBe(true);

    component.toggleFullscreenMode();
    expect(component.isFullscreen()).toBe(false);
  });

  it('5. Renders live biometrics from BleWearablesService', () => {
    bleService.heartRate.set(68);
    bleService.spO2.set(99);
    bleService.temperature.set(98.6);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('68');
    expect(compiled.textContent).toContain('99%');
    expect(compiled.textContent).toContain('98.6°F');
  });

  it('6. Simulates lithium pouch preservation cycle and updates sentry status', () => {
    component.simulatePreservationCycle();
    expect(sentinelService.batteryTelemetry().levelPercent).toBe(65);
    expect(sentinelService.batteryTelemetry().swellingRiskDetected).toBe(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('20-80% Cycle Safe');
  });

  it('7. Displays battery swelling warning when overcharge risk is detected', () => {
    sentinelService.simulateBatteryParameters({
      levelPercent: 100,
      isCharging: true,
      swellingRisk: true
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Overcharge Risk');
    expect(compiled.textContent).toContain('Wall-tethered 100% overcharge detected');
  });

  it('8. Triggers STAT emergency bypass, freezing high-resolution waveform snapshot with Part 11 seal', () => {
    expect(waveformBuffer.frozenIncidentSnapshots().length).toBe(0);
    component.triggerEmergencyBypass();

    expect(waveformBuffer.frozenIncidentSnapshots().length).toBe(1);
    const snapshot = waveformBuffer.frozenIncidentSnapshots()[0];
    expect(snapshot.triggerReason).toContain('STAT Bedside Kiosk Emergency Activation');
    expect(snapshot.acuity).toBe('STAT_EMERGENCY');
    expect(snapshot.sha256Part11Digest).toContain('sha256-part11-incident-');
  });

  it('9. Reflects Alarm Fatigue Shield metrics in bedside status', () => {
    waveformBuffer.recordNuisanceAlarmSuppressed(10);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('10 false alarms suppressed');
    expect(compiled.textContent).toContain('12 min sleep protected');
  });
});
