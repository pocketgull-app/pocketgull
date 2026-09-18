import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStateService {
  /**
   * Secure Session: Initialized for instant clinical time-to-first-value (<500ms).
   * Opens directly to the active clinical chart unless explicitly locked by the
   * clinician or after 10 minutes of HIPAA inactivity.
   */
  readonly isLocked = signal(
    (() => {
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          if (globalThis.sessionStorage.getItem('pg_session_locked') === 'true') {
            return true;
          }
          if (globalThis.sessionStorage.getItem('pg_session_unlocked') === 'true') {
            return false;
          }
        }
      } catch {
        // Fallback for restricted storage environments
      }
      return false; // Instant chart entry (<500ms)
    })()
  );
  readonly isOnboardingComplete = signal(true);
  private auth = inject(AuthService);
  private patientMgmt = inject(PatientManagementService, { optional: true });

  /**
   * Represents the inactivity timer in seconds (10 minutes per HIPAA § 164.312(a)(2)(iii) workstation security).
   */
  private readonly TIMEOUT_SECONDS = 10 * 60; // 10 minutes
  private timeoutId: any;

  constructor() {
    // Session state initialized
  }

  async unlock(): Promise<boolean> {
    const success = await this.auth.promptLocalBiometric();
    if (success) {
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          globalThis.sessionStorage.setItem('pg_session_unlocked', 'true');
          globalThis.sessionStorage.removeItem('pg_session_locked');
        }
        if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
          globalThis.localStorage.removeItem('pg_session_locked');
        }
      } catch {
        // Ignore storage write errors in private browsing/sandboxed contexts
      }
      this.isLocked.set(false);
      this.resetIdleTimer();
      return true;
    }
    return false;
  }

  async verifyBiometrics(): Promise<boolean> {
    return await this.auth.promptLocalBiometric();
  }

  lock() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
        globalThis.sessionStorage.removeItem('pg_session_unlocked');
        globalThis.sessionStorage.setItem('pg_session_locked', 'true');
      }
    } catch {
      // Ignore storage write errors
    }
    if (this.patientMgmt && typeof this.patientMgmt.triggerImmediateSaveAndSync === 'function') {
      this.patientMgmt.triggerImmediateSaveAndSync();
    }
    this.isLocked.set(true);
    // Note: isOnboardingComplete is intentionally NOT reset here.
    // HIPAA idle-lock re-entry only requires re-authentication (gesture/PIN),
    // not a full KSS onboarding cycle. The session remains "onboarded".
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  resetIdleTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Only reset if we are currently unlocked
    if (!this.isLocked()) {
      this.timeoutId = setTimeout(() => {
        this.lock();
      }, this.TIMEOUT_SECONDS * 1000);
    }
  }
}
