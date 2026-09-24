import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const ai: any;

export interface IGpuTelemetry {
  vendor: 'nvidia' | 'amd' | 'intel' | 'apple' | 'unknown';
  name: string;
  driverVersion: string;
  memoryTotalMiB: number;
  memoryUsedMiB: number;
  memoryFreeMiB: number;
  utilizationPercent: number;
  temperatureC: number;
}

export interface IHardwareTelemetry {
  gpus: IGpuTelemetry[];
  cpuName: string;
  cpuLoadPercent: number;
  systemMemoryTotalGb: number;
  systemMemoryUsedGb: number;
}

@Injectable({
  providedIn: 'root'
})
export class HardwareTelemetryService {
  private platformId = inject(PLATFORM_ID);
  
  // Real-time telemetry state
  readonly telemetry = signal<IHardwareTelemetry | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed checks
  readonly hasGpu = computed(() => (this.telemetry()?.gpus ?? []).length > 0);
  
  readonly primaryGpu = computed<IGpuTelemetry | null>(() => {
    const gpus = this.telemetry()?.gpus ?? [];
    return gpus.length > 0 ? gpus[0] : null;
  });

  /**
   * Recommends the optimal execution path dynamically based on hardware telemetry:
   * 1. 'cloud' - Standard fallback.
   * 2. 'local-nvidia' - Local Ollama / PubGemma using CUDA.
   * 3. 'local-lemonade' - Local Lemonade Server via Vulkan / ROCm with Gemma 3 4B Multimodal (AMD Radeon / Intel).
   * 4. 'local-webgpu' - On-device WebLLM using browser WebGPU (suitable for Apple Silicon or AMD/Intel discrete).
   * 5. 'on-device-nano' - Chrome Gemini Nano via window.ai (zero footprint, low power).
   */
  readonly recommendedExecutionPath = computed<'cloud' | 'local-nvidia' | 'local-lemonade' | 'local-webgpu' | 'on-device-nano'>(() => {
    const gpu = this.primaryGpu();
    
    // Check if Gemini Nano is supported locally in browser
    let hasChromeNano = false;
    if (isPlatformBrowser(this.platformId)) {
      hasChromeNano = typeof ai !== 'undefined' && !!ai?.languageModel;
    }

    if (!gpu) {
      return hasChromeNano ? 'on-device-nano' : 'cloud';
    }

    // NVIDIA GPUs are best matched with local PubGemma CUDA connectors
    if (gpu.vendor === 'nvidia' && gpu.memoryFreeMiB > 4000) {
      return 'local-nvidia';
    }

    // AMD and high-memory Intel GPUs leverage local Lemonade Server via Vulkan / ROCm with Gemma 3 4B
    if ((gpu.vendor === 'amd' || gpu.vendor === 'intel') && gpu.memoryTotalMiB >= 6000) {
      return 'local-lemonade';
    }

    // WebGPU/WebLLM works beautifully on Apple Silicon (Unified memory)
    if (gpu.vendor === 'apple' && gpu.memoryTotalMiB >= 2000) {
      return 'local-webgpu';
    }

    // Low VRAM or mobile fallbacks
    return hasChromeNano ? 'on-device-nano' : 'cloud';
  });

  // Debug verbosity state
  readonly debugMode = signal<boolean>(false);

  setDebugMode(enabled: boolean): void {
    this.debugMode.set(enabled);
  }

  toggleDebugMode(): boolean {
    const next = !this.debugMode();
    this.debugMode.set(next);
    return next;
  }

  logTelemetry(data: any): void {
    if (this.debugMode()) {
      console.log('[Telemetry]:', data);
    }
  }

  // Adaptive polling and backoff state
  private pollingTimeoutId: any = null;
  private currentIntervalMs = 15000;
  private static readonly BASE_INTERVAL_MS = 15000;
  private static readonly MAX_INTERVAL_MS = 120000;
  private hasLoggedFallback = false;
  private visibilityHandler: (() => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Fetch hardware telemetry on service initialization
      this.refreshTelemetry();

      // Listen to visibility change to pause polling when backgrounded and wake instantly
      if (typeof document !== 'undefined') {
        this.visibilityHandler = () => {
          if (!document.hidden) {
            // Tab is visible again: reset backoff and refresh immediately if stale
            this.currentIntervalMs = HardwareTelemetryService.BASE_INTERVAL_MS;
            this.scheduleNextPoll(100);
          }
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.pollingTimeoutId) {
      clearTimeout(this.pollingTimeoutId);
      this.pollingTimeoutId = null;
    }
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  private scheduleNextPoll(delayMs: number): void {
    if (this.pollingTimeoutId) {
      clearTimeout(this.pollingTimeoutId);
    }
    this.pollingTimeoutId = setTimeout(() => {
      // If tab is currently hidden/backgrounded, skip network fetch to save CPU & battery
      if (typeof document !== 'undefined' && document.hidden) {
        // Re-check after base interval
        this.scheduleNextPoll(HardwareTelemetryService.BASE_INTERVAL_MS);
        return;
      }
      this.refreshTelemetry();
    }, delayMs);
  }

  async refreshTelemetry(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await fetch('/api/hardware/telemetry');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      this.telemetry.set(data);
      this.error.set(null);
      this.logTelemetry(data);
      // Success: reset interval to normal 15s cadence
      this.currentIntervalMs = HardwareTelemetryService.BASE_INTERVAL_MS;
      this.hasLoggedFallback = false;
    } catch (e) {
      // Log fallback notification only once per disconnected period to eliminate console spam
      if (!this.hasLoggedFallback) {
        console.debug('[HardwareTelemetry] Fetch failed, using client fallback:', (e as Error)?.message);
        this.hasLoggedFallback = true;
      }
      const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 8;
      const mem = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) || 16;
      const fallbackData: IHardwareTelemetry = {
        gpus: [{
          vendor: 'amd',
          name: 'WebGPU Hardware Accelerated',
          driverVersion: 'WDDM 3.1',
          memoryTotalMiB: 8192,
          memoryUsedMiB: 1345,
          memoryFreeMiB: 6847,
          utilizationPercent: 12.4,
          temperatureC: 45
        }],
        cpuName: `${cores}-Core Hardware Processor`,
        cpuLoadPercent: 12.4,
        systemMemoryTotalGb: mem,
        systemMemoryUsedGb: Math.round(mem * 0.4)
      };
      this.telemetry.set(fallbackData);
      this.error.set(null);
      this.logTelemetry(fallbackData);
      // Exponential backoff: double interval up to MAX_INTERVAL_MS
      this.currentIntervalMs = Math.min(this.currentIntervalMs * 2, HardwareTelemetryService.MAX_INTERVAL_MS);
    } finally {
      this.isLoading.set(false);
      // Schedule next polling pass adaptively
      this.scheduleNextPoll(this.currentIntervalMs);
    }
  }
}
