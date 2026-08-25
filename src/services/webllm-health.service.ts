import { Injectable, signal } from '@angular/core';

export interface IWebGpuHardwareProfile {
  supported: boolean;
  adapterVendor?: string;
  adapterArchitecture?: string;
  adapterDescription?: string;
  maxBufferSizeMb: number;
  maxStorageBufferMb: number;
  estimatedVramTier: 'Tier 1 (<4GB)' | 'Tier 2 (4-8GB)' | 'Tier 3 (>8GB)' | 'None (CPU)';
  recommendedModel: string;
  storageQuotaMb: number;
  storageUsedMb: number;
  webWorkerSupported: boolean;
  status: 'ready' | 'cpu_fallback' | 'unsupported';
  lastCheckedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebLlmHealthService {
  profile = signal<IWebGpuHardwareProfile>({
    supported: false,
    maxBufferSizeMb: 0,
    maxStorageBufferMb: 0,
    estimatedVramTier: 'None (CPU)',
    recommendedModel: 'CPU Cloud/Fallback',
    storageQuotaMb: 0,
    storageUsedMb: 0,
    webWorkerSupported: typeof Worker !== 'undefined',
    status: 'unsupported',
    lastCheckedAt: new Date().toISOString()
  });

  isChecking = signal<boolean>(false);

  /**
   * Probes client hardware for WebGPU capabilities, VRAM tiers, and local storage headroom.
   */
  async probeHardware(): Promise<IWebGpuHardwareProfile> {
    this.isChecking.set(true);

    let supported = false;
    let vendor = 'Unknown';
    let architecture = 'Unknown';
    let description = 'Generic Adapter';
    let maxBufferSizeMb = 0;
    let maxStorageBufferMb = 0;
    let vramTier: IWebGpuHardwareProfile['estimatedVramTier'] = 'None (CPU)';
    let recommendedModel = 'Gemma-2B-Q4F16 (CPU Fallback)';
    let status: IWebGpuHardwareProfile['status'] = 'cpu_fallback';

    if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          supported = true;
          status = 'ready';

          if (adapter.info) {
            vendor = adapter.info.vendor || 'Standard GPU Vendor';
            architecture = adapter.info.architecture || 'DirectX/Vulkan/Metal';
            description = adapter.info.description || 'Hardware Accelerated Display';
          }

          if (adapter.limits) {
            maxBufferSizeMb = Math.round((adapter.limits.maxBufferSize || 0) / (1024 * 1024));
            maxStorageBufferMb = Math.round((adapter.limits.maxStorageBufferBindingSize || 0) / (1024 * 1024));

            if (maxBufferSizeMb >= 2048) {
              vramTier = 'Tier 3 (>8GB)';
              recommendedModel = 'Llama-3.1-8B-Instruct-Q4F16 / Gemma-7B';
            } else if (maxBufferSizeMb >= 1024) {
              vramTier = 'Tier 2 (4-8GB)';
              recommendedModel = 'Llama-3.2-3B-Instruct / Phi-3.5-mini';
            } else {
              vramTier = 'Tier 1 (<4GB)';
              recommendedModel = 'Gemma-2B-Q4F16 / SmolLM2-1.7B';
            }
          }
        }
      } catch {
        status = 'cpu_fallback';
      }
    }

    let storageQuotaMb = 0;
    let storageUsedMb = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        storageQuotaMb = Math.round((estimate.quota || 0) / (1024 * 1024));
        storageUsedMb = Math.round((estimate.usage || 0) / (1024 * 1024));
      } catch {
        // Storage estimation fallback
      }
    }

    const newProfile: IWebGpuHardwareProfile = {
      supported,
      adapterVendor: vendor,
      adapterArchitecture: architecture,
      adapterDescription: description,
      maxBufferSizeMb,
      maxStorageBufferMb,
      estimatedVramTier: vramTier,
      recommendedModel,
      storageQuotaMb,
      storageUsedMb,
      webWorkerSupported: typeof Worker !== 'undefined',
      status,
      lastCheckedAt: new Date().toISOString()
    };

    this.profile.set(newProfile);
    this.isChecking.set(false);
    return newProfile;
  }
}
