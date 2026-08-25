import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, authState, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { IPatient } from './patient.types';
import { environment } from '../environments/environment';
import { SecureStorageService } from './secure-storage.service';

export interface IRegisteredClinician {
  name: string;
  email: string;
  clinic: string;
  pin: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreSyncService {
  private firestore = inject(Firestore, { optional: true });
  private auth = inject(Auth, { optional: true });
  private storage = inject(SecureStorageService);

  /** Signal emitting the current user's UID or null if unauthenticated. */
  public readonly currentUser = signal<string | null>(null);
  /** Signal emitting the current user's email. */
  public readonly currentUserEmail = signal<string | null>(null);
  /** Signal emitting whether the initial auth state is still loading. */
  public readonly isAuthLoading = signal<boolean>(true);
  /** Signal emitting the last Firestore sync error, or null if healthy. */
  public readonly syncError = signal<string | null>(null);
  /** Signal emitting whether a sync operation is in progress. */
  public readonly isSyncing = signal<boolean>(false);

  getRegisteredClinicians(): IRegisteredClinician[] {
    const defaultList = [
      { name: 'Phil Gear', email: 'philgear@gmail.com', clinic: 'PocketGull Clinic', pin: '1234' },
      { name: 'Phil Gear', email: 'dpo@pocketgull.app', clinic: 'PocketGull Clinic', pin: '1234' },
      { name: 'Admin', email: 'admin@pocketgull.app', clinic: 'PocketGull Admin Vault', pin: '1234' }
    ];
    const stored = this.storage.getJSON<IRegisteredClinician[] | null>('pg_registered_clinicians', null);
    if (stored) {
      return stored;
    }
    this.storage.setJSON('pg_registered_clinicians', defaultList);
    return defaultList;
  }

  isEmailRegistered(email: string): boolean {
    const list = this.getRegisteredClinicians();
    return list.some(c => c.email.toLowerCase() === email.toLowerCase());
  }

  async registerClinician(name: string, email: string, clinic: string, pin: string): Promise<boolean> {
    const list = this.getRegisteredClinicians();
    if (list.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('This email is already registered.');
    }
    list.push({ name, email, clinic, pin });
    this.storage.setJSON('pg_registered_clinicians', list);
    return true;
  }

  constructor() {
    if (this.auth) {
      authState(this.auth).subscribe(user => {
        this.isAuthLoading.set(false);
        if (user) {
          if (this.isEmailRegistered(user.email || '')) {
            this.currentUser.set(user.uid);
            this.currentUserEmail.set(user.email);
          } else {
            console.error('[Firebase Auth] Unauthorized email attempt:', user.email);
            signOut(this.auth!);
            this.currentUser.set(null);
            this.currentUserEmail.set(null);
            alert(`Access Denied: The account ${user.email} is not authorized. Please contact administrator.`);
          }
        } else {
          this.currentUser.set(null);
          this.currentUserEmail.set(null);
        }
      });
    } else {
      this.isAuthLoading.set(false);
    }
  }

  /**
   * Triggers Google Sign-In via popup or redirect fallback
   */
  async loginWithGoogle(): Promise<void> {
    if (!this.auth) throw new Error('Firebase Auth is not configured.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(this.auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(this.auth, provider);
      } else {
        throw err;
      }
    }
  }

  async signInWithGoogle(targetEmail?: string): Promise<void> {
    return this.loginWithGoogle();
  }

  /**
   * Logs out current user from Firebase Auth session
   */
  async logout(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
    this.currentUser.set(null);
    this.currentUserEmail.set(null);
  }

  /**
   * Listens to real-time changes for a specific patient's document in Firestore.
   */
  syncPatient(patientId: string, onUpdate: (patient: IPatient) => void): () => void {
    if (!this.firestore) {
      console.warn('[FirestoreSyncService] Firestore not initialized, returning noop cleanup.');
      return () => {};
    }

    const patientDocRef = doc(this.firestore, 'patients', patientId);
    
    // Subscribe to snapshot updates
    const unsubscribe = onSnapshot(patientDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as IPatient;
        console.log(`[FirestoreSyncService] Received live update for patient: ${patientId}`);
        onUpdate(data);
      }
    }, (error) => {
      const msg = `Sync error for patient ${patientId}: ${error?.message || error}`;
      console.error(`[FirestoreSyncService] ${msg}`);
      this.syncError.set(msg);
    });

    return unsubscribe;
  }

  /**
   * Saves or updates a patient record in Firestore.
   */
  async savePatient(patient: IPatient): Promise<void> {
    if (!this.firestore) {
      throw new Error('Firestore is not configured in this environment.');
    }

    const patientDocRef = doc(this.firestore, 'patients', patient.id);
    const sanitizedData = JSON.parse(JSON.stringify(patient)); // Ensure clean object serialization

    await setDoc(patientDocRef, {
      ...sanitizedData,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[FirestoreSyncService] Successfully saved patient: ${patient.id}`);
    this.syncError.set(null); // Clear any previous sync error on success
  }

  /** Clears the current sync error (e.g. after user acknowledges it). */
  clearSyncError(): void {
    this.syncError.set(null);
  }
}
