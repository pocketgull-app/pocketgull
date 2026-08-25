import { Injectable, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Centralized localStorage abstraction providing SSR-safe, typed access
 * to all client-side persistence keys with a write-through in-memory cache.
 *
 * Eliminates the anti-pattern of 17+ files independently checking
 * `typeof localStorage !== 'undefined'` and directly calling the Storage API.
 *
 * ## Cache Strategy
 * - **Write-through**: `setItem()` writes to both the in-memory Map and localStorage.
 * - **Lazy hydration**: `getItem()` checks the cache first; on miss, reads from
 *   localStorage and populates the cache for subsequent reads.
 * - **Cross-tab sync**: Listens for the browser `storage` event to invalidate
 *   cache entries mutated by other tabs/windows.
 * - **SSR-safe**: All reads/writes are no-ops during SSR (returns defaults gracefully).
 *   The cache still functions in-memory for any SSR-context writes.
 *
 * @see docs/reference-env-vars.md for the full localStorage key registry.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService implements OnDestroy {
  private readonly isBrowser: boolean;

  /**
   * In-memory write-through cache.
   * Keys present in the Map are considered "hydrated" — even if the value is `null`
   * (which means the key was explicitly absent from localStorage).
   */
  private readonly cache = new Map<string, string | null>();

  /** Bound reference for cleanup of the `storage` event listener. */
  private readonly onStorageEvent: ((e: StorageEvent) => void) | null = null;

  constructor() {
    let platformId: any = null;
    try {
      platformId = inject(PLATFORM_ID);
      this.isBrowser = isPlatformBrowser(platformId);
    } catch (e) {
      this.isBrowser = typeof window !== 'undefined';
    }

    // Cross-tab cache invalidation: when another tab mutates localStorage,
    // the `storage` event fires in all *other* tabs. We use this to keep
    // the in-memory cache consistent without polling.
    if (this.isBrowser && typeof window !== 'undefined') {
      this.onStorageEvent = (e: StorageEvent) => {
        if (e.key === null) {
          // localStorage.clear() was called — flush the entire cache.
          this.cache.clear();
        } else {
          // A specific key was set or removed in another tab.
          // Update cache to reflect the new value (or null if removed).
          this.cache.set(e.key, e.newValue);
        }
      };
      window.addEventListener('storage', this.onStorageEvent);
    }
  }

  ngOnDestroy(): void {
    if (this.onStorageEvent && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.onStorageEvent);
    }
  }

  /**
   * Retrieves a string value from the cache (with lazy localStorage hydration).
   * Returns `null` if the key doesn't exist or if running in SSR.
   */
  getItem(key: string): string | null {
    // Fast path: cache hit
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    // Cache miss: hydrate from localStorage
    if (!this.isBrowser) {
      this.cache.set(key, null);
      return null;
    }

    try {
      const value = localStorage.getItem(key);
      this.cache.set(key, value);
      return value;
    } catch (e) {
      console.warn(`[SecureStorageService] Failed to read key '${key}':`, e);
      this.cache.set(key, null);
      return null;
    }
  }

  /**
   * Sets a string value via write-through: updates the in-memory cache
   * and persists to localStorage simultaneously.
   * No-op for localStorage during SSR (cache is still updated).
   */
  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SecureStorageService] Failed to write key '${key}':`, e);
    }
  }

  /**
   * Removes a key from both the in-memory cache and localStorage.
   * No-op for localStorage during SSR (cache entry is still removed).
   */
  removeItem(key: string): void {
    this.cache.delete(key);
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SecureStorageService] Failed to remove key '${key}':`, e);
    }
  }

  /**
   * Retrieves a JSON-parsed value from the cache.
   * Returns `defaultValue` if the key doesn't exist, parsing fails, or running in SSR.
   */
  getJSON<T>(key: string, defaultValue: T): T {
    const raw = this.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[SecureStorageService] Failed to parse JSON for key '${key}'`);
      return defaultValue;
    }
  }

  /**
   * Stores a value as JSON via write-through.
   * No-op for localStorage during SSR (cache is still updated).
   */
  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[SecureStorageService] Failed to serialize JSON for key '${key}':`, e);
    }
  }

  /**
   * Returns true if localStorage is available (browser context).
   * Useful for guards that need to short-circuit early.
   */
  get isAvailable(): boolean {
    return this.isBrowser;
  }
}
