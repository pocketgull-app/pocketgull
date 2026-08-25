import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export interface IBiometricStreamFrame {
  timestamp: string;
  ppgHrvMs: number;         // RMSSD in milliseconds (e.g. 45 - 90ms)
  cgmGlucoseMgDl: number;   // Blood glucose in mg/dL (e.g. 70 - 180 mg/dL)
  respiratoryRateBpm: number; // Respiration rate (e.g. 12 - 20 bpm)
  spo2Pct: number;          // Pulse oximetry percentage (e.g. 95 - 100%)
  fusionQualityIndex: number; // 0 - 100% signal strength
  fusionStatus: 'optimal' | 'mild_anomaly' | 'critical_triage';
}

export interface IBiometricFusionAlert {
  id: string;
  parameter: 'HRV' | 'Glucose' | 'SpO2' | 'Respiration';
  value: number;
  threshold: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricSensorFusionService {
  private state = (() => { try { return inject(PatientStateService); } catch (e) { return null; } })();
  private storage = (() => { try { return inject(SecureStorageService); } catch (e) { return null; } })();

  readonly isStreaming = signal<boolean>(false);
  readonly currentFrame = signal<IBiometricStreamFrame | null>(null);
  readonly recentHistory = signal<IBiometricStreamFrame[]>([]);
  readonly activeAlerts = signal<IBiometricFusionAlert[]>([]);

  readonly currentHrvRmssd = computed(() => this.currentFrame()?.ppgHrvMs ?? 62);
  readonly currentGlucose = computed(() => this.currentFrame()?.cgmGlucoseMgDl ?? 108);

  private streamTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initDefaultFrame();
  }

  public initDefaultFrame(): IBiometricStreamFrame {
    const frame: IBiometricStreamFrame = {
      timestamp: new Date().toISOString(),
      ppgHrvMs: 65,
      cgmGlucoseMgDl: 104,
      respiratoryRateBpm: 16,
      spo2Pct: 98,
      fusionQualityIndex: 94,
      fusionStatus: 'optimal'
    };
    this.currentFrame.set(frame);
    return frame;
  }

  public startSensorStream(): void {
    if (this.isStreaming()) return;
    this.isStreaming.set(true);

    this.streamTimer = setInterval(() => {
      this.tickSensorFrame();
    }, 2000);
  }

  public stopSensorStream(): void {
    if (this.streamTimer) {
      clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
    this.isStreaming.set(false);
  }

  private getRandomFloat(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      const high = arr[0] & 0x1fffff;
      const low = arr[1];
      return (high * 4294967296.0 + low) / 9007199254740992.0;
    }
    return 0.5;
  }

  public tickSensorFrame(): IBiometricStreamFrame {
    // Generate realistic biophysical fluctuations
    const prev = this.currentFrame() || this.initDefaultFrame();
    const hrvDelta = (this.getRandomFloat() - 0.48) * 4;
    const glucoseDelta = (this.getRandomFloat() - 0.49) * 3;
    const respDelta = (this.getRandomFloat() - 0.5) * 1;

    const ppgHrvMs = Math.max(25, Math.min(110, Math.round((prev.ppgHrvMs + hrvDelta) * 10) / 10));
    const cgmGlucoseMgDl = Math.max(65, Math.min(220, Math.round((prev.cgmGlucoseMgDl + glucoseDelta) * 10) / 10));
    const respiratoryRateBpm = Math.max(10, Math.min(28, Math.round(prev.respiratoryRateBpm + respDelta)));
    const spo2Pct = 97 + Math.floor(this.getRandomFloat() * 3); // 97-99%

    let fusionStatus: 'optimal' | 'mild_anomaly' | 'critical_triage' = 'optimal';
    const alerts: IBiometricFusionAlert[] = [];

    if (ppgHrvMs < 35) {
      fusionStatus = 'mild_anomaly';
      alerts.push({
        id: `ALT-HRV-${Date.now()}`,
        parameter: 'HRV',
        value: ppgHrvMs,
        threshold: '< 35ms RMSSD',
        severity: 'medium',
        recommendation: 'Low vagal tone detected. Initiate 4-7-8 parasympathetic diaphragmatic breathing.'
      });
    }

    if (cgmGlucoseMgDl > 160) {
      fusionStatus = 'mild_anomaly';
      alerts.push({
        id: `ALT-GLU-${Date.now()}`,
        parameter: 'Glucose',
        value: cgmGlucoseMgDl,
        threshold: '> 160 mg/dL',
        severity: 'medium',
        recommendation: 'Postprandial glucose spike. Recommend 10-minute zone-1 brisk walking.'
      });
    }

    if (spo2Pct < 94) {
      fusionStatus = 'critical_triage';
      alerts.push({
        id: `ALT-SPO2-${Date.now()}`,
        parameter: 'SpO2',
        value: spo2Pct,
        threshold: '< 94%',
        severity: 'critical',
        recommendation: 'Hypoxia warning. Supplemental O2 and airway assessment indicated.'
      });
    }

    const frame: IBiometricStreamFrame = {
      timestamp: new Date().toISOString(),
      ppgHrvMs,
      cgmGlucoseMgDl,
      respiratoryRateBpm,
      spo2Pct,
      fusionQualityIndex: 92 + Math.floor(Math.random() * 8),
      fusionStatus
    };

    this.currentFrame.set(frame);
    this.activeAlerts.set(alerts);

    // Keep rolling 20 frames
    const history = [frame, ...this.recentHistory().slice(0, 19)];
    this.recentHistory.set(history);

    // Sync to central PatientStateService
    if (this.state) {
      this.state.vitals.update(v => ({
        ...v,
        heartRate: Math.round(72 + (60 - ppgHrvMs) * 0.3),
        oxygenSaturation: spo2Pct
      }));
    }

    return frame;
  }
}
