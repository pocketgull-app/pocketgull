import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IPatientState } from './patient.types';
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'pocket-gull-clinical-vault-key-poc';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private memDb = new Map<string, any>();
  private readonly isE2e = typeof navigator !== 'undefined' && navigator.webdriver;

  private readonly DB_NAME = 'PocketGullDB';
  private readonly STORE_NAME = 'patients';
  private readonly VERSION = 2;

  private encrypt(data: any): string {
    const str = JSON.stringify(data);
    return CryptoJS.AES.encrypt(str, ENCRYPTION_KEY).toString();
  }

  private decrypt(ciphertext: string): any {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
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

  async saveState(id: string, state: IPatientState): Promise<void> {
    if (!this.isBrowser) return;
    if (this.isE2e) {
      const current = this.memDb.get(id) || { state: null, chatHistory: [] };
      current.state = state;
      this.memDb.set(id, current);
      return;
    }
    try {
      const db = await this.initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          let innerData = { state: null as any, chatHistory: [] as any[] };
          if (getReq.result && getReq.result.encryptedPayload) {
            try {
              innerData = this.decrypt(getReq.result.encryptedPayload);
            } catch (err) {
              console.error('Decryption failed on saveState', err);
            }
          } else if (getReq.result && getReq.result.state) {
            // Legacy unencrypted migration fallback
            innerData.state = getReq.result.state;
            innerData.chatHistory = getReq.result.chatHistory || [];
          }
          innerData.state = state;
          const encryptedPayload = this.encrypt(innerData);
          const putReq = store.put({ id, encryptedPayload, timestamp: Date.now() });
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
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
    try {
      const db = await this.initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          let innerData = { state: null as any, chatHistory: [] as any[] };
          if (getReq.result && getReq.result.encryptedPayload) {
            try {
              innerData = this.decrypt(getReq.result.encryptedPayload);
            } catch (err) {
              console.error('Decryption failed on saveChatHistory', err);
            }
          } else if (getReq.result && getReq.result.state) {
            // Legacy unencrypted migration fallback
            innerData.state = getReq.result.state;
            innerData.chatHistory = getReq.result.chatHistory || [];
          }
          innerData.chatHistory = chatHistory;
          const encryptedPayload = this.encrypt(innerData);
          const putReq = store.put({ id, encryptedPayload, timestamp: Date.now() });
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (e) {
      console.warn('Chat Persistence skipped:', e);
    }
  }

  async loadState(id: string): Promise<{ state: IPatientState, chatHistory: any[] } | null> {
    if (!this.isBrowser) return null;
    if (this.isE2e) {
      const data = this.memDb.get(id);
      if (data) return data;
      return null;
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.encryptedPayload) {
            try {
              const decrypted = this.decrypt(result.encryptedPayload);
              resolve({
                state: decrypted.state,
                chatHistory: decrypted.chatHistory || []
              });
            } catch (err) {
              console.error('Decryption failed on loadState', err);
              resolve(null);
            }
          } else if (result && result.state) {
            // Legacy unencrypted fallback
            resolve({
              state: result.state,
              chatHistory: result.chatHistory || []
            });
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Hydration skipped:', e);
      return null;
    }
  }

  // --- Patient Roster Operations ---
  async loadPatients(): Promise<any[]> {
    if (!this.isBrowser) return [];
    if (this.isE2e) {
      const roster = this.memDb.get('roster') || [];
      return roster;
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readonly');
        const store = transaction.objectStore('patients_roster');
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result || [];
          const decryptedList = results.map(r => {
            if (r.encryptedPayload) {
              try {
                return this.decrypt(r.encryptedPayload);
              } catch (err) {
                console.error('Decryption failed on loadPatients', err);
                return null;
              }
            }
            return r; // Fallback for legacy unencrypted data
          }).filter(r => r !== null);
          resolve(decryptedList);
        };
        request.onerror = () => reject(request.error);
      });
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
      const encryptedPayload = this.encrypt(patient);
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readwrite');
        const store = transaction.objectStore('patients_roster');
        const request = store.put({ id: patient.id, encryptedPayload });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
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
