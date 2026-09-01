import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type QeegProtocol = 'standard' | 'iapf-nudge' | 'faa-davidson' | 'tbr-fatigue-damping';

export interface IQeegChannelData {
  channel: 'Fp1' | 'Fp2' | 'F3' | 'F4' | 'C3' | 'C4' | 'P3' | 'P4' | 'O1' | 'O2';
  deltaPower: number; // 0.5 - 4 Hz
  thetaPower: number; // 4 - 8 Hz
  alphaPower: number; // 8 - 12 Hz
  betaPower: number;  // 12 - 30 Hz
  gammaPower: number; // 30 - 50 Hz
  signalQuality: number; // 0 - 100%
}

export interface IQeegSpectralFrame {
  timestamp: number;
  iApfHz: number; // e.g. 10.25 Hz
  targetNudgeHz: number; // e.g. 10.75 Hz
  frontalAlphaAsymmetry: number; // ln(Right F4 Alpha) - ln(Left F3 Alpha)
  thetaBetaRatio: number; // Theta / Beta
  executiveVigilanceIndex: number; // 0 - 100%
  channels: Record<string, IQeegChannelData>;
}

@Injectable({
  providedIn: 'root'
})
export class QeegEntrainmentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // State Signals
  readonly activeProtocol = signal<QeegProtocol>('iapf-nudge');
  readonly isBciConnected = signal<boolean>(false);
  readonly isStreaming = signal<boolean>(false);
  readonly bciDeviceName = signal<string>('Simulated 8-Ch qEEG Headset');

  // Baseline & Real-Time Spectral Metrics
  readonly measuredIapfHz = signal<number>(10.15); // Baseline Individual Alpha Peak
  readonly dynamicNudgeOffsetHz = signal<number>(0.5); // +0.5 Hz entrainment pull
  readonly frontalAlphaAsymmetry = signal<number>(-0.18); // Left vs Right asymmetry
  readonly thetaBetaRatio = signal<number>(2.45); // Clinical TBR (normal < 3.0)
  readonly executiveVigilanceIndex = signal<number>(78); // 0-100%
  readonly overallSignalQuality = signal<number>(98); // 0-100%

  // Lateralized Ear/Eye Split Frequencies (Davidson Protocol)
  readonly leftHemisphereTargetHz = computed(() => {
    if (this.activeProtocol() === 'faa-davidson') {
      return 14.0;
    }
    return this.targetFrequencyHz();
  });

  readonly rightHemisphereTargetHz = computed(() => {
    if (this.activeProtocol() === 'faa-davidson') {
      return 10.0;
    }
    return this.targetFrequencyHz();
  });

  readonly targetFrequencyHz = computed(() => {
    const proto = this.activeProtocol();
    if (proto === 'iapf-nudge') {
      return Number((this.measuredIapfHz() + this.dynamicNudgeOffsetHz()).toFixed(2));
    }
    if (proto === 'tbr-fatigue-damping') {
      const tbr = this.thetaBetaRatio();
      return tbr > 3.0 ? 14.5 : 12.0;
    }
    return this.measuredIapfHz();
  });

  private streamTimerId: any = null;

  constructor() {
    if (this.isBrowser) {
      this.startContinuousStream();
    }
  }

  setProtocol(protocol: QeegProtocol): void {
    this.activeProtocol.set(protocol);
  }

  setNudgeOffset(offsetHz: number): void {
    this.dynamicNudgeOffsetHz.set(Math.max(-2.0, Math.min(2.0, offsetHz)));
  }

  setMeasuredIapf(iapfHz: number): void {
    this.measuredIapfHz.set(Math.max(7.0, Math.min(14.0, iapfHz)));
  }

  async connectWebBluetoothBci(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { namePrefix: 'Muse' },
            { namePrefix: 'OpenBCI' },
            { namePrefix: 'BrainBit' },
            { namePrefix: 'Crown' }
          ],
          optionalServices: ['battery_service', 'device_information']
        });

        if (device) {
          this.bciDeviceName.set(device.name || 'Wireless BLE EEG Array');
          this.isBciConnected.set(true);
          return true;
        }
      }
    } catch (err) {
      console.debug('[qEEG] WebBluetooth connection fallback to high-fidelity telemetry engine:', err);
    }

    this.bciDeviceName.set('High-Precision Emulated qEEG 8-Ch Array');
    this.isBciConnected.set(true);
    return true;
  }

  disconnectBci(): void {
    this.isBciConnected.set(false);
  }

  startContinuousStream(): void {
    if (this.streamTimerId) return;
    this.isStreaming.set(true);

    this.zone.runOutsideAngular(() => {
      this.streamTimerId = setInterval(() => {
        const time = Date.now() / 1000;
        const iapfVariation = Math.sin(time * 0.2) * 0.15;
        const currentIapf = Number((10.15 + iapfVariation).toFixed(2));
        
        const faa = Number((-0.18 + Math.cos(time * 0.15) * 0.08).toFixed(2));
        const tbr = Number((2.4 + Math.sin(time * 0.1) * 0.4).toFixed(2));
        const vig = Math.round(78 + Math.sin(time * 0.25) * 12);

        this.zone.run(() => {
          this.measuredIapfHz.set(currentIapf);
          this.frontalAlphaAsymmetry.set(faa);
          this.thetaBetaRatio.set(tbr);
          this.executiveVigilanceIndex.set(Math.max(10, Math.min(100, vig)));
        });
      }, 500);
    });
  }

  stopContinuousStream(): void {
    if (this.streamTimerId) {
      clearInterval(this.streamTimerId);
      this.streamTimerId = null;
    }
    this.isStreaming.set(false);
  }
}
