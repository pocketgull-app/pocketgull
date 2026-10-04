import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DirectIomtConsoleComponent } from './direct-iomt-console.component';
import { DirectIomtWearablesService } from '../../services/hardware/direct-iomt-wearables.service';
import { TippssIngestionGuardService } from '../../services/hardware/tippss-ingestion-guard.service';
import { WaveformEventBufferService } from '../../services/hardware/waveform-event-buffer.service';
import { HardwareLifecycleSentinelService } from '../../services/hardware/hardware-lifecycle-sentinel.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('DirectIomtConsoleComponent', () => {
  let component: DirectIomtConsoleComponent;
  let fixture: ComponentFixture<DirectIomtConsoleComponent>;
  let iomtService: DirectIomtWearablesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectIomtConsoleComponent],
      providers: [
        DirectIomtWearablesService,
        TippssIngestionGuardService,
        WaveformEventBufferService,
        HardwareLifecycleSentinelService,
        PatientStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectIomtConsoleComponent);
    component = fixture.componentInstance;
    iomtService = TestBed.inject(DirectIomtWearablesService);
    fixture.detectChanges();
  });

  afterEach(() => {
    iomtService.stopBackgroundSync();
  });

  it('1. Initializes with Apple HealthKit as default provider and displays biometrics', () => {
    expect(component).toBeTruthy();
    expect(component.activeDevice().manufacturer).toBe('Apple Inc.');
    expect(component.activeDevice().hardwareRootOfTrust).toBe('APPLE_SECURE_ENCLAVE');
    expect(component.liveBiometrics().heartRateBpm).toBeGreaterThan(0);
  });

  it('2. Switches active tabs between telemetry, tippss, compaction, and battery', () => {
    expect(component.activeTab()).toBe('telemetry');

    component.activeTab.set('tippss');
    expect(component.activeTab()).toBe('tippss');

    component.activeTab.set('compaction');
    expect(component.activeTab()).toBe('compaction');

    component.activeTab.set('battery');
    expect(component.activeTab()).toBe('battery');
  });

  it('3. Switches provider to Google Health Connect (Titan M2 Root of Trust)', () => {
    component.onProviderChange('GOOGLE_HEALTH_CONNECT');
    expect(iomtService.activeProvider()).toBe('GOOGLE_HEALTH_CONNECT');
    expect(component.activeDevice().hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
  });

  it('4. Toggles continuous background sync loop', () => {
    component.onToggleBackgroundSync(false);
    expect(component.activeDevice().isBackgroundSyncActive).toBe(false);

    component.onToggleBackgroundSync(true);
    expect(component.activeDevice().isBackgroundSyncActive).toBe(true);

    component.onToggleBackgroundSync(false);
  });

  it('5. Triggers manual sync on demand', async () => {
    const spy = vi.spyOn(iomtService, 'triggerManualSync');
    await component.onTriggerManualSync();
    expect(spy).toHaveBeenCalled();
  });

  it('6. Simulates cardiac anomaly to test pre/post event buffer freezing', async () => {
    const spy = vi.spyOn(iomtService, 'triggerTestCardiacAnomaly');
    await component.onSimulateAnomaly();
    expect(spy).toHaveBeenCalledWith('tachycardia');
  });

  it('7. Exports 21 CFR Part 11 electronic audit receipt into modal', () => {
    expect(component.receiptModalContent()).toBeNull();
    component.onExportAuditReceipt();
    expect(component.receiptModalContent()).not.toBeNull();
    expect(component.receiptModalContent()).toContain('IEEE P2933™ TIPPSS');
  });

  it('8. Emits close event when requested', () => {
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);
    component.close.emit();
    expect(closeSpy).toHaveBeenCalled();
  });
});
