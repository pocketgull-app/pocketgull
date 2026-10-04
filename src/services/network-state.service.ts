import { Injectable, signal, computed, inject } from '@angular/core';
import { HardwareTelemetryService } from './hardware/hardware-telemetry.service';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

const LOCAL_INFERENCE_KEY = 'pg_preferLocalInference';
const OFFLINE_QUEUE_KEY = 'pg_offline_sync_queue';

export type NetworkQualityTier = 'OPTIMAL' | 'CONSTRAINED' | 'LIE_FI_SUSPECTED' | 'OFFLINE';

export type EffectiveConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

export interface IQueuedSyncItem {
    id: string;
    type: string;
    payload: unknown;
    queuedAt: string;
    retryCount: number;
}

@Injectable({ providedIn: 'root' })
export class NetworkStateService {
    private telemetry = inject(HardwareTelemetryService);
    private patientState = inject(PatientStateService);
    private storage = inject(SecureStorageService);

    private browserOnline = signal(typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true);
    readonly forceOffline = signal(false);

    /** Internal setter for browser online state (also exposed for testing & synthetic event handling) */
    setBrowserOnline(online: boolean): void {
        this.browserOnline.set(online);
    }

    /** Real-time latency measurement in milliseconds from probe */
    readonly latencyMs = signal<number>(45);

    /** Number of consecutive failed network reachability probes */
    readonly consecutiveProbeFailures = signal<number>(0);

    /** Effective network connection type from NetworkInformation API */
    readonly connectionSpeed = signal<EffectiveConnectionType>('4g');

    /**
     * Lie-Fi flag: browser reports online, but real network packets fail repeatedly
     * (e.g. captive portal, dropped cellular route, hospital firewall).
     */
    readonly isLieFiSuspected = computed(() => this.consecutiveProbeFailures() >= 2);

    /** When true, routes all AI calls to local inference even when online. Persisted via SecureStorageService. */
    readonly preferLocalInference = signal(
        this.storage.getItem(LOCAL_INFERENCE_KEY) === 'true'
    );

    readonly isOnline = computed(() => this.browserOnline() && !this.forceOffline() && !this.isLieFiSuspected());

    /**
     * Evaluates composite network quality tier for adaptive UI and data throttling.
     */
    readonly networkQuality = computed<NetworkQualityTier>(() => {
        if (!this.browserOnline() || this.forceOffline()) {
            return 'OFFLINE';
        }
        if (this.isLieFiSuspected()) {
            return 'LIE_FI_SUSPECTED';
        }
        if (this.connectionSpeed() === 'slow-2g' || this.connectionSpeed() === '2g' || this.latencyMs() > 600) {
            return 'CONSTRAINED';
        }
        return 'OPTIMAL';
    });

    /** Whether bandwidth is currently constrained (triggers asset/audio downsampling) */
    readonly isConstrainedBandwidth = computed(() => {
        return this.networkQuality() !== 'OPTIMAL';
    });

    /** Whether local inference should currently be used (offline OR lie-fi OR user prefers it). */
    readonly useLocalInference = computed(() => {
        const path = this.telemetry.recommendedExecutionPath();
        if (path === 'cloud') {
            return false;
        }
        return !this.isOnline() || this.preferLocalInference() || this.isLieFiSuspected();
    });

    /** Offline Store-and-Forward Sync Queue */
    readonly offlineQueue = signal<IQueuedSyncItem[]>(this.loadPersistedQueue());

    readonly pendingQueueCount = computed(() => this.offlineQueue().length);

    /**
     * Reactive label for the active AI provider shown in UI status tooltips.
     * Dynamically identifies the engine based on hardware recommendation and offline state.
     */
    readonly activeProvider = computed(() => {
        if (this.patientState.isEmergencyMode() && !this.isOnline()) {
            return 'Offline (Gemma 4 / Built-in AI)';
        }

        if (this.useLocalInference()) {
            const path = this.telemetry.recommendedExecutionPath();
            const prefix = this.isOnline() ? 'Local' : 'Offline';

            if (path === 'local-lemonade') {
                return `${prefix} (Lemonade - Gemma 3 4B Vulkan)`;
            } else if (path === 'local-nvidia') {
                return `${prefix} (CUDA - PubGemma)`;
            } else if (path === 'local-webgpu') {
                return `${prefix} (WebGPU - WebLLM)`;
            } else if (path === 'on-device-nano') {
                return `${prefix} (Built-in AI - Gemma 4 / Nano)`;
            } else {
                return `${prefix} (WebGPU - WebLLM)`;
            }
        }

        return 'Gemini Cloud';
    });

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.browserOnline.set(true);
                this.checkReachability();
            });
            window.addEventListener('offline', () => {
                this.browserOnline.set(false);
                this.consecutiveProbeFailures.set(0);
            });

            // Inspect NetworkInformation API if available
            const nav = navigator as unknown as { connection?: { effectiveType?: EffectiveConnectionType; addEventListener?: (ev: string, cb: () => void) => void } };
            if (nav.connection?.effectiveType) {
                this.connectionSpeed.set(nav.connection.effectiveType);
                nav.connection.addEventListener?.('change', () => {
                    if (nav.connection?.effectiveType) {
                        this.connectionSpeed.set(nav.connection.effectiveType);
                    }
                });
            }
        }
    }

    toggleForceOffline() {
        this.forceOffline.update(v => !v);
    }

    /**
     * Toggles the user's preference for local inference and persists the choice via SecureStorageService.
     */
    togglePreferLocalInference() {
        const next = !this.preferLocalInference();
        this.preferLocalInference.set(next);
        this.storage.setItem(LOCAL_INFERENCE_KEY, String(next));
    }

    /**
     * Active Reachability Probe:
     * Dispatches a lightweight HEAD probe to test real network egress and measures round-trip time.
     */
    async checkReachability(pingUrl = '/api/health'): Promise<boolean> {
        if (this.forceOffline()) {
            return false;
        }

        const start = Date.now();
        try {
            if (typeof fetch === 'undefined') {
                return true;
            }

            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

            const res = await fetch(pingUrl, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller?.signal
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (res.ok) {
                const rtt = Date.now() - start;
                this.latencyMs.set(rtt);
                const wasLieFi = this.isLieFiSuspected();
                this.consecutiveProbeFailures.set(0);
                this.browserOnline.set(true);

                // Auto-flush queued items if recovering or items are pending
                if ((wasLieFi || this.offlineQueue().length > 0) && !this.isFlushingQueue()) {
                    this.flushOfflineQueue().catch(() => {});
                }
                return true;
            } else {
                this.consecutiveProbeFailures.update(c => c + 1);
                return false;
            }
        } catch {
            this.consecutiveProbeFailures.update(c => c + 1);
            return false;
        }
    }

    /** Real-time queue flushing state */
    readonly isFlushingQueue = signal<boolean>(false);
    readonly lastSyncTimestamp = signal<string | null>(null);
    readonly lastSyncResult = signal<{ syncedCount: number; failedCount: number } | null>(null);

    /**
     * Flushes the offline store-and-forward queue by dispatching each pending item.
     * Accepts an optional customDispatcher for domain-specific delivery.
     */
    async flushOfflineQueue(
        customDispatcher?: (item: IQueuedSyncItem) => Promise<boolean>
    ): Promise<{ syncedCount: number; failedCount: number }> {
        if (this.isFlushingQueue() || this.offlineQueue().length === 0) {
            return { syncedCount: 0, failedCount: 0 };
        }

        this.isFlushingQueue.set(true);
        let syncedCount = 0;
        let failedCount = 0;
        const currentItems = [...this.offlineQueue()];

        for (const item of currentItems) {
            try {
                let success = false;
                if (customDispatcher) {
                    success = await customDispatcher(item);
                } else if (typeof fetch !== 'undefined') {
                    // Default lightweight sync endpoint POST
                    const res = await fetch('/api/patients/offline-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item),
                        cache: 'no-store'
                    });
                    success = res.ok;
                } else {
                    success = true;
                }

                if (success) {
                    this.dequeueOfflineItem(item.id);
                    syncedCount++;
                } else {
                    failedCount++;
                    item.retryCount++;
                }
            } catch {
                failedCount++;
                item.retryCount++;
            }
        }

        const result = { syncedCount, failedCount };
        this.lastSyncTimestamp.set(new Date().toISOString());
        this.lastSyncResult.set(result);
        this.isFlushingQueue.set(false);
        return result;
    }

    /**
     * Enqueues an offline clinical payload (e.g. UNICEF RUTF assessment, intake form)
     * into the local-first store-and-forward queue.
     */
    enqueueOfflineItem(type: string, payload: unknown): string {
        const entropyBytes = new Uint8Array(4);
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(entropyBytes);
        }
        const entropy = Array.from(entropyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const id = `sync_${Date.now()}_${entropy}`;
        const newItem: IQueuedSyncItem = {
            id,
            type,
            payload,
            queuedAt: new Date().toISOString(),
            retryCount: 0
        };

        this.offlineQueue.update(q => {
            const next = [...q, newItem];
            this.persistQueue(next);
            return next;
        });

        return id;
    }

    /**
     * Dequeues an offline item after successful synchronization.
     */
    dequeueOfflineItem(id: string): void {
        this.offlineQueue.update(q => {
            const next = q.filter(item => item.id !== id);
            this.persistQueue(next);
            return next;
        });
    }

    /**
     * Clears all items from the sync queue.
     */
    clearOfflineQueue(): void {
        this.offlineQueue.set([]);
        this.storage.removeItem(OFFLINE_QUEUE_KEY);
    }

    private loadPersistedQueue(): IQueuedSyncItem[] {
        try {
            const raw = this.storage.getItem(OFFLINE_QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private persistQueue(queue: IQueuedSyncItem[]): void {
        try {
            this.storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        } catch {
            // Ignore storage quota errors in constrained environments
        }
    }
}
