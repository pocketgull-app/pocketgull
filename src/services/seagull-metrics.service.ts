import { Injectable, signal, computed } from '@angular/core';

export interface ILatencyRecord {
  operationName: string;
  durationMs: number;
  timestamp: string;
}

export interface IFallbackRecord {
  failedModel: string;
  fallbackModel: string;
  reason: string;
  timestamp: string;
}

/**
 * SeagullMetricsService
 * 
 * A client-side, edge-computed telemetry tracker focused on Customer Obsessed input metrics:
 * 1. Voice consultation latency (TTFB) and API roundtrip durations.
 * 2. Model/Prompt fallback events.
 * 3. Session completion & disconnect rates.
 * 
 * Conforms strictly to HIPAA Safe Harbor de-identification rules and operates
 * purely in-memory with Signal streams to prevent unsolicited third-party harvesting.
 */
@Injectable({
  providedIn: 'root'
})
export class SeagullMetricsService {
  // Latency metrics
  readonly latencies = signal<ILatencyRecord[]>([]);
  
  // Model Fallbacks
  readonly fallbacks = signal<IFallbackRecord[]>([]);

  // Triage stats
  readonly startedSessions = signal<number>(0);
  readonly completedSessions = signal<number>(0);

  // Computeds
  readonly averageLatency = computed(() => {
    const list = this.latencies();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.durationMs, 0);
    return Math.round(sum / list.length);
  });

  readonly sessionCompletionRate = computed(() => {
    const started = this.startedSessions();
    if (started === 0) return 0;
    return Math.round((this.completedSessions() / started) * 100);
  });

  /**
   * Log a latency metric.
   */
  recordLatency(operationName: string, durationMs: number): void {
    const record: ILatencyRecord = {
      operationName,
      durationMs,
      timestamp: new Date().toISOString()
    };
    this.latencies.update(list => [...list, record]);

    // Seagull Warning: Alert if latency exceeds 2 seconds (Friction threshold)
    if (durationMs > 2000) {
      console.warn(`[Seagull Telemetry] Friction Alert! Operation "${operationName}" took ${durationMs}ms (exceeds 2s target).`);
    }
  }

  /**
   * Log a fallback event.
   */
  recordFallback(failedModel: string, fallbackModel: string, reason: string): void {
    const record: IFallbackRecord = {
      failedModel,
      fallbackModel,
      reason,
      timestamp: new Date().toISOString()
    };
    this.fallbacks.update(list => [...list, record]);
    console.warn(`[Seagull Telemetry] Model Fallback occurred: ${failedModel} -> ${fallbackModel}. Reason: ${reason}`);
  }

  /**
   * Session state tracking
   */
  incrementStartedSessions(): void {
    this.startedSessions.update(n => n + 1);
  }

  incrementCompletedSessions(): void {
    this.completedSessions.update(n => n + 1);
  }

  /**
   * Reset tracking (1-Click Ephemeral State Purge alignment)
   */
  clearMetrics(): void {
    this.latencies.set([]);
    this.fallbacks.set([]);
    this.startedSessions.set(0);
    this.completedSessions.set(0);
  }
}
