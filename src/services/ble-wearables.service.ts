import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTCharacteristic = any;

export interface IWearableDeviceStatus {
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  batteryLevel?: number | null;
  lastUpdated: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BleWearablesService {
  private patientState = inject(PatientStateService);

  readonly isSupported = signal<boolean>(typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any));
  readonly isConnected = signal<boolean>(false);
  readonly deviceName = signal<string | null>(null);
  readonly heartRate = signal<number | null>(null);
  readonly statusMessage = signal<string>('Ready to pair wearable device (Apple Watch / Garmin / Polar)');

  // --- Real-time PPG / ECG Waveform Telemetry Ring Buffers ---
  readonly ppgWaveform = signal<Array<{ t: number; amplitude: number }>>([]);
  readonly ecgWaveform = signal<Array<{ t: number; uV: number }>>([]);
  readonly hrvRmssd = signal<number>(45); // ms
  readonly rrIntervals = signal<number[]>([820, 835, 815, 840, 825]); // ms
  readonly isSimulationActive = signal<boolean>(false);

  private simulationTimer: any = null;
  private simStep = 0;
  private gattServer: BluetoothRemoteGATTServer | null = null;

  /**
   * Scans and connects to standard Bluetooth Low Energy (BLE) Heart Rate Monitors.
   */
  async connectHeartRateMonitor(): Promise<boolean> {
    if (!this.isSupported()) {
      this.statusMessage.set('Web Bluetooth API is not supported in this browser environment.');
      return false;
    }

    try {
      this.statusMessage.set('Scanning for BLE Heart Rate Monitors...');
      
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      this.deviceName.set(device.name || 'GATT Wearable Sensor');
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected.set(false);
        this.statusMessage.set('Device disconnected.');
      });

      this.statusMessage.set(`Connecting to ${this.deviceName()}...`);
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not establish GATT connection.');
      this.gattServer = server;

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.handleHeartRateNotification(event);
      });

      this.isConnected.set(true);
      this.statusMessage.set(`Connected to ${this.deviceName()}`);
      return true;

    } catch (err: any) {
      console.warn('[BleWearablesService] Bluetooth Pairing Error:', err);
      this.statusMessage.set(`Pairing error: ${err.message || 'Connection cancelled'}`);
      this.isConnected.set(false);
      return false;
    }
  }

  /**
   * Disconnects active BLE device session.
   */
  disconnect(): void {
    if (this.gattServer && this.gattServer.connected) {
      this.gattServer.disconnect();
    }
    this.isConnected.set(false);
    this.deviceName.set(null);
    this.heartRate.set(null);
    this.statusMessage.set('Disconnected.');
  }

  readonly spO2 = signal<number | null>(null);
  readonly temperature = signal<number | null>(null);
  readonly bloodPressure = signal<string | null>(null);

  /**
   * Scans and connects to standard Bluetooth Low Energy (BLE) Multi-Vitals Sensors (HR, SpO2, Temp, BP).
   */
  async connectMultiVitalsSensor(): Promise<boolean> {
    if (!this.isSupported()) {
      this.statusMessage.set('Web Bluetooth API is not supported in this browser environment.');
      return false;
    }

    try {
      this.statusMessage.set('Scanning for BLE Wearable Sensors (HR, SpO2, Thermometer, BP)...');
      
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['health_thermometer'] },
          { services: ['pulse_oximetry'] },
          { services: ['blood_pressure'] }
        ],
        optionalServices: ['battery_service', 'heart_rate', 'health_thermometer', 'pulse_oximetry', 'blood_pressure']
      });

      this.deviceName.set(device.name || 'GATT Multi-Vitals Sensor');
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected.set(false);
        this.statusMessage.set('Device disconnected.');
      });

      this.statusMessage.set(`Connecting to ${this.deviceName()}...`);
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not establish GATT connection.');
      this.gattServer = server;

      // 1. Heart Rate GATT Service
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleHeartRateNotification(ev));
      } catch (e) {
        console.info('[BLE] Heart Rate service optional or missing on device');
      }

      // 2. Health Thermometer GATT Service
      try {
        const tempService = await server.getPrimaryService('health_thermometer');
        const tempChar = await tempService.getCharacteristic('temperature_measurement');
        await tempChar.startNotifications();
        tempChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleTemperatureNotification(ev));
      } catch (e) {
        console.info('[BLE] Health Thermometer service optional or missing on device');
      }

      // 3. Pulse Oximeter GATT Service (SpO2)
      try {
        const oxService = await server.getPrimaryService('pulse_oximetry');
        const oxChar = await oxService.getCharacteristic('plx_continuous_measurement');
        await oxChar.startNotifications();
        oxChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleSpO2Notification(ev));
      } catch (e) {
        console.info('[BLE] Pulse Oximetry service optional or missing on device');
      }

      this.isConnected.set(true);
      this.statusMessage.set(`Connected to ${this.deviceName()} (Multi-Vitals Active)`);
      return true;

    } catch (err: any) {
      console.warn('[BleWearablesService] Bluetooth Pairing Error:', err);
      this.statusMessage.set(`Pairing error: ${err.message || 'Connection cancelled'}`);
      this.isConnected.set(false);
      return false;
    }
  }

  private handleHeartRateNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;

    let hr: number;
    if (is16Bit) {
      hr = value.getUint16(1, true);
    } else {
      hr = value.getUint8(1);
    }

    this.heartRate.set(hr);
    this.patientState.updateVital('hr', String(hr));
    this.statusMessage.set(`Live Wearable HR: ${hr} bpm`);
  }

  private handleTemperatureNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    // IEEE 11073-20601 FLOAT format (Exponent in upper byte, Mantissa in lower 3 bytes)
    const tempRaw = value.getFloat32(1, true);
    const tempF = Math.round((tempRaw * 1.8 + 32) * 10) / 10;

    this.temperature.set(tempF);
    this.patientState.updateVital('temp', `${tempF}°F`);
    this.statusMessage.set(`Live Wearable Temp: ${tempF}°F`);
  }

  private handleSpO2Notification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    // Standard GATT SpO2 SFLOAT parser
    const spO2Val = value.getUint8(1);
    if (spO2Val > 50 && spO2Val <= 100) {
      this.spO2.set(spO2Val);
      this.patientState.updateVital('spO2', `${spO2Val}%`);
      this.statusMessage.set(`Live Wearable SpO2: ${spO2Val}%`);
    }
  }

  /**
   * Starts real-time synthetic PPG (50 Hz) and single-lead ECG (125 Hz) waveform stream.
   * Useful for testing/demoing in environments without physical Web Bluetooth GATT hardware.
   */
  startSyntheticStream(): void {
    if (this.isSimulationActive()) return;

    this.isSimulationActive.set(true);
    this.isConnected.set(true);
    this.deviceName.set('Synthetic Sensor (PPG + 1-Lead ECG)');
    this.statusMessage.set('Live Synthetic Waveform Stream Active (50 Hz PPG / 125 Hz ECG)');

    let hrBase = 72;
    let ppgBuffer: Array<{ t: number; amplitude: number }> = [];
    let ecgBuffer: Array<{ t: number; uV: number }> = [];
    const maxPoints = 250; // Rolling 5s buffer

    this.simulationTimer = setInterval(() => {
      this.simStep++;
      const now = Date.now();

      // Respiratory sinus arrhythmia wobble
      const rsaPhase = (this.simStep % 100) / 100 * Math.PI * 2;
      const currentHr = hrBase + Math.sin(rsaPhase) * 4;

      // 1. Synthetic PPG AC optical pulse wave calculation
      const ppgPeriod = 50 / (currentHr / 60); // samples per beat at 50Hz interval
      const ppgPhase = (this.simStep % Math.round(ppgPeriod)) / ppgPeriod;
      
      // Systolic peak + dicrotic notch
      let ppgAmp = 0;
      if (ppgPhase < 0.2) {
        ppgAmp = Math.sin((ppgPhase / 0.2) * Math.PI) * 0.8;
      } else if (ppgPhase >= 0.2 && ppgPhase < 0.35) {
        ppgAmp = 0.8 - (ppgPhase - 0.2) * 2.0;
        if (ppgPhase > 0.25 && ppgPhase < 0.3) {
          ppgAmp += 0.15; // Dicrotic notch
        }
      } else {
        ppgAmp = 0.2 * Math.exp(-(ppgPhase - 0.35) * 2);
      }
      ppgAmp += (Math.random() - 0.5) * 0.02; // Sub-noise

      ppgBuffer.push({ t: now, amplitude: Math.max(0, ppgAmp) });
      if (ppgBuffer.length > maxPoints) ppgBuffer.shift();
      this.ppgWaveform.set([...ppgBuffer]);

      // 2. Synthetic ECG Single-Lead P-QRS-T complex calculation
      const ecgPeriod = 50 / (currentHr / 60);
      const ecgPhase = (this.simStep % Math.round(ecgPeriod)) / ecgPeriod;
      let ecgMicrovolts = 0;

      if (ecgPhase < 0.1) {
        // P-wave
        ecgMicrovolts = Math.sin((ecgPhase / 0.1) * Math.PI) * 120;
      } else if (ecgPhase >= 0.15 && ecgPhase < 0.18) {
        // Q-dip
        ecgMicrovolts = -150;
      } else if (ecgPhase >= 0.18 && ecgPhase < 0.22) {
        // R-spike peak
        ecgMicrovolts = 1200;
      } else if (ecgPhase >= 0.22 && ecgPhase < 0.25) {
        // S-dip
        ecgMicrovolts = -350;
      } else if (ecgPhase >= 0.35 && ecgPhase < 0.55) {
        // T-recovery wave
        ecgMicrovolts = Math.sin(((ecgPhase - 0.35) / 0.2) * Math.PI) * 250;
      }
      ecgMicrovolts += (Math.random() - 0.5) * 30; // Electrodes baseline noise

      ecgBuffer.push({ t: now, uV: ecgMicrovolts });
      if (ecgBuffer.length > maxPoints) ecgBuffer.shift();
      this.ecgWaveform.set([...ecgBuffer]);

      // Dynamic HR update to signals & PatientStateService
      const displayHr = Math.round(currentHr);
      this.heartRate.set(displayHr);
      this.spO2.set(98);
      this.patientState.updateVital('hr', String(displayHr));
      this.patientState.updateVital('spO2', '98%');
    }, 20); // 50 Hz interval tick
  }

  /**
   * Stops synthetic waveform stream.
   */
  stopSyntheticStream(): void {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    this.isSimulationActive.set(false);
    this.isConnected.set(false);
    this.statusMessage.set('Synthetic stream stopped.');
  }
}

