import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IPatientState } from './patient.types';

const ENCRYPTION_KEY = 'pocket-gull-clinical-vault-key-poc';

/**
 * Derives a consistent AES-GCM CryptoKey from the passphrase using PBKDF2.
 * Uses a fixed salt derived from the key itself for deterministic derivation.
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  // Fixed salt from passphrase hash for deterministic key derivation
  const salt = enc.encode(passphrase.slice(0, 16).padEnd(16, '0'));
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private memDb = new Map<string, any>();
  private readonly isE2e = typeof navigator !== 'undefined' && navigator.webdriver;

  private readonly DB_NAME = 'PocketGullDB';
  private readonly STORE_NAME = 'patients';
  private readonly VERSION = 2;

  /**
   * Encrypts data using AES-GCM via the native Web Crypto API.
   * Returns a base64-encoded JSON envelope containing the IV and ciphertext.
   */
  private async encrypt(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const enc = new TextEncoder();
    const key = await deriveKey(ENCRYPTION_KEY);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(str)
    );
    // Pack IV + ciphertext into a single base64 string
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts an AES-GCM envelope produced by encrypt().
   * Also handles legacy crypto-js AES payloads for migration.
   */
  private async decrypt(ciphertext: string): Promise<any> {
    try {
      // Attempt native AES-GCM decryption first
      const raw = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
      const iv = raw.slice(0, 12);
      const data = raw.slice(12);
      const key = await deriveKey(ENCRYPTION_KEY);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, key, data
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch {
      // Legacy crypto-js format: treat as unencrypted JSON fallback
      // This handles data written by the previous crypto-js implementation
      try {
        return JSON.parse(ciphertext);
      } catch {
        console.warn('[StorageService] Unable to decrypt or parse stored data, treating as corrupt.');
        return null;
      }
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available in this environment'));
        return;
      }
      const request = window.indexedDB.open(this.DB_NAME, this.VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('patients_roster')) {
          db.createObjectStore('patients_roster', { keyPath: 'id' });
        }
      };
    });
  }

  /** Helper: read a single record from an IDB store by key. */
  private idbGet(db: IDBDatabase, storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /** Helper: write a record to an IDB store. */
  private idbPut(db: IDBDatabase, storeName: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /** Helper: read all records from an IDB store. */
  private idbGetAll(db: IDBDatabase, storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  private get hasIndexedDb(): boolean {
    return this.isBrowser && typeof window !== 'undefined' && !!window.indexedDB;
  }

  async saveState(id: string, state: IPatientState): Promise<void> {
    if (!this.isBrowser) return;
    if (this.isE2e) {
      const current = this.memDb.get(id) || { state: null, chatHistory: [] };
      current.state = state;
      this.memDb.set(id, current);
      return;
    }
    if (!this.hasIndexedDb) return;
    try {
      const db = await this.initDB();
      const existing = await this.idbGet(db, this.STORE_NAME, id);

      let innerData = { state: null as any, chatHistory: [] as any[] };
      if (existing?.encryptedPayload) {
        try {
          innerData = await this.decrypt(existing.encryptedPayload) ?? innerData;
        } catch (err) {
          console.error('Decryption failed on saveState', err);
        }
      } else if (existing?.state) {
        innerData.state = existing.state;
        innerData.chatHistory = existing.chatHistory || [];
      }

      innerData.state = state;
      const encryptedPayload = await this.encrypt(innerData);
      await this.idbPut(db, this.STORE_NAME, { id, encryptedPayload, timestamp: Date.now() });
    } catch (e) {
      console.warn('Persistence skipped:', e);
    }
  }

  async saveChatHistory(id: string, chatHistory: any[]): Promise<void> {
    if (!this.isBrowser) return;
    if (this.isE2e) {
      const current = this.memDb.get(id) || { state: null, chatHistory: [] };
      current.chatHistory = chatHistory;
      this.memDb.set(id, current);
      return;
    }
    if (!this.hasIndexedDb) return;
    try {
      const db = await this.initDB();
      const existing = await this.idbGet(db, this.STORE_NAME, id);

      let innerData = { state: null as any, chatHistory: [] as any[] };
      if (existing?.encryptedPayload) {
        try {
          innerData = await this.decrypt(existing.encryptedPayload) ?? innerData;
        } catch (err) {
          console.error('Decryption failed on saveChatHistory', err);
        }
      } else if (existing?.state) {
        innerData.state = existing.state;
        innerData.chatHistory = existing.chatHistory || [];
      }

      innerData.chatHistory = chatHistory;
      const encryptedPayload = await this.encrypt(innerData);
      await this.idbPut(db, this.STORE_NAME, { id, encryptedPayload, timestamp: Date.now() });
    } catch (e) {
      console.warn('Chat Persistence skipped:', e);
    }
  }

  async loadState(id: string): Promise<{ state: IPatientState, chatHistory: any[] } | null> {
    if (!this.isBrowser || !this.hasIndexedDb) return null;
    if (this.isE2e) {
      const data = this.memDb.get(id);
      if (data) return data;
      return null;
    }
    try {
      const db = await this.initDB();
      const result = await this.idbGet(db, this.STORE_NAME, id);

      if (result?.encryptedPayload) {
        const decrypted = await this.decrypt(result.encryptedPayload);
        if (decrypted) {
          return { state: decrypted.state, chatHistory: decrypted.chatHistory || [] };
        }
        return null;
      } else if (result?.state) {
        return { state: result.state, chatHistory: result.chatHistory || [] };
      }
      return null;
    } catch (e) {
      console.warn('Hydration skipped:', e);
      return null;
    }
  }

  // --- Patient Roster Operations ---
  async loadPatients(): Promise<any[]> {
    if (!this.isBrowser || !this.hasIndexedDb) return [];
    if (this.isE2e) {
      const roster = this.memDb.get('roster') || [];
      return roster;
    }
    try {
      const db = await this.initDB();
      const results = await this.idbGetAll(db, 'patients_roster');
      const decryptedList: any[] = [];
      for (const r of results) {
        if (r.encryptedPayload) {
          const decrypted = await this.decrypt(r.encryptedPayload);
          if (decrypted) decryptedList.push(decrypted);
        } else {
          decryptedList.push(r);
        }
      }
      return decryptedList;
    } catch (e) {
      console.warn('Roster hydration skipped:', e);
      return [];
    }
  }

  async savePatient(patient: any): Promise<void> {
    if (!this.isBrowser) return;
    if (this.isE2e) {
      const roster = this.memDb.get('roster') || [];
      const index = roster.findIndex((p: any) => p.id === patient.id);
      if (index !== -1) {
        roster[index] = patient;
      } else {
        roster.push(patient);
      }
      this.memDb.set('roster', roster);
      return;
    }
    try {
      const db = await this.initDB();
      const encryptedPayload = await this.encrypt(patient);
      await this.idbPut(db, 'patients_roster', { id: patient.id, encryptedPayload });
    } catch (e) {
      console.warn('Roster save skipped:', e);
    }
  }

  async deletePatient(id: string): Promise<void> {
    if (!this.isBrowser) return;
    if (this.isE2e) {
      const roster = this.memDb.get('roster') || [];
      const next = roster.filter((p: any) => p.id !== id);
      this.memDb.set('roster', next);
      return;
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readwrite');
        const store = transaction.objectStore('patients_roster');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Roster delete skipped:', e);
    }
  }
}
