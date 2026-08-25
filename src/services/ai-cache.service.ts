import { Injectable } from '@angular/core';

interface ICacheEntry {
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
    lastUsed: number;
}

@Injectable({
    providedIn: 'root'
})
export class AiCacheService {
    private readonly DB_NAME = 'pocket-gull-cache';
    private readonly STORE_NAME = 'ai-responses';
    private readonly DB_VERSION = 1;
    private readonly MAX_ENTRIES = 50;
    private readonly MEMORY_MAX = 100;
    private memoryCache = new Map<string, { value: any; timestamp: number }>();
    private dbPromise: Promise<IDBDatabase | null>;
    private encryptionKeyPromise: Promise<CryptoKey | null>;

    constructor() {
        this.dbPromise = this.initDB();
        this.encryptionKeyPromise = this.initEncryptionKey();
    }

    private async initEncryptionKey(): Promise<CryptoKey | null> {
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            return null;
        }

        // In production, this would be a user-specific secret or managed via Key Vault.
        const secret = 'pocket-gull-clinical-vault-key-poc';
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: enc.encode('pocket-gull-static-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    private initDB(): Promise<IDBDatabase | null> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
                resolve(null);
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };

            request.onsuccess = (event: any) => {
                resolve(event.target.result);
            };

            request.onerror = (event: any) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Generates a deterministic cache key from input parameters.
     */
    async generateKey(components: any[]): Promise<string> {
        const rawString = JSON.stringify(components);
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            return rawString.length.toString();
        }
        const msgBuffer = new TextEncoder().encode(rawString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
   * Retrieves a value from the cache (Decrypted & Fast Tier In-Memory).
   */
    async get<T = any>(key: string): Promise<T | null> {
        // Fast Tier 1: Check In-Memory LRU Cache (<2ms response)
        const memHit = this.memoryCache.get(key);
        if (memHit) {
            memHit.timestamp = Date.now();
            return memHit.value as T;
        }

        // Fast Tier 2: Decrypt from IndexedDB
        const db = await this.dbPromise;
        if (!db) return null;

        const entry: ICacheEntry | null = await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });

        if (!entry) return null;

        // Update lastUsed (Async, don't block)
        this.updateLastUsed(key, entry);

        try {
            const keyObj = await this.encryptionKeyPromise;
            if (!keyObj) return null;

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: entry.iv as any },
                keyObj,
                entry.encryptedData
            );
            const val = JSON.parse(new TextDecoder().decode(decrypted));
            // Populate Fast Tier 1 Memory Cache
            this.setMemoryCache(key, val);
            return val;
        } catch (e) {
            console.error('Cache decryption failed:', e);
            return null;
        }
    }

    private setMemoryCache(key: string, value: any): void {
        if (this.memoryCache.size >= this.MEMORY_MAX) {
            const oldestKey = this.memoryCache.keys().next().value;
            if (oldestKey) this.memoryCache.delete(oldestKey);
        }
        this.memoryCache.set(key, { value, timestamp: Date.now() });
    }

    /**
     * Stores a value in the cache (Encrypted & Fast Tier In-Memory).
     */
    async set(key: string, value: any): Promise<void> {
        this.setMemoryCache(key, value);

        const db = await this.dbPromise;
        const keyObj = await this.encryptionKeyPromise;
        if (!db || !keyObj) return;

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = new TextEncoder().encode(JSON.stringify(value));

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            keyObj,
            data
        );

        const entry: ICacheEntry = {
            encryptedData,
            iv,
            lastUsed: Date.now()
        };

        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(entry, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        // Check if we need to vacuum
        this.vacuum();
    }

    private async updateLastUsed(key: string, entry: ICacheEntry) {
        const db = await this.dbPromise;
        if (!db) return;
        entry.lastUsed = Date.now();
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        store.put(entry, key);
    }

    /**
     * Enforces LRU policy by keeping only the MAX_ENTRIES most recently used items.
     */
    private async vacuum(): Promise<void> {
        if (this.memoryCache.size < this.MAX_ENTRIES) return;

        const db = await this.dbPromise;
        if (!db) return;

        const count = await new Promise<number>((resolve) => {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const req = tx.objectStore(this.STORE_NAME).count();
            req.onsuccess = () => resolve(req.result || 0);
            req.onerror = () => resolve(0);
        });

        if (count <= this.MAX_ENTRIES) return;

        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);

        const entries: { key: string; lastUsed: number }[] = [];
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
                entries.push({ key: cursor.key, lastUsed: cursor.value.lastUsed });
                cursor.continue();
            } else {
                if (entries.length > this.MAX_ENTRIES) {
                    // Sort by lastUsed ascending (oldest first)
                    entries.sort((a, b) => a.lastUsed - b.lastUsed);
                    const toDelete = entries.slice(0, entries.length - this.MAX_ENTRIES);
                    toDelete.forEach(e => store.delete(e.key));
                }
            }
        };
    }

    /**
     * Retrieves all cached entries, decrypted.
     */
    async getAllEntries(): Promise<{ key: string; value: any; lastUsed: number }[]> {
        const db = await this.dbPromise;
        const keyObj = await this.encryptionKeyPromise;
        if (!db || !keyObj) return [];

        const encryptedEntries = await new Promise<{ key: string; entry: ICacheEntry }[]>((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.openCursor();
            const list: { key: string; entry: ICacheEntry }[] = [];

            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    list.push({
                        key: cursor.key as string,
                        entry: cursor.value as ICacheEntry
                    });
                    cursor.continue();
                } else {
                    resolve(list);
                }
            };
            request.onerror = () => reject(request.error);
        });

        const results: { key: string; value: any; lastUsed: number }[] = [];
        for (const { key, entry } of encryptedEntries) {
            try {
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: entry.iv as any },
                    keyObj,
                    entry.encryptedData
                );
                const value = JSON.parse(new TextDecoder().decode(decrypted));
                results.push({
                    key,
                    value,
                    lastUsed: entry.lastUsed
                });
            } catch (e) {
                console.warn('Failed to decrypt entry during bulk fetch:', key);
            }
        }

        // Sort by lastUsed descending (newest first)
        return results.sort((a, b) => b.lastUsed - a.lastUsed);
    }

    /**
     * Clears all cached entries.
     */
    async clear(): Promise<void> {
        const db = await this.dbPromise;
        if (!db) return;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
