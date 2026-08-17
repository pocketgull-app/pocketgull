import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiometricBluetoothHubComponent } from './biometric-bluetooth-hub.component';
import { WebBluetoothTelemetryService } from '../services/hardware/web-bluetooth-telemetry.service';
import { BiometricImportService } from '../services/hardware/biometric-import.service';
import { PatientStateService } from '../services/patient-state.service';
import { BiometricSensorFusionService } from '../services/hardware/biometric-sensor-fusion.service';

describe('BiometricBluetoothHubComponent', () => {
  let component: BiometricBluetoothHubComponent;
  let fixture: ComponentFixture<BiometricBluetoothHubComponent>;
  let bleService: WebBluetoothTelemetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometricBluetoothHubComponent],
      providers: [
        WebBluetoothTelemetryService,
        BiometricImportService,
        PatientStateService,
        BiometricSensorFusionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BiometricBluetoothHubComponent);
    component = fixture.componentInstance;
    bleService = TestBed.inject(WebBluetoothTelemetryService);
    fixture.detectChanges();
  });

  afterEach(() => {
    bleService.disconnect();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle simulation telemetry correctly', () => {
    expect(bleService.isConnected()).toBe(false);

    component.toggleSimulation();
    fixture.detectChanges();
    expect(bleService.isConnected()).toBe(true);
    expect(bleService.isSimulated()).toBe(true);

    component.toggleSimulation();
    fixture.detectChanges();
    expect(bleService.isConnected()).toBe(false);
  });

  it('should emit close output', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});
