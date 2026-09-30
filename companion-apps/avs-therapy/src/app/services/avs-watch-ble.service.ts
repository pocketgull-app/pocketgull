import { Injectable, signal, NgZone, inject } from '@angular/core';

export interface WatchBiofeedbackTelemetry {
  heartRate: number;
  cedaMicrosiemens: number;
  skinTempCelsius: number;
  tone: 'SYMPATHETIC' | 'VAGAL_COHERENT' | 'PARASYMPATHETIC';
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AvsWatchBleService {
  private readonly zone = inject(NgZone);

  // Service & Characteristic UUIDs matching Wear OS GATT Server
  readonly SERVICE_UUID = '0000avs0-0000-1000-8000-00805f9b34fb';
  readonly CEDA_CHAR_UUID = '0000ceda-0000-1000-8000-00805f9b34fb';
  readonly HAPTIC_CHAR_UUID = '0000hapt-0000-1000-8000-00805f9b34fb';

  // Reactive State Signals
  readonly isConnected = signal(false);
  readonly isConnecting = signal(false);
  readonly deviceName = signal<string | null>(null);
  readonly heartRate = signal(72);
  readonly cedaMicrosiemens = signal(1.8);
  readonly skinTempCelsius = signal(33.5);
  readonly autonomicTone = signal<'SYMPATHETIC' | 'VAGAL_COHERENT' | 'PARASYMPATHETIC'>('VAGAL_COHERENT');
  readonly errorMessage = signal<string | null>(null);

  private bluetoothDevice: any = null;
  private gattServer: any = null;
  private hapticCharacteristic: any = null;
  private cedaCharacteristic: any = null;

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async connect(): Promise<boolean> {
    if (!this.isSupported) {
      this.errorMessage.set('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.isConnecting.set(true);
    this.errorMessage.set(null);

    try {
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [this.SERVICE_UUID] }],
        optionalServices: [this.SERVICE_UUID],
      });

      this.bluetoothDevice = device;
      this.deviceName.set(device.name || 'Pixel Watch 2');

      device.addEventListener('gattserverdisconnected', () => {
        this.zone.run(() => {
          this.handleDisconnected();
        });
      });

      const server = await device.gatt.connect();
      this.gattServer = server;

      const service = await server.getPrimaryService(this.SERVICE_UUID);

      // Setup Biofeedback notifications
      this.cedaCharacteristic = await service.getCharacteristic(this.CEDA_CHAR_UUID);
      await this.cedaCharacteristic.startNotifications();
      this.cedaCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.zone.run(() => {
          this.parseTelemetry(event.target.value);
        });
      });

      // Setup Haptic Command sender
      this.hapticCharacteristic = await service.getCharacteristic(this.HAPTIC_CHAR_UUID);

      this.isConnected.set(true);
      this.isConnecting.set(false);
      return true;
    } catch (err: any) {
      this.zone.run(() => {
        this.isConnecting.set(false);
        this.isConnected.set(false);
        if (err.name !== 'NotFoundError') {
          this.errorMessage.set(err.message || 'Failed to connect to watch');
        }
      });
      return false;
    }
  }

  private parseTelemetry(dataView: DataView) {
    if (dataView.byteLength >= 12) {
      // 3 Little-Endian IEEE-754 Floats (HR, cEDA, Temp)
      const hr = dataView.getFloat32(0, true);
      const ceda = dataView.getFloat32(4, true);
      const temp = dataView.getFloat32(8, true);

      this.heartRate.set(Math.round(hr));
      this.cedaMicrosiemens.set(Number(ceda.toFixed(2)));
      this.skinTempCelsius.set(Number(temp.toFixed(1)));

      if (ceda > 2.5) {
        this.autonomicTone.set('SYMPATHETIC');
      } else if (ceda < 1.2) {
        this.autonomicTone.set('PARASYMPATHETIC');
      } else {
        this.autonomicTone.set('VAGAL_COHERENT');
      }
    }
  }

  async sendHapticCommand(bandCode: number): Promise<boolean> {
    if (!this.hapticCharacteristic || !this.isConnected()) {
      return false;
    }
    try {
      const buffer = new Uint8Array([bandCode]);
      await this.hapticCharacteristic.writeValue(buffer);
      return true;
    } catch (err) {
      return false;
    }
  }

  disconnect() {
    if (this.gattServer && this.gattServer.connected) {
      this.gattServer.disconnect();
    }
    this.handleDisconnected();
  }

  private handleDisconnected() {
    this.isConnected.set(false);
    this.isConnecting.set(false);
    this.bluetoothDevice = null;
    this.gattServer = null;
    this.hapticCharacteristic = null;
    this.cedaCharacteristic = null;
  }
}
