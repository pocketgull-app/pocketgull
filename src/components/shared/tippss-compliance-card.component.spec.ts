import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TippssComplianceCardComponent } from './tippss-compliance-card.component';
import { TippssIngestionGuardService } from '../../services/hardware/tippss-ingestion-guard.service';
import { BleWearablesService } from '../../services/hardware/ble-wearables.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('TippssComplianceCardComponent', () => {
  let component: TippssComplianceCardComponent;
  let fixture: ComponentFixture<TippssComplianceCardComponent>;
  let guardService: TippssIngestionGuardService;
  let bleService: BleWearablesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TippssComplianceCardComponent],
      providers: [
        TippssIngestionGuardService,
        BleWearablesService,
        { provide: PatientStateService, useValue: { updateVital: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TippssComplianceCardComponent);
    component = fixture.componentInstance;
    guardService = TestBed.inject(TippssIngestionGuardService);
    bleService = TestBed.inject(BleWearablesService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders IEEE P2933 header and 6-pillar status', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('IEEE P2933™ TIPPSS Compliance Cockpit');
    expect(compiled.textContent).toContain('1. Trust');
    expect(compiled.textContent).toContain('2. Identity');
    expect(compiled.textContent).toContain('3. Privacy');
    expect(compiled.textContent).toContain('4. Protection');
    expect(compiled.textContent).toContain('5. Safety');
    expect(compiled.textContent).toContain('6. Security');
  });

  it('2. Enrolls Google Pixel Watch 2 when clicking enrollment button', () => {
    component.enrollPixel();
    expect(bleService.deviceName()).toContain('Pixel Watch 2');
    expect(bleService.statusMessage()).toContain('Titan M2 Root of Trust');
  });

  it('3. Enrolls Apple Watch when clicking Apple Watch enrollment button', () => {
    component.enrollApple();
    expect(bleService.deviceName()).toContain('Apple Watch');
    expect(bleService.statusMessage()).toContain('Secure Enclave');
  });

  it('4. Enrolls Garmin Smartwatch when clicking Garmin enrollment button', () => {
    component.enrollGarmin();
    expect(bleService.deviceName()).toContain('Garmin Smartwatch');
    expect(bleService.statusMessage()).toContain('ARM TrustZone');
  });

  it('5. Toggles privacy micro-consents dynamically', () => {
    expect(guardService.microConsents().allowRawPpgWaveforms).toBe(false);
    component.toggleConsent('allowRawPpgWaveforms');
    expect(guardService.microConsents().allowRawPpgWaveforms).toBe(true);

    component.toggleConsent('allowRawPpgWaveforms');
    expect(guardService.microConsents().allowRawPpgWaveforms).toBe(false);
  });

  it('6. Resets Safe-Harbor mode when clicking acknowledgment', () => {
    guardService.triggerSafeHarborDegradedMode('FDA-UDI-00840244700018-PIXELWATCH2', 'Test anomaly');
    expect(guardService.safeHarborState().isActive).toBe(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Autonomous Safe-Harbor Interlock Active');

    guardService.resetSafeHarborMode();
    expect(guardService.safeHarborState().isActive).toBe(false);
  });

  it('7. Modulates RSSI proximity gate and detects simulated wireless relay attacks', () => {
    component.setNearProximity();
    expect(bleService.currentRssiDbm()).toBe(-68);
    expect(bleService.currentRssiDbm()).toBeGreaterThanOrEqual(guardService.rssiProximityThresholdDbm());

    component.simulateRelayAttack();
    expect(bleService.currentRssiDbm()).toBe(-92);
    expect(bleService.currentRssiDbm()).toBeLessThan(guardService.rssiProximityThresholdDbm());
  });

  it('8. Triggers Titan M2 Passkey Step-Up and displays AAL-2 attestation seal', async () => {
    await component.triggerPasskeyStepUp();
    expect(guardService.lastMedicationPasskeyReceipt()).toBeDefined();
    expect(guardService.lastMedicationPasskeyReceipt()?.aalLevel).toBe('AAL-2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('AAL-2');
  });

  it('9. Executes On-Device Local Edge Triage and updates acuity badge', async () => {
    await component.runEdgeTriageDemo('routine');
    expect(guardService.lastEdgeTriageResult()?.acuity).toBe('ROUTINE');

    await component.runEdgeTriageDemo('emergency');
    expect(guardService.lastEdgeTriageResult()?.acuity).toBe('STAT_EMERGENCY');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('STAT_EMERGENCY');
  });

  it('10. Toggles Bedside Sentinel Kiosk mode and responds to battery swelling risk', () => {
    expect(component.sentinelService.bedsideSentinelConfig().isEnabled).toBe(false);
    component.toggleBedsideSentinel();
    expect(component.sentinelService.bedsideSentinelConfig().isEnabled).toBe(true);

    component.simulateSwellingOvercharge();
    expect(component.sentinelService.batteryTelemetry().swellingRiskDetected).toBe(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Wall-tethered 100% overcharge detected');

    component.simulatePreservationCycle();
    expect(component.sentinelService.batteryTelemetry().swellingRiskDetected).toBe(false);
  });

  it('11. Freezes waveform incident snapshot into circular buffer on manual diagnostic command', () => {
    expect(component.waveformBuffer.frozenIncidentSnapshots().length).toBe(0);
    component.triggerAnomalySnapshot();
    expect(component.waveformBuffer.frozenIncidentSnapshots().length).toBe(1);

    const snapshot = component.waveformBuffer.frozenIncidentSnapshots()[0];
    expect(snapshot.triggerReason).toContain('Manual Clinician Diagnostic Trigger');
    expect(snapshot.sha256Part11Digest).toContain('sha256-part11-');
  });

  it('12. Exports standalone sovereign patient bundle with zero cloud tethering', async () => {
    await component.exportPatientBundle();
    const bundle = component.lastExportedBundle();
    expect(bundle).toBeDefined();
    expect(bundle).toContain('SOVEREIGN-BUNDLE-');
    expect(bundle).toContain('Zero-Cloud-Tether');
  });

  it('13. Simulates nuisance alarm suppression and computes clinician attention time saved', () => {
    expect(component.waveformBuffer.nuisanceAlarmsSuppressed()).toBe(0);
    component.simulateNuisanceAlarmFilter();
    expect(component.waveformBuffer.nuisanceAlarmsSuppressed()).toBe(5);
    expect(component.waveformBuffer.clinicianMinutesSaved()).toBe(6.0);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alarm Fatigue Shield');
    expect(compiled.textContent).toContain('5 false alarms');
    expect(compiled.textContent).toContain('6 min');
  });
});
