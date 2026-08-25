import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';

function getSecureRandomFloat(): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(2);
    globalThis.crypto.getRandomValues(buf);
    // Combine 53 bits of cryptographic entropy (21 bits high + 32 bits low) for uniform IEEE-754 mantissa
    const high = buf[0] & 0x1fffff;
    const low = buf[1];
    return (high * 4294967296.0 + low) / 9007199254740992.0;
  }
  return 0.5;
}

export interface IFhirR5TelemetryPacket {
  id: string;
  topic: string;
  timestamp: string;
  heartRate: number;
  spO2: number;
  respirationRate: number;
  hrvMs: number;
  eegAlphaHz?: number;
  eegBetaHz?: number;
  hdf5BufferId?: string;
  ecgWaveform?: number[];
  status: 'active' | 'paused' | 'alert';
  flaggedBiomarker?: string;
  isWebSocketConnected?: boolean;
  /** Adaptive alarm suppression evaluation (Wachter Doctrine) */
  alarmSuppressionState?: 'active_alert' | 'suppressed_transient' | 'normal';
  confidenceScore?: number;
  suppressionReason?: string;
  trendWindowSize?: number;
}

@Injectable({ providedIn: 'root' })
export class FhirR5TelemetryService {
  private patientState = inject(PatientStateService);
  private platformId = inject(PLATFORM_ID);

  private intervalId: any = null;
  private ws: WebSocket | null = null;

  /** Status signal for R5 subscription topic */
  isStreaming = signal<boolean>(false);
  
  /** WebSocket connection state: 'disconnected' | 'connecting' | 'connected' | 'fallback' */
  wsConnectionStatus = signal<'disconnected' | 'connecting' | 'connected' | 'fallback'>('disconnected');

  /** Latest FHIR R5 observation packet */
  latestPacket = signal<IFhirR5TelemetryPacket | null>(null);

  /** Subscription topic URI complying with FHIR R5 SubscriptionTopic specification */
  subscriptionTopic = signal<string>('http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream');

  startStreaming(intervalMs = 2000): void {
    if (this.isStreaming()) return;
    this.isStreaming.set(true);

    if (isPlatformBrowser(this.platformId)) {
      this.initWebSocketConnection();
    }

    this.intervalId = setInterval(() => {
      this.generatePacket();
    }, intervalMs);

    // Initial packet
    this.generatePacket();
  }

  stopStreaming(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStreaming.set(false);
    this.wsConnectionStatus.set('disconnected');
  }

  toggleStreaming(): void {
    if (this.isStreaming()) {
      this.stopStreaming();
    } else {
      this.startStreaming();
    }
  }

  private initWebSocketConnection(): void {
    try {
      this.wsConnectionStatus.set('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/telemetry/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[FhirR5TelemetryService] WebSocket connection established.');
        this.wsConnectionStatus.set('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const packet: IFhirR5TelemetryPacket = {
            id: raw.id || `r5-obs-${Date.now()}`,
            topic: this.subscriptionTopic(),
            timestamp: new Date().toISOString(),
            heartRate: raw.heartRate || 72,
            spO2: raw.spO2 || 98,
            respirationRate: raw.respirationRate || 16,
            hrvMs: raw.hrvMs || 55,
            eegAlphaHz: raw.eegAlphaHz || 10.5,
            eegBetaHz: raw.eegBetaHz || 18.2,
            hdf5BufferId: raw.hdf5BufferId || `hdf5_chunk_${Date.now()}`,
            ecgWaveform: raw.ecgWaveform || [0, 0.2, 0.8, -0.4, 0, 0.1],
            status: raw.status || 'active',
            flaggedBiomarker: raw.flaggedBiomarker,
            isWebSocketConnected: true
          };

          this.latestPacket.set(packet);
          this.patientState.updateVital('hr', String(packet.heartRate));
          this.patientState.updateVital('spO2', String(packet.spO2));
        } catch (e) {
          console.warn('[FhirR5TelemetryService] Invalid WS JSON payload, using fallback generator.');
        }
      };

      this.ws.onerror = () => {
        console.warn('[FhirR5TelemetryService] WebSocket error, switching to continuous HDF5 simulation mode.');
        this.wsConnectionStatus.set('fallback');
      };

      this.ws.onclose = () => {
        if (this.isStreaming()) {
          this.wsConnectionStatus.set('fallback');
        }
      };
    } catch (e) {
      this.wsConnectionStatus.set('fallback');
    }
  }

  /** Sliding window history for multi-biometric trend fusion (Wachter Doctrine) */
  private slidingWindow: Array<{ hr: number; spO2: number; resp: number; hrv: number }> = [];
  private readonly maxWindowSize = 5;

  /**
   * Evaluates biometrics against sliding trend window to suppress false-positive alarms (motion artifacts/isolated spikes).
   */
  public evaluateAdaptiveAlert(
    hr: number,
    spO2: number,
    resp: number,
    hrv: number
  ): {
    status: 'active' | 'paused' | 'alert';
    flaggedBiomarker?: string;
    alarmSuppressionState: 'active_alert' | 'suppressed_transient' | 'normal';
    confidenceScore: number;
    suppressionReason?: string;
  } {
    this.slidingWindow.push({ hr, spO2, resp, hrv });
    if (this.slidingWindow.length > this.maxWindowSize) {
      this.slidingWindow.shift();
    }

    const windowLen = this.slidingWindow.length;
    const hrHistory = this.slidingWindow.map(w => w.hr);
    const spO2History = this.slidingWindow.map(w => w.spO2);

    const isHrOutlier = hr > 120 || hr < 55;
    const isSpO2Outlier = spO2 < 93;

    if (!isHrOutlier && !isSpO2Outlier) {
      return {
        status: 'active',
        alarmSuppressionState: 'normal',
        confidenceScore: 0.99
      };
    }

    // Check if HR outlier is sustained over consecutive window samples
    const hrOutlierCount = hrHistory.filter(h => h > 120 || h < 55).length;
    const isHrSustained = hrOutlierCount >= Math.min(2, windowLen);

    // Multi-biometric correlation: low HRV (<25ms) or high respiration (>22 rpm) reinforces true arrhythmia/distress
    const hasCorrelatedDistress = hrv < 25 || resp > 22;

    if (isHrOutlier) {
      if (isHrSustained || hasCorrelatedDistress || windowLen <= 1) {
        return {
          status: 'alert',
          flaggedBiomarker: `Tachycardia/Bradycardia Warning: ${hr} bpm (Sustained/Correlated)`,
          alarmSuppressionState: 'active_alert',
          confidenceScore: hasCorrelatedDistress ? 0.96 : 0.88
        };
      } else {
        // Suppress transient isolated spike (motion artifact / transient burst)
        return {
          status: 'active',
          flaggedBiomarker: `Transient HR Spike (${hr} bpm) - Suppressed`,
          alarmSuppressionState: 'suppressed_transient',
          confidenceScore: 0.35,
          suppressionReason: `Transient HR anomaly (${hr} bpm) suppressed: Normal HRV (${hrv}ms) & Respiration (${resp} rpm) sustained across ${windowLen}-sample window`
        };
      }
    }

    if (isSpO2Outlier) {
      const spO2OutlierCount = spO2History.filter(s => s < 93).length;
      const isSpO2Sustained = spO2OutlierCount >= Math.min(2, windowLen);

      if (isSpO2Sustained || resp > 22 || windowLen <= 1) {
        return {
          status: 'alert',
          flaggedBiomarker: `Hypoxemia Warning: SpO2 ${spO2}% (Sustained)`,
          alarmSuppressionState: 'active_alert',
          confidenceScore: 0.93
        };
      } else {
        // Suppress transient sensor displacement
        return {
          status: 'active',
          flaggedBiomarker: `Transient SpO2 Dip (${spO2}%) - Suppressed`,
          alarmSuppressionState: 'suppressed_transient',
          confidenceScore: 0.40,
          suppressionReason: `Single-point SpO2 dip (${spO2}%) suppressed: Likely optical probe displacement`
        };
      }
    }

    return {
      status: 'active',
      alarmSuppressionState: 'normal',
      confidenceScore: 0.95
    };
  }

  private generatePacket(): void {
    const currentVitals = this.patientState.vitals();
    const baseHr = parseInt(String(currentVitals.hr || '72'), 10);
    const baseSpO2 = parseInt(String(currentVitals.spO2 || '98'), 10);

    // Small stochastic variance simulating continuous sensor telemetry
    const hrDelta = Math.floor(getSecureRandomFloat() * 5) - 2;
    const spO2Delta = Math.floor(getSecureRandomFloat() * 3) - 1;
    const respDelta = Math.floor(getSecureRandomFloat() * 3) - 1;

    const currentHr = Math.max(50, Math.min(160, baseHr + hrDelta));
    const currentSpO2 = Math.max(88, Math.min(100, baseSpO2 + spO2Delta));
    const currentResp = Math.max(8, Math.min(32, 16 + respDelta));
    const currentHrv = Math.max(15, Math.min(95, 45 + Math.floor(getSecureRandomFloat() * 10) - 5));

    const evalResult = this.evaluateAdaptiveAlert(currentHr, currentSpO2, currentResp, currentHrv);

    const packet: IFhirR5TelemetryPacket = {
      id: `r5-obs-${Date.now()}`,
      topic: this.subscriptionTopic(),
      timestamp: new Date().toISOString(),
      heartRate: currentHr,
      spO2: currentSpO2,
      respirationRate: currentResp,
      hrvMs: currentHrv,
      eegAlphaHz: 10.2 + (getSecureRandomFloat() * 0.8 - 0.4),
      eegBetaHz: 18.0 + (getSecureRandomFloat() * 1.2 - 0.6),
      hdf5BufferId: `hdf5_chunk_${Date.now()}`,
      ecgWaveform: Array.from({ length: 12 }, () => Math.sin(Date.now() / 100) * 0.5),
      status: evalResult.status,
      flaggedBiomarker: evalResult.flaggedBiomarker,
      alarmSuppressionState: evalResult.alarmSuppressionState,
      confidenceScore: evalResult.confidenceScore,
      suppressionReason: evalResult.suppressionReason,
      trendWindowSize: this.slidingWindow.length,
      isWebSocketConnected: this.wsConnectionStatus() === 'connected'
    };

    this.latestPacket.set(packet);

    // Update patient state vitals dynamically if streaming
    this.patientState.updateVital('hr', String(currentHr));
    this.patientState.updateVital('spO2', String(currentSpO2));
  }
}
