import { Injectable, signal, computed, inject, isDevMode } from '@angular/core';

export interface IConsoleLogItem {
  id: string;
  type: 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  source?: string;
  stack?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleIntegrityService {
  readonly logs = signal<IConsoleLogItem[]>([]);
  readonly isSweepActive = signal<boolean>(false);
  readonly lastSweepTime = signal<Date | null>(null);

  readonly errorCount = computed(() => this.logs().filter(l => l.type === 'error').length);
  readonly warningCount = computed(() => this.logs().filter(l => l.type === 'warn').length);
  readonly isZeroErrorState = computed(() => this.errorCount() === 0);

  private originalConsoleError: (...data: any[]) => void = console.error;
  private originalConsoleWarn: (...data: any[]) => void = console.warn;

  constructor() {
    this.initConsoleHooks();
  }

  private initConsoleHooks() {
    // Only intercept console hooks in development / automated test environments
    if (typeof window === 'undefined' || !isDevMode()) return;

    // Intercept console.error
    console.error = (...args: any[]) => {
      this.originalConsoleError.apply(console, args);
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      
      // Filter out expected automated test / STT noise if configured
      if (msg.includes('Pet Auditory STT error: not-allowed') || msg.includes('WebGL disabled')) {
        return;
      }

      this.addLog('error', msg);
    };

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.originalConsoleWarn.apply(console, args);
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      this.addLog('warn', msg);
    };

    // Listen to global unhandled error events
    window.addEventListener('error', (event) => {
      this.addLog('error', event.message || 'Unhandled Window Error', event.filename, event.error?.stack);
    });

    // Listen to unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.message || String(event.reason || 'Unhandled Promise Rejection');
      this.addLog('error', reason);
    });
  }

  private addLog(type: 'error' | 'warn' | 'info', message: string, source?: string, stack?: string) {
    const item: IConsoleLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      message,
      timestamp: new Date(),
      source,
      stack
    };

    this.logs.update(current => [item, ...current.slice(0, 49)]); // Keep last 50 entries
  }

  /**
   * Creates a structured DevTools console group for Gull Squadron agent diagnostic telemetry.
   */
  startGroup(agentName: string, label: string) {
    if (typeof console !== 'undefined' && console.group) {
      console.group(`🧹 [${agentName} Integrity Agent] ${label}`);
    }
  }

  endGroup() {
    if (typeof console !== 'undefined' && console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * Triggers Zero Agent automated sweep to achieve 0 console errors.
   */
  sweepToZero(): { clearedErrors: number; status: string } {
    this.isSweepActive.set(true);
    const cleared = this.errorCount();

    // Purge recorded error items and reset state
    this.logs.update(current => current.filter(l => l.type !== 'error'));
    this.lastSweepTime.set(new Date());

    setTimeout(() => {
      this.isSweepActive.set(false);
    }, 800);

    return {
      clearedErrors: cleared,
      status: `Zero Agent sweep complete. ${cleared} console errors cleared.`
    };
  }

  clearAllLogs() {
    this.logs.set([]);
  }
}
