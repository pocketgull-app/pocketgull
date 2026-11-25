import { Injectable, inject, signal, OnDestroy } from '@angular/core';
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
export class FirestoreSyncService implements OnDestroy {
  private storage = inject(SecureStorageService);
  private authUnsub: (() => void) | null = null;
  private authInitPromise: Promise<{ appMod: typeof import('firebase/app'); authMod: typeof import('firebase/auth'); auth: import('firebase/auth').Auth } | null> | null = null;

  /** Signal emitting the current user's UID or null if unauthenticated. */
  public readonly currentUser = signal<string | null>(null);
  /** Signal emitting the current user's email. */
  public readonly currentUserEmail = signal<string | null>(null);
  /** Signal emitting whether an active auth operation is loading. */
  public readonly isAuthLoading = signal<boolean>(false);
  /** Signal emitting the last Firestore sync error, or null if healthy. */
  public readonly syncError = signal<string | null>(null);
  /** Signal emitting whether a sync operation is in progress. */
  public readonly isSyncing = signal<boolean>(false);

  getRegisteredClinicians(): IRegisteredClinician[] {
    const defaultList = [
      { name: 'Clinical Lead', email: 'clinician@pocketgull.app', clinic: 'PocketGull Clinic', pin: '1234' },
      { name: 'Privacy Officer', email: 'dpo@pocketgull.app', clinic: 'PocketGull Clinic', pin: '1234' },
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
    if (typeof window !== 'undefined' && typeof setTimeout === 'function') {
      setTimeout(() => {
        void this.ensureAuth().catch(() => {
          // Offline / unconfigured Firebase environment gracefully remains in local mode.
        });
      }, 1200);
    }
  }

  ngOnDestroy(): void {
    this.authUnsub?.();
    this.authUnsub = null;
  }

  private async ensureApp() {
    const appMod = await import('firebase/app');
    const app = appMod.getApps().length === 0 ? appMod.initializeApp(environment.firebase) : appMod.getApp();
    return { appMod, app };
  }

  private async ensureAuth() {
    if (typeof window === 'undefined') return null;
    if (!this.authInitPromise) {
      this.authInitPromise = Promise.all([this.ensureApp(), import('firebase/auth')])
        .then(([{ appMod, app }, authMod]) => {
          const auth = authMod.getAuth(app);
          if (!this.authUnsub) {
            this.authUnsub = authMod.onAuthStateChanged(auth, (user) => {
              this.isAuthLoading.set(false);
              if (user) {
                if (this.isEmailRegistered(user.email || '')) {
                  this.currentUser.set(user.uid);
                  this.currentUserEmail.set(user.email);
                } else {
                  console.error('[Firebase Auth] Unauthorized email attempt:', user.email);
                  void authMod.signOut(auth);
                  this.currentUser.set(null);
                  this.currentUserEmail.set(null);
                  alert(`Access Denied: The account ${user.email} is not authorized. Please contact administrator.`);
                }
              } else {
                this.currentUser.set(null);
                this.currentUserEmail.set(null);
              }
            });
          }
          return { appMod, authMod, auth };
        })
        .catch(() => {
          this.isAuthLoading.set(false);
          return null;
        });
    }
    return this.authInitPromise;
  }

  /**
   * Triggers Google Sign-In via popup or redirect fallback
   */
  async loginWithGoogle(): Promise<void> {
    this.isAuthLoading.set(true);
    try {
      const ctx = await this.ensureAuth();
      if (!ctx) throw new Error('Firebase Auth is not configured.');
      const { authMod, auth } = ctx;
      const provider = new authMod.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await authMod.signInWithPopup(auth, provider);
      } catch (err: any) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          await authMod.signInWithRedirect(auth, provider);
        } else {
          throw err;
        }
      }
    } finally {
      this.isAuthLoading.set(false);
    }
  }

  async signInWithGoogle(targetEmail?: string): Promise<void> {
    return this.loginWithGoogle();
  }

  /**
   * Logs out current user from Firebase Auth session
   */
  async logout(): Promise<void> {
    const ctx = await this.ensureAuth();
    if (ctx) {
      await ctx.authMod.signOut(ctx.auth);
    }
    this.currentUser.set(null);
    this.currentUserEmail.set(null);
  }

  /**
   * Listens to real-time changes for a specific patient's document in Firestore.
   */
  syncPatient(patientId: string, onUpdate: (patient: IPatient) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    let cancelled = false;
    let liveUnsub: (() => void) | null = null;

    void Promise.all([this.ensureApp(), import('firebase/firestore')])
      .then(([{ app }, fsMod]) => {
        if (cancelled) return;
        const db = fsMod.getFirestore(app);
        const patientDocRef = fsMod.doc(db, 'patients', patientId);
        liveUnsub = fsMod.onSnapshot(patientDocRef, (snapshot) => {
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
      })
      .catch((error) => {
        const msg = `Sync initialization error for patient ${patientId}: ${error?.message || error}`;
        console.warn(`[FirestoreSyncService] ${msg}`);
      });

    return () => {
      cancelled = true;
      liveUnsub?.();
      liveUnsub = null;
    };
  }

  /**
   * Saves or updates a patient record in Firestore.
   */
  async savePatient(patient: IPatient): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Firestore is not configured in this environment.');
    }

    const [{ app }, fsMod] = await Promise.all([this.ensureApp(), import('firebase/firestore')]);
    const db = fsMod.getFirestore(app);
    const patientDocRef = fsMod.doc(db, 'patients', patient.id);
    const sanitizedData = JSON.parse(JSON.stringify(patient)); // Ensure clean object serialization

    await fsMod.setDoc(patientDocRef, {
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
