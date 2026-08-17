import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { PatientStateService } from '../patient-state.service';
import { BiometricSensorFusionService } from './biometric-sensor-fusion.service';

export interface IBleDeviceTelemetry {
  deviceName: string;
  deviceId: string;
  connected: boolean;
  batteryLevelPct: number | null;
  heartRateBpm: number | null;
  hrvRmssdMs: number | null;
  spo2Pct: number | null;
  lastPacketTimestamp: string | null;
  rrIntervals: number[];
}

@Injectable({
  providedIn: 'root'
})
export class WebBluetoothTelemetryService {
  private patientState = inject(PatientStateService, { optional: true });
  private sensorFusion = inject(BiometricSensorFusionService, { optional: true });
  private ngZone = inject(NgZone);

  // Angular Signals
  readonly isConnected = signal<boolean>(false);
  readonly deviceName = signal<string>('Disconnected');
  readonly deviceId = signal<string | null>(null);
  readonly batteryLevel = signal<number | null>(null);
  readonly liveHeartRate = signal<number | null>(null);
  readonly liveHrvRmssd = signal<number | null>(null);
  readonly liveSpO2 = signal<number | null>(null);
  readonly lastTimestamp = signal<string | null>(null);
  readonly recentRrIntervals = signal<number[]>([]);
  readonly isScanning = signal<boolean>(false);
  readonly isSimulated = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private bluetoothDevice: any = null;
  private hrCharacteristic: any = null;
  private simTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Check if standard W3C Web Bluetooth is available in the current browser engine.
   */
  public isWebBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Request Bluetooth Pairing with standard BLE Heart Rate and Pulse Oximeter GATT services.
   */
  public async requestAndConnectDevice(): Promise<boolean> {
    this.error.set(null);
    if (!this.isWebBluetoothAvailable()) {
      this.error.set('Web Bluetooth API is not supported in this browser. You can use Simulated BLE Mode.');
      return false;
    }

    try {
      this.isScanning.set(true);
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: ['battery_service', 'pulse_oximeter']
      });

      this.bluetoothDevice = device;
      this.deviceName.set(device.name || 'BLE Heart Monitor');
      this.deviceId.set(device.id);

      device.addEventListener('gattserverdisconnected', () => {
        this.ngZone.run(() => {
          this.handleDisconnect();
        });
      });

      const server = await device.gatt.connect();
      
      // Connect Heart Rate Service (0x180D)
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const characteristic = await hrService.getCharacteristic('heart_rate_measurement');
        this.hrCharacteristic = characteristic;

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          this.ngZone.run(() => {
            this.handleHeartRateData(event.target.value);
          });
        });
      } catch (err: any) {
        console.warn('Could not bind heart_rate service:', err);
      }

      // Connect Battery Service (0x180F) if available
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryChar.readValue();
        this.batteryLevel.set(batteryValue.getUint8(0));
      } catch {
        // Battery service optional
      }

      this.isConnected.set(true);
      this.isScanning.set(false);
      this.isSimulated.set(false);
      return true;
    } catch (err: any) {
      this.isScanning.set(false);
      this.error.set(err.message || 'Bluetooth connection was cancelled or failed.');
      return false;
    }
  }

  /**
   * Parses standard Bluetooth GATT Heart Rate Measurement payload (0x2A37).
   */
  public handleHeartRateData(dataView: DataView): void {
    const flags = dataView.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const hasRr = (flags & 0x10) !== 0;

    let offset = 1;
    let hr = 0;
    if (is16Bit) {
      hr = dataView.getUint16(offset, true);
      offset += 2;
    } else {
      hr = dataView.getUint8(offset);
      offset += 1;
    }

    this.liveHeartRate.set(hr);
    const nowIso = new Date().toISOString();
    this.lastTimestamp.set(nowIso);

    // Parse RR-Intervals (1/1024 seconds) if present
    if (hasRr) {
      const rrList: number[] = [];
      while (offset + 1 < dataView.byteLength) {
        const rawRr = dataView.getUint16(offset, true);
        const rrMs = Math.round((rawRr / 1024) * 1000);
        rrList.push(rrMs);
        offset += 2;
      }

      if (rrList.length > 0) {
        const updated = [...this.recentRrIntervals(), ...rrList].slice(-20);
        this.recentRrIntervals.set(updated);
        this.computeHrvRmssd(updated);
      }
    }

    // Push into Patient State
    if (this.patientState) {
      this.patientState.updateVital('hr', hr.toString());
    }
  }

  /**
   * Calculate Root Mean Square of Successive Differences (RMSSD) from RR intervals.
   */
  private computeHrvRmssd(rrList: number[]): void {
    if (rrList.length < 2) return;
    let sumSquaredDiffs = 0;
    for (let i = 1; i < rrList.length; i++) {
      const diff = rrList[i] - rrList[i - 1];
      sumSquaredDiffs += diff * diff;
    }
    const rmssd = Math.round(Math.sqrt(sumSquaredDiffs / (rrList.length - 1)));
    this.liveHrvRmssd.set(rmssd);
  }

  /**
   * Start Simulated BLE Monitor stream for automated testing or non-Bluetooth hardware.
   */
  public startSimulatedTelemetry(baseHr = 72, baseHrv = 65, baseSpo2 = 98): void {
    this.stopSimulatedTelemetry();
    this.isSimulated.set(true);
    this.isConnected.set(true);
    this.deviceName.set('Simulated Polar H10 BLE Sensor');
    this.deviceId.set('SIM-BLE-POLAR-01');
    this.batteryLevel.set(92);
    this.liveHeartRate.set(baseHr);
    this.liveHrvRmssd.set(baseHrv);
    this.liveSpO2.set(baseSpo2);

    let tick = 0;
    this.simTimer = setInterval(() => {
      tick++;
      const jitterHr = baseHr + Math.sin(tick * 0.3) * 4 + (Math.random() * 2 - 1);
      const currentHr = Math.round(jitterHr);
      const rrMs = Math.round(60000 / currentHr);
      const updatedRr = [...this.recentRrIntervals(), rrMs].slice(-20);
      
      this.liveHeartRate.set(currentHr);
      this.recentRrIntervals.set(updatedRr);
      this.computeHrvRmssd(updatedRr);
      this.lastTimestamp.set(new Date().toISOString());

      if (this.patientState) {
        this.patientState.updateVital('hr', currentHr.toString());
        this.patientState.updateVital('spo2', baseSpo2.toString());
      }
    }, 1000);
  }

  public stopSimulatedTelemetry(): void {
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
    if (this.isSimulated()) {
      this.handleDisconnect();
    }
  }

  public disconnect(): void {
    this.stopSimulatedTelemetry();
    if (this.bluetoothDevice && this.bluetoothDevice.gatt && this.bluetoothDevice.gatt.connected) {
      this.bluetoothDevice.gatt.disconnect();
    }
    this.handleDisconnect();
  }

  private handleDisconnect(): void {
    this.isConnected.set(false);
    this.deviceName.set('Disconnected');
    this.deviceId.set(null);
    this.liveHeartRate.set(null);
    this.liveHrvRmssd.set(null);
    this.liveSpO2.set(null);
    this.batteryLevel.set(null);
    this.isSimulated.set(false);
  }

  public getTelemetrySnapshot(): IBleDeviceTelemetry {
    return {
      deviceName: this.deviceName(),
      deviceId: this.deviceId() || 'none',
      connected: this.isConnected(),
      batteryLevelPct: this.batteryLevel(),
      heartRateBpm: this.liveHeartRate(),
      hrvRmssdMs: this.liveHrvRmssd(),
      spo2Pct: this.liveSpO2(),
      lastPacketTimestamp: this.lastTimestamp(),
      rrIntervals: this.recentRrIntervals()
    };
  }
}
